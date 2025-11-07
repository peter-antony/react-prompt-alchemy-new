import React, { useState, useEffect } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { InputDropdown } from '@/components/ui/input-dropdown';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FieldConfig } from '@/types/dynamicPanel';
import { DynamicLazySelect } from './DynamicLazySelect';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import jsonStore from '@/stores/jsonStore';

interface FieldRendererProps {
  config: FieldConfig;
  control: Control<any>;
  fieldId: string;
  tabIndex?: number;
  validationErrors?: Record<string, string>;
  mandatory:boolean;
  allowedType?: string; // To restrict input types
  tooltip?: string;
}

// Add this helper above your component:
const getFieldBorderClass = (mandatory: boolean, value: any) => {
  if (mandatory && value && value !== '' && !(typeof value === 'object' && Object.values(value).every(v => !v))) {
    // Value entered for mandatory field: bright green border
    return;
    // return "border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.20)]";
  }
  if (mandatory) {
    // Mandatory but empty: red border
    return;
    // return "border-red-300 shadow-[0_0_0_2px_rgba(239,68,68,0.10)]";
  }
  return "";
};

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  config,
  control,
  fieldId,
  tabIndex,
  validationErrors = {},
  mandatory,
  allowedType,
  tooltip
}) => {
  // Remove searchData from destructuring as it's not part of FieldConfig type
  const { fieldType, editable, placeholder, options, color, fieldColour, events } = config;
  // For search fieldType, get searchData from config as any (if present)
  const searchData: string[] | undefined = (config as any).searchData;

  // Helper function to create event handlers that include field value
  const createEventHandlers = (field: any) => ({
    onClick: events?.onClick ? (e: React.MouseEvent) => events.onClick?.(e, field.value) : undefined,
    onChange: events?.onChange ? (e: React.ChangeEvent<any>) => {
      field.onChange(e); // Call react-hook-form's onChange first
      events.onChange?.(e.target.value, e);
    } : field.onChange,
    onFocus: events?.onFocus,
    onBlur: events?.onBlur,
    onKeyDown: events?.onKeyDown,
    onKeyUp: events?.onKeyUp,
    onMouseEnter: events?.onMouseEnter,
    onMouseLeave: events?.onMouseLeave,
  });

  if (!editable) {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <div>
            {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
            <div className="text-[13px] text-gray-700 bg-gray-50 p-2 rounded border h-8 flex items-center">
              {field.value || '-'}
            </div>
          </div>
        )}
      />
    );
  }

  const hasError = validationErrors[fieldId];
  const baseInputClasses = `h-8 text-xs focus:ring-1 focus:z-50 focus:relative focus:outline-none ${
    hasError 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  }`;
  // Add this class for mandatory fields
  //const mandatoryBorderClass = mandatory ? "border-red-300 shadow-[0_0_0_2px_rgba(239,68,68,0.10)]" : "";

  //const baseInputClasses = `h-8 text-[13px] border-gray-300 focus:border-blue-500 ${mandatoryBorderClass}`;

  // --- UPDATED: search fieldType with suggestions ---
  if (fieldType === 'search') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => {
          const [inputValue, setInputValue] = useState(field.value || '');
          const [showSuggestions, setShowSuggestions] = useState(false);

          useEffect(() => {
            setInputValue(field.value || '');
          }, [field.value]);

          // Use the searchData array from config
          const suggestions: string[] = searchData || [];
          const filteredSuggestions = inputValue
            ? suggestions.filter(item =>
                item.toLowerCase().includes(inputValue.toLowerCase())
              )
            : [];

          const borderClass = getFieldBorderClass(mandatory, inputValue);

          return (
            <div className="relative focus-within:z-50">
              <Input
                type="search"
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  field.onChange(e.target.value);
                  setShowSuggestions(true);
                  events?.onChange?.(e.target.value, e);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder || 'Search...'}
                className={`pr-8 h-8 text-[13px] rounded-md ${
                  hasError 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                tabIndex={tabIndex}
                autoComplete="off"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul
                  className="absolute left-0 right-0 bg-white border border-gray-200 rounded shadow z-50 mt-1 max-h-40 overflow-y-auto text-xs"
                  style={{ listStyle: 'none', margin: 0, padding: 0 }}
                >
                  {filteredSuggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      onMouseDown={() => {
                        setInputValue(suggestion);
                        field.onChange(suggestion);
                        setShowSuggestions(false);
                        events?.onChange?.(suggestion, { target: { value: suggestion } } as any);
                      }}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }}
      />
    );
  }
  // --- END UPDATED ---

  switch (fieldType) {
    case 'text':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            const borderClass = getFieldBorderClass(mandatory, field.value);
            // ✅ Restrict input based on allowedType
            const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value;

              switch (config.inputType) {
                case 'number':
                  // Allow only digits and dot
                  value = value.replace(/[^0-9.]/g, '');
                  // Ensure only one dot
                  const parts = value.split('.');
                  if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                  }
                  break;
                  // value = value.replace(/[^0-9]/g, ''); // only numbers
                  // break;
                case 'characters':
                  value = value.replace(/[^a-zA-Z]/g, ''); // only alphabets
                  break;
                case 'alphanumeric':
                  value = value.replace(/[^a-zA-Z0-9]/g, ''); // numbers + alphabets
                  break;
                case 'text':
                default:
                  // allow everything
                  break;
              }

              if (config.maxLength && value.length > config.maxLength) {
                value = value.slice(0, config.maxLength);
              }

              field.onChange(value);
            };
            return (
              <div>
                {fieldId === "UnitPrice" ? (
                  <div className="flex items-center border border-gray-300 rounded-md bg-gray-100 w-11/12">
                    {/* Fixed currency label */}
                   
                    <span className="px-2 text-gray-700 font-normal font-[13px]">{jsonStore.getQuickOrder().Currency?jsonStore.getQuickOrder().Currency:'EUR'}</span>
                    {/* Editable input */}
                    <input
                      type="text"
                      {...field}
                      {...eventHandlers}
                      placeholder={placeholder}
                      onChange={handleInput}
                      maxLength={config.maxLength} // also set native maxLength for safety
                      className={`h-8 text-[13px] border-gray-300 focus:border-blue-500 pl-1 ${baseInputClasses}`}
                      tabIndex={tabIndex}
                      // className="flex-1 px-3 py-2 text-gray-900 bg-gray-100 focus:outline-none"
                    />
                  </div>
                ) : (
                  <Input
                    type="text"
                    {...field}
                    {...eventHandlers}
                    placeholder={placeholder}
                    onChange={handleInput}
                    maxLength={config.maxLength} // also set native maxLength for safety
                    className={`h-8 text-[13px] border-gray-300 focus:border-blue-500 ${baseInputClasses}`}
                    tabIndex={tabIndex}
                  />
                )}  
              </div>
            );
          }}
        />
      );

    case 'textarea':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            const borderClass = getFieldBorderClass(mandatory, field.value);
            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <Textarea
                  {...field}
                  {...eventHandlers}
                  placeholder={placeholder}
                  className={`min-h-[60px] text-[13px] focus:ring-1 focus:z-50 focus:relative focus:outline-none ${
                    hasError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  tabIndex={tabIndex}
                  maxLength={config.maxLength}
                />
              </div>
            );
          }}
        />
      );

    case 'radio':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <RadioGroup
                  {...field}
                  {...eventHandlers}
                  value={field.value || ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                    events?.onChange?.(value, { target: { value } } as any);
                  }}
                  className="flex gap-4 focus-within:z-50 relative"
                  {...(events && {
                    onClick: events.onClick && ((e: React.MouseEvent) => events.onClick!(e, field.value)),
                    onFocus: events.onFocus,
                    onBlur: events.onBlur
                  })}
                >
                  {options?.map((option, index) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`${config.id}-${option.value}`}
                        tabIndex={index === 0 ? tabIndex : -1}
                      />
                      <Label htmlFor={`${config.id}-${option.value}`} className="text-[13px]">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );
          }}
        />
      );

    case 'select':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            const borderClass = getFieldBorderClass(mandatory, field.value);
            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <div className="relative focus-within:z-50">
                  <select
                    {...field}
                    {...eventHandlers}
                    className={`w-full h-8 px-3 text-[13px] rounded-md border bg-white focus:ring-1 focus:z-50 focus:relative focus:outline-none appearance-none ${
                      hasError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    tabIndex={tabIndex}
                  >
                    <option value="">Select...</option>
                    {options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          }}
        />
      );

    case 'lazyselect':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const fetchOptions = config.fetchOptions;
            if (!fetchOptions) {
              return (
                <div>
                  <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div>
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                    fetchOptions is required for lazyselect field type
                  </div>
                </div>
              );
            }

            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <DynamicLazySelect
                  fetchOptions={fetchOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (events?.onChange) {
                      const selectedOption = value ? { label: '', value } : null;
                      events.onChange(selectedOption, { target: { value } } as any);
                    }
                  }}
                  placeholder={placeholder || 'Select...'}
                  className={`h-8 text-[13px] focus:ring-1 ${
                    hasError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  tabIndex={tabIndex}
                  onClick={events?.onClick}
                  onFocus={events?.onFocus}
                  onBlur={events?.onBlur}
                  hideSearch={config.hideSearch}
                  disableLazyLoading={config.disableLazyLoading}
                  tooltip={tooltip}
                />
              </div>
            );
          }}
        />
      );
      
    case 'date':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const dateValue = field.value ? new Date(field.value) : undefined;
            const dateFormat = config.dateFormat || "PPP"; // Default to "PPP" if no format specified
            
            return (
              <div>
                <div className="relative focus-within:z-50">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-8 justify-start text-left font-normal text-xs px-3 pr-8",
                          !dateValue && "text-muted-foreground",
                          hasError 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        )}
                        tabIndex={tabIndex}
                        onClick={events?.onClick ? (e) => events.onClick!(e, field.value) : undefined}
                        onFocus={events?.onFocus}
                        onBlur={events?.onBlur}
                      >
                        {dateValue 
                          ? format(dateValue, "dd/MM/yyyy") 
                          : <span>{placeholder || "Pick a date"}</span>
                        }
                        <CalendarIcon className="mr-4 h-3 w-3 absolute right-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateValue}
                        onSelect={(date) => {
                          const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                          field.onChange(dateString);
                          events?.onChange?.(dateString, { target: { value: dateString } } as any);
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {dateValue && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        field.onChange('');
                        events?.onChange?.('', { target: { value: '' } } as any);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />
      );

    case 'time':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            const borderClass = getFieldBorderClass(mandatory, field.value);
            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <div className="relative focus-within:z-50">
                  <Input
                    type="time"
                    {...field}
                    {...eventHandlers}
                    className={baseInputClasses}
                    tabIndex={tabIndex}
                  />
                  {/* <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" /> */}
                </div>
              </div>
            );
          }}
        />
      );

    case 'currency':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            const borderClass = getFieldBorderClass(mandatory, field.value);
            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <div className="relative focus-within:z-50">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-[13px]">
                    €
                  </span>
                  <Input
                    type="number"
                    {...field}
                    {...eventHandlers}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                      events?.onChange?.(value, e);
                    }}
                    placeholder="0.00"
                    className={`h-8 text-[13px] border-gray-300 focus:border-blue-500 pl-6 ${baseInputClasses}`}
                    step="0.01"
                    tabIndex={tabIndex}
                  />
                </div>
              </div>
            );
          }}
        />
      );

    case 'card':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const cardStyle = color ? {
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              borderColor: `${color}40`
            } : {};

            return (
              <div
                className="border rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                style={color ? cardStyle : {}}
                onClick={events?.onClick ? (e) => events.onClick!(e, field.value) : undefined}
                onMouseEnter={events?.onMouseEnter}
                onMouseLeave={events?.onMouseLeave}
              >
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {config.label}
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: fieldColour || 'inherit' }}
                >
                € {field.value || ' 0.00'}
                </div>
              </div>
            );
          }}
        />
      );

    case 'inputdropdown':
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            const fieldValue = field.value || {};
            const borderClass = getFieldBorderClass(mandatory, fieldValue.input || fieldValue.dropdown);

            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <InputDropdown
                  value={fieldValue}
                  onChange={(newValue) => {
                    // If inputType is 'number', allow only numbers in the input field
                    if (config.inputType === 'number') {
                      // If newValue is an object (InputDropdown usually has {input, dropdown})
                      if (typeof newValue === 'object' && newValue !== null) {
                        // Only allow numbers in the input part
                        const filteredInput = newValue.input
                          ? newValue.input.replace(/[^0-9.]/g, '')
                          : '';
                        field.onChange({ ...newValue, input: filteredInput });
                        events?.onChange?.(
                          { ...newValue, input: filteredInput },
                          { target: { value: { ...newValue, input: filteredInput } } } as any
                        );
                      } else if (typeof newValue === 'string') {
                        // If for some reason it's a string, filter it
                        const filteredInput = (newValue as string).replace(/[^0-9.]/g, '');
                        field.onChange(filteredInput);
                        events?.onChange?.(
                          filteredInput,
                          { target: { value: filteredInput } } as any
                        );
                        
                      } else {
                        field.onChange(newValue);
                        events?.onChange?.(newValue, { target: { value: newValue } } as any);
                      }
                    } else if (config.inputType === 'characters') {
                      // Only allow alphabetic characters in the input part
                      if (typeof newValue === 'object' && newValue !== null) {
                        const filteredInput = newValue.input
                          ? newValue.input.replace(/[^a-zA-Z\s]/g, '')
                          : '';
                        field.onChange({ ...newValue, input: filteredInput });
                        events?.onChange?.(
                          { ...newValue, input: filteredInput },
                          { target: { value: { ...newValue, input: filteredInput } } } as any
                        );
                      } else if (typeof newValue === 'string') {
                        const filteredInput = (newValue as string).replace(/[^a-zA-Z\s]/g, '');
                        field.onChange(filteredInput);
                        events?.onChange?.(
                          filteredInput,
                          { target: { value: filteredInput } } as any
                        );
                      } else {
                        field.onChange(newValue);
                        events?.onChange?.(newValue, { target: { value: newValue } } as any);
                      }
                    } else {
                      // Default: no filtering
                      field.onChange(newValue);
                      events?.onChange?.(newValue, { target: { value: newValue } } as any);
                    }
                  }}
                  options={options}
                  placeholder={placeholder}
                  tabIndex={tabIndex}
                  onDropdownClick={events?.onClick ? (e) => events.onClick!(e, fieldValue) : undefined}
                  onInputClick={events?.onClick ? (e) => events.onClick!(e, fieldValue) : undefined}
                  onFocus={events?.onFocus}
                  onBlur={events?.onBlur}
                  onKeyDown={events?.onKeyDown}
                  onKeyUp={events?.onKeyUp}
                  className={borderClass}
                  title={tooltip}
                  maxLength={config.maxLength}
                />
              </div>
            );
          }}
        />
      );

    default:
      return (
        <Controller
          name={fieldId}
          control={control}
          render={({ field }) => {
            const eventHandlers = createEventHandlers(field);
            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <Input
                  type="text"
                  {...field}
                  {...eventHandlers}
                  placeholder={placeholder}
                  className={baseInputClasses}
                  tabIndex={tabIndex}
                />
              </div>
            );
          }}
        />
      );
  }
};
