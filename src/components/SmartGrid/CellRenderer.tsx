
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { GridColumnConfig } from '@/types/smartgrid';
import { cn } from '@/lib/utils';
import { CustomerCountBadge } from './CustomerCountBadge';
import { formattedAmount, dateFormatter } from '@/utils/formatter';

interface CellRendererProps {
  value: any;
  row: any;
  column: GridColumnConfig;
  rowIndex: number;
  columnIndex: number;
  isEditing: boolean;
  isEditable: boolean;
  onEdit: (rowIndex: number, columnKey: string, value: any) => void;
  onEditStart: (rowIndex: number, columnKey: string) => void;
  onEditCancel: () => void;
  onLinkClick?: (rowData: any, columnKey: string) => void;
  loading?: boolean;
}

export const CellRenderer: React.FC<CellRendererProps> = ({
  value,
  row,
  column,
  rowIndex,
  columnIndex,
  isEditing,
  isEditable,
  onEdit,
  onEditStart,
  onEditCancel,
  onLinkClick,
  loading = false
}) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onEdit(rowIndex, column.key, tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onEditCancel();
      setTempValue(value);
    }
  };

  // Badge renderer with status mapping
  const renderBadge = () => {
    // Handle both object format {value, variant} and string format
    let displayValue: string;
    let statusColor: string;

    if (typeof value === 'object' && value !== null && 'value' in value) {
      // Object format: {value: "status", variant: "css-classes"}
      displayValue = value.value;
      statusColor = value.variant || getDefaultStatusColor(value.value, column.key);
    } else {
      // String format
      displayValue = String(value || '');
      statusColor = column.statusMap?.[displayValue] || getDefaultStatusColor(displayValue, column.key);
    }
    // ✅ If displayValue is empty, return null (don't render Badge)
    if (!displayValue || displayValue.trim() === "") {
      return null;
    }

    return (
      <Badge className={cn("whitespace-nowrap", statusColor)}>
        {displayValue}
      </Badge>
    );
  };

  // Default status color mapping based on common patterns
  const getDefaultStatusColor = (status: any, columnKey: string) => {
    // Safely convert to string and handle non-string inputs
    const statusString = String(status || '').toLowerCase();

    if (columnKey.toLowerCase().includes('status')) {
      switch (statusString) {
        case 'released':
        case 'confirmed':
        case 'approved':
        case 'active':
        case 'completed':
        case 'invoice approved':
        case 'payment processed':
          return 'bg-green-50 text-green-600 border border-green-200';
        case 'under execution':
        case 'in progress':
        case 'pending':
        case 'pending review':
          return 'bg-purple-50 text-purple-600 border border-purple-200';
        case 'initiated':
        case 'draft':
        case 'invoice created':
        case 'ready for dispatch':
          return 'bg-blue-50 text-blue-600 border border-blue-200';
        case 'cancelled':
        case 'deleted':
        case 'rejected':
        case 'not eligible':
        case 'revenue leakage':
        case 'policy violation':
          return 'bg-red-50 text-red-600 border border-red-200';
        case 'bill raised':
        case 'documentation missing':
        case 'on hold':
          return 'bg-orange-50 text-orange-600 border border-orange-200';
        default:
          return 'bg-gray-50 text-gray-600 border border-gray-200';
      }
    }
    return 'bg-gray-50 text-gray-600 border border-gray-200';
  };

  // Link renderer
  const renderLink = () => {
    const handleClick = () => {
      if (onLinkClick) {
        onLinkClick(row, column.key);
      } else if (column.onClick) {
        column.onClick(row);
      }
    };

    return (
      <button
        onClick={handleClick}
        className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium hover:underline transition-colors duration-150 truncate max-w-full"
        disabled={loading}
        title={String(value)}
      >
        {value}
      </button>
    );
  };

  // DateTimeRange renderer
  const renderDateTimeRange = () => {
    const [date, time] = String(value).split('\n');
    return (
      <div className="text-sm min-w-0">
        <div className="text-gray-900 font-normal truncate">{date}</div>
        <div className="text-gray-500 text-xs truncate">{time}</div>
      </div>
    );
  };

  // TextWithTooltip renderer
  const renderTextWithTooltip = () => {
    const tooltipText = column.infoTextField ? row[column.infoTextField] : `More info about ${value}`;

    return (
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-gray-900 font-medium truncate flex-1" title={String(value)}>
          {value}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="w-4 h-4 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center cursor-help transition-colors duration-150 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="More information"
              >
                <Info className="h-3 w-3 text-blue-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="max-w-xs p-3 text-sm bg-white border border-gray-200 shadow-lg z-50"
              sideOffset={5}
            >
              <p className="break-words">{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  // ExpandableCount renderer with modal
  const renderExpandableCount = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-900 font-medium hover:bg-blue-50 hover:border-blue-300 transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
            aria-label={`View ${value} details`}
          >
            {value}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Details
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-1">
            {column.renderExpandedContent ? column.renderExpandedContent(row) : (
              <div className="text-gray-500 text-center py-8">
                No additional content available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // EditableText renderer
  const renderEditableText = () => {
    if (isEditing) {
      return (
        <Input
          value={tempValue || ''}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full min-w-0 focus:ring-2 focus:ring-blue-500"
          autoFocus
          disabled={loading}
        />
      );
    }

    if (isEditable) {
      return (
        <div
          onClick={() => onEditStart(rowIndex, column.key)}
          className={cn(
            "min-h-[20px] p-2 hover:bg-blue-50 cursor-pointer rounded transition-colors duration-150 truncate",
            loading && "opacity-50 cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          )}
          title={String(value)}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEditStart(rowIndex, column.key);
            }
          }}
        >
          {value || <span className="text-gray-400">Click to edit</span>}
        </div>
      );
    }

    return <span className="truncate" title={String(value)}>{value}</span>;
  };

  // Dropdown renderer
  const renderDropdown = () => {
    if (isEditable && column.options) {
      return (
        <select
          value={value || ''}
          onChange={(e) => onEdit(rowIndex, column.key, e.target.value)}
          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
          disabled={loading}
        >
          <option value="">Select...</option>
          {column.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }
    return <span className="truncate" title={String(value)}>{value}</span>;
  };

  // Date renderer
  const renderDate = () => {
    if (!value) return <span className="text-gray-400">-</span>;

    try {
      const date = new Date(value);
      const formattedDate = date.toLocaleDateString();
      return <span className="truncate" title={formattedDate}>{dateFormatter(formattedDate)}</span>;
    } catch {
      return <span className="truncate" title={String(value)}>{value}</span>;
    }
  };

  // Date renderer
  const renderDateFormat = () => {
    if (!value) return <span className="text-gray-400">-</span>;

    try {
      const date = new Date(value);
      const day = String(date.getDate()).padStart(2, '0');
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      return <span className="truncate" title={formattedDate}>{formattedDate}</span>;
    } catch {
      return <span className="truncate" title={String(value)}>{value}</span>;
    }
  };

  // Currency with symbol renderer
  const renderCurrencySymbol = () => {
    return <span className="font-semibold">&euro; {formattedAmount(value)}</span>
  }

  // Action button renderer
  const renderActionButton = () => {
    if (!column.actionButtons || column.actionButtons.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <>
        {column.actionButtons.map((button, index) => {
          const isDisabled = typeof button.disabled === 'function'
            ? button.disabled(row)
            : button.disabled || false;

          const buttonElement = (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                button.onClick(row);
              }}
              disabled={isDisabled}
              className="h-6 w-6 p-0 bg-transparent border-none"
            >
              {button.icon}
            </button>
          );

          if (button.tooltip) {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  {buttonElement}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return buttonElement;
        })}
      </>
    );
  };

  // CustomerCountBadge renderer
  const renderCustomerCountBadge = () => {
    // Use customer data from row only
    const customerData = row.customerData || [];

    return (
      <CustomerCountBadge
        count={String(value)}
        customers={customerData}
        className="text-center"
      />
    );
  };

  // Main renderer switch
  const renderCellContent = () => {
    switch (column.type) {
      case 'Link':
        return renderLink();
      case 'Badge':
        return renderBadge();
      case 'DateTimeRange':
        return renderDateTimeRange();
      case 'TextWithTooltip':
        return renderTextWithTooltip();
      case 'ExpandableCount':
        return renderExpandableCount();
      case 'CustomerCountBadge':
        return renderCustomerCountBadge();
      case 'EditableText':
        return renderEditableText();
      case 'Dropdown':
        return renderDropdown();
      case 'Date':
        return renderDate();
      case 'DateFormat':
        return renderDateFormat();
      case 'CurrencyWithSymbol':
        return renderCurrencySymbol();
      case 'ActionButton':
        return renderActionButton();
      case 'Text':
      default:
        return <span className="text-gray-900 truncate" title={String(value)}>{value}</span>;
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center min-w-0 w-full ${column.type === 'ActionButton' ? 'justify-center' : ''}`}>
        {renderCellContent()}
      </div>
    </TooltipProvider>
  );
};
