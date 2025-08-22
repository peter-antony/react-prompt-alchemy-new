import { useState, useEffect, useCallback, useRef } from 'react';
import { GridColumnConfig } from '@/types/smartgrid';

interface ExtraFilter {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'time' | 'number' | 'boolean';
  options?: string[];
}

interface SubRowFilter {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'time' | 'number' | 'boolean';
  options?: string[];
}

interface FilterFieldVisibilitySettings {
  [key: string]: boolean;
}

export function useFilterFieldVisibility(
  gridId: string,
  columns: GridColumnConfig[],
  subRowColumns: GridColumnConfig[],
  extraFilters: ExtraFilter[],
  subRowFilters: SubRowFilter[]
) {
  const [visibleFields, setVisibleFields] = useState<FilterFieldVisibilitySettings>({});
  const isInitialized = useRef(false);
  
  const storageKey = `filter-field-visibility-${gridId}`;

  // Initialize and load from localStorage only once per gridId
  useEffect(() => {
    if (!isInitialized.current) {
      const initializeFields = () => {
        const filterableColumns = columns.filter(col => col.filterable !== false);
        const filterableSubRowColumns = subRowColumns.filter(col => col.filterable !== false);
        
        // Create default visibility settings
        const defaultFields: FilterFieldVisibilitySettings = {};
        
        // Main columns
        filterableColumns.forEach(col => {
          defaultFields[col.key] = true;
        });
        
        // Extra filters
        extraFilters.forEach(filter => {
          defaultFields[`${filter.key}`] = true;
        });
        
        // Sub-row columns
        filterableSubRowColumns.forEach(col => {
          defaultFields[`subrow-${col.key}`] = true;
        });
        
        // Sub-row filters
        subRowFilters.forEach(filter => {
          defaultFields[`subrowfilter-${filter.key}`] = true;
        });

        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem(storageKey);
        let mergedSettings = defaultFields;
        
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            // Merge with defaults to handle new fields
            mergedSettings = { ...defaultFields, ...parsed };
          } catch (error) {
            console.warn('Failed to parse saved filter field visibility settings:', error);
          }
        }
        
        setVisibleFields(mergedSettings);
        isInitialized.current = true;
      };

      initializeFields();
    }
  }, [gridId, storageKey, columns, subRowColumns, extraFilters, subRowFilters]);

  // Reset initialization flag when gridId changes
  useEffect(() => {
    isInitialized.current = false;
  }, [gridId]);

  // Update fields when columns change but preserve existing settings
  useEffect(() => {
    if (Object.keys(visibleFields).length > 0) {
      const filterableColumns = columns.filter(col => col.filterable !== false);
      const filterableSubRowColumns = subRowColumns.filter(col => col.filterable !== false);
      
      const newFields: FilterFieldVisibilitySettings = { ...visibleFields };
      let hasNewFields = false;
      
      // Add any new main columns
      filterableColumns.forEach(col => {
        if (!(col.key in newFields)) {
          newFields[col.key] = true;
          hasNewFields = true;
        }
      });
      
      // Add any new extra filters
      extraFilters.forEach(filter => {
        const key = `${filter.key}`;
        if (!(key in newFields)) {
          newFields[key] = true;
          hasNewFields = true;
        }
      });
      
      // Add any new sub-row columns
      filterableSubRowColumns.forEach(col => {
        const key = `subrow-${col.key}`;
        if (!(key in newFields)) {
          newFields[key] = true;
          hasNewFields = true;
        }
      });
      
      // Add any new sub-row filters
      subRowFilters.forEach(filter => {
        const key = `subrowfilter-${filter.key}`;
        if (!(key in newFields)) {
          newFields[key] = true;
          hasNewFields = true;
        }
      });
      
      // Only update if we found new fields
      if (hasNewFields) {
        setVisibleFields(newFields);
      }
    }
  }, [columns, subRowColumns, extraFilters, subRowFilters]); // Removed visibleFields to prevent loops

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (Object.keys(visibleFields).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(visibleFields));
    }
  }, [visibleFields, storageKey]);

  const updateFieldVisibility = useCallback((fieldKey: string, visible: boolean) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldKey]: visible
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    const filterableColumns = columns.filter(col => col.filterable !== false);
    const filterableSubRowColumns = subRowColumns.filter(col => col.filterable !== false);
    
    const defaultFields: FilterFieldVisibilitySettings = {};
    
    filterableColumns.forEach(col => {
      defaultFields[col.key] = true;
    });
    
    extraFilters.forEach(filter => {
      defaultFields[`${filter.key}`] = true;
    });
    
    filterableSubRowColumns.forEach(col => {
      defaultFields[`subrow-${col.key}`] = true;
    });
    
    subRowFilters.forEach(filter => {
      defaultFields[`subrowfilter-${filter.key}`] = true;
    });
    
    setVisibleFields(defaultFields);
  }, [columns, subRowColumns, extraFilters, subRowFilters]);

  return {
    visibleFields,
    updateFieldVisibility,
    resetToDefaults
  };
}