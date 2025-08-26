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
  Group,
  Zap,
  EllipsisVertical,
  SlidersHorizontal
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ColumnVisibilityManager } from './ColumnVisibilityManager';
import { GridColumnConfig, GridPreferences } from '@/types/smartgrid';
import { ConfigurableButton, ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  onExport?: (format: 'csv' | 'xlsx') => void;
  onSubRowToggle?: (columnKey: string) => void;
  configurableButtons?: ConfigurableButtonConfig[];
  showDefaultConfigurableButton?: boolean;
  defaultConfigurableButtonLabel?: string;
  gridTitle?: string;
  recordCount?: number;
  showCreateButton?: boolean;
  searchPlaceholder?: string;
  clientSideSearch?: boolean;
  // Advanced Filter props
  showAdvancedFilter: boolean;
  onToggleAdvancedFilter: () => void;
  // Grouping props
  groupByField?: string | null;
  onGroupByChange?: (field: string | null) => void;
  groupableColumns?: string[];
  showGroupingDropdown?: boolean;
  createButtonLabel?: string;
  showFilterSystem?: boolean;
  setShowFilterSystem?: (show: boolean) => void;
  // Server-side filter props
  showServersideFilter?: boolean;
  onToggleServersideFilter?: () => void;
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
  searchPlaceholder = "Search",
  showFilterSystem,
  setShowFilterSystem,
  clientSideSearch = true,
  showAdvancedFilter,
  onToggleAdvancedFilter,
  groupByField,
  onGroupByChange,
  groupableColumns,
  showGroupingDropdown = false,
  showServersideFilter = false,
  onToggleServersideFilter
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
  
  // Determine which columns can be grouped
  const availableGroupColumns = React.useMemo(() => {
    if (groupableColumns) {
      return columns.filter(col => groupableColumns.includes(col.key));
    }
    // Show all columns by default
    return columns;
  }, [columns, groupableColumns]);

  const handleGroupByChange = (value: string) => {
    const newGroupBy = value === 'none' ? null : value;
    onGroupByChange?.(newGroupBy);
  };

  return (
    <div className="flex items-center justify-between w-full bg-gray-50 mb-4">
      {/* Left side - Grid Title and Count */}
      <div className="flex items-center">
        {gridTitle && (
          <div className="flex items-center">
            <span className="text-gray-900 font-semibold text-lg">
              {gridTitle}
            </span>
            {recordCount !== undefined && gridTitle !== 'Plan List' && (
              <span
                className="inline-flex items-center justify-center rounded-full text-xs badge-blue ml-3 font-medium"
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
        {/* Search box - only show if clientSideSearch is enabled */}
        <div className="relative">
          <Input
            name='grid-search-input'
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="gridSearch border border-gray-300 rounded text-sm placeholder-gray-400 px-2 py-1 pl-3 w-64 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          {/* {gridTitle !== 'Plan List' && (
            <span onClick={() => setShowFilterSystem(!showFilterSystem)} 
              className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.33333 14L3.33333 10M3.33333 10C4.06971 10 4.66667 9.40305 4.66667 8.66667C4.66667 7.93029 4.06971 7.33333 3.33333 7.33333C2.59695 7.33333 2 7.93029 2 8.66667C2 9.40305 2.59695 10 3.33333 10ZM3.33333 4.66667V2M8 14V10M8 4.66667V2M8 4.66667C7.26362 4.66667 6.66667 5.26362 6.66667 6C6.66667 6.73638 7.26362 7.33333 8 7.33333C8.73638 7.33333 9.33333 6.73638 9.33333 6C9.33333 5.26362 8.73638 4.66667 8 4.66667ZM12.6667 14V11.3333M12.6667 11.3333C13.403 11.3333 14 10.7364 14 10C14 9.26362 13.403 8.66667 12.6667 8.66667C11.9303 8.66667 11.3333 9.26362 11.3333 10C11.3333 10.7364 11.9303 11.3333 12.6667 11.3333ZM12.6667 6V2" stroke="#475467" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )} */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            className='absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600'>
            <path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z" stroke="#475467" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" /> */}
        </div>

        {/* Advanced Filter Toggle */}
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAdvancedFilter}
          disabled={loading}
          title="Toggle Advanced Filters"
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
            showAdvancedFilter && "bg-blue-50 text-blue-600"
          )}
        >
          <Search className="h-4 w-4" />
        </Button> */}

        {/* Server-side Filter Toggle */}
        {onToggleServersideFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleServersideFilter}
            disabled={loading}
            title="Toggle Server-side Filters"
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
              showServersideFilter && "bg-blue-100 text-blue-600"
            )}
          >
            <Search className="h-4 w-4" />
          </Button>
        )}

        {/* Icon buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowColumnFilters(!showColumnFilters)}
          disabled={loading}
          title="Toggle Column Filters"
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
            showColumnFilters && "bg-blue-100 text-blue-600"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_34673_3253)">
            <path d="M2.25758 3.7779C1.75336 3.21435 1.50125 2.93258 1.49174 2.69311C1.48348 2.48509 1.57287 2.28514 1.73341 2.15259C1.91821 2 2.29631 2 3.0525 2H12.9477C13.7039 2 14.082 2 14.2668 2.15259C14.4273 2.28514 14.5167 2.48509 14.5085 2.69311C14.4989 2.93258 14.2468 3.21436 13.7426 3.7779L9.93849 8.02957C9.83798 8.1419 9.78772 8.19807 9.75189 8.26199C9.72011 8.31869 9.69679 8.37973 9.68267 8.44317C9.66675 8.5147 9.66675 8.59007 9.66675 8.74081V12.3055C9.66675 12.4359 9.66675 12.501 9.64572 12.5574C9.62714 12.6072 9.59692 12.6518 9.55759 12.6876C9.51307 12.728 9.45254 12.7523 9.33149 12.8007L7.06485 13.7073C6.81982 13.8053 6.69731 13.8543 6.59896 13.8339C6.51295 13.816 6.43748 13.7649 6.38895 13.6917C6.33345 13.608 6.33345 13.476 6.33345 13.2121V8.74081C6.33345 8.59007 6.33345 8.5147 6.31753 8.44317C6.30341 8.37973 6.28009 8.31869 6.24831 8.26199C6.21247 8.19807 6.16222 8.1419 6.06171 8.02957L2.25758 3.7779Z" stroke="#475467" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_34673_3253">
            <rect width="15.9999" height="15.9999" fill="white"/>
            </clipPath>
            </defs>
          </svg>

          {/* <Filter className="h-4 w-4 text-gray-600" /> */}
          {filters.length > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
              {filters.length}
            </span>
          )}
        </Button>

        {/* Export Dropdown Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              title="Export Data"
              className="w-16 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.9999 9.99993V10.7999C13.9999 11.92 13.9999 12.4801 13.7819 12.9079C13.5902 13.2842 13.2842 13.5902 12.9079 13.7819C12.4801 13.9999 11.92 13.9999 10.7999 13.9999H5.19997C4.07988 13.9999 3.51983 13.9999 3.09201 13.7819C2.71569 13.5902 2.40973 13.2842 2.21798 12.9079C2 12.4801 2 11.92 2 10.7999V9.99993M11.3332 6.66662L7.99995 9.99993M7.99995 9.99993L4.66664 6.66662M7.99995 9.99993V2" stroke="#475467" strokeWidth="1.33332" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* <Download className="h-4 w-4" /> */}
              <ChevronDown className="h-3 w-3 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('csv')}>
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('xlsx')}>
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter System Toggle Button */}
        {/* {gridTitle !== 'Plan List' && setShowFilterSystem && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilterSystem(!showFilterSystem)}
            disabled={loading}
            title="Toggle Advanced Filter System"
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
              showFilterSystem && "bg-blue-50 text-blue-600"
            )}
          >
            <span className="right-8 top-1/2 transform text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.33333 14L3.33333 10M3.33333 10C4.06971 10 4.66667 9.40305 4.66667 8.66667C4.66667 7.93029 4.06971 7.33333 3.33333 7.33333C2.59695 7.33333 2 7.93029 2 8.66667C2 9.40305 2.59695 10 3.33333 10ZM3.33333 4.66667V2M8 14V10M8 4.66667V2M8 4.66667C7.26362 4.66667 6.66667 5.26362 6.66667 6C6.66667 6.73638 7.26362 7.33333 8 7.33333C8.73638 7.33333 9.33333 6.73638 9.33333 6C9.33333 5.26362 8.73638 4.66667 8 4.66667ZM12.6667 14V11.3333M12.6667 11.3333C13.403 11.3333 14 10.7364 14 10C14 9.26362 13.403 8.66667 12.6667 8.66667C11.9303 8.66667 11.3333 9.26362 11.3333 10C11.3333 10.7364 11.9303 11.3333 12.6667 11.3333ZM12.6667 6V2" stroke="#475467" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Button>
        )} */}
        
        <Button 
          variant="ghost"
          size="sm" 
          onClick={() => setShowCheckboxes(!showCheckboxes)}
          disabled={loading}
          title="Toggle Checkboxes"
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300",
            showCheckboxes && "bg-blue-100 text-blue-600"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_34673_19673)">
            <path d="M5.99996 7.33328L7.99994 9.33327L14.6666 2.66666M10.6666 2H5.19997C4.07988 2 3.51983 2 3.09201 2.21798C2.71569 2.40973 2.40973 2.71569 2.21798 3.09201C2 3.51983 2 4.07988 2 5.19997V10.7999C2 11.92 2 12.4801 2.21798 12.9079C2.40973 13.2842 2.71569 13.5902 3.09201 13.7819C3.51983 13.9999 4.07988 13.9999 5.19997 13.9999H10.7999C11.92 13.9999 12.4801 13.9999 12.9079 13.7819C13.2842 13.5902 13.5902 13.2842 13.7819 12.9079C13.9999 12.4801 13.9999 11.92 13.9999 10.7999V7.99994" stroke="#475467" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_34673_19673">
            <rect width="15.9999" height="15.9999" fill="white"/>
            </clipPath>
            </defs>
          </svg>
          {/* <CheckSquare className="h-4 w-4 text-gray-600" /> */}
        </Button>

        {/* {gridTitle !== 'Plan List' && (
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
        )} */}

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

        {/* <Button 
          variant="ghost"
          size="sm" 
          onClick={() => onExport('csv')} 
          disabled={loading}
          title="Download CSV"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 p-0 border border-gray-300"
        >
          <Download className="h-4 w-4 text-gray-600" />
        </Button> */}
        

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
        {/* {showCreateButton && (
          <Button
            variant="outline"
            size="sm"
            className="border border-blue-500 text-blue-500 rounded-lg px-3 py-1 text-sm hover:bg-blue-50 h-8 ml-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            {createButtonLabel}
            <ChevronDown className="h-4 w-4 mr-1" />
          </Button>
        )} */}

		{/* Group by dropdown button */}
        {/* {showGroupingDropdown && availableGroupColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost"
                size="sm" 
                disabled={loading}
                title="Group By"
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 p-0"
              >
                <Group className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleGroupByChange('none')}>
                No grouping
              </DropdownMenuItem>
              {availableGroupColumns.map(col => (
                <DropdownMenuItem 
                  key={col.key} 
                  onClick={() => handleGroupByChange(col.key)}
                  className={groupByField === col.key ? 'bg-blue-50 text-blue-600' : ''}
                >
                  {col.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
        
        {gridTitle !== 'Plan List' && (
          <div className="h-8 w-1 flex justify-center">
            <div className="" style={{
              'width': '1px',
              'height': 'inherit',
              'border': '1px solid #EAECF0'
            }}></div>
          </div>
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
