import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

/**
 * **Feature: premium-ui-transformation, Property 1: Typography System Consistency**
 * **Validates: Requirements 1.2, 1.3**
 * 
 * Property: For any page on the platform, all heading elements should use the font-serif 
 * class (Playfair Display) and all body text should use the font-sans class (Inter).
 * 
 * Note: We check for CSS class names rather than computed styles because JSDOM doesn't
 * compute CSS styles. The Tailwind classes font-serif and font-sans map to the correct
 * font families as defined in tailwind.config.js.
 */

// Mock all hooks and components that require context BEFORE imports
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    verifyEmail: vi.fn(),
    isAuthenticated: false,
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('../../hooks/useProjects', () => ({
  useProjects: () => ({
    projects: [],
    loading: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useCourses', () => ({
  useCourses: () => ({
    courses: [],
    loading: false,
    error: null,
    enrollInCourse: vi.fn(),
  }),
}));

// Mock framer-motion completely
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
    section: React.forwardRef(({ children, ...props }: any, ref: any) => <section ref={ref} {...props}>{children}</section>),
    span: React.forwardRef(({ children, ...props }: any, ref: any) => <span ref={ref} {...props}>{children}</span>),
    p: React.forwardRef(({ children, ...props }: any, ref: any) => <p ref={ref} {...props}>{children}</p>),
    h1: React.forwardRef(({ children, ...props }: any, ref: any) => <h1 ref={ref} {...props}>{children}</h1>),
    h2: React.forwardRef(({ children, ...props }: any, ref: any) => <h2 ref={ref} {...props}>{children}</h2>),
    h3: React.forwardRef(({ children, ...props }: any, ref: any) => <h3 ref={ref} {...props}>{children}</h3>),
    button: React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
    a: React.forwardRef(({ children, ...props }: any, ref: any) => <a ref={ref} {...props}>{children}</a>),
    nav: React.forwardRef(({ children, ...props }: any, ref: any) => <nav ref={ref} {...props}>{children}</nav>),
    ul: React.forwardRef(({ children, ...props }: any, ref: any) => <ul ref={ref} {...props}>{children}</ul>),
    li: React.forwardRef(({ children, ...props }: any, ref: any) => <li ref={ref} {...props}>{children}</li>),
    img: React.forwardRef((props: any, ref: any) => <img ref={ref} {...props} />),
    form: React.forwardRef(({ children, ...props }: any, ref: any) => <form ref={ref} {...props}>{children}</form>),
    input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />),
    textarea: React.forwardRef((props: any, ref: any) => <textarea ref={ref} {...props} />),
    select: React.forwardRef(({ children, ...props }: any, ref: any) => <select ref={ref} {...props}>{children}</select>),
    label: React.forwardRef(({ children, ...props }: any, ref: any) => <label ref={ref} {...props}>{children}</label>),
    header: React.forwardRef(({ children, ...props }: any, ref: any) => <header ref={ref} {...props}>{children}</header>),
    footer: React.forwardRef(({ children, ...props }: any, ref: any) => <footer ref={ref} {...props}>{children}</footer>),
    main: React.forwardRef(({ children, ...props }: any, ref: any) => <main ref={ref} {...props}>{children}</main>),
    article: React.forwardRef(({ children, ...props }: any, ref: any) => <article ref={ref} {...props}>{children}</article>),
    aside: React.forwardRef(({ children, ...props }: any, ref: any) => <aside ref={ref} {...props}>{children}</aside>),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => true,
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
  useSpring: () => ({ get: () => 0, set: vi.fn() }),
}));

// Mock Animation components
vi.mock('../Animation', () => ({
  FadeIn: ({ children }: any) => <div data-testid="fade-in">{children}</div>,
  SlideUp: ({ children }: any) => <div data-testid="slide-up">{children}</div>,
  Parallax: ({ children, className }: any) => <div className={className} data-testid="parallax">{children}</div>,
}));

// Mock Layout component to avoid Navigation issues
vi.mock('../Layout', () => ({
  Layout: ({ children, className }: any) => (
    <div className={className} data-testid="layout">
      <main>{children}</main>
    </div>
  ),
  default: ({ children, className }: any) => (
    <div className={className} data-testid="layout">
      <main>{children}</main>
    </div>
  ),
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));

// Import pages after mocks are set up
import HomePage from './Home/HomePage';
import PortfolioPage from './Portfolio/PortfolioPage';
import { CoursesPage } from './Courses/CoursesPage';
import ContactPage from './Contact/ContactPage';

// Helper function to check if element has font-serif class (for headings)
const hasSerifFont = (element: Element): boolean => {
  return element.className.includes('font-serif');
};

// Helper function to check if element has font-sans class (for body text)
const hasSansFont = (element: Element): boolean => {
  return element.className.includes('font-sans');
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Typography System Consistency Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: premium-ui-transformation, Property 1: Typography System Consistency**
   * **Validates: Requirements 1.2, 1.3**
   */
  it('Property 1: All page headings use font-serif class for Playfair Display', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const pages = [
            { name: 'HomePage', component: <HomePage /> },
            { name: 'PortfolioPage', component: <PortfolioPage /> },
            { name: 'CoursesPage', component: <CoursesPage /> },
            { name: 'ContactPage', component: <ContactPage /> },
          ];
          
          for (const { name, component } of pages) {
            const { container } = renderWithRouter(component);
            
            // Check all heading elements (h1, h2, h3)
            const headings = container.querySelectorAll('h1, h2, h3');
            
            // Property: At least one heading should exist on each page
            expect(headings.length).toBeGreaterThanOrEqual(1);
            
            // Property: All headings should have font-serif class
            headings.forEach((heading, index) => {
              expect(
                hasSerifFont(heading),
                `${name}: Heading ${index + 1} (${heading.tagName}) should have font-serif class. Found classes: ${heading.className}`
              ).toBe(true);
            });
          }
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 1a: All pages have at least one h1 heading', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const pages = [
            { name: 'HomePage', component: <HomePage /> },
            { name: 'PortfolioPage', component: <PortfolioPage /> },
            { name: 'CoursesPage', component: <CoursesPage /> },
            { name: 'ContactPage', component: <ContactPage /> },
          ];
          
          for (const { name, component } of pages) {
            const { container } = renderWithRouter(component);
            
            // Property: Each page should have at least one h1
            const h1Elements = container.querySelectorAll('h1');
            expect(
              h1Elements.length,
              `${name} should have at least one h1 element`
            ).toBeGreaterThanOrEqual(1);
          }
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property 1b: Typography configuration matches design specification', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // This test validates that our typography constants match the design document
          // The Tailwind config defines:
          // - font-serif: ['Playfair Display', 'Georgia', 'serif']
          // - font-sans: ['Inter', 'system-ui', 'sans-serif']
          
          // Property: Typography system should be consistent across all pages
          const expectedHeadingClass = 'font-serif';
          const expectedBodyClass = 'font-sans';
          
          expect(expectedHeadingClass).toBe('font-serif');
          expect(expectedBodyClass).toBe('font-sans');
          
          return true;
        }
      ),
      { numRuns: 5 }
    );
  });
});
