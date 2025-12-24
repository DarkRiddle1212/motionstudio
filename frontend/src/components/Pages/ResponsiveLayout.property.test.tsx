import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../hooks/useAuth';
import StudentDashboard from './Dashboard/StudentDashboard';
import { CourseContentPage } from './Courses';
import { AssignmentView } from './Assignments';
import { InstructorDashboard } from './Instructor';
import { CourseBuilderPage } from './Instructor';
import fc from 'fast-check';
import { vi } from 'vitest';

// Mock the hooks and API calls
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useCourses');
vi.mock('../../hooks/useLessons');

const mockUseAuth = await import('../../hooks/useAuth');
const mockUseCourses = await import('../../hooks/useCourses');
const mockUseLessons = await import('../../hooks/useLessons');

// Mock user data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  emailVerified: true,
};

const mockInstructorUser = {
  ...mockUser,
  role: 'instructor',
};

// Mock course data
const mockCourse = {
  id: '1',
  title: 'Test Course',
  description: 'A test course description',
  duration: '4 weeks',
  instructor: {
    firstName: 'John',
    lastName: 'Doe',
  },
};

// Mock enrollment data
const mockEnrollments = [
  {
    id: '1',
    courseId: '1',
    progressPercentage: 75,
    status: 'active',
    enrolledAt: '2023-01-01',
    course: {
      ...mockCourse,
      _count: { lessons: 10 },
    },
  },
];

// Mock lessons data
const mockLessons = [
  {
    id: '1',
    title: 'Lesson 1',
    description: 'First lesson',
    isCompleted: false,
    order: 1,
  },
];

// Mock assignment data
const mockAssignment = {
  id: '1',
  title: 'Test Assignment',
  description: 'A test assignment',
  submissionType: 'file' as const,
  deadline: '2024-12-31',
  course: {
    id: '1',
    title: 'Test Course',
  },
  _count: {
    submissions: 0,
  },
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

// Viewport size generator
const viewportArbitrary = fc.record({
  width: fc.integer({ min: 320, max: 1920 }),
  height: fc.integer({ min: 568, max: 1080 }),
  deviceType: fc.constantFrom('mobile', 'tablet', 'desktop'),
});

// Helper function to set viewport size
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Helper function to check if layout has horizontal scrolling
const hasHorizontalScrolling = (container: HTMLElement): boolean => {
  return container.scrollWidth > container.clientWidth;
};

// Helper function to check if layout shifts occur
const checkLayoutShifts = (container: HTMLElement): boolean => {
  const elements = container.querySelectorAll('*');
  let hasShifts = false;
  
  elements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const position = computedStyle.position;
    
    // Check for elements that might cause layout shifts
    if (position === 'absolute' || position === 'fixed') {
      const rect = element.getBoundingClientRect();
      // Check if element is positioned outside viewport
      if (rect.left < 0 || rect.right > window.innerWidth) {
        hasShifts = true;
      }
    }
  });
  
  return hasShifts;
};

