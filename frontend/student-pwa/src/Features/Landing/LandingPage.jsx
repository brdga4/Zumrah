import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCheck,
  ChevronLeft,
  FileCheck2,
  FileText,
  GraduationCap,
  Layers3,
  LockKeyhole,
  MessageCircleMore,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import Logo from '../../Components/Logo';
import './LandingPage.css';

const features = [
  {
    icon: BookOpen,
    accent: 'violet',
    number: '01',
    title: 'مقرراتك، بطريقتك',
    description: 'تصفّح المقررات المتاحة، وانضم إلى مقرراتك بسهولة، ووصل لكل ما يخصها من مكان واحد.',
    detail: 'مقررات منظّمة وسهلة الوصول',
  },
  {
    icon: MessagesSquare,
    accent: 'pink',
    number: '02',
    title: 'نقاشات تجمعكم',
    description: 'اسأل، ناقش، وتبادل الخبرات مع طلاب مقررك وتخصصك في محادثات مباشرة.',
    detail: 'محادثات المقررات والتخصص',
  },
  {
    icon: FileCheck2,
    accent: 'blue',
    number: '03',
    title: 'ملفاتك في مكانها',
    description: 'شارك الملفات الدراسية واستفد من المواد المرفوعة بعد مراجعتها واعتمادها.',
    detail: 'ملفات منظمة وتحت المراجعة',
  },
];

const steps = [
  {
    number: '01',
    title: 'أنشئ حسابك الجامعي',
    description: 'سجّل باستخدام بريدك الجامعي وانضم إلى مجتمع طلاب جامعة الملك سعود.',
  },
  {
    number: '02',
    title: 'اختر مقرراتك',
    description: 'اعثر على المقررات التي تدرسها وسجّل فيها لتصل إلى مساحاتها.',
  },
  {
    number: '03',
    title: 'ابدأ مع زمرتك',
    description: 'شارك في النقاشات، واطّلع على ملفات المقررات من نفس المنصة.',
  },
];

