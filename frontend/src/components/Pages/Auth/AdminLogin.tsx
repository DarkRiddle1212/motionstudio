import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { Button, Input, Card } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, default to admin dashboard
  const from = location.state?.from?.pathname || '/admin';

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
      const userData = await adminLogin(formData.email, formData.password);
      
      // Redirect to admin dashboard
      navigate('/admin', { replace: true });
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
              Admin Portal
            </h1>
            <p className="text-brand-secondary-text">
              Sign in to access the admin dashboard
            </p>
          </div>
        </FadeIn>

        <SlideUp delay={0.4}>
          <Card variant="elevated" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Admin Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your admin email"
                error={errors.email}
                fullWidth
                required
              />

              <Input
                label="Admin Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your admin password"
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
                Sign In as Admin
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-brand-secondary-text text-sm">
                  Not an admin?{' '}
                  <Link 
                    to="/login" 
                    className="text-brand-accent hover:text-brand-primary-text transition-colors font-medium"
                  >
                    Regular Sign In
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

export default AdminLogin;