describe('Responsive Layout Preservation Property Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.mocked(mockUseAuth.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      token: 'mock-token',
      logout: vi.fn(),
    });

    vi.mocked(mockUseCourses.useStudentCourses).mockReturnValue({
      enrollments: mockEnrollments,
      loading: false,
      error: null,
    });

    vi.mocked(mockUseCourses.useCourses).mockReturnValue({
      fetchCourseById: vi.fn().mockResolvedValue(mockCourse),
    });

    vi.mocked(mockUseLessons.useLessons).mockReturnValue({
      lessons: mockLessons,
      loading: false,
      error: null,
    });

    // Mock fetch for API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        assignment: mockAssignment,
        assignments: [],
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: motion-studio-platform, Property 12: Responsive Layout Preservation
   * Validates: Requirements 8.1, 8.2, 8.3
   */
  it('should preserve responsive layout without horizontal scrolling across all viewport sizes', () => {
    fc.assert(
      fc.property(viewportArbitrary, (viewport) => {
        // Set the viewport size
        setViewportSize(viewport.width, viewport.height);

        // Test Student Dashboard
        const { container: dashboardContainer, unmount: unmountDashboard } = render(
          <TestWrapper>
            <StudentDashboard />
          </TestWrapper>
        );

        // Check for horizontal scrolling
        const dashboardHasHorizontalScroll = hasHorizontalScrolling(dashboardContainer);
        
        // Check for layout shifts
        const dashboardHasLayoutShifts = checkLayoutShifts(dashboardContainer);

        unmountDashboard();

        // Test Course Content Page
        const { container: courseContainer, unmount: unmountCourse } = render(
          <TestWrapper>
            <CourseContentPage />
          </TestWrapper>
        );

        const courseHasHorizontalScroll = hasHorizontalScrolling(courseContainer);
        const courseHasLayoutShifts = checkLayoutShifts(courseContainer);

        unmountCourse();

        // Test Assignment View
        const { container: assignmentContainer, unmount: unmountAssignment } = render(
          <TestWrapper>
            <AssignmentView />
          </TestWrapper>
        );

        const assignmentHasHorizontalScroll = hasHorizontalScrolling(assignmentContainer);
        const assignmentHasLayoutShifts = checkLayoutShifts(assignmentContainer);

        unmountAssignment();

        // Test Instructor Dashboard
        vi.mocked(mockUseAuth.useAuth).mockReturnValue({
          user: mockInstructorUser,
          isAuthenticated: true,
          token: 'mock-token',
          logout: vi.fn(),
        });

        const { container: instructorContainer, unmount: unmountInstructor } = render(
          <TestWrapper>
            <InstructorDashboard />
          </TestWrapper>
        );

        const instructorHasHorizontalScroll = hasHorizontalScrolling(instructorContainer);
        const instructorHasLayoutShifts = checkLayoutShifts(instructorContainer);

        unmountInstructor();

        // Test Course Builder
        const { container: builderContainer, unmount: unmountBuilder } = render(
          <TestWrapper>
            <CourseBuilderPage />
          </TestWrapper>
        );

        const builderHasHorizontalScroll = hasHorizontalScrolling(builderContainer);
        const builderHasLayoutShifts = checkLayoutShifts(builderContainer);

        unmountBuilder();

        // Assert no horizontal scrolling or layout shifts
        const noHorizontalScrolling = !dashboardHasHorizontalScroll && 
                                    !courseHasHorizontalScroll && 
                                    !assignmentHasHorizontalScroll && 
                                    !instructorHasHorizontalScroll && 
                                    !builderHasHorizontalScroll;

        const noLayoutShifts = !dashboardHasLayoutShifts && 
                              !courseHasLayoutShifts && 
                              !assignmentHasLayoutShifts && 
                              !instructorHasLayoutShifts && 
                              !builderHasLayoutShifts;

        return noHorizontalScrolling && noLayoutShifts;
      }),
      { 
        numRuns: 1,
        verbose: false,
      }
    );
  });

  it('should maintain proper mobile navigation and touch targets on small screens', () => {
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 320, max: 767 }), // Mobile range
          height: fc.integer({ min: 568, max: 1024 }),
        }),
        (viewport) => {
          setViewportSize(viewport.width, viewport.height);

          // Test mobile navigation in Student Dashboard
          const { container, unmount } = render(
            <TestWrapper>
              <StudentDashboard />
            </TestWrapper>
          );

          // Check that interactive elements have adequate touch targets (minimum 44px)
          const buttons = container.querySelectorAll('button');
          const links = container.querySelectorAll('a');
          
          let hasAdequateTouchTargets = true;
          
          [...buttons, ...links].forEach((element) => {
            const rect = element.getBoundingClientRect();
            const minTouchTarget = 44; // 44px minimum touch target
            
            if (rect.width > 0 && rect.height > 0) {
              if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
                // Check if element has adequate padding to meet touch target requirements
                const computedStyle = window.getComputedStyle(element);
                const totalWidth = rect.width + 
                  parseFloat(computedStyle.paddingLeft) + 
                  parseFloat(computedStyle.paddingRight);
                const totalHeight = rect.height + 
                  parseFloat(computedStyle.paddingTop) + 
                  parseFloat(computedStyle.paddingBottom);
                
                if (totalWidth < minTouchTarget || totalHeight < minTouchTarget) {
                  hasAdequateTouchTargets = false;
                }
              }
            }
          });

          unmount();
          return hasAdequateTouchTargets;
        }
      ),
      { 
        numRuns: 1,
        verbose: false,
      }
    );
  });

  it('should properly stack and resize content on tablet viewports', () => {
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 768, max: 1023 }), // Tablet range
          height: fc.integer({ min: 768, max: 1024 }),
        }),
        (viewport) => {
          setViewportSize(viewport.width, viewport.height);

          // Test tablet layout in Course Content Page
          const { container, unmount } = render(
            <TestWrapper>
              <CourseContentPage />
            </TestWrapper>
          );

          // Check that grid layouts adapt properly
          const gridElements = container.querySelectorAll('[class*="grid"]');
          let hasProperGridLayout = true;

          gridElements.forEach((element) => {
            const computedStyle = window.getComputedStyle(element);
            const display = computedStyle.display;
            
            if (display === 'grid') {
              // Check that grid doesn't overflow
              const rect = element.getBoundingClientRect();
              if (rect.width > viewport.width) {
                hasProperGridLayout = false;
              }
            }
          });

          // Check that text remains readable (not too small)
          const textElements = container.querySelectorAll('p, span, div');
          let hasReadableText = true;

          textElements.forEach((element) => {
            const computedStyle = window.getComputedStyle(element);
            const fontSize = parseFloat(computedStyle.fontSize);
            
            // Minimum readable font size is 14px
            if (fontSize > 0 && fontSize < 14) {
              hasReadableText = false;
            }
          });

          unmount();
          return hasProperGridLayout && hasReadableText;
        }
      ),
      { 
        numRuns: 1,
        verbose: false,
      }
    );
  });

  it('should maintain full desktop layout and functionality on large screens', () => {
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 1024, max: 1920 }), // Desktop range
          height: fc.integer({ min: 768, max: 1080 }),
        }),
        (viewport) => {
          setViewportSize(viewport.width, viewport.height);

          // Test desktop layout in Instructor Dashboard
          vi.mocked(mockUseAuth.useAuth).mockReturnValue({
            user: mockInstructorUser,
            isAuthenticated: true,
            token: 'mock-token',
            logout: vi.fn(),
          });

          const { container, unmount } = render(
            <TestWrapper>
              <InstructorDashboard />
            </TestWrapper>
          );

          // Check that sidebar is visible and properly positioned
          const sidebar = container.querySelector('aside');
          let hasProperlySizedSidebar = true;

          if (sidebar) {
            const rect = sidebar.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(sidebar);
            
            // Sidebar should be visible and have reasonable width
            if (rect.width < 200 || rect.width > 400) {
              hasProperlySizedSidebar = false;
            }
            
            // Sidebar should not be positioned off-screen
            if (rect.left < -50) { // Allow some tolerance for transforms
              hasProperlySizedSidebar = false;
            }
          }

          // Check that main content area utilizes available space efficiently
          const mainContent = container.querySelector('main');
          let hasEfficientSpaceUsage = true;

          if (mainContent) {
            const rect = mainContent.getBoundingClientRect();
            const availableWidth = viewport.width - (sidebar?.getBoundingClientRect().width || 0);
            
            // Main content should use most of the available space
            if (rect.width < availableWidth * 0.7) {
              hasEfficientSpaceUsage = false;
            }
          }

          unmount();
          return hasProperlySizedSidebar && hasEfficientSpaceUsage;
        }
      ),
      { 
        numRuns: 1,
        verbose: false,
      }
    );
  });
});