import { create } from 'zustand';
import {
  ClipboardItem,
  ClipCategory,
  ClipContentType,
  PrivacyRule,
  SnippetExpansion
} from '../types';
import { ContentDetector } from './content_detector';
import { PrivacyFilter } from './privacy_filter';
import { SnippetEngine } from './snippet_engine';
import { SearchIndexer } from './search_indexer';

interface ClipStore {
  items: ClipboardItem[];
  searchQuery: string;
  activeCategory: ClipCategory | 'ALL';
  activeTypeFilter: ClipContentType | 'ALL';
  showPinnedOnly: boolean;
  showFavoritesOnly: boolean;
  privacyRules: PrivacyRule;
  snippets: SnippetExpansion[];

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveCategory: (cat: ClipCategory | 'ALL') => void;
  setActiveTypeFilter: (type: ClipContentType | 'ALL') => void;
  setShowPinnedOnly: (pinned: boolean) => void;
  setShowFavoritesOnly: (fav: boolean) => void;

  // Clip CRUD & Operations
  addClip: (content: string, sourceApp?: string, category?: ClipCategory, tags?: string[]) => boolean;
  deleteClip: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  copyClip: (id: string) => Promise<boolean>;
  clearHistory: () => void;
  purgeExpiredClips: () => number;

  // Snippet Operations
  addSnippet: (trigger: string, replacement: string, description?: string) => void;
  deleteSnippet: (id: string) => void;

  // Privacy & Settings
  updatePrivacyRules: (rules: Partial<PrivacyRule>) => void;
  exportHistory: () => string;
  importHistory: (jsonData: string) => boolean;
}

const INITIAL_RULES: PrivacyRule = {
  excludedApps: ['1Password', 'Bitwarden', 'KeePass', 'KeePassXC', 'BankingApp'],
  redactCreditCards: true,
  redactApiKeys: true,
  redactJwtTokens: true,
  autoPurgeDays: 30
};

const INITIAL_ITEMS: ClipboardItem[] = [
  {
    id: 'clip-1',
    type: 'CODE',
    content: 'const calculateMetrics = (data: number[]): number => data.reduce((a, b) => a + b, 0) / data.length;',
    previewText: 'const calculateMetrics = (data: number[])...',
    sourceApp: 'VS Code',
    byteSize: 94,
    isPinned: true,
    isFavorite: true,
    category: 'DEVELOPMENT',
    tags: ['typescript', 'math', 'helpers'],
    isRedacted: false,
    contentHash: ContentDetector.hashContent('const calculateMetrics = (data: number[]): number => data.reduce((a, b) => a + b, 0) / data.length;'),
    createdAt: Date.now() - 3600000,
    lastUsedAt: Date.now() - 3600000
  },
  {
    id: 'clip-2',
    type: 'COLOR',
    content: '#8b5cf6',
    previewText: '#8b5cf6 (Amethyst Purple)',
    sourceApp: 'Figma',
    byteSize: 7,
    isPinned: false,
    isFavorite: true,
    category: 'DESIGN',
    tags: ['brand', 'primary', 'color'],
    isRedacted: false,
    contentHash: ContentDetector.hashContent('#8b5cf6'),
    createdAt: Date.now() - 7200000,
    lastUsedAt: Date.now() - 7200000
  },
  {
    id: 'clip-3',
    type: 'URL',
    content: 'https://github.com/MackenzieCampbelAndross/clipstack',
    previewText: 'https://github.com/MackenzieCampbelAndross/clipstack',
    sourceApp: 'Chrome',
    byteSize: 52,
    isPinned: true,
    isFavorite: false,
    category: 'DEVELOPMENT',
    tags: ['github', 'repo'],
    isRedacted: false,
    contentHash: ContentDetector.hashContent('https://github.com/MackenzieCampbelAndross/clipstack'),
    createdAt: Date.now() - 14400000,
    lastUsedAt: Date.now() - 14400000
  }
];

