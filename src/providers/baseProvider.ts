import { AIProvider, ImageGenOptions, ImageGenResult, ModelInfo, StreamChatOptions } from './types.ts';

export abstract class BaseProvider implements AIProvider {
  abstract id: string;
  abstract name: string;
  abstract getModels(): ModelInfo[];

  async validateApiKey(apiKey: string, baseUrl?: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: this.id,
          apiKey,
          baseUrl
        })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { valid: false, message: err.message || 'Connection test failed' };
    }
  }

  async streamChat(options: StreamChatOptions): Promise<void> {
    const { messages, model, apiKey, baseUrl, images, temperature, maxTokens, systemPrompt, onChunk, onDone, onError, signal } = options;

    try {
      const allMessages = [...messages];
      if (systemPrompt && !allMessages.some(m => m.role === 'system')) {
        allMessages.unshift({ role: 'system', content: systemPrompt });
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: this.id,
          apiKey,
          baseUrl,
          model,
          messages: allMessages,
          images,
          temperature,
          maxTokens
        }),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        onError(`Server returned ${response.status}: ${errorText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('Response body is not readable stream');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            onDone();
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              onError(data.error);
              return;
            }
            if (data.delta) {
              onChunk(data.delta);
            }
            if (data.done) {
              onDone();
              return;
            }
          } catch {
            // Ignore incomplete chunks
          }
        }
      }

      onDone();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onDone();
        return;
      }
      onError(err.message || 'Stream connection error');
    }
  }

  async generateImage(options: ImageGenOptions): Promise<ImageGenResult> {
    const res = await fetch('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: this.id,
        apiKey: options.apiKey,
        prompt: options.prompt,
        model: options.model,
        size: options.size || '1024x1024'
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || 'Failed to generate image');
    }

    return await res.json();
  }
}
