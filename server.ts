import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy init for Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your environment secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Sitemap XML endpoint with canonical host resolution
app.get("/sitemap.xml", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const baseUrl = `${protocol}://${host}`;
  const today = new Date().toISOString().split("T")[0];

  const tools = [
    "ai-writer",
    "essay-writer",
    "article-writer",
    "email-generator",
    "social-media-caption",
    "summarizer",
    "text-rewriter",
    "grammar-corrector",
    "translator",
    "study-notes",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=English" />
    <xhtml:link rel="alternate" hreflang="hi" href="${baseUrl}/?lang=Hindi" />
    <xhtml:link rel="alternate" hreflang="mr" href="${baseUrl}/?lang=Marathi" />
  </url>
${tools
  .map(
    (tool) => `  <url>
    <loc>${baseUrl}/?tool=${tool}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.header("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
});

// Robots.txt endpoint
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const baseUrl = `${protocol}://${host}`;

  res.type("text/plain");
  res.send(["User-agent: *", "Allow: /", "", `Sitemap: ${baseUrl}/sitemap.xml`].join("\n") + "\n");
});

// Prompt construction helper
function buildPrompt(body: {
  toolId: string;
  prompt: string;
  secondaryInput?: string;
  language: string;
  tone: string;
  options?: any;
}): { systemInstruction: string; userContent: string } {
  const { toolId, prompt, secondaryInput, language, tone, options } = body;

  const langGuide =
    language === "Hindi"
      ? "Write in standard, fluent Hindi using native Devanagari script (हिन्दी). Ensure authentic grammar and natural phrasing."
      : language === "Marathi"
      ? "Write in standard, fluent Marathi using native Devanagari script (मराठी). Ensure authentic Marathi grammar, natural phrasing, and appropriate cultural context."
      : "Write in fluent, high-quality standard English with excellent grammar and flow.";

  const toneGuide = {
    Simple: "Keep the phrasing crystal-clear, straightforward, and easy to understand for any reader without jargon.",
    Professional: "Adopt a polished, executive, confident, and business-appropriate tone with crisp clarity.",
    Formal: "Use a structured, academic, respectful, and authoritative register adhering to elevated conventions.",
    Friendly: "Write in a warm, welcoming, empathetic, conversational, and uplifting style.",
    Creative: "Employ evocative storytelling, expressive adjectives, engaging metaphors, and inventive rhythm.",
  }[tone] || "Balanced, engaging, and clear.";

  let systemInstruction = `You are a world-class, versatile AI Writing Specialist.
Output Language: ${language}.
${langGuide}
Tone: ${tone}.
${toneGuide}
Important:
- Provide high-quality, comprehensive, and ready-to-use content.
- Do NOT output preamble meta-talk like "Sure, here is your essay:" or "Here is the translated text:".
- Directly output the requested writing content cleanly formatted with appropriate headers or paragraphs.`;

  let userContent = "";

  switch (toolId) {
    case "ai-writer":
      userContent = `Write a high-quality piece based on the following instruction or topic:\n\n${prompt}\n\n${
        secondaryInput ? `Additional Instructions / Context: ${secondaryInput}` : ""
      }`;
      break;

    case "essay-writer":
      userContent = `Write a well-structured essay on the following topic:\n"${prompt}"\n\n${
        secondaryInput ? `Focus / Key Arguments to include:\n${secondaryInput}\n\n` : ""
      }Structure required:
1. Engaging Title
2. Introduction with a strong, clear thesis statement
3. Well-argued Body Paragraphs with evidence, reasoning, and topic sentences
4. Thoughtful Counter-perspective or nuanced synthesis (if applicable)
5. Solid Conclusion summarizing main points and offering final insight.`;
      break;

    case "article-writer":
      userContent = `Write a complete, compelling article/blog post about:\n"${prompt}"\n\n${
        secondaryInput ? `Keywords / Sub-topics:\n${secondaryInput}\n\n` : ""
      }Structure required:
- Catchy Article Headline
- Engaging Introduction hook
- Clear sections with Markdown H2 and H3 headings
- Key takeaways or bullet-point highlights
- Concluding thought or Call to Action.`;
      break;

    case "email-generator":
      userContent = `Generate a polished, complete email.\nEmail Purpose & Details:\n${prompt}\n\n${
        secondaryInput ? `Recipient / Context: ${secondaryInput}\n\n` : ""
      }Include:
- Subject Line: (Provide 2 compelling options)
- Salutation / Greeting
- Well-organized body text matching the ${tone} tone
- Clear call to action or next steps
- Professional sign-off.`;
      break;

    case "social-media-caption":
      const platform = options?.platform || "Instagram / LinkedIn / X";
      userContent = `Create high-engaging social media captions for ${platform}.\nContent / Post Idea:\n${prompt}\n\n${
        secondaryInput ? `Call to Action or Special details:\n${secondaryInput}\n\n` : ""
      }Please provide:
1. Primary Caption (engaging hook + main message + call to action)
2. 2 Alternative Variations (one punchy/short, one story-style)
3. 10-15 Highly relevant trending hashtags.`;
      break;

    case "summarizer":
      const lengthPreference = options?.length || "medium";
      userContent = `Summarize the following text:\n\n"""\n${prompt}\n"""\n\nProvide:
1. Quick Executive Summary (2-3 sentences)
2. Key Takeaways & Core Points (Clear bullet points)
3. Conclusion / Actionable insight.
Desired depth: ${lengthPreference}.`;
      break;

    case "text-rewriter":
      userContent = `Rewrite the following text to enhance its clarity, flow, and impact while shifting to a ${tone} tone:\n\n"""\n${prompt}\n"""\n\n${
        secondaryInput ? `Specific rewriting instructions: ${secondaryInput}\n\n` : ""
      }Provide the refined, rewritten version directly. Ensure the core message is preserved while the expression is significantly elevated.`;
      break;

    case "grammar-corrector":
      userContent = `Carefully review and correct the following text for grammar, spelling, punctuation, sentence structure, and vocabulary flow:\n\n"""\n${prompt}\n"""\n\nProvide the response in two distinct sections:
### 1. Corrected Version
(The completely polished text ready to copy)

### 2. Corrections & Improvements Made
(Bullet points detailing the specific grammatical, spelling, or stylistic corrections made and why).`;
      break;

    case "translator":
      const sourceLang = options?.sourceLanguage || "Auto-detect";
      userContent = `Translate the following text accurately and idiomatically into ${language}.\nSource Language: ${sourceLang}\n\nText to translate:\n"""\n${prompt}\n"""\n\nProvide the translated text naturally respecting cultural nuances and grammatical elegance of ${language}.`;
      break;

    case "study-notes":
      userContent = `Generate comprehensive, structured study revision notes from the following material or topic:\n\n"""\n${prompt}\n"""\n\n${
        secondaryInput ? `Target Exam / Focus Areas: ${secondaryInput}\n\n` : ""
      }Format the study notes as follows:
# Subject / Topic Overview
## 1. High-Level Summary & Key Themes
## 2. Core Concepts & Definitions (Bold term + clear explanation)
## 3. Key Facts & High-Yield Bullet Points
## 4. Quick Review Q&A / Flashcard Questions (Question & Answer pairs to test memory).`;
      break;

    default:
      userContent = prompt;
  }

  return { systemInstruction, userContent };
}

function extractCleanErrorMessage(err: any): string {
  let message = err?.message || "An unexpected error occurred while generating content.";
  try {
    const parsed = typeof message === "string" && message.startsWith("{") ? JSON.parse(message) : null;
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {}
  if (message.includes("API_KEY")) {
    return "Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in your project settings.";
  }
  return message;
}

// AI Generation Endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { toolId, prompt, secondaryInput, language = "English", tone = "Professional", options } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Please provide prompt text or input." });
    }

    const ai = getAiClient();
    const { systemInstruction, userContent } = buildPrompt({
      toolId: toolId || "ai-writer",
      prompt: prompt.trim(),
      secondaryInput: secondaryInput?.trim(),
      language,
      tone,
      options,
    });

    let resultText = "";
    let lastError: any = null;

    // Models to attempt: primary is gemini-3.8-flash, with fallback to gemini-3.6-flash or gemini-3.1-flash-lite
    const candidateModels = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userContent,
          config: {
            systemInstruction,
            temperature: tone === "Creative" ? 0.9 : tone === "Simple" ? 0.4 : 0.7,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        resultText = response.text || "";
        if (resultText) break;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || "";
        const isTransient = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("429");
        if (isTransient) {
          console.warn(`Model ${modelName} encountered transient condition, attempting next model...`);
          continue;
        }
        throw err;
      }
    }

    if (!resultText) {
      if (lastError) throw lastError;
      return res.status(500).json({ error: "The AI model returned an empty response. Please try again." });
    }

    const words = resultText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = resultText.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return res.json({
      result: resultText,
      stats: {
        wordCount,
        charCount,
        readingTimeMinutes,
      },
    });
  } catch (err: any) {
    console.error("Error generating AI content:", err);
    const cleanMessage = extractCleanErrorMessage(err);
    return res.status(500).json({
      error: cleanMessage,
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
