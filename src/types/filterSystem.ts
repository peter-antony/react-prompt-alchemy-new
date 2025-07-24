
export interface FilterValue {
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in';
  type?: 'text' | 'select' | 'date' | 'dateRange' | 'time' | 'number' | 'boolean';
}

export interface FilterSet {
  id: string;
  name: string;
  userId: string;
  gridId?: string;
  filters: Record<string, FilterValue>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterSystemState {
  activeFilters: Record<string, FilterValue>;
  filterSets: FilterSet[];
  showFilterRow: boolean;
  showSubRowFilters: boolean;
}

export interface FilterSystemAPI {
  saveUserFilterSet: (userId: string, name: string, filters: Record<string, FilterValue>, isDefault?: boolean, gridId?: string) => Promise<FilterSet>;
  getUserFilterSets: (userId: string, gridId?: string) => Promise<FilterSet[]>;
  deleteFilterSet: (filterSetId: string) => Promise<void>;
  updateFilterSet: (filterSetId: string, updates: Partial<FilterSet>) => Promise<FilterSet>;
  applyGridFilters: (filters: Record<string, FilterValue>) => Promise<void>;
}
