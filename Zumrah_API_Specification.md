# Zumrah — API Specification

**Project:** Zumrah  
**Team:** SAU-0226-Team 9  
**Stage:** Stage 3 — Technical Documentation  
**Scope:** MVP for King Saud University students

---

# 1. External APIs and Services

## 1.1 Microsoft Authentication

Zumrah uses Microsoft authentication to verify KSU student identities.

Students sign in using their university Microsoft account. The React PWA receives a Microsoft identity token and sends it to the Zumrah backend. The backend validates the token and uses the verified Microsoft identity to determine whether the student already has a Zumrah account.

**Used by:** Student Authentication Service  
**Purpose:** Verify student identity before Zumrah account access or onboarding  
**Reason for choice:** KSU students already use Microsoft-based university accounts, so Zumrah does not need to create or store separate student passwords.

For a new student, the frontend keeps the Microsoft token while the user completes onboarding. When onboarding is submitted, the backend validates the Microsoft token again before creating the student account.

---

## 1.2 Azure Blob Storage

Zumrah uses Azure Blob Storage to store uploaded course materials.

The MySQL database stores only file metadata such as the file name, course, uploader, review status, and blob path. The actual file contents are stored in Azure Blob Storage.

**Used by:** File Service / Blob Storage Service  
**Purpose:** Store and retrieve course materials  
**Reason for choice:** Object storage is more appropriate for uploaded binary files than storing file contents directly in the relational database.

---

# 2. Internal API Conventions

## 2.1 Base Path

All REST endpoints use:

```text
/api
```

The SignalR hub uses:

```text
/hubs/chat
```

## 2.2 Data Formats

- Standard requests and responses use JSON.
- File uploads use `multipart/form-data`.
- File downloads return binary file content.
- Internal identifiers are UUIDs.
- Date/time values use ISO 8601 UTC format.
- Protected endpoints require a Zumrah JWT access token.

Example:

```http
Authorization: Bearer <zumrah-jwt>
```

## 2.3 Authentication Rules

### Student

A student first authenticates using Microsoft. If a Zumrah student account already exists, the backend returns a Zumrah JWT.

If the student is new, the backend returns:

```json
{
  "onboardingRequired": true
}
```

The frontend then completes onboarding using the same Microsoft token. The backend validates it again, creates the student account, and returns the normal Zumrah JWT.

### Administrator

Administrators authenticate using a Zumrah username/email and password. Successful authentication returns an admin JWT.

## 2.4 Standard Error Format

API errors use a consistent JSON structure:

```json
{
  "code": "COURSE_ACCESS_DENIED",
  "message": "You do not have access to this course."
}
```

Common status codes:

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | New resource created successfully |
| `204 No Content` | Request completed successfully with no response body |
| `400 Bad Request` | Invalid request data |
| `401 Unauthorized` | Authentication is missing or invalid |
| `403 Forbidden` | Authenticated user does not have permission |
| `404 Not Found` | Requested resource does not exist |
| `409 Conflict` | Request conflicts with existing data |

---

