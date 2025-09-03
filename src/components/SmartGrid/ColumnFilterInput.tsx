import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterValue } from '@/types/filterSystem';
import { GridColumnConfig } from '@/types/smartgrid';
import { DateRange } from 'react-day-picker';

interface ColumnFilterInputProps {
  column: GridColumnConfig;
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
  onApply?: () => void;
  isSubRow?: boolean;
  showFilterTypeDropdown?: boolean;
  renderOptionLabel?: (option: any) => any;
  renderOptionValue?: (option: any) => any;
}

export function ColumnFilterInput({ 
  column, 
  value, 
  onChange, 
  onApply,
  isSubRow = false,
  showFilterTypeDropdown = true,
  renderOptionLabel,
  renderOptionValue
}: ColumnFilterInputProps) {
  const [localValue, setLocalValue] = useState<any>(value?.value || '');
  const [operator, setOperator] = useState<string>(value?.operator || getDefaultOperator());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [rangeFrom, setRangeFrom] = useState<string>('');
  const [rangeTo, setRangeTo] = useState<string>('');
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [textValue, setTextValue] = useState<string>('');
  const [dropdownMode, setDropdownMode] = useState<'dropdown' | 'text'>('dropdown');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  useEffect(() => {
    setLocalValue(value?.value || '');
    setOperator(value?.operator || getDefaultOperator());
    
    // Initialize multi-select values
    if (column.multiSelect && column.type === 'Dropdown') {
      if (value?.value && Array.isArray(value.value)) {
        setSelectedOptions(value.value);
      } else {
        setSelectedOptions([]);
      }
    }
    
    // Initialize complex field values
    if (value?.value && typeof value.value === 'object') {
      if (column.type === 'NumberRange') {
        setRangeFrom(value.value.from || '');
        setRangeTo(value.value.to || '');
      } else if (column.type === 'DateRange') {
        // Date range uses object with from/to
        setLocalValue(value.value);
      }
    } else {
      // For simple values (text, dropdown, dropdownText)
      if (column.type === 'DropdownText') {
        // DropdownText now uses simple string value
        if (value?.value) {
          // Check if it's a dropdown option or free text
          // const isDropdownOption = column.options?.includes(value.value);
          const isDropdownOption = column.options?.some((opt: any) => opt.name === value?.value);
          if (isDropdownOption) {
            setDropdownValue(value.value);
            setTextValue('');
            setDropdownMode('dropdown');
          } else {
            setDropdownValue('');
            setTextValue(value.value);
            setDropdownMode('text');
          }
        } else {
          setDropdownValue('');
          setTextValue('');
          setDropdownMode('dropdown');
        }
      }
      setRangeFrom('');
      setRangeTo('');
    }
  }, [value, column.type, column.options, column.multiSelect]);

  function getDefaultOperator(): string {
    switch (column.type) {
      case 'Date':
      case 'DateTimeRange':
      case 'DateRange':
        return 'equals';
      case 'NumberRange':
        return 'between';
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
      case 'DateRange':
        return 'dateRange';
      case 'NumberRange':
        return 'number';
      case 'Dropdown':
        return 'select';
      default:
        return 'text';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Remove auto-search on Enter key press
    // Search will only happen on Search button click
  };

  const handleClear = () => {
    setLocalValue('');
    setRangeFrom('');
    setRangeTo('');
    setDropdownValue('');
    setTextValue('');
    setDropdownMode('dropdown');
    setSelectedOptions([]);
    onChange(undefined);
    // onApply will be called automatically when the parent updates filters
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
      case 'DateRange':
      case 'NumberRange':
        return [
          { value: 'between', label: 'Between', symbol: '⟷' },
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

  const handleRangeChange = (from: string, to: string) => {
    // Validate that to >= from if both values are provided
    if (from && to && parseFloat(to) < parseFloat(from)) {
      return; // Don't update if to is less than from
    }
    
    setRangeFrom(from);
    setRangeTo(to);
    
    if (from === '' && to === '') {
      onChange(undefined);
    } else {
      onChange({
        value: { from, to },
        operator: 'between' as any,
        type: 'number'
      });
    }
  };

  const handleDropdownTextChange = (dropdown: string, text: string, mode?: 'dropdown' | 'text') => {
    if (mode === 'dropdown') {
      setDropdownValue(dropdown);
      setTextValue(''); // Clear text when using dropdown
      setDropdownMode('dropdown');
      
      if (dropdown === '') {
        onChange(undefined);
      } else {
        onChange({
          value: dropdown,
          operator: 'contains' as any,
          type: 'text'
        });
      }
    } else if (mode === 'text') {
      setTextValue(text);
      setDropdownValue(''); // Clear dropdown when using text
      setDropdownMode('text');
      
      if (text === '') {
        onChange(undefined);
      } else {
        onChange({
          value: text,
          operator: 'contains' as any,
          type: 'text'
        });
      }
    }
  };

  const handleDateRangeChange = (type: 'from' | 'to', date: string) => {
    const currentValue = localValue || { from: '', to: '' };
    const newValue = {
      ...currentValue,
      [type]: date
    };
    
    // Validate that to date >= from date if both are provided
    if (newValue.from && newValue.to && new Date(newValue.to) < new Date(newValue.from)) {
      return; // Don't update if to date is less than from date
    }
    
    if (newValue.from === '' && newValue.to === '') {
      setLocalValue(undefined);
      onChange(undefined);
    } else {
      setLocalValue(newValue);
      onChange({
        value: newValue,
        operator: 'between' as any,
        type: 'dateRange'
      });
    }
  };

  const renderFilterInput = () => {
    switch (column.type) {
      case 'Dropdown':
        if (column.multiSelect) {
          // Multi-select dropdown
          const handleMultiSelectChange = (option: string, checked: boolean) => {
            let newSelected: string[];
            if (checked) {
              newSelected = [...selectedOptions, option];
            } else {
              newSelected = selectedOptions.filter(item => item !== option);
            }
            
            setSelectedOptions(newSelected);
            
            if (newSelected.length === 0) {
              onChange(undefined);
            } else {
              onChange({
                value: newSelected,
                operator: 'contains' as any,
                type: 'select'
              });
            }
          };

          return (
            <Popover open={isMultiSelectOpen} onOpenChange={setIsMultiSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-7 text-xs justify-between text-left font-normal",
                    selectedOptions.length === 0 && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {selectedOptions.length === 0 
                      ? "Select options..." 
                      : `${selectedOptions.length} selected`
                    }
                  </span>
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0 bg-white border shadow-lg z-[100]" align="start">
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  {column.options?.map((option: any, index) => (
                    <div key={(option.name || option.label || option) + '-' + index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`multi-${option.name || option.label || option}`}
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={(checked) => handleMultiSelectChange(option.id, checked as boolean)}
                      />
                      <label 
                        htmlFor={`multi-${option.name || option.label || option}`}
                        className="text-xs cursor-pointer flex-1 select-none"
                      >
                        {option.name || option.label || option}
                      </label>
                    </div>
                  ))}
                  {selectedOptions.length > 0 && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOptions([]);
                          onChange(undefined);
                        }}
                        className="h-6 text-xs w-full"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        } else {
          // Single select dropdown (original functionality)
          return (
            <Select value={localValue || "__all__"} onValueChange={(value) => handleValueChange(value === "__all__" ? "" : value)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="__all__" className="text-xs">All</SelectItem>
                {column.options?.map((option: any, index) => (
                  option.name ? (
                    <SelectItem key={(option.name || option.label || option) + '-' + index}
      value={(option.name ? option.name : option.id)}
      className="text-xs"
    >
    {option.description ? `${option.name} || ${option.description}` : option.name}
  </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
          );
        }

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
                {localValue ? format(new Date(localValue), "dd/MM/yyyy") : "Pick date"}
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
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        );

      case 'DateRange':
        return (
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-7 text-xs justify-start text-left font-normal flex-1",
                    !localValue?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {localValue?.from 
                    ? format(new Date(localValue.from), "dd/MM/yyyy")
                    : "From date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={localValue?.from ? new Date(localValue.from) : undefined}
                  onSelect={(date) => {
                    // handleDateRangeChange('from', date ? date.toISOString() : '');
                    handleDateRangeChange('from', date ? date.toLocaleDateString('en-CA') : '');
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-7 text-xs justify-start text-left font-normal flex-1",
                    !localValue?.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {localValue?.to 
                    ? format(new Date(localValue.to), "dd/MM/yyyy")
                    : "To date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={localValue?.to ? new Date(localValue.to) : undefined}
                  onSelect={(date) => {
                    handleDateRangeChange('to', date ? date.toLocaleDateString('en-CA') : '');
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'NumberRange':
        return (
          <div className="flex items-center gap-1">
            <Input
              value={rangeFrom}
              onChange={(e) => handleRangeChange(e.target.value, rangeTo)}
              placeholder="From"
              className="h-7 text-xs flex-1"
              type="number"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <Input
              value={rangeTo}
              onChange={(e) => handleRangeChange(rangeFrom, e.target.value)}
              placeholder="To"
              className="h-7 text-xs flex-1"
              type="number"
            />
          </div>
        );

      case 'DropdownText':
        return (
          <div className="flex items-center gap-1">
            <Select 
              value={dropdownValue || "__all__"} 
              onValueChange={(value) => {
                const newValue = value === "__all__" ? "" : value;
                handleDropdownTextChange(newValue, '', 'dropdown');
              }}
            >
              <SelectTrigger 
                className="h-7 text-xs flex-1"
                onFocus={() => setDropdownMode('dropdown')}
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="__all__" className="text-xs">All</SelectItem>
                {column.options?.map((option: any, index) => (
                  option.name ? (
                    <SelectItem key={(option.name || option.label || option) + '-' + index}
    value={option.name ? option.name : option.id}
    className="text-xs"
  >
    {option.description ? `${option.name} || ${option.description}` : option.name}
  </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">OR</div>
            <Input
              value={textValue}
              onChange={(e) => handleDropdownTextChange('', e.target.value, 'text')}
              onFocus={() => setDropdownMode('text')}
              placeholder="Type text..."
              className="h-7 text-xs flex-1"
            />
          </div>
        );

      default:
        return (
          <Input
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Filter ${column.label.toLowerCase()}...`}
            className="h-7 text-xs"
          />
        );
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 p-1 bg-white rounded border shadow-sm transition-all h-9",
      isSubRow && "bg-blue-50 border-blue-200"
    )}>
      {/* Operator symbol with dropdown - only show if enabled */}
      {showFilterTypeDropdown && (
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
      )}

      <div className="flex-1">
        {renderFilterInput()}
      </div>
      
      {((localValue !== '' && localValue != null) || rangeFrom !== '' || rangeTo !== '' || dropdownValue !== '' || textValue !== '' || (localValue?.from || localValue?.to) || selectedOptions.length > 0) && (
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