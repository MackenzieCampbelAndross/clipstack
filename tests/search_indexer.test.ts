import { describe, it, expect } from 'vitest';
import { SearchIndexer } from '../src/core/search_indexer';
import { ClipboardItem } from '../src/types';

describe('SearchIndexer', () => {
  const sampleItems: ClipboardItem[] = [
    {
      id: '1',
      type: 'CODE',
      content: 'import { useState } from "react";',
      sourceApp: 'VS Code',
      byteSize: 32,
      isPinned: false,
      isFavorite: false,
      category: 'DEVELOPMENT',
      tags: ['react', 'frontend'],
      isRedacted: false,
      contentHash: 'h_1',
      createdAt: 1000,
      lastUsedAt: 1000
    },
    {
      id: '2',
      type: 'COLOR',
      content: '#3b82f6',
      sourceApp: 'Figma',
      byteSize: 7,
      isPinned: true,
      isFavorite: true,
      category: 'DESIGN',
      tags: ['blue', 'tailwind'],
      isRedacted: false,
      contentHash: 'h_2',
      createdAt: 2000,
      lastUsedAt: 2000
    }
  ];

  it('filters items by content substring', () => {
    const results = SearchIndexer.filterItems(sampleItems, 'useState');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('1');
  });

  it('filters items by tags or source app', () => {
    const tagMatch = SearchIndexer.filterItems(sampleItems, 'tailwind');
    expect(tagMatch.length).toBe(1);
    expect(tagMatch[0].id).toBe('2');

    const appMatch = SearchIndexer.filterItems(sampleItems, 'VS Code');
    expect(appMatch.length).toBe(1);
    expect(appMatch[0].id).toBe('1');
  });

  it('identifies duplicates based on contentHash', () => {
    const index = SearchIndexer.findDuplicateIndex(sampleItems, 'h_2');
    expect(index).toBe(1);

    const nonExistent = SearchIndexer.findDuplicateIndex(sampleItems, 'h_99');
    expect(nonExistent).toBe(-1);
  });
});