# 3. Endpoint Summary

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `POST` | `/api/auth/student` | Authenticate a KSU student | Public |
| `POST` | `/api/auth/admin` | Authenticate an administrator | Public |
| `POST` | `/api/onboarding` | Create a new student account | Public with valid Microsoft token |
| `GET` | `/api/colleges` | List colleges | Public |
| `GET` | `/api/colleges/{collegeId}/majors` | List majors in a college | Public |
| `GET` | `/api/students/me` | View current student profile | Student |
| `PATCH` | `/api/students/me` | Update current student profile | Student |
| `GET` | `/api/courses/available` | List courses offered to the student's major | Student |
| `GET` | `/api/courses/enrolled` | List courses the student joined | Student |
| `POST` | `/api/enrollments` | Enroll in a course | Student |
| `DELETE` | `/api/enrollments/{courseId}` | Leave a course | Student |
| `GET` | `/api/chat-rooms/{chatRoomId}/messages` | Retrieve chat history | Student |
| `GET` | `/api/courses/{courseId}/files` | List/search approved course materials | Student |
| `POST` | `/api/courses/{courseId}/files` | Upload course material | Student |
| `GET` | `/api/files/{fileId}/download` | Download approved course material | Student |
| `POST` | `/api/messages/{messageId}/reports` | Report a message | Student |
| `POST` | `/api/admin/colleges` | Create a college | Admin |
| `PATCH` | `/api/admin/colleges/{collegeId}` | Update a college | Admin |
| `POST` | `/api/admin/majors` | Create a major | Admin |
| `PATCH` | `/api/admin/majors/{majorId}` | Update a major | Admin |
| `GET` | `/api/admin/courses` | List all courses | Admin |
| `POST` | `/api/admin/courses` | Create a course | Admin |
| `PATCH` | `/api/admin/courses/{courseId}` | Update a course | Admin |
| `GET` | `/api/admin/majors/{majorId}/courses` | List courses assigned to a major | Admin |
| `POST` | `/api/admin/majors/{majorId}/courses` | Assign a course to a major | Admin |
| `GET` | `/api/admin/files?status=PENDING` | List pending file uploads | Admin |
| `GET` | `/api/admin/files/{fileId}` | View file metadata | Admin |
| `GET` | `/api/admin/files/{fileId}/download` | Retrieve uploaded file for review | Admin |
| `PATCH` | `/api/admin/files/{fileId}` | Approve or reject file | Admin |
| `GET` | `/api/admin/reports?status=PENDING` | List pending reports | Admin |
| `GET` | `/api/admin/reports/{reportId}` | View report details | Admin |
| `PATCH` | `/api/admin/reports/{reportId}` | Dismiss report or remove message | Admin |

---

# 4. Authentication and Onboarding

## 4.1 Authenticate Student

**Method:** `POST`  
**Path:** `/api/auth/student`  
**Access:** Public  
**Content-Type:** `application/json`

### Request

```json
{
  "microsoftToken": "<microsoft-identity-token>"
}
```

The backend validates the Microsoft token and checks the `STUDENT` table using the verified Microsoft object ID.

### Response — Existing Student (`200 OK`)

```json
{
  "onboardingRequired": false,
  "accessToken": "<zumrah-jwt>",
  "student": {
    "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
    "name": "Ahmed Ali",
    "universityEmail": "ahmed@student.ksu.edu.sa",
    "college": {
      "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
      "collegeName": "College of Computer and Information Sciences"
    },
    "major": {
      "majorId": "61446afc-660e-4eb2-aa0a-626ae522189d",
      "majorName": "Computer Science"
    },
    "majorChatRoomId": "123fcdda-714e-42a7-849f-fcad49786258"
  }
}
```

### Response — New Student (`200 OK`)

```json
{
  "onboardingRequired": true
}
```

### Important Errors

- `401 Unauthorized` — Microsoft token is invalid or expired.
- `403 Forbidden` — Microsoft identity is not an accepted KSU student account.

---

## 4.2 Authenticate Administrator

**Method:** `POST`  
**Path:** `/api/auth/admin`  
**Access:** Public  
**Content-Type:** `application/json`

### Request

```json
{
  "identifier": "zumrah-admin",
  "password": "<password>"
}
```

`identifier` may contain either the administrator username or email.

### Response — `200 OK`

```json
{
  "accessToken": "<zumrah-admin-jwt>",
  "admin": {
    "adminId": "0854ad8a-5f4c-4d63-b88b-9c75bc750aa5",
    "username": "zumrah-admin",
    "email": "admin@zumrah.local"
  }
}
```

### Important Errors

- `401 Unauthorized` — Invalid username/email or password.

---

## 4.3 Complete Student Onboarding

**Method:** `POST`  
**Path:** `/api/onboarding`  
**Access:** Public with a valid Microsoft identity token  
**Content-Type:** `application/json`

The frontend sends the same Microsoft token used during sign-in together with the selected major.

### Request

```json
{
  "microsoftToken": "<microsoft-identity-token>",
  "majorId": "61446afc-660e-4eb2-aa0a-626ae522189d"
}
```

The backend:

