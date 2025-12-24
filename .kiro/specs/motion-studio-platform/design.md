# Design Document: Motion Design Studio Platform

## Overview

The Motion Design Studio Platform is a full-stack web application serving as both a professional portfolio showcase and a comprehensive learning management system (LMS). The platform is built with a modern component-based architecture using React for the frontend, Node.js/Express for the backend, and a relational database for data persistence. The design prioritizes performance, scalability, and a premium user experience that reflects the studio's motion design expertise through subtle, purposeful animations and a carefully curated visual design system.

The platform serves three primary user roles:
- **Public Users**: Browse portfolio and course listings without authentication
- **Students**: Authenticated users enrolled in courses with progress tracking and assignment submission capabilities
- **Instructors/Admins**: Authenticated users with permissions to create courses, manage content, review submissions, and administer the platform

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ Public Pages │ Auth Pages   │ Student Dash │ Instructor │ │
│  │ (Portfolio,  │ (Login,      │ (Courses,    │ Portal     │ │
│  │ Courses)     │ Sign-up)     │ Progress)    │            │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ (REST API)
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (Express.js)                      │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ Auth Routes  │ Course Routes│ Assignment   │ Payment    │ │
│  │              │              │ Routes       │ Routes     │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Middleware: Auth, Validation, Error Handling             │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Data Layer (PostgreSQL/MySQL)                   │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ Users        │ Courses      │ Lessons      │ Assignments│ │
│  │ Enrollments  │ Submissions  │ Feedback     │ Payments   │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           External Services                                  │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Email Service│ Payment      │ File Storage │             │
│  │ (SendGrid)   │ (Stripe/     │ (AWS S3)     │             │
│  │              │ Paystack)    │              │             │
│  └──────────────┴──────────────┴──────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- React Router for navigation
- Zustand or Context API for state management
- Tailwind CSS for styling (configured with brand colors)
- Framer Motion for animations
- Axios for HTTP requests

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- Nodemailer or SendGrid for email verification

**Database:**
- PostgreSQL or MySQL
- Prisma ORM for database abstraction

**External Services:**
- Stripe or Paystack for payment processing
- AWS S3 or similar for file storage
- SendGrid or similar for email delivery

## Components and Interfaces

### Frontend Component Structure

```
App/
├── Layout/
│   ├── Header (Navigation, Auth state)
│   ├── Footer (Links, Contact info)
│   └── Sidebar (Instructor/Admin only)
├── Pages/
│   ├── Public/
│   │   ├── Home (Hero, Featured projects, CTA)
│   │   ├── Portfolio (Project grid, Case studies)
│   │   ├── Courses (Course listing)
│   │   ├── CourseDetail (Course info, Enroll button)
│   │   ├── About (Studio story, Mission, Team)
│   │   └── Contact (Contact forms)
│   ├── Auth/
│   │   ├── SignUp (Registration form, Email verification)
│   │   ├── Login (Credentials form)
│   │   └── VerifyEmail (Email confirmation)
│   ├── Student/
│   │   ├── Dashboard (Enrolled courses, Progress)
│   │   ├── CourseView (Lessons, Assignments)
│   │   ├── LessonView (Content display)
│   │   ├── AssignmentView (Submission form)
│   │   └── SubmissionHistory (Past submissions, Feedback)
│   └── Instructor/
│       ├── Dashboard (Course management)
│       ├── CourseBuilder (Create/Edit courses)
│       ├── LessonUpload (Upload content)
│       ├── AssignmentCreator (Create assignments)
│       └── SubmissionReview (Review submissions, Leave feedback)
├── Components/
│   ├── Common/
│   │   ├── Button (Primary, Secondary, Tertiary)
│   │   ├── Card (Project card, Course card)
│   │   ├── Modal (Confirmation, Forms)
│   │   ├── ProgressBar (Course progress)
│   │   ├── Badge (Status indicators)
│   │   └── Form (Input, Textarea, FileUpload)
│   ├── Animation/
│   │   ├── FadeIn (Fade-in animation wrapper)
│   │   ├── SlideUp (Slide-up animation wrapper)
│   │   └── Parallax (Gentle parallax effect)
│   └── Specific/
│       ├── ProjectCard (Portfolio item)
│       ├── CourseCard (Course listing item)
│       ├── LessonCard (Lesson in course)
│       ├── AssignmentCard (Assignment item)
│       └── SubmissionCard (Submission item)
└── Hooks/
    ├── useAuth (Authentication state)
    ├── useCourses (Course data fetching)
    ├── useAssignments (Assignment data fetching)
    └── useUser (User profile data)
```

