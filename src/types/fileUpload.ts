export interface FileUploadConfig {
  categories: string[];
  maxFiles?: number;
  maxFileSizeMB?: number;
  allowedTypes?: string[];
  uploadEndpoint?: string;
  filesEndpoint?: string;
}

export interface StagedFile {
  id: string;
  file: File;
  preview?: string;
  category?: string;
  remarks?: string;
  Attachuniquename?: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  category: string;
  remarks?: string;
  downloadUrl: string;
  Attachuniquename?: string;
}

export interface FileUploadProps {
  config?: Partial<FileUploadConfig>;
  onUpload?: (files: StagedFile[]) => Promise<void>;
  onDelete?: (fileId: string) => Promise<void>;
  // onDownload?: (file: UploadedFile) => void;
  onDownload?: (file: any) => Promise<{ blob: Blob; filename: string }>;
  className?: string;
  isEditQuickOrder?: boolean;
  isTripLogAttachments?: boolean;
  isWorkOrderAttachment?: boolean;
  isResourceGroupAttchment?: boolean;
  loadAttachmentData?: any;
}

export interface FileFilterState {
  showCategoryDropdown: any;
  searchTerm: string;
  selectedCategory: string;
  selectedFileType: string;
}