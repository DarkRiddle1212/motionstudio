import { Router, Request, Response } from 'express';
import { LessonService } from '../services/lessonService';
import { authenticateToken, requireRole, requireCourseEnrollment, requireLessonAccess, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const lessonService = new LessonService();

// Get lessons for a course (course students only)
router.get('/course/:courseId', authenticateToken, requireCourseEnrollment('courseId'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const lessons = await lessonService.getLessonsByCourse(courseId, req.user!.userId);
    res.json({ lessons });
  } catch (error: any) {
    console.error('Get course lessons error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get lesson details (course students only)
router.get('/:id', authenticateToken, requireLessonAccess(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonById(id, req.user!.userId);
    res.json({ lesson });
  } catch (error: any) {
    console.error('Get lesson error:', error);
    
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Create lesson (instructor only)
router.post('/', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, title, description, content, videoUrl, fileUrls, order } = req.body;

    // Validate required fields
    if (!courseId || !title || !description || !content || order === undefined) {
      return res.status(400).json({ error: 'Course ID, title, description, content, and order are required' });
    }

    const lessonData = {
      courseId,
      title,
      description,
      content,
      videoUrl,
      fileUrls,
      order: parseInt(order),
    };

    const lesson = await lessonService.createLesson(lessonData, req.user!.userId);
    res.status(201).json({ lesson });
  } catch (error: any) {
    console.error('Create lesson error:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to add lessons to this course') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Update lesson (instructor only)
router.put('/:id', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, content, videoUrl, fileUrls, order, isPublished } = req.body;

    const updateData = {
      title,
      description,
      content,
      videoUrl,
      fileUrls,
      order: order !== undefined ? parseInt(order) : undefined,
      isPublished,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const lesson = await lessonService.updateLesson(id, req.user!.userId, updateData);
    res.json({ lesson });
  } catch (error: any) {
    console.error('Update lesson error:', error);
    
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to update this lesson') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Delete lesson (instructor only)
router.delete('/:id', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await lessonService.deleteLesson(id, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error('Delete lesson error:', error);
    
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'You do not have permission to delete this lesson') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Mark lesson as complete (student)
router.post('/:id/complete', authenticateToken, requireLessonAccess(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const completion = await lessonService.completeLesson(id, req.user!.userId);
    res.json({ completion });
  } catch (error: any) {
    console.error('Complete lesson error:', error);
    
    if (error.message === 'Lesson not found' || error.message === 'Lesson is not available') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// Get lessons for instructor's course (instructor only)
router.get('/instructor/course/:courseId', authenticateToken, requireRole(['instructor', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const lessons = await lessonService.getLessonsByCourse(courseId, undefined, true); // Include unpublished lessons
    res.json({ lessons });
  } catch (error: any) {
    console.error('Get instructor course lessons error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;