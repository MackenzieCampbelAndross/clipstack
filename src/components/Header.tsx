import React from 'react';
import { useClipStore } from '../core/clip_store';
import { ClipCategory } from '../types';
import { Search, Pin, Star, Shield, Command, Plus, Scissors } from 'lucide-react';

interface HeaderProps {
  onOpenNewClip: () => void;
  onOpenSnippets: () => void;
  onOpenPrivacy: () => void;
}

const CATEGORIES: Array<{ key: ClipCategory | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'All Clips' },
  { key: 'DEVELOPMENT', label: 'Code & Dev' },
  { key: 'DESIGN', label: 'Design & Colors' },
  { key: 'RESEARCH', label: 'Links & Research' },
  { key: 'SNIPPETS', label: 'Expansions' }
];

export const Header: React.FC<HeaderProps> = ({
  onOpenNewClip,
  onOpenSnippets,
  onOpenPrivacy
}) => {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    showPinnedOnly,
    setShowPinnedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
    items
  } = useClipStore();

  const pinnedCount = items.filter((i) => i.isPinned).length;
  const favCount = items.filter((i) => i.isFavorite).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-purple-900/30 px-6 py-4 space-y-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                ClipStack
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Desktop Clipboard Manager with Sensitive Redaction</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative flex-1 max-w-lg w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clips by content, tags, code syntax or source app..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={onOpenSnippets}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Manage Snippet Expansions"
          >
            <Command className="w-3.5 h-3.5 text-purple-400" />
            <span>Snippets</span>
          </button>

          <button
            onClick={onOpenPrivacy}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Privacy Exclusions & Auto-Purge Settings"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy</span>
          </button>

          <button
            onClick={onOpenNewClip}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Clip</span>
          </button>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeCategory === cat.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-medium transition-all ${
              showPinnedOnly
                ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pin className="w-3 h-3 fill-current" />
            <span>Pinned ({pinnedCount})</span>
          </button>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-medium transition-all ${
              showFavoritesOnly
                ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Favorites ({favCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
