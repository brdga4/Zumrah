import { useRef, useState } from "react";
import Button from "../../../Components/Button";
import Dialog from "../../../Components/Dialog";
import LoadingIndicator from "../../../Components/LoadingIndicator";
import { uploadCourseFile } from "../materialsApi";
import "./UploadFileDialog.css";

export default function UploadFileDialog({ courseId, courseName, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const uploadingRef = useRef(false);

  function selectFile(selectedFile) {
    if (!selectedFile || uploadingRef.current) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setFile(null);
      setError("يمكن رفع ملفات PDF فقط");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError("الملف المختار فارغ");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("حجم الملف يجب ألا يتجاوز 10 ميبيبايت");
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file || uploadingRef.current) return;

    uploadingRef.current = true;
    setIsUploading(true);
    setError("");

    try {
      await uploadCourseFile(courseId, file);
      onUploaded();
    } catch (err) {
      console.error("Failed to upload file:", err);
      if (err.status === 403) {
        setError("ليس لديك صلاحية لرفع ملفات لهذا المقرر");
      } else if (err.status === 400 || err.status === 413) {
        setError("تعذر قبول الملف تحقق من الملف وحاول مرة أخرى");
      } else if (err.status !== 401) {
        setError("تعذر تأكيد حالة الرفع تحقق قبل إعادة المحاولة");
      }
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="رفع ملف"
      description={`إلى مقرر ${courseName || "المقرر"}`}
      size="lg"
      busy={isUploading}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isUploading}>
            إلغاء
          </Button>
          <Button size="md" onClick={handleUpload} disabled={!file} loading={isUploading}>
            {isUploading ? (
              <span className="zumrah-dialog-button-content">
                <LoadingIndicator inline decorative />
                جارٍ الرفع
              </span>
            ) : "تأكيد الرفع ↑"}
          </Button>
        </>
      }
    >
      <label
        className="upload-dialog-dropzone"
        htmlFor="upload-file-input"
        aria-disabled={isUploading || undefined}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          selectFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          id="upload-file-input"
          type="file"
          accept=".pdf,application/pdf"
          disabled={isUploading}
          onChange={(event) => {
            selectFile(event.target.files[0]);
            event.target.value = "";
          }}
        />
        <span className="upload-dialog-icon" aria-hidden="true">↑</span>
        <strong>اختر ملفًا من جهازك</strong>
        <p>أو اسحبه وأفلته هنا</p>
        <small>ملف PDF حتى 10 ميبيبايت</small>
      </label>

      {file && <p className="upload-dialog-selected">الملف المختار {file.name}</p>}
      {error && <p className="upload-dialog-error" role="alert">{error}</p>}
    </Dialog>
  );
}
