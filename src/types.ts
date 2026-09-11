export type ToolId =
  | 'ai-writer'
  | 'essay-writer'
  | 'article-writer'
  | 'email-generator'
  | 'social-media-caption'
  | 'summarizer'
  | 'text-rewriter'
  | 'grammar-corrector'
  | 'translator'
  | 'study-notes';

export type LanguageCode = 'English' | 'Hindi' | 'Marathi';

export type ToneType =
  | 'Simple'
  | 'Professional'
  | 'Formal'
  | 'Friendly'
  | 'Creative';

export interface ToolConfig {
  id: ToolId;
  name: string;
  nameHindi: string;
  nameMarathi: string;
  description: string;
  icon: string;
  placeholder: string;
  inputLabel: string;
  secondaryInputLabel?: string;
  secondaryPlaceholder?: string;
  presetSamples: {
    title: string;
    input: string;
    secondary?: string;
  }[];
}

export interface GenerateRequestPayload {
  toolId: ToolId;
  prompt: string;
  secondaryInput?: string;
  language: LanguageCode;
  tone: ToneType;
  options?: {
    platform?: string;
    length?: 'short' | 'medium' | 'detailed';
    format?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
  };
}

export interface GenerateResponsePayload {
  result?: string;
  error?: string;
  stats?: {
    wordCount: number;
    charCount: number;
    readingTimeMinutes: number;
  };
}

export interface GenerationHistoryItem {
  id: string;
  toolId: ToolId;
  toolName: string;
  prompt: string;
  result: string;
  language: LanguageCode;
  tone: ToneType;
  timestamp: number;
  wordCount: number;
}
