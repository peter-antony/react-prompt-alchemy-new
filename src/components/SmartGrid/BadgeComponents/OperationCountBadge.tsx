import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface OperationDetail {
  OperationNumber: string;
  TypeOfAction?: string;
  Operation?: string;
  OperationStatus?: string;
}

interface OperationCountBadgeProps {
  count?: number | string;
  OperationDetails?: OperationDetail[];
  className?: string;
}

export const OperationCountBadge: React.FC<OperationCountBadgeProps> = ({
  count,
  OperationDetails = [],
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

  const countNumber = Number(count ?? OperationDetails.length) || OperationDetails.length || 0;

  const defaultOperations: OperationDetail[] = [
    {
      OperationNumber: 'OP1',
      TypeOfAction: 'Corrective maintenance',
      Operation: 'RA',
      OperationStatus: 'InProgress'
    }
  ];

  const displayOperations =
    OperationDetails && OperationDetails.length > 0 ? OperationDetails : defaultOperations;

  const calculatePosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const popoverWidth = 224;
      const popoverHeight = Math.min(displayOperations.length * 60 + 24, 220);

      let left = rect.left + rect.width / 2 - popoverWidth / 2;
      let top = rect.bottom + 6;

      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 16;
      }

      if (left < 16) {
        left = 16;
      }

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

  // on Mouse hover/leave
  // const handleMouseEnter = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   calculatePosition();
  //   setIsOpen(true);
  // };
  
  // const handleMouseLeave = () => setIsOpen(false);
  

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

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // const getSingleLabel = () => {
  //   const op = displayOperations?.[0];
  //   if (!op) return String(countNumber);

  //   if (op.OperationNumber && op.OperationStatus) {
  //     return `${op.OperationNumber} || ${op.OperationStatus}`;
  //   }
  //   return op.OperationNumber || op.OperationStatus || String(countNumber);
  // };

  return (
    <>
      <div ref={badgeRef} className="inline-block">
        {countNumber > 0 && (
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer transition-all duration-150 font-medium text-center',
              'hover:border-gray-400 hover:bg-gray-50',
              'px-2 py-0.5 text-xs font-medium rounded-2xl',
              'flex items-center justify-center min-w-[2rem] h-6 badge-gray',
              className
            )}
            onClick={handleClick}
            // onMouseEnter={handleMouseEnter}
            // onMouseLeave={handleMouseLeave}
          >
            {String(countNumber)}
          </Badge>
        )}

        {/* {countNumber === 1 && (
          <div
            className={cn(
              'text-[13px] font-normal text-Gray-800 truncate',
              'px-2 py-0.5 rounded',
              className
            )}
            title={getSingleLabel()}
          >
            {getSingleLabel()}
          </div>
        )} */}
      </div>

      {isOpen &&
        createPortal(
          <div
            className="fixed z-[9999] max-w-md p-0 border border-gray-200 shadow-lg rounded-lg bg-white max-h-56 overflow-y-auto"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`
            }}
          >
            <div className="p-3">
              <div className="space-y-2">
                {displayOperations.map((operation, index) => (
                  <div
                    key={'operation-' + index}
                    className="flex flex-col space-y-1 p-2 rounded-md hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <div className="text-[13px] font-medium text-Gray-800 truncate">
                      Operation: {operation.Operation}
                    </div>
                    <div className="text-xs text-Gray-600 truncate">
                      Operation No.: {operation.OperationNumber || '-'}
                    </div>
                    <div className="text-xs text-Gray-600 truncate">
                      Type of Action: {operation.TypeOfAction || '-'}
                    </div>
                    <div className="text-xs text-Gray-500 truncate">
                      Status: {operation.OperationStatus || '-'}
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

