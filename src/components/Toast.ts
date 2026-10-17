export class ToastComponent {
  private static container: HTMLElement | null = null;

  private static ensureContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  static show(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 3500): void {
    const parent = this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    `;

    if (type === 'success') {
      iconSvg = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      `;
    } else if (type === 'warning' || type === 'error') {
      iconSvg = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;

    if (type === 'error') {
      toast.style.borderColor = 'var(--error)';
      toast.style.color = '#fca5a5';
    } else if (type === 'warning') {
      toast.style.borderColor = 'var(--warning)';
      toast.style.color = '#fde68a';
    }

    parent.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
}
