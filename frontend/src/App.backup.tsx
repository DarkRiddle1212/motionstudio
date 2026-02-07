import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ProtectedRoute, PerformanceMonitor, CriticalCSS, ErrorBoundary, OfflineIndicator, LoadingState } from './components/Common'
import { AdminProtectedRoute } from './components/Admin'
import { useMemoryMonitor } from './hooks/usePerformance'

// Direct imports for testing
import { HomePage } from './components/Pages/Home'

// Lazy load components for code splitting
const SignUp = lazy(() => import('./components/Pages/Auth').then(module => ({ default: module.SignUp })))
const Login = lazy(() => import('./components/Pages/Auth').then(module => ({ default: module.Login })))
const AdminLogin = lazy(() => import('./components/Pages/Auth/AdminLogin'))
const VerifyEmail = lazy(() => import('./components/Pages/Auth').then(module => ({ default: module.VerifyEmail })))

// Admin components
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'))
const UserManagement = lazy(() => import('./components/Admin/UserManagement'))
const CourseManagement = lazy(() => import('./components/Admin/CourseManagement'))
const FinancialDashboard = lazy(() => import('./components/Admin/FinancialDashboard'))
const ScholarshipManagement = lazy(() => import('./components/Admin/ScholarshipManagement'))
const AnalyticsDashboard = lazy(() => import('./components/Admin/AnalyticsDashboard'))
const ProjectManagement = lazy(() => import('./components/Admin/ProjectManagement'))
const SystemSettings = lazy(() => import('./components/Admin/SystemSettings'))
const SecurityMonitoring = lazy(() => import('./components/Admin/SecurityMonitoring'))

const CoursesPage = lazy(() => import('./components/Pages/Courses').then(module => ({ default: module.CoursesPage })))
const CourseDetailPage = lazy(() => import('./components/Pages/Courses').then(module => ({ default: module.CourseDetailPage })))
const CourseContentPage = lazy(() => import('./components/Pages/Courses').then(module => ({ default: module.CourseContentPage })))

const LessonView = lazy(() => import('./components/Pages/Lessons').then(module => ({ default: module.LessonView })))

const AssignmentView = lazy(() => import('./components/Pages/Assignments').then(module => ({ default: module.AssignmentView })))
const SubmissionHistory = lazy(() => import('./components/Pages/Assignments').then(module => ({ default: module.SubmissionHistory })))

const SubmissionReview = lazy(() => import('./components/Pages/Instructor').then(module => ({ default: module.SubmissionReview })))

const AboutPage = lazy(() => import('./components/Pages/About').then(module => ({ default: module.AboutPage })))
const ContactPage = lazy(() => import('./components/Pages/Contact').then(module => ({ default: module.ContactPage })))

const PortfolioPage = lazy(() => import('./components/Pages/Portfolio').then(module => ({ default: module.PortfolioPage })))
const CaseStudyPage = lazy(() => import('./components/Pages/Portfolio').then(module => ({ default: module.CaseStudyPage })))

const StudentDashboard = lazy(() => import('./components/Pages/Dashboard/StudentDashboard'))
const ComponentDemo = lazy(() => import('./components/Pages/ComponentDemo'))
const ModernUIDemo = lazy(() => import('./components/Pages/ModernUIDemo'))
const TailwindTest = lazy(() => import('./components/Test/TailwindTest'))

// Optimized loading component with better UX
const LoadingSpinner = () => (
  LoadingState 
    message="Loading application..."
    size="lg"
    fullScreen
  />
)

function App() {
  // Monitor memory usage in development
  useMemoryMonitor(30000) // Check every 30 seconds

  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
        // Here you could send error reports to your error tracking service
        // Example: errorTrackingService.captureException(error, { extra: errorInfo });
      }}
    >
      <CriticalCSS>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </CriticalCSS>
    </ErrorBoundary>
  )
}

// Separate component to access auth context
function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingState 
          message="Initializing application..."
          size="lg"
          fullScreen
        />
      </div>
    );
  }

  return (
    <>
      <PerformanceMonitor />
      <OfflineIndicator />
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/portfolio/:projectId" element={<CaseStudyPage />} />
              <Route path="/demo" element={<ComponentDemo />} />
              <Route path="/modern-ui" element={<ModernUIDemo />} />
              <Route path="/test-tailwind" element={<TailwindTest />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:courseId/content" 
                element={
                  <ProtectedRoute>
                    <CourseContentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:courseId/lessons/:lessonId" 
                element={
                  <ProtectedRoute>
                    <LessonView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assignments/:assignmentId" 
                element={
                  <ProtectedRoute>
                    <AssignmentView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/submissions" 
                element={
                  <ProtectedRoute>
                    <SubmissionHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assignments/:assignmentId/submissions" 
                element={
                  <ProtectedRoute>
                    <SubmissionReview />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminProtectedRoute>
                    <UserManagement />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/courses" 
                element={
                  <AdminProtectedRoute>
                    <CourseManagement />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/finance" 
                element={
                  <AdminProtectedRoute>
                    <FinancialDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/scholarships" 
                element={
                  <AdminProtectedRoute>
                    <ScholarshipManagement />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <AdminProtectedRoute>
                    <AnalyticsDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/projects" 
                element={
                  <AdminProtectedRoute>
                    <ProjectManagement />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <AdminProtectedRoute>
                    <SystemSettings />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/security" 
                element={
                  <AdminProtectedRoute>
                    <SecurityMonitoring />
                  </AdminProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </>
    );
}

export default App