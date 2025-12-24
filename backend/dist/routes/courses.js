"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseService_1 = require("../services/courseService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const courseService = new courseService_1.CourseService();
// Public routes - Get all published courses
router.get('/', async (req, res) => {
    try {
        const courses = await courseService.getAllCourses(false); // Only published courses
        res.json({ courses });
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: error.message });
    }
});
// Public routes - Get course by ID (published only)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseService.getCourseById(id, false); // Only published courses
        res.json({ course });
    }
    catch (error) {
        console.error('Get course error:', error);
        if (error.message === 'Course not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});
// Protected routes - Create course (instructor only)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['instructor', 'admin']), async (req, res) => {
    try {
        const { title, description, duration, pricing, currency, curriculum, introVideoUrl, thumbnailUrl } = req.body;
        // Validate required fields
        if (!title || !description || !duration || !curriculum) {
            return res.status(400).json({ error: 'Title, description, duration, and curriculum are required' });
        }
        const courseData = {
            title,
            description,
            instructorId: req.user.userId,
            duration,
            pricing: pricing || 0,
            currency: currency || 'USD',
            curriculum,
            introVideoUrl,
            thumbnailUrl,
        };
        const course = await courseService.createCourse(courseData);
        res.status(201).json({ course });
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(400).json({ error: error.message });
    }
});
// Protected routes - Update course (instructor only, own courses)
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, duration, pricing, currency, curriculum, introVideoUrl, thumbnailUrl, isPublished } = req.body;
        const updateData = {
            title,
            description,
            duration,
            pricing,
            currency,
            curriculum,
            introVideoUrl,
            thumbnailUrl,
            isPublished,
        };
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
        const course = await courseService.updateCourse(id, req.user.userId, updateData);
        res.json({ course });
    }
    catch (error) {
        console.error('Update course error:', error);
        if (error.message === 'Course not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'You do not have permission to update this course') {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
});
// Protected routes - Delete course (instructor only, own courses)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await courseService.deleteCourse(id, req.user.userId);
        res.json(result);
    }
    catch (error) {
        console.error('Delete course error:', error);
        if (error.message === 'Course not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'You do not have permission to delete this course') {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
});
// Protected routes - Get instructor's courses
router.get('/instructor/my-courses', auth_1.authenticateToken, (0, auth_1.requireRole)(['instructor', 'admin']), async (req, res) => {
    try {
        const courses = await courseService.getCoursesByInstructor(req.user.userId);
        res.json({ courses });
    }
    catch (error) {
        console.error('Get instructor courses error:', error);
        res.status(500).json({ error: error.message });
    }
});
// Protected routes - Enroll in course (student)
router.post('/:id/enroll', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const enrollment = await courseService.enrollStudent(id, req.user.userId);
        res.status(201).json({ enrollment });
    }
    catch (error) {
        console.error('Enroll in course error:', error);
        if (error.message === 'Course not found' || error.message === 'Course is not available for enrollment') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'You are already enrolled in this course') {
            return res.status(409).json({ error: error.message });
        }
        if (error.message === 'This is a paid course. Please complete payment first.') {
            return res.status(402).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
});
// Protected routes - Enroll in paid course with payment verification (student)
router.post('/:id/enroll-paid', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentId } = req.body;
        if (!paymentId) {
            return res.status(400).json({ error: 'Payment ID is required for paid course enrollment' });
        }
        const enrollment = await courseService.enrollStudentWithPaymentVerification(id, req.user.userId, paymentId);
        res.status(201).json({ enrollment });
    }
    catch (error) {
        console.error('Enroll in paid course error:', error);
        if (error.message === 'Course not found' || error.message === 'Course is not available for enrollment') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'You are already enrolled in this course') {
            return res.status(409).json({ error: error.message });
        }
        if (error.message === 'Payment verification required for paid courses' ||
            error.message === 'Payment not found' ||
            error.message === 'Payment does not belong to this student' ||
            error.message === 'Payment is not for this course' ||
            error.message === 'Payment is not completed') {
            return res.status(402).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map