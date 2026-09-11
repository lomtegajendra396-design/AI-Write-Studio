import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  RotateCw,
  Trash2,
  Download,
  FileDown,
  Edit3,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  Clock,
  Type,
} from "lucide-react";
import { exportToPdf, exportToTxt } from "../utils/pdfExport";
import { LanguageCode, ToneType } from "../types";

interface OutputEditorProps {
  content: string;
  onChangeContent: (val: string) => void;
  toolName: string;
  language: LanguageCode;
  tone: ToneType;
  isGenerating: boolean;
  onRegenerate: () => void;
  onClear: () => void;
}

export const OutputEditor: React.FC<OutputEditorProps> = ({
  content,
  onChangeContent,
  toolName,
  language,
  tone,
  isGenerating,
  onRegenerate,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  // Real-time statistics computed directly from current edited content
  const stats = useMemo(() => {
    if (!content || !content.trim()) {
      return { words: 0, chars: 0, readingTime: 0 };
    }
    const words = content.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = content.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return { words: wordCount, chars: charCount, readingTime };
  }, [content]);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    if (!content) return;
    const filename = `${toolName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${language.toLowerCase()}-${Date.now()}.txt`;
    exportToTxt(filename, content);
  };

  const handleDownloadPdf = () => {
    if (!content) return;
    exportToPdf({
      title: `${toolName} Result`,
      toolName,
      language,
      tone,
      content,
      wordCount: stats.words,
    });
  };

  const fontSizeClasses = {
    sm: "text-xs sm:text-sm leading-relaxed",
    base: "text-sm sm:text-base leading-relaxed",
    lg: "text-base sm:text-lg leading-loose",
  }[fontSize];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 shadow-2xl p-6"
          : "h-full p-4 sm:p-6"
      }`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            Generated Result
          </span>

          {content && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                type="button"
                id="view-mode-edit-btn"
                onClick={() => setViewMode("edit")}
                className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "edit"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Edit directly"
              >
                Editable
              </button>
              <button
                type="button"
                id="view-mode-preview-btn"
                onClick={() => setViewMode("preview")}
                className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "preview"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Formatted reading view"
              >
                Preview
              </button>
            </div>
          )}
        </div>

        {/* Live Word & Reading Metrics */}
        {content && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Type className="w-3 h-3 text-slate-400" />
              <strong className="text-slate-800">{stats.words}</strong> words
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:flex items-center gap-1">
              <strong className="text-slate-700">{stats.chars}</strong> chars
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              ~{stats.readingTime} min read
            </span>

            {/* Font size control */}
            <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-slate-200">
              <button
                type="button"
                id="font-size-sm-btn"
                onClick={() => setFontSize("sm")}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  fontSize === "sm"
                    ? "bg-slate-200 text-slate-900 font-bold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                A-
              </button>
              <button
                type="button"
                id="font-size-base-btn"
                onClick={() => setFontSize("base")}
                className={`text-xs px-1.5 py-0.5 rounded ${
                  fontSize === "base"
                    ? "bg-slate-200 text-slate-900 font-bold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                A
              </button>
              <button
                type="button"
                id="font-size-lg-btn"
                onClick={() => setFontSize("lg")}
                className={`text-sm px-1.5 py-0.5 rounded ${
                  fontSize === "lg"
                    ? "bg-slate-200 text-slate-900 font-bold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                A+
              </button>
            </div>

            {/* Fullscreen toggle */}
            <button
              type="button"
              id="fullscreen-toggle-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Editor / Content Area */}
      <div className="flex-1 min-h-[300px] my-3 relative flex flex-col">
        {!content && !isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Ready to create something great?
            </h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
              Enter your prompt on the left or select a quick preset, then click{" "}
              <strong>Generate with AI</strong>. Your editable result will appear here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                ✍️ Editable text
              </span>
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                📋 Instant copy
              </span>
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                📄 PDF & TXT downloads
              </span>
            </div>
          </div>
        ) : isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-4 animate-bounce shadow-md">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              AI Writer is crafting your text...
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
              Generating fluent {language} output with a {tone} tone.
            </p>
            <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="w-full h-full bg-slate-900 animate-pulse" />
            </div>
          </div>
        ) : viewMode === "edit" ? (
          <textarea
            id="generated-result-textarea"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            className={`w-full flex-1 p-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-sans resize-none ${fontSizeClasses}`}
            placeholder="Your generated content is editable here..."
          />
        ) : (
          <div
            id="generated-result-preview"
            className={`w-full flex-1 p-4 bg-white border border-slate-200 rounded-xl overflow-y-auto font-sans text-slate-800 whitespace-pre-wrap ${fontSizeClasses}`}
          >
            {content}
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar: Copy, Regenerate, Clear, Download TXT, Download PDF */}
      {content && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {/* Left Actions: Copy & Regenerate */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="copy-result-btn"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="regenerate-result-btn"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Regenerate with current settings"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
              />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              id="clear-result-btn"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Clear generated result"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Right Actions: Downloads */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="download-txt-btn"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Download plain text (.txt)"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>TXT</span>
            </button>

            <button
              type="button"
              id="download-pdf-btn"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-colors"
              title="Download formatted document (.pdf)"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
