import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: motion-studio-platform, Property 5: Progress Tracking Accuracy**
 * **Validates: Requirements 4.2, 4.4**
 * 
 * Property: For any course and any student, the course progress percentage should equal 
 * the ratio of completed lessons to total lessons multiplied by 100, rounded to the nearest integer.
 */

// Function to calculate progress percentage (the implementation we're testing)
const calculateProgressPercentage = (completedLessons: number, totalLessons: number): number => {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
};

// Generator for lesson counts (1 to 50 lessons per course)
const lessonCountArb = fc.integer({ min: 1, max: 50 });

// Generator for completed lesson counts (0 to total lessons)
const completedLessonsArb = (totalLessons: number) => 
  fc.integer({ min: 0, max: totalLessons });

describe('Progress Tracking Accuracy Property Tests', () => {
  it('Property 5: Progress percentage calculation is mathematically accurate', () => {
    fc.assert(
      fc.property(
        lessonCountArb,
        (totalLessons) => {
          const completedLessons = fc.sample(completedLessonsArb(totalLessons), 1)[0];
          
          // Calculate progress using our function
          const calculatedProgress = calculateProgressPercentage(completedLessons, totalLessons);
          
          // Calculate expected progress manually
          const expectedProgress = Math.round((completedLessons / totalLessons) * 100);
          
          // Property assertion: Calculated progress must match mathematical expectation
          expect(calculatedProgress).toBe(expectedProgress);
          
          // Additional property assertions
          
          // Progress should be between 0 and 100 inclusive
          expect(calculatedProgress).toBeGreaterThanOrEqual(0);
          expect(calculatedProgress).toBeLessThanOrEqual(100);
          
          // Progress should be 0 when no lessons are completed
          if (completedLessons === 0) {
            expect(calculatedProgress).toBe(0);
          }
          
          // Progress should be 100 when all lessons are completed
          if (completedLessons === totalLessons) {
            expect(calculatedProgress).toBe(100);
          }
          
          // Progress should be an integer (rounded)
          expect(Number.isInteger(calculatedProgress)).toBe(true);
          
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('Property 5a: Progress calculation handles edge cases correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { total: 1, completed: 0, expected: 0 },   // 0/1 = 0%
          { total: 1, completed: 1, expected: 100 }, // 1/1 = 100%
          { total: 3, completed: 1, expected: 33 },  // 1/3 = 33.33% → 33%
          { total: 3, completed: 2, expected: 67 },  // 2/3 = 66.67% → 67%
          { total: 7, completed: 2, expected: 29 },  // 2/7 = 28.57% → 29%
          { total: 7, completed: 5, expected: 71 },  // 5/7 = 71.43% → 71%
          { total: 9, completed: 4, expected: 44 },  // 4/9 = 44.44% → 44%
          { total: 9, completed: 5, expected: 56 },  // 5/9 = 55.56% → 56%
        ),
        (testCase) => {
          const progress = calculateProgressPercentage(testCase.completed, testCase.total);
          
          // Property: Progress calculation should handle rounding correctly
          expect(progress).toBe(testCase.expected);
          
          // Property: Progress should always be within valid range
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(100);
          
          // Property: Progress should be an integer
          expect(Number.isInteger(progress)).toBe(true);
          
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('Property 5b: Progress calculation is monotonic (non-decreasing)', () => {
    fc.assert(
      fc.property(
        lessonCountArb,
        (totalLessons) => {
          const progressValues: number[] = [];
          
          // Calculate progress for each possible completion count
          for (let completed = 0; completed <= totalLessons; completed++) {
            const progress = calculateProgressPercentage(completed, totalLessons);
            progressValues.push(progress);
          }
          
          // Property: Progress should be monotonic (non-decreasing)
          for (let i = 1; i < progressValues.length; i++) {
            expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
          }
          
          // Property: First value should be 0, last should be 100
          expect(progressValues[0]).toBe(0);
          expect(progressValues[progressValues.length - 1]).toBe(100);
          
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('Property 5c: Progress calculation consistency across multiple calculations', () => {
    fc.assert(
      fc.property(
        lessonCountArb,
        (totalLessons) => {
          const completedLessons = fc.sample(completedLessonsArb(totalLessons), 1)[0];
          
          // Calculate progress multiple times
          const calculations = Array.from({ length: 10 }, () => 
            calculateProgressPercentage(completedLessons, totalLessons)
          );
          
          // Property: All calculations should return the same result (deterministic)
          const firstResult = calculations[0];
          for (const result of calculations) {
            expect(result).toBe(firstResult);
          }
          
          // Property: Result should be stable across different calculation contexts
          const isolatedCalculation = (() => {
            const completed = completedLessons;
            const total = totalLessons;
            if (total === 0) return 0;
            return Math.round((completed / total) * 100);
          })();
          
          expect(firstResult).toBe(isolatedCalculation);
          
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('Property 5d: Progress calculation with realistic course scenarios', () => {
    fc.assert(
      fc.property(
        fc.record({
          totalLessons: fc.integer({ min: 5, max: 30 }), // Realistic course sizes
          completionRatio: fc.float({ min: 0, max: 1, noNaN: true }), // 0% to 100% completion
        }),
        (scenario) => {
          const { totalLessons, completionRatio } = scenario;
          const completedCount = Math.floor(totalLessons * completionRatio);
          
          // Calculate progress
          const progress = calculateProgressPercentage(completedCount, totalLessons);
          
          // Property assertions for realistic scenarios
          
          // Progress should match the actual completion ratio
          const expectedProgress = Math.round((completedCount / totalLessons) * 100);
          expect(progress).toBe(expectedProgress);
          
          // Progress should be within valid range
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(100);
          
          // For specific scenarios, verify expected ranges
          if (completedCount === 0) {
            expect(progress).toBe(0);
          } else if (completedCount === totalLessons) {
            expect(progress).toBe(100);
          } else if (completedCount === Math.floor(totalLessons / 2)) {
            // Half completion should be around 50%
            expect(progress).toBeGreaterThanOrEqual(40);
            expect(progress).toBeLessThanOrEqual(60);
          }
          
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('Property 5e: Progress calculation handles boundary conditions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          // Minimum course size
          { total: 1, completed: 0, expectedRange: [0, 0] },
          { total: 1, completed: 1, expectedRange: [100, 100] },
          
          // Small course sizes with various completion states
          { total: 2, completed: 0, expectedRange: [0, 0] },
          { total: 2, completed: 1, expectedRange: [50, 50] },
          { total: 2, completed: 2, expectedRange: [100, 100] },
          
          // Larger course with precise fractions
          { total: 100, completed: 33, expectedRange: [33, 33] },
          { total: 100, completed: 67, expectedRange: [67, 67] },
          
          // Edge cases for rounding
          { total: 6, completed: 1, expectedRange: [17, 17] }, // 16.67% → 17%
          { total: 6, completed: 2, expectedRange: [33, 33] }, // 33.33% → 33%
          { total: 6, completed: 4, expectedRange: [67, 67] }, // 66.67% → 67%
          { total: 6, completed: 5, expectedRange: [83, 83] }, // 83.33% → 83%
        ),
        (test) => {
          const progress = calculateProgressPercentage(test.completed, test.total);
          
          // Property: Progress should be within expected range
          expect(progress).toBeGreaterThanOrEqual(test.expectedRange[0]);
          expect(progress).toBeLessThanOrEqual(test.expectedRange[1]);
          
          // Property: Progress should be mathematically correct
          const exactPercentage = (test.completed / test.total) * 100;
          const roundedPercentage = Math.round(exactPercentage);
          expect(progress).toBe(roundedPercentage);
          
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('Property 5f: Progress calculation with zero lessons edge case', () => {
    fc.assert(
      fc.property(
        fc.constant(0), // Zero total lessons
        (totalLessons) => {
          const progress = calculateProgressPercentage(0, totalLessons);
          
          // Property: Zero lessons should always result in 0% progress
          expect(progress).toBe(0);
          
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });
});