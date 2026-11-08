
import { useState } from "react";

// Import the upload function from our Materials API file
import { uploadCourseFile } from "../materialsApi";


import "./UploadFileDialog.css";

// Receive data and functions from CourseFilesPage
export default function UploadFileDialog({
  courseId,
  courseName,
  onClose,
  onUploaded,
}) {

  // Store the file selected by the student
  // null means no file has been selected yet
  const [file, setFile] = useState(null);

  // Track whether the file is currently uploading
  const [isUploading, setIsUploading] = useState(false);

  // Store an error message if something goes wrong
  const [error, setError] = useState("");

  // Check the selected file before uploading
  function selectFile(selectedFile) {
    if (!selectedFile) return;

    // Get the file extension, such as pdf or docx
    const parts = selectedFile.name.split(".");
    const extension = parts[parts.length - 1].toLowerCase();

    // List of allowed file extensions
    const allowedTypes = ["pdf", "docx", "pptx"];

    // includes() checks whether the extension is allowed
    if (!allowedTypes.includes(extension)) {
      setFile(null);
      setError("يمكن رفع ملفات PDF وDOCX وPPTX فقط");
      return;
    }

    // Check file size: 25 MB in bytes
    if (selectedFile.size > 25 * 1024 * 1024) {
      setFile(null);
      setError("حجم الملف يجب ألا يتجاوز 25 ميجابايت");
      return;
    }

    // Save the selected file and clear previous errors
    setError("");
    setFile(selectedFile);
  }

  // Send the selected file to the backend
  async function handleUpload() {

    // Stop if no file is selected or an upload is running
    if (!file || isUploading) return;

    setIsUploading(true);
    setError("");

    try {
      // Call the POST function in materialsApi.js
      await uploadCourseFile(courseId, file);

      // Tell the parent page that the upload succeeded
      onUploaded();

    } catch (err) {
      console.error("Failed to upload file:", err);

      // Display a suitable error message
      if (err.status === 403) {
        setError("ليس لديك صلاحية لرفع ملفات لهذا المقرر");
      } else {
        setError("تعذر رفع الملف، يرجى المحاولة مرة أخرى");
      }

    } finally {
      // Stop the uploading state after the request finishes
      setIsUploading(false);
    }
  }

  return (
    // Dark overlay covering the page behind the popup
    <div className="upload-dialog-overlay" dir="rtl">

      {/* Main popup window */}
      <div
        className="upload-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-dialog-title"
      >

        {/* Popup header */}
        <div className="upload-dialog-header">
          <div>
            <h2 id="upload-dialog-title">رفع ملف</h2>
            <p>إلى مقرر {courseName || "المقرر"}</p>
          </div>

          {/* Close button */}
          <button
            type="button"
            className="upload-dialog-close"
            onClick={onClose}
            disabled={isUploading}
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        {/* File selection and drag-and-drop area */}
        <label
          className="upload-dialog-dropzone"
          htmlFor="upload-file-input"

          onDragOver={(event) => event.preventDefault()}

          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files[0]);
          }}
        >

          {/* HTML input for selecting a file */}
          <input
            id="upload-file-input"
            type="file"
            accept=".pdf,.docx,.pptx"

            onChange={(event) => {
              selectFile(event.target.files[0]);
            }}
          />

          <span className="upload-dialog-icon">↑</span>

          <strong>اختر ملفًا من جهازك</strong>

          <p>أو اسحبه وأفلته هنا</p>

          <small>
            PDF · PPTX · DOCX — حتى 25 ميجابايت
          </small>
        </label>

        {/* Show the selected file name */}
        {file && (
          <p className="upload-dialog-selected">
            الملف المختار: {file.name}
          </p>
        )}

        {/* Show an error only when one exists */}
        {error && (
          <p className="upload-dialog-error" role="alert">
            {error}
          </p>
        )}

        {/* Bottom action buttons */}
        <div className="upload-dialog-actions">

          {/* Cancel uploading and close the popup */}
          <button
            type="button"
            className="upload-dialog-cancel"
            onClick={onClose}
            disabled={isUploading}
          >
            إلغاء
          </button>

          {/* Upload the file when the student confirms */}
          <button
            type="button"
            className="upload-dialog-confirm"
            onClick={handleUpload}

            disabled={!file || isUploading}
          >
            {isUploading ? "جارٍ الرفع..." : "تأكيد الرفع ↑"}
          </button>

        </div>
      </div>
    </div>
  );
}
