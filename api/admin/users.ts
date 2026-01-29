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

  // Simple auth check (in production, verify JWT token)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.method === 'GET') {
    // Return mock user data for now
    return res.json({
      users: [
        {
          id: '1',
          email: 'student@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'instructor@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'instructor',
          emailVerified: true,
          createdAt: new Date().toISOString(),
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