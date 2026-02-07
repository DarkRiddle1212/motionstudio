import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple initialization without API calls
  useEffect(() => {
    console.log('SimpleAuth: Initializing without API calls...');
    
    setTimeout(() => {
      console.log('SimpleAuth: Setting loading to false');
      setLoading(false);
    }, 100); // Very short delay just to test
  }, []);

  const login = async (email: string, password: string) => {
    throw new Error('Login not implemented in simple auth');
  };

  const adminLogin = async (email: string, password: string) => {
    throw new Error('Admin login not implemented in simple auth');
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    throw new Error('Signup not implemented in simple auth');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const verifyEmail = async (verificationToken: string) => {
    throw new Error('Email verification not implemented in simple auth');
  };

  const value = {
    user,
    token,
    loading,
    login,
    adminLogin,
    signup,
    logout,
    verifyEmail,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};