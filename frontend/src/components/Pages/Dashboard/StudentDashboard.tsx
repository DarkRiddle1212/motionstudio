
import { useNavigate } from 'react-router-dom';
import { Button, Card, ProgressBar, Badge } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentCourses } from '../../../hooks/useCourses';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { enrollments, loading: enrollmentsLoading, error: enrollmentsError } = useStudentCourses();




  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      {/* Header */}
      <header className="bg-brand-secondary-bg border-b border-brand-accent border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-lg sm:text-xl font-serif text-brand-primary-text">
                Motion Design Studio
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-brand-secondary-text text-sm">
                Welcome, {user?.firstName || user?.email}
              </span>
              <span className="sm:hidden text-brand-secondary-text text-xs">
                {user?.firstName || user?.email?.split('@')[0]}
              </span>
              <Button variant="tertiary" size="sm" onClick={logout}>
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <FadeIn delay={0.2}>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-primary-text mb-2">
              Welcome to Your Dashboard
            </h2>
            <p className="text-sm sm:text-base text-brand-secondary-text">
              Track your progress and continue your motion design journey
            </p>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <SlideUp delay={0.4}>
            <Card variant="elevated" className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                Browse Courses
              </h3>
              <p className="text-sm text-brand-secondary-text mb-4">
                Discover new motion design courses
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/courses')}>
                Browse All
              </Button>
            </Card>
          </SlideUp>

          <SlideUp delay={0.6}>
            <Card variant="elevated" className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                My Progress
              </h3>
              <p className="text-sm text-brand-secondary-text mb-4">
                {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
              </p>
              <div className="text-xl sm:text-2xl font-bold text-brand-accent">
                {enrollments.length > 0 
                  ? Math.round(enrollments.reduce((acc, e) => acc + e.progressPercentage, 0) / enrollments.length)
                  : 0
                }%
              </div>
            </Card>
          </SlideUp>

          <SlideUp delay={0.8}>
            <Card variant="elevated" className="p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                My Profile
              </h3>
              <p className="text-sm text-brand-secondary-text mb-4">
                Update your account settings
              </p>
              <Button variant="tertiary" size="sm">
                Edit Profile
              </Button>
            </Card>
          </SlideUp>
        </div>

        {/* Enrolled Courses */}
        <SlideUp delay={1.0}>
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-serif text-brand-primary-text mb-4 sm:mb-6">
              My Courses ({enrollments.length})
            </h3>
            
            {enrollmentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto mb-4"></div>
                <p className="text-brand-secondary-text">Loading your courses...</p>
              </div>
            ) : enrollmentsError ? (
              <Card className="p-4 sm:p-6 text-center">
                <p className="text-red-500 mb-4">{enrollmentsError}</p>
                <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </Card>
            ) : enrollments.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <div className="text-brand-secondary-text mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                  No courses yet
                </h4>
                <p className="text-sm sm:text-base text-brand-secondary-text mb-6">
                  Start your motion design journey by enrolling in a course
                </p>
                <Button onClick={() => navigate('/courses')}>
                  Browse Courses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-serif text-brand-primary-text mb-1 truncate">
                          {enrollment.course.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-brand-secondary-text mb-2">
                          by {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-brand-secondary-text line-clamp-2">
                          {enrollment.course.description}
                        </p>
                      </div>
                      <Badge 
                        variant={enrollment.status === 'completed' ? 'success' : 'default'}
                        className="ml-2 sm:ml-4 flex-shrink-0"
                      >
                        {enrollment.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm text-brand-secondary-text">Progress</span>
                        <span className="text-xs sm:text-sm font-medium text-brand-primary-text">
                          {enrollment.progressPercentage}%
                        </span>
                      </div>
                      <ProgressBar 
                        value={enrollment.progressPercentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Course Stats */}
                    <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-brand-secondary-text mb-4 gap-2">
                      <span>{enrollment.course._count.lessons} lessons</span>
                      <span className="hidden sm:inline">{enrollment.course.duration}</span>
                      <span className="text-xs">
                        Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/courses/${enrollment.courseId}/content`)}
                        className="flex-1"
                      >
                        View Course
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewCourse(enrollment.courseId)}
                        className="flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">Course Details</span>
                        <span className="sm:hidden">Details</span>
                      </Button>
                    </div>


                  </Card>
                ))}
              </div>
            )}
          </div>
        </SlideUp>

        {/* User Info Card */}
        <SlideUp delay={1.0}>
          <Card variant="elevated" className="mt-6 sm:mt-8 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="flex flex-col sm:flex-row">
                <span className="text-brand-secondary-text font-medium sm:font-normal">Email:</span>
                <span className="sm:ml-2 text-brand-primary-text break-all">{user?.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="text-brand-secondary-text font-medium sm:font-normal">Role:</span>
                <span className="sm:ml-2 text-brand-primary-text capitalize">{user?.role}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="text-brand-secondary-text font-medium sm:font-normal">Email Verified:</span>
                <span className={`sm:ml-2 ${user?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="text-brand-secondary-text font-medium sm:font-normal">Name:</span>
                <span className="sm:ml-2 text-brand-primary-text">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : 'Not provided'
                  }
                </span>
              </div>
            </div>
          </Card>
        </SlideUp>
      </main>
    </div>
  );
};

export default StudentDashboard;