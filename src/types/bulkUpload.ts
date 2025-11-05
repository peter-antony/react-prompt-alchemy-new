export interface ValidationRule {
  type?: 'string' | 'number' | 'email' | 'date' | 'boolean';
  required?: boolean;
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  customValidator?: (value: any, row: any) => string | null;
}
 
export interface ColumnConfig {
  fieldName: string;
  displayName: string;
  validationRules?: ValidationRule;
}
 
export interface UploadError {
  row: number;
  column: string;
  error: string;
  value: any;
}
 
export interface ValidationResult {
  isValid: boolean;
  errors: UploadError[];
  validRows: any[];
  invalidRows: any[];
}
 
export interface UploadSummary {
  totalRows: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  errors: UploadError[];
}
 
export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  confidence: number;
}
 
export interface BulkUploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  data?: any[];
  errors?: UploadError[];
}
 
export interface DynamicBulkUploadProps {
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  templateUrl?: string;
  columnsConfig: ColumnConfig[];
  onUpload: (file: File) => Promise<any[]>;
  onValidate: (data: any[], columnsConfig: ColumnConfig[]) => ValidationResult;
  onImportComplete: (summary: UploadSummary) => void;
  allowMultipleFiles?: boolean;
  enableMapping?: boolean;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}