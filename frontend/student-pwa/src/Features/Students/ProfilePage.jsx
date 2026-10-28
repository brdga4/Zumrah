import "./ProfilePage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PlatformLayout from "../../Components/Platform/PlatformLayout";
import Card from "../../Components/Card";
import Heading from "../../Components/Heading";
import Text from "../../Components/Text";
import { getStudentProfile } from "./studentApi";

export default function ProfilePage() {
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getStudentProfile()
      .then(setStudent)
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
            <Text>الاسم: {student.name}</Text>
            <Text>البريد الجامعي: {student.universityEmail}</Text>
            <Text>الكلية: {student.college?.collegeName}</Text>
            <Text>التخصص: {student.major?.majorName}</Text>
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