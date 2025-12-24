import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHelp } from './HelpProvider';

const TooltipRenderer: React.FC = () => {
  const { activeTooltip, hideTooltip } = useHelp();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!activeTooltip) return;

    const { x, y, placement = 'top' } = activeTooltip.position;
    
    // Calculate tooltip position based on placement
    let tooltipX = x;
    let tooltipY = y;

    switch (placement) {
      case 'top':
        tooltipY = y - 10;
        break;
      case 'bottom':
        tooltipY = y + 40;
        break;
      case 'left':
        tooltipX = x - 200;
        tooltipY = y + 20;
        break;
      case 'right':
        tooltipX = x + 20;
        tooltipY = y + 20;
        break;
    }

    // Ensure tooltip stays within viewport
    const tooltipWidth = 300;
    const tooltipHeight = 100;
    
    if (tooltipX + tooltipWidth > window.innerWidth) {
      tooltipX = window.innerWidth - tooltipWidth - 10;
    }
    if (tooltipX < 10) {
      tooltipX = 10;
    }
    if (tooltipY + tooltipHeight > window.innerHeight) {
      tooltipY = window.innerHeight - tooltipHeight - 10;
    }
    if (tooltipY < 10) {
      tooltipY = 10;
    }

    setPosition({ x: tooltipX, y: tooltipY });
  }, [activeTooltip]);

  if (!activeTooltip) return null;

  return createPortal(
    <div
      className="fixed z-50 max-w-xs p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-700"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <div dangerouslySetInnerHTML={{ __html: activeTooltip.content }} />
        </div>
        <button
          onClick={hideTooltip}
          className="flex-shrink-0 text-gray-400 hover:text-white"
          aria-label="Close tooltip"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Arrow */}
      <div
        className="absolute w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"
        style={{
          left: '50%',
          top: '-5px',
          marginLeft: '-4px',
        }}
      />
    </div>,
    document.body
  );
};

export default TooltipRenderer;