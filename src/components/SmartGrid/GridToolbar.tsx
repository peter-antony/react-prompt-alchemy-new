import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  CheckSquare,
  Grid2x2,
  List,
  Plus,
  ChevronDown,
  EllipsisVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColumnVisibilityManager } from './ColumnVisibilityManager';
import { GridColumnConfig, GridPreferences } from '@/types/smartgrid';
import { ConfigurableButton, ConfigurableButtonConfig } from '@/components/ui/configurable-button';

interface GridToolbarProps {
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  showColumnFilters?: boolean;
  setShowColumnFilters?: (show: boolean) => void;
  showCheckboxes?: boolean;
  setShowCheckboxes?: (show: boolean) => void;
  viewMode?: 'table' | 'card';
  setViewMode?: (mode: 'table' | 'card') => void;
  loading: boolean;
  filters: any[];
  columns: GridColumnConfig[];
  preferences: GridPreferences;
  onColumnVisibilityToggle?: (columnId: string) => void;
  onColumnHeaderChange?: (columnId: string, header: string) => void;
  onResetToDefaults?: () => void;
  onExport?: (format: 'csv') => void;
  onSubRowToggle?: (columnKey: string) => void;
  configurableButtons?: ConfigurableButtonConfig[];
  showDefaultConfigurableButton?: boolean;
  defaultConfigurableButtonLabel?: string;
  gridTitle?: string;
  recordCount?: number;
  showCreateButton?: boolean;
  searchPlaceholder?: string;
  createButtonLabel?: string;
}

