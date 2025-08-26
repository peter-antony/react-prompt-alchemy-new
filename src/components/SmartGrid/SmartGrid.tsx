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
} from 'lucide-react';
import { SmartGridProps, GridColumnConfig, SortConfig, FilterConfig, GridAPI } from '@/types/smartgrid';
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
import { AdvancedFilter } from './AdvancedFilter';
import { mockFilterAPI } from '@/utils/mockFilterAPI';
import { cn } from '@/lib/utils';

// Add exportFilename prop to SmartGridProps
export function SmartGrid({
  columns,
  data,
  parentPage,
  editableColumns = true,
  mandatoryColumns = [],
  onInlineEdit,
  onBulkUpdate,
  onPreferenceSave,
  onDataFetch,
  onUpdate,
  onFiltersChange,
  onLinkClick,
  onSubRowToggle,
  onServerFilter,
  paginationMode = 'pagination',
  nestedRowRenderer,
  onRowExpansionOverride,
  plugins = [],
  selectedRows,
  onSelectionChange,
  rowClassName,
  configurableButtons,
  showDefaultConfigurableButton,
  defaultConfigurableButtonLabel,
  gridTitle,
  recordCount,
  showCreateButton,
  searchPlaceholder,
  extraFilters,
  subRowFilters,
  groupByField,
  onGroupByChange,
  groupableColumns,
  showGroupingDropdown,
  clientSideSearch = false,
  showSubHeaders = true,
  showMainRowFilters = false,
  showExtraFilters = true,
  showSubRowFilters = false,
  // Server-side filter props
  showServersideFilter = false,
  onToggleServersideFilter,
  hideAdvancedFilter = false,
  exportFilename = `export-${new Date().toISOString().split('T')[0]}`
}: SmartGridProps & { exportFilename?: string }) {
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
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterSystemFilters, setFilterSystemFilters] = useState<Record<string, any>>({});
  const { toast } = useToast();

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
    'smartgrid-preferences',
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
    return processGridData(data, globalFilter, filters, sort, currentColumns, onDataFetch, clientSideSearch);
  }, [data, globalFilter, filters, sort, currentColumns, onDataFetch, clientSideSearch]);

	// Handle advanced filter search
  const handleAdvancedFilterSearch = useCallback(() => {
    // Reset to page 1 when search is performed
    setCurrentPage(1);
    
    // If we have server-side filtering, call the server
    const serverFilters = filters.filter(filter => {
      const column = currentColumns.find(col => col.key === filter.column);
      return column?.filterMode === 'server';
    });
    
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
  }, [filters, currentColumns, onServerFilter, toast, setCurrentPage]);
  // Handle filter system changes
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilterSystemFilters(newFilters);
    onFiltersChange?.(newFilters);
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
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [onFiltersChange, setFilters, currentColumns, onServerFilter, toast, setCurrentPage]);
  // Define handleExport and handleResetPreferences after processedData and orderedColumns
  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    const filename = `${exportFilename}.${format}`;
    // Build export columns: initial columns order + any extra sub-row columns
    const initialKeys = columns.map(col => col.key);
    const extraSubRowColumns = subRowColumns.filter(col => !initialKeys.includes(col.key));
    const exportColumns = [...columns, ...extraSubRowColumns];
    try {
      if (format === 'csv') {
        exportToCSV(processedData, exportColumns, filename);
        toast({
          title: "Success",
          description: "CSV file exported successfully"
        });
      } else if (format === 'xlsx') {
        exportToExcel(processedData, exportColumns, filename);
        toast({
          title: "Success",
          description: "Excel file exported successfully"
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Error",
        description: `Failed to export ${format.toUpperCase()} file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  }, [processedData, columns, subRowColumns, toast, exportFilename]);

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
      // setFilterSystemFilters({}); // Also clear filter system filters
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
    data: data,
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
  }), [data, processedData, currentSelectedRows, orderedColumns, preferences, handleExport, handleResetPreferences, handleSelectionChange]);

  // Pagination with auto-reset when current page has no data
  const paginatedData = useMemo(() => {
    if (paginationMode !== 'pagination' || onDataFetch) return processedData;
    
    const totalPages = Math.ceil(processedData.length / pageSize);
    
    // Reset to page 1 if current page is beyond available data
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return processedData.slice(0, pageSize);
    }
    
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, paginationMode, currentPage, pageSize, onDataFetch, setCurrentPage]);


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

  // Cell editing functions
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

  // renderCell function
  const renderCell = useCallback((row: any, column: GridColumnConfig, rowIndex: number, columnIndex: number) => {
    const value = row[column.key];
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;
    const isEditable = isColumnEditable(column, columnIndex);

    // Only show expand/collapse arrow if subRowColumns count > 0 and in first cell of first column
    if (columnIndex === 0 && (effectiveNestedRowRenderer || hasCollapsibleColumns) && !row.__isGroupHeader) {
      const isExpanded = expandedRows.has(rowIndex);
      return (
        <div className="flex items-center space-x-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRowExpansionOverride ? onRowExpansionOverride(rowIndex) : toggleRowExpansion(rowIndex)}
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
  }, [editingCell, isColumnEditable, effectiveNestedRowRenderer, hasCollapsibleColumns, expandedRows, onRowExpansionOverride, toggleRowExpansion, handleCellEdit, handleEditStart, handleEditCancel, onLinkClick, loading]);

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

  // Always sync columns and grid data from props if preferences change or are missing (fix for localStorage clear and hard refresh)
  useEffect(() => {
    if (columns.length > 0) {
      setColumns(columns);
      setGridData(data); // Ensure data is set after columns are initialized
    }
  }, [columns, preferences, data, setColumns, setGridData]);

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

  // Auto-initialize preferences and grid data if missing on first mount
  useEffect(() => {
    // Only run on first mount
    if (!preferences || !preferences.columnOrder || preferences.columnOrder.length === 0) {
      const defaultPreferences = {
        columnOrder: columns.map(col => col.key),
        hiddenColumns: [],
        columnWidths: {},
        columnHeaders: {},
        subRowColumns: [],
        subRowColumnOrder: [],
        filters: []
      };
      savePreferences(defaultPreferences);
      setColumns(columns);
      setGridData(data);
    }
  }, [preferences, columns, data, savePreferences, setColumns, setGridData]);

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
        clientSideSearch={clientSideSearch}
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
        showCreateButton={showCreateButton}
        searchPlaceholder={searchPlaceholder}
        showAdvancedFilter={showAdvancedFilter && !hideAdvancedFilter}
        onToggleAdvancedFilter={() => setShowAdvancedFilter(!showAdvancedFilter)}
        groupByField={groupByField}
        onGroupByChange={onGroupByChange}
        groupableColumns={groupableColumns}
        showGroupingDropdown={showGroupingDropdown}
        // Server-side filter props
        showServersideFilter={showServersideFilter}
        onToggleServersideFilter={onToggleServersideFilter}
      />

      {/* Advanced Filter System */}
      {/* <AdvancedFilter
        columns={orderedColumns}
        subRowColumns={subRowColumns}
        extraFilters={extraFilters}
        subRowFilters={subRowFilters}
        visible={showAdvancedFilter}
        onToggle={() => setShowAdvancedFilter(!showAdvancedFilter)}
        onFiltersChange={handleFiltersChange}
        onSearch={handleAdvancedFilterSearch}
        gridId="smart-grid"
        userId="demo-user"
        clientSideSearch={clientSideSearch}
        api={mockFilterAPI}
      /> */}
      {/* <AdvancedFilter
          columns={orderedColumns}
          subRowColumns={subRowColumns}
          extraFilters={extraFilters}
          subRowFilters={subRowFilters}
          visible={showAdvancedFilter}
          onToggle={() => setShowAdvancedFilter(!showAdvancedFilter)}
          onFiltersChange={handleFiltersChange}
          onSearch={handleAdvancedFilterSearch}
          gridId="smart-grid"
          userId="demo-user"
          clientSideSearch={clientSideSearch}
          api={mockFilterAPI}
          showSubHeaders={showSubHeaders}
          showMainRowFilters={showMainRowFilters}
          showExtraFilters={showExtraFilters}
          showSubRowFilters={showSubRowFilters}
        /> */}
       {/* Advanced Filter System - Only show when not using server-side filters */}
        {!hideAdvancedFilter && (
          <AdvancedFilter
            columns={orderedColumns}
            subRowColumns={subRowColumns}
            extraFilters={extraFilters}
            subRowFilters={subRowFilters}
            visible={showAdvancedFilter}
            onToggle={() => setShowAdvancedFilter(!showAdvancedFilter)}
            onFiltersChange={handleFiltersChange}
            onSearch={handleAdvancedFilterSearch}
            gridId="smart-grid"
            userId="demo-user"
            clientSideSearch={clientSideSearch}
            api={mockFilterAPI}
            showSubHeaders={showSubHeaders}
            showMainRowFilters={showMainRowFilters}
            showExtraFilters={showExtraFilters}
            showSubRowFilters={showSubRowFilters}
          />
        )}

      {/* Table Container with horizontal scroll prevention */}
      <div className="bg-white rounded shadow-sm m-0">
        <ScrollArea className="w-full">
          {/* <div className="w-9/12"> */}
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-white shadow-sm border-b-2 border-gray-100">
              <TableRow className="hover:bg-transparent">
                {/* Checkbox header */}
                {showCheckboxes && (
                  <TableHead className="bg-gray-100 backdrop-blur-sm font-semibold text-gray-900 px-3 py-3 border-r border-gray-100 w-[50px] flex-shrink-0">
                    <input
                      type="checkbox"
                      className="rounded cursor-pointer"
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
                        "relative group bg-gray-100 backdrop-blur-sm font-semibold text-gray-900 pl-1 py-0 pr-0 border-r border-gray-100 last:border-r-0",
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
                                "flex items-center gap-1 rounded px-1 py-0 -mx-1 -my-0.5 transition-colors group/header flex-1 min-w-0",
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
                          minWidth: `${Math.max(80, column.width * 0.8)}px`
                        }}
                      >
                        {column.filterable && (
                          <ColumnFilter
                            column={column}
                            currentFilter={currentFilter}
                            onFilterChange={(filter) => {
                              if (filter) {
                                handleColumnFilterChange(filter, column, onServerFilter);
                              } else {
                                handleClearColumnFilter(column.key);
                              }
                            }}
                          />
                        )}
                      </TableHead>
                    );
                  })}
                  {/* Plugin row actions column space */}
                  {plugins.some(plugin => plugin.rowActions) && (
                    <TableHead className="bg-gray-25 px-3 py-2 text-center w-[100px]">
                      {/* Empty space for actions column */}
                    </TableHead>
                  )}
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={orderedColumns.length + (showCheckboxes ? 1 : 0) + (plugins.some(plugin => plugin.rowActions) ? 1 : 0)}
                    className="text-center py-12"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={orderedColumns.length + (showCheckboxes ? 1 : 0) + (plugins.some(plugin => plugin.rowActions) ? 1 : 0)}
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="space-y-2">
                      <div className="text-lg font-medium">No data available</div>
                      <div className="text-sm">Try adjusting your search or filters</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.flatMap((row, rowIndex) => {
                  const rows = [
                    <TableRow key={rowIndex}
                      className={cn(
                        "hover:bg-gray-50/50 transition-colors duration-150 border-b border-gray-100",
                        rowClassName ? rowClassName(row, rowIndex) : ''
                      )}
                    >
                      {/* Checkbox cell */}
                      {showCheckboxes && (
                        <TableCell className="px-3 py-3 border-r border-gray-50 w-[50px]">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer"
                            checked={currentSelectedRows.has(rowIndex)}
                            onChange={() => {
                              const newSet = new Set(currentSelectedRows);
                              if (newSet.has(rowIndex)) {
                                newSet.delete(rowIndex);
                              } else {
                                newSet.add(rowIndex);
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
                            className="relative text-[13px] pl-3 py-2 border-r border-gray-50 last:border-r-0 align-middle"
                            style={{
                              width: `${widthPercentage}%`,
                              minWidth: `${Math.max(80, column.width * 0.8)}px`,
                              maxWidth: `${column.width * 1.5}px`
                            }}
                          >
                            <div className="overflow-hidden">
                              {renderCell(row, column, rowIndex, columnIndex)}
                            </div>
                          </TableCell>
                        );
                      })}
                      {/* Plugin row actions */}
                      {plugins.some(plugin => plugin.rowActions) && (
                        <TableCell className="px-3 py-3 text-center align-top w-[100px]">
                          <div className="flex items-center justify-center space-x-1">
                            <PluginRowActions
                              plugins={plugins}
                              gridAPI={gridAPI}
                              row={row}
                              rowIndex={rowIndex}
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ];

                  // Add nested row if expanded
                  if (effectiveNestedRowRenderer && expandedRows.has(rowIndex)) {
                    rows.push(
                      <TableRow key={`nested-${rowIndex}`} className="bg-gray-50/30">
                        <TableCell
                          colSpan={orderedColumns.length + (showCheckboxes ? 1 : 0) + (plugins.some(plugin => plugin.rowActions) ? 1 : 0)}
                          className="p-0 border-b border-gray-200"
                        >
                          <div className="bg-gradient-to-r from-gray-50/50 to-white border-l-4 border-blue-500">
                            <div className="">
                              {effectiveNestedRowRenderer(row, rowIndex)}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return rows;
                })
              )}
            </TableBody>
          </Table>
          {/* </div> */}
        </ScrollArea>
      </div>

      {/* Pagination */}
      {paginationMode === 'pagination' && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-2 m-0 rounded border-t shadow-sm">
          <div className="text-sm text-gray-600 order-2 sm:order-1 w-full">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} entries
          </div>

          <Pagination className="order-1 sm:order-2 justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={cn(
                    currentPage === 1 || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'
                  )}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className={cn(
                        "cursor-pointer transition-colors duration-150",
                        loading && "pointer-events-none opacity-50",
                        currentPage === pageNum && "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={cn(
                    currentPage === totalPages || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Plugin footer items */}
      {plugins.some(plugin => plugin.footer) && (
        <div className="flex items-center justify-center space-x-4 pt-4 border-t bg-white p-4 rounded-lg border shadow-sm">
          <PluginRenderer plugins={plugins} gridAPI={gridAPI} type="footer" />
        </div>
      )}
    </div>
  );
}
