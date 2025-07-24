
import { useState, useCallback, useEffect } from 'react';
import { GridPreferences, Column } from '@/types/smartgrid';

export function useGridPreferences<T>(
  columns: Column<T>[],
  persistPreferences?: boolean,
  preferencesKey?: string,
  onPreferenceSave?: (preferences: GridPreferences) => Promise<void>,
  onPreferenceLoad?: () => Promise<GridPreferences | null>
) {
  const defaultPreferences: GridPreferences = {
    columnOrder: columns.map(col => col.id),
    hiddenColumns: [],
    columnWidths: {},
    columnHeaders: {},
    subRowColumns: [], // Initialize empty sub-row columns array
    subRowColumnOrder: [], // Initialize empty sub-row column order array
    filters: []
  };

  const [preferences, setPreferences] = useState<GridPreferences>(defaultPreferences);

  const savePreferences = useCallback(async (newPreferences: GridPreferences) => {
    setPreferences(newPreferences);
    
    if (onPreferenceSave) {
      try {
        await onPreferenceSave(newPreferences);
      } catch (error) {
        console.error('Failed to save preferences via callback:', error);
      }
    } else if (persistPreferences && preferencesKey) {
      try {
        localStorage.setItem(preferencesKey, JSON.stringify(newPreferences));
      } catch (error) {
        console.error('Failed to save preferences to localStorage:', error);
      }
    }
  }, [onPreferenceSave, persistPreferences, preferencesKey]);

  const loadPreferences = useCallback(async () => {
    try {
      let loadedPreferences: GridPreferences | null = null;

      if (onPreferenceLoad) {
        loadedPreferences = await onPreferenceLoad();
      } else if (persistPreferences && preferencesKey) {
        const stored = localStorage.getItem(preferencesKey);
        if (stored) {
          loadedPreferences = JSON.parse(stored);
        }
      }

      if (loadedPreferences) {
        // Merge with defaults to handle new columns and properties
        const mergedPreferences: GridPreferences = {
          ...defaultPreferences,
          ...loadedPreferences,
          columnOrder: [
            ...loadedPreferences.columnOrder.filter(id => columns.some(col => col.id === id)),
            ...columns.filter(col => !loadedPreferences.columnOrder.includes(col.id)).map(col => col.id)
          ],
          subRowColumns: loadedPreferences.subRowColumns || [], // Ensure subRowColumns is initialized
          subRowColumnOrder: loadedPreferences.subRowColumnOrder || [] // Ensure subRowColumnOrder is initialized
        };
        setPreferences(mergedPreferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setPreferences(defaultPreferences);
    }
  }, [onPreferenceLoad, persistPreferences, preferencesKey, columns, defaultPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updateColumnOrder = useCallback((newOrder: string[]) => {
    const newPreferences = { ...preferences, columnOrder: newOrder };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column?.mandatory) return; // Can't hide mandatory columns

    const hiddenColumns = preferences.hiddenColumns.includes(columnId)
      ? preferences.hiddenColumns.filter(id => id !== columnId)
      : [...preferences.hiddenColumns, columnId];
    
    const newPreferences = { ...preferences, hiddenColumns };
    savePreferences(newPreferences);
  }, [preferences, savePreferences, columns]);

  const updateColumnWidth = useCallback((columnId: string, width: number) => {
    const newPreferences = {
      ...preferences,
      columnWidths: { ...preferences.columnWidths, [columnId]: width }
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const updateColumnHeader = useCallback((columnId: string, header: string) => {
    const newPreferences = {
      ...preferences,
      columnHeaders: { ...preferences.columnHeaders, [columnId]: header }
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const toggleSubRow = useCallback((columnId: string) => {
    const subRowColumns = preferences.subRowColumns.includes(columnId)
      ? preferences.subRowColumns.filter(id => id !== columnId)
      : [...preferences.subRowColumns, columnId];
    
    const newPreferences = { ...preferences, subRowColumns };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const updateSubRowColumnOrder = useCallback((newOrder: string[]) => {
    const newPreferences = { ...preferences, subRowColumnOrder: newOrder };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  return {
    preferences,
    updateColumnOrder,
    toggleColumnVisibility,
    updateColumnWidth,
    updateColumnHeader,
    toggleSubRow, // Function for toggling sub-row at column level
    updateSubRowColumnOrder, // New function for updating sub-row column order
    savePreferences
  };
}
