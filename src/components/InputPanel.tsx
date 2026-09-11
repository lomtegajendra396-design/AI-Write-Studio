import React, { useState } from "react";
import {
  Sparkles,
  Clipboard,
  Trash2,
  SlidersHorizontal,
  CornerDownLeft,
  Info,
  Layers,
} from "lucide-react";
import { ToolConfig, LanguageCode, ToneType } from "../types";

interface InputPanelProps {
  tool: ToolConfig;
  prompt: string;
  setPrompt: (value: string) => void;
  secondaryInput: string;
  setSecondaryInput: (value: string) => void;
  language: LanguageCode;
  tone: ToneType;
  options: any;
  setOptions: React.Dispatch<React.SetStateAction<any>>;
  onGenerate: () => void;
  onClearInputs: () => void;
  isGenerating: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  tool,
  prompt,
  setPrompt,
  secondaryInput,
  setSecondaryInput,
  language,
  tone,
  options,
  setOptions,
  onGenerate,
  onClearInputs,
  isGenerating,
}) => {
  const [showSecondary, setShowSecondary] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPrompt(prompt ? `${prompt}\n${text}` : text);
      }
    } catch {
      // Clipboard permissions may not be granted
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (prompt.trim() && !isGenerating) {
        onGenerate();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col h-full">
      {/* Tool Header */}
      <div className="border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {tool.name}
            </h2>
            {language !== "English" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {language === "Hindi" ? tool.nameHindi : tool.nameMarathi}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{tone}</span> tone in{" "}
            <span className="font-medium text-slate-700">{language}</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {tool.description}
        </p>

        {/* Sample Presets */}
        {tool.presetSamples && tool.presetSamples.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100/80">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Presets:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tool.presetSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`preset-btn-${idx}`}
                  onClick={() => {
                    setPrompt(sample.input);
                    if (sample.secondary) {
                      setSecondaryInput(sample.secondary);
                      setShowSecondary(true);
                    }
                  }}
                  className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200/80 transition-colors font-medium text-left"
                >
                  ⚡ {sample.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary Input */}
      <div className="flex-1 flex flex-col min-h-0 mb-4">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="primary-prompt-input"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1"
          >
            {tool.inputLabel}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="paste-input-btn"
              onClick={handlePaste}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste</span>
            </button>
            {prompt && (
              <button
                type="button"
                id="clear-prompt-btn"
                onClick={() => setPrompt("")}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-0.5 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
                title="Clear input"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="relative flex-1 flex flex-col">
          <textarea
            id="primary-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tool.placeholder}
            rows={6}
            className="w-full flex-1 p-3.5 text-sm text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400 resize-none font-sans leading-relaxed"
          />
          <div className="flex justify-between items-center px-1 pt-1.5 text-[11px] text-slate-400">
            <span>
              Tip: Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 font-mono">⌘/Ctrl + Enter</kbd> to generate
            </span>
            <span>{prompt.length} chars</span>
          </div>
        </div>
      </div>

      {/* Tool-specific special options */}
      {tool.id === "social-media-caption" && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Target Platform:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {["Instagram", "LinkedIn", "X (Twitter)", "Facebook", "YouTube Community"].map((plat) => (
              <button
                key={plat}
                type="button"
                id={`platform-btn-${plat.toLowerCase().replace(/[^a-z0-9]/g, "")}`}
                onClick={() => setOptions({ ...options, platform: plat })}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  (options?.platform || "Instagram") === plat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>
      )}

      {tool.id === "summarizer" && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Summary Depth:
          </label>
          <div className="flex gap-2">
            {[
              { id: "short", label: "Quick Takeaways" },
              { id: "medium", label: "Standard Summary" },
              { id: "detailed", label: "Detailed & Comprehensive" },
            ].map((len) => (
              <button
                key={len.id}
                type="button"
                id={`summary-len-btn-${len.id}`}
                onClick={() => setOptions({ ...options, length: len.id })}
                className={`text-xs flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                  (options?.length || "medium") === len.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {len.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tool.id === "translator" && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block">
              Source Language:
            </label>
            <select
              id="translator-source-select"
              value={options?.sourceLanguage || "Auto-detect"}
              onChange={(e) => setOptions({ ...options, sourceLanguage: e.target.value })}
              className="mt-1 bg-white border border-slate-200 text-xs rounded-lg py-1 px-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="Auto-detect">Auto-detect</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
          <div className="text-right">
            <label className="text-xs font-semibold text-slate-700 block">
              Target Output Language:
            </label>
            <span className="inline-block mt-1 text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              {language}
            </span>
          </div>
        </div>
      )}

      {/* Secondary Input Toggle */}
      {tool.secondaryInputLabel && (
        <div className="mb-4">
          <button
            type="button"
            id="toggle-secondary-input-btn"
            onClick={() => setShowSecondary(!showSecondary)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors py-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>{tool.secondaryInputLabel}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {showSecondary ? "(Hide)" : "(Optional Add-on)"}
            </span>
          </button>

          {showSecondary && (
            <div className="mt-2">
              <textarea
                id="secondary-context-input"
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                placeholder={tool.secondaryPlaceholder}
                rows={2}
                className="w-full p-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400 resize-none font-sans"
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Row */}
      <div className="flex items-center gap-3 pt-2">
        {(prompt || secondaryInput) && (
          <button
            type="button"
            id="clear-all-inputs-btn"
            onClick={onClearInputs}
            className="px-3 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            Clear
          </button>
        )}

        <button
          type="button"
          id="generate-content-btn"
          onClick={onGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            !prompt.trim() || isGenerating
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-slate-900/10 cursor-pointer"
          }`}
        >
          <Sparkles
            className={`w-4 h-4 text-amber-400 ${
              isGenerating ? "animate-spin" : ""
            }`}
          />
          <span>{isGenerating ? "Generating Content..." : "Generate with AI"}</span>
        </button>
      </div>
    </div>
  );
};
