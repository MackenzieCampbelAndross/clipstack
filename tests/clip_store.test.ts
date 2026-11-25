import { describe, it, expect, beforeEach } from 'vitest';
import { useClipStore } from '../src/core/clip_store';

describe('useClipStore', () => {
  beforeEach(() => {
    useClipStore.setState({
      items: [],
      searchQuery: '',
      activeCategory: 'ALL',
      showPinnedOnly: false,
      showFavoritesOnly: false
    });
  });

  it('adds items, classifies type, and ignores excluded apps', () => {
    const success = useClipStore.getState().addClip('const x = 10;', 'VS Code');
    expect(success).toBe(true);
    expect(useClipStore.getState().items.length).toBe(1);
    expect(useClipStore.getState().items[0].type).toBe('CODE');

    // 1Password exclusion
    const blocked = useClipStore.getState().addClip('secret123', '1Password');
    expect(blocked).toBe(false);
    expect(useClipStore.getState().items.length).toBe(1); // Not added!
  });

  it('promotes duplicate items to top without creating duplicate rows', () => {
    useClipStore.getState().addClip('Unique Note 1');
    useClipStore.getState().addClip('Unique Note 2');
    expect(useClipStore.getState().items.length).toBe(2);

    // Re-adding Note 1
    useClipStore.getState().addClip('Unique Note 1');
    expect(useClipStore.getState().items.length).toBe(2);
    expect(useClipStore.getState().items[0].content).toBe('Unique Note 1');
  });

  it('manages pinned, favorite, and delete states', () => {
    useClipStore.getState().addClip('Sample text');
    const id = useClipStore.getState().items[0].id;

    useClipStore.getState().togglePin(id);
    expect(useClipStore.getState().items[0].isPinned).toBe(true);

    useClipStore.getState().toggleFavorite(id);
    expect(useClipStore.getState().items[0].isFavorite).toBe(true);

    useClipStore.getState().deleteClip(id);
    expect(useClipStore.getState().items.length).toBe(0);
  });
});
