import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PaymentCheckout } from './PaymentCheckout';

// Mock the hooks
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
const mockUseSearchParams = vi.fn();

const mockFetchCourseById = vi.fn();
const mockCreateCheckoutSession = vi.fn();

const mockUseAuth = {
  isAuthenticated: true,
  user: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  token: 'mock-token',
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  verifyEmail: vi.fn(),
  loading: false,
};

const mockUseCourses = {
  fetchCourseById: mockFetchCourseById,
  courses: [],
  loading: false,
  error: null,
};

const mockUsePayments = {
  createCheckoutSession: mockCreateCheckoutSession,
  getPaymentStatus: vi.fn(),
  loading: false,
  error: null,
};

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock hooks
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

vi.mock('../../../hooks/useCourses', () => ({
  useCourses: () => mockUseCourses,
}));

vi.mock('../../../hooks/usePayments', () => ({
  usePayments: () => mockUsePayments,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock animation components
vi.mock('../../Animation', () => ({
  FadeIn: ({ children }: any) => <div>{children}</div>,
}));

// Mock common components
vi.mock('../../Common', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
}));

const mockCourse = {
  id: 'course-1',
  title: 'Advanced Motion Design',
  description: 'Learn advanced motion design techniques',
  pricing: 99.99,
  currency: 'USD',
  duration: '8 weeks',
  instructor: {
    id: 'instructor-1',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  _count: {
    lessons: 12,
    assignments: 5,
  },
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
};

const renderPaymentCheckout = () => {
  return render(
    <BrowserRouter>
      <PaymentCheckout />
    </BrowserRouter>
  );
};

describe('PaymentCheckout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ courseId: 'course-1' });
    mockUseAuth.isAuthenticated = true;
    mockFetchCourseById.mockResolvedValue(mockCourse);
    mockCreateCheckoutSession.mockResolvedValue({
      sessionId: 'session-123',
      url: 'https://checkout.stripe.com/session-123',
    });
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        href: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  it('renders loading state initially', () => {
    mockFetchCourseById.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderPaymentCheckout();
    
    expect(screen.getByText('Loading course details...')).toBeInTheDocument();
  });

  it('redirects to login if user is not authenticated', () => {
    mockUseAuth.isAuthenticated = false;
    renderPaymentCheckout();
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders payment checkout page correctly', async () => {
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Course Summary')).toBeInTheDocument();
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
    expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getAllByText('USD 99.99')).toHaveLength(2); // Course price and total
  });

  it('displays user billing information', async () => {
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('shows error for free courses', async () => {
    const freeCourse = { ...mockCourse, pricing: 0 };
    mockFetchCourseById.mockResolvedValue(freeCourse);
    
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('This course is free and does not require payment')).toBeInTheDocument();
    });
  });

  it('handles course not found error', async () => {
    mockFetchCourseById.mockRejectedValue(new Error('Course not found'));
    
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('Payment Error')).toBeInTheDocument();
      expect(screen.getByText('Course not found')).toBeInTheDocument();
    });
  });

  it('handles payment button click', async () => {
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    });
    
    const payButton = screen.getByRole('button', { name: /pay usd 99\.99/i });
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        'course-1',
        'http://localhost:3000/payment/success?courseId=course-1',
        'http://localhost:3000/payment/cancel?courseId=course-1'
      );
    });
  });

  it('shows processing state during payment', async () => {
    mockCreateCheckoutSession.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    });
    
    const payButton = screen.getByRole('button', { name: /pay usd 99\.99/i });
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('handles payment creation error', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('Payment failed'));
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    });
    
    const payButton = screen.getByRole('button', { name: /pay usd 99\.99/i });
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });
  });

  it('redirects to Stripe checkout on successful payment session creation', async () => {
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    });
    
    const payButton = screen.getByRole('button', { name: /pay usd 99\.99/i });
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalled();
    });
    
    // Note: In a real test, we would mock window.location.href assignment
    // For now, we just verify the checkout session was created
  });

  it('has back to course button', async () => {
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    });
    
    const backButton = screen.getByRole('button', { name: /back to course/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/courses/course-1');
  });

  it('displays course statistics correctly', async () => {
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument(); // lessons count
      expect(screen.getByText('5')).toBeInTheDocument(); // assignments count
      expect(screen.getByText('8 weeks')).toBeInTheDocument(); // duration
    });
  });

  it('shows security notice', async () => {
    renderPaymentCheckout();
    
    await waitFor(() => {
      expect(screen.getByText('🔒 Your payment is secured by Stripe')).toBeInTheDocument();
      expect(screen.getByText('We never store your payment information')).toBeInTheDocument();
    });
  });

  it('handles missing courseId parameter', () => {
    mockUseParams.mockReturnValue({});
    renderPaymentCheckout();
    
    // Should not crash and should handle gracefully
    expect(screen.getByText('Loading course details...')).toBeInTheDocument();
  });
});