### API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

**Courses:**
- `GET /api/courses` - List all courses (public)
- `GET /api/courses/:id` - Get course details (public)
- `POST /api/courses` - Create course (instructor only)
- `PUT /api/courses/:id` - Update course (instructor only)
- `DELETE /api/courses/:id` - Delete course (instructor only)
- `POST /api/courses/:id/enroll` - Enroll student in course
- `GET /api/students/courses` - Get enrolled courses (student)

**Lessons:**
- `GET /api/courses/:courseId/lessons` - Get course lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons` - Create lesson (instructor only)
- `PUT /api/lessons/:id` - Update lesson (instructor only)
- `DELETE /api/lessons/:id` - Delete lesson (instructor only)
- `POST /api/lessons/:id/complete` - Mark lesson as complete (student)

**Assignments:**
- `GET /api/courses/:courseId/assignments` - Get course assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments` - Create assignment (instructor only)
- `PUT /api/assignments/:id` - Update assignment (instructor only)
- `DELETE /api/assignments/:id` - Delete assignment (instructor only)

**Submissions:**
- `POST /api/assignments/:id/submit` - Submit assignment (student)
- `GET /api/assignments/:id/submissions` - Get all submissions (instructor)
- `GET /api/submissions/:id` - Get submission details
- `POST /api/submissions/:id/feedback` - Add feedback (instructor)
- `GET /api/students/submissions` - Get student's submissions (student)

**Payments:**
- `POST /api/payments/create-checkout` - Create payment session
- `POST /api/payments/webhook` - Handle payment webhook
- `GET /api/payments/status/:id` - Check payment status

**Users:**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user details (admin)

## Data Models

