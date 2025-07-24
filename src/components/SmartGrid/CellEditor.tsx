
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { CellEditProps } from '@/types/smartgrid';

export function CellEditor({ value, column, onSave, onCancel }: CellEditProps) {
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (column.validator) {
      const validation = column.validator(editValue);
      if (validation !== true) {
        setError(typeof validation === 'string' ? validation : 'Invalid value');
        return;
      }
    }
    
    let finalValue = editValue;
    if (column.type === 'number') {
      finalValue = Number(editValue);
    } else if (column.type === 'boolean') {
      finalValue = Boolean(editValue);
    }
    
    onSave(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (column.type === 'select' && column.options) {
    return (
      <div className="flex items-center space-x-1 p-1 bg-white border rounded shadow-sm">
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          className="flex-1 px-2 py-1 text-sm border-0 focus:ring-0 focus:outline-none"
          autoFocus
        >
          {column.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 p-1 bg-white border rounded shadow-sm">
      <Input
        ref={inputRef}
        type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`flex-1 h-8 px-2 text-sm ${error ? 'border-red-500' : ''}`}
      />
      <Button size="sm" variant="ghost" onClick={handleSave}>
        <Check className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 z-10">
          {error}
        </div>
      )}
    </div>
  );
}
