import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Upload,
    FileSpreadsheet,
    Check,
    X,
    Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
    DynamicBulkUploadProps,
    BulkUploadFile
} from '@/types/BulkUpload';

export default function CustomBulkUpload({
    acceptedFileTypes = ['.csv', '.xlsx', '.xls'],
    maxFileSizeMB = 2,
    onUpload,
    onImportComplete,
    allowMultipleFiles = false,
    className,
    isOpen,
    onClose
}: DynamicBulkUploadProps) {
    const [files, setFiles] = useState<BulkUploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Reset function to clear all state
    const resetImportState = useCallback(() => {
        setFiles([]);
        setIsDragOver(false);
        setIsProcessing(false);
    }, []);

    // Reset state when dialog is opened
    React.useEffect(() => {
        console.log('CustomBulkUpload isOpen changed:', isOpen);
        if (isOpen) {
            resetImportState();
        }
    }, [isOpen, resetImportState]);

    // Custom close handler that resets state
    const handleClose = useCallback(() => {
        resetImportState();
        onClose();
    }, [resetImportState, onClose]);

    const handleFileUpload = useCallback(async (selectedFiles: FileList) => {
        const newFiles: BulkUploadFile[] = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            // Validate file type
            const isValidType = acceptedFileTypes.some(type =>
                file.name.toLowerCase().endsWith(type.replace('.', ''))
            );

            if (!isValidType) {
                alert(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
                continue;
            }

            // Validate file size
            if (file.size > maxFileSizeMB * 1024 * 1024) {
                alert(`File size exceeds ${maxFileSizeMB}MB limit`);
                continue;
            }

            if (!allowMultipleFiles && files.length > 0) {
                setFiles([]); // Replace existing file
            }

            const uploadFile: BulkUploadFile = {
                id: `${Date.now()}-${i}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date(),
                status: 'pending',
                progress: 0
            };

            newFiles.push(uploadFile);
        }

        setFiles(prev => [...prev, ...newFiles]);

        // Process files
        for (const uploadFile of newFiles) {
            await processFile(uploadFile);
        }
    }, [acceptedFileTypes, maxFileSizeMB, allowMultipleFiles, files.length]);

    const processFile = async (uploadFile: BulkUploadFile) => {
        try {
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 30 } : f
            ));

            // Read file content
            const data = await readFileData(uploadFile.file);

            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, progress: 60 } : f
            ));

            // Upload file
            const processedData = await onUpload(uploadFile.file);

            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    data: processedData || data
                } : f
            ));
        } catch (error) {
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, status: 'error', progress: 0 } : f
            ));
        }
    };

    const readFileData = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;

                    if (file.name.endsWith('.csv')) {
                        // Parse CSV
                        const text = data as string;
                        const lines = text.split('\n').filter(line => line.trim());
                        const headers = lines[0].split(',').map(h => h.trim());
                        const rows = lines.slice(1).map(line => {
                            const values = line.split(',').map(v => v.trim());
                            const row: any = {};
                            headers.forEach((header, index) => {
                                row[header] = values[index] || '';
                            });
                            return row;
                        });
                        resolve(rows);
                    } else {
                        // Parse Excel
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        resolve(jsonData);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
        });
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileUpload(droppedFiles);
        }
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    // Simplified upload handler - directly processes and uploads data then closes dialog
    const handleUploadData = async () => {
        if (files.length > 0 && files.every(f => f.status === 'completed')) {
            setIsProcessing(true);

            try {
                // Get all data from uploaded files
                const allData = files.flatMap(f => f.data || []);

                // Create summary object with the data
                const summary = {
                    totalRows: allData.length,
                    successCount: allData.length,
                    errorCount: 0,
                    duplicateCount: 0,
                    errors: [],
                    validRows: allData
                };

                // Pass the summary to the import handler
                await onImportComplete(summary);

                // Show success toast
                toast({
                    title: "Import Successful",
                    description: `Successfully imported ${allData.length} records.`,
                });

                // Close the dialog
                handleClose();
            } catch (error) {
                console.error('Failed to process data:', error);
                toast({
                    title: "Import Failed",
                    description: "There was an error processing your data. Please try again.",
                    variant: "destructive",
                });
                setIsProcessing(false);
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderUploadStep = () => (
        <div className="space-y-6">
            {/* Removed Download Template section */}

            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    "hover:border-primary/50 cursor-pointer"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                    <span className="text-primary">Click to Upload</span> or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">
                    {acceptedFileTypes.join(' or ')} (Maximum File Size {maxFileSizeMB} MB)
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFileTypes.join(',')}
                    multiple={allowMultipleFiles}
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                />
            </div>

            {files.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            Attached Files
                            <Badge variant="secondary">{files.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {files.map((file) => (
                                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                                        </p>
                                        {file.status === 'uploading' && (
                                            <Progress value={file.progress} className="mt-2" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {file.status === 'error' && (
                                            <Badge variant="destructive">
                                                <X className="h-3 w-3 mr-1" />
                                                Error
                                            </Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(file.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upload Button - processes data and closes dialog */}
                        {files.length > 0 && files.every(f => f.status === 'completed') && (
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={handleUploadData}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-300"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Upload
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // console.log('CustomBulkUpload rendering with isOpen:', isOpen);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={cn("max-w-4xl max-h-[90vh] z-50", className)} style={{ zIndex: 9999 }}>
                <DialogHeader>
                    <DialogTitle>Import Excel Data</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {renderUploadStep()}
                </div>
            </DialogContent>
        </Dialog>
    );
}