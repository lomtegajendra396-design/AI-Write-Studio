import React, { useState } from "react";
import { X, Clock, Trash2, ArrowUpRight, Copy, Check, FileDown, BookOpen } from "lucide-react";
import { GenerationHistoryItem } from "../types";
import { exportToTxt } from "../utils/pdfExport";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryItem[];
  onSelectHistoryItem: (item: GenerationHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">Recent Generations</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                id="clear-history-all-btn"
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              id="close-history-drawer-btn"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No history saved yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your generated articles, essays, and drafts will appear here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    {item.toolName}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>{item.language}</span>
                    <span>•</span>
                    <span>{item.tone}</span>
                    <span>•</span>
                    <span>{item.wordCount}w</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-2 italic">
                  "{item.prompt}"
                </p>

                <p className="text-xs text-slate-500 line-clamp-3 bg-white p-2 rounded-lg border border-slate-100 mb-3 font-mono">
                  {item.result}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.result)}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500"
                      title="Copy text"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        exportToTxt(
                          `${item.toolId}-${item.language.toLowerCase()}.txt`,
                          item.result
                        )
                      }
                      className="p-1 rounded hover:bg-slate-200 text-slate-500"
                      title="Download TXT"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className="flex items-center gap-0.5 px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800 transition-colors"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
