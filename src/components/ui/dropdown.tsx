

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Checkbox } from '@/components/ui/checkbox';

import { ChevronDown, Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';



export interface DropDownOption {

    label: string;

    value: string;

    value1?: string;

    value2?: string;

    value3?: string;

    [key: string]: any;

}



export interface DropDownProps {

    // Core functionality

    id?: string;

    options?: DropDownOption[];

    fetchOptions?: (params: { searchTerm: string; offset: number; limit: number }) => Promise<DropDownOption[]>;

    value?: string | string[];

    onChange: (value: string | string[] | undefined) => void;



    // Appearance

    placeholder?: string;

    className?: string;

    disabled?: boolean;

    size?: 'small' | 'medium' | 'large';

    caption?: string;

    hideCaption?: boolean;



    // Behavior

    multiSelect?: boolean;

    searchable?: boolean;

    lazy?: boolean;

    disableLazyLoading?: boolean;



    // Events

    tabIndex?: number;

    onClick?: (e: React.MouseEvent, value: any) => void;

    onFocus?: (e: React.FocusEvent) => void;

    onBlur?: (e: React.FocusEvent) => void;



    // Additional props

    tooltip?: string;

    loading?: boolean;

}



const ITEMS_PER_PAGE = 50;



export function DropDown({

    id,

    options = [],

    fetchOptions,

    value,

    onChange,

    placeholder = "Select an option...",

    multiSelect = false,

    searchable = true,

    lazy = false,

    disabled = false,

    className,

    size = 'medium',

    caption,

    hideCaption = false,

    tabIndex,

    onClick,

    onFocus,

    onBlur,

    disableLazyLoading = false,

    tooltip,

    loading: externalLoading = false,

}: DropDownProps) {

    const [isOpen, setIsOpen] = useState(false);

    const [internalOptions, setInternalOptions] = useState<DropDownOption[]>(options);

    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const [hasMore, setHasMore] = useState(true);

    const [offset, setOffset] = useState(1);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');



    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    const scrollRef = useRef<HTMLDivElement>(null);

    const loadingRef = useRef(false);



    // Size classes and styles based on size prop

    const getSizeClass = () => {

        switch (size) {

            case 'small':

                return 'text-sm'; // h-7 = 28px (smaller than 32px)

            case 'large':

                return 'text-lg'; // h-10 = 40px (larger than 32px)

            case 'medium':

            default:

                return 'text-base'; // h-8 = 32px

        }

    };



    const getSizeStyles = () => {

        switch (size) {

            case 'small':

                return {

                    height: '1.75rem', // 28px

                    captionFontSize: '0.6875rem', // 11px

                    valueFontSize: '0.75rem' // 12px

                };

            case 'large':

                return {

                    height: '2.5rem', // 40px

                    captionFontSize: '0.8125rem', // 13px

                    valueFontSize: '0.875rem' // 14px

                };

            case 'medium':

            default:

                return {

                    height: '2rem', // 32px

                    captionFontSize: '0.75rem', // 12px

                    valueFontSize: '0.8125rem' // 13px

                };

        }

    };



    const sizeClass = getSizeClass();

    const sizeStyles = getSizeStyles();



    // Update internal options when props change

    useEffect(() => {

        if (!lazy) {

            setInternalOptions(options);

        }

    }, [options, lazy]);



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



    // Load options when search term changes (for lazy loading)

    useEffect(() => {

        if (isOpen && lazy && fetchOptions) {

            loadOptions(true);

        }

    }, [debouncedSearchTerm, isOpen, lazy]);



    // Filter local options when not using lazy loading

    const filteredOptions = lazy ? internalOptions : internalOptions.filter(option =>

        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||

        option.value.toLowerCase().includes(searchTerm.toLowerCase())

    );



    const loadOptions = useCallback(async (reset = false) => {

        if (loadingRef.current || !fetchOptions) return;



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

                setInternalOptions(newOptions);

                setOffset(2);

            } else {

                setInternalOptions(prev => [...prev, ...newOptions]);

                setOffset(prev => prev + 1);

            }



            setHasMore(newOptions.length === ITEMS_PER_PAGE);

        } catch (error) {

            console.error('Failed to load options:', error);

            if (reset) {

                setInternalOptions([]);

            }

        } finally {

            setLoading(false);

            loadingRef.current = false;

        }

    }, [fetchOptions, debouncedSearchTerm, offset]);



    const handleOpenChange = (open: boolean) => {

        setIsOpen(open);

        if (open && lazy) {

            setSearchTerm('');

            setDebouncedSearchTerm('');

            setOffset(1);

            setInternalOptions([]);

            setHasMore(true);

        }

    };



    const handleScroll = useCallback(() => {

        if (!scrollRef.current || loading || !hasMore || disableLazyLoading || !lazy) return;



        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 10) {

            loadOptions(false);

        }

    }, [loading, hasMore, loadOptions, disableLazyLoading, lazy]);



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

        e.stopPropagation();

        if (isOpen && onClick) {

            onClick(e, value);

        }

    };



    const getDisplayValue = () => {

        if (!value) return placeholder;



        if (multiSelect && Array.isArray(value)) {

            if (value.length === 0) return placeholder;

            if (value.length === 1) {

                const option = internalOptions.find(opt => opt.value === value[0]);

                return option?.label || value[0];

            }

            return `${value.length} items selected`;

        } else if (typeof value === 'string') {

            const option = internalOptions.find(opt => opt.value === value);

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



    const isLoading = loading || externalLoading;

    const displayOptions = filteredOptions;



    return (

        <div className="w-full">

            {/* Caption */}

            {caption && !hideCaption && (

                <label className="block pb-1" style={{ fontSize: sizeStyles.captionFontSize, fontWeight: '400', color: '#475467' }}>

                    {caption}

                </label>

            )}



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

                            sizeClass,

                            className

                        )}

                        style={{ height: sizeStyles.height, padding: '8px 12px' }}

                        disabled={disabled}

                        tabIndex={tabIndex}

                        onClick={handleButtonClick}

                        onFocus={onFocus}

                        onBlur={onBlur}

                        title={tooltip || getDisplayValue()}

                    >

                        <span className="truncate" style={{ fontSize: sizeStyles.valueFontSize, fontWeight: '400' }}>{getDisplayValue()}</span>

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

                    {searchable && (

                        <div className="p-2 border-b">

                            <Input

                                placeholder="Search..."

                                value={searchTerm}

                                onChange={(e) => setSearchTerm(e.target.value)}

                                className={cn("h-8")}

                                style={{ fontSize: sizeStyles.valueFontSize }}

                                disabled={isLoading}

                            />

                        </div>

                    )}

                    <div

                        ref={scrollRef}

                        className="max-h-60 overflow-y-auto"

                        onScroll={handleScroll}

                    >

                        {displayOptions.length === 0 && !isLoading ? (

                            <div className="py-6 text-center text-sm text-muted-foreground">

                                {searchable ? (debouncedSearchTerm ? 'No results found.' : 'Start typing to search...') : 'No options available.'}

                            </div>

                        ) : (

                            displayOptions.map((option) => (

                                <div

                                    key={option.value}

                                    className={cn(

                                        "flex items-center space-x-2 px-2 py-2 cursor-pointer",

                                        isSelected(option.value) && "bg-accent text-accent-foreground",

                                        size === 'small' ? 'py-1' : size === 'large' ? 'py-3' : 'py-2'

                                    )}

                                    onClick={() => handleSelect(option.value)}

                                    title={option.label}

                                >

                                    {multiSelect && (

                                        <Checkbox

                                            checked={isSelected(option.value)}

                                            onChange={() => { }}

                                        />

                                    )}

                                    <span className="flex-1 truncate" style={{ fontSize: sizeStyles.valueFontSize, fontWeight: '400' }}>{option.label}</span>

                                </div>

                            ))

                        )}

                        {isLoading && (

                            <div className="flex items-center justify-center py-4">

                                <Loader2 className="h-4 w-4 animate-spin" />

                                <span className="ml-2 text-muted-foreground" style={{ fontSize: sizeStyles.valueFontSize, fontWeight: '400' }}>Loading...</span>

                            </div>

                        )}

                    </div>

                </PopoverContent>

            </Popover>

        </div>

    );

}



// Export for backward compatibility and convenience

export { DropDown as LazySelect };

export default DropDown;