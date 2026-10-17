import { BaseProvider } from './baseProvider.ts';
import { ImageGenOptions, ImageGenResult, ModelInfo, StreamChatOptions } from './types.ts';
import { getApiUrl } from '../utils/apiUrl.ts';

export class PollinationsImageProvider extends BaseProvider {
  id = 'pollinations';
  name = 'Pollinations.ai (Images)';

  getModels(): ModelInfo[] {
    return [
      {
        id: 'tongyi-mai/z-image-turbo',
        name: 'Z-Image Turbo',
        description: 'Ultra-fast, high-fidelity diffusion model by Tongyi MAI on Pollinations.ai.',
        capabilities: {
          textGeneration: false,
          imageInput: false,
          imageGeneration: true,
          streaming: false,
          functionCalling: false,
          structuredOutput: false
        }
      },
      {
        id: 'microsoft/mai-image-2.5-flash',
        name: 'MAI Image 2.5 Flash',
        description: 'High-speed, photorealistic visual synthesis model by Microsoft MAI on Pollinations.ai.',
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

  /**
   * Validate connection through server proxy
   */
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const res = await fetch(getApiUrl('/api/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: this.id,
          apiKey
        })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          valid: false,
          message: `API proxy returned HTTP ${res.status} with ${contentType || 'an unknown content type'}. Deploy the Express server and set VITE_API_BASE_URL to its public URL.`
        };
      }
      return await res.json();
    } catch (err: any) {
      return { valid: false, message: err.message || 'Pollinations.ai validation failed' };
    }
  }

  /**
   * Generates image by delegating to server endpoint /api/image/generate.
   * Server manages Pollinations API key securely.
   */
  async generateImage(options: ImageGenOptions): Promise<ImageGenResult> {
    const res = await fetch(getApiUrl('/api/image/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'pollinations',
        model: options.model || 'tongyi-mai/z-image-turbo',
        prompt: options.prompt,
        size: options.size || '1024x1024',
        apiKey: options.apiKey
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || 'Failed to generate image via Pollinations.ai');
    }

    return await res.json();
  }

  /**
   * Fallback if invoked via standard chat stream
   */
  async streamChat(options: StreamChatOptions): Promise<void> {
    const lastUserPrompt = options.messages.filter(m => m.role === 'user').pop()?.content || '';
    const activeModelName = options.model?.includes('flash') ? 'MAI Image 2.5 Flash' : 'Z-Image Turbo';

    // Auto-redirect to image generation if prompted as text
    try {
      options.onChunk(`🎨 *Generating image with ${activeModelName}...*\n\n`);
      const result = await this.generateImage({
        prompt: lastUserPrompt,
        provider: this.id,
        model: options.model
      });
      options.onChunk(`![${lastUserPrompt}](${result.imageUrl})`);
      options.onDone();
    } catch (err: any) {
      options.onError(err.message || 'Image generation failed');
    }
  }
}
