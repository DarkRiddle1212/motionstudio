"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseService_1 = require("../services/courseService");
const submissionService_1 = require("../services/submissionService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const courseService = new courseService_1.CourseService();
const submissionService = new submissionService_1.SubmissionService();
// Get student's enrolled courses
router.get('/courses', auth_1.authenticateToken, async (req, res) => {
    try {
        const enrollments = await courseService.getStudentEnrollments(req.user.userId);
        res.json({ enrollments });
    }
    catch (error) {
        console.error('Get student enrollments error:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get student's submissions
router.get('/submissions', auth_1.authenticateToken, async (req, res) => {
    try {
        const submissions = await submissionService.getStudentSubmissions(req.user.userId, req.user.userId, req.user.role);
        res.json({ submissions });
    }
    catch (error) {
        console.error('Get student submissions error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=students.js.map