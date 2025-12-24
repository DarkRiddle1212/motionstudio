import { prisma } from '../utils/prisma';

// Clean up database before each test
beforeEach(async () => {
  // Clean up test data - be more specific to avoid conflicts with property tests
  // Only clean up non-property test data
  await prisma.user.deleteMany({
    where: {
      AND: [
        {
          email: {
            endsWith: '@test.com'
          }
        },
        {
          email: {
            not: {
              contains: 'property-test'
            }
          }
        }
      ]
    }
  });
});

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});