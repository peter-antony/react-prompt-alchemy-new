import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazySelectOption {
  label?: string;
  value?: string;
  id?: string;
  name?: any;
}

interface LazySelectProps {
  fetchOptions: (params: { searchTerm: string; offset: number; limit: number }) => Promise<LazySelectOption[]>;
  value?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  placeholder?: string;
  multiSelect?: boolean;
  disabled?: boolean;
  className?: string;
  hideSearch?: boolean;
  disableLazyLoading?: boolean;
  returnType?: string; // 👈 NEW PROP
}

const ITEMS_PER_PAGE = 50;

export function LazySelect({
  fetchOptions,
  value,
  onChange,
  placeholder = "Select an option...",
  multiSelect = false,
  disabled = false,
  className,
  hideSearch = false,
  disableLazyLoading = false,
  returnType = 'id', // default keeps existing behavior

}: LazySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<LazySelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(1);
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
      const currentOffset = reset ? 1 : offset;
      const newOptions = await fetchOptions({
        searchTerm: debouncedSearchTerm,
        offset: currentOffset,
        limit: ITEMS_PER_PAGE
      });
      console.log('offset: ', offset);
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
  }, [fetchOptions, debouncedSearchTerm, offset]);

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
    // if (!scrollRef.current || loading || !hasMore) return;
    if (!scrollRef.current || loading || !hasMore || disableLazyLoading) return;
    // if (!scrollRef.current || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadOptions(false);
    }
  }, [loading, hasMore, loadOptions, disableLazyLoading]);

  // const handleSelect = (selectedValue: string) => {
  //   if (multiSelect) {
  //     const currentValues = Array.isArray(value) ? value : [];
  //     const newValues = currentValues.includes(selectedValue)
  //       ? currentValues.filter(v => v !== selectedValue)
  //       : [...currentValues, selectedValue];
  //     onChange(newValues.length > 0 ? newValues : undefined);
  //   } else {
  //     onChange(selectedValue);
  //     setIsOpen(false);
  //   }
  // };

  const handleSelect = (selectedValue: string) => {
    // Find the selected option object for lookup
    const selectedOption: any = options.find((opt: any) => opt.id === selectedValue);

    // Decide what to return based on the prop
    const returnValue = returnType === 'name'
      ? selectedOption?.name || selectedValue
      : selectedOption?.id || selectedValue;

    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(returnValue)
        ? currentValues.filter(v => v !== returnValue)
        : [...currentValues, returnValue];
      onChange(newValues.length > 0 ? newValues : undefined);
    } else {
      onChange(returnValue);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;

    if (multiSelect && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option: any = options.find((opt: any) => opt.id === value[0]);
        return option ? (option.id && option.name ? `${option.id} || ${option.name}` : option.id || option.name) : value[0];
      }
      return `${value.length} items selected`;
    } else if (typeof value === 'string') {
      const option: any = options.find((opt: any) => opt.id === value);
      return option ? (option.id && option.name ? `${option.id} || ${option.name}` : option.id || option.name) : value;
    }

    return placeholder;
  };

  // const isSelected = (optionId: string) => {
  //   if (multiSelect && Array.isArray(value)) {
  //     return value.includes(optionId);
  //   }
  //   return value === optionId;
  // };

  const isSelected = (optionId: string, optionName?: string) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(returnType === 'name' ? optionName : optionId);
    }
    return value === (returnType === 'name' ? optionName : optionId);
  };

  // console.log('LazySelect options:', options);

  const hasValue = multiSelect
    ? Array.isArray(value) && value.length > 0
    : Boolean(value);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className='flex items-center gap-1 transition-all h-9'>
          <div className='flex-1'>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className={cn(
                "w-full justify-between text-left font-normal h-7 px-3 text-sm",
                !hasValue && "text-muted-foreground",
                className
              )}
              disabled={disabled}
            >
              <span className="truncate text-[13px]">{getDisplayValue()}</span>
              <div className="flex items-center gap-1">
                {/* {hasValue && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )} */}
                {!hasValue && (
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                )}
              </div>
            </Button>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        {!hideSearch && (
          <div className="p-2 border-b">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
        )}
        <div
          ref={scrollRef}
          className="max-h-60 overflow-y-auto"
          onScroll={handleScroll}
        >
          {options.length === 0 && !loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {/* {debouncedSearchTerm ? 'No results found.' : 'Start typing to search...'} */}
              {hideSearch ? 'No options available.' : (debouncedSearchTerm ? 'No results found.' : 'Start typing to search...')}
            </div>
          ) : (
            options.map((option: any, index) => {
              option.id = option.id ?? option.carrierid ?? option.wbscostcenter;
              option.name = option.name ?? option.carrierdescription ?? option.wbscostcenterdesc;

              if (!option.id) return null;

              return (
                <div
                  key={(option.id || option.name) + '-' + index}
                  className={cn(
                    "flex items-center space-x-2 px-2 py-2 hover:bg-gray-100 rounded-md hover:text-accent-foreground cursor-pointer",
                    isSelected(option?.id, option?.name) && "bg-accent"
                  )}
                  onClick={() => handleSelect(option?.id)}
                >
                  {multiSelect && (
                    <Checkbox
                      checked={isSelected(option?.id, option?.name)}
                      onChange={() => { }}
                    />
                  )}
                  <span className="flex-1 truncate text-xs">
                    {option?.id ? `${option.id} || ${option.name}` : (option.id)}
                  </span>
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