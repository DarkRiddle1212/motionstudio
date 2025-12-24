import React, { useEffect, useRef } from 'react';
import { useHelp } from './HelpProvider';

interface HelpTooltipProps {
  id: string;
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  id,
  content,
  children,
  placement = 'top',
  disabled = false,
}) => {
  const { isHelpMode, showTooltip, hideTooltip, activeTooltip } = useHelp();
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!isHelpMode || disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top,
      placement,
    };

    showTooltip(id, content, position);
  };

  const handleMouseLeave = () => {
    if (!isHelpMode || disabled) return;
    hideTooltip();
  };

  const handleClick = () => {
    if (!isHelpMode || disabled) return;
    
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top,
      placement,
    };

    showTooltip(id, content, position);
  };

  return (
    <div
      ref={elementRef}
      className={`relative ${isHelpMode && !disabled ? 'cursor-help' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-help-id={id}
    >
      {children}
      {isHelpMode && !disabled && (
        <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded-md pointer-events-none animate-pulse" />
      )}
    </div>
  );
};

export default HelpTooltip;