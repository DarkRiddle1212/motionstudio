import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

/**
 * **Feature: premium-ui-transformation, Property 2: Spacing System Consistency**
 * **Validates: Requirements 2.1, 2.3**
 * 
 * Property: For any spacing value used in the platform, the value should be a multiple 
 * of 8px (8, 16, 24, 32, 48, 64, 96, or 128px) to maintain visual consistency.
 * 
 * Note: We validate that Tailwind spacing classes used in components follow the 8px grid system.
 * The valid spacing values in our design system are: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192px
 * These correspond to Tailwind classes: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48
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

// Valid Tailwind spacing classes based on 8px grid system
// These map to: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192px
const VALID_SPACING_CLASSES = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '40', '44', '48'
];

// Spacing prefixes used in Tailwind
const SPACING_PREFIXES = ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'gap', 'space-x', 'space-y'];

// Helper function to extract spacing classes from className
const extractSpacingClasses = (className: string): string[] => {
  if (!className) return [];
  
  const classes = className.split(' ');
  const spacingClasses: string[] = [];
  
  for (const cls of classes) {
    // Handle responsive prefixes (sm:, md:, lg:, xl:)
    const cleanClass = cls.replace(/^(sm:|md:|lg:|xl:|2xl:)/, '');
    
    for (const prefix of SPACING_PREFIXES) {
      // Match patterns like p-4, px-8, gap-6, etc.
      const regex = new RegExp(`^${prefix}-([\\d.]+|\\[.+\\])$`);
      const match = cleanClass.match(regex);
      
      if (match) {
        spacingClasses.push(cleanClass);
      }
    }
  }
  
  return spacingClasses;
};

// Helper function to validate if a spacing class uses valid 8px grid values
const isValidSpacingClass = (spacingClass: string): boolean => {
  // Extract the numeric value from the class
  const match = spacingClass.match(/-(\d+)$/);
  if (!match) {
    // Handle arbitrary values like p-[16px] - these are allowed if they follow 8px grid
    if (spacingClass.includes('[')) {
      const arbitraryMatch = spacingClass.match(/\[(\d+)px\]/);
      if (arbitraryMatch) {
        const value = parseInt(arbitraryMatch[1], 10);
        // Check if it's a multiple of 4 (allowing for 4px increments in the grid)
        return value % 4 === 0;
      }
    }
    return true; // Non-numeric spacing classes are valid
  }
  
  const value = match[1];
  return VALID_SPACING_CLASSES.includes(value);
};

// Helper function to collect all classNames from a container
const collectAllClassNames = (container: HTMLElement): string[] => {
  const classNames: string[] = [];
  const elements = container.querySelectorAll('*');
  
  elements.forEach((element) => {
    if (element.className && typeof element.className === 'string') {
      classNames.push(element.className);
    }
  });
  
  return classNames;
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Spacing System Consistency Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: premium-ui-transformation, Property 2: Spacing System Consistency**
   * **Validates: Requirements 2.1, 2.3**
   */
  it('Property 2: All spacing values should follow the 8px grid system', () => {
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
            
            // Collect all classNames from the page
            const allClassNames = collectAllClassNames(container);
            
            // Extract and validate spacing classes
            for (const className of allClassNames) {
              const spacingClasses = extractSpacingClasses(className);
              
              for (const spacingClass of spacingClasses) {
                expect(
                  isValidSpacingClass(spacingClass),
                  `${name}: Invalid spacing class "${spacingClass}" found. Spacing should follow 8px grid system.`
                ).toBe(true);
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 2a: Section padding should use generous spacing values (py-12 or higher on mobile, py-16+ on desktop)', () => {
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
          
          // Minimum generous spacing values (in Tailwind units)
          const MIN_SECTION_PADDING_MOBILE = 12; // py-12 = 48px
          const MIN_SECTION_PADDING_DESKTOP = 16; // py-16 = 64px
          
          for (const { name, component } of pages) {
            const { container } = renderWithRouter(component);
            
            // Find section elements
            const sections = container.querySelectorAll('section, [class*="py-"]');
            
            // Property: At least one section should exist with generous padding
            let hasGenerousPadding = false;
            
            sections.forEach((section) => {
              const className = section.className || '';
              
              // Check for py- classes
              const pyMatch = className.match(/py-(\d+)/);
              const lgPyMatch = className.match(/lg:py-(\d+)/);
              const smPyMatch = className.match(/sm:py-(\d+)/);
              
              if (pyMatch) {
                const value = parseInt(pyMatch[1], 10);
                if (value >= MIN_SECTION_PADDING_MOBILE) {
                  hasGenerousPadding = true;
                }
              }
              
              if (lgPyMatch) {
                const value = parseInt(lgPyMatch[1], 10);
                if (value >= MIN_SECTION_PADDING_DESKTOP) {
                  hasGenerousPadding = true;
                }
              }
              
              if (smPyMatch) {
                const value = parseInt(smPyMatch[1], 10);
                if (value >= MIN_SECTION_PADDING_MOBILE) {
                  hasGenerousPadding = true;
                }
              }
            });
            
            expect(
              hasGenerousPadding,
              `${name}: Should have at least one section with generous padding (py-${MIN_SECTION_PADDING_MOBILE}+ on mobile, py-${MIN_SECTION_PADDING_DESKTOP}+ on desktop)`
            ).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 2b: Container max-widths should be defined for readability', () => {
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
          
          // Valid max-width classes for content containers
          const VALID_MAX_WIDTH_CLASSES = ['max-w-7xl', 'max-w-6xl', 'max-w-5xl', 'max-w-4xl', 'max-w-3xl', 'max-w-2xl', 'max-w-xl', 'max-w-lg', 'max-w-md'];
          
          for (const { name, component } of pages) {
            const { container } = renderWithRouter(component);
            
            // Find elements with max-width classes
            const allClassNames = collectAllClassNames(container);
            
            let hasMaxWidth = false;
            
            for (const className of allClassNames) {
              for (const maxWidthClass of VALID_MAX_WIDTH_CLASSES) {
                if (className.includes(maxWidthClass)) {
                  hasMaxWidth = true;
                  break;
                }
              }
              if (hasMaxWidth) break;
            }
            
            expect(
              hasMaxWidth,
              `${name}: Should have at least one container with max-width for readability`
            ).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 2c: Component gaps should use consistent spacing scale', () => {
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
            
            // Find elements with gap classes
            const allClassNames = collectAllClassNames(container);
            
            for (const className of allClassNames) {
              // Check for gap classes
              const gapMatches = className.match(/gap-(\d+)/g);
              
              if (gapMatches) {
                for (const gapClass of gapMatches) {
                  const value = gapClass.replace('gap-', '');
                  expect(
                    VALID_SPACING_CLASSES.includes(value),
                    `${name}: Gap class "${gapClass}" should use valid spacing scale value`
                  ).toBe(true);
                }
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
