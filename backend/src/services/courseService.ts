import { prisma } from '../utils/prisma';

export interface CreateCourseData {
  title: string;
  description: string;
  instructorId: string;
  duration: string;
  pricing?: number;
  currency?: string;
  curriculum: string;
  introVideoUrl?: string;
  thumbnailUrl?: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  duration?: string;
  pricing?: number;
  currency?: string;
  curriculum?: string;
  introVideoUrl?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
}

export class CourseService {
  async createCourse(data: CreateCourseData) {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        instructorId: data.instructorId,
        duration: data.duration,
        pricing: data.pricing || 0,
        currency: data.currency || 'USD',
        curriculum: data.curriculum,
        introVideoUrl: data.introVideoUrl,
        thumbnailUrl: data.thumbnailUrl,
        isPublished: false, // Courses start as drafts
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            assignments: true,
          },
        },
      },
    });

    return course;
  }

  async getAllCourses(includeUnpublished = false) {
    const courses = await prisma.course.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses;
  }

  async getCourseById(courseId: string, includeUnpublished = false) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lessons: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            videoUrl: true,
            createdAt: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            description: true,
            submissionType: true,
            deadline: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            assignments: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Check if course is published (unless we're including unpublished)
    if (!includeUnpublished && !course.isPublished) {
      throw new Error('Course not found');
    }

    return course;
  }

  async updateCourse(courseId: string, instructorId: string, data: UpdateCourseData) {
    // First verify the instructor owns this course
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!existingCourse) {
      throw new Error('Course not found');
    }

    if (existingCourse.instructorId !== instructorId) {
      throw new Error('You do not have permission to update this course');
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            assignments: true,
          },
        },
      },
    });

    return updatedCourse;
  }

  async deleteCourse(courseId: string, instructorId: string) {
    // First verify the instructor owns this course
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!existingCourse) {
      throw new Error('Course not found');
    }

    if (existingCourse.instructorId !== instructorId) {
      throw new Error('You do not have permission to delete this course');
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: 'Course deleted successfully' };
  }

  async getCoursesByInstructor(instructorId: string) {
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses;
  }

  async enrollStudent(courseId: string, studentId: string) {
    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isPublished: true, pricing: true },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.isPublished) {
      throw new Error('Course is not available for enrollment');
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error('You are already enrolled in this course');
    }

    // For paid courses, we should check payment status
    // For now, we'll only allow free course enrollment
    if (course.pricing > 0) {
      throw new Error('This is a paid course. Please complete payment first.');
    }

    try {
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId,
          courseId,
          status: 'active',
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              pricing: true,
              thumbnailUrl: true,
            },
          },
        },
      });

      return enrollment;
    } catch (error: any) {
      // Handle database constraint violation (race condition case)
      if (error.code === 'P2002' && error.meta?.target?.includes('studentId_courseId')) {
        throw new Error('You are already enrolled in this course');
      }
      throw error;
    }
  }

  async enrollStudentWithPaymentVerification(courseId: string, studentId: string, paymentId?: string) {
    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isPublished: true, pricing: true },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.isPublished) {
      throw new Error('Course is not available for enrollment');
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error('You are already enrolled in this course');
    }

    // For paid courses, verify payment completion
    if (course.pricing > 0) {
      if (!paymentId) {
        throw new Error('Payment verification required for paid courses');
      }

      // Verify payment exists and is completed
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        select: { 
          id: true, 
          status: true, 
          studentId: true, 
          courseId: true,
          amount: true
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.studentId !== studentId) {
        throw new Error('Payment does not belong to this student');
      }

      if (payment.courseId !== courseId) {
        throw new Error('Payment is not for this course');
      }

      if (payment.status !== 'completed') {
        throw new Error('Payment is not completed');
      }
    }

    try {
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId,
          courseId,
          status: 'active',
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              pricing: true,
              thumbnailUrl: true,
            },
          },
        },
      });

      return enrollment;
    } catch (error: any) {
      // Handle database constraint violation (race condition case)
      if (error.code === 'P2002' && error.meta?.target?.includes('studentId_courseId')) {
        throw new Error('You are already enrolled in this course');
      }
      throw error;
    }
  }

  async getStudentEnrollments(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            pricing: true,
            thumbnailUrl: true,
            instructor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments;
  }

  async updateEnrollmentProgress(studentId: string, courseId: string) {
    // Get total lessons and completed lessons for this course
    const totalLessons = await prisma.lesson.count({
      where: { courseId, isPublished: true },
    });

    const completedLessons = await prisma.lessonCompletion.count({
      where: {
        studentId,
        lesson: {
          courseId,
          isPublished: true,
        },
      },
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Update enrollment progress
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      data: {
        progressPercentage,
        status: progressPercentage === 100 ? 'completed' : 'active',
        completedAt: progressPercentage === 100 ? new Date() : null,
      },
    });

    return updatedEnrollment;
  }
}