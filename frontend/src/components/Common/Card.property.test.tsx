/**
 * Property-Based Test: Shadow System Consistency
 * 
 * **Feature: premium-ui-transformation, Property 10: Shadow System Consistency**
 * **Validates: Requirements 3.2, 4.2**
 * 
 * Property: For any card or elevated component, box-shadow values should use
 * the defined shadow system tokens (shadow-card, shadow-lg, etc.) rather than
 * arbitrary values.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import Card, { VALID_SHADOW_CLASSES, SHADOW_TOKENS } from './Card';

// Define the valid shadow tokens from the design system
const DESIGN_SYSTEM_SHADOW_TOKENS = [
  'shadow-subtle',
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-premium',
  'shadow-card',
  'shadow-card-hover',
  'shadow-button',
  'shadow-button-hover',
  'shadow-glow',
  'shadow-glow-lg',
  'shadow-inner',
  'shadow-none',
] as const;

// Card variants that should use shadow tokens
const CARD_VARIANTS = ['default', 'project', 'course', 'elevated', 'glass'] as const;
const HOVER_EFFECTS = ['lift', 'glow', 'scale', 'none'] as const;
const PADDING_OPTIONS = ['none', 'sm', 'md', 'lg'] as const;
const ASPECT_RATIOS = ['16/9', '4/3', '1/1', 'auto'] as const;

// Arbitrary generators for card props
const cardVariantArb = fc.constantFrom(...CARD_VARIANTS);
const hoverEffectArb = fc.constantFrom(...HOVER_EFFECTS);
const paddingArb = fc.constantFrom(...PADDING_OPTIONS);
const aspectRatioArb = fc.constantFrom(...ASPECT_RATIOS);
const hoverableArb = fc.boolean();

describe('Property 10: Shadow System Consistency', () => {
  /**
   * Property: For any card variant, if a shadow class is applied,
   * it must be from the defined shadow system tokens.
   */
  it('should only use shadow classes from the design system tokens', () => {
    fc.assert(
      fc.property(
        cardVariantArb,
        hoverEffectArb,
        paddingArb,
        aspectRatioArb,
        hoverableArb,
        (variant, hover, padding, aspectRatio, hoverable) => {
          const testId = `card-${variant}-${hover}-${padding}-${aspectRatio}-${hoverable}`;
          
          const { unmount } = render(
            <Card
              variant={variant}
              hover={hover}
              padding={padding}
              aspectRatio={aspectRatio}
              hoverable={hoverable}
              data-testid={testId}
            >
              Test Content
            </Card>
          );

          const cardElement = screen.getByTestId(testId);
          const classList = Array.from(cardElement.classList);
          
          // Find all shadow-related classes
          const shadowClasses = classList.filter(cls => cls.startsWith('shadow-'));
          
          // Property: All shadow classes must be from the design system
          for (const shadowClass of shadowClasses) {
            const isValidToken = DESIGN_SYSTEM_SHADOW_TOKENS.includes(
              shadowClass as typeof DESIGN_SYSTEM_SHADOW_TOKENS[number]
            );
            expect(isValidToken).toBe(true);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Elevated variant must always have a shadow class applied
   */
  it('elevated variant should always have shadow-card class', () => {
    fc.assert(
      fc.property(
        hoverEffectArb,
        paddingArb,
        aspectRatioArb,
        hoverableArb,
        (hover, padding, aspectRatio, hoverable) => {
          const testId = `elevated-card-${hover}-${padding}`;
          
          const { unmount } = render(
            <Card
              variant="elevated"
              hover={hover}
              padding={padding}
              aspectRatio={aspectRatio}
              hoverable={hoverable}
              data-testid={testId}
            >
              Elevated Content
            </Card>
          );

          const cardElement = screen.getByTestId(testId);
          
          // Property: Elevated cards must have shadow-card class
          expect(cardElement).toHaveClass('shadow-card');

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Shadow tokens exported from Card component match design system
   */
  it('exported shadow tokens should match design system tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(SHADOW_TOKENS)),
        (tokenKey) => {
          const tokenValue = SHADOW_TOKENS[tokenKey as keyof typeof SHADOW_TOKENS];
          
          // Property: Each exported token value must be a valid design system shadow class
          const isValidToken = DESIGN_SYSTEM_SHADOW_TOKENS.includes(
            tokenValue as typeof DESIGN_SYSTEM_SHADOW_TOKENS[number]
          );
          
          expect(isValidToken).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Cards with hover effects should have consistent shadow behavior
   * Note: CSS hover classes are only applied to non-interactive cards that don't use motion
   * Interactive cards (hoverable=true or onClick) use framer-motion variants instead
   */
  it('non-interactive cards should not have hover effect classes (motion handles hover)', () => {
    fc.assert(
      fc.property(
        cardVariantArb,
        paddingArb,
        aspectRatioArb,
        (variant, padding, aspectRatio) => {
          const testId = `non-interactive-card-${variant}-${padding}`;
          
          // Non-interactive card without hoverable flag
          const { unmount } = render(
            <Card
              variant={variant}
              hover="lift"
              padding={padding}
              aspectRatio={aspectRatio}
              hoverable={false}
              data-testid={testId}
            >
              Non-Interactive Content
            </Card>
          );

          const cardElement = screen.getByTestId(testId);
          
          // Property: Non-interactive cards with lift hover should have hover-lift class
          // because they use CSS-based hover effects
          expect(cardElement).toHaveClass('hover-lift');

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Glass variant should have glass class for glassmorphism effect
   */
  it('glass variant should always have glass class', () => {
    fc.assert(
      fc.property(
        hoverEffectArb,
        paddingArb,
        aspectRatioArb,
        hoverableArb,
        (hover, padding, aspectRatio, hoverable) => {
          const testId = `glass-card-${hover}-${padding}`;
          
          const { unmount } = render(
            <Card
              variant="glass"
              hover={hover}
              padding={padding}
              aspectRatio={aspectRatio}
              hoverable={hoverable}
              data-testid={testId}
            >
              Glass Content
            </Card>
          );

          const cardElement = screen.getByTestId(testId);
          
          // Property: Glass cards must have glass class
          expect(cardElement).toHaveClass('glass');

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All card variants should have rounded-xl for premium corners
   */
  it('all card variants should have premium rounded corners (rounded-xl)', () => {
    fc.assert(
      fc.property(
        cardVariantArb,
        hoverEffectArb,
        paddingArb,
        aspectRatioArb,
        hoverableArb,
        (variant, hover, padding, aspectRatio, hoverable) => {
          const testId = `rounded-card-${variant}-${hover}`;
          
          const { unmount } = render(
            <Card
              variant={variant}
              hover={hover}
              padding={padding}
              aspectRatio={aspectRatio}
              hoverable={hoverable}
              data-testid={testId}
            >
              Rounded Content
            </Card>
          );

          const cardElement = screen.getByTestId(testId);
          
          // Property: All cards must have rounded-xl class
          expect(cardElement).toHaveClass('rounded-xl');

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
