
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Settings, GripVertical, Edit2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Column, GridPreferences } from '@/types/smartgrid';

interface ColumnManagerProps<T> {
  columns: Column<T>[];
  preferences: GridPreferences;
  onColumnOrderChange: (newOrder: string[]) => void;
  onColumnVisibilityToggle: (columnId: string) => void;
  onColumnHeaderChange: (columnId: string, header: string) => void;
  onSubRowToggle?: (columnId: string) => void;
  onSubRowConfigToggle?: (enabled: boolean) => void;
}

export function ColumnManager<T>({
  columns,
  preferences,
  onColumnOrderChange,
  onColumnVisibilityToggle,
  onColumnHeaderChange,
  onSubRowToggle,
  onSubRowConfigToggle
}: ColumnManagerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const orderedColumns = preferences.columnOrder
    .map(id => columns.find(col => col.id === id))
    .filter(Boolean) as Column<T>[];

  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnId) return;

    const newOrder = [...preferences.columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    onColumnOrderChange(newOrder);
  };

  const handleHeaderSave = (columnId: string, newHeader: string) => {
    onColumnHeaderChange(columnId, newHeader);
    setEditingHeader(null);
  };

  const handleSubRowToggle = (columnId: string) => {
    console.log('Sub-row toggle clicked for column:', columnId);
    if (onSubRowToggle) {
      onSubRowToggle(columnId);
    }
  };

  const handleSubRowConfigToggle = (enabled: boolean) => {
    console.log('Sub-row config toggle:', enabled);
    if (onSubRowConfigToggle) {
      onSubRowConfigToggle(enabled);
    }
  };

  const handleSelectAllSubRows = () => {
    if (onSubRowToggle) {
      const visibleColumns = columns.filter(col => !preferences.hiddenColumns.includes(col.id));
      visibleColumns.forEach(column => {
        if (!preferences.subRowColumns?.includes(column.id)) {
          onSubRowToggle(column.id);
        }
      });
    }
  };

  const handleDeselectAllSubRows = () => {
    if (onSubRowToggle) {
      const subRowColumns = preferences.subRowColumns || [];
      subRowColumns.forEach(columnId => {
        onSubRowToggle(columnId);
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Settings className="h-4 w-4" />
        <span>Columns</span>
      </Button>
    );
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Manage Columns</h3>
        <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
          ×
        </Button>
      </div>

      {/* Sub-row Configuration Toggle */}
      <div className="flex items-center justify-between p-3 mb-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">Enable Sub-row Configuration</span>
          <span className="text-xs text-gray-500">Allow columns to be displayed in expandable sub-rows</span>
        </div>
        <Switch
          checked={preferences.enableSubRowConfig || false}
          onCheckedChange={handleSubRowConfigToggle}
        />
      </div>

      {/* Sub-row bulk actions */}
      {preferences.enableSubRowConfig && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-800">Sub-row Actions</span>
            <span className="text-xs text-purple-600">
              {preferences.subRowColumns?.length || 0} selected
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllSubRows}
              className="flex-1 text-xs"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAllSubRows}
              className="flex-1 text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {orderedColumns.map((column) => {
          const isHidden = preferences.hiddenColumns.includes(column.id);
          const isSubRow = preferences.subRowColumns?.includes(column.id) || false;
          const customHeader = preferences.columnHeaders[column.id];
          const displayHeader = customHeader || column.header;

          return (
            <div
              key={column.id}
              className="border rounded p-3 hover:bg-gray-50"
              draggable
              onDragStart={() => handleDragStart(column.id)}
              onDragOver={(e) => handleDragOver(e, column.id)}
            >
              <div className="flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                
                <Checkbox
                  checked={!isHidden}
                  onCheckedChange={() => onColumnVisibilityToggle(column.id)}
                  disabled={column.mandatory}
                  className="shrink-0"
                />

                {isHidden ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-green-600" />
                )}

                {/* Sub-row icon indicator */}
                {isSubRow && (
                  <ChevronDown className="h-4 w-4 text-purple-600" />
                )}

                <div className="flex-1 min-w-0">
                  {editingHeader === column.id ? (
                    <Input
                      defaultValue={displayHeader}
                      onBlur={(e) => handleHeaderSave(column.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleHeaderSave(column.id, e.currentTarget.value);
                        } else if (e.key === 'Escape') {
                          setEditingHeader(null);
                        }
                      }}
                      className="h-6 px-1 text-sm"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm truncate">{displayHeader}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingHeader(column.id)}
                        className="h-4 w-4 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {column.mandatory && (
                    <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                      Required
                    </span>
                  )}

                  {/* Sub-row checkbox moved to the end */}
                  {preferences.enableSubRowConfig && (
                    <div className="flex items-center space-x-1">
                      <Checkbox
                        checked={isSubRow}
                        onCheckedChange={() => handleSubRowToggle(column.id)}
                        className="shrink-0"
                      />
                      <span className="text-xs text-gray-600">Sub-row</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary section */}
      <div className="mt-4 pt-3 border-t text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Visible columns:</span>
          <span className="font-medium">{orderedColumns.length - preferences.hiddenColumns.length}</span>
        </div>
        {preferences.enableSubRowConfig && (
          <div className="flex justify-between">
            <span>Sub-row columns:</span>
            <span className="font-medium">{preferences.subRowColumns?.length || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}
