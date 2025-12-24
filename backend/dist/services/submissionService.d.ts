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
            email: string;
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
            updatedAt: Date;
            courseId: string;
            title: string;
            description: string;
            submissionType: string;
            deadline: Date;
        };
        feedback: ({
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
        })[];
        student: {
            email: string;
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
    }>;
    getSubmissionsByAssignment(assignmentId: string, userId: string, userRole: string): Promise<({
        feedback: ({
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
        })[];
        student: {
            email: string;
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
            updatedAt: Date;
            courseId: string;
            title: string;
            description: string;
            submissionType: string;
            deadline: Date;
        };
        feedback: ({
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