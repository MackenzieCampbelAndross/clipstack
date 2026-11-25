import { SnippetExpansion } from '../types';

export class SnippetEngine {
  /**
   * Search an input string for registered trigger tokens and expand them.
   */
  static expandText(input: string, snippets: SnippetExpansion[]): string {
    let result = input;
    for (const snippet of snippets) {
      if (snippet.trigger && result.includes(snippet.trigger)) {
        result = result.split(snippet.trigger).join(snippet.replacement);
      }
    }
    return result;
  }

  /**
   * Check if a string exactly equals a snippet trigger.
   */
  static findExactTrigger(triggerToken: string, snippets: SnippetExpansion[]): SnippetExpansion | null {
    const trimmed = triggerToken.trim();
    return snippets.find((s) => s.trigger === trimmed) || null;
  }

  /**
   * Generate default starter snippets.
   */
  static getBuiltinSnippets(): SnippetExpansion[] {
    return [
      {
        id: 'snip-1',
        trigger: ':shrug:',
        replacement: '¯\\_(ツ)_/¯',
        description: 'Shrug ascii emoji',
        category: 'SNIPPETS',
        createdAt: Date.now()
      },
      {
        id: 'snip-2',
        trigger: ':email:',
        replacement: 'mackenzieandross@gmail.com',
        description: 'Default contact email',
        category: 'SNIPPETS',
        createdAt: Date.now()
      },
      {
        id: 'snip-3',
        trigger: ':todo:',
        replacement: '// TODO: Implement remaining edge cases and write regression tests',
        description: 'Standard code TODO comment',
        category: 'DEVELOPMENT',
        createdAt: Date.now()
      }
    ];
  }
}
