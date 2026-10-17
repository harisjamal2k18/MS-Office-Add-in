declare const Word: any;
declare const Office: any;

export class WordService {
  /**
   * Get selected text from Word document
   */
  static async getSelectedText(): Promise<string> {
    if (typeof Word === 'undefined' || !Office.context) {
      return ''; // Standalone fallback
    }

    try {
      return await Word.run(async (context: any) => {
        const selection = context.document.getSelection();
        selection.load('text');
        await context.sync();
        return selection.text ? selection.text.trim() : '';
      });
    } catch (err) {
      console.warn('[WordService] getSelectedText error:', err);
      return '';
    }
  }

  /**
   * Get document outline / initial text for context
   */
  static async getDocumentContext(): Promise<{ title?: string; bodySnippet?: string; wordCount?: number }> {
    if (typeof Word === 'undefined' || !Office.context) {
      return { bodySnippet: 'Sample Word document preview context.' };
    }

    try {
      return await Word.run(async (context: any) => {
        const body = context.document.body;
        body.load('text');
        await context.sync();

        const fullText = body.text || '';
        const lines = fullText.split('\n').filter((l: string) => l.trim().length > 0);
        const title = lines[0] ? lines[0].slice(0, 100) : 'Untitled Document';
        const snippet = fullText.slice(0, 3000); // 3000 char preview
        const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;

        return { title, bodySnippet: snippet, wordCount };
      });
    } catch (err) {
      console.warn('[WordService] getDocumentContext error:', err);
      return {};
    }
  }

  /**
   * Insert text at cursor / selection
   */
  static async insertText(text: string, replace = false): Promise<boolean> {
    if (typeof Word === 'undefined' || !Office.context) {
      console.log(`[WordService Mock] Insert text (replace=${replace}):`, text);
      return true;
    }

    try {
      await Word.run(async (context: any) => {
        const selection = context.document.getSelection();
        const location = replace ? Word.InsertLocation.replace : Word.InsertLocation.after;
        selection.insertText(text, location);
        await context.sync();
      });
      return true;
    } catch (err) {
      console.error('[WordService] insertText failed:', err);
      return false;
    }
  }

  /**
   * Replace current selection
   */
  static async replaceSelection(text: string): Promise<boolean> {
    return this.insertText(text, true);
  }

  /**
   * Insert markdown table or 2D matrix as native Word Table
   */
  static async insertTable(matrix: string[][]): Promise<boolean> {
    if (matrix.length === 0 || matrix[0].length === 0) return false;

    if (typeof Word === 'undefined' || !Office.context) {
      console.log('[WordService Mock] Insert native table:', matrix);
      return true;
    }

    try {
      await Word.run(async (context: any) => {
        const selection = context.document.getSelection();
        const rows = matrix.length;
        const cols = matrix[0].length;

        const table = selection.insertTable(rows, cols, Word.InsertLocation.after, matrix);
        table.styleBuiltIn = Word.Style.gridTable4_Accent1;
        table.headerRowCount = 1;
        await context.sync();
      });
      return true;
    } catch (err) {
      console.error('[WordService] insertTable failed:', err);
      // Fallback: insert as formatted text
      return this.insertText(matrix.map(row => row.join('\t')).join('\n'));
    }
  }

  /**
   * Insert image from base64
   */
  static async insertImage(base64Data: string): Promise<boolean> {
    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    if (typeof Word === 'undefined' || !Office.context) {
      console.log('[WordService Mock] Insert image');
      return true;
    }

    try {
      await Word.run(async (context: any) => {
        const selection = context.document.getSelection();
        selection.insertInlinePictureFromBase64(cleanBase64, Word.InsertLocation.after);
        await context.sync();
      });
      return true;
    } catch (err) {
      console.error('[WordService] insertImage failed:', err);
      return false;
    }
  }
}
