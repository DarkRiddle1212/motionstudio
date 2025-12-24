import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses, Course } from '../../../hooks/useCourses';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Badge, Card } from '../../Common';
import { FadeIn } from '../../Animation';

export const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { fetchCourseById, enrollInCourse } = useCourses();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, fetchCourseById]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!courseId) return;

    setEnrolling(true);
    setEnrollError(null);

    try {
      await enrollInCourse(courseId);
      // Refresh course data to show enrollment status
      const courseData = await fetchCourseById(courseId);
      setCourse(courseData);
    } catch (err: any) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-premium-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-modern mx-auto mb-4" />
          <p className="text-brand-secondary-text text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-premium-subtle flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="mb-4 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">{error || 'Course not found'}</div>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const isFree = course.pricing === 0;
  const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      {/* Hero Section */}
      <section className="bg-gradient-premium-subtle section-spacing">
        <div className="container-premium">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Course Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant={isFree ? 'success' : 'primary'}>
                    {isFree ? 'Free Course' : `${course.currency} ${course.pricing}`}
                  </Badge>
                  <Badge variant="secondary">{course.duration}</Badge>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary-text mb-6">
                  {course.title}
                </h1>

                <p className="text-lg text-brand-secondary-text mb-6">
                  {course.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-brand-secondary-text mb-8">
                  <span>👤 {instructorName}</span>
                  <span>📖 {course._count.lessons} lessons</span>
                  <span>📝 {course._count.assignments} assignments</span>
                  <span>👥 {course._count.enrollments} students</span>
                </div>

                {enrollError && (
                  <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10">
                    <p className="text-red-300">{enrollError}</p>
                  </div>
                )}

                <Button
                  onClick={handleEnroll}
                  isLoading={enrolling}
                  disabled={enrolling}
                  size="lg"
                >
                  {isFree ? 'Enroll Free' : `Enroll for ${course.currency} ${course.pricing}`}
                </Button>
              </div>

              {/* Course Thumbnail/Video */}
              <div>
                {course.introVideoUrl ? (
                  <div className="aspect-video bg-brand-secondary-bg rounded-lg overflow-hidden">
                    <video
                      src={course.introVideoUrl}
                      controls
                      className="w-full h-full"
                      poster={course.thumbnailUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : course.thumbnailUrl ? (
                  <div className="aspect-video bg-brand-secondary-bg rounded-lg overflow-hidden">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-brand-secondary-bg rounded-lg flex items-center justify-center">
                    <div className="text-brand-secondary-text text-6xl">📚</div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Curriculum */}
            <FadeIn delay={0.2}>
              <Card>
                <h2 className="text-2xl font-serif font-semibold text-brand-primary-text mb-6">
                  Course Curriculum
                </h2>
                <div className="prose prose-sm max-w-none text-brand-secondary-text whitespace-pre-wrap">
                  {course.curriculum}
                </div>
              </Card>
            </FadeIn>

            {/* Lessons */}
            {course.lessons && course.lessons.length > 0 && (
              <FadeIn delay={0.3}>
                <Card>
                  <h2 className="text-2xl font-serif font-semibold text-brand-primary-text mb-6">
                    Lessons ({course.lessons.length})
                  </h2>
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 p-4 bg-brand-secondary-bg rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-brand-primary-text font-semibold text-sm">
                          {lesson.order}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-brand-primary-text mb-1">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-brand-secondary-text">
                            {lesson.description}
                          </p>
                        </div>
                        {lesson.videoUrl && (
                          <div className="flex-shrink-0 text-brand-accent">
                            ▶️
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </FadeIn>
            )}

            {/* Assignments */}
            {course.assignments && course.assignments.length > 0 && (
              <FadeIn delay={0.4}>
                <Card>
                  <h2 className="text-2xl font-serif font-semibold text-brand-primary-text mb-6">
                    Assignments ({course.assignments.length})
                  </h2>
                  <div className="space-y-4">
                    {course.assignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-brand-secondary-bg rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-brand-primary-text">
                            {assignment.title}
                          </h3>
                          <Badge variant="secondary">
                            {assignment.submissionType}
                          </Badge>
                        </div>
                        <p className="text-sm text-brand-secondary-text mb-2">
                          {assignment.description}
                        </p>
                        <p className="text-xs text-brand-secondary-text">
                          Due: {new Date(assignment.deadline).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.5}>
              <Card className="sticky top-8">
                <h3 className="text-xl font-serif font-semibold text-brand-primary-text mb-4">
                  Course Details
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-brand-secondary-text mb-1">Instructor</p>
                    <p className="text-brand-primary-text font-medium">{instructorName}</p>
                  </div>

                  <div>
                    <p className="text-brand-secondary-text mb-1">Duration</p>
                    <p className="text-brand-primary-text font-medium">{course.duration}</p>
                  </div>

                  <div>
                    <p className="text-brand-secondary-text mb-1">Lessons</p>
                    <p className="text-brand-primary-text font-medium">{course._count.lessons}</p>
                  </div>

                  <div>
                    <p className="text-brand-secondary-text mb-1">Assignments</p>
                    <p className="text-brand-primary-text font-medium">{course._count.assignments}</p>
                  </div>

                  <div>
                    <p className="text-brand-secondary-text mb-1">Students Enrolled</p>
                    <p className="text-brand-primary-text font-medium">{course._count.enrollments}</p>
                  </div>

                  <div>
                    <p className="text-brand-secondary-text mb-1">Price</p>
                    <p className="text-brand-primary-text font-medium">
                      {isFree ? 'Free' : `${course.currency} ${course.pricing}`}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-brand-secondary-text/20">
                  <Button
                    onClick={handleEnroll}
                    isLoading={enrolling}
                    disabled={enrolling}
                    fullWidth
                  >
                    {isFree ? 'Enroll Free' : `Enroll Now`}
                  </Button>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );

};