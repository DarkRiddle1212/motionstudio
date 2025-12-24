import { Router, Request, Response } from 'express';
import { AssignmentService } from '../services/assignmentService';
import { SubmissionService } from '../services/submissionService';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const assignmentService = new AssignmentService();
const submissionService = new SubmissionService();

// Protected routes - Create assignment (instructor only)
router.post('/', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, title, description, submissionType, deadline } = req.body;

    // Validate required fields
    if (!courseId || !title || !description || !submissionType || !deadline) {
      return res.status(400).json({ 
        error: 'Course ID, title, description, submission type, and deadline are required' 
      });
    }

    // Validate submission type
    if (!['file', 'link'].includes(submissionType)) {
      return res.status(400).json({ 
        error: 'Submission type must be either "file" or "link"' 
      });
    }

    // Validate deadline is a valid date
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ error: 'Invalid deadline format' });
    }

    // Check if deadline is in the future
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }

    const assignmentData = {
      courseId,
      title,
      description,
      submissionType,
      deadline: deadlineDate,
    };

    const assignment = await assignmentService.createAssignment(assignmentData, req.user!.userId);
    res.status(201).json({ assignment });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to create assignments for this course') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Get assignments by course (course students and instructor only)
router.get('/course/:courseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const assignments = await assignmentService.getAssignmentsByCourse(
      courseId, 
      req.user!.userId, 
      req.user!.role
    );
    res.json({ assignments });
  } catch (error: any) {
    console.error('Get course assignments error:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to view assignments for this course' ||
        error.message === 'You are not enrolled in this course') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'This is a paid course. Please complete payment first.') {
      return res.status(402).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Get assignment by ID (course students and instructor only)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await assignmentService.getAssignmentById(
      id, 
      req.user!.userId, 
      req.user!.role
    );
    res.json({ assignment });
  } catch (error: any) {
    console.error('Get assignment error:', error);
    
    if (error.message === 'Assignment not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to view this assignment' ||
        error.message === 'You are not enrolled in this course') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'This is a paid course. Please complete payment first.') {
      return res.status(402).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Update assignment (instructor only)
router.put('/:id', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, submissionType, deadline } = req.body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (submissionType !== undefined) {
      if (!['file', 'link'].includes(submissionType)) {
        return res.status(400).json({ 
          error: 'Submission type must be either "file" or "link"' 
        });
      }
      updateData.submissionType = submissionType;
    }
    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({ error: 'Invalid deadline format' });
      }
      updateData.deadline = deadlineDate;
    }

    const assignment = await assignmentService.updateAssignment(id, req.user!.userId, updateData);
    res.json({ assignment });
  } catch (error: any) {
    console.error('Update assignment error:', error);
    
    if (error.message === 'Assignment not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to update this assignment') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Delete assignment (instructor only)
router.delete('/:id', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await assignmentService.deleteAssignment(id, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error('Delete assignment error:', error);
    
    if (error.message === 'Assignment not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to delete this assignment') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Get instructor's assignments
router.get('/instructor/my-assignments', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignments = await assignmentService.getAssignmentsByInstructor(req.user!.userId);
    res.json({ assignments });
  } catch (error: any) {
    console.error('Get instructor assignments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Get submissions for an assignment (instructor only)
router.get('/:id/submissions', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const submissions = await submissionService.getSubmissionsByAssignment(
      id, 
      req.user!.userId, 
      req.user!.role
    );
    res.json({ submissions });
  } catch (error: any) {
    console.error('Get assignment submissions error:', error);
    
    if (error.message === 'Assignment not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to view submissions for this assignment') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Submit assignment (student only)
router.post('/:id/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { submissionType, fileUrl, linkUrl } = req.body;

    // Validate required fields
    if (!submissionType) {
      return res.status(400).json({ 
        error: 'Submission type is required' 
      });
    }

    // Validate submission type
    if (!['file', 'link'].includes(submissionType)) {
      return res.status(400).json({ 
        error: 'Submission type must be either "file" or "link"' 
      });
    }

    const submissionData = {
      assignmentId: id,
      submissionType,
      fileUrl,
      linkUrl,
    };

    const submission = await submissionService.createSubmission(submissionData, req.user!.userId);
    res.status(201).json({ submission });
  } catch (error: any) {
    console.error('Submit assignment error:', error);
    
    if (error.message === 'Assignment not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You are not enrolled in this course') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'This is a paid course. Please complete payment first.') {
      return res.status(402).json({ error: error.message });
    }
    
    if (error.message === 'You have already submitted this assignment') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

export default router;