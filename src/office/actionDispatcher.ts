import { HostDetector } from './hostDetector.ts';
import { WordService } from './wordService.ts';
import { ExcelService } from './excelService.ts';
import { PowerPointService } from './powerpointService.ts';
import { extractImageUrl } from '../utils/clipboard.ts';

export class ActionDispatcher {
  /**
   * Parse markdown table into 2D array
   */
  static parseMarkdownTable(text: string): string[][] | null {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|'));
    if (lines.length < 2) return null;

    const rows: string[][] = [];
    for (const line of lines) {
      // Skip separator lines like |---|---|
      if (/^\|[\s\-:|]+\|$/.test(line)) continue;

      const cells = line
        .slice(1, -1)
        .split('|')
        .map(c => c.replace(/&nbsp;/gi, ' ').trim());
      rows.push(cells);
    }

    return rows.length > 0 ? rows : null;
  }

  /**
   * Extract potential Excel formula from response text
   */
  static extractFormula(text: string): string | null {
    // Look for code blocks or inline formulas starting with =
    const codeBlockMatch = text.match(/```(?:excel|formula)?\s*(=[^\n`]+)```/i);
    if (codeBlockMatch) return codeBlockMatch[1].trim();

    const inlineMatch = text.match(/`(=[A-Z0-9_]+(?:\([^`]+\))?)`/i);
    if (inlineMatch) return inlineMatch[1].trim();

    const standaloneMatch = text.match(/^\s*(=[A-Z_]+(?:\([^\n]+\))?)\s*$/m);
    if (standaloneMatch) return standaloneMatch[1].trim();

    return null;
  }

  /**
   * Insert response content into active Office document
   */
  static async insertContent(content: string, replaceSelection = false): Promise<{ success: boolean; message: string }> {
    const host = HostDetector.getHost();
    const imageUrl = extractImageUrl(content);

    try {
      // If content contains an image, insert as picture across any host
      if (imageUrl) {
        const res = await this.insertImage(imageUrl);
        return res;
      }

      if (host === 'Word') {
        const table = this.parseMarkdownTable(content);
        if (table && table.length > 1 && !replaceSelection) {
          const ok = await WordService.insertTable(table);
          return { success: ok, message: ok ? 'Inserted table into Word' : 'Failed to insert table' };
        }

        const ok = replaceSelection 
          ? await WordService.replaceSelection(content)
          : await WordService.insertText(content);
        return { 
          success: ok, 
          message: ok ? (replaceSelection ? 'Replaced selection in Word' : 'Inserted text into Word') : 'Insertion failed' 
        };
      }

      if (host === 'Excel') {
        // If content is a formula, insert as formula
        const formula = this.extractFormula(content);
        if (formula) {
          const ok = await ExcelService.insertFormula(formula);
          return { success: ok, message: ok ? `Inserted formula ${formula} into cell` : 'Failed to insert formula' };
        }

        // If content is a markdown table, insert as cell grid
        const table = this.parseMarkdownTable(content);
        if (table) {
          const ok = await ExcelService.insertData(table);
          return { success: ok, message: ok ? 'Inserted data grid into worksheet' : 'Failed to insert data' };
        }

        // Fallback: insert raw text
        const ok = await ExcelService.insertData([[content]]);
        return { success: ok, message: ok ? 'Inserted text into cell' : 'Failed to insert' };
      }

      if (host === 'PowerPoint') {
        const ok = await PowerPointService.insertText(content);
        return { success: ok, message: ok ? 'Inserted content into slide' : 'Failed to insert' };
      }

      return { success: true, message: 'Simulated insert (Standalone mode)' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Action failed' };
    }
  }

  /**
   * Explicitly insert an Excel formula
   */
  static async insertFormula(formula: string): Promise<{ success: boolean; message: string }> {
    const ok = await ExcelService.insertFormula(formula);
    return { success: ok, message: ok ? `Formula ${formula} inserted` : 'Failed to insert formula' };
  }

  /**
   * Create presentation slide from outline
   */
  static async createSlideFromText(content: string): Promise<{ success: boolean; message: string }> {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return { success: false, message: 'No content to create slide' };

    // Extract title (first line without markdown header symbol)
    const title = lines[0].replace(/^#+\s*/, '');
    const bullets = lines.slice(1).map(l => l.replace(/^[-*•]\s*/, ''));

    const ok = await PowerPointService.createSlide(title, bullets.length > 0 ? bullets : ['Key point']);
    return { success: ok, message: ok ? `Created new slide: "${title}"` : 'Failed to create slide' };
  }

  /**
   * Insert generated image into document
   */
  static async insertImage(base64Data: string): Promise<{ success: boolean; message: string }> {
    const host = HostDetector.getHost();
    let ok = false;

    if (host === 'Word') ok = await WordService.insertImage(base64Data);
    else if (host === 'Excel') ok = await ExcelService.insertImage(base64Data);
    else if (host === 'PowerPoint') ok = await PowerPointService.insertImage(base64Data);
    else ok = true;

    return { success: ok, message: ok ? `Image inserted into ${host}` : 'Failed to insert image' };
  }
}
