import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { GridColumnConfig } from '@/types/smartgrid';
import { DynamicLazySelect1 } from '@/components/DynamicPanel/DynamicLazySelect1';
import { cn } from '@/lib/utils';

// Regional decimal formatting utility functions
const normalizeDecimalForAPI = (value: string | number | undefined | null): string => {
    if (!value && value !== 0) return '';
    let stringValue = String(value).trim();
    if (!stringValue) return '';

    // Handle German format input (66,7 or 1.234,56)
    if (stringValue.includes(',')) {
        // If both dots and commas exist, assume dots are thousands separators
        if (stringValue.includes('.') && stringValue.lastIndexOf(',') > stringValue.lastIndexOf('.')) {
            stringValue = stringValue.replace(/\./g, '').replace(',', '.');
        } else {
            // Just replace comma with dot
            stringValue = stringValue.replace(',', '.');
        }
    }

    return stringValue;
};

const formatDecimalForDisplay = (value: string | number | undefined | null, region: 'german' | 'indian' = 'german'): string => {
    if (!value && value !== 0) return '';
    let stringValue = String(value).trim();
    if (!stringValue) return '';

    // First normalize to standard format
    stringValue = normalizeDecimalForAPI(stringValue);

    // Then convert based on region
    if (region === 'german') {
        // Convert standard format (66.7) to German format (66,7)
        const parts = stringValue.split('.');
        if (parts.length === 2) {
            return `${parts[0]},${parts[1]}`;
        }
    }
    // Indian format uses standard dot notation
    return stringValue;
};

const isNumericDecimalField = (column: GridColumnConfig): boolean => {
    const numericDecimalFields = ['ProductWeight', 'WagonAvgLoadWeight', 'WagonAvgTareWeight', 'WagonTareWeight', 'GrossWeight', 'ContainerAvgTareWeight', 'ContainerAvgLoadWeight', 'ThuWeight', 'WagonLength'];
    return numericDecimalFields.includes(column.key) ||
        column.key?.toLowerCase().includes('weight') ||
        column.label?.toLowerCase().includes('weight') ||
        column.key?.toLowerCase().includes('length');
};

interface EnhancedCellEditorProps {
    value: any;
    column: GridColumnConfig;
    onChange: (value: any) => void;
    error?: string;
    shouldFocus?: boolean;
    region?: 'german' | 'indian'; // Add region prop
    disabled?: boolean; // Add disabled prop for field-level control
}

