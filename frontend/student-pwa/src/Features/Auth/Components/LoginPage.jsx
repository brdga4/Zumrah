import { useRef, useState } from 'react';
import Button from '../../../Components/Button';
import { loginPasswordError, universityEmailError } from './authValidation';
import './LoginPage.css';

// This page is UI-only. Backend authentication will be added later.
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  function validateEmail() {
    const error = universityEmailError(email);
    setErrors((previous) => ({ ...previous, email: error }));
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

    const validEmail = validateEmail();
    const validPassword = validatePassword();

    if (!validEmail || !validPassword) {
      (!validEmail ? emailRef : passwordRef).current?.focus();
      return;
    }

    // TODO: Connect to the .NET authentication API.
    setMessage('تم التحقق من الحقول. تسجيل الدخول الفعلي ينتظر الربط بالباك إند.');
  }

  return (
    <main className="zumrah-login" dir="rtl">
      <section className="welcome" aria-label="مرحبًا بك في زمرة">
        <div className="brand" aria-label="زُمْرَة">
          زُمْرَة
        </div>

        <div className="hero">
          <span className="eyebrow">
            مساحتك الجامعية، في مكان واحد
          </span>
          <p>
            تواصل مع طلاب جامعتك، اكتشف مقرراتك،
            وشارك المعرفة مع مجتمع يفهم رحلتك.
          </p>
        </div>

        <div className="welcome-foot">
          زمرة — مجتمع جامعي يصنعه الطلاب، للطلاب.
        </div>
      </section>

      <section className="login-panel" aria-label="تسجيل الدخول">
        <div className="login-card">
          <span className="pill">✦ مرحبًا بعودتك</span>

          <h1>تسجيل الدخول</h1>

          <p className="subtitle">
            سجّل الدخول باستخدام بريدك الجامعي وكلمة المرور
            للوصول إلى حسابك في زمرة.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="signup-field">
              <label htmlFor="universityEmail">
                الإيميل الجامعي
              </label>

              <input
                ref={emailRef}
                id="universityEmail"
                name="universityEmail"
                type="email"
                inputMode="email"
                autoComplete="username"
                dir="ltr"
                placeholder="name@ksu.edu.sa"
                value={email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby="universityEmailError"
                onChange={(event) => {
                  const nextEmail = event.target.value;
                  setEmail(nextEmail);

                  if (errors.email) {
                    setErrors((previous) => ({
                      ...previous,
                      email: universityEmailError(nextEmail),
                    }));
                  }

                  setMessage('');
                }}
                onBlur={validateEmail}
              />

              <span
                id="universityEmailError"
                className="field-error"
                aria-live="polite"
              >
                {errors.email}
              </span>
            </div>

            <div className="signup-field">
              <label htmlFor="password">
                كلمة المرور
              </label>

              <input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="أدخل كلمة المرور"
                value={password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby="passwordError"
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
                id="passwordError"
                className="field-error"
                aria-live="polite"
              >
                {errors.password}
              </span>
            </div>

            <Button type="submit">
              تسجيل الدخول
            </Button>

            <div
              className="message"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          </form>

          {/* Connect this link when the signup route is ready. */}
          <p className="account-switch">
            <span>ليس لديك حساب؟</span>{' '}
            <a href="/signup">إنشاء حساب</a>
          </p>
        </div>

        <div className="login-bottom">
          © 2026 زمرة. جميع الحقوق محفوظة.
        </div>
      </section>
    </main>
  );
}