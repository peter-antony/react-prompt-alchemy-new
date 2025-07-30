import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicFileUpload } from '@/components/DynamicFileUpload';
import { StagedFile } from '@/types/fileUpload';

const FileUploadDemo: React.FC = () => {
  const handleUpload = async (files: StagedFile[]) => {
    // Simulate API call
    console.log('Uploading files:', files);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Upload completed');
        resolve();
      }, 2000);
    });
  };

  const handleDelete = async (fileId: string) => {
    // Simulate API call
    console.log('Deleting file:', fileId);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Delete completed');
        resolve();
      }, 1000);
    });
  };

  const handleDownload = (file: any) => {
    console.log('Downloading file:', file);
    // Simulate file download
    window.open(file.downloadUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Dynamic File Upload Component</h1>
        <p className="text-muted-foreground">
          A comprehensive file upload solution for ERP applications
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Drag & Drop</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Intuitive file selection with drag and drop support
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">File Categorization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Organize files by category for better management
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">File Staging</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Preview and review files before uploading
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Smart Filtering</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Search and filter uploaded files efficiently
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Component */}
      <DynamicFileUpload
        config={{
          categories: ['BR Amendment', 'Invoice', 'Contract', 'Other'],
          maxFiles: 10,
          maxFileSizeMB: 2,
          allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'xls', 'xlsx', 'doc', 'docx']
        }}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onDownload={handleDownload}
        className="max-w-4xl mx-auto"
      />

      {/* Usage Instructions */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Upload Process</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Select a file category from the dropdown</li>
                <li>Add optional remarks for context</li>
                <li>Drag files or click to browse and select</li>
                <li>Review staged files in the preview area</li>
                <li>Click "Save" to upload all files</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">File Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Search files by name</li>
                <li>Filter by category or file type</li>
                <li>Download, view, or delete files</li>
                <li>View upload date and remarks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadDemo;