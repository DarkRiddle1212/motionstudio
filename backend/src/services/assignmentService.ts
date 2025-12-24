import { prisma } from '../utils/prisma';

export interface CreateAssignmentData {
  courseId: string;
  title: string;
  description: string;
  submissionType: 'file' | 'link';
  deadline: Date;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  submissionType?: 'file' | 'link';
  deadline?: Date;
}

export class AssignmentService {
  async createAssignment(data: CreateAssignmentData, instructorId: string) {
    // First verify the instructor owns this course
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { instructorId: true, isPublished: true },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new Error('You do not have permission to create assignments for this course');
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        submissionType: data.submissionType,
        deadline: data.deadline,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return assignment;
  }

  async getAssignmentsByCourse(courseId: string, userId: string, userRole: string) {
    // First verify access to the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        id: true, 
        isPublished: true, 
        instructorId: true,
        pricing: true,
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.isPublished) {
      throw new Error('Course not found');
    }

    // Check access permissions
    if (userRole === 'instructor' && course.instructorId !== userId) {
      throw new Error('You do not have permission to view assignments for this course');
    }

    if (userRole === 'student') {
      // For paid courses, check payment
      if (course.pricing > 0) {
        const payment = await prisma.payment.findFirst({
          where: {
            studentId: userId,
            courseId: courseId,
            status: 'completed',
          },
        });

        if (!payment) {
          throw new Error('This is a paid course. Please complete payment first.');
        }
      }

      // Check enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: courseId,
          },
        },
      });

      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    return assignments;
  }

  async getAssignmentById(assignmentId: string, userId: string, userRole: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
            isPublished: true,
            pricing: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (!assignment.course.isPublished) {
      throw new Error('Assignment not found');
    }

    // Check access permissions
    if (userRole === 'instructor' && assignment.course.instructorId !== userId) {
      throw new Error('You do not have permission to view this assignment');
    }

    if (userRole === 'student') {
      // For paid courses, check payment
      if (assignment.course.pricing > 0) {
        const payment = await prisma.payment.findFirst({
          where: {
            studentId: userId,
            courseId: assignment.courseId,
            status: 'completed',
          },
        });

        if (!payment) {
          throw new Error('This is a paid course. Please complete payment first.');
        }
      }

      // Check enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: assignment.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }
    }

    return assignment;
  }

  async updateAssignment(assignmentId: string, instructorId: string, data: UpdateAssignmentData) {
    // First verify the instructor owns the course for this assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: { instructorId: true },
        },
      },
    });

    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    if (existingAssignment.course.instructorId !== instructorId) {
      throw new Error('You do not have permission to update this assignment');
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return updatedAssignment;
  }

  async deleteAssignment(assignmentId: string, instructorId: string) {
    // First verify the instructor owns the course for this assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: { instructorId: true },
        },
      },
    });

    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    if (existingAssignment.course.instructorId !== instructorId) {
      throw new Error('You do not have permission to delete this assignment');
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return { message: 'Assignment deleted successfully' };
  }

  async getAssignmentsByInstructor(instructorId: string) {
    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          instructorId: instructorId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    return assignments;
  }
}