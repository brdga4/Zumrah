
import { useRef, useState } from 'react';
import Button from '../../../Components/Button';
import {
  adminIdentifierError,
  loginPasswordError,
} from './authValidation';
import './AdminLoginPage.css';

// Admin login UI. Backend authentication will be added later.
export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    identifier: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const identifierRef = useRef(null);
  const passwordRef = useRef(null);

  function validateIdentifier() {
    const error = adminIdentifierError(identifier);
    setErrors((previous) => ({ ...previous, identifier: error }));
    return !error;
  }

  function validatePassword() {
    const error = loginPasswordError(password);
    setErrors((previous) => ({ ...previous, password: error }));
    return !error;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const validIdentifier = validateIdentifier();
    const validPassword = validatePassword();

    if (!validIdentifier || !validPassword) {
      (!validIdentifier ? identifierRef : passwordRef).current?.focus();
      return;
    }

    // TODO: Connect to POST /api/auth/admin.
    setMessage('تم التحقق من الحقول. تسجيل دخول المسؤول ينتظر الربط بالباك إند.');
  }

  return (
    <main className="zumrah-login" dir="rtl">
      <section className="welcome" aria-label="مرحبًا بك في زمرة">
        <div className="brand" aria-label="زُمْرَة">
          زُمْرَة
        </div>

        <div className="hero">
          <span className="eyebrow">
            بوابة إدارة مجتمع زمرة
          </span>
          <p>
            إدارة المجتمع الجامعي ومتابعة خدماته
            من مساحة واحدة مخصصة للمسؤولين.
          </p>
        </div>

        <div className="welcome-foot">
          زمرة — مجتمع جامعي يصنعه الطلاب، للطلاب.
        </div>
      </section>

      <section className="login-panel" aria-label="دخول المسؤول">
        <div className="login-card">
          <span className="pill">✦ بوابة المسؤولين</span>

          <h1>تسجيل دخول المسؤول</h1>

          <p className="subtitle">
            أدخل اسم المستخدم أو البريد الإلكتروني وكلمة المرور
            للوصول إلى لوحة إدارة زمرة.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="signup-field">
              <label htmlFor="adminIdentifier">
                اسم المستخدم أو البريد الإلكتروني
              </label>

              <input
                ref={identifierRef}
                id="adminIdentifier"
                name="identifier"
                type="text"
                autoComplete="username"
                dir="auto"
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                value={identifier}
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby="adminIdentifierError"
                onChange={(event) => {
                  const nextIdentifier = event.target.value;
                  setIdentifier(nextIdentifier);

                  if (errors.identifier) {
                    setErrors((previous) => ({
                      ...previous,
                      identifier: adminIdentifierError(nextIdentifier),
                    }));
                  }

                  setMessage('');
                }}
                onBlur={validateIdentifier}
              />

              <span
                id="adminIdentifierError"
                className="field-error"
                aria-live="polite"
              >
                {errors.identifier}
              </span>
            </div>

            <div className="signup-field">
              <label htmlFor="adminPassword">
                كلمة المرور
              </label>

              <input
                ref={passwordRef}
                id="adminPassword"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="أدخل كلمة المرور"
                value={password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby="adminPasswordError"
                onChange={(event) => {
                  const nextPassword = event.target.value;
                  setPassword(nextPassword);

                  if (errors.password) {
                    setErrors((previous) => ({
                      ...previous,
                      password: loginPasswordError(nextPassword),
                    }));
                  }

                  setMessage('');
                }}
                onBlur={validatePassword}
              />

              <span
                id="adminPasswordError"
                className="field-error"
                aria-live="polite"
              >
                {errors.password}
              </span>
            </div>

            <Button type="submit">
              تسجيل الدخول
            </Button>

            <div className="message" role="status" aria-live="polite">
              {message}
            </div>
          </form>
        </div>

        <div className="login-bottom">
          © 2026 زمرة. جميع الحقوق محفوظة.
        </div>
      </section>
    </main>
  );
}
