
/**
 * Basic frontend validation for Zumrah admin authentication.
 * The backend will perform the final verification.
 */

// Validate the admin username or email.
export function adminIdentifierError(identifier) {
  const value = identifier.trim();

  if (!value) {
    return 'الرجاء إدخال اسم المستخدم أو البريد الإلكتروني.';
  }

  // If the input contains @, validate it as an email.
  if (value.includes('@')) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      return 'الرجاء إدخال بريد إلكتروني صحيح.';
    }
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
