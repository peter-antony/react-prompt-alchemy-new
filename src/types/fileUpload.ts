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
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  category: string;
  remarks?: string;
  // uploadDate: string;
  // fileSize: number;
  downloadUrl: string;
}

export interface FileUploadProps {
  config?: Partial<FileUploadConfig>;
  onUpload?: (files: StagedFile[]) => Promise<void>;
  onDelete?: (fileId: string) => Promise<void>;
  onDownload?: (file: UploadedFile) => void;
  className?: string;
  isEditQuickOrder?: boolean;
  isResourceGroupAttchment?: boolean;
}

export interface FileFilterState {
  showCategoryDropdown: any;
  searchTerm: string;
  selectedCategory: string;
  selectedFileType: string;
}