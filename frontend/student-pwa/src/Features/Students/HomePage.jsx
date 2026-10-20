
import Button from '../../Components/Button';
import './HomePage.css';

// Temporary course data until the backend API is ready.
const courses = [
  {
    courseId: 'demo-1',
    courseCode: 'CS101',
    courseName: 'مقدمة في البرمجة',
    isEnrolled: false,
  },
  {
    courseId: 'demo-2',
    courseCode: 'MATH101',
    courseName: 'التفاضل والتكامل',
    isEnrolled: false,
  },
  {
    courseId: 'demo-3',
    courseCode: 'EE210',
    courseName: 'الدوائر الكهربائية',
    isEnrolled: true,
  },
];

export default function HomePage() {

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
          <h1>أهلًا بك في زُمْرَة 👋</h1>

          <p>
            مساحتك الجامعية للتواصل ومشاركة المعرفة
            مع طلاب جامعتك.
          </p>
        </section>

        {/* Course Communities */}
        <section className="home-communities">

          <h2>استكشف مجتمعات زمرة</h2>

          <div className="home-courses-grid">

            {courses.map((course) => (
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

