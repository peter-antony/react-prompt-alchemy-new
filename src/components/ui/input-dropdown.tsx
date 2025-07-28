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
  options?: InputDropdownOption[];
  placeholder?: string;
  className?: string;
  tabIndex?: number;
  onDropdownClick?: (e: React.MouseEvent) => void;
  onInputClick?: (e: React.MouseEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
}

const InputDropdown = React.forwardRef<HTMLDivElement, InputDropdownProps>(
  ({ 
    value = { dropdown: '', input: '' }, 
    onChange, 
    options = [], 
    placeholder = 'Enter Value',
    className,
    tabIndex,
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
      const newValue = { ...value, dropdown: e.target.value };
      onChange?.(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = { ...value, input: e.target.value };
      onChange?.(newValue);
    };

    return (
      <div ref={ref} className={cn("flex focus-within:z-50 relative gap-px", className)} {...props}>
        <div className="relative">
          <select
            value={dropdownValue}
            onChange={handleDropdownChange}
            className="h-8 px-3 text-sm rounded-l-md border border-r border-input bg-background focus:border-blue-500 focus:ring-ring focus:z-50 focus:relative focus:outline-none appearance-none"
            tabIndex={tabIndex}
            onClick={onDropdownClick}
            onFocus={onFocus}
            onBlur={onBlur}
          >
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
          placeholder={placeholder}
          className="rounded-l-none border-l-0 flex-1 h-8 focus:border-blue-500"
          tabIndex={tabIndex ? tabIndex + 1 : undefined}
          onClick={onInputClick}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />
      </div>
    );
  }
);

InputDropdown.displayName = "InputDropdown";

export { InputDropdown };