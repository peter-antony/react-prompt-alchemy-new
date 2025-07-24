import { useState, useCallback, useRef } from 'react';
import { SortConfig, FilterConfig, GridColumnConfig } from '@/types/smartgrid';

export function useSmartGridState() {
  const [gridData, setGridData] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColumnConfig[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [sort, setSort] = useState<SortConfig | undefined>();
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [internalSelectedRows, setInternalSelectedRows] = useState<Set<number>>(new Set());
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeHoverColumn, setResizeHoverColumn] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [forceUpdate, setForceUpdate] = useState(0);
  const [subRowColumnOrder, setSubRowColumnOrder] = useState<string[]>([]);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  const handleColumnFilterChange = useCallback((filter: FilterConfig | null, column?: any, onServerFilter?: (filters: FilterConfig[]) => Promise<void>) => {
    if (!filter) {
      return;
    }

    // Check if this column requires server-side filtering
    if (column?.filterMode === 'server' && onServerFilter) {
      // For server-side filtering, call the API
      const updatedFilters = [...filters];
      const existingIndex = updatedFilters.findIndex(f => f.column === filter.column);
      
      if (filter.value === '' || filter.value == null) {
        if (existingIndex >= 0) {
          updatedFilters.splice(existingIndex, 1);
        }
      } else if (existingIndex >= 0) {
        updatedFilters[existingIndex] = filter;
      } else {
        updatedFilters.push(filter);
      }
      
      // Call server-side filter API
      onServerFilter(updatedFilters).then(() => {
        setFilters(updatedFilters);
      }).catch(error => {
        console.error('Server-side filtering failed:', error);
      });
    } else {
      // Local filtering (existing behavior)
      setFilters(prev => {
        const existing = prev.find(f => f.column === filter.column);
        if (filter.value === '' || filter.value == null) {
          return prev.filter(f => f.column !== filter.column);
        } else if (existing) {
          return prev.map(f => f.column === filter.column ? filter : f);
        } else {
          return [...prev, filter];
        }
      });
    }
  }, [filters]);

  const handleClearColumnFilter = useCallback((columnKey: string) => {
    setFilters(prev => prev.filter(f => f.column !== columnKey));
  }, []);

  const handleSort = useCallback((columnKey: string) => {
    setSort(prev => {
      if (prev?.column === columnKey) {
        return prev.direction === 'asc' 
          ? { column: columnKey, direction: 'desc' }
          : undefined;
      }
      return { column: columnKey, direction: 'asc' };
    });
  }, []);

  const toggleRowExpansion = useCallback((rowIndex: number) => {
    console.log('Toggling row expansion for row:', rowIndex);
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
        console.log('Row collapsed:', rowIndex);
      } else {
        newSet.add(rowIndex);
        console.log('Row expanded:', rowIndex);
      }
      console.log('Updated expanded rows:', Array.from(newSet));
      return newSet;
    });
  }, []);

  const handleSubRowToggle = useCallback((columnKey: string) => {
    console.log('Handling sub-row toggle for column:', columnKey);
    setColumns(prev => {
      const updatedColumns = prev.map(col => 
        col.key === columnKey 
          ? { ...col, subRow: !col.subRow }
          : col
      );
      console.log('Updated columns with sub-row changes:', updatedColumns);
      console.log('Sub-row columns now:', updatedColumns.filter(col => col.subRow).map(col => col.key));
      return updatedColumns;
    });
    
    // Force a re-render to ensure the grid reflects the column changes
    setForceUpdate(prev => prev + 1);
    console.log('Forcing grid update due to sub-row toggle');
  }, []);

  const handleSubRowEdit = useCallback((rowIndex: number, columnKey: string, value: any) => {
    console.log('Handling sub-row edit:', { rowIndex, columnKey, value });
    setGridData(prev => {
      const updatedData = [...prev];
      if (updatedData[rowIndex]) {
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [columnKey]: value
        };
        console.log('Updated row data:', updatedData[rowIndex]);
      }
      return updatedData;
    });
    
    // Clear editing state
    setEditingCell(null);
    setForceUpdate(prev => prev + 1);
  }, []);

  const handleSubRowEditStart = useCallback((rowIndex: number, columnKey: string) => {
    console.log('Starting sub-row edit:', { rowIndex, columnKey });
    setEditingCell({ rowIndex, columnKey });
  }, []);

  const handleSubRowEditCancel = useCallback(() => {
    console.log('Cancelling sub-row edit');
    setEditingCell(null);
  }, []);

  const handleReorderSubRowColumns = useCallback((newOrder: string[]) => {
    console.log('Reordering sub-row columns:', newOrder);
    setSubRowColumnOrder(newOrder);
    setForceUpdate(prev => prev + 1);
  }, []);

  return {
    // State
    gridData,
    setGridData,
    columns,
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
    forceUpdate,
    subRowColumnOrder,
    
    // Actions
    handleColumnFilterChange,
    handleClearColumnFilter,
    handleSort,
    toggleRowExpansion,
    handleSubRowToggle,
    handleSubRowEdit,
    handleSubRowEditStart,
    handleSubRowEditCancel,
    handleReorderSubRowColumns
  };
}
