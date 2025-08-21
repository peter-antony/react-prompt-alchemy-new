import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Separator
} from '@/components/ui/separator';
import {
  Settings2,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  Rows3
} from 'lucide-react';
import { GridColumnConfig, GridPreferences } from '@/types/smartgrid';
import { cn } from '@/lib/utils';

interface ColumnVisibilityManagerProps {
  columns: GridColumnConfig[];
  preferences: GridPreferences;
  onColumnVisibilityToggle: (columnId: string) => void;
  onColumnHeaderChange: (columnId: string, header: string) => void;
  onResetToDefaults: () => void;
  onSubRowToggle?: (columnKey: string) => void;
}

export function ColumnVisibilityManager({
  columns,
  preferences,
  onColumnVisibilityToggle,
  onColumnHeaderChange,
  onResetToDefaults,
  onSubRowToggle
}: ColumnVisibilityManagerProps) {
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [tempHeaderValue, setTempHeaderValue] = useState('');

  const handleHeaderEdit = (columnId: string, currentHeader: string) => {
    setEditingHeader(columnId);
    setTempHeaderValue(currentHeader);
  };

  const handleHeaderSave = (columnId: string) => {
    if (tempHeaderValue.trim()) {
      onColumnHeaderChange(columnId, tempHeaderValue.trim());
    }
    setEditingHeader(null);
    setTempHeaderValue('');
  };

  const handleHeaderCancel = () => {
    setEditingHeader(null);
    setTempHeaderValue('');
  };

  const isColumnVisible = (columnId: string) => {
    return !preferences.hiddenColumns.includes(columnId);
  };

  const isColumnInSubRow = (columnId: string) => {
    const column = columns.find(col => col.key === columnId);
    return column?.subRow === true;
  };

  const getColumnHeader = (columnId: string) => {
    return preferences.columnHeaders[columnId] || columns.find(col => col.key === columnId)?.label || columnId;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title="Manage Columns"
          className='w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300'>
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Manage Columns</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetToDefaults}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Reset All
            </Button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {columns.map((column) => {
              const isVisible = isColumnVisible(column.key);
              const isInSubRow = isColumnInSubRow(column.key);
              const currentHeader = getColumnHeader(column.key);
              const isEditing = editingHeader === column.key;

              return (
                <div key={column.key} className={cn(
                  "flex items-center justify-between p-2 rounded-lg border transition-colors",
                  isVisible ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                )}>
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Visibility Toggle */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isVisible}
                        onCheckedChange={() => onColumnVisibilityToggle(column.key)}
                        disabled={column.mandatory}
                        className="flex-shrink-0"
                      />
                      {isVisible ? (
                        <Eye className="h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Column Header */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <Input
                            value={tempHeaderValue}
                            onChange={(e) => setTempHeaderValue(e.target.value)}
                            className="h-6 text-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleHeaderSave(column.key);
                              } else if (e.key === 'Escape') {
                                handleHeaderCancel();
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHeaderSave(column.key)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleHeaderCancel}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          <div className="flex flex-col min-w-0">
                            <span className={cn(
                              "text-sm font-medium truncate",
                              isVisible ? "text-gray-900" : "text-gray-500"
                            )}>
                              {currentHeader}
                            </span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {column.key}
                              </span>
                              {column.mandatory && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                              {isInSubRow && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                  Sub-row
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHeaderEdit(column.key, currentHeader)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3 text-gray-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub-row Toggle */}
                  {onSubRowToggle && (
                    <div className="flex items-center ml-2">
                      <Button
                        variant={isInSubRow ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onSubRowToggle(column.key)}
                        className={cn(
                          "h-7 w-7 p-0 transition-colors",
                          isInSubRow
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                        )}
                        title={isInSubRow ? "Remove from sub-row" : "Show in sub-row"}
                      >
                        <Rows3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {columns.filter(col => isColumnVisible(col.key)).length} of {columns.length} visible
            </span>
            {onSubRowToggle && (
              <span>
                {columns.filter(col => isColumnInSubRow(col.key)).length} in sub-row
              </span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
