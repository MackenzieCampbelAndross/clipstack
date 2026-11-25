import { ClipboardItem } from '../types';

export class SearchIndexer {
  /**
   * Filter and rank clipboard items by fuzzy search query.
   */
  static filterItems(items: ClipboardItem[], query: string): ClipboardItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      // 1. Direct content match
      if (item.content.toLowerCase().includes(q)) return true;

      // 2. Tag match
      if (item.tags.some((t) => t.toLowerCase().includes(q))) return true;

      // 3. Category or Type match
      if (item.category.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)) return true;

      // 4. Source App match
      if (item.sourceApp && item.sourceApp.toLowerCase().includes(q)) return true;

      return false;
    });
  }

  /**
   * Deduplicate incoming item against existing history.
   * If found, returns index of existing item to promote to top.
   */
  static findDuplicateIndex(items: ClipboardItem[], contentHash: string): number {
    return items.findIndex((item) => item.contentHash === contentHash);
  }
}
