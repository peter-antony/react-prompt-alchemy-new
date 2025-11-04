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

interface LazySelectWithNewEntryProps {
    fetchOptions: (params: { searchTerm: string; offset: number; limit: number }) => Promise<LazySelectOption[]>;
    value?: string | string[];
    onChange: (value: string | string[] | undefined, isNewEntry?: boolean) => void;
    placeholder?: string;
    multiSelect?: boolean;
    disabled?: boolean;
    className?: string;
    hideSearch?: boolean;
    disableLazyLoading?: boolean;
    returnType?: string;
    allowNewEntry?: boolean;
    onNewEntry?: (value: string) => void;
    rowIndex?: number;
    validateNewEntry?: (value: string) => boolean; // Custom validation function
    existenceCheckMode?: 'strict' | 'partial' | 'fuzzy'; // How strict the existence check should be
    minSearchLength?: number; // Minimum characters required for new entry creation
}

const ITEMS_PER_PAGE = 50;

export function LazySelectWithNewEntry({
    fetchOptions,
    value,
    onChange,
    placeholder = "Select an option...",
    multiSelect = false,
    disabled = false,
    className,
    hideSearch = false,
    disableLazyLoading = false,
    returnType = 'id',
    allowNewEntry = false,
    onNewEntry,
    rowIndex,
    validateNewEntry: customValidateNewEntry,
    existenceCheckMode = 'strict',
    minSearchLength = 1
}: LazySelectWithNewEntryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<LazySelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [pendingNewEntry, setPendingNewEntry] = useState<string>('');

    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const scrollRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search term - but don't automatically trigger search until 3 characters
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

    const loadOptions = useCallback(async (reset = true) => {
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
            setPendingNewEntry('');
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
        const selectedOption: any = options.find((opt: any) => opt.id === selectedValue);
        const returnValue = returnType === 'name'
            ? selectedOption?.name || selectedValue
            : selectedOption?.id || selectedValue;

        if (multiSelect) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(returnValue)
                ? currentValues.filter(v => v !== returnValue)
                : [...currentValues, returnValue];
            onChange(newValues.length > 0 ? newValues : undefined, false);
        } else {
            onChange(returnValue, false);
            setIsOpen(false);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined, false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();

            // If there are options available, select the first one
            if (options.length > 0) {
                const firstOption = options[0];
                handleSelect(firstOption.id || firstOption.value || '');
                return;
            }

            // If no options but allowNewEntry is enabled
            if (allowNewEntry && searchTerm.trim().length >= minSearchLength) {
                // Enhanced existence check with multiple criteria
                const trimmedSearchTerm = searchTerm.trim();
                const exactMatch = options.find(option => {
                    const optionId = option.id?.toLowerCase();
                    const optionName = option.name?.toLowerCase();
                    const optionLabel = option.label?.toLowerCase();
                    const optionValue = option.value?.toLowerCase();
                    const searchLower = trimmedSearchTerm.toLowerCase();

                    return optionId === searchLower ||
                        optionName === searchLower ||
                        optionLabel === searchLower ||
                        optionValue === searchLower ||
                        // Also check for partial matches that might indicate the same wagon
                        (optionId && optionId.includes(searchLower)) ||
                        (optionName && optionName.includes(searchLower));
                });

                if (exactMatch) {
                    // Use existing option instead of creating new one
                    console.log('Found existing option:', exactMatch);
                    handleSelect(exactMatch.id || exactMatch.value || '');
                } else {
                    // Check if we should allow new entry based on additional validation
                    const isValidNewEntry = validateNewEntry(trimmedSearchTerm);

                    if (isValidNewEntry) {
                        // It's a valid new entry
                        const newEntryValue = trimmedSearchTerm;
                        setPendingNewEntry(newEntryValue);
                        onChange(newEntryValue, true);
                        onNewEntry?.(newEntryValue);
                        setIsOpen(false);
                        setSearchTerm('');
                        console.log('Created new entry:', newEntryValue);
                    } else {
                        console.log('New entry validation failed for:', trimmedSearchTerm);
                    }
                }
            }
        }
    };

    // Validation function for new entries
    const validateNewEntry = (entryValue: string): boolean => {
        // Use custom validation if provided
        if (customValidateNewEntry) {
            return customValidateNewEntry(entryValue);
        }

        // Default validation rules for new entries
        if (!entryValue || entryValue.length < 1) return false;

        // Basic rules for wagon IDs and similar identifiers:
        // - At least minSearchLength characters
        // - Contains alphanumeric characters
        // - Not just spaces or special characters
        const trimmed = entryValue.trim();
        if (trimmed.length < minSearchLength) return false;

        // Allow alphanumeric characters, hyphens, underscores
        const validPattern = /^[A-Za-z0-9\-_]+$/;
        if (!validPattern.test(trimmed)) return false;

        return true;
    };

    // Enhanced existence checking function with different modes
    const checkIfValueExists = (searchValue: string): LazySelectOption | null => {
        if (!searchValue) return null;

        const searchLower = searchValue.toLowerCase().trim();

        return options.find(option => {
            const optionId = option.id?.toLowerCase();
            const optionName = option.name?.toLowerCase();
            const optionLabel = option.label?.toLowerCase();
            const optionValue = option.value?.toLowerCase();

            switch (existenceCheckMode) {
                case 'strict':
                    // Exact match only
                    return optionId === searchLower ||
                        optionName === searchLower ||
                        optionLabel === searchLower ||
                        optionValue === searchLower;

                case 'partial':
                    // Allow partial matches
                    return (optionId && optionId.includes(searchLower)) ||
                        (optionName && optionName.includes(searchLower)) ||
                        (optionLabel && optionLabel.includes(searchLower)) ||
                        (optionValue && optionValue.includes(searchLower));

                case 'fuzzy':
                    // More relaxed matching (removes special characters, etc.)
                    const cleanSearch = searchLower.replace(/[^a-z0-9]/g, '');
                    return (optionId && optionId.replace(/[^a-z0-9]/g, '').includes(cleanSearch)) ||
                        (optionName && optionName.replace(/[^a-z0-9]/g, '').includes(cleanSearch)) ||
                        (optionLabel && optionLabel.replace(/[^a-z0-9]/g, '').includes(cleanSearch)) ||
                        (optionValue && optionValue.replace(/[^a-z0-9]/g, '').includes(cleanSearch));

                default:
                    return optionId === searchLower ||
                        optionName === searchLower ||
                        optionLabel === searchLower ||
                        optionValue === searchLower;
            }
        }) || null;
    };

    const addNewEntry = () => {
        if (searchTerm.trim().length >= 3 && allowNewEntry) {
            const trimmedSearchTerm = searchTerm.trim();

            // Check if entry already exists before adding
            const existingOption = checkIfValueExists(trimmedSearchTerm);

            if (existingOption) {
                // Use existing option instead
                console.log('Found existing option, using instead of creating new:', existingOption);
                handleSelect(existingOption.id || existingOption.value || '');
            } else {
                // Validate and create new entry
                const isValidNewEntry = validateNewEntry(trimmedSearchTerm);

                if (isValidNewEntry) {
                    const newEntryValue = trimmedSearchTerm;
                    setPendingNewEntry(newEntryValue);
                    onChange(newEntryValue, true);
                    onNewEntry?.(newEntryValue);
                    setIsOpen(false);
                    setSearchTerm('');
                    console.log('Created new entry via button:', newEntryValue);
                } else {
                    console.log('New entry validation failed via button for:', trimmedSearchTerm);
                }
            }
        }
    };

    useEffect(() => {
        // Initial load when dropdown opens (with empty search term)
        if (isOpen && !hideSearch && !disableLazyLoading && searchTerm === '') {
            loadOptions(true);
        }
        // Search-based load only after user types 3+ characters
        else if (isOpen && !hideSearch && !disableLazyLoading && debouncedSearchTerm.length >= 3) {
            setOffset(1);
            setOptions([]);
            setHasMore(true);
            loadOptions(true);
        }
    }, [isOpen, hideSearch, disableLazyLoading, debouncedSearchTerm, loadOptions]);

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

    const isSelected = (optionId: string, optionName?: string) => {
        if (multiSelect && Array.isArray(value)) {
            return value.includes(returnType === 'name' ? optionName : optionId);
        }
        return value === (returnType === 'name' ? optionName : optionId);
    };

    const hasValue = multiSelect
        ? Array.isArray(value) && value.length > 0
        : Boolean(value);

    // Enhanced logic for showing add option with existence check and 3-character minimum
    const shouldShowAddOption = allowNewEntry && searchTerm.trim().length >= 3 && !loading;
    const existingOptionForSearch = searchTerm.trim().length >= 3 ? checkIfValueExists(searchTerm.trim()) : null;
    const showNewEntryOption = shouldShowAddOption && !existingOptionForSearch && options.length === 0;
    const showExistingMatch = shouldShowAddOption && existingOptionForSearch;

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
                            ref={inputRef}
                            placeholder={allowNewEntry ? "Search or type new entry..." : "Search..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-8"
                            autoFocus
                        />
                        {allowNewEntry && searchTerm.trim() && (
                            <div className="mt-2 text-xs">
                                {existingOptionForSearch ? (
                                    <div className="text-blue-600">
                                        Found existing: "{existingOptionForSearch.id || existingOptionForSearch.name}" - Press Enter to select
                                    </div>
                                ) : searchTerm.length >= 3 ? (
                                    <div className="text-green-600">
                                        Press Enter to add "{searchTerm}" as new entry
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        Type at least 3 characters to search or add new entry
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div
                    ref={scrollRef}
                    className="max-h-60 overflow-y-auto"
                    onScroll={handleScroll}
                >
                    {showExistingMatch && (
                        <div
                            className="flex items-center space-x-2 px-2 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer border-b bg-blue-50"
                            onClick={() => handleSelect(existingOptionForSearch.id || existingOptionForSearch.value || '')}
                        >
                            <span className="h-4 w-4 text-blue-600">✓</span>
                            <span className="flex-1 truncate text-xs text-blue-700">
                                Existing: {existingOptionForSearch.id || existingOptionForSearch.name}
                            </span>
                        </div>
                    )}

                    {showNewEntryOption && (
                        <div
                            className="flex items-center space-x-2 px-2 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b"
                            onClick={addNewEntry}
                        >
                            <Plus className="h-4 w-4 text-green-600" />
                            <span className="flex-1 truncate text-xs text-green-600">
                                Add "{searchTerm}" as new entry
                            </span>
                        </div>
                    )}

                    {options.length === 0 && !loading && !showNewEntryOption && !showExistingMatch ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {hideSearch ? 'No options available.' :
                                searchTerm.length > 0 && searchTerm.length < 3 ? 'Type at least 3 characters to search...' :
                                    debouncedSearchTerm ? 'No results found.' : 'Start typing to search...'
                            }
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