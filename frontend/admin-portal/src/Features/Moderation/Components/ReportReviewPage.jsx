import { useEffect, useState } from 'react';
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
    loadReports();
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
              {reports.length} بلاغ
            </span>
            <h1>بلاغات الرسائل</h1>
          </div>

          <p>
            راجع الرسائل التي أبلغ عنها الطلاب للحفاظ على مجتمع آمن وموثوق.
          </p>
        </div>
      </section>

      {isLoading && (
        <p className="report-review-page__state">جارٍ تحميل البلاغات...</p>
      )}

      {error && (
        <div className="report-review-page__error">
          {error}
        </div>
      )}

      {isEmpty && (
        <section className="report-review-page__empty">
          <div className="report-review-page__empty-icon">✓</div>
          <h2>لا توجد بلاغات بانتظار المراجعة</h2>
          <p>راجعت جميع البلاغات. ستظهر البلاغات الجديدة هنا فور إرسالها.</p>
        </section>
      )}

      {!isLoading && !error && reports.length > 0 && (
        <section className="report-list">
          {reports.map((report) => (
            <article className="report-card" key={report.reportId}>
              <div className="report-card__top">
                <span className="report-card__status">بانتظار المراجعة</span>

                <div className="report-card__icon" aria-hidden="true">
                  !
                </div>
              </div>

              <h2>بلاغ عن رسالة</h2>

              <p className="report-card__message">
                {report.message?.content || 'لا يوجد نص للرسالة.'}
              </p>

              <dl className="report-card__details">
                <div>
                  <dt>أبلغ عنها</dt>
                  <dd>{report.reportedBy?.name || 'طالب غير معروف'}</dd>
                </div>

                <div>
                  <dt>تاريخ البلاغ</dt>
                  <dd>{formatDate(report.createdAt)}</dd>
                </div>
              </dl>

              <button
                className="report-card__review-button"
                type="button"
                onClick={() => openReport(report.reportId)}
              >
                مراجعة البلاغ
                <span aria-hidden="true">←</span>
              </button>
            </article>
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
              <p className="report-review-page__state">
                جارٍ تحميل تفاصيل البلاغ...
              </p>
            )}

            {selectedReport && (
              <>
                <span className="report-panel__eyebrow">
                  بلاغ رسالة
                </span>

                <h2>مراجعة البلاغ</h2>

                <section className="report-panel__section">
                  <h3>نص الرسالة</h3>
                  <p className="report-panel__message">
                    {selectedReport.message?.content || 'لا يوجد نص للرسالة.'}
                  </p>
                </section>

                <section className="report-panel__section">
                  <h3>سبب البلاغ</h3>
                  <p>{selectedReport.reason}</p>
                </section>

                <section className="report-panel__section">
                  <h3>معلومات البلاغ</h3>

                  <dl className="report-panel__details">
                    <div>
                      <dt>مرسل الرسالة</dt>
                      <dd>
                        {selectedReport.message?.sender?.name || 'غير متوفر'}
                      </dd>
                    </div>

                    <div>
                      <dt>مقدم البلاغ</dt>
                      <dd>{selectedReport.reportedBy?.name || 'غير متوفر'}</dd>
                    </div>

                    <div>
                      <dt>وقت إرسال البلاغ</dt>
                      <dd>{formatDate(selectedReport.createdAt)}</dd>
                    </div>
                  </dl>
                </section>

                {actionError && (
                  <div className="report-review-page__error">
                    {actionError}
                  </div>
                )}

                <div className="report-panel__actions">
                  <button
                    className="report-panel__dismiss-button"
                    type="button"
                    onClick={() => askForReview('DISMISSED')}
                    disabled={isReviewing}
                  >
                    تجاهل البلاغ
                  </button>

                  <button
                    className="report-panel__remove-button"
                    type="button"
                    onClick={() => askForReview('MESSAGE_REMOVED')}
                    disabled={isReviewing}
                  >
                    حذف الرسالة
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {pendingAction && (
        <div className="report-confirmation-backdrop">
          <section
            className="report-confirmation"
            role="dialog"
            aria-modal="true"
          >
            <h2>
              {pendingAction === 'MESSAGE_REMOVED'
                ? 'تأكيد حذف الرسالة'
                : 'تأكيد تجاهل البلاغ'}
            </h2>

            <p>
              {pendingAction === 'MESSAGE_REMOVED'
                ? 'سيُحذف نص الرسالة من المحادثة، ولا يمكن التراجع عن هذا القرار.'
                : 'سيُغلق البلاغ دون حذف الرسالة من المحادثة.'}
            </p>

            <div className="report-confirmation__actions">
              <button
                className="report-confirmation__cancel-button"
                type="button"
                onClick={cancelReview}
                disabled={isReviewing}
              >
                إلغاء
              </button>

              <button
                className="report-confirmation__confirm-button"
                type="button"
                onClick={confirmReview}
                disabled={isReviewing}
              >
                {isReviewing ? 'جارٍ الحفظ...' : 'تأكيد القرار'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}