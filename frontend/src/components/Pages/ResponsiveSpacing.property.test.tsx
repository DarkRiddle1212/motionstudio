import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

/**
 * **Feature: premium-ui-transformation, Property 9: Responsive Spacing Scaling**
 * **Validates: Requirements 2.4, 7.3**
 * 
 * Property: For any section padding on the platform, spacing should scale proportionally:
 * 100% on desktop (≥1024px), 75% on tablet (768-1023px), and 50% on mobile (<768px).
 * 
 * Note: We validate that responsive spacing classes are properly defined using Tailwind's
 * responsive prefixes (sm:, md:, lg:, xl:) to ensure spacing scales appropriately.
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

// Tailwind spacing value to pixel mapping
const SPACING_TO_PX: Record<string, number> = {
  '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '7': 28,
  '8': 32, '9': 36, '10': 40, '11': 44, '12': 48, '14': 56, '16': 64,
  '18': 72, '20': 80, '24': 96, '28': 112, '32': 128, '36': 144,
  '40': 160, '44': 176, '48': 192
};

// Helper function to extract responsive spacing values from className
interface ResponsiveSpacing {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

const extractResponsiveSpacing = (className: string, prefix: string): ResponsiveSpacing => {
  const result: ResponsiveSpacing = {};
  
  if (!className) return result;
  
  const classes = className.split(' ');
  
  for (const cls of classes) {
    // Base (no prefix)
    const baseMatch = cls.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (baseMatch) {
      result.base = SPACING_TO_PX[baseMatch[1]] || parseInt(baseMatch[1], 10);
    }
    
    // sm: prefix
    const smMatch = cls.match(new RegExp(`^sm:${prefix}-(\\d+)$`));
    if (smMatch) {
      result.sm = SPACING_TO_PX[smMatch[1]] || parseInt(smMatch[1], 10);
    }
    
    // md: prefix
    const mdMatch = cls.match(new RegExp(`^md:${prefix}-(\\d+)$`));
    if (mdMatch) {
      result.md = SPACING_TO_PX[mdMatch[1]] || parseInt(mdMatch[1], 10);
    }
    
    // lg: prefix
    const lgMatch = cls.match(new RegExp(`^lg:${prefix}-(\\d+)$`));
    if (lgMatch) {
      result.lg = SPACING_TO_PX[lgMatch[1]] || parseInt(lgMatch[1], 10);
    }
    
    // xl: prefix
    const xlMatch = cls.match(new RegExp(`^xl:${prefix}-(\\d+)$`));
    if (xlMatch) {
      result.xl = SPACING_TO_PX[xlMatch[1]] || parseInt(xlMatch[1], 10);
    }
  }
  
  return result;
};

// Helper function to check if spacing scales proportionally
const hasProportionalScaling = (spacing: ResponsiveSpacing): boolean => {
  // Get the largest defined value (desktop)
  const desktopValue = spacing.lg || spacing.xl || spacing.md || spacing.sm || spacing.base;
  
  if (!desktopValue) return true; // No spacing defined, skip validation
  
  // Check if mobile value is smaller than desktop (proportional scaling)
  const mobileValue = spacing.base || spacing.sm;
  
  if (mobileValue && desktopValue) {
    // Mobile should be smaller or equal to desktop
    return mobileValue <= desktopValue;
  }
  
  return true;
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

// Helper function to check if responsive prefixes are used
const hasResponsivePrefixes = (className: string): boolean => {
  return /\b(sm:|md:|lg:|xl:)/.test(className);
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Responsive Spacing Scaling Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: premium-ui-transformation, Property 9: Responsive Spacing Scaling**
   * **Validates: Requirements 2.4, 7.3**
   */
  it('Property 9: Section padding should scale proportionally across breakpoints', () => {
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
            
            // Find section elements with padding
            const sections = container.querySelectorAll('section, [class*="py-"]');
            
            sections.forEach((section) => {
              const className = section.className || '';
              
              // Extract responsive padding values
              const pySpacing = extractResponsiveSpacing(className, 'py');
              
              // Check if spacing scales proportionally
              expect(
                hasProportionalScaling(pySpacing),
                `${name}: Section padding should scale proportionally (mobile ≤ desktop). Found: ${JSON.stringify(pySpacing)}`
              ).toBe(true);
            });
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 9a: Pages should use responsive spacing prefixes for adaptive layouts', () => {
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
            
            // Collect all classNames
            const allClassNames = collectAllClassNames(container);
            
            // Check if at least some elements use responsive prefixes
            let hasResponsiveClasses = false;
            
            for (const className of allClassNames) {
              if (hasResponsivePrefixes(className)) {
                hasResponsiveClasses = true;
                break;
              }
            }
            
            expect(
              hasResponsiveClasses,
              `${name}: Should use responsive spacing prefixes (sm:, md:, lg:, xl:) for adaptive layouts`
            ).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 9b: Mobile spacing should be at least 50% of desktop spacing', () => {
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
            
            // Find elements with responsive padding
            const elements = container.querySelectorAll('[class*="py-"]');
            
            elements.forEach((element) => {
              const className = element.className || '';
              const pySpacing = extractResponsiveSpacing(className, 'py');
              
              // Get desktop and mobile values
              const desktopValue = pySpacing.lg || pySpacing.xl || pySpacing.md;
              const mobileValue = pySpacing.base || pySpacing.sm;
              
              if (desktopValue && mobileValue) {
                // Mobile should be at least 50% of desktop
                const ratio = mobileValue / desktopValue;
                expect(
                  ratio >= 0.5,
                  `${name}: Mobile spacing (${mobileValue}px) should be at least 50% of desktop spacing (${desktopValue}px). Ratio: ${(ratio * 100).toFixed(0)}%`
                ).toBe(true);
              }
            });
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 9c: Horizontal padding should scale appropriately for mobile', () => {
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
            
            // Find elements with horizontal padding
            const elements = container.querySelectorAll('[class*="px-"]');
            
            elements.forEach((element) => {
              const className = element.className || '';
              const pxSpacing = extractResponsiveSpacing(className, 'px');
              
              // Check proportional scaling
              expect(
                hasProportionalScaling(pxSpacing),
                `${name}: Horizontal padding should scale proportionally. Found: ${JSON.stringify(pxSpacing)}`
              ).toBe(true);
            });
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 9d: Gap spacing should be consistent across responsive breakpoints', () => {
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
            const elements = container.querySelectorAll('[class*="gap-"]');
            
            elements.forEach((element) => {
              const className = element.className || '';
              const gapSpacing = extractResponsiveSpacing(className, 'gap');
              
              // Check proportional scaling
              expect(
                hasProportionalScaling(gapSpacing),
                `${name}: Gap spacing should scale proportionally. Found: ${JSON.stringify(gapSpacing)}`
              ).toBe(true);
            });
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
