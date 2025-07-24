
import React from 'react';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';

export type GridColumnType =
  | 'Link'                 // Clickable cell with optional onClick or URL
  | 'Badge'                // Color-coded label based on value
  | 'DateTimeRange'        // Two date-time values in a vertical stack
  | 'TextWithTooltip'      // Text with an info icon showing a tooltip
  | 'ExpandableCount'      // "+N" style count, expandable to view details
  | 'Text'                 // Standard text cell
  | 'Date'                 // Formatted date
  | 'Dropdown'             // Selectable value from list (for edit or filter)
  | 'EditableText'         // Inline editable text
  | 'SubRow';              // Sub-row expandable content

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
    exportData: (format: 'csv' | 'excel' | 'json') => void;
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

export interface SmartGridProps {
  columns: GridColumnConfig[];
  data: any[];
  editableColumns?: string[] | boolean;
  mandatoryColumns?: string[];
  onInlineEdit?(rowIndex: number, updatedRow: any): void;
  onBulkUpdate?(rows: any[]): Promise<void>;
  onPreferenceSave?(preferences: any): Promise<void>;
  onDataFetch?(page: number, pageSize: number): Promise<any[]>;
  onUpdate?(row: any): Promise<void>;
  onLinkClick?(rowData: any, columnKey: string): void;
  onSubRowToggle?(columnKey: string): void;
  onServerFilter?(filters: FilterConfig[]): Promise<void>;
  paginationMode?: 'pagination' | 'infinite';
  nestedRowRenderer?(row: any, rowIndex: number): React.ReactNode;
  plugins?: GridPlugin[];
  selectedRows?: Set<number>;
  onSelectionChange?(selectedRows: Set<number>): void;
  rowClassName?: (row: any, index: number) => string;
  configurableButtons?: ConfigurableButtonConfig[];
  showDefaultConfigurableButton?: boolean;
  defaultConfigurableButtonLabel?: string;
  gridTitle?: string;
  recordCount?: number;
  showCreateButton?: boolean;
  searchPlaceholder?: string;
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
