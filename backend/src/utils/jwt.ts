import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRY || '7d';
const ADMIN_JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRY || '4h'; // Shorter expiry for admin sessions

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  issuedAt?: number;
  sessionId?: string;
}

export interface AdminJwtPayload extends JwtPayload {
  sessionId: string;
  adminLevel: 'admin' | 'super_admin';
}

export const generateToken = (payload: JwtPayload, isAdmin: boolean = false): string => {
  const tokenPayload = {
    ...payload,
    issuedAt: Math.floor(Date.now() / 1000),
  };

  if (isAdmin) {
    tokenPayload.sessionId = generateSessionId();
  }

  const expiresIn = isAdmin ? ADMIN_JWT_EXPIRES_IN : JWT_EXPIRES_IN;
  return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const generateAdminToken = (payload: AdminJwtPayload): string => {
  const tokenPayload = {
    ...payload,
    issuedAt: Math.floor(Date.now() / 1000),
    sessionId: payload.sessionId || generateSessionId(),
  };

  return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyAdminToken = (token: string): AdminJwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
  
  // Ensure this is actually an admin token by checking for admin-specific fields
  if (!decoded.sessionId || !decoded.adminLevel) {
    throw new Error('Invalid admin token - missing admin fields');
  }
  
  // Ensure the user has admin role
  if (decoded.role !== 'admin') {
    throw new Error('Invalid admin token - insufficient privileges');
  }
  
  // Check if token is expired based on admin session timeout
  if (decoded.issuedAt) {
    const tokenAge = Math.floor(Date.now() / 1000) - decoded.issuedAt;
    const maxAge = parseTimeString(ADMIN_JWT_EXPIRES_IN);
    
    if (tokenAge > maxAge) {
      throw new Error('Admin session expired');
    }
  }
  
  return decoded;
};

export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenRemainingTime = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  } catch (error) {
    return 0;
  }
};

// Helper function to parse time strings like '4h', '30m', '7d'
function parseTimeString(timeStr: string): number {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 3600; // Default to 1 hour
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

