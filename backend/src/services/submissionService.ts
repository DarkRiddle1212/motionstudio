import { prisma } from '../utils/prisma';

export interface CreateSubmissionData {
  assignmentId: string;
  submissionType: 'file' | 'link';
  fileUrl?: string;
  linkUrl?: string;
}

export interface UpdateSubmissionData {
  submissionType?: 'file' | 'link';
  fileUrl?: string;
  linkUrl?: string;
}

export class SubmissionService {
  async createSubmission(data: CreateSubmissionData, studentId: string) {
    // First verify the assignment exists and the student has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
      include: {
        course: {
          select: {
            id: true,
            isPublished: true,
            pricing: true,
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

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentId,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new Error('You are not enrolled in this course');
    }

    // For paid courses, check payment
    if (assignment.course.pricing > 0) {
      const payment = await prisma.payment.findFirst({
        where: {
          studentId: studentId,
          courseId: assignment.courseId,
          status: 'completed',
        },
      });

      if (!payment) {
        throw new Error('This is a paid course. Please complete payment first.');
      }
    }

    // Check if student already has a submission for this assignment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: data.assignmentId,
        studentId: studentId,
      },
    });

    if (existingSubmission) {
      throw new Error('You have already submitted this assignment');
    }

    // Validate submission data based on type
    if (data.submissionType === 'file' && !data.fileUrl) {
      throw new Error('File URL is required for file submissions');
    }

    if (data.submissionType === 'link' && !data.linkUrl) {
      throw new Error('Link URL is required for link submissions');
    }

    // Determine submission status based on deadline
    const now = new Date();
    const status = now <= assignment.deadline ? 'submitted' : 'late';

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId: data.assignmentId,
        studentId: studentId,
        submissionType: data.submissionType,
        fileUrl: data.fileUrl,
        linkUrl: data.linkUrl,
        status: status,
        submittedAt: now,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            submissionType: true,
            deadline: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return submission;
  }

  async getSubmissionById(submissionId: string, userId: string, userRole: string) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
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
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        feedback: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (!submission.assignment.course.isPublished) {
      throw new Error('Submission not found');
    }

    // Check permissions
    if (userRole === 'student') {
      // Students can only view their own submissions
      if (submission.studentId !== userId) {
        throw new Error('You do not have permission to view this submission');
      }

      // Check enrollment and payment for students
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: submission.assignment.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }

      // For paid courses, check payment
      if (submission.assignment.course.pricing > 0) {
        const payment = await prisma.payment.findFirst({
          where: {
            studentId: userId,
            courseId: submission.assignment.courseId,
            status: 'completed',
          },
        });

        if (!payment) {
          throw new Error('This is a paid course. Please complete payment first.');
        }
      }
    } else if (userRole === 'instructor') {
      // Instructors can only view submissions for their courses
      if (submission.assignment.course.instructorId !== userId) {
        throw new Error('You do not have permission to view this submission');
      }
    }
    // Admins can view all submissions

    return submission;
  }

  async getSubmissionsByAssignment(assignmentId: string, userId: string, userRole: string) {
    // First verify the assignment exists and user has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            instructorId: true,
            isPublished: true,
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

    // Check permissions - only instructors and admins can view all submissions for an assignment
    if (userRole === 'student') {
      throw new Error('You do not have permission to view all submissions for this assignment');
    }

    if (userRole === 'instructor' && assignment.course.instructorId !== userId) {
      throw new Error('You do not have permission to view submissions for this assignment');
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId: assignmentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        feedback: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions;
  }

  async getStudentSubmissions(studentId: string, userId: string, userRole: string) {
    // Check permissions - students can only view their own submissions
    if (userRole === 'student' && studentId !== userId) {
      throw new Error('You do not have permission to view these submissions');
    }

    const submissions = await prisma.submission.findMany({
      where: { studentId: studentId },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                isPublished: true,
              },
            },
          },
        },
        feedback: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Filter out submissions for unpublished courses
    return submissions.filter(submission => submission.assignment.course.isPublished);
  }
}