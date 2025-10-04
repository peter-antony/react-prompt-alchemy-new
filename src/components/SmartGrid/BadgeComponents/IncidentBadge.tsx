import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface Incident {
  Customer: string;
  CustomerDescription?: string;
  id?: string;
  name?: string;
  description?: string;
}

interface IncidentBadgeProps {
  // count can be passed as number or string (we normalize it)
  count?: number | string;
  Incidents?: Incident[];
  className?: string;
}

export const IncidentBadgeComponent: React.FC<IncidentBadgeProps> = ({
  count, // may be number (length) or string like "+3"
  Incidents = [],
  className
}) => {
  // Hooks must always run unconditionally at top-level
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

  // Normalize count to a number. Prefer explicit prop, fall back to customers.length
  const countNumber = Number(count ?? Incidents.length) || Incidents.length || 0;

  // Default customers if none provided
  const defaultIncidents: any[] = [
    // { Customer: "DB Cargo", CustomerDescription: "DB Cargo", id: "CUS00000123" },
    // { Customer: "ABC Rail Goods", CustomerDescription: "ABC Rail Goods", id: "CUS00003214" },
    // { Customer: "Wave Cargo", CustomerDescription: "Wave Cargo", id: "CUS00012345" }
  ];

  const displayIncidents = Incidents && Incidents.length > 0 ? Incidents : defaultIncidents;

  const calculatePosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const popoverWidth = 224; // w-56 = 224px
      const popoverHeight = Math.min(displayIncidents.length * 48 + 24, 200); // Estimate height

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
        {countNumber > 1 && (
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
            {String(countNumber)}
          </Badge>
        )}

        {countNumber === 1 && (
          // When there's exactly one customer, show the customer's name inline
          <div
            className={cn(
              "text-[13px] font-normal text-Gray-800 truncate",
              "px-2 py-0.5 rounded",
              className
            )}
            title={displayIncidents?.[0]?.IncidentID && displayIncidents[0]?.IncidentStatus
              ? `${displayIncidents[0]?.IncidentID} || ${displayIncidents?.[0]?.IncidentStatus}`
              : displayIncidents?.[0]?.IncidentID || displayIncidents?.[0]?.IncidentStatus}
          >
            {/* {displayCustomers && displayCustomers.length > 0
              ? (displayCustomers[0]?.Customer || displayCustomers[0]?.name || String(countNumber))
              : String(countNumber)} */}
            { displayIncidents?.[0]?.IncidentID && displayIncidents[0]?.IncidentStatus
              ? `${displayIncidents[0]?.IncidentID} || ${displayIncidents?.[0]?.IncidentStatus}`
              : displayIncidents?.[0]?.IncidentID || displayIncidents?.[0]?.IncidentStatus}
          </div>
        )}
      </div>

      {isOpen && createPortal(
        <div
          className="fixed z-[9999] max-w-md p-0 border border-gray-200 shadow-lg rounded-lg bg-white max-h-48 overflow-y-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="p-3">
            <div className="space-y-1">
              {displayIncidents.map((incident: any, index) => (
                <div
                  key={'Incident-' + index}
                  className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  {/* <div className="flex-shrink-0">
                    <UsersRound className="h-4 w-4 text-gray-500" />
                  </div> */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-normal text-Gray-800 truncate">
                     IncidentID: {incident.IncidentID}
                    </div>
                    <div className="text-xs text-Gray-500 truncate">
                     Incident Status: {incident.IncidentStatus}
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