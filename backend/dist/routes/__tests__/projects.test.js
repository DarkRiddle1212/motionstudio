"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../index"));
const prisma_1 = require("../../utils/prisma");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
describe('Project Routes', () => {
    let admin, student;
    let adminToken, studentToken;
    beforeAll(async () => {
        // Clean up test database
        await prisma_1.prisma.project.deleteMany({});
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@project-route-test.com',
                },
            },
        });
        // Create test admin
        const hashedAdminPassword = await (0, password_1.hashPassword)('TestPass123');
        admin = await prisma_1.prisma.user.create({
            data: {
                email: `admin-${Date.now()}@project-route-test.com`,
                password: hashedAdminPassword,
                firstName: 'Test',
                lastName: 'Admin',
                role: 'admin',
                emailVerified: true,
            },
        });
        // Create test student
        const hashedStudentPassword = await (0, password_1.hashPassword)('TestPass123');
        student = await prisma_1.prisma.user.create({
            data: {
                email: `student-${Date.now()}@project-route-test.com`,
                password: hashedStudentPassword,
                firstName: 'Test',
                lastName: 'Student',
                role: 'student',
                emailVerified: true,
            },
        });
        // Generate tokens
        adminToken = (0, jwt_1.generateToken)({
            userId: admin.id,
            email: admin.email,
            role: admin.role,
        });
        studentToken = (0, jwt_1.generateToken)({
            userId: student.id,
            email: student.email,
            role: student.role,
        });
    });
    afterAll(async () => {
        // Clean up test database
        await prisma_1.prisma.project.deleteMany({});
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@project-route-test.com',
                },
            },
        });
        await prisma_1.prisma.$disconnect();
    });
    describe('POST /api/projects', () => {
        it('should create project for admin', async () => {
            const projectData = {
                title: 'Test Project',
                description: 'A test motion design project',
                goal: 'Create engaging animations',
                solution: 'Used advanced motion techniques',
                motionBreakdown: 'Detailed breakdown of motion elements',
                toolsUsed: ['After Effects', 'Cinema 4D', 'Photoshop'],
                thumbnailUrl: 'https://example.com/thumbnail.jpg',
                caseStudyUrl: 'https://example.com/case-study',
                order: 1,
                isPublished: true,
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(projectData)
                .expect(201);
            expect(response.body.project).toBeDefined();
            expect(response.body.project.title).toBe('Test Project');
            expect(response.body.project.toolsUsed).toEqual(['After Effects', 'Cinema 4D', 'Photoshop']);
            // Clean up
            await prisma_1.prisma.project.delete({
                where: { id: response.body.project.id },
            });
        });
        it('should reject project creation for student', async () => {
            const projectData = {
                title: 'Test Project',
                description: 'A test motion design project',
                goal: 'Create engaging animations',
                solution: 'Used advanced motion techniques',
                motionBreakdown: 'Detailed breakdown of motion elements',
                toolsUsed: ['After Effects', 'Cinema 4D'],
                thumbnailUrl: 'https://example.com/thumbnail.jpg',
                caseStudyUrl: 'https://example.com/case-study',
                order: 1,
            };
            await (0, supertest_1.default)(index_1.default)
                .post('/api/projects')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(projectData)
                .expect(403);
        });
        it('should reject project creation without authentication', async () => {
            const projectData = {
                title: 'Test Project',
                description: 'A test motion design project',
                goal: 'Create engaging animations',
                solution: 'Used advanced motion techniques',
                motionBreakdown: 'Detailed breakdown of motion elements',
                toolsUsed: ['After Effects'],
                thumbnailUrl: 'https://example.com/thumbnail.jpg',
                caseStudyUrl: 'https://example.com/case-study',
                order: 1,
            };
            await (0, supertest_1.default)(index_1.default)
                .post('/api/projects')
                .send(projectData)
                .expect(401);
        });
        it('should reject project creation with missing required fields', async () => {
            const projectData = {
                title: 'Test Project',
                // Missing required fields
            };
            await (0, supertest_1.default)(index_1.default)
                .post('/api/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(projectData)
                .expect(400);
        });
    });
    describe('GET /api/projects', () => {
        let publishedProject, unpublishedProject;
        beforeAll(async () => {
            // Create test projects
            publishedProject = await prisma_1.prisma.project.create({
                data: {
                    title: 'Published Project',
                    description: 'A published project',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['After Effects']),
                    thumbnailUrl: 'https://example.com/thumb1.jpg',
                    caseStudyUrl: 'https://example.com/case1',
                    order: 1,
                    isPublished: true,
                },
            });
            unpublishedProject = await prisma_1.prisma.project.create({
                data: {
                    title: 'Unpublished Project',
                    description: 'An unpublished project',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['Cinema 4D']),
                    thumbnailUrl: 'https://example.com/thumb2.jpg',
                    caseStudyUrl: 'https://example.com/case2',
                    order: 2,
                    isPublished: false,
                },
            });
        });
        afterAll(async () => {
            // Clean up
            if (publishedProject) {
                await prisma_1.prisma.project.delete({
                    where: { id: publishedProject.id },
                });
            }
            if (unpublishedProject) {
                await prisma_1.prisma.project.delete({
                    where: { id: unpublishedProject.id },
                });
            }
        });
        it('should return only published projects for public access', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/projects')
                .expect(200);
            expect(response.body.projects).toHaveLength(1);
            expect(response.body.projects[0].id).toBe(publishedProject.id);
            expect(response.body.projects[0].title).toBe('Published Project');
            expect(response.body.projects[0].toolsUsed).toEqual(['After Effects']);
        });
    });
    describe('GET /api/projects/:id', () => {
        let publishedProject, unpublishedProject;
        beforeAll(async () => {
            // Create test projects
            publishedProject = await prisma_1.prisma.project.create({
                data: {
                    title: 'Published Project Detail',
                    description: 'A published project for detail view',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['After Effects', 'Photoshop']),
                    thumbnailUrl: 'https://example.com/thumb3.jpg',
                    caseStudyUrl: 'https://example.com/case3',
                    order: 1,
                    isPublished: true,
                },
            });
            unpublishedProject = await prisma_1.prisma.project.create({
                data: {
                    title: 'Unpublished Project Detail',
                    description: 'An unpublished project for detail view',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['Cinema 4D']),
                    thumbnailUrl: 'https://example.com/thumb4.jpg',
                    caseStudyUrl: 'https://example.com/case4',
                    order: 2,
                    isPublished: false,
                },
            });
        });
        afterAll(async () => {
            // Clean up
            if (publishedProject) {
                await prisma_1.prisma.project.delete({
                    where: { id: publishedProject.id },
                });
            }
            if (unpublishedProject) {
                await prisma_1.prisma.project.delete({
                    where: { id: unpublishedProject.id },
                });
            }
        });
        it('should return published project details for public access', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/projects/${publishedProject.id}`)
                .expect(200);
            expect(response.body.project.id).toBe(publishedProject.id);
            expect(response.body.project.title).toBe('Published Project Detail');
            expect(response.body.project.toolsUsed).toEqual(['After Effects', 'Photoshop']);
        });
        it('should return 404 for unpublished project in public access', async () => {
            await (0, supertest_1.default)(index_1.default)
                .get(`/api/projects/${unpublishedProject.id}`)
                .expect(404);
        });
        it('should return 404 for non-existent project', async () => {
            await (0, supertest_1.default)(index_1.default)
                .get('/api/projects/non-existent-id')
                .expect(404);
        });
    });
    describe('PUT /api/projects/:id', () => {
        let project;
        beforeAll(async () => {
            // Create test project
            project = await prisma_1.prisma.project.create({
                data: {
                    title: 'Project to Update',
                    description: 'A project for update testing',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['After Effects']),
                    thumbnailUrl: 'https://example.com/thumb5.jpg',
                    caseStudyUrl: 'https://example.com/case5',
                    order: 1,
                    isPublished: false,
                },
            });
        });
        afterAll(async () => {
            // Clean up
            if (project) {
                await prisma_1.prisma.project.delete({
                    where: { id: project.id },
                });
            }
        });
        it('should update project for admin', async () => {
            const updateData = {
                title: 'Updated Project Title',
                toolsUsed: ['After Effects', 'Cinema 4D', 'Photoshop'],
                isPublished: true,
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/projects/${project.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.project.title).toBe('Updated Project Title');
            expect(response.body.project.toolsUsed).toEqual(['After Effects', 'Cinema 4D', 'Photoshop']);
            expect(response.body.project.isPublished).toBe(true);
        });
        it('should reject project update for student', async () => {
            const updateData = {
                title: 'Unauthorized Update',
            };
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/projects/${project.id}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send(updateData)
                .expect(403);
        });
        it('should return 404 for non-existent project update', async () => {
            const updateData = {
                title: 'Update Non-existent',
            };
            await (0, supertest_1.default)(index_1.default)
                .put('/api/projects/non-existent-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(404);
        });
    });
    describe('DELETE /api/projects/:id', () => {
        let project;
        beforeEach(async () => {
            // Create test project for each delete test
            project = await prisma_1.prisma.project.create({
                data: {
                    title: 'Project to Delete',
                    description: 'A project for delete testing',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['After Effects']),
                    thumbnailUrl: 'https://example.com/thumb6.jpg',
                    caseStudyUrl: 'https://example.com/case6',
                    order: 1,
                    isPublished: false,
                },
            });
        });
        it('should delete project for admin', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/projects/${project.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.message).toBe('Project deleted successfully');
            // Verify project is deleted
            const deletedProject = await prisma_1.prisma.project.findUnique({
                where: { id: project.id },
            });
            expect(deletedProject).toBeNull();
        });
        it('should reject project deletion for student', async () => {
            await (0, supertest_1.default)(index_1.default)
                .delete(`/api/projects/${project.id}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(403);
            // Clean up
            await prisma_1.prisma.project.delete({
                where: { id: project.id },
            });
        });
        it('should return 404 for non-existent project deletion', async () => {
            await (0, supertest_1.default)(index_1.default)
                .delete('/api/projects/non-existent-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
            // Clean up
            await prisma_1.prisma.project.delete({
                where: { id: project.id },
            });
        });
    });
    describe('GET /api/projects/admin/all', () => {
        let publishedProject, unpublishedProject;
        beforeAll(async () => {
            // Create test projects
            publishedProject = await prisma_1.prisma.project.create({
                data: {
                    title: 'Admin Published Project',
                    description: 'A published project for admin view',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['After Effects']),
                    thumbnailUrl: 'https://example.com/thumb7.jpg',
                    caseStudyUrl: 'https://example.com/case7',
                    order: 1,
                    isPublished: true,
                },
            });
            unpublishedProject = await prisma_1.prisma.project.create({
                data: {
                    title: 'Admin Unpublished Project',
                    description: 'An unpublished project for admin view',
                    goal: 'Test goal',
                    solution: 'Test solution',
                    motionBreakdown: 'Test breakdown',
                    toolsUsed: JSON.stringify(['Cinema 4D']),
                    thumbnailUrl: 'https://example.com/thumb8.jpg',
                    caseStudyUrl: 'https://example.com/case8',
                    order: 2,
                    isPublished: false,
                },
            });
        });
        afterAll(async () => {
            // Clean up
            if (publishedProject) {
                await prisma_1.prisma.project.delete({
                    where: { id: publishedProject.id },
                });
            }
            if (unpublishedProject) {
                await prisma_1.prisma.project.delete({
                    where: { id: unpublishedProject.id },
                });
            }
        });
        it('should return all projects for admin', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/projects/admin/all')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.projects).toHaveLength(2);
            const titles = response.body.projects.map((p) => p.title);
            expect(titles).toContain('Admin Published Project');
            expect(titles).toContain('Admin Unpublished Project');
        });
        it('should reject admin route access for student', async () => {
            await (0, supertest_1.default)(index_1.default)
                .get('/api/projects/admin/all')
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(403);
        });
        it('should reject admin route access without authentication', async () => {
            await (0, supertest_1.default)(index_1.default)
                .get('/api/projects/admin/all')
                .expect(401);
        });
    });
});
//# sourceMappingURL=projects.test.js.map