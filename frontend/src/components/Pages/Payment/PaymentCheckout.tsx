import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses, Course } from '../../../hooks/useCourses';
import { usePayments } from '../../../hooks/usePayments';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Card } from '../../Common';
import { FadeIn } from '../../Animation';

export const PaymentCheckout = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchCourseById } = useCourses();
  const { createCheckoutSession, loading: paymentLoading } = usePayments();
  const { isAuthenticated, user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadCourse = async () => {
      if (!courseId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
        
        // Check if course is free
        if (courseData && courseData.pricing === 0) {
          setError('This course is free and does not require payment');
          return;
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, fetchCourseById, isAuthenticated, navigate]);

  const handlePayment = async () => {
    if (!courseId || !course) return;

    setProcessingPayment(true);
    setError(null);

    try {
      const successUrl = `${window.location.origin}/payment/success?courseId=${courseId}`;
      const cancelUrl = `${window.location.origin}/payment/cancel?courseId=${courseId}`;
      
      const session = await createCheckoutSession(courseId, successUrl, cancelUrl);
      
      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (err: any) {
      setError(err.message);
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-brand-secondary-text">Loading course details...</p>
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
            Payment Error
          </h1>
          <p className="text-brand-secondary-text mb-6">{error || 'Course not found'}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/courses')} fullWidth>
              Browse Courses
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate(-1)} 
              fullWidth
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary-text mb-4">
              Complete Your Purchase
            </h1>
            <p className="text-lg text-brand-secondary-text">
              You're one step away from accessing this amazing course
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Course Summary */}
          <FadeIn delay={0.2}>
            <Card>
              <h2 className="text-2xl font-serif font-semibold text-brand-primary-text mb-6">
                Course Summary
              </h2>
              
              <div className="space-y-6">
                {/* Course Thumbnail */}
                <div className="aspect-video bg-brand-secondary-bg rounded-lg overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-brand-secondary-text text-6xl">📚</div>
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div>
                  <h3 className="text-xl font-semibold text-brand-primary-text mb-2">
                    {course.title}
                  </h3>
                  <p className="text-brand-secondary-text mb-4">
                    {course.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-brand-secondary-text">Instructor</p>
                      <p className="text-brand-primary-text font-medium">{instructorName}</p>
                    </div>
                    <div>
                      <p className="text-brand-secondary-text">Duration</p>
                      <p className="text-brand-primary-text font-medium">{course.duration}</p>
                    </div>
                    <div>
                      <p className="text-brand-secondary-text">Lessons</p>
                      <p className="text-brand-primary-text font-medium">{course._count.lessons}</p>
                    </div>
                    <div>
                      <p className="text-brand-secondary-text">Assignments</p>
                      <p className="text-brand-primary-text font-medium">{course._count.assignments}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Payment Details */}
          <FadeIn delay={0.4}>
            <Card>
              <h2 className="text-2xl font-serif font-semibold text-brand-primary-text mb-6">
                Payment Details
              </h2>
              
              <div className="space-y-6">
                {/* User Info */}
                <div className="p-4 bg-brand-secondary-bg rounded-lg">
                  <h3 className="font-semibold text-brand-primary-text mb-2">
                    Billing Information
                  </h3>
                  <p className="text-brand-secondary-text">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-brand-secondary-text">{user?.email}</p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-brand-secondary-text">Course Price</span>
                    <span className="text-brand-primary-text font-medium">
                      {course.currency} {course.pricing.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="border-t border-brand-secondary-text/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-brand-primary-text">Total</span>
                      <span className="text-2xl font-bold text-brand-primary-text">
                        {course.currency} {course.pricing.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Payment Button */}
                <div className="space-y-3">
                  <Button
                    onClick={handlePayment}
                    isLoading={processingPayment || paymentLoading}
                    disabled={processingPayment || paymentLoading}
                    fullWidth
                    size="lg"
                  >
                    {processingPayment || paymentLoading 
                      ? 'Processing...' 
                      : `Pay ${course.currency} ${course.pricing.toFixed(2)}`
                    }
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/courses/${courseId}`)}
                    fullWidth
                  >
                    Back to Course
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="text-xs text-brand-secondary-text text-center">
                  <p>🔒 Your payment is secured by Stripe</p>
                  <p>We never store your payment information</p>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};