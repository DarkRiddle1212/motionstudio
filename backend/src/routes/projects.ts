import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const projectService = new ProjectService();

// Public routes - Get all published projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getPublishedProjects();
    
    // Parse toolsUsed JSON strings back to arrays for response
    const projectsWithParsedTools = projects.map(project => ({
      ...project,
      toolsUsed: JSON.parse(project.toolsUsed),
    }));
    
    res.json({ projects: projectsWithParsedTools });
  } catch (error: any) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public routes - Get project by ID (published only)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id, false); // Only published projects
    
    // Parse toolsUsed JSON string back to array for response
    const projectWithParsedTools = {
      ...project,
      toolsUsed: JSON.parse(project.toolsUsed),
    };
    
    res.json({ project: projectWithParsedTools });
  } catch (error: any) {
    console.error('Get project error:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Create project (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      title, 
      description, 
      goal, 
      solution, 
      motionBreakdown, 
      toolsUsed, 
      thumbnailUrl, 
      caseStudyUrl, 
      order,
      isPublished 
    } = req.body;

    // Validate required fields
    if (!title || !description || !goal || !solution || !motionBreakdown || !toolsUsed || !thumbnailUrl || !caseStudyUrl || order === undefined) {
      return res.status(400).json({ 
        error: 'Title, description, goal, solution, motionBreakdown, toolsUsed, thumbnailUrl, caseStudyUrl, and order are required' 
      });
    }

    // Validate toolsUsed is an array
    if (!Array.isArray(toolsUsed)) {
      return res.status(400).json({ error: 'toolsUsed must be an array' });
    }

    const projectData = {
      title,
      description,
      goal,
      solution,
      motionBreakdown,
      toolsUsed,
      thumbnailUrl,
      caseStudyUrl,
      order,
      isPublished: isPublished || false,
    };

    const project = await projectService.createProject(projectData);
    
    // Parse toolsUsed JSON string back to array for response
    const projectWithParsedTools = {
      ...project,
      toolsUsed: JSON.parse(project.toolsUsed),
    };
    
    res.status(201).json({ project: projectWithParsedTools });
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Update project (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      goal, 
      solution, 
      motionBreakdown, 
      toolsUsed, 
      thumbnailUrl, 
      caseStudyUrl, 
      order,
      isPublished 
    } = req.body;

    const updateData: any = {
      title,
      description,
      goal,
      solution,
      motionBreakdown,
      toolsUsed,
      thumbnailUrl,
      caseStudyUrl,
      order,
      isPublished,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Validate toolsUsed is an array if provided
    if (updateData.toolsUsed && !Array.isArray(updateData.toolsUsed)) {
      return res.status(400).json({ error: 'toolsUsed must be an array' });
    }

    const project = await projectService.updateProject(id, updateData);
    
    // Parse toolsUsed JSON string back to array for response
    const projectWithParsedTools = {
      ...project,
      toolsUsed: JSON.parse(project.toolsUsed),
    };
    
    res.json({ project: projectWithParsedTools });
  } catch (error: any) {
    console.error('Update project error:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Delete project (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await projectService.deleteProject(id);
    res.json(result);
  } catch (error: any) {
    console.error('Delete project error:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Get all projects including unpublished (admin only)
router.get('/admin/all', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await projectService.getAllProjects(true); // Include unpublished
    
    // Parse toolsUsed JSON strings back to arrays for response
    const projectsWithParsedTools = projects.map(project => ({
      ...project,
      toolsUsed: JSON.parse(project.toolsUsed),
    }));
    
    res.json({ projects: projectsWithParsedTools });
  } catch (error: any) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;