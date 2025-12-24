import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { Button, Input, Card } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const userData = await login(formData.email, formData.password);
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (from !== '/dashboard') {
        // If user was trying to access a specific page, redirect there
        navigate(from, { replace: true });
      } else {
        // Default redirect for regular users
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <FadeIn delay={0.2}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-brand-primary-text mb-2">
              Welcome Back
            </h1>
            <p className="text-brand-secondary-text">
              Sign in to continue your motion design journey
            </p>
          </div>
        </FadeIn>

        <SlideUp delay={0.4}>
          <Card variant="elevated" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                error={errors.email}
                fullWidth
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                error={errors.password}
                fullWidth
                required
              />

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-brand-accent hover:text-brand-primary-text transition-colors text-sm"
                >
                  Forgot your password?
                </Link>
              </div>
              
              <div className="text-center">
                <p className="text-brand-secondary-text">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="text-brand-accent hover:text-brand-primary-text transition-colors font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </SlideUp>
      </div>
    </div>
  );
};

export default Login;