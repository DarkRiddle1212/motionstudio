import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Modal } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';
import type { Lesson } from './LessonCard';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface LessonViewProps {
  courseId?: string;
}

const LessonView: React.FC<LessonViewProps> = ({ courseId: propCourseId }) => {
  const { lessonId, courseId: paramCourseId } = useParams<{ lessonId: string; courseId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const courseId = propCourseId || paramCourseId;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    if (lessonId && token) {
      fetchLesson();
    }
  }, [lessonId, token]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lesson');
      }

      const data = await response.json();
      setLesson(data.lesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson || lesson.isCompleted || completing) return;

    try {
      setCompleting(true);
      
      const response = await fetch(`${API_URL}/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete lesson');
      }

      // Update lesson state to reflect completion
      setLesson(prev => prev ? { ...prev, isCompleted: true, completedAt: new Date().toISOString() } : null);
      setShowCompletionModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  const handleBackToCourse = () => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const renderVideoContent = (videoUrl: string) => (
    <div className="mb-8">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full object-cover"
          poster="/api/placeholder/800/450"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );

  const renderFileDownloads = (fileUrls: string[]) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-primary-text mb-4 font-serif">
        Course Materials
      </h3>
      <div className="space-y-2">
        {fileUrls.map((fileUrl, index) => {
          const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-primary-text">{fileName}</span>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                Download
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLessonContent = (content: string) => (
    <div className="mb-8">
      <div 
        className="prose prose-lg max-w-none text-primary-text"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-brand-secondary-text">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-brand-primary-text mb-2 font-serif">
            Unable to Load Lesson
          </h2>
          <p className="text-brand-secondary-text mb-6">{error}</p>
          <Button onClick={handleBackToCourse}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-secondary-text">Lesson not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <Button
              variant="tertiary"
              onClick={handleBackToCourse}
              className="mb-4 text-brand-accent hover:text-brand-accent"
            >
              ← Back to Course
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-secondary text-primary-text rounded-full font-medium">
                    {lesson.order}
                  </div>
                  <h1 className="text-3xl font-bold text-primary-text font-serif">
                    {lesson.title}
                  </h1>
                </div>
                <p className="text-lg text-secondary-text">
                  {lesson.description}
                </p>
              </div>
              
              {lesson.isCompleted && (
                <Badge variant="success" className="ml-4">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Lesson Content */}
        <SlideUp>
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            {/* Video Content */}
            {lesson.videoUrl && renderVideoContent(lesson.videoUrl)}
            
            {/* Text Content */}
            {lesson.content && renderLessonContent(lesson.content)}
            
            {/* File Downloads */}
            {lesson.fileUrls.length > 0 && renderFileDownloads(lesson.fileUrls)}
          </div>
        </SlideUp>

        {/* Completion Button */}
        {!lesson.isCompleted && (
          <SlideUp>
            <div className="text-center">
              <Button
                onClick={handleCompleteLesson}
                disabled={completing}
                className="px-8 py-3 text-lg"
              >
                {completing ? 'Completing...' : 'Mark as Complete'}
              </Button>
            </div>
          </SlideUp>
        )}

        {/* Completion Modal */}
        <Modal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          title="Lesson Completed!"
        >
          <div className="text-center py-4">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-text mb-2 font-serif">
              Great job!
            </h3>
            <p className="text-secondary-text mb-6">
              You've successfully completed "{lesson.title}". Your progress has been updated.
            </p>
            <div className="flex space-x-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => setShowCompletionModal(false)}
              >
                Continue Learning
              </Button>
              <Button onClick={handleBackToCourse}>
                Back to Course
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LessonView;