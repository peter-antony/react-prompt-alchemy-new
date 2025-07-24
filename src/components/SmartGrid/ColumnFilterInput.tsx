
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterValue } from '@/types/filterSystem';
import { GridColumnConfig } from '@/types/smartgrid';

interface ColumnFilterInputProps {
  column: GridColumnConfig;
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
  onApply: () => void;
  isSubRow?: boolean;
}

export function ColumnFilterInput({ 
  column, 
  value, 
  onChange, 
  onApply,
  isSubRow = false 
}: ColumnFilterInputProps) {
  const [localValue, setLocalValue] = useState<any>(value?.value || '');
  const [operator, setOperator] = useState<string>(value?.operator || getDefaultOperator());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setLocalValue(value?.value || '');
    setOperator(value?.operator || getDefaultOperator());
  }, [value]);

  function getDefaultOperator(): string {
    switch (column.type) {
      case 'Date':
      case 'DateTimeRange':
        return 'equals';
      default:
        return 'contains';
    }
  }

  const handleValueChange = (newValue: any) => {
    setLocalValue(newValue);
    
    if (newValue === '' || newValue == null) {
      onChange(undefined);
    } else {
      onChange({
        value: newValue,
        operator: operator as any,
        type: getFilterType()
      });
    }
  };

  const handleOperatorChange = (newOperator: string) => {
    setOperator(newOperator);
    if (localValue !== '' && localValue != null) {
      onChange({
        value: localValue,
        operator: newOperator as any,
        type: getFilterType()
      });
    }
  };

  const getFilterType = (): FilterValue['type'] => {
    switch (column.type) {
      case 'Date':
      case 'DateTimeRange':
        return 'date';
      case 'Dropdown':
        return 'select';
      default:
        return 'text';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onApply();
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange(undefined);
    onApply();
  };

  const getAvailableOperators = () => {
    switch (column.type) {
      case 'Date':
      case 'DateTimeRange':
        return [
          { value: 'equals', label: 'Equals (=)', symbol: '=' },
          { value: 'gt', label: 'Greater than (>)', symbol: '>' },
          { value: 'lt', label: 'Less than (<)', symbol: '<' },
          { value: 'gte', label: 'Greater or equal (>=)', symbol: '>=' },
          { value: 'lte', label: 'Less or equal (<=)', symbol: '<=' },
        ];
      default:
        return [
          { value: 'contains', label: 'Contains', symbol: '⊃' },
          { value: 'equals', label: 'Equals', symbol: '=' },
          { value: 'startsWith', label: 'Starts with', symbol: '⌐' },
          { value: 'endsWith', label: 'Ends with', symbol: '¬' },
        ];
    }
  };

  const getCurrentOperatorSymbol = () => {
    const operators = getAvailableOperators();
    const current = operators.find(op => op.value === operator);
    return current?.symbol || '⊃';
  };

  const renderFilterInput = () => {
    switch (column.type) {
      case 'Dropdown':
        return (
          <Select value={localValue} onValueChange={handleValueChange}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="" className="text-xs">All</SelectItem>
              {column.options?.map(option => (
                <SelectItem key={option} value={option} className="text-xs">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'Date':
      case 'DateTimeRange':
        return (
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-7 text-xs justify-start text-left font-normal",
                  !localValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {localValue ? format(new Date(localValue), "MMM dd, yyyy") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
              <Calendar
                mode="single"
                selected={localValue ? new Date(localValue) : undefined}
                onSelect={(date) => {
                  handleValueChange(date ? date.toISOString() : '');
                  setShowDatePicker(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onApply}
            placeholder={`Filter ${column.label.toLowerCase()}...`}
            className="h-7 text-xs"
          />
        );
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 p-1 bg-white rounded border shadow-sm transition-all",
      isSubRow && "bg-blue-50 border-blue-200"
    )}>
      {/* Operator symbol with dropdown - shows on hover and click */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-2 p-0 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center justify-center"
            title="Change filter operator"
          >
            <span className="text-xs font-medium">{getCurrentOperatorSymbol()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border shadow-lg z-50" align="start">
          {getAvailableOperators().map(op => (
            <DropdownMenuItem
              key={op.value}
              onClick={() => handleOperatorChange(op.value)}
              className={cn(
                "text-xs cursor-pointer",
                operator === op.value && "bg-blue-50 text-blue-700"
              )}
            >
              <span className="mr-2">{op.symbol}</span>
              {op.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1">
        {renderFilterInput()}
      </div>
      
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-6 w-6 p-0 hover:bg-red-100"
        >
          <X className="h-3 w-3 text-red-500" />
        </Button>
      )}
    </div>
  );
}
