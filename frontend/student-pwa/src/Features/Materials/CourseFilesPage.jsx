import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../../Components/Button";
import LoadingIndicator from "../../Components/LoadingIndicator";
import { useToast } from "../../Components/ToastContext";
import { getEnrolledCourses } from "../Courses/coursesApi";
import { getCourseFiles, downloadCourseFile } from "./materialsApi";
import UploadFileDialog from "./Components/UploadFileDialog";
import "./CourseFilesPage.css";

function getFileType(fileName) {
  return fileName.split(".").pop().toUpperCase();
}

function getFileDate(uploadedAt) {
  return new Date(uploadedAt).toLocaleDateString("en-SA");
}

export default function CourseFilesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { notify, dismiss } = useToast();
  const [filesResult, setFilesResult] = useState(null);
  const [courseResult, setCourseResult] = useState(null);
  const [uploadCourseId, setUploadCourseId] = useState(null);
  const [downloading, setDownloading] = useState(() => new Set());
  const downloadingRef = useRef(new Set());

  const loading = filesResult?.courseId !== courseId;
  const files = loading ? [] : filesResult.files;
  const error = loading ? "" : filesResult.error;
  const courseName = courseResult?.courseId === courseId ? courseResult.name : "";

  useEffect(() => {
    let active = true;

    async function loadFiles() {
      try {
        const data = await getCourseFiles(courseId);
        if (active) setFilesResult({ courseId, files: data.files ?? [], error: "" });
      } catch (err) {
        if (active) {
          setFilesResult({
            courseId,
            files: [],
            error: err.status === 403
              ? "ليس لديك صلاحية لعرض ملفات هذا المقرر"
              : "تعذر جلب الملفات",
          });
        }
      }
    }

    loadFiles();
    return () => { active = false; };
  }, [courseId]);

  useEffect(() => {
    let active = true;

    async function loadCourseName() {
      try {
        const data = await getEnrolledCourses();
        const course = data.courses.find((item) => String(item.courseId) === String(courseId));
        if (active) setCourseResult({ courseId, name: course?.courseName || "" });
      } catch (err) {
        if (active) console.error("Failed to load course name:", err);
      }
    }

    loadCourseName();
    return () => { active = false; };
  }, [courseId]);

  async function handleDownload(file) {
    if (downloadingRef.current.has(file.fileId)) return;

    downloadingRef.current.add(file.fileId);
    setDownloading(new Set(downloadingRef.current));

    try {
      const blob = await downloadCourseFile(file.fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      try {
        document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("Failed to download file:", err);
    } finally {
      downloadingRef.current.delete(file.fileId);
      setDownloading(new Set(downloadingRef.current));
    }
  }

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home", { replace: true });
    }
  }

  return (
    <div className="course-files-page" dir="rtl">
      <header className="course-files-header">
        <Button variant="secondary" size="sm" className="course-files-back" onClick={handleBack} aria-label="رجوع">
          <ArrowRight size={20} aria-hidden="true" />
        </Button>
        <h1>{courseName || "ملفات المقرر"}</h1>
      </header>

      <main className="course-files-content">
        <div className="course-files-heading">
          <div>
            <h2>ملفات المقرر</h2>
            <p>مساحة لمشاركة الملفات والمواد الدراسية الخاصة بالمقرر</p>
          </div>
          <Button size="md" className="course-files-upload" onClick={() => setUploadCourseId(courseId)}>
            ↑ رفع ملف
          </Button>
        </div>

        {loading && <LoadingIndicator label="جارٍ تحميل الملفات" />}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && files.length === 0 && (
          <p className="course-files-empty">لا توجد ملفات معتمدة لهذا المقرر حاليًا</p>
        )}

        {!loading && !error && files.length > 0 && (
          <ul className="course-files-list">
            {files.map((file) => (
              <li key={file.fileId} className="course-file-row">
                <span className="course-file-icon">{getFileType(file.fileName)}</span>
                <div className="course-file-info">
                  <strong>{file.fileName}</strong>
                  <span>{getFileDate(file.uploadedAt)}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="course-file-download"
                  onClick={() => handleDownload(file)}
                  loading={downloading.has(file.fileId)}
                >
                  {downloading.has(file.fileId) ? (
                    <>
                      <LoadingIndicator inline decorative />
                      جارٍ التنزيل
                    </>
                  ) : "↓ تنزيل"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {uploadCourseId === courseId && (
        <UploadFileDialog
          key={courseId}
          courseId={courseId}
          courseName={courseName}
          onClose={() => setUploadCourseId(null)}
          onUploaded={() => {
            setUploadCourseId((current) => current === courseId ? null : current);

            // Restart the toast timer if a previous upload confirmation is still visible.
            const toastId = "course-file-upload-success";
            dismiss(toastId);
            notify({
              id: toastId,
              type: "success",
              message: "تم رفع الملف وهو بانتظار موافقة الإدارة",
            });
          }}
        />
      )}
    </div>
  );
}
