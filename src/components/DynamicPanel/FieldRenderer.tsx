import React, { useState, useEffect } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { InputDropdown } from '@/components/ui/input-dropdown';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Calendar, Clock } from 'lucide-react';
import { FieldConfig } from '@/types/dynamicPanel';

interface FieldRendererProps {
  config: FieldConfig;
  control: Control<any>;
  fieldId: string;
  tabIndex?: number;
  mandatory:boolean
}

// Add this helper above your component:
const getFieldBorderClass = (mandatory: boolean, value: any) => {
  if (mandatory && value && value !== '' && !(typeof value === 'object' && Object.values(value).every(v => !v))) {
    // Value entered for mandatory field: bright green border
    return "border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.20)]";
  }
  if (mandatory) {
    // Mandatory but empty: red border
    return "border-red-300 shadow-[0_0_0_2px_rgba(239,68,68,0.10)]";
  }
  return "";
};

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  config,
  control,
  fieldId,
  tabIndex,
  mandatory
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
            <div className="text-[13px] text-gray-700 bg-gray-50 p-2 rounded border min-h-[32px] flex items-center">
              {field.value || '-'}
            </div>
          </div>
        )}
      />
    );
  }

  // Add this class for mandatory fields
  const mandatoryBorderClass = mandatory ? "border-red-300 shadow-[0_0_0_2px_rgba(239,68,68,0.10)]" : "";

  const baseInputClasses = `h-8 text-[13px] border-gray-300 focus:border-blue-500 ${mandatoryBorderClass}`;

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
                className={`pr-8 h-8 text-[13px] border-gray-300 focus:border-blue-500 rounded-md ${borderClass}`}
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
            return (
              <div>
                {/* <div className="text-xs text-blue-600 mb-1">TabIndex: {tabIndex}</div> */}
                <Input
                  type="text"
                  {...field}
                  {...eventHandlers}
                  placeholder={placeholder}
                  className={`h-8 text-[13px] border-gray-300 focus:border-blue-500 ${borderClass}`}
                  tabIndex={tabIndex}
                />
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
                  className={`min-h-[60px] text-[13px] border-gray-300 focus:border-blue-500 focus:z-50 focus:relative focus:outline-none ${borderClass}`}
                  tabIndex={tabIndex}
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
                    className={`w-full h-8 px-3 text-[13px] rounded-md border border-gray-300 bg-white focus:border-blue-500 focus:z-50 focus:relative focus:outline-none appearance-none ${borderClass}`}
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

    case 'date':
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
                    type="date"
                    {...field}
                    {...eventHandlers}
                    className={`h-8 text-[13px] border-gray-300 focus:border-blue-500 ${borderClass}`}
                    tabIndex={tabIndex}
                  />
                  {/* <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" /> */}
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
                    className={`h-8 text-[13px] border-gray-300 focus:border-blue-500 ${borderClass}`}
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
                    className={`h-8 text-[13px] border-gray-300 focus:border-blue-500 pl-6 ${borderClass}`}
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
                  {field.value || '€ 0.00'}
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
                    field.onChange(newValue);
                    events?.onChange?.(newValue, { target: { value: newValue } } as any);
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
