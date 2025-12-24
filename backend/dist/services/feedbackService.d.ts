export interface CreateFeedbackData {
    submissionId: string;
    comment: string;
    rating?: number;
}
export interface UpdateFeedbackData {
    comment?: string;
    rating?: number;
}
export declare class FeedbackService {
    createFeedback(data: CreateFeedbackData, instructorId: string): Promise<{
        submission: {
            assignment: {
                id: string;
                title: string;
            };
            student: {
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            status: string;
            submissionType: string;
            assignmentId: string;
            fileUrl: string | null;
            linkUrl: string | null;
            submittedAt: Date;
        };
        instructor: {
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        submissionId: string;
        comment: string;
        rating: number | null;
    }>;
    getFeedbackById(feedbackId: string, userId: string, userRole: string): Promise<{
        submission: {
            assignment: {
                course: {
                    id: string;
                    instructorId: string;
                    pricing: number;
                    isPublished: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                courseId: string;
                title: string;
                description: string;
                submissionType: string;
                deadline: Date;
            };
            student: {
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            status: string;
            submissionType: string;
            assignmentId: string;
            fileUrl: string | null;
            linkUrl: string | null;
            submittedAt: Date;
        };
        instructor: {
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        submissionId: string;
        comment: string;
        rating: number | null;
    }>;
    getFeedbackBySubmission(submissionId: string, userId: string, userRole: string): Promise<({
        instructor: {
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        submissionId: string;
        comment: string;
        rating: number | null;
    })[]>;
    updateFeedback(feedbackId: string, instructorId: string, data: UpdateFeedbackData): Promise<{
        submission: {
            assignment: {
                id: string;
                title: string;
            };
            student: {
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            status: string;
            submissionType: string;
            assignmentId: string;
            fileUrl: string | null;
            linkUrl: string | null;
            submittedAt: Date;
        };
        instructor: {
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        submissionId: string;
        comment: string;
        rating: number | null;
    }>;
    getInstructorFeedback(instructorId: string): Promise<({
        submission: {
            assignment: {
                course: {
                    id: string;
                    title: string;
                    isPublished: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                courseId: string;
                title: string;
                description: string;
                submissionType: string;
                deadline: Date;
            };
            student: {
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            status: string;
            submissionType: string;
            assignmentId: string;
            fileUrl: string | null;
            linkUrl: string | null;
            submittedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        submissionId: string;
        comment: string;
        rating: number | null;
    })[]>;
    getStudentFeedback(studentId: string, userId: string, userRole: string): Promise<({
        submission: {
            assignment: {
                course: {
                    id: string;
                    title: string;
                    isPublished: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                courseId: string;
                title: string;
                description: string;
                submissionType: string;
                deadline: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            status: string;
            submissionType: string;
            assignmentId: string;
            fileUrl: string | null;
            linkUrl: string | null;
            submittedAt: Date;
        };
        instructor: {
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        submissionId: string;
        comment: string;
        rating: number | null;
    })[]>;
}
//# sourceMappingURL=feedbackService.d.ts.map