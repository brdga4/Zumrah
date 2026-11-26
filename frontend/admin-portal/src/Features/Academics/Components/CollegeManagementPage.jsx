import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@student/Components/Badge';
import Button from '@student/Components/Button';
import Card from '@student/Components/Card';
import Dialog from '@student/Components/Dialog';
import Heading from '@student/Components/Heading';
import InputField from '@student/Components/InputField';
import LoadingIndicator from '@student/Components/LoadingIndicator';
import Text from '@student/Components/Text';
import {
  createCollege,
  getColleges,
  updateCollege,
} from '../api/collegesApi';
import './CollegeManagementPage.css';

export default function CollegeManagementPage() {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [collegeName, setCollegeName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const collegeNameRef = useRef(null);

  async function loadColleges() {
    try {
      const data = await getColleges();
      setColleges(data.colleges || []);
    } catch (requestError) {
      setError('تعذر تحميل الكليات. تأكد من تشغيل الخادم ثم حاول مجددًا.');
      console.error('Failed to load colleges:', requestError);
    } finally {
      setIsLoading(false);
    }
  }

  function reloadColleges() {
    setIsLoading(true);
    setError('');

    return loadColleges();
  }

  useEffect(() => {
  let isCurrent = true;

  async function loadInitialColleges() {
    try {
      const data = await getColleges();

      if (isCurrent) {
        setColleges(data.colleges || []);
      }
    } catch (requestError) {
      if (isCurrent) {
        setError(
          'تعذر تحميل الكليات. تأكد من تشغيل الخادم ثم حاول مجددًا.',
        );
      }

      console.error('Failed to load colleges:', requestError);
    } finally {
      if (isCurrent) {
        setIsLoading(false);
      }
    }
  }

  loadInitialColleges();

  return () => {
    isCurrent = false;
  };
}, []);

  function openCreateDialog() {
    setEditingCollege(null);
    setCollegeName('');
    setFormError('');
    setIsDialogOpen(true);
  }

  function openEditDialog(college) {
    setEditingCollege(college);
    setCollegeName(college.collegeName);
    setFormError('');
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) return;

    setIsDialogOpen(false);
    setEditingCollege(null);
    setCollegeName('');
    setFormError('');
  }

  async function handleCollegeSubmit(event) {
    event.preventDefault();

    const trimmedCollegeName = collegeName.trim();

    if (!trimmedCollegeName) {
      setFormError('اكتب اسم الكلية أولًا.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const isEditing = Boolean(editingCollege);

    try {
      if (isEditing) {
        await updateCollege(editingCollege.collegeId, trimmedCollegeName);
      } else {
        await createCollege(trimmedCollegeName);
      }

      await reloadColleges();

      setSuccessMessage(
        isEditing
          ? `تم تعديل «${trimmedCollegeName}» بنجاح.`
          : `تمت إضافة «${trimmedCollegeName}» بنجاح.`,
      );

      setIsDialogOpen(false);
      setEditingCollege(null);
      setCollegeName('');
    } catch (requestError) {
      let message = requestError.message || 'تعذر حفظ الكلية. حاول مجددًا.';

      if (requestError.status === 401) {
        message = 'انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى.';
      } else if (requestError.status === 409) {
        message = 'هذه الكلية موجودة بالفعل.';
      } else if (requestError.status === 400) {
        message = 'اسم الكلية يجب أن يكون بين 1 و200 حرف.';
      }

      setFormError(message);
      console.error('Failed to save college:', requestError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="college-page" dir="rtl">
      <div className="college-page__header">
        <div>
          <div className="college-page__title-row">
            <Heading level={1}>الكليات وتخصصاتها</Heading>

            <Badge variant="soft" className="college-page__count">
              {colleges.length} كليات
            </Badge>
          </div>

          <Text tone="muted" className="college-page__description">
            الكليات المتاحة في زُمرة، مع التخصصات التابعة لكل كلية.
          </Text>
        </div>

        <Button onClick={openCreateDialog}>
          <PlusIcon />
          إضافة كلية
        </Button>
      </div>

      {isLoading ? (
        <Card className="college-state">
          <LoadingIndicator label="جارٍ تحميل الكليات..." />
        </Card>
      ) : error ? (
        <Card className="college-state college-state--error">
          <Text className="college-state__error">{error}</Text>

          <Button variant="secondary" size="sm" onClick={reloadColleges}>
            حاول مجددًا
          </Button>
        </Card>
      ) : colleges.length === 0 ? (
        <Card className="college-state">
          <Heading level={2}>لا توجد كليات بعد</Heading>
          <Text tone="muted">أضف أول كلية لتتمكن بعدها من إضافة تخصصاتها.</Text>

          <Button size="sm" onClick={openCreateDialog}>إضافة كلية</Button>
        </Card>
      ) : (
        <div className="college-items">
          {colleges.map((college) => (
            <Card className="college-item" key={college.collegeId} role="article">
              <div className="college-item__head">
                <span className="college-item__icon">
                  <CollegeIcon />
                </span>

                <div className="college-item__heading">
                  <Heading level={2}>{college.collegeName}</Heading>

                  <Text tone="muted" className="college-item__majors-count">
                    {formatMajorCount(college.majors.length)}
                  </Text>
                </div>
              </div>

              <div className="college-item__majors">
                {college.majors.length > 0 ? (
                  college.majors.map((major) => (
                    <Badge
                      variant="soft"
                      className="college-major"
                      key={major.majorId}
                    >
                      {major.majorName}
                    </Badge>
                  ))
                ) : (
                  <Text tone="muted" className="college-item__no-majors">
                    لا توجد تخصصات في هذه الكلية بعد.
                  </Text>
                )}
              </div>

              <div className="college-item__footer">
                <Button
                  className="college-item__edit-button"
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditDialog(college)}
                >
                  <EditIcon />
                  تعديل
                </Button>

                <Button
                  className="college-item__majors-link"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate(`/academics/majors?collegeId=${college.collegeId}`)
                  }
                  type="button"
                >
                  إدارة التخصصات
                  <ArrowIcon />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        title={editingCollege ? 'تعديل الكلية' : 'إضافة كلية'}
        description={
          editingCollege
            ? 'عدّل اسم الكلية ثم احفظ التغييرات.'
            : 'بعد الإضافة يمكنك ربط التخصصات بهذه الكلية.'
        }
        busy={isSaving}
        initialFocusRef={collegeNameRef}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={closeDialog} disabled={isSaving}>
              إلغاء
            </Button>
            <Button
              type="submit"
              form="college-dialog-form"
              size="md"
              loading={isSaving}
            >
              {isSaving
                ? 'جارٍ الحفظ...'
                : editingCollege
                  ? 'حفظ التغييرات'
                  : 'إضافة الكلية'}
            </Button>
          </>
        }
      >
        <form id="college-dialog-form" onSubmit={handleCollegeSubmit}>
          <InputField
            ref={collegeNameRef}
            id="college-name"
            label="اسم الكلية"
            type="text"
            value={collegeName}
            error={formError}
            onChange={(event) => setCollegeName(event.target.value)}
            placeholder="مثال: كلية الطب"
            maxLength="200"
            disabled={isSaving}
          />
        </form>
      </Dialog>

      {successMessage && (
        <p className="college-toast" role="status">
          {successMessage}
        </p>
      )}
    </section>
  );
}

function formatMajorCount(count) {
  return `${count} ${count === 1 ? 'تخصص' : 'تخصصات'}`;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function CollegeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