1. Validates the Microsoft token again.
2. Extracts the verified Microsoft object ID, university email, and name.
3. Validates the selected major.
4. Generates a new `StudentId`.
5. Creates the `STUDENT` record.
6. Returns the normal Zumrah JWT.

### Response — `201 Created`

```json
{
  "accessToken": "<zumrah-jwt>",
  "student": {
    "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
    "name": "Ahmed Ali",
    "universityEmail": "ahmed@student.ksu.edu.sa",
    "college": {
      "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
      "collegeName": "College of Computer and Information Sciences"
    },
    "major": {
      "majorId": "61446afc-660e-4eb2-aa0a-626ae522189d",
      "majorName": "Computer Science"
    },
    "majorChatRoomId": "123fcdda-714e-42a7-849f-fcad49786258"
  }
}
```

### Important Errors

- `400 Bad Request` — Invalid major.
- `401 Unauthorized` — Microsoft token is invalid or expired.
- `403 Forbidden` — Microsoft identity is not an accepted KSU student account.
- `409 Conflict` — Student account already exists for this Microsoft identity.

---

# 5. Academic Reference Data

## 5.1 List Colleges

**Method:** `GET`  
**Path:** `/api/colleges`  
**Access:** Public

### Response — `200 OK`

```json
{
  "colleges": [
    {
      "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
      "collegeName": "College of Computer and Information Sciences"
    }
  ]
}
```

---

## 5.2 List Majors in a College

**Method:** `GET`  
**Path:** `/api/colleges/{collegeId}/majors`  
**Access:** Public

### Response — `200 OK`

```json
{
  "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
  "majors": [
    {
      "majorId": "61446afc-660e-4eb2-aa0a-626ae522189d",
      "majorName": "Computer Science"
    },
    {
      "majorId": "136e60ec-d1d7-4914-97e1-86adf635f897",
      "majorName": "Software Engineering"
    }
  ]
}
```

### Important Errors

- `404 Not Found` — College does not exist.

---

# 6. Student Profile

## 6.1 View Current Profile

**Method:** `GET`  
**Path:** `/api/students/me`  
**Access:** Student

### Response — `200 OK`

```json
{
  "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
  "name": "Ahmed Ali",
  "universityEmail": "ahmed@student.ksu.edu.sa",
  "college": {
    "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
    "collegeName": "College of Computer and Information Sciences"
  },
  "major": {
    "majorId": "61446afc-660e-4eb2-aa0a-626ae522189d",
    "majorName": "Computer Science"
  },
  "majorChatRoomId": "123fcdda-714e-42a7-849f-fcad49786258"
}
```

---

## 6.2 Update Current Profile

**Method:** `PATCH`  
**Path:** `/api/students/me`  
**Access:** Student  
**Content-Type:** `application/json`

The student's name and major are editable. University email is read-only.

### Request

```json
{
  "name": "Ahmed Mohammed",
  "majorId": "136e60ec-d1d7-4914-97e1-86adf635f897"
}
```

Either field may be omitted when it is not being changed.

If the major changes, the backend automatically removes enrollments for courses that are not offered to the new major. Any active SignalR memberships for the old major chat or removed course enrollments are also revoked.

### Response — `200 OK`

```json
{
  "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
  "name": "Ahmed Mohammed",
  "universityEmail": "ahmed@student.ksu.edu.sa",
  "college": {
    "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
    "collegeName": "College of Computer and Information Sciences"
  },
  "major": {
    "majorId": "136e60ec-d1d7-4914-97e1-86adf635f897",
    "majorName": "Software Engineering"
  },
  "majorChatRoomId": "87b98dd1-426b-48cd-b866-e847118f5320",
  "removedEnrollments": [
    {
      "courseId": "3a02307f-61e4-4228-8a0c-d9de548e8730",
      "courseCode": "CEN211",
      "courseName": "Digital Logic Design"
    }
  ]
}
```

### Important Errors

- `400 Bad Request` — Invalid profile data.
- `404 Not Found` — Selected major does not exist.

---

# 7. Courses and Enrollment

## 7.1 List Courses Available to the Student's Major

**Method:** `GET`  
**Path:** `/api/courses/available`  
**Access:** Student

### Response — `200 OK`

```json
{
  "courses": [
    {
      "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
      "courseCode": "CSC111",
      "courseName": "Programming I",
      "isEnrolled": true
    },
    {
      "courseId": "43c60187-315a-4953-8547-b214654f2c01",
      "courseCode": "CSC113",
      "courseName": "Programming II",
      "isEnrolled": false
    }
  ]
}
```

Only courses associated with the student's current major through `MAJOR_COURSE` are returned.

---

## 7.2 List Enrolled Courses

**Method:** `GET`  
**Path:** `/api/courses/enrolled`  
**Access:** Student

### Response — `200 OK`

```json
{
  "courses": [
    {
      "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
      "courseCode": "CSC111",
      "courseName": "Programming I",
      "chatRoomId": "aac97c04-ed24-4a93-941f-92a80f3389da",
      "enrolledAt": "2026-10-06T08:00:00Z"
    }
  ]
}
```

---

## 7.3 Enroll in a Course

**Method:** `POST`  
**Path:** `/api/enrollments`  
**Access:** Student  
**Content-Type:** `application/json`

### Request

```json
{
  "courseId": "43c60187-315a-4953-8547-b214654f2c01"
}
```

The backend verifies that the course is offered to the student's current major before creating the enrollment.

### Response — `201 Created`

```json
{
  "enrollmentId": "46a916e1-bfd0-46de-903d-39d57f50ea20",
  "courseId": "43c60187-315a-4953-8547-b214654f2c01",
  "chatRoomId": "6ffb8acd-3389-4315-8f74-c0c985068dc9",
  "enrolledAt": "2026-10-06T09:00:00Z"
}
```

### Important Errors

- `400 Bad Request` — Course is not offered to the student's major.
- `404 Not Found` — Course does not exist.
- `409 Conflict` — Student is already enrolled.

---

## 7.4 Leave a Course

**Method:** `DELETE`  
**Path:** `/api/enrollments/{courseId}`  
**Access:** Student

Removing the enrollment removes the student's authorization to the course chat and course materials. If the student currently has an active SignalR connection in that course chat, the backend also revokes that room membership.

### Response — `204 No Content`

### Important Errors

- `404 Not Found` — Student is not enrolled in the course.

---

# 8. Chat

## 8.1 Retrieve Chat History

**Method:** `GET`  
**Path:** `/api/chat-rooms/{chatRoomId}/messages`  
**Access:** Student

### Query Parameters

| Parameter | Required | Description |
|---|---|---|
| `limit` | No | Number of messages to return. Default: `50` |
| `before` | No | Message ID used as a cursor to retrieve older messages |

Initial request:

```http
GET /api/chat-rooms/{chatRoomId}/messages?limit=50
```

Older messages:

```http
GET /api/chat-rooms/{chatRoomId}/messages?before={oldestMessageId}&limit=50
```

The backend checks that the chat room is active and verifies access before returning messages:

- Course room → student must have an active course enrollment.
- Major room → student's `MajorId` must match the room's `MajorId`.

Soft-deleted messages are not returned as visible student messages.

### Response — `200 OK`

```json
{
  "messages": [
    {
      "messageId": "965526d9-8010-4d97-8050-c3911adadbb1",
      "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
      "studentName": "Ahmed Ali",
      "content": "Does anyone understand question 3?",
      "sentAt": "2026-10-06T06:20:00Z"
    }
  ],
  "nextBefore": "965526d9-8010-4d97-8050-c3911adadbb1"
}
```

If there are no older messages, `nextBefore` is `null`.

### Important Errors

- `403 Forbidden` — Student does not have access to the room.
- `404 Not Found` — Chat room does not exist.

Live chat messages are sent through SignalR rather than this REST endpoint.

---

# 9. Course Materials

## 9.1 List or Search Approved Materials

**Method:** `GET`  
**Path:** `/api/courses/{courseId}/files`  
**Access:** Student

### Optional Query Parameter

```text
?search={query}
```

Example:

```http
GET /api/courses/{courseId}/files?search=chapter
```

The search matches approved course materials by file name.

The student must be enrolled in the course.

### Response — `200 OK`

```json
{
  "files": [
    {
      "fileId": "496b3950-2b39-4387-9e15-e2a145006cbc",
      "fileName": "Chapter-3-Notes.pdf",
      "uploadedAt": "2026-10-06T07:00:00Z"
    }
  ]
}
```

### Important Errors

- `403 Forbidden` — Student is not enrolled in the course.
- `404 Not Found` — Course does not exist.

---

## 9.2 Upload Course Material

**Method:** `POST`  
**Path:** `/api/courses/{courseId}/files`  
**Access:** Student  
**Content-Type:** `multipart/form-data`

### Form Data

| Field | Type | Required |
|---|---|---|
| `file` | File | Yes |

The student must be actively enrolled in the course.

The actual file is uploaded to Azure Blob Storage. The backend creates a `COURSE_FILE` record with `PENDING` status.

### Response — `201 Created`

```json
{
  "fileId": "496b3950-2b39-4387-9e15-e2a145006cbc",
  "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
  "fileName": "Chapter-3-Notes.pdf",
  "status": "PENDING",
  "uploadedAt": "2026-10-06T07:00:00Z"
}
```

### Important Errors

- `400 Bad Request` — File is missing or invalid.
- `403 Forbidden` — Student is not enrolled in the course.
- `404 Not Found` — Course does not exist.

---

## 9.3 Download Approved Course Material

**Method:** `GET`  
**Path:** `/api/files/{fileId}/download`  
**Access:** Student

The backend verifies that:

1. The file exists.
2. Its status is `APPROVED`.
3. The student is enrolled in the associated course.

The backend then retrieves the file from Azure Blob Storage.

### Response — `200 OK`

Binary file content with an appropriate content type and file name.

### Important Errors

- `403 Forbidden` — Student does not have access to the course or file is not approved.
- `404 Not Found` — File does not exist.

---

# 10. Message Reporting

## 10.1 Report a Message

**Method:** `POST`  
**Path:** `/api/messages/{messageId}/reports`  
**Access:** Student  
**Content-Type:** `application/json`

### Request

```json
{
  "reason": "Inappropriate content"
}
```

A student may report the same message only once.

### Response — `201 Created`

```json
{
  "reportId": "417cb60c-d290-4d46-a163-4c970fd01a32",
  "messageId": "965526d9-8010-4d97-8050-c3911adadbb1",
  "reason": "Inappropriate content",
  "status": "PENDING",
  "createdAt": "2026-10-06T09:30:00Z"
}
```

### Important Errors

- `403 Forbidden` — Student cannot access the message's chat room.
- `404 Not Found` — Message does not exist.
- `409 Conflict` — Student already reported this message.

---

# 11. Admin — Academic Management

## 11.1 Create College

**Method:** `POST`  
**Path:** `/api/admin/colleges`  
**Access:** Admin

### Request

```json
{
  "collegeName": "College of Engineering"
}
```

### Response — `201 Created`

```json
{
  "collegeId": "15e279c2-b851-426e-a52e-a732f6571092",
  "collegeName": "College of Engineering",
  "createdAt": "2026-10-06T10:00:00Z"
}
```

---

## 11.2 Update College

**Method:** `PATCH`  
**Path:** `/api/admin/colleges/{collegeId}`  
**Access:** Admin

### Request

```json
{
  "collegeName": "College of Engineering"
}
```

### Response — `200 OK`

```json
{
  "collegeId": "15e279c2-b851-426e-a52e-a732f6571092",
  "collegeName": "College of Engineering",
  "updatedAt": "2026-10-06T10:05:00Z"
}
```

---

## 11.3 Create Major

**Method:** `POST`  
**Path:** `/api/admin/majors`  
**Access:** Admin

### Request

```json
{
  "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
  "majorName": "Computer Engineering"
}
```

Creating a major also creates its general chat room.

### Response — `201 Created`

```json
{
  "majorId": "9804c733-d74e-42b4-b971-b94fc5490ef2",
  "collegeId": "21af367d-40c7-4d2b-b714-d3447726b4eb",
  "majorName": "Computer Engineering",
  "chatRoomId": "9aae102b-c83a-44ae-8920-ddff26d0b089",
  "createdAt": "2026-10-06T10:10:00Z"
}
```

---

## 11.4 Update Major

**Method:** `PATCH`  
**Path:** `/api/admin/majors/{majorId}`  
**Access:** Admin

### Request

```json
{
  "majorName": "Computer Engineering"
}
```

### Response — `200 OK`

```json
{
  "majorId": "9804c733-d74e-42b4-b971-b94fc5490ef2",
  "majorName": "Computer Engineering",
  "updatedAt": "2026-10-06T10:15:00Z"
}
```

---

## 11.5 List All Courses

**Method:** `GET`  
**Path:** `/api/admin/courses`  
**Access:** Admin

### Response — `200 OK`

```json
{
  "courses": [
    {
      "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
      "courseCode": "CSC111",
      "courseName": "Programming I"
    }
  ]
}
```

---

## 11.6 Create Course

**Method:** `POST`  
**Path:** `/api/admin/courses`  
**Access:** Admin

### Request

```json
{
  "courseCode": "CSC111",
  "courseName": "Programming I"
}
```

Creating a course also creates its course chat room.

### Response — `201 Created`

```json
{
  "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
  "courseCode": "CSC111",
  "courseName": "Programming I",
  "chatRoomId": "aac97c04-ed24-4a93-941f-92a80f3389da",
  "createdAt": "2026-10-06T10:20:00Z"
}
```

---

## 11.7 Update Course

**Method:** `PATCH`  
**Path:** `/api/admin/courses/{courseId}`  
**Access:** Admin

### Request

```json
{
  "courseCode": "CSC111",
  "courseName": "Programming I"
}
```

Either field may be omitted if it is not being changed.

### Response — `200 OK`

```json
{
  "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
  "courseCode": "CSC111",
  "courseName": "Programming I",
  "updatedAt": "2026-10-06T10:25:00Z"
}
```

---

## 11.8 List Courses Assigned to a Major

**Method:** `GET`  
**Path:** `/api/admin/majors/{majorId}/courses`  
**Access:** Admin

This endpoint lets the admin portal display the courses already associated with a selected major before assigning additional courses.

### Response — `200 OK`

```json
{
  "majorId": "9804c733-d74e-42b4-b971-b94fc5490ef2",
  "courses": [
    {
      "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
      "courseCode": "CSC111",
      "courseName": "Programming I"
    }
  ]
}
```

### Important Errors

- `404 Not Found` — Major does not exist.

---

## 11.9 Assign Course to Major

**Method:** `POST`  
**Path:** `/api/admin/majors/{majorId}/courses`  
**Access:** Admin

### Request

```json
{
  "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af"
}
```

### Response — `201 Created`

```json
{
  "majorCourseId": "117ea09e-e95c-4eba-9fae-97e75596b382",
  "majorId": "9804c733-d74e-42b4-b971-b94fc5490ef2",
  "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
  "addedAt": "2026-10-06T10:30:00Z"
}
```

### Important Errors

- `404 Not Found` — Major or course does not exist.
- `409 Conflict` — Course is already assigned to the major.

Destructive deletion and course unassignment are outside the current MVP.

---

# 12. Admin — File Review

## 12.1 List Pending Uploaded Files

**Method:** `GET`  
**Path:** `/api/admin/files?status=PENDING`  
**Access:** Admin

### Response — `200 OK`

```json
{
  "files": [
    {
      "fileId": "496b3950-2b39-4387-9e15-e2a145006cbc",
      "fileName": "Chapter-3-Notes.pdf",
      "status": "PENDING",
      "course": {
        "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
        "courseCode": "CSC111",
        "courseName": "Programming I"
      },
      "uploadedBy": {
        "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
        "name": "Ahmed Ali"
      },
      "uploadedAt": "2026-10-06T07:00:00Z"
    }
  ]
}
```

---

## 12.2 View Uploaded File Metadata

**Method:** `GET`  
**Path:** `/api/admin/files/{fileId}`  
**Access:** Admin

### Response — `200 OK`

```json
{
  "fileId": "496b3950-2b39-4387-9e15-e2a145006cbc",
  "fileName": "Chapter-3-Notes.pdf",
  "status": "PENDING",
  "course": {
    "courseId": "e18d20e5-e398-47c8-9e85-d70c9c52a3af",
    "courseCode": "CSC111",
    "courseName": "Programming I"
  },
  "uploadedBy": {
    "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
    "name": "Ahmed Ali"
  },
  "uploadedAt": "2026-10-06T07:00:00Z"
}
```

---

## 12.3 Download Uploaded File for Review

**Method:** `GET`  
**Path:** `/api/admin/files/{fileId}/download`  
**Access:** Admin

### Response — `200 OK`

Binary file content retrieved from Azure Blob Storage.

---

## 12.4 Approve or Reject Uploaded File

**Method:** `PATCH`  
**Path:** `/api/admin/files/{fileId}`  
**Access:** Admin

### Approve Request

```json
{
  "status": "APPROVED"
}
```

### Reject Request

```json
{
  "status": "REJECTED"
}
```

The backend records the authenticated administrator as `ReviewedByAdminId` and records the review time.

### Response — `200 OK`

```json
{
  "fileId": "496b3950-2b39-4387-9e15-e2a145006cbc",
  "status": "APPROVED",
  "reviewedByAdminId": "0854ad8a-5f4c-4d63-b88b-9c75bc750aa5",
  "reviewedAt": "2026-10-06T11:00:00Z"
}
```

### Important Errors

- `400 Bad Request` — Invalid status transition.
- `404 Not Found` — File does not exist.

---

# 13. Admin — Reports and Moderation

## 13.1 List Pending Reports

**Method:** `GET`  
**Path:** `/api/admin/reports?status=PENDING`  
**Access:** Admin

### Response — `200 OK`

```json
{
  "reports": [
    {
      "reportId": "417cb60c-d290-4d46-a163-4c970fd01a32",
      "reason": "Inappropriate content",
      "status": "PENDING",
      "createdAt": "2026-10-06T09:30:00Z",
      "message": {
        "messageId": "965526d9-8010-4d97-8050-c3911adadbb1",
        "content": "Reported message content",
        "sentAt": "2026-10-06T09:20:00Z"
      },
      "reportedBy": {
        "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
        "name": "Ahmed Ali"
      }
    }
  ]
}
```

---

## 13.2 View Report Details

**Method:** `GET`  
**Path:** `/api/admin/reports/{reportId}`  
**Access:** Admin

### Response — `200 OK`

```json
{
  "reportId": "417cb60c-d290-4d46-a163-4c970fd01a32",
  "reason": "Inappropriate content",
  "status": "PENDING",
  "createdAt": "2026-10-06T09:30:00Z",
  "message": {
    "messageId": "965526d9-8010-4d97-8050-c3911adadbb1",
    "content": "Reported message content",
    "sentAt": "2026-10-06T09:20:00Z",
    "sender": {
      "studentId": "311e8ef9-ed36-4efa-a591-2ec7845ea1f1",
      "name": "Student Name"
    }
  },
  "reportedBy": {
    "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
    "name": "Ahmed Ali"
  }
}
```

---

## 13.3 Dismiss Report or Remove Message

**Method:** `PATCH`  
**Path:** `/api/admin/reports/{reportId}`  
**Access:** Admin

### Dismiss Request

```json
{
  "status": "DISMISSED"
}
```

### Remove Message Request

```json
{
  "status": "MESSAGE_REMOVED"
}
```

If the status is `MESSAGE_REMOVED`, the backend performs the moderation changes in the same transaction:

1. Sets the selected report status to `MESSAGE_REMOVED`.
2. Sets any other `PENDING` reports for the same message to `MESSAGE_REMOVED`.
3. Records the reviewing admin and review time for the reports resolved by this action.
4. Soft-deletes the message.
5. Records `DeletedByAdminId` and `DeletedAt`.
6. Broadcasts a `MessageRemoved` SignalR event so connected clients remove the message from the visible chat.

