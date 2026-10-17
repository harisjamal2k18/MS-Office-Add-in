/**
 * Core Types for Office AI Add-in
 */

export type OfficeHostType = 'Word' | 'Excel' | 'PowerPoint' | 'Unknown';

export interface ModelCapability {
  textGeneration: boolean;
  imageInput: boolean;
  imageGeneration: boolean;
  streaming: boolean;
  functionCalling: boolean;
  structuredOutput: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  capabilities: ModelCapability;
  pricing?: {
    promptPer1M: number;
    completionPer1M: number;
  };
  isCustom?: boolean;
}

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  defaultModel: string;
  models: ModelInfo[];
}

export interface ImageAttachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string (without or with data: URL prefix)
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  model?: string;
  images?: ImageAttachment[];
  officeContext?: OfficeContextSummary;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  cost?: number;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface OfficeContextSummary {
  host: OfficeHostType;
  type: 'selection' | 'sheet' | 'slide' | 'document' | 'none';
  label: string;
  snippet?: string;
  data?: any;
}

export interface StreamChatOptions {
  messages: { role: string; content: string }[];
  model: string;
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  images?: ImageAttachment[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  onChunk: (delta: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export interface ImageGenOptions {
  prompt: string;
  provider: string;
  model?: string;
  size?: '1024x1024' | '512x512';
  apiKey?: string;
}

export interface ImageGenResult {
  imageUrl: string;
  imageBase64: string;
  revisedPrompt?: string;
}

export interface ExcelRangeData {
  address: string;
  sheetName: string;
  rowCount: number;
  colCount: number;
  values: any[][];
  formulas: any[][];
}

export interface PPTSlideData {
  slideNumber: number;
  slideTitle?: string;
  selectedText?: string;
  slideText?: string;
  notes?: string;
}

export interface WordContextData {
  selectedText?: string;
  documentTitle?: string;
  wordCount?: number;
}

export interface AIProvider {
  id: string;
  name: string;
  getModels(): ModelInfo[];
  validateApiKey(apiKey: string, baseUrl?: string): Promise<{ valid: boolean; message?: string }>;
  streamChat(options: StreamChatOptions): Promise<void>;
  generateImage?(options: ImageGenOptions): Promise<ImageGenResult>;
}
