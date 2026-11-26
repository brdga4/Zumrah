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
  getAdminReportById,
  getAdminReports,
  reviewAdminReport,
} from '../api/adminReportsApi';
import './ReportReviewPage.css';

function formatDate(dateValue) {
  if (!dateValue) {
    return 'غير متوفر';
  }

  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}

export default function ReportReviewPage() {
  const { notify } = useToast();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingAction, setPendingAction] = useState('');

  async function loadReports() {
    setIsLoading(true);
    setError('');

    try {
      const data = await getAdminReports();
      setReports(data.reports || []);
    } catch (requestError) {
      setError('تعذر تحميل بلاغات الرسائل. حاول مجددًا.');
      console.error('Failed to load reports:', requestError);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    getAdminReports()
      .then((data) => {
        if (active) {
          setReports(data.reports || []);
        }
      })
      .catch((requestError) => {
        console.error('Failed to load reports:', requestError);

        if (active) {
          setError('تعذر تحميل بلاغات الرسائل. حاول مجددًا.');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function openReport(reportId) {
    setIsDetailsLoading(true);
    setActionError('');

    try {
      const data = await getAdminReportById(reportId);
      setSelectedReport(data);
    } catch (requestError) {
      setActionError('تعذر تحميل تفاصيل البلاغ. حاول مجددًا.');
      console.error('Failed to load report details:', requestError);
    } finally {
      setIsDetailsLoading(false);
    }
  }

  function closeReportPanel() {
    if (isReviewing) {
      return;
    }

    setSelectedReport(null);
    setActionError('');
    setPendingAction('');
  }

  function askForReview(action) {
    setPendingAction(action);
    setActionError('');
  }

  function cancelReview() {
    if (isReviewing) {
      return;
    }

    setPendingAction('');
  }

  async function confirmReview() {
    if (!selectedReport || !pendingAction) {
      return;
    }

    setIsReviewing(true);
    setActionError('');

    try {
      await reviewAdminReport(selectedReport.reportId, pendingAction);

      setSelectedReport(null);
      setPendingAction('');
      await loadReports();
      notify({
        type: 'info',
        message:
          pendingAction === 'MESSAGE_REMOVED'
            ? 'تم حذف الرسالة وإغلاق البلاغ.'
            : 'تم تجاهل البلاغ.',
      });
    } catch (requestError) {
      setActionError('تعذر حفظ قرار المراجعة. حاول مجددًا.');
      console.error('Failed to review report:', requestError);
    } finally {
      setIsReviewing(false);
    }
  }

  const isEmpty = !isLoading && !error && reports.length === 0;

  return (
    <main className="report-review-page" dir="rtl">
      <section className="report-review-page__header">
        <div>
          <div className="report-review-page__title-row">
            <span className="report-review-page__count">
              <Badge variant="soft">{reports.length} بلاغ</Badge>
            </span>
            <Heading level={1}>بلاغات الرسائل</Heading>
          </div>

          <Text tone="muted">
            راجع الرسائل التي أبلغ عنها الطلاب للحفاظ على مجتمع آمن وموثوق.
          </Text>
        </div>
      </section>

      {isLoading && (
        <Card className="report-review-page__state">
          <LoadingIndicator label="جارٍ تحميل البلاغات..." />
        </Card>
      )}

      {error && (
        <Text className="report-review-page__error" role="alert">{error}</Text>
      )}

      {isEmpty && (
        <Card className="report-review-page__empty">
          <div className="report-review-page__empty-icon">✓</div>
          <Heading level={2}>لا توجد بلاغات بانتظار المراجعة</Heading>
          <Text tone="muted">
            راجعت جميع البلاغات. ستظهر البلاغات الجديدة هنا فور إرسالها.
          </Text>
        </Card>
      )}

      {!isLoading && !error && reports.length > 0 && (
        <section className="report-list">
          {reports.map((report) => (
            <Card className="report-card" key={report.reportId} role="article">
              <div className="report-card__top">
                <Badge variant="soft" className="report-card__status">
                  بانتظار المراجعة
                </Badge>

                <div className="report-card__icon" aria-hidden="true">
                  !
                </div>
              </div>

              <Heading level={2}>بلاغ عن رسالة</Heading>

              <Text tone="muted" className="report-card__message">
                {report.message?.content || 'لا يوجد نص للرسالة.'}
              </Text>

              <dl className="report-card__details">
                <div>
                  <dt>أبلغ عنها</dt>
                  <dd>
                    {report.reportedBy?.name || 'طالب غير معروف'}
                  </dd>
                </div>

                <div>
                  <dt>تاريخ البلاغ</dt>
                  <dd>{formatDate(report.createdAt)}</dd>
                </div>
              </dl>

              <Button
                className="report-card__review-button"
                variant="secondary"
                size="sm"
                onClick={() => openReport(report.reportId)}
              >
                مراجعة البلاغ
                <span aria-hidden="true">←</span>
              </Button>
            </Card>
          ))}
        </section>
      )}

      {(selectedReport || isDetailsLoading) && (
        <div className="report-panel-backdrop">
          <aside
            className="report-panel"
            aria-label="تفاصيل البلاغ"
          >
            <button
              className="report-panel__close-button"
              type="button"
              onClick={closeReportPanel}
              disabled={isReviewing}
              aria-label="إغلاق"
            >
              ×
            </button>

            {isDetailsLoading && (
              <LoadingIndicator label="جارٍ تحميل تفاصيل البلاغ..." />
            )}

            {selectedReport && (
              <>
                <Badge variant="soft" className="report-panel__eyebrow">
                  بلاغ رسالة
                </Badge>

                <Heading level={2}>مراجعة البلاغ</Heading>

                <section className="report-panel__section">
                  <Heading level={3}>نص الرسالة</Heading>
                  <Text tone="muted" className="report-panel__message">
                    {selectedReport.message?.content || 'لا يوجد نص للرسالة.'}
                  </Text>
                </section>

                <section className="report-panel__section">
                  <Heading level={3}>سبب البلاغ</Heading>
                  <Text tone="muted">{selectedReport.reason}</Text>
                </section>

                <section className="report-panel__section">
                  <Heading level={3}>معلومات البلاغ</Heading>

                  <dl className="report-panel__details">
                    <div>
                      <dt>مرسل الرسالة</dt>
                      <dd>
                        {selectedReport.message?.sender?.name || 'غير متوفر'}
                      </dd>
                    </div>

                    <div>
                      <dt>مقدم البلاغ</dt>
                      <dd>
                        {selectedReport.reportedBy?.name || 'غير متوفر'}
                      </dd>
                    </div>

                    <div>
                      <dt>وقت إرسال البلاغ</dt>
                      <dd>{formatDate(selectedReport.createdAt)}</dd>
                    </div>
                  </dl>
                </section>

                {actionError && (
                  <Text className="report-review-page__error" role="alert">
                    {actionError}
                  </Text>
                )}

                <div className="report-panel__actions">
                  <Button
                    className="report-panel__dismiss-button"
                    variant="secondary"
                    size="md"
                    onClick={() => askForReview('DISMISSED')}
                    disabled={isReviewing}
                  >
                    تجاهل البلاغ
                  </Button>

                  <Button
                    className="report-panel__remove-button"
                    variant="danger"
                    size="md"
                    onClick={() => askForReview('MESSAGE_REMOVED')}
                    disabled={isReviewing}
                  >
                    حذف الرسالة
                  </Button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingAction && selectedReport)}
        onClose={cancelReview}
        onConfirm={confirmReview}
        title={pendingAction === 'MESSAGE_REMOVED' ? 'تأكيد حذف الرسالة' : 'تأكيد تجاهل البلاغ'}
        message={
          pendingAction === 'MESSAGE_REMOVED'
            ? 'سيُحذف نص الرسالة من المحادثة، ولا يمكن التراجع عن هذا القرار.'
            : 'سيُغلق البلاغ دون حذف الرسالة من المحادثة.'
        }
        confirmLabel="تأكيد القرار"
        cancelLabel="إلغاء"
        loadingLabel="جارٍ الحفظ..."
        destructive={pendingAction === 'MESSAGE_REMOVED'}
        loading={isReviewing}
      />
    </main>
  );
}
