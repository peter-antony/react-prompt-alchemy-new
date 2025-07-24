
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, FilterPreset, FilterPresetInput } from '../types';

export const filterService = {
  // Get user's filter presets for a specific grid
  getUserFilterSets: async (userId: string, gridId: string): Promise<FilterPreset[]> => {
    const response = await apiClient.get(API_ENDPOINTS.FILTERS.LIST(userId, gridId));
    return response.data.data;
  },

  // Save new filter preset
  saveUserFilterSet: async (userId: string, name: string, filters: Record<string, any>, isDefault: boolean = false): Promise<FilterPreset> => {
    const data: FilterPresetInput = {
      name,
      gridId: 'default', // This should be passed as parameter in real implementation
      filters,
      isDefault,
    };
    const response = await apiClient.post(API_ENDPOINTS.FILTERS.SAVE(userId), data);
    return response.data.data;
  },

  // Update filter preset
  updateFilterSet: async (filterId: string, updates: Partial<FilterPresetInput>): Promise<FilterPreset> => {
    const response = await apiClient.put(API_ENDPOINTS.FILTERS.UPDATE(filterId), updates);
    return response.data.data;
  },

  // Delete filter preset
  deleteFilterSet: async (filterId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.FILTERS.DELETE(filterId));
  },

  // Apply filters to grid (this would be handled by the grid's data fetching)
  applyGridFilters: async (filters: Record<string, any>): Promise<void> => {
    // This is typically handled by the grid component's query parameters
    console.log('Applying filters:', filters);
  },
};
