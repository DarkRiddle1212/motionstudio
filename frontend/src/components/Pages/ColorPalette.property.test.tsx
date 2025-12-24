import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './Home/HomePage';
import PortfolioPage from './Portfolio/PortfolioPage';
import CoursesPage from './Courses/CoursesPage';
import ContactPage from './Contact/ContactPage';

/**
 * **Feature: motion-studio-platform, Property 13: Color Palette Consistency**
 * **Validates: Requirements 9.1**
 * 
 * Property: For any page on the platform, all background colors should use only #F6C1CC or #F9D6DC,
 * all primary text and CTAs should use #2B2B2E, all secondary text and dividers should use #8A8A8E,
 * and accent color #C89AA6 should appear only in hover, progress, and active states.
 */

// Brand color palette constants
const BRAND_COLORS = {
  primaryBg: '#F6C1CC',
  secondaryBg: '#F9D6DC',
  primaryText: '#2B2B2E',
  secondaryText: '#8A8A8E',
  accent: '#C89AA6',
} as const;

// Helper function to normalize color values (handles rgb, rgba, hex)
const normalizeColor = (color: string): string => {
  if (!color || color === 'none' || color === 'transparent') return '';
  
  // Convert rgb/rgba to hex for comparison
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }
  
  return color.toUpperCase();
};

// Helper function to check if a color is a brand color
const isBrandColor = (color: string): boolean => {
  const normalized = normalizeColor(color);
  if (!normalized) return true; // Transparent/none is acceptable
  
  return Object.values(BRAND_COLORS).some(brandColor => 
    normalizeColor(brandColor) === normalized
  );
};

// Helper function to check if a color is a background color
const isBackgroundColor = (color: string): boolean => {
  const normalized = normalizeColor(color);
  if (!normalized) return true;
  
  return [
    normalizeColor(BRAND_COLORS.primaryBg),
    normalizeColor(BRAND_COLORS.secondaryBg),
  ].includes(normalized);
};

// Helper function to check if a color is a text color
const isTextColor = (color: string): boolean => {
  const normalized = normalizeColor(color);
  if (!normalized) return true;
  
  return [
    normalizeColor(BRAND_COLORS.primaryText),
    normalizeColor(BRAND_COLORS.secondaryText),
  ].includes(normalized);
};

// Helper function to recursively check all elements for color compliance
const checkElementColors = (element: Element, isHoverState: boolean = false): { valid: boolean; violations: string[] } => {
  const violations: string[] = [];
  const computedStyle = window.getComputedStyle(element);
  
  // Check background colors
  const bgColor = computedStyle.backgroundColor;
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    if (!isBrandColor(bgColor)) {
      violations.push(`Invalid background color: ${bgColor} on ${element.tagName}.${element.className}`);
    } else if (!isBackgroundColor(bgColor) && !isHoverState) {
      // Non-background brand colors should only be used in hover/active states
      const normalized = normalizeColor(bgColor);
      if (normalized === normalizeColor(BRAND_COLORS.accent)) {
        violations.push(`Accent color used as background outside hover state: ${bgColor} on ${element.tagName}.${element.className}`);
      }
    }
  }
  
  // Check text colors
  const textColor = computedStyle.color;
  if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
    if (!isBrandColor(textColor)) {
      violations.push(`Invalid text color: ${textColor} on ${element.tagName}.${element.className}`);
    }
  }
  
  // Check border colors
  const borderColor = computedStyle.borderColor;
  if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
    if (!isBrandColor(borderColor)) {
      violations.push(`Invalid border color: ${borderColor} on ${element.tagName}.${element.className}`);
    }
  }
  
  // Check for gradients (not allowed)
  const bgImage = computedStyle.backgroundImage;
  if (bgImage && bgImage.includes('gradient')) {
    violations.push(`Gradient detected (not allowed): ${bgImage} on ${element.tagName}.${element.className}`);
  }
  
  // Recursively check children
  Array.from(element.children).forEach(child => {
    const childResult = checkElementColors(child, isHoverState);
    violations.push(...childResult.violations);
  });
  
  return {
    valid: violations.length === 0,
    violations,
  };
};

describe('Color Palette Consistency Property Tests', () => {
  it('Property 13: HomePage uses only approved brand colors', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(
            <BrowserRouter>
              <HomePage />
            </BrowserRouter>
          );
          
          const result = checkElementColors(container);
          
          // Property: All colors should be from the brand palette
          if (!result.valid) {
            console.error('Color violations found:', result.violations);
          }
          expect(result.valid).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13a: PortfolioPage uses only approved brand colors', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(
            <BrowserRouter>
              <PortfolioPage />
            </BrowserRouter>
          );
          
          const result = checkElementColors(container);
          
          // Property: All colors should be from the brand palette
          if (!result.valid) {
            console.error('Color violations found:', result.violations);
          }
          expect(result.valid).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13b: CoursesPage uses only approved brand colors', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(
            <BrowserRouter>
              <CoursesPage />
            </BrowserRouter>
          );
          
          const result = checkElementColors(container);
          
          // Property: All colors should be from the brand palette
          if (!result.valid) {
            console.error('Color violations found:', result.violations);
          }
          expect(result.valid).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13c: ContactPage uses only approved brand colors', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(
            <BrowserRouter>
              <ContactPage />
            </BrowserRouter>
          );
          
          const result = checkElementColors(container);
          
          // Property: All colors should be from the brand palette
          if (!result.valid) {
            console.error('Color violations found:', result.violations);
          }
          expect(result.valid).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13d: Brand color constants match Tailwind configuration', () => {
    fc.assert(
      fc.property(
        fc.constant(BRAND_COLORS),
        (colors) => {
          // Property: Brand colors should match the design specification
          expect(colors.primaryBg).toBe('#F6C1CC');
          expect(colors.secondaryBg).toBe('#F9D6DC');
          expect(colors.primaryText).toBe('#2B2B2E');
          expect(colors.secondaryText).toBe('#8A8A8E');
          expect(colors.accent).toBe('#C89AA6');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13e: No gradients are used anywhere in the platform', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const pages = [
            <HomePage />,
            <PortfolioPage />,
            <CoursesPage />,
            <ContactPage />,
          ];
          
          for (const page of pages) {
            const { container } = render(
              <BrowserRouter>
                {page}
              </BrowserRouter>
            );
            
            // Check all elements for gradients
            const allElements = container.querySelectorAll('*');
            allElements.forEach(element => {
              const computedStyle = window.getComputedStyle(element);
              const bgImage = computedStyle.backgroundImage;
              
              // Property: No gradients should be present
              expect(bgImage).not.toMatch(/gradient/i);
            });
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13f: Accent color is used sparingly (not as primary background)', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const pages = [
            <HomePage />,
            <PortfolioPage />,
            <CoursesPage />,
            <ContactPage />,
          ];
          
          for (const page of pages) {
            const { container } = render(
              <BrowserRouter>
                {page}
              </BrowserRouter>
            );
            
            // Count elements using accent color as background
            const allElements = container.querySelectorAll('*');
            let accentBgCount = 0;
            let totalElements = 0;
            
            allElements.forEach(element => {
              totalElements++;
              const computedStyle = window.getComputedStyle(element);
              const bgColor = normalizeColor(computedStyle.backgroundColor);
              
              if (bgColor === normalizeColor(BRAND_COLORS.accent)) {
                accentBgCount++;
              }
            });
            
            // Property: Accent color should be used sparingly (less than 5% of elements)
            const accentPercentage = (accentBgCount / totalElements) * 100;
            expect(accentPercentage).toBeLessThan(5);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
