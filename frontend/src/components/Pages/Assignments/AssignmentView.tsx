import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Card, Input, Textarea, FileUpload, Modal } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface Assignment {
  id: string;
  title: string;
  description: string;
  submissionType: 'file' | 'link';
  deadline: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
  };
  _count: {
    submissions: number;
  };
}

interface Submission {
  id: string;
  submissionType: 'file' | 'link';
  fileUrl?: string;
  linkUrl?: string;
  status: 'pending' | 'submitted' | 'late' | 'reviewed';
  submittedAt: string;
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

const AssignmentView: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  
  // Form state
  const [submissionType, setSubmissionType] = useState<'file' | 'link'>('file');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (assignmentId && token) {
      fetchAssignment();
      checkExistingSubmission();
    }
  }, [assignmentId, token]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch assignment');
      }

      const data = await response.json();
      setAssignment(data.assignment);
      setSubmissionType(data.assignment.submissionType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSubmission = async () => {
    try {
      const response = await fetch(`${API_URL}/students/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const submission = data.submissions.find((s: any) => s.assignmentId === assignmentId);
        if (submission) {
          setExistingSubmission(submission);
        }
      }
    } catch (err) {
      console.error('Failed to check existing submission:', err);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (submissionType === 'file') {
      if (selectedFiles.length === 0) {
        errors.file = 'Please select a file to upload';
      }
    } else if (submissionType === 'link') {
      if (!linkUrl.trim()) {
        errors.link = 'Please enter a valid URL';
      } else if (!isValidUrl(linkUrl)) {
        errors.link = 'Please enter a valid URL format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let submissionData: any = {
        assignmentId: assignmentId,
        submissionType: submissionType,
      };

      if (submissionType === 'file' && selectedFiles.length > 0) {
        // In a real implementation, you would upload the file first and get the URL
        // For now, we'll simulate this with a placeholder URL
        submissionData.fileUrl = `https://example.com/uploads/${selectedFiles[0].name}`;
      } else if (submissionType === 'link') {
        submissionData.linkUrl = linkUrl;
      }

      const response = await fetch(`${API_URL}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assignment');
      }

      const data = await response.json();
      setExistingSubmission(data.submission);
      setShowSubmissionModal(true);
      
      // Reset form
      setSelectedFiles([]);
      setLinkUrl('');
      setFormErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToCourse = () => {
    if (assignment?.course.id) {
      navigate(`/courses/${assignment.course.id}/content`);
    } else {
      navigate('/dashboard');
    }
  };

  const isDeadlinePassed = () => {
    if (!assignment) return false;
    return new Date() > new Date(assignment.deadline);
  };

  const getDeadlineStatus = () => {
    if (!assignment) return '';
    const deadline = new Date(assignment.deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return 'overdue';
    } else if (daysDiff === 0) {
      return 'due-today';
    } else if (daysDiff <= 3) {
      return 'due-soon';
    }
    return 'upcoming';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'overdue': return 'danger';
      case 'due-today': return 'warning';
      case 'due-soon': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-brand-secondary-text">Loading assignment...</p>
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
            Unable to Load Assignment
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

  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <FadeIn>
          <div className="mb-6 sm:mb-8">
            <Button
              variant="tertiary"
              onClick={handleBackToCourse}
              className="mb-4 text-brand-accent hover:text-brand-accent"
            >
              ← Back to Course
            </Button>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 sm:mb-6 space-y-4 lg:space-y-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary-text font-serif">
                    {assignment.title}
                  </h1>
                  <Badge variant={getStatusBadgeVariant(deadlineStatus)} className="mt-2 sm:mt-0 self-start">
                    {assignment.submissionType}
                  </Badge>
                </div>
                <p className="text-base sm:text-lg text-brand-secondary-text mb-4">
                  {assignment.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-brand-secondary-text">
                  <span>📚 {assignment.course.title}</span>
                  <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  <span className="hidden sm:inline">📝 {assignment._count.submissions} submissions</span>
                </div>
              </div>
              
              {existingSubmission && (
                <div className="flex-shrink-0">
                  <Badge 
                    variant={existingSubmission.status === 'late' ? 'warning' : 'success'}
                  >
                    {existingSubmission.status === 'submitted' ? '✓ Submitted' : 
                     existingSubmission.status === 'late' ? '⚠ Late' : 
                     existingSubmission.status === 'reviewed' ? '✓ Reviewed' : 
                     existingSubmission.status}
                  </Badge>
                </div>
              )}
            </div>

            {deadlineStatus === 'overdue' && !existingSubmission && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm sm:text-base">
                    This assignment is overdue. Submissions will be marked as late.
                  </p>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Existing Submission */}
        {existingSubmission && (
          <SlideUp>
            <Card className="mb-6 sm:mb-8">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-brand-primary-text font-serif mb-4">
                  Your Submission
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-brand-secondary-text font-medium sm:font-normal">Submitted:</span>
                    <span className="text-brand-primary-text text-sm sm:text-base">
                      {new Date(existingSubmission.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-brand-secondary-text font-medium sm:font-normal">Type:</span>
                    <span className="text-brand-primary-text capitalize">
                      {existingSubmission.submissionType}
                    </span>
                  </div>
                  
                  {existingSubmission.fileUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-brand-secondary-text font-medium sm:font-normal">File:</span>
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => window.open(existingSubmission.fileUrl, '_blank')}
                        className="text-brand-accent hover:text-brand-accent mt-1 sm:mt-0 self-start sm:self-auto"
                      >
                        View File
                      </Button>
                    </div>
                  )}
                  
                  {existingSubmission.linkUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-brand-secondary-text font-medium sm:font-normal">Link:</span>
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => window.open(existingSubmission.linkUrl, '_blank')}
                        className="text-brand-accent hover:text-brand-accent mt-1 sm:mt-0 self-start sm:self-auto"
                      >
                        Open Link
                      </Button>
                    </div>
                  )}
                  
                  {existingSubmission.feedback && existingSubmission.feedback.length > 0 && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-brand-accent border-opacity-20">
                      <h4 className="text-sm sm:text-base font-semibold text-brand-primary-text font-serif mb-3">
                        Instructor Feedback
                      </h4>
                      {existingSubmission.feedback.map((feedback) => (
                        <div key={feedback.id} className="bg-brand-primary-bg rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <span className="text-sm font-medium text-brand-primary-text">
                              {feedback.instructor.firstName} {feedback.instructor.lastName}
                            </span>
                            <span className="text-xs sm:text-sm text-brand-secondary-text">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-brand-secondary-text text-sm sm:text-base">{feedback.comment}</p>
                          {feedback.rating && (
                            <div className="mt-2">
                              <span className="text-sm text-brand-secondary-text">Rating: </span>
                              <span className="text-brand-accent font-medium">
                                {feedback.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </SlideUp>
        )}

        {/* Submission Form */}
        {!existingSubmission && (
          <SlideUp>
            <Card>
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-brand-primary-text font-serif mb-4 sm:mb-6">
                  Submit Assignment
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Submission Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-brand-primary-text mb-3">
                      Submission Type
                    </label>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="file"
                          checked={submissionType === 'file'}
                          onChange={(e) => setSubmissionType(e.target.value as 'file' | 'link')}
                          className="mr-2 text-brand-accent focus:ring-brand-accent"
                          disabled={assignment.submissionType !== 'file' && assignment.submissionType !== submissionType}
                        />
                        <span className="text-brand-primary-text">File Upload</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="link"
                          checked={submissionType === 'link'}
                          onChange={(e) => setSubmissionType(e.target.value as 'file' | 'link')}
                          className="mr-2 text-brand-accent focus:ring-brand-accent"
                          disabled={assignment.submissionType !== 'link' && assignment.submissionType !== submissionType}
                        />
                        <span className="text-brand-primary-text">Link Submission</span>
                      </label>
                    </div>
                  </div>

                  {/* File Upload */}
                  {submissionType === 'file' && (
                    <FileUpload
                      label="Upload your assignment file"
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      onFileSelect={setSelectedFiles}
                      error={formErrors.file}
                      helperText="Accepted formats: PDF, DOC, DOCX, TXT, ZIP, RAR"
                      fullWidth
                    />
                  )}

                  {/* Link Input */}
                  {submissionType === 'link' && (
                    <Input
                      label="Assignment Link"
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com/your-assignment"
                      error={formErrors.link}
                      helperText="Enter the URL to your assignment (e.g., Google Drive, GitHub, etc.)"
                      fullWidth
                    />
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBackToCourse}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto"
                    >
                      {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </SlideUp>
        )}

        {/* Submission Success Modal */}
        <Modal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          title="Assignment Submitted!"
        >
          <div className="text-center py-4">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-primary-text mb-2 font-serif">
              Successfully Submitted!
            </h3>
            <p className="text-brand-secondary-text mb-6">
              Your assignment has been submitted successfully. You'll receive feedback from your instructor soon.
            </p>
            <div className="flex space-x-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => setShowSubmissionModal(false)}
              >
                View Submission
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

export default AssignmentView;