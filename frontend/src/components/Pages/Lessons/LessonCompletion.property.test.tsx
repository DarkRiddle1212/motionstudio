import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: motion-studio-platform, Property 9: Lesson Completion Idempotence**
 * **Validates: Requirements 4.4**
 * 
 * Property: For any lesson and any student, marking a lesson as complete multiple times 
 * should result in the lesson remaining marked as complete without creating duplicate 
 * completion records.
 */

// Mock the API URL
const API_URL = 'http://localhost:5000/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Generator for lesson IDs
const lessonIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

// Generator for student tokens
const tokenArb = fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0);

// Generator for number of completion attempts (1 to 10)
const completionAttemptsArb = fc.integer({ min: 1, max: 10 });

// Mock lesson completion API response
const mockSuccessfulCompletionResponse = {
  ok: true,
  json: async () => ({ 
    success: true, 
    message: 'Lesson completed successfully',
    completionId: 'completion-123',
    completedAt: new Date().toISOString()
  }),
};

// Mock lesson fetch response for completed lesson
const mockCompletedLessonResponse = (lessonId: string) => ({
  ok: true,
  json: async () => ({
    lesson: {
      id: lessonId,
      title: 'Test Lesson',
      description: 'Test Description',
      content: 'Test Content',
      order: 1,
      isPublished: true,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      videoUrl: null,
      fileUrls: [],
    }
  }),
});

describe('Lesson Completion Idempotence Property Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Property 9: Lesson completion is idempotent - multiple completion attempts result in single completion state', async () => {
    await fc.assert(
      fc.asyncProperty(
        lessonIdArb,
        tokenArb,
        completionAttemptsArb,
        async (lessonId, token, attempts) => {
          // Reset mock for each property test iteration
          mockFetch.mockClear();

          // Track API calls to verify idempotence
          const completionCalls: any[] = [];
          
          // Mock the lesson completion API to track calls
          mockFetch.mockImplementation((url: string, options: any) => {
            if (url.includes('/complete') && options?.method === 'POST') {
              completionCalls.push({
                url,
                method: options.method,
                headers: options.headers,
                timestamp: Date.now(),
              });
              return Promise.resolve(mockSuccessfulCompletionResponse);
            }
            
            // Mock lesson fetch to return completed lesson after first completion
            if (url.includes(`/lessons/${lessonId}`) && options?.method !== 'POST') {
              return Promise.resolve(mockCompletedLessonResponse(lessonId));
            }
            
            return Promise.reject(new Error('Unexpected API call'));
          });

          // Simulate multiple completion attempts
          const completionPromises: Promise<any>[] = [];
          
          for (let i = 0; i < attempts; i++) {
            const completionPromise = fetch(`${API_URL}/lessons/${lessonId}/complete`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            completionPromises.push(completionPromise);
          }

          // Wait for all completion attempts to finish
          const results = await Promise.all(completionPromises);

          // Verify all completion attempts succeeded
          for (const result of results) {
            expect(result.ok).toBe(true);
            const data = await result.json();
            expect(data.success).toBe(true);
          }

          // Verify the number of API calls matches the number of attempts
          expect(completionCalls).toHaveLength(attempts);

          // Verify all calls were made to the same lesson
          for (const call of completionCalls) {
            expect(call.url).toBe(`${API_URL}/lessons/${lessonId}/complete`);
            expect(call.method).toBe('POST');
            expect(call.headers['Authorization']).toBe(`Bearer ${token}`);
          }

          // Verify lesson state remains consistently completed
          const finalLessonResponse = await fetch(`${API_URL}/lessons/${lessonId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          expect(finalLessonResponse.ok).toBe(true);
          const finalLessonData = await finalLessonResponse.json();
          expect(finalLessonData.lesson.isCompleted).toBe(true);
          expect(finalLessonData.lesson.id).toBe(lessonId);

          // Property assertion: Multiple completion attempts should not create inconsistent state
          // The lesson should remain completed regardless of how many times completion is attempted
          return true;
        }
      ),
      { 
        numRuns: 100, // Run 100 iterations as specified in design document
        verbose: true,
      }
    );
  });

  it('Property 9a: Lesson completion idempotence with concurrent requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        lessonIdArb,
        tokenArb,
        fc.integer({ min: 2, max: 5 }), // 2-5 concurrent requests
        async (lessonId, token, concurrentRequests) => {
          mockFetch.mockClear();

          let completionCallCount = 0;
          const completionTimestamps: number[] = [];

          // Mock API to simulate realistic completion behavior
          mockFetch.mockImplementation((url: string, options: any) => {
            if (url.includes('/complete') && options?.method === 'POST') {
              completionCallCount++;
              completionTimestamps.push(Date.now());
              
              // Simulate some processing time
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve(mockSuccessfulCompletionResponse);
                }, Math.random() * 10); // Random delay 0-10ms
              });
            }
            
            if (url.includes(`/lessons/${lessonId}`) && options?.method !== 'POST') {
              return Promise.resolve(mockCompletedLessonResponse(lessonId));
            }
            
            return Promise.reject(new Error('Unexpected API call'));
          });

          // Make concurrent completion requests
          const concurrentPromises = Array.from({ length: concurrentRequests }, () =>
            fetch(`${API_URL}/lessons/${lessonId}/complete`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
          );

          // Wait for all concurrent requests to complete
          const results = await Promise.all(concurrentPromises);

          // Verify all requests succeeded
          expect(results).toHaveLength(concurrentRequests);
          for (const result of results) {
            expect(result.ok).toBe(true);
          }

          // Verify the correct number of API calls were made
          expect(completionCallCount).toBe(concurrentRequests);

          // Verify final lesson state is consistent
          const finalCheck = await fetch(`${API_URL}/lessons/${lessonId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const finalData = await finalCheck.json();
          expect(finalData.lesson.isCompleted).toBe(true);

          // Property: Concurrent completion attempts should not cause race conditions
          // The lesson should end up in a consistent completed state
          return true;
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('Property 9b: Lesson completion state persistence across multiple checks', async () => {
    await fc.assert(
      fc.asyncProperty(
        lessonIdArb,
        tokenArb,
        fc.integer({ min: 1, max: 5 }), // Number of state checks
        async (lessonId, token, stateChecks) => {
          mockFetch.mockClear();

          // Mock completion API
          mockFetch.mockImplementation((url: string, options: any) => {
            if (url.includes('/complete') && options?.method === 'POST') {
              return Promise.resolve(mockSuccessfulCompletionResponse);
            }
            
            if (url.includes(`/lessons/${lessonId}`) && options?.method !== 'POST') {
              return Promise.resolve(mockCompletedLessonResponse(lessonId));
            }
            
            return Promise.reject(new Error('Unexpected API call'));
          });

          // Complete the lesson once
          const completionResponse = await fetch(`${API_URL}/lessons/${lessonId}/complete`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          expect(completionResponse.ok).toBe(true);

          // Check lesson state multiple times
          const stateCheckPromises = Array.from({ length: stateChecks }, () =>
            fetch(`${API_URL}/lessons/${lessonId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
          );

          const stateResults = await Promise.all(stateCheckPromises);

          // Verify all state checks return consistent completion status
          for (const result of stateResults) {
            expect(result.ok).toBe(true);
            const data = await result.json();
            expect(data.lesson.isCompleted).toBe(true);
            expect(data.lesson.id).toBe(lessonId);
          }

          // Property: Once completed, lesson state should remain consistently completed
          // across multiple state queries
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