import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../Common';
import { FadeIn } from '../../Animation';
import { useAuth } from '../../../hooks/useAuth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now sign in to your account.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    handleVerification();
  }, [token, verifyEmail]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-serif text-brand-primary-text mb-2">
              Verifying Your Email
            </h2>
            <p className="text-brand-secondary-text">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-brand-primary-text mb-2">
              Email Verified!
            </h2>
            <p className="text-brand-secondary-text mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => navigate('/login')}
              >
                Sign In Now
              </Button>
              <Button 
                variant="tertiary" 
                fullWidth 
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-brand-primary-text mb-2">
              Verification Failed
            </h2>
            <p className="text-brand-secondary-text mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => navigate('/signup')}
              >
                Sign Up Again
              </Button>
              <Button 
                variant="tertiary" 
                fullWidth 
                onClick={() => navigate('/login')}
              >
                Try to Sign In
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-brand-primary-text mb-2">
              Motion Design Studio
            </h1>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card variant="elevated" className="p-8">
            {renderContent()}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default VerifyEmail;