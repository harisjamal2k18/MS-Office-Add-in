declare const PowerPoint: any;
declare const Office: any;

export interface SlideOutlineItem {
  title: string;
  bullets: string[];
  notes?: string;
}

export class PowerPointService {
  /**
   * Get selected text from slide shape
   */
  static async getSelectedText(): Promise<string> {
    if (typeof Office === 'undefined' || !Office.context || !Office.context.document) {
      return '';
    }

    return new Promise((resolve) => {
      Office.context.document.getSelectedDataAsync(
        Office.CoercionType.Text,
        (result: any) => {
          if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
            resolve(String(result.value).trim());
          } else {
            resolve('');
          }
        }
      );
    });
  }

  /**
   * Insert or replace text in current shape
   */
  static async insertText(text: string): Promise<boolean> {
    if (typeof Office === 'undefined' || !Office.context || !Office.context.document) {
      console.log('[PowerPointService Mock] Insert text:', text);
      return true;
    }

    return new Promise((resolve) => {
      Office.context.document.setSelectedDataAsync(
        text,
        { coercionType: Office.CoercionType.Text },
        (result: any) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve(true);
          } else {
            console.error('[PowerPointService] insertText error:', result.error);
            resolve(false);
          }
        }
      );
    });
  }

  /**
   * Insert a new slide with Title and Bulleted items using PowerPoint.run
   */
  static async createSlide(title: string, bullets: string[]): Promise<boolean> {
    if (typeof PowerPoint !== 'undefined' && PowerPoint.run) {
      try {
        return await PowerPoint.run(async (context: any) => {
          const presentation = context.presentation;
          const slides = presentation.slides;
          
          // Add slide
          const slide = slides.add();
          
          // Add Title shape
          const titleShape = slide.shapes.addTextBox(title, {
            left: 50,
            top: 50,
            width: 600,
            height: 80
          });
          titleShape.textFrame.textRange.font.size = 28;
          titleShape.textFrame.textRange.font.bold = true;

          // Add Bullets body shape
          const bulletText = bullets.map(b => `• ${b}`).join('\n');
          const bodyShape = slide.shapes.addTextBox(bulletText, {
            left: 50,
            top: 150,
            width: 620,
            height: 350
          });
          bodyShape.textFrame.textRange.font.size = 18;

          await context.sync();
          return true;
        });
      } catch (err) {
        console.warn('[PowerPointService] PowerPoint.run createSlide fallback:', err);
      }
    }

    // Fallback: insert formatted outline into current slide
    const content = `${title}\n\n` + bullets.map(b => `• ${b}`).join('\n');
    return this.insertText(content);
  }

  /**
   * Insert image into slide
   */
  static async insertImage(base64Data: string): Promise<boolean> {
    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    if (typeof Office === 'undefined' || !Office.context || !Office.context.document) {
      console.log('[PowerPointService Mock] Insert image');
      return true;
    }

    return new Promise((resolve) => {
      Office.context.document.setSelectedDataAsync(
        cleanBase64,
        { coercionType: Office.CoercionType.Image },
        (result: any) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve(true);
          } else {
            console.error('[PowerPointService] insertImage error:', result.error);
            resolve(false);
          }
        }
      );
    });
  }
}
