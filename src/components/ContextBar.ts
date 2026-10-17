import { ContextManager } from '../office/contextManager.ts';
import { OfficeContextSummary } from '../providers/types.ts';

export class ContextBarComponent {
  private container: HTMLElement;
  private currentContext: OfficeContextSummary | null = null;
  private mode: 'selection' | 'document' | 'none' = 'selection';

  constructor(container: HTMLElement) {
    this.container = container;
    this.refresh();
  }

  getAttachedContext(): OfficeContextSummary | null {
    return this.mode === 'none' ? null : this.currentContext;
  }

  async refresh(): Promise<void> {
    this.currentContext = await ContextManager.getCurrentContext(this.mode);
    this.render();
  }

  setMode(mode: 'selection' | 'document' | 'none'): void {
    this.mode = mode;
    this.refresh();
  }

  render(): void {
    const hasData = this.currentContext && this.currentContext.type !== 'none' && this.mode !== 'none';
    const label = this.mode === 'none' 
      ? 'Context: Off' 
      : (this.currentContext?.label || 'Ready');

    this.container.innerHTML = `
      <div class="context-bar">
        <div class="context-info" title="${this.currentContext?.snippet || 'Office document context status'}">
          <span class="context-dot ${hasData ? '' : 'none'}"></span>
          <span>${label}</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="context-toggle-btn" id="refreshContextBtn" title="Refresh document context">
            ↻
          </button>
          <button class="context-toggle-btn" id="toggleContextModeBtn" title="Toggle context inclusion">
            ${this.mode === 'none' ? 'Enable' : 'Detach'}
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#refreshContextBtn')?.addEventListener('click', () => this.refresh());
    this.container.querySelector('#toggleContextModeBtn')?.addEventListener('click', () => {
      this.mode = this.mode === 'none' ? 'selection' : 'none';
      this.refresh();
    });
  }
}
