import { ChatMessage, ModelInfo } from '../providers/types.ts';

const STORAGE_KEYS = {
  API_KEYS: 'office_ai_api_keys',
  ACTIVE_PROVIDER: 'office_ai_active_provider',
  ACTIVE_MODEL: 'office_ai_active_model',
  CUSTOM_MODELS: 'office_ai_custom_models',
  CHATS: 'office_ai_chat_sessions',
  ACTIVE_CHAT_ID: 'office_ai_active_chat_id',
  SETTINGS: 'office_ai_settings'
};

export interface AppSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  theme: 'dark' | 'light' | 'auto';
  directBrowserMode: boolean;
  contextInclusionMode: 'selection' | 'document' | 'none';
  customBaseUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const DEFAULT_SETTINGS: AppSettings = {
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: 'You are an expert AI assistant integrated into Microsoft Office (Word, Excel, PowerPoint). Provide clean, accurate, and structured answers. When generating Excel formulas, start with = and explain parameters. When drafting documents, format neatly with clear headings and tables. Tailor your responses to the current Office application context.',
  theme: 'dark',
  directBrowserMode: false,
  contextInclusionMode: 'selection',
  customBaseUrl: 'http://localhost:11434/v1'
};

export class StorageService {
  // API Keys
  static getApiKeys(): Record<string, string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  static setApiKey(provider: string, key: string): void {
    const keys = this.getApiKeys();
    keys[provider] = key;
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  }

  static removeApiKey(provider: string): void {
    const keys = this.getApiKeys();
    delete keys[provider];
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  }

  // Active Provider & Model
  static getActiveProvider(defaultVal = 'openai'): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROVIDER) || defaultVal;
  }

  static setActiveProvider(providerId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROVIDER, providerId);
  }

  static getActiveModel(defaultVal = 'gpt-4o'): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_MODEL) || defaultVal;
  }

  static setActiveModel(modelId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MODEL, modelId);
  }

  // Custom Models
  static getCustomModels(): ModelInfo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_MODELS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveCustomModel(model: ModelInfo): void {
    const models = this.getCustomModels().filter(m => m.id !== model.id);
    models.push({ ...model, isCustom: true });
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models));
  }

  static removeCustomModel(modelId: string): void {
    const models = this.getCustomModels().filter(m => m.id !== modelId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models));
  }

  // Settings
  static getSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Chat Sessions
  static getChatSessions(): ChatSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveChatSession(session: ChatSession): void {
    const sessions = this.getChatSessions().filter(s => s.id !== session.id);
    sessions.unshift(session);
    // Keep last 50 sessions max to preserve localStorage
    const trimmed = sessions.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(trimmed));
  }

  static deleteChatSession(id: string): void {
    const sessions = this.getChatSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(sessions));
  }

  static clearAllChats(): void {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
  }
}
