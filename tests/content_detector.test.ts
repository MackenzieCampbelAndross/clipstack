import { describe, it, expect } from 'vitest';
import { ContentDetector } from '../src/core/content_detector';

describe('ContentDetector', () => {
  it('detects color codes in Hex, RGB, and HSL formats', () => {
    expect(ContentDetector.detectType('#7c3aed')).toBe('COLOR');
    expect(ContentDetector.detectType('#fff')).toBe('COLOR');
    expect(ContentDetector.detectType('rgb(255, 99, 71)')).toBe('COLOR');
    expect(ContentDetector.detectType('rgba(0, 0, 0, 0.5)')).toBe('COLOR');
    expect(ContentDetector.detectType('hsl(120, 100%, 50%)')).toBe('COLOR');
  });

  it('detects URLs in HTTP and HTTPS format', () => {
    expect(ContentDetector.detectType('https://github.com/trending')).toBe('URL');
    expect(ContentDetector.detectType('http://localhost:3000/api/v1')).toBe('URL');
  });

  it('detects code snippets with programming syntax keywords', () => {
    const code = 'const add = (a: number, b: number): number => a + b;';
    expect(ContentDetector.detectType(code)).toBe('CODE');

    const pythonCode = 'def process_records(data):\n    return [d.upper() for d in data]';
    expect(ContentDetector.detectType(pythonCode)).toBe('CODE');
  });

  it('classifies generic prose as TEXT', () => {
    const text = 'Meeting notes: discuss roadmap priorities for Q1 release.';
    expect(ContentDetector.detectType(text)).toBe('TEXT');
  });

  it('generates consistent content hashes for deduplication', () => {
    const text1 = 'Hello World';
    const text2 = 'Hello World';
    const text3 = 'Different Content';

    expect(ContentDetector.hashContent(text1)).toBe(ContentDetector.hashContent(text2));
    expect(ContentDetector.hashContent(text1)).not.toBe(ContentDetector.hashContent(text3));
  });
});
