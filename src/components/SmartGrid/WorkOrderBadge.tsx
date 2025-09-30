import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface WorkOrder {
  WorkOrderIncidentID: string;
  WorkOrderIncidentIDStatus?: string;
  id?: string;
  WorkorderNo?: string;
  Workorderstatus?: string;
}

interface WorkOrderBadgeProps {
  // count can be passed as number or string (we normalize it)
  count?: number | string;
  workOrders?: WorkOrder[];
  className?: string;
}

export const WorkOrderBadge: React.FC<WorkOrderBadgeProps> = ({
  count, // may be number (length) or string like "+3"
  workOrders = [],
  className
}) => {
  // Hooks must always run unconditionally at top-level
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

  // Normalize count to a number. Prefer explicit prop, fall back to customers.length
  const countNumber = Number(count ?? workOrders.length) || workOrders.length || 0;

  // Default work orders if none provided
  const defaultWorkOrders: WorkOrder[] = [
    // { WorkOrderIncidentID: "WO00000123", WorkOrderIncidentIDStatus: "Open", WorkorderNo: "WO123", Workorderstatus: "In Progress" },
    // { WorkOrderIncidentID: "WO00003214", WorkOrderIncidentIDStatus: "Closed", WorkorderNo: "WO456", Workorderstatus: "Completed" },
    // { WorkOrderIncidentID: "WO00012345", WorkOrderIncidentIDStatus: "Pending", WorkorderNo: "WO789", Workorderstatus: "On Hold" }
  ];

  const displayWorkOrders = workOrders && workOrders.length > 0 ? workOrders : defaultWorkOrders;

  const calculatePosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const popoverWidth = 224; // w-56 = 224px
      const popoverHeight = Math.min(displayWorkOrders.length * 48 + 24, 200); // Estimate height

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
              "text-sm font-medium text-gray-600 truncate",
              "px-2 py-0.5 rounded",
              className
            )}
            title={displayWorkOrders[0]?.WorkorderNo}
          >
            {/* {displayCustomers && displayCustomers.length > 0
              ? (displayWorkOrders[0]?.WorkorderNo || displayWorkOrders[0]?.Workorderstatus || String(countNumber))
              : String(countNumber)} */}
            { displayWorkOrders?.[0]?.WorkorderNo && displayWorkOrders[0]?.Workorderstatus
              ? `${displayWorkOrders[0]?.WorkorderNo} || ${displayWorkOrders?.[0]?.Workorderstatus}`
              : displayWorkOrders?.[0]?.WorkorderNo || displayWorkOrders?.[0]?.Workorderstatus || String(countNumber)}
          </div>
        )}
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
              {displayWorkOrders.map((workOrder: any, index) => (
                <div
                  key={'WorkOrder-' + index}
                  className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <UsersRound className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-normal text-gray-900 truncate">
                      {workOrder.WorkorderNo || workOrder.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {workOrder.Workorderstatus || (workOrder.description ?? workOrder.Workorderstatus)}
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