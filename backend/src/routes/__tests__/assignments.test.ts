import request from 'supertest';
import app from '../../index';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';

describe('Assignment Routes', () => {
  let instructor: any, student: any, course: any;
  let instructorToken: string, studentToken: string;

  beforeAll(async () => {
    // Clean up test database
    await prisma.assignment.deleteMany({
      where: {
        course: {
          instructor: {
            email: {
              contains: '@assignment-route-test.com',
            },
          },
        },
      },
    });
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@assignment-route-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@assignment-route-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@assignment-route-test.com',
        },
      },
    });

    // Create test instructor
    const hashedInstructorPassword = await hashPassword('TestPass123');
    instructor = await prisma.user.create({
      data: {
        email: `instructor-${Date.now()}@assignment-route-test.com`,
        password: hashedInstructorPassword,
        firstName: 'Test',
        lastName: 'Instructor',
        role: 'instructor',
        emailVerified: true,
      },
    });

    // Create test student
    const hashedStudentPassword = await hashPassword('TestPass123');
    student = await prisma.user.create({
      data: {
        email: `student-${Date.now()}@assignment-route-test.com`,
        password: hashedStudentPassword,
        firstName: 'Test',
        lastName: 'Student',
        role: 'student',
        emailVerified: true,
      },
    });

    // Create test course
    course = await prisma.course.create({
      data: {
        title: 'Test Course',
        description: 'A test course',
        instructorId: instructor.id,
        duration: '4 weeks',
        pricing: 0,
        curriculum: 'Test curriculum',
        isPublished: true,
      },
    });

    // Enroll student in course
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        status: 'active',
      },
    });

    // Generate tokens
    instructorToken = generateToken({
      userId: instructor.id,
      email: instructor.email,
      role: instructor.role,
    });

    studentToken = generateToken({
      userId: student.id,
      email: student.email,
      role: student.role,
    });
  });

  afterAll(async () => {
    // Clean up test database
    await prisma.assignment.deleteMany({
      where: {
        course: {
          instructor: {
            email: {
              contains: '@assignment-route-test.com',
            },
          },
        },
      },
    });
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@assignment-route-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@assignment-route-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@assignment-route-test.com',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/assignments', () => {
    it('should create assignment for instructor', async () => {
      const assignmentData = {
        courseId: course.id,
        title: 'Test Assignment',
        description: 'A test assignment',
        submissionType: 'file',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(assignmentData)
        .expect(201);

      expect(response.body.assignment).toBeDefined();
      expect(response.body.assignment.title).toBe('Test Assignment');
      expect(response.body.assignment.courseId).toBe(course.id);

      // Clean up
      await prisma.assignment.delete({
        where: { id: response.body.assignment.id },
      });
    });

    it('should reject assignment creation for student', async () => {
      const assignmentData = {
        courseId: course.id,
        title: 'Test Assignment',
        description: 'A test assignment',
        submissionType: 'file',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(assignmentData)
        .expect(403);
    });

    it('should reject assignment creation without authentication', async () => {
      const assignmentData = {
        courseId: course.id,
        title: 'Test Assignment',
        description: 'A test assignment',
        submissionType: 'file',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app)
        .post('/api/assignments')
        .send(assignmentData)
        .expect(401);
    });
  });

  describe('GET /api/assignments/course/:courseId', () => {
    let assignment: any;

    beforeAll(async () => {
      // Create test assignment
      assignment = await prisma.assignment.create({
        data: {
          courseId: course.id,
          title: 'Test Assignment',
          description: 'A test assignment',
          submissionType: 'file',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });

    afterAll(async () => {
      // Clean up
      if (assignment) {
        await prisma.assignment.delete({
          where: { id: assignment.id },
        });
      }
    });

    it('should return assignments for enrolled student', async () => {
      const response = await request(app)
        .get(`/api/assignments/course/${course.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.assignments).toHaveLength(1);
      expect(response.body.assignments[0].id).toBe(assignment.id);
    });

    it('should return assignments for course instructor', async () => {
      const response = await request(app)
        .get(`/api/assignments/course/${course.id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.assignments).toHaveLength(1);
      expect(response.body.assignments[0].id).toBe(assignment.id);
    });

    it('should reject access without authentication', async () => {
      await request(app)
        .get(`/api/assignments/course/${course.id}`)
        .expect(401);
    });
  });

  describe('GET /api/assignments/:id', () => {
    let assignment: any;

    beforeAll(async () => {
      // Create test assignment
      assignment = await prisma.assignment.create({
        data: {
          courseId: course.id,
          title: 'Test Assignment',
          description: 'A test assignment',
          submissionType: 'file',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });

    afterAll(async () => {
      // Clean up
      if (assignment) {
        await prisma.assignment.delete({
          where: { id: assignment.id },
        });
      }
    });

    it('should return assignment details for enrolled student', async () => {
      const response = await request(app)
        .get(`/api/assignments/${assignment.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.assignment.id).toBe(assignment.id);
      expect(response.body.assignment.title).toBe('Test Assignment');
    });

    it('should return assignment details for course instructor', async () => {
      const response = await request(app)
        .get(`/api/assignments/${assignment.id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.assignment.id).toBe(assignment.id);
      expect(response.body.assignment.title).toBe('Test Assignment');
    });
  });
});