
import React from 'react';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';

export type GridColumnType =
  | 'Link'                 // Clickable cell with optional onClick or URL
  | 'Badge'                // Color-coded label based on value
  | 'BadgeCombinationCount' // Badge showing combination count
  | 'LinkWithText'        // Clickable cell with text and optional onClick or URL
  | 'TextWithTwoRow'       // Text with two rows, useful for displaying more information
  | 'DateTimeRange'        // Two date-time values in a vertical stack
  | 'TextWithTooltip'      // Text with an info icon showing a tooltip
  | 'ExpandableCount'      // "+N" style count, expandable to view details
  | 'CustomerCountBadge'   // Customer count badge with popup details
  | 'Text'                 // Standard text cell
  | 'TextCustom'           // Standard text cell with custom rendering
  | 'TextPipedData'        // Text with piped data rendering
  | 'Date'                 // Formatted date
  | 'DateRange'            // Date range picker
  | 'NumberRange'          // Number range with from/to inputs
  | 'DropdownText'         // Dropdown + Text combination
  | 'Dropdown'             // Selectable value from list (for edit or filter)
  | 'EditableText'        // Inline editable text
  | 'SubRow'            // Sub-row expandable content
  | 'DateFormat'
  | 'CurrencyWithSymbol'
  | 'ActionButton'
  | 'LegLocationFormat'        // Clickable button with SVG icon
  | 'BadgeCombinationCount'
  | 'String'               // String input for editing
  | 'Integer'              // Integer number input
  | 'Time'                 // Time picker
  | 'Select'               // Select dropdown
  | 'LazySelect'           // Lazy-loaded select with search
  | 'CurrencyWithSymbol'   // Currency with symbol
  | 'ActionButton'         // Action button column
  | 'LegLocationFormat';   // Location format for legs

export interface GridColumnConfig {
  key: string;
  label: string;
  type: GridColumnType;
  width?: number;          // Column width in pixels
  sortable?: boolean;
  filterable?: boolean;
  filterMode?: 'local' | 'server'; // Determines if filtering is done locally or on server
  editable?: boolean;
  mandatory?: boolean;
  hidden?: boolean;
  order?: number;
  options?: string[];
  subRow?: boolean; // Property for sub-row display
  multiSelect?: boolean; // Enable multi-select for dropdowns
  
  // Badge specific properties
  statusMap?: Record<string, string>;
  
  // Link specific properties
  onClick?: (rowData: any) => void;
  
  // TextWithTooltip specific properties
  infoTextField?: string;
  
  // ExpandableCount specific properties
  renderExpandedContent?: (rowData: any) => React.ReactNode;
  
  // SubRow specific properties
  subRowColumns?: GridColumnConfig[];
  
  // LazySelect specific properties
  fetchOptions?: (params: { searchTerm: string; offset: number; limit: number }) => Promise<Array<{ label: string; value: string }>>;
  hideSearch?: boolean;
  disableLazyLoading?: boolean;
  returnType?: string;
  onChange?: (value: any, rowData?: any, rowIndex?: number) => void;
  
  // ActionButton specific properties
  actionButtons?: Array<{
    icon: React.ReactNode;
    tooltip?: string;
    onClick: (rowData: any) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean | ((rowData: any) => boolean);
  }>;
}

// Legacy interfaces for backward compatibility
export interface Column<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  mandatory?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: Array<{ label: string; value: any }>;
  render?: (value: any, row: T) => React.ReactNode;
  validator?: (value: any) => boolean | string;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  column: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
}

