import { ChatMessage } from '../providers/types.ts';
import { renderMarkdown } from '../utils/markdown.ts';
import { ActionDispatcher } from '../office/actionDispatcher.ts';
import { HostDetector } from '../office/hostDetector.ts';
import { extractImageUrl, copyImageToClipboard, downloadImage, sanitizeTextForCopy } from '../utils/clipboard.ts';

export class ChatViewComponent {
  private container: HTMLElement;
  private onRegenerate: (messageId: string) => void;
  private onShowToast: (message: string) => void;

  constructor(
    container: HTMLElement,
    callbacks: { onRegenerate: (messageId: string) => void; onShowToast: (message: string) => void }
  ) {
    this.container = container;
    this.onRegenerate = callbacks.onRegenerate;
    this.onShowToast = callbacks.onShowToast;
  }

  render(messages: ChatMessage[], isGenerating = false): void {
    if (messages.length === 0) {
      this.renderWelcome();
      return;
    }

    const host = HostDetector.getHost();

    this.container.innerHTML = `
      <div class="chat-viewport" id="chatViewport">
        ${messages.map(msg => this.renderMessage(msg, host)).join('')}
      </div>
    `;

    this.attachEventListeners(messages);
    this.scrollToBottom();
  }

  private renderWelcome(): void {
    const host = HostDetector.getHost();

    this.container.innerHTML = `
      <div class="chat-viewport" id="chatViewport">
        <div class="welcome-hero">
          <div class="welcome-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <h2 class="welcome-title">Unified Office AI Copilot</h2>
          <p class="welcome-desc">
            Interact with OpenAI, Gemini, Claude, and OpenRouter directly inside Microsoft ${host}.
          </p>
          <div class="welcome-cards">
            <div class="welcome-card" data-prompt="${this.getDefaultPrompt(host, 1)}">
              <div class="welcome-card-title">${this.getPromptTitle(host, 1)}</div>
              <div class="welcome-card-subtitle">${this.getPromptDesc(host, 1)}</div>
            </div>
            <div class="welcome-card" data-prompt="${this.getDefaultPrompt(host, 2)}">
              <div class="welcome-card-title">${this.getPromptTitle(host, 2)}</div>
              <div class="welcome-card-subtitle">${this.getPromptDesc(host, 2)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.welcome-card').forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt') || '';
        const promptInput = document.querySelector('#promptInput') as HTMLTextAreaElement;
        if (promptInput) {
          promptInput.value = prompt;
          promptInput.focus();
        }
      });
    });
  }

  private getDefaultPrompt(host: string, num: number): string {
    if (host === 'Excel') {
      return num === 1
        ? 'Explain this data and identify top trends and outliers.'
        : 'Create an Excel formula using XLOOKUP to match IDs and calculate total revenue.';
    }
    if (host === 'PowerPoint') {
      return num === 1
        ? 'Create a 5-slide presentation outline on Artificial Intelligence in modern education.'
        : 'Generate speaker notes for this slide focusing on executive decision makers.';
    }
    return num === 1
      ? 'Rewrite this paragraph to be persuasive, concise, and executive-ready.'
      : 'Create a comparative analysis table detailing the pros and cons of cloud migration.';
  }

  private getPromptTitle(host: string, num: number): string {
    if (host === 'Excel') return num === 1 ? 'Analyze Spreadsheet' : 'Write Smart Formula';
    if (host === 'PowerPoint') return num === 1 ? 'Create Presentation' : 'Generate Speaker Notes';
    return num === 1 ? 'Polished Document Rewrite' : 'Generate Comparison Table';
  }

  private getPromptDesc(host: string, num: number): string {
    if (host === 'Excel') return num === 1 ? 'Summarizes statistics & key findings' : 'Calculates dynamic metrics';
    if (host === 'PowerPoint') return num === 1 ? 'Outline with slide titles and bullets' : 'Tailored talking points';
    return num === 1 ? 'Enhance tone, clarity, and impact' : 'Structured markdown table';
  }

  private renderMessage(msg: ChatMessage, host: string): string {
    const isUser = msg.role === 'user';
    const isAssistant = msg.role === 'assistant';

    let contentHtml = isUser
      ? `<p>${msg.content.replace(/\n/g, '<br>')}</p>`
      : renderMarkdown(msg.content);

    if (msg.isStreaming) {
      contentHtml += '<span class="streaming-cursor"></span>';
    }

    // Attachments if any
    let attachmentHtml = '';
    if (msg.images && msg.images.length > 0) {
      attachmentHtml = `<div class="attachments-preview">
        ${msg.images.map(img => `<div class="attachment-chip"><img src="${img.data.startsWith('data:') ? img.data : `data:${img.mimeType};base64,${img.data}`}" /> <span>${img.name}</span></div>`).join('')}
      </div>`;
    }

    // Assistant Action Bar
    let actionsBarHtml = '';
    if (isAssistant && !msg.isStreaming && !msg.isError) {
      const formula = ActionDispatcher.extractFormula(msg.content);
      const isPPT = host === 'PowerPoint';
      const hasImage = !!extractImageUrl(msg.content);

      actionsBarHtml = `
        <div class="message-actions-bar" data-msg-id="${msg.id}">
          <button class="action-chip-btn primary insert-btn" title="Insert directly into document">
            📥 Insert
          </button>
          <button class="action-chip-btn replace-btn" title="Replace highlighted selection">
            ⇄ Replace
          </button>
          ${formula ? `<button class="action-chip-btn excel-action formula-btn" data-formula="${encodeURIComponent(formula)}" title="Insert formula into selected cell">🧮 Insert Formula</button>` : ''}
          ${isPPT ? `<button class="action-chip-btn ppt-action slide-btn" title="Create slide from this outline">🎯 Create Slide</button>` : ''}
          <button class="action-chip-btn copy-btn" title="${hasImage ? 'Copy image to clipboard (pastes as picture directly into Word/Office)' : 'Copy response to clipboard'}">
            📋 ${hasImage ? 'Copy Image' : 'Copy'}
          </button>
          <button class="action-chip-btn regen-btn" title="Regenerate response">
            ↻ Regenerate
          </button>
        </div>
      `;
    }

    const metaLabel = isUser
      ? 'You'
      : `${msg.provider ? msg.provider.toUpperCase() : 'AI'}${msg.model ? ` (${msg.model})` : ''}`;

    return `
      <div class="chat-message ${msg.role}" id="msg-${msg.id}">
        <div class="message-meta">${metaLabel}</div>
        ${attachmentHtml}
        <div class="message-bubble ${msg.isError ? 'error-bubble' : ''}">
          ${contentHtml}
        </div>
        ${actionsBarHtml}
      </div>
    `;
  }

  private attachEventListeners(messages: ChatMessage[]): void {
    // Copy code blocks
    this.container.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const code = decodeURIComponent(target.dataset.code || '');
        navigator.clipboard.writeText(code).then(() => {
          target.textContent = 'Copied!';
          setTimeout(() => { target.textContent = 'Copy'; }, 1500);
        });
      });
    });

    // Copy image directly from card button
    this.container.querySelectorAll('.copy-card-img-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLElement;
        const card = target.closest('.generated-image-card');
        const img = card?.querySelector('img.generated-image') as HTMLImageElement;
        if (!img || !img.src) return;

        target.textContent = 'Copying...';
        const ok = await copyImageToClipboard(img.src);
        if (ok) {
          target.textContent = '✓ Copied!';
          target.classList.add('copied');
          this.onShowToast('Image copied to clipboard! Paste directly into Word.');
          setTimeout(() => {
            target.textContent = '📋 Copy Image';
            target.classList.remove('copied');
          }, 2000);
        } else {
          target.textContent = '📋 Copy Image';
          this.onShowToast('Could not copy image to clipboard');
        }
      });
    });

    // Download image from card button
    this.container.querySelectorAll('.download-card-img-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const card = target.closest('.generated-image-card');
        const img = card?.querySelector('img.generated-image') as HTMLImageElement;
        if (!img || !img.src) return;

        const imgName = target.dataset.imgName || 'generated-image';
        const safeName = imgName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
        downloadImage(img.src, `${safeName}.png`);
        this.onShowToast('Image downloaded');
      });
    });

    // Message action buttons
    this.container.querySelectorAll('.message-actions-bar').forEach(bar => {
      const msgId = (bar as HTMLElement).dataset.msgId;
      const msg = messages.find(m => m.id === msgId);
      if (!msg) return;

      // Insert button
      bar.querySelector('.insert-btn')?.addEventListener('click', async () => {
        const res = await ActionDispatcher.insertContent(msg.content, false);
        this.onShowToast(res.message);
      });

      // Replace button
      bar.querySelector('.replace-btn')?.addEventListener('click', async () => {
        const res = await ActionDispatcher.insertContent(msg.content, true);
        this.onShowToast(res.message);
      });

      // Insert formula button
      bar.querySelector('.formula-btn')?.addEventListener('click', async (e) => {
        const formula = decodeURIComponent((e.currentTarget as HTMLElement).dataset.formula || '');
        const res = await ActionDispatcher.insertFormula(formula);
        this.onShowToast(res.message);
      });

      // Create slide button
      bar.querySelector('.slide-btn')?.addEventListener('click', async () => {
        const res = await ActionDispatcher.createSlideFromText(msg.content);
        this.onShowToast(res.message);
      });

      // Copy response (handles images and text)
      bar.querySelector('.copy-btn')?.addEventListener('click', async () => {
        const imageUrl = extractImageUrl(msg.content);
        if (imageUrl) {
          this.onShowToast('Copying image to clipboard...');
          const ok = await copyImageToClipboard(imageUrl);
          if (ok) {
            this.onShowToast('Image copied to clipboard! Paste directly into Word.');
            return;
          }
        }

        // Fallback or text message: sanitize so no raw 600KB base64 dumps or &nbsp; entities
        const cleanText = sanitizeTextForCopy(msg.content);
        await navigator.clipboard.writeText(cleanText);
        this.onShowToast('Copied to clipboard');
      });

      // Regenerate response
      bar.querySelector('.regen-btn')?.addEventListener('click', () => {
        if (msgId) this.onRegenerate(msgId);
      });
    });
  }

  scrollToBottom(): void {
    const el = this.container.querySelector('#chatViewport');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  /**
   * Efficiently update only the streaming message bubble without full re-render.
   * This prevents the visible "jitter" caused by destroying and rebuilding the
   * entire chat DOM on every streamed token.
   */
  updateStreamingBubble(messageId: string, content: string): void {
    const msgEl = this.container.querySelector(`#msg-${messageId} .message-bubble`);
    if (!msgEl) return;

    msgEl.innerHTML = renderMarkdown(content) + '<span class="streaming-cursor"></span>';
    this.scrollToBottom();
  }
}
