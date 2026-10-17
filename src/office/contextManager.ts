import { OfficeContextSummary, OfficeHostType } from '../providers/types.ts';
import { HostDetector } from './hostDetector.ts';
import { WordService } from './wordService.ts';
import { ExcelService } from './excelService.ts';
import { PowerPointService } from './powerpointService.ts';

export class ContextManager {
  static async getCurrentContext(mode: 'selection' | 'document' | 'none' = 'selection'): Promise<OfficeContextSummary> {
    const host = HostDetector.getHost();

    if (mode === 'none') {
      return { host, type: 'none', label: 'No doc context' };
    }

    try {
      if (host === 'Word') {
        if (mode === 'selection') {
          const selectedText = await WordService.getSelectedText();
          if (selectedText) {
            const words = selectedText.split(/\s+/).length;
            return {
              host,
              type: 'selection',
              label: `${words} words selected`,
              snippet: selectedText.slice(0, 150) + (selectedText.length > 150 ? '...' : ''),
              data: selectedText
            };
          }
        }

        // Document overview
        const doc = await WordService.getDocumentContext();
        if (doc.bodySnippet) {
          return {
            host,
            type: 'document',
            label: `${doc.wordCount || 0} words in document`,
            snippet: doc.bodySnippet.slice(0, 150) + '...',
            data: doc.bodySnippet
          };
        }
      }

      if (host === 'Excel') {
        const rangeData = await ExcelService.getSelectedRangeData();
        if (rangeData) {
          return {
            host,
            type: 'selection',
            label: `${rangeData.sheetName}!${rangeData.address} (${rangeData.rowCount}×${rangeData.colCount})`,
            snippet: `Range ${rangeData.address} (${rangeData.rowCount} rows, ${rangeData.colCount} cols)`,
            data: ExcelService.formatRangeForPrompt(rangeData)
          };
        }
      }

      if (host === 'PowerPoint') {
        const selectedText = await PowerPointService.getSelectedText();
        if (selectedText) {
          return {
            host,
            type: 'selection',
            label: `Selected slide text (${selectedText.length} chars)`,
            snippet: selectedText.slice(0, 150) + '...',
            data: selectedText
          };
        }
      }
    } catch (err) {
      console.warn('[ContextManager] Error retrieving context:', err);
    }

    return {
      host,
      type: 'none',
      label: `Ready (${host})`
    };
  }
}
