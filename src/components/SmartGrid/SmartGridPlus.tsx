import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  GripVertical,
  ChevronRight, 
  ChevronDown,
  Plus,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { SmartGridPlusProps, GridColumnConfig, SortConfig, FilterConfig, GridAPI } from '@/types/smartgrid';
import { exportToCSV, exportToExcel } from '@/utils/gridExport';
import { useToast } from '@/hooks/use-toast';
import { useGridPreferences } from '@/hooks/useGridPreferences';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { processGridData } from '@/utils/gridDataProcessing';
import { calculateColumnWidths } from '@/utils/columnWidthCalculations';
import { CellRenderer } from './CellRenderer';
import { GridToolbar } from './GridToolbar';
import { PluginRenderer, PluginRowActions } from './PluginRenderer';
import { ColumnFilter } from './ColumnFilter';
import { DraggableSubRow } from './DraggableSubRow';
import { FilterSystem } from './FilterSystem';
import { mockFilterAPI } from '@/utils/mockFilterAPI';
import { cn } from '@/lib/utils';

export function SmartGridPlus({
  columns,
  data,
  editableColumns = true,
  mandatoryColumns = [],
  onInlineEdit,
  onBulkUpdate,
  onPreferenceSave,
  onDataFetch,
  onUpdate,
  onLinkClick,
  onSubRowToggle,
  onServerFilter,
  paginationMode = 'pagination',
  nestedRowRenderer,
  plugins = [],
  selectedRows,
  onSelectionChange,
  rowClassName,
  configurableButtons,
  showDefaultConfigurableButton,
  defaultConfigurableButtonLabel,
  gridTitle,
  recordCount,
  // SmartGridPlus specific props
  inlineRowAddition = true,
  inlineRowEditing = true,
  onAddRow,
  onEditRow,
  onDeleteRow,
  defaultRowValues = {},
  validationRules = {},
  addRowButtonLabel = "Add Row",
  addRowButtonPosition = "top-left"
}: SmartGridPlusProps) {
  const {
    gridData,
    setGridData,
    columns: stateColumns,
    setColumns,
    editingCell,
    setEditingCell,
    editingHeader,
    setEditingHeader,
    draggedColumn,
    setDraggedColumn,
    dragOverColumn,
    setDragOverColumn,
    sort,
    setSort,
    filters,
    setFilters,
    globalFilter,
    setGlobalFilter,
    currentPage,
    setCurrentPage,
    loading,
    setLoading,
    error,
    setError,
    expandedRows,
    setExpandedRows,
    internalSelectedRows,
    setInternalSelectedRows,
    showCheckboxes,
    setShowCheckboxes,
    viewMode,
    setViewMode,
    showColumnFilters,
    setShowColumnFilters,
    resizingColumn,
    setResizingColumn,
    resizeHoverColumn,
    setResizeHoverColumn,
    columnWidths,
    setColumnWidths,
    resizeStartRef,
    handleColumnFilterChange,
    handleClearColumnFilter,
    handleSort,
    toggleRowExpansion,
    handleSubRowToggle,
    handleSubRowEdit,
    handleSubRowEditStart,
    handleSubRowEditCancel
  } = useSmartGridState();

  const [pageSize] = useState(10);
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [filterSystemFilters, setFilterSystemFilters] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // SmartGridPlus specific state
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowValues, setNewRowValues] = useState<Record<string, any>>(defaultRowValues);

  // Use external selectedRows if provided, otherwise use internal state
  const currentSelectedRows = selectedRows || internalSelectedRows;
  const handleSelectionChange = onSelectionChange || setInternalSelectedRows;

  // Use the current state columns (which include sub-row updates) instead of props
  const currentColumns = stateColumns.length > 0 ? stateColumns : columns;

  // Convert GridColumnConfig to Column format for useGridPreferences
  const preferencesColumns = useMemo(() => currentColumns.map(col => ({
    id: col.key,
    header: col.label,
    accessor: col.key,
    mandatory: col.mandatory
  })), [currentColumns]);

  // Initialize preferences hook with proper async handling
  const {
    preferences,
    updateColumnOrder,
    toggleColumnVisibility,
    updateColumnHeader,
    updateSubRowColumnOrder,
    savePreferences
  } = useGridPreferences(
    preferencesColumns,
    true, // persistPreferences
    'smartgridplus-preferences',
    onPreferenceSave ? async (preferences) => {
      try {
        await Promise.resolve(onPreferenceSave(preferences));
      } catch (error) {
        console.error('Failed to save preferences:', error);
        setError('Failed to save preferences');
      }
    } : undefined
  );

  // Calculate responsive column widths based on content type and available space
  const calculateColumnWidthsCallback = useCallback((visibleColumns: GridColumnConfig[]) => {
    return calculateColumnWidths(visibleColumns, showCheckboxes, plugins, preferences, columnWidths);
  }, [preferences, showCheckboxes, plugins, columnWidths]);

  // Apply preferences to get ordered and visible columns - FILTER OUT SUB-ROW COLUMNS from main table
  const orderedColumns = useMemo(() => {
    const columnMap = new Map(currentColumns.map(col => [col.key, col]));
    
    const visibleColumns = preferences.columnOrder
      .map(id => columnMap.get(id))
      .filter((col): col is GridColumnConfig => col !== undefined)
      .filter(col => !preferences.hiddenColumns.includes(col.key))
      .filter(col => !col.subRow); // Filter out sub-row columns from main table
    
    const calculatedWidths = calculateColumnWidthsCallback(visibleColumns);
    
    return visibleColumns.map(col => ({
      ...col,
      label: preferences.columnHeaders[col.key] || col.label,
      hidden: preferences.hiddenColumns.includes(col.key),
      width: calculatedWidths[col.key] || 100,
      filterable: col.filterable !== false // Enable filtering by default
    }));
  }, [currentColumns, preferences, calculateColumnWidthsCallback]);

  // Get sub-row columns (columns marked with subRow: true)
  const subRowColumns = useMemo(() => {
    return currentColumns.filter(col => col.subRow === true);
  }, [currentColumns]);

  // Check if any column has subRow set to true
  const hasSubRowColumns = useMemo(() => {
    return subRowColumns.length > 0;
  }, [subRowColumns]);

  // Check if any column has collapsibleChild set to true
  const hasCollapsibleColumns = useMemo(() => {
    return currentColumns.some(col => col.subRow === true);
  }, [currentColumns]);

  // Get collapsible columns
  const collapsibleColumns = useMemo(() => {
    return currentColumns.filter(col => col.subRow === true);
  }, [currentColumns]);

  // Handle sub-row toggle with proper column updates
  const handleSubRowToggleInternal = useCallback((columnKey: string) => {
    console.log('Internal sub-row toggle for column:', columnKey);
    
    // Call the hook's toggle function
    handleSubRowToggle(columnKey);
    
    // Also call the external handler if provided
    if (onSubRowToggle) {
      onSubRowToggle(columnKey);
    }
  }, [handleSubRowToggle, onSubRowToggle]);

  // Helper function to render collapsible cell values
  const renderCollapsibleCellValue = useCallback((value: any, column: GridColumnConfig) => {
    if (value == null) return '-';
    
    switch (column.type) {
      case 'Badge':
        return (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            column.statusMap?.[value] || "bg-gray-100 text-gray-800"
          )}>
            {value}
          </span>
        );
      case 'Date':
        return new Date(value).toLocaleDateString();
      case 'Link':
        return (
          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
            {value}
          </span>
        );
      default:
        return String(value);
    }
  }, []);

  // Render collapsible content
  const renderCollapsibleContent = useCallback((row: any) => {
    if (!hasCollapsibleColumns || collapsibleColumns.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collapsibleColumns.map((column) => {
          const value = row[column.key];
          return (
            <div key={column.key} className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {column.label}
              </div>
              <div className="text-sm text-gray-900 font-medium">
                {renderCollapsibleCellValue(value, column)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [hasCollapsibleColumns, collapsibleColumns, renderCollapsibleCellValue]);

  // Enhanced nested row renderer for sub-row columns with drag-and-drop
  const renderSubRowContent = useCallback((row: any, rowIndex: number) => {
    if (hasSubRowColumns && subRowColumns.length > 0) {
      return (
        <DraggableSubRow
          row={row}
          rowIndex={rowIndex}
          columns={subRowColumns}
          subRowColumnOrder={preferences.subRowColumnOrder}
          editingCell={editingCell}
          onReorderSubRowColumns={updateSubRowColumnOrder}
          onSubRowEdit={handleSubRowEdit}
          onSubRowEditStart={handleSubRowEditStart}
          onSubRowEditCancel={handleSubRowEditCancel}
        />
      );
    }

    // Fallback to collapsible content if no sub-row columns
    return renderCollapsibleContent(row);
  }, [hasSubRowColumns, subRowColumns, preferences.subRowColumnOrder, editingCell, updateSubRowColumnOrder, handleSubRowEdit, handleSubRowEditStart, handleSubRowEditCancel, renderCollapsibleContent]);

  // Use sub-row renderer if we have sub-row columns, otherwise use collapsible or custom renderer
  const effectiveNestedRowRenderer = hasSubRowColumns ? renderSubRowContent : (hasCollapsibleColumns ? renderCollapsibleContent : nestedRowRenderer);

  // Process data with sorting and filtering (only if not using lazy loading)
  const processedData = useMemo(() => {
    return processGridData(gridData, globalFilter, filters, sort, currentColumns, onDataFetch);
  }, [gridData, globalFilter, filters, sort, currentColumns, onDataFetch]);

  // Handle filter system changes
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilterSystemFilters(newFilters);
    // Convert filter system filters to legacy format if needed
    const legacyFilters = Object.entries(newFilters).map(([column, filterValue]) => ({
      column,
      value: filterValue.value,
      operator: filterValue.operator || 'contains'
    }));
    
    // Check if any filters require server-side processing
    const serverFilters = legacyFilters.filter(filter => {
      const column = currentColumns.find(col => col.key === filter.column);
      return column?.filterMode === 'server';
    });
    
    const localFilters = legacyFilters.filter(filter => {
      const column = currentColumns.find(col => col.key === filter.column);
      return column?.filterMode !== 'server';
    });
    
    // Apply server-side filters if any and onServerFilter is provided
    if (serverFilters.length > 0 && onServerFilter) {
      onServerFilter(serverFilters).catch(error => {
        console.error('Server-side filtering failed:', error);
        toast({
          title: "Error",
          description: "Failed to apply server-side filters",
          variant: "destructive"
        });
      });
    }
    
    // Set local filters only
    setFilters(localFilters);
  }, [setFilters, currentColumns, onServerFilter, toast]);

  // Define handleExport and handleResetPreferences after processedData and orderedColumns
  const handleExport = useCallback((format: 'csv' | 'xlsx' | 'json') => {
    const filename = `export-${new Date().toISOString().split('T')[0]}.${format}`;
    if (format === 'xlsx') {
      exportToExcel(processedData, orderedColumns, filename);
    } else if (format === 'json') {
      // JSON export functionality can be added here if needed
      console.log('JSON export not yet implemented');
    } else {
      exportToCSV(processedData, orderedColumns, filename);
    }
  }, [processedData, orderedColumns]);

  const handleResetPreferences = useCallback(async () => {
    const defaultPreferences = {
      columnOrder: currentColumns.map(col => col.key),
      hiddenColumns: [],
      columnWidths: {},
      columnHeaders: {},
      subRowColumns: [],
      subRowColumnOrder: [], // Reset sub-row column order
      filters: []
    };
    
    try {
      await savePreferences(defaultPreferences);
      setSort(undefined);
      setFilters([]);
      setGlobalFilter('');
      setColumnWidths({});
      setShowColumnFilters(false);
      
      toast({
        title: "Success",
        description: "Column preferences have been reset to defaults"
      });
    } catch (error) {
      setError('Failed to reset preferences');
      toast({
        title: "Error",
        description: "Failed to reset preferences",
        variant: "destructive"
      });
    }
  }, [currentColumns, savePreferences, toast, setSort, setFilters, setGlobalFilter, setColumnWidths, setShowColumnFilters]);

  // Handle column resizing
  const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const currentColumn = orderedColumns.find(col => col.key === columnKey);
    const startWidth = currentColumn?.width || 100;
    
    setResizingColumn(columnKey);
    resizeStartRef.current = { x: startX, width: startWidth };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;
      
      const deltaX = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(80, resizeStartRef.current.width + deltaX);
      
      setColumnWidths(prev => ({
        ...prev,
        [columnKey]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      setResizeHoverColumn(null);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [orderedColumns, setResizingColumn, setResizeHoverColumn, setColumnWidths]);

  // Create Grid API for plugins
  const gridAPI: GridAPI = useMemo(() => ({
    data: gridData,
    filteredData: processedData,
    selectedRows: Array.from(currentSelectedRows).map(index => processedData[index]).filter(Boolean),
    columns: orderedColumns,
    preferences,
    actions: {
      exportData: handleExport,
      resetPreferences: handleResetPreferences,
      toggleRowSelection: (rowIndex: number) => {
        const newSet = new Set(currentSelectedRows);
        if (newSet.has(rowIndex)) {
          newSet.delete(rowIndex);
        } else {
          newSet.add(rowIndex);
        }
        handleSelectionChange(newSet);
      },
      selectAllRows: () => {
        handleSelectionChange(new Set(Array.from({ length: processedData.length }, (_, i) => i)));
      },
      clearSelection: () => {
        handleSelectionChange(new Set());
      }
    }
  }), [gridData, processedData, currentSelectedRows, orderedColumns, preferences, handleExport, handleResetPreferences, handleSelectionChange]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (paginationMode !== 'pagination' || onDataFetch) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, paginationMode, currentPage, pageSize, onDataFetch]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Handle header editing
  const handleHeaderEdit = useCallback((columnKey: string, newHeader: string) => {
    if (resizingColumn) return;
    
    if (newHeader.trim() && newHeader !== preferences.columnHeaders[columnKey]) {
      updateColumnHeader(columnKey, newHeader.trim());
      toast({
        title: "Success",
        description: "Column header updated"
      });
    }
    setEditingHeader(null);
  }, [updateColumnHeader, preferences.columnHeaders, toast, resizingColumn, setEditingHeader]);

  const handleHeaderClick = useCallback((columnKey: string) => {
    if (resizingColumn) return;
    setEditingHeader(columnKey);
  }, [resizingColumn, setEditingHeader]);

  // Handle drag and drop for column reordering
  const handleColumnDragStart = useCallback((e: React.DragEvent, columnKey: string) => {
    if (editingHeader || resizingColumn) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnKey);
  }, [editingHeader, resizingColumn, setDraggedColumn]);

  const handleColumnDragOver = useCallback((e: React.DragEvent, targetColumnKey: string) => {
    if (resizingColumn) {
      e.preventDefault();
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    if (draggedColumn && draggedColumn !== targetColumnKey) {
      setDragOverColumn(targetColumnKey);
      e.dataTransfer.dropEffect = 'move';
    }
  }, [draggedColumn, resizingColumn, setDragOverColumn]);

  const handleColumnDragLeave = useCallback((e: React.DragEvent) => {
    if (resizingColumn) return;
    
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  }, [resizingColumn, setDragOverColumn]);

  const handleColumnDrop = useCallback((e: React.DragEvent, targetColumnKey: string) => {
    if (resizingColumn) {
      e.preventDefault();
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedColumn || draggedColumn === targetColumnKey) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const newOrder = [...preferences.columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnKey);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    updateColumnOrder(newOrder);
    setDraggedColumn(null);
    setDragOverColumn(null);
    
    toast({
      title: "Success",
      description: "Column order updated"
    });
  }, [draggedColumn, preferences.columnOrder, updateColumnOrder, toast, resizingColumn, setDraggedColumn, setDragOverColumn]);

  const handleColumnDragEnd = useCallback(() => {
    if (resizingColumn) return;
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, [resizingColumn, setDraggedColumn, setDragOverColumn]);

  // Determine if a column is editable
  const isColumnEditable = useCallback((column: GridColumnConfig, columnIndex: number) => {
    if (columnIndex === 0) return false;
    
    if (Array.isArray(editableColumns)) {
      return editableColumns.includes(column.key);
    }
    
    return editableColumns && column.editable;
  }, [editableColumns]);

  // Cell editing functions (original SmartGrid functionality)
  const handleCellEdit = useCallback(async (rowIndex: number, columnKey: string, value: any) => {
    const actualRowIndex = onDataFetch ? rowIndex : (currentPage - 1) * pageSize + rowIndex;
    const updatedData = [...gridData];
    const originalRow = updatedData[actualRowIndex];
    const updatedRow = { ...originalRow, [columnKey]: value };
    
    updatedData[actualRowIndex] = updatedRow;
    setGridData(updatedData);
    setEditingCell(null);
    
    if (onUpdate) {
      setLoading(true);
      setError(null);
      try {
        await onUpdate(updatedRow);
        toast({
          title: "Success",
          description: "Row updated successfully"
        });
      } catch (err) {
        updatedData[actualRowIndex] = originalRow;
        setGridData(updatedData);
        setError('Failed to update row');
        toast({
          title: "Error",
          description: "Failed to update row",
          variant: "destructive"
        });
        console.error('Update error:', err);
      } finally {
        setLoading(false);
      }
    } else if (onInlineEdit) {
      onInlineEdit(actualRowIndex, updatedRow);
    }
  }, [gridData, currentPage, pageSize, onInlineEdit, onUpdate, onDataFetch, toast, setGridData, setEditingCell, setLoading, setError]);

  const handleEditStart = useCallback((rowIndex: number, columnKey: string) => {
    setEditingCell({ rowIndex, columnKey });
  }, [setEditingCell]);

  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
  }, [setEditingCell]);

  // SmartGridPlus specific functionality
  const validateRow = useCallback((values: Record<string, any>) => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    if (validationRules.requiredFields) {
      validationRules.requiredFields.forEach(field => {
        if (!values[field] || values[field].toString().trim() === '') {
          errors[field] = 'This field is required';
        }
      });
    }

    // Max length validation
    if (validationRules.maxLength) {
      Object.entries(validationRules.maxLength).forEach(([field, maxLen]) => {
        if (values[field] && values[field].toString().length > maxLen) {
          errors[field] = `Maximum ${maxLen} characters allowed`;
        }
      });
    }

    // Custom validation
    if (validationRules.customValidationFn) {
      const customErrors = validationRules.customValidationFn(values);
      Object.assign(errors, customErrors);
    }

    return errors;
  }, [validationRules]);

  // Add Row functionality
  const handleAddRowClick = useCallback(() => {
    setIsAddingRow(true);
    setNewRowValues(defaultRowValues);
    // Scroll to top if needed
    if (addRowButtonPosition === "top") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [defaultRowValues, addRowButtonPosition]);

  const handleSaveNewRow = useCallback(async () => {
    const errors = validateRow(newRowValues);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const newRow = {
        id: Date.now().toString(),
        ...newRowValues
      };

      const updatedData = [newRow, ...gridData];
      setGridData(updatedData);
      
      if (onAddRow) {
        await onAddRow(newRow);
      }

      setIsAddingRow(false);
      setNewRowValues(defaultRowValues);
      setValidationErrors({});
      
      toast({
        title: "Row Added",
        description: "New row has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new row.",
        variant: "destructive",
      });
    }
  }, [newRowValues, validateRow, gridData, setGridData, onAddRow, defaultRowValues, toast]);

  const handleCancelNewRow = useCallback(() => {
    setIsAddingRow(false);
    setNewRowValues(defaultRowValues);
    setValidationErrors({});
  }, [defaultRowValues]);

  // Edit Row functionality
  const handleStartEditRow = useCallback((rowIndex: number, row: any) => {
    setEditingRow(rowIndex);
    setEditingValues({ ...row });
    setValidationErrors({});
  }, []);

  const handleSaveEditRow = useCallback(async (rowIndex: number) => {
    const errors = validateRow(editingValues);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const updatedData = [...gridData];
      updatedData[rowIndex] = { ...editingValues };
      setGridData(updatedData);
      
      if (onEditRow) {
        await onEditRow(editingValues, rowIndex);
      }

      setEditingRow(null);
      setEditingValues({});
      setValidationErrors({});
      
      toast({
        title: "Row Updated",
        description: "Row has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update row.",
        variant: "destructive",
      });
    }
  }, [editingValues, validateRow, gridData, setGridData, onEditRow, toast]);

  const handleCancelEditRow = useCallback(() => {
    setEditingRow(null);
    setEditingValues({});
    setValidationErrors({});
  }, []);

  const handleDeleteRowAction = useCallback(async (rowIndex: number, row: any) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      try {
        const updatedData = gridData.filter((_, index) => index !== rowIndex);
        setGridData(updatedData);
        
        if (onDeleteRow) {
          await onDeleteRow(row, rowIndex);
        }

        toast({
          title: "Row Deleted",
          description: "Row has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete row.",
          variant: "destructive",
        });
      }
    }
  }, [gridData, setGridData, onDeleteRow, toast]);

  const handleCellDoubleClick = useCallback((rowIndex: number, row: any) => {
    if (inlineRowEditing && editingRow !== rowIndex) {
      handleStartEditRow(rowIndex, row);
    }
  }, [inlineRowEditing, editingRow, handleStartEditRow]);

  const handleEditingCellChange = useCallback((rowIndex: number, columnKey: string, value: any) => {
    if (editingRow === rowIndex) {
      setEditingValues(prev => ({
        ...prev,
        [columnKey]: value
      }));
      
      // Clear validation error for this field
      if (validationErrors[columnKey]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[columnKey];
          return newErrors;
        });
      }
    }
  }, [editingRow, validationErrors]);

  // renderCell function
  const renderCell = useCallback((row: any, column: GridColumnConfig, rowIndex: number, columnIndex: number) => {
    const value = row[column.key];
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;
    const isEditable = isColumnEditable(column, columnIndex);
    const isRowEditing = editingRow === rowIndex;

    if (columnIndex === 0 && (effectiveNestedRowRenderer || hasCollapsibleColumns)) {
      const isExpanded = expandedRows.has(rowIndex);
      return (
        <div className="flex items-center space-x-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(rowIndex)}
            className="h-5 w-5 p-0 hover:bg-gray-100 flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          <div className="flex-1 min-w-0 truncate">
            <CellRenderer
              value={value}
              row={row}
              column={column}
              rowIndex={rowIndex}
              columnIndex={columnIndex}
              isEditing={isEditing}
              isEditable={isEditable}
              onEdit={handleCellEdit}
              onEditStart={handleEditStart}
              onEditCancel={handleEditCancel}
              onLinkClick={onLinkClick}
              loading={loading}
            />
          </div>
        </div>
      );
    }

    // Handle SmartGridPlus specific actions column
    if (column.key === 'actions') {
      return (
        <div className="flex items-center gap-1">
          {isRowEditing ? (
            <>
              <Button
                size="sm"
                onClick={() => handleSaveEditRow(rowIndex)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEditRow}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {inlineRowEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStartEditRow(rowIndex, row)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteRowAction(rowIndex, row)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      );
    }

    // Handle inline row editing for SmartGridPlus
    if (isRowEditing && inlineRowEditing && column.key !== 'actions') {
      const editingValue = editingValues[column.key];
      return (
        <div className="space-y-1">
          <Input
            type="text"
            value={editingValue || ''}
            onChange={(e) => handleEditingCellChange(rowIndex, column.key, e.target.value)}
            className={cn(
              "h-8 text-sm",
              validationErrors[column.key] && "border-red-500"
            )}
          />
          {validationErrors[column.key] && (
            <div className="text-xs text-red-600">
              {validationErrors[column.key]}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="min-w-0 truncate">
        <CellRenderer
          value={value}
          row={row}
          column={column}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          isEditing={isEditing}
          isEditable={isEditable}
          onEdit={handleCellEdit}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onLinkClick={onLinkClick}
          loading={loading}
        />
      </div>
    );
  }, [editingCell, isColumnEditable, effectiveNestedRowRenderer, hasCollapsibleColumns, expandedRows, toggleRowExpansion, handleCellEdit, handleEditStart, handleEditCancel, onLinkClick, loading, editingRow, inlineRowEditing, handleStartEditRow, handleSaveEditRow, handleCancelEditRow, handleDeleteRowAction, editingValues, validationErrors, handleEditingCellChange]);

  // Render add row form
  const renderAddRowForm = () => {
    if (!isAddingRow) return null;

    return (
      <TableRow className="bg-blue-50 border-2 border-blue-200">
        {showCheckboxes && (
          <TableCell className="p-2">
            {/* Empty space for checkbox column */}
          </TableCell>
        )}
        {orderedColumns.map((column) => (
          <TableCell key={column.key} className="p-2">
            {column.key === 'actions' ? (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  onClick={handleSaveNewRow}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelNewRow}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <Input
                  type="text"
                  value={newRowValues[column.key] || ''}
                  onChange={(e) => setNewRowValues(prev => ({
                    ...prev,
                    [column.key]: e.target.value
                  }))}
                  className={cn(
                    "h-8 text-sm",
                    validationErrors[column.key] && "border-red-500"
                  )}
                  placeholder={column.label}
                />
                {validationErrors[column.key] && (
                  <div className="text-xs text-red-600">
                    {validationErrors[column.key]}
                  </div>
                )}
              </div>
            )}
          </TableCell>
        ))}
        {/* Plugin row actions column */}
        {plugins.some(plugin => plugin.rowActions) && (
          <TableCell className="p-2">
            {/* Empty space for plugin actions */}
          </TableCell>
        )}
      </TableRow>
    );
  };

  // Update grid data when prop data changes (only if not using lazy loading)
  useEffect(() => {
    if (!onDataFetch) {
      setGridData(data);
    }
  }, [data, onDataFetch, setGridData]);

  // Initialize columns in state when props change
  useEffect(() => {
    if (columns.length > 0) {
      setColumns(columns);
    }
  }, [columns, setColumns]);

  // Initialize plugins
  useEffect(() => {
    plugins.forEach(plugin => {
      if (plugin.init) {
        plugin.init(gridAPI);
      }
    });

    return () => {
      plugins.forEach(plugin => {
        if (plugin.destroy) {
          plugin.destroy();
        }
      });
    };
  }, [plugins, gridAPI]);

  // Error boundary component
  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => setError(null)}
          className="text-red-700 border-red-300 hover:bg-red-100"
        >
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Add Row Button */}
      {inlineRowAddition && addRowButtonPosition === "top-left" && (
        <div className="flex justify-start">
          <Button
            onClick={handleAddRowClick}
            disabled={isAddingRow}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {addRowButtonLabel}
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <GridToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        showColumnFilters={showColumnFilters}
        setShowColumnFilters={setShowColumnFilters}
        showCheckboxes={showCheckboxes}
        setShowCheckboxes={setShowCheckboxes}
        viewMode={viewMode}
        setViewMode={setViewMode}
        loading={loading}
        filters={filters}
        columns={currentColumns}
        preferences={preferences}
        onColumnVisibilityToggle={toggleColumnVisibility}
        onColumnHeaderChange={updateColumnHeader}
        onResetToDefaults={handleResetPreferences}
        onExport={handleExport}
        onSubRowToggle={handleSubRowToggleInternal}
        configurableButtons={configurableButtons}
        showDefaultConfigurableButton={showDefaultConfigurableButton}
        defaultConfigurableButtonLabel={defaultConfigurableButtonLabel}
        gridTitle={gridTitle}
        recordCount={recordCount}
        showAdvancedFilter={false}
        onToggleAdvancedFilter={() => {}}
      />

       {/* Advanced Filter System */}
      <FilterSystem
        columns={orderedColumns}
        subRowColumns={subRowColumns}
        showFilterRow={showFilterRow}
        onToggleFilterRow={() => setShowFilterRow(!showFilterRow)}
        onFiltersChange={handleFiltersChange}
        gridId="smart-grid-plus"
        userId="demo-user"
        api={mockFilterAPI}
      />
      
      {/* Table Container with horizontal scroll prevention */}
      <div className="bg-white rounded-lg border shadow-sm">
        <ScrollArea className="w-full">
          <div className="min-w-full">
            <Table className="w-full">
              <TableHeader className="sticky top-0 z-20 bg-white shadow-sm border-b-2 border-gray-100">
                <TableRow className="hover:bg-transparent">
                  {/* Checkbox header */}
                  {showCheckboxes && (
                    <TableHead className="bg-gray-50/80 backdrop-blur-sm font-semibold text-gray-900 px-3 py-3 border-r border-gray-100 w-[50px] flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        onChange={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.checked) {
                            handleSelectionChange(new Set(Array.from({ length: paginatedData.length }, (_, i) => i)));
                          } else {
                            handleSelectionChange(new Set());
                          }
                        }}
                        checked={currentSelectedRows.size === paginatedData.length && paginatedData.length > 0}
                      />
                    </TableHead>
                  )}
                  {orderedColumns.map((column, index) => {
                    const shouldHideIcons = resizeHoverColumn === column.key || resizingColumn === column.key;
                    const currentFilter = filters.find(f => f.column === column.key);
                    const widthPercentage = (column.width / orderedColumns.reduce((total, col) => total + col.width, 0)) * 100;
                    
                    return (
                      <TableHead 
                        key={column.key}
                        className={cn(
                          "relative group bg-gray-50/80 backdrop-blur-sm font-semibold text-gray-900 px-2 py-3 border-r border-gray-100 last:border-r-0",
                          draggedColumn === column.key && "opacity-50",
                          dragOverColumn === column.key && "bg-blue-100 border-blue-300",
                          resizingColumn === column.key && "bg-blue-50",
                          !resizingColumn && "cursor-move"
                        )}
                        style={{ 
                          width: `${widthPercentage}%`,
                          minWidth: `${Math.max(80, column.width * 0.8)}px`,
                          maxWidth: `${column.width * 1.5}px`
                        }}
                        draggable={!editingHeader && !resizingColumn}
                        onDragStart={(e) => handleColumnDragStart(e, column.key)}
                        onDragOver={(e) => handleColumnDragOver(e, column.key)}
                        onDragLeave={handleColumnDragLeave}
                        onDrop={(e) => handleColumnDrop(e, column.key)}
                        onDragEnd={handleColumnDragEnd}
                      >
                        <div className="flex items-center justify-between gap-1 min-w-0">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            {!shouldHideIcons && (
                              <GripVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            )}
                            {editingHeader === column.key ? (
                              <Input
                                defaultValue={column.label}
                                onBlur={(e) => handleHeaderEdit(column.key, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleHeaderEdit(column.key, e.currentTarget.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingHeader(null);
                                  }
                                }}
                                className="h-5 px-1 text-sm font-semibold bg-white border-blue-300 focus:border-blue-500 min-w-0"
                                autoFocus
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => e.stopPropagation()}
                                onDragStart={(e) => e.preventDefault()}
                              />
                            ) : (
                              <div 
                                className={cn(
                                  "flex items-center gap-1 rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors group/header flex-1 min-w-0",
                                  !resizingColumn && "cursor-pointer hover:bg-gray-100/50"
                                )}
                                onClick={(e) => {
                                  if (resizingColumn) return;
                                  e.stopPropagation();
                                  handleHeaderClick(column.key);
                                }}
                                onDragStart={(e) => e.preventDefault()}
                              >
                                <span 
                                  className="select-none text-sm font-semibold flex-1 min-w-0 truncate" 
                                  title={column.label}
                                >
                                  {column.label}
                                </span>
                                {column.editable && !shouldHideIcons && (
                                  <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover/header:opacity-100 transition-opacity flex-shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {column.sortable && !shouldHideIcons && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  if (resizingColumn) return;
                                  e.stopPropagation();
                                  handleSort(column.key);
                                }}
                                className="h-5 w-5 p-0 hover:bg-transparent transition-opacity flex-shrink-0"
                                disabled={loading || !!resizingColumn}
                                onDragStart={(e) => e.preventDefault()}
                              >
                                {sort?.column === column.key ? (
                                  sort.direction === 'asc' ? (
                                    <ArrowUp className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <ArrowDown className="h-3 w-3 text-blue-600" />
                                  )
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Resize Handle - Modified to only show on hover */}
                        <div
                          className="absolute top-0 right-0 w-2 h-full cursor-col-resize bg-transparent hover:bg-blue-300/50 transition-colors flex items-center justify-center group/resize z-30"
                          onMouseDown={(e) => handleResizeStart(e, column.key)}
                          onMouseEnter={() => setResizeHoverColumn(column.key)}
                          onMouseLeave={() => setResizeHoverColumn(null)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDragStart={(e) => e.preventDefault()}
                        >
                          <div className="w-0.5 h-4 bg-gray-300 opacity-0 group-hover/resize:opacity-100 transition-opacity" />
                        </div>
                      </TableHead>
                    );
                  })}
                  {/* Plugin row actions header */}
                  {plugins.some(plugin => plugin.rowActions) && (
                    <TableHead className="bg-gray-50/80 backdrop-blur-sm font-semibold text-gray-900 px-3 py-3 text-center w-[100px] flex-shrink-0">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
                
                {/* Column Filter Row - Legacy support, hidden when using FilterSystem */}
                {showColumnFilters && !showFilterRow && (
                  <TableRow className="hover:bg-transparent border-b border-gray-200">
                    {/* Checkbox column space */}
                    {showCheckboxes && (
                      <TableHead className="bg-gray-25 px-3 py-2 border-r border-gray-100 w-[50px]">
                        {/* Empty space for checkbox column */}
                      </TableHead>
                    )}
                    {orderedColumns.map((column) => {
                      const currentFilter = filters.find(f => f.column === column.key);
                      const widthPercentage = (column.width / orderedColumns.reduce((total, col) => total + col.width, 0)) * 100;
                      
                      return (
                        <TableHead 
                          key={`filter-${column.key}`}
                          className="bg-gray-25 px-2 py-2 border-r border-gray-100 last:border-r-0 relative"
                          style={{ 
                            width: `${widthPercentage}%`,
                            minWidth: `${Math.max(80, column.width * 0.8)}px`,
                            maxWidth: `${column.width * 1.5}px`
                          }}
                        >
                          {column.filterable && (
                            <ColumnFilter
                              column={column}
                              currentFilter={currentFilter}
                              onFilterChange={(filter) => {
                                if (filter) {
                                  setFilters(prev => [...prev.filter(f => f.column !== column.key), filter]);
                                } else {
                                  setFilters(prev => prev.filter(f => f.column !== column.key));
                                }
                              }}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                    {/* Plugin row actions column space */}
                    {plugins.some(plugin => plugin.rowActions) && (
                      <TableHead className="bg-gray-25 px-3 py-2 w-[100px]">
                        {/* Empty space for plugin actions */}
                      </TableHead>
                    )}
                  </TableRow>
                )}
              </TableHeader>
              
              <TableBody>
                {/* Add Row Form */}
                {renderAddRowForm()}
                
                {loading && !onDataFetch ? (
                  <TableRow>
                    <TableCell colSpan={orderedColumns.length + (showCheckboxes ? 1 : 0) + (plugins.some(plugin => plugin.rowActions) ? 1 : 0)} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-500">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={orderedColumns.length + (showCheckboxes ? 1 : 0) + (plugins.some(plugin => plugin.rowActions) ? 1 : 0)} className="text-center py-8 text-gray-500">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => {
                    const isExpanded = expandedRows.has(index);
                    const actualIndex = onDataFetch ? index : (currentPage - 1) * pageSize + index;
                    const isSelected = currentSelectedRows.has(index);
                    const isRowEditing = editingRow === actualIndex;
                    
                    return (
                      <React.Fragment key={row.id || actualIndex}>
                        <TableRow 
                          className={cn(
                            "hover:bg-gray-50 border-b border-gray-100 transition-colors",
                            isSelected && "bg-blue-50",
                            isRowEditing && "bg-yellow-50",
                            rowClassName?.(row, actualIndex)
                          )}
                          onDoubleClick={() => handleCellDoubleClick(actualIndex, row)}
                        >
                          {/* Checkbox column */}
                          {showCheckboxes && (
                            <TableCell className="px-3 py-2 w-[50px]">
                              <input 
                                type="checkbox" 
                                className="rounded" 
                                checked={isSelected}
                                onChange={(e) => {
                                  const newSet = new Set(currentSelectedRows);
                                  if (e.target.checked) {
                                    newSet.add(index);
                                  } else {
                                    newSet.delete(index);
                                  }
                                  handleSelectionChange(newSet);
                                }}
                              />
                            </TableCell>
                          )}
                          {orderedColumns.map((column, columnIndex) => {
                            const widthPercentage = (column.width / orderedColumns.reduce((total, col) => total + col.width, 0)) * 100;
                            
                            return (
                              <TableCell 
                                key={column.key}
                                className="px-2 py-2 border-r border-gray-100 last:border-r-0"
                                style={{ 
                                  width: `${widthPercentage}%`,
                                  minWidth: `${Math.max(80, column.width * 0.8)}px`,
                                  maxWidth: `${column.width * 1.5}px`
                                }}
                              >
                                {renderCell(row, column, actualIndex, columnIndex)}
                              </TableCell>
                            );
                          })}
                          
                          {/* Plugin row actions */}
                          {plugins.some(plugin => plugin.rowActions) && (
                            <TableCell className="px-3 py-2 text-center w-[100px]">
                              <div className="flex items-center justify-center space-x-1">
                                <PluginRowActions 
                                  plugins={plugins}
                                  row={row}
                                  rowIndex={actualIndex}
                                  gridAPI={gridAPI}
                                />
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                        
                        {/* Expanded row content */}
                        {isExpanded && effectiveNestedRowRenderer && (
                          <TableRow className="hover:bg-transparent border-b border-gray-200">
                            <TableCell 
                              colSpan={orderedColumns.length + (showCheckboxes ? 1 : 0) + (plugins.some(plugin => plugin.rowActions) ? 1 : 0)}
                              className="p-4 bg-gray-50/50"
                            >
                              {effectiveNestedRowRenderer(row, actualIndex)}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {paginationMode === 'pagination' && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {Math.min((currentPage - 1) * pageSize + 1, processedData.length)} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {/* Plugin renderers */}
      <PluginRenderer 
        plugins={plugins}
        gridAPI={gridAPI}
        type="footer"
      />
    </div>
  );
}