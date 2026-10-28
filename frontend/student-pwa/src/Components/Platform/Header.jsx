// ==========================================
// 1. IMPORT SHARED COMPONENTS
// ==========================================

import { Link } from "react-router-dom";
import Avatar from "../Avatar";
import Heading from "../Heading";
import Text from "../Text";

// ==========================================
// 2. RECEIVE PROPS FROM PLATFORM LAYOUT
// ==========================================

export default function Header({
  title,
  subtitle,
  studentName,
  majorName,
  backHref,
}) {
  return (
    <header className="platform-header">

      {/* 3. Page title and optional back button */}
      <div className="platform-header-start">

        {backHref && (
          <Link to={backHref} className="platform-back">
            رجوع
          </Link>
        )}

        <div className="platform-header-text">
          <Heading level={1} className="platform-header-title">
            {title}
          </Heading>

          {subtitle && (
            <Text size="small" tone="muted">
              {subtitle}
            </Text>
          )}
        </div>
      </div>

      {/* 4. Display the student's information */}
      <div className="platform-user-chip">
        <div className="platform-user-chip-text">
          <span className="platform-user-chip-name">
            {studentName}
          </span>

          <span className="platform-user-chip-major">
            {majorName}
          </span>
        </div>

        <Avatar name={studentName} size="small" />
      </div>

    </header>
  );
}