export function EnhancedCellEditor1({ value, column, onChange, error, shouldFocus = false, region = 'german', disabled = false }: EnhancedCellEditorProps) {
    // Determine if the field is disabled from either prop or column configuration
    const isDisabled = disabled || column.disabled || false;
    // Better handling of initial values based on column type and region
    const getInitialValue = (val: any, colType: string, col: GridColumnConfig) => {
        if (val === null || val === undefined) {
            switch (colType) {
                case 'String':
                case 'Text':
                    return '';
                case 'Integer':
                    return '';
                case 'Date':
                case 'Time':
                    return '';
                default:
                    return '';
            }
        }

        // For weight integer fields, format for regional display
        if (colType === 'Integer' && isNumericDecimalField(col)) {
            const formatted = formatDecimalForDisplay(val, region);
            return formatted;
        }

        // For strings, ensure we return the actual string value
        if (colType === 'String' || colType === 'Text') {
            return String(val);
        }
        return val;
    };

    const [editValue, setEditValue] = useState(getInitialValue(value, column.type, column));
    const [isUserTyping, setIsUserTyping] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update editValue when the external value prop changes, but not when user is actively typing
    useEffect(() => {
        if (!isUserTyping) {
            setEditValue(getInitialValue(value, column.type, column));
        }
    }, [value, column.type, column, isUserTyping, region]);

    useEffect(() => {
        if (shouldFocus) {
            if (inputRef.current && !['LazySelect', 'Select'].includes(column.type)) {
                inputRef.current.focus();
            } else if (['LazySelect', 'Select'].includes(column.type)) {
                // For LazySelect and Select, focus the button element
                setTimeout(() => {
                    const button = document.querySelector(`[role="combobox"][tabindex="0"]`) as HTMLButtonElement;
                    if (button) {
                        button.focus();
                    }
                }, 50);
            }
        }
    }, [column.type, shouldFocus, isDisabled]);

    const handleChange = (newValue: any) => {
        setIsUserTyping(true);
        setEditValue(newValue);

        // Type conversion with better handling and regional support
        let finalValue = newValue;
        switch (column.type) {
            case 'Integer':
                // Handle empty string as null for integer fields
                if (newValue === '' || newValue === null || newValue === undefined) {
                    finalValue = null;
                } else {
                    // Check if this is a weight field that should allow decimals and regional formatting
                    const isNumericDecimalFieldType = isNumericDecimalField(column);

                    let parsed;
                    let normalizedInput;
                    if (isNumericDecimalFieldType) {
                        // For weight fields, normalize regional input to standard format first
                        normalizedInput = normalizeDecimalForAPI(newValue);
                        parsed = parseFloat(normalizedInput);
                    } else {
                        // Use parseInt for other integer fields to maintain whole numbers
                        parsed = parseInt(newValue, 10);
                    }

                    // Prevent negative values for all integer fields
                    if (isNaN(parsed) || parsed < 0) {
                        finalValue = null;
                    } else {
                        // For weight fields, we want to store the normalized decimal string
                        // instead of the parsed number to maintain precision
                        if (isNumericDecimalFieldType) {
                            finalValue = normalizedInput; // Store as string
                        } else {
                            finalValue = parsed; // Store as number for non-weight fields
                        }
                    }
                }
                break;
            case 'String':
            case 'Text':
                // Ensure strings are always strings, handle null/undefined
                // Keep the original value if it's already a string, don't force empty string
                if (newValue === null || newValue === undefined) {
                    finalValue = '';
                } else {
                    finalValue = String(newValue);
                }
                break;
            case 'Date':
                // Keep date as string in YYYY-MM-DD format or null
                finalValue = newValue && newValue !== '' ? newValue : null;
                break;
            case 'Time':
                // Keep time as string in HH:MM format or null
                finalValue = newValue && newValue !== '' ? newValue : null;
                break;
            default:
                finalValue = newValue;
        }

        // Call onChange immediately to update the parent state
        onChange(finalValue);

        // Reset typing flag after a short delay
        setTimeout(() => setIsUserTyping(false), 100);
    };    // LazySelect renderer
    if (column.type === 'LazySelect' && column.fetchOptions) {
        return (
            <div className="w-full max-w-full overflow-hidden">
                <DynamicLazySelect1
                    fetchOptions={column.fetchOptions}
                    value={editValue}
                    onChange={handleChange}
                    placeholder="Select..."
                    multiSelect={column.multiSelect}
                    hideSearch={column.hideSearch}
                    disableLazyLoading={column.disableLazyLoading}
                    allowNewEntry={column.allowNewEntry || false}
                    minSearchLength={column.minSearchLength || 3}
                    tabIndex={shouldFocus ? 0 : undefined}
                    disabled={isDisabled}
                    onFocus={() => {
                        if (shouldFocus && !isDisabled) {
                            // Auto-open the dropdown when focused for better UX
                            setTimeout(() => {
                                const button = document.querySelector(`[role="combobox"]:focus`) as HTMLButtonElement;
                                if (button) {
                                    button.click();
                                }
                            }, 50);
                        }
                    }}
                />
                {error && (
                    <div className="mt-1 text-xs text-destructive">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // Select/Dropdown renderer
    if ((column.type === 'Select' || column.type === 'Dropdown') && column.options) {
        return (
            <div className="w-full max-w-full overflow-hidden">
                <select
                    value={editValue}
                    onChange={(e) => handleChange(e.target.value)}
                    className={cn(
                        "w-full max-w-full px-3 py-2 text-sm border rounded-md bg-background overflow-hidden text-left",
                        error && 'border-destructive focus-visible:ring-destructive',
                        isDisabled && 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                    autoFocus={shouldFocus && !isDisabled}
                    tabIndex={shouldFocus && !isDisabled ? 0 : undefined}
                    disabled={isDisabled}
                >
                    <option value="">Select...</option>
                    {column.options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {error && (
                    <div className="mt-1 text-xs text-destructive">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // Input type determination with regional support
    let inputType = 'text';
    let inputStep = undefined;
    let inputMin = undefined;

    switch (column.type) {
        case 'Integer':
            // For weight fields, use text input to allow regional decimal formatting
            if (isNumericDecimalField(column)) {
                inputType = 'text'; // Use text to allow comma input in German region
                inputStep = undefined;
            } else {
                inputType = 'number';
                inputStep = '1'; // Whole numbers only for non-weight integer fields
            }
            inputMin = '0'; // Prevent negative values
            break;
        case 'Date':
            inputType = 'date';
            break;
        case 'Time':
            inputType = 'time';
            break;
        default:
            inputType = 'text';
    }

    // Standard input renderer with regional support
    const getPlaceholder = () => {
        if (column.type === 'Integer' && isNumericDecimalField(column)) {
            return region === 'german' ? '' : ''; // Example format
        }
        if (column.type === 'Time') return 'HH:MM';
        if (column.type === 'Date') return 'YYYY-MM-DD';
        return '';
    };

    // If disabled and it's a string field, show as disabled text with title
    if (isDisabled && (column.type === 'String' || column.type === 'Text')) {
        return (
            <div className="w-full max-w-full overflow-hidden">
                <div
                    className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground cursor-default overflow-hidden text-left"
                    title={editValue ? String(editValue) : ''}
                    style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        minHeight: '2.25rem', // Consistent height matching Input component
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.875rem' // Custom font size for disabled fields
                    }}
                >
                    {editValue || ''}
                </div>
                {error && (
                    <div className="mt-1 text-xs text-destructive">
                        {error}
                    </div>
                )}
            </div>
        );
    } return (
        <div className="w-full max-w-full overflow-hidden">
            <Input
                ref={inputRef}
                type={inputType}
                value={editValue}
                onChange={(e) => handleChange(e.target.value)}
                className={cn(
                    'w-full max-w-full text-xs text-left',
                    error && 'border-destructive focus-visible:ring-destructive',
                    isDisabled && 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }}
                step={inputStep}
                min={inputMin}
                autoFocus={shouldFocus && !isDisabled}
                placeholder={getPlaceholder()}
                disabled={isDisabled}
                title={(column.type === 'String' || column.type === 'Text') && editValue ? String(editValue) : undefined}
                // Special handling for time inputs
                {...(column.type === 'Time' && {
                    pattern: '[0-9]{2}:[0-9]{2}',
                })}
            />
            {error && (
                <div className="mt-1 text-xs text-destructive">
                    {error}
                </div>
            )}
        </div>
    );
}