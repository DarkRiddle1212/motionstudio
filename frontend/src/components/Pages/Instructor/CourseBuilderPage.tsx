import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorCourses } from '../../../hooks/useCourses';
import { Button, Input, Textarea, Card } from '../../Common';
import { FadeIn } from '../../Animation';

export const CourseBuilderPage = () => {
  const navigate = useNavigate();
  const { createCourse } = useInstructorCourses();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    pricing: '0',
    currency: 'USD',
    curriculum: '',
    introVideoUrl: '',
    thumbnailUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (!formData.curriculum.trim()) {
      newErrors.curriculum = 'Curriculum is required';
    }

    const pricing = parseFloat(formData.pricing);
    if (isNaN(pricing) || pricing < 0) {
      newErrors.pricing = 'Pricing must be a valid number (0 for free)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: formData.duration.trim(),
        pricing: parseFloat(formData.pricing),
        currency: formData.currency,
        curriculum: formData.curriculum.trim(),
        introVideoUrl: formData.introVideoUrl.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
      };

      const course = await createCourse(courseData);
      navigate(`/instructor/courses/${course.id}`);
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      {/* Header */}
      <div className="bg-brand-secondary-bg border-b border-brand-secondary-text/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-2">
                  Create New Course
                </h1>
                <p className="text-brand-secondary-text">
                  Fill in the details below to create your course
                </p>
              </div>
              <Button
                variant="tertiary"
                onClick={() => navigate('/instructor/courses')}
                className="self-start sm:self-auto"
              >
                Cancel
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <FadeIn delay={0.2}>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-brand-primary-text mb-4">
                  Basic Information
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Course Title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to Motion Design"
                    error={errors.title}
                    required
                    fullWidth
                  />

                  <Textarea
                    label="Course Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a brief description of what students will learn..."
                    error={errors.description}
                    rows={4}
                    required
                    fullWidth
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Duration"
                      name="duration"
                      type="text"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 4 weeks, 10 hours"
                      error={errors.duration}
                      required
                    />

                    <Input
                      label="Pricing"
                      name="pricing"
                      type="number"
                      value={formData.pricing}
                      onChange={handleChange}
                      placeholder="0 for free course"
                      error={errors.pricing}
                      helperText="Enter 0 for a free course"
                      required
                    />
                  </div>

                  <Input
                    label="Currency"
                    name="currency"
                    type="text"
                    value={formData.currency}
                    onChange={handleChange}
                    placeholder="USD"
                    helperText="e.g., USD, EUR, GBP"
                    fullWidth
                  />
                </div>
              </div>

              {/* Curriculum */}
              <div className="pt-6 border-t border-brand-secondary-text/20">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-brand-primary-text mb-4">
                  Curriculum
                </h2>

                <Textarea
                  label="Course Curriculum"
                  name="curriculum"
                  value={formData.curriculum}
                  onChange={handleChange}
                  placeholder="Outline the course structure, topics covered, and learning objectives..."
                  error={errors.curriculum}
                  rows={8}
                  helperText="Provide a detailed curriculum that students will follow"
                  required
                  fullWidth
                />
              </div>

              {/* Media */}
              <div className="pt-6 border-t border-brand-secondary-text/20">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-brand-primary-text mb-4">
                  Media (Optional)
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Intro Video URL"
                    name="introVideoUrl"
                    type="url"
                    value={formData.introVideoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/video.mp4"
                    helperText="URL to an introductory video for the course"
                    fullWidth
                  />

                  <Input
                    label="Thumbnail URL"
                    name="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    helperText="URL to a course thumbnail image"
                    fullWidth
                  />
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 pt-6 border-t border-brand-secondary-text/20">
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => navigate('/instructor/courses')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Create Course
                </Button>
              </div>
            </form>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};
