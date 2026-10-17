import { ChatMessage, ImageAttachment, OfficeContextSummary } from '../providers/types.ts';
import { ProviderRegistry } from './providerRegistry.ts';
import { ChatSession, StorageService } from './storageService.ts';
import { ToastComponent } from '../components/Toast.ts';

export class ChatService {
  private currentSession: ChatSession;
  private abortController: AbortController | null = null;
  private onStateChange: (session: ChatSession, isStreaming: boolean) => void;

  constructor(onStateChange: (session: ChatSession, isStreaming: boolean) => void) {
    this.onStateChange = onStateChange;
    this.currentSession = this.createNewSession();
  }

  getCurrentSession(): ChatSession {
    return this.currentSession;
  }

  loadSession(session: ChatSession): void {
    this.currentSession = session;
    this.onStateChange(this.currentSession, false);
  }

  createNewSession(): ChatSession {
    const session: ChatSession = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    this.currentSession = session;
    this.onStateChange(this.currentSession, false);
    return session;
  }

  stopGeneration(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async sendMessage(
    promptText: string,
    images: ImageAttachment[] = [],
    officeContext: OfficeContextSummary | null = null,
    providerId: string,
    modelId: string
  ): Promise<void> {
    const provider = ProviderRegistry.getProvider(providerId);
    if (!provider) {
      ToastComponent.show(`Provider "${providerId}" not found`, 'error');
      return;
    }

    const keys = StorageService.getApiKeys();
    const apiKey = keys[providerId] || '';
    const settings = StorageService.getSettings();

    if (!apiKey && providerId !== 'custom' && providerId !== 'nvidia' && providerId !== 'pollinations') {
      ToastComponent.show(`Please set an API key for ${provider.name} in Settings (⚙️ icon) before sending messages.`, 'warning', 4500);
      return;
    }

    // 1. Build User Message
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
      images: images.length > 0 ? images : undefined,
      officeContext: officeContext || undefined
    };

    // Update conversation title if first message
    if (this.currentSession.messages.length === 0) {
      this.currentSession.title = promptText.slice(0, 35) + (promptText.length > 35 ? '...' : '');
    }

    this.currentSession.messages.push(userMsg);

    // 2. Build Assistant Placeholder Message
    const assistantMsgId = 'msg_ai_' + Date.now();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      provider: providerId,
      model: modelId,
      isStreaming: true
    };

    this.currentSession.messages.push(assistantMsg);
    this.onStateChange(this.currentSession, true);

    // 3. Handle Special Image Generation Models (Pollinations.ai / Imagen)
    const modelInfo = ProviderRegistry.getModelInfo(providerId, modelId);
    if (modelInfo?.capabilities.imageGeneration && provider.generateImage) {
      try {
        assistantMsg.content = `🎨 Generating image with ${modelInfo.name}...\n\n*"${promptText}"*`;
        assistantMsg.isStreaming = true;
        this.onStateChange(this.currentSession, true);

        const result = await provider.generateImage({
          prompt: promptText,
          provider: providerId,
          model: modelId,
          apiKey
        });

        assistantMsg.content = `Here is your generated image:\n\n![${result.revisedPrompt || promptText}](${result.imageUrl})`;
        assistantMsg.isStreaming = false;
        this.currentSession.updatedAt = Date.now();
        StorageService.saveChatSession(this.currentSession);
        this.onStateChange(this.currentSession, false);
      } catch (err: any) {
        assistantMsg.content = `❌ **Image generation error:** ${err.message}`;
        assistantMsg.isError = true;
        assistantMsg.isStreaming = false;
        this.onStateChange(this.currentSession, false);
      }
      return;
    }

    // 4. Prepare Context & Message History for LLM
    const apiMessages: { role: string; content: string }[] = [];

    // System Prompt
    if (settings.systemPrompt) {
      apiMessages.push({ role: 'system', content: settings.systemPrompt });
    }

    // Prior Chat History (up to last 10 messages for context)
    const historySlice = this.currentSession.messages.slice(0, -2).slice(-10);
    for (const m of historySlice) {
      apiMessages.push({ role: m.role, content: m.content });
    }

    // Final user prompt enriched with active Office context
    let enrichedContent = promptText;
    if (officeContext && officeContext.data) {
      enrichedContent = `[Active Context from Microsoft ${officeContext.host} (${officeContext.label})]:\n${officeContext.data}\n\n[User Request]:\n${promptText}`;
    }
    apiMessages.push({ role: 'user', content: enrichedContent });

    // 5. Stream Response
    this.abortController = new AbortController();

    try {
      await provider.streamChat({
        messages: apiMessages,
        model: modelId,
        provider: providerId,
        apiKey,
        baseUrl: settings.customBaseUrl,
        images,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        signal: this.abortController.signal,
        onChunk: (delta: string) => {
          assistantMsg.content += delta;
          this.onStateChange(this.currentSession, true);
        },
        onDone: () => {
          assistantMsg.isStreaming = false;
          this.currentSession.updatedAt = Date.now();

          // Rough token estimation (1 word ≈ 1.3 tokens)
          const promptTokens = Math.round(enrichedContent.split(/\s+/).length * 1.3);
          const compTokens = Math.round(assistantMsg.content.split(/\s+/).length * 1.3);
          assistantMsg.tokens = { prompt: promptTokens, completion: compTokens, total: promptTokens + compTokens };

          const cost = ProviderRegistry.calculateCost(providerId, modelId, promptTokens, compTokens);
          if (cost !== null) assistantMsg.cost = cost;

          StorageService.saveChatSession(this.currentSession);
          this.onStateChange(this.currentSession, false);
          this.abortController = null;
        },
        onError: (errorText: string) => {
          assistantMsg.content += `\n\n**Error:** ${errorText}`;
          assistantMsg.isError = true;
          assistantMsg.isStreaming = false;
          this.currentSession.updatedAt = Date.now();
          StorageService.saveChatSession(this.currentSession);
          this.onStateChange(this.currentSession, false);
          this.abortController = null;
        }
      });
    } catch (err: any) {
      assistantMsg.content += `\n\n**Request Error:** ${err.message}`;
      assistantMsg.isError = true;
      assistantMsg.isStreaming = false;
      this.onStateChange(this.currentSession, false);
      this.abortController = null;
    }
  }

  async regenerate(messageId: string, providerId: string, modelId: string): Promise<void> {
    const idx = this.currentSession.messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;

    // Remove the message and subsequent messages
    const lastUserMsg = this.currentSession.messages.slice(0, idx).reverse().find(m => m.role === 'user');
    this.currentSession.messages = this.currentSession.messages.slice(0, idx);

    if (lastUserMsg) {
      await this.sendMessage(
        lastUserMsg.content,
        lastUserMsg.images || [],
        lastUserMsg.officeContext || null,
        providerId,
        modelId
      );
    }
  }
}
