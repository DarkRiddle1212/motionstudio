import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateScholarshipInput {
  studentId: string;
  courseId: string;
  discountPercentage: number;
  reason: string;
  grantedById: string;
  expiresAt?: Date;
}

export interface UpdateScholarshipInput {
  discountPercentage?: number;
  reason?: string;
  expiresAt?: Date | null;
  status?: 'active' | 'expired' | 'revoked';
}

export interface ScholarshipFilters {
  status?: string;
  studentId?: string;
  courseId?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Create a new scholarship
export async function createScholarship(input: CreateScholarshipInput) {
  // Check if student exists
  const student = await prisma.user.findUnique({
    where: { id: input.studentId },
  });
  if (!student) {
    throw new Error('Student not found');
  }

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
  });
  if (!course) {
    throw new Error('Course not found');
  }

  // Check if scholarship already exists for this student-course combination
  const existingScholarship = await prisma.scholarship.findUnique({
    where: {
      studentId_courseId: {
        studentId: input.studentId,
        courseId: input.courseId,
      },
    },
  });
  if (existingScholarship) {
    throw new Error('Scholarship already exists for this student and course');
  }

  // Create the scholarship
  const scholarship = await prisma.scholarship.create({
    data: {
      studentId: input.studentId,
      courseId: input.courseId,
      discountPercentage: input.discountPercentage,
      reason: input.reason,
      grantedById: input.grantedById,
      expiresAt: input.expiresAt,
      status: 'active',
    },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          pricing: true,
        },
      },
    },
  });

  // If it's a full scholarship (100%), auto-enroll the student
  if (input.discountPercentage === 100) {
    await enrollStudentWithScholarship(input.studentId, input.courseId);
  }

  // Log the action
  await logAuditAction(input.grantedById, 'CREATE_SCHOLARSHIP', 'scholarship', scholarship.id, {
    studentId: input.studentId,
    courseId: input.courseId,
    discountPercentage: input.discountPercentage,
  });

  return scholarship;
}


// Get all scholarships with pagination and filtering
export async function getScholarships(
  filters: ScholarshipFilters,
  pagination: PaginationParams
) {
  const { page, pageSize, sortBy = 'grantedAt', sortOrder = 'desc' } = pagination;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.studentId) {
    where.studentId = filters.studentId;
  }

  if (filters.courseId) {
    where.courseId = filters.courseId;
  }

  if (filters.search) {
    where.OR = [
      { student: { email: { contains: filters.search } } },
      { student: { firstName: { contains: filters.search } } },
      { student: { lastName: { contains: filters.search } } },
      { course: { title: { contains: filters.search } } },
      { reason: { contains: filters.search } },
    ];
  }

  const [scholarships, totalItems] = await Promise.all([
    prisma.scholarship.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            pricing: true,
          },
        },
      },
    }),
    prisma.scholarship.count({ where }),
  ]);

  return {
    scholarships,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}

// Get a single scholarship by ID
export async function getScholarshipById(id: string) {
  const scholarship = await prisma.scholarship.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          pricing: true,
        },
      },
    },
  });

  if (!scholarship) {
    throw new Error('Scholarship not found');
  }

  return scholarship;
}

// Update a scholarship
export async function updateScholarship(
  id: string,
  input: UpdateScholarshipInput,
  adminId: string
) {
  const existingScholarship = await prisma.scholarship.findUnique({
    where: { id },
  });

  if (!existingScholarship) {
    throw new Error('Scholarship not found');
  }

  const scholarship = await prisma.scholarship.update({
    where: { id },
    data: input,
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          pricing: true,
        },
      },
    },
  });

  // Log the action
  await logAuditAction(adminId, 'UPDATE_SCHOLARSHIP', 'scholarship', id, {
    changes: input,
  });

  return scholarship;
}

