import React, { useState, useEffect } from "react";
import { Paperclip, Trash, CircleCheck, FileText, BookPlus, FileImage, BookA, UploadCloud, Search, Filter } from "lucide-react";
import { DynamicFileUpload } from '@/components/DynamicFileUpload';
import { StagedFile } from '@/types/fileUpload';
import jsonStore from '@/stores/jsonStore';
import { quickOrderService } from "@/api/services/quickOrderService";
import { tripService } from "@/api/services";
import { useSearchParams } from "react-router-dom";

const fileIcons = {
    pdf: <FileText className="text-red-500 w-6 h-6" />,
    xls: <BookPlus className="text-green-500 w-6 h-6" />,
    jpg: <FileImage className="text-orange-400 w-6 h-6" />,
    doc: <BookA className="text-blue-500 w-6 h-6" />,
};

const mockAttachments = [
    { name: "Booking Request.jpg", type: "jpg", category: "BR Amendment" },
    { name: "Booking Request.xls", type: "xls", category: "BR Amendment" },
    { name: "Booking Request.xls", type: "xls", category: "BR Amendment" },
    { name: "Booking Request.doc", type: "doc", category: "BR Amendment" },
];

interface NewAttachmentGroupProps {
    isTripLogAttachments?: boolean;
    isEditQuickOrder?: boolean;
    isResourceGroupAttchment?: boolean;
    isResourceID?: any;
}

