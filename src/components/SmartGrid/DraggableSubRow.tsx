
import React, { useState, useCallback } from 'react';
import { GridColumnConfig, GridPreferences } from '@/types/smartgrid';
import { GripVertical, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { dateFormatter, dateTimeFormatter, formattedAmount } from '@/utils/formatter';
import { CustomerCountBadge } from './CustomerCountBadge';
import { WorkOrderBadge } from './WorkOrderBadge';
import { OrderCountBadge } from './OrderCountBadge';
import { IncidentBadgeComponent } from './BadgeComponents/IncidentBadge';

interface DraggableSubRowProps {
  row: any;
  rowIndex: number;
  columns: GridColumnConfig[];
  subRowColumnOrder: string[];
  editingCell: { rowIndex: number; columnKey: string } | null;
  onReorderSubRowColumns: (newOrder: string[]) => void;
  onSubRowEdit: (rowIndex: number, columnKey: string, value: any) => void;
  onSubRowEditStart: (rowIndex: number, columnKey: string) => void;
  onSubRowEditCancel: () => void;
  preferences?: GridPreferences;
}

export const DraggableSubRow: React.FC<DraggableSubRowProps> = ({
  row,
  rowIndex,
  columns,
  subRowColumnOrder,
  editingCell,
  onReorderSubRowColumns,
  onSubRowEdit,
  onSubRowEditStart,
  onSubRowEditCancel,
  preferences
}) => {
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Get sub-row columns and apply custom ordering
  const subRowColumns = columns.filter(col => col.subRow === true);
  const orderedSubRowColumns = subRowColumnOrder.length > 0
    ? subRowColumnOrder
      .map(id => subRowColumns.find(col => col.key === id))
      .filter((col): col is GridColumnConfig => col !== undefined)
      .concat(subRowColumns.filter(col => !subRowColumnOrder.includes(col.key)))
    : subRowColumns;

  const handleDragStart = useCallback((e: React.DragEvent, columnKey: string) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnKey);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumnKey) {
      setDragOverColumn(targetColumnKey);
      e.dataTransfer.dropEffect = 'move';
    }
  }, [draggedColumn]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();

    if (!draggedColumn || draggedColumn === targetColumnKey) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const currentOrder = orderedSubRowColumns.map(col => col.key);
    const draggedIndex = currentOrder.indexOf(draggedColumn);
    const targetIndex = currentOrder.indexOf(targetColumnKey);

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    onReorderSubRowColumns(newOrder);
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, [draggedColumn, orderedSubRowColumns, onReorderSubRowColumns]);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  const handleEdit = useCallback((columnKey: string) => {
    const currentValue = row[columnKey];
    setTempValue(String(currentValue || ''));
    onSubRowEditStart(rowIndex, columnKey);
  }, [row, rowIndex, onSubRowEditStart]);

  const handleSave = useCallback((columnKey: string) => {
    onSubRowEdit(rowIndex, columnKey, tempValue);
    setTempValue('');
  }, [rowIndex, tempValue, onSubRowEdit]);

  const handleCancel = useCallback(() => {
    onSubRowEditCancel();
    setTempValue('');
  }, [onSubRowEditCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, columnKey: string) => {
    if (e.key === 'Enter') {
      handleSave(columnKey);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const renderSubRowCellValue = useCallback((value: any, column: GridColumnConfig) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;
    const isEditable = column.editable;

    if (isEditing) {
      return (
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => handleSave(column.key)}
          onKeyDown={(e) => handleKeyDown(e, column.key)}
          className="w-full h-8 text-sm"
          autoFocus
        />
      );
    }

    if (value === null || value === undefined) {
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
        } else if (column.key === "CustomerOrders") {
          // return (
          //   <div className="font-normal truncate text-[13px] text-blue-600" title={firstCustomer?.CustomerOrder}>
          //     <a>{firstCustomer?.CustomerOrder}</a>
          //   </div>
          // );
          const customerOrders = row?.CustomerOrderDetails || [];
          return (
            <>
              {customerOrders.length > 0 ? (
                <div className="font-medium text-[13px] text-Primary-500">
                  {customerOrders.map((customer: any, index: number) => (
                    <span key={index} className="hover:underline cursor-pointer text-Primary-500 font-medium" title={customer.CustomerOrder}>
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
      // None of the above matched, so
      return <span className="text-gray-400">-</span>;
    } else if (typeof value === 'object' && value !== null) {
      // Handle object values (excluding Badge type)
      if (column.key == "CustomerOrderDetails" && column.type === 'CustomerCountBadge') {
        const customerData = row?.CustomerOrderDetails || [];
        return (
          <CustomerCountBadge
            count={customerData?.length}
            customers={customerData}
            className="text-center"
          />
        );
      }
      if (column.key == "WorkOrderDetails" && column.type === 'CustomerCountBadge') {
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
      if (column.key == "IncidentDetails" && column.type === 'CustomerCountBadge') {
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
    }
    // else if (column.key == "OrderDetailsList" && column.type === 'CustomerCountBadge') {
    //   let OrderData = row?.CustomerOrderDetails || [];
    //   return (
    //     <OrderCountBadge
    //       count={OrderData?.length}
    //       COrderaData={OrderData}
    //       className="text-center"
    //     />
    //   );
    // }

    const displayContent = (() => {
      switch (column.type) {
        case 'Badge':
          let displayValue: string;
          let statusColor: string;

          if (typeof value === 'object' && value !== null && 'value' in value) {
            displayValue = value.value;
            statusColor = value.variant || 'bg-gray-50 text-gray-600 border border-gray-200';
          } else {
            displayValue = String(value || '');
            statusColor = 'bg-gray-50 text-gray-600 border border-gray-200';
          }

          return (
            <Badge className={cn("text-xs", statusColor)}>
              {displayValue}
            </Badge>
          );
        case 'DateTimeRange':
          // const dateTimeString = String(value);
          // if (dateTimeString.includes('\n')) {
          //   const [startDateTime, endDateTime] = dateTimeString.split('\n');
          //   return (
          //     <div className="space-y-1">
          //       {/* <div className="text-xs text-gray-500">Start:</div> */}
          //       <div className="font-normal text-sm">{startDateTime} & {endDateTime}</div>
          //       {/* <div className="text-xs text-gray-500">End:</div> */}
          //       {/* <div className="font-medium text-sm">{endDateTime}</div> */}
          //     </div>
          //   );
          // }
          // return <div className="font-medium text-sm">{dateTimeString}</div>;
          if (!value) return <div className="text-gray-400">-</div>;
          try {
            const date = new Date(value);
            const formattedDate = dateTimeFormatter(date);
            return <span className="truncate" title={formattedDate}>{formattedDate}</span>;
          } catch {
            return <span className="truncate" title={String(value)}>{value}</span>;
          }
        case 'Date':
          try {
            const date = new Date(value);
            return <div className="font-normal text-[13px]">{dateFormatter(date)}</div>;
          } catch {
            return <div className="font-normal text-[13px]">{String(value)}</div>;
          }
        case 'DateFormat':
          try {
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;
            return <span className="truncate" title={formattedDate}>{formattedDate}</span>;
          } catch {
            return <span className="truncate" title={String(value)}>{String(value)}</span>;
          }
        case 'CurrencyWithSymbol':
          return <div className="font-normal text-[13px] break-words">&euro; {formattedAmount(value)}</div>;

        default:
          return <div className="font-normal text-[13px] break-words">{String(value)}</div>;
      }
    })();

    if (isEditable) {
      return (
        <div className="group relative">
          {displayContent}
          <button
            onClick={() => handleEdit(column.key)}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit2 className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      );
    }

    return displayContent;
  }, [editingCell, rowIndex, tempValue, handleSave, handleKeyDown, handleEdit]);

  if (orderedSubRowColumns.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No sub-row columns configured
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-2 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {orderedSubRowColumns.map((column) => {
          const value = row[column.key];
          const isDragged = draggedColumn === column.key;
          const isDragOver = dragOverColumn === column.key;

          return (
            <div
              key={column.key}
              className={cn(
                "group relative p-2 bg-white rounded border transition-all duration-200 ease-in-out cursor-move",
                isDragged && "opacity-50 scale-95 shadow-lg",
                isDragOver && "bg-blue-100 border-blue-300 scale-105",
                "hover:shadow-md"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, column.key)}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
              onDragEnd={handleDragEnd}
              aria-grabbed={isDragged}
              aria-dropeffect="move"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <GripVertical className="h-4 w-4 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-gray-500 tracking-wide font-medium">
                      {/* {column.label} */}
                      {preferences?.columnHeaders[column.key] || column.label}
                    </div>
                    {column.editable && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Editable
                      </div>
                    )}
                  </div>
                  <div className="text-[13px] font-normal text-Gray-800">
                    {renderSubRowCellValue(value, column)}
                  </div>
                </div>
              </div>

              {/* Drag indicator overlay */}
              {isDragOver && (
                <div className="absolute inset-0 bg-blue-200/30 rounded-lg border-2 border-blue-400 border-dashed animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
