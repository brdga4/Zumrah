// 1. Import shared UI components
import Badge from "../../../Components/Badge";
import Heading from "../../../Components/Heading";
import Text from "../../../Components/Text";
// Import WelcomeSection styles
import "./WelcomeSection.css";

// 2. Receive student data from HomePage
export default function WelcomeSection({ student }) {
  const firstName = student?.name?.split(" ")[0];

  // 3. Render the welcome section
  return (
    <section className="welcome-section">
      <span className="welcome-accent" aria-hidden="true" />

      <div className="welcome-copy">
        {student?.college?.collegeName && (
          <Badge variant="soft" className="welcome-eyebrow">
            {student.college.collegeName}
          </Badge>
        )}

        <Heading level={2} className="welcome-title">
         يا هلا <span className="welcome-name">{firstName} 👋 </span>
        </Heading>

        <Text tone="muted" className="welcome-meta">
         زمرة هي مساحتك الجامعية للتعلمم والتواصل مع زملائك
        </Text>
      </div>
    </section>
  );
}