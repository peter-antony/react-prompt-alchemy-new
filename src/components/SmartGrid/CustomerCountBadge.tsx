import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface Customer {
  name: string;
  id: string;
}

interface CustomerCountBadgeProps {
  count: string;
  customers?: Customer[];
  className?: string;
}

export const CustomerCountBadge: React.FC<CustomerCountBadgeProps> = ({
  count,
  customers = [],
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

  // Extract the number from the count string (e.g., "+3" -> 3)
  const countNumber = parseInt(count.replace('+', '')) || 0;

  // Only show badge if count exists and is greater than 1
  if (!count || countNumber <= 0) {
    return <span className="text-gray-500"></span>;
  }

  // Default customers if none provided
  const defaultCustomers: Customer[] = [
    { name: "DB Cargo", id: "CUS00000123" },
    { name: "ABC Rail Goods", id: "CUS00003214" },
    { name: "Wave Cargo", id: "CUS00012345" }
  ];

  const displayCustomers = customers.length > 0 ? customers : defaultCustomers;

  const calculatePosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const popoverWidth = 224; // w-56 = 224px
      const popoverHeight = Math.min(displayCustomers.length * 48 + 24, 200); // Estimate height
      
      let left = rect.left + (rect.width / 2) - (popoverWidth / 2);
      let top = rect.bottom + 6;

      // Handle right edge overflow
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 16;
      }

      // Handle left edge overflow
      if (left < 16) {
        left = 16;
      }

      // Handle bottom edge overflow - show above the badge
      if (top + popoverHeight > window.innerHeight) {
        top = rect.top - popoverHeight - 6;
      }

      setPosition({ top, left });
    }
  };

  const handleClick = () => {
    calculatePosition();
    setIsOpen(true);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !badgeRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  return (
    <>
      <div ref={badgeRef} className="inline-block">
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer transition-all duration-150 font-medium text-center",
            "hover:border-gray-400 hover:bg-gray-50",
            "px-2 py-0.5 text-xs font-medium rounded-2xl",
            "flex items-center justify-center min-w-[2rem] h-6 badge-gray",
            className
          )}
          onClick={handleClick}
        >
          {count}
        </Badge>
      </div>

      {isOpen && createPortal(
        <div
          className="fixed z-[9999] w-56 p-0 border border-gray-200 shadow-lg rounded-lg bg-white max-h-48 overflow-y-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="p-3">
            <div className="space-y-1">
              {displayCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <UsersRound className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-normal text-gray-900 truncate">
                      {customer.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {customer.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}; 