import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getColleges } from '../api/collegesApi';
import { createMajor, updateMajor } from '../api/majorsApi';
import './MajorManagementPage.css';

export default function MajorManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [majorName, setMajorName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const activeCollegeId = searchParams.get('collegeId') || '';

  async function loadColleges() {
    try {
      const data = await getColleges();
      setColleges(data.colleges || []);
    } catch (requestError) {
      console.error('Failed to load majors:', requestError);
      setError('تعذر تحميل التخصصات. تأكد من تشغيل الخادم ثم حاول مجددًا.');
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
        console.error('Failed to load majors:', requestError);

        if (isCurrent) {
          setError(
            'تعذر تحميل التخصصات. تأكد من تشغيل الخادم ثم حاول مجددًا.',
          );
        }
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

  function handleCollegeChange(event) {
    const nextCollegeId = event.target.value;

    setSearchParams(nextCollegeId ? { collegeId: nextCollegeId } : {});
  }

  function openCreateModal() {
    if (!activeCollegeId) {
      return;
    }

    setEditingMajor(null);
    setSelectedCollegeId(activeCollegeId);
    setMajorName('');
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(major, college) {
    setEditingMajor(major);
    setSelectedCollegeId(college.collegeId);
    setMajorName(major.majorName);
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingMajor(null);
    setSelectedCollegeId('');
    setMajorName('');
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedMajorName = majorName.trim();

    if (!trimmedMajorName) {
      setFormError('اكتب اسم التخصص أولًا.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');

      if (editingMajor) {
        await updateMajor(editingMajor.majorId, trimmedMajorName);
      } else {
        await createMajor(selectedCollegeId, trimmedMajorName);
      }

      await reloadColleges();

      setIsModalOpen(false);
      setEditingMajor(null);
      setSelectedCollegeId('');
      setMajorName('');
      setFormError('');
    } catch (requestError) {
      console.error('Failed to save major:', requestError);

      let message = requestError.message || 'تعذر حفظ التخصص. حاول مرة أخرى.';

      if (requestError.status === 401) {
        message = 'انتهت جلسة الدخول. سجّل الدخول مرة أخرى.';
      }

      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }

  const activeCollege = colleges.find(
    (college) => college.collegeId === activeCollegeId,
  );

  const selectedCollege = colleges.find(
    (college) => college.collegeId === selectedCollegeId,
  );

  return (
    <section className="major-page" dir="rtl">
      <header className="major-page__header">
        <div>
          <div className="major-page__title-row">
            <h1>التخصصات حسب الكلية</h1>

            {activeCollege && (
              <span className="major-page__count">
                {activeCollege.majors.length}{' '}
                {activeCollege.majors.length === 1 ? 'تخصص' : 'تخصصات'}
              </span>
            )}
          </div>

          <p>
            اختر كلية لعرض تخصصاتها وإضافة تخصص جديد أو تعديل تخصص موجود.
          </p>
        </div>

        <button
          className="major-page__add-button"
          type="button"
          onClick={openCreateModal}
          disabled={isLoading || colleges.length === 0 || !activeCollegeId}
        >
          <PlusIcon />
          إضافة تخصص
        </button>
      </header>

      {!isLoading && !error && colleges.length > 0 && (
        <div className="major-page__toolbar">
          <label htmlFor="college-filter">اختر الكلية</label>

          <select
            id="college-filter"
            value={activeCollegeId}
            onChange={handleCollegeChange}
          >
            <option value="" disabled>
              اختر كلية لعرض تخصصاتها
            </option>

            {colleges.map((college) => (
              <option key={college.collegeId} value={college.collegeId}>
                {college.collegeName}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && (
        <p className="major-page__message">جارٍ تحميل التخصصات...</p>
      )}

      {!isLoading && error && (
        <div className="major-page__error">
          <p>{error}</p>

          <button type="button" onClick={reloadColleges}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {!isLoading && !error && colleges.length === 0 && (
        <div className="major-page__empty">
          <CollegeIcon />
          <h2>أضف كلية أولًا</h2>
          <p>تُضاف التخصصات داخل الكليات، لذلك أضف كلية قبل إنشاء تخصص.</p>
        </div>
      )}

      {!isLoading && !error && colleges.length > 0 && !activeCollege && (
        <div className="major-page__empty">
          <CollegeIcon />
          <h2>اختر كلية</h2>
          <p>اختر كلية من القائمة بالأعلى لعرض تخصصاتها وإدارتها.</p>
        </div>
      )}

      {!isLoading && !error && activeCollege && (
        <div className="major-groups">
          <article className="major-group" key={activeCollege.collegeId}>
            <header className="major-group__header">
              <div className="major-group__heading">
                <span className="major-group__icon">
                  <CollegeIcon />
                </span>

                <div>
                  <h2>{activeCollege.collegeName}</h2>

                  <p>
                    {activeCollege.majors.length}{' '}
                    {activeCollege.majors.length === 1 ? 'تخصص' : 'تخصصات'}
                  </p>
                </div>
              </div>

              <button
                className="major-group__add-button"
                type="button"
                onClick={openCreateModal}
              >
                <PlusIcon />
                إضافة تخصص
              </button>
            </header>

            {activeCollege.majors.length === 0 ? (
              <div className="major-group__empty">
                لا توجد تخصصات في هذه الكلية بعد.
              </div>
            ) : (
              <ul className="major-list">
                {activeCollege.majors.map((major) => (
                  <li className="major-row" key={major.majorId}>
                    <span className="major-row__name">
                      <MajorIcon />
                      {major.majorName}
                    </span>

                    <button
                      className="major-row__edit-button"
                      type="button"
                      onClick={() => openEditModal(major, activeCollege)}
                    >
                      <EditIcon />
                      تعديل
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      )}

      {isModalOpen && (
        <div className="major-modal-backdrop" onMouseDown={closeModal}>
          <form
            className="major-modal"
            onSubmit={handleSubmit}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="major-modal__header">
              <div>
                <h2>{editingMajor ? 'تعديل التخصص' : 'إضافة تخصص'}</h2>

                <p>
                  {editingMajor
                    ? 'عدّل اسم التخصص ثم احفظ التغييرات.'
                    : `سيُضاف التخصص إلى كلية ${
                        selectedCollege?.collegeName || ''
                      }.`}
                </p>
              </div>

              <button type="button" onClick={closeModal} aria-label="إغلاق">
                ×
              </button>
            </header>

            <label className="major-modal__field">
              <span>اسم التخصص</span>

              <input
                value={majorName}
                onChange={(event) => setMajorName(event.target.value)}
                placeholder="مثال: هندسة البرمجيات"
                maxLength="200"
                autoFocus
              />
            </label>

            {formError && <p className="major-modal__error">{formError}</p>}

            <footer className="major-modal__footer">
              <button
                className="major-modal__cancel"
                type="button"
                onClick={closeModal}
              >
                إلغاء
              </button>

              <button
                className="major-modal__save"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? 'جارٍ الحفظ...'
                  : editingMajor
                    ? 'حفظ التغييرات'
                    : 'إضافة التخصص'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}

function CollegeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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

function MajorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 10 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12.2V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-3.8" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.7 5.3 4 4" />
      <path d="M4 20l4.4-1 10.3-10.3a2.8 2.8 0 0 0-4-4L4.4 15 4 20Z" />
    </svg>
  );
}