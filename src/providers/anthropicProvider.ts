import { BaseProvider } from './baseProvider.ts';
import { ModelInfo } from './types.ts';

export class AnthropicProvider extends BaseProvider {
  id = 'anthropic';
  name = 'Anthropic Claude';

  getModels(): ModelInfo[] {
    return [
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
        description: 'Anthropic’s premier hybrid model featuring instant responses or extended thinking for deep analysis.',
        contextWindow: 200000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 3.00, completionPer1M: 15.00 }
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Benchmark-leading intelligence for coding, nuanced prose, and advanced spreadsheet modeling.',
        contextWindow: 200000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 3.00, completionPer1M: 15.00 }
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        description: 'Blazing fast intelligence for quick text transformations, tone shifts, and summarization.',
        contextWindow: 200000,
        capabilities: {
          textGeneration: true,
          imageInput: true,
          imageGeneration: false,
          streaming: true,
          functionCalling: true,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.80, completionPer1M: 4.00 }
      }
    ];
  }
}
