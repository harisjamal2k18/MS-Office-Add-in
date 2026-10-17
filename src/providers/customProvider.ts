import { BaseProvider } from './baseProvider.ts';
import { ModelInfo } from './types.ts';

export class CustomProvider extends BaseProvider {
  id = 'custom';
  name = 'Custom / Local (Ollama, vLLM)';

  getModels(): ModelInfo[] {
    return [
      {
        id: 'llama3:latest',
        name: 'Ollama Llama 3',
        description: 'Local private Llama 3 model running on localhost (zero external data sharing).',
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: false,
          structuredOutput: true
        }
      },
      {
        id: 'deepseek-r1:latest',
        name: 'Ollama DeepSeek R1',
        description: 'Local reasoning model running on localhost:11434.',
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: false,
          structuredOutput: true
        }
      },
      {
        id: 'qwen2.5:latest',
        name: 'Ollama Qwen 2.5',
        description: 'Local high performance multilingual model.',
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: false,
          structuredOutput: true
        }
      }
    ];
  }
}
