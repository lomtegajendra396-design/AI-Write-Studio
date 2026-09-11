import React from "react";
import {
  PenTool,
  BookOpen,
  FileText,
  Mail,
  Share2,
  Minimize2,
  RefreshCw,
  CheckCheck,
  Languages,
  GraduationCap,
} from "lucide-react";
import { ToolConfig, ToolId, LanguageCode } from "../types";

interface ToolNavigationProps {
  tools: ToolConfig[];
  selectedToolId: ToolId;
  onSelectTool: (id: ToolId) => void;
  currentLanguage: LanguageCode;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  PenTool,
  BookOpen,
  FileText,
  Mail,
  Share2,
  Minimize2,
  RefreshCw,
  CheckCheck,
  Languages,
  GraduationCap,
};

export const ToolNavigation: React.FC<ToolNavigationProps> = ({
  tools,
  selectedToolId,
  onSelectTool,
  currentLanguage,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-200">
          {tools.map((tool) => {
            const Icon = ICON_MAP[tool.icon] || PenTool;
            const isSelected = tool.id === selectedToolId;

            // Localized tool title
            const localizedName =
              currentLanguage === "Hindi"
                ? tool.nameHindi
                : currentLanguage === "Marathi"
                ? tool.nameMarathi
                : tool.name;

            return (
              <button
                key={tool.id}
                id={`tool-nav-btn-${tool.id}`}
                onClick={() => onSelectTool(tool.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
                }`}
                title={tool.description}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? "text-amber-400" : "text-slate-500"
                  }`}
                />
                <span>{tool.name}</span>
                {currentLanguage !== "English" && (
                  <span
                    className={`text-[11px] opacity-80 ${
                      isSelected ? "text-slate-200" : "text-slate-400"
                    }`}
                  >
                    ({localizedName})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
