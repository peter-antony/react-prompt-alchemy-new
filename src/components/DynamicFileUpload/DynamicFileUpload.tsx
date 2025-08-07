import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Download, 
  Trash,
  CircleCheck, 
  Eye, 
  Edit, 
  Search,
  Filter,
  Check, UploadCloud,
  BookPlus, FileImage, BookA
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileUploadProps, StagedFile, UploadedFile, FileFilterState, FileUploadConfig } from '@/types/fileUpload';
import jsonStore from '@/stores/jsonStore';


const defaultConfig: FileUploadConfig = {
  categories: ['BR Amendment', 'Invoice', 'Contract', 'Other'],
  maxFiles: 10,
  maxFileSizeMB: 2,
  allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'xls', 'xlsx', 'doc', 'docx'],
  uploadEndpoint: '/api/upload',
  filesEndpoint: '/api/files'
};

// const DynamicFileUpload = ({ isEditQuickOrder }: DynamicFileGroupProps) => ({
const DynamicFileUpload: React.FC<FileUploadProps> = ({
  config = {},
  onUpload,
  onDelete,
  onDownload,
  className = '',
  isEditQuickOrder,
  isResourceGroupAttchment,
}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [filters, setFilters] = useState<FileFilterState>({
    searchTerm: '',
    selectedCategory: '',
    selectedFileType: '',
    showCategoryDropdown: false
  });

  const [loadedFiles, setLoadedFiles] = useState([]);
  useEffect(() => {
    const fullJson = jsonStore.getJsonData();
    console.log("uploaded JSON :: ", isEditQuickOrder);
    console.log("uploaded JSON :: ", isResourceGroupAttchment);
    if(isResourceGroupAttchment){
      setLoadedFiles(jsonStore.getResourceGroupAttachments());    
    }else{
      setLoadedFiles(jsonStore.getAttachments());  
    }  
    console.log("loadedFiles---- :: ", loadedFiles);
    // Simulate successful upload by moving to uploaded files
    if(loadedFiles != undefined && loadedFiles.length != 0){
      console.log("true loadedFiles");
      const newUploadedGetFiles: UploadedFile[] = loadedFiles.map(file => ({
        id: file.AttachItemID,
        fileName: file.AttachName,
        fileType: file.AttachmentType,
        category: file.FileCategory || '',
        remarks: file.remarks || '',
        // uploadDate: new Date().toISOString(),
        // fileSize: file.file.size,
        downloadUrl: `#download-${file.AttachItemID}`
      }));
      console.log("get loaded files ", newUploadedGetFiles);
      setUploadedFiles(prev => [...prev, ...newUploadedGetFiles]);
    }
  }, [loadedFiles]);


  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      category: '',
      remarks: ''
    }
  });

  const selectedCategory = watch('category');
  const remarks = watch('remarks');

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !finalConfig.allowedTypes?.includes(extension)) {
      return `File type .${extension} is not allowed`;
    }
    if (file.size > (finalConfig.maxFileSizeMB || 2) * 1024 * 1024) {
      return `File size exceeds ${finalConfig.maxFileSizeMB}MB limit`;
    }
    return null;
  };

  const handleFileSelection = useCallback((files: FileList) => {
    const newFiles: StagedFile[] = [];
    
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "File Upload Error",
          description: error,
          variant: "destructive"
        });
        return;
      }

      if (stagedFiles.length + newFiles.length >= (finalConfig.maxFiles || 10)) {
        toast({
          title: "Maximum Files Reached",
          description: `You can only upload up to ${finalConfig.maxFiles} files`,
          variant: "destructive"
        });
        return;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const stagedFile: StagedFile = {
        id: fileId,
        file,
        category: selectedCategory,
        remarks
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setStagedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, preview: e.target?.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(stagedFile);
    });

    setStagedFiles(prev => [...prev, ...newFiles]);
  }, [stagedFiles, selectedCategory, remarks, finalConfig, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, [handleFileSelection]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelection(files);
    }
  }, [handleFileSelection]);

  const removeStagedFile = useCallback((fileId: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleUploadSubmit = useCallback(async () => {
    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select a file category before uploading",
        variant: "destructive"
      });
      return;
    }

    if (stagedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Update staged files with current form values
      const filesToUpload = stagedFiles.map(file => ({
        ...file,
        category: selectedCategory,
        remarks
      }));

      if (onUpload) {
        await onUpload(filesToUpload);
      }

      // Simulate successful upload by moving to uploaded files
      const newUploadedFiles: UploadedFile[] = filesToUpload.map(file => ({
        id: file.id,
        fileName: file.file.name,
        fileType: file.file.type,
        category: file.category || '',
        remarks: file.remarks,
        // uploadDate: new Date().toISOString(),
        // fileSize: file.file.size,
        downloadUrl: `#download-${file.id}`
      }));
      console.log("newUploadedFiles ", newUploadedFiles);

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      setStagedFiles([]);
      reset();

      toast({
        title: "Upload Successful",
        description: `${filesToUpload.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedCategory, remarks, stagedFiles, onUpload, reset, toast]);

  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      if (onDelete) {
        await onDelete(fileId);
      }
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: "File Deleted",
        description: "File deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  }, [onDelete, toast]);

  console.log("uploadedFiles ", uploadedFiles);
  const filteredFiles = uploadedFiles.filter(file => {
    console.log("uploadedFiles ", file);
    const matchesSearch = !filters.searchTerm || 
      file.fileName.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesCategory = !filters.selectedCategory || 
      filters.selectedCategory === 'all' || 
      file.category === filters.selectedCategory;
    const matchesFileType = !filters.selectedFileType || 
      file.fileName.toLowerCase().endsWith(filters.selectedFileType.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesFileType;
  });
  console.log("filteredFiles ", filteredFiles);

  return (
    <div className={`flex flex-col md:flex-row gap-6 w-full h-full bg-[#f8fafd]`}>
      {/* Left Panel - Upload Form */}
      <div className="md:w-1/3 w-full bg-white p-6 flex flex-col gap-6">

        <div className="">
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">File Category <span className="text-red-500">*</span></label>
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {finalConfig.categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remarks */}
          <div className="space-y-2 mt-3">
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <Textarea
              {...register('remarks')}
              placeholder="Enter Remarks"
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Attachment Section */}
          <div className="mt-3">
            <label className="block text-sm font-medium mb-3">Attachment <span className="text-red-500">*</span></label>
            <div
              className={`border-2 border-dashed border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-blue-50 cursor-pointer mb-3`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <UploadCloud className="w-7 h-7 p-1 text-gray-500 bg-gray-200 rounded-full" />
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Click to Upload
                </button>
                <span className="text-gray-500 text-sm"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                SVG, PNG, JPG, GIF or PDF (Maximum File Size 2 MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={finalConfig.allowedTypes?.map(type => `.${type}`).join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Staged Files List */}
          {stagedFiles.length > 0 && (
            <div className="space-y-3">
              {stagedFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between px-2 py-3 border rounded-lg bg-white">
                  <div className="flex items-center space-x-2">
                    {/* <div className="p-2 bg-red-100 rounded"> */}
                      <FileText className="w-8 h-8 text-red-500" />
                    {/* </div> */}
                    <div className='w-44'>
                      <p className="font-medium text-sm text-gray-900 truncate">{file.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })} at {new Date().toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: false 
                        })} • {(file.file.size / 1024 / 1024).toFixed(1)} Mb
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* <div className="p-1 bg-green-100 rounded-full"> */}
                      <CircleCheck  className="w-5 h-5 text-white" fill="green" />
                    {/* </div> */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStagedFile(file.id)}
                      className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleUploadSubmit}
            disabled={stagedFiles.length === 0 || !selectedCategory || isUploading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6"
          >
            {isUploading ? 'Uploading...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Right Panel - Uploaded Files List */}
      <div className='flex-1 pt-4'>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Total Attachments</span>
            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{uploadedFiles.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Search"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-3 h-10"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
            </div>
            <div className="relative">
              <button
                type="button"
                className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => setFilters(prev => ({ ...prev, showCategoryDropdown: !prev.showCategoryDropdown }))}
              >
                <Filter className="w-5 h-5 text-gray-500" />
              </button>
              {filters.showCategoryDropdown && (
                <div
                  tabIndex={-1}
                  onBlur={(e) => {
                    // Only close if focus leaves the dropdown and its children
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setFilters(prev => ({ ...prev, showCategoryDropdown: false }));
                    }
                  }}
                  className="absolute right-0 z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg"
                >
                  <div
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filters.selectedCategory === 'all' ? 'font-semibold text-blue-600' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, selectedCategory: 'all', showCategoryDropdown: false }))}
                    >
                      All Categories
                    </div>
                    {finalConfig.categories.map(category => (
                      <div
                        key={category}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filters.selectedCategory === category ? 'font-semibold text-blue-600' : ''}`}
                        onClick={() => setFilters(prev => ({ ...prev, selectedCategory: category, showCategoryDropdown: false }))}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                // </ClickAwayListener>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-0">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredFiles.map(file => {
                const extension = file.fileName.split('.').pop()?.toLowerCase();
                let iconColor = '';
                let iconBg = '';
                
                if (extension === 'pdf') {
                  iconColor = 'bg-red-100 text-red-600';
                  iconBg = 'bg-gray-100';
                } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
                  iconColor = 'text-orange-600';
                  iconBg = 'bg-orange-100';
                } else if (['xls', 'xlsx'].includes(extension || '')) {
                  iconColor = 'text-green-600';
                  iconBg = 'bg-green-100';
                } else if (['doc', 'docx'].includes(extension || '')) {
                  iconColor = 'text-blue-600';
                  iconBg = 'bg-blue-100';
                }

                const fileIcons: { [key: string]: JSX.Element } = {
                  pdf: <FileText className="text-red-500 w-6 h-6" />,
                  xls: <BookPlus className="text-green-500 w-6 h-6" />,
                  xlsx: <BookPlus className="text-green-500 w-6 h-6" />,
                  jpg: <FileImage className="text-orange-400 w-6 h-6" />,
                  jpeg: <FileImage className="text-orange-400 w-6 h-6" />,
                  png: <FileImage className="text-orange-400 w-6 h-6" />,
                  gif: <FileImage className="text-orange-400 w-6 h-6" />,
                  doc: <BookA className="text-blue-500 w-6 h-6" />,
                  docx: <BookA className="text-blue-500 w-6 h-6" />,
                };
                return (
                  <div key={file.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow bg-white">
                    <div className="flex items-start justify-between">
                      <div className='flex gap-2'>
                        <div className={`p-2 h-10 w-10 rounded ${iconBg}`}>
                          {fileIcons[extension]}
                          {/* {getFileIcon(file.fileName)} */}
                          {/* <span className={`sr-only ${iconColor}`}>File icon</span> */}
                        </div>
                        <div className="w-48">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{file.fileName}</h4>
                          <Badge variant="secondary" className="text-xs text-gray-400 p-0 bg-white hover:bg-white">
                            {file.category}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1">
                        <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicFileUpload;