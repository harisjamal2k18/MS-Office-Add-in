import { ExcelRangeData } from '../providers/types.ts';

declare const Excel: any;
declare const Office: any;

export class ExcelService {
  /**
   * Read the currently selected range, its values, formulas, and dimensions
   */
  static async getSelectedRangeData(): Promise<ExcelRangeData | null> {
    if (typeof Excel === 'undefined' || !Office.context) {
      return null;
    }

    try {
      return await Excel.run(async (context: any) => {
        const range = context.workbook.getSelectedRange();
        range.load(['address', 'values', 'formulas', 'rowCount', 'columnCount', 'worksheet']);
        await context.sync();

        const sheet = range.worksheet;
        sheet.load('name');
        await context.sync();

        // Limit values to first 50 rows / 20 cols to prevent giant prompt payloads
        const maxRows = Math.min(range.rowCount, 50);
        const maxCols = Math.min(range.columnCount, 20);

        const slicedValues = range.values.slice(0, maxRows).map((row: any[]) => row.slice(0, maxCols));
        const slicedFormulas = range.formulas.slice(0, maxRows).map((row: any[]) => row.slice(0, maxCols));

        return {
          address: range.address,
          sheetName: sheet.name,
          rowCount: range.rowCount,
          colCount: range.columnCount,
          values: slicedValues,
          formulas: slicedFormulas
        };
      });
    } catch (err) {
      console.warn('[ExcelService] getSelectedRangeData error:', err);
      return null;
    }
  }

  /**
   * Format Excel range data into a structured readable prompt string for the AI
   */
  static formatRangeForPrompt(data: ExcelRangeData): string {
    const lines: string[] = [];
    lines.push(`Worksheet: "${data.sheetName}", Range: ${data.address} (${data.rowCount} rows × ${data.colCount} columns)`);
    lines.push('Data Table:');

    for (let r = 0; r < data.values.length; r++) {
      const rowVals = data.values[r].map((v, c) => {
        const formula = data.formulas[r]?.[c];
        if (typeof formula === 'string' && formula.startsWith('=')) {
          return `${v} [Formula: ${formula}]`;
        }
        return v === null || v === undefined ? '' : String(v);
      });
      lines.push(`| ${rowVals.join(' | ')} |`);
    }

    if (data.rowCount > 50) {
      lines.push(`(...and ${data.rowCount - 50} more rows truncated for context)`);
    }

    return lines.join('\n');
  }

  /**
   * Insert a formula into the currently selected cell
   */
  static async insertFormula(formula: string): Promise<boolean> {
    const cleanFormula = formula.trim().startsWith('=') ? formula.trim() : `=${formula.trim()}`;

    if (typeof Excel === 'undefined' || !Office.context) {
      console.log('[ExcelService Mock] Insert formula:', cleanFormula);
      return true;
    }

    try {
      await Excel.run(async (context: any) => {
        const range = context.workbook.getSelectedRange();
        range.formulas = [[cleanFormula]];
        await context.sync();
      });
      return true;
    } catch (err) {
      console.error('[ExcelService] insertFormula failed:', err);
      return false;
    }
  }

  /**
   * Insert 2D data matrix into Excel starting at current selection
   */
  static async insertData(matrix: any[][]): Promise<boolean> {
    if (!matrix || matrix.length === 0) return false;

    if (typeof Excel === 'undefined' || !Office.context) {
      console.log('[ExcelService Mock] Insert data matrix:', matrix);
      return true;
    }

    try {
      await Excel.run(async (context: any) => {
        const selected = context.workbook.getSelectedRange();
        selected.load(['rowIndex', 'columnIndex', 'worksheet']);
        await context.sync();

        const sheet = selected.worksheet;
        const targetRange = sheet.getRangeByIndexes(
          selected.rowIndex,
          selected.columnIndex,
          matrix.length,
          matrix[0].length
        );

        targetRange.values = matrix;
        targetRange.format.autofitColumns();
        await context.sync();
      });
      return true;
    } catch (err) {
      console.error('[ExcelService] insertData failed:', err);
      return false;
    }
  }

  /**
   * Insert image into worksheet
   */
  static async insertImage(base64Data: string): Promise<boolean> {
    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    if (typeof Excel === 'undefined' || !Office.context) {
      console.log('[ExcelService Mock] Insert image into Excel');
      return true;
    }

    try {
      await Excel.run(async (context: any) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        sheet.shapes.addImage(cleanBase64);
        await context.sync();
      });
      return true;
    } catch (err) {
      console.error('[ExcelService] insertImage failed:', err);
      return false;
    }
  }
}
