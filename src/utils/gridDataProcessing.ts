import { GridColumnConfig, SortConfig, FilterConfig } from '@/types/smartgrid';
import { dateFormatter, dateTimeFormatter } from '@/utils/formatter';

export function processGridData(
  gridData: any[],
  globalFilter: string,
  filters: FilterConfig[],
  sort: SortConfig | undefined,
  columns: GridColumnConfig[],
  onDataFetch?: any,
  clientSideSearch: boolean = true
) {
  if (onDataFetch) {
    // For lazy loading, return data as-is (sorting/filtering handled server-side)
    return gridData;
  }

  let result = [...gridData];

  // Apply global filter only if clientSideSearch is enabled
  if (globalFilter && clientSideSearch) {
    result = result.filter(row =>
      columns.some(col => {
        let value = row[col.key];
        
        // Handle status fields that are objects with value property
        if (value && typeof value === 'object' && 'value' in value) {
          value = value.value;
        }

        // Handle Date and DateTime columns for grid search
        if (value) {
          try {
            if (col.type === 'Date') {
              // console.log('Date column:', col.key, value);
              value = dateFormatter(value);
            } else if (col.type === 'DateTimeRange') {
              // console.log('DateTimeRange column:', col.key, value);
              value = dateTimeFormatter(value);
              // console.log('Formatted DateTimeRange:', value);
            }
          } catch (e) {
            // console.warn('Grid search date formatting error:', col.key, value, e);
            // value remains as is
          }
        }

        // Handle arrays (for CustomerCountBadge, WorkOrderBadge, etc.)
        if (Array.isArray(value)) {
          return value.some(item => {
            if (typeof item === 'object' && item !== null) {
              // Search in all properties of the object
              return Object.values(item).some(prop => 
                String(prop || '').toLowerCase().includes(globalFilter.toLowerCase())
              );
            }
            return String(item || '').toLowerCase().includes(globalFilter.toLowerCase());
          });
        }
        
        // Handle objects (search in all properties)
        if (value && typeof value === 'object' && value !== null) {
          return Object.values(value).some(prop => 
            String(prop || '').toLowerCase().includes(globalFilter.toLowerCase())
          );
        }
        
        return String(value || '').toLowerCase().includes(globalFilter.toLowerCase());
      })
    );
  }

  // Apply column filters (only local filters - server filters are handled separately)
  if (filters.length > 0) {
    result = result.filter(row => {
      return filters.every(filter => {
        // Only process filters that are for local filtering
        const column = columns.find(col => col.key === filter.column);
        if (column?.filterMode === 'server') {
          return true; // Skip server-side filters in local processing
        }
        
        // Handle sub-row filters (prefixed with 'subrow-')
        const isSubRowFilter = filter.column.startsWith('subrow-');
        const actualColumnKey = isSubRowFilter ? filter.column.replace('subrow-', '') : filter.column;
        
        let value = row[actualColumnKey];
        
        // Handle status fields that are objects with value property
        if (value && typeof value === 'object' && 'value' in value) {
          value = value.value;
        }
        
        const filterValue = filter.value;
        const operator = filter.operator || 'contains';

        if (value == null) return false;

        // Handle arrays (for CustomerCountBadge, WorkOrderBadge, etc.)
        if (Array.isArray(value)) {
          return value.some(item => {
            if (typeof item === 'object' && item !== null) {
              // Search in all properties of the object
              return Object.values(item).some(prop => {
                const stringValue = String(prop || '').toLowerCase();
                const stringFilter = String(filterValue).toLowerCase();
                
                switch (operator) {
                  case 'equals':
                    return stringValue === stringFilter;
                  case 'contains':
                    return stringValue.includes(stringFilter);
                  case 'startsWith':
                    return stringValue.startsWith(stringFilter);
                  case 'endsWith':
                    return stringValue.endsWith(stringFilter);
                  default:
                    return true;
                }
              });
            }
            const stringValue = String(item || '').toLowerCase();
            const stringFilter = String(filterValue).toLowerCase();
            return stringValue.includes(stringFilter);
          });
        }

        const stringValue = String(value).toLowerCase();
        const stringFilter = String(filterValue).toLowerCase();

        switch (operator) {
          case 'equals':
            return stringValue === stringFilter;
          case 'contains':
            return stringValue.includes(stringFilter);
          case 'startsWith':
            return stringValue.startsWith(stringFilter);
          case 'endsWith':
            return stringValue.endsWith(stringFilter);
          case 'gt':
            return Number(value) > Number(filterValue);
          case 'lt':
            return Number(value) < Number(filterValue);
          case 'gte':
            return Number(value) >= Number(filterValue);
          case 'lte':
            return Number(value) <= Number(filterValue);
          default:
            return true;
        }
      });
    });
  }

  // Apply sorting
  if (sort) {
    result.sort((a, b) => {
      let aValue = a[sort.column];
      let bValue = b[sort.column];
      
      // Handle status fields that are objects with value property
      if (aValue && typeof aValue === 'object' && 'value' in aValue) {
        aValue = aValue.value;
      }
      if (bValue && typeof bValue === 'object' && 'value' in bValue) {
        bValue = bValue.value;
      }
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  return result;
}
