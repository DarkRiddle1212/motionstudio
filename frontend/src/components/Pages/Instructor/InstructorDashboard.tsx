import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';
import InstructorLayout from '../../Layout/InstructorLayout';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  pricing: number;
  currency: string;
  isPublished: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    lessons: number;
    assignments: number;
  };
}

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  pendingSubmissions: number;
}

const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch instructor courses
      const coursesResponse = await fetch(`${API_URL}/instructor/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
        
        // Calculate stats from courses data
        const totalStudents = coursesData.courses?.reduce((acc: number, course: Course) => 
          acc + course._count.enrollments, 0) || 0;
        const totalRevenue = coursesData.courses?.reduce((acc: number, course: Course) => 
          acc + (course.pricing * course._count.enrollments), 0) || 0;

        setStats({
          totalCourses: coursesData.courses?.length || 0,
          totalStudents,
          totalRevenue,
          pendingSubmissions: 0, // This would come from a separate API call
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/instructor/courses/new');
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/instructor/courses/${courseId}`);
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
            <p className="text-brand-secondary-text">Loading dashboard...</p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  if (error) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-brand-primary-text mb-2 font-serif">
              Unable to Load Dashboard
            </h2>
            <p className="text-brand-secondary-text mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary-text mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-brand-secondary-text">
              Manage your courses, track student progress, and review submissions
            </p>
          </div>
        </FadeIn>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SlideUp delay={0.1}>
            <Card className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-accent mb-1">
                  {stats.totalCourses}
                </div>
                <div className="text-xs sm:text-sm text-brand-secondary-text">
                  Total Courses
                </div>
              </div>
            </Card>
          </SlideUp>

          <SlideUp delay={0.2}>
            <Card className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-accent mb-1">
                  {stats.totalStudents}
                </div>
                <div className="text-xs sm:text-sm text-brand-secondary-text">
                  Total Students
                </div>
              </div>
            </Card>
          </SlideUp>

          <SlideUp delay={0.3}>
            <Card className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-accent mb-1">
                  ${stats.totalRevenue.toFixed(0)}
                </div>
                <div className="text-xs sm:text-sm text-brand-secondary-text">
                  Total Revenue
                </div>
              </div>
            </Card>
          </SlideUp>

          <SlideUp delay={0.4}>
            <Card className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-accent mb-1">
                  {stats.pendingSubmissions}
                </div>
                <div className="text-xs sm:text-sm text-brand-secondary-text">
                  Pending Reviews
                </div>
              </div>
            </Card>
          </SlideUp>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SlideUp delay={0.5}>
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                Create New Course
              </h3>
              <p className="text-sm text-brand-secondary-text mb-4">
                Start building a new course for your students
              </p>
              <Button variant="primary" size="sm" onClick={handleCreateCourse}>
                Create Course
              </Button>
            </Card>
          </SlideUp>

          <SlideUp delay={0.6}>
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                Review Submissions
              </h3>
              <p className="text-sm text-brand-secondary-text mb-4">
                Check and provide feedback on student work
              </p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/instructor/submissions')}>
                View Submissions
              </Button>
            </Card>
          </SlideUp>

          <SlideUp delay={0.7}>
            <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                Manage Students
              </h3>
              <p className="text-sm text-brand-secondary-text mb-4">
                View enrolled students and their progress
              </p>
              <Button variant="tertiary" size="sm" onClick={() => navigate('/instructor/students')}>
                View Students
              </Button>
            </Card>
          </SlideUp>
        </div>

        {/* Recent Courses */}
        <SlideUp delay={0.8}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-serif text-brand-primary-text mb-2 sm:mb-0">
                My Courses ({courses.length})
              </h2>
              <Button variant="secondary" size="sm" onClick={() => navigate('/instructor/courses')}>
                View All Courses
              </Button>
            </div>

            {courses.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <div className="text-brand-secondary-text mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-serif text-brand-primary-text mb-2">
                  No courses yet
                </h3>
                <p className="text-sm sm:text-base text-brand-secondary-text mb-6">
                  Create your first course to start teaching students
                </p>
                <Button onClick={handleCreateCourse}>
                  Create Your First Course
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {courses.slice(0, 6).map((course, index) => (
                  <SlideUp key={course.id} delay={0.9 + index * 0.1}>
                    <Card className="p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewCourse(course.id)}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base sm:text-lg font-serif text-brand-primary-text font-semibold line-clamp-2">
                          {course.title}
                        </h3>
                        <Badge variant={course.isPublished ? 'success' : 'default'} className="ml-2 flex-shrink-0">
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-brand-secondary-text mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm text-brand-secondary-text mb-4">
                        <div className="text-center">
                          <div className="font-medium text-brand-primary-text">{course._count.enrollments}</div>
                          <div>Students</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-brand-primary-text">{course._count.lessons}</div>
                          <div>Lessons</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-brand-primary-text">{course._count.assignments}</div>
                          <div>Assignments</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-brand-secondary-text">
                          {course.pricing === 0 ? 'Free' : `$${course.pricing}`}
                        </span>
                        <Button variant="tertiary" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleViewCourse(course.id);
                        }}>
                          Manage
                        </Button>
                      </div>
                    </Card>
                  </SlideUp>
                ))}
              </div>
            )}
          </div>
        </SlideUp>
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;