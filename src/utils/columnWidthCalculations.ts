
import { GridColumnConfig, GridPreferences, GridPlugin } from '@/types/smartgrid';

export function calculateColumnWidths(
  visibleColumns: GridColumnConfig[],
  showCheckboxes: boolean,
  plugins: GridPlugin[],
  preferences: GridPreferences,
  columnWidths: Record<string, number>
) {
  // Get container width with more conservative padding
  const containerWidth = Math.max(800, window.innerWidth - 100); // Minimum 800px width
  const checkboxWidth = showCheckboxes ? 50 : 0;
  const actionsWidth = plugins.some(plugin => plugin.rowActions) ? 100 : 0;
  const availableWidth = containerWidth - checkboxWidth - actionsWidth;
  
  const calculatedWidths: Record<string, number> = {};
  let totalConfiguredWidth = 0;
  let columnsWithoutWidth = 0;
  
  // First pass: use configured widths where available
  visibleColumns.forEach(col => {
    const customWidth = columnWidths[col.key];
    const preferredWidth = preferences.columnWidths[col.key];
    const configuredWidth = col.width;
    
    if (customWidth) {
      calculatedWidths[col.key] = Math.min(customWidth, availableWidth * 0.4); // Max 40% of available width
      totalConfiguredWidth += calculatedWidths[col.key];
    } else if (preferredWidth) {
      calculatedWidths[col.key] = Math.min(preferredWidth, availableWidth * 0.4);
      totalConfiguredWidth += calculatedWidths[col.key];
    } else if (configuredWidth) {
      calculatedWidths[col.key] = Math.min(configuredWidth, availableWidth * 0.4);
      totalConfiguredWidth += calculatedWidths[col.key];
    } else {
      columnsWithoutWidth++;
    }
  });
  
  // Second pass: calculate widths for columns without configured width
  const remainingWidth = Math.max(0, availableWidth - totalConfiguredWidth);
  const defaultWidthPerColumn = columnsWithoutWidth > 0 ? 
    Math.max(100, Math.min(200, remainingWidth / columnsWithoutWidth)) : 120;
  
  visibleColumns.forEach(col => {
    if (!calculatedWidths[col.key]) {
      let minWidth = 100;
      let maxWidth = 300;
      
      switch (col.type) {
        case 'Badge':
          minWidth = 80;
          maxWidth = 150;
          break;
        case 'Date':
          minWidth = 120;
          maxWidth = 180;
          break;
        case 'DateTimeRange':
          minWidth = 160;
          maxWidth = 240;
          break;
        case 'Link':
          minWidth = 120;
          maxWidth = 200;
          break;
        case 'ExpandableCount':
          minWidth = 80;
          maxWidth = 120;
          break;
        case 'Text':
        case 'EditableText':
        default:
          minWidth = 100;
          maxWidth = 250;
          break;
      }
      
      calculatedWidths[col.key] = Math.max(minWidth, Math.min(maxWidth, defaultWidthPerColumn));
    }
  });
  
  // Final pass: ensure total width doesn't exceed available width
  const totalCalculatedWidth = Object.values(calculatedWidths).reduce((sum, width) => sum + width, 0);
  
  if (totalCalculatedWidth > availableWidth) {
    const scaleFactor = availableWidth / totalCalculatedWidth;
    Object.keys(calculatedWidths).forEach(key => {
      calculatedWidths[key] = Math.max(80, calculatedWidths[key] * scaleFactor);
    });
  }
  
  return calculatedWidths;
}
