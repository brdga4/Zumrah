import { ArrowLeft, BookOpen, FolderOpen, MessageCircle, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../Components/Card";
import Heading from "../../Components/Heading";
import Logo from "../../Components/Logo";
import Text from "../../Components/Text";
import CourseCard from "../Courses/Components/CourseCard";
import WelcomeSection from "../Students/Components/WelcomeSection";
import "../../Components/Button.css";
import "./LandingPage.css";

// Keep the icon and copy together so all three features use the same card layout.
const features = [
  {
    Icon: BookOpen,
    title: "المقررات الدراسية",
    description: "انضم إلى مقررات تخصصك وتواصل مع زملائك",
  },
  {
    Icon: MessageCircle,
    title: "المحادثات الجامعية",
    description: "ناقش مقرراتك وتبادل المعرفة مع طلاب تخصصك",
  },
  {
    Icon: FolderOpen,
    title: "الملفات الدراسية",
    description: "شارك الملفات واستفد من المصادر الدراسية المتاحة في مقرراتك",
  },
];

// Sample courses let the public preview reuse the real CourseCard without loading student data.
const previewCourses = [
  { courseCode: "CSC 111", courseName: "برمجة الحاسب" },
  { courseCode: "CSC 380", courseName: "قواعد البيانات" },
];

function PortalPreview() {
  return (
    <div className="landing-preview" aria-hidden="true">
      {/* Reuse the portal's welcome panel and course cards while keeping preview controls out of the tab order. */}
      <Card className="landing-preview-portal" inert>
        <div className="landing-preview-rail">
          <Logo size="extra-small" />
          <div className="landing-preview-icons">
            <BookOpen className="landing-preview-current" aria-hidden="true" />
            <MessageCircle aria-hidden="true" />
            <UserRound aria-hidden="true" />
          </div>
        </div>
        <div className="landing-preview-content">
          <WelcomeSection student={{ name: "أحمد" }} />
          <Heading level={3} className="landing-preview-heading">المقررات المسجّلة</Heading>
          <div className="landing-preview-courses">
            {previewCourses.map((course) => (
              <CourseCard key={course.courseCode} course={course} status="enrolled" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page" lang="ar" dir="rtl">
      <a href="#landing-main" className="landing-skip-link">انتقل إلى المحتوى</a>
      {/* Keep the wordmark and account links together in the page header. */}
      <header className="landing-header">
        <div className="landing-container landing-header-content">
          <Logo />
          {/* Login and signup use router links so visitors can also open them in a new tab. */}
          <nav className="landing-actions landing-header-actions" aria-label="روابط الحساب">
            <Link className="landing-auth-link" to="/login">تسجيل الدخول</Link>
            <Link className="landing-action zumrah-button zumrah-button--primary zumrah-button--sm" to="/signup">
              إنشاء حساب
            </Link>
          </nav>
        </div>
      </header>

      <main id="landing-main" tabIndex={-1}>
        {/* Introduce Zumrah and show a static portal preview beside the main actions. */}
        <section className="landing-container landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <Heading level={1} id="landing-title" className="landing-title">
              <span>مجتمعك الجامعي</span>{" "}
              <span>في مكان واحد</span>
            </Heading>
            <Text tone="muted" className="landing-hero-description">
              تواصل مع طلاب جامعتك وانضم إلى مقرراتك وشارك المعرفة والملفات الدراسية مع زملائك
            </Text>
            <div className="landing-actions">
              <Link className="landing-action zumrah-button zumrah-button--primary zumrah-button--lg" to="/signup">
                انضم إلى زمرة
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
              <Link className="landing-action zumrah-button zumrah-button--secondary zumrah-button--lg" to="/login">
                تسجيل الدخول
              </Link>
            </div>
          </div>
          <PortalPreview />
        </section>

        {/* Each feature uses the shared Card, Heading, and Text styles. */}
        <section className="landing-features" id="landing-features" aria-labelledby="landing-features-title">
          <div className="landing-container">
            <Heading level={2} id="landing-features-title" className="landing-section-title">
              كل ما تحتاجه في مجتمعك الجامعي
            </Heading>
            <ul className="landing-feature-list">
              {features.map(({ Icon, title, description }) => (
                <li key={title}>
                  <Card className="landing-feature-card">
                    <span className="landing-feature-icon">
                      <Icon size={24} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <Heading level={3} className="landing-feature-title">{title}</Heading>
                    <Text tone="muted" size="small">{description}</Text>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Offer a direct signup link after visitors have read about the features. */}
        <section className="landing-container landing-cta" aria-labelledby="landing-cta-title">
          <div className="landing-cta-panel">
            <Heading level={2} id="landing-cta-title" className="landing-section-title">
              انضم إلى زمرة تخصصك
            </Heading>
            <Text className="landing-cta-description">
              تواصل مع زملائك وشارك المعرفة وابدأ رحلتك الجامعية مع زمرة
            </Text>
            <Link className="landing-action zumrah-button zumrah-button--secondary zumrah-button--md" to="/signup">
              إنشاء حساب
            </Link>
          </div>
        </section>
      </main>

      {/* Close with the brand and tagline. */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-brand">
          <Logo />
          <Text tone="muted" size="small">مجتمع جامعي يصنعه الطلاب للطلاب</Text>
        </div>
      </footer>
    </div>
  );
}