// Revoke a scholarship
export async function revokeScholarship(id: string, adminId: string) {
  const scholarship = await prisma.scholarship.findUnique({
    where: { id },
    include: {
      student: true,
      course: true,
    },
  });

  if (!scholarship) {
    throw new Error('Scholarship not found');
  }

  if (scholarship.status === 'revoked') {
    throw new Error('Scholarship is already revoked');
  }

  // Update scholarship status
  const updatedScholarship = await prisma.scholarship.update({
    where: { id },
    data: { status: 'revoked' },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          pricing: true,
        },
      },
    },
  });

  // If it was a full scholarship, remove enrollment
  if (scholarship.discountPercentage === 100) {
    await prisma.enrollment.deleteMany({
      where: {
        studentId: scholarship.studentId,
        courseId: scholarship.courseId,
      },
    });
  }

  // Log the action
  await logAuditAction(adminId, 'REVOKE_SCHOLARSHIP', 'scholarship', id, {
    studentId: scholarship.studentId,
    courseId: scholarship.courseId,
  });

  return updatedScholarship;
}


// Manual enrollment (bypassing payment)
export async function manualEnrollment(
  studentId: string,
  courseId: string,
  adminId: string,
  reason: string
) {
  // Check if student exists
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });
  if (!student) {
    throw new Error('Student not found');
  }

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    throw new Error('Course not found');
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    throw new Error('Student is already enrolled in this course');
  }

  // Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      courseId,
      status: 'active',
      progressPercentage: 0,
    },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Log the action
  await logAuditAction(adminId, 'MANUAL_ENROLLMENT', 'enrollment', enrollment.id, {
    studentId,
    courseId,
    reason,
  });

  return enrollment;
}

// Helper function to enroll student with scholarship
async function enrollStudentWithScholarship(studentId: string, courseId: string) {
  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (!existingEnrollment) {
    await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'active',
        progressPercentage: 0,
      },
    });
  }
}

// Helper function to log audit actions
async function logAuditAction(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      resourceType,
      resourceId,
      changes: JSON.stringify(changes),
    },
  });
}

// Get scholarship statistics
export async function getScholarshipStats() {
  const [
    totalScholarships,
    activeScholarships,
    revokedScholarships,
    expiredScholarships,
    fullScholarships,
  ] = await Promise.all([
    prisma.scholarship.count(),
    prisma.scholarship.count({ where: { status: 'active' } }),
    prisma.scholarship.count({ where: { status: 'revoked' } }),
    prisma.scholarship.count({ where: { status: 'expired' } }),
    prisma.scholarship.count({ where: { discountPercentage: 100 } }),
  ]);

  // Calculate total scholarship value
  const scholarshipsWithCourses = await prisma.scholarship.findMany({
    where: { status: 'active' },
    include: {
      course: {
        select: { pricing: true },
      },
    },
  });

  const totalScholarshipValue = scholarshipsWithCourses.reduce((sum, s) => {
    return sum + (s.course.pricing * s.discountPercentage / 100);
  }, 0);

  return {
    totalScholarships,
    activeScholarships,
    revokedScholarships,
    expiredScholarships,
    fullScholarships,
    totalScholarshipValue,
  };
}

// Get students for scholarship selection (students without scholarship for a course)
export async function getEligibleStudents(courseId?: string, search?: string) {
  const where: Record<string, unknown> = {
    role: 'student',
  };

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }

  const students = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      scholarships: courseId ? {
        where: { courseId },
      } : true,
    },
    take: 50,
  });

  // Filter out students who already have a scholarship for the course
  if (courseId) {
    return students.filter(s => s.scholarships.length === 0);
  }

  return students;
}

// Get courses for scholarship selection
export async function getAvailableCourses(search?: string) {
  const where: Record<string, unknown> = {
    isPublished: true,
  };

  if (search) {
    where.title = { contains: search };
  }

  return prisma.course.findMany({
    where,
    select: {
      id: true,
      title: true,
      pricing: true,
      currency: true,
    },
    take: 50,
  });
}
