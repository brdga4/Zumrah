import { describe, expect, it } from 'vitest';
import {
  adminIdentifierError,
  loginPasswordError,
} from './authValidation';

describe('Admin login form validation', () => {
  it('rejects an empty identifier', () => {
    expect(adminIdentifierError('')).not.toBe('');
  });

  it('rejects an identifier containing only spaces', () => {
    expect(adminIdentifierError('   ')).not.toBe('');
  });

  it('accepts a normal admin username', () => {
    expect(adminIdentifierError('adminuser')).toBe('');
  });

  it('accepts a syntactically valid admin email', () => {
    expect(adminIdentifierError('admin@example.com')).toBe('');
  });

  it('rejects a malformed admin email', () => {
    expect(adminIdentifierError('admin@not-a-domain')).not.toBe('');
  });

  it('currently allows a nonempty username without email formatting', () => {
    expect(adminIdentifierError('admin user')).toBe('');
  });

  it('rejects an empty admin login password', () => {
    expect(loginPasswordError('')).not.toBe('');
  });

  it('accepts a nonempty login password', () => {
    expect(loginPasswordError('example-password')).toBe('');
  });
});