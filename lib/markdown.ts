import { marked } from 'marked';

let blankCounter = 0;

export function resetBlankCounter() {
  blankCounter = 0;
}

export function parseMarkdown(content: string): string {
  resetBlankCounter();

  // Custom renderer
  const renderer = new marked.Renderer();

  marked.setOptions({ breaks: true });

  // Process blanks {{word}} - replace with placeholder first
  const blanks: string[] = [];
  let processed = content.replace(/\{\{([^}]+)\}\}/g, (_, word) => {
    blanks.push(word);
    return `BLANK_PLACEHOLDER_${blanks.length - 1}_END`;
  });

  // Process ==highlight==
  processed = processed.replace(/==([^=]+)==/g, (_, text) => {
    return `<mark class="highlight">${text}</mark>`;
  });

  // Parse markdown
  let html = marked.parse(processed) as string;

  // Replace placeholders with actual blank elements
  html = html.replace(/BLANK_PLACEHOLDER_(\d+)_END/g, (_, idx) => {
    const word = blanks[parseInt(idx)];
    const num = parseInt(idx) + 1;
    const firstChar = word.charAt(0);
    return `<span class="blank" data-word="${encodeURIComponent(word)}" data-num="${num}" data-state="0" data-first="${encodeURIComponent(firstChar)}">
      <span class="blank-display">[&nbsp;${num}&nbsp;]</span>
    </span>`;
  });

  void renderer;
  return html;
}
