
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

type SlideDirection = 'left' | 'right' | 'top' | 'bottom';
type SmoothnessCurve = 'ease-in-out' | 'ease-in' | 'ease-out' | 'linear' | 'bounce' | 'spring' | 'smooth';

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
  slideDirection?: SlideDirection;
  smoothness?: SmoothnessCurve;
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
  slideDirection = 'left',
  smoothness = 'ease-in-out',
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

  // Get smoothness curve
  const getSmoothnessCurve = (curve: SmoothnessCurve): string => {
    const curves = {
      'ease-in-out': 'ease-in-out',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'linear': 'linear',
      'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
    };
    return curves[curve] || curves['ease-in-out'];
  };

  const transitionStyle = {
    transitionDuration: `${transitionDuration}ms`,
    transitionTimingFunction: getSmoothnessCurve(smoothness),
    transitionProperty: 'transform, opacity'
  };

  const overlayTransitionStyle = {
    transitionDuration: `${Math.min(transitionDuration, 200)}ms`,
    transitionTimingFunction: 'ease-out',
    transitionProperty: 'opacity'
  };

  // Determine width based on screen size and prop
  const getDrawerWidth = () => {
    if (slideDirection === 'top' || slideDirection === 'bottom') {
      return '100%';
    }
    if (window.innerWidth < 640) {
      return '100%'; // Full width on mobile
    }
    return width;
  };

  const getDrawerHeight = () => {
    if (slideDirection === 'left' || slideDirection === 'right') {
      return '100%';
    }
    if (window.innerHeight < 640) {
      return '100%'; // Full height on mobile
    }
    return width; // Use width prop for height when sliding vertically
  };

  // Get position and transform classes based on slide direction
  const getPositionClasses = () => {
    switch (slideDirection) {
      case 'left':
        return {
          position: 'fixed top-0 left-0 h-full',
          transform: isOpen ? 'translate-x-0' : '-translate-x-full'
        };
      case 'right':
        return {
          position: 'fixed top-0 right-0 h-full',
          transform: isOpen ? 'translate-x-0' : 'translate-x-full'
        };
      case 'top':
        return {
          position: 'fixed top-0 left-0 w-full',
          transform: isOpen ? 'translate-y-0' : '-translate-y-full'
        };
      case 'bottom':
        return {
          position: 'fixed bottom-0 left-0 w-full',
          transform: isOpen ? 'translate-y-0' : 'translate-y-full'
        };
      default:
        return {
          position: 'fixed top-0 left-0 h-full',
          transform: isOpen ? 'translate-x-0' : '-translate-x-full'
        };
    }
  };

  const { position, transform } = getPositionClasses();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        style={overlayTransitionStyle}
        onClick={handleOverlayClick}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          position,
          "bg-white shadow-xl z-50",
          "transform transition-transform will-change-transform",
          "flex flex-col",
          transform,
          className
        )}
        style={{ 
          width: getDrawerWidth(),
          height: getDrawerHeight(),
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
                className="p-1 h-8 w-8 transition-colors duration-200 hover:bg-gray-100"
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
              className="p-1 h-8 w-8 transition-colors duration-200 hover:bg-gray-100"
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
                  className="transition-all duration-200"
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
