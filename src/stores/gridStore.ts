
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GridState {
  // Column visibility per grid
  columnVisibility: Record<string, Record<string, boolean>>;
  
  // Column widths per grid
  columnWidths: Record<string, Record<string, number>>;
  
  // Column order per grid
  columnOrder: Record<string, string[]>;
  
  // Page sizes per grid
  pageSizes: Record<string, number>;
  
  // Sort configuration per grid
  sortConfig: Record<string, { column: string; direction: 'asc' | 'desc' }>;
  
  // Actions
  setColumnVisibility: (gridId: string, columnId: string, visible: boolean) => void;
  setColumnWidth: (gridId: string, columnId: string, width: number) => void;
  setColumnOrder: (gridId: string, order: string[]) => void;
  setPageSize: (gridId: string, size: number) => void;
  setSortConfig: (gridId: string, column: string, direction: 'asc' | 'desc') => void;
  resetGridConfig: (gridId: string) => void;
}

export const useGridStore = create<GridState>()(
  persist(
    (set) => ({
      columnVisibility: {},
      columnWidths: {},
      columnOrder: {},
      pageSizes: {},
      sortConfig: {},

      setColumnVisibility: (gridId, columnId, visible) =>
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [gridId]: {
              ...state.columnVisibility[gridId],
              [columnId]: visible,
            },
          },
        })),

      setColumnWidth: (gridId, columnId, width) =>
        set((state) => ({
          columnWidths: {
            ...state.columnWidths,
            [gridId]: {
              ...state.columnWidths[gridId],
              [columnId]: width,
            },
          },
        })),

      setColumnOrder: (gridId, order) =>
        set((state) => ({
          columnOrder: {
            ...state.columnOrder,
            [gridId]: order,
          },
        })),

      setPageSize: (gridId, size) =>
        set((state) => ({
          pageSizes: {
            ...state.pageSizes,
            [gridId]: size,
          },
        })),

      setSortConfig: (gridId, column, direction) =>
        set((state) => ({
          sortConfig: {
            ...state.sortConfig,
            [gridId]: { column, direction },
          },
        })),

      resetGridConfig: (gridId) =>
        set((state) => ({
          columnVisibility: { ...state.columnVisibility, [gridId]: {} },
          columnWidths: { ...state.columnWidths, [gridId]: {} },
          columnOrder: { ...state.columnOrder, [gridId]: [] },
          pageSizes: { ...state.pageSizes, [gridId]: 25 },
          sortConfig: { ...state.sortConfig, [gridId]: undefined },
        })),
    }),
    {
      name: 'grid-preferences',
      partialize: (state) => ({
        columnVisibility: state.columnVisibility,
        columnWidths: state.columnWidths,
        columnOrder: state.columnOrder,
        pageSizes: state.pageSizes,
        sortConfig: state.sortConfig,
      }),
    }
  )
);
