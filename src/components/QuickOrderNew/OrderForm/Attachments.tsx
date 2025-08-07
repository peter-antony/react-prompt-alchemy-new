import React, { useState, useEffect } from "react";
import { Paperclip, Trash , CircleCheck, FileText, BookPlus , FileImage , BookA , UploadCloud, Search, Filter } from "lucide-react";
import { DynamicFileUpload } from '@/components/DynamicFileUpload';
import { StagedFile } from '@/types/fileUpload';
import jsonStore from '@/stores/jsonStore';

const fileIcons = {
  pdf: <FileText className="text-red-500 w-6 h-6" />,
  xls: <BookPlus  className="text-green-500 w-6 h-6" />,
  jpg: <FileImage  className="text-orange-400 w-6 h-6" />,
  doc: <BookA  className="text-blue-500 w-6 h-6" />,
};

const mockAttachments = [
  { name: "Booking Request.jpg", type: "jpg", category: "BR Amendment" },
  { name: "Booking Request.xls", type: "xls", category: "BR Amendment" },
  { name: "Booking Request.xls", type: "xls", category: "BR Amendment" },
  { name: "Booking Request.doc", type: "doc", category: "BR Amendment" },
];

interface NewAttachmentGroupProps {
  isEditQuickOrder?: boolean;
  isResourceGroupAttchment?: boolean;
}

const Attachments = ({ isEditQuickOrder, isResourceGroupAttchment }: NewAttachmentGroupProps) => {
// export default function Attachments() {
  const [fileCategory, setFileCategory] = useState("BR Ammend");
  const [remarks, setRemarks] = useState("");
  const [uploadedFile, setUploadedFile] = useState({
    name: "Routine Check.pdf",
    type: "pdf",
    date: "20 Sep, 2023 at 11:30",
    size: "1.5 Mb",
    status: "success",
  });

  const handleUpload = async (files: StagedFile[]) => {
    // Simulate API call
    console.log('Uploading files:', files);
    const AttachItems = files.map((file) => {
      // Get file type from file.file.name (extension after last dot)
      const fileName = file.file?.name || '';
      const fileType = fileName.split('.').pop()?.toLowerCase() || '';
      return {
        AttachItemID: file.id,
        AttachmentType: fileType,
        FileCategory: file.category,
        AttachName: fileName,
        AttachUniqueName: fileName,
      };
    });
    console.log('AttachItems:', AttachItems);
    if(isResourceGroupAttchment){
      jsonStore.pushResourceGroupAttachments(AttachItems[0]);
    }else{
      jsonStore.pushAttachments(AttachItems[0]);
    }
    console.log('get saved List:', jsonStore.getAttachments());

    const fullJson = jsonStore.getJsonData();
    console.log("FULL Plan JSON :: ", fullJson);

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
    <div className="flex flex-col md:flex-row gap-6 w-full h-full pr-6 bg-[#f8fafd]">
      {/* Left Form */}
      
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
        isEditQuickOrder={isEditQuickOrder}
        isResourceGroupAttchment={isResourceGroupAttchment}
      />

    </div>
  );
}

export default Attachments;