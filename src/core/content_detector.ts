import { ClipContentType } from '../types';

export class ContentDetector {
  /**
   * Determine the content type of a clipboard string.
   */
  static detectType(content: string): ClipContentType {
    const trimmed = content.trim();

    // 1. Data URL Image check
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('<svg') || trimmed.endsWith('.png') || trimmed.endsWith('.jpg')) {
      if (trimmed.startsWith('data:image/') || trimmed.startsWith('<svg')) {
        return 'IMAGE';
      }
    }

    // 2. Color code check
    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    const rgbRegex = /^rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i;
    const hslRegex = /^hsla?\s*\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(?:,\s*[\d.]+\s*)?\)$/i;

    if (hexRegex.test(trimmed) || rgbRegex.test(trimmed) || hslRegex.test(trimmed)) {
      return 'COLOR';
    }

    // 3. URL check
    const urlRegex = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (urlRegex.test(trimmed)) {
      return 'URL';
    }

    // 4. Code snippet check
    if (this.isCodeSnippet(trimmed)) {
      return 'CODE';
    }

    return 'TEXT';
  }

  private static isCodeSnippet(text: string): boolean {
    const codePatterns = [
      /\b(?:const|let|var|function|return|class|interface|type|import|export|from|async|await)\b/,
      /\b(?:def|elif|lambda|self|import|print)\b/,
      /\b(?:public|private|protected|static|void|struct|enum)\b/,
      /\b(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/,
      /=>/,
      /[=;{}()]{1,}/,
      /<\/?[a-z][\s\S]*>/i // HTML tags
    ];

    let matchCount = 0;
    for (const pattern of codePatterns) {
      if (pattern.test(text)) {
        matchCount++;
      }
    }

    const hasIndentation = /^[ \t]+[^\s]/m.test(text);
    return matchCount >= 2 || (matchCount >= 1 && (text.includes('\n') || hasIndentation || text.endsWith(';')));
  }

  /**
   * Fast 32-bit string hashing for deduplication.
   */
  static hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
}
