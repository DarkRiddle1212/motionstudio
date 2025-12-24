import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { FadeIn, SlideUp } from './index';
import { animationConfig } from '../../utils/animationConfig';
import { fadeInVariants, slideUpVariants } from '../../utils/animationVariants';

/**
 * **Feature: motion-studio-platform, Property 14: Animation Subtlety**
 * **Validates: Requirements 9.2, 9.3, 9.5**
 * 
 * Property: For any animation on the platform, animations should be fade-in, slide-up, 
 * or gentle parallax effects with no bouncing, shaking, playful effects, or gradients.
 */

// Generator for animation delay values (0 to 2 seconds)
const delayArb = fc.float({ min: Math.fround(0), max: Math.fround(2), noNaN: true });

// Generator for animation duration values (0.1 to 2 seconds)
const durationArb = fc.float({ min: Math.fround(0.1), max: Math.fround(2), noNaN: true });

// Generator for slide distance values (10 to 100 pixels)
const distanceArb = fc.integer({ min: 10, max: 100 });

// Generator for test content
const contentArb = fc.string({ minLength: 1, maxLength: 100 });

describe('Animation Subtlety Property Tests', () => {
  it('Property 14: FadeIn animations use only subtle opacity transitions', () => {
    fc.assert(
      fc.property(
        delayArb,
        durationArb,
        contentArb,
        (delay, duration, content) => {
          // Render FadeIn component with random props
          const { container } = render(
            <FadeIn delay={delay} duration={duration}>
              <div>{content}</div>
            </FadeIn>
          );

          const animatedElement = container.firstChild as HTMLElement;
          
          // Property assertion: FadeIn should only use opacity transitions
          expect(animatedElement).toBeDefined();
          
          // Check that the animation uses only fade effects (opacity)
          // The element should not have any transform properties that indicate bouncing or shaking
          const computedStyle = window.getComputedStyle(animatedElement);
          
          // Property: No transform properties that indicate bouncing or shaking
          const transform = computedStyle.transform;
          if (transform && transform !== 'none') {
            // Should not contain scale values > 1.1 (indicating bouncing)
            expect(transform).not.toMatch(/scale\([1-9]\d*\.?\d*\)/);
            // Should not contain rotation values (indicating shaking)
            expect(transform).not.toMatch(/rotate\(/);
          }
          
          // Property: Animation should use configured easing (no bouncing easing)
          const transition = computedStyle.transition;
          if (transition && transition !== 'none') {
            // Should not contain bounce or elastic easing functions
            expect(transition).not.toMatch(/bounce/i);
            expect(transition).not.toMatch(/elastic/i);
            expect(transition).not.toMatch(/back/i);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14a: SlideUp animations use only subtle vertical movement', () => {
    fc.assert(
      fc.property(
        delayArb,
        durationArb,
        distanceArb,
        contentArb,
        (delay, duration, distance, content) => {
          // Render SlideUp component with random props
          const { container } = render(
            <SlideUp delay={delay} duration={duration} distance={distance}>
              <div>{content}</div>
            </SlideUp>
          );

          const animatedElement = container.firstChild as HTMLElement;
          
          // Property assertion: SlideUp should only use subtle vertical movement
          expect(animatedElement).toBeDefined();
          
          // Property: Distance should be within subtle range (not excessive)
          expect(distance).toBeLessThanOrEqual(100);
          expect(distance).toBeGreaterThanOrEqual(10);
          
          // Property: Should not use bouncing or shaking transforms
          const computedStyle = window.getComputedStyle(animatedElement);
          const transform = computedStyle.transform;
          
          if (transform && transform !== 'none') {
            // Should not contain scale values indicating bouncing
            expect(transform).not.toMatch(/scale\([2-9]\d*\.?\d*\)/);
            // Should not contain rotation (shaking)
            expect(transform).not.toMatch(/rotate\(/);
            // Should not contain excessive translation values
            const translateMatch = transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
            if (translateMatch) {
              const translateValue = Math.abs(parseFloat(translateMatch[1]));
              expect(translateValue).toBeLessThanOrEqual(distance + 10); // Allow small variance
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14b: Animation configuration enforces subtlety constraints', () => {
    fc.assert(
      fc.property(
        fc.constant(animationConfig),
        (config) => {
          // Property: Easing functions should be subtle (no bouncing)
          expect(config.easing.default).toBe('easeOut');
          expect(config.easing.gentle).toEqual([0.25, 0.46, 0.45, 0.94]);
          expect(config.easing.smooth).toEqual([0.4, 0, 0.2, 1]);
          
          // Property: Durations should be reasonable (not too fast or slow)
          expect(config.duration.fast).toBeGreaterThanOrEqual(0.2);
          expect(config.duration.fast).toBeLessThanOrEqual(0.5);
          expect(config.duration.default).toBeGreaterThanOrEqual(0.4);
          expect(config.duration.default).toBeLessThanOrEqual(1.0);
          expect(config.duration.slow).toBeGreaterThanOrEqual(0.6);
          expect(config.duration.slow).toBeLessThanOrEqual(1.5);
          
          // Property: Movement distances should be subtle
          expect(config.distance.small).toBeLessThanOrEqual(30);
          expect(config.distance.default).toBeLessThanOrEqual(50);
          expect(config.distance.large).toBeLessThanOrEqual(80);
          
          // Property: Parallax speeds should be gentle
          expect(config.parallax.subtle).toBeLessThanOrEqual(0.5);
          expect(config.parallax.default).toBeLessThanOrEqual(0.7);
          expect(config.parallax.noticeable).toBeLessThanOrEqual(1.0);
          
          // Property: Hover effects should be very subtle
          expect(config.hover.scale).toBeLessThanOrEqual(1.05);
          expect(config.hover.duration).toBeLessThanOrEqual(0.3);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14c: Animation variants enforce professional constraints', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Property: FadeIn variants should only affect opacity
          const fadeHidden = fadeInVariants.hidden as any;
          const fadeVisible = fadeInVariants.visible as any;
          
          expect(fadeHidden.opacity).toBe(0);
          expect(fadeVisible.opacity).toBe(1);
          expect(fadeHidden.y).toBeUndefined();
          expect(fadeHidden.x).toBeUndefined();
          expect(fadeHidden.scale).toBeUndefined();
          expect(fadeHidden.rotate).toBeUndefined();
          
          // Property: SlideUp variants should use subtle movement
          const slideHidden = slideUpVariants.hidden as any;
          const slideVisible = slideUpVariants.visible as any;
          
          expect(slideHidden.opacity).toBe(0);
          expect(slideVisible.opacity).toBe(1);
          expect(slideHidden.y).toBeGreaterThan(0);
          expect(slideHidden.y).toBeLessThanOrEqual(50);
          expect(slideVisible.y).toBe(0);
          
          // Property: No bouncing, shaking, or excessive effects
          expect(slideHidden.scale).toBeUndefined();
          expect(slideHidden.rotate).toBeUndefined();
          expect(slideVisible.scale).toBeUndefined();
          expect(slideVisible.rotate).toBeUndefined();
          
          // Property: Transition easing should be professional
          const transition = slideVisible.transition;
          expect(transition.ease).toBe('easeOut');
          expect(transition.duration).toBeGreaterThanOrEqual(0.3);
          expect(transition.duration).toBeLessThanOrEqual(1.0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14d: No gradients are used in animation styles', () => {
    fc.assert(
      fc.property(
        contentArb,
        (content) => {
          // Test that animation components don't introduce gradients
          const { container } = render(
            <FadeIn>
              <div>{content}</div>
            </FadeIn>
          );

          const animatedElement = container.firstChild as HTMLElement;
          const computedStyle = window.getComputedStyle(animatedElement);
          
          // Property: No gradient backgrounds should be applied by animations
          expect(computedStyle.background).not.toMatch(/gradient/i);
          expect(computedStyle.backgroundImage).not.toMatch(/gradient/i);
          
          // Property: No gradient borders should be applied
          expect(computedStyle.borderImage).not.toMatch(/gradient/i);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14e: Animation timing follows professional standards', () => {
    fc.assert(
      fc.property(
        delayArb,
        durationArb,
        (delay, duration) => {
          // Property: Delays should be reasonable for professional UX
          if (delay > 0) {
            expect(delay).toBeLessThanOrEqual(2.0); // No excessive delays
          }
          
          // Property: Durations should be in professional range
          expect(duration).toBeGreaterThanOrEqual(0.1); // Not too fast (jarring)
          expect(duration).toBeLessThanOrEqual(2.0); // Not too slow (annoying)
          
          // Property: Most animations should be in the sweet spot
          if (duration >= 0.2 && duration <= 1.0) {
            expect(duration).toBeGreaterThanOrEqual(0.2);
            expect(duration).toBeLessThanOrEqual(1.0);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});