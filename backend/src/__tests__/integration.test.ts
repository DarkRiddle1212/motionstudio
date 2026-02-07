import request from 'supertest';
import app from '../index';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';
import sharp from 'sharp';

describe('Integration Tests - Motion Studio Platform', () => {
  // Test data containers
  let testUsers: any = {};
  let testCourses: any = {};
  let testLessons: any = {};
  let testAssignments: any = {};
  let testTokens: any = {};

  beforeAll(async () => {
    // Clean up test database
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test database
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    // Clean up in reverse dependency order
    await prisma.feedback.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@integration-test.com',
          },
        },
      },
    });
    await prisma.submission.deleteMany({
      where: {
        student: {
          email: {
            contains: '@integration-test.com',
          },
        },
      },
    });
    await prisma.assignment.deleteMany({
      where: {
        course: {
          instructor: {
            email: {
              contains: '@integration-test.com',
            },
          },
        },
      },
    });
    await prisma.lessonCompletion.deleteMany({
      where: {
        student: {
          email: {
            contains: '@integration-test.com',
          },
        },
      },
    });
    await prisma.lesson.deleteMany({
      where: {
        course: {
          instructor: {
            email: {
              contains: '@integration-test.com',
            },
          },
        },
      },
    });
    await prisma.payment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@integration-test.com',
          },
        },
      },
    });
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@integration-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@integration-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@integration-test.com',
        },
      },
    });
  }

  describe('1. Authentication Flow Integration Test', () => {
    it('should complete full authentication flow: sign-up → email verification → login', async () => {
      const timestamp = Date.now();
      const userEmail = `student-${timestamp}@integration-test.com`;
      const userPassword = 'TestPass123';

      // Step 1: Sign up
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: userEmail,
          password: userPassword,
          firstName: 'Test',
          lastName: 'Student',
        })
        .expect(201);

      expect(signupResponse.body.message).toBe('Account created successfully. Please check your email to verify your account.');

      // Verify user was created but not verified
      const unverifiedUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      expect(unverifiedUser).toBeTruthy();
      expect(unverifiedUser!.emailVerified).toBe(false);
      expect(unverifiedUser!.emailVerificationToken).toBeTruthy();

      // Step 2: Attempt login before verification (should fail)
      await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: userPassword,
        })
        .expect(403);

      // Step 3: Verify email
      const verificationToken = unverifiedUser!.emailVerificationToken;
      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: verificationToken,
        })
        .expect(200);

      expect(verifyResponse.body.message).toBe('Email verified successfully');

      // Verify user is now verified
      const verifiedUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      expect(verifiedUser!.emailVerified).toBe(true);
      expect(verifiedUser!.emailVerificationToken).toBeNull();

      // Step 4: Login after verification (should succeed)
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: userPassword,
        })
        .expect(200);

      expect(loginResponse.body.token).toBeTruthy();
      expect(loginResponse.body.user.email).toBe(userEmail);
      expect(loginResponse.body.user.emailVerified).toBe(true);

      // Store for cleanup
      testUsers.student = verifiedUser;
      testTokens.student = loginResponse.body.token;
    });
  });

  describe('2. Course Enrollment Flow Integration Test', () => {
    beforeAll(async () => {
      // Create instructor for course creation
      const timestamp = Date.now();
      const instructorEmail = `instructor-${timestamp}@integration-test.com`;
      const hashedPassword = await hashPassword('TestPass123');

      testUsers.instructor = await prisma.user.create({
        data: {
          email: instructorEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Instructor',
          role: 'instructor',
          emailVerified: true,
        },
      });

      // Get instructor token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: instructorEmail,
          password: 'TestPass123',
        });
      testTokens.instructor = loginResponse.body.token;
    });

    it('should complete course enrollment flow: browse → enroll → access content', async () => {
      // Step 1: Create a free course (instructor)
      const courseResponse = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          title: 'Free Motion Design Course',
          description: 'A comprehensive free course on motion design',
          duration: '4 weeks',
          pricing: 0,
          curriculum: 'Week 1: Basics, Week 2: Advanced, Week 3: Projects, Week 4: Portfolio',
        })
        .expect(201);

      testCourses.free = courseResponse.body.course;

      // Publish the course so it appears in public listings
      await request(app)
        .put(`/api/courses/${testCourses.free.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          isPublished: true,
        })
        .expect(200);

      // Step 2: Browse courses (public access)
      const browseCourseResponse = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(browseCourseResponse.body.courses).toHaveLength(1);
      expect(browseCourseResponse.body.courses[0].id).toBe(testCourses.free.id);

      // Step 3: Get course details (public access)
      const courseDetailResponse = await request(app)
        .get(`/api/courses/${testCourses.free.id}`)
        .expect(200);

      expect(courseDetailResponse.body.course.title).toBe('Free Motion Design Course');
      expect(courseDetailResponse.body.course.pricing).toBe(0);

      // Step 4: Enroll in free course (student)
      const enrollResponse = await request(app)
        .post(`/api/courses/${testCourses.free.id}/enroll`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(201);

      expect(enrollResponse.body.enrollment).toBeTruthy();

      // Step 5: Verify enrollment in student dashboard
      const dashboardResponse = await request(app)
        .get('/api/students/courses')
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(200);

      expect(dashboardResponse.body.enrollments).toHaveLength(1);
      expect(dashboardResponse.body.enrollments[0].course.id).toBe(testCourses.free.id);
      expect(dashboardResponse.body.enrollments[0].status).toBe('active');

      // Step 6: Create lesson content (instructor)
      const lessonResponse = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          courseId: testCourses.free.id,
          title: 'Introduction to Motion Design',
          description: 'Learn the basics of motion design',
          content: 'This lesson covers the fundamentals of motion design...',
          order: 1,
        })
        .expect(201);

      testLessons.intro = lessonResponse.body.lesson;

      // Publish the lesson so it appears in course content
      await request(app)
        .put(`/api/lessons/${testLessons.intro.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          isPublished: true,
        })
        .expect(200);

      // Step 7: Access course content (enrolled student)
      const courseContentResponse = await request(app)
        .get(`/api/lessons/course/${testCourses.free.id}`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(200);

      expect(courseContentResponse.body.lessons).toHaveLength(1);
      expect(courseContentResponse.body.lessons[0].id).toBe(testLessons.intro.id);
    });
  });

  describe('3. Payment Flow Integration Test', () => {
    it('should complete payment flow: select course → payment → access granted', async () => {
      // Step 1: Create a paid course (instructor)
      const paidCourseResponse = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          title: 'Premium Motion Design Masterclass',
          description: 'Advanced motion design techniques',
          duration: '8 weeks',
          pricing: 199.99,
          curriculum: 'Advanced curriculum with premium content',
        })
        .expect(201);

      testCourses.paid = paidCourseResponse.body.course;

      // Publish the paid course
      await request(app)
        .put(`/api/courses/${testCourses.paid.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          isPublished: true,
        })
        .expect(200);

      // Step 2: Attempt to access paid course without payment (should fail)
      await request(app)
        .post(`/api/courses/${testCourses.paid.id}/enroll`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(402); // Payment required

      // Step 3: Skip Stripe integration test (requires valid API key)
      // Instead, simulate successful payment by creating payment record directly
      const payment = await prisma.payment.create({
        data: {
          studentId: testUsers.student.id,
          courseId: testCourses.paid.id,
          amount: 199.99,
          currency: 'USD',
          status: 'completed',
          paymentProvider: 'stripe',
          transactionId: `test_txn_${Date.now()}`,
        },
      });

      // Step 4: Verify payment grants course access
      const enrollAfterPaymentResponse = await request(app)
        .post(`/api/courses/${testCourses.paid.id}/enroll-paid`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .send({
          paymentId: payment.id,
        })
        .expect(201);

      expect(enrollAfterPaymentResponse.body.enrollment).toBeTruthy();

      // Step 5: Verify access to paid course content
      const paidCourseContentResponse = await request(app)
        .get(`/api/lessons/course/${testCourses.paid.id}`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(200);

      expect(paidCourseContentResponse.body.lessons).toBeDefined();
    });
  });

  describe('4. Assignment Submission Flow Integration Test', () => {
    it('should complete assignment flow: view assignment → submit → receive feedback', async () => {
      // Ensure we have the necessary test data from previous tests
      if (!testUsers.student || !testTokens.student || !testUsers.instructor || !testTokens.instructor || !testCourses.free) {
        throw new Error('Required test data not available. Previous tests may have failed.');
      }

      // Step 1: Create assignment (instructor)
      const assignmentResponse = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          courseId: testCourses.free.id,
          title: 'Motion Design Project 1',
          description: 'Create a 10-second motion graphic animation',
          submissionType: 'link',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      testAssignments.project1 = assignmentResponse.body.assignment;

      // Step 2: Student views assignment
      const viewAssignmentResponse = await request(app)
        .get(`/api/assignments/${testAssignments.project1.id}`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(200);

      expect(viewAssignmentResponse.body.assignment.title).toBe('Motion Design Project 1');
      expect(viewAssignmentResponse.body.assignment.submissionType).toBe('link');

      // Step 3: Student submits assignment
      const submissionResponse = await request(app)
        .post(`/api/assignments/${testAssignments.project1.id}/submit`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .send({
          submissionType: 'link',
          linkUrl: 'https://vimeo.com/test-motion-project',
        })
        .expect(201);

      expect(submissionResponse.body.submission.linkUrl).toBe('https://vimeo.com/test-motion-project');
      expect(submissionResponse.body.submission.status).toBe('submitted');

      const submissionId = submissionResponse.body.submission.id;

      // Step 4: Instructor views submissions
      const viewSubmissionsResponse = await request(app)
        .get(`/api/assignments/${testAssignments.project1.id}/submissions`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .expect(200);

      expect(viewSubmissionsResponse.body.submissions).toHaveLength(1);
      expect(viewSubmissionsResponse.body.submissions[0].id).toBe(submissionId);

      // Step 5: Instructor provides feedback
      const feedbackResponse = await request(app)
        .post('/api/feedback')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          submissionId: submissionId,
          comment: 'Great work! The animation timing is excellent. Consider adding more easing to the transitions.',
          rating: 4,
        })
        .expect(201);

      expect(feedbackResponse.body.feedback.comment).toContain('Great work!');
      expect(feedbackResponse.body.feedback.rating).toBe(4);

      // Step 6: Student views feedback
      const studentSubmissionsResponse = await request(app)
        .get('/api/students/submissions')
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(200);

      const submissionWithFeedback = studentSubmissionsResponse.body.submissions.find(
        (sub: any) => sub.id === submissionId
      );
      expect(submissionWithFeedback.feedback).toHaveLength(1);
      expect(submissionWithFeedback.feedback[0].comment).toContain('Great work!');
    });
  });

  describe('5. Instructor Workflow Integration Test', () => {
    it('should complete instructor workflow: create course → upload lessons → create assignments → review submissions', async () => {
      // Step 1: Create new course
      const newCourseResponse = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          title: 'Advanced Animation Techniques',
          description: 'Master advanced animation principles',
          duration: '6 weeks',
          pricing: 149.99,
          curriculum: 'Advanced techniques for professional animators',
        })
        .expect(201);

      const newCourse = newCourseResponse.body.course;

      // Publish the course
      await request(app)
        .put(`/api/courses/${newCourse.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          isPublished: true,
        })
        .expect(200);

      // Step 2: Upload multiple lessons
      const lesson1Response = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          courseId: newCourse.id,
          title: 'Advanced Easing Functions',
          description: 'Learn complex easing techniques',
          content: 'Detailed content about easing functions...',
          order: 1,
        })
        .expect(201);

      // Publish lesson 1
      await request(app)
        .put(`/api/lessons/${lesson1Response.body.lesson.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          isPublished: true,
        })
        .expect(200);

      const lesson2Response = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          courseId: newCourse.id,
          title: 'Character Animation Principles',
          description: 'Bring characters to life',
          content: 'Character animation fundamentals...',
          order: 2,
        })
        .expect(201);

      // Publish lesson 2
      await request(app)
        .put(`/api/lessons/${lesson2Response.body.lesson.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          isPublished: true,
        })
        .expect(200);

      // Step 3: Create multiple assignments
      const assignment1Response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          courseId: newCourse.id,
          title: 'Easing Practice Exercise',
          description: 'Create animations demonstrating different easing functions',
          submissionType: 'file',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      const assignment2Response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          courseId: newCourse.id,
          title: 'Character Walk Cycle',
          description: 'Animate a character walking cycle',
          submissionType: 'link',
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      // Step 4: Verify course structure
      const courseStructureResponse = await request(app)
        .get(`/api/courses/${newCourse.id}`)
        .expect(200);

      expect(courseStructureResponse.body.course.title).toBe('Advanced Animation Techniques');

      // Verify lessons
      const lessonsResponse = await request(app)
        .get(`/api/lessons/instructor/course/${newCourse.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .expect(200);

      expect(lessonsResponse.body.lessons).toHaveLength(2);
      expect(lessonsResponse.body.lessons[0].title).toBe('Advanced Easing Functions');
      expect(lessonsResponse.body.lessons[1].title).toBe('Character Animation Principles');

      // Verify assignments
      const assignmentsResponse = await request(app)
        .get(`/api/assignments/course/${newCourse.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .expect(200);

      expect(assignmentsResponse.body.assignments).toHaveLength(2);
      expect(assignmentsResponse.body.assignments[0].title).toBe('Easing Practice Exercise');
      expect(assignmentsResponse.body.assignments[1].title).toBe('Character Walk Cycle');

      // Step 5: Simulate student enrollment and submission
      // Create a second student for this test
      const student2Email = `student2-${Date.now()}@integration-test.com`;
      const hashedPassword = await hashPassword('TestPass123');

      const student2 = await prisma.user.create({
        data: {
          email: student2Email,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Student2',
          role: 'student',
          emailVerified: true,
        },
      });

      // Login student2
      const student2LoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: student2Email,
          password: 'TestPass123',
        });
      const student2Token = student2LoginResponse.body.token;

      // Simulate payment for student2
      const payment2 = await prisma.payment.create({
        data: {
          studentId: student2.id,
          courseId: newCourse.id,
          amount: 149.99,
          currency: 'USD',
          status: 'completed',
          paymentProvider: 'stripe',
          transactionId: `test_txn_${Date.now()}_2`,
        },
      });

      // Enroll student2
      await request(app)
        .post(`/api/courses/${newCourse.id}/enroll-paid`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          paymentId: payment2.id,
        })
        .expect(201);

      // Student2 submits assignment
      const submissionResponse = await request(app)
        .post(`/api/assignments/${assignment1Response.body.assignment.id}/submit`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          submissionType: 'file',
          fileUrl: 'https://example.com/easing-exercise.mp4',
        })
        .expect(201);

      // Step 6: Instructor reviews submissions
      const reviewSubmissionsResponse = await request(app)
        .get(`/api/assignments/${assignment1Response.body.assignment.id}/submissions`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .expect(200);

      expect(reviewSubmissionsResponse.body.submissions).toHaveLength(1);
      expect(reviewSubmissionsResponse.body.submissions[0].fileUrl).toBe('https://example.com/easing-exercise.mp4');

      // Instructor provides detailed feedback
      const detailedFeedbackResponse = await request(app)
        .post('/api/feedback')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          submissionId: submissionResponse.body.submission.id,
          comment: 'Excellent understanding of easing principles! Your bounce effect is particularly well-executed. For improvement, try experimenting with more subtle ease-in-out transitions in the middle section.',
          rating: 5,
        })
        .expect(201);

      expect(detailedFeedbackResponse.body.feedback.rating).toBe(5);
      expect(detailedFeedbackResponse.body.feedback.comment).toContain('Excellent understanding');
    });
  });

  describe('6. Cross-Workflow Integration Test', () => {
    it('should handle complex multi-user scenarios with proper access control', async () => {
      // Create another instructor
      const instructor2Email = `instructor2-${Date.now()}@integration-test.com`;
      const hashedPassword = await hashPassword('TestPass123');

      const instructor2 = await prisma.user.create({
        data: {
          email: instructor2Email,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Instructor2',
          role: 'instructor',
          emailVerified: true,
        },
      });

      const instructor2LoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: instructor2Email,
          password: 'TestPass123',
        });
      const instructor2Token = instructor2LoginResponse.body.token;

      // Instructor2 creates their own course
      const instructor2CourseResponse = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructor2Token}`)
        .send({
          title: 'UI Animation Mastery',
          description: 'Master UI animations for web and mobile',
          duration: '5 weeks',
          pricing: 99.99,
          curriculum: 'UI-focused animation curriculum',
        })
        .expect(201);

      const instructor2Course = instructor2CourseResponse.body.course;

      // Publish instructor2's course
      await request(app)
        .put(`/api/courses/${instructor2Course.id}`)
        .set('Authorization', `Bearer ${instructor2Token}`)
        .send({
          isPublished: true,
        })
        .expect(200);

      // Test access control: Instructor1 should NOT be able to modify Instructor2's course
      await request(app)
        .put(`/api/courses/${instructor2Course.id}`)
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          title: 'Modified Title',
        })
        .expect(403);

      // Test access control: Instructor1 should NOT be able to create lessons for Instructor2's course
      await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${testTokens.instructor}`)
        .send({
          courseId: instructor2Course.id,
          title: 'Unauthorized Lesson',
          description: 'This should fail',
          content: 'Unauthorized content',
          order: 1,
        })
        .expect(403);

      // Test proper access: Instructor2 CAN modify their own course
      const updateCourseResponse = await request(app)
        .put(`/api/courses/${instructor2Course.id}`)
        .set('Authorization', `Bearer ${instructor2Token}`)
        .send({
          title: 'UI Animation Mastery - Updated',
          description: 'Updated description',
        })
        .expect(200);

      expect(updateCourseResponse.body.course.title).toBe('UI Animation Mastery - Updated');

      // Test student enrollment across multiple instructors' courses
      // Simulate payment for instructor2's course
      const payment3 = await prisma.payment.create({
        data: {
          studentId: testUsers.student.id,
          courseId: instructor2Course.id,
          amount: 99.99,
          currency: 'USD',
          status: 'completed',
          paymentProvider: 'stripe',
          transactionId: `test_txn_${Date.now()}_3`,
        },
      });

      // Student enrolls in instructor2's course
      await request(app)
        .post(`/api/courses/${instructor2Course.id}/enroll-paid`)
        .set('Authorization', `Bearer ${testTokens.student}`)
        .send({
          paymentId: payment3.id,
        })
        .expect(201);

      // Verify student is enrolled in multiple courses from different instructors
      const multiCourseEnrollmentResponse = await request(app)
        .get('/api/students/courses')
        .set('Authorization', `Bearer ${testTokens.student}`)
        .expect(200);

      expect(multiCourseEnrollmentResponse.body.enrollments.length).toBeGreaterThanOrEqual(2);
      
      const courseIds = multiCourseEnrollmentResponse.body.enrollments.map((e: any) => e.course.id);
      expect(courseIds).toContain(testCourses.free.id);
      expect(courseIds).toContain(instructor2Course.id);
    });
  });

  describe('7. Static File Serving Integration Test', () => {
    it('should serve uploaded files from /uploads path with proper MIME types and caching headers', async () => {
      // Test that the test file exists and is accessible
      const response = await request(app)
        .get('/uploads/test.txt')
        .expect(200);

      // Verify caching headers are present
      expect(response.headers['cache-control']).toBeDefined();
      expect(response.headers['etag'] || response.headers['last-modified']).toBeDefined();

      // Verify content is served correctly
      expect(response.text).toBeTruthy();
    });

    it('should return 404 for non-existent files', async () => {
      await request(app)
        .get('/uploads/non-existent-file.jpg')
        .expect(404);
    });

    it('should serve files from nested project directories', async () => {
      // This test verifies the directory structure works
      // The actual file serving will be tested when we implement the upload endpoints
      const response = await request(app)
        .get('/uploads/projects/')
        .expect(404); // Directory listing should not be enabled

      // This is expected - we don't want directory listing for security
      expect(response.status).toBe(404);
    });
  });

  // ==================== UPLOAD INTEGRATION TESTS ====================
  
  describe('8. Upload Integration Tests', () => {
    let adminToken: string;
    let testProjectId: string;

    beforeAll(async () => {
      // Create admin user and get token for upload tests
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin-upload-test@integration-test.com',
          password: await hashPassword('password123'),
          firstName: 'Upload',
          lastName: 'Admin',
          role: 'admin',
          emailVerified: true,
        },
      });

      // Login to get admin token
      const loginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin-upload-test@integration-test.com',
          password: 'password123',
        })
        .expect(200);

      adminToken = loginResponse.body.token;

      // Create a test project for upload tests
      const projectResponse = await request(app)
        .post('/api/admin/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Upload Test Project',
          description: 'Test project for upload integration tests',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          caseStudyUrl: 'https://example.com/case.jpg',
          toolsUsed: ['Test Tool'],
          goal: 'Test goal',
          solution: 'Test solution',
          motionBreakdown: 'Test breakdown',
          mediaType: 'image',
        })
        .expect(201);

      testProjectId = projectResponse.body.id;
    });

    afterAll(async () => {
      // Clean up test project and admin user
      if (testProjectId) {
        await prisma.project.delete({
          where: { id: testProjectId },
        }).catch(() => {}); // Ignore if already deleted
      }
      
      await prisma.user.deleteMany({
        where: {
          email: 'admin-upload-test@integration-test.com',
        },
      });
    });

    describe('8.1 Thumbnail Upload Flow', () => {
      it('should upload thumbnail image successfully', async () => {
        // Create a simple test image using Sharp (this ensures it's a valid image)
        const sharp = require('sharp');
        const testImageBuffer = await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
          }
        })
        .png()
        .toBuffer();

        const response = await request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', testImageBuffer, 'test-thumbnail.png');

        console.log('Upload response status:', response.status);
        console.log('Upload response body:', response.body);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('url');
        expect(response.body).toHaveProperty('path');
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.url).toMatch(/^\/uploads\/projects\//);
      });

      it('should reject invalid file types for thumbnail', async () => {
        const textBuffer = Buffer.from('This is not an image');

        await request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', textBuffer, 'test.txt')
          .expect(400);
      });

      it('should require authentication for thumbnail upload', async () => {
        const testImageBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // Minimal PNG header

        await request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .attach('file', testImageBuffer, 'test.png')
          .expect(401);
      });
    });

    describe('8.2 Hero Image Upload Flow', () => {
      it('should upload hero image successfully', async () => {
        const testImageBuffer = await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 0, g: 255, b: 0 }
          }
        })
        .png()
        .toBuffer();

        const response = await request(app)
          .post('/api/admin/projects/upload/hero')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', testImageBuffer, 'test-hero.png')
          .expect(200);

        expect(response.body).toHaveProperty('url');
        expect(response.body).toHaveProperty('path');
        expect(response.body).toHaveProperty('mediaType', 'image');
        expect(response.body.url).toMatch(/^\/uploads\/projects\//);
      });

      it('should require authentication for hero upload', async () => {
        const testImageBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);

        await request(app)
          .post('/api/admin/projects/upload/hero')
          .attach('file', testImageBuffer, 'test.png')
          .expect(401);
      });
    });

    describe('8.3 Gallery Upload Flow', () => {
      it('should upload multiple gallery images successfully', async () => {
        const testImageBuffer = await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 0, g: 0, b: 255 }
          }
        })
        .png()
        .toBuffer();

        const response = await request(app)
          .post('/api/admin/projects/upload/gallery')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('files', testImageBuffer, 'gallery1.png')
          .attach('files', testImageBuffer, 'gallery2.png')
          .expect(200);

        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBe(2);
        
        response.body.results.forEach((result: any) => {
          expect(result).toHaveProperty('url');
          expect(result).toHaveProperty('path');
          expect(result.url).toMatch(/^\/uploads\/projects\//);
        });
      });

      it('should enforce maximum file limit for gallery', async () => {
        const testImageBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
        
        // Try to upload 11 files (limit is 10)
        const request_builder = request(app)
          .post('/api/admin/projects/upload/gallery')
          .set('Authorization', `Bearer ${adminToken}`);

        // Attach 11 files
        for (let i = 0; i < 11; i++) {
          request_builder.attach('files', testImageBuffer, `gallery${i}.png`);
        }

        await request_builder.expect(400);
      });

      it('should require authentication for gallery upload', async () => {
        const testImageBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);

        await request(app)
          .post('/api/admin/projects/upload/gallery')
          .attach('files', testImageBuffer, 'test.png')
          .expect(401);
      });
    });

    describe('8.4 Media Deletion Flow', () => {
      it('should delete media files successfully', async () => {
        // First upload a file
        const testImageBuffer = await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 255, b: 0 }
          }
        })
        .png()
        .toBuffer();

        const uploadResponse = await request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', testImageBuffer, 'test-delete.png')
          .expect(200);

        // Then delete it
        const deleteResponse = await request(app)
          .delete(`/api/admin/projects/${testProjectId}/media/thumbnail`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(deleteResponse.body).toHaveProperty('success', true);
      });

      it('should require authentication for media deletion', async () => {
        await request(app)
          .delete(`/api/admin/projects/${testProjectId}/media/thumbnail`)
          .expect(401);
      });
    });

    describe('8.5 Error Scenarios', () => {
      it('should handle file size limits', async () => {
        // Create a buffer that exceeds the limit (simulate large file)
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB buffer
        
        await request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', largeBuffer, 'large-file.png')
          .expect(400);
      });

      it('should handle missing file in upload', async () => {
        await request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .expect(400);
      });

      it('should handle rate limiting', async () => {
        // This test would need to make many requests quickly
        // For now, we'll just verify the endpoint exists
        const testImageBuffer = await sharp({
          create: {
            width: 50,
            height: 50,
            channels: 3,
            background: { r: 128, g: 128, b: 128 }
          }
        })
        .png()
        .toBuffer();
        
        // Make a few requests - rate limiting should allow these
        for (let i = 0; i < 3; i++) {
          await request(app)
            .post('/api/admin/projects/upload/thumbnail')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('projectId', testProjectId)
            .attach('file', testImageBuffer, `test${i}.png`)
            .expect(200);
        }
      });
    });

    describe('8.6 Backward Compatibility', () => {
      it('should still work with URL-based projects', async () => {
        // Create a project with traditional URL fields
        const urlProjectResponse = await request(app)
          .post('/api/admin/projects')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'URL-based Project',
            description: 'Project using traditional URLs',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            caseStudyUrl: 'https://example.com/case.jpg',
            toolsUsed: ['Test Tool'],
            goal: 'Test goal',
            solution: 'Test solution',
            motionBreakdown: 'Test breakdown',
            mediaType: 'image',
          })
          .expect(201);

        // Verify the project was created successfully
        expect(urlProjectResponse.body).toHaveProperty('id');
        expect(urlProjectResponse.body.thumbnailUrl).toBe('https://example.com/thumb.jpg');
        expect(urlProjectResponse.body.caseStudyUrl).toBe('https://example.com/case.jpg');

        // Clean up
        await prisma.project.delete({
          where: { id: urlProjectResponse.body.id },
        });
      });
    });
  });
});