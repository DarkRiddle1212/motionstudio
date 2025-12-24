import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Card, ProgressBar } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import LessonCard from '../Lessons/LessonCard';
import { useAuth } from '../../../hooks/useAuth';
import { useLessons } from '../../../hooks/useLessons';
import { useCourses } from '../../../hooks/useCourses';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface Assignment {
  id: string;
  title: string;
  description: string;
  submissionType: 'file' | 'link';
  deadline: string;
  createdAt: string;
}

const CourseContentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { lessons, loading: lessonsLoading, error: lessonsError } = useLessons(courseId || '');
  const { fetchCourseById } = useCourses();
  
  const [course, setCourse] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'assignments'>('lessons');

  useEffect(() => {
    if (courseId && token) {
      fetchCourseData();
      fetchAssignments();
    }
  }, [courseId, token]);

  const fetchCourseData = async () => {
    try {
      const courseData = await fetchCourseById(courseId!);
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleAssignmentClick = (assignmentId: string) => {
    navigate(`/assignments/${assignmentId}`);
  };

  const calculateProgress = () => {
    if (!lessons.length) return 0;
    const completedLessons = lessons.filter(lesson => lesson.isCompleted).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  if (loading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-gradient-premium-subtle flex items-center justify-center">
        <div className="text-center">
          <div data-testid="loading-spinner" className="spinner-modern mx-auto mb-4" />
          <p className="text-brand-secondary-text text-sm">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error || lessonsError) {
    return (
      <div className="min-h-screen bg-gradient-premium-subtle flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">
            Unable to Load Course: {error || lessonsError}
          </div>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-premium-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">Course not found</div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      {/* Header */}
      <section className="bg-gradient-premium-subtle">
        <div className="container-premium section-spacing">
          <FadeIn>
            <div className="mb-6 sm:mb-8">
              <Button
                variant="tertiary"
                onClick={() => navigate('/dashboard')}
                className="mb-4 text-brand-accent hover:text-brand-accent"
              >
                ← Back to Dashboard
              </Button>
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6 space-y-4 lg:space-y-0">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary-text font-serif mb-2">
                    {course.title}
                  </h1>
                  <p className="text-base sm:text-lg text-brand-secondary-text">
                    {course.description}
                  </p>
                </div>
                
                <div className="flex-shrink-0 lg:text-right">
                  <div className="text-sm text-brand-secondary-text mb-2">
                    Course Progress
                  </div>
                  <div className="flex items-center space-x-3">
                    <ProgressBar 
                      value={progress} 
                      className="w-24 sm:w-32"
                    />
                    <span className="text-brand-primary-text font-semibold">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-brand-secondary-text">
                <span>📖 {lessons.length} lessons</span>
                <span>📝 {assignments.length} assignments</span>
                <span className="hidden sm:inline">⏱️ {course.duration}</span>
                <span className="hidden md:inline">👤 {course.instructor.firstName} {course.instructor.lastName}</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="container-premium section-spacing">
        {/* Tab Navigation */}
        <SlideUp>
          <div className="mb-6 sm:mb-8">
            <div className="border-b border-brand-secondary-text/20">
              <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'lessons'
                      ? 'border-brand-accent text-brand-accent'
                      : 'border-transparent text-brand-secondary-text hover:text-brand-primary-text hover:border-brand-secondary-text'
                  }`}
                >
                  Lessons ({lessons.length})
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'assignments'
                      ? 'border-brand-accent text-brand-accent'
                      : 'border-transparent text-brand-secondary-text hover:text-brand-primary-text hover:border-brand-secondary-text'
                  }`}
                >
                  Assignments ({assignments.length})
                </button>
              </nav>
            </div>
          </div>
        </SlideUp>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'lessons' && (
            <SlideUp>
              <div>
                {lessons.length > 0 ? (
                  <div className="grid gap-4">
                    {lessons.map((lesson, index) => (
                      <SlideUp
                        key={lesson.id}
                        inView={true}
                        delay={index * 0.1}
                      >
                        <LessonCard
                          lesson={lesson}
                          onClick={handleLessonClick}
                        />
                      </SlideUp>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <div className="text-center py-12">
                      <div className="text-brand-secondary-text mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-brand-primary-text mb-2 font-serif">
                        No Lessons Yet
                      </h3>
                      <p className="text-brand-secondary-text">
                        Lessons will appear here once the instructor adds them to the course.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </SlideUp>
          )}

          {activeTab === 'assignments' && (
            <SlideUp>
              <div>
                {assignments.length > 0 ? (
                  <div className="grid gap-4">
                    {assignments.map((assignment) => (
                      <Card 
                        key={assignment.id}
                        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-brand-accent"
                        onClick={() => handleAssignmentClick(assignment.id)}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-brand-primary-text font-serif">
                              {assignment.title}
                            </h3>
                            <Badge variant="default">
                              {assignment.submissionType}
                            </Badge>
                          </div>
                          
                          <p className="text-brand-secondary-text mb-4">
                            {assignment.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-brand-secondary-text">
                              Due: {new Date(assignment.deadline).toLocaleDateString()}
                            </span>
                            <Button
                              variant="tertiary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignmentClick(assignment.id);
                              }}
                              className="text-brand-accent hover:text-brand-accent"
                            >
                              View Assignment
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <div className="text-center py-12">
                      <div className="text-brand-secondary-text mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-brand-primary-text mb-2 font-serif">
                        No Assignments Yet
                      </h3>
                      <p className="text-brand-secondary-text">
                        Assignments will appear here once the instructor adds them to the course.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </SlideUp>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseContentPage;