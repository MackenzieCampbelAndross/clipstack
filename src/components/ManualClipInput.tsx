import React, { useState } from 'react';
import { useClipStore } from '../core/clip_store';
import { ClipCategory } from '../types';
import { X, ClipboardPaste, Plus } from 'lucide-react';

interface ManualClipInputProps {
  isOpen: boolean;
  onClose: () => void;
}

const APPS = ['VS Code', 'Chrome', 'Terminal', 'Figma', 'Slack', 'Notion'];

export const ManualClipInput: React.FC<ManualClipInputProps> = ({ isOpen, onClose }) => {
  const { addClip } = useClipStore();
  const [content, setContent] = useState('');
  const [sourceApp, setSourceApp] = useState('VS Code');
  const [category, setCategory] = useState<ClipCategory>('DEVELOPMENT');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    addClip(content, sourceApp, category, tags);
    setContent('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
            <ClipboardPaste className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Add Clipboard Entry</h2>
            <p className="text-xs text-slate-400">Simulate or manually capture text, code, colors, or links</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Clipboard Content</label>
            <textarea
              required
              rows={5}
              placeholder="Paste content here (e.g. code snippet, hex color #7c3aed, URL, or prose)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Source Application</label>
              <select
                value={sourceApp}
                onChange={(e) => setSourceApp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                {APPS.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClipCategory)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="DEVELOPMENT">Development</option>
                <option value="DESIGN">Design</option>
                <option value="RESEARCH">Research</option>
                <option value="GENERAL">General</option>
                <option value="SNIPPETS">Snippets</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. react, api, tailwind"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Capture to Stack</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
