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
export declare class AssignmentService {
    createAssignment(data: CreateAssignmentData, instructorId: string): Promise<{
        course: {
            id: string;
            title: string;
            instructor: {
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        };
        _count: {
            submissions: number;
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
    }>;
    getAssignmentsByCourse(courseId: string, userId: string, userRole: string): Promise<({
        course: {
            id: string;
            title: string;
        };
        _count: {
            submissions: number;
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
    })[]>;
    getAssignmentById(assignmentId: string, userId: string, userRole: string): Promise<{
        course: {
            id: string;
            title: string;
            instructorId: string;
            pricing: number;
            isPublished: boolean;
        };
        _count: {
            submissions: number;
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
    }>;
    updateAssignment(assignmentId: string, instructorId: string, data: UpdateAssignmentData): Promise<{
        course: {
            id: string;
            title: string;
            instructor: {
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        };
        _count: {
            submissions: number;
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
    }>;
    deleteAssignment(assignmentId: string, instructorId: string): Promise<{
        message: string;
    }>;
    getAssignmentsByInstructor(instructorId: string): Promise<({
        course: {
            id: string;
            title: string;
        };
        _count: {
            submissions: number;
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
    })[]>;
}
//# sourceMappingURL=assignmentService.d.ts.map