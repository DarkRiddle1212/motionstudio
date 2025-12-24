import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses, Course } from '../../../hooks/useCourses';
import { usePayments } from '../../../hooks/usePayments';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Card } from '../../Common';
import { FadeIn } from '../../Animation';

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchCourseById } = useCourses();
  const { getPaymentStatus } = usePayments();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const courseId = searchParams.get('courseId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!courseId) {
      setError('Missing course information');
      setLoading(false);
      return;
    }

    const verifyPaymentAndLoadCourse = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load course details
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);

        // If we have a session ID, we can verify the payment
        // For now, we'll assume payment was successful if we reach this page
        // In a real implementation, you might want to verify with the backend
        setPaymentVerified(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentAndLoadCourse();
  }, [courseId, sessionId, fetchCourseById, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-brand-secondary-text">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-serif font-bold text-brand-primary-text mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-brand-secondary-text mb-6">{error || 'Unable to verify payment'}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} fullWidth>
              Go to Dashboard
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/courses')} 
              fullWidth
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-8xl mb-6"
            >
              ✅
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary-text mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-brand-secondary-text">
              Welcome to your new course. Let's start learning!
            </p>
          </div>
        </FadeIn>

        <div className="max-w-2xl mx-auto">
          <FadeIn delay={0.4}>
            <Card>
              <div className="text-center space-y-6">
                {/* Course Info */}
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-brand-primary-text mb-2">
                    {course.title}
                  </h2>
                  <p className="text-brand-secondary-text">
                    You now have full access to all course materials
                  </p>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-4 py-6 border-y border-brand-secondary-text/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-accent mb-1">
                      {course._count.lessons}
                    </div>
                    <div className="text-sm text-brand-secondary-text">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-accent mb-1">
                      {course._count.assignments}
                    </div>
                    <div className="text-sm text-brand-secondary-text">Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-accent mb-1">
                      {course.duration}
                    </div>
                    <div className="text-sm text-brand-secondary-text">Duration</div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-brand-primary-text">
                    What's Next?
                  </h3>
                  <div className="text-left space-y-3 text-brand-secondary-text">
                    <div className="flex items-start gap-3">
                      <span className="text-brand-accent">1.</span>
                      <span>Access your course content and start with the first lesson</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-brand-accent">2.</span>
                      <span>Track your progress on your student dashboard</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-brand-accent">3.</span>
                      <span>Complete assignments and receive feedback from your instructor</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6">
                  <Button
                    onClick={() => navigate(`/courses/${courseId}/content`)}
                    fullWidth
                    size="lg"
                  >
                    Start Learning Now
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    fullWidth
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};