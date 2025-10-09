import React, { useState, useEffect } from "react";
import { Paperclip, Trash , CircleCheck, FileText, BookPlus , FileImage , BookA , UploadCloud, Search, Filter } from "lucide-react";
import { DynamicFileUpload } from '@/components/DynamicFileUpload';
import { StagedFile } from '@/types/fileUpload';
import jsonStore from '@/stores/jsonStore';
import { quickOrderService } from "@/api/services/quickOrderService";

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
  isResourceID?: any;
}

const Attachments = ({ isEditQuickOrder, isResourceGroupAttchment, isResourceID }: NewAttachmentGroupProps) => {
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
  const [attachmentData, setAttachmentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    console.log("isResourceGroupAttchment", isResourceGroupAttchment);
    console.log("isResourceID", isResourceID);
    
    if(isResourceGroupAttchment && isResourceID){
      // Get attachment data from specific ResourceGroup using ResourceUniqueID
      console.log("Loading attachments for ResourceGroup with ID:", isResourceID);
      const resourceGroupAttachmentData = jsonStore.getResourceGroupAttachmentDataByUniqueID(isResourceID);
      console.log("ResourceGroup attachment data:", resourceGroupAttachmentData);
      setAttachmentData(resourceGroupAttachmentData);
    } else {
      // Get attachment data from QuickOrder level
      const attachmentList = jsonStore.getQuickOrder();
      console.log("QuickOrder attachment data:", attachmentList?.Attachments?.[0]);
      setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });
    }
    
    setLoading(true);
  }, [isResourceGroupAttchment, isResourceID]);

  // const handleUpload = async (files: StagedFile[]) => {
  //   // Simulate API call
  //   console.log('Uploading files:', files);
  //   const AttachItems = files.map((file) => {
  //     // Get file type from file.file.name (extension after last dot)
  //     const fileName = file.file?.name || '';
  //     const fileType = fileName.split('.').pop()?.toLowerCase() || '';
  //       const obj= {
  //       AttachItemID: -1,
  //       AttachmentType: fileType,
  //       FileCategory: file.category,
  //       AttachName: fileName,
  //       AttachUniqueName: fileName,
  //       AttachRelPath: "value",
  //       ModeFlag: "Insert"
  //     };
  //     jsonStore.pushQuickOrderAttachment(obj)
  //     return obj
  //   });
  //   console.log('AttachItems:', AttachItems);
  //   // if(isResourceGroupAttchment){
  //   //   jsonStore.pushResourceGroupAttachments(AttachItems[0]);
  //   // }else{
  //   //   jsonStore.pushAttachments(AttachItems[0]);
  //   // }
  //   console.log('get saved List:', jsonStore.getAttachments());
  //   jsonStore.setQuickOrder({
  //     ...jsonStore.getJsonData().quickOrder,
  //     // ...formValues.QuickOrder,
  //     "ModeFlag": "Update",
  //     "Status": "Fresh",
  //     "QuickOrderNo": jsonStore.getQuickUniqueID()
  //   });
  //   const fullJson = jsonStore.getJsonData().ResponseResult.QuickOrder;
  //   console.log("FULL Plan JSON :: ", fullJson);
  //   try {
  //     // const data: any = await quickOrderService.updateAttachmentQuickOrderResource(fullJson, { headers });
  //     const data: any = await quickOrderService.updateAttachmentQuickOrderResource(fullJson);
  //     console.log(" try", data);
  //     //  Get OrderNumber from response
  //     const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
  //     console.log("OrderNumber:", resourceGroupID);
  //     //  Fetch the full quick order details
  //     quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
  //       let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
  //       console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
  //       console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
  //       // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
  //       jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);

  //       // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
  //       const fullJson2 = jsonStore.getJsonData();
  //       console.log("ATTACHMENTS SAVE SAVE --- FULL JSON 66:: ", fullJson2);
  //     })

  //   } catch (err) {
  //     console.log(" catch", err);
  //     // setError(`Error fetching API data for Update ResourceGroup`);
  //   }

  //   return new Promise<void>((resolve) => {
  //     setTimeout(() => {
  //       console.log('Upload completed');
  //       resolve();
  //     }, 2000);
  //   });
  // };

  const handleUpload = async (files: StagedFile[]) => {
    // Simulate API call
    console.log('Uploading files:', files);
    
    try {
      for (const file of files) {
        // Get file type from file.file.name (extension after last dot)
        const fileName = file.file?.name || '';
        const fileType = fileName.split('.').pop()?.toLowerCase() || '';
        
        // Create FormData to send binary file data
        const formData = new FormData();
        
        // Add the actual file as binary data
        if (file.file) {
          formData.append('Files', file.file, fileName);
        }
        
        // Add other metadata
        formData.append('Attachmenttype', fileType);
        formData.append('Attachname', fileName);
        formData.append('Filecategory', file.category);
        
        // Add any additional context if needed
        // formData.append('QuickOrderID', '123455'); // You might want to get this from props or state
        // formData.append('ModeFlag', 'Insert');
        
        console.log('Uploading file with FormData:', {
          fileName,
          fileType,
          category: file.category,
          fileSize: file.file?.size
        });
        
        // Send to API with FormData containing binary file
        const data: any = await quickOrderService.updateAttachmentQuickOrderResource(formData);
        console.log("Upload response:", data);
        const uploadedFiles= {
          AttachItemID: -1,
          ModeFlag: "Insert",
          AttachmentType: data.Attachmenttype,
          FileCategory: data.Filecategory,
          AttachName: data.Attachname,
          AttachUniqueName: data.Attachuniquename,
          AttachRelPath: data.Attachrelpath,
        };
        console.log("uploadedFiles", uploadedFiles);
        console.log("isResourceGroupAttchment", isResourceGroupAttchment);
        if(isResourceGroupAttchment){
          console.log("if");
          jsonStore.pushResourceGroupAttachmentsByUniqueID(isResourceID, uploadedFiles);
          // Refresh attachment data for ResourceGroup
          const updatedResourceGroupAttachmentData = jsonStore.getResourceGroupAttachmentDataByUniqueID(isResourceID);
          setAttachmentData(updatedResourceGroupAttachmentData);
        }else{
          console.log("else");
          jsonStore.pushQuickOrderAttachment(uploadedFiles);
          // Refresh attachment data for QuickOrder
          const attachmentList = jsonStore.getQuickOrder();
          setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });
        }

        console.log('get saved List:', jsonStore.getAttachments());
        jsonStore.setQuickOrder({
          ...jsonStore.getJsonData().quickOrder,
          // ...formValues.QuickOrder,
          "ModeFlag": "Update",
        });
        // const fullJson = jsonStore.getJsonData().ResponseResult.QuickOrder;
        const fullJson = jsonStore.getQuickOrder();
        console.log("FULL Plan JSON :: ", fullJson);

        const dataRes: any = await quickOrderService.updateQuickOrderAttachment(fullJson);
        console.log(" try", dataRes);
        //  Get OrderNumber from response
        const resourceGroupID = JSON.parse(dataRes?.data?.ResponseData)[0].QuickUniqueID;
        console.log("OrderNumber:", resourceGroupID);
        //  Fetch the full quick order details
        quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
          let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
          console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
          console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
          // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
          jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);

        })
      }
      
    } catch (err) {
      console.log("Upload error:", err);
      // setError(`Error uploading file`);
    }

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Upload completed');
        resolve();
      }, 1000);
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
      {loading ? 
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
          loadAttachmentData = {attachmentData}
        /> : ''
      }

    </div>
  );
}

export default Attachments;