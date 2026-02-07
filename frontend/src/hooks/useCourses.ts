import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  pricing: number;
  currency: string;
  curriculum: string;
  introVideoUrl?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lessons?: Lesson[];
  assignments?: Assignment[];
  _count: {
    enrollments: number;
    lessons: number;
    assignments: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  videoUrl?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  submissionType: 'file' | 'link';
  deadline: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  progressPercentage: number;
  status: 'active' | 'completed' | 'dropped';
  completedAt?: string;
  course: {
    id: string;
    title: string;
    description: string;
    duration: string;
    pricing: number;
    thumbnailUrl?: string;
    instructor: {
      firstName: string;
      lastName: string;
    };
    _count: {
      lessons: number;
    };
  };
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock courses data
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Motion Graphics Fundamentals',
      description: 'Learn the basics of motion graphics design with After Effects and create stunning animations.',
      duration: '8 weeks',
      pricing: 299,
      currency: 'USD',
      curriculum: 'Introduction to motion graphics, keyframe animation, typography animation, logo animation',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      isPublished: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      instructor: {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@motionstudio.com'
      },
      _count: {
        enrollments: 45,
        lessons: 12,
        assignments: 6
      }
    },
    {
      id: '2',
      title: 'Advanced 3D Animation',
      description: 'Master Cinema 4D and create professional 3D animations for motion graphics projects.',
      duration: '12 weeks',
      pricing: 499,
      currency: 'USD',
      curriculum: '3D modeling, lighting, texturing, animation principles, rendering',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
      isPublished: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      instructor: {
        id: '2',
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@motionstudio.com'
      },
      _count: {
        enrollments: 32,
        lessons: 18,
        assignments: 8
      }
    },
    {
      id: '3',
      title: 'Web Animation Mastery',
      description: 'Create engaging web animations using modern tools and techniques for interactive experiences.',
      duration: '6 weeks',
      pricing: 199,
      currency: 'USD',
      curriculum: 'CSS animations, JavaScript libraries, SVG animation, performance optimization',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      isPublished: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      instructor: {
        id: '3',
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma@motionstudio.com'
      },
      _count: {
        enrollments: 67,
        lessons: 10,
        assignments: 5
      }
    }
  ];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first with timeout, fallback to mock data
      try {
        const response = await axios.get(`${API_URL}/courses`, {
          timeout: 3000 // 3 second timeout
        });
        setCourses(response.data.courses);
      } catch (apiError) {
        // If API fails, use mock data
        console.log('API not available, using mock courses data');
        setCourses(mockCourses);
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.error || 'Failed to fetch courses');
      // Even on error, show mock data
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseById = async (courseId: string): Promise<Course | null> => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}`);
      return response.data.course;
    } catch (err: any) {
      // Fallback to mock data
      const mockCourse = mockCourses.find(c => c.id === courseId);
      if (mockCourse) return mockCourse;
      throw new Error(err.response?.data?.error || 'Failed to fetch course');
    }
  };

  const enrollInCourse = async (courseId: string): Promise<Enrollment> => {
    try {
      const response = await axios.post(`${API_URL}/courses/${courseId}/enroll`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.enrollment;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to enroll in course');
    }
  };

  useEffect(() => {
    fetchCourses();
    
    // Safety timeout: force loading=false after 2 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('useCourses: Safety timeout triggered, forcing loading=false');
      setLoading(false);
      setCourses(prev => prev.length === 0 ? mockCourses : prev);
    }, 2000);
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    fetchCourseById,
    enrollInCourse,
  };
};

export const useStudentCourses = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  const fetchEnrollments = async () => {
    if (!isAuthenticated || !token) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/students/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setEnrollments(response.data.enrollments);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [isAuthenticated, token]);

  return {
    enrollments,
    loading,
    error,
    fetchEnrollments,
  };
};

export const useInstructorCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchInstructorCourses = async () => {
    if (!isAuthenticated || user?.role !== 'instructor') return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/courses/instructor/my-courses`);
      setCourses(response.data.courses);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch instructor courses');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: {
    title: string;
    description: string;
    duration: string;
    pricing?: number;
    currency?: string;
    curriculum: string;
    introVideoUrl?: string;
    thumbnailUrl?: string;
  }): Promise<Course> => {
    try {
      const response = await axios.post(`${API_URL}/courses`, courseData);
      await fetchInstructorCourses(); // Refresh the list
      return response.data.course;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create course');
    }
  };

  const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<Course> => {
    try {
      const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData);
      await fetchInstructorCourses(); // Refresh the list
      return response.data.course;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update course');
    }
  };

  const deleteCourse = async (courseId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}`);
      await fetchInstructorCourses(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete course');
    }
  };

  useEffect(() => {
    fetchInstructorCourses();
  }, [isAuthenticated, user?.role]);

  return {
    courses,
    loading,
    error,
    fetchInstructorCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};