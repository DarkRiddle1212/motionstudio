import { Router, Response } from 'express';
import { CourseService } from '../services/courseService';
import { SubmissionService } from '../services/submissionService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const courseService = new CourseService();
const submissionService = new SubmissionService();

// Get student's enrolled courses
router.get('/courses', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const enrollments = await courseService.getStudentEnrollments(req.user!.userId);
    res.json({ enrollments });
  } catch (error: any) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's submissions
router.get('/submissions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const submissions = await submissionService.getStudentSubmissions(
      req.user!.userId, 
      req.user!.userId, 
      req.user!.role
    );
    res.json({ submissions });
  } catch (error: any) {
    console.error('Get student submissions error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;