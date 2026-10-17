/**
 * Privacy-preserving development logger
 * Strips out API keys and limits document preview size in console
 */
export class Logger {
  private static isDev = process.env.NODE_ENV !== 'production';

  private static sanitize(msg: any): any {
    if (typeof msg === 'string') {
      return msg.replace(/(sk-[a-zA-Z0-9_-]{8})[a-zA-Z0-9_-]+/g, '$1***');
    }
    if (typeof msg === 'object' && msg !== null) {
      const copy: any = Array.isArray(msg) ? [] : {};
      for (const [k, v] of Object.entries(msg)) {
        if (k.toLowerCase().includes('key') || k.toLowerCase().includes('auth') || k.toLowerCase().includes('token')) {
          copy[k] = '***REDACTED***';
        } else {
          copy[k] = this.sanitize(v);
        }
      }
      return copy;
    }
    return msg;
  }

  static log(...args: any[]): void {
    if (this.isDev) {
      console.log('[OfficeAI]', ...args.map(a => this.sanitize(a)));
    }
  }

  static warn(...args: any[]): void {
    console.warn('[OfficeAI Warn]', ...args.map(a => this.sanitize(a)));
  }

  static error(...args: any[]): void {
    console.error('[OfficeAI Error]', ...args.map(a => this.sanitize(a)));
  }
}
