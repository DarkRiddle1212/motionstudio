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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Hardcoded admin credentials (no environment variables needed)
    const hardcodedAdminEmail = 'bolaowoade8@gmail.com';
    const hardcodedAdminPassword = 'Bolaowo@26';
    
    if (email === hardcodedAdminEmail && password === hardcodedAdminPassword) {
      // Generate a simple token (in production, use proper JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      return res.json({
        user: {
          id: 'hardcoded-admin-' + Date.now(),
          email: hardcodedAdminEmail,
          firstName: 'Hardcoded',
          lastName: 'Admin',
          role: 'admin',
          emailVerified: true,
        },
        token,
        sessionId: 'session-' + Date.now(),
        sessionTimeout: 4 * 60 * 60, // 4 hours in seconds
        adminLevel: 'super_admin',
      });
    }

    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}