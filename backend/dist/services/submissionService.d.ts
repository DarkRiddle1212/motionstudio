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
export declare class SubmissionService {
    createSubmission(data: CreateSubmissionData, studentId: string): Promise<{
        assignment: {
            id: string;
            title: string;
            description: string;
            submissionType: string;
            deadline: Date;
        };
        student: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    getSubmissionById(submissionId: string, userId: string, userRole: string): Promise<{
        assignment: {
            course: {
                id: string;
                title: string;
                instructorId: string;
                pricing: number;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            courseId: string;
            title: string;
            description: string;
            updatedAt: Date;
            submissionType: string;
            deadline: Date;
        };
        feedback: ({
            instructor: {
                id: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            instructorId: string;
            updatedAt: Date;
            submissionId: string;
            comment: string;
            rating: number | null;
        })[];
        student: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    getSubmissionsByAssignment(assignmentId: string, userId: string, userRole: string): Promise<({
        feedback: ({
            instructor: {
                id: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            instructorId: string;
            updatedAt: Date;
            submissionId: string;
            comment: string;
            rating: number | null;
        })[];
        student: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
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
    })[]>;
    getStudentSubmissions(studentId: string, userId: string, userRole: string): Promise<({
        assignment: {
            course: {
                id: string;
                title: string;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            courseId: string;
            title: string;
            description: string;
            updatedAt: Date;
            submissionType: string;
            deadline: Date;
        };
        feedback: ({
            instructor: {
                id: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            instructorId: string;
            updatedAt: Date;
            submissionId: string;
            comment: string;
            rating: number | null;
        })[];
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
    })[]>;
}
//# sourceMappingURL=submissionService.d.ts.map