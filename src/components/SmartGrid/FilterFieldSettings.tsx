import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { GridColumnConfig } from '@/types/smartgrid';

interface ExtraFilter {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'time' | 'number' | 'boolean';
  options?: string[];
}

interface SubRowFilter {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'time' | 'number' | 'boolean';
  options?: string[];
}

interface FilterFieldSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: GridColumnConfig[];
  subRowColumns: GridColumnConfig[];
  extraFilters: ExtraFilter[];
  subRowFilters: SubRowFilter[];
  visibleFields: Record<string, boolean>;
  onFieldVisibilityChange: (fieldKey: string, visible: boolean) => void;
  onResetToDefaults: () => void;
}

export function FilterFieldSettings({
  open,
  onOpenChange,
  columns,
  subRowColumns,
  extraFilters,
  subRowFilters,
  visibleFields,
  onFieldVisibilityChange,
  onResetToDefaults
}: FilterFieldSettingsProps) {
  const filterableColumns = columns.filter(col => col.filterable !== false);
  const filterableSubRowColumns = subRowColumns.filter(col => col.filterable !== false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter Field Settings
            <Button
              variant="outline"
              size="sm"
              onClick={onResetToDefaults}
              className="text-xs"
            >
              Reset to Defaults
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Main Columns */}
          {filterableColumns.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Main Row Filters</h4>
              <div className="grid grid-cols-2 gap-3">
                {filterableColumns.map((column) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.key}
                      checked={visibleFields[column.key] || false}
                      onCheckedChange={(checked) => {
                        onFieldVisibilityChange(column.key, !!checked);
                      }}
                    />
                    <label htmlFor={column.key} className="text-sm text-gray-600 cursor-pointer">
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra Filters */}
          {extraFilters.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-3">Extra Filters</h4>
              <div className="grid grid-cols-2 gap-3">
                {extraFilters.map((filter) => {
                  const fieldKey = `extra-${filter.key}`;
                  return (
                    <div key={fieldKey} className="flex items-center space-x-2">
                      <Checkbox
                        id={fieldKey}
                        checked={visibleFields[fieldKey] || false}
                        onCheckedChange={(checked) => {
                          onFieldVisibilityChange(fieldKey, !!checked);
                        }}
                      />
                      <label htmlFor={fieldKey} className="text-sm text-gray-600 cursor-pointer">
                        {filter.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-row Filters */}
          {(filterableSubRowColumns.length > 0 || subRowFilters.length > 0) && (
            <div>
              <h4 className="text-sm font-medium text-blue-700 mb-3">Sub-row Filters</h4>
              <div className="grid grid-cols-2 gap-3">
                {filterableSubRowColumns.map((column) => {
                  const fieldKey = `subrow-${column.key}`;
                  return (
                    <div key={fieldKey} className="flex items-center space-x-2">
                      <Checkbox
                        id={fieldKey}
                        checked={visibleFields[fieldKey] || false}
                        onCheckedChange={(checked) => {
                          onFieldVisibilityChange(fieldKey, !!checked);
                        }}
                      />
                      <label htmlFor={fieldKey} className="text-sm text-gray-600 cursor-pointer">
                        {column.label}
                      </label>
                    </div>
                  );
                })}
                {subRowFilters.map((filter) => {
                  const fieldKey = `subrowfilter-${filter.key}`;
                  return (
                    <div key={fieldKey} className="flex items-center space-x-2">
                      <Checkbox
                        id={fieldKey}
                        checked={visibleFields[fieldKey] || false}
                        onCheckedChange={(checked) => {
                          onFieldVisibilityChange(fieldKey, !!checked);
                        }}
                      />
                      <label htmlFor={fieldKey} className="text-sm text-gray-600 cursor-pointer">
                        {filter.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}