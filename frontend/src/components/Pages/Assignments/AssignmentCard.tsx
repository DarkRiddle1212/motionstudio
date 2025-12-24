import React from 'react';
import { Card, Badge, Button } from '../../Common';

interface Assignment {
  id: string;
  title: string;
  description: string;
  submissionType: 'file' | 'link';
  deadline: string;
  createdAt: string;
  course?: {
    id: string;
    title: string;
  };
  _count?: {
    submissions: number;
  };
}

interface AssignmentCardProps {
  assignment: Assignment;
  onClick: (assignmentId: string) => void;
  showCourse?: boolean;
  className?: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onClick,
  showCourse = false,
  className = '',
}) => {
  const getDeadlineStatus = () => {
    const deadline = new Date(assignment.deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'overdue', text: 'Overdue', variant: 'danger' as const };
    } else if (daysDiff === 0) {
      return { status: 'due-today', text: 'Due Today', variant: 'warning' as const };
    } else if (daysDiff <= 3) {
      return { status: 'due-soon', text: `Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`, variant: 'warning' as const };
    }
    return { status: 'upcoming', text: `Due in ${daysDiff} days`, variant: 'default' as const };
  };

  const deadlineInfo = getDeadlineStatus();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-brand-accent ${className}`}
      onClick={() => onClick(assignment.id)}
      hoverable
      data-testid={`assignment-card-${assignment.id}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-brand-primary-text font-serif mb-1">
              {assignment.title}
            </h3>
            {showCourse && assignment.course && (
              <p className="text-sm text-brand-secondary-text mb-2">
                📚 {assignment.course.title}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Badge variant="default">
              {assignment.submissionType}
            </Badge>
            <Badge variant={deadlineInfo.variant}>
              {deadlineInfo.text}
            </Badge>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-brand-secondary-text mb-4 leading-relaxed">
          {truncateDescription(assignment.description)}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-brand-secondary-text">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {formatDate(assignment.deadline)}
            </span>
            
            {assignment._count && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {assignment._count.submissions} submission{assignment._count.submissions !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <Button
            variant="tertiary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick(assignment.id);
            }}
            className="text-brand-accent hover:text-brand-accent"
          >
            View Assignment
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AssignmentCard;