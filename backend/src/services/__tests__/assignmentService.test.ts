import { AssignmentService } from '../assignmentService';
import { CourseService } from '../courseService';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

describe('Assignment Service', () => {
  const assignmentService = new AssignmentService();
  const courseService = new CourseService();

  beforeAll(async () => {
    // Clean up test database before running tests
    await prisma.submission.deleteMany({
      where: {
        student: {
          email: {
            contains: '@assignment-test.com',
          },
        },
      },
    });
    await prisma.assignment.deleteMany({
      where: {
        course: {
          instructor: {
            email: {
              contains: '@assignment-test.com',
            },
          },
        },
      },
    });
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@assignment-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@assignment-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@assignment-test.com',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test database after running tests
    await prisma.submission.deleteMany({
      where: {
        student: {
          email: {
            contains: '@assignment-test.com',
          },
        },
      },
    });
    await prisma.assignment.deleteMany({
      where: {
        course: {
          instructor: {
            email: {
              contains: '@assignment-test.com',
            },
          },
        },
      },
    });
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@assignment-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@assignment-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@assignment-test.com',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('createAssignment', () => {
    it('should create an assignment for instructor-owned course', async () => {
      let instructor: any, course: any, assignment: any;

      try {
        // Create instructor
        const hashedPassword = await hashPassword('TestPass123');
        instructor = await prisma.user.create({
          data: {
            email: `instructor-${Date.now()}@assignment-test.com`,
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'Instructor',
            role: 'instructor',
            emailVerified: true,
          },
        });

        // Create course
        course = await courseService.createCourse({
          title: 'Test Course',
          description: 'A test course',
          instructorId: instructor.id,
          duration: '4 weeks',
          pricing: 0,
          curriculum: 'Test curriculum',
        });

        // Create assignment
        const assignmentData = {
          courseId: course.id,
          title: 'Test Assignment',
          description: 'A test assignment',
          submissionType: 'file' as const,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        };

        assignment = await assignmentService.createAssignment(assignmentData, instructor.id);

        // Verify assignment was created correctly
        expect(assignment).toBeDefined();
        expect(assignment.title).toBe('Test Assignment');
        expect(assignment.description).toBe('A test assignment');
        expect(assignment.submissionType).toBe('file');
        expect(assignment.courseId).toBe(course.id);
        expect(assignment.course.id).toBe(course.id);
        expect(assignment.course.title).toBe('Test Course');

      } finally {
        // Clean up
        if (assignment) {
          await prisma.assignment.delete({ where: { id: assignment.id } });
        }
        if (course) {
          await prisma.course.delete({ where: { id: course.id } });
        }
        if (instructor) {
          await prisma.user.delete({ where: { id: instructor.id } });
        }
      }
    });

    it('should reject assignment creation for non-owned course', async () => {
      let instructor1: any, instructor2: any, course: any;

      try {
        // Create first instructor
        const hashedPassword1 = await hashPassword('TestPass123');
        instructor1 = await prisma.user.create({
          data: {
            email: `instructor1-${Date.now()}@assignment-test.com`,
            password: hashedPassword1,
            firstName: 'Test',
            lastName: 'Instructor1',
            role: 'instructor',
            emailVerified: true,
          },
        });

        // Create second instructor
        const hashedPassword2 = await hashPassword('TestPass123');
        instructor2 = await prisma.user.create({
          data: {
            email: `instructor2-${Date.now()}@assignment-test.com`,
            password: hashedPassword2,
            firstName: 'Test',
            lastName: 'Instructor2',
            role: 'instructor',
            emailVerified: true,
          },
        });

        // Create course owned by instructor1
        course = await courseService.createCourse({
          title: 'Test Course',
          description: 'A test course',
          instructorId: instructor1.id,
          duration: '4 weeks',
          pricing: 0,
          curriculum: 'Test curriculum',
        });

        // Try to create assignment as instructor2 (should fail)
        const assignmentData = {
          courseId: course.id,
          title: 'Test Assignment',
          description: 'A test assignment',
          submissionType: 'file' as const,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        await expect(
          assignmentService.createAssignment(assignmentData, instructor2.id)
        ).rejects.toThrow('You do not have permission to create assignments for this course');

      } finally {
        // Clean up
        if (course) {
          await prisma.course.delete({ where: { id: course.id } });
        }
        if (instructor1) {
          await prisma.user.delete({ where: { id: instructor1.id } });
        }
        if (instructor2) {
          await prisma.user.delete({ where: { id: instructor2.id } });
        }
      }
    });
  });

  describe('getAssignmentsByCourse', () => {
    it('should return assignments for enrolled student', async () => {
      let instructor: any, student: any, course: any, assignment: any;

      try {
        // Create instructor
        const hashedInstructorPassword = await hashPassword('TestPass123');
        instructor = await prisma.user.create({
          data: {
            email: `instructor-${Date.now()}@assignment-test.com`,
            password: hashedInstructorPassword,
            firstName: 'Test',
            lastName: 'Instructor',
            role: 'instructor',
            emailVerified: true,
          },
        });

        // Create student
        const hashedStudentPassword = await hashPassword('TestPass123');
        student = await prisma.user.create({
          data: {
            email: `student-${Date.now()}@assignment-test.com`,
            password: hashedStudentPassword,
            firstName: 'Test',
            lastName: 'Student',
            role: 'student',
            emailVerified: true,
          },
        });

        // Create and publish course
        course = await courseService.createCourse({
          title: 'Test Course',
          description: 'A test course',
          instructorId: instructor.id,
          duration: '4 weeks',
          pricing: 0, // Free course
          curriculum: 'Test curriculum',
        });

        await courseService.updateCourse(course.id, instructor.id, { isPublished: true });

        // Enroll student
        await courseService.enrollStudent(course.id, student.id);

        // Create assignment
        const assignmentData = {
          courseId: course.id,
          title: 'Test Assignment',
          description: 'A test assignment',
          submissionType: 'file' as const,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        assignment = await assignmentService.createAssignment(assignmentData, instructor.id);

        // Get assignments as student
        const assignments = await assignmentService.getAssignmentsByCourse(
          course.id,
          student.id,
          'student'
        );

        expect(assignments).toHaveLength(1);
        expect(assignments[0].id).toBe(assignment.id);
        expect(assignments[0].title).toBe('Test Assignment');

      } finally {
        // Clean up
        if (assignment) {
          await prisma.assignment.delete({ where: { id: assignment.id } });
        }
        if (course && student) {
          await prisma.enrollment.deleteMany({
            where: { studentId: student.id, courseId: course.id },
          });
        }
        if (course) {
          await prisma.course.delete({ where: { id: course.id } });
        }
        if (instructor) {
          await prisma.user.delete({ where: { id: instructor.id } });
        }
        if (student) {
          await prisma.user.delete({ where: { id: student.id } });
        }
      }
    });

    it('should reject access for non-enrolled student', async () => {
      let instructor: any, student: any, course: any;

      try {
        // Create instructor
        const hashedInstructorPassword = await hashPassword('TestPass123');
        instructor = await prisma.user.create({
          data: {
            email: `instructor-${Date.now()}@assignment-test.com`,
            password: hashedInstructorPassword,
            firstName: 'Test',
            lastName: 'Instructor',
            role: 'instructor',
            emailVerified: true,
          },
        });

        // Create student
        const hashedStudentPassword = await hashPassword('TestPass123');
        student = await prisma.user.create({
          data: {
            email: `student-${Date.now()}@assignment-test.com`,
            password: hashedStudentPassword,
            firstName: 'Test',
            lastName: 'Student',
            role: 'student',
            emailVerified: true,
          },
        });

        // Create and publish course
        course = await courseService.createCourse({
          title: 'Test Course',
          description: 'A test course',
          instructorId: instructor.id,
          duration: '4 weeks',
          pricing: 0,
          curriculum: 'Test curriculum',
        });

        await courseService.updateCourse(course.id, instructor.id, { isPublished: true });

        // Don't enroll student - try to access assignments
        await expect(
          assignmentService.getAssignmentsByCourse(course.id, student.id, 'student')
        ).rejects.toThrow('You are not enrolled in this course');

      } finally {
        // Clean up
        if (course) {
          await prisma.course.delete({ where: { id: course.id } });
        }
        if (instructor) {
          await prisma.user.delete({ where: { id: instructor.id } });
        }
        if (student) {
          await prisma.user.delete({ where: { id: student.id } });
        }
      }
    });
  });
});