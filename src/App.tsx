import React, { useState, useMemo } from 'react';
import { useClipStore } from './core/clip_store';
import { SearchIndexer } from './core/search_indexer';
import { Header } from './components/Header';
import { ClipCard } from './components/ClipCard';
import { SnippetManager } from './components/SnippetManager';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { ManualClipInput } from './components/ManualClipInput';
import { Scissors, ClipboardPaste, Filter } from 'lucide-react';

export const App: React.FC = () => {
  const {
    items,
    searchQuery,
    activeCategory,
    activeTypeFilter,
    showPinnedOnly,
    showFavoritesOnly,
    clearHistory
  } = useClipStore();

  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);

  // Filter items
  const filteredClips = useMemo(() => {
    let result = SearchIndexer.filterItems(items, searchQuery);

    if (activeCategory !== 'ALL') {
      result = result.filter((i) => i.category === activeCategory);
    }

    if (activeTypeFilter !== 'ALL') {
      result = result.filter((i) => i.type === activeTypeFilter);
    }

    if (showPinnedOnly) {
      result = result.filter((i) => i.isPinned);
    }

    if (showFavoritesOnly) {
      result = result.filter((i) => i.isFavorite);
    }

    return result;
  }, [items, searchQuery, activeCategory, activeTypeFilter, showPinnedOnly, showFavoritesOnly]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNewClip={() => setIsManualInputOpen(true)}
        onOpenSnippets={() => setIsSnippetsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-5">
        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">
              Showing {filteredClips.length} {filteredClips.length === 1 ? 'item' : 'items'}
            </span>
            {searchQuery && (
              <span className="text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                Query: "{searchQuery}"
              </span>
            )}
          </div>

          <button
            onClick={clearHistory}
            className="text-slate-500 hover:text-rose-400 transition-colors"
          >
            Clear Unpinned History
          </button>
        </div>

        {/* Clips Grid */}
        {filteredClips.length === 0 ? (
          <div className="text-center py-20 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-purple-400">
              <Scissors className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-slate-200">No clipboard items found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Copy text, code, colors, or URLs anywhere on your desktop, or add a manual clip.
              </p>
            </div>
            <button
              onClick={() => setIsManualInputOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-purple-600/20 transition-all inline-flex items-center gap-1.5"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Capture Manual Clip</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-5 text-center text-xs text-slate-600 bg-slate-950/80">
        <p>ClipStack • Advanced Desktop Clipboard Manager • Autonomous Software Production Pipeline</p>
      </footer>

      {/* Modals */}
      <SnippetManager isOpen={isSnippetsOpen} onClose={() => setIsSnippetsOpen(false)} />
      <PrivacySettingsModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <ManualClipInput isOpen={isManualInputOpen} onClose={() => setIsManualInputOpen(false)} />
    </div>
  );
};

export default App;