### Response — `200 OK`

```json
{
  "reportId": "417cb60c-d290-4d46-a163-4c970fd01a32",
  "status": "MESSAGE_REMOVED",
  "reviewedByAdminId": "0854ad8a-5f4c-4d63-b88b-9c75bc750aa5",
  "reviewedAt": "2026-10-06T11:15:00Z"
}
```

### Important Errors

- `400 Bad Request` — Invalid report status transition.
- `404 Not Found` — Report does not exist.

---

# 14. SignalR Real-Time Chat Interface

Real-time chat messages are handled through SignalR rather than REST.

## Hub

```text
/hubs/chat
```

The SignalR connection uses the authenticated student's Zumrah JWT.

The student identity is taken from the authenticated connection. The frontend does not send a `studentId` parameter.

## 14.1 Client-to-Server Hub Methods

| Method | Parameters | Purpose |
|---|---|---|
| `JoinRoom` | `chatRoomId` | Join an authorized course or major chat group |
| `LeaveRoom` | `chatRoomId` | Leave a SignalR chat group |
| `SendMessage` | `chatRoomId`, `content` | Send a text message to the selected room |

### `JoinRoom`

```text
JoinRoom(chatRoomId)
```

The backend verifies that the room is active and that the student has access before adding the connection to the SignalR group.

### `SendMessage`

```text
SendMessage(chatRoomId, content)
```

The backend:

1. Gets the student identity from the authenticated connection.
2. Verifies that the chat room is active and that the student has access.
3. Saves the message to MySQL.
4. Broadcasts the saved message to the room.

## 14.2 Server-to-Client Events

| Event | Payload | Purpose |
|---|---|---|
| `ReceiveMessage` | Message object | Deliver a new real-time message |
| `MessageRejected` | Error object | Inform the sender that a message could not be sent |
| `MessageRemoved` | Message ID + chat room ID | Remove a moderated message from connected clients |
| `AccessRevoked` | Chat room ID | Inform a client that access to a room was removed |

### `ReceiveMessage` Example

```json
{
  "messageId": "965526d9-8010-4d97-8050-c3911adadbb1",
  "chatRoomId": "aac97c04-ed24-4a93-941f-92a80f3389da",
  "studentId": "247c3afb-f2eb-4a35-85cd-018be08ae76b",
  "studentName": "Ahmed Ali",
  "content": "Does anyone understand question 3?",
  "sentAt": "2026-10-06T06:20:00Z"
}
```

### `MessageRejected` Example

```json
{
  "code": "CHAT_ACCESS_DENIED",
  "message": "You do not have access to this chat room."
}
```


### `MessageRemoved` Example

```json
{
  "messageId": "965526d9-8010-4d97-8050-c3911adadbb1",
  "chatRoomId": "aac97c04-ed24-4a93-941f-92a80f3389da"
}
```

### `AccessRevoked` Example

```json
{
  "chatRoomId": "aac97c04-ed24-4a93-941f-92a80f3389da"
}
```

`AccessRevoked` may be sent when a student leaves a course or changes major. The backend also removes the student's active connection from the affected SignalR group.

---

# 15. Important Authorization Rules

The API enforces the following MVP rules on the server:

- A student may enroll only in courses associated with their current major.
- A student may access a course chat only while enrolled in that course.
- A student may access the general major chat only for their current major.
- Inactive chat rooms (`IsActive = false`) cannot be joined, read, or used to send messages.
- A student may view, search, upload, or download course materials only while enrolled in the course.
- Only `APPROVED` course materials are visible/downloadable to students.
- A student may report the same message only once.
- Student identity is derived from the JWT and is not trusted from request body parameters.
- Admin identity is derived from the admin JWT.
- Changing a student's major automatically removes incompatible course enrollments and revokes affected active SignalR room memberships.
- Leaving a course immediately revokes access to its chat and materials, including active SignalR room membership.
- When a moderated message is removed, all still-pending reports for that same message are resolved as `MESSAGE_REMOVED`.
- Creating a major automatically creates its general chat room.
- Creating a course automatically creates its course chat room.
- Message removal is a soft delete.
