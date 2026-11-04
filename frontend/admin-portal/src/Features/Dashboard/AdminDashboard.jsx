import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const academicModules = [
  {
    step: 1,
    title: 'الكليات',
    description: 'عرض الكليات وتخصصاتها، وإضافة كلية جديدة أو تعديل اسمها.',
    action: 'إدارة الكليات',
    path: '/academics/colleges',
    icon: 'college',
  },
  {
    step: 2,
    title: 'التخصصات',
    description: 'التخصصات مجمّعة حسب الكلية، مع إمكانية إضافة تخصص أو تعديله.',
    action: 'إدارة التخصصات',
    path: '/academics/majors',
    icon: 'major',
  },
  {
    step: 3,
    title: 'المقررات',
    description: 'جدول قابل للبحث لجميع المقررات، لإضافة مقرر أو تعديل بياناته.',
    action: 'إدارة المقررات',
    path: '/academics/courses',
    icon: 'course',
  },
  {
    step: 4,
    title: 'إسناد المقررات',
    description: 'اختر تخصصًا واربط به المقررات التي تظهر لطلابه عند التسجيل.',
    action: 'إسناد المقررات',
    path: '/academics/course-assignments',
    icon: 'link',
  },
];

const moderationModules = [
  {
    title: 'مراجعة الملفات',
    description: 'ملفات رفعها الطلاب بانتظار الاعتماد أو الرفض قبل ظهورها.',
    action: 'مراجعة الملفات',
    path: '/moderation/files',
    icon: 'file',
  },
  {
    title: 'بلاغات الرسائل',
    description: 'رسائل أبلغ عنها الطلاب في غرف المحادثة لمراجعتها.',
    action: 'مراجعة البلاغات',
    path: '/moderation/reports',
    icon: 'message',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = getAdminName();
  const firstName = adminName.split(' ')[0];
  const adminInitial = adminName.charAt(0);

  return (
    <section className="dashboard-page" dir="rtl">
      <header className="dashboard-page__heading">
        <div>
          <h1>لوحة التحكم</h1>
          <p>نظرة عامة على وحدات إدارة زمرة</p>
        </div>

        <div className="dashboard-page__admin">
          <span>{adminInitial}</span>

          <div>
            <strong>{adminName}</strong>
            <small>مشرف المنصة</small>
          </div>
        </div>
      </header>

      <section className="dashboard-welcome">
        <span className="dashboard-welcome__accent" />

        <div>
          <span className="dashboard-welcome__eyebrow">
            لوحة الإدارة · زُمرة
          </span>

          <h2>
            مرحبًا، <span>{firstName}</span>
          </h2>

          <p>
            من هنا تدير البنية الأكاديمية للمنصة، وتراجع ما يشاركه الطلاب قبل
            نشره.
          </p>
        </div>
      </section>

      <DashboardSection
        title="الإدارة الأكاديمية"
        description="ابدأ بالكليات ثم التخصصات والمقررات، وأخيرًا أسند المقررات للتخصصات لتظهر للطلاب."
      >
        <div className="dashboard-grid">
          {academicModules.map((module) => (
            <ModuleCard
              key={module.title}
              module={module}
              onNavigate={navigate}
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        title="الإشراف على المحتوى"
        description="راجع ما يشاركه الطلاب للحفاظ على مجتمع آمن وموثوق."
      >
        <div className="dashboard-grid dashboard-grid--two">
          {moderationModules.map((module) => (
            <ModuleCard
              key={module.title}
              module={module}
              onNavigate={navigate}
            />
          ))}
        </div>
      </DashboardSection>
    </section>
  );
}

function DashboardSection({ title, description, children }) {
  return (
    <section className="dashboard-section">
      <header className="dashboard-section__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      {children}
    </section>
  );
}

function ModuleCard({ module, onNavigate }) {
  const isAvailable = Boolean(module.path);

  function handleClick() {
    if (module.path) {
      onNavigate(module.path);
    }
  }

  return (
    <article
      className={`module-card ${!isAvailable ? 'module-card--disabled' : ''}`}
    >
      <div className="module-card__top">
        <span className="module-card__icon">
          <ModuleIcon name={module.icon} />
        </span>

        {module.step && (
          <span className="module-card__step">الخطوة {module.step}</span>
        )}
      </div>

      <h3>{module.title}</h3>
      <p>{module.description}</p>

      {isAvailable ? (
        <button type="button" onClick={handleClick}>
          {module.action}
          <ArrowIcon />
        </button>
      ) : (
        <span className="module-card__coming-soon">قريبًا</span>
      )}
    </article>
  );
}

function getAdminName() {
  const savedAdmin = sessionStorage.getItem('admin');

  if (!savedAdmin) {
    return 'المسؤول';
  }

  try {
    return JSON.parse(savedAdmin).username || 'المسؤول';
  } catch {
    return 'المسؤول';
  }
}

function ModuleIcon({ name }) {
  const icons = {
    college: (
      <>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
      </>
    ),
    major: (
      <>
        <path d="m3 10 9-5 9 5-9 5-9-5Z" />
        <path d="M7 12.2V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-3.8" />
      </>
    ),
    course: (
      <>
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </>
    ),
    file: (
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="m9 15 2 2 4-4" />
      </>
    ),
    message: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M12 7v2" />
        <path d="M12 13h.01" />
      </>
    ),
  };

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
      {icons[name]}
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