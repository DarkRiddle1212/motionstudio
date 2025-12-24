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
export declare class CourseService {
    createCourse(data: CreateCourseData): Promise<{
        _count: {
            enrollments: number;
            lessons: number;
            assignments: number;
        };
        instructor: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        instructorId: string;
        duration: string;
        pricing: number;
        currency: string;
        curriculum: string;
        introVideoUrl: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
    }>;
    getAllCourses(includeUnpublished?: boolean): Promise<({
        _count: {
            enrollments: number;
            lessons: number;
            assignments: number;
        };
        instructor: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        instructorId: string;
        duration: string;
        pricing: number;
        currency: string;
        curriculum: string;
        introVideoUrl: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
    })[]>;
    getCourseById(courseId: string, includeUnpublished?: boolean): Promise<{
        _count: {
            enrollments: number;
            lessons: number;
            assignments: number;
        };
        instructor: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
        lessons: {
            id: string;
            createdAt: Date;
            title: string;
            description: string;
            videoUrl: string | null;
            order: number;
        }[];
        assignments: {
            id: string;
            createdAt: Date;
            title: string;
            description: string;
            submissionType: string;
            deadline: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        instructorId: string;
        duration: string;
        pricing: number;
        currency: string;
        curriculum: string;
        introVideoUrl: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
    }>;
    updateCourse(courseId: string, instructorId: string, data: UpdateCourseData): Promise<{
        _count: {
            enrollments: number;
            lessons: number;
            assignments: number;
        };
        instructor: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        instructorId: string;
        duration: string;
        pricing: number;
        currency: string;
        curriculum: string;
        introVideoUrl: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
    }>;
    deleteCourse(courseId: string, instructorId: string): Promise<{
        message: string;
    }>;
    getCoursesByInstructor(instructorId: string): Promise<({
        _count: {
            enrollments: number;
            lessons: number;
            assignments: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        instructorId: string;
        duration: string;
        pricing: number;
        currency: string;
        curriculum: string;
        introVideoUrl: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
    })[]>;
    enrollStudent(courseId: string, studentId: string): Promise<{
        course: {
            id: string;
            title: string;
            description: string;
            duration: string;
            pricing: number;
            thumbnailUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        studentId: string;
        status: string;
        enrolledAt: Date;
        progressPercentage: number;
        completedAt: Date | null;
    }>;
    enrollStudentWithPaymentVerification(courseId: string, studentId: string, paymentId?: string): Promise<{
        course: {
            id: string;
            title: string;
            description: string;
            duration: string;
            pricing: number;
            thumbnailUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        studentId: string;
        status: string;
        enrolledAt: Date;
        progressPercentage: number;
        completedAt: Date | null;
    }>;
    getStudentEnrollments(studentId: string): Promise<({
        course: {
            id: string;
            _count: {
                lessons: number;
            };
            title: string;
            description: string;
            duration: string;
            pricing: number;
            thumbnailUrl: string | null;
            instructor: {
                firstName: string | null;
                lastName: string | null;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        studentId: string;
        status: string;
        enrolledAt: Date;
        progressPercentage: number;
        completedAt: Date | null;
    })[]>;
    updateEnrollmentProgress(studentId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        studentId: string;
        status: string;
        enrolledAt: Date;
        progressPercentage: number;
        completedAt: Date | null;
    }>;
}
//# sourceMappingURL=courseService.d.ts.map