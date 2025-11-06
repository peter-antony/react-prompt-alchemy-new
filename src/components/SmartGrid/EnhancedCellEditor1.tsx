import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { GridColumnConfig } from '@/types/smartgrid';
import { DynamicLazySelect1 } from '@/components/DynamicPanel/DynamicLazySelect1';
import { cn } from '@/lib/utils';

interface EnhancedCellEditorProps {
    value: any;
    column: GridColumnConfig;
    onChange: (value: any) => void;
    error?: string;
    shouldFocus?: boolean;
}

export function EnhancedCellEditor1({ value, column, onChange, error, shouldFocus = false }: EnhancedCellEditorProps) {
    // Better handling of initial values based on column type
    const getInitialValue = (val: any, colType: string) => {
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
        // For strings, ensure we return the actual string value
        if (colType === 'String' || colType === 'Text') {
            return String(val);
        }
        return val;
    };

    const [editValue, setEditValue] = useState(getInitialValue(value, column.type));
    const [isUserTyping, setIsUserTyping] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update editValue when the external value prop changes, but not when user is actively typing
    useEffect(() => {
        if (!isUserTyping) {
            setEditValue(getInitialValue(value, column.type));
        }
    }, [value, column.type, isUserTyping]);

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
    }, [column.type, shouldFocus]);

    const handleChange = (newValue: any) => {
        setIsUserTyping(true);
        setEditValue(newValue);

        // Type conversion with better handling
        let finalValue = newValue;
        switch (column.type) {
            case 'Integer':
                // Handle empty string as null for integer fields
                if (newValue === '' || newValue === null || newValue === undefined) {
                    finalValue = null;
                } else {
                    // Check if this is a product weight field that should allow decimals
                    const isProductWeightField = column.key?.toLowerCase().includes('productweight') ||
                        column.label?.toLowerCase().includes('product weight');

                    let parsed;
                    if (isProductWeightField) {
                        // Use parseFloat for product weight fields to allow decimals
                        parsed = parseFloat(newValue);
                    } else {
                        // Use parseInt for other integer fields to maintain whole numbers
                        parsed = parseInt(newValue, 10);
                    }

                    // Prevent negative values for all integer fields
                    if (isNaN(parsed) || parsed < 0) {
                        finalValue = null;
                    } else {
                        finalValue = parsed;
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
                    onFocus={() => {
                        if (shouldFocus) {
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
                        error && 'border-destructive focus-visible:ring-destructive'
                    )}
                    autoFocus={shouldFocus}
                    tabIndex={shouldFocus ? 0 : undefined}
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

    // Input type determination
    let inputType = 'text';
    let inputStep = undefined;
    let inputMin = undefined;

    switch (column.type) {
        case 'Integer':
            inputType = 'number';
            inputMin = '0'; // Prevent negative values
            // Check if this is a product weight field that should allow decimals
            const isProductWeightField = column.key?.toLowerCase().includes('productweight') ||
                column.label?.toLowerCase().includes('product weight');
            inputStep = isProductWeightField ? 'any' : '1';
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

    // Standard input renderer
    return (
        <div className="w-full max-w-full overflow-hidden">
            <Input
                ref={inputRef}
                type={inputType}
                value={editValue}
                onChange={(e) => handleChange(e.target.value)}
                className={cn(
                    'w-full max-w-full text-xs text-left',
                    error && 'border-destructive focus-visible:ring-destructive'
                )}
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }}
                step={inputStep}
                min={inputMin}
                autoFocus={shouldFocus}
                // Special handling for time inputs
                {...(column.type === 'Time' && {
                    placeholder: 'HH:MM',
                    pattern: '[0-9]{2}:[0-9]{2}',
                })}
                // Special handling for date inputs
                {...(column.type === 'Date' && {
                    placeholder: 'YYYY-MM-DD',
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