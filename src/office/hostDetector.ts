import { OfficeHostType } from '../providers/types.ts';

declare const Office: any;

export class HostDetector {
  private static detectedHost: OfficeHostType | null = null;

  static getHost(): OfficeHostType {
    if (this.detectedHost) return this.detectedHost;

    if (typeof Office !== 'undefined' && Office.context && Office.context.host) {
      switch (Office.context.host) {
        case Office.HostType.Word:
          this.detectedHost = 'Word';
          break;
        case Office.HostType.Excel:
          this.detectedHost = 'Excel';
          break;
        case Office.HostType.PowerPoint:
          this.detectedHost = 'PowerPoint';
          break;
        default:
          this.detectedHost = 'Unknown';
      }
    } else {
      // Fallback for standalone browser testing / preview
      this.detectedHost = 'Word'; // Default to Word for testing
    }

    return this.detectedHost;
  }

  static isOfficeReady(): boolean {
    return typeof Office !== 'undefined' && typeof Office.context !== 'undefined';
  }
}
