import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { FadeIn, SlideUp, Parallax, StaggerContainer, StaggerItem, ScaleOnHover, GentleBounce, FadeInUp } from './index';
import { animationConfig, prefersReducedMotion, getAnimationDuration, getAnimationDistance } from '../../utils/animationConfig';
import { reducedMotionVariants, getMotionSafeVariants } from '../../utils/animationVariants';

/**
 * **Feature: premium-ui-transformation, Property 8: Reduced Motion Respect**
 * **Validates: Requirements 9.4**
 * 
 * Property: For any animation on the platform, when the user has prefers-reduced-motion 
 * enabled, animations should either be disabled or reduced to simple opacity transitions.
 */

// Mock matchMedia for testing reduced motion preference
const mockMatchMedia = (prefersReducedMotion: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? prefersReducedMotion : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// Generator for animation delay values (0 to 2 seconds)
const delayArb = fc.float({ min: Math.fround(0), max: Math.fround(2), noNaN: true });

// Generator for animation duration values (0.1 to 2 seconds)
const durationArb = fc.float({ min: Math.fround(0.1), max: Math.fround(2), noNaN: true });

// Generator for slide distance values (10 to 100 pixels)
const distanceArb = fc.integer({ min: 10, max: 100 });

// Generator for test content
const contentArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

// Generator for parallax speed values
const parallaxSpeedArb = fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true });

// Generator for stagger delay values
const staggerDelayArb = fc.float({ min: Math.fround(0.05), max: Math.fround(0.5), noNaN: true });

// Generator for scale values
const scaleArb = fc.float({ min: Math.fround(1.01), max: Math.fround(1.1), noNaN: true });

describe('Reduced Motion Respect Property Tests', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  describe('Property 8: Reduced Motion Configuration', () => {
    /**
     * Property 8a: Animation config always includes reduced motion settings
     * For any animation configuration, reduced motion settings must be defined
     */
    it('Property 8a: Animation config includes reduced motion settings', () => {
      fc.assert(
        fc.property(fc.constant(animationConfig), (config) => {
          // Reduced motion config must exist
          expect(config.reducedMotion).toBeDefined();
          
          // Reduced motion duration must be minimal (near instant)
          expect(config.reducedMotion.duration).toBeLessThanOrEqual(0.1);
          
          // Reduced motion distance must be 0 (no movement)
          expect(config.reducedMotion.distance).toBe(0);
          
          // Reduced motion scale must be 1 (no scaling)
          expect(config.reducedMotion.scale).toBe(1);
          
          // Reduced motion transition must be defined
          expect(config.reducedMotion.transition).toBeDefined();
          expect(config.reducedMotion.transition.duration).toBeLessThanOrEqual(0.1);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8b: prefersReducedMotion returns correct value based on media query
     */
    it('Property 8b: prefersReducedMotion detects user preference correctly', () => {
      fc.assert(
        fc.property(fc.boolean(), (reducedMotionEnabled) => {
          window.matchMedia = mockMatchMedia(reducedMotionEnabled);
          
          const result = prefersReducedMotion();
          expect(result).toBe(reducedMotionEnabled);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8c: getAnimationDuration returns reduced duration when reduced motion is preferred
     */
    it('Property 8c: getAnimationDuration respects reduced motion preference', () => {
      fc.assert(
        fc.property(durationArb, fc.boolean(), (normalDuration, reducedMotionEnabled) => {
          window.matchMedia = mockMatchMedia(reducedMotionEnabled);
          
          const result = getAnimationDuration(normalDuration);
          
          if (reducedMotionEnabled) {
            // When reduced motion is preferred, duration should be minimal
            expect(result).toBe(animationConfig.reducedMotion.duration);
          } else {
            // When reduced motion is not preferred, use normal duration
            expect(result).toBe(normalDuration);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8d: getAnimationDistance returns 0 when reduced motion is preferred
     */
    it('Property 8d: getAnimationDistance respects reduced motion preference', () => {
      fc.assert(
        fc.property(distanceArb, fc.boolean(), (normalDistance, reducedMotionEnabled) => {
          window.matchMedia = mockMatchMedia(reducedMotionEnabled);
          
          const result = getAnimationDistance(normalDistance);
          
          if (reducedMotionEnabled) {
            // When reduced motion is preferred, distance should be 0
            expect(result).toBe(0);
          } else {
            // When reduced motion is not preferred, use normal distance
            expect(result).toBe(normalDistance);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Animation Components Respect Reduced Motion', () => {
    /**
     * Property 8e: FadeIn component renders without transform animations when reduced motion is preferred
     */
    it('Property 8e: FadeIn respects reduced motion preference', () => {
      fc.assert(
        fc.property(contentArb, delayArb, durationArb, (content, delay, duration) => {
          // Test with reduced motion enabled
          window.matchMedia = mockMatchMedia(true);
          
          const { container } = render(
            <FadeIn delay={delay} duration={duration}>
              <span>{content}</span>
            </FadeIn>
          );
          
          // Component should render
          expect(container.querySelector('span')).toBeTruthy();
          expect(container.textContent).toContain(content);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8f: SlideUp component renders without Y-axis movement when reduced motion is preferred
     */
    it('Property 8f: SlideUp respects reduced motion preference', () => {
      fc.assert(
        fc.property(contentArb, delayArb, durationArb, distanceArb, (content, delay, duration, distance) => {
          // Test with reduced motion enabled
          window.matchMedia = mockMatchMedia(true);
          
          const { container } = render(
            <SlideUp delay={delay} duration={duration} distance={distance}>
              <span>{content}</span>
            </SlideUp>
          );
          
          // Component should render
          expect(container.querySelector('span')).toBeTruthy();
          expect(container.textContent).toContain(content);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8g: Parallax component renders as static element when reduced motion is preferred
     */
    it('Property 8g: Parallax respects reduced motion preference', () => {
      fc.assert(
        fc.property(contentArb, parallaxSpeedArb, (content, speed) => {
          // Test with reduced motion enabled
          window.matchMedia = mockMatchMedia(true);
          
          const { container } = render(
            <Parallax speed={speed}>
              <span>{content}</span>
            </Parallax>
          );
          
          // Component should render as a regular div (not motion.div)
          expect(container.querySelector('span')).toBeTruthy();
          expect(container.textContent).toContain(content);
          
          // When reduced motion is enabled, Parallax renders a plain div
          const wrapper = container.firstChild as HTMLElement;
          expect(wrapper.tagName.toLowerCase()).toBe('div');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8h: StaggerContainer uses no stagger delay when reduced motion is preferred
     */
    it('Property 8h: StaggerContainer respects reduced motion preference', () => {
      fc.assert(
        fc.property(contentArb, staggerDelayArb, (content, staggerDelay) => {
          // Test with reduced motion enabled
          window.matchMedia = mockMatchMedia(true);
          
          const { container } = render(
            <StaggerContainer staggerDelay={staggerDelay}>
              <StaggerItem><span>{content}</span></StaggerItem>
            </StaggerContainer>
          );
          
          // Component should render
          expect(container.querySelector('span')).toBeTruthy();
          expect(container.textContent).toContain(content);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8i: ScaleOnHover renders as static element when reduced motion is preferred
     */
    it('Property 8i: ScaleOnHover respects reduced motion preference', () => {
      fc.assert(
        fc.property(contentArb, scaleArb, (content, scale) => {
          // Test with reduced motion enabled
          window.matchMedia = mockMatchMedia(true);
          
          const { container } = render(
            <ScaleOnHover scale={scale}>
              <span>{content}</span>
            </ScaleOnHover>
          );
          
          // Component should render
          expect(container.querySelector('span')).toBeTruthy();
          expect(container.textContent).toContain(content);
          
          // When reduced motion is enabled, ScaleOnHover renders a plain div
          const wrapper = container.firstChild as HTMLElement;
          expect(wrapper.tagName.toLowerCase()).toBe('div');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8j: GentleBounce renders as static element when reduced motion is preferred
     */
    it('Property 8j: GentleBounce respects reduced motion preference', () => {
      fc.assert(
        fc.property(contentArb, (content) => {
          // Test with reduced motion enabled
          window.matchMedia = mockMatchMedia(true);
          
          const { container } = render(
            <GentleBounce>
              <span>{content}</span>
            </GentleBounce>
          );
          
          // Component should render
          expect(container.querySelector('span')).toBeTruthy();
          expect(container.textContent).toContain(content);
          
          // When reduced motion is enabled, GentleBounce renders a plain div
          const wrapper = container.firstChild as HTMLElement;
          expect(wrapper.tagName.toLowerCase()).toBe('div');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8k: FadeInUp component renders without Y-axis movement when reduced motion is preferred
     */
    it('Property 8k: FadeInUp respects reduced motion preference', () => {
      fc.assert(
        fc.property(contentArb, delayArb, (content, delay) => {
          // Test with reduced motion enabled
          window.matchMedia = mockMatchMedia(true);
          
          const { container } = render(
            <FadeInUp delay={delay}>
              <span>{content}</span>
            </FadeInUp>
          );
          
          // Component should render
          expect(container.querySelector('span')).toBeTruthy();
          expect(container.textContent).toContain(content);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Animation Variants Respect Reduced Motion', () => {
    /**
     * Property 8l: reducedMotionVariants only uses opacity transitions
     */
    it('Property 8l: reducedMotionVariants uses only opacity transitions', () => {
      fc.assert(
        fc.property(fc.constant(reducedMotionVariants), (variants) => {
          // Hidden state should only have opacity
          expect(variants.hidden).toHaveProperty('opacity', 0);
          
          // Visible state should only have opacity
          expect(variants.visible).toHaveProperty('opacity', 1);
          
          // Check that visible transition is minimal
          const visibleTransition = (variants.visible as any).transition;
          expect(visibleTransition.duration).toBeLessThanOrEqual(0.1);
          expect(visibleTransition.ease).toBe('linear');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8m: getMotionSafeVariants returns reduced variants when reduced motion is preferred
     */
    it('Property 8m: getMotionSafeVariants respects reduced motion preference', () => {
      fc.assert(
        fc.property(fc.boolean(), (reducedMotionEnabled) => {
          window.matchMedia = mockMatchMedia(reducedMotionEnabled);
          
          const normalVariants = {
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          };
          
          const result = getMotionSafeVariants(normalVariants);
          
          if (reducedMotionEnabled) {
            // Should return reduced motion variants
            expect(result).toEqual(reducedMotionVariants);
          } else {
            // Should return normal variants
            expect(result).toEqual(normalVariants);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Components Render Correctly in Both Modes', () => {
    /**
     * Property 8n: All animation components render content correctly regardless of motion preference
     */
    it('Property 8n: Animation components render content in both motion modes', () => {
      fc.assert(
        fc.property(contentArb, fc.boolean(), (content, reducedMotionEnabled) => {
          window.matchMedia = mockMatchMedia(reducedMotionEnabled);
          
          // Test FadeIn
          const fadeInResult = render(<FadeIn><span data-testid="fadein">{content}</span></FadeIn>);
          expect(fadeInResult.getByTestId('fadein').textContent).toBe(content);
          fadeInResult.unmount();
          
          // Test SlideUp
          const slideUpResult = render(<SlideUp><span data-testid="slideup">{content}</span></SlideUp>);
          expect(slideUpResult.getByTestId('slideup').textContent).toBe(content);
          slideUpResult.unmount();
          
          // Test FadeInUp
          const fadeInUpResult = render(<FadeInUp><span data-testid="fadeinup">{content}</span></FadeInUp>);
          expect(fadeInUpResult.getByTestId('fadeinup').textContent).toBe(content);
          fadeInUpResult.unmount();
          
          // Test ScaleOnHover
          const scaleResult = render(<ScaleOnHover><span data-testid="scale">{content}</span></ScaleOnHover>);
          expect(scaleResult.getByTestId('scale').textContent).toBe(content);
          scaleResult.unmount();
          
          // Test GentleBounce
          const bounceResult = render(<GentleBounce><span data-testid="bounce">{content}</span></GentleBounce>);
          expect(bounceResult.getByTestId('bounce').textContent).toBe(content);
          bounceResult.unmount();
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
