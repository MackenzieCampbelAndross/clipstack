import { PrivacyRule } from '../types';

export interface PrivacyFilterResult {
  isExcluded: boolean;
  sanitizedContent: string;
  isRedacted: boolean;
  redactedCategories: string[];
}

export class PrivacyFilter {
  /**
   * Evaluate whether a clipboard event should be ignored or have sensitive credentials redacted.
   */
  static processContent(
    content: string,
    sourceApp: string = '',
    rules: PrivacyRule
  ): PrivacyFilterResult {
    // 1. Process application exclusion check (e.g. Password Managers / Banking)
    if (sourceApp && rules.excludedApps.length > 0) {
      const lowerSource = sourceApp.toLowerCase();
      const isAppExcluded = rules.excludedApps.some((app) =>
        lowerSource.includes(app.toLowerCase())
      );
      if (isAppExcluded) {
        return {
          isExcluded: true,
          sanitizedContent: '',
          isRedacted: false,
          redactedCategories: []
        };
      }
    }

    let sanitized = content;
    let isRedacted = false;
    const redactedCategories: string[] = [];

    // 2. Redact Private Keys
    const privateKeyRegex = /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA )?PRIVATE KEY-----/g;
    if (privateKeyRegex.test(sanitized)) {
      sanitized = sanitized.replace(privateKeyRegex, '[REDACTED PRIVATE KEY]');
      isRedacted = true;
      redactedCategories.push('PRIVATE_KEY');
    }

    // 3. Redact Credit Card Numbers (16-digit card patterns)
    if (rules.redactCreditCards) {
      const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
      if (ccRegex.test(sanitized)) {
        sanitized = sanitized.replace(ccRegex, '••••-••••-••••-••••');
        isRedacted = true;
        redactedCategories.push('CREDIT_CARD');
      }
    }

    // 4. Redact API Keys (OpenAI sk-, GitHub ghp_, AWS AKIA, generic secrets)
    if (rules.redactApiKeys) {
      const apiKeyRegex = /\b(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16})\b/g;
      if (apiKeyRegex.test(sanitized)) {
        sanitized = sanitized.replace(apiKeyRegex, '[REDACTED_API_KEY]');
        isRedacted = true;
        redactedCategories.push('API_KEY');
      }
    }

    // 5. Redact JWT Tokens
    if (rules.redactJwtTokens) {
      const jwtRegex = /\beyJ[a-zA-Z0-9_-]{8,}\.eyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\b/g;
      if (jwtRegex.test(sanitized)) {
        sanitized = sanitized.replace(jwtRegex, '[REDACTED_JWT_TOKEN]');
        isRedacted = true;
        redactedCategories.push('JWT_TOKEN');
      }
    }

    return {
      isExcluded: false,
      sanitizedContent: sanitized,
      isRedacted,
      redactedCategories
    };
  }
}
