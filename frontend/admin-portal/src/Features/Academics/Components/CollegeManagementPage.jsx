import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../Components/Button';
import {
  createCollege,
  getColleges,
  updateCollege,
} from '../api/collegesApi';
import './CollegeManagementPage.css';

export default function CollegeManagementPage() {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [collegeName, setCollegeName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function loadColleges() {
    try {
      const data = await getColleges();
      setColleges(data.colleges || []);
    } catch (requestError) {
      setError('تعذر تحميل الكليات. تأكد من تشغيل الخادم ثم حاول مجددًا.');
      console.error('Failed to load colleges:', requestError);
    } finally {
      setIsLoading(false);
    }
  }

  function reloadColleges() {
    setIsLoading(true);
    setError('');

    return loadColleges();
  }

  useEffect(() => {
  let isCurrent = true;

  async function loadInitialColleges() {
    try {
      const data = await getColleges();

      if (isCurrent) {
        setColleges(data.colleges || []);
      }
    } catch (requestError) {
      if (isCurrent) {
        setError(
          'تعذر تحميل الكليات. تأكد من تشغيل الخادم ثم حاول مجددًا.',
        );
      }

      console.error('Failed to load colleges:', requestError);
    } finally {
      if (isCurrent) {
        setIsLoading(false);
      }
    }
  }

  loadInitialColleges();

  return () => {
    isCurrent = false;
  };
}, []);

  function openCreateDialog() {
    setEditingCollege(null);
    setCollegeName('');
    setFormError('');
    setIsDialogOpen(true);
  }

  function openEditDialog(college) {
    setEditingCollege(college);
    setCollegeName(college.collegeName);
    setFormError('');
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) return;

    setIsDialogOpen(false);
    setEditingCollege(null);
    setCollegeName('');
    setFormError('');
  }

  async function handleCollegeSubmit(event) {
    event.preventDefault();

    const trimmedCollegeName = collegeName.trim();

    if (!trimmedCollegeName) {
      setFormError('اكتب اسم الكلية أولًا.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const isEditing = Boolean(editingCollege);

    try {
      if (isEditing) {
        await updateCollege(editingCollege.collegeId, trimmedCollegeName);
      } else {
        await createCollege(trimmedCollegeName);
      }

      await reloadColleges();

      setSuccessMessage(
        isEditing
          ? `تم تعديل «${trimmedCollegeName}» بنجاح.`
          : `تمت إضافة «${trimmedCollegeName}» بنجاح.`,
      );

      setIsDialogOpen(false);
      setEditingCollege(null);
      setCollegeName('');
    } catch (requestError) {
      let message = requestError.message || 'تعذر حفظ الكلية. حاول مجددًا.';

      if (requestError.status === 401) {
        message = 'انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى.';
      } else if (requestError.status === 409) {
        message = 'هذه الكلية موجودة بالفعل.';
      } else if (requestError.status === 400) {
        message = 'اسم الكلية يجب أن يكون بين 1 و200 حرف.';
      }

      setFormError(message);
      console.error('Failed to save college:', requestError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="college-page" dir="rtl">
      <div className="college-page__header">
        <div>
          <div className="college-page__title-row">
            <h1>الكليات وتخصصاتها</h1>

            <span className="college-page__count">
              {colleges.length} كليات
            </span>
          </div>

          <p className="college-page__description">
            الكليات المتاحة في زُمرة، مع التخصصات التابعة لكل كلية.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <PlusIcon />
          إضافة كلية
        </Button>
      </div>

      {isLoading ? (
        <div className="college-state">
          <p>جارٍ تحميل الكليات...</p>
        </div>
      ) : error ? (
        <div className="college-state college-state--error">
          <p>{error}</p>

          <button type="button" onClick={reloadColleges}>
            حاول مجددًا
          </button>
        </div>
      ) : colleges.length === 0 ? (
        <div className="college-state">
          <h2>لا توجد كليات بعد</h2>
          <p>أضف أول كلية لتتمكن بعدها من إضافة تخصصاتها.</p>

          <button type="button" onClick={openCreateDialog}>
            + إضافة كلية
          </button>
        </div>
      ) : (
        <div className="college-items">
          {colleges.map((college) => (
            <article className="college-item" key={college.collegeId}>
              <div className="college-item__head">
                <span className="college-item__icon">
                  <CollegeIcon />
                </span>

                <div className="college-item__heading">
                  <h2>{college.collegeName}</h2>

                  <p className="college-item__majors-count">
                    {formatMajorCount(college.majors.length)}
                  </p>
                </div>
              </div>

              <div className="college-item__majors">
                {college.majors.length > 0 ? (
                  college.majors.map((major) => (
                    <span className="college-major" key={major.majorId}>
                      {major.majorName}
                    </span>
                  ))
                ) : (
                  <p className="college-item__no-majors">
                    لا توجد تخصصات في هذه الكلية بعد.
                  </p>
                )}
              </div>

              <div className="college-item__footer">
                <button
                  className="college-item__edit-button"
                  type="button"
                  onClick={() => openEditDialog(college)}
                >
                  <EditIcon />
                  تعديل
                </button>

                <button
                  className="college-item__majors-link"
                  type="button"
                  onClick={() => navigate('/academics/majors')}
                >
                  إدارة التخصصات
                  <ArrowIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <div className="college-dialog-backdrop" role="presentation">
          <div
            className="college-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="college-dialog-title"
          >
            <div className="college-dialog__header">
              <div>
                <h2 id="college-dialog-title">
                  {editingCollege ? 'تعديل الكلية' : 'إضافة كلية'}
                </h2>

                <p>
                  {editingCollege
                    ? 'عدّل اسم الكلية ثم احفظ التغييرات.'
                    : 'بعد الإضافة يمكنك ربط التخصصات بهذه الكلية.'}
                </p>
              </div>

              <button
                className="college-dialog__close"
                type="button"
                onClick={closeDialog}
                disabled={isSaving}
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCollegeSubmit}>
              <label className="college-field">
                <span>اسم الكلية</span>

                <input
                  type="text"
                  value={collegeName}
                  onChange={(event) => setCollegeName(event.target.value)}
                  placeholder="مثال: كلية الطب"
                  maxLength="200"
                  autoFocus
                />
              </label>

              {formError && (
                <p className="college-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="college-dialog__actions">
                <button
                  className="college-dialog__cancel"
                  type="button"
                  onClick={closeDialog}
                  disabled={isSaving}
                >
                  إلغاء
                </button>

                <button
                  className="college-dialog__submit"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'جارٍ الحفظ...'
                    : editingCollege
                      ? 'حفظ التغييرات'
                      : 'إضافة الكلية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && (
        <p className="college-toast" role="status">
          {successMessage}
        </p>
      )}
    </section>
  );
}

function formatMajorCount(count) {
  return `${count} ${count === 1 ? 'تخصص' : 'تخصصات'}`;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function CollegeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}