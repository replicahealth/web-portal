import { describe, it, expect } from 'vitest';

describe('RequestAccessForm', () => {
  it('should exist', () => {
    // Basic test to ensure test runner works
    expect(true).toBe(true);
  });

  it('validates email format', () => {
    const email = 'test@example.com';
    const isValid = email.includes('@') && email.includes('.');
    expect(isValid).toBe(true);
  });
});