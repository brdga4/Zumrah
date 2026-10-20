
import { API_BASE_URL } from '../../config';
import { useState } from 'react'
import Button from '../../Components/Button'
import './OtpVerification.css'
import { useNavigate } from 'react-router-dom';

// OTP verification component
export default function OtpVerification() {
  const navigate = useNavigate()
  // State variables
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  // Get the email saved during signup.
const verificationEmail =
  sessionStorage.getItem('pendingSignupEmail') || '';

  // Handle user input
  function handleChange(event) {
    const value = event.target.value
      .replace(/[٠-٩]/g, (digit) =>
        String(digit.charCodeAt(0) - 0x0660)
      )
      .replace(/[۰-۹]/g, (digit) =>
        String(digit.charCodeAt(0) - 0x06F0)
      )
      .replace(/\D/g, '')

    setOtp(value)
    setError('')
    setMessage('')
  }

  // Handle form submission

  // Verify the OTP with the backend.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!otp) {
      setError('الرجاء إدخال رمز التحقق.');
      return;
    }

    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/student/verify-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            universityEmail: verificationEmail,
            otp: otp,
          }),
        }
      );

      if (!response.ok) {
        setError('تعذر تأكيد البريد. تحقق من الرمز وحاول مجددًا.');
        return;
      }


    
const data = await response.json();

// Save the JWT temporarily for the current browser session.
if (!data.accessToken) {
  setError('لم يتم استلام رمز تسجيل الدخول.');
  return;
}

sessionStorage.setItem('accessToken', data.accessToken);
navigate('/home'); // Redirect to the home page after successful verification.
setMessage('تم تأكيد البريد الإلكتروني بنجاح.');



    } catch (error) {
      console.error('OTP verification failed:', error);
      setError('تعذر الاتصال بالخادم. حاول مجددًا.');
    }
  }


  // Handle resend code
  function handleResend() {
    setError('')
    setMessage('ستتوفر إعادة إرسال الرمز بعد ربط الباك إند.')
  }

  // JSX: User interface
  return (
    <main className="otp-page" dir="rtl">

      {/* Welcome section */}
      <section className="otp-welcome">
        <div className="otp-brand">زُمْرَة</div>

        <div className="otp-hero">
          <span>مساحتك الجامعية، في مكان واحد</span>
          <p>
            تواصل مع طلاب جامعتك، اكتشف مقرراتك،
            وشارك المعرفة مع مجتمع يفهم رحلتك.
          </p>
        </div>

        <p className="otp-footer">
          زمرة — مجتمع جامعي يصنعه الطلاب، للطلاب.
        </p>
      </section>

      {/* OTP verification section */}
      <section className="otp-panel">
        <div className="otp-card">

          <span className="otp-pill">
            ✦ تأكيد البريد الجامعي
          </span>

          <h1>التحقق من البريد الجامعي</h1>

          <p className="otp-subtitle">
            أدخل رمز التحقق المرسل إلى بريدك الجامعي.
          </p>

          {/* Display email from props */}
          <div className="otp-email-box">
            <span>البريد الجامعي</span>
            <strong dir="ltr">{verificationEmail}</strong>
          </div>

          {/* OTP form */}
          <form onSubmit={handleSubmit} noValidate>

            <label htmlFor="otp-code" className="otp-label">
              رمز التحقق
            </label>

            {/* Controlled input */}
            <input
              id="otp-code"
              className="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="أدخل رمز التحقق"
              dir="ltr"
              value={otp}
              onChange={handleChange}
              aria-invalid={Boolean(error)}
              aria-describedby="otp-error"
            />

            {/* Validation error */}
            <p id="otp-error" className="otp-error" role="alert">
              {error}
            </p>

            {/* Reusable Button component */}
            <Button type="submit">
              تأكيد البريد الإلكتروني
            </Button>

            {/* Status message */}
            <p className="otp-message" role="status">
              {message}
            </p>
          </form>

          {/* Resend verification code */}
          <div className="otp-resend">
            <span>لم يصلك الرمز؟</span>
            <button type="button" onClick={handleResend}>
              إعادة إرسال الرمز
            </button>
          </div>

        </div>
      </section>

    </main>
  )
}

