export interface CreateLessonData {
    courseId: string;
    title: string;
    description: string;
    content: string;
    videoUrl?: string;
    fileUrls?: string[];
    order: number;
}
export interface UpdateLessonData {
    title?: string;
    description?: string;
    content?: string;
    videoUrl?: string;
    fileUrls?: string[];
    order?: number;
    isPublished?: boolean;
}
export declare class LessonService {
    createLesson(data: CreateLessonData, instructorId: string): Promise<{
        course: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        description: string;
        isPublished: boolean;
        content: string;
        videoUrl: string | null;
        fileUrls: string;
        order: number;
    }>;
    getLessonsByCourse(courseId: string, studentId?: string, includeUnpublished?: boolean): Promise<{
        fileUrls: any;
        isCompleted: boolean;
        completedAt: Date | null;
        completions: undefined;
        _count: {
            completions: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        description: string;
        isPublished: boolean;
        content: string;
        videoUrl: string | null;
        order: number;
    }[]>;
    getLessonById(lessonId: string, studentId?: string, includeUnpublished?: boolean): Promise<{
        fileUrls: any;
        isCompleted: boolean;
        completedAt: Date | null;
        completions: undefined;
        course: {
            id: string;
            title: string;
            instructorId: string;
        };
        _count: {
            completions: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        description: string;
        isPublished: boolean;
        content: string;
        videoUrl: string | null;
        order: number;
    }>;
    updateLesson(lessonId: string, instructorId: string, data: UpdateLessonData): Promise<{
        fileUrls: any;
        course: {
            id: string;
            title: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        description: string;
        isPublished: boolean;
        content: string;
        videoUrl: string | null;
        order: number;
    }>;
    deleteLesson(lessonId: string, instructorId: string): Promise<{
        message: string;
    }>;
    completeLesson(lessonId: string, studentId: string): Promise<{
        id: string;
        createdAt: Date;
        studentId: string;
        completedAt: Date;
        lessonId: string;
    }>;
    private updateCourseProgress;
}
//# sourceMappingURL=lessonService.d.ts.map