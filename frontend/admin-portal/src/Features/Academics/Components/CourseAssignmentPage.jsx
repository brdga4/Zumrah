import { useEffect, useState } from 'react';
import Badge from '@student/Components/Badge';
import Button from '@student/Components/Button';
import Card from '@student/Components/Card';
import FormField from '@student/Components/FormField';
import Heading from '@student/Components/Heading';
import InputField from '@student/Components/InputField';
import LoadingIndicator from '@student/Components/LoadingIndicator';
import Text from '@student/Components/Text';
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
        <Card className="assignment-page__state">
          <LoadingIndicator label="جارٍ تحميل البيانات..." />
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="assignment-page" dir="rtl">
        <Card className="assignment-page__state">
          <Text className="assignment-error" role="alert">
          {error}
          </Text>
        </Card>
      </section>
    );
  }

  return (
    <section className="assignment-page" dir="rtl">
      <header className="assignment-page__header">
        <Badge variant="soft" className="assignment-page__eyebrow">الإدارة الأكاديمية</Badge>
        <Heading level={1}>إسناد المقررات</Heading>
        <Text tone="muted" className="assignment-page__description">
          اربط المقررات بالتخصصات لتظهر للطلاب عند التسجيل.
        </Text>
      </header>

      <Card className="assignment-picker" aria-labelledby="major-picker-title">
        <div>
          <Heading level={2} id="major-picker-title">اختر التخصص</Heading>
          <Text tone="muted">
            اختر تخصصًا لعرض مقرراته المسندة وإسناد مقررات جديدة إليه.
          </Text>
        </div>

        <FormField
          as="select"
            id="major"
          label="التخصص"
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
        </FormField>
      </Card>

      {selectedMajorId && (
        <div className="assignment-grid">
          <Card className="assignment-panel">
            <header className="assignment-panel__header">
              <div>
                <Heading level={2}>مقررات {selectedMajor?.majorName}</Heading>
                <Text tone="muted">{selectedCollege?.collegeName}</Text>
              </div>

              {!isMajorCoursesLoading && (
                <Badge variant="soft" className="assignment-count">
                  {majorCourses.length} مقرر
                </Badge>
              )}
            </header>

            {isMajorCoursesLoading && (
              <LoadingIndicator label="جارٍ تحميل المقررات المسندة..." />
            )}

            {majorCoursesError && (
              <Text className="assignment-error" role="alert">
                {majorCoursesError}
              </Text>
            )}

            {!isMajorCoursesLoading &&
              !majorCoursesError &&
              majorCourses.length === 0 && (
                <div className="assignment-panel__empty">
                  <Heading level={3}>لا توجد مقررات مسندة بعد</Heading>
                  <Text tone="muted">اختر مقررًا من القائمة الأخرى ثم اضغط إسناد.</Text>
                </div>
              )}

            {!isMajorCoursesLoading &&
              !majorCoursesError &&
              majorCourses.length > 0 && (
                <ul className="assignment-list">
                  {majorCourses.map((course) => (
                    <li key={course.courseId} className="assignment-row">
                      <Badge variant="soft" className="assignment-course-code" dir="ltr">
                        {course.courseCode}
                      </Badge>

                      <span className="assignment-course-name">
                        {course.courseName}
                      </span>

                      <Badge variant="success" className="assignment-status">مُسند</Badge>
                    </li>
                  ))}
                </ul>
              )}
          </Card>

          <Card className="assignment-panel">
            <header className="assignment-panel__header">
              <div>
                <Heading level={2}>إسناد مقرر</Heading>
                <Text tone="muted">المقررات غير المسندة لهذا التخصص.</Text>
              </div>
            </header>

            <InputField
              id="course-search"
              label="البحث عن مقرر لإسناده"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث برمز المقرر أو اسمه"
              disabled={isMajorCoursesLoading || pendingCourseId !== null}
            />

            {assignmentError && (
              <Text className="assignment-error" role="alert">
                {assignmentError}
              </Text>
            )}

            {successMessage && (
              <Text className="assignment-success">{successMessage}</Text>
            )}

            {isMajorCoursesLoading && (
              <LoadingIndicator label="جارٍ تحميل المقررات..." />
            )}

            {!isMajorCoursesLoading && filteredAvailableCourses.length === 0 && (
              <div className="assignment-panel__empty">
                  <Heading level={3}>
                  {normalizedQuery
                    ? 'لا توجد مقررات مطابقة'
                    : 'جميع المقررات مسندة'}
                  </Heading>

                  <Text tone="muted">
                  {normalizedQuery
                    ? 'جرّب البحث بكلمة أو رمز مقرر مختلف.'
                    : 'أُسندت جميع المقررات المتاحة لهذا التخصص.'}
                  </Text>
              </div>
            )}

            {!isMajorCoursesLoading && filteredAvailableCourses.length > 0 && (
              <ul className="assignment-list">
                {filteredAvailableCourses.map((course) => (
                  <li key={course.courseId} className="assignment-row">
                    <Badge variant="soft" className="assignment-course-code" dir="ltr">
                      {course.courseCode}
                    </Badge>

                    <span className="assignment-course-name">
                      {course.courseName}
                    </span>

                    <Button
                      className="assignment-button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAssign(course)}
                      disabled={pendingCourseId !== null}
                      loading={pendingCourseId === course.courseId}
                    >
                      {pendingCourseId === course.courseId
                        ? 'جارٍ الإسناد...'
                        : 'إسناد'}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </section>
  );
}
