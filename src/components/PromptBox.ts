import { ImageAttachment } from '../providers/types.ts';
import { ToastComponent } from './Toast.ts';

export class PromptBoxComponent {
  private container: HTMLElement;
  private onSend: (text: string, images: ImageAttachment[]) => void;
  private onStop: () => void;
  private isGenerating = false;
  private attachedImages: ImageAttachment[] = [];
  private visionSupported = true;

  constructor(
    container: HTMLElement,
    callbacks: { onSend: (text: string, images: ImageAttachment[]) => void; onStop: () => void }
  ) {
    this.container = container;
    this.onSend = callbacks.onSend;
    this.onStop = callbacks.onStop;
    this.render();
  }

  setGenerating(isGenerating: boolean): void {
    this.isGenerating = isGenerating;
    this.render();
  }

  setVisionSupported(supported: boolean): void {
    this.visionSupported = supported;
    const attachBtn = this.container.querySelector('#attachBtn') as HTMLButtonElement;
    if (attachBtn) {
      attachBtn.disabled = !supported;
      attachBtn.setAttribute('title', supported ? 'Attach image (Vision)' : 'Current model does not support vision');
      attachBtn.style.opacity = supported ? '1' : '0.4';
    }
  }

  setInput(text: string): void {
    const textarea = this.container.querySelector('#promptInput') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = text;
      textarea.focus();
      this.autoResize(textarea);
    }
  }

  render(): void {
    this.container.innerHTML = `
      <div class="input-area">
        ${this.renderAttachmentPreviews()}
        <div class="input-box-wrapper">
          <input type="file" id="fileInput" accept="image/png,image/jpeg,image/webp" style="display: none;" multiple />
          <button class="input-action-btn" id="attachBtn" title="${this.visionSupported ? 'Attach image (Vision)' : 'Vision not supported on model'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </button>
          
          <textarea 
            class="prompt-textarea" 
            id="promptInput" 
            rows="1" 
            placeholder="Ask AI anything, write, summarize, or analyze data..."
          ></textarea>

          ${this.isGenerating ? `
            <button class="input-action-btn stop-btn" id="stopBtn" title="Stop Generation">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect width="14" height="14" x="5" y="5" rx="2"/>
              </svg>
            </button>
          ` : `
            <button class="input-action-btn send-btn" id="sendBtn" title="Send (Enter)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m5 12 7-7 7 7"/>
                <path d="M12 19V5"/>
              </svg>
            </button>
          `}
        </div>
        <div class="input-footer">
          <span>Shift+Enter for new line</span>
          <span>Unified Office AI</span>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderAttachmentPreviews(): string {
    if (this.attachedImages.length === 0) return '';

    return `
      <div class="attachments-preview">
        ${this.attachedImages.map((img, i) => `
          <div class="attachment-chip">
            <img src="${img.data.startsWith('data:') ? img.data : `data:${img.mimeType};base64,${img.data}`}" />
            <span>${img.name}</span>
            <button class="remove-attach-btn" data-index="${i}" style="margin-left: 4px; color: var(--text-muted);">✕</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  private attachEventListeners(): void {
    const textarea = this.container.querySelector('#promptInput') as HTMLTextAreaElement;
    const sendBtn = this.container.querySelector('#sendBtn');
    const stopBtn = this.container.querySelector('#stopBtn');
    const attachBtn = this.container.querySelector('#attachBtn');
    const fileInput = this.container.querySelector('#fileInput') as HTMLInputElement;

    // Auto-resize
    textarea?.addEventListener('input', () => this.autoResize(textarea));

    // Keydown (Enter to send)
    textarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.submit();
      }
    });

    sendBtn?.addEventListener('click', () => this.submit());
    stopBtn?.addEventListener('click', () => this.onStop());

    attachBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', async () => {
      if (!fileInput.files) return;

      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        if (file.size > 10 * 1024 * 1024) {
          ToastComponent.show('Image size exceeds 10MB limit', 'warning');
          continue;
        }

        const base64 = await this.fileToBase64(file);
        this.attachedImages.push({
          name: file.name,
          mimeType: file.type,
          data: base64,
          size: file.size
        });
      }

      fileInput.value = '';
      this.render();
      const newTextarea = this.container.querySelector('#promptInput') as HTMLTextAreaElement;
      newTextarea?.focus();
    });

    // Remove attachments
    this.container.querySelectorAll('.remove-attach-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
        this.attachedImages.splice(idx, 1);
        this.render();
      });
    });
  }

  private submit(): void {
    const textarea = this.container.querySelector('#promptInput') as HTMLTextAreaElement;
    if (!textarea) return;

    const text = textarea.value.trim();
    if (!text && this.attachedImages.length === 0) return;

    const images = [...this.attachedImages];
    textarea.value = '';
    this.attachedImages = [];
    this.autoResize(textarea);
    this.render();

    this.onSend(text, images);
  }

  private autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
