import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ContactPage from './ContactPage';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactPage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact page with hero section', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText(/Ready to bring your vision to life/)).toBeInTheDocument();
  });

  it('renders form toggle buttons', () => {
    render(<ContactPage />);
    
    expect(screen.getByTestId('contact-form-tab')).toBeInTheDocument();
    expect(screen.getByTestId('project-inquiry-tab')).toBeInTheDocument();
  });

  it('shows contact form by default', () => {
    render(<ContactPage />);
    
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    expect(screen.queryByTestId('project-form')).not.toBeInTheDocument();
  });

  it('switches to project inquiry form when tab is clicked', () => {
    render(<ContactPage />);
    
    fireEvent.click(screen.getByTestId('project-inquiry-tab'));
    
    expect(screen.getByTestId('project-form')).toBeInTheDocument();
    expect(screen.queryByTestId('contact-form')).not.toBeInTheDocument();
  });

  describe('Contact Form', () => {
    it('renders all contact form fields', () => {
      render(<ContactPage />);
      
      expect(screen.getByTestId('contact-name')).toBeInTheDocument();
      expect(screen.getByTestId('contact-email')).toBeInTheDocument();
      expect(screen.getByTestId('contact-subject')).toBeInTheDocument();
      expect(screen.getByTestId('contact-message')).toBeInTheDocument();
      expect(screen.getByTestId('contact-submit')).toBeInTheDocument();
    });

    it('validates required fields on contact form submission', async () => {
      render(<ContactPage />);
      
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        expect(screen.getByText('Subject must be at least 5 characters')).toBeInTheDocument();
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('validates email format in contact form', async () => {
      render(<ContactPage />);
      
      // Fill out all required fields but with invalid email
      fireEvent.change(screen.getByTestId('contact-name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByTestId('contact-email'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByTestId('contact-subject'), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByTestId('contact-message'), {
        target: { value: 'This is a test message' }
      });
      
      // Submit the form to trigger validation
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('submits contact form with valid data', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, message: 'Form submitted successfully' })
      });

      render(<ContactPage />);
      
      fireEvent.change(screen.getByTestId('contact-name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByTestId('contact-email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('contact-subject'), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByTestId('contact-message'), {
        target: { value: 'This is a test message with enough characters' }
      });
      
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/contact/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Test Subject',
            message: 'This is a test message with enough characters'
          }),
        });
      });
    });

    it('displays success message after successful contact form submission', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, message: 'Form submitted successfully' })
      });

      render(<ContactPage />);
      
      // Fill form with valid data
      fireEvent.change(screen.getByTestId('contact-name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByTestId('contact-email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('contact-subject'), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByTestId('contact-message'), {
        target: { value: 'This is a test message with enough characters' }
      });
      
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      await waitFor(() => {
        expect(screen.getByTestId('submit-message')).toBeInTheDocument();
        expect(screen.getByText('Form submitted successfully')).toBeInTheDocument();
      });
    });

    it('displays error message on contact form submission failure', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: false, message: 'Submission failed' })
      });

      render(<ContactPage />);
      
      // Fill form with valid data
      fireEvent.change(screen.getByTestId('contact-name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByTestId('contact-email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('contact-subject'), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByTestId('contact-message'), {
        target: { value: 'This is a test message with enough characters' }
      });
      
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      await waitFor(() => {
        expect(screen.getByTestId('submit-message')).toBeInTheDocument();
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
    });
  });

  describe('Project Inquiry Form', () => {
    beforeEach(() => {
      render(<ContactPage />);
      fireEvent.click(screen.getByTestId('project-inquiry-tab'));
    });

    it('renders all project inquiry form fields', () => {
      expect(screen.getByTestId('project-name')).toBeInTheDocument();
      expect(screen.getByTestId('project-email')).toBeInTheDocument();
      expect(screen.getByTestId('project-company')).toBeInTheDocument();
      expect(screen.getByTestId('project-type')).toBeInTheDocument();
      expect(screen.getByTestId('project-budget')).toBeInTheDocument();
      expect(screen.getByTestId('project-timeline')).toBeInTheDocument();
      expect(screen.getByTestId('project-description')).toBeInTheDocument();
      expect(screen.getByTestId('project-submit')).toBeInTheDocument();
    });

    it('validates required fields on project form submission', async () => {
      fireEvent.click(screen.getByTestId('project-submit'));
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        expect(screen.getByText('Please select a project type')).toBeInTheDocument();
        expect(screen.getByText('Please select a budget range')).toBeInTheDocument();
        expect(screen.getByText('Please select a timeline')).toBeInTheDocument();
        expect(screen.getByText('Project description must be at least 20 characters')).toBeInTheDocument();
      });
    });

    it('validates project description length', async () => {
      fireEvent.change(screen.getByTestId('project-description'), {
        target: { value: 'Too short' }
      });
      fireEvent.click(screen.getByTestId('project-submit'));
      
      await waitFor(() => {
        expect(screen.getByText('Project description must be at least 20 characters')).toBeInTheDocument();
      });
    });

    it('submits project inquiry form with valid data', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, message: 'Project inquiry submitted successfully' })
      });
      
      fireEvent.change(screen.getByTestId('project-name'), {
        target: { value: 'Jane Smith' }
      });
      fireEvent.change(screen.getByTestId('project-email'), {
        target: { value: 'jane@company.com' }
      });
      fireEvent.change(screen.getByTestId('project-company'), {
        target: { value: 'Test Company' }
      });
      fireEvent.change(screen.getByTestId('project-type'), {
        target: { value: 'brand-animation' }
      });
      fireEvent.change(screen.getByTestId('project-budget'), {
        target: { value: '10k-25k' }
      });
      fireEvent.change(screen.getByTestId('project-timeline'), {
        target: { value: '1-month' }
      });
      fireEvent.change(screen.getByTestId('project-description'), {
        target: { value: 'This is a detailed project description with enough characters to pass validation' }
      });
      
      fireEvent.click(screen.getByTestId('project-submit'));
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/contact/project-inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Jane Smith',
            email: 'jane@company.com',
            company: 'Test Company',
            projectType: 'brand-animation',
            budget: '10k-25k',
            timeline: '1-month',
            description: 'This is a detailed project description with enough characters to pass validation'
          }),
        });
      });
    });

    it('displays success message after successful project inquiry submission', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, message: 'Project inquiry submitted successfully' })
      });
      
      // Fill form with valid data
      fireEvent.change(screen.getByTestId('project-name'), {
        target: { value: 'Jane Smith' }
      });
      fireEvent.change(screen.getByTestId('project-email'), {
        target: { value: 'jane@company.com' }
      });
      fireEvent.change(screen.getByTestId('project-type'), {
        target: { value: 'brand-animation' }
      });
      fireEvent.change(screen.getByTestId('project-budget'), {
        target: { value: '10k-25k' }
      });
      fireEvent.change(screen.getByTestId('project-timeline'), {
        target: { value: '1-month' }
      });
      fireEvent.change(screen.getByTestId('project-description'), {
        target: { value: 'This is a detailed project description with enough characters to pass validation' }
      });
      
      fireEvent.click(screen.getByTestId('project-submit'));
      
      await waitFor(() => {
        expect(screen.getByTestId('submit-message')).toBeInTheDocument();
        expect(screen.getByText('Project inquiry submitted successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Contact Information Section', () => {
    it('renders contact information cards', () => {
      render(<ContactPage />);
      
      expect(screen.getByTestId('contact-info-email')).toBeInTheDocument();
      expect(screen.getByTestId('contact-info-projects')).toBeInTheDocument();
      expect(screen.getByTestId('contact-info-response')).toBeInTheDocument();
    });

    it('displays email links', () => {
      render(<ContactPage />);
      
      expect(screen.getByText('hello@motionstudio.com')).toBeInTheDocument();
      expect(screen.getByText('projects@motionstudio.com')).toBeInTheDocument();
    });

    it('displays response time information', () => {
      render(<ContactPage />);
      
      expect(screen.getByText('24-48 hours')).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('renders CTA buttons', () => {
      render(<ContactPage />);
      
      expect(screen.getByTestId('portfolio-cta')).toBeInTheDocument();
      expect(screen.getByTestId('courses-cta')).toBeInTheDocument();
    });

    it('has correct links for CTA buttons', () => {
      render(<ContactPage />);
      
      expect(screen.getByTestId('portfolio-cta')).toHaveAttribute('href', '/portfolio');
      expect(screen.getByTestId('courses-cta')).toHaveAttribute('href', '/courses');
    });
  });

  describe('Form Validation Edge Cases', () => {
    it('validates minimum name length', async () => {
      render(<ContactPage />);
      
      fireEvent.change(screen.getByTestId('contact-name'), {
        target: { value: 'A' }
      });
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('validates minimum subject length', async () => {
      render(<ContactPage />);
      
      fireEvent.change(screen.getByTestId('contact-subject'), {
        target: { value: 'Hi' }
      });
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      await waitFor(() => {
        expect(screen.getByText('Subject must be at least 5 characters')).toBeInTheDocument();
      });
    });

    it('validates minimum message length', async () => {
      render(<ContactPage />);
      
      fireEvent.change(screen.getByTestId('contact-message'), {
        target: { value: 'Short' }
      });
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      await waitFor(() => {
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during contact form submission', async () => {
      mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ContactPage />);
      
      // Fill form with valid data
      fireEvent.change(screen.getByTestId('contact-name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByTestId('contact-email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('contact-subject'), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByTestId('contact-message'), {
        target: { value: 'This is a test message with enough characters' }
      });
      
      fireEvent.click(screen.getByTestId('contact-submit'));
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows loading state during project form submission', async () => {
      mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ContactPage />);
      fireEvent.click(screen.getByTestId('project-inquiry-tab'));
      
      // Fill form with valid data
      fireEvent.change(screen.getByTestId('project-name'), {
        target: { value: 'Jane Smith' }
      });
      fireEvent.change(screen.getByTestId('project-email'), {
        target: { value: 'jane@company.com' }
      });
      fireEvent.change(screen.getByTestId('project-type'), {
        target: { value: 'brand-animation' }
      });
      fireEvent.change(screen.getByTestId('project-budget'), {
        target: { value: '10k-25k' }
      });
      fireEvent.change(screen.getByTestId('project-timeline'), {
        target: { value: '1-month' }
      });
      fireEvent.change(screen.getByTestId('project-description'), {
        target: { value: 'This is a detailed project description with enough characters to pass validation' }
      });
      
      fireEvent.click(screen.getByTestId('project-submit'));
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});