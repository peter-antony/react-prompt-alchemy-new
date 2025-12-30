import React, { useState, useCallback } from 'react';
import { SmartGrid } from './SmartGrid';
import { SmartGridProps, GridColumnConfig } from '@/types/smartgrid';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartGridNested } from './SmartGridNested';
 
export type NestedSelectionMode = 'none' | 'single' | 'multi';
 
export interface NestedRowSelection {
  parentRowIndex: number;
  nestedRowIndex: number;
  parentRow: any;
  nestedRow: any;
}
 
export interface NestedSectionConfig {
  nestedDataKey: string;
  columns: GridColumnConfig[];
  title?: string;
  initiallyExpanded?: boolean;
  showNestedRowCount?: boolean;
  editableColumns?: boolean | string[];
  onInlineEdit?: (parentRowIndex: number, nestedRowIndex: number, updatedRow: any) => void;
  onUpdate?: (parentRowIndex: number, nestedRowIndex: number, updatedRow: any) => Promise<void>;
  onServerUpdate?: (parentRow: any, nestedRow: any, updatedData: any) => Promise<void>;
  selectionMode?: NestedSelectionMode;
  onSelectionChange?: (selectedRows: NestedRowSelection[]) => void;
  selectedRows?: NestedRowSelection[];
}
 
export interface SmartGridWithNestedRowsProps extends SmartGridProps {
  nestedSectionConfig?: NestedSectionConfig;
  onRowSelectionChange?: (rows: any[]) => void;
}
 
