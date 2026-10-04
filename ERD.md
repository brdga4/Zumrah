## ER Diagram

![Zumrah ER Diagram](./docs/Zumrah_ERD.svg)

<details>
<summary>View Mermaid source</summary>

```mermaid
---
config:
  theme: dark
  fontFamily: '''Recursive Variable'', sans-serif'
  themeVariables:
    fontFamily: '''Recursive Variable'', sans-serif'
---

erDiagram

    COLLEGE {
        int CollegeID PK
        string CollegeName
    }

    MAJOR {
        int MajorID PK
        int CollegeID FK
        string MajorName
    }

    STUDENT {
        int StudentID PK
        string MicrosoftObjectID
        string UniversityEmail
        string Name
        int MajorID FK
        datetime CreatedAt
    }

    COURSE {
        int CourseID PK
        string CourseCode
        string CourseName
    }

    MAJOR_COURSE {
        int MajorCourseID PK
        int MajorID FK
        int CourseID FK
    }

    ENROLLMENT {
        int EnrollmentID PK
        int StudentID FK
        int CourseID FK
        datetime EnrolledAt
    }

    CHAT_ROOM {
        int ChatRoomID PK
        string RoomType
        int CourseID FK
        int MajorID FK
    }

    MESSAGE {
        int MessageID PK
        int ChatRoomID FK
        int StudentID FK
        string Content
        datetime SentAt
        boolean IsDeleted
    }

    REPORT {
        int ReportID PK
        int MessageID FK
        int StudentID FK
        int ReviewedByAdminID FK
        string Reason
        string Status
        datetime CreatedAt
        datetime ReviewedAt
    }

    COURSE_FILE {
        int FileID PK
        int CourseID FK
        int UploadedByStudentID FK
        int ReviewedByAdminID FK
        string FileName
        string BlobPath
        string Status
        datetime UploadedAt
        datetime ReviewedAt
    }

    ADMIN {
        int AdminID PK
        string Username
        string Email
        string PasswordHash
        datetime CreatedAt
    }


    COLLEGE ||--o{ MAJOR : contains

    MAJOR ||--o{ STUDENT : has


    MAJOR ||--o{ MAJOR_COURSE : offers
    COURSE ||--o{ MAJOR_COURSE : belongs_to


    STUDENT ||--o{ ENROLLMENT : enrolls
    COURSE ||--o{ ENROLLMENT : receives


    COURSE o|--|| CHAT_ROOM : has_course_chat
    MAJOR o|--|| CHAT_ROOM : has_general_chat


    CHAT_ROOM ||--o{ MESSAGE : contains
    STUDENT ||--o{ MESSAGE : sends


    MESSAGE ||--o{ REPORT : receives
    STUDENT ||--o{ REPORT : submits
    ADMIN o|--o{ REPORT : reviews


    COURSE ||--o{ COURSE_FILE : contains
    STUDENT ||--o{ COURSE_FILE : uploads
    ADMIN o|--o{ COURSE_FILE : reviews
```

</details>