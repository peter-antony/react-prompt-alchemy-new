import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Star, X, Search, Settings } from 'lucide-react';
import { ColumnFilterInput } from './ColumnFilterInput';
import { FilterSetModal } from './FilterSetModal';
import { FilterSetDropdown } from './FilterSetDropdown';
import { ServerFilterFieldModal } from './ServerFilterFieldModal';
import { GridColumnConfig, ServerFilter } from '@/types/smartgrid';
import { FilterValue, FilterSet, FilterSystemAPI } from '@/types/filterSystem';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ServersideFilterProps {
  serverFilters: ServerFilter[];
  showFilterTypeDropdown?: boolean;
  visible: boolean;
  onToggle: () => void;
  onFiltersChange: (filters: Record<string, FilterValue>) => void;
  onSearch: () => void;
  gridId: string;
  userId: string;
  api?: FilterSystemAPI;
}

export function ServersideFilter({
  serverFilters = [],
  showFilterTypeDropdown = false,
  visible,
  onToggle,
  onFiltersChange,
  onSearch,
  gridId,
  userId,
  api
}: ServersideFilterProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({});
  const [pendingFilters, setPendingFilters] = useState<Record<string, FilterValue>>({});
  const [filterSets, setFilterSets] = useState<FilterSet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState<string[]>([]);
  const [fieldOrder, setFieldOrder] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Initialize field visibility and order
  useEffect(() => {
    if (serverFilters.length > 0 && visibleFields.length === 0) {
      const allFieldKeys = serverFilters.map(f => f.key);
      setVisibleFields(allFieldKeys);
      setFieldOrder(allFieldKeys);
    }
  }, [serverFilters]);

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

  // Only notify parent of filter changes when filters are actually applied
  useEffect(() => {
    onFiltersChange(activeFilters);
  }, [activeFilters, onFiltersChange]);

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
    setPendingFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === undefined) {
        delete newFilters[columnKey];
      } else {
        newFilters[columnKey] = value;
      }
      
      return newFilters;
    });
  }, []);

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

      const newSet = await api.saveUserFilterSet(userId, name, pendingFilters, isDefault);
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
    setPendingFilters(filterSet.filters);
    setActiveFilters(filterSet.filters);
    
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
    setPendingFilters({});
    setActiveFilters({});
    onFiltersChange({});
    
    if (api) {
      api.applyGridFilters({});
    }
  };

  const activeFilterCount = Object.keys(pendingFilters).length;

  const handleFieldVisibilitySave = (newVisibleFields: string[], newFieldOrder: string[]) => {
    setVisibleFields(newVisibleFields);
    setFieldOrder(newFieldOrder);
  };

  // Helper function to render filter inputs
  const renderFilterInputs = (filters: ServerFilter[]) => {
    // Filter and order based on visibility settings
    const orderedVisibleFilters = fieldOrder
      .map(fieldKey => filters.find(f => f.key === fieldKey))
      .filter((filter): filter is ServerFilter => 
        filter !== undefined && visibleFields.includes(filter.key)
      );
    return orderedVisibleFilters.map((filter) => {
      // Convert ServerFilter to GridColumnConfig for compatibility with ColumnFilterInput
      const columnConfig: GridColumnConfig = {
        key: filter.key,
        label: filter.label,
        type: filter.type === 'numberRange' ? 'NumberRange' : 
              filter.type === 'dropdownText' ? 'DropdownText' :
              filter.type === 'dateRange' ? 'DateRange' :
              filter.type === 'select' ? 'Dropdown' :
              filter.type === 'date' ? 'Date' : 'Text',
        filterable: true,
        options: filter.options,
        multiSelect: filter.multiSelect // Pass multiSelect flag
      };

      return (
        <div key={filter.key} className="space-y-1">
          <div className="text-xs font-medium text-gray-600 truncate">
            {filter.label}
          </div>
          <div className="relative">
            <ColumnFilterInput
              column={columnConfig}
              value={pendingFilters[filter.key]}
              onChange={(value) => handleFilterChange(filter.key, value)}
              showFilterTypeDropdown={showFilterTypeDropdown}
            />
            {pendingFilters[filter.key] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange(filter.key, undefined)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      );
    });
  };

  if (!visible) return null;

  return (
    <div className="space-y-2">
      {/* Filter Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-gray-700">Search</div>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // Apply pending filters to active filters
              setActiveFilters(pendingFilters);
              
              // Update parent component with current filters first
              onFiltersChange(pendingFilters);
              
              // Apply filters and trigger search
              if (api) {
                api.applyGridFilters(pendingFilters);
              }
              
              // Small delay to ensure state is updated before search
              setTimeout(() => {
                onSearch();
              }, 0);
            }}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-4 w-4 mr-1" />
            Search
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFieldModal(true)}
            className="hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Panel - Always expanded when visible */}
      <div className="bg-white border rounded shadow-sm">
        <div className="p-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(visibleFields.length, 4)}, 1fr)` }}>
            {renderFilterInputs(serverFilters)}
          </div>
        </div>
      </div>

      {/* Save Filter Set Modal */}
      <FilterSetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFilterSet}
        activeFilters={pendingFilters}
        existingNames={filterSets.map(set => set.name)}
      />

      {/* Server Filter Field Configuration Modal */}
      <ServerFilterFieldModal
        open={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        serverFilters={serverFilters}
        visibleFields={visibleFields}
        fieldOrder={fieldOrder}
        onSave={handleFieldVisibilitySave}
      />
    </div>
  );
}