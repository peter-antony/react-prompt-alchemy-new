
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, FilterPreset, FilterPresetInput } from '../types';

let lastAppliedFilters: Record<string, any> | null = null;

export const filterService = {

  getUserFilterSets: async (userId: string, gridId: string): Promise<FilterPreset[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FILTERS.LIST(userId, gridId));
      return response.data.data;
    } catch (error) {
      console.warn('Failed to fetch filter sets, using localStorage fallback:', error);
      return getLocalFilterSets(userId, gridId);
    }
  },

  // Save new filter preset
  saveUserFilterSet: async (userId: string, name: string, filters: Record<string, any>, isDefault: boolean = false): Promise<FilterPreset> => {
    const data: FilterPresetInput = {
      name,
      gridId: 'default', // This should be passed as parameter in real implementation
      filters,
      isDefault,
    };
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.FILTERS.SAVE(userId), data);
      return response.data.data;
    } catch (error) {
      console.warn('Failed to save filter set to server, using localStorage fallback:', error);
      return saveLocalFilterSet(userId, name, filters, isDefault);
    }
  },

  // Update filter preset
  updateFilterSet: async (filterId: string, updates: Partial<FilterPresetInput>): Promise<FilterPreset> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.FILTERS.UPDATE(filterId), updates);
      return response.data.data;
    } catch (error) {
      console.warn('Failed to update filter set on server, using localStorage fallback:', error);
      return updateLocalFilterSet(filterId, updates);
    }
  },

  // Delete filter preset
  deleteFilterSet: async (filterId: string): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.FILTERS.DELETE(filterId));
    } catch (error) {
      console.warn('Failed to delete filter set from server, using localStorage fallback:', error);
      deleteLocalFilterSet(filterId);
    }
  },

  // Apply filters to grid (this would be handled by the grid's data fetching)
  applyGridFilters: async (filters: Record<string, any>): Promise<void> => {
    // This is typically handled by the grid component's query parameters
    lastAppliedFilters = filters;
    console.log('Applying filters:', filters);
  },

  // Get the last applied filters
  applyGridFiltersSet: () => {
    if (!lastAppliedFilters) {
      console.warn("⚠️ No filters applied yet!");
      return null;
    }
    // return a fresh copy (avoid mutation outside)
    return lastAppliedFilters;
  },

};

// LocalStorage fallback functions
function getLocalFilterSets(userId: string, gridId: string): FilterPreset[] {
  const key = `filterSets_${userId}_${gridId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalFilterSet(userId: string, name: string, filters: Record<string, any>, isDefault: boolean): FilterPreset {
  const gridId = 'default';
  const key = `filterSets_${userId}_${gridId}`;
  const existing = getLocalFilterSets(userId, gridId);
  
  const newFilterSet: FilterPreset = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    userId,
    gridId,
    filters,
    isDefault,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // If this is default, remove default from others
  if (isDefault) {
    existing.forEach(fs => fs.isDefault = false);
  }
  
  existing.push(newFilterSet);
  localStorage.setItem(key, JSON.stringify(existing));
  return newFilterSet;
}

function updateLocalFilterSet(filterId: string, updates: Partial<FilterPresetInput>): FilterPreset {
  const allKeys = Object.keys(localStorage).filter(key => key.startsWith('filterSets_'));
  
  for (const key of allKeys) {
    const filterSets: FilterPreset[] = JSON.parse(localStorage.getItem(key) || '[]');
    const index = filterSets.findIndex(fs => fs.id === filterId);
    
    if (index !== -1) {
      const updated = {
        ...filterSets[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // If this is being set as default, remove default from others
      if (updates.isDefault) {
        filterSets.forEach(fs => fs.isDefault = false);
      }
      
      filterSets[index] = updated;
      localStorage.setItem(key, JSON.stringify(filterSets));
      return updated;
    }
  }
  
  throw new Error('Filter set not found');
}

function deleteLocalFilterSet(filterId: string): void {
  const allKeys = Object.keys(localStorage).filter(key => key.startsWith('filterSets_'));
  
  for (const key of allKeys) {
    const filterSets: FilterPreset[] = JSON.parse(localStorage.getItem(key) || '[]');
    const index = filterSets.findIndex(fs => fs.id === filterId);
    
    if (index !== -1) {
      filterSets.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(filterSets));
      return;
    }
  }
}