### User Model
```typescript
interface User {
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  role: 'student' | 'instructor' | 'admin'
  emailVerified: boolean
  emailVerificationToken: string (nullable)
  emailVerificationTokenExpiry: Date (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Course Model
```typescript
interface Course {
  id: string (UUID)
  title: string
  description: string
  instructorId: string (foreign key to User)
  duration: string (e.g., "4 weeks")
  pricing: number (0 for free courses)
  currency: string (default: 'USD')
  curriculum: string (detailed curriculum text)
  introVideoUrl: string (nullable)
  thumbnailUrl: string (nullable)
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Enrollment Model
```typescript
interface Enrollment {
  id: string (UUID)
  studentId: string (foreign key to User)
  courseId: string (foreign key to Course)
  enrolledAt: Date
  progressPercentage: number (0-100)
  status: 'active' | 'completed' | 'dropped'
  completedAt: Date (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Lesson Model
```typescript
interface Lesson {
  id: string (UUID)
  courseId: string (foreign key to Course)
  title: string
  description: string
  content: string (markdown or HTML)
  videoUrl: string (nullable)
  fileUrls: string[] (array of file URLs)
  order: number (sequence in course)
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

### LessonCompletion Model
```typescript
interface LessonCompletion {
  id: string (UUID)
  studentId: string (foreign key to User)
  lessonId: string (foreign key to Lesson)
  completedAt: Date
  createdAt: Date
}
```

### Assignment Model
```typescript
interface Assignment {
  id: string (UUID)
  courseId: string (foreign key to Course)
  title: string
  description: string
  submissionType: 'file' | 'link'
  deadline: Date
  createdAt: Date
  updatedAt: Date
}
```

### Submission Model
```typescript
interface Submission {
  id: string (UUID)
  assignmentId: string (foreign key to Assignment)
  studentId: string (foreign key to User)
  submissionType: 'file' | 'link'
  fileUrl: string (nullable)
  linkUrl: string (nullable)
  submittedAt: Date
  status: 'pending' | 'submitted' | 'late' | 'reviewed'
  createdAt: Date
  updatedAt: Date
}
```

### Feedback Model
```typescript
interface Feedback {
  id: string (UUID)
  submissionId: string (foreign key to Submission)
  instructorId: string (foreign key to User)
  comment: string
  rating: number (1-5, nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Payment Model
```typescript
interface Payment {
  id: string (UUID)
  studentId: string (foreign key to User)
  courseId: string (foreign key to Course)
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentProvider: 'stripe' | 'paystack'
  transactionId: string (external provider ID)
  createdAt: Date
  updatedAt: Date
}
```

### Project Model (Portfolio)
```typescript
interface Project {
  id: string (UUID)
  title: string
  description: string
  goal: string
  solution: string
  motionBreakdown: string
  toolsUsed: string[]
  thumbnailUrl: string
  caseStudyUrl: string
  order: number (display order)
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Email Verification Round Trip
*For any* user registration, sending a verification email and clicking the verification link should result in the user's email being marked as verified and the user gaining full platform access.
**Validates: Requirements 3.2, 3.3**

### Property 2: Course Access Control
*For any* paid course and any student, if the student has not completed a payment transaction, the student should be unable to access course content and should see a purchase prompt.
**Validates: Requirements 7.4**

### Property 3: Payment Completion Grants Access
*For any* paid course and any student, if the student completes a successful payment transaction, the student should immediately gain full access to all course lessons and assignments.
**Validates: Requirements 7.2, 7.5**

### Property 4: Free Course Immediate Access
*For any* free course and any student, enrolling in the course should immediately grant course access without requiring payment.
**Validates: Requirements 2.4**

### Property 5: Progress Tracking Accuracy
*For any* course and any student, the course progress percentage should equal the ratio of completed lessons to total lessons multiplied by 100, rounded to the nearest integer.
**Validates: Requirements 4.2, 4.4**

### Property 6: Assignment Deadline Enforcement
*For any* assignment and any student, if a submission is made before the deadline, the submission status should be marked as "submitted"; if made after the deadline, the status should be marked as "late".
**Validates: Requirements 5.3, 5.4**

### Property 7: Submission Persistence
*For any* assignment submission, storing the submission and then retrieving it should return the same submission data (file URL, link URL, timestamp, and student ID).
**Validates: Requirements 5.2**

### Property 8: Instructor Feedback Visibility
*For any* submission that has been reviewed by an instructor, the student should be able to retrieve and view all feedback comments associated with that submission.
**Validates: Requirements 5.5**

### Property 9: Lesson Completion Idempotence
*For any* lesson and any student, marking a lesson as complete multiple times should result in the lesson remaining marked as complete without creating duplicate completion records.
**Validates: Requirements 4.4**

### Property 10: Authentication State Consistency
*For any* authenticated user, logging out should clear the session and subsequent requests without a valid token should be rejected with an authentication error.
**Validates: Requirements 3.5**

### Property 11: Course Enrollment Uniqueness
*For any* student and any course, a student should not be able to enroll in the same course multiple times; attempting to enroll again should either be rejected or return the existing enrollment.
**Validates: Requirements 2.4**

### Property 12: Responsive Layout Preservation
*For any* page on the platform, viewing the page on mobile, tablet, and desktop viewports should display responsive layouts without horizontal scrolling or layout shifts.
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 13: Color Palette Consistency
*For any* page on the platform, all background colors should use only #F6C1CC or #F9D6DC, all primary text and CTAs should use #2B2B2E, all secondary text and dividers should use #8A8A8E, and accent color #C89AA6 should appear only in hover, progress, and active states.
**Validates: Requirements 9.1**

### Property 14: Animation Subtlety
*For any* animation on the platform, animations should be fade-in, slide-up, or gentle parallax effects with no bouncing, shaking, playful effects, or gradients.
**Validates: Requirements 9.2, 9.3, 9.5**

### Property 15: Invalid Credentials Rejection
*For any* login attempt with incorrect email or password, the system should reject the login and display an error message without creating a session.
**Validates: Requirements 3.4**

## Error Handling

### Authentication Errors
- **Invalid Credentials**: Return 401 Unauthorized with message "Invalid email or password"
- **Email Not Verified**: Return 403 Forbidden with message "Please verify your email before logging in"
- **Token Expired**: Return 401 Unauthorized with message "Session expired, please log in again"
- **Missing Token**: Return 401 Unauthorized with message "Authentication required"

### Validation Errors
- **Invalid Email Format**: Return 400 Bad Request with message "Please enter a valid email address"
- **Weak Password**: Return 400 Bad Request with message "Password must be at least 8 characters with uppercase, lowercase, and numbers"
- **Missing Required Fields**: Return 400 Bad Request with message "All required fields must be filled"
- **Duplicate Email**: Return 409 Conflict with message "Email already registered"

### Payment Errors
- **Payment Failed**: Return 402 Payment Required with message "Payment processing failed, please try again"
- **Invalid Course**: Return 404 Not Found with message "Course not found"
- **Insufficient Permissions**: Return 403 Forbidden with message "You do not have permission to access this course"

### File Upload Errors
- **File Too Large**: Return 413 Payload Too Large with message "File size exceeds maximum limit of 50MB"
- **Invalid File Type**: Return 400 Bad Request with message "File type not allowed"
- **Upload Failed**: Return 500 Internal Server Error with message "File upload failed, please try again"

### General Errors
- **Not Found**: Return 404 Not Found with message "Resource not found"
- **Server Error**: Return 500 Internal Server Error with message "An unexpected error occurred"

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and error conditions for individual components and functions. Unit tests should cover:

- User authentication (sign-up validation, login, email verification)
- Course enrollment logic (free vs. paid, access control)
- Progress calculation (lesson completion tracking)
- Assignment deadline logic (submitted vs. late status)
- Payment processing (successful transactions, failed transactions)
- Data validation (email format, password strength, required fields)
- Error handling (invalid credentials, missing resources, permission denied)

Unit tests will be written using Jest with React Testing Library for component tests.

### Property-Based Testing Approach

Property-based tests verify universal properties that should hold across all inputs. Each correctness property defined in this design document will be implemented as a single property-based test using Hypothesis (Python) or fast-check (JavaScript/TypeScript).

**Property-Based Testing Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: motion-studio-platform, Property {number}: {property_text}**`
- Each test explicitly references the correctness property from the design document
- Tests use intelligent generators that constrain to valid input spaces
- Tests avoid mocking to validate real system behavior

**Property Tests to Implement:**
1. Email Verification Round Trip (Property 1)
2. Course Access Control (Property 2)
3. Payment Completion Grants Access (Property 3)
4. Free Course Immediate Access (Property 4)
5. Progress Tracking Accuracy (Property 5)
6. Assignment Deadline Enforcement (Property 6)
7. Submission Persistence (Property 7)
8. Instructor Feedback Visibility (Property 8)
9. Lesson Completion Idempotence (Property 9)
10. Authentication State Consistency (Property 10)
11. Course Enrollment Uniqueness (Property 11)
12. Responsive Layout Preservation (Property 12)
13. Color Palette Consistency (Property 13)
14. Animation Subtlety (Property 14)
15. Invalid Credentials Rejection (Property 15)

### Integration Testing

Integration tests verify that components work together correctly:
- Authentication flow (sign-up → email verification → login)
- Course enrollment flow (browse → enroll → access content)
- Payment flow (select course → payment → access granted)
- Assignment submission flow (view assignment → submit → receive feedback)
- Instructor workflow (create course → upload lessons → create assignments → review submissions)

### Test Coverage Goals

- Unit tests: 80%+ coverage of business logic
- Property tests: 100% coverage of correctness properties
- Integration tests: All critical user workflows
