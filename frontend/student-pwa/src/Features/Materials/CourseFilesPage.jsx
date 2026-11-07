import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseFiles, downloadCourseFile } from "./materialsApi";
import "./CourseFilesPage.css";
import { getEnrolledCourses } from "../Courses/coursesApi";

// Import the upload popup component
import UploadFileDialog from "./Components/UploadFileDialog";

export default function CourseFilesPage() {
    const { courseId } = useParams();

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

//----------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        async function loadFiles() {
            try {
                const data = await getCourseFiles(courseId);
                setFiles(data.files ?? []);
            } catch (err) {
                setError(
                    err.status === 403
                        ? "ليس لديك صلاحية لعرض ملفات هذا المقرر"
                        : "تعذر جلب الملفات"
                );
            } finally {
                setLoading(false);
            }
        }

        loadFiles();
    }, [courseId]);
//----------------------------------------------------------------------------------------------------------------------------------
    const navigate = useNavigate();
//----------------------------------------------------------------------------------------------------------------------------------
function getFileType(fileName) {
  const parts = fileName.split(".");
  const extension = parts[parts.length - 1];

  return extension.toUpperCase();
}

function getFileDate(uploadedAt) {
  const date = new Date(uploadedAt);

  return date.toLocaleDateString("en-SA");
}
//----------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------------------
const [courseName, setCourseName] = useState("");

useEffect(() => {
  async function loadCourseName() {
    try {
      const data = await getEnrolledCourses();

      const course = data.courses.find(
        (item) => item.courseId === courseId
      );

      if (course) {
        setCourseName(course.courseName);
      }
    } catch (error) {
      console.error("Failed to load course name:", error);
    }
  }

  loadCourseName();
}, [courseId]);
//----------------------------------------------------------------------------------------------------------------------------------
// Controls whether the upload popup is visible
const [isUploadOpen, setIsUploadOpen] = useState(false);

// Stores the message shown after a successful upload
const [uploadMessage, setUploadMessage] = useState("");

//----------------------------------------------------------------------------------------------------------------------------------

// Download the selected course file
async function handleDownload(file) {
  try {
    // Get the file content from the backend
    const blob = await downloadCourseFile(file.fileId);

    // Create a temporary URL for the downloaded file
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName;

    // Start the download
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Release the temporary URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);

  } catch (error) {
    console.error("Failed to download file:", error);
    alert("تعذر تنزيل الملف، يرجى المحاولة مرة أخرى.");
  }
}
//----------------------------------------------------------------
return (
  <div className="course-files-page" dir="rtl">

    {/* Page header */}
    <header className="course-files-header">
      <button
        type="button"
        className="course-files-back"
        onClick={() => navigate(-1)}
      >
        → رجوع
      </button>

      <h1>{courseName || "ملفات المقرر"}</h1>
    </header>

    <main className="course-files-content">

      {/* Files section header */}
      <div className="course-files-heading">
        <div>
          <div className="course-files-title">
            <h2>ملفات المقرر</h2>

            <span className="course-files-count">
              {files.length} ملفات
            </span>
          </div>

          <p>
            مساحة لمشاركة الملفات والمواد الدراسية الخاصة بالمقرر
          </p>
        </div>

        <button
          type="button"
          className="course-files-upload"
          onClick={() => setIsUploadOpen(true)}
        >
          ↑ رفع ملف
        </button>
      </div>
      {/* Show a message after a successful upload */}
      {uploadMessage && (
        <p role="status">{uploadMessage}</p>
      )}
      {/* Loading message */}
      {loading && <p>جارٍ تحميل الملفات...</p>}

      {/* Error message */}
      {error && <p>{error}</p>}

      {/* Empty files message */}
      {!loading && !error && files.length === 0 && (
        <div className="course-files-empty">
          <h3>لا توجد ملفات بعد</h3>
          <p>لا توجد ملفات معتمدة لهذا المقرر حاليًا.</p>
        </div>
      )}

      {/* Files list */}
      {!loading && !error && files.length > 0 && (
        <ul className="course-files-list">
          {files.map((file) => (
            <li key={file.fileId} className="course-file-row">

              <span className="course-file-icon">
                {getFileType(file.fileName)}
              </span>

              <div className="course-file-info">
                <strong>{file.fileName}</strong>

                <span>
                  {getFileDate(file.uploadedAt)}
                </span>
              </div>

              <button
                type="button"
                className="course-file-download"
                onClick={() => handleDownload(file)}
              >
                ↓ تنزيل
              </button>

            </li>
          ))}
        </ul>
      )}

    </main>
    {/* Show the upload popup only when isUploadOpen is true */}
    {isUploadOpen && (
      <UploadFileDialog
        courseId={courseId}
        courseName={courseName}

        // Close the popup without uploading
        onClose={() => setIsUploadOpen(false)}

        // Close the popup and show a success message after uploading
        onUploaded={() => {
          setIsUploadOpen(false);
          setUploadMessage("تم رفع الملف، وهو بانتظار موافقة الإدارة.");
        }}
      />
    )}
  </div>
);
}