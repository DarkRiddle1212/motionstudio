import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Card, Input, Textarea, Modal } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface Assignment {
  id: string;
  title: string;
  description: string;
  submissionType: 'file' | 'link';
  deadline: string;
  course: {
    id: string;
    title: string;
  };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Feedback {
  id: string;
  comment: string;
  rating?: number;
  createdAt: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
}

interface Submission {
  id: string;
  submissionType: 'file' | 'link';
  fileUrl?: string;
  linkUrl?: string;
  status: 'pending' | 'submitted' | 'late' | 'reviewed';
  submittedAt: string;
  student: Student;
  feedback: Feedback[];
}

const SubmissionReview: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Feedback form state
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (assignmentId && token) {
      fetchAssignmentAndSubmissions();
    }
  }, [assignmentId, token]);

  const fetchAssignmentAndSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch assignment details
      const assignmentResponse = await fetch(`${API_URL}/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!assignmentResponse.ok) {
        const errorData = await assignmentResponse.json();
        throw new Error(errorData.error || 'Failed to fetch assignment');
      }

      const assignmentData = await assignmentResponse.json();
      setAssignment(assignmentData.assignment);

      // Fetch submissions for this assignment
      const submissionsResponse = await fetch(`${API_URL}/assignments/${assignmentId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!submissionsResponse.ok) {
        const errorData = await submissionsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch submissions');
      }

      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedbackComment('');
    setFeedbackRating(undefined);
    setFormErrors({});
    setShowFeedbackModal(true);
  };

  const validateFeedbackForm = () => {
    const errors: { [key: string]: string } = {};

    if (!feedbackComment.trim()) {
      errors.comment = 'Feedback comment is required';
    }

    if (feedbackRating !== undefined && (feedbackRating < 1 || feedbackRating > 5)) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubmission || !validateFeedbackForm()) {
      return;
    }

    try {
      setSubmittingFeedback(true);
      setError(null);

      const feedbackData = {
        submissionId: selectedSubmission.id,
        comment: feedbackComment.trim(),
        rating: feedbackRating,
      };

      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      // Refresh submissions to show updated status
      await fetchAssignmentAndSubmissions();
      setShowFeedbackModal(false);
      setSelectedSubmission(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleBackToCourse = () => {
    if (assignment?.course.id) {
      navigate(`/courses/${assignment.course.id}/content`);
    } else {
      navigate('/dashboard');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'reviewed': return 'success';
      case 'late': return 'warning';
      case 'submitted': return 'default';
      default: return 'default';
    }
  };

  const formatSubmissionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isDeadlinePassed = (submittedAt: string, deadline: string) => {
    return new Date(submittedAt) > new Date(deadline);
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
          <Button onClick={handleBackToCourse}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-secondary-text">Assignment not found</p>
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
              onClick={handleBackToCourse}
              className="mb-4 text-brand-accent hover:text-brand-accent"
            >
              ← Back to Course
            </Button>
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-brand-primary-text font-serif mb-2">
                  Review Submissions
                </h1>
                <h2 className="text-xl text-brand-secondary-text mb-4">
                  {assignment.title}
                </h2>
                <div className="flex items-center space-x-6 text-sm text-brand-secondary-text">
                  <span>📚 {assignment.course.title}</span>
                  <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  <span>📝 {submissions.length} submissions</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Submissions List */}
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <SlideUp>
              <Card>
                <div className="p-8 text-center">
                  <div className="text-brand-secondary-text mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-primary-text mb-2 font-serif">
                    No Submissions Yet
                  </h3>
                  <p className="text-brand-secondary-text">
                    Students haven't submitted any work for this assignment yet.
                  </p>
                </div>
              </Card>
            </SlideUp>
          ) : (
            submissions.map((submission, index) => (
              <SlideUp key={submission.id} delay={index * 0.1}>
                <Card>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-brand-primary-text font-serif">
                            {submission.student.firstName} {submission.student.lastName}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(submission.status)}>
                            {submission.status === 'submitted' ? '✓ Submitted' : 
                             submission.status === 'late' ? '⚠ Late' : 
                             submission.status === 'reviewed' ? '✓ Reviewed' : 
                             submission.status}
                          </Badge>
                          {isDeadlinePassed(submission.submittedAt, assignment.deadline) && (
                            <Badge variant="warning">Late</Badge>
                          )}
                        </div>
                        <p className="text-brand-secondary-text mb-2">
                          {submission.student.email}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-brand-secondary-text">
                          <span>📅 Submitted: {formatSubmissionDate(submission.submittedAt)}</span>
                          <span className="capitalize">📎 {submission.submissionType}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {submission.fileUrl && (
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => window.open(submission.fileUrl, '_blank')}
                            className="text-brand-accent hover:text-brand-accent"
                          >
                            View File
                          </Button>
                        )}
                        {submission.linkUrl && (
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => window.open(submission.linkUrl, '_blank')}
                            className="text-brand-accent hover:text-brand-accent"
                          >
                            Open Link
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          {submission.feedback.length > 0 ? 'View Feedback' : 'Add Feedback'}
                        </Button>
                      </div>
                    </div>

                    {/* Existing Feedback */}
                    {submission.feedback.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-brand-accent border-opacity-20">
                        <h4 className="text-md font-semibold text-brand-primary-text font-serif mb-3">
                          Feedback
                        </h4>
                        {submission.feedback.map((feedback) => (
                          <div key={feedback.id} className="bg-brand-secondary-bg rounded-lg p-4 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-brand-primary-text">
                                {feedback.instructor.firstName} {feedback.instructor.lastName}
                              </span>
                              <div className="flex items-center space-x-2">
                                {feedback.rating && (
                                  <span className="text-sm text-brand-accent font-medium">
                                    {feedback.rating}/5 ⭐
                                  </span>
                                )}
                                <span className="text-sm text-brand-secondary-text">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-brand-secondary-text">{feedback.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </SlideUp>
            ))
          )}
        </div>

        {/* Feedback Modal */}
        <Modal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title={selectedSubmission?.feedback.length ? 'View Feedback' : 'Add Feedback'}
        >
          {selectedSubmission && (
            <div className="py-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-brand-primary-text font-serif mb-2">
                  {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
                </h3>
                <p className="text-brand-secondary-text mb-2">
                  Submitted: {formatSubmissionDate(selectedSubmission.submittedAt)}
                </p>
                <div className="flex space-x-2">
                  {selectedSubmission.fileUrl && (
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => window.open(selectedSubmission.fileUrl, '_blank')}
                      className="text-brand-accent hover:text-brand-accent"
                    >
                      View File
                    </Button>
                  )}
                  {selectedSubmission.linkUrl && (
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => window.open(selectedSubmission.linkUrl, '_blank')}
                      className="text-brand-accent hover:text-brand-accent"
                    >
                      Open Link
                    </Button>
                  )}
                </div>
              </div>

              {/* Existing Feedback */}
              {selectedSubmission.feedback.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-brand-primary-text font-serif mb-3">
                    Previous Feedback
                  </h4>
                  {selectedSubmission.feedback.map((feedback) => (
                    <div key={feedback.id} className="bg-brand-secondary-bg rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-brand-primary-text">
                          {feedback.instructor.firstName} {feedback.instructor.lastName}
                        </span>
                        <div className="flex items-center space-x-2">
                          {feedback.rating && (
                            <span className="text-sm text-brand-accent font-medium">
                              {feedback.rating}/5 ⭐
                            </span>
                          )}
                          <span className="text-sm text-brand-secondary-text">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-brand-secondary-text">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Feedback Form */}
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <Textarea
                  label="Feedback Comment"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Provide detailed feedback on the student's submission..."
                  rows={4}
                  error={formErrors.comment}
                  fullWidth
                />

                <div>
                  <label className="block text-sm font-medium text-brand-primary-text mb-2">
                    Rating (Optional)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFeedbackRating(rating)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                          feedbackRating === rating
                            ? 'border-brand-accent bg-brand-accent text-white'
                            : 'border-brand-secondary-text text-brand-secondary-text hover:border-brand-accent'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                    {feedbackRating && (
                      <button
                        type="button"
                        onClick={() => setFeedbackRating(undefined)}
                        className="text-sm text-brand-secondary-text hover:text-brand-accent ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {formErrors.rating && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingFeedback}
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SubmissionReview;