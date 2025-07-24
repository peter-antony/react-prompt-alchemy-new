
import { useState, useCallback, useEffect } from 'react';
import { Column, SortConfig, FilterConfig, GridPreferences } from '@/types/smartgrid';

export function useSmartGridData<T>(
  initialData: T[],
  columns: Column<T>[],
  onDataFetch?: (params: any) => Promise<{ data: T[]; total?: number }>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialData.length);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async (params: {
    page?: number;
    limit?: number;
    sort?: SortConfig;
    filters?: FilterConfig[];
  }) => {
    if (!onDataFetch) return;
    
    setLoading(true);
    try {
      const result = await onDataFetch(params);
      setData(result.data);
      if (result.total !== undefined) {
        setTotalCount(result.total);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [onDataFetch]);

  const sortData = useCallback((data: T[], sort?: SortConfig) => {
    if (!sort) return data;
    
    const column = columns.find(col => col.id === sort.column);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let aVal, bVal;
      
      if (typeof column.accessor === 'function') {
        aVal = column.accessor(a);
        bVal = column.accessor(b);
      } else {
        aVal = a[column.accessor];
        bVal = b[column.accessor];
      }

      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [columns]);

  const filterData = useCallback((data: T[], filters: FilterConfig[]) => {
    if (!filters.length) return data;

    return data.filter(row => {
      return filters.every(filter => {
        const column = columns.find(col => col.id === filter.column);
        if (!column) return true;

        let value;
        if (typeof column.accessor === 'function') {
          value = column.accessor(row);
        } else {
          value = row[column.accessor];
        }

        const filterValue = filter.value;
        const operator = filter.operator || 'contains';

        if (value == null) return false;

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
  }, [columns]);

  return {
    data,
    setData,
    loading,
    totalCount,
    currentPage,
    setCurrentPage,
    fetchData,
    sortData,
    filterData
  };
}
