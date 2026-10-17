/**
 * Clipboard & image handling utilities for Office Add-in
 */

/**
 * Extract image URL or base64 data URI from content string
 */
export function extractImageUrl(content: string): string | null {
  if (!content) return null;

  // Markdown image syntax: ![alt](url)
  const mdMatch = content.match(/!\[[^\]]*\]\(((?:data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)|https?:\/\/[^\s)]+)\)/i);
  if (mdMatch) return mdMatch[1];

  // Raw base64 data URI
  const rawMatch = content.match(/(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/i);
  if (rawMatch) return rawMatch[1];

  // HTML img tag
  const htmlMatch = content.match(/<img[^>]+src=["']((?:data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)|https?:\/\/[^\s"']+)["']/i);
  if (htmlMatch) return htmlMatch[1];

  return null;
}

/**
 * Convert any image (data URI or web URL) into an image/png Blob using canvas.
 * Note: The Async Clipboard API requires image/png format for ClipboardItem.
 */
export async function imageSourceToPngBlob(src: string): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 512;
        canvas.height = img.naturalHeight || img.height || 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate PNG blob from canvas'));
          }
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(new Error('Failed to load image for clipboard conversion: ' + err));
    img.src = src;
  });
}

/**
 * Copy an image directly to the system clipboard as a real image (image/png).
 * When pasted into Microsoft Word, PowerPoint, Excel, or other apps,
 * it will be pasted as an inline picture, NOT as raw markdown or base64 text.
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    const pngBlob = await imageSourceToPngBlob(imageUrl);
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': pngBlob
        })
      ]);
      return true;
    }
  } catch (err) {
    console.error('[Clipboard] Failed to copy image to clipboard:', err);
  }
  return false;
}

/**
 * Download an image file locally
 */
export function downloadImage(imageUrl: string, filename = 'generated-image.png'): void {
  try {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('[Clipboard] Failed to download image:', err);
  }
}

/**
 * Clean text for clipboard copy:
 * - Replaces markdown image tags with clean alt text (preventing 600KB base64 dumps)
 * - Decodes HTML entities like &nbsp; into clean whitespace
 */
export function sanitizeTextForCopy(text: string): string {
  if (!text) return '';
  return text
    .replace(/!\[([^\]]*)\]\((?:data:image\/[^)]+|https?:\/\/[^)]+)\)/g, (_match, alt) => {
      return alt ? `[Image: ${alt}]` : '[Image]';
    })
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}
