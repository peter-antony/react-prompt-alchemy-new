
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { GridColumnConfig, FilterConfig } from '@/types/smartgrid';
import { cn } from '@/lib/utils';

interface ColumnFilterProps {
  column: GridColumnConfig;
  currentFilter?: FilterConfig;
  onFilterChange: (filter: FilterConfig | null) => void;
}

export function ColumnFilter({ column, currentFilter, onFilterChange }: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');

  // Update local value when currentFilter changes
  useEffect(() => {
    setValue(currentFilter?.value || '');
  }, [currentFilter]);

  if (!column.filterable) {
    return null;
  }

  const handleApplyFilter = () => {
    if (value.trim()) {
      onFilterChange({
        column: column.key,
        value: value.trim(),
        operator: 'contains'
      });
    } else {
      onFilterChange(null);
    }
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setValue('');
    onFilterChange(null);
    setIsOpen(false);
  };

  const hasActiveFilter = currentFilter && currentFilter.value;

  return (
    <div className="w-full">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Filter ${column.label.toLowerCase()}...`}
        className="h-8 text-xs"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleApplyFilter();
          } else if (e.key === 'Escape') {
            handleClearFilter();
          }
        }}
        onBlur={handleApplyFilter}
      />
      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilter}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          title="Clear filter"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
