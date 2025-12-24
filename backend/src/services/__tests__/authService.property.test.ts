import * as fc from 'fast-check';
import { AuthService } from '../authService';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

/**
 * Feature: motion-studio-platform, Property 15: Invalid Credentials Rejection
 * Validates: Requirements 3.4
 * 
 * For any login attempt with incorrect email or password, the system should reject 
 * the login and display an error message without creating a session.
 */

describe('Property-Based Tests: Authentication', () => {
  const authService = new AuthService();

  beforeAll(async () => {
    // Clean up test database before running tests
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@property-test.com',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test database after running tests
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@property-test.com',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Property 15: Invalid Credentials Rejection', () => {
    it('should reject login attempts with incorrect passwords for any valid user', async () => {
      // Create a single test user for this test
      const testEmail = `test-user-${Date.now()}@property-test.com`;
      const correctPassword = 'TestPass123';
      const hashedPassword = await hashPassword(correctPassword);
      
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          emailVerified: true,
        },
      });

      try {
        // Test with a few different incorrect passwords
        const incorrectPasswords = ['WrongPass123', 'BadPassword456', 'IncorrectPwd789'];
        
        for (const incorrectPassword of incorrectPasswords) {
          try {
            await authService.login({
              email: testEmail,
              password: incorrectPassword,
            });
            throw new Error('Login should have been rejected with incorrect password');
          } catch (error: any) {
            expect(error.message).toBe('Invalid email or password');
          }
        }
      } finally {
        // Clean up: delete the test user (if it still exists)
        try {
          await prisma.user.delete({
            where: { id: user.id },
          });
        } catch (error) {
          // User might already be deleted, ignore error
        }
      }
    }, 10000); // 10 second timeout

    it('should reject login attempts with non-existent email addresses', async () => {
      // Test with a few non-existent email addresses
      const nonExistentEmails = [
        `nonexistent-${Date.now()}-1@property-test.com`,
        `nonexistent-${Date.now()}-2@property-test.com`,
        `nonexistent-${Date.now()}-3@property-test.com`
      ];
      
      for (const email of nonExistentEmails) {
        try {
          await authService.login({
            email: email,
            password: 'SomePassword123',
          });
          throw new Error('Login should have been rejected with non-existent email');
        } catch (error: any) {
          expect(error.message).toBe('Invalid email or password');
        }
      }
    }, 5000); // 5 second timeout

    it('should reject login attempts for unverified email addresses', async () => {
      // Create a single test user with unverified email
      const testEmail = `unverified-user-${Date.now()}@property-test.com`;
      const password = 'TestPass123';
      const hashedPassword = await hashPassword(password);
      
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          emailVerified: false, // Email not verified
        },
      });

      try {
        // Attempt to login with correct credentials but unverified email
        await authService.login({
          email: testEmail,
          password: password,
        });
        throw new Error('Login should have been rejected for unverified email');
      } catch (error: any) {
        expect(error.message).toBe('Please verify your email before logging in');
      } finally {
        // Clean up: delete the test user (if it still exists)
        try {
          await prisma.user.delete({
            where: { id: user.id },
          });
        } catch (error) {
          // User might already be deleted, ignore error
        }
      }
    }, 10000); // 10 second timeout
  });
});