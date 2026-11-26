
import { useRef, useState } from 'react';
import Button from '@student/Components/Button';
import InputField from '@student/Components/InputField';
import LoadingIndicator from '@student/Components/LoadingIndicator';
import {
  adminIdentifierError,
  loginPasswordError,
} from './authValidation';
import './AdminLoginPage.css';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/adminAuthApi';

export default function AdminLoginPage() {
    const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    identifier: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const identifierRef = useRef(null);
  const passwordRef = useRef(null);

  function validateIdentifier() {
    const error = adminIdentifierError(identifier);
    setErrors((previous) => ({
      ...previous,
      identifier: error,
    }));
    return !error;
  }

  function validatePassword() {
    const error = loginPasswordError(password);
    setErrors((previous) => ({
      ...previous,
      password: error,
    }));
    return !error;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoading) return;

    setMessage('');

    const validIdentifier = validateIdentifier();
    const validPassword = validatePassword();

    if (!validIdentifier || !validPassword) {
      (!validIdentifier ? identifierRef : passwordRef)
        .current?.focus();
      return;
    }

    setIsLoading(true);
    try {
  const data = await loginAdmin(identifier.trim(), password);

  if (!data.accessToken) {
    setMessage('لم يتم استلام رمز الدخول من الخادم.');
    return;
  }

  localStorage.setItem('accessToken', data.accessToken);

  if (data.admin) {
    localStorage.setItem('admin', JSON.stringify(data.admin));
  }

  navigate('/dashboard', { replace: true });
} catch (error) {
  console.error('Admin login failed:', error);

  if (error.status === 401) {
    setMessage('اسم المستخدم أو البريد الإلكتروني أو كلمة المرور غير صحيحة.');
  } else if (!error.status) {
    setMessage('تعذر الاتصال بالخادم. تأكد من تشغيله ثم حاول مجددًا.');
  } else {
    setMessage(error.message || 'تعذر تسجيل الدخول حاليًا. حاول مرة أخرى.');
  }
} finally {
  setIsLoading(false);
}
  }

  return (
    <main className="zumrah-login" dir="rtl">
      <section
        className="welcome"
        aria-label="مرحبًا بك في زمرة"
      >
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

      <section
        className="login-panel"
        aria-label="دخول المسؤول"
      >
        <div className="login-card">
          <span className="pill">
            ✦ بوابة المسؤولين
          </span>

          <h1>تسجيل دخول المسؤول</h1>

          <p className="subtitle">
            أدخل اسم المستخدم أو البريد الإلكتروني وكلمة المرور
            للوصول إلى لوحة إدارة زمرة.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="admin-login-fields">
              <InputField
                ref={identifierRef}
                id="adminIdentifier"
                name="identifier"
                label="اسم المستخدم أو البريد الإلكتروني"
                type="text"
                autoComplete="username"
                dir="auto"
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                value={identifier}
                error={errors.identifier}
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

              <InputField
                ref={passwordRef}
                id="adminPassword"
                name="password"
                label="كلمة المرور"
                type="password"
                autoComplete="current-password"
                placeholder="أدخل كلمة المرور"
                value={password}
                error={errors.password}
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
            </div>

            <Button type="submit" fullWidth loading={isLoading}>
              <span className="admin-login-submit-content">
                {isLoading && <LoadingIndicator inline decorative />}
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </span>
            </Button>

            <div
              className="message"
              role="status"
              aria-live="polite"
            >
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
