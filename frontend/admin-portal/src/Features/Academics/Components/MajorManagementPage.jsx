import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '@student/Components/Badge';
import Button from '@student/Components/Button';
import Card from '@student/Components/Card';
import Dialog from '@student/Components/Dialog';
import Heading from '@student/Components/Heading';
import InputField from '@student/Components/InputField';
import LoadingIndicator from '@student/Components/LoadingIndicator';
import SelectField from '@student/Components/SelectField';
import Text from '@student/Components/Text';
import { getColleges } from '../api/collegesApi';
import { createMajor, updateMajor } from '../api/majorsApi';
import './MajorManagementPage.css';

export default function MajorManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [majorName, setMajorName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const majorNameRef = useRef(null);

  const activeCollegeId = searchParams.get('collegeId') || '';

  async function loadColleges() {
    try {
      const data = await getColleges();
      setColleges(data.colleges || []);
    } catch (requestError) {
      console.error('Failed to load majors:', requestError);
      setError('تعذر تحميل التخصصات. تأكد من تشغيل الخادم ثم حاول مجددًا.');
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
        console.error('Failed to load majors:', requestError);

        if (isCurrent) {
          setError(
            'تعذر تحميل التخصصات. تأكد من تشغيل الخادم ثم حاول مجددًا.',
          );
        }
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

  function handleCollegeChange(event) {
    const nextCollegeId = event.target.value;

    setSearchParams(nextCollegeId ? { collegeId: nextCollegeId } : {});
  }

  function openCreateModal() {
    if (!activeCollegeId) {
      return;
    }

    setEditingMajor(null);
    setSelectedCollegeId(activeCollegeId);
    setMajorName('');
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(major, college) {
    setEditingMajor(major);
    setSelectedCollegeId(college.collegeId);
    setMajorName(major.majorName);
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingMajor(null);
    setSelectedCollegeId('');
    setMajorName('');
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedMajorName = majorName.trim();

    if (!trimmedMajorName) {
      setFormError('اكتب اسم التخصص أولًا.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');

      if (editingMajor) {
        await updateMajor(editingMajor.majorId, trimmedMajorName);
      } else {
        await createMajor(selectedCollegeId, trimmedMajorName);
      }

      await reloadColleges();

      setIsModalOpen(false);
      setEditingMajor(null);
      setSelectedCollegeId('');
      setMajorName('');
      setFormError('');
    } catch (requestError) {
      console.error('Failed to save major:', requestError);

      let message = requestError.message || 'تعذر حفظ التخصص. حاول مرة أخرى.';

      if (requestError.status === 401) {
        message = 'انتهت جلسة الدخول. سجّل الدخول مرة أخرى.';
      }

      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }

  const activeCollege = colleges.find(
    (college) => college.collegeId === activeCollegeId,
  );

  const selectedCollege = colleges.find(
    (college) => college.collegeId === selectedCollegeId,
  );

  return (
    <section className="major-page" dir="rtl">
      <header className="major-page__header">
        <div>
          <div className="major-page__title-row">
            <Heading level={1}>التخصصات حسب الكلية</Heading>

            {activeCollege && (
              <Badge variant="soft" className="major-page__count">
                {activeCollege.majors.length}{' '}
                {activeCollege.majors.length === 1 ? 'تخصص' : 'تخصصات'}
              </Badge>
            )}
          </div>

          <Text tone="muted">
            اختر كلية لعرض تخصصاتها وإضافة تخصص جديد أو تعديل تخصص موجود.
          </Text>
        </div>

        <Button
          className="major-page__add-button"
          onClick={openCreateModal}
          disabled={isLoading || colleges.length === 0 || !activeCollegeId}
        >
          <PlusIcon />
          إضافة تخصص
        </Button>
      </header>

      {!isLoading && !error && colleges.length > 0 && (
        <div className="major-page__toolbar">
          <SelectField
            id="college-filter"
            label="اختر الكلية"
            options={colleges.map((college) => ({
              value: college.collegeId,
              label: college.collegeName,
            }))}
            placeholder="اختر كلية لعرض تخصصاتها"
            value={activeCollegeId}
            onChange={handleCollegeChange}
          />
        </div>
      )}

      {isLoading && (
        <Card className="major-page__message">
          <LoadingIndicator label="جارٍ تحميل التخصصات..." />
        </Card>
      )}

      {!isLoading && error && (
        <Card className="major-page__error">
          <Text>{error}</Text>

          <Button variant="secondary" size="sm" onClick={reloadColleges}>
            إعادة المحاولة
          </Button>
        </Card>
      )}

      {!isLoading && !error && colleges.length === 0 && (
        <Card className="major-page__empty">
          <CollegeIcon />
          <Heading level={2}>أضف كلية أولًا</Heading>
          <Text tone="muted">تُضاف التخصصات داخل الكليات، لذلك أضف كلية قبل إنشاء تخصص.</Text>
        </Card>
      )}

      {!isLoading && !error && colleges.length > 0 && !activeCollege && (
        <Card className="major-page__empty">
          <CollegeIcon />
          <Heading level={2}>اختر كلية</Heading>
          <Text tone="muted">اختر كلية من القائمة بالأعلى لعرض تخصصاتها وإدارتها.</Text>
        </Card>
      )}

      {!isLoading && !error && activeCollege && (
        <div className="major-groups">
          <Card className="major-group" key={activeCollege.collegeId} role="article">
            <header className="major-group__header">
              <div className="major-group__heading">
                <span className="major-group__icon">
                  <CollegeIcon />
                </span>

                <div>
                  <Heading level={2}>{activeCollege.collegeName}</Heading>

                  <Text tone="muted">
                    {activeCollege.majors.length}{' '}
                    {activeCollege.majors.length === 1 ? 'تخصص' : 'تخصصات'}
                  </Text>
                </div>
              </div>

              <Button
                className="major-group__add-button"
                variant="secondary"
                size="sm"
                onClick={openCreateModal}
              >
                <PlusIcon />
                إضافة تخصص
              </Button>
            </header>

            {activeCollege.majors.length === 0 ? (
              <Text tone="muted" className="major-group__empty">
                لا توجد تخصصات في هذه الكلية بعد.
              </Text>
            ) : (
              <ul className="major-list">
                {activeCollege.majors.map((major) => (
                  <li className="major-row" key={major.majorId}>
                    <span className="major-row__name">
                      <MajorIcon />
                      {major.majorName}
                    </span>

                    <Button
                      className="major-row__edit-button"
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(major, activeCollege)}
                    >
                      <EditIcon />
                      تعديل
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        title={editingMajor ? 'تعديل التخصص' : 'إضافة تخصص'}
        description={
          editingMajor
            ? 'عدّل اسم التخصص ثم احفظ التغييرات.'
            : `سيُضاف التخصص إلى كلية ${selectedCollege?.collegeName || ''}.`
        }
        busy={isSaving}
        initialFocusRef={majorNameRef}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={closeModal} disabled={isSaving}>
              إلغاء
            </Button>
            <Button type="submit" form="major-dialog-form" size="md" loading={isSaving}>
              {isSaving
                ? 'جارٍ الحفظ...'
                : editingMajor
                  ? 'حفظ التغييرات'
                  : 'إضافة التخصص'}
            </Button>
          </>
        }
      >
        <form id="major-dialog-form" onSubmit={handleSubmit}>
          <InputField
            ref={majorNameRef}
            id="major-name"
            label="اسم التخصص"
            value={majorName}
            error={formError}
            onChange={(event) => setMajorName(event.target.value)}
            placeholder="مثال: هندسة البرمجيات"
            maxLength="200"
            disabled={isSaving}
          />
        </form>
      </Dialog>
    </section>
  );
}

function CollegeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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

function MajorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 10 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12.2V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-3.8" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.7 5.3 4 4" />
      <path d="M4 20l4.4-1 10.3-10.3a2.8 2.8 0 0 0-4-4L4.4 15 4 20Z" />
    </svg>
  );
}
