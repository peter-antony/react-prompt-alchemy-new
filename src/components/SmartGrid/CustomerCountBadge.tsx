import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface Customer {
  Customer: string;
  CustomerDescription?: string;
  id?: string;
  name?: string;
  description?: string;
  [key: string]: any; // Allow other properties
}

interface CustomerCountBadgeProps {
  // count can be passed as number or string (we normalize it)
  count?: number | string;
  customers?: Customer[];
  className?: string;
}

export const CustomerCountBadge: React.FC<CustomerCountBadgeProps> = ({
  count, // may be number (length) or string like "+3"
  customers = [],
  className
}) => {
  // Hooks must always run unconditionally at top-level
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

  // Default customers if none provided
  const defaultCustomers: Customer[] = [];
  const rawCustomers = customers && customers.length > 0 ? customers : defaultCustomers;

  // Filter unique customers based on Customer ID and Description used for display
  const uniqueCustomers = React.useMemo(() => {
    const uniqueMap = new Map();
    rawCustomers.forEach(c => {
      // Use a composite key of Customer ID and Description to identify uniqueness
      const id = c.Customer || c.id || '';
      const desc = c.CustomerDescription || c.name || '';
      const key = `${id}-${desc}`;

      if (!uniqueMap.has(key) && (id || desc)) {
        uniqueMap.set(key, c);
      }
    });
    return Array.from(uniqueMap.values());
  }, [rawCustomers]);

  // If no customers, fallback to count prop if valid
  const effectiveCount = uniqueCustomers.length || (typeof count === 'number' ? count : parseInt(String(count || 0), 10));

  const calculatePosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const popoverWidth = 224; // w-56 = 224px
      const popoverHeight = Math.min(uniqueCustomers.length * 48 + 24, 200); // Estimate height

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOpen) {
      setIsOpen(false);
    } else {
      calculatePosition();
      setIsOpen(true);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking on the badge itself, do nothing (handled by handleClick)
      if (badgeRef.current?.contains(event.target as Node)) {
        return;
      }

      // If clicking outside the badge, close the popover
      // adding id to the portal element
      const portalEl = document.getElementById('customer-count-badge-portal');
      if (isOpen && !portalEl?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
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
        {effectiveCount > 1 && (
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-all duration-150 font-medium text-center",
              "hover:border-gray-400 hover:bg-gray-50",
              "px-2 py-0.5 text-[12px] font-medium rounded-2xl",
              "flex items-center justify-center min-w-[2rem] h-6 badge-gray",
              className
            )}
            onClick={handleClick}
          >
            {effectiveCount}
          </Badge>
        )}

        {effectiveCount === 1 && (
          // When there's exactly one unique customer (even if multiple duplicate rows), show inline
          <div
            className={cn(
              "text-[13px] font-normal text-Gray-800 truncate",
              "px-2 py-0.5 rounded",
              className
            )}
            title={uniqueCustomers[0]?.CustomerDescription}
          >
            {uniqueCustomers?.[0]?.Customer && uniqueCustomers[0]?.CustomerDescription
              ? `${uniqueCustomers[0]?.CustomerDescription} || ${uniqueCustomers?.[0]?.Customer}`
              : uniqueCustomers?.[0]?.CustomerDescription || uniqueCustomers?.[0]?.Customer}
          </div>
        )}
      </div>

      {isOpen && createPortal(
        <div
          id="customer-count-badge-portal"
          className="fixed z-[9999] max-w-md p-0 border border-gray-200 shadow-lg rounded-lg bg-white max-h-48 overflow-y-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="p-3">
            <div className="space-y-1">
              {uniqueCustomers.map((customer, index) => (
                <div
                  key={'Customer-' + index}
                  className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <UsersRound className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-normal text-Gray-800 truncate">
                      {customer.CustomerDescription || customer.name}
                    </div>
                    <div className="text-[13px] text-Gray-800 truncate">
                      {customer.Customer || customer.id || (customer.description)}
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