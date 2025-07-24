
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColumnFilterInput } from './ColumnFilterInput';
import { FilterSetModal } from './FilterSetModal';
import { FilterSetDropdown } from './FilterSetDropdown';
import { GridColumnConfig } from '@/types/smartgrid';
import { FilterValue, FilterSet, FilterSystemAPI } from '@/types/filterSystem';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FilterSystemProps {
  columns: GridColumnConfig[];
  subRowColumns: GridColumnConfig[];
  showFilterRow: boolean;
  onToggleFilterRow: () => void;
  onFiltersChange: (filters: Record<string, FilterValue>) => void;
  gridId: string;
  userId: string;
  api?: FilterSystemAPI;
}

export function FilterSystem({
  columns,
  subRowColumns,
  showFilterRow,
  onToggleFilterRow,
  onFiltersChange,
  gridId,
  userId,
  api
}: FilterSystemProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({});
  const [filterSets, setFilterSets] = useState<FilterSet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubRowFiltersOpen, setIsSubRowFiltersOpen] = useState(false);
  
  const { toast } = useToast();

  // Load saved filter sets on mount
  useEffect(() => {
    if (api && userId) {
      loadFilterSets();
    }
  }, [api, userId, gridId]);

  // Apply default filter set on load
  useEffect(() => {
    const defaultSet = filterSets.find(set => set.isDefault);
    if (defaultSet && Object.keys(activeFilters).length === 0) {
      applyFilterSet(defaultSet);
    }
  }, [filterSets]);

  const loadFilterSets = async () => {
    if (!api) return;
    
    try {
      setLoading(true);
      const sets = await api.getUserFilterSets(userId, gridId);
      setFilterSets(sets);
    } catch (error) {
      console.error('Failed to load filter sets:', error);
      toast({
        title: "Error",
        description: "Failed to load saved filter sets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((columnKey: string, value: FilterValue | undefined) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === undefined) {
        delete newFilters[columnKey];
      } else {
        newFilters[columnKey] = value;
      }
      
      return newFilters;
    });
  }, []);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(activeFilters);
    if (api) {
      api.applyGridFilters(activeFilters);
    }
  }, [activeFilters, onFiltersChange, api]);

  const handleSaveFilterSet = async (name: string, isDefault: boolean) => {
    if (!api) {
      toast({
        title: "Error",
        description: "Filter set API not available",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // If setting as default, remove default from other sets
      if (isDefault) {
        const promises = filterSets
          .filter(set => set.isDefault)
          .map(set => api.updateFilterSet(set.id, { isDefault: false }));
        await Promise.all(promises);
      }

      const newSet = await api.saveUserFilterSet(userId, name, activeFilters, isDefault);
      setFilterSets(prev => [...prev.map(set => ({ ...set, isDefault: false })), newSet]);
      
      toast({
        title: "Success",
        description: `Filter set "${name}" saved successfully`,
      });
    } catch (error) {
      console.error('Failed to save filter set:', error);
      toast({
        title: "Error",
        description: "Failed to save filter set",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilterSet = (filterSet: FilterSet) => {
    setActiveFilters(filterSet.filters);
    onFiltersChange(filterSet.filters);
    
    if (api) {
      api.applyGridFilters(filterSet.filters);
    }
    
    toast({
      title: "Filter Set Applied",
      description: `Applied "${filterSet.name}" with ${Object.keys(filterSet.filters).length} filters`,
    });
  };

  const handleSetDefault = async (filterSetId: string) => {
    if (!api) return;

    try {
      setLoading(true);
      
      // Remove default from all sets
      const promises = filterSets.map(set => 
        api.updateFilterSet(set.id, { isDefault: set.id === filterSetId })
      );
      await Promise.all(promises);
      
      setFilterSets(prev => prev.map(set => ({
        ...set,
        isDefault: set.id === filterSetId
      })));
      
      const filterSet = filterSets.find(set => set.id === filterSetId);
      toast({
        title: "Default Set Updated",
        description: `"${filterSet?.name}" is now the default filter set`,
      });
    } catch (error) {
      console.error('Failed to update default filter set:', error);
      toast({
        title: "Error",
        description: "Failed to update default filter set",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (filterSetId: string, newName: string) => {
    if (!api) return;

    try {
      const updatedSet = await api.updateFilterSet(filterSetId, { name: newName });
      setFilterSets(prev => prev.map(set => 
        set.id === filterSetId ? updatedSet : set
      ));
      
      toast({
        title: "Filter Set Renamed",
        description: `Filter set renamed to "${newName}"`,
      });
    } catch (error) {
      console.error('Failed to rename filter set:', error);
      toast({
        title: "Error",
        description: "Failed to rename filter set",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (filterSetId: string) => {
    if (!api) return;

    try {
      await api.deleteFilterSet(filterSetId);
      const deletedSet = filterSets.find(set => set.id === filterSetId);
      setFilterSets(prev => prev.filter(set => set.id !== filterSetId));
      
      toast({
        title: "Filter Set Deleted",
        description: `"${deletedSet?.name}" has been deleted`,
      });
    } catch (error) {
      console.error('Failed to delete filter set:', error);
      toast({
        title: "Error",
        description: "Failed to delete filter set",
        variant: "destructive"
      });
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
    
    if (api) {
      api.applyGridFilters({});
    }
  };

  const activeFilterCount = Object.keys(activeFilters).length;
  const filterableColumns = columns.filter(col => col.filterable !== false);
  const filterableSubRowColumns = subRowColumns.filter(col => col.filterable !== false);
  const subRowFilterCount = Object.keys(activeFilters).filter(key => key.startsWith('subrow-')).length;

  return (
    <div className="space-y-2">
      {/* Filter Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
        <div className="flex items-center space-x-2">
          <Button
            variant={showFilterRow ? "default" : "outline"}
            size="sm"
            onClick={onToggleFilterRow}
            className={cn(
              "transition-all",
              showFilterRow && "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 text-xs bg-white text-blue-600 rounded-full px-1.5 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveModal(true)}
              disabled={loading}
              className="transition-all hover:bg-yellow-50 hover:border-yellow-300"
            >
              <Star className="h-4 w-4 mr-1" />
              Save Set
            </Button>
          )}

          <FilterSetDropdown
            filterSets={filterSets}
            onApply={applyFilterSet}
            onSetDefault={handleSetDefault}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Filter Panel - Only show when showFilterRow is true */}
      {showFilterRow && (
        <div className="bg-white border rounded shadow-sm">
          <div className="grid gap-2 p-3" style={{ gridTemplateColumns: `repeat(${filterableColumns.length}, 1fr)` }}>
            {filterableColumns.map((column) => (
              <div key={column.key} className="space-y-1">
                <div className="text-xs font-medium text-gray-600 truncate">
                  {column.label}
                </div>
                <ColumnFilterInput
                  column={column}
                  value={activeFilters[column.key]}
                  onChange={(value) => handleFilterChange(column.key, value)}
                  onApply={handleApplyFilters}
                />
              </div>
            ))}
          </div>

          {/* Collapsible Sub-Row Filters */}
          {filterableSubRowColumns.length > 0 && (
            <div className="border-t">
              <Collapsible open={isSubRowFiltersOpen} onOpenChange={setIsSubRowFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <div className="bg-blue-50/50 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs font-medium text-blue-700">
                          Sub-row Filters
                        </div>
                        {subRowFilterCount > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5">
                            {subRowFilterCount}
                          </span>
                        )}
                      </div>
                      {isSubRowFiltersOpen ? (
                        <ChevronUp className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="bg-blue-50/30 p-3">
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${filterableSubRowColumns.length}, 1fr)` }}>
                      {filterableSubRowColumns.map((column) => (
                        <div key={`subrow-${column.key}`} className="space-y-1">
                          <div className="text-xs font-medium text-blue-600 truncate">
                            {column.label}
                          </div>
                          <ColumnFilterInput
                            column={column}
                            value={activeFilters[`subrow-${column.key}`]}
                            onChange={(value) => handleFilterChange(`subrow-${column.key}`, value)}
                            onApply={handleApplyFilters}
                            isSubRow={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      )}

      {/* Save Filter Set Modal */}
      <FilterSetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFilterSet}
        activeFilters={activeFilters}
        existingNames={filterSets.map(set => set.name)}
      />
    </div>
  );
}
