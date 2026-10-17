import { AIProvider, ModelInfo } from '../providers/types.ts';
import { GeminiProvider } from '../providers/geminiProvider.ts';
import { NvidiaProvider } from '../providers/nvidiaProvider.ts';
import { OpenRouterProvider } from '../providers/openRouterProvider.ts';
import { CustomProvider } from '../providers/customProvider.ts';
import { PollinationsImageProvider } from '../providers/pollinationsImageProvider.ts';
import { StorageService } from './storageService.ts';

export class ProviderRegistry {
  private static providers: Map<string, AIProvider> = new Map();

  static initialize(): void {
    if (this.providers.size > 0) return;

    this.register(new GeminiProvider());
    this.register(new NvidiaProvider());
    this.register(new OpenRouterProvider());
    this.register(new PollinationsImageProvider());
    this.register(new CustomProvider());
  }

  static register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  static getProvider(id: string): AIProvider | undefined {
    this.initialize();
    return this.providers.get(id);
  }

  static getAllProviders(): AIProvider[] {
    this.initialize();
    return Array.from(this.providers.values());
  }

  static getModelsForProvider(providerId: string): ModelInfo[] {
    const provider = this.getProvider(providerId);
    if (!provider) return [];

    const builtIn = provider.getModels();
    const custom = StorageService.getCustomModels().filter(m => (m as any).providerId === providerId);
    return [...builtIn, ...custom];
  }

  static getModelInfo(providerId: string, modelId: string): ModelInfo | undefined {
    const models = this.getModelsForProvider(providerId);
    return models.find(m => m.id === modelId) || {
      id: modelId,
      name: modelId,
      capabilities: {
        textGeneration: true,
        imageInput: true,
        imageGeneration: false,
        streaming: true,
        functionCalling: true,
        structuredOutput: true
      }
    };
  }

  static calculateCost(providerId: string, modelId: string, promptTokens: number, completionTokens: number): number | null {
    const model = this.getModelInfo(providerId, modelId);
    if (!model?.pricing) return null;

    const pCost = (promptTokens / 1_000_000) * model.pricing.promptPer1M;
    const cCost = (completionTokens / 1_000_000) * model.pricing.completionPer1M;
    return Number((pCost + cCost).toFixed(5));
  }
}
