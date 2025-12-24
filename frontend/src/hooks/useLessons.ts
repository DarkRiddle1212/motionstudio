import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Lesson } from '../components/Pages/Lessons/LessonCard';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface UseLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLessons = (courseId: string): UseLessonsReturn => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchLessons = async () => {
    if (!courseId || !token) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/lessons/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lessons');
      }

      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId, token]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
  };
};

interface UseInstructorLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createLesson: (lessonData: CreateLessonData) => Promise<Lesson>;
  updateLesson: (lessonId: string, updates: Partial<CreateLessonData>) => Promise<Lesson>;
  deleteLesson: (lessonId: string) => Promise<void>;
}

interface CreateLessonData {
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  fileUrls?: string[];
  order: number;
}

export const useInstructorLessons = (courseId: string): UseInstructorLessonsReturn => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchLessons = async () => {
    if (!courseId || !token) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/lessons/instructor/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lessons');
      }

      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async (lessonData: CreateLessonData): Promise<Lesson> => {
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create lesson');
    }

    const data = await response.json();
    const newLesson = data.lesson;
    
    // Add to local state
    setLessons(prev => [...prev, newLesson].sort((a, b) => a.order - b.order));
    
    return newLesson;
  };

  const updateLesson = async (lessonId: string, updates: Partial<CreateLessonData>): Promise<Lesson> => {
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update lesson');
    }

    const data = await response.json();
    const updatedLesson = data.lesson;
    
    // Update local state
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === lessonId ? updatedLesson : lesson
      ).sort((a, b) => a.order - b.order)
    );
    
    return updatedLesson;
  };

  const deleteLesson = async (lessonId: string): Promise<void> => {
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete lesson');
    }
    
    // Remove from local state
    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId, token]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
  };
};