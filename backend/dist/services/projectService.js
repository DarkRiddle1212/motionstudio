"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ProjectService {
    async getAllProjects(includeUnpublished = false) {
        const where = includeUnpublished ? {} : { isPublished: true };
        return await prisma.project.findMany({
            where,
            orderBy: { order: 'asc' },
        });
    }
    async getProjectById(id, includeUnpublished = false) {
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
    async createProject(data) {
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
    async updateProject(id, data) {
        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });
        if (!existingProject) {
            throw new Error('Project not found');
        }
        // Prepare update data
        const updateData = { ...data };
        // Convert toolsUsed array to JSON string if provided
        if (data.toolsUsed) {
            updateData.toolsUsed = JSON.stringify(data.toolsUsed);
        }
        return await prisma.project.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteProject(id) {
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
exports.ProjectService = ProjectService;
//# sourceMappingURL=projectService.js.map