
import React, { useState, useCallback } from 'react';
import { GridColumnConfig, GridPreferences } from '@/types/smartgrid';
import { GripVertical, Edit2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { dateFormatter, dateTimeFormatter, formattedAmount } from '@/utils/formatter';
import { format } from 'date-fns';
import { CustomerCountBadge } from './CustomerCountBadge';
import { WorkOrderBadge } from './WorkOrderBadge';
import { OrderCountBadge } from './OrderCountBadge';
import { IncidentBadgeComponent } from './BadgeComponents/IncidentBadge';
import { LazySelect } from './LazySelect';

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

    const handleEdit = useCallback((columnKey: string, column: GridColumnConfig) => {
        const currentValue = row[columnKey];
        // For date fields, keep the date format
        if (column.type === 'Date' || column.type === 'DateFormat' || column.type === 'DateTimeRange') {
            setTempValue(currentValue || '');
        } else {
            setTempValue(String(currentValue || ''));
        }
        onSubRowEditStart(rowIndex, columnKey);
    }, [row, rowIndex, onSubRowEditStart]);

    const handleSave = useCallback((columnKey: string, column: GridColumnConfig) => {
        let finalValue: any = tempValue;

        // Convert value based on column type
        if (column.type === 'Integer') {
            finalValue = parseInt(tempValue) || 0;
        } else if (column.type === 'CurrencyWithSymbol') {
            finalValue = parseFloat(tempValue) || 0;
        }

        onSubRowEdit(rowIndex, columnKey, finalValue);
        setTempValue('');
    }, [rowIndex, tempValue, onSubRowEdit]);

    const handleCancel = useCallback(() => {
        onSubRowEditCancel();
        setTempValue('');
    }, [onSubRowEditCancel]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, columnKey: string, column: GridColumnConfig) => {
        if (e.key === 'Enter') {
            handleSave(columnKey, column);
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    const renderEditInput = useCallback((column: GridColumnConfig) => {
        const columnType = column.type;

        switch (columnType) {
            case 'String':
            case 'Text':
            case 'EditableText':
                return (
                    <Input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(column.key, column)}
                        onKeyDown={(e) => handleKeyDown(e, column.key, column)}
                        className="w-full h-8 text-sm"
                        autoFocus
                    />
                );

            case 'Integer':
                return (
                    <Input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(column.key, column)}
                        onKeyDown={(e) => handleKeyDown(e, column.key, column)}
                        className="w-full h-8 text-sm"
                        autoFocus
                    />
                );

            case 'CurrencyWithSymbol':
                return (
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            €
                        </span>
                        <Input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleSave(column.key, column)}
                            onKeyDown={(e) => handleKeyDown(e, column.key, column)}
                            className="w-full h-8 text-sm pl-6"
                            step="0.01"
                            autoFocus
                        />
                    </div>
                );

            case 'Time':
                return (
                    <div className="relative">
                        <Input
                            type="time"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleSave(column.key, column)}
                            onKeyDown={(e) => handleKeyDown(e, column.key, column)}
                            className="w-full h-8 text-sm"
                            autoFocus
                        />
                        <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                );

            case 'Date':
            case 'DateFormat':
            case 'DateTimeRange':
                const dateValue = tempValue ? new Date(tempValue) : undefined;
                return (
                    <Popover defaultOpen>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full h-8 justify-start text-left font-normal text-sm px-3",
                                    !dateValue && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {dateValue ? format(dateValue, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateValue}
                                onSelect={(date) => {
                                    const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                                    setTempValue(dateString);
                                    onSubRowEdit(rowIndex, column.key, dateString);
                                }}
                                initialFocus
                                className="p-3"
                            />
                        </PopoverContent>
                    </Popover>
                );

            case 'Select':
            case 'Dropdown':
                return (
                    <select
                        value={tempValue}
                        onChange={(e) => {
                            setTempValue(e.target.value);
                            onSubRowEdit(rowIndex, column.key, e.target.value);
                        }}
                        onBlur={() => handleCancel()}
                        className="w-full h-8 px-2 text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        autoFocus
                    >
                        <option value="">Select...</option>
                        {column.options?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case 'LazySelect':
                if (!column.fetchOptions) {
                    return (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            fetchOptions is required for LazySelect
                        </div>
                    );
                }
                return (
                    <div className="relative z-50">
                        <LazySelect
                            fetchOptions={column.fetchOptions}
                            value={row[column.key]}
                            onChange={(value) => {
                                onSubRowEdit(rowIndex, column.key, value);
                            }}
                            placeholder="Select..."
                            className="h-8 text-sm"
                            hideSearch={column.hideSearch}
                            disableLazyLoading={column.disableLazyLoading}
                            returnType={column.returnType}
                        />
                    </div>
                );

            default:
                return (
                    <Input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(column.key, column)}
                        onKeyDown={(e) => handleKeyDown(e, column.key, column)}
                        className="w-full h-8 text-sm"
                        autoFocus
                    />
                );
        }
    }, [tempValue, rowIndex, handleSave, handleKeyDown, handleCancel, onSubRowEdit]);

    const renderSubRowCellValue = useCallback((value: any, column: GridColumnConfig) => {
        const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;
        const isEditable = column.editable;

        if (isEditing) {
            return renderEditInput(column);
        }

        if (value === null || value === undefined) {
            let customContent = null;

            if (column.type === "TextCustom") {
                const firstCustomer = row?.CustomerOrderDetails?.[0]; // only first element

                if (column.key === "CustomerTransportMode") {
                    customContent = (
                        <div className="text-Gray-800 font-normal truncate text-[13px]">
                            {firstCustomer?.TransportMode}
                        </div>
                    );
                } else if (column.key === "CustomerService") {
                    customContent = (
                        <div className="text-Gray-800 font-normal truncate text-[13px]" title={firstCustomer?.ServiceDescription}>
                            {firstCustomer?.ServiceDescription}
                        </div>
                    );
                } else if (column.key === "CustomerSubService") {
                    customContent = (
                        <div className="text-Gray-800 font-normal truncate text-[13px]" title={firstCustomer?.SubServiceDescription}>
                            {firstCustomer?.SubServiceDescription}
                        </div>
                    );
                } else if (column.key === "CustomerOrders") {
                    const customerOrders = row?.CustomerOrderDetails || [];
                    customContent = (
                        <>
                            {customerOrders.length > 0 ? (
                                <div className="font-medium text-[13px] text-Primary-500">
                                    {customerOrders.map((customer: any, index: number) => (
                                        <span key={index} className="hover:underline cursor-pointer text-Primary-500 font-medium" title={customer.CustomerOrder}>
                                            {customer.CustomerOrder}
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

                // If we have custom content and the column is editable, wrap it with edit functionality
                if (customContent && isEditable) {
                    return (
                        <div className="group flex items-center justify-between w-full">
                            <div className="flex-1 min-w-0">{customContent}</div>
                            <button
                                onClick={() => handleEdit(column.key, column)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded ml-2 flex-shrink-0"
                                title="Edit"
                            >
                                <Edit2 className="h-3 w-3 text-gray-500" />
                            </button>
                        </div>
                    );
                }

                // If we have custom content but not editable, return as is
                if (customContent) {
                    return customContent;
                }
            }
            // None of the above matched, render dash with edit icon if editable
            const emptyContent = <span className="text-gray-400">-</span>;
            if (isEditable) {
                return (
                    <div className="group flex items-center justify-between w-full">
                        <span className="text-gray-400">-</span>
                        <button
                            onClick={() => handleEdit(column.key, column)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded ml-2"
                            title="Edit"
                        >
                            <Edit2 className="h-3 w-3 text-gray-500" />
                        </button>
                    </div>
                );
            }
            return emptyContent;
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
                <div className="group flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0">{displayContent}</div>
                    <button
                        onClick={() => handleEdit(column.key, column)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded ml-2 flex-shrink-0"
                        title="Edit"
                    >
                        <Edit2 className="h-3 w-3 text-gray-500" />
                    </button>
                </div>
            );
        }

        return displayContent;
    }, [editingCell, rowIndex, tempValue, handleSave, handleKeyDown, handleEdit, renderEditInput]);

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