export interface CreateProjectData {
    title: string;
    description: string;
    goal: string;
    solution: string;
    motionBreakdown: string;
    toolsUsed: string[];
    thumbnailUrl: string;
    caseStudyUrl: string;
    order: number;
    isPublished?: boolean;
}
export interface UpdateProjectData {
    title?: string;
    description?: string;
    goal?: string;
    solution?: string;
    motionBreakdown?: string;
    toolsUsed?: string[];
    thumbnailUrl?: string;
    caseStudyUrl?: string;
    order?: number;
    isPublished?: boolean;
}
export declare class ProjectService {
    getAllProjects(includeUnpublished?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        thumbnailUrl: string;
        isPublished: boolean;
        order: number;
        goal: string;
        solution: string;
        motionBreakdown: string;
        toolsUsed: string;
        caseStudyUrl: string;
    }[]>;
    getProjectById(id: string, includeUnpublished?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        thumbnailUrl: string;
        isPublished: boolean;
        order: number;
        goal: string;
        solution: string;
        motionBreakdown: string;
        toolsUsed: string;
        caseStudyUrl: string;
    }>;
    createProject(data: CreateProjectData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        thumbnailUrl: string;
        isPublished: boolean;
        order: number;
        goal: string;
        solution: string;
        motionBreakdown: string;
        toolsUsed: string;
        caseStudyUrl: string;
    }>;
    updateProject(id: string, data: UpdateProjectData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        thumbnailUrl: string;
        isPublished: boolean;
        order: number;
        goal: string;
        solution: string;
        motionBreakdown: string;
        toolsUsed: string;
        caseStudyUrl: string;
    }>;
    deleteProject(id: string): Promise<{
        message: string;
    }>;
    getPublishedProjects(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        thumbnailUrl: string;
        isPublished: boolean;
        order: number;
        goal: string;
        solution: string;
        motionBreakdown: string;
        toolsUsed: string;
        caseStudyUrl: string;
    }[]>;
}
//# sourceMappingURL=projectService.d.ts.map