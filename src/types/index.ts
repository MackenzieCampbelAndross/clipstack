/**
 * Domain types and models for ClipStack (Advanced Desktop Clipboard Manager).
 */

export type ClipContentType = 'TEXT' | 'CODE' | 'URL' | 'IMAGE' | 'COLOR' | 'RICH_TEXT';

export type ClipCategory = 'GENERAL' | 'DEVELOPMENT' | 'DESIGN' | 'RESEARCH' | 'CREDENTIALS' | 'SNIPPETS';

export interface ClipboardItem {
  id: string;
  type: ClipContentType;
  content: string;
  previewText?: string;
  sourceApp?: string; // e.g. "VS Code", "Chrome", "Terminal", "Slack"
  byteSize: number;
  isPinned: boolean;
  isFavorite: boolean;
  category: ClipCategory;
  tags: string[];
  isRedacted: boolean;
  contentHash: string; // Used for deduplication
  createdAt: number;
  lastUsedAt: number;
}

export interface PrivacyRule {
  excludedApps: string[]; // e.g. ["1Password", "Bitwarden", "KeePass", "KeePassXC"]
  redactCreditCards: boolean;
  redactApiKeys: boolean;
  redactJwtTokens: boolean;
  autoPurgeDays: number; // e.g. 7 or 30 days
}

export interface SnippetExpansion {
  id: string;
  trigger: string; // e.g. ":email:" or ":shrug:"
  replacement: string;
  description: string;
  category: ClipCategory;
  createdAt: number;
}
