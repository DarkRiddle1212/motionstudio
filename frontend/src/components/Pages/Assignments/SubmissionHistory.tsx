import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface Submission {
  id: string;
  submissionType: 'file' | 'link';
  fileUrl?: string;
  linkUrl?: string;
  status: 'pending' | 'submitted' | 'late' | 'reviewed';
  submittedAt: string;
  assignment: {
    id: string;
    title: string;
    description: string;
    deadline: string;
    course: {
      id: string;
      title: string;
    };
  };
  feedback?: {
    id: string;
    comment: string;
    rating?: number;
    createdAt: string;
    instructor: {
      firstName: string;
      lastName: string;
    };
  }[];
}

const SubmissionHistory: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'late' | 'reviewed'>('all');

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/students/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'late': return 'warning';
      case 'reviewed': return 'success';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return '✓';
      case 'late': return '⚠';
      case 'reviewed': return '✓';
      case 'pending': return '⏳';
      default: return '';
    }
  };

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

  const handleViewAssignment = (assignmentId: string) => {
    navigate(`/assignments/${assignmentId}`);
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/content`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-brand-secondary-text">Loading submissions...</p>
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
            Unable to Load Submissions
          </h2>
          <p className="text-brand-secondary-text mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <Button
              variant="tertiary"
              onClick={() => navigate('/dashboard')}
              className="mb-4 text-brand-accent hover:text-brand-accent"
            >
              ← Back to Dashboard
            </Button>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-brand-primary-text font-serif mb-2">
                  Submission History
                </h1>
                <p className="text-lg text-brand-secondary-text">
                  View all your assignment submissions and feedback
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-brand-secondary-text mb-2">
                  Total Submissions
                </div>
                <div className="text-2xl font-bold text-brand-primary-text">
                  {submissions.length}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-brand-secondary-text/20">
              <nav className="flex space-x-8">
                {[
                  { key: 'all', label: 'All', count: submissions.length },
                  { key: 'submitted', label: 'Submitted', count: submissions.filter(s => s.status === 'submitted').length },
                  { key: 'late', label: 'Late', count: submissions.filter(s => s.status === 'late').length },
                  { key: 'reviewed', label: 'Reviewed', count: submissions.filter(s => s.status === 'reviewed').length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      filter === tab.key
                        ? 'border-brand-accent text-brand-accent'
                        : 'border-transparent text-brand-secondary-text hover:text-brand-primary-text hover:border-brand-secondary-text'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </FadeIn>

        {/* Submissions List */}
        <div className="space-y-6">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => (
              <SlideUp key={submission.id}>
                <Card className="hover:shadow-lg transition-all duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-brand-primary-text font-serif mb-1">
                          {submission.assignment.title}
                        </h3>
                        <p className="text-sm text-brand-secondary-text mb-2">
                          📚 {submission.assignment.course.title}
                        </p>
                        <p className="text-brand-secondary-text text-sm">
                          {submission.assignment.description.length > 100 
                            ? `${submission.assignment.description.substring(0, 100)}...`
                            : submission.assignment.description
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="default">
                          {submission.submissionType}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(submission.status)}>
                          {getStatusIcon(submission.status)} {submission.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-brand-primary-bg rounded-lg">
                      <div>
                        <span className="text-sm text-brand-secondary-text">Submitted:</span>
                        <p className="text-brand-primary-text font-medium">
                          {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-brand-secondary-text">Deadline:</span>
                        <p className="text-brand-primary-text font-medium">
                          {formatDate(submission.assignment.deadline)}
                        </p>
                      </div>
                      
                      {submission.fileUrl && (
                        <div>
                          <span className="text-sm text-brand-secondary-text">File:</span>
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => window.open(submission.fileUrl, '_blank')}
                            className="text-brand-accent hover:text-brand-accent ml-2"
                          >
                            View File
                          </Button>
                        </div>
                      )}
                      
                      {submission.linkUrl && (
                        <div>
                          <span className="text-sm text-brand-secondary-text">Link:</span>
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => window.open(submission.linkUrl, '_blank')}
                            className="text-brand-accent hover:text-brand-accent ml-2"
                          >
                            Open Link
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    {submission.feedback && submission.feedback.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-brand-accent border-opacity-20">
                        <h4 className="text-md font-semibold text-brand-primary-text font-serif mb-3">
                          Instructor Feedback
                        </h4>
                        <div className="space-y-3">
                          {submission.feedback.map((feedback) => (
                            <div key={feedback.id} className="bg-brand-secondary-bg rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-brand-primary-text">
                                  {feedback.instructor.firstName} {feedback.instructor.lastName}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {feedback.rating && (
                                    <Badge variant="default">
                                      ⭐ {feedback.rating}/5
                                    </Badge>
                                  )}
                                  <span className="text-sm text-brand-secondary-text">
                                    {formatDate(feedback.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-brand-secondary-text">{feedback.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewCourse(submission.assignment.course.id)}
                      >
                        View Course
                      </Button>
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleViewAssignment(submission.assignment.id)}
                        className="text-brand-accent hover:text-brand-accent"
                      >
                        View Assignment
                      </Button>
                    </div>
                  </div>
                </Card>
              </SlideUp>
            ))
          ) : (
            <SlideUp>
              <Card>
                <div className="text-center py-12">
                  <div className="text-brand-secondary-text mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-primary-text mb-2 font-serif">
                    {filter === 'all' ? 'No Submissions Yet' : `No ${filter} Submissions`}
                  </h3>
                  <p className="text-brand-secondary-text mb-6">
                    {filter === 'all' 
                      ? "You haven't submitted any assignments yet. Check your courses for available assignments."
                      : `You don't have any ${filter} submissions.`
                    }
                  </p>
                  <Button onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </Card>
            </SlideUp>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionHistory;