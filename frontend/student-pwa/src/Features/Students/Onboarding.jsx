
import { useState } from 'react'
import Button from '../../Components/Button'
import SelectField from '../../Components/SelectField'
import './Onboarding.css'

const collegeMajors = {
  'كلية الهندسة': [
    'الهندسة الكهربائية',
    'الهندسة الميكانيكية',
    'الهندسة المدنية'
  ],
  'كلية علوم الحاسب والمعلومات': [
    'علوم الحاسب',
    'هندسة البرمجيات',
    'نظم المعلومات'
  ],
  'كلية العلوم': [
    'الرياضيات',
    'الفيزياء',
    'الكيمياء'
  ],
  'كلية إدارة الأعمال': [
    'إدارة الأعمال',
    'المحاسبة',
    'المالية'
  ]
}

export default function Onboarding({
  universityName = 'جامعة الملك سعود'
}) {
  const [college, setCollege] = useState('')
  const [major, setMajor] = useState('')
  const [message, setMessage] = useState('')

  const collegeOptions = Object.keys(collegeMajors).map((name) => ({
    value: name,
    label: name
  }))

  const majorOptions = (collegeMajors[college] || []).map((name) => ({
    value: name,
    label: name
  }))

  function handleCollegeChange(event) {
    setCollege(event.target.value)
    setMajor('')
    setMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!college || !major) {
      setMessage('الرجاء اختيار الكلية والتخصص.')
      return
    }

    setMessage('تم اختيار الكلية والتخصص. الربط مع الباك إند سيكون الخطوة التالية.')
  }

  return (
    <main className="onboarding-page" dir="rtl">
      <section className="onboarding-welcome">
        <div className="onboarding-brand">زُمْرَة</div>

        <div className="onboarding-hero">
          <span>مساحتك الجامعية، في مكان واحد</span>
          <p>
            تواصل مع طلاب جامعتك، اكتشف مقرراتك،
            وشارك المعرفة مع مجتمع يفهم رحلتك.
          </p>
        </div>

        <p className="onboarding-footer">
          زمرة — مجتمع جامعي يصنعه الطلاب، للطلاب.
        </p>
      </section>

      <section className="onboarding-panel">
        <div className="onboarding-card">
          <span className="onboarding-pill">
            ✦ خطوة واحدة وتبدأ رحلتك
          </span>

          <h1>استكمال إعداد الحساب</h1>

          <p className="onboarding-subtitle">
            اختر كليتك وتخصصك لاستكمال إعداد حسابك في زمرة.
          </p>

          <div className="onboarding-university">
            <span>الجامعة</span>
            <strong>{universityName}</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <SelectField
              id="college"
              label="الكلية"
              value={college}
              onChange={handleCollegeChange}
              options={collegeOptions}
              placeholder="اختر الكلية"
            />

            <SelectField
              id="major"
              label="التخصص"
              value={major}
              onChange={(event) => {
                setMajor(event.target.value)
                setMessage('')
              }}
              options={majorOptions}
              placeholder={college ? 'اختر التخصص' : 'اختر الكلية أولًا'}
            />

            <Button type="submit">
              استكمال الحساب
            </Button>

            <p className="onboarding-message" role="status">
              {message}
            </p>
          </form>

          <p className="onboarding-note">
            يمكنك تعديل الكلية والتخصص لاحقًا من إعدادات حسابك.
          </p>
        </div>

        <p className="onboarding-copyright">
          © 2026 زمرة. جميع الحقوق محفوظة.
        </p>
      </section>
    </main>
  )
}

