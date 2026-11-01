import "./ProfilePage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PlatformLayout from "../../Components/Platform/PlatformLayout";
import Card from "../../Components/Card";
import Heading from "../../Components/Heading";
import Text from "../../Components/Text";
import {
  getStudentProfile,
  getMajorsByCollege,
  updateStudentProfile,
} from "./studentApi";

export default function ProfilePage() {
  const [student, setStudent] = useState(null);

  // Editable profile fields
const [name, setName] = useState("");
const [majorId, setMajorId] = useState("");
const [majors, setMajors] = useState([]);

// Save operation state
const [isSaving, setIsSaving] = useState(false);

// for navigation after logout
const navigate = useNavigate(); 

  useEffect(() => {
    getStudentProfile()
      .then((data) => {
        setStudent(data);
        setName(data.name);
        setMajorId(data.major?.majorId || "");
        // Load available majors for the student's college
        if (data.college?.collegeId) {
          getMajorsByCollege(data.college.collegeId)
            .then((result) => {
              setMajors(result.majors ?? result);
            })
            .catch((error) => {
              console.error("Failed to load majors:", error);
            });
        }
      })
      .catch((error) => console.error("Failed to load profile:", error));
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  }

  return (
    <PlatformLayout
      active="profile"
      title="الملف الشخصي"
      student={student}
    >
      <Card className="profile-card">
        <Heading level={2}>معلومات الطالب</Heading>

        {student ? (
          <>
            {/* Editable student name */}
            <label className="profile-field">
              <span>الاسم الكامل</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
              />
            </label>
            <Text>البريد الجامعي: {student.universityEmail}</Text>
            <Text>الكلية: {student.college?.collegeName}</Text>
            {/* Editable student major */}
            <label className="profile-field">
              <span>التخصص</span>

              <select
                value={majorId}
                onChange={(event) => setMajorId(event.target.value)}
              >
                {majors.map((major) => (
                  <option key={major.majorId} value={major.majorId}>
                    {major.majorName}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <Text>جارٍ تحميل البيانات...</Text>
        )}

        <button type="button" onClick={handleLogout}>
          تسجيل الخروج
        </button>
      </Card>
    </PlatformLayout>
  );
}