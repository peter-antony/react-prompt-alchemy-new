
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterValue } from '@/types/filterSystem';

interface FilterState {
  // Active filters per grid
  activeFilters: Record<string, Record<string, FilterValue>>;
  
  // Saved filter presets per user and grid
  savedPresets: Record<string, any[]>; // userId-gridId as key
  
  // Actions
  setFilter: (gridId: string, columnKey: string, filter: FilterValue | undefined) => void;
  clearFilter: (gridId: string, columnKey: string) => void;
  clearAllFilters: (gridId: string) => void;
  setActiveFilters: (gridId: string, filters: Record<string, FilterValue>) => void;
  setSavedPresets: (userGridKey: string, presets: any[]) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      activeFilters: {},
      savedPresets: {},

      setFilter: (gridId, columnKey, filter) =>
        set((state) => {
          const gridFilters = { ...state.activeFilters[gridId] };
          
          if (filter === undefined) {
            delete gridFilters[columnKey];
          } else {
            gridFilters[columnKey] = filter;
          }
          
          return {
            activeFilters: {
              ...state.activeFilters,
              [gridId]: gridFilters,
            },
          };
        }),

      clearFilter: (gridId, columnKey) =>
        set((state) => {
          const gridFilters = { ...state.activeFilters[gridId] };
          delete gridFilters[columnKey];
          
          return {
            activeFilters: {
              ...state.activeFilters,
              [gridId]: gridFilters,
            },
          };
        }),

      clearAllFilters: (gridId) =>
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [gridId]: {},
          },
        })),

      setActiveFilters: (gridId, filters) =>
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [gridId]: filters,
          },
        })),

      setSavedPresets: (userGridKey, presets) =>
        set((state) => ({
          savedPresets: {
            ...state.savedPresets,
            [userGridKey]: presets,
          },
        })),
    }),
    {
      name: 'filter-preferences',
      partialize: (state) => ({
        activeFilters: state.activeFilters,
        savedPresets: state.savedPresets,
      }),
    }
  )
);
