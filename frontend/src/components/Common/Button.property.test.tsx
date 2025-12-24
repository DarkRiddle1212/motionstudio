import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import Button from './Button';

/**
 * **Feature: premium-ui-transformation, Property 5: Touch Target Accessibility**
 * **Validates: Requirements 7.2**
 * 
 * Property: For any interactive element on mobile viewports, the minimum touch target 
 * size should be 44x44 pixels to ensure accessibility compliance.
 */

// Generator for button variants
const variantArb = fc.constantFrom('primary', 'secondary', 'tertiary', 'ghost') as fc.Arbitrary<'primary' | 'secondary' | 'tertiary' | 'ghost'>;

// Generator for button sizes
const sizeArb = fc.constantFrom('sm', 'md', 'lg', 'xl') as fc.Arbitrary<'sm' | 'md' | 'lg' | 'xl'>;

// Generator for button content
const contentArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);

// Generator for boolean props
const boolArb = fc.boolean();

// Minimum touch target size in pixels (WCAG 2.1 AAA recommends 44x44)
const MIN_TOUCH_TARGET_SIZE = 44;

describe('Touch Target Accessibility Property Tests', () => {
  describe('Property 5: Touch Target Accessibility', () => {
    /**
     * Property 5a: All button sizes have minimum 44px height
     * For any button size and variant, the computed min-height should be at least 44px
     */
    it('Property 5a: All button sizes have minimum 44px height', () => {
      fc.assert(
        fc.property(variantArb, sizeArb, contentArb, (variant, size, content) => {
          const { container } = render(
            <Button variant={variant} size={size}>
              {content}
            </Button>
          );
          
          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Check that min-height class is applied
          const minHeightClasses = ['min-h-[44px]', 'min-h-[48px]', 'min-h-[52px]', 'min-h-[56px]'];
          const hasMinHeight = minHeightClasses.some(cls => button?.className.includes(cls));
          expect(hasMinHeight).toBe(true);
          
          // Verify the specific min-height based on size
          const expectedMinHeights: Record<string, string> = {
            sm: 'min-h-[44px]',
            md: 'min-h-[48px]',
            lg: 'min-h-[52px]',
            xl: 'min-h-[56px]'
          };
          
          expect(button?.className).toContain(expectedMinHeights[size]);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5b: All button sizes have minimum 44px width
     * For any button size and variant, the computed min-width should be at least 44px
     */
    it('Property 5b: All button sizes have minimum 44px width', () => {
      fc.assert(
        fc.property(variantArb, sizeArb, contentArb, (variant, size, content) => {
          const { container } = render(
            <Button variant={variant} size={size}>
              {content}
            </Button>
          );
          
          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Check that min-width class is applied
          const minWidthClasses = ['min-w-[44px]', 'min-w-[48px]', 'min-w-[52px]', 'min-w-[56px]'];
          const hasMinWidth = minWidthClasses.some(cls => button?.className.includes(cls));
          expect(hasMinWidth).toBe(true);
          
          // Verify the specific min-width based on size
          const expectedMinWidths: Record<string, string> = {
            sm: 'min-w-[44px]',
            md: 'min-w-[48px]',
            lg: 'min-w-[52px]',
            xl: 'min-w-[56px]'
          };
          
          expect(button?.className).toContain(expectedMinWidths[size]);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5c: Touch targets meet minimum size regardless of button state
     * For any button in any state (loading, disabled), touch targets should still meet minimum size
     */
    it('Property 5c: Touch targets meet minimum size regardless of button state', () => {
      fc.assert(
        fc.property(variantArb, sizeArb, contentArb, boolArb, boolArb, (variant, size, content, isLoading, isDisabled) => {
          const { container } = render(
            <Button 
              variant={variant} 
              size={size} 
              isLoading={isLoading}
              disabled={isDisabled}
            >
              {content}
            </Button>
          );
          
          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Even in loading or disabled state, min-height should be present
          const minHeightClasses = ['min-h-[44px]', 'min-h-[48px]', 'min-h-[52px]', 'min-h-[56px]'];
          const hasMinHeight = minHeightClasses.some(cls => button?.className.includes(cls));
          expect(hasMinHeight).toBe(true);
          
          // Even in loading or disabled state, min-width should be present
          const minWidthClasses = ['min-w-[44px]', 'min-w-[48px]', 'min-w-[52px]', 'min-w-[56px]'];
          const hasMinWidth = minWidthClasses.some(cls => button?.className.includes(cls));
          expect(hasMinWidth).toBe(true);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5d: Smallest button size meets WCAG minimum
     * The smallest button size (sm) should have exactly 44px minimum dimensions
     */
    it('Property 5d: Smallest button size meets WCAG minimum of 44px', () => {
      fc.assert(
        fc.property(variantArb, contentArb, (variant, content) => {
          const { container } = render(
            <Button variant={variant} size="sm">
              {content}
            </Button>
          );
          
          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Small size should have exactly 44px minimum (the WCAG minimum)
          expect(button?.className).toContain('min-h-[44px]');
          expect(button?.className).toContain('min-w-[44px]');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5e: Larger sizes exceed minimum touch target
     * For sizes larger than sm, touch targets should exceed the 44px minimum
     */
    it('Property 5e: Larger sizes exceed minimum touch target', () => {
      const largerSizeArb = fc.constantFrom('md', 'lg', 'xl') as fc.Arbitrary<'md' | 'lg' | 'xl'>;
      
      fc.assert(
        fc.property(variantArb, largerSizeArb, contentArb, (variant, size, content) => {
          const { container } = render(
            <Button variant={variant} size={size}>
              {content}
            </Button>
          );
          
          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Extract the min-height value from class
          const className = button?.className || '';
          const minHeightMatch = className.match(/min-h-\[(\d+)px\]/);
          
          expect(minHeightMatch).toBeTruthy();
          if (minHeightMatch) {
            const minHeight = parseInt(minHeightMatch[1], 10);
            // Larger sizes should exceed the 44px minimum
            expect(minHeight).toBeGreaterThan(MIN_TOUCH_TARGET_SIZE);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5f: Full width buttons maintain minimum height
     * For any full-width button, the minimum height should still be maintained
     */
    it('Property 5f: Full width buttons maintain minimum height', () => {
      fc.assert(
        fc.property(variantArb, sizeArb, contentArb, (variant, size, content) => {
          const { container } = render(
            <Button variant={variant} size={size} fullWidth>
              {content}
            </Button>
          );
          
          const button = container.querySelector('button');
          expect(button).toBeTruthy();
          
          // Full width should be applied
          expect(button?.className).toContain('w-full');
          
          // Min-height should still be present
          const minHeightClasses = ['min-h-[44px]', 'min-h-[48px]', 'min-h-[52px]', 'min-h-[56px]'];
          const hasMinHeight = minHeightClasses.some(cls => button?.className.includes(cls));
          expect(hasMinHeight).toBe(true);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5g: Icon buttons maintain touch target size
     * For any button with icons, the minimum touch target should be maintained
     */
    it('Property 5g: Icon buttons maintain touch target size', () => {
      const iconArb = fc.constantFrom(
        <span>→</span>,
        <span>←</span>,
        <span>✓</span>,
        <span>×</span>
      );
      
      fc.assert(
        fc.property(variantArb, sizeArb, contentArb, iconArb, iconArb, boolArb, boolArb, 
          (variant, size, content, leftIcon, rightIcon, hasLeft, hasRight) => {
            const { container } = render(
              <Button 
                variant={variant} 
                size={size}
                leftIcon={hasLeft ? leftIcon : undefined}
                rightIcon={hasRight ? rightIcon : undefined}
              >
                {content}
              </Button>
            );
            
            const button = container.querySelector('button');
            expect(button).toBeTruthy();
            
            // Min dimensions should still be present with icons
            const minHeightClasses = ['min-h-[44px]', 'min-h-[48px]', 'min-h-[52px]', 'min-h-[56px]'];
            const hasMinHeight = minHeightClasses.some(cls => button?.className.includes(cls));
            expect(hasMinHeight).toBe(true);
            
            const minWidthClasses = ['min-w-[44px]', 'min-w-[48px]', 'min-w-[52px]', 'min-w-[56px]'];
            const hasMinWidth = minWidthClasses.some(cls => button?.className.includes(cls));
            expect(hasMinWidth).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
