import React from "react";
import { Sparkles, Globe, Sliders, History, FileText } from "lucide-react";
import { LanguageCode, ToneType } from "../types";

interface HeaderProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  currentTone: ToneType;
  onSelectTone: (tone: ToneType) => void;
  onOpenHistory: () => void;
  historyCount: number;
}

const LANGUAGES: { id: LanguageCode; label: string; native: string }[] = [
  { id: "English", label: "English", native: "English" },
  { id: "Hindi", label: "Hindi", native: "हिन्दी" },
  { id: "Marathi", label: "Marathi", native: "मराठी" },
];

const TONES: { id: ToneType; label: string; desc: string }[] = [
  { id: "Simple", label: "Simple", desc: "Clear & easy to read" },
  { id: "Professional", label: "Professional", desc: "Polished & business-ready" },
  { id: "Formal", label: "Formal", desc: "Academic & authoritative" },
  { id: "Friendly", label: "Friendly", desc: "Warm & conversational" },
  { id: "Creative", label: "Creative", desc: "Expressive & evocative" },
];

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onSelectLanguage,
  currentTone,
  onSelectTone,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800/10">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">AI Writing Tool</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                  Gemini 3.8
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500">
                10 Specialized AI Writers in English, हिन्दी, and मराठी
              </p>
            </div>
          </div>

          {/* Controls: Language, Tone, History */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80">
                <Globe className="w-4 h-4 text-slate-500 ml-2 mr-1 hidden sm:block" />
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    id={`lang-btn-${lang.id.toLowerCase()}`}
                    onClick={() => onSelectLanguage(lang.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      currentLanguage === lang.id
                        ? "bg-white text-slate-900 shadow-sm font-semibold border border-slate-200/60"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                    title={`Write in ${lang.label} (${lang.native})`}
                  >
                    <span>{lang.label}</span>
                    {lang.id !== "English" && (
                      <span className="hidden lg:inline text-[11px] opacity-70 ml-1">
                        ({lang.native})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="relative">
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80">
                <Sliders className="w-4 h-4 text-slate-500 ml-2 mr-1 hidden md:block" />
                <select
                  id="tone-select-dropdown"
                  value={currentTone}
                  onChange={(e) => onSelectTone(e.target.value as ToneType)}
                  className="bg-white text-slate-800 text-xs font-medium py-1 px-2.5 rounded-lg border border-slate-200/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  title="Select Writing Tone"
                >
                  {TONES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} Tone
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* History Button */}
            <button
              id="history-drawer-btn"
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              title="View Generation History"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-slate-900 text-white rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
