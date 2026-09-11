import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { ToolNavigation } from "./components/ToolNavigation";
import { InputPanel } from "./components/InputPanel";
import { OutputEditor } from "./components/OutputEditor";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { TOOLS } from "./data/tools";
import {
  ToolId,
  LanguageCode,
  ToneType,
  GenerationHistoryItem,
} from "./types";
import { AlertCircle, CheckCircle2, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "ai_writing_tool_history_v1";

export default function App() {
  const [selectedToolId, setSelectedToolId] = useState<ToolId>("ai-writer");
  const [language, setLanguage] = useState<LanguageCode>("English");
  const [tone, setTone] = useState<ToneType>("Professional");
  const [prompt, setPrompt] = useState<string>("");
  const [secondaryInput, setSecondaryInput] = useState<string>("");
  const [options, setOptions] = useState<any>({
    platform: "Instagram",
    length: "medium",
    sourceLanguage: "Auto-detect",
  });
  const [result, setResult] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback(
    (item: Omit<GenerationHistoryItem, "id" | "timestamp">) => {
      const newItem: GenerationHistoryItem = {
        ...item,
        id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, 30); // keep up to 30 items
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const selectedTool =
    TOOLS.find((t) => t.id === selectedToolId) || TOOLS[0];

  const handleSelectTool = (id: ToolId) => {
    setSelectedToolId(id);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: selectedToolId,
          prompt: prompt.trim(),
          secondaryInput: secondaryInput.trim(),
          language,
          tone,
          options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate content. Please try again.");
      }

      if (data?.result) {
        setResult(data.result);
        const wordCount = data?.stats?.wordCount || data.result.trim().split(/\s+/).filter(Boolean).length;
        saveToHistory({
          toolId: selectedToolId,
          toolName: selectedTool.name,
          prompt: prompt.trim(),
          result: data.result,
          language,
          tone,
          wordCount,
        });
      } else {
        throw new Error("No output generated from the AI model.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setErrorMessage(
        err?.message || "An unexpected error occurred. Please check your network and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearInputs = () => {
    setPrompt("");
    setSecondaryInput("");
    setErrorMessage(null);
  };

  const handleClearResult = () => {
    setResult("");
  };

  const handleSelectHistoryItem = (item: GenerationHistoryItem) => {
    setSelectedToolId(item.toolId);
    setLanguage(item.language);
    setTone(item.tone);
    setPrompt(item.prompt);
    setResult(item.result);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        currentLanguage={language}
        onSelectLanguage={setLanguage}
        currentTone={tone}
        onSelectTone={setTone}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* 10 Tools Navigation Bar */}
      <ToolNavigation
        tools={TOOLS}
        selectedToolId={selectedToolId}
        onSelectTool={handleSelectTool}
        currentLanguage={language}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Generation Error
                </h4>
                <p className="text-xs sm:text-sm text-rose-700 mt-0.5 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-400 hover:text-rose-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dual-Pane Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          {/* Left Column: Input Panel (5 Cols on LG) */}
          <div className="lg:col-span-5 flex flex-col min-h-[480px]">
            <InputPanel
              tool={selectedTool}
              prompt={prompt}
              setPrompt={setPrompt}
              secondaryInput={secondaryInput}
              setSecondaryInput={setSecondaryInput}
              language={language}
              tone={tone}
              options={options}
              setOptions={setOptions}
              onGenerate={handleGenerate}
              onClearInputs={handleClearInputs}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Column: Output Editor (7 Cols on LG) */}
          <div className="lg:col-span-7 flex flex-col min-h-[480px]">
            <OutputEditor
              content={result}
              onChangeContent={setResult}
              toolName={selectedTool.name}
              language={language}
              tone={tone}
              isGenerating={isGenerating}
              onRegenerate={handleGenerate}
              onClear={handleClearResult}
            />
          </div>
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
