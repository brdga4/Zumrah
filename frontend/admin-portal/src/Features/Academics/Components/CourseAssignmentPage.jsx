import { useEffect, useState } from 'react';
import { getColleges } from '../api/collegesApi';
import {
  assignCourseToMajor,
  getCourses,
  getMajorCourses,
} from '../api/coursesApi';
import './CourseAssignmentPage.css';

export default function CourseAssignmentPage() {
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState('');
  const [majorCourses, setMajorCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isMajorCoursesLoading, setIsMajorCoursesLoading] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState(null);

  const [error, setError] = useState('');
  const [majorCoursesError, setMajorCoursesError] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const majors = colleges.flatMap((college) => college.majors || []);

  const selectedMajor = majors.find(
    (major) => major.majorId === selectedMajorId,
  );

  const selectedCollege = colleges.find((college) =>
    (college.majors || []).some(
      (major) => major.majorId === selectedMajorId,
    ),
  );

  const availableCourses = courses.filter(
    (course) =>
      !majorCourses.some(
        (majorCourse) => majorCourse.courseId === course.courseId,
      ),
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredAvailableCourses = availableCourses
    .filter((course) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        course.courseCode.toLowerCase().includes(normalizedQuery) ||
        course.courseName.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((firstCourse, secondCourse) =>
      firstCourse.courseCode.localeCompare(secondCourse.courseCode),
    );

  function handleMajorChange(event) {
    const majorId = event.target.value;

    setSelectedMajorId(majorId);
    setMajorCourses([]);
    setSearchQuery('');
    setMajorCoursesError('');
    setAssignmentError('');
    setSuccessMessage('');
    setIsMajorCoursesLoading(Boolean(majorId));
  }

  async function handleAssign(course) {
    if (!selectedMajorId || pendingCourseId) {
      return;
    }

    setPendingCourseId(course.courseId);
    setAssignmentError('');
    setSuccessMessage('');

    try {
      await assignCourseToMajor(selectedMajorId, course.courseId);

      const data = await getMajorCourses(selectedMajorId);

      setMajorCourses(data.courses || []);
      setSuccessMessage(
        `تم إسناد ${course.courseCode} إلى ${selectedMajor.majorName} بنجاح.`,
      );
    } catch (requestError) {
      console.error('Failed to assign course:', requestError);
      setAssignmentError(
        'تعذر إسناد المقرر. قد يكون مسندًا لهذا التخصص مسبقًا.',
      );
    } finally {
      setPendingCourseId(null);
    }
  }

  useEffect(() => {
    let isCurrent = true;

    async function loadInitialData() {
      try {
        const [collegeData, courseData] = await Promise.all([
          getColleges(),
          getCourses(),
        ]);

        if (!isCurrent) {
          return;
        }

        setColleges(collegeData.colleges || []);
        setCourses(courseData.courses || []);
      } catch (requestError) {
        console.error('Failed to load assignment data:', requestError);

        if (isCurrent) {
          setError('تعذر تحميل الكليات أو المقررات. حاول مجددًا.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedMajorId) {
      return;
    }

    let isCurrent = true;

    async function loadMajorCourses() {
      try {
        const data = await getMajorCourses(selectedMajorId);

        if (isCurrent) {
          setMajorCourses(data.courses || []);
        }
      } catch (requestError) {
        console.error('Failed to load major courses:', requestError);

        if (isCurrent) {
          setMajorCoursesError('تعذر تحميل مقررات التخصص. حاول مجددًا.');
        }
      } finally {
        if (isCurrent) {
          setIsMajorCoursesLoading(false);
        }
      }
    }

    loadMajorCourses();

    return () => {
      isCurrent = false;
    };
  }, [selectedMajorId]);

  if (isLoading) {
    return (
      <section className="assignment-page" dir="rtl">
        <p className="assignment-page__state">جارٍ تحميل البيانات...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="assignment-page" dir="rtl">
        <p className="assignment-page__state" role="alert">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="assignment-page" dir="rtl">
      <header className="assignment-page__header">
        <p className="assignment-page__eyebrow">الإدارة الأكاديمية</p>
        <h1>إسناد المقررات</h1>
        <p className="assignment-page__description">
          اربط المقررات بالتخصصات لتظهر للطلاب عند التسجيل.
        </p>
      </header>

      <section className="assignment-picker" aria-labelledby="major-picker-title">
        <div>
          <h2 id="major-picker-title">اختر التخصص</h2>
          <p>
            اختر تخصصًا لعرض مقرراته المسندة وإسناد مقررات جديدة إليه.
          </p>
        </div>

        <label className="assignment-field" htmlFor="major">
          <span>التخصص</span>

          <select
            id="major"
            value={selectedMajorId}
            onChange={handleMajorChange}
            disabled={pendingCourseId !== null}
          >
            <option value="">اختر التخصص</option>

            {colleges
              .filter((college) => college.majors.length > 0)
              .map((college) => (
                <optgroup key={college.collegeId} label={college.collegeName}>
                  {college.majors.map((major) => (
                    <option key={major.majorId} value={major.majorId}>
                      {major.majorName}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </label>
      </section>

      {!selectedMajorId ? (
        <section className="assignment-empty">
          <h2>اختر تخصصًا للبدء</h2>
          <p>
            اختر تخصصًا من القائمة أعلاه لعرض مقرراته وإسناد مقررات جديدة إليه.
          </p>
        </section>
      ) : (
        <div className="assignment-grid">
          <section className="assignment-panel">
            <header className="assignment-panel__header">
              <div>
                <h2>مقررات {selectedMajor?.majorName}</h2>
                <p>{selectedCollege?.collegeName}</p>
              </div>

              {!isMajorCoursesLoading && (
                <span className="assignment-count">
                  {majorCourses.length} مقرر
                </span>
              )}
            </header>

            {isMajorCoursesLoading && (
              <p className="assignment-panel__state">
                جارٍ تحميل المقررات المسندة...
              </p>
            )}

            {majorCoursesError && (
              <p className="assignment-error" role="alert">
                {majorCoursesError}
              </p>
            )}

            {!isMajorCoursesLoading &&
              !majorCoursesError &&
              majorCourses.length === 0 && (
                <div className="assignment-panel__empty">
                  <h3>لا توجد مقررات مسندة بعد</h3>
                  <p>اختر مقررًا من القائمة الأخرى ثم اضغط إسناد.</p>
                </div>
              )}

            {!isMajorCoursesLoading &&
              !majorCoursesError &&
              majorCourses.length > 0 && (
                <ul className="assignment-list">
                  {majorCourses.map((course) => (
                    <li key={course.courseId} className="assignment-row">
                      <span className="assignment-course-code" dir="ltr">
                        {course.courseCode}
                      </span>

                      <span className="assignment-course-name">
                        {course.courseName}
                      </span>

                      <span className="assignment-status">مُسند</span>
                    </li>
                  ))}
                </ul>
              )}
          </section>

          <section className="assignment-panel">
            <header className="assignment-panel__header">
              <div>
                <h2>إسناد مقرر</h2>
                <p>المقررات غير المسندة لهذا التخصص.</p>
              </div>
            </header>

            <label className="assignment-search" htmlFor="course-search">
              <span>البحث عن مقرر لإسناده</span>

              <input
                id="course-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ابحث برمز المقرر أو اسمه"
                disabled={isMajorCoursesLoading || pendingCourseId !== null}
              />
            </label>

            {assignmentError && (
              <p className="assignment-error" role="alert">
                {assignmentError}
              </p>
            )}

            {successMessage && (
              <p className="assignment-success">{successMessage}</p>
            )}

            {isMajorCoursesLoading && (
              <p className="assignment-panel__state">جارٍ تحميل المقررات...</p>
            )}

            {!isMajorCoursesLoading && filteredAvailableCourses.length === 0 && (
              <div className="assignment-panel__empty">
                <h3>
                  {normalizedQuery
                    ? 'لا توجد مقررات مطابقة'
                    : 'جميع المقررات مسندة'}
                </h3>

                <p>
                  {normalizedQuery
                    ? 'جرّب البحث بكلمة أو رمز مقرر مختلف.'
                    : 'أُسندت جميع المقررات المتاحة لهذا التخصص.'}
                </p>
              </div>
            )}

            {!isMajorCoursesLoading && filteredAvailableCourses.length > 0 && (
              <ul className="assignment-list">
                {filteredAvailableCourses.map((course) => (
                  <li key={course.courseId} className="assignment-row">
                    <span className="assignment-course-code" dir="ltr">
                      {course.courseCode}
                    </span>

                    <span className="assignment-course-name">
                      {course.courseName}
                    </span>

                    <button
                      className="assignment-button"
                      type="button"
                      onClick={() => handleAssign(course)}
                      disabled={pendingCourseId !== null}
                    >
                      {pendingCourseId === course.courseId
                        ? 'جارٍ الإسناد...'
                        : 'إسناد'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </section>
  );
}