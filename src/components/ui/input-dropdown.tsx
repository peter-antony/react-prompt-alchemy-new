import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface InputDropdownOption {
  label: string;
  value: string;
}

export interface InputDropdownValue {
  dropdown: string;
  input: string;
}

export interface InputDropdownProps {
  value?: InputDropdownValue;
  onChange?: (value: InputDropdownValue) => void;
  disableDropdown?: boolean; 
  options?: InputDropdownOption[];
  placeholder?: string;
  className?: string;
  tabIndex?: number;
  maxLength?: number;
  onDropdownClick?: (e: React.MouseEvent) => void;
  onInputClick?: (e: React.MouseEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
  title?: any;
  editable?: boolean;
    error?: string;

}

const InputDropdown = React.forwardRef<HTMLDivElement, InputDropdownProps>(
  ({ 
    value = { dropdown: '', input: '' }, 
    onChange, 
    disableDropdown = false, 
    options = [], 
    placeholder = '',
    className,
    tabIndex,
    maxLength,
    error,
    title,
    editable = true,
    onDropdownClick,
    onInputClick,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    ...props 
  }, ref) => {
    const dropdownValue = value?.dropdown || '';
    const inputValue = value?.input || '';

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (disableDropdown) {
    e.preventDefault();
    return; 
  }
      const newValue = { ...value, dropdown: e.target.value };
      onChange?.(newValue);
    };
    
    // Max character length validation
    const limit = maxLength || 299;
    const isExceeded = inputValue.length > limit;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Apply maxLength constraint if specified - strict slicing
      // if (maxLength && inputValue.length > maxLength) {
      //   inputValue = inputValue.slice(0, maxLength);
      // }

      const newValue = { ...value, input: inputValue };
      onChange?.(newValue);
    };

    return (
      <div className="w-full">
        <div ref={ref} className={cn("flex focus-within:z-50 relative gap-px", className)} {...props}>
          <div className="relative w-2/5">
            <select
              value={dropdownValue}
              onChange={handleDropdownChange}
              disabled={!editable || disableDropdown}
              // className={cn(
              //   "h-8 w-full px-3 text-sm rounded-l-md border border-r border-input bg-background focus:border-blue-500 focus:ring-ring focus:z-50 focus:relative focus:outline-none appearance-none",
              //   !editable && "opacity-80 bg-gray-100"
              // )}
              className={cn(
                "h-8 w-full px-3 text-sm rounded-l-md border border-r border-input bg-background focus:border-blue-500 focus:ring-ring focus:z-50 focus:relative focus:outline-none appearance-none",
                error ? "border-red-600 focus:border-red-600" : "border-input focus:border-blue-500",
                (!editable || disableDropdown) && "opacity-80 bg-gray-100 cursor-not-allowed"
              )}

              tabIndex={tabIndex}
              onClick={onDropdownClick}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Select...</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={!editable}
            placeholder={placeholder}
            className={cn(
              "rounded-l-none border-l-0 flex-1 h-8 focus:border-blue-500",
              error ? "border-red-600 focus:border-red-600" : "border-input focus:border-blue-500",
              isExceeded && "border-red-600 focus-visible:ring-red-600 focus:border-red-600",
              !editable && "opacity-80 bg-gray-100"
            )}
            tabIndex={tabIndex ? tabIndex + 1 : undefined}
            onClick={onInputClick}
            onFocus={onFocus}
            // maxLength={maxLength || 299}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          />
        </div>
        {isExceeded && (
          <p className="text-xs text-red-500 mt-1">
            {`Maximum character limit is ${limit}. [${inputValue.length}/${limit}]`}
          </p>
        )}
      </div>
    );
  }
);

InputDropdown.displayName = "InputDropdown";

export { InputDropdown };