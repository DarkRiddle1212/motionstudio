import * as fc from 'fast-check';
import { CourseService } from '../courseService';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

/**
 * Feature: motion-studio-platform, Property 4: Free Course Immediate Access
 * Validates: Requirements 2.4
 * 
 * For any free course and any student, enrolling in the course should immediately 
 * grant course access without requiring payment.
 */

describe('Property-Based Tests: Course Service', () => {
  const courseService = new CourseService();

  beforeAll(async () => {
    // Clean up test database before running tests
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@property-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@property-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@property-test.com',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test database after running tests
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@property-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@property-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@property-test.com',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Property 11: Course Enrollment Uniqueness', () => {
    /**
     * Feature: motion-studio-platform, Property 11: Course Enrollment Uniqueness
     * Validates: Requirements 2.4
     * 
     * For any student and any course, a student should not be able to enroll in the same 
     * course multiple times; attempting to enroll again should either be rejected or 
     * return the existing enrollment.
     */
    it('should prevent duplicate enrollments for any student and course combination', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random instructor data
          fc.record({
            email: fc.emailAddress().map(email => `instructor-uniq-${email.split('@')[0]}@property-test.com`),
            password: fc.string({ minLength: 8, maxLength: 20 })
              .filter(pwd => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          // Generate random student data
          fc.record({
            email: fc.emailAddress().map(email => `student-uniq-${email.split('@')[0]}@property-test.com`),
            password: fc.string({ minLength: 8, maxLength: 20 })
              .filter(pwd => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          // Generate random course data
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            duration: fc.string({ minLength: 1, maxLength: 50 }),
            curriculum: fc.string({ minLength: 1, maxLength: 1000 }),
            pricing: fc.float({ min: 0, max: 1000 }).map(p => Math.round(p * 100) / 100), // Round to 2 decimal places
          }),
          async (instructorData, studentData, courseData) => {
            let instructor: any, student: any, course: any;

            try {
              // Create instructor
              const hashedInstructorPassword = await hashPassword(instructorData.password);
              instructor = await prisma.user.create({
                data: {
                  email: instructorData.email,
                  password: hashedInstructorPassword,
                  firstName: instructorData.firstName,
                  lastName: instructorData.lastName,
                  role: 'instructor',
                  emailVerified: true,
                },
              });

              // Create student
              const hashedStudentPassword = await hashPassword(studentData.password);
              student = await prisma.user.create({
                data: {
                  email: studentData.email,
                  password: hashedStudentPassword,
                  firstName: studentData.firstName,
                  lastName: studentData.lastName,
                  role: 'student',
                  emailVerified: true,
                },
              });

              // Create course (free or paid)
              course = await courseService.createCourse({
                title: courseData.title,
                description: courseData.description,
                instructorId: instructor.id,
                duration: courseData.duration,
                pricing: courseData.pricing,
                curriculum: courseData.curriculum,
              });

              // Publish the course
              await courseService.updateCourse(course.id, instructor.id, { isPublished: true });

              // For paid courses, we can't test enrollment without payment system
              // So we only test free courses for enrollment uniqueness
              if (courseData.pricing === 0) {
                // First enrollment should succeed
                const firstEnrollment = await courseService.enrollStudent(course.id, student.id);
                expect(firstEnrollment).toBeDefined();
                expect(firstEnrollment.studentId).toBe(student.id);
                expect(firstEnrollment.courseId).toBe(course.id);
                expect(firstEnrollment.status).toBe('active');

                // Second enrollment attempt should be rejected
                try {
                  await courseService.enrollStudent(course.id, student.id);
                  throw new Error('Duplicate enrollment should have been rejected');
                } catch (error: any) {
                  expect(error.message).toBe('You are already enrolled in this course');
                }

                // Verify only one enrollment exists in the database
                const enrollmentCount = await prisma.enrollment.count({
                  where: {
                    studentId: student.id,
                    courseId: course.id,
                  },
                });
                expect(enrollmentCount).toBe(1);

                // Verify student's enrollment list shows only one enrollment for this course
                const studentEnrollments = await courseService.getStudentEnrollments(student.id);
                const courseEnrollments = studentEnrollments.filter(e => e.courseId === course.id);
                expect(courseEnrollments).toHaveLength(1);
              } else {
                // For paid courses, verify that enrollment is rejected due to payment requirement
                try {
                  await courseService.enrollStudent(course.id, student.id);
                  throw new Error('Paid course enrollment without payment should have been rejected');
                } catch (error: any) {
                  expect(error.message).toBe('This is a paid course. Please complete payment first.');
                }

                // Verify no enrollment was created
                const enrollmentCount = await prisma.enrollment.count({
                  where: {
                    studentId: student.id,
                    courseId: course.id,
                  },
                });
                expect(enrollmentCount).toBe(0);
              }

            } finally {
              // Clean up
              if (course && student) {
                await prisma.enrollment.deleteMany({
                  where: {
                    studentId: student.id,
                    courseId: course.id,
                  },
                });
              }
              if (course) {
                await prisma.course.delete({
                  where: { id: course.id },
                });
              }
              if (instructor) {
                await prisma.user.delete({
                  where: { id: instructor.id },
                });
              }
              if (student) {
                await prisma.user.delete({
                  where: { id: student.id },
                });
              }
            }
          }
        ),
        { numRuns: 3 } // Run 3 iterations to test various combinations
      );
    }, 30000); // 30 second timeout for multiple iterations
  });

  describe('Property 4: Free Course Immediate Access', () => {
    it('should immediately grant access when enrolling in any free course', async () => {
      let instructor, student, course;

      try {
        // Create instructor
        const instructorEmail = `instructor-${Date.now()}@property-test.com`;
        const hashedInstructorPassword = await hashPassword('TestPass123');
        instructor = await prisma.user.create({
          data: {
            email: instructorEmail,
            password: hashedInstructorPassword,
            firstName: 'Test',
            lastName: 'Instructor',
            role: 'instructor',
            emailVerified: true,
          },
        });

        // Create student
        const studentEmail = `student-${Date.now()}@property-test.com`;
        const hashedStudentPassword = await hashPassword('TestPass123');
        student = await prisma.user.create({
          data: {
            email: studentEmail,
            password: hashedStudentPassword,
            firstName: 'Test',
            lastName: 'Student',
            role: 'student',
            emailVerified: true,
          },
        });

        // Create free course
        course = await courseService.createCourse({
          title: 'Test Free Course',
          description: 'A test course for property testing',
          instructorId: instructor.id,
          duration: '4 weeks',
          pricing: 0, // Free course
          currency: 'USD',
          curriculum: 'Test curriculum content',
        });

        // Publish the course so it's available for enrollment
        const updatedCourse = await prisma.course.update({
          where: { id: course.id },
          data: { isPublished: true },
        });
        course = updatedCourse;

        // Enroll student in the free course
        const enrollment = await courseService.enrollStudent(course.id, student.id);

        // Verify immediate access is granted
        expect(enrollment).toBeDefined();
        expect(enrollment.studentId).toBe(student.id);
        expect(enrollment.courseId).toBe(course.id);
        expect(enrollment.status).toBe('active');
        expect(enrollment.enrolledAt).toBeInstanceOf(Date);
        
        // Verify the course information is included in the enrollment
        expect(enrollment.course).toBeDefined();
        expect(enrollment.course.id).toBe(course.id);
        expect(enrollment.course.title).toBe('Test Free Course');
        expect(enrollment.course.pricing).toBe(0); // Free course

        // Verify the student can retrieve their enrollment
        const studentEnrollments = await courseService.getStudentEnrollments(student.id);
        expect(studentEnrollments).toHaveLength(1);
        expect(studentEnrollments[0].courseId).toBe(course.id);
        expect(studentEnrollments[0].status).toBe('active');

        // Verify the course is accessible (student can get course details)
        const accessibleCourse = await courseService.getCourseById(course.id);
        expect(accessibleCourse).toBeDefined();
        expect(accessibleCourse.id).toBe(course.id);
        expect(accessibleCourse.isPublished).toBe(true);

      } finally {
        // Clean up: delete test data in correct order (foreign key constraints)
        if (course && student) {
          try {
            await prisma.enrollment.deleteMany({
              where: {
                studentId: student.id,
                courseId: course.id,
              },
            });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        if (course) {
          try {
            await prisma.course.delete({
              where: { id: course.id },
            });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        if (instructor) {
          try {
            await prisma.user.delete({
              where: { id: instructor.id },
            });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        if (student) {
          try {
            await prisma.user.delete({
              where: { id: student.id },
            });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }
    }, 15000); // 15 second timeout for database operations

    it('should prevent duplicate enrollments in the same free course', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random instructor data
          fc.record({
            email: fc.emailAddress().map(email => `instructor-dup-${email.split('@')[0]}@property-test.com`),
            password: fc.constantFrom('TestPass123', 'ValidPass456', 'SecurePass789'),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          // Generate random student data
          fc.record({
            email: fc.emailAddress().map(email => `student-dup-${email.split('@')[0]}@property-test.com`),
            password: fc.constantFrom('TestPass123', 'ValidPass456', 'SecurePass789'),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          // Generate random free course data
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            duration: fc.string({ minLength: 1, maxLength: 50 }),
            curriculum: fc.string({ minLength: 1, maxLength: 1000 }),
          }),
          async (instructorData, studentData, courseData) => {
            let instructor, student, course;

            try {
              // Create instructor
              const hashedInstructorPassword = await hashPassword(instructorData.password);
              instructor = await prisma.user.create({
                data: {
                  email: instructorData.email,
                  password: hashedInstructorPassword,
                  firstName: instructorData.firstName,
                  lastName: instructorData.lastName,
                  role: 'instructor',
                  emailVerified: true,
                },
              });

              // Create student
              const hashedStudentPassword = await hashPassword(studentData.password);
              student = await prisma.user.create({
                data: {
                  email: studentData.email,
                  password: hashedStudentPassword,
                  firstName: studentData.firstName,
                  lastName: studentData.lastName,
                  role: 'student',
                  emailVerified: true,
                },
              });

              // Create free course
              course = await courseService.createCourse({
                title: courseData.title,
                description: courseData.description,
                instructorId: instructor.id,
                duration: courseData.duration,
                pricing: 0, // Free course
                curriculum: courseData.curriculum,
              });

              // Publish the course
              await courseService.updateCourse(course.id, instructor.id, { isPublished: true });

              // First enrollment should succeed
              const firstEnrollment = await courseService.enrollStudent(course.id, student.id);
              expect(firstEnrollment).toBeDefined();
              expect(firstEnrollment.status).toBe('active');

              // Second enrollment attempt should fail
              try {
                await courseService.enrollStudent(course.id, student.id);
                throw new Error('Duplicate enrollment should have been rejected');
              } catch (error: any) {
                expect(error.message).toBe('You are already enrolled in this course');
              }

              // Verify only one enrollment exists
              const studentEnrollments = await courseService.getStudentEnrollments(student.id);
              expect(studentEnrollments).toHaveLength(1);

            } finally {
              // Clean up
              if (course && student) {
                await prisma.enrollment.deleteMany({
                  where: {
                    studentId: student.id,
                    courseId: course.id,
                  },
                });
              }
              if (course) {
                await prisma.course.delete({
                  where: { id: course.id },
                });
              }
              if (instructor) {
                await prisma.user.delete({
                  where: { id: instructor.id },
                });
              }
              if (student) {
                await prisma.user.delete({
                  where: { id: student.id },
                });
              }
            }
          }
        ),
        { numRuns: 1 }
      );
    }, 30000); // 30 second timeout

    it('should reject enrollment in unpublished free courses', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random instructor data
          fc.record({
            email: fc.emailAddress().map(email => `instructor-unpub-${email.split('@')[0]}@property-test.com`),
            password: fc.string({ minLength: 8, maxLength: 20 })
              .filter(pwd => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          // Generate random student data
          fc.record({
            email: fc.emailAddress().map(email => `student-unpub-${email.split('@')[0]}@property-test.com`),
            password: fc.string({ minLength: 8, maxLength: 20 })
              .filter(pwd => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          // Generate random free course data
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            duration: fc.string({ minLength: 1, maxLength: 50 }),
            curriculum: fc.string({ minLength: 1, maxLength: 1000 }),
          }),
          async (instructorData, studentData, courseData) => {
            let instructor, student, course;

            try {
              // Create instructor
              const hashedInstructorPassword = await hashPassword(instructorData.password);
              instructor = await prisma.user.create({
                data: {
                  email: instructorData.email,
                  password: hashedInstructorPassword,
                  firstName: instructorData.firstName,
                  lastName: instructorData.lastName,
                  role: 'instructor',
                  emailVerified: true,
                },
              });

              // Create student
              const hashedStudentPassword = await hashPassword(studentData.password);
              student = await prisma.user.create({
                data: {
                  email: studentData.email,
                  password: hashedStudentPassword,
                  firstName: studentData.firstName,
                  lastName: studentData.lastName,
                  role: 'student',
                  emailVerified: true,
                },
              });

              // Create free course (but don't publish it)
              course = await courseService.createCourse({
                title: courseData.title,
                description: courseData.description,
                instructorId: instructor.id,
                duration: courseData.duration,
                pricing: 0, // Free course
                curriculum: courseData.curriculum,
              });

              // Verify course is not published
              expect(course.isPublished).toBe(false);

              // Attempt to enroll in unpublished course should fail
              try {
                await courseService.enrollStudent(course.id, student.id);
                throw new Error('Enrollment in unpublished course should have been rejected');
              } catch (error: any) {
                expect(error.message).toBe('Course is not available for enrollment');
              }

              // Verify no enrollment was created
              const studentEnrollments = await courseService.getStudentEnrollments(student.id);
              expect(studentEnrollments).toHaveLength(0);

            } finally {
              // Clean up
              if (course) {
                await prisma.course.delete({
                  where: { id: course.id },
                });
              }
              if (instructor) {
                await prisma.user.delete({
                  where: { id: instructor.id },
                });
              }
              if (student) {
                await prisma.user.delete({
                  where: { id: student.id },
                });
              }
            }
          }
        ),
        { numRuns: 1 }
      );
    }, 30000); // 30 second timeout
  });
});