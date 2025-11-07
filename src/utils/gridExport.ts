
import { GridColumnConfig } from '@/types/smartgrid';
import * as XLSX from 'xlsx';

export function exportToCSV(
  data: any[],
  columns: GridColumnConfig[],
  filename: string = 'export.csv'
) {
  const headers = columns.map(col => col.label).join(',');
  
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      
      // Handle null/undefined values
      if (value == null) return '';
      
      // Handle object values (like Badge type with {value, variant})
      let displayValue: string;
      if (typeof value === 'object' && value !== null) {
        if ('value' in value) {
          // Handle Badge type objects {value, variant}
          displayValue = String(value.value);
        } else if (Array.isArray(value)) {
          // Handle arrays by joining with semicolons
          displayValue = value.map(item => 
            typeof item === 'object' && item !== null && 'value' in item ? item.value : String(item)
          ).join('; ');
        } else {
          // For other objects, try to extract meaningful content
          displayValue = JSON.stringify(value);
        }
      } else {
        displayValue = String(value);
      }
      
      // Escape CSV values
      if (displayValue.includes(',') || displayValue.includes('"') || displayValue.includes('\n')) {
        return `"${displayValue.replace(/"/g, '""')}"`;
      }
      return displayValue;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToExcel(
  data: any[],
  columns: GridColumnConfig[],
  filename: string = 'export.xlsx'
) {
  try {
    // Prepare data for Excel
     console.log('HEADERS: ', columns);
  console.log('PROCESSED DATA: ', data);
    const processedData = data.map(row => {
      const processedRow: Record<string, any> = {};
      columns.forEach(col => {
        const value = row[col.key];
        
        // Handle null/undefined values
        if (value == null) {
          processedRow[col.label] = '';
          return;
        }
        
        // Handle object values (like Badge type with {value, variant})
        if (typeof value === 'object' && value !== null) {
          if ('value' in value) {
            // Handle Badge type objects {value, variant}
            processedRow[col.label] = value.value;
          } else if (Array.isArray(value)) {
            // Handle arrays by joining with semicolons
            processedRow[col.label] = value.map(item => 
              typeof item === 'object' && item !== null && 'value' in item ? item.value : String(item)
            ).join('; ');
          } else {
            // For other objects, convert to string
            processedRow[col.label] = JSON.stringify(value);
          }
        } else {
          processedRow[col.label] = value;
        }
      });
      return processedRow;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    // const worksheet = XLSX.utils.json_to_sheet(processedData);
     // If no data, create empty worksheet with headers only
    let worksheet;
    if (processedData.length === 0) {
      // Create empty row with column headers
      const headerRow: Record<string, any> = {};
      columns.forEach(col => {
        headerRow[col.label] = '';
      });
      worksheet = XLSX.utils.json_to_sheet([headerRow]);
    } else {
      worksheet = XLSX.utils.json_to_sheet(processedData);
    }

    // Make headers bold
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const headerRowNum = headerRange.s.r; // First row (0-based)
    
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowNum, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell) {
        // Initialize cell style if it doesn't exist
        if (!cell.s) {
          cell.s = {};
        }
        
        // Set cell style for bold headers with proper formatting
        cell.s = {
          ...cell.s,
          font: {
            bold: true,
            name: 'Arial',
            sz: 11
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },
          fill: {
            fgColor: { rgb: 'D3D3D3' }  // Light gray background for headers
          }
        };
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Generate Excel file as blob and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      throw new Error('Download not supported in this browser');
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error(`Failed to export Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function parseCSV(csvText: string): Array<Record<string, string>> {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const data = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}
