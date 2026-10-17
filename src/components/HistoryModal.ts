import { ChatSession, StorageService } from '../services/storageService.ts';
import { ToastComponent } from './Toast.ts';

export class HistoryModalComponent {
  private container: HTMLElement;
  private isOpen = false;
  private onClose: () => void;
  private onLoadSession: (session: ChatSession) => void;

  constructor(
    container: HTMLElement,
    callbacks: { onClose: () => void; onLoadSession: (session: ChatSession) => void }
  ) {
    this.container = container;
    this.onClose = callbacks.onClose;
    this.onLoadSession = callbacks.onLoadSession;
  }

  open(): void {
    this.isOpen = true;
    this.render();
  }

  close(): void {
    this.isOpen = false;
    this.render();
    this.onClose();
  }

  render(): void {
    const sessions = StorageService.getChatSessions();

    this.container.innerHTML = `
      <div class="modal-overlay ${this.isOpen ? 'open' : ''}" id="historyOverlay">
        <div class="modal-drawer">
          <div class="modal-header">
            <span class="modal-title">Conversation History</span>
            <button class="icon-btn" id="closeHistoryBtn" title="Close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <input type="text" class="form-input" id="searchHistoryInput" placeholder="Search conversations..." />
            </div>

            <div id="historyList" style="display: flex; flex-direction: column; gap: 8px;">
              ${this.renderSessionItems(sessions)}
            </div>

            ${sessions.length > 0 ? `
              <div style="margin-top: auto; padding-top: 10px;">
                <button class="btn-secondary" id="clearAllChatsBtn" style="width: 100%; color: var(--error);">
                  Clear All History
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(sessions);
  }

  private renderSessionItems(sessions: ChatSession[]): string {
    if (sessions.length === 0) {
      return '<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">No saved conversations yet.</div>';
    }

    return sessions.map(s => {
      const dateStr = new Date(s.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="history-item" data-id="${s.id}">
          <div class="history-item-header">
            <span class="history-item-title">${s.title || 'Conversation'}</span>
            <button class="icon-btn delete-chat-btn" data-id="${s.id}" title="Delete conversation" style="width: 20px; height: 20px;">✕</button>
          </div>
          <div class="history-item-date">${dateStr} • ${s.messages.length} messages</div>
        </div>
      `;
    }).join('');
  }

  private attachEventListeners(sessions: ChatSession[]): void {
    const overlay = this.container.querySelector('#historyOverlay');
    const closeBtn = this.container.querySelector('#closeHistoryBtn');
    const clearBtn = this.container.querySelector('#clearAllChatsBtn');
    const searchInput = this.container.querySelector('#searchHistoryInput') as HTMLInputElement;

    closeBtn?.addEventListener('click', () => this.close());
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    clearBtn?.addEventListener('click', () => {
      // Inline confirm — window.confirm is blocked in Office Add-in context
      const existingConfirm = this.container.querySelector('#clearAllConfirm');
      if (existingConfirm) { existingConfirm.remove(); return; }

      const confirmEl = document.createElement('div');
      confirmEl.id = 'clearAllConfirm';
      confirmEl.innerHTML = `
        <div style="background:var(--surface-2,#2a2a3a);border:1px solid var(--danger,#ef4444);border-radius:8px;padding:10px 14px;margin-top:8px;display:flex;gap:10px;align-items:center;font-size:13px;color:var(--text-primary,#fff);">
          <span style="flex:1">Clear all history? This cannot be undone.</span>
          <button id="clearConfirmYes" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;">Clear</button>
          <button id="clearConfirmNo" style="background:var(--surface-3,#3a3a4a);color:var(--text-primary,#fff);border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;">Cancel</button>
        </div>`;

      clearBtn!.insertAdjacentElement('afterend', confirmEl);

      confirmEl.querySelector('#clearConfirmYes')?.addEventListener('click', () => {
        StorageService.clearAllChats();
        confirmEl.remove();
        ToastComponent.show('All conversation history cleared.', 'warning');
        this.render();
      });
      confirmEl.querySelector('#clearConfirmNo')?.addEventListener('click', () => confirmEl.remove());
    });

    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = sessions.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some(m => m.content.toLowerCase().includes(q))
      );
      const listEl = this.container.querySelector('#historyList');
      if (listEl) {
        listEl.innerHTML = this.renderSessionItems(filtered);
        this.attachItemClicks(filtered);
      }
    });

    this.attachItemClicks(sessions);
  }

  private attachItemClicks(sessions: ChatSession[]): void {
    this.container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Ignore if delete button was clicked
        if ((e.target as HTMLElement).classList.contains('delete-chat-btn')) return;

        const id = (item as HTMLElement).dataset.id;
        const session = sessions.find(s => s.id === id);
        if (session) {
          this.onLoadSession(session);
          this.close();
        }
      });
    });

    this.container.querySelectorAll('.delete-chat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.id;
        if (id) {
          StorageService.deleteChatSession(id);
          this.render();
        }
      });
    });
  }
}
