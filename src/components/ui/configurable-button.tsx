
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface ConfigurableButtonConfig {
  label: string;
  tooltipTitle: string;
  showDropdown: boolean;
  dropdownItems?: DropdownItem[];
  onClick: () => void;
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
}

interface ConfigurableButtonProps {
  config: ConfigurableButtonConfig;
  className?: string;
  onClick?: () => void;
}

export const ConfigurableButton: React.FC<ConfigurableButtonProps> = ({
  config,
  className,
  onClick
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { label, tooltipTitle, showDropdown: hasDropdown, dropdownItems, tooltipPosition = 'top' } = config;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleMainButtonClick = () => {
    if (!hasDropdown) {
      onClick?.();
    } else {
      // Only navigate if the user clicks the label, not the arrow
      onClick?.();
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleDropdownItemClick = (item: DropdownItem) => {
    item.onClick();
    setShowDropdown(false);
  };

  const getTooltipPositionClasses = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={cn(
          "border border-blue-500 text-blue-500 hover:bg-blue-50 h-9 rounded px-3 flex items-center transition-colors duration-200 gap-2",
          className
        )}
        onClick={handleMainButtonClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        type="button"
      >
        <span
          onClick={config.onClick}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          className="select-none flex items-center text-sm font-medium gap-2"
        >
          <Plus className="h-4 w-4" />
          {label}
        </span>
        {hasDropdown && (
          <>
            <div className="w-px h-9 bg-blue-500 ml-2 mr-1" />
            <span
              onClick={handleChevronClick}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              tabIndex={0}
              role="button"
              aria-label="Show dropdown"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showDropdown ? "rotate-180" : ""
                )}
              />
            </span>
          </>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && tooltipTitle && (
        <div
          className={cn(
            "absolute bg-gray-800 text-white text-xs rounded px-2 py-1 shadow transition-opacity duration-200 z-50 whitespace-nowrap",
            getTooltipPositionClasses()
          )}
        >
          {tooltipTitle}
          {/* Tooltip arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-800 transform rotate-45",
              tooltipPosition === 'top' && "top-full left-1/2 -translate-x-1/2 -mt-1",
              tooltipPosition === 'right' && "right-full top-1/2 -translate-y-1/2 -mr-1",
              tooltipPosition === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
              tooltipPosition === 'left' && "left-full top-1/2 -translate-y-1/2 -ml-1"
            )}
          />
        </div>
      )}

      {/* Dropdown Menu */}
      {hasDropdown && showDropdown && dropdownItems && (
        <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-50 transition-opacity duration-200">
          {dropdownItems.map((item, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center transition-colors duration-150 first:rounded-t-md last:rounded-b-md"
              onClick={() => handleDropdownItemClick(item)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              <span className="text-sm text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
