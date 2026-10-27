// ==========================================
// 1. IMPORT SHARED COMPONENTS
// Import reusable React components from the shared Components folder.
// ==========================================

import Card from "../../../Components/Card";
import Badge from "../../../Components/Badge";
import Heading from "../../../Components/Heading";
import Button from "../../../Components/Button";
import "./CourseCard.css";

// ==========================================
// 2. RECEIVE PROPS FROM HOMEPAGE
// Receive course data, enrollment status, and action functions.
// HomePage passes these props to CourseCard.
// ==========================================

export default function CourseCard({
  course,
  status,
  onEnroll,
  onLeave,
  onOpenChat,
  onOpenFiles,
}) {

  return (
    <Card className={`course-card course-card-${status}`}>

      {/* ==========================================
          3. DISPLAY COURSE INFORMATION
          Show the course code, name, and enrollment status.
          Course data comes from the backend through HomePage.
          ========================================== */}

      <div className="course-card-top">

        <Badge variant="soft" className="course-card-code">
          {course.courseCode}
        </Badge>

        {status === "enrolled" && (
          <Badge variant="success">مسجّل</Badge>
        )}

      </div>

      <Heading level={3} className="course-card-title">
        {course.courseName}
      </Heading>


      {/* ==========================================
          4. CONDITIONAL RENDERING
          Show different buttons depending on enrollment status.
          Available courses show the enrollment button.
          Enrolled courses show chat, files, and leave actions.
          ========================================== */}

      <div className="course-card-actions">

        {status === "available" ? (

          <Button onClick={onEnroll}>
            التسجيل في المقرر
          </Button>

        ) : (

          <>

            {/* ==========================================
                5. HANDLE COURSE ACTIONS
                Call the functions received from HomePage.
                HomePage handles the API requests and navigation.
                ========================================== */}

            <div className="course-card-primary-actions">

              <Button onClick={onOpenChat}>
                المحادثة
              </Button>

              <Button onClick={onOpenFiles}>
                الملفات
              </Button>

            </div>

            <button
              type="button"
              className="course-card-leave"
              onClick={onLeave}
            >
              مغادرة المقرر
            </button>

          </>

        )}

      </div>

    </Card>
  );
}