import { BaseProvider } from './baseProvider.ts';
import { ModelInfo, StreamChatOptions } from './types.ts';

const NVIDIA_API_KEY = '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';

export class NvidiaProvider extends BaseProvider {
  id   = 'nvidia';
  name = 'NVIDIA NIM';

  getModels(): ModelInfo[] {
    return [
      {
        id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
        name: 'Nemotron 3.5 Lightning 30B',
        description: 'NVIDIA\'s ultra-fast 30B MoE model (3.5B active params) — blazing throughput for document drafting, summarization, and coding.',
        contextWindow: 128000,
        capabilities: {
          textGeneration:   true,
          imageInput:       false,
          imageGeneration:  false,
          streaming:        true,
          functionCalling:  false,
          structuredOutput: true
        },
        pricing: { promptPer1M: 0.20, completionPer1M: 0.60 }
      }
    ];
  }

  // Override streamChat to inject the fixed NVIDIA base URL and key.
  // The actual HTTP call goes through our Express proxy (/api/chat/stream),
  // so there are no browser CORS issues.
  async streamChat(options: StreamChatOptions): Promise<void> {
    return super.streamChat({
      ...options,
      provider: 'nvidia',
      apiKey:   options.apiKey || NVIDIA_API_KEY
    });
  }

  // Do NOT override validateApiKey here.
  // BaseProvider.validateApiKey() calls /api/validate (our Express proxy),
  // which has the 'nvidia' case and talks to the NVIDIA API server-side —
  // avoiding the CORS block that would occur from a direct browser fetch.
}
