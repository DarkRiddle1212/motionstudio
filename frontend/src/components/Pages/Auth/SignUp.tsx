import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Input, Card } from '../../Common';
import { FadeIn, SlideUp } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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
      await signup(
        formData.email,
        formData.password,
        formData.firstName || undefined,
        formData.lastName || undefined
      );
      setSuccess(true);
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

  if (success) {
    return (
      <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center p-4">
        <FadeIn>
          <Card variant="elevated" className="w-full max-w-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-primary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif text-brand-primary-text mb-2">
                Check Your Email
              </h2>
              <p className="text-brand-secondary-text">
                We've sent a verification link to <strong>{formData.email}</strong>. 
                Please check your email and click the link to verify your account.
              </p>
            </div>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <FadeIn delay={0.2}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-brand-primary-text mb-2">
              Join Motion Design Studio
            </h1>
            <p className="text-brand-secondary-text">
              Create your account to start learning motion design
            </p>
          </div>
        </FadeIn>

        <SlideUp delay={0.4}>
          <Card variant="elevated" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  error={errors.lastName}
                />
              </div>

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
                placeholder="Create a strong password"
                error={errors.password}
                helperText="Must be at least 8 characters with uppercase, lowercase, and numbers"
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
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-brand-secondary-text">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-brand-accent hover:text-brand-primary-text transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </SlideUp>
      </div>
    </div>
  );
};

export default SignUp;