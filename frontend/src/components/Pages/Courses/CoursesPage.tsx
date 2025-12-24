import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../../hooks/useCourses';
import { useAuth } from '../../../hooks/useAuth';
import { CourseCard, Button } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { Layout } from '../../Layout';

export const CoursesPage = () => {
  const navigate = useNavigate();
  const { courses, loading, error, enrollInCourse } = useCourses();
  const { isAuthenticated } = useAuth();
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const handleEnroll = async (courseId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(courseId);
    setEnrollError(null);

    try {
      await enrollInCourse(courseId);
      // Navigate to course detail or dashboard
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(null);
    }
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <Layout className="bg-brand-primary-bg">
        <div className="min-h-screen flex items-center justify-center bg-gradient-premium-subtle">
          <div className="text-center">
            <div className="spinner-modern mx-auto mb-4"></div>
            <p className="text-brand-secondary-text text-sm">Loading courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="bg-brand-primary-bg">
        <div className="min-h-screen flex items-center justify-center bg-gradient-premium-subtle">
          <div className="text-center px-4 max-w-md">
            <div className="mb-4 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">{error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="bg-brand-primary-bg">
      {/* Header */}
      <section className="bg-gradient-premium-subtle section-spacing">
        <div className="container-premium">
          <FadeIn>
            <div className="text-center">
              <h1 className="text-display-md md:text-display-lg font-serif font-bold text-brand-primary-text mb-4 sm:mb-6 leading-tight">
                Motion Design Courses
              </h1>
              <p className="text-body-lg text-brand-secondary-text max-w-3xl mx-auto leading-relaxed px-4">
                Master the art of motion design with our comprehensive courses.
                From beginner fundamentals to advanced techniques, learn from industry professionals.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container-premium section-spacing">
        {enrollError && (
          <div className="mb-6 sm:mb-8 p-4 rounded-lg border border-red-500/20 bg-red-500/10">
            <p className="text-red-300 text-sm sm:text-base">{enrollError}</p>
          </div>
        )}

        {courses.length === 0 ? (
          <FadeIn>
            <div className="text-center py-16 sm:py-20 lg:py-24 px-4">
              <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📚</div>
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-brand-primary-text mb-3 sm:mb-4">
                No Courses Available
              </h2>
              <p className="text-brand-secondary-text text-sm sm:text-base">
                Check back soon for new courses!
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course, index) => (
              <SlideUp
                key={course.id}
                inView={true}
                delay={index * 0.1}
              >
                <CourseCard
                  course={course}
                  onEnroll={handleEnroll}
                  onViewDetails={handleViewDetails}
                  showEnrollButton={true}
                  className={enrolling === course.id ? 'opacity-50 pointer-events-none' : ''}
                />
              </SlideUp>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!isAuthenticated && courses.length > 0 && (
          <FadeIn delay={0.5}>
            <div className="text-center mt-16 sm:mt-20 lg:mt-24 card-modern p-8 sm:p-10 lg:p-12">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-brand-primary-text mb-3 sm:mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-brand-secondary-text mb-4 sm:mb-6 text-sm sm:text-base">
                Create an account to enroll in courses and track your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto"
                  data-testid="signup-cta-button"
                >
                  Sign Up Free
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto"
                  data-testid="login-cta-button"
                >
                  Log In
                </Button>
              </div>
            </div>
          </FadeIn>
        )}
      </section>
    </Layout>
  );
};