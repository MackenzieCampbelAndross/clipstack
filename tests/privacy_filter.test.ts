import { describe, it, expect } from 'vitest';
import { PrivacyFilter } from '../src/core/privacy_filter';
import { PrivacyRule } from '../src/types';

describe('PrivacyFilter', () => {
  const defaultRules: PrivacyRule = {
    excludedApps: ['1Password', 'Bitwarden', 'KeePass'],
    redactCreditCards: true,
    redactApiKeys: true,
    redactJwtTokens: true,
    autoPurgeDays: 30
  };

  it('silently excludes clipboard events from protected password managers', () => {
    const res = PrivacyFilter.processContent('master_password_123', '1Password', defaultRules);
    expect(res.isExcluded).toBe(true);
    expect(res.sanitizedContent).toBe('');
  });

  it('redacts 16-digit credit card numbers', () => {
    const text = 'Payment info: card 4111 2222 3333 4444 expiration 12/28';
    const res = PrivacyFilter.processContent(text, 'Chrome', defaultRules);

    expect(res.isExcluded).toBe(false);
    expect(res.isRedacted).toBe(true);
    expect(res.sanitizedContent).toContain('••••-••••-••••-••••');
    expect(res.sanitizedContent).not.toContain('4111 2222 3333 4444');
  });

  it('redacts sensitive API keys and secrets', () => {
    const text = 'export OPENAI_API_KEY=sk-abcdef12345678901234567890';
    const res = PrivacyFilter.processContent(text, 'Terminal', defaultRules);

    expect(res.isRedacted).toBe(true);
    expect(res.sanitizedContent).toContain('[REDACTED_API_KEY]');
    expect(res.sanitizedContent).not.toContain('sk-abcdef12345678901234567890');
  });
});
