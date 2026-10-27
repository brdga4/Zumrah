
import Button from '../../Components/Button';
import './HomePage.css';
import { useState, useEffect } from 'react';
import { getStudentProfile } from './studentApi';
import { getAvailableCourses, getEnrolledCourses, enrollInCourse } from '../Courses/coursesApi';



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


  // Handle course enrollment when the Join button is clicked
  async function handleJoin(courseId) {
    try {
      // Send the selected course ID to the backend
      await enrollInCourse(courseId);
      
      // Refresh available courses after enrollment
      const availableData = await getAvailableCourses();
      setAvailableCourses(availableData.courses);
      // Refresh enrolled courses after enrollment
      const enrolledData = await getEnrolledCourses();
      setEnrolledCourses(enrolledData.courses);

     // Show a success message
      window.alert('تم الانضمام إلى المقرر بنجاح');
    }  catch (error) {
      // Log the error in the browser console
      console.error('Failed to enroll in course:', error);

      // Student is already enrolled
      if (error.status === 409) {
        window.alert('أنت مسجل في هذا المقرر بالفعل');

      // Course does not exist
      } else if (error.status === 404) {
        window.alert('المقرر غير موجود');

      // Course is not available for the student's major
      } else if (error.status === 400) {
        window.alert('هذا المقرر غير متاح لتخصصك');

      // Handle any other error
      } else {
        window.alert('تعذر الانضمام إلى المقرر');
      }
    }   

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
                    onClick={() => handleJoin(course.courseId)}
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