export const useClipStore = create<ClipStore>((set, get) => ({
  items: INITIAL_ITEMS,
  searchQuery: '',
  activeCategory: 'ALL',
  activeTypeFilter: 'ALL',
  showPinnedOnly: false,
  showFavoritesOnly: false,
  privacyRules: INITIAL_RULES,
  snippets: SnippetEngine.getBuiltinSnippets(),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setActiveTypeFilter: (activeTypeFilter) => set({ activeTypeFilter }),
  setShowPinnedOnly: (showPinnedOnly) => set({ showPinnedOnly }),
  setShowFavoritesOnly: (showFavoritesOnly) => set({ showFavoritesOnly }),

  addClip: (content, sourceApp = 'Desktop', category = 'GENERAL', tags = []) => {
    if (!content || !content.trim()) return false;
    const { privacyRules, items, snippets } = get();

    // 1. Check snippet triggers
    const expanded = SnippetEngine.expandText(content, snippets);

    // 2. Privacy & Exclusions check
    const privacyResult = PrivacyFilter.processContent(expanded, sourceApp, privacyRules);
    if (privacyResult.isExcluded) {
      return false; // Silently excluded from protected app
    }

    const finalContent = privacyResult.sanitizedContent;
    const contentHash = ContentDetector.hashContent(finalContent);

    // 3. Deduplication check
    const existingIndex = SearchIndexer.findDuplicateIndex(items, contentHash);
    if (existingIndex !== -1) {
      // Promote existing item to the top
      const updated = [...items];
      const [existing] = updated.splice(existingIndex, 1);
      existing.lastUsedAt = Date.now();
      set({ items: [existing, ...updated] });
      return true;
    }

    const type = ContentDetector.detectType(finalContent);
    const newItem: ClipboardItem = {
      id: `clip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      content: finalContent,
      previewText: finalContent.length > 80 ? finalContent.slice(0, 80) + '...' : finalContent,
      sourceApp,
      byteSize: new Blob([finalContent]).size,
      isPinned: false,
      isFavorite: false,
      category,
      tags,
      isRedacted: privacyResult.isRedacted,
      contentHash,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    };

    set({ items: [newItem, ...items] });
    return true;
  },

  deleteClip: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },

  togglePin: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    }));
  },

  toggleFavorite: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    }));
  },

  copyClip: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return false;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(item.content);
      } catch {}
    }

    // Update lastUsedAt timestamp
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, lastUsedAt: Date.now() } : i
      )
    }));

    return true;
  },

  clearHistory: () => {
    // Retain pinned clips
    set((state) => ({ items: state.items.filter((i) => i.isPinned) }));
  },

  purgeExpiredClips: () => {
    const { items, privacyRules } = get();
    const purgeLimitMs = privacyRules.autoPurgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const retained = items.filter((item) => item.isPinned || now - item.createdAt < purgeLimitMs);
    const purgedCount = items.length - retained.length;
    set({ items: retained });
    return purgedCount;
  },

  addSnippet: (trigger, replacement, description = '') => {
    const newSnippet: SnippetExpansion = {
      id: `snip-${Date.now()}`,
      trigger: trigger.trim(),
      replacement: replacement.trim(),
      description,
      category: 'SNIPPETS',
      createdAt: Date.now()
    };
    set((state) => ({ snippets: [newSnippet, ...state.snippets] }));
  },

  deleteSnippet: (id) => {
    set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }));
  },

  updatePrivacyRules: (rules) => {
    set((state) => ({ privacyRules: { ...state.privacyRules, ...rules } }));
  },

  exportHistory: () => {
    const { items, snippets } = get();
    return JSON.stringify({ items, snippets, exportedAt: Date.now() }, null, 2);
  },

  importHistory: (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.items)) {
        set((state) => ({
          items: [...parsed.items, ...state.items],
          snippets: Array.isArray(parsed.snippets) ? [...parsed.snippets, ...state.snippets] : state.snippets
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}));
