import React, { useState } from 'react';
import { useClipStore } from '../core/clip_store';
import { X, Command, Plus, Trash2, Zap } from 'lucide-react';

interface SnippetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SnippetManager: React.FC<SnippetManagerProps> = ({ isOpen, onClose }) => {
  const { snippets, addSnippet, deleteSnippet } = useClipStore();
  const [trigger, setTrigger] = useState('');
  const [replacement, setReplacement] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trigger.trim() || !replacement.trim()) return;

    addSnippet(trigger.trim(), replacement.trim(), description.trim());
    setTrigger('');
    setReplacement('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Snippet Expansion Manager</h2>
            <p className="text-xs text-slate-400">Define short trigger prefixes that automatically expand into full text</p>
          </div>
        </div>

        {/* Add Snippet Form */}
        <form onSubmit={handleAdd} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Trigger Token</label>
              <input
                type="text"
                required
                placeholder="e.g. :shrug: or :email:"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Work email address"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Expansion Text</label>
            <textarea
              required
              rows={2}
              placeholder="Full text that will replace the trigger token..."
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Snippet</span>
            </button>
          </div>
        </form>

        {/* Existing Snippets List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Active Snippets ({snippets.length})</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {snippets.map((snip) => (
              <div
                key={snip.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                      {snip.trigger}
                    </span>
                    <span className="text-slate-400 text-[11px]">{snip.description}</span>
                  </div>
                  <div className="text-slate-200 mt-1 line-clamp-1 font-mono text-[11px]">
                    → {snip.replacement}
                  </div>
                </div>

                <button
                  onClick={() => deleteSnippet(snip.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                  title="Delete snippet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
