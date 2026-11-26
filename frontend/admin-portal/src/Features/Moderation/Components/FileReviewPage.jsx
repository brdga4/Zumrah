import { useEffect, useState } from 'react';
import Badge from '@student/Components/Badge';
import Button from '@student/Components/Button';
import Card from '@student/Components/Card';
import ConfirmDialog from '@student/Components/ConfirmDialog';
import Heading from '@student/Components/Heading';
import LoadingIndicator from '@student/Components/LoadingIndicator';
import Text from '@student/Components/Text';
import { useToast } from '@student/Components/ToastContext';

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
  const { notify } = useToast();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [panelError, setPanelError] = useState('');

  const [reviewStatus, setReviewStatus] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

      notify({
        type: 'info',
        message:
        reviewStatus === 'APPROVED'
          ? `تم اعتماد «${selectedFile.fileName}».`
          : `تم رفض «${selectedFile.fileName}».`,
      });

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
                <Heading level={1}>الملفات بانتظار المراجعة</Heading>
                {!isLoading && (
                  <Badge variant="soft" className="file-review-page__count">
                    {files.length} ملف
                  </Badge>
                )}
              </div>

              <Text tone="muted">
                ملفات رفعها الطلاب، ولن تظهر في صفحات المقررات قبل اعتمادها.
                الأقدم أولًا.
              </Text>
            </div>
          </header>

          {isLoading && (
            <Card className="file-review-page__status">
              <LoadingIndicator label="جارٍ تحميل الملفات بانتظار المراجعة..." />
            </Card>
          )}

          {error && <Text className="file-review-page__error">{error}</Text>}

          {!isLoading && !error && files.length === 0 && (
            <Card className="file-review-empty">
              <div className="file-review-empty__icon">✓</div>
              <Heading level={2}>لا توجد ملفات بانتظار المراجعة</Heading>
              <Text tone="muted">
                راجعت جميع الملفات. ستظهر هنا الملفات الجديدة فور رفعها من
                الطلاب.
              </Text>
            </Card>
          )}

          {!isLoading && !error && files.length > 0 && (
            <Card className="file-review-list-card">
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

                    <Badge
                      variant="soft"
                      className="file-review-row__status"
                    >
                      {getStatusLabel(file.status)}
                    </Badge>

                    <Button
                      className="file-review-button file-review-button--secondary"
                      variant="secondary"
                      size="sm"
                      onClick={() => openReviewPanel(file.fileId)}
                    >
                      مراجعة
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
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
              <Heading level={2}>مراجعة ملف</Heading>
              {selectedFile?.course && (
                <Text tone="muted">
                  <span dir="ltr">{selectedFile.course.courseCode}</span>
                  {' · '}
                  {selectedFile.course.courseName}
                </Text>
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
              <LoadingIndicator label="جارٍ تحميل بيانات الملف..." />
            )}

            {panelError && (
              <Text className="file-review-page__error">{panelError}</Text>
            )}

            {selectedFile && (
              <>
                <section className="review-file-heading">
                  <div className="review-file-heading__type">PDF</div>

                  <div>
                    <Heading level={3}>{selectedFile.fileName}</Heading>
                    <Badge variant="soft" className="file-review-row__status">
                      {getStatusLabel(selectedFile.status)}
                    </Badge>
                  </div>
                </section>

                <section className="review-file-section">
                  <Heading level={3}>بيانات الملف</Heading>

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
                  <Heading level={3}>مراجعة المحتوى</Heading>
                  <Text tone="muted">نزّل الملف وتحقق من محتواه قبل اتخاذ القرار.</Text>

                  <Button
                    className="file-review-button file-review-button--secondary"
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    loading={isDownloading}
                  >
                    {isDownloading ? 'جارٍ تجهيز التنزيل...' : 'تنزيل الملف'}
                  </Button>
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
              <Button
                className="file-review-button file-review-button--reject"
                variant="danger"
                size="md"
                onClick={() => setReviewStatus('REJECTED')}
                disabled={isReviewing}
              >
                رفض
              </Button>

              <Button
                className="file-review-button file-review-button--approve"
                size="md"
                onClick={() => setReviewStatus('APPROVED')}
                disabled={isReviewing}
              >
                اعتماد
              </Button>
            </footer>
          )}
        </aside>

        <ConfirmDialog
          open={Boolean(reviewStatus && selectedFile)}
          onClose={() => setReviewStatus('')}
          onConfirm={confirmReview}
          title={reviewStatus === 'APPROVED' ? 'اعتماد هذا الملف؟' : 'رفض هذا الملف؟'}
          message={
            reviewStatus === 'APPROVED'
              ? `سيظهر «${selectedFile?.fileName || ''}» لجميع الطلاب المسجلين في المقرر.`
              : `لن يظهر «${selectedFile?.fileName || ''}» للطلاب وسيزال من قائمة المراجعة.`
          }
          confirmLabel={reviewStatus === 'APPROVED' ? 'اعتماد الملف' : 'رفض الملف'}
          cancelLabel="تراجع"
          loadingLabel="جارٍ الحفظ..."
          destructive={reviewStatus === 'REJECTED'}
          loading={isReviewing}
        />
      </main>
  );
}
