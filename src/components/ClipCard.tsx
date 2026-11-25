import React, { useState } from 'react';
import { ClipboardItem } from '../types';
import { useClipStore } from '../core/clip_store';
import { Copy, Check, Pin, Star, Trash2, Code2, Link, Palette, FileText, ShieldAlert, Monitor } from 'lucide-react';

interface ClipCardProps {
  clip: ClipboardItem;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip }) => {
  const { togglePin, toggleFavorite, deleteClip, copyClip } = useClipStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyClip(clip.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const renderContent = () => {
    switch (clip.type) {
      case 'COLOR':
        return (
          <div className="flex items-center space-x-3 py-1">
            <div
              className="w-10 h-10 rounded-xl border border-white/20 shadow-md shrink-0 transition-transform hover:scale-110"
              style={{ backgroundColor: clip.content }}
            />
            <div>
              <span className="font-mono font-bold text-sm text-slate-100">{clip.content}</span>
              <p className="text-[10px] text-slate-400">Color Swatch (Hex / CSS)</p>
            </div>
          </div>
        );

      case 'URL':
        return (
          <div className="flex items-center space-x-2 py-1">
            <Link className="w-4 h-4 text-cyan-400 shrink-0" />
            <a
              href={clip.content}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200 hover:underline break-all"
            >
              {clip.content}
            </a>
          </div>
        );

      case 'CODE':
        return (
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto max-h-36 leading-relaxed">
            <pre className="whitespace-pre-wrap">{clip.content}</pre>
          </div>
        );

      case 'TEXT':
      default:
        return (
          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap line-clamp-4">
            {clip.content}
          </p>
        );
    }
  };

  const getTypeIcon = () => {
    switch (clip.type) {
      case 'CODE':
        return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'COLOR':
        return <Palette className="w-3.5 h-3.5 text-pink-400" />;
      case 'URL':
        return <Link className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 group ${
      clip.isPinned
        ? 'bg-purple-950/20 border-purple-500/50 shadow-lg shadow-purple-950/20'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
    }`}>
      <div>
        {/* Top Meta Header */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              {getTypeIcon()}
            </span>
            <span className="font-semibold text-[11px] text-slate-300 uppercase tracking-wider">
              {clip.type}
            </span>
            {clip.sourceApp && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                <Monitor className="w-3 h-3 text-slate-500" />
                {clip.sourceApp}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleFavorite(clip.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                clip.isFavorite ? 'text-amber-400 bg-amber-950/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={clip.isFavorite ? 'Favorited' : 'Add to Favorites'}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              onClick={() => togglePin(clip.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                clip.isPinned ? 'text-purple-400 bg-purple-950/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={clip.isPinned ? 'Unpin clip' : 'Pin clip to top'}
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Redacted Banner */}
        {clip.isRedacted && (
          <div className="mb-2 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[10px] text-rose-300 flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>Sensitive tokens automatically masked for privacy</span>
          </div>
        )}

        {/* Content Body */}
        <div className="mt-1">{renderContent()}</div>

        {/* Tags */}
        {clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {clip.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span>{clip.byteSize} bytes</span>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={() => deleteClip(clip.id)}
            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
            title="Delete from history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
