
import { GridColumnConfig, GridPreferences, GridPlugin } from '@/types/smartgrid';

// Function to estimate text width in pixels
function getTextWidth(text: string, fontSize: number = 13, font: string = 'system-ui, -apple-system, sans-serif'): number {
  // Create a canvas element to measure text width
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return text.length * 10; // Improved fallback calculation
  
  // Handle font-weight in font string or set default
  context.font = font.includes('px') ? font : `${fontSize}px ${font}`;
  const metrics = context.measureText(text);
  
  // Add some buffer for more accurate measurement
  return Math.ceil(metrics.width + 2);
}

// Function to calculate column width based on header text
function calculateHeaderBasedWidth(column: GridColumnConfig): number {
  const headerText = column.label || column.key;
  const padding = 80; // Increased padding for sort icons, resize handle, etc.
  const minWidth = 150; // Increased minimum width for single line display
  const maxWidth = 600; // Increased maximum width for very long headers
  
  // Calculate text width with proper font settings (font-semibold = 600 weight)
  const textWidth = getTextWidth(headerText, 14, '600 14px system-ui, -apple-system, sans-serif');
  const calculatedWidth = textWidth + padding;
  
  // Apply type-specific adjustments
  let typeMultiplier = 1;
  switch (column.type) {
    case 'LazySelect':
    case 'Select':
    case 'Dropdown':
      typeMultiplier = 1.5; // Need extra space for dropdown arrow
      break;
    case 'DateTimeRange':
      typeMultiplier = 1.7; // Need space for date range
      break;
    case 'Date':
    case 'Time':
      typeMultiplier = 1.4;
      break;
    case 'Integer':
      typeMultiplier = 1.2; // Adequate space for numbers
      break;
    case 'Badge':
      typeMultiplier = 1.3;
      break;
    case 'String':
    case 'Text':
      typeMultiplier = 1.4; // Extra space for text content
      break;
    default:
      typeMultiplier = 1.3;
  }
  
  const finalWidth = Math.max(minWidth, Math.min(maxWidth, calculatedWidth * typeMultiplier));
  return Math.ceil(finalWidth);
}

export function calculateColumnWidths(
  visibleColumns: GridColumnConfig[],
  showCheckboxes: boolean,
  plugins: GridPlugin[],
  preferences: GridPreferences,
  columnWidths: Record<string, number>
) {
  // For fixed-width grid containers, calculate widths based on content requirements
  const checkboxWidth = showCheckboxes ? 50 : 0;
  const actionsWidth = plugins.some(plugin => plugin.rowActions) ? 120 : 0;
  
  const calculatedWidths: Record<string, number> = {};
  
  // Calculate width for each column based on priority:
  // 1. User-resized widths (columnWidths)
  // 2. Saved preferences (preferences.columnWidths)
  // 3. Column-defined widths (col.width)
  // 4. Header-based calculation
  visibleColumns.forEach(col => {
    const customWidth = columnWidths[col.key];
    const preferredWidth = preferences.columnWidths[col.key];
    const configuredWidth = col.width;

    if (customWidth && customWidth > 0) {
      // User has manually resized this column - respect that
      calculatedWidths[col.key] = Math.max(150, customWidth);
    } else if (preferredWidth && preferredWidth > 0) {
      // Saved preference width
      calculatedWidths[col.key] = Math.max(150, preferredWidth);
    } else if (configuredWidth && configuredWidth > 0) {
      // Column has predefined width
      calculatedWidths[col.key] = Math.max(150, configuredWidth);
    } else {
      // Use header-based calculation for dynamic width
      const headerBasedWidth = calculateHeaderBasedWidth(col);
      calculatedWidths[col.key] = headerBasedWidth;
      
    }
  });
  
  return calculatedWidths;
}