export function GridToolbar({
  globalFilter,
  setGlobalFilter,
  showColumnFilters,
  setShowColumnFilters,
  showCheckboxes,
  setShowCheckboxes,
  viewMode,
  setViewMode,
  loading,
  filters,
  columns,
  preferences,
  onColumnVisibilityToggle,
  onColumnHeaderChange,
  onResetToDefaults,
  onExport,
  onSubRowToggle,
  configurableButtons,
  showDefaultConfigurableButton = true,
  defaultConfigurableButtonLabel = "Add",
  gridTitle,
  recordCount,
  showCreateButton = false,
  createButtonLabel = "Create",
  searchPlaceholder = "Search"
}: GridToolbarProps) {
  // Default configurable button configuration
  const defaultConfigurableButton: ConfigurableButtonConfig = {
    label: defaultConfigurableButtonLabel,
    tooltipTitle: "Add new item",
    showDropdown: false,
    onClick: () => {
      defaultConfigurableButton.onClick();
    }
  };

  // Determine which buttons to show
  const buttonsToShow = configurableButtons && configurableButtons.length > 0 
    ? configurableButtons 
    : (showDefaultConfigurableButton ? [defaultConfigurableButton] : []);

  return (
    <div className="flex items-center justify-between w-full mb-4">
      {/* Left side - Grid Title and Count */}
      <div className="flex items-center">
        {gridTitle && (
          <div className="flex items-center">
            <span className="text-gray-900 font-semibold text-lg">
              {gridTitle}
            </span>
            {recordCount !== undefined && gridTitle !== 'Plan List' && (
              <span 
                className="inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-500 text-xs px-2 py-1 ml-3 border font-medium border-blue-200"
                aria-label={`${gridTitle} count ${recordCount}`}
              >
                {recordCount}
              </span>
            )}
          </div>
        )}

        {/* Show active filters count */}
        {filters.length > 0 && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded ml-3">
            {filters.length} filter{filters.length > 1 ? 's' : ''} active
          </div>
        )}
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-3">
        {/* Search box */}
        <div className="relative">
          <Input
            name='grid-search-input'
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border border-gray-300 rounded text-sm placeholder-gray-400 px-2 py-1 pl-3 w-64 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          {gridTitle !== 'Plan List' && (
            <span className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.33333 14L3.33333 10M3.33333 10C4.06971 10 4.66667 9.40305 4.66667 8.66667C4.66667 7.93029 4.06971 7.33333 3.33333 7.33333C2.59695 7.33333 2 7.93029 2 8.66667C2 9.40305 2.59695 10 3.33333 10ZM3.33333 4.66667V2M8 14V10M8 4.66667V2M8 4.66667C7.26362 4.66667 6.66667 5.26362 6.66667 6C6.66667 6.73638 7.26362 7.33333 8 7.33333C8.73638 7.33333 9.33333 6.73638 9.33333 6C9.33333 5.26362 8.73638 4.66667 8 4.66667ZM12.6667 14V11.3333M12.6667 11.3333C13.403 11.3333 14 10.7364 14 10C14 9.26362 13.403 8.66667 12.6667 8.66667C11.9303 8.66667 11.3333 9.26362 11.3333 10C11.3333 10.7364 11.9303 11.3333 12.6667 11.3333ZM12.6667 6V2" stroke="#475467" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
        </div>

        {/* Icon buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowColumnFilters(!showColumnFilters)}
          disabled={loading}
          title="Toggle Column Filters"
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
            showColumnFilters && "bg-blue-50 text-blue-600"
          )}
        >
          <Filter className="h-4 w-4 text-gray-600" />
          {filters.length > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
              {filters.length}
            </span>
          )}
        </Button>

        <Button 
          variant="ghost"
          size="sm" 
          onClick={() => setShowCheckboxes(!showCheckboxes)}
          disabled={loading}
          title="Toggle Checkboxes"
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
            showCheckboxes && "bg-blue-50 text-blue-600"
          )}
        >
          <CheckSquare className="h-4 w-4 text-gray-600" />
        </Button>

        {gridTitle !== 'Plan List' && (
          <Button 
            variant="ghost"
            size="sm" 
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            disabled={loading}
            title={`Switch to ${viewMode === 'table' ? 'Card' : 'Table'} View`}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
              viewMode === 'card' && "bg-blue-50 text-blue-600"
            )}
          >
            {viewMode === 'table' ? (
              <Grid2x2 className="h-4 w-4 text-gray-600" />
            ) : (
              <List className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        )}

        {/* Column Visibility Manager */}
        {gridTitle !== 'Plan List' && (
          <ColumnVisibilityManager
            columns={columns}
            preferences={preferences}
            onColumnVisibilityToggle={onColumnVisibilityToggle}
            onColumnHeaderChange={onColumnHeaderChange}
            onResetToDefaults={onResetToDefaults}
            onSubRowToggle={onSubRowToggle}
          />
        )}

        {gridTitle !== 'Plan List' && (
          <Button 
            variant="ghost"
            size="sm" 
            onClick={onResetToDefaults} 
            disabled={loading}
            title="Reset All"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </Button>
        )}
        
        <Button 
          variant="ghost"
          size="sm" 
          onClick={() => onExport('csv')} 
          disabled={loading}
          title="Download CSV"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300"
        >
          <Download className="h-4 w-4 text-gray-600" />
        </Button>

        {gridTitle === 'Plan List' && (
          <Button 
            variant="ghost"
            size="sm" 
            onClick={onResetToDefaults} 
            disabled={loading}
            title="MoreInfo"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300"
          >
            <EllipsisVertical className="h-4 w-4 text-gray-600" />
          </Button>
        )}

        {/* Create Button */}
        {showCreateButton && (
          <Button
            variant="outline"
            size="sm"
            className="border border-blue-500 text-blue-500 rounded-lg px-3 py-1 text-sm hover:bg-blue-50 h-8 ml-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            {createButtonLabel}
            <ChevronDown className="h-4 w-4 mr-1" />
          </Button>
        )}
        
        {/* Configurable Buttons */}
        {buttonsToShow.map((buttonConfig, index) => (
          <ConfigurableButton
            key={index}
            config={buttonConfig}
          />
        ))}
      </div>
    </div>
  );
}
