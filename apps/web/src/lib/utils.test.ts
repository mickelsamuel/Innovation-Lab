import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatDate,
  formatCurrency,
  timeUntil,
  truncate,
  getInitials,
  sleep,
  generateId,
  prefersReducedMotion,
  safeJsonParse,
} from './utils';

describe('Utils', () => {
  describe('cn (classnames utility)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional-true', false && 'conditional-false');
      expect(result).toContain('base');
      expect(result).toContain('conditional-true');
      expect(result).not.toContain('conditional-false');
    });

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'other');
      expect(result).toContain('base');
      expect(result).toContain('other');
    });

    it('should handle empty strings', () => {
      const result = cn('base', '', 'other');
      expect(result).toContain('base');
      expect(result).toContain('other');
    });

    it('should override conflicting Tailwind classes', () => {
      // tailwind-merge should keep the last conflicting class
      const result = cn('p-4', 'p-8');
      expect(result).toContain('p-8');
      expect(result).not.toContain('p-4');
    });

    it('should handle objects', () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toContain('class1');
      expect(result).not.toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should return empty string when no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBeTruthy();
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should format date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBeTruthy();
    });

    it('should accept custom options', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, { dateStyle: 'full' });
      expect(result).toBeTruthy();
    });
  });

  describe('formatCurrency', () => {
    it('should format amount in default CAD', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234.56');
      expect(result).toContain('$');
    });

    it('should format amount in custom currency', () => {
      const result = formatCurrency(1000, 'USD');
      expect(result).toBeTruthy();
      expect(result).toContain('1,000');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('timeUntil', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Past" for past dates', () => {
      const past = new Date('2020-01-01');
      const result = timeUntil(past);
      expect(result).toBe('Past');
    });

    it('should format days and hours', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      vi.setSystemTime(now);
      const future = new Date('2024-01-03T05:30:00Z');
      const result = timeUntil(future);
      expect(result).toMatch(/\dd \dh/);
    });

    it('should format hours and minutes', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      vi.setSystemTime(now);
      const future = new Date('2024-01-01T05:30:00Z');
      const result = timeUntil(future);
      expect(result).toMatch(/\dh \d+m/);
    });

    it('should format minutes only', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      vi.setSystemTime(now);
      const future = new Date('2024-01-01T00:30:00Z');
      const result = timeUntil(future);
      expect(result).toMatch(/\d+m/);
    });

    it('should handle string dates', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      vi.setSystemTime(now);
      const result = timeUntil('2024-01-02T00:00:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('Past');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const result = truncate('This is a very long text', 10);
      expect(result).toBe('This is a ...');
    });

    it('should not truncate short text', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });

    it('should handle exact length', () => {
      const result = truncate('Exactly 10', 10);
      expect(result).toBe('Exactly 10');
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should handle three names', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should limit to 2 initials', () => {
      expect(getInitials('John Michael Patrick Doe')).toBe('JM');
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      vi.useFakeTimers();
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await promise;
      expect(true).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('generateId', () => {
    it('should generate ID with default prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^id_/);
    });

    it('should generate ID with custom prefix', () => {
      const id = generateId('user');
      expect(id).toMatch(/^user_/);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('prefersReducedMotion', () => {
    it('should check matchMedia', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false });
      global.window.matchMedia = mockMatchMedia;

      const result = prefersReducedMotion();
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(result).toBe(false);
    });

    it('should return true when reduced motion is preferred', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
      global.window.matchMedia = mockMatchMedia;

      const result = prefersReducedMotion();
      expect(result).toBe(true);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"key": "value"}', {});
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('invalid json', fallback);
      expect(result).toEqual(fallback);
    });

    it('should handle complex objects', () => {
      const data = { nested: { array: [1, 2, 3] } };
      const result = safeJsonParse(JSON.stringify(data), {});
      expect(result).toEqual(data);
    });
  });
});
