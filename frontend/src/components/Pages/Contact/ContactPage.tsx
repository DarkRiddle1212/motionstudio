import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FadeIn, SlideUp } from '../../Animation';
import { Layout } from '../../Layout';
import { Button, Input, Textarea } from '../../Common';
import { staggerContainerVariants, slideUpVariants } from '../../../utils/animationVariants';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ProjectInquiryData {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
}

const ContactPage = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState<'contact' | 'project'>('contact');
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [projectForm, setProjectForm] = useState<ProjectInquiryData>({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const projectTypes = [
    { value: 'brand-animation', label: 'Brand Animation' },
    { value: 'explainer-video', label: 'Explainer Video' },
    { value: 'ui-animation', label: 'UI Animation' },
    { value: 'logo-animation', label: 'Logo Animation' },
    { value: 'social-media', label: 'Social Media Content' },
    { value: 'other', label: 'Other' }
  ];

  const budgetRanges = [
    { value: 'under-5k', label: 'Under $5,000' },
    { value: '5k-10k', label: '$5,000 - $10,000' },
    { value: '10k-25k', label: '$10,000 - $25,000' },
    { value: '25k-50k', label: '$25,000 - $50,000' },
    { value: 'over-50k', label: 'Over $50,000' }
  ];

  const timelines = [
    { value: 'asap', label: 'ASAP' },
    { value: '1-2-weeks', label: '1-2 weeks' },
    { value: '1-month', label: '1 month' },
    { value: '2-3-months', label: '2-3 months' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const validateContactForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactForm.name.trim() || contactForm.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!contactForm.email.trim() || !/\S+@\S+\.\S+/.test(contactForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!contactForm.subject.trim() || contactForm.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }
    if (!contactForm.message.trim() || contactForm.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProjectForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectForm.name.trim() || projectForm.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!projectForm.email.trim() || !/\S+@\S+\.\S+/.test(projectForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!projectForm.projectType) {
      newErrors.projectType = 'Please select a project type';
    }
    if (!projectForm.budget) {
      newErrors.budget = 'Please select a budget range';
    }
    if (!projectForm.timeline) {
      newErrors.timeline = 'Please select a timeline';
    }
    if (!projectForm.description.trim() || projectForm.description.length < 20) {
      newErrors.description = 'Project description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContactForm()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch(`${API_URL}/contact/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({ type: 'success', text: data.message });
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitMessage({ type: 'error', text: data.message || 'Failed to submit form' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProjectForm()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch(`${API_URL}/contact/project-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({ type: 'success', text: data.message });
        setProjectForm({
          name: '',
          email: '',
          company: '',
          projectType: '',
          budget: '',
          timeline: '',
          description: ''
        });
      } else {
        setSubmitMessage({ type: 'error', text: data.message || 'Failed to submit inquiry' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Failed to submit inquiry. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout className="bg-brand-primary-bg">
      {/* Hero Section */}
      <section className="relative bg-gradient-premium-subtle section-spacing">
        <div className="container-premium">
          <FadeIn>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-brand-primary-text mb-4 sm:mb-6 leading-tight">
                Get in Touch
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-brand-secondary-text max-w-3xl mx-auto leading-relaxed px-4">
                Ready to bring your vision to life or start your motion design journey? We'd love to hear from you.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-spacing">
        <div className="container-narrow">
          {/* Form Toggle */}
          <FadeIn>
            <div className="flex justify-center mb-12 sm:mb-16 lg:mb-20">
              <div className="bg-brand-secondary-bg rounded-lg p-1 sm:p-2 flex w-full sm:w-auto">
                <button
                  onClick={() => setActiveForm('contact')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-300 text-sm sm:text-base flex-1 sm:flex-none ${
                    activeForm === 'contact'
                      ? 'bg-brand-primary-text text-brand-primary-bg'
                      : 'text-brand-primary-text hover:bg-brand-accent hover:text-white'
                  }`}
                  data-testid="contact-form-tab"
                >
                  General Contact
                </button>
                <button
                  onClick={() => setActiveForm('project')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-300 text-sm sm:text-base flex-1 sm:flex-none ${
                    activeForm === 'project'
                      ? 'bg-brand-primary-text text-brand-primary-bg'
                      : 'text-brand-primary-text hover:bg-brand-accent hover:text-white'
                  }`}
                  data-testid="project-inquiry-tab"
                >
                  Project Inquiry
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Submit Message */}
          {submitMessage && (
            <SlideUp>
              <div className={`mb-6 sm:mb-8 p-4 rounded-lg ${
                submitMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`} data-testid="submit-message">
                {submitMessage.text}
              </div>
            </SlideUp>
          )}

          {/* Contact Form */}
          {activeForm === 'contact' && (
            <motion.div
              key="contact-form"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <SlideUp>
                <div className="card-modern p-6 sm:p-8 md:p-12">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary-text mb-6 sm:mb-8 text-center">
                    Send us a Message
                  </h2>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6" data-testid="contact-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <Input
                        label="Name *"
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        error={errors.name}
                        fullWidth
                        data-testid="contact-name"
                      />
                      <Input
                        label="Email *"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        error={errors.email}
                        fullWidth
                        data-testid="contact-email"
                      />
                    </div>
                    
                    <Input
                      label="Subject *"
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      error={errors.subject}
                      fullWidth
                      data-testid="contact-subject"
                    />
                    
                    <Textarea
                      label="Message *"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      error={errors.message}
                      fullWidth
                      rows={6}
                      placeholder="Tell us about your inquiry..."
                      data-testid="contact-message"
                    />
                    
                    <div className="text-center">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        className="w-full sm:w-auto"
                        data-testid="contact-submit"
                      >
                        Send Message
                      </Button>
                    </div>
                  </form>
                </div>
              </SlideUp>
            </motion.div>
          )}

          {/* Project Inquiry Form */}
          {activeForm === 'project' && (
            <motion.div
              key="project-form"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <SlideUp>
                <div className="card-modern p-6 sm:p-8 md:p-12">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary-text mb-6 sm:mb-8 text-center">
                    Tell us About Your Project
                  </h2>
                  
                  <form onSubmit={handleProjectSubmit} className="space-y-4 sm:space-y-6" data-testid="project-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <Input
                        label="Name *"
                        type="text"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        error={errors.name}
                        fullWidth
                        data-testid="project-name"
                      />
                      <Input
                        label="Email *"
                        type="email"
                        value={projectForm.email}
                        onChange={(e) => setProjectForm({ ...projectForm, email: e.target.value })}
                        error={errors.email}
                        fullWidth
                        data-testid="project-email"
                      />
                    </div>
                    
                    <Input
                      label="Company (Optional)"
                      type="text"
                      value={projectForm.company}
                      onChange={(e) => setProjectForm({ ...projectForm, company: e.target.value })}
                      fullWidth
                      data-testid="project-company"
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-brand-primary-text mb-2">
                          Project Type *
                        </label>
                        <select
                          value={projectForm.projectType}
                          onChange={(e) => setProjectForm({ ...projectForm, projectType: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg font-sans text-brand-primary-text bg-brand-primary-bg placeholder-brand-secondary-text transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent border-brand-accent border-opacity-30 hover:border-opacity-50 text-sm sm:text-base"
                          data-testid="project-type"
                        >
                          <option value="">Select type...</option>
                          {projectTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {errors.projectType && (
                          <p className="mt-1 text-sm text-red-600">{errors.projectType}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-brand-primary-text mb-2">
                          Budget Range *
                        </label>
                        <select
                          value={projectForm.budget}
                          onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg font-sans text-brand-primary-text bg-brand-primary-bg placeholder-brand-secondary-text transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent border-brand-accent border-opacity-30 hover:border-opacity-50 text-sm sm:text-base"
                          data-testid="project-budget"
                        >
                          <option value="">Select budget...</option>
                          {budgetRanges.map((budget) => (
                            <option key={budget.value} value={budget.value}>
                              {budget.label}
                            </option>
                          ))}
                        </select>
                        {errors.budget && (
                          <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                        )}
                      </div>
                      
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-brand-primary-text mb-2">
                          Timeline *
                        </label>
                        <select
                          value={projectForm.timeline}
                          onChange={(e) => setProjectForm({ ...projectForm, timeline: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg font-sans text-brand-primary-text bg-brand-primary-bg placeholder-brand-secondary-text transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent border-brand-accent border-opacity-30 hover:border-opacity-50 text-sm sm:text-base"
                          data-testid="project-timeline"
                        >
                          <option value="">Select timeline...</option>
                          {timelines.map((timeline) => (
                            <option key={timeline.value} value={timeline.value}>
                              {timeline.label}
                            </option>
                          ))}
                        </select>
                        {errors.timeline && (
                          <p className="mt-1 text-sm text-red-600">{errors.timeline}</p>
                        )}
                      </div>
                    </div>
                    
                    <Textarea
                      label="Project Description *"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      error={errors.description}
                      fullWidth
                      rows={6}
                      placeholder="Tell us about your project goals, target audience, style preferences, and any specific requirements..."
                      data-testid="project-description"
                    />
                    
                    <div className="text-center">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        className="w-full sm:w-auto"
                        data-testid="project-submit"
                      >
                        Submit Project Inquiry
                      </Button>
                    </div>
                  </form>
                </div>
              </SlideUp>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-spacing bg-brand-secondary-bg">
        <div className="container-premium">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-3 sm:mb-4">
                Other Ways to Reach Us
              </h2>
              <p className="text-base sm:text-lg text-brand-secondary-text max-w-2xl mx-auto px-4">
                Prefer a different way to get in touch? Here are some alternatives
              </p>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            <motion.div
              variants={slideUpVariants}
              className="card-modern p-6 sm:p-8 text-center"
              data-testid="contact-info-email"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-brand-primary-text mb-3 sm:mb-4">
                Email Us
              </h3>
              <p className="text-brand-secondary-text mb-3 sm:mb-4 text-sm sm:text-base">
                For general inquiries and support
              </p>
              <a
                href="mailto:hello@motionstudio.com"
                className="text-brand-accent hover:text-brand-primary-text transition-colors duration-300 text-sm sm:text-base break-all"
              >
                hello@motionstudio.com
              </a>
            </motion.div>

            <motion.div
              variants={slideUpVariants}
              className="card-modern p-6 sm:p-8 text-center"
              data-testid="contact-info-projects"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-brand-primary-text mb-3 sm:mb-4">
                Project Inquiries
              </h3>
              <p className="text-brand-secondary-text mb-3 sm:mb-4 text-sm sm:text-base">
                For motion design project discussions
              </p>
              <a
                href="mailto:projects@motionstudio.com"
                className="text-brand-accent hover:text-brand-primary-text transition-colors duration-300 text-sm sm:text-base break-all"
              >
                projects@motionstudio.com
              </a>
            </motion.div>

            <motion.div
              variants={slideUpVariants}
              className="card-modern p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1"
              data-testid="contact-info-response"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-brand-primary-text mb-3 sm:mb-4">
                Response Time
              </h3>
              <p className="text-brand-secondary-text mb-3 sm:mb-4 text-sm sm:text-base">
                We typically respond within
              </p>
              <p className="text-brand-accent font-semibold text-sm sm:text-base">
                24-48 hours
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="container-narrow text-center">
          <FadeIn>
            <div className="card-modern p-8 sm:p-12 lg:p-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-4 sm:mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-base sm:text-lg text-brand-secondary-text mb-6 sm:mb-8 max-w-2xl mx-auto">
                Whether you're looking for professional motion design services or want to learn 
                the craft yourself, we're here to help you succeed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/portfolio')}
                  className="w-full sm:w-auto"
                  data-testid="portfolio-cta"
                >
                  View Our Work
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/courses')}
                  className="w-full sm:w-auto"
                  data-testid="courses-cta"
                >
                  Explore Courses
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;