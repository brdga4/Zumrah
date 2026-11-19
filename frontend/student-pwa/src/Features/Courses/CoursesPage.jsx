import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { getStudentProfile } from "../Students/studentApi";
import { getAvailableCourses, getEnrolledCourses, enrollInCourse, unenrollFromCourse   } from "./coursesApi";
//---------------------------------------------------------------------------------------------------------
import "./CoursesPage.css";
import PlatformLayout from "../../Components/Platform/PlatformLayout";
import Heading from "../../Components/Heading";
import CourseCard from "../Courses/Components/CourseCard";
import WelcomeSection from "../Students/Components/WelcomeSection";
import Button from "../../Components/Button";
import ConfirmDialog from "../../Components/ConfirmDialog";
import LoadingIndicator from "../../Components/LoadingIndicator";
import { useToast } from "../../Components/ToastContext";
//---------------------------------------------------------------------------------------------------------
  
export default function CoursesPage() {
//---------------------------------------------------------------------------------------------------------
  
// Store the student profile received from the backend
  const [student, setStudent] = useState(null);
// Keep each list's data, loading and error state together.
  const [availableList, setAvailableList] = useState({ courses: [], loading: true, error: "" });
  const [enrolledList, setEnrolledList] = useState({ courses: [], loading: true, error: "" });
  const [pendingCourses, setPendingCourses] = useState({});
  const [courseToLeave, setCourseToLeave] = useState(null);
  const [leaveError, setLeaveError] = useState("");
  const pendingRequests = useRef(new Set());
  const listRequests = useRef({ available: 0, enrolled: 0 });
  const mountedRef = useRef(false);
  const leaveTriggerRef = useRef(null);
  const enrolledHeadingRef = useRef(null);
  const { notify, dismiss } = useToast();
// Navigate to the separate Chat page when a course action is selected.
  const navigate = useNavigate();
  //---------------------------------------------------------------------------------------------------------
  
  const loadCourseList = useCallback((list) => {
    const setList = list === "available" ? setAvailableList : setEnrolledList;
    const getCourses = list === "available" ? getAvailableCourses : getEnrolledCourses;
    const requestId = ++listRequests.current[list];
    return getCourses().then((data) => {
      // An older request must not replace a more recent refresh or update an unmounted page.
      if (!mountedRef.current || requestId !== listRequests.current[list]) return;
      setList({ courses: data.courses ?? [], loading: false, error: "" });
    }).catch((error) => {
      if (!mountedRef.current || requestId !== listRequests.current[list]) return;
      console.error(`Failed to load ${list} courses:`, error);
      setList((current) => ({
        ...current,
        loading: false,
        error: list === "available"
          ? "تعذر تحديث قائمة المقررات المتاحة. أعد المحاولة لتحميل القائمة."
          : "تعذر تحديث قائمة المقررات المسجّلة. أعد المحاولة لتحميل القائمة.",
      }));
    });
  }, []);

  // Fetch student profile when the Courses Page loads
  useEffect(() => {
    let active = true;
    mountedRef.current = true;
    const requests = listRequests.current;
    async function loadStudent() {
      try {
        // Call our API function
        const data = await getStudentProfile();

        // Store the response in React state
        if (active) setStudent(data);
      } catch (error) {
        console.error('Failed to load student:', error);
      }
    }

    loadStudent();
    // Fetch available and enrolled courses independently so either section can recover.
    loadCourseList("available");
    loadCourseList("enrolled");

    return () => {
      active = false;
      mountedRef.current = false;
      requests.available++;
      requests.enrolled++;
    };
  }, [loadCourseList]);

  useEffect(() => {
    if (courseToLeave || !leaveTriggerRef.current) return;
    // A successful withdrawal can remove the trigger; a refresh can temporarily disable it.
    if (!leaveTriggerRef.current.isConnected || leaveTriggerRef.current.disabled) {
      enrolledHeadingRef.current?.focus();
    }
    leaveTriggerRef.current = null;
  }, [courseToLeave]);

  function beginCourseAction(courseId, action) {
    // The ref blocks repeated clicks immediately, before React renders disabled buttons.
    if (pendingRequests.current.has(courseId)) return false;
    pendingRequests.current.add(courseId);
    setPendingCourses((current) => ({ ...current, [courseId]: action }));
    return true;
  }

  function finishCourseAction(courseId) {
    pendingRequests.current.delete(courseId);
    if (!mountedRef.current) return;
    setPendingCourses((current) => {
      const next = { ...current };
      delete next[courseId];
      return next;
    });
  }

  function reloadCourseList(list) {
    // Initial state is already loading; only user-triggered reloads need this reset.
    const setList = list === "available" ? setAvailableList : setEnrolledList;
    setList((current) => ({ ...current, loading: true, error: "" }));
    return loadCourseList(list);
  }

  async function refreshCourseLists() {
    // These GET failures have their own inline feedback and must never repeat a mutation.
    await Promise.all([reloadCourseList("available"), reloadCourseList("enrolled")]);
  }
  //---------------------------------------------------------------------------------------------------------
  // Handle course enrollment when the Join button is clicked
  async function handleJoin(courseId) {
    if (!beginCourseAction(courseId, "join")) return;
    const toastId = `course-join-${courseId}`;
    dismiss(toastId);
    try {
      try {
        // Send the selected course ID to the backend
        await enrollInCourse(courseId);
      } catch (error) {
        console.error('Failed to enroll in course:', error);
        // Centralized authentication handling already owns 401 redirects.
        if (mountedRef.current && error.status !== 401) {
          const messages = {
            409: "أنت مسجل في هذا المقرر بالفعل",
            404: "المقرر غير موجود",
            400: "هذا المقرر غير متاح لتخصصك",
          };
          notify({ id: toastId, type: "error", message: messages[error.status] || "تعذر الانضمام إلى المقرر" });
        }
        return;
      }

      if (!mountedRef.current) return;
      setAvailableList((current) => ({
        ...current,
        courses: current.courses.filter((course) => course.courseId !== courseId),
      }));
      notify({ id: toastId, type: "success", message: "تم الانضمام إلى المقرر بنجاح." });
      // A failed refresh must not be reported as a failed enrollment.
      await refreshCourseLists();
    } finally {
      finishCourseAction(courseId);
    }
  }

  function openLeaveDialog(course, trigger) {
    if (pendingRequests.current.has(course.courseId)) return;
    // Confirm withdrawal before calling the API.
    leaveTriggerRef.current = trigger;
    setLeaveError("");
    setCourseToLeave(course);
  }

  function closeLeaveDialog() {
    if (courseToLeave && pendingRequests.current.has(courseToLeave.courseId)) return;
    setCourseToLeave(null);
    setLeaveError("");
  }

  // Handle course unenrollment when the Leave button is clicked
  async function handleLeave() {
    if (!courseToLeave) return;
    const courseId = courseToLeave.courseId;
    if (!beginCourseAction(courseId, "leave")) return;
    setLeaveError("");
    try {
      try {
        // Send the DELETE request to the backend
        await unenrollFromCourse(courseId);
      } catch (error) {
        console.error('Failed to leave course:', error);
        if (mountedRef.current && error.status !== 401) {
          setLeaveError(error.status === 404
            ? "أنت غير مسجل في هذا المقرر."
            : "تعذر مغادرة المقرر. حاول مرة أخرى.");
        }
        return;
      }

      if (!mountedRef.current) return;
      setEnrolledList((current) => ({
        ...current,
        courses: current.courses.filter((course) => course.courseId !== courseId),
      }));
      setCourseToLeave(null);
      const toastId = `course-leave-${courseId}`;
      dismiss(toastId);
      notify({ id: toastId, type: "success", message: "تمت مغادرة المقرر بنجاح." });
      // Refresh errors remain list errors after the withdrawal has succeeded.
      await refreshCourseLists();
    } finally {
      finishCourseAction(courseId);
    }
  }

  const availableCourses = availableList.courses.filter((course) => !course.isEnrolled);

  //---------------------------------------------------------------------------------------------------------
  // Identify Courses as Home while keeping the normal scrolling page layout.
  return (

    <PlatformLayout
      active="home"
      student={student}
    >
      <div className="zumrah-courses" dir="rtl">
        <Heading level={1} className="courses-page-title">المقررات</Heading>
        {/* Reuse the profile already loaded here instead of making another request. */}
        <WelcomeSection student={student} />
        {/* Enrolled Courses */}
        <section aria-labelledby="enrolled-courses-title">
          <h2 id="enrolled-courses-title" ref={enrolledHeadingRef} tabIndex={-1}>المقررات المسجّلة</h2>
          {/* Display shared loading feedback without hiding the Welcome section. */}
          {enrolledList.loading && (
            <div className="courses-list-status">
              <LoadingIndicator label="جارٍ تحميل المقررات المسجّلة..." />
            </div>
          )}
          {enrolledList.error && (
            <div className="courses-list-error">
              <p role="alert">{enrolledList.error}</p>
              <Button variant="secondary" size="sm" onClick={() => reloadCourseList("enrolled")}>
                إعادة المحاولة
              </Button>
            </div>
          )}
          <div className="courses-grid">
            {!enrolledList.loading && !enrolledList.error && enrolledList.courses.length === 0 ? (
              <p>لم تنضم إلى أي مقرر بعد.</p>
            ) : (
              enrolledList.courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  status="enrolled"
                  disabled={Boolean(pendingCourses[course.courseId]) || enrolledList.loading || Boolean(enrolledList.error)}
                  onLeave={(event) => openLeaveDialog(course, event.currentTarget)}

                  onOpenChat={() => navigate("/chat", {
                    // Preserve the selected course room for desktop and mobile Chat.
                    state: { roomId: course.chatRoomId },
                  })}

                  onOpenFiles={() => navigate(`/courses/${course.courseId}/files`)}
                />
              ))
            )}
          </div>
        </section>
        {/* Course Communities */}
        <section className="home-communities" aria-labelledby="available-courses-title">

          <h2 id="available-courses-title">المقررات المتاحة لتخصصك</h2>
          {availableList.loading && (
            <div className="courses-list-status">
              <LoadingIndicator label="جارٍ تحميل المقررات المتاحة..." />
            </div>
          )}
          {availableList.error && (
            <div className="courses-list-error">
              <p role="alert">{availableList.error}</p>
              <Button variant="secondary" size="sm" onClick={() => reloadCourseList("available")}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          <div className="courses-grid">

            {!availableList.loading && !availableList.error && availableCourses.length === 0 ? (
              <p>لا توجد مقررات متاحة لتخصصك حاليًا.</p>
            ) : availableCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  status="available"
                  enrolling={pendingCourses[course.courseId] === "join"}
                  disabled={Boolean(pendingCourses[course.courseId]) || availableList.loading || Boolean(availableList.error)}
                  onEnroll={() => handleJoin(course.courseId)}
                />
              ))}

          </div>
        </section>
      </div>
      {courseToLeave && (
        <ConfirmDialog
          open
          title="مغادرة المقرر"
          message={`هل انت متأكدمن مغادرة مقرر ${courseToLeave.courseName} `}
          confirmLabel="مغادرة المقرر"
          loadingLabel="جارٍ مغادرة المقرر..."
          destructive
          loading={pendingCourses[courseToLeave.courseId] === "leave"}
          error={leaveError}
          onConfirm={handleLeave}
          onClose={closeLeaveDialog}
          returnFocusRef={leaveTriggerRef}
        />
      )}
    </PlatformLayout>

  );
}


