import { BaseProvider } from './baseProvider.ts';
import { ModelInfo } from './types.ts';

export class GeminiProvider extends BaseProvider {
  id = 'gemini';
  name = 'Google Gemini';

  getModels(): ModelInfo[] {
    return [
      {
        id: 'gemini-3.6-flash',
        name: 'Gemini 3.6 Flash',
        description: 'Google\'s newest ultra-fast multimodal model with blazing throughput and exceptional reasoning.',
        contextWindow: 1000000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.075, completionPer1M: 0.30 }
      },
      {
        id: 'gemini-3.5-flash',
        name: 'Gemini 3.5 Flash',
        description: 'High-speed, reliable multimodal workhorse for high-volume document workflows.',
        contextWindow: 1000000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.075, completionPer1M: 0.30 }
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro (Preview)',
        description: 'Google\'s advanced deep-reasoning model for complex analytical tasks.',
        contextWindow: 1000000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 1.25, completionPer1M: 5.00 }
      },
      {
        id: 'gemini-flash-latest',
        name: 'Gemini Flash (Latest)',
        description: 'Always routes to the latest stable Gemini Flash version.',
        contextWindow: 1000000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.075, completionPer1M: 0.30 }
      },

    ];
  }
}
