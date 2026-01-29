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
    // Mock financial metrics for demo purposes
    const mockMetrics = {
      totalRevenue: 12450.00,
      periodRevenue: 2340.00,
      previousPeriodRevenue: 1890.00,
      revenueChange: 23.81,
      totalTransactions: 156,
      periodTransactions: 28,
      successRate: 94.23,
      averageOrderValue: 124.50,
      refundedAmount: 245.00,
      refundedCount: 3,
      failedCount: 8,
      period: 30,
    };

    return res.json({
      metrics: mockMetrics
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}