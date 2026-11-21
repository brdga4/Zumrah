
import "./ProfilePage.css";

import { useEffect, useState } from "react";
import Avatar from "../../Components/Avatar";
import Button from "../../Components/Button";
import Card from "../../Components/Card";
import Heading from "../../Components/Heading";
import InputField from "../../Components/InputField";
import LoadingIndicator from "../../Components/LoadingIndicator";
import PlatformLayout from "../../Components/Platform/PlatformLayout";
import SelectField from "../../Components/SelectField";

import {
  getStudentProfile,
  getColleges,
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
  // Store all available colleges.
  const [colleges, setColleges] = useState([]);

  // Store the college selected by the student.
  const [collegeId, setCollegeId] = useState("");
  const [majorsError, setMajorsError] = useState(false);

  // Track loading and saving operations
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Store success or error feedback
  const [feedback, setFeedback] = useState(null);

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
        // Set the student's current college as the initial selection.
        setCollegeId(String(data.college?.collegeId || ""));

        // Load all colleges and their majors.
        try {
          const allColleges = await getColleges();

          if (!active) return;

          setColleges(allColleges);

          // Find the student's current college.
          const currentCollege = allColleges.find(
            (college) =>
              String(college.collegeId) === String(data.college?.collegeId)
          );

          // Display majors from the student's current college.
          setMajors(currentCollege?.majors ?? []);

        } catch (error) {
          console.error("Failed to load colleges:", error);

          if (active) {
            setMajorsError(true);
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
      // Update the selected college after saving.
      const savedCollegeId = String(updatedStudent.college?.collegeId || "");
      setCollegeId(savedCollegeId);

      // Display majors belonging to the saved college.
      const savedCollege = colleges.find(
        (college) => String(college.collegeId) === savedCollegeId
      );

      setMajors(savedCollege?.majors ?? []);

      // Show success feedback
      setFeedback({
        type: "success",
        message: majorChanged
          ? "تم حفظ التغييرات. تم إلغاء تسجيلاتك السابقة في المقررات بسبب تغيير التخصص."
          : "تم حفظ التغييرات بنجاح",
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
    // Restore the student's original college.
    const originalCollegeId = String(student.college?.collegeId || "");
    setCollegeId(originalCollegeId);

    // Restore majors belonging to the original college.
    const originalCollege = colleges.find(
      (college) => String(college.collegeId) === originalCollegeId
    );

    setMajors(originalCollege?.majors ?? []);

    // Clear previous feedback
    setFeedback(null);
  }


  const collegeOptions = colleges.map((college) => ({
    value: college.collegeId,
    label: college.collegeName,
  }));
  const majorOptions = majors.map((major) => ({
    value: major.majorId,
    label: major.majorName,
  }));

  // Keep the saved major visible if it is missing from its college's catalog.
  if (
    originalMajorId &&
    collegeId === String(student?.college?.collegeId || "") &&
    !majorOptions.some((option) => String(option.value) === originalMajorId)
  ) {
    majorOptions.unshift({ value: originalMajorId, label: student.major.majorName });
  }

  return (
    <PlatformLayout
      active="profile"
      title="الملف الشخصي"
      subtitle="إدارة بياناتك الشخصية والأكاديمية"
    >
      {isLoading ? (
        <div className="profile-loading">
          <LoadingIndicator label="جارٍ تحميل بيانات الملف الشخصي..." />
        </div>
      ) : (
        <Card className="profile-card">
          {!student ? (
            <p role="alert">تعذر عرض الملف الشخصي. حاول تحديث الصفحة.</p>
          ) : (
            <form className="profile-form" onSubmit={handleSave}>
              <Avatar name={student.name?.trim() || "ط"} size="small" />
              <section className="profile-section" aria-labelledby="profile-personal-title">
                <Heading level={2} id="profile-personal-title">المعلومات الشخصية</Heading>

                <InputField
                  id="profile-name"
                  label="الاسم"
                  value={name}
                  maxLength={100}
                  disabled={isSaving}
                  onChange={(event) => {
                    setName(event.target.value);
                    setFeedback(null);
                  }}
                />
              </section>

              <section className="profile-section" aria-labelledby="profile-academic-title">
                <Heading level={2} id="profile-academic-title">المعلومات الأكاديمية</Heading>

                <dl className="profile-email">
                  <dt>البريد الجامعي</dt>
                  <dd><bdi dir="ltr">{student.universityEmail}</bdi></dd>
                </dl>

                <div className="profile-academic-grid">
                  <SelectField
                    id="profile-college"
                    label="الكلية"
                    placeholder="اختر الكلية"
                    options={collegeOptions}
                    value={collegeId}
                    disabled={isSaving || majorsError}
                    onChange={(event) => {
                      const selectedCollegeId = event.target.value;
                      setCollegeId(selectedCollegeId);
                      const selectedCollege = colleges.find(
                        (college) => String(college.collegeId) === selectedCollegeId
                      );
                      setMajorId("");
                      setMajors(selectedCollege?.majors ?? []);
                      setFeedback(null);
                    }}
                  />
                  <SelectField
                    id="profile-major"
                    label="التخصص"
                    placeholder="اختر التخصص"
                    options={majorOptions}
                    value={majorId}
                    disabled={isSaving || majorsError}
                    onChange={(event) => {
                      setMajorId(event.target.value);
                      setFeedback(null);
                    }}
                  />
                </div>

                {majorsError && (
                  <p className="profile-feedback profile-feedback--error" role="alert">
                    تعذر تحميل قائمة التخصصات.
                  </p>
                )}
              </section>

              {feedback && (
                <p
                  className={`profile-feedback profile-feedback--${feedback.type}`}
                  role={feedback.type === "error" ? "alert" : "status"}
                >
                  {feedback.message}
                </p>
              )}

              <div className="profile-actions">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={handleCancel}
                  disabled={!hasChanges || isSaving}
                >
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={!hasChanges}
                  loading={isSaving}
                >
                  {isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}
    </PlatformLayout>
  );
}
