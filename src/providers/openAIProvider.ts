import { BaseProvider } from './baseProvider.ts';
import { ModelInfo } from './types.ts';

export class OpenAIProvider extends BaseProvider {
  id = 'openai';
  name = 'OpenAI';

  getModels(): ModelInfo[] {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o (Omni)',
        description: 'Flagship versatile multimodal model. Exceptional across writing, complex analysis, and coding.',
        contextWindow: 128000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 2.50, completionPer1M: 10.00 }
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast, cost-efficient model for quick drafting, rewriting, and routine Excel formulas.',
        contextWindow: 128000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.15, completionPer1M: 0.60 }
      },
      {
        id: 'o3-mini',
        name: 'o3-mini (Reasoning)',
        description: 'Advanced reasoning model for complex spreadsheet formulas, mathematical proofs, and logic.',
        contextWindow: 200000,
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 1.10, completionPer1M: 4.40 }
      },
      {
        id: 'o1',
        name: 'o1 (Deep Reasoning)',
        description: 'Full deep reasoning model for intricate scientific, legal, and financial document drafting.',
        contextWindow: 200000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: false,
          structuredOutput: true
        },
        pricing: { promptPer1M: 15.00, completionPer1M: 60.00 }
      },
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        description: 'High-definition image generation directly insertable into Word, Excel, and PowerPoint.',
        capabilities: {
          textGeneration: false,
          imageInput: false,
          imageGeneration: true,
          streaming: false,
          functionCalling: false,
          structuredOutput: false
        }
      }
    ];
  }
}
