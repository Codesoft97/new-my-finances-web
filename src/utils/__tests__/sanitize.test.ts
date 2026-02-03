/**
 * @jest-environment jsdom
 */
import { escapeHtml, isValidEmail, sanitizeInput, sanitizeHTML } from '../sanitize';

// Test sanitization utilities

describe('sanitize utilities', () => {
  describe('escapeHtml', () => {
    it('escapes ampersand', () => {
      expect(escapeHtml('Rock & Roll')).toBe('Rock &amp; Roll');
    });

    it('escapes less than', () => {
      expect(escapeHtml('1 < 2')).toBe('1 &lt; 2');
    });

    it('escapes greater than', () => {
      expect(escapeHtml('2 > 1')).toBe('2 &gt; 1');
    });

    it('escapes double quotes', () => {
      expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;');
    });

    it('escapes single quotes', () => {
      expect(escapeHtml("It's me")).toBe('It&#039;s me');
    });

    it('escapes all special characters together', () => {
      expect(escapeHtml('<script>alert("XSS")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('returns same string if no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('handles empty string', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('returns true for email with subdomain', () => {
      expect(isValidEmail('test@mail.example.com')).toBe(true);
    });

    it('returns true for email with plus sign', () => {
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('returns true for email with dots', () => {
      expect(isValidEmail('first.last@example.com')).toBe(true);
    });

    it('returns false for email without @', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('returns false for email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('returns false for email without TLD', () => {
      expect(isValidEmail('test@example')).toBe(false);
    });

    it('returns false for email with spaces', () => {
      expect(isValidEmail('test @example.com')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('returns false for email with invalid characters', () => {
      expect(isValidEmail('test<script>@example.com')).toBe(false);
    });
  });
});
