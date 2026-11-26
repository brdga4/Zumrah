import { useEffect, useRef, useState } from 'react';
import Badge from '@student/Components/Badge';
import Button from '@student/Components/Button';
import Card from '@student/Components/Card';
import Dialog from '@student/Components/Dialog';
import Heading from '@student/Components/Heading';
import InputField from '@student/Components/InputField';
import LoadingIndicator from '@student/Components/LoadingIndicator';
import Text from '@student/Components/Text';
import {
  createCourse,
  getCourses,
  updateCourse,
} from '../api/coursesApi';
import './CourseManagementPage.css';

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const courseCodeRef = useRef(null);

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

  function openCreateModal() {
    setEditingCourse(null);
    setCourseCode('');
    setCourseName('');
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(course) {
    setEditingCourse(course);
    setCourseCode(course.courseCode);
    setCourseName(course.courseName);
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCourse(null);
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

      if (editingCourse) {
        await updateCourse(
          editingCourse.courseId,
          trimmedCode,
          trimmedName,
        );
      } else {
        await createCourse(trimmedCode, trimmedName);
      }

      await reloadCourses();

      setIsModalOpen(false);
      setEditingCourse(null);
      setCourseCode('');
      setCourseName('');
      setFormError('');
    } catch (requestError) {
      console.error('Failed to save course:', requestError);

      let message = editingCourse
        ? 'تعذر تعديل المقرر. حاول مرة أخرى.'
        : 'تعذر إضافة المقرر. حاول مرة أخرى.';

      if (requestError.status === 401) {
        message = 'انتهت جلسة الدخول. سجّل الدخول مرة أخرى.';
      }

      if (requestError.status === 409) {
        message = 'رمز المقرر مستخدم بالفعل لمقرر آخر.';
      }

      if (requestError.message) {
        message = requestError.message;
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
            <Heading level={1}>جميع المقررات</Heading>

            <Badge variant="soft" className="course-page__count">
              {courses.length} {courses.length === 1 ? 'مقرر' : 'مقررات'}
            </Badge>
          </div>

          <Text tone="muted">
            كتالوج المقررات في زمرة. أسند المقرر إلى تخصص ليظهر لطلابه.
          </Text>
        </div>

        <Button
          className="course-page__add-button"
          onClick={openCreateModal}
          disabled={isLoading}
        >
          <PlusIcon />
          إضافة مقرر
        </Button>
      </header>

      {!isLoading && !error && courses.length > 0 && (
        <div className="course-page__toolbar">
          <InputField
            id="course-search"
            label="البحث في المقررات"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="ابحث برمز المقرر أو اسمه"
          />

          {searchQuery.trim() && (
            <Text tone="muted" className="course-page__results-count">
              {visibleCourses.length}{' '}
              {visibleCourses.length === 1 ? 'نتيجة' : 'نتائج'}
            </Text>
          )}
        </div>
      )}

      {isLoading && (
        <Card className="course-page__message">
          <LoadingIndicator label="جارٍ تحميل المقررات..." />
        </Card>
      )}

      {!isLoading && error && (
        <Card className="course-page__error">
          <Text>{error}</Text>

          <Button variant="secondary" size="sm" onClick={reloadCourses}>
            إعادة المحاولة
          </Button>
        </Card>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <Card className="course-page__empty">
          <CourseIcon />
          <Heading level={2}>لا توجد مقررات بعد</Heading>
          <Text tone="muted">أضف أول مقرر إلى الكتالوج، ثم أسنده إلى التخصصات المناسبة.</Text>

          <Button size="sm" onClick={openCreateModal}>
            <PlusIcon />
            إضافة مقرر
          </Button>
        </Card>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <>
          {visibleCourses.length > 0 ? (
            <Card className="course-table-wrapper">
              <table className="course-table">
                <thead>
                  <tr>
                    <th>رمز المقرر</th>
                    <th>اسم المقرر</th>
                    <th>إجراء</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCourses.map((course) => (
                    <tr key={course.courseId}>
                      <td>
                        <Badge variant="soft" className="course-code" dir="ltr">
                          {course.courseCode}
                        </Badge>
                      </td>

                      <td>{course.courseName}</td>

                      <td>
                        <Button
                          className="course-table__edit-button"
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(course)}
                        >
                          تعديل
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <Card className="course-page__empty">
              <SearchIcon />
              <Heading level={2}>لا توجد مقررات مطابقة</Heading>
              <Text tone="muted">
                لم نعثر على مقرر يطابق “{searchQuery.trim()}”. جرّب رمزًا أو
                اسمًا آخر.
              </Text>

              <Button size="sm" onClick={() => setSearchQuery('')}>
                مسح البحث
              </Button>
            </Card>
          )}
        </>
      )}

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        title={editingCourse ? 'تعديل المقرر' : 'إضافة مقرر'}
        description={
          editingCourse
            ? 'عدّل رمز المقرر أو اسمه، ثم احفظ التغييرات.'
            : 'بعد الإضافة، تستطيع لاحقًا إسناد المقرر إلى تخصص مناسب.'
        }
        busy={isSaving}
        initialFocusRef={courseCodeRef}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={closeModal} disabled={isSaving}>
              إلغاء
            </Button>
            <Button type="submit" form="course-dialog-form" size="md" loading={isSaving}>
              {isSaving
                ? 'جارٍ الحفظ...'
                : editingCourse
                  ? 'حفظ التعديلات'
                  : 'إضافة المقرر'}
            </Button>
          </>
        }
      >
        <form id="course-dialog-form" onSubmit={handleSubmit} className="course-dialog-form">
          <InputField
            ref={courseCodeRef}
            id="course-code"
            label="رمز المقرر"
            dir="ltr"
            value={courseCode}
            onChange={(event) => setCourseCode(event.target.value)}
            placeholder="CSC 111"
            maxLength="30"
            disabled={isSaving}
          />
          <InputField
            id="course-name"
            label="اسم المقرر"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            placeholder="مثال: هياكل البيانات"
            maxLength="200"
            disabled={isSaving}
          />
          {formError && <p className="zumrah-dialog-error" role="alert">{formError}</p>}
        </form>
      </Dialog>
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
