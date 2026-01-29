import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ 
    status: 'ok', 
    message: 'Motion Studio Backend is running on Vercel',
    timestamp: new Date().toISOString()
  });
}