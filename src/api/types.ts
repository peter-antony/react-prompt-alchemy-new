
// Common API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: string;
}

// Trip types
export interface Trip {
  id: string;
  status: string;
  tripBillingStatus: string;
  // status: 'draft' | 'pending' | 'approved' | 'rejected';
  plannedStartEndDateTime: string;
  actualStartEndDateTime: string;
  departurePoint: any;
  arrivalPoint: any;
  customer: any;
  draftBill: any;
}

export interface TripCreateInput {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  cost: number;
  currency: string;
}

export interface TripUpdateInput extends Partial<TripCreateInput> {
  status?: Trip['status'];
}

// Invoice types
export interface Invoice {
  id: string;
  tripId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Filter types
export interface FilterPreset {
  id: string;
  name: string;
  userId: string;
  gridId: string;
  filters: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterPresetInput {
  name: string;
  gridId: string;
  filters: Record<string, any>;
  isDefault?: boolean;
}

// Grid preferences
export interface GridPreferences {
  columnOrder: string[];
  columnWidths: Record<string, number>;
  hiddenColumns: string[];
  pageSize: number;
  defaultSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}