export interface GridPreferences {
  columnOrder: string[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  columnHeaders: Record<string, string>;
  subRowColumns: string[]; // Existing property for tracking sub-row columns
  subRowColumnOrder: string[]; // New property for sub-row column ordering
  enableSubRowConfig?: boolean; // New property for enabling/disabling sub-row configuration
  sort?: SortConfig;
  filters: FilterConfig[];
  pageSize?: number;
}

export interface GridAPI {
  data: any[];
  filteredData: any[];
  selectedRows: any[];
  columns: GridColumnConfig[];
  preferences: GridPreferences;
  actions: {
    exportData: (format: 'csv' | 'xlsx' | 'json') => void;
    resetPreferences: () => void;
    toggleRowSelection: (rowIndex: number) => void;
    selectAllRows: () => void;
    clearSelection: () => void;
  };
}

export interface GridPlugin {
  id: string;
  name: string;
  toolbar?: (api: GridAPI) => React.ReactNode;
  rowActions?: (row: any, rowIndex: number, api: GridAPI) => React.ReactNode;
  footer?: (api: GridAPI) => React.ReactNode;
  init?: (api: GridAPI) => void;
  destroy?: () => void;
}

// Server-side filter interface
export interface ServerFilter {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'numberRange' | 'dropdownText' | 'time' | 'number' | 'boolean' | 'lazyselect';
  options?: string[];
  multiSelect?: boolean; // Enable multi-select for dropdown/select types
  fetchOptions?: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
  defaultValue?: any; // Default value for the filter field
  hideSearch?: boolean; // Hide search box in lazy select
  disableLazyLoading?: boolean; // Disable infinite scroll in lazy select
  returnType?: 'single' | 'array'; // Return type for the filter
}

export interface ExtraFilter {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'time' | 'number' | 'boolean';
  options?: string[];
}

export interface SubRowFilter {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'time' | 'number' | 'boolean';
  options?: string[];
}

export interface SmartGridProps {
  columns: GridColumnConfig[];
  data: any[];
  parentPage?: string;
  editableColumns?: string[] | boolean;
  mandatoryColumns?: string[];
  onInlineEdit?(rowIndex: number, updatedRow: any): void;
  onBulkUpdate?(rows: any[]): Promise<void>;
  onPreferenceSave?(preferences: any): Promise<void>;
  onDataFetch?(page: number, pageSize: number): Promise<any[]>;
  onUpdate?(row: any, rowIndex?: number): Promise<void>;
  onLinkClick?(rowData: any, columnKey: string, rowIndex: any): void;
  onFiltersChange?(filters: Record<string, any>): void;
  onSubRowToggle?(columnKey: string): void;
  onServerFilter?(filters: FilterConfig[]): Promise<void>;
  paginationMode?: 'pagination' | 'infinite';
  nestedRowRenderer?(row: any, rowIndex: number): React.ReactNode;
  onRowExpansionOverride?(rowIndex: number): void;
  plugins?: GridPlugin[];
  selectedRows?: Set<number>;
  defaultSelectedRows?: Set<number>;
  onSelectionChange?(selectedRows: Set<number>): void;
  onRowClick?(row: any, index: number): void;
  rowClassName?: (row: any, index: number) => string;
  highlightedRowIndices?: (number | string)[];
  configurableButtons?: ConfigurableButtonConfig[];
  showDefaultConfigurableButton?: boolean;
  defaultConfigurableButtonLabel?: string;
  gridTitle?: string;
  recordCount?: number;
  showCreateButton?: boolean;
  searchPlaceholder?: string;
  // Advanced Filter props
  extraFilters?: ExtraFilter[];
  subRowFilters?: SubRowFilter[];
  // Grouping props
  groupByField?: string | null;
  onGroupByChange?: (field: string | null) => void;
  groupableColumns?: string[];
  showGroupingDropdown?: boolean;
  // Search mode props
  clientSideSearch?: boolean;
  // Advanced Filter sub-header props
  showSubHeaders?: boolean;
  // Advanced Filter visibility props
  showMainRowFilters?: boolean;
  showExtraFilters?: boolean;
  showSubRowFilters?: boolean;
  // Server-side filter props
  showServersideFilter?: boolean;
  onToggleServersideFilter?: () => void;
  onSearch?: (filters?: any) => void;
  serverFilters?: ServerFilter[];
  showFilterTypeDropdown?: boolean;
  gridId?: string;
  userId?: string;
  api?: any;
  onClearAll?: () => void;
  // Control whether to show AdvancedFilter (disabled when using server-side filters)
  hideAdvancedFilter?: boolean;
  // Control whether to show the checkbox toggle button in toolbar
  hideCheckboxToggle?: boolean;
  // Control whether to show the toolbar
  hideToolbar?: boolean;
  customPageSize?: number | any;
}

// Legacy interface for backward compatibility
export interface SmartGridPropsLegacy<T = any> {
  // Data
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  
  // Features
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  reorderable?: boolean;
  resizable?: boolean;
  exportable?: boolean;
  bulkUpload?: boolean;
  
  // Pagination
  pagination?: boolean;
  infiniteScroll?: boolean;
  pageSize?: number;
  totalCount?: number;
  
  // Preferences
  persistPreferences?: boolean;
  preferencesKey?: string;
  
  // API Hooks
  onDataFetch?: (params: { page?: number; limit?: number; sort?: SortConfig; filters?: FilterConfig[] }) => Promise<{ data: T[]; total?: number }>;
  onUpdate?: (id: any, field: string, value: any) => Promise<boolean>;
  onBulkUpdate?: (updates: Array<{ id: any; data: Partial<T> }>) => Promise<boolean>;
  onPreferenceSave?: (preferences: GridPreferences) => Promise<void>;		
  onPreferenceLoad?: () => Promise<GridPreferences | null>;
  
  // Events
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  
  // Styling
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  loading?: boolean;
  emptyMessage?: string;
}

export interface CellEditProps {
  value: any;
  column: Column;
  onSave: (value: any) => void;
  onCancel: () => void;
}

// SmartGridPlus specific interfaces
export interface SmartGridPlusProps extends SmartGridProps {
  // Row operations
  inlineRowAddition?: boolean;
  inlineRowEditing?: boolean;
  onAddRow?: (row: any) => Promise<void> | void;
  onEditRow?: (row: any, rowIndex: number) => Promise<void> | void;
  onDeleteRow?: (row: any, rowIndex: number) => Promise<void> | void;
  
  // Default values and validation
  defaultRowValues?: Record<string, any>;
  validationRules?: {
    requiredFields?: string[];
    maxLength?: Record<string, number>;
    customValidationFn?: (values: Record<string, any>) => Record<string, string>;
  };
  
  // UI configuration
  addRowButtonLabel?: string;
  addRowButtonPosition?: "top-left" | "top-right" | "top";
}