import { BaseProvider } from './baseProvider.ts';
import { ModelInfo } from './types.ts';

export class OpenRouterProvider extends BaseProvider {
  id = 'openrouter';
  name = 'OpenRouter';

  getModels(): ModelInfo[] {
    return [
      {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek R1',
        description: 'Open-weights reasoning model with exceptional performance in logic, math, and code.',
        contextWindow: 128000,
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: false,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.55, completionPer1M: 2.19 }
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        description: 'Meta’s open-weights high performance workhorse for drafting, outlining, and analysis.',
        contextWindow: 128000,
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.40, completionPer1M: 0.40 }
      },
      {
        id: 'nvidia/nemotron-3-ultra-550b-a55b',
        name: 'Nemotron 3 Ultra 550B',
        description: 'NVIDIA’s massive 550B flagship model for sophisticated enterprise drafting and reasoning.',
        contextWindow: 128000,
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.80, completionPer1M: 2.40 }
      },
      {
        id: 'google/gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Google’s ultra-fast 1M context model via OpenRouter.',
        contextWindow: 1000000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.10, completionPer1M: 0.40 }
      }
    ];
  }
}
