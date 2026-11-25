import { describe, it, expect } from 'vitest';
import { ContentDetector } from '../src/core/content_detector';
import { PrivacyFilter } from '../src/core/privacy_filter';
import { SnippetEngine } from '../src/core/snippet_engine';
import { SearchIndexer } from '../src/core/search_indexer';
import { ClipboardItem, PrivacyRule, SnippetExpansion } from '../src/types';

describe('ClipStack End-to-End System Integration', () => {
  it('executes full pipeline: snippet expansion, sensitive data redaction, classification, and deduplication', () => {
    const rules: PrivacyRule = {
      excludedApps: ['1Password', 'Bitwarden'],
      redactCreditCards: true,
      redactApiKeys: true,
      redactJwtTokens: true,
      autoPurgeDays: 30
    };

    const snippets: SnippetExpansion[] = [
      {
        id: 'snip-1',
        trigger: ':api_test:',
        replacement: 'Authorization: Bearer sk-live12345678901234567890',
        description: 'Test API header',
        category: 'DEVELOPMENT',
        createdAt: 1000
      }
    ];

    // 1. Text input with trigger token
    const input = 'Copying header :api_test: for debugging.';
    const expanded = SnippetEngine.expandText(input, snippets);
    expect(expanded).toContain('sk-live12345678901234567890');

    // 2. Privacy filter redacts raw API key
    const filterResult = PrivacyFilter.processContent(expanded, 'VS Code', rules);
    expect(filterResult.isExcluded).toBe(false);
    expect(filterResult.isRedacted).toBe(true);
    expect(filterResult.sanitizedContent).toContain('[REDACTED_API_KEY]');

    // 3. Content Type Classification
    const detectedType = ContentDetector.detectType(filterResult.sanitizedContent);
    expect(detectedType).toBe('TEXT');

    // 4. Item creation & Deduplication
    const hash = ContentDetector.hashContent(filterResult.sanitizedContent);
    const item: ClipboardItem = {
      id: 'clip-test',
      type: detectedType,
      content: filterResult.sanitizedContent,
      sourceApp: 'VS Code',
      byteSize: 45,
      isPinned: false,
      isFavorite: false,
      category: 'DEVELOPMENT',
      tags: ['api'],
      isRedacted: filterResult.isRedacted,
      contentHash: hash,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    };

    const index = SearchIndexer.findDuplicateIndex([item], hash);
    expect(index).toBe(0);
  });
});
