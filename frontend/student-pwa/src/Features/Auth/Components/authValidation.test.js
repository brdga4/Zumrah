import { describe, expect, it } from 'vitest';
import {
  universityEmailError,
  loginPasswordError,
} from './authValidation';

describe('Student login form validation', () => {
  it('rejects an empty university email', () => {
    expect(universityEmailError('   ')).not.toBe('');
  });

  it('rejects a malformed email address', () => {
    expect(universityEmailError('not-an-email')).not.toBe('');
  });

  it('rejects a personal Gmail address', () => {
    expect(universityEmailError('student@gmail.com')).not.toBe('');
  });

  it('accepts a valid KSU student email address', () => {
    expect(universityEmailError('123456789@student.ksu.edu.sa')).toBe('');
  });

  it('normalizes surrounding spaces and uppercase email characters', () => {
    expect(
      universityEmailError(' 123456789@STUDENT.KSU.EDU.SA ')
    ).toBe('');
  });

  it('currently accepts a different .edu.sa university domain', () => {
    expect(universityEmailError('student@another.edu.sa')).toBe('');
  });

  it('rejects an empty login password', () => {
    expect(loginPasswordError('')).not.toBe('');
  });

  it('accepts a nonempty login password input', () => {
    expect(loginPasswordError('example-password')).toBe('');
  });
});