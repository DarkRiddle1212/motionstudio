"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const prisma_1 = require("../utils/prisma");
const password_1 = require("../utils/password");
describe('Integration Tests - Motion Studio Platform', () => {
    // Test data containers
    let testUsers = {};
    let testCourses = {};
    let testLessons = {};
    let testAssignments = {};
    let testTokens = {};
    beforeAll(async () => {
        // Clean up test database
        await cleanupTestData();
    });
    afterAll(async () => {
        // Clean up test database
        await cleanupTestData();
        await prisma_1.prisma.$disconnect();
    });
    async function cleanupTestData() {
        // Clean up in reverse dependency order
        await prisma_1.prisma.feedback.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@integration-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.submission.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@integration-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.assignment.deleteMany({
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
        await prisma_1.prisma.lessonCompletion.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@integration-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.lesson.deleteMany({
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
        await prisma_1.prisma.payment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@integration-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.enrollment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@integration-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.course.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@integration-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.user.deleteMany({
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
            const signupResponse = await (0, supertest_1.default)(index_1.default)
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
            const unverifiedUser = await prisma_1.prisma.user.findUnique({
                where: { email: userEmail },
            });
            expect(unverifiedUser).toBeTruthy();
            expect(unverifiedUser.emailVerified).toBe(false);
            expect(unverifiedUser.emailVerificationToken).toBeTruthy();
            // Step 2: Attempt login before verification (should fail)
            await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({
                email: userEmail,
                password: userPassword,
            })
                .expect(403);
            // Step 3: Verify email
            const verificationToken = unverifiedUser.emailVerificationToken;
            const verifyResponse = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/verify-email')
                .send({
                token: verificationToken,
            })
                .expect(200);
            expect(verifyResponse.body.message).toBe('Email verified successfully');
            // Verify user is now verified
            const verifiedUser = await prisma_1.prisma.user.findUnique({
                where: { email: userEmail },
            });
            expect(verifiedUser.emailVerified).toBe(true);
            expect(verifiedUser.emailVerificationToken).toBeNull();
            // Step 4: Login after verification (should succeed)
            const loginResponse = await (0, supertest_1.default)(index_1.default)
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
            const hashedPassword = await (0, password_1.hashPassword)('TestPass123');
            testUsers.instructor = await prisma_1.prisma.user.create({
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
            const loginResponse = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({
                email: instructorEmail,
                password: 'TestPass123',
            });
            testTokens.instructor = loginResponse.body.token;
        });
        it('should complete course enrollment flow: browse → enroll → access content', async () => {
            // Step 1: Create a free course (instructor)
            const courseResponse = await (0, supertest_1.default)(index_1.default)
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
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/courses/${testCourses.free.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .send({
                isPublished: true,
            })
                .expect(200);
            // Step 2: Browse courses (public access)
            const browseCourseResponse = await (0, supertest_1.default)(index_1.default)
                .get('/api/courses')
                .expect(200);
            expect(browseCourseResponse.body.courses).toHaveLength(1);
            expect(browseCourseResponse.body.courses[0].id).toBe(testCourses.free.id);
            // Step 3: Get course details (public access)
            const courseDetailResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/courses/${testCourses.free.id}`)
                .expect(200);
            expect(courseDetailResponse.body.course.title).toBe('Free Motion Design Course');
            expect(courseDetailResponse.body.course.pricing).toBe(0);
            // Step 4: Enroll in free course (student)
            const enrollResponse = await (0, supertest_1.default)(index_1.default)
                .post(`/api/courses/${testCourses.free.id}/enroll`)
                .set('Authorization', `Bearer ${testTokens.student}`)
                .expect(201);
            expect(enrollResponse.body.enrollment).toBeTruthy();
            // Step 5: Verify enrollment in student dashboard
            const dashboardResponse = await (0, supertest_1.default)(index_1.default)
                .get('/api/students/courses')
                .set('Authorization', `Bearer ${testTokens.student}`)
                .expect(200);
            expect(dashboardResponse.body.enrollments).toHaveLength(1);
            expect(dashboardResponse.body.enrollments[0].course.id).toBe(testCourses.free.id);
            expect(dashboardResponse.body.enrollments[0].status).toBe('active');
            // Step 6: Create lesson content (instructor)
            const lessonResponse = await (0, supertest_1.default)(index_1.default)
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
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/lessons/${testLessons.intro.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .send({
                isPublished: true,
            })
                .expect(200);
            // Step 7: Access course content (enrolled student)
            const courseContentResponse = await (0, supertest_1.default)(index_1.default)
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
            const paidCourseResponse = await (0, supertest_1.default)(index_1.default)
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
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/courses/${testCourses.paid.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .send({
                isPublished: true,
            })
                .expect(200);
            // Step 2: Attempt to access paid course without payment (should fail)
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/courses/${testCourses.paid.id}/enroll`)
                .set('Authorization', `Bearer ${testTokens.student}`)
                .expect(402); // Payment required
            // Step 3: Skip Stripe integration test (requires valid API key)
            // Instead, simulate successful payment by creating payment record directly
            const payment = await prisma_1.prisma.payment.create({
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
            const enrollAfterPaymentResponse = await (0, supertest_1.default)(index_1.default)
                .post(`/api/courses/${testCourses.paid.id}/enroll-paid`)
                .set('Authorization', `Bearer ${testTokens.student}`)
                .send({
                paymentId: payment.id,
            })
                .expect(201);
            expect(enrollAfterPaymentResponse.body.enrollment).toBeTruthy();
            // Step 5: Verify access to paid course content
            const paidCourseContentResponse = await (0, supertest_1.default)(index_1.default)
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
            const assignmentResponse = await (0, supertest_1.default)(index_1.default)
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
            const viewAssignmentResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/assignments/${testAssignments.project1.id}`)
                .set('Authorization', `Bearer ${testTokens.student}`)
                .expect(200);
            expect(viewAssignmentResponse.body.assignment.title).toBe('Motion Design Project 1');
            expect(viewAssignmentResponse.body.assignment.submissionType).toBe('link');
            // Step 3: Student submits assignment
            const submissionResponse = await (0, supertest_1.default)(index_1.default)
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
            const viewSubmissionsResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/assignments/${testAssignments.project1.id}/submissions`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .expect(200);
            expect(viewSubmissionsResponse.body.submissions).toHaveLength(1);
            expect(viewSubmissionsResponse.body.submissions[0].id).toBe(submissionId);
            // Step 5: Instructor provides feedback
            const feedbackResponse = await (0, supertest_1.default)(index_1.default)
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
            const studentSubmissionsResponse = await (0, supertest_1.default)(index_1.default)
                .get('/api/students/submissions')
                .set('Authorization', `Bearer ${testTokens.student}`)
                .expect(200);
            const submissionWithFeedback = studentSubmissionsResponse.body.submissions.find((sub) => sub.id === submissionId);
            expect(submissionWithFeedback.feedback).toHaveLength(1);
            expect(submissionWithFeedback.feedback[0].comment).toContain('Great work!');
        });
    });
    describe('5. Instructor Workflow Integration Test', () => {
        it('should complete instructor workflow: create course → upload lessons → create assignments → review submissions', async () => {
            // Step 1: Create new course
            const newCourseResponse = await (0, supertest_1.default)(index_1.default)
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
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/courses/${newCourse.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .send({
                isPublished: true,
            })
                .expect(200);
            // Step 2: Upload multiple lessons
            const lesson1Response = await (0, supertest_1.default)(index_1.default)
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
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/lessons/${lesson1Response.body.lesson.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .send({
                isPublished: true,
            })
                .expect(200);
            const lesson2Response = await (0, supertest_1.default)(index_1.default)
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
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/lessons/${lesson2Response.body.lesson.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .send({
                isPublished: true,
            })
                .expect(200);
            // Step 3: Create multiple assignments
            const assignment1Response = await (0, supertest_1.default)(index_1.default)
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
            const assignment2Response = await (0, supertest_1.default)(index_1.default)
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
            const courseStructureResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/courses/${newCourse.id}`)
                .expect(200);
            expect(courseStructureResponse.body.course.title).toBe('Advanced Animation Techniques');
            // Verify lessons
            const lessonsResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/lessons/instructor/course/${newCourse.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .expect(200);
            expect(lessonsResponse.body.lessons).toHaveLength(2);
            expect(lessonsResponse.body.lessons[0].title).toBe('Advanced Easing Functions');
            expect(lessonsResponse.body.lessons[1].title).toBe('Character Animation Principles');
            // Verify assignments
            const assignmentsResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/assignments/course/${newCourse.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .expect(200);
            expect(assignmentsResponse.body.assignments).toHaveLength(2);
            expect(assignmentsResponse.body.assignments[0].title).toBe('Easing Practice Exercise');
            expect(assignmentsResponse.body.assignments[1].title).toBe('Character Walk Cycle');
            // Step 5: Simulate student enrollment and submission
            // Create a second student for this test
            const student2Email = `student2-${Date.now()}@integration-test.com`;
            const hashedPassword = await (0, password_1.hashPassword)('TestPass123');
            const student2 = await prisma_1.prisma.user.create({
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
            const student2LoginResponse = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({
                email: student2Email,
                password: 'TestPass123',
            });
            const student2Token = student2LoginResponse.body.token;
            // Simulate payment for student2
            const payment2 = await prisma_1.prisma.payment.create({
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
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/courses/${newCourse.id}/enroll-paid`)
                .set('Authorization', `Bearer ${student2Token}`)
                .send({
                paymentId: payment2.id,
            })
                .expect(201);
            // Student2 submits assignment
            const submissionResponse = await (0, supertest_1.default)(index_1.default)
                .post(`/api/assignments/${assignment1Response.body.assignment.id}/submit`)
                .set('Authorization', `Bearer ${student2Token}`)
                .send({
                submissionType: 'file',
                fileUrl: 'https://example.com/easing-exercise.mp4',
            })
                .expect(201);
            // Step 6: Instructor reviews submissions
            const reviewSubmissionsResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/assignments/${assignment1Response.body.assignment.id}/submissions`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .expect(200);
            expect(reviewSubmissionsResponse.body.submissions).toHaveLength(1);
            expect(reviewSubmissionsResponse.body.submissions[0].fileUrl).toBe('https://example.com/easing-exercise.mp4');
            // Instructor provides detailed feedback
            const detailedFeedbackResponse = await (0, supertest_1.default)(index_1.default)
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
            const hashedPassword = await (0, password_1.hashPassword)('TestPass123');
            const instructor2 = await prisma_1.prisma.user.create({
                data: {
                    email: instructor2Email,
                    password: hashedPassword,
                    firstName: 'Test',
                    lastName: 'Instructor2',
                    role: 'instructor',
                    emailVerified: true,
                },
            });
            const instructor2LoginResponse = await (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({
                email: instructor2Email,
                password: 'TestPass123',
            });
            const instructor2Token = instructor2LoginResponse.body.token;
            // Instructor2 creates their own course
            const instructor2CourseResponse = await (0, supertest_1.default)(index_1.default)
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
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/courses/${instructor2Course.id}`)
                .set('Authorization', `Bearer ${instructor2Token}`)
                .send({
                isPublished: true,
            })
                .expect(200);
            // Test access control: Instructor1 should NOT be able to modify Instructor2's course
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/courses/${instructor2Course.id}`)
                .set('Authorization', `Bearer ${testTokens.instructor}`)
                .send({
                title: 'Modified Title',
            })
                .expect(403);
            // Test access control: Instructor1 should NOT be able to create lessons for Instructor2's course
            await (0, supertest_1.default)(index_1.default)
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
            const updateCourseResponse = await (0, supertest_1.default)(index_1.default)
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
            const payment3 = await prisma_1.prisma.payment.create({
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
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/courses/${instructor2Course.id}/enroll-paid`)
                .set('Authorization', `Bearer ${testTokens.student}`)
                .send({
                paymentId: payment3.id,
            })
                .expect(201);
            // Verify student is enrolled in multiple courses from different instructors
            const multiCourseEnrollmentResponse = await (0, supertest_1.default)(index_1.default)
                .get('/api/students/courses')
                .set('Authorization', `Bearer ${testTokens.student}`)
                .expect(200);
            expect(multiCourseEnrollmentResponse.body.enrollments.length).toBeGreaterThanOrEqual(2);
            const courseIds = multiCourseEnrollmentResponse.body.enrollments.map((e) => e.course.id);
            expect(courseIds).toContain(testCourses.free.id);
            expect(courseIds).toContain(instructor2Course.id);
        });
    });
});
//# sourceMappingURL=integration.test.js.map