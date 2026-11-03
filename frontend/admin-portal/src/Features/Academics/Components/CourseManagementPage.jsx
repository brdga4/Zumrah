import { useEffect, useState } from 'react';
import { createCourse, getCourses } from '../api/coursesApi';
import './CourseManagementPage.css';

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadCourses() {
    try {
      const data = await getCourses();
      setCourses(data.courses || []);
    } catch (requestError) {
      console.error('Failed to load courses:', requestError);
      setError('تعذر تحميل المقررات. تأكد من تشغيل الخادم ثم حاول مجددًا.');
    } finally {
      setIsLoading(false);
    }
  }

  function reloadCourses() {
    setIsLoading(true);
    setError('');

    return loadCourses();
  }

  useEffect(() => {
    let isCurrent = true;

    async function loadInitialCourses() {
      try {
        const data = await getCourses();

        if (isCurrent) {
          setCourses(data.courses || []);
        }
      } catch (requestError) {
        console.error('Failed to load courses:', requestError);

        if (isCurrent) {
          setError(
            'تعذر تحميل المقررات. تأكد من تشغيل الخادم ثم حاول مجددًا.',
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadInitialCourses();

    return () => {
      isCurrent = false;
    };
  }, []);

  function openModal() {
    setCourseCode('');
    setCourseName('');
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedCode = courseCode.trim().toUpperCase();
    const trimmedName = courseName.trim();

    if (!trimmedCode || !trimmedName) {
      setFormError('اكتب رمز المقرر واسمه أولًا.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');

      await createCourse(trimmedCode, trimmedName);
      await reloadCourses();

      setIsModalOpen(false);
      setCourseCode('');
      setCourseName('');
      setFormError('');
    } catch (requestError) {
      console.error('Failed to create course:', requestError);

      let message = requestError.message || 'تعذر إضافة المقرر. حاول مرة أخرى.';

      if (requestError.status === 401) {
        message = 'انتهت جلسة الدخول. سجّل الدخول مرة أخرى.';
      }

      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }

  const visibleCourses = courses.filter((course) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      course.courseCode.toLowerCase().includes(query) ||
      course.courseName.toLowerCase().includes(query)
    );
  });

  return (
    <section className="course-page" dir="rtl">
      <header className="course-page__header">
        <div>
          <div className="course-page__title-row">
            <h1>جميع المقررات</h1>

            <span className="course-page__count">
              {courses.length} {courses.length === 1 ? 'مقرر' : 'مقررات'}
            </span>
          </div>

          <p>
            كتالوج المقررات في زمرة. أسند المقرر إلى تخصص ليظهر لطلابه.
          </p>
        </div>

        <button
          className="course-page__add-button"
          type="button"
          onClick={openModal}
          disabled={isLoading}
        >
          <PlusIcon />
          إضافة مقرر
        </button>
      </header>

      {!isLoading && !error && courses.length > 0 && (
        <div className="course-page__toolbar">
          <label htmlFor="course-search">البحث في المقررات</label>

          <input
            id="course-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="ابحث برمز المقرر أو اسمه"
          />

          {searchQuery.trim() && (
            <span>
              {visibleCourses.length}{' '}
              {visibleCourses.length === 1 ? 'نتيجة' : 'نتائج'}
            </span>
          )}
        </div>
      )}

      {isLoading && (
        <p className="course-page__message">جارٍ تحميل المقررات...</p>
      )}

      {!isLoading && error && (
        <div className="course-page__error">
          <p>{error}</p>

          <button type="button" onClick={reloadCourses}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <div className="course-page__empty">
          <CourseIcon />
          <h2>لا توجد مقررات بعد</h2>
          <p>أضف أول مقرر إلى الكتالوج، ثم أسنده إلى التخصصات المناسبة.</p>

          <button type="button" onClick={openModal}>
            <PlusIcon />
            إضافة مقرر
          </button>
        </div>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <>
          {visibleCourses.length > 0 ? (
            <div className="course-table-wrapper">
              <table className="course-table">
                <thead>
                  <tr>
                    <th>رمز المقرر</th>
                    <th>اسم المقرر</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCourses.map((course) => (
                    <tr key={course.courseId}>
                      <td>
                        <span className="course-code" dir="ltr">
                          {course.courseCode}
                        </span>
                      </td>

                      <td>{course.courseName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="course-page__empty">
              <SearchIcon />
              <h2>لا توجد مقررات مطابقة</h2>
              <p>
                لم نعثر على مقرر يطابق “{searchQuery.trim()}”. جرّب رمزًا أو
                اسمًا آخر.
              </p>

              <button type="button" onClick={() => setSearchQuery('')}>
                مسح البحث
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="course-modal-backdrop" onMouseDown={closeModal}>
          <form
            className="course-modal"
            onSubmit={handleSubmit}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="course-modal__header">
              <div>
                <h2>إضافة مقرر</h2>
                <p>بعد الإضافة، تستطيع لاحقًا إسناد المقرر إلى تخصص مناسب.</p>
              </div>

              <button type="button" onClick={closeModal} aria-label="إغلاق">
                ×
              </button>
            </header>

            <label className="course-modal__field">
              <span>رمز المقرر</span>

              <input
                dir="ltr"
                value={courseCode}
                onChange={(event) => setCourseCode(event.target.value)}
                placeholder="CSC 111"
                maxLength="30"
                autoFocus
              />
            </label>

            <label className="course-modal__field">
              <span>اسم المقرر</span>

              <input
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
                placeholder="مثال: هياكل البيانات"
                maxLength="200"
              />
            </label>

            {formError && <p className="course-modal__error">{formError}</p>}

            <footer className="course-modal__footer">
              <button
                className="course-modal__cancel"
                type="button"
                onClick={closeModal}
              >
                إلغاء
              </button>

              <button
                className="course-modal__save"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'جارٍ الحفظ...' : 'إضافة المقرر'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
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

function CourseIcon() {
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
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M4 5.5V21" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  );
}

function SearchIcon() {
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
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}