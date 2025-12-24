import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export class ProjectService {
  async getAllProjects(includeUnpublished: boolean = false) {
    const where = includeUnpublished ? {} : { isPublished: true };
    
    return await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async getProjectById(id: string, includeUnpublished: boolean = false) {
    const where = includeUnpublished 
      ? { id } 
      : { id, isPublished: true };

    const project = await prisma.project.findFirst({
      where,
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async createProject(data: CreateProjectData) {
    // Convert toolsUsed array to JSON string for storage
    const toolsUsedString = JSON.stringify(data.toolsUsed);

    return await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        goal: data.goal,
        solution: data.solution,
        motionBreakdown: data.motionBreakdown,
        toolsUsed: toolsUsedString,
        thumbnailUrl: data.thumbnailUrl,
        caseStudyUrl: data.caseStudyUrl,
        order: data.order,
        isPublished: data.isPublished || false,
      },
    });
  }

  async updateProject(id: string, data: UpdateProjectData) {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Prepare update data
    const updateData: any = { ...data };
    
    // Convert toolsUsed array to JSON string if provided
    if (data.toolsUsed) {
      updateData.toolsUsed = JSON.stringify(data.toolsUsed);
    }

    return await prisma.project.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteProject(id: string) {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new Error('Project not found');
    }

    await prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  async getPublishedProjects() {
    return await prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    });
  }
}