import { useNavigate } from "react-router-dom";
import { useState, useEffect  } from "react";
import { getStudentProfile } from "../Students/studentApi";
import { getAvailableCourses, getEnrolledCourses, enrollInCourse, unenrollFromCourse   } from "./coursesApi";
//---------------------------------------------------------------------------------------------------------
 import "./CoursesPage.css"; 
import PlatformLayout from "../../Components/Platform/PlatformLayout";
import CourseCard from "../Courses/Components/CourseCard";
//---------------------------------------------------------------------------------------------------------
  
export default function CoursesPage() {
//---------------------------------------------------------------------------------------------------------
  
// Store the student profile received from the backend
  const [student, setStudent] = useState(null);
// Store available courses received from the backend
  const [availableCourses, setAvailableCourses] = useState([]);
// Store enrolled courses received from the backend
  const [enrolledCourses, setEnrolledCourses] = useState([]);
// Navigate to Home and open the course chat when the student clicks "Open Chat"
  const navigate = useNavigate();
  //---------------------------------------------------------------------------------------------------------
  
  // Fetch student profile when the Courses Page loads
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

  // Fetch available courses when the Courses Page loads
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

  // Fetch enrolled courses when the Courses Page loads
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
  //---------------------------------------------------------------------------------------------------------
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

  // Handle course unenrollment when the Leave button is clicked
  async function handleLeave(courseId) {
    try {
      // Send the DELETE request to the backend
      await unenrollFromCourse(courseId);

      // Refresh available courses
      const availableData = await getAvailableCourses();
      setAvailableCourses(availableData.courses);

      // Refresh enrolled courses
      const enrolledData = await getEnrolledCourses();
      setEnrolledCourses(enrolledData.courses);

      // Show a success message
      window.alert('تم حذف المقرر بنجاح');

    } catch (error) {
      // Log the error in the browser console
      console.error('Failed to leave course:', error);

      // Student is not enrolled in the course
      if (error.status === 404) {
        window.alert('أنت غير مسجل في هذا المقرر');
      } else {
        // Handle any other error
        window.alert('تعذر الانسحاب من المقرر');
      }
    }
  }

  //---------------------------------------------------------------------------------------------------------
  return (

    <PlatformLayout
      active="courses"
      title="المقررات"
      student={student}
    >
      <div className="zumrah-courses" dir="rtl">
        <h1>المقررات</h1>
        {/* Enrolled Courses */}
        <section>
          <h2>مقرراتي</h2>
          <div className="courses-grid">
            {enrolledCourses.length === 0 ? (
              <p>لم تنضم إلى أي مقرر بعد.</p>
            ) : (
              enrolledCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  status="enrolled"
                  onLeave={() => handleLeave(course.courseId)}

                  onOpenChat={() => navigate("/home", {
                    state: { roomId: course.chatRoomId },
                  })}

                  onOpenFiles={() => window.alert("الملفات قريبًا")}
                />
              ))
            )}
          </div>
        </section>
        {/* Course Communities */}
        <section className="home-communities">

          <h2>استكشف مجتمعات زمرة</h2>

          <div className="courses-grid">

            {availableCourses
              .filter((course) => !course.isEnrolled)
              .map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  status={course.isEnrolled ? "enrolled" : "available"}
                  onEnroll={() => handleJoin(course.courseId)}
                  onLeave={() => handleLeave(course.courseId)}
                  onOpenChat={() => window.alert("المحادثة قريبًا")}
                  onOpenFiles={() => window.alert("الملفات قريبًا")}
                />
              ))}

          </div>
        </section>
      </div>
    </PlatformLayout>

  );
}


