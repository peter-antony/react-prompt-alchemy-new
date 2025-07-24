
import { FilterSet, FilterValue, FilterSystemAPI } from '@/types/filterSystem';

// Mock storage for filter sets (in a real app, this would be a database)
let mockFilterSets: FilterSet[] = [];
let nextId = 1;

export const mockFilterAPI: FilterSystemAPI = {
  async getUserFilterSets(userId: string, gridId?: string): Promise<FilterSet[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockFilterSets.filter(set => 
      set.userId === userId && (!gridId || set.gridId === gridId)
    );
  },

  async saveUserFilterSet(
    userId: string, 
    name: string, 
    filters: Record<string, FilterValue>, 
    isDefault: boolean = false,
    gridId?: string
  ): Promise<FilterSet> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newFilterSet: FilterSet = {
      id: `filter-set-${nextId++}`,
      name,
      filters,
      userId,
      gridId,
      isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockFilterSets.push(newFilterSet);
    return newFilterSet;
  },

  async updateFilterSet(filterSetId: string, updates: Partial<FilterSet>): Promise<FilterSet> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockFilterSets.findIndex(set => set.id === filterSetId);
    if (index === -1) {
      throw new Error('Filter set not found');
    }
    
    mockFilterSets[index] = {
      ...mockFilterSets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockFilterSets[index];
  },

  async deleteFilterSet(filterSetId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockFilterSets.findIndex(set => set.id === filterSetId);
    if (index === -1) {
      throw new Error('Filter set not found');
    }
    
    mockFilterSets.splice(index, 1);
  },

  async applyGridFilters(filters: Record<string, FilterValue>): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, this would trigger data refetch with new filters
    console.log('Applying grid filters:', filters);
  }
};
