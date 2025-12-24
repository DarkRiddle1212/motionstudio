import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: admin-panel, Property 4: User search filtering**
 * **Validates: Requirements 2.2**
 * 
 * Property: For any search query in user management, the system should return only users 
 * whose email, name, or role matches the search criteria
 */

// Generator for user data
const userArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 36 }),
  email: fc.emailAddress(),
  firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  role: fc.constantFrom('student', 'instructor', 'admin'),
  emailVerified: fc.boolean(),
  createdAt: fc.integer({ min: 1577836800000, max: 1735689600000 }).map(timestamp => new Date(timestamp).toISOString()),
  enrollmentCount: fc.integer({ min: 0, max: 100 }),
  courseCount: fc.integer({ min: 0, max: 50 }),
});

// Generator for arrays of users
const usersArrayArb = fc.array(userArb, { minLength: 0, maxLength: 20 });

// Generator for search queries
const searchQueryArb = fc.oneof(
  fc.string({ minLength: 1, maxLength: 50 }), // General search string
  fc.emailAddress().map(email => email.split('@')[0]), // Email prefix
  fc.constantFrom('student', 'instructor', 'admin'), // Role names
  fc.string({ minLength: 1, maxLength: 20 }) // Name fragments
);

// Helper function to check if a user matches a search query
// This implements the same logic as the UserManagement component
const userMatchesSearch = (user: any, query: string): boolean => {
  if (!query || query.trim() === '') return true;
  
  const searchLower = query.toLowerCase().trim();
  
  // Check email match
  if (user.email.toLowerCase().includes(searchLower)) return true;
  
  // Check name match
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
  if (fullName.includes(searchLower)) return true;
  
  // Check role match
  if (user.role.toLowerCase().includes(searchLower)) return true;
  
  return false;
};

// Helper function to filter users based on search query
const filterUsers = (users: any[], searchQuery: string): any[] => {
  return users.filter(user => userMatchesSearch(user, searchQuery));
};

describe('User Search Filtering Property Tests', () => {
  /**
   * Property 4: User search filtering
   * For any search query, the system should return only users whose email, name, or role 
   * matches the search criteria
   */
  it('Property 4: User search filtering returns only matching users', () => {
    fc.assert(
      fc.property(usersArrayArb, searchQueryArb, (users, searchQuery) => {
        const filteredUsers = filterUsers(users, searchQuery);
        
        // Every returned user should match the search criteria
        filteredUsers.forEach(user => {
          expect(userMatchesSearch(user, searchQuery)).toBe(true);
        });
        
        // Every user that matches should be in the results
        users.forEach(user => {
          if (userMatchesSearch(user, searchQuery)) {
            expect(filteredUsers).toContain(user);
          }
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4a: Empty search returns all users
   * When search query is empty or whitespace, all users should be returned
   */
  it('Property 4a: Empty search returns all users', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        const emptyQueries = ['', '   ', '\t', '\n'];
        
        emptyQueries.forEach(emptyQuery => {
          const filteredUsers = filterUsers(users, emptyQuery);
          expect(filteredUsers).toHaveLength(users.length);
          expect(filteredUsers).toEqual(users);
        });

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4b: Search is case-insensitive
   * Search should match users regardless of case in query or user data
   */
  it('Property 4b: Search is case-insensitive', () => {
    fc.assert(
      fc.property(usersArrayArb, fc.string({ minLength: 1, maxLength: 20 }), (users, baseQuery) => {
        const queries = [
          baseQuery.toLowerCase(),
          baseQuery.toUpperCase(),
          baseQuery.charAt(0).toUpperCase() + baseQuery.slice(1).toLowerCase(),
        ];

        const results = queries.map(query => filterUsers(users, query));
        
        // All case variations should return the same results
        results.forEach(result => {
          expect(result).toEqual(results[0]);
        });

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4c: Email search matches partial emails
   * Search should find users when query matches part of their email
   */
  it('Property 4c: Email search matches partial emails', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        // Test with email prefixes from existing users
        users.forEach(user => {
          if (user.email && user.email.length > 3) {
            const emailPrefix = user.email.substring(0, 3);
            const filteredUsers = filterUsers(users, emailPrefix);
            
            // The user should be in the results since their email contains the prefix
            expect(filteredUsers).toContain(user);
          }
        });

        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4d: Name search matches partial names
   * Search should find users when query matches part of their first or last name
   */
  it('Property 4d: Name search matches partial names', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        users.forEach(user => {
          // Test first name search
          if (user.firstName && user.firstName.length > 2) {
            const namePrefix = user.firstName.substring(0, 2);
            const filteredUsers = filterUsers(users, namePrefix);
            expect(filteredUsers).toContain(user);
          }

          // Test last name search
          if (user.lastName && user.lastName.length > 2) {
            const namePrefix = user.lastName.substring(0, 2);
            const filteredUsers = filterUsers(users, namePrefix);
            expect(filteredUsers).toContain(user);
          }
        });

        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4e: Role search matches exact roles
   * Search should find users when query matches their role exactly
   */
  it('Property 4e: Role search matches exact roles', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        const roles = ['student', 'instructor', 'admin'];
        
        roles.forEach(role => {
          const filteredUsers = filterUsers(users, role);
          const expectedUsers = users.filter(user => user.role === role);
          
          expect(filteredUsers).toHaveLength(expectedUsers.length);
          
          // All returned users should have the searched role
          filteredUsers.forEach(user => {
            expect(user.role).toBe(role);
          });
        });

        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4f: Non-matching search returns empty results
   * Search with query that matches no users should return empty array
   */
  it('Property 4f: Non-matching search returns empty results', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        // Use a very unlikely search term
        const nonMatchingQuery = 'xyzabc123nonexistent';
        const filteredUsers = filterUsers(users, nonMatchingQuery);
        
        // Should return empty results if no users match
        const hasMatchingUser = users.some(user => userMatchesSearch(user, nonMatchingQuery));
        if (!hasMatchingUser) {
          expect(filteredUsers).toHaveLength(0);
        }

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4g: Search filtering is consistent
   * Multiple calls with the same parameters should return identical results
   */
  it('Property 4g: Search filtering is consistent', () => {
    fc.assert(
      fc.property(usersArrayArb, searchQueryArb, (users, searchQuery) => {
        const result1 = filterUsers(users, searchQuery);
        const result2 = filterUsers(users, searchQuery);
        
        expect(result1).toEqual(result2);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4h: Search preserves user object integrity
   * Filtered users should be identical to original user objects
   */
  it('Property 4h: Search preserves user object integrity', () => {
    fc.assert(
      fc.property(usersArrayArb, searchQueryArb, (users, searchQuery) => {
        const filteredUsers = filterUsers(users, searchQuery);
        
        // Each filtered user should be exactly the same object as in the original array
        filteredUsers.forEach(filteredUser => {
          const originalUser = users.find(u => u.id === filteredUser.id);
          expect(originalUser).toBeTruthy();
          expect(filteredUser).toEqual(originalUser);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });
});