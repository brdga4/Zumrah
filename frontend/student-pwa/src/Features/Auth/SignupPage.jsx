
import { useState } from 'react';
import Button from '../../Components/Button';
import './SignupPage.css';

// Demo university data. Replace with backend data later.
const universities = {
  'ksu.edu.sa': 'جامعة الملك سعود',
  'kku.edu.sa': 'جامعة الملك خالد',
};

// Demo colleges and majors.
const collegeMajors = {
  'كلية الهندسة': [
    'الهندسة الكهربائية',
    'الهندسة الميكانيكية',
    'الهندسة المدنية',
  ],
  'كلية علوم الحاسب والمعلومات': [
    'علوم الحاسب',
    'هندسة البرمجيات',
    'نظم المعلومات',
  ],
  'كلية العلوم': [
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
  ],
  'كلية إدارة الأعمال': [
    'إدارة الأعمال',
    'المحاسبة',
    'المالية',
  ],
};

// Identify the university from the email domain.
function universityForEmail(email) {
  const address = email.trim().toLowerCase();

  if (!/^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(address)) {
    return '';
  }

  const domain = address.split('@')[1];

  const knownDomain = Object.keys(universities).find(
    (item) => domain === item || domain.endsWith(`.${item}`)
  );

  return knownDomain ? universities[knownDomain] : '';
}

// Validate each signup field.
function getFieldError(field, values) {
  const value = values[field];

  switch (field) {
    case 'fullName':
      if (!value.trim()) return 'يرجى إدخال الاسم.';
      if (value.trim().length < 2) {
        return 'يرجى إدخال اسم لا يقل عن حرفين.';
      }
      return '';

    case 'universityEmail':
      if (!value.trim()) {
        return 'يرجى إدخال البريد الإلكتروني الجامعي.';
      }
      if (!/^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(value.trim())) {
        return 'صيغة البريد الإلكتروني غير صحيحة.';
      }
      if (!universityForEmail(value)) {
        return 'يرجى استخدام بريد جامعي تابع لإحدى الجامعات المدعومة.';
      }
      return '';

    case 'password':
      if (!value) return 'يرجى إدخال كلمة المرور.';
      if (
        value.length < 8 ||
        !/[a-zA-Z\u0621-\u064A]/.test(value) ||
        !/[0-9]/.test(value)
      ) {
        return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف ورقم.';
      }
      return '';

    case 'confirmPassword':
      if (!value) return 'يرجى تأكيد كلمة المرور.';
      if (value !== values.password) {
        return 'كلمتا المرور غير متطابقتين.';
      }
      return '';

    case 'college':
      return value ? '' : 'يرجى اختيار الكلية.';

    case 'major':
      return value ? '' : 'يرجى اختيار التخصص.';

    default:
      return '';
  }
}

