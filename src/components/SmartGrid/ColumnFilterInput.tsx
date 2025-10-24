import React, { useState, useEffect, useRef } from 'react';
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
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [rangeFrom, setRangeFrom] = useState<string>('');
  const [rangeTo, setRangeTo] = useState<string>('');
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [textValue, setTextValue] = useState<string>('');
  const [dropdownMode, setDropdownMode] = useState<'dropdown' | 'text'>('dropdown');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);
  const toNumberInputRef = useRef<HTMLInputElement>(null);

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

    // Initialize complex field values for specific types
    if (column.type === 'NumberRange' && value?.value && typeof value.value === 'object') {
      setRangeFrom(value.value.from || '');
      setRangeTo(value.value.to || '');
    } else if (column.type === 'DateRange' && value?.value && typeof value.value === 'object') {
      // Date range uses object with from/to
      setLocalValue(value.value);
    } else {
      // For simple values (text, dropdown, dropdownText)
      if (column.type === 'DropdownText') {
        // DropdownText may be a simple string OR an object containing both dropdown and text values
        if (value?.value) {
          if (typeof value.value === 'object') {
            const dv = value.value.dropdown || '';
            const tv = value.value.text || '';
            setDropdownValue(dv);
            setTextValue(tv);
            setDropdownMode(dv ? 'dropdown' : (tv ? 'text' : 'dropdown'));
          } else {
            // string value: determine if it matches a dropdown option or is free text
            const isDropdownOption = column.options?.some((opt: any) => opt.name === value?.value || opt.id === value?.value);
            if (isDropdownOption) {
              setDropdownValue(value.value);
              setTextValue('');
              setDropdownMode('dropdown');
            } else {
              setDropdownValue('');
              setTextValue(value.value);
              setDropdownMode('text');
            }
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
    // if (from && to && parseFloat(to) < parseFloat(from)) {
    //   return; // Don't update if to is less than from
    // }

    // Always update the state to allow typing
    setRangeFrom(from);
    setRangeTo(to);

    // Only validate and send onChange when both values are valid numbers
    // or when clearing the fields
    if (from === '' && to === '') {
      onChange(undefined);
    } else {
      // Allow partial input, only validate when both are non-empty numbers
      const fromNum = parseFloat(from);
      const toNum = parseFloat(to);

      // If both are valid numbers and to < from, don't send the change
      // but still allow the user to continue typing
      if (from && to && !isNaN(fromNum) && !isNaN(toNum) && toNum < fromNum) {
        // Don't send onChange, but allow the UI state to update
        return;
      }
      onChange({
        value: { from, to },
        operator: 'between' as any,
        type: 'number'
      });
    }
  };

  const handleDropdownTextChange = (dropdown: string, text: string, mode?: 'dropdown' | 'text', column?: any) => {
    // Preserve the other field when updating one so both can be sent (AND semantics)
    console.log('column: ', column);
    if (mode === 'dropdown') {
      setDropdownValue(dropdown);
      setDropdownMode('dropdown');
      const currentText = textValue;
      // If both empty -> clear filter
      if (!dropdown && !currentText) {
        onChange(undefined);
      } else {
        // Always emit an object so upstream can manipulate both values
        onChange({
          value: { dropdown: dropdown || '', text: currentText || '' },
          operator: 'contains' as any,
          type: 'text'
        });
      }
    } else if (mode === 'text') {
      setTextValue(text);
      setDropdownMode('text');
      const currentDropdown = dropdownValue;
      if (!text && !currentDropdown) {
        onChange(undefined);
      } else {
        onChange({
          value: { dropdown: currentDropdown || '', text: text || '' },
          operator: 'contains' as any,
          type: 'text'
        });
      }
    }
  };


  const handleDateRangeChange = (type: 'from' | 'to', date: string) => {
    // console.log('handleDateRangeChange called:', { type, date });
    const currentValue = localValue || { from: '', to: '' };
    const newValue = { ...currentValue, [type]: date };

    // validation: both dates must be chronological
    if (newValue.from && newValue.to) {
      const fromDate = new Date(newValue.from);
      const toDate = new Date(newValue.to);

      if (fromDate > toDate) {
        return false; // invalid range, don't update or close
      }
    }

    if (!newValue.from && !newValue.to) {
      setLocalValue(undefined);
      onChange(undefined);
    } else {
      setLocalValue(newValue);
      onChange({
        value: newValue,
        operator: 'between',
        type: 'dateRange',
      });
    }

    return true; // valid update
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
                <SelectItem value="__all__" className="text-xs">Select {column?.label.toLowerCase()}</SelectItem>
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
                  "h-7 text-xs justify-start text-left font-normal w-full",
                  !localValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {localValue ? format(new Date(localValue), "dd/MM/yyyy") : column.label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
              <Calendar
                mode="single"
                selected={localValue ? new Date(localValue) : undefined}
                onSelect={(date) => {
                  handleValueChange(date ? date.toLocaleDateString('en-CA') : '');
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
            <Popover open={showFromPicker} onOpenChange={setShowFromPicker}>
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
                    // // handleDateRangeChange('from', date ? date.toISOString() : '');
                    // handleDateRangeChange('from', date ? date.toLocaleDateString('en-CA') : '');
                    // setShowFromPicker(false);
                    const newDate = date ? date.toLocaleDateString('en-CA') : '';
                    const updated = handleDateRangeChange('from', newDate);
                    if (updated) {
                      setShowFromPicker(false); // close only when accepted
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">to</span>
            <Popover open={showToPicker} onOpenChange={setShowToPicker}>
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
                    // handleDateRangeChange('to', date ? date.toLocaleDateString('en-CA') : '');
                    // setShowToPicker(false);
                    const newDate = date ? date.toLocaleDateString('en-CA') : '';
                    const updated = handleDateRangeChange('to', newDate);
                    if (updated) setShowToPicker(false); // close only if valid
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'NumberRange':
        const handleNumberInput = (value: string) => {
          // Remove periods/dots from the input
          return value.replace(/\./g, '');
        };
        return (
          <div className="flex items-center gap-1">
            <Input
              value={rangeFrom}
              onChange={(e) => {
                const cleanValue = handleNumberInput(e.target.value);
                handleRangeChange(cleanValue, rangeTo);
              }}
              onKeyDown={(e) => {
                // Prevent period/dot key
                if (e.key === '.') {
                  e.preventDefault();
                }
              }}
              placeholder="From"
              className="h-7 text-xs flex-1"
              type="number"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <Input
              ref={toNumberInputRef}
              value={rangeTo}
              onChange={(e) => {
                const cleanValue = handleNumberInput(e.target.value);
                handleRangeChange(rangeFrom, cleanValue);
              }}
              onKeyDown={(e) => {
                // Prevent period/dot key
                if (e.key === '.') {
                  e.preventDefault();
                }
              }}
              onBlur={() => {
                if (rangeFrom && rangeTo && parseFloat(rangeTo) < parseFloat(rangeFrom)) {
                  setRangeTo('');
                  handleRangeChange(rangeFrom, '');
                  setTimeout(() => {
                    toNumberInputRef.current?.focus();
                  }, 0);
                }
              }}
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
                handleDropdownTextChange(newValue, '', 'dropdown', column);
              }}
            >
              <SelectTrigger
                className="h-7 text-xs flex-1"
                onFocus={() => setDropdownMode('dropdown')}
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="__all__" className="text-xs">Select {column?.label.toLowerCase()}</SelectItem>
                {column.options?.map((option: any, index) => (
                  option.name ? (
                    <SelectItem key={(option.name || option.label || option) + '-' + index}
                      value={option.name ? option.name : option.id}
                      className="text-xs"
                    >
                      { (option.id && option.name) ? `${option.id} || ${option.name}` : (option.id || option.name) }
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground"></div>
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
      "flex items-center gap-1 transition-all h-9 relative",
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
          className="h-5 w-5 p-0 hover:bg-red-100 absolute right-0"
        >
          {/* <X className="h-3 w-3 text-red-500" /> */}
        </Button>
      )}
    </div>
  );
}