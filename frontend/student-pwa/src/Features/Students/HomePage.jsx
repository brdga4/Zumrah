
import Button from '../../Components/Button';
import './HomePage.css';
import { useState, useEffect } from 'react';
import { getStudentProfile } from './studentApi';
import { getAvailableCourses, getEnrolledCourses } from '../Courses/coursesApi';



export default function HomePage() {

   // Store the student profile received from the backend
  const [student, setStudent] = useState(null);
  // Store available courses received from the backend
  const [availableCourses, setAvailableCourses] = useState([]);
  // Store enrolled courses received from the backend
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  
  // Fetch student profile when the Home Page loads
  useEffect(() => {
    async function loadStudent() {
      try {
        // Call our API function
        const data = await getStudentProfile();

        // Store the response in React state
        setStudent(data);
      } catch (error) {
        console.error('Failed to load student:', error);
      }
    }

    loadStudent();
  }, []);

  
  // Fetch available courses when the Home Page loads
  useEffect(() => {
    async function loadCourses() {
      try {
        // Call our API function
        const data = await getAvailableCourses();

        // Store the courses array in React state
        setAvailableCourses(data.courses);
      } catch (error) {
        console.error('Failed to load available courses:', error);
      }
    }

    loadCourses();
  }, []);

  // Fetch enrolled courses when the Home Page loads
  useEffect(() => {
    async function loadEnrolledCourses() {
      try {
        // Call our API function
        const data = await getEnrolledCourses();

        // Store the enrolled courses array in React state
        setEnrolledCourses(data.courses);
      } catch (error) {
        console.error('Failed to load enrolled courses:', error);
      }
    }

    loadEnrolledCourses();
  }, []);


  // Temporary action until enrollment API integration.
  function handleJoin() {
    window.alert(
      'سيتم تفعيل الانضمام بعد ربط الصفحة بالباك إند.'
    );
  }

  return (
    <main className="zumrah-home" dir="rtl">

      {/* Navigation Bar */}
      <header className="home-header">
        <div className="home-header-content">

         <div className="home-logo">
             زُمْرَة
        </div>

          <span className="home-account">
            حسابي
          </span>

        </div>
      </header>

      {/* Welcome Section */}
      <div className="home-container">

        <section className="home-welcome">
          <h1>أهلًا، {student?.name || 'طالب'} 👋</h1>

          <p>
            مساحتك الجامعية للتواصل ومشاركة المعرفة
            مع طلاب جامعتك.
          </p>
        </section>
        {/* Enrolled Courses */}
        <section>
          <h2>مقرراتي</h2>

          {enrolledCourses.length === 0 ? (
            <p>لم تنضم إلى أي مقرر بعد.</p>
          ) : (
            enrolledCourses.map((course) => (
              <div key={course.courseId}>
                <h3>{course.courseName}</h3>
                <p>{course.courseCode}</p>
              </div>
            ))
          )}
        </section>
        {/* Course Communities */}
        <section className="home-communities">

          <h2>استكشف مجتمعات زمرة</h2>

          <div className="home-courses-grid">

            {availableCourses.map((course) => (
              <div
                className="home-course-card"
                key={course.courseId}
              >

                <div className="home-course-info">
                  <h3>{course.courseName}</h3>
                  <p>{course.courseCode}</p>
                </div>

                {course.isEnrolled ? (
                  <span className="home-enrolled">
                    منضم
                  </span>
                ) : (
                  <Button
                    onClick={handleJoin}
                  >
                    انضمام
                  </Button>
                )}

              </div>
            ))}

          </div>
        </section>

      </div>
    </main>
  );
}

