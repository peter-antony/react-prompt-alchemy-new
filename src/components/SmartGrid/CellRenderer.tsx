
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info, Package } from 'lucide-react';
import { GridColumnConfig } from '@/types/smartgrid';
import { cn } from '@/lib/utils';
import { CustomerCountBadge } from './CustomerCountBadge';
import { formattedAmount, dateFormatter, dateTimeFormatter } from '@/utils/formatter';
import { WorkOrderBadge } from './WorkOrderBadge';
import { OrderCountBadge } from './OrderCountBadge';
import { IncidentBadgeComponent } from './BadgeComponents/IncidentBadge';
import LocationDetailsTooltip from '@/components/Common/LocationDetailsTooltip';

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
  onLinkClick?: (rowData: any, columnKey: string, rowIndex: any) => void;
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
  const [tempValue, setTempValue] = React.useState(value);

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

  const renderBadgeCombinationCount = () => {
    return (
      <Badge className='bg-gray-100 text-gray-800 border-gray-300 rounded-2xl font-medium'>
        {row?.LegExecuted}/{row?.TotalLegs}
      </Badge>
    )
  }

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
        onLinkClick(row, column.key, rowIndex);
      } else if (column.onClick) {
        column.onClick(row);
      }
    };

    return (
      <button
        onClick={handleClick}
        className="text-Primary-500 hover:text-blue-800 cursor-pointer font-medium hover:underline transition-colors duration-150 truncate max-w-full"
        disabled={loading}
        title={String(value)}
      >
        {value}
      </button>
    );
  };

  // Simple text renderer
  const renderTextData = () => {
    return (
      <div className="text-sm min-w-0">
        <div className="text-Gray-800 font-normal truncate text-[13px]">{value}</div>
        {/* {column.key == 'Contract' && (<div className="text-gray-500 text-[11px] truncate">{row?.ContractDescription}</div>)}
        {column.key == 'CustomerOrVendor' && (<div className="text-gray-500 text-[11px] truncate">{row?.CustomerOrVendorName}</div>)} */}
      </div>
    );
  };

  const getPipedValue = (row: any, descKey: string, codeKey: string) => {
    const desc = row?.[descKey];
    const code = row?.[codeKey];
    if (desc && code) return `${desc} || ${code}`;
    return desc || code || "-";
  };

  const renderTextPipedData = () => {
    return (
      <div className="text-sm min-w-0">
        {column.key === "Contract" && (
          <div className="text-Gray-800 font-normal truncate text-[13px]">
            {row?.ContractDescription && row?.Contract
              ? `${row.ContractDescription} || ${row.Contract}`
              : row?.ContractDescription || row?.Contract}
          </div>
        )}

        {column.key === "CustomerOrVendor" && (
          <div className="text-Gray-800 font-normal truncate text-[13px]">
            {row?.CustomerOrVendorName && row?.CustomerOrVendor
              ? `${row.CustomerOrVendorName} || ${row.CustomerOrVendor}`
              : row?.CustomerOrVendorName || row?.CustomerOrVendor}
          </div>
        )}

        {column.key === "DeparturePointDescription" && (
          <div className="text-Gray-800 font-normal truncate text-[13px]">
            {row?.DeparturePointDescription && row?.DeparturePoint
              ? `${row.DeparturePointDescription} || ${row.DeparturePoint}`
              : row?.DeparturePointDescription || row?.DeparturePoint}
          </div>
        )}
        {column.key === "ArrivalPointDescription" && (
          <div className="text-Gray-800 font-normal truncate text-[13px]">
            {row?.ArrivalPointDescription && row?.ArrivalPoint
              ? `${row.ArrivalPointDescription} || ${row.ArrivalPoint}`
              : row?.ArrivalPointDescription || row?.ArrivalPoint}
          </div>
        )}
        {column.key === "LegFromDescription" && (
          <div className="text-Gray-800 font-normal truncate text-[13px]">
            {/* {row?.LegFromDescription && row?.LegFrom
              ? `${row.LegFromDescription} || ${row.LegFrom}`
              : row?.LegFromDescription || row?.LegFrom} */}
              {getPipedValue(row, 'LegFromDescription', 'LegFrom')}
          </div>
        )}
        {column.key === "LegToDescription" && (
          <div className="text-Gray-800 font-normal truncate text-[13px]">
            {getPipedValue(row, 'LegToDescription', 'LegTo')}
          </div>
        )}
      </div>
    );
  }

  const renderTextCustomised = () => {
    if (column.type === "TextCustom") {
      const firstCustomer = row?.CustomerOrderDetails?.[0]; // only first element

      if (column.key === "CustomerTransportMode") {
        return (
          <div className="text-Gray-800 font-normal truncate text-[13px]">
            {firstCustomer?.TransportMode}
          </div>
        );
      } else if (column.key === "CustomerService") {
        return (
          <div className="text-Gray-800 font-normal truncate text-[13px]" title={firstCustomer?.ServiceDescription}>
            {firstCustomer?.ServiceDescription}
          </div>
        );
      } else if (column.key === "CustomerSubService") {
        return (
          <div className="text-Gray-800 font-normal truncate text-[13px]" title={firstCustomer?.SubServiceDescription}>
            {firstCustomer?.SubServiceDescription}
          </div>
        );
      }
      // else if (column.key === "CustomerOrders") {
      //   return (
      //     <>
      //     <div className="font-normal truncate text-[13px] text-blue-600" title={firstCustomer?.CustomerOrder}>
      //       <a>{firstCustomer?.CustomerOrder}</a>
      //     </div>
      //     </>
      //   );
      // }
      else if (column.key === "CustomerOrders") {
        const customerOrders = row?.CustomerOrderDetails || [];

        return (
          <>
            {customerOrders.length > 0 ? (
              <div className="font-normal text-[13px] text-blue-600">
                {customerOrders.map((customer: any, index: number) => (
                  <span key={index} className="hover:underline cursor-pointer text-blue-600" title={customer.CustomerOrder}>
                    {/* <a
                      href="#"
                      className="hover:underline cursor-pointer text-blue-600"
                      title={customer.CustomerOrder}
                    > */}
                    {customer.CustomerOrder}
                    {/* </a> */}
                    {index < customerOrders.length - 1 && ", "}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-[13px]"></div>
            )}
          </>
        );
      }
    }

    return (
      <span className="truncate" title={String(value)}>
        {value}
      </span>
    )

  }

  // DateTimeRange renderer
  const renderDateTimeRange = () => {
    // const [date, time] = String(value).split('\n');
    // return (
    //   <div className="text-sm min-w-0">
    //     <div className="text-Gray-800 font-normal truncate">{date}</div>
    //     <div className="text-gray-500 text-xs truncate">{time}</div>
    //   </div>
    // );
    if (!value) return <div className="text-gray-400">-</div>;
    try {
      const date = new Date(value);
      const formattedDate = dateTimeFormatter(date);
      return <span className="truncate" title={formattedDate}>{formattedDate}</span>;
    } catch {
      return <span className="truncate" title={String(value)}>{value}</span>;
    }
  };

  // TextWithTooltip renderer
  const renderTextWithTooltip = () => {
    const tooltipText = column.infoTextField ? row[column.infoTextField] : `More info about ${value}`;

    return (
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-Gray-800 font-medium truncate flex-1" title={String(value)}>
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

  // LegLocationFormat renderer
  const renderLegLocationFormat = () => {
    // const [showLocationDetails, setShowLocationDetails] = useState(false);
    if (column.key === "ArrivalPoint" && column.type === "LegLocationFormat") {
      return (
        <div className="relative text-sm min-w-0 flex items-center">
          <div className="text-Gray-800 font-normal truncate">{row?.DeparturePointDescription} - {row?.ArrivalPointDescription}</div>
          <LocationDetailsTooltip row={row} type="LegLocationFormat" value={value} propKey={column.key} />
        </div>
      );
    }
    if(column.key === "PlannedActual" && column.type === "LegLocationFormat") {
      return (
        <div className="relative text-sm flex items-center w-full">
          {/* <div className="text-Gray-800 font-normal truncate">{value} - {row?.DeparturePoint}</div> */}
          <LocationDetailsTooltip row={row} type="LegLocationFormat" value={value} propKey={column.key} />
        </div>
      );
    }
    if(column.key === "Consignment" && column.type === "LegLocationFormat") {
      return (
        <div className="relative text-sm flex items-center w-full justify-center">
          <div className='relative'>
            <Package size={16} />
            <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ExpandableCount renderer with modal
  const renderExpandableCount = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-Gray-800 font-medium hover:bg-blue-50 hover:border-blue-300 transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
            aria-label={`View ${value} details`}
          >
            {value}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-lg font-semibold text-Gray-800">
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
      const formattedDate = dateFormatter(date);
      return <span className="truncate" title={formattedDate}>{formattedDate}</span>;
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
    return <span className="font-bold">&euro; {formattedAmount(value)}</span>
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
    if (column.key == "CustomerOrderDetails") {
      const customerData = row?.CustomerOrderDetails || [];
      // console.log('customerData: ', customerData)
      return (
        <CustomerCountBadge
          count={customerData?.length}
          customers={customerData}
          className="text-center"
        />
      );
    }
    if (column.key == "WorkOrderDetails") {
      const WorkOrderDetailsData = row?.WorkOrderDetails || [];
      // console.log('WorkOrderDetailsData: ', WorkOrderDetailsData)
      return (
        <WorkOrderBadge
          count={WorkOrderDetailsData?.length}
          workOrders={WorkOrderDetailsData}
          className="text-center"
        />
      );
    }
    if (column.key == "IncidentDetails") {
      const IncidentData = row?.IncidentDetails || [];
      // console.log('WorkOrderDetailsData: ', WorkOrderDetailsData)
      return (
        <IncidentBadgeComponent
          count={IncidentData?.length}
          Incidents={IncidentData}
          className="text-center"
        />
      );
    }

    // if(column.key == "OrderDetailsList") {
    //   const customerOrdersListData = row?.CustomerOrderDetails || [];
    //   return (
    //     <OrderCountBadge
    //       count={customerOrdersListData?.length}
    //       COrderaData={customerOrdersListData}
    //       className="text-center"
    //     />
    //   )

    // }

    return null; // Fallback
  };

  // Main renderer switch
  const renderCellContent = () => {
    switch (column.type) {
      case 'Link':
        return renderLink();
      case 'Badge':
        return renderBadge();
      case 'BadgeCombinationCount':
        return renderBadgeCombinationCount();
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
        return renderTextData();
      case 'TextPipedData':
        return renderTextPipedData();
      case 'LegLocationFormat':
        return renderLegLocationFormat();
      case 'TextCustom':
        // Custom text rendering logic can be added here
        return renderTextCustomised();
      default:
        return;
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
