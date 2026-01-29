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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock session status for demo purposes
    return res.json({
      valid: true,
      user: {
        id: 'hardcoded-admin-' + Date.now(),
        email: 'bolaowoade8@gmail.com',
        role: 'admin',
        adminLevel: 'super_admin',
        sessionId: 'session-' + Date.now(),
      },
      sessionWarning: false,
      sessionRemaining: 14400, // 4 hours in seconds
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}