import { useEffect, useState } from 'react';

import {
  downloadAdminFile,
  getAdminFileById,
  getPendingAdminFiles,
  reviewAdminFile,
} from '../api/adminFilesApi';
import './FileReviewPage.css';

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}

function getStatusLabel(status) {
  if (status === 'APPROVED') {
    return 'معتمد';
  }

  if (status === 'REJECTED') {
    return 'مرفوض';
  }

  return 'بانتظار المراجعة';
}

export default function FileReviewPage() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [panelError, setPanelError] = useState('');

  const [reviewStatus, setReviewStatus] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadPendingFiles() {
      try {
        setError('');

        const data = await getPendingAdminFiles();
        setFiles(data.files || []);
      } catch (requestError) {
        console.error('Failed to load pending files:', requestError);
        setError('تعذر تحميل الملفات بانتظار المراجعة. حاول مجددًا.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPendingFiles();
  }, []);

  async function openReviewPanel(fileId) {
    try {
      setSelectedFile(null);
      setPanelError('');
      setIsDetailLoading(true);

      const data = await getAdminFileById(fileId);
      setSelectedFile(data);
    } catch (requestError) {
      console.error('Failed to load file details:', requestError);
      setPanelError('تعذر تحميل تفاصيل الملف. حاول مجددًا.');
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeReviewPanel() {
    if (isReviewing) {
      return;
    }

    setSelectedFile(null);
    setPanelError('');
    setReviewStatus('');
  }

  async function handleDownload() {
    if (!selectedFile) {
      return;
    }

    try {
      setIsDownloading(true);
      setPanelError('');

      const fileBlob = await downloadAdminFile(selectedFile.fileId);
      const downloadUrl = URL.createObjectURL(fileBlob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = selectedFile.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch (requestError) {
      console.error('Failed to download file:', requestError);
      setPanelError('تعذر تنزيل الملف. حاول مجددًا.');
    } finally {
      setIsDownloading(false);
    }
  }

  async function confirmReview() {
    if (!selectedFile || !reviewStatus) {
      return;
    }

    try {
      setIsReviewing(true);
      setPanelError('');

      await reviewAdminFile(selectedFile.fileId, reviewStatus);

      setFiles((currentFiles) =>
        currentFiles.filter((file) => file.fileId !== selectedFile.fileId),
      );

      setToastMessage(
        reviewStatus === 'APPROVED'
          ? `تم اعتماد «${selectedFile.fileName}».`
          : `تم رفض «${selectedFile.fileName}».`,
      );

      setReviewStatus('');
      setSelectedFile(null);
    } catch (requestError) {
      console.error('Failed to review file:', requestError);
      setPanelError('تعذر حفظ قرار المراجعة. حاول مجددًا.');
    } finally {
      setIsReviewing(false);
    }
  }

  return (
      <main className="file-review-page" dir="rtl">
        <section className="file-review-page__section">
          <header className="file-review-page__header">
            <div>
              <div className="file-review-page__title-row">
                <h1>الملفات بانتظار المراجعة</h1>
                {!isLoading && (
                  <span className="file-review-page__count">
                    {files.length} ملف
                  </span>
                )}
              </div>

              <p>
                ملفات رفعها الطلاب، ولن تظهر في صفحات المقررات قبل اعتمادها.
                الأقدم أولًا.
              </p>
            </div>
          </header>

          {isLoading && (
            <p className="file-review-page__status">
              جارٍ تحميل الملفات بانتظار المراجعة...
            </p>
          )}

          {error && <p className="file-review-page__error">{error}</p>}

          {!isLoading && !error && files.length === 0 && (
            <section className="file-review-empty">
              <div className="file-review-empty__icon">✓</div>
              <h2>لا توجد ملفات بانتظار المراجعة</h2>
              <p>
                راجعت جميع الملفات. ستظهر هنا الملفات الجديدة فور رفعها من
                الطلاب.
              </p>
            </section>
          )}

          {!isLoading && !error && files.length > 0 && (
            <section className="file-review-list-card">
              <ul className="file-review-list">
                {files.map((file) => (
                  <li key={file.fileId} className="file-review-row">
                    <div className="file-review-row__type">PDF</div>

                    <div className="file-review-row__info">
                      <strong title={file.fileName}>{file.fileName}</strong>

                      <div className="file-review-row__meta">
                        <span dir="ltr">{file.course?.courseCode}</span>
                        <span>·</span>
                        <span>{file.course?.courseName}</span>
                        <span>·</span>
                        <span>{file.uploadedBy?.name}</span>
                        <span>·</span>
                        <time dateTime={file.uploadedAt}>
                          {formatDate(file.uploadedAt)}
                        </time>
                      </div>
                    </div>

                    <span className="file-review-row__status">
                      {getStatusLabel(file.status)}
                    </span>

                    <button
                      type="button"
                      className="file-review-button file-review-button--secondary"
                      onClick={() => openReviewPanel(file.fileId)}
                    >
                      مراجعة
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>

        <div
          className={`file-review-overlay ${
            selectedFile || isDetailLoading || panelError ? 'is-open' : ''
          }`}
          onClick={closeReviewPanel}
        />

        <aside
          className={`file-review-panel ${
            selectedFile || isDetailLoading || panelError ? 'is-open' : ''
          }`}
          aria-label="مراجعة ملف"
        >
          <header className="file-review-panel__header">
            <div>
              <h2>مراجعة ملف</h2>
              {selectedFile?.course && (
                <p>
                  <span dir="ltr">{selectedFile.course.courseCode}</span>
                  {' · '}
                  {selectedFile.course.courseName}
                </p>
              )}
            </div>

            <button
              type="button"
              className="file-review-panel__close"
              onClick={closeReviewPanel}
              disabled={isReviewing}
              aria-label="إغلاق"
            >
              ×
            </button>
          </header>

          <div className="file-review-panel__content">
            {isDetailLoading && (
              <p className="file-review-page__status">
                جارٍ تحميل بيانات الملف...
              </p>
            )}

            {panelError && (
              <p className="file-review-page__error">{panelError}</p>
            )}

            {selectedFile && (
              <>
                <section className="review-file-heading">
                  <div className="review-file-heading__type">PDF</div>

                  <div>
                    <h3>{selectedFile.fileName}</h3>
                    <span className="file-review-row__status">
                      {getStatusLabel(selectedFile.status)}
                    </span>
                  </div>
                </section>

                <section className="review-file-section">
                  <h3>بيانات الملف</h3>

                  <dl className="review-file-details">
                    <div>
                      <dt>المقرر</dt>
                      <dd>
                        <span dir="ltr">
                          {selectedFile.course?.courseCode}
                        </span>
                        {' · '}
                        {selectedFile.course?.courseName}
                      </dd>
                    </div>

                    <div>
                      <dt>رفعه</dt>
                      <dd>{selectedFile.uploadedBy?.name}</dd>
                    </div>

                    <div>
                      <dt>تاريخ الرفع</dt>
                      <dd>{formatDate(selectedFile.uploadedAt)}</dd>
                    </div>

                    <div>
                      <dt>نوع الملف</dt>
                      <dd dir="ltr">PDF</dd>
                    </div>
                  </dl>
                </section>

                <section className="review-file-section">
                  <h3>مراجعة المحتوى</h3>
                  <p>نزّل الملف وتحقق من محتواه قبل اتخاذ القرار.</p>

                  <button
                    type="button"
                    className="file-review-button file-review-button--secondary"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? 'جارٍ تجهيز التنزيل...' : 'تنزيل الملف'}
                  </button>
                </section>

                <p className="review-file-note">
                  عند الاعتماد يظهر الملف لجميع الطلاب المسجلين في المقرر.
                  الملفات المرفوضة لا تظهر للطلاب.
                </p>
              </>
            )}
          </div>

          {selectedFile?.status === 'PENDING' && (
            <footer className="file-review-panel__footer">
              <button
                type="button"
                className="file-review-button file-review-button--reject"
                onClick={() => setReviewStatus('REJECTED')}
                disabled={isReviewing}
              >
                رفض
              </button>

              <button
                type="button"
                className="file-review-button file-review-button--approve"
                onClick={() => setReviewStatus('APPROVED')}
                disabled={isReviewing}
              >
                اعتماد
              </button>
            </footer>
          )}
        </aside>

        {reviewStatus && selectedFile && (
          <div className="file-review-confirmation-overlay">
            <section
              className="file-review-confirmation"
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-confirmation-title"
            >
              <h2 id="review-confirmation-title">
                {reviewStatus === 'APPROVED'
                  ? 'اعتماد هذا الملف؟'
                  : 'رفض هذا الملف؟'}
              </h2>

              <p>
                {reviewStatus === 'APPROVED'
                  ? `سيظهر «${selectedFile.fileName}» لجميع الطلاب المسجلين في المقرر.`
                  : `لن يظهر «${selectedFile.fileName}» للطلاب وسيزال من قائمة المراجعة.`}
              </p>

              <div className="file-review-confirmation__actions">
                <button
                  type="button"
                  className="file-review-button file-review-button--secondary"
                  onClick={() => setReviewStatus('')}
                  disabled={isReviewing}
                >
                  تراجع
                </button>

                <button
                  type="button"
                  className={
                    reviewStatus === 'APPROVED'
                      ? 'file-review-button file-review-button--approve'
                      : 'file-review-button file-review-button--reject'
                  }
                  onClick={confirmReview}
                  disabled={isReviewing}
                >
                  {isReviewing
                    ? 'جارٍ الحفظ...'
                    : reviewStatus === 'APPROVED'
                      ? 'اعتماد الملف'
                      : 'رفض الملف'}
                </button>
              </div>
            </section>
          </div>
        )}

        {toastMessage && (
          <button
            type="button"
            className="file-review-toast"
            onClick={() => setToastMessage('')}
          >
            {toastMessage}
          </button>
        )}
      </main>
  );
}