
import "./ProfilePage.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PlatformLayout from "../../Components/Platform/PlatformLayout";

import {
  getStudentProfile,
  getMajorsByCollege,
  updateStudentProfile,
} from "./studentApi";

// Display and edit the current student's profile
export default function ProfilePage() {

  // Store the student's current information from the backend
  const [student, setStudent] = useState(null);

  // Editable profile fields
  const [name, setName] = useState("");
  const [majorId, setMajorId] = useState("");

  // Store available majors for the student's college
  const [majors, setMajors] = useState([]);
  const [majorsError, setMajorsError] = useState(false);

  // Track loading and saving operations
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Store success or error feedback
  const [feedback, setFeedback] = useState(null);

  // React Router function for navigation
  const navigate = useNavigate();


  // ---------------------------------------------------------
  // 1. FETCH STUDENT PROFILE AND AVAILABLE MAJORS
  // ---------------------------------------------------------

  useEffect(() => {
    let active = true;

    // Get the current student's profile from the backend
    getStudentProfile()
      .then(async (data) => {
        if (!active) return;

        // Store the original student information
        setStudent(data);

        // Fill the editable fields with current values
        setName(data.name || "");
        setMajorId(String(data.major?.majorId || ""));

        // Load majors belonging to the student's college
        if (data.college?.collegeId) {
          try {
            const result = await getMajorsByCollege(
              data.college.collegeId
            );

            if (!active) return;

            // Support both { majors: [...] } and direct arrays
            const availableMajors = result.majors ?? result;

            setMajors(
              Array.isArray(availableMajors) ? availableMajors : []
            );

          } catch (error) {
            console.error("Failed to load majors:", error);

            if (active) {
              setMajorsError(true);
            }
          }
        }
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);

        if (active) {
          setFeedback({
            type: "error",
            message: "تعذر تحميل بيانات الملف الشخصي.",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    // Ignore responses after the component unmounts
    return () => {
      active = false;
    };
  }, []);


  // ---------------------------------------------------------
  // 2. DETECT UNSAVED CHANGES
  // ---------------------------------------------------------

  // Compare edited values with the original backend values
  const originalName = (student?.name || "").trim();
  const originalMajorId = String(student?.major?.majorId || "");

  const nameChanged = name.trim() !== originalName;
  const majorChanged = majorId !== originalMajorId;

  // True when the student modifies the name or major
  const hasChanges = nameChanged || majorChanged;


  // ---------------------------------------------------------
  // 3. SAVE PROFILE CHANGES
  // ---------------------------------------------------------

  async function handleSave(event) {
    // Prevent the browser from reloading the page
    event.preventDefault();

    if (!student || !hasChanges || isSaving) return;

    // Validate the student's name
    if (!name.trim()) {
      setFeedback({
        type: "error",
        message: "الاسم لا يمكن أن يكون فارغًا.",
      });
      return;
    }

    // Validate the selected major
    if (!majorId) {
      setFeedback({
        type: "error",
        message: "يرجى اختيار التخصص.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    // Send only the fields that actually changed
    const changes = {};

    if (nameChanged) {
      changes.name = name.trim();
    }

    if (majorChanged) {
      changes.majorId = majorId;
    }

    try {
      // PATCH /api/students/me
      const updatedStudent = await updateStudentProfile(changes);

      // Update the displayed profile using the backend response
      setStudent(updatedStudent);
      setName(updatedStudent.name || "");
      setMajorId(String(updatedStudent.major?.majorId || ""));

      // Show success feedback
      setFeedback({
        type: "success",
        message: majorChanged
          ? "تم حفظ التغييرات. تم إلغاء تسجيلاتك السابقة في المقررات بسبب تغيير التخصص."
          : "تم حفظ التغييرات بنجاح.",
      });

    } catch (error) {
      console.error("Failed to update profile:", error);

      // Display a suitable message for backend errors
      setFeedback({
        type: "error",
        message:
          error.status === 400
            ? "البيانات المدخلة غير صحيحة."
            : error.status === 401
              ? "انتهت صلاحية تسجيل الدخول. يرجى تسجيل الدخول مجددًا."
              : error.status === 403
                ? "ليس لديك صلاحية لتعديل الملف الشخصي."
                : "تعذر حفظ التغييرات. حاول مرة أخرى.",
      });

    } finally {
      // Re-enable the form after the request finishes
      setIsSaving(false);
    }
  }


  // ---------------------------------------------------------
  // 4. CANCEL UNSAVED CHANGES
  // ---------------------------------------------------------

  function handleCancel() {
    if (!student) return;

    // Restore the original values without calling the backend
    setName(student.name || "");
    setMajorId(String(student.major?.majorId || ""));

    // Clear previous feedback
    setFeedback(null);
  }


  // ---------------------------------------------------------
  // 5. LOG OUT
  // ---------------------------------------------------------

  function handleLogout() {
    // Remove the student's authentication token
    sessionStorage.removeItem("accessToken");

    // Redirect to login without keeping the current page in history
    navigate("/login", { replace: true });
  }


  // ---------------------------------------------------------
  // 6. RENDER THE PROFILE PAGE
  // ---------------------------------------------------------

  return (
    <PlatformLayout
      active="profile"
      title="الملف الشخصي"
      subtitle="إدارة بياناتك الشخصية والأكاديمية"
      student={student}
    >
      {isLoading ? (
        <p>جارٍ تحميل بيانات الملف الشخصي...</p>

      ) : !student ? (
        <p role="alert">
          تعذر عرض الملف الشخصي. حاول تحديث الصفحة.
        </p>

      ) : (

        <div className="profile-layout">

          {/* RIGHT CARD: Student summary */}
          <section className="profile-summary-card">

            {/* Student avatar - the only avatar on this page */}
            <div className="profile-avatar" aria-hidden="true">
              {student.name?.trim().charAt(0) || "ط"}
            </div>

            {/* Student name */}
            <h2 className="profile-student-name">
              {student.name}
            </h2>

            {/* University email */}
            <p className="profile-student-email">
              {student.universityEmail}
            </p>

            {/* Current major */}
            <span className="profile-major-badge">
              {student.major?.majorName || "غير محدد"}
            </span>

            {/* Divider above the logout button */}
            <div className="profile-summary-divider" />

            {/* Logout button */}
            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              تسجيل الخروج
            </button>

          </section>


          {/* LEFT CARD: Editable profile information */}
          <form
            className="profile-details-card"
            onSubmit={handleSave}
          >

            {/* Personal information section */}
            <div>
              <h2 className="profile-section-title">
                المعلومات الشخصية
              </h2>

              <p className="profile-section-description">
                الاسم الذي يظهر لزملائك في زمرة.
              </p>
            </div>

            {/* Editable student name */}
            <label className="profile-field">
              <span className="profile-field-label">
                الاسم
              </span>

              <input
                className="profile-field-input"
                type="text"
                value={name}
                maxLength={100}
                disabled={isSaving}
                onChange={(event) => {
                  setName(event.target.value);
                  setFeedback(null);
                }}
              />
            </label>

            <hr className="profile-section-divider" />


            {/* Academic information section */}
            <div>
              <h2 className="profile-section-title">
                المعلومات الأكاديمية
              </h2>

              <p className="profile-section-description">
                البريد الجامعي والكلية مرتبطان بسجلك الجامعي
                ولا يمكن تعديلهما.
              </p>
            </div>

            {/* Read-only university email */}
            <div className="profile-field">
              <span className="profile-field-label">
                البريد الجامعي
              </span>

              <div
                className="profile-field-readonly"
                dir="ltr"
              >
                {student.universityEmail}
              </div>

              <p className="profile-readonly-note">
                للقراءة فقط
              </p>
            </div>

            {/* College and major fields */}
            <div className="profile-academic-grid">

              {/* Read-only college */}
              <div className="profile-field">
                <span className="profile-field-label">
                  الكلية
                </span>

                <div className="profile-field-readonly">
                  {student.college?.collegeName || "غير محددة"}
                </div>

                <p className="profile-readonly-note">
                  للقراءة فقط
                </p>
              </div>

              {/* Editable major */}
              <label className="profile-field">
                <span className="profile-field-label">
                  التخصص
                </span>

                <select
                  className="profile-field-select"
                  value={majorId}
                  disabled={isSaving || majorsError}
                  onChange={(event) => {
                    setMajorId(event.target.value);
                    setFeedback(null);
                  }}
                >
                  {/* Keep the current major visible while options load */}
                  {!majors.some(
                    (major) =>
                      String(major.majorId) === originalMajorId
                  ) && originalMajorId && (
                    <option value={originalMajorId}>
                      {student.major?.majorName}
                    </option>
                  )}

                  {/* Majors returned by the backend */}
                  {majors.map((major) => (
                    <option
                      key={major.majorId}
                      value={major.majorId}
                    >
                      {major.majorName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Explain why the major cannot be changed if loading failed */}
            {majorsError && (
              <p className="profile-feedback profile-feedback--error">
                تعذر تحميل قائمة التخصصات.
              </p>
            )}

            {/* Warning about changing the major */}
            <div className="profile-major-warning">
              <span className="profile-warning-icon" aria-hidden="true">
                !
              </span>

              <span>
                تغيير التخصص يلغي جميع تسجيلاتك الحالية في المقررات.
              </span>
            </div>

            <hr className="profile-section-divider" />


            {/* Display save success or backend error */}
            {feedback && (
              <p
                className={`profile-feedback profile-feedback--${feedback.type}`}
                role={feedback.type === "error" ? "alert" : "status"}
              >
                {feedback.message}
              </p>
            )}

            {/* Save and cancel buttons */}
            <div className="profile-actions">

              {/* Explain whether the form has unsaved changes */}
              <span className="profile-change-status">
                {hasChanges
                  ? "توجد تغييرات غير محفوظة"
                  : "لا توجد تغييرات"}
              </span>

              {/* Cancel: restore the original values */}
              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={!hasChanges || isSaving}
              >
                إلغاء
              </button>

              {/* Save: submit changed fields to the backend */}
              <button
                type="submit"
                className="profile-save-button"
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>

            </div>
          </form>
        </div>
      )}
    </PlatformLayout>
  );
}
