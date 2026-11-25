import React, { useState } from 'react';
import { useClipStore } from '../core/clip_store';
import { X, Shield, Plus, Trash2, Download, Upload, Check } from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    privacyRules,
    updatePrivacyRules,
    exportHistory,
    importHistory,
    purgeExpiredClips
  } = useClipStore();

  const [newExcludedApp, setNewExcludedApp] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExcludedApp.trim()) return;

    const updated = [...privacyRules.excludedApps, newExcludedApp.trim()];
    updatePrivacyRules({ excludedApps: updated });
    setNewExcludedApp('');
  };

  const handleRemoveApp = (app: string) => {
    const updated = privacyRules.excludedApps.filter((a) => a !== app);
    updatePrivacyRules({ excludedApps: updated });
  };

  const handleExport = () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipstack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const ok = importHistory(text);
      if (ok) {
        setImportStatus('History imported successfully!');
        setTimeout(() => setImportStatus(null), 2000);
      } else {
        setImportStatus('Invalid backup file.');
      }
    };
    reader.readAsText(file);
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
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Privacy & Security Policies</h2>
            <p className="text-xs text-slate-400">Configure excluded applications, auto-redaction, and retention</p>
          </div>
        </div>

        {/* Sensitive Auto-Redaction Rules */}
        <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
          <div className="font-semibold text-slate-200 uppercase tracking-wider mb-2">
            Sensitive Data Auto-Redaction
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300">Redact Credit Card Numbers (16-digits)</span>
            <input
              type="checkbox"
              checked={privacyRules.redactCreditCards}
              onChange={(e) => updatePrivacyRules({ redactCreditCards: e.target.checked })}
              className="rounded accent-purple-600 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300">Redact API Keys (sk-, ghp_, AWS AKIA)</span>
            <input
              type="checkbox"
              checked={privacyRules.redactApiKeys}
              onChange={(e) => updatePrivacyRules({ redactApiKeys: e.target.checked })}
              className="rounded accent-purple-600 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300">Redact JWT Auth Tokens</span>
            <input
              type="checkbox"
              checked={privacyRules.redactJwtTokens}
              onChange={(e) => updatePrivacyRules({ redactJwtTokens: e.target.checked })}
              className="rounded accent-purple-600 w-4 h-4"
            />
          </label>
        </div>

        {/* Excluded Apps */}
        <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
          <div className="font-semibold text-slate-200 uppercase tracking-wider">
            Excluded Applications (Never Monitored)
          </div>

          <form onSubmit={handleAddApp} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 1Password or Bitwarden"
              value={newExcludedApp}
              onChange={(e) => setNewExcludedApp(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {privacyRules.excludedApps.map((app) => (
              <span
                key={app}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs"
              >
                <span>{app}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveApp(app)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Auto-Purge & Retention */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-200">
            <span className="font-semibold uppercase tracking-wider">Auto-Purge History</span>
            <span className="font-bold text-purple-400">{privacyRules.autoPurgeDays} Days Retention</span>
          </div>
          <input
            type="range"
            min="3"
            max="90"
            step="1"
            value={privacyRules.autoPurgeDays}
            onChange={(e) => updatePrivacyRules({ autoPurgeDays: parseInt(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                const count = purgeExpiredClips();
                alert(`Purged ${count} expired unpinned clips.`);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold"
            >
              Purge Expired Now
            </button>
          </div>
        </div>

        {/* Export / Import */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {importStatus && <span className="text-emerald-400 font-semibold">{importStatus}</span>}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/20"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
