import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Loader2, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazySelectOption {
  label?: string;
  value?: string;
  id?: string;
  name?: any;
}

interface MultiselectLazySelectProps {
  fetchOptions: (params: { searchTerm: string; offset: number; limit: number; rowData?: any }) => Promise<LazySelectOption[]>;
  value?: string[];
  onChange: (value: string[] | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent, value: any) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  hideSearch?: boolean;
  disableLazyLoading?: boolean;
  rowData?: any;
  allowAddNew?: boolean;
  onAddNew?: (value: string) => Promise<void> | void;
  maxVisibleChips?: number;
  hasError?: boolean;
}

const ITEMS_PER_PAGE = 50;

export function MultiselectLazySelect({
  fetchOptions,
  value = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
  tabIndex,
  onClick,
  onFocus,
  onBlur,
  hideSearch = false,
  disableLazyLoading = false,
  rowData,
  allowAddNew = false,
  onAddNew,
  maxVisibleChips = 2,
  hasError = false
}: MultiselectLazySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<LazySelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [optionsCache, setOptionsCache] = useState<Record<string, string>>({});
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const selectedValues: string[] = Array.isArray(value) ? value : [];

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Load options when search term changes
  useEffect(() => {
    if (isOpen) {
      loadOptions(true);
    }
  }, [debouncedSearchTerm, isOpen]);

  // Fetch labels for selected values
  // useEffect(() => {
  //   const fetchLabels = async () => {
  //     const missingValues = selectedValues.filter(v => !optionsCache[v]);
  //     if (missingValues.length > 0) {
  //       try {
  //         const results = await fetchOptions({ searchTerm: '', offset: 0, limit: 100, rowData });
  //         const newCache: Record<string, string> = { ...optionsCache };
  //         results.forEach(opt => {
  //           const val = opt.value || opt.id || '';
  //           const label = opt.label || opt.name || val;
  //           newCache[val] = label;
  //         });
  //         setOptionsCache(newCache);
  //       } catch (error) {
  //         console.error('Failed to fetch labels:', error);
  //       }
  //     }
  //   };
  //   if (selectedValues.length > 0) {
  //     fetchLabels();
  //   }
  // }, [selectedValues.join(',')]);

  const loadOptions = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      const currentOffset = reset ? 1 : offset;
      const newOptions = await fetchOptions({
        searchTerm: debouncedSearchTerm,
        offset: currentOffset,
        limit: ITEMS_PER_PAGE,
        rowData
      });

      // Update cache with new options
      const newCache: Record<string, string> = { ...optionsCache };
      newOptions.forEach(opt => {
        const val = opt.value || opt.id || '';
        const label = opt.label || opt.name || val;
        newCache[val] = label;
      });
      setOptionsCache(newCache);

      if (reset) {
        setOptions(newOptions);
        setOffset(2);
      } else {
        setOptions(prev => [...prev, ...newOptions]);
        setOffset(prev => prev + 1);
      }

      setHasMore(newOptions.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load options:', error);
      if (reset) {
        setOptions([]);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchOptions, debouncedSearchTerm, offset, rowData, optionsCache]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setOffset(1);
      setOptions([]);
      setHasMore(true);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || !hasMore || disableLazyLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadOptions(false);
    }
  }, [loading, hasMore, loadOptions, disableLazyLoading]);

  const handleSelect = (selectedValue: string) => {
    const newValues = selectedValues.includes(selectedValue)
      ? selectedValues.filter(v => v !== selectedValue)
      : [...selectedValues, selectedValue];
    onChange(newValues.length > 0 ? newValues : undefined);
  };

  const handleRemoveChip = (e: React.MouseEvent, valueToRemove: string) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    onChange(newValues.length > 0 ? newValues : undefined);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange([]);
    setSearchTerm('');
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen && onClick) {
      onClick(e, value);
    }
  };

  const handleAddNew = async () => {
    if (!searchTerm.trim() || !onAddNew || isAddingNew) return;
    
    setIsAddingNew(true);
    try {
      await onAddNew(searchTerm.trim());
      // After adding, select the new value
      const newValues = [...selectedValues, searchTerm.trim()];
      onChange(newValues);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to add new item:', error);
    } finally {
      setIsAddingNew(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allowAddNew && searchTerm.trim() && canAddNew) {
      e.preventDefault();
      handleAddNew();
    }
  };

  const isSelected = (optionValue: string) => {
    return selectedValues.includes(optionValue);
  };

  // Check if search term matches any existing option
  const searchTermMatchesOption = options.some(opt => {
    const optionLabel = (opt.label || opt.name || opt.value || opt.id || '').toLowerCase();
    return optionLabel === searchTerm.trim().toLowerCase();
  });

  // Show add new option only when: allowAddNew is true, search term exists, no exact match found, and not loading
  const canAddNew = allowAddNew && searchTerm.trim() && !searchTermMatchesOption && !loading;

  const visibleChips = selectedValues.slice(0, maxVisibleChips);
  const hiddenCount = selectedValues.length - maxVisibleChips;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={isOpen}
          className={cn(
            "w-full justify-between text-left font-normal h-auto min-h-8 py-1 px-2 group",
            !selectedValues.length && "text-muted-foreground",
            hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            className
          )}
          disabled={disabled}
          tabIndex={tabIndex}
          onClick={handleButtonClick}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
            {selectedValues.length === 0 ? (
              <span className="text-xs text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {visibleChips.map((val, index: any) => (
                  <span
                    key={val + '-' + index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md max-w-[120px]"
                  >
                    <span className="truncate">{optionsCache[val] || val}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveChip(e, val)}
                      className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-md">
                    +{hiddenCount}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-50 hover:!opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-background" align="start">
        {!hideSearch && (
          <div className="p-2 border-b">
            <Input
              placeholder={allowAddNew ? "Search or add new..." : "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="h-8"
            />
          </div>
        )}
        <div
          ref={scrollRef}
          className="max-h-60 overflow-y-auto"
          onScroll={handleScroll}
        >
          {/* Add New Option */}
          {canAddNew && (
            <div
              className="flex items-center space-x-2 px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b text-primary"
              onClick={handleAddNew}
            >
              {isAddingNew ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="flex-1 truncate">
                {isAddingNew ? 'Adding...' : `Add "${searchTerm.trim()}"`}
              </span>
            </div>
          )}
          
          {options.length === 0 && !loading && !canAddNew ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {hideSearch ? 'No options available.' : (debouncedSearchTerm ? 'No results found.' : 'Start typing to search...')}
            </div>
          ) : (
            options.map((option, index) => {
              const optionValue = option.value || option.id || '';
              const optionLabel = option.label || option.name || optionValue;
              
              return (
                <div
                  key={optionValue + '- ' + index}
                  className={cn(
                    "flex items-center space-x-2 px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    isSelected(optionValue) && "bg-accent"
                  )}
                  onClick={() => handleSelect(optionValue)}
                >
                  <Checkbox
                    checked={isSelected(optionValue)}
                    onChange={() => {}}
                  />
                  <span className="flex-1 truncate">{optionLabel}</span>
                </div>
              );
            })
          )}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}