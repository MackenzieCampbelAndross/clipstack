import { describe, it, expect } from 'vitest';
import { SnippetEngine } from '../src/core/snippet_engine';
import { SnippetExpansion } from '../src/types';

describe('SnippetEngine', () => {
  const sampleSnippets: SnippetExpansion[] = [
    {
      id: 's1',
      trigger: ':email:',
      replacement: 'test@example.com',
      description: 'Test email',
      category: 'SNIPPETS',
      createdAt: 1000
    },
    {
      id: 's2',
      trigger: ':shrug:',
      replacement: '¯\\_(ツ)_/¯',
      description: 'Shrug',
      category: 'SNIPPETS',
      createdAt: 1000
    }
  ];

  it('expands registered trigger tokens in text', () => {
    const input = 'Send your resume to :email: for review :shrug:';
    const expanded = SnippetEngine.expandText(input, sampleSnippets);

    expect(expanded).toContain('test@example.com');
    expect(expanded).toContain('¯\\_(ツ)_/¯');
    expect(expanded).not.toContain(':email:');
  });

  it('finds exact trigger matches', () => {
    const found = SnippetEngine.findExactTrigger(':email:', sampleSnippets);
    expect(found).toBeDefined();
    expect(found?.replacement).toBe('test@example.com');

    const notFound = SnippetEngine.findExactTrigger(':unknown:', sampleSnippets);
    expect(notFound).toBeNull();
  });
});
