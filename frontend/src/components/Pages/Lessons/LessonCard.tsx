import React from 'react';
import { Card, Badge, Button } from '../../Common';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  fileUrls: string[];
  order: number;
  isPublished: boolean;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

interface LessonCardProps {
  lesson: Lesson;
  onClick: (lessonId: string) => void;
  className?: string;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick, className = '' }) => {
  const handleClick = () => {
    onClick(lesson.id);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-brand-accent ${className}`}
      onClick={handleClick}
    >
        <div className="p-6">
          {/* Header with lesson number and completion status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-brand-secondary-bg text-brand-primary-text rounded-full text-sm font-medium">
                {lesson.order}
              </div>
              <h3 className="text-lg font-semibold text-brand-primary-text font-serif">
                {lesson.title}
              </h3>
            </div>
            
            {lesson.isCompleted && (
              <Badge variant="success" className="text-xs">
                ✓ Completed
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-brand-secondary-text mb-4 line-clamp-2">
            {lesson.description}
          </p>

          {/* Content indicators */}
          <div className="flex items-center space-x-4 text-sm text-brand-secondary-text mb-4">
            {lesson.videoUrl && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Video</span>
              </div>
            )}
            
            {lesson.fileUrls.length > 0 && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>{lesson.fileUrls.length} file{lesson.fileUrls.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-between items-center">
            <Button
              variant="tertiary"
              size="sm"
              onClick={handleClick}
              className="text-brand-accent hover:text-brand-accent"
            >
              {lesson.isCompleted ? 'Review Lesson' : 'Start Lesson'}
            </Button>
            
            {lesson.completedAt && (
              <span className="text-xs text-brand-secondary-text">
                Completed {new Date(lesson.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </Card>
  );
};

export default LessonCard;