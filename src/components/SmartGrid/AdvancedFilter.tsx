import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Star, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColumnFilterInput } from './ColumnFilterInput';
import { FilterSetModal } from './FilterSetModal';
import { FilterSetDropdown } from './FilterSetDropdown';
import { FilterFieldSettings } from './FilterFieldSettings';
import { GridColumnConfig } from '@/types/smartgrid';
import { FilterValue, FilterSet, FilterSystemAPI } from '@/types/filterSystem';
import { useToast } from '@/hooks/use-toast';
import { useFilterFieldVisibility } from '@/hooks/useFilterFieldVisibility';
import { cn } from '@/lib/utils';

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

interface AdvancedFilterProps {
  columns: GridColumnConfig[];
  subRowColumns: GridColumnConfig[];
  extraFilters?: ExtraFilter[];
  subRowFilters?: SubRowFilter[];
  visible: boolean;
  onToggle: () => void;
  onFiltersChange: (filters: Record<string, FilterValue>) => void;
  onSearch: () => void;
  gridId: string;
  userId: string;
  api?: FilterSystemAPI;
  clientSideSearch?: boolean;
  showSubHeaders?: boolean;
  showMainRowFilters?: boolean;
  showExtraFilters?: boolean;
  showSubRowFilters?: boolean;
}

export function AdvancedFilter({
  columns,
  subRowColumns,
  extraFilters = [],
  subRowFilters = [],
  visible,
  onToggle,
  onFiltersChange,
  onSearch,
  gridId,
  userId,
  api,
  clientSideSearch = false,
  showSubHeaders = true,
  showMainRowFilters = true,
  showExtraFilters = true,
  showSubRowFilters = true
}: AdvancedFilterProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({});
  const [pendingFilters, setPendingFilters] = useState<Record<string, FilterValue>>({});
  const [filterSets, setFilterSets] = useState<FilterSet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMainFiltersOpen, setIsMainFiltersOpen] = useState(true);
  const [isExtraFiltersOpen, setIsExtraFiltersOpen] = useState(true);
  const [isSubRowFiltersOpen, setIsSubRowFiltersOpen] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const { toast } = useToast();
  
  // Use the new hook for field visibility management
  const { visibleFields, updateFieldVisibility, resetToDefaults } = useFilterFieldVisibility(
    gridId,
    columns,
    subRowColumns,
    extraFilters,
    subRowFilters
  );

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
  const filterableColumns = columns.filter(col => col.filterable !== false);
  const filterableSubRowColumns = subRowColumns.filter(col => col.filterable !== false);

  // Helper function to render filter inputs
  const renderFilterInputs = (filterColumns: GridColumnConfig[] | ExtraFilter[] | SubRowFilter[], keyPrefix = '') => {
    return filterColumns
      .filter((column) => {
        const columnKey = keyPrefix ? `${keyPrefix}${column.key}` : column.key;
        return visibleFields[columnKey];
      })
      .map((column) => {
        const columnKey = keyPrefix ? `${keyPrefix}${column.key}` : column.key;
        return (
          <div key={columnKey} className="space-y-1">
            <div className="text-xs font-medium text-gray-600 truncate">
              {column.label}
            </div>
            <div className="relative">
              <ColumnFilterInput
                column={column as GridColumnConfig}
                value={pendingFilters[columnKey]}
                onChange={(value) => handleFilterChange(columnKey, value)}
              />
              {pendingFilters[columnKey] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange(columnKey, undefined)}
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
          <div className="text-sm font-medium text-gray-700">Advanced Filters</div>
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
              
              // Apply filters and trigger search for both client-side and server-side
              if (api) {
                api.applyGridFilters(pendingFilters);
              }
              onSearch();
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

          <FilterFieldSettings
            open={showSettingsModal}
            onOpenChange={setShowSettingsModal}
            columns={columns}
            subRowColumns={subRowColumns}
            extraFilters={extraFilters}
            subRowFilters={subRowFilters}
            visibleFields={visibleFields}
            onFieldVisibilityChange={updateFieldVisibility}
            onResetToDefaults={resetToDefaults}
          />
        </div>
      </div>

      {/* Filter Panel - Always expanded when visible */}
      <div className="bg-white border rounded shadow-sm">
        {/* Main Column Filters */}
        {showMainRowFilters && filterableColumns.length > 0 && (
          <Collapsible open={isMainFiltersOpen} onOpenChange={setIsMainFiltersOpen}>
            {showSubHeaders && (
              <CollapsibleTrigger asChild>
                <div className="bg-gray-50/50 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors border-b">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      Main-row filters
                    </div>
                    {isMainFiltersOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <div className={cn("p-3", !showSubHeaders && "border-b")}>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(filterableColumns.length, 4)}, 1fr)` }}>
                  {renderFilterInputs(filterableColumns)}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Extra Filters */}
        {showExtraFilters && extraFilters.length > 0 && (
          <Collapsible open={isExtraFiltersOpen} onOpenChange={setIsExtraFiltersOpen}>
            {showSubHeaders && (
              <CollapsibleTrigger asChild>
                <div className="bg-green-50/50 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors border-b">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-green-700">
                      Extra Filters
                    </div>
                    {isExtraFiltersOpen ? (
                      <ChevronUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <div className={cn("bg-green-50/30 p-3", !showSubHeaders && "border-b")}>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(extraFilters.length, 4)}, 1fr)` }}>
                  {renderFilterInputs(extraFilters, '')}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Sub-row Filters */}
        {showSubRowFilters && (filterableSubRowColumns.length > 0 || subRowFilters.length > 0) && (
          <Collapsible open={isSubRowFiltersOpen} onOpenChange={setIsSubRowFiltersOpen}>
            {showSubHeaders && (
              <CollapsibleTrigger asChild>
                <div className="bg-blue-50/50 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-700">
                      Sub-row Filters
                    </div>
                    {isSubRowFiltersOpen ? (
                      <ChevronUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <div className="bg-blue-50/30 p-3">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(filterableSubRowColumns.length + subRowFilters.length, 4)}, 1fr)` }}>
                  {renderFilterInputs(filterableSubRowColumns, 'subrow-')}
                  {renderFilterInputs(subRowFilters, 'subrowfilter-')}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Save Filter Set Modal */}
      <FilterSetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFilterSet}
        activeFilters={pendingFilters}
        existingNames={filterSets.map(set => set.name)}
      />
    </div>
  );
}