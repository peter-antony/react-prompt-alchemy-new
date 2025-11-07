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
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    console.log("AttachmentData updated:", attachmentData);
    const attachmentList = jsonStore.getQuickOrder();
    setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });

  }, [attachmentData]);
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
        // formData.append('Remarks', file.remarks);
        console.log('FINAL ## FormData:', formData)
        
        // Add any additional context if needed
        // formData.append('QuickOrderID', '123455'); // You might want to get this from props or state
        // formData.append('ModeFlag', 'Insert');
        let FileJson: any = {};
        FileJson.Files = file.file || fileName;
        FileJson.Attachmenttype = fileType;
        FileJson.Attachname = fileName;
        FileJson.Filecategory = file.category;
        // FileJson.Remarks = file.remarks;
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
          Remarks:file.remarks,

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

        setTimeout(async () => {
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
        }, 500);
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

  const handleDelete = async (file: any) => {
    // Simulate API call
    console.log('Deleting %%%%file:', file);
     if(isResourceGroupAttchment && isResourceID){

     }else{
      console.log("Inside else-- delete file fom QUICKORDER")
      jsonStore.markAttachmentAsDeleted(file.id)
      //  jsonStore.deleteQuickOrderAttachmentById(file.id);
      console.log("FULL Plan JSON :: ", jsonStore.getQuickOrder());

       jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        // ...formValues.QuickOrder,
        "ModeFlag": "Update",
      });
      // const fullJson = jsonStore.getJsonData().ResponseResult.QuickOrder;
      const fullJson = jsonStore.getQuickOrder();
      console.log("FULL Plan JSON :: ", fullJson);

      setTimeout(async () => {
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
        const attachmentList = jsonStore.getQuickOrder();
        console.log("AFTER DELETE JSON STORE- AttachmetList: ",attachmentList?.Attachments?.[0])
       jsonStore.deleteQuickOrderAttachmentById(file.id);

        setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });
        setReloadKey(prev => prev + 1);
        // setAttachmentData(
        //   attachmentList?.Attachments?.[0]
        //     ? { ...attachmentList.Attachments[0] }  // clone
        //     : { AttachItems: [], TotalAttachment: 0 }
        // );
        })
      }, 1000);
     }
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Delete completed');
        resolve();
      }, 1000);
    });
  };

  // const handleDownload = async (file: any) => {
  //   try {
  //     const response = await fetch(file.downloadUrl);
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = file.fileName || "downloaded_file";
  //     document.body.appendChild(link);
  //     link.click();
  
  //     // Cleanup
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error downloading file:", error);
  //   }
  // };
// Paste this into your app and call handleDownload(file)
async function handleDownload(file) {
  try {
    // adjust headers/credentials if your API requires auth/cookies
    const resp = await fetch(file.downloadUrl, {
      credentials: 'include',
      // headers: { Authorization: `Bearer ${token}` },
    });

    console.log('HTTP status:', resp.status, resp.statusText);
    const contentType = resp.headers.get('content-type') || '';
    const contentDisp = resp.headers.get('content-disposition') || '';
    console.log('Content-Type:', contentType);
    console.log('Content-Disposition:', contentDisp);

    // peek at start of body to see if it's HTML or JSON (clone so we can still read blob)
    const peek = await resp.clone().text();
    console.log('Response body preview (first 300 chars):', peek.slice(0, 300));

    if (!resp.ok) {
      throw new Error(`Server returned ${resp.status}`);
    }

    // If server returned JSON containing base64 file data
    if (contentType.includes('application/json')) {
      const json = await resp.json();
      // try common fields where base64 might be found
      const b64 = json.base64 || json.data || json.file || json.fileBase64 || null;
      const mime = json.contentType || json.mime || 'application/octet-stream';
      if (!b64) throw new Error('JSON response but no base64 field found');

      // decode base64 -> blob
      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const filename = file.fileName || (json.fileName || 'downloaded_file');
      downloadBlob(blob, filename);
      return;
    }

    // Otherwise assume binary blob
    const blob = await resp.blob();
    console.log('Blob type:', blob.type, 'size:', blob.size);

    // Determine filename:
    let filename = file.fileName || 'downloaded_file';
    // try extract from content-disposition: e.g. attachment; filename="abc.pdf"
    const fnameFromHeader = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(contentDisp);
    if (fnameFromHeader) {
      filename = decodeURIComponent((fnameFromHeader[1] || fnameFromHeader[2] || fnameFromHeader[3] || '').trim());
    } else {
      // add extension based on blob.type if missing
      if (!filename.includes('.') && blob.type) {
        const ext = mimeToExt(blob.type);
        if (ext) filename = `${filename}.${ext}`;
      }
    }

    downloadBlob(blob, filename);
  } catch (err) {
    console.error('download error:', err);
  }
}

function downloadBlob(blob, filename = 'downloaded_file') {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  console.log('Downloaded as:', filename);
}

function mimeToExt(mime) {
  mime = (mime || '').toLowerCase();
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('zip')) return 'zip';
  if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('xlsx')) return 'xlsx';
  if (mime.includes('word') || mime.includes('msword') || mime.includes('doc')) return 'docx';
  return '';
}

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full pr-6 bg-[#f8fafd]">
      {/* Left Form */}
      
      {/* Main Component */}
      {loading ? 
        <DynamicFileUpload
          key={attachmentData?.TotalAttachment}  
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