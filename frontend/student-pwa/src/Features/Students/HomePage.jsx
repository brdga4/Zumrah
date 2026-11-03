import './HomePage.css';

import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import { getStudentProfile } from './studentApi';
import { getEnrolledCourses } from '../Courses/coursesApi';

import PlatformLayout from "../../Components/Platform/PlatformLayout";

import ChatWorkspace from "../Chat/Components/ChatWorkspace";
import ChatMessages from "../Chat/Components/ChatMessages";


// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function HomePage() {

   // Store the student profile received from the backend
  const [student, setStudent] = useState(null);
  
  // Store enrolled courses received from the backend
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  // Store the currently opened chat room
  const [activeRoom, setActiveRoom] = useState(null);
  // Read the course chat room ID passed from CoursesPage
  const location = useLocation();
 // ------------------------------------------------------------------------------------------------------------------------------------------------------------- 

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

  // Open the selected course chat when navigating from CoursesPage
  useEffect(() => {
    const roomId = location.state?.roomId;

    if (roomId == null) return;

    const course = enrolledCourses.find(
      (course) => String(course.chatRoomId) === String(roomId)
    );

    if (course) {
      setActiveRoom({
        id: course.chatRoomId,
        kind: "course",
        name: course.courseName,
      });
    }
  }, [location.state?.roomId, enrolledCourses]);
  // -------------------------------------------------------------------------------------------------------------------------------------------------------------
  
    // Prepare chat rooms using real student and course data
const chatRooms = [
  // Major chat room
  ...(student?.majorChatRoomId ? [{
    id: student.majorChatRoomId,
    kind: "major",
    name: `محادثة ${student.major?.majorName || "التخصص"}`,
    description: "المحادثة العامة لطلاب التخصص"
    }] : []),

  // Enrolled course chat rooms
  ...enrolledCourses.map((course) => ({
    id: course.chatRoomId,
    kind: "course",
    name: course.courseName,
    label: course.courseCode,
    description: "محادثة طلاب المقرر"
      }))
    ];
  

  return (
    <PlatformLayout
      active="home"
      title="الرئيسية"
      student={student}
      showSidebar={false}
      brandHeader
      subtitle="محادثات زمرتك ومقرراتك في مكان واحد"
    >
      <div className="zumrah-home">

        <div className="home-container">
          {/* Main chat workspace */}
          <ChatWorkspace
            rooms={chatRooms}
            activeRoom={activeRoom}
            onOpenRoom={setActiveRoom}
          >
            <ChatMessages
              roomId={activeRoom?.id}
              studentId={student?.studentId}
            />
          </ChatWorkspace>

        </div>
      </div>
    </PlatformLayout>
  );
}