function PreviewCard() {
  return (
    <div className="zl-preview-wrap">
      <div className="zl-floating-note zl-floating-note--chat" aria-hidden="true">
        <span className="zl-floating-note__icon"><MessageCircleMore size={19} /></span>
        <span><strong>نقاشات أسهل</strong><small>كل مقرر له مساحته</small></span>
      </div>

      <div className="zl-preview" aria-label="نموذج توضيحي لواجهة زمرة">
        <div className="zl-preview__top">
          <div className="zl-preview__top-brand"><span className="zl-preview__brand-dot">✦</span> زُمْرَة</div>
          <span className="zl-preview__sample">نموذج توضيحي</span>
          <div className="zl-preview__avatar" aria-hidden="true">ز</div>
        </div>
        <div className="zl-preview__body">
          <aside className="zl-preview__sidebar" aria-hidden="true">
            <span className="zl-preview__side-icon zl-preview__side-icon--active"><Layers3 size={19} /></span>
            <span className="zl-preview__side-icon"><MessagesSquare size={19} /></span>
            <span className="zl-preview__side-icon"><FileText size={19} /></span>
            <span className="zl-preview__side-bottom"><GraduationCap size={18} /></span>
          </aside>

          <div className="zl-preview__content">
            <div className="zl-preview__welcome">
              <div>
                <span className="zl-preview__eyebrow">مساحتك الجامعية</span>
                <h3>كل شيء صار أوضح <span>✳</span></h3>
                <p>مقرراتك، محادثاتك، وملفاتك في مكان واحد.</p>
              </div>
              <span className="zl-preview__welcome-icon"><GraduationCap size={26} strokeWidth={1.7} /></span>
            </div>

            <div className="zl-preview__section-title">
              <strong>مقرراتي</strong>
              <span>الفصل الدراسي الحالي</span>
            </div>
            <div className="zl-preview__courses">
              <div className="zl-course-tile">
                <div className="zl-course-tile__top"><span>CS 101</span><span className="zl-course-tile__status">مسجّل</span></div>
                <strong>مقدمة في البرمجة</strong>
                <div className="zl-course-tile__bottom"><span><MessagesSquare size={13} /> المحادثة</span><span><FileText size={13} /> الملفات</span></div>
              </div>
              <div className="zl-course-tile zl-course-tile--second">
                <div className="zl-course-tile__top"><span>MATH 101</span><span className="zl-course-tile__status">مسجّل</span></div>
                <strong>الرياضيات</strong>
                <div className="zl-course-tile__bottom"><span><MessagesSquare size={13} /> المحادثة</span><span><FileText size={13} /> الملفات</span></div>
              </div>
            </div>

            <div className="zl-preview__discussion">
              <div className="zl-preview__section-title"><strong>من نقاشات المقررات</strong><span>مقدمة في البرمجة</span></div>
              <div className="zl-message"><span className="zl-message__avatar">أ</span><span><b>أحد طلاب المقرر</b><small>مين عنده ملخص المحاضرة الأخيرة؟</small></span></div>
              <div className="zl-message zl-message--answer"><span className="zl-message__avatar">س</span><span><b>طالب من الزمرة</b><small>تم رفعه في ملفات المقرر! <CheckCheck size={13} /></small></span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="zl-floating-note zl-floating-note--files" aria-hidden="true">
        <span className="zl-floating-note__icon zl-floating-note__icon--green"><FileCheck2 size={19} /></span>
        <span><strong>مواد دراسية مرتبة</strong><small>ترجع لها وقت ما تحتاج</small></span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="zl" dir="rtl">
      <header className="zl-header">
        <nav className="zl-container zl-nav" aria-label="القائمة الرئيسية">
          <Link className="zl-nav__brand" to="/" aria-label="زمرة - الصفحة الرئيسية">
            <span className="zl-nav__symbol" aria-hidden="true"><span>✳</span></span>
            <Logo size="extra-small" />
          </Link>
          <div className="zl-nav__links">
            <a href="#features">مميزات زمرة</a>
            <a href="#how-it-works">كيف تعمل؟</a>
            <a href="#about">عن زمرة</a>
          </div>
          <div className="zl-nav__actions">
            <Link className="zl-nav__login" to="/login">تسجيل الدخول</Link>
            <Link className="zl-button zl-button--small" to="/signup">انضم لزمرة <ArrowLeft size={16} /></Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="zl-hero" aria-labelledby="zl-heading">
          <div className="zl-hero__glow" aria-hidden="true" />
          <div className="zl-container zl-hero__grid">
            <div className="zl-hero__copy">
              <span className="zl-eyebrow"><span className="zl-eyebrow__dot" /> مجتمع جامعي يجمعنا</span>
              <h1 id="zl-heading">جامعتك أسهل،<br /><span>لما تكون مع زمرتك.</span></h1>
              <p className="zl-hero__lead">ودّع تشتّت القروبات وضياع الملفات. في <strong>زمرة</strong> تلاقي مقرراتك، تتواصل مع زملائك، وتشارك المعرفة في مساحة واحدة تجمعكم.</p>
              <div className="zl-hero__actions">
                <Link className="zl-button zl-button--primary" to="/signup">ابدأ رحلتك مع زمرة <ArrowLeft size={19} /></Link>
                <a className="zl-button zl-button--outline" href="#features">اكتشف المميزات <ChevronLeft size={18} /></a>
              </div>
              <div className="zl-hero__meta"><ShieldCheck size={18} /><span>متاحة حاليًا لطلاب جامعة الملك سعود</span></div>
              <div className="zl-hero__mini-benefits" aria-label="مميزات زمرة الأساسية">
                <span><BookOpen size={17} /> مقرراتك</span>
                <span><MessageCircleMore size={17} /> محادثاتك</span>
                <span><FileText size={17} /> ملفاتك</span>
              </div>
            </div>
            <div className="zl-hero__art"><PreviewCard /></div>
          </div>
        </section>

        <section className="zl-story" id="about" aria-label="فكرة زمرة">
          <div className="zl-container zl-story__inner">
            <div className="zl-story__mark"><Sparkles size={21} /></div>
            <p>من سؤال بسيط في قروب، إلى ملف تحتاجه قبل الاختبار... <strong>كل شيء له مكان في زمرة.</strong></p>
            <span>مساحة جامعية يصنعها الطلاب للطلاب</span>
          </div>
        </section>

        <section className="zl-section zl-features" id="features" aria-labelledby="zl-features-title">
          <div className="zl-container">
            <div className="zl-section__intro">
              <span className="zl-section__label">ليش زمرة؟</span>
              <h2 id="zl-features-title">كل اللي تحتاجه، <span>في مساحة واحدة.</span></h2>
              <p>بدل ما تتنقل بين قروبات وروابط وملفات، خل تركيزك على الأشياء اللي تهم دراستك.</p>
            </div>
            <div className="zl-features__grid">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article className={`zl-feature zl-feature--${feature.accent}`} key={feature.number}>
                    <div className="zl-feature__top"><span className="zl-feature__icon"><Icon size={26} strokeWidth={1.8} /></span><span className="zl-feature__number">{feature.number}</span></div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <div className="zl-feature__detail"><CheckCheck size={17} /> {feature.detail}</div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="zl-section zl-steps" id="how-it-works" aria-labelledby="zl-steps-title">
          <div className="zl-container zl-steps__grid">
            <div className="zl-steps__copy">
              <span className="zl-section__label">البداية بسيطة</span>
              <h2 id="zl-steps-title">ثلاث خطوات،<br /><span>وتصير من الزمرة.</span></h2>
              <p>من تسجيلك إلى أول نقاش مع زملائك، كل شيء واضح وسهل.</p>
              <Link className="zl-steps__link" to="/signup">أنشئ حسابك الآن <ArrowLeft size={18} /></Link>
            </div>
            <div className="zl-steps__list">
              {steps.map((step) => (
                <div className="zl-step" key={step.number}>
                  <span className="zl-step__number">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="zl-cta" aria-labelledby="zl-cta-title">
          <div className="zl-container zl-cta__inner">
            <div className="zl-cta__decoration zl-cta__decoration--one" aria-hidden="true" />
            <div className="zl-cta__decoration zl-cta__decoration--two" aria-hidden="true" />
            <span className="zl-cta__tag"><UsersRound size={17} /> مكانك بين زملائك</span>
            <h2 id="zl-cta-title">أفضل رحلة جامعية،<br />تبدأ مع <span>زمرتك.</span></h2>
            <p>مقررات أوضح، نقاشات أقرب، وملفات في متناول يدك.</p>
            <Link className="zl-button zl-button--light" to="/signup">انضم إلى زمرة الآن <ArrowLeft size={18} /></Link>
            <span className="zl-cta__note"><LockKeyhole size={14} /> التسجيل بالبريد الجامعي</span>
          </div>
        </section>
      </main>

      <footer className="zl-footer">
        <div className="zl-container zl-footer__inner">
          <div className="zl-footer__brand"><Logo size="extra-small" /><span>مجتمع جامعي يصنعه الطلاب للطلاب.</span></div>
          <div className="zl-footer__links"><a href="#features">المميزات</a><a href="#how-it-works">كيف تعمل؟</a><Link to="/login">تسجيل الدخول</Link></div>
          <span className="zl-footer__copyright">© {new Date().getFullYear()} زمرة</span>
        </div>
      </footer>
    </div>
  );
}
