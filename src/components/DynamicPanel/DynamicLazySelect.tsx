import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazySelectOption {
  label: string;
  value: string;
}

interface DynamicLazySelectProps {
  fetchOptions: (params: { searchTerm: string; offset: number; limit: number }) => Promise<LazySelectOption[]>;
  value?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  placeholder?: string;
  multiSelect?: boolean;
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent, value: any) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
}

const ITEMS_PER_PAGE = 50;

export function DynamicLazySelect({
  fetchOptions,
  value,
  onChange,
  placeholder = "Select an option...",
  multiSelect = false,
  disabled = false,
  className,
  tabIndex,
  onClick,
  onFocus,
  onBlur
}: DynamicLazySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<LazySelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

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

  const loadOptions = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      const currentOffset = reset ? 0 : offset;
      const newOptions = await fetchOptions({
        searchTerm: debouncedSearchTerm,
        offset: currentOffset,
        limit: ITEMS_PER_PAGE
      });

      if (reset) {
        setOptions(newOptions);
        setOffset(ITEMS_PER_PAGE);
      } else {
        setOptions(prev => [...prev, ...newOptions]);
        setOffset(prev => prev + ITEMS_PER_PAGE);
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
  }, [fetchOptions, debouncedSearchTerm, offset]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setOffset(0);
      setOptions([]);
      setHasMore(true);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadOptions(false);
    }
  }, [loading, hasMore, loadOptions]);

  const handleSelect = (selectedValue: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues.length > 0 ? newValues : undefined);
    } else {
      onChange(selectedValue);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent onClick handlers
    e.stopPropagation();
    // Only call onClick if the component is already open (user is interacting with selection)
    if (isOpen && onClick) {
      onClick(e, value);
    }
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    if (multiSelect && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || value[0];
      }
      return `${value.length} items selected`;
    } else if (typeof value === 'string') {
      const option = options.find(opt => opt.value === value);
      return option?.label || value;
    }
    
    return placeholder;
  };

  const isSelected = (optionValue: string) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const hasValue = multiSelect 
    ? Array.isArray(value) && value.length > 0
    : Boolean(value);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={isOpen}
          className={cn(
            "w-full justify-between text-left font-normal",
            !hasValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          tabIndex={tabIndex}
          onClick={handleButtonClick}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <span className="truncate">{getDisplayValue()}</span>
          <div className="flex items-center gap-1">
            {hasValue && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <div
          ref={scrollRef}
          className="max-h-60 overflow-y-auto"
          onScroll={handleScroll}
        >
          {options.length === 0 && !loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {debouncedSearchTerm ? 'No results found.' : 'Start typing to search...'}
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-2 px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  isSelected(option.value) && "bg-accent"
                )}
                onClick={() => handleSelect(option.value)}
              >
                {multiSelect && (
                  <Checkbox
                    checked={isSelected(option.value)}
                    onChange={() => {}}
                  />
                )}
                <span className="flex-1 truncate">{option.label}</span>
              </div>
            ))
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