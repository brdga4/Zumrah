# Zumrah — Technical Justifications

**Project:** Zumrah  
**Team:** SAU-0226-Team 9  
**Stage:** Stage 3 — Technical Documentation

---

## 1. Purpose

This document explains the main technology and design decisions used in Zumrah and why they are appropriate for the MVP. The goal is to justify the selected architecture based on the project's requirements, expected scale, team workflow, and implementation simplicity.

---

## 2. React PWA for the Student Application

Zumrah uses a **React Progressive Web App (PWA)** for the student-facing application.

### Why React

React supports reusable components, state-based user interfaces, and a large ecosystem for frontend development. It is suitable for screens such as authentication, onboarding, course registration, chat, course materials, and profile management.

### Why a PWA

A PWA allows students to use Zumrah through a browser while still providing an app-like experience and installability on supported devices.

### Why this fits Zumrah

- One web codebase can support desktop and mobile browsers.
- It avoids the additional development effort of separate native iOS and Android applications.
- It is appropriate for the MVP scope and the team's available development time.
- It integrates naturally with REST APIs and SignalR.

A native mobile application is therefore outside the MVP.

---

## 3. ASP.NET / C# for the Backend

Zumrah uses **ASP.NET with C#** for the backend API and business logic.

### Why it was chosen

ASP.NET provides built-in support for:

- REST APIs
- Authentication and authorization
- Dependency injection
- Database integration
- SignalR
- Structured validation and middleware
- Asynchronous programming

C# also provides strong typing, which helps reduce errors in entities, DTOs, services, and API contracts.

### Why this fits Zumrah

The same backend platform can handle student authentication, course enrollment, file moderation, reports, database access, and real-time SignalR communication without introducing multiple backend technologies.

---

## 4. SignalR for Real-Time Chat

Zumrah uses **SignalR** for live course and major chat.

### Why it was chosen

Normal REST APIs use a request-response model and are not ideal for delivering messages instantly to connected users. SignalR keeps a real-time connection between the React client and backend and allows the server to push events immediately.

### Zumrah usage

SignalR handles:

- Joining authorized chat rooms
- Leaving chat rooms
- Sending live messages
- Receiving new messages
- Real-time message removal
- Access revocation when a student loses permission

REST is still used to load historical messages.

### Why this split is useful

```text
REST
→ stored chat history

SignalR
→ live chat events
```

This keeps each technology responsible for the task it handles best.

---

## 5. MySQL for the Application Database

Zumrah uses **MySQL** as its relational database.

### Why it was chosen

Zumrah's data is highly relational:

- Colleges contain majors.
- Majors are linked to courses.
- Students belong to majors.
- Students enroll in courses.
- Courses and majors own chat rooms.
- Messages can have reports.
- Courses contain uploaded file metadata.

A relational database is well suited to these relationships and allows the system to enforce foreign keys, uniqueness rules, and other constraints.

### Why this fits Zumrah

MySQL is widely supported, reliable, and sufficient for the expected MVP scale. It also integrates well with ASP.NET database libraries and migrations.

---

## 6. Azure Blob Storage for Course Materials

Zumrah stores uploaded course files in **Azure Blob Storage** while MySQL stores only file metadata.

### Why files are not stored directly in MySQL

Binary files such as PDFs can be much larger than normal relational data. Storing them separately keeps the database focused on structured application data.

### Storage responsibility

```text
Azure Blob Storage
→ actual file contents

MySQL
→ file name, course, uploader, status, blob path, reviewer, timestamps
```

### Why this fits Zumrah

- Blob storage is designed for files and binary objects.
- It reduces unnecessary database size.
- The backend can still enforce enrollment and approval rules before allowing access.
- The storage design supports the file moderation workflow cleanly.

For the MVP, uploads pass through the backend before being stored in Azure Blob Storage. Direct browser-to-Blob uploads using SAS URLs are not required.

---

## 7. Microsoft Authentication for Students

Zumrah uses **Microsoft authentication** for KSU students instead of creating separate student passwords.

### Why it was chosen

Students already have university Microsoft accounts, so Microsoft can act as the trusted identity provider.

### Zumrah flow

```text
Student signs in with Microsoft
        ↓
Frontend receives Microsoft access token
        ↓
Zumrah backend validates the token
        ↓
Backend identifies the Microsoft user
        ↓
Existing student → issue Zumrah JWT
New student → complete onboarding first
```

### Why this fits Zumrah

- Zumrah does not need to store student passwords.
- The backend can verify that the identity came from the trusted university Microsoft environment.
- University email and Microsoft object ID come from a verified identity rather than user-entered values.

Admins use separate application-managed credentials because the admin authentication model is different from the student sign-in flow.

---

## 8. Zumrah JWT for Application Authorization

After successful student or admin authentication, Zumrah issues its own **JWT access token**.

### Why it was chosen

The Zumrah JWT represents the authenticated application user and can be used across protected REST endpoints and SignalR connections.

The backend can derive the current `StudentId` or `AdminId` from the token instead of trusting IDs supplied by the frontend.

For example:

```text
StudentId
→ taken from JWT

not from:
{ "studentId": "..." }
```

### Why this improves the design

It centralizes authentication and reduces the risk of a client pretending to act as another student or administrator.

---

## 9. UUIDs for Internal Identifiers

Zumrah uses **UUIDv4** values for internal primary identifiers.

Examples include:

- `StudentId`
- `CourseId`
- `MajorId`
- `MessageId`
- `FileId`

The backend generates them using C# `Guid.NewGuid()`.

### Why UUIDs were chosen

- IDs can be generated by the application without relying on database auto-increment values.
- They are suitable for distributed application components.
- They are difficult to guess sequentially compared with integer IDs.

For the MVP, UUIDs are stored in MySQL as `CHAR(36)` because it is simple to inspect and debug.

---

## 10. REST API for Standard Application Operations

Zumrah uses a **REST API** for normal request-response operations.

Examples include:

- Student profile
- Course lists
- Enrollment
- Chat history
- Course materials
- Reports
- Admin academic management
- File review
- Moderation

### Why REST was chosen

REST is simple, widely supported, and works naturally with React and ASP.NET.

HTTP methods are used according to the type of operation:

```text
GET
→ read data

POST
→ create data

PATCH
→ update part of an existing resource

DELETE
→ remove a resource or relationship
```

SignalR is used only where real-time communication is required.

---

## 11. Enrollment as an Authorization Rule

Zumrah treats **course enrollment as both membership and authorization**.

A student must be enrolled in a course before they can:

- Open its course chat
- Load its chat history
- View approved course materials
- Search course materials
- Download course materials
- Upload course materials

### Why this design was chosen

It gives the backend one clear rule for deciding course access.

```text
MAJOR_COURSE
→ course is available to the student's major

ENROLLMENT
→ student actually joined the course
```

This separates eligibility from actual access.

---

## 12. Separate Major and Course Chat Access

Zumrah has two chat types:

- One general chat for each major
- One chat for each course

### Course chat

Access depends on an active course enrollment.

### Major chat

Access depends directly on the student's current `MajorId`.

### Why this was chosen

A major community should be automatically available to all students in that major, while course communities should be available only to students who explicitly enrolled in that course.

---

## 13. Soft Deletion for Moderated Messages

When an administrator removes a message, Zumrah uses **soft deletion** rather than deleting the database row permanently.

The message is updated using fields such as:

```text
IsDeleted = true
DeletedByAdminId
DeletedAt
```

### Why this was chosen

- Moderation history is preserved.
- Reports can still reference the original message record.
- The application can record which admin removed the message and when.
- Students no longer see the removed message in normal chat history.

This provides useful moderation traceability.

---

## 14. File Approval Workflow

Student uploads begin with:

```text
PENDING
```

An administrator then changes the status to:

```text
APPROVED
```

or:

```text
REJECTED
```

Only approved files are shown or downloadable by students.

### Why this was chosen

Zumrah is designed for student-shared course materials, so moderation reduces the chance of inappropriate or irrelevant material being distributed as an approved course resource.

Rejected metadata remains recorded rather than being silently deleted.

---

## 15. Lightweight Admin Tracking

Zumrah records important administrative actions directly on the affected entities.

Examples include:

- `CreatedByAdminId`
- `UpdatedByAdminId`
- `ReviewedByAdminId`
- `DeletedByAdminId`
- Associated timestamps

### Why this was chosen

The MVP needs enough traceability to know who performed important administrative and moderation actions, but a complete audit-log subsystem would add unnecessary complexity for the current scope.

---

## 16. Simplified MVP Scope

Several possible features were deliberately excluded from the MVP, including:

- Native iOS and Android applications
- Message replies
- Reactions
- Chat attachments
- Message editing
- Teacher/tutor roles
- Destructive deletion of colleges, majors, and courses
- Course-major unassignment behavior

### Why this was chosen

The project has a limited implementation period and a four-person team. Keeping the scope focused allows the team to prioritize the core value of Zumrah:

```text
verified student access
+ academic communities
+ course enrollment
+ real-time chat
+ moderated course materials
```

This reduces implementation risk while leaving room for later expansion.

---

## 17. Overall Design Rationale

The chosen technologies work together as a single architecture:

```text
React PWA
    ↓
REST API + SignalR
    ↓
ASP.NET / C#
    ↓
MySQL + Azure Blob Storage

Microsoft Authentication
    ↓
Verified KSU student identity
```

The design prioritizes:

- Simplicity for the MVP
- Clear authorization rules
- Reusable and maintainable components
- Separation of structured data and binary files
- Real-time communication where required
- Compatibility between the selected frontend and backend technologies
- Future extensibility without overengineering the first release

The result is an architecture that supports Zumrah's current requirements while remaining practical for the team to implement within the project timeframe.