const Attachments = ({ isTripLogAttachments, isEditQuickOrder, isResourceGroupAttchment, isResourceID }: NewAttachmentGroupProps) => {
    // export default function Attachments() {
    const [fileCategory, setFileCategory] = useState("BR Ammend");
    const [remarks, setRemarks] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [uploadedFile, setUploadedFile] = useState({
        name: "Routine Check.pdf",
        type: "pdf",
        date: "20 Sep, 2023 at 11:30",
        size: "1.5 Mb",
        status: "success",
    });
    const [attachmentData, setAttachmentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const isEditTrip = !!searchParams.get("id");
    const tripUniqueID = searchParams.get("id");

    useEffect(() => {
        setLoading(false);
        console.log("isResourceGroupAttchment", isResourceGroupAttchment);
        console.log("isResourceID", isResourceID);
        getAttachments();
        if (isResourceGroupAttchment && isResourceID) {
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

        // setLoading(true);
    }, [isResourceGroupAttchment, isResourceID]);

    const getAttachments = async () => {
        const response = await tripService.getAttachments(tripUniqueID);
        const res = response.data;
        console.log("GET ALL ATTACHMENTS : ", response.data)
        setLoading(true);
        const parsedData = JSON.parse(res?.ResponseData) || [];
        console.log("GET ALL ATTACHMENTS : ", JSON.parse(res?.ResponseData))

        setAttachmentData(parsedData || { AttachItems: [], TotalAttachment: 0 });
        setReloadKey(prev => prev + 1);
        // set({ tripList: response.data, loading: false });
    }
    const handleUpload = async (files: StagedFile[]) => {
        // Simulate API call
        console.log('Uploading files:i trip attachment page', files);

        try {
            for (const file of files) {
                // Get file type from file.file.name (extension after last dot)
                const fileName = file.file?.name || '';
                const fileType = fileName.split('.').pop()?.toLowerCase() || '';

                // Create FormData to send binary file data
                const formData = new FormData();
                console.log("File.file : ", file.file)
                // Add the actual file as binary data
                if (file.file) {
                    formData.append('Files', file.file, fileName);
                }
                // Add other metadata
                formData.append('Attachmenttype', fileType);
                formData.append('Attachname', fileName);
                formData.append('Filecategory', file.category);
                formData.append('Remarks', file.remarks);
                console.log('FINAL ## FormData:', formData)

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
                const uploadedFiles = {
                    AttachItemID: -1,
                    ModeFlag: "Insert",
                    AttachmentType: data.Attachmenttype,
                    FileCategory: data.Filecategory,
                    AttachName: data.Attachname,
                    AttachUniqueName: data.Attachuniquename,
                    AttachRelPath: data.Attachrelpath,
                    Remarks:file.remarks,
                };
                console.log("uploadedFiles ZASASA", uploadedFiles);

                // Add other metadata
                formData.append("AttachmentType", uploadedFiles.AttachName);
                formData.append("AttachName", uploadedFiles.AttachName);
                formData.append("FileCategory", uploadedFiles.FileCategory);
                formData.append("AttachItemID", "");
                formData.append("AttachUniqueName", uploadedFiles.AttachUniqueName);
                formData.append("AttachRelPath", uploadedFiles.AttachRelPath); // optional: check if it's a file or just path
                formData.append("Remarks", uploadedFiles.Remarks);
                formData.append("ModeFlag", "Insert");
                const fileData = {
                    "AttachmentType": uploadedFiles.AttachName,
                    "AttachName": uploadedFiles.AttachName,
                    "FileCategory": uploadedFiles.FileCategory,
                    "AttachItemID": "",
                    "AttachUniqueName": uploadedFiles.AttachUniqueName,
                    "AttachRelPath": uploadedFiles.AttachRelPath,
                    "Remarks": uploadedFiles.Remarks,
                    "ModeFlag": "Insert"


                }
                console.log('Final FormData:', fileData);
                console.log('Uploading file with FormData:', {
                    fileName,
                    fileType,
                    category: file.category,
                    fileSize: file.file?.size
                });

                // Send to API with FormData containing binary file
                const response: any = await tripService.saveAttachments(fileData, tripUniqueID);
                console.log("Upload Trip attachments response:", response);
                // const uploadedFiles = {
                //     AttachItemID: -1,
                //     ModeFlag: "Insert",
                //     AttachmentType: data.Attachmenttype,
                //     FileCategory: data.Filecategory,
                //     AttachName: data.Attachname,
                //     AttachUniqueName: data.Attachuniquename,
                //     AttachRelPath: data.Attachrelpath,
                // };
                // console.log("uploadedFilesVV77", uploadedFiles);
                // console.log("isResourceGroupAttchment", isResourceGroupAttchment);
                // if (isResourceGroupAttchment) {
                //     console.log("if");
                //     jsonStore.pushResourceGroupAttachmentsByUniqueID(isResourceID, uploadedFiles);
                //     // Refresh attachment data for ResourceGroup
                //     const updatedResourceGroupAttachmentData = jsonStore.getResourceGroupAttachmentDataByUniqueID(isResourceID);
                //     setAttachmentData(updatedResourceGroupAttachmentData);
                // } else {
                //     console.log("else");
                //     jsonStore.pushQuickOrderAttachment(uploadedFiles);
                //     // Refresh attachment data for QuickOrder
                //     const attachmentList = jsonStore.getQuickOrder();
                //     setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });
                // }



                // setTimeout(async () => {
                //     const dataRes: any = await quickOrderService.updateQuickOrderAttachment(fullJson);
                //     console.log(" try", dataRes);
                //     //  Get OrderNumber from response
                //     const resourceGroupID = JSON.parse(dataRes?.data?.ResponseData)[0].QuickUniqueID;
                //     console.log("OrderNumber:", resourceGroupID);
                //     //  Fetch the full quick order details
                //     quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
                //         let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
                //         console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
                //         console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
                //         // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
                //         jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);

                //     })
                // }, 500);
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

    const handleDelete = async (fileId: any) => {
        // Simulate API call
        console.log('Deleting TripLog file:', fileId);
        console.log("isTripLogAttachments IN TRIPLOG ATTACHMENT:", isTripLogAttachments);
        const fileData = {
            "AttachmentType": fileId.fileName,
            "AttachName": fileId.fileName,
            "FileCategory": fileId.category,
            "AttachItemID": fileId.id,
            "AttachUniqueName": fileId.AttachUniqueName,
            "AttachRelPath": fileId.downloadUrl,
            "Remarks": fileId.remarks,
            "ModeFlag": "Delete"


        }
        console.log("fileData for delete : ",fileData)
        const response: any = await tripService.saveAttachments(fileData, tripUniqueID);
        const responseData = response as any;
        if (responseData && responseData.data) {
            console.log("TRIPLOG FILE DELETE RESPONSE : ",response)
            getAttachments();
            // setReloadKey(prev => prev + 1);
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    console.log('Delete completed');
                    resolve();
                }, 1000);
            });
        }
    };

    const handleDownload = async (file: any) => {
        try {
          const response = await fetch(file.downloadUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
      
          const link = document.createElement("a");
          link.href = url;
          link.download = file.fileName || "downloaded_file";
          document.body.appendChild(link);
          link.click();
      
          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error downloading file:", error);
        }
      };

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full h-full pr-6 bg-[#f8fafd]">
            {/* Left Form */}

            {/* Main Component */}
            {loading && attachmentData ?
                <DynamicFileUpload
                    // key={attachmentData?.TotalAttachment} 
                    key={reloadKey} 
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
                    isTripLogAttachments={true}
                    // isEditQuickOrder={isEditQuickOrder}
                    // isResourceGroupAttchment={isResourceGroupAttchment}
                    loadAttachmentData={attachmentData}
                /> : ''
            }

        </div>
    );
}

export default Attachments;