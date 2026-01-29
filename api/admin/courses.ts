import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.method === 'GET') {
    // Return mock course data
    return res.json({
      courses: [
        {
          id: '1',
          title: 'Introduction to Motion Design',
          description: 'Learn the basics of motion design and animation',
          isPublished: true,
          pricing: 99.99,
          createdAt: new Date().toISOString(),
          instructor: {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'instructor@example.com',
          },
          _count: {
            enrollments: 15,
            lessons: 8,
            assignments: 3,
          },
        },
        {
          id: '2',
          title: 'Advanced After Effects',
          description: 'Master advanced techniques in After Effects',
          isPublished: false,
          pricing: 149.99,
          createdAt: new Date().toISOString(),
          instructor: {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'instructor@example.com',
          },
          _count: {
            enrollments: 8,
            lessons: 12,
            assignments: 5,
          },
        }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}