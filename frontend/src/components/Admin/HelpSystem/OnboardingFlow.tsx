import React, { useEffect } from 'react';
import { useHelp } from './HelpProvider';
import { useLocation } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
  route?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Motion Studio Admin Panel',
    content: 'This guided tour will help you understand the key features and navigation of the admin panel.',
    targetSelector: '[data-help-id="admin-dashboard"]',
    route: '/admin',
  },
  {
    id: 'navigation',
    title: 'Navigation Menu',
    content: 'Use this sidebar to navigate between different admin sections. Each section provides specific management tools.',
    targetSelector: 'nav',
    route: '/admin',
  },
  {
    id: 'user-management',
    title: 'User Management',
    content: 'Manage all platform users, including students, instructors, and admins. You can search, edit, and manage user roles here.',
    targetSelector: '[href="/admin/users"]',
    route: '/admin',
  },
  {
    id: 'course-management',
    title: 'Course Management',
    content: 'Oversee all courses on the platform. You can publish, unpublish, and manage course content and enrollments.',
    targetSelector: '[href="/admin/courses"]',
    route: '/admin',
  },
  {
    id: 'financial-dashboard',
    title: 'Financial Dashboard',
    content: 'Monitor payments, revenue, and financial metrics. Process refunds and view transaction details.',
    targetSelector: '[href="/admin/finance"]',
    route: '/admin',
  },
  {
    id: 'help-system',
    title: 'Help System',
    content: 'Click this help button anytime to enter help mode and see contextual tooltips for any feature.',
    targetSelector: '[aria-label="Enter Help Mode"]',
    route: '/admin',
  },
];

const OnboardingFlow: React.FC = () => {
  const {
    showOnboarding,
    setShowOnboarding,
    currentOnboardingStep,
    setCurrentOnboardingStep,
  } = useHelp();
  const location = useLocation();

  const currentStep = onboardingSteps[currentOnboardingStep];

  useEffect(() => {
    // Check if user is new (you might want to store this in localStorage or user preferences)
    const hasSeenOnboarding = localStorage.getItem('admin-onboarding-completed');
    if (!hasSeenOnboarding && location.pathname === '/admin') {
      setShowOnboarding(true);
    }
  }, [location.pathname, setShowOnboarding]);

  const nextStep = () => {
    if (currentOnboardingStep < onboardingSteps.length - 1) {
      setCurrentOnboardingStep(currentOnboardingStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentOnboardingStep > 0) {
      setCurrentOnboardingStep(currentOnboardingStep - 1);
    }
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setCurrentOnboardingStep(0);
    localStorage.setItem('admin-onboarding-completed', 'true');
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  if (!showOnboarding || !currentStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Onboarding Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{currentStep.title}</h3>
            <button
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Skip onboarding"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{currentStep.content}</p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentOnboardingStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {currentOnboardingStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentOnboardingStep === 0}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="space-x-2">
              <button
                onClick={skipOnboarding}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Skip Tour
              </button>
              <button
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {currentOnboardingStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingFlow;