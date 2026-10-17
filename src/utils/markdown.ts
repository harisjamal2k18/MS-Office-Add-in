/**
 * Safe, lightweight markdown to HTML renderer
 */

/**
 * Decode common HTML entities back to characters so they survive
 * the escapeHtml pass and render correctly in the browser.
 * e.g. &nbsp; → \u00a0, &amp; → &, &lt; → <
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, '\u00a0')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Decode HTML entities first so they survive the escape pipeline
  // (e.g. AI may return &nbsp; between numbers in a worksheet table)
  let html = decodeHtmlEntities(markdown);

  // Code blocks (fenced)
  html = html.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escapedCode = escapeHtml(code.trim());
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        ${langLabel}
        <button class="copy-code-btn" data-code="${encodeURIComponent(code.trim())}">Copy</button>
      </div>
      <pre><code class="language-${lang || 'plaintext'}">${escapedCode}</code></pre>
    </div>`;
  });

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, (_match, code) => {
    return `<code class="inline-code">${escapeHtml(code)}</code>`;
  });

  // Markdown tables
  const tableRegex = /((?:\|[^\n]+\|\r?\n)+)/g;
  html = html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;

    let tableHtml = '<div class="table-responsive"><table class="markdown-table">';
    let isHeader = true;

    for (const line of lines) {
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) {
        isHeader = false;
        continue;
      }

      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());

      const tag = isHeader ? 'th' : 'td';
      tableHtml += '<tr>';
      for (const cell of cells) {
        // Decode entities before escaping so &nbsp; etc. render correctly
        tableHtml += `<${tag}>${escapeHtml(decodeHtmlEntities(cell))}</${tag}>`;
      }
      tableHtml += '</tr>';
    }

    tableHtml += '</table></div>';
    return tableHtml;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^\s*[-*•]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\((data:image\/[^)]+|https?:\/\/[^)]+)\)/g, (_match, alt, url) => {
    return `<div class="generated-image-card">
      <div class="image-wrapper">
        <img class="generated-image" src="${url}" alt="${escapeHtml(alt)}" loading="lazy" />
      </div>
      <div class="generated-image-footer">
        ${alt ? `<div class="image-prompt-caption" title="${escapeHtml(alt)}"><span class="caption-icon">🎨</span> <span>${escapeHtml(alt)}</span></div>` : '<div></div>'}
        <div class="image-card-actions">
          <button class="img-btn copy-card-img-btn" title="Copy image to clipboard (pastes directly into Word/Office)">📋 Copy Image</button>
          <button class="img-btn download-card-img-btn" data-img-name="${escapeHtml(alt || 'generated-image')}" title="Save image to computer">💾 Save</button>
        </div>
      </div>
    </div>`;
  });

  // Line breaks to <br> if not inside tags
  html = html.replace(/\n\n/g, '<p></p>');

  return html;
}
