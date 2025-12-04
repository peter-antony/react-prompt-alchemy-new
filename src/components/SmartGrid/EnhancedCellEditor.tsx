import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { GridColumnConfig } from '@/types/smartgrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { cn } from '@/lib/utils';

interface EnhancedCellEditorProps {
  value: any;
  column: GridColumnConfig;
  onChange: (value: any) => void;
  onSave?: () => void;
  error?: string;
  shouldAutoFocus?: boolean;
  rowData?: any;
}

export function EnhancedCellEditor({ value, column, onChange, onSave, error, shouldAutoFocus = false, rowData }: EnhancedCellEditorProps) {
  const [editValue, setEditValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes (e.g., when dependent fields are cleared)
  useEffect(() => {
    setEditValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (shouldAutoFocus && inputRef.current && !['LazySelect', 'MultiselectLazySelect', 'Select'].includes(column.type)) {
      inputRef.current.focus();
    }
  }, [column.type, shouldAutoFocus]);

  const handleChange = (newValue: any) => {
    setEditValue(newValue);
    
    // Type conversion
    let finalValue = newValue;
    switch (column.type) {
      case 'Integer':
        finalValue = newValue === '' ? null : parseInt(newValue, 10);
        break;
      case 'String':
      case 'Text':
        finalValue = String(newValue);
        break;
      case 'Date':
      case 'Time':
        finalValue = newValue || null;
        break;
    }
    
    onChange(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSave) {
      e.preventDefault();
      onSave();
    }
  };

  // LazySelect renderer
  if (column.type === 'LazySelect' && column.fetchOptions) {
    return (
      <div className="w-full" onKeyDown={handleKeyDown}>
        <DynamicLazySelect
          fetchOptions={column.fetchOptions}
          value={editValue}
          onChange={handleChange}
          placeholder="Select..."
          multiSelect={column.multiSelect}
          hideSearch={column.hideSearch}
          disableLazyLoading={column.disableLazyLoading}
          rowData={rowData}
        />
        {error && (
          <div className="mt-1 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    );
  }

  // MultiselectLazySelect renderer
  if (column.type === 'MultiselectLazySelect' && column.fetchOptions) {
    return (
      <div className="w-full" onKeyDown={handleKeyDown}>
        <DynamicLazySelect
          fetchOptions={column.fetchOptions}
          value={editValue}
          onChange={handleChange}
          placeholder="Select multiple..."
          multiSelect={true}
          hideSearch={column.hideSearch}
          disableLazyLoading={column.disableLazyLoading}
          rowData={rowData}
        />
        {error && (
          <div className="mt-1 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Select/Dropdown renderer
  if ((column.type === 'Select' || column.type === 'Dropdown') && column.options) {
    return (
      <div className="w-full">
        <select
          value={editValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-md bg-background",
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          autoFocus={shouldAutoFocus}
        >
          <option value="">Select...</option>
          {column.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && (
          <div className="mt-1 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Input type determination
  let inputType = 'text';
  switch (column.type) {
    case 'Integer':
      inputType = 'number';
      break;
    case 'Date':
      inputType = 'date';
      break;
    case 'Time':
      inputType = 'time';
      break;
    default:
      inputType = 'text';
  }

  // Standard input renderer
  return (
    <div className="w-full">
      <Input
        ref={inputRef}
        type={inputType}
        value={editValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        step={column.type === 'Integer' ? '1' : undefined}
      />
      {error && (
        <div className="mt-1 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}