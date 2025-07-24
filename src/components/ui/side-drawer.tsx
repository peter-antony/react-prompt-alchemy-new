
import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FooterButton {
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  action: () => void;
  disabled?: boolean;
}

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  showFooter?: boolean;
  footerButtons?: FooterButton[];
  closeOnOutsideClick?: boolean;
  transitionDuration?: number; // in milliseconds
  width?: string; // width as percentage (e.g., "30%", "40%") or px (e.g., "400px")
  children: React.ReactNode;
  className?: string;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onBack,
  title,
  showBackButton = false,
  showCloseButton = true,
  showFooter = false,
  footerButtons = [],
  closeOnOutsideClick = true,
  transitionDuration = 300,
  width = "400px",
  children,
  className
}) => {
  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const transitionStyle = {
    transitionDuration: `${transitionDuration}ms`
  };

  // Determine width based on screen size and prop
  const getDrawerWidth = () => {
    if (window.innerWidth < 640) {
      return '100%'; // Full width on mobile
    }
    return width;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        style={transitionStyle}
        onClick={handleOverlayClick}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-white shadow-xl z-50",
          "transform transition-transform ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        style={{ 
          width: getDrawerWidth(),
          ...transitionStyle
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h2>
            )}
          </div>
          
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {showFooter && footerButtons.length > 0 && (
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex space-x-2 justify-end">
              {footerButtons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant}
                  onClick={button.action}
                  disabled={button.disabled}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