export function SmartGridWithNestedRows({
  
  nestedSectionConfig,
   onRowSelectionChange,
  ...smartGridProps
}: SmartGridWithNestedRowsProps) {
  const [expandedNestedSections, setExpandedNestedSections] = useState<Set<number>>(
    new Set(nestedSectionConfig?.initiallyExpanded ? [] : [])
  );
 
  // Internal state for selection if not controlled externally
  const [internalSelectedRows, setInternalSelectedRows] = useState<NestedRowSelection[]>([]);
 
  const selectionMode = nestedSectionConfig?.selectionMode ?? 'none';
  const selectedRows = nestedSectionConfig?.selectedRows ?? internalSelectedRows;
  const onSelectionChange = nestedSectionConfig?.onSelectionChange ?? setInternalSelectedRows;
 
  const toggleNestedSection = (rowIndex: number) => {
    setExpandedNestedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  };
 
  // Check if a nested row is selected
  const isNestedRowSelected = useCallback((parentRowIndex: number, nestedRowIndex: number) => {
    return selectedRows.some(
      (sel) => sel.parentRowIndex === parentRowIndex && sel.nestedRowIndex === nestedRowIndex
    );
  }, [selectedRows]);
 
  // Handle nested row selection via row Click
  // const handleNestedRowClick = useCallback((
  //   parentRowIndex: number,
  //   nestedRowIndex: number,
  //   parentRow: any,
  //   nestedRow: any
  // ) => {
  //   if (selectionMode === 'none') return;
 
  //   const isCurrentlySelected = isNestedRowSelected(parentRowIndex, nestedRowIndex);
  //   const newSelection: NestedRowSelection = {
  //     parentRowIndex,
  //     nestedRowIndex,
  //     parentRow,
  //     nestedRow,
  //   };
 
  //   if (selectionMode === 'single') {
  //     // Single selection - toggle or replace
  //     if (isCurrentlySelected) {
  //       onSelectionChange([]);
  //     } else {
  //       onSelectionChange([newSelection]);
  //     }
  //   } else if (selectionMode === 'multi') {
  //     // Multi selection - toggle
  //     if (isCurrentlySelected) {
  //       onSelectionChange(
  //         selectedRows.filter(
  //           (sel) => !(sel.parentRowIndex === parentRowIndex && sel.nestedRowIndex === nestedRowIndex)
  //         )
  //       );
  //     } else {
  //       onSelectionChange([...selectedRows, newSelection]);
  //     }
  //   }
  // }, [selectionMode, selectedRows, onSelectionChange, isNestedRowSelected]);

  const handleNestedRowClick = useCallback((
  parentRowIndex: number,
  nestedRowIndex: number,
  parentRow: any,
  nestedRow: any
) => {
  if (selectionMode === 'none') return;

  // ✅ LOG FULL OBJECT ON CHECKBOX CLICK
  console.log("Checkbox clicked → FULL DATA:", {
    parentRowIndex,
    nestedRowIndex,
    parentRow,
    nestedRow,
  });

  const isCurrentlySelected = isNestedRowSelected(parentRowIndex, nestedRowIndex);

  const newSelection: NestedRowSelection = {
    parentRowIndex,
    nestedRowIndex,
    parentRow,
    nestedRow,
  };

  if (selectionMode === 'single') {
    onSelectionChange(isCurrentlySelected ? [] : [newSelection]);
  } else if (selectionMode === 'multi') {
    onSelectionChange(
      isCurrentlySelected
        ? selectedRows.filter(
            (sel) =>
              !(sel.parentRowIndex === parentRowIndex &&
                sel.nestedRowIndex === nestedRowIndex)
          )
        : [...selectedRows, newSelection]
    );
  }
}, [selectionMode, selectedRows, onSelectionChange, isNestedRowSelected]);

 
 
  // Create a nested row renderer that includes both the original nested content
  // (sub-row columns) and the new nested section (nested array data)
  const enhancedNestedRowRenderer = (row: any, rowIndex: number) => {
    // Get the original nested content (sub-row columns functionality)
    const originalNestedContent = smartGridProps.nestedRowRenderer?.(row, rowIndex);
   
    // If no nested section config, just return original content
    if (!nestedSectionConfig) {
      return originalNestedContent;
    }
 
    const nestedData = row[nestedSectionConfig.nestedDataKey] || [];
    // const isExpanded = expandedNestedSections.has(rowIndex);
    const isExpanded = !expandedNestedSections.has(rowIndex); // Expanded by default
    const rowCount = Array.isArray(nestedData) ? nestedData.length : 0;
 
    return (
      <div className="space-y-0">
        {/* Original nested content from parent SmartGrid (sub-row columns) */}
        {originalNestedContent && (
          <div className="border-b border-border/30">
            {originalNestedContent}
          </div>
        )}
 
        {/* New nested section for array data */}
        <div className="bg-background">
          {/* Nested section header */}
          <div
            style={{ display: 'none' }}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 cursor-pointer",
              "bg-muted/30 hover:bg-muted/50 transition-colors",
              "border-b border-border/50"
            )}
            onClick={() => toggleNestedSection(rowIndex)}
          >
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {nestedSectionConfig.title || 'Nested Data'}
              </span>
              {nestedSectionConfig.showNestedRowCount !== false && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({rowCount} {rowCount === 1 ? 'record' : 'records'})
                </span>
              )}
            </div>
          </div>
 
          {/* Nested grid content */}
          {isExpanded && (
            <div className="bg-background border-b border-border/30">
              {rowCount === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No nested records available
                </div>
              ) : (
                <div className="p-3">
                  <SmartGridNested
                    columns={nestedSectionConfig.columns}
                    data={nestedData}
                    paginationMode="infinite"
                    hideToolbar={true}
                    customPageSize={rowCount}
                    editableColumns={nestedSectionConfig.editableColumns}
                    onInlineEdit={nestedSectionConfig.onInlineEdit
                      ? async (nestedRowIndex, updatedRow) => {
                          nestedSectionConfig.onInlineEdit!(rowIndex, nestedRowIndex, updatedRow);
                          // Trigger server callback if provided
                          if (nestedSectionConfig.onServerUpdate) {
                            await nestedSectionConfig.onServerUpdate(row, nestedData[nestedRowIndex], updatedRow);
                          }
                        }
                      : undefined}
                    onUpdate={nestedSectionConfig.onUpdate
                      ? (updatedRow) => nestedSectionConfig.onUpdate!(rowIndex, nestedData.findIndex((item: any) => item === updatedRow), updatedRow)
                      : undefined}
                  />
                  {/* Custom table for nested rows with row-level selection */}
                  {/* <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {nestedSectionConfig.columns.map((col) => (
                            <th
                              key={col.key}
                              className="px-3 py-2 text-left font-medium text-muted-foreground"
                              style={{ width: col.width }}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {nestedData.map((nestedRow: any, nestedIdx: number) => {
                          const isSelected = isNestedRowSelected(rowIndex, nestedIdx);
                          return (
                            <tr
                              key={nestedIdx}
                              className={cn(
                                "border-b border-border/50 transition-colors",
                                selectionMode !== 'none' && "cursor-pointer hover:bg-muted/30",
                                selectionMode === 'none' && "hover:bg-muted/20",
                                isSelected && "bg-primary/10 hover:bg-primary/15"
                              )}
                              onClick={() => handleNestedRowClick(rowIndex, nestedIdx, row, nestedRow)}
                            >
                              {nestedSectionConfig.columns.map((col) => (
                                <td
                                  key={col.key}
                                  className="px-3 py-2"
                                  style={{ width: col.width }}
                                >
                                  {col.type === 'Badge' ? (
                                    <span className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                      nestedRow[col.key] === 'Completed' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                      nestedRow[col.key] === 'In Progress' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                      nestedRow[col.key] === 'Pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    )}>
                                      {nestedRow[col.key]}
                                    </span>
                                  ) : (
                                    nestedRow[col.key]
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div> */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
 
  // Override the nestedRowRenderer if we have a nestedSectionConfig
  const finalNestedRowRenderer = nestedSectionConfig
    ? enhancedNestedRowRenderer
    : smartGridProps.nestedRowRenderer;
 
  return (
    <SmartGridNested
      {...smartGridProps}
      nestedRowRenderer={finalNestedRowRenderer}
      onRowDataSelection={onRowSelectionChange}
      // selectedRows={smartGridProps.selectedRows}
    />
  );
}
 