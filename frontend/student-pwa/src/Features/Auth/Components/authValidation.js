/**
 * Basic frontend validation for Zumrah authentication.
 * The backend will perform the final verification.
 */

// Validate the university email address.
export function universityEmailError(email) {
  const value = email.trim().toLowerCase();

  if (!value) {
    return 'الرجاء إدخال البريد الجامعي.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(value)) {
    return 'الرجاء إدخال بريد إلكتروني صحيح.';
  }

  // Temporary rule for Saudi university emails.
  const domain = value.split('@')[1];

  if (!domain.endsWith('.edu.sa')) {
    return 'الرجاء استخدام بريد جامعي سعودي.';
  }

  return '';
}

// Validate the login password.
export function loginPasswordError(password) {
  if (!password) {
    return 'الرجاء إدخال كلمة المرور.';
  }

  return '';
}