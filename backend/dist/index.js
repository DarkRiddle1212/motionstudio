"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const courses_1 = __importDefault(require("./routes/courses"));
const students_1 = __importDefault(require("./routes/students"));
const lessons_1 = __importDefault(require("./routes/lessons"));
const payments_1 = __importDefault(require("./routes/payments"));
const assignments_1 = __importDefault(require("./routes/assignments"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const projects_1 = __importDefault(require("./routes/projects"));
const contact_1 = __importDefault(require("./routes/contact"));
const admin_1 = __importDefault(require("./routes/admin"));
const projectUploads_1 = __importDefault(require("./routes/projectUploads"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:3001',
        // Add your Vercel domains here
        'https://motionstudio-darkriddle1212.vercel.app',
        /\.vercel\.app$/ // Allow any vercel.app subdomain
    ],
    credentials: true,
}));
// Increase body size limits for file uploads
// 60MB limit supports: thumbnails (5MB), hero images (10MB), videos (50MB)
// Note: Multer middleware enforces specific limits per endpoint
app.use(express_1.default.json({ limit: '60mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '60mb' }));
// Static file serving for uploads with caching
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    maxAge: '1y', // Cache for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Set appropriate MIME types
        if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
        else if (filePath.endsWith('.mp4')) {
            res.setHeader('Content-Type', 'video/mp4');
        }
        else if (filePath.endsWith('.webm')) {
            res.setHeader('Content-Type', 'video/webm');
        }
    }
}));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/students', students_1.default);
app.use('/api/lessons', lessons_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/assignments', assignments_1.default);
app.use('/api/feedback', feedback_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/admin/projects', projectUploads_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Motion Studio Backend is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});
// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map