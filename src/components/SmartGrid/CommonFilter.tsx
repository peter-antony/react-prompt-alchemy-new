
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { GridColumnConfig, FilterConfig } from '@/types/smartgrid';
import { cn } from '@/lib/utils';

interface CommonFilterProps {
  columns: GridColumnConfig[];
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
}

export function CommonFilter({ columns, filters, onFiltersChange }: CommonFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    filters.forEach(filter => {
      initial[filter.column] = filter.value;
    });
    return initial;
  });

  const filterableColumns = columns.filter(col => col.filterable);
  const hasActiveFilters = filters.length > 0;

  const handleFilterChange = (columnKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  const handleApplyFilters = () => {
    const newFilters: FilterConfig[] = [];
    
    Object.entries(activeFilters).forEach(([columnKey, value]) => {
      if (value.trim()) {
        newFilters.push({
          column: columnKey,
          value: value.trim(),
          operator: 'contains'
        });
      }
    });

    onFiltersChange(newFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    onFiltersChange([]);
    setIsOpen(false);
  };

  const handleRemoveFilter = (columnKey: string) => {
    const newActiveFilters = { ...activeFilters };
    delete newActiveFilters[columnKey];
    setActiveFilters(newActiveFilters);
    
    const newFilters = filters.filter(f => f.column !== columnKey);
    onFiltersChange(newFilters);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "transition-all duration-200",
            hasActiveFilters 
              ? "text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100" 
              : "text-gray-600 hover:text-gray-800"
          )}
          title="Filter Columns"
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5">
              {filters.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-white border shadow-lg" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Filter Columns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filterableColumns.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No filterable columns available
              </div>
            ) : (
              <>
                {filterableColumns.map((column) => (
                  <div key={column.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {column.label}
                      </label>
                      {activeFilters[column.key] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFilter(column.key)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={activeFilters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      placeholder={`Filter ${column.label.toLowerCase()}...`}
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyFilters();
                        }
                      }}
                    />
                  </div>
                ))}

                <div className="flex space-x-2 pt-4 border-t">
                  <Button size="sm" onClick={handleApplyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleClearFilters} className="flex-1">
                    Clear All
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