export default function SignupPage() {
  const [values, setValues] = useState({
    fullName: '',
    universityEmail: '',
    password: '',
    confirmPassword: '',
    college: '',
    major: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const university = universityForEmail(values.universityEmail);
  const colleges = Object.keys(collegeMajors);
  const majors = collegeMajors[values.college] || [];

  // Update input values and reset dependent fields.
  function handleChange(event) {
    const { name, value } = event.target;

    setValues((previous) => {
      const updated = { ...previous, [name]: value };

      if (name === 'universityEmail') {
        updated.college = '';
        updated.major = '';
      }

      if (name === 'college') {
        updated.major = '';
      }

      return updated;
    });

    setErrors((previous) => ({
      ...previous,
      [name]: '',
      ...(name === 'universityEmail'
        ? { college: '', major: '' }
        : {}),
      ...(name === 'college' ? { major: '' } : {}),
    }));

    setMessage('');
  }

  // Validate a field when the user leaves it.
  function handleBlur(event) {
    const field = event.target.name;
    const error = getFieldError(field, values);

    setErrors((previous) => ({
      ...previous,
      [field]: error,
    }));
  }

  // Validate the whole form before backend integration.
  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const fields = [
      'fullName',
      'universityEmail',
      'password',
      'confirmPassword',
      'college',
      'major',
    ];

    const nextErrors = {};

    fields.forEach((field) => {
      nextErrors[field] = getFieldError(field, values);
    });

    setErrors(nextErrors);

    const firstInvalid = fields.find((field) => nextErrors[field]);

    if (firstInvalid) {
      event.currentTarget.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    // TODO: Connect registration and OTP sending to the .NET API.
    setMessage(
      'تم التحقق من الحقول. إنشاء الحساب وإرسال رمز OTP ينتظران الربط بالباك إند.'
    );
  }

  return (
    <main className="zumrah-signup page" dir="rtl">
      {/* Purple welcome section */}
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

      {/* Signup form */}
      <section
        className="login-panel signup-panel"
        aria-label="إنشاء حساب"
      >
        <div className="login-card signup-card">
          <span className="pill">✦ انضم إلى مجتمع زمرة</span>

          <h1>إنشاء حساب في زمرة</h1>

          <p className="subtitle">
            أدخل بياناتك الجامعية لإنشاء حسابك
            والانضمام إلى مجتمع زمرة.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full name */}
            <div className="signup-field">
              <label htmlFor="fullName">الاسم</label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="الاسم الكامل"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.fullName)}
              />

              <span className="field-error" role="alert">
                {errors.fullName}
              </span>
            </div>

            {/* University email */}
            <div className="signup-field">
              <label htmlFor="universityEmail">
                الإيميل الجامعي
              </label>

              <input
                id="universityEmail"
                name="universityEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                placeholder="name@ksu.edu.sa"
                value={values.universityEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.universityEmail)}
              />

              <span className="field-error" role="alert">
                {errors.universityEmail}
              </span>
            </div>

            {/* Password fields */}
            <div className="signup-fields-two">
              <div className="signup-field">
                <label htmlFor="password">كلمة المرور</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="أدخل كلمة المرور"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.password)}
                />

                <span className="field-error" role="alert">
                  {errors.password}
                </span>
              </div>

              <div className="signup-field">
                <label htmlFor="confirmPassword">
                  تأكيد كلمة المرور
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />

                <span className="field-error" role="alert">
                  {errors.confirmPassword}
                </span>
              </div>
            </div>

            {/* Automatically detected university */}
            <div className="signup-university" aria-live="polite">
              <span>الجامعة</span>

              <strong>
                {!values.universityEmail.trim()
                  ? 'أدخل بريدك الجامعي لعرض الجامعة'
                  : university ||
                    'لم يتم التعرف على الجامعة من هذا البريد'}
              </strong>
            </div>

            {/* College and major */}
            <div className="signup-fields-two">
              <div className="signup-field">
                <label htmlFor="college">الكلية</label>

                <select
                  id="college"
                  name="college"
                  value={values.college}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!university}
                  aria-invalid={Boolean(errors.college)}
                >
                  <option value="">اختر الكلية</option>

                  {colleges.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>

                <span className="field-error" role="alert">
                  {errors.college}
                </span>
              </div>

              <div className="signup-field">
                <label htmlFor="major">التخصص</label>

                <select
                  id="major"
                  name="major"
                  value={values.major}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!values.college}
                  aria-invalid={Boolean(errors.major)}
                >
                  <option value="">
                    {values.college
                      ? 'اختر التخصص'
                      : 'اختر الكلية أولًا'}
                  </option>

                  {majors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>

                <span className="field-error" role="alert">
                  {errors.major}
                </span>
              </div>
            </div>

            {/* Reuse the shared Zumrah button */}
            <div className="signup-action">
              <Button type="submit">إنشاء الحساب</Button>
            </div>

            <div
              className="message signup-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          </form>

          <p className="account-switch">
            <span>لديك حساب بالفعل؟</span>
            <a href="/login">تسجيل الدخول</a>
          </p>
        </div>

        <div className="login-bottom signup-bottom">
          © 2026 زمرة. جميع الحقوق محفوظة.
        </div>
      </section>
    </main>
  );
}
