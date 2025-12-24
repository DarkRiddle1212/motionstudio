import { Router, Request, Response } from 'express';
import { FeedbackService } from '../services/feedbackService';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const feedbackService = new FeedbackService();

// Protected routes - Create feedback (instructor only)
router.post('/', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { submissionId, comment, rating } = req.body;

    // Validate required fields
    if (!submissionId || !comment) {
      return res.status(400).json({ 
        error: 'Submission ID and comment are required' 
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be a number between 1 and 5' 
      });
    }

    const feedbackData = {
      submissionId,
      comment,
      rating,
    };

    const feedback = await feedbackService.createFeedback(feedbackData, req.user!.userId);
    res.status(201).json({ feedback });
  } catch (error: any) {
    console.error('Create feedback error:', error);
    
    if (error.message === 'Submission not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to provide feedback on this submission') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'Feedback already exists for this submission') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Get feedback by ID (student/instructor)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await feedbackService.getFeedbackById(
      id, 
      req.user!.userId, 
      req.user!.role
    );
    res.json({ feedback });
  } catch (error: any) {
    console.error('Get feedback error:', error);
    
    if (error.message === 'Feedback not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to view this feedback' ||
        error.message === 'You are not enrolled in this course') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'This is a paid course. Please complete payment first.') {
      return res.status(402).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Get feedback by submission (student/instructor)
router.get('/submission/:submissionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const feedback = await feedbackService.getFeedbackBySubmission(
      submissionId, 
      req.user!.userId, 
      req.user!.role
    );
    res.json({ feedback });
  } catch (error: any) {
    console.error('Get submission feedback error:', error);
    
    if (error.message === 'Submission not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to view feedback for this submission' ||
        error.message === 'You are not enrolled in this course') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'This is a paid course. Please complete payment first.') {
      return res.status(402).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Update feedback (instructor only)
router.put('/:id', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;

    const updateData: any = {};

    if (comment !== undefined) updateData.comment = comment;
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ 
          error: 'Rating must be a number between 1 and 5' 
        });
      }
      updateData.rating = rating;
    }

    // At least one field must be provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'At least one field (comment or rating) must be provided' 
      });
    }

    const feedback = await feedbackService.updateFeedback(id, req.user!.userId, updateData);
    res.json({ feedback });
  } catch (error: any) {
    console.error('Update feedback error:', error);
    
    if (error.message === 'Feedback not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to update this feedback') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Protected routes - Get instructor's feedback
router.get('/instructor/my-feedback', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feedback = await feedbackService.getInstructorFeedback(req.user!.userId);
    res.json({ feedback });
  } catch (error: any) {
    console.error('Get instructor feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - Get student's feedback
router.get('/student/:studentId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const feedback = await feedbackService.getStudentFeedback(
      studentId, 
      req.user!.userId, 
      req.user!.role
    );
    res.json({ feedback });
  } catch (error: any) {
    console.error('Get student feedback error:', error);
    
    if (error.message === 'You do not have permission to view this feedback') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

export default router;