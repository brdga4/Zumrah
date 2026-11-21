import { API_BASE_URL } from '../../config';
import { useState, useEffect } from 'react';
import Button from '../../Components/Button';
import InputField from '../../Components/InputField';
import SelectField from '../../Components/SelectField';
import './SignupPage.css';
import { useNavigate } from 'react-router-dom';
// Demo university data. Replace with backend data later.
const universities = {
  'ksu.edu.sa': 'جامعة الملك سعود',
  'kku.edu.sa': 'جامعة الملك خالد',
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
      if (!value.trim()) return 'يرجى إدخال الاسم';
      if (value.trim().length < 2) {
        return 'يرجى إدخال اسم لا يقل عن حرفين';
      }
      return '';

    case 'universityEmail':
      if (!value.trim()) {
        return 'يرجى إدخال البريد الإلكتروني الجامعي';
      }
      if (!/^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(value.trim())) {
        return 'صيغة البريد الإلكتروني غير صحيحة';
      }
      if (!value.trim().toLowerCase().endsWith('@student.ksu.edu.sa')) {
        return 'يجب أن ينتهي بريد الطالب الجامعي  بـ @student.ksu.edu.sa';
      }
      return '';

    case 'password':
      if (!value) return 'يرجى إدخال كلمة المرور';
      if (
        value.length < 8 ||
        !/[a-zA-Z\u0621-\u064A]/.test(value) ||
        !/[0-9]/.test(value)
      ) {
        return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف ورقم';
      }
      return '';

    case 'confirmPassword':
      if (!value) return 'يرجى تأكيد كلمة المرور';
      if (value !== values.password) {
        return 'كلمتا المرور غير متطابقتين';
      }
      return '';

    case 'college':
      return value ? '' : 'يرجى اختيار الكلية';

    case 'major':
      return value ? '' : 'يرجى اختيار التخصص';

    default:
      return '';
  }
}

export default function SignupPage() {
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    fullName: '',
    universityEmail: '',
    password: '',
    confirmPassword: '',
    college: '',
    major: '',
  });
  // Colleges and majors from the backend
  const [collegeData, setCollegeData] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  
  // Fetch colleges and majors from the backend.
  useEffect(() => {
    async function fetchColleges() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/colleges`);

        if (!response.ok) {
          throw new Error('Failed to fetch colleges');
        }

        const data = await response.json();
        setCollegeData(data.colleges);
      } catch (error) {
        console.error('Error loading colleges:', error);
      }
    }

    fetchColleges();
  }, []);


  const university = universityForEmail(values.universityEmail);
  
const colleges = collegeData;

const majors =
  colleges.find((college) => college.collegeId === values.college)?.majors || [];


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
  async function handleSubmit(event) {
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

    
try {
  // Send registration data to the backend.
  const response = await fetch(`${API_BASE_URL}/api/auth/student/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: values.fullName.trim(),
      universityEmail: values.universityEmail.trim(),
      password: values.password,
      majorId: values.major,
    }),
  });

  if (!response.ok) {
    setMessage('تعذر إنشاء الحساب تأكد من البيانات وحاول مجددًا');
    return;
  }
  if (!response.ok) {
  setMessage('تعذر إنشاء الحساب تأكد من البيانات وحاول مجددًا');
  return;
}

// Save the email for OTP verification.
sessionStorage.setItem(
  'pendingSignupEmail',
  values.universityEmail.trim()
);
  navigate('/verify-email');

setMessage('تم إرسال رمز التحقق إلى بريدك الجامعي');
  setMessage('تم إرسال رمز التحقق إلى بريدك الجامعي');
} catch (error) {
  console.error('Registration failed:', error);
  setMessage('تعذر الاتصال بالخادم حاول مجددًا');
}

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
            مساحتك الجامعية في مكان واحد
          </span>

          <p>
            تواصل مع طلاب جامعتك واكتشف مقرراتك
            وشارك المعرفة مع مجتمع يفهم رحلتك
          </p>
        </div>

        <div className="welcome-foot">
          مجتمع جامعي يصنعه الطلاب للطلاب
        </div>
      </section>

      {/* Signup form */}
      <section
        className="login-panel signup-panel"
        aria-label="إنشاء حساب"
      >
        <div className="login-card signup-card">
          <h1>إنشاء حساب في زمرة</h1>

          <p className="subtitle">
            أدخل بياناتك الجامعية لإنشاء حسابك
            والانضمام إلى مجتمع زمرة
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <InputField
              id="fullName"
              name="fullName"
              label="الاسم"
              autoComplete="name"
              placeholder="الاسم الكامل"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fullName}
            />

            <InputField
              id="universityEmail"
              name="universityEmail"
              label="الإيميل الجامعي"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              placeholder="name@student.ksu.edu.sa"
              value={values.universityEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.universityEmail}
            />

            <div className="signup-fields-two">
              <InputField
                id="password"
                name="password"
                label="كلمة المرور"
                type="password"
                autoComplete="new-password"
                placeholder="أدخل كلمة المرور"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
              />

              <InputField
                id="confirmPassword"
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                type="password"
                autoComplete="new-password"
                placeholder="أعد إدخال كلمة المرور"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
              />
            </div>

            {university && (
              <div className="signup-university" aria-live="polite">
                <span>الجامعة</span>
                <strong>{university}</strong>
              </div>
            )}

            <div className="signup-fields-two">
              <SelectField
                id="college"
                name="college"
                label="الكلية"
                placeholder="اختر الكلية"
                placeholderDisabled={false}
                options={colleges.map((college) => ({
                  value: college.collegeId,
                  label: college.collegeName,
                }))}
                value={values.college}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!university}
                error={errors.college}
              />

              <SelectField
                id="major"
                name="major"
                label="التخصص"
                placeholder={values.college ? 'اختر التخصص' : 'اختر الكلية أولًا'}
                placeholderDisabled={false}
                options={majors.map((major) => ({
                  value: major.majorId,
                  label: major.majorName,
                }))}
                value={values.major}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!values.college}
                error={errors.major}
              />
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

      </section>
    </main>
  );
}
