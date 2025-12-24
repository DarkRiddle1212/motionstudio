import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpContextType {
  isHelpMode: boolean;
  toggleHelpMode: () => void;
  showTooltip: (id: string, content: string, position?: TooltipPosition) => void;
  hideTooltip: () => void;
  activeTooltip: {
    id: string;
    content: string;
    position: TooltipPosition;
  } | null;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  currentOnboardingStep: number;
  setCurrentOnboardingStep: (step: number) => void;
}

interface TooltipPosition {
  x: number;
  y: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<HelpContextType['activeTooltip']>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  const toggleHelpMode = () => {
    setIsHelpMode(!isHelpMode);
    if (isHelpMode) {
      setActiveTooltip(null);
    }
  };

  const showTooltip = (id: string, content: string, position: TooltipPosition = { x: 0, y: 0 }) => {
    setActiveTooltip({ id, content, position });
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  const value: HelpContextType = {
    isHelpMode,
    toggleHelpMode,
    showTooltip,
    hideTooltip,
    activeTooltip,
    showOnboarding,
    setShowOnboarding,
    currentOnboardingStep,
    setCurrentOnboardingStep,
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = (): HelpContextType => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};