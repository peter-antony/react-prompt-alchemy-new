import React, { useState, useEffect } from "react";
import {
  Paperclip,
  Trash,
  CircleCheck,
  FileText,
  BookPlus,
  FileImage,
  BookA,
  UploadCloud,
  Search,
  Filter,
} from "lucide-react";
import { DynamicFileUpload } from "@/components/DynamicFileUpload";
import { StagedFile } from "@/types/fileUpload";
import jsonStore from "@/stores/jsonStore";
import { quickOrderService } from "@/api/services/quickOrderService";
import { tripService } from "@/api/services";
import { useSearchParams } from "react-router-dom";
import { API_CONFIG, API_ENDPOINTS } from "@/api/config";

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
  tripId?:any;
  isEditQuickOrder?: boolean;
  isResourceGroupAttchment?: boolean;
  isResourceID?: any;
  onAttachmentsUpdate?: () => void;
}

const Attachments = ({
  isTripLogAttachments,
  tripId,
  isEditQuickOrder,
  isResourceGroupAttchment,
  isResourceID,
  onAttachmentsUpdate
}: NewAttachmentGroupProps) => {
  // export default function Attachments() {
  const [fileCategory, setFileCategory] = useState([]);
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
  const [uniqueName, setUniqueName] = useState(
    "2362e1a23a5a49f99c077072b7f0f8b9.png"
  );

  const fetchData = async (messageType) => {
    const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType});
    const parsedData:any=JSON.parse(data?.data?.ResponseData);
    console.log("Parsed Category: ",parsedData)
    const idArray = parsedData.filter(item => item.id !== null && item.id !== "" && item.id !== undefined)
    .map(item => item.id);
    setFileCategory(idArray);

  }
  useEffect(() => {
    setLoading(false);
    // if(tripUniqueID==undefined || tripUniqueID==null || tripUniqueID==''){
    //   tripUniqueID=tripId;
    // }
    const fetchLegBehaviours = fetchData("Attachment File Category Init");
   console.log("fetchLegBehaviours = ",fetchLegBehaviours)
    console.log("isResourceGroupAttchment", isResourceGroupAttchment);
    console.log("isResourceID", isResourceID);
    getAttachments();
    if (isResourceGroupAttchment && isResourceID) {
      // Get attachment data from specific ResourceGroup using ResourceUniqueID
      console.log(
        "Loading attachments for ResourceGroup with ID:",
        isResourceID
      );
      const resourceGroupAttachmentData =
        jsonStore.getResourceGroupAttachmentDataByUniqueID(isResourceID);
      console.log(
        "ResourceGroup attachment data:",
        resourceGroupAttachmentData
      );
      setAttachmentData(resourceGroupAttachmentData);
    } else {
      // Get attachment data from QuickOrder level
      const attachmentList = jsonStore.getQuickOrder();
      console.log(
        "QuickOrder attachment data:",
        attachmentList?.Attachments?.[0]
      );
      setAttachmentData(
        attachmentList?.Attachments?.[0] || {
          AttachItems: [],
          TotalAttachment: 0,
        }
      );
    }

    // setLoading(true);
  }, [isResourceGroupAttchment, isResourceID]);

  const getAttachments = async () => {
    let id=tripUniqueID?tripUniqueID:tripId;
    const response = await tripService.getAttachments(id);
    const res: any = response.data;
    console.log("GET ALL ATTACHMENTS : ", response.data);
    setLoading(true);
    const parsedData = JSON.parse(res?.ResponseData) || [];
    console.log("GET ALL ATTACHMENTS 3 : ", JSON.parse(res?.ResponseData));
    console.log(
      "GET ALL ATTACHMENTS parsedDataparsedDataparsedData : ",
      parsedData
    );

    setAttachmentData(parsedData || { AttachItems: [], TotalAttachment: 0 });
    setReloadKey((prev) => prev + 1);
    // set({ tripList: response.data, loading: false });
  };
  const handleUpload = async (files: StagedFile[]) => {

    try {
      for (const file of files) {
        const fileName = file.file?.name || "";
        const fileType = fileName.split(".").pop()?.toLowerCase() || "";
        const formData = new FormData();
        formData.append("Files", file.file);
        formData.append("Attachmenttype", fileType);
        formData.append("Attachname", fileName);
        formData.append("Filecategory", file.category);
        // formData.append("Attachuniquename", file.Attachuniquename);
        console.log(formData);
        const data: any =
          await quickOrderService.updateAttachmentQuickOrderResource(formData);
        console.log("FIRST UPDATE RESPONSE :", data)
        // Send to API with FormData containing binary file
        const uploadedFiles = {
          AttachItemID: -1,
          ModeFlag: "Insert",
          AttachmentType: data.data.AttachmentType,
          FileCategory: data.data.FileCategory,
          AttachName: data.data.AttachName,
          AttachUniqueName: data.data.AttachUniqueName,
          AttachRelPath: data.data.AttachRelPath,
          Remarks: file.remarks,
        };



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
          AttachmentType: uploadedFiles.AttachName,
          AttachName: uploadedFiles.AttachName,
          FileCategory: uploadedFiles.FileCategory,
          AttachItemID: "",
          AttachUniqueName: uploadedFiles.AttachUniqueName,
          AttachRelPath: uploadedFiles.AttachRelPath,
          Remarks: uploadedFiles.Remarks,
          ModeFlag: "Insert",
        };

        console.log("df");
        console.log("Final FormData:", fileData);
        console.log("Uploading file with FormData:", {
          fileName,
          fileType,
          category: file.category,
          fileSize: file.file?.size,
        });

        // Send to API with FormData containing binary file
        const response: any = await tripService.saveAttachments(
          fileData,
          tripUniqueID?tripUniqueID:tripId
        );
        console.log("Upload Trip attachments response:", response);
        console.log("Upload Trip attachments response:", response);
        getAttachments();
        if (onAttachmentsUpdate) {
          onAttachmentsUpdate();
        }


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
        console.log("Upload completed");
        resolve();
      }, 1000);
    });
  };

  const handleDelete = async (fileId: any) => {
    // Simulate API call
    console.log("Deleting TripLog file:", fileId);
    console.log(
      "isTripLogAttachments IN TRIPLOG ATTACHMENT:",
      isTripLogAttachments
    );
    const fileData = {
      AttachmentType: fileId.fileName,
      AttachName: fileId.fileName,
      FileCategory: fileId.category,
      AttachItemID: fileId.id,
      AttachUniqueName: fileId.AttachUniqueName,
      AttachRelPath: fileId.downloadUrl,
      Remarks: fileId.remarks,
      ModeFlag: "Delete",
    };
    console.log("fileData for delete : ", fileData);
    const response: any = await tripService.saveAttachments(
      fileData,
      tripUniqueID?tripUniqueID:tripId
    );
    const responseData = response as any;
    if (responseData && responseData.data) {
      console.log("TRIPLOG FILE DELETE RESPONSE : ", response);
      getAttachments();
      console.log("TRIPLOG FILE DELETE RESPONSE : ", response);
      getAttachments();
      if (onAttachmentsUpdate) {
        onAttachmentsUpdate();
      }
      // setReloadKey(prev => prev + 1);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("Delete completed");
          resolve();
        }, 1000);
      });
    }
  };

 
  // Inside Attachment.tsx (can be inside the component as const function)
  async function handleDownload(file): Promise<{ blob: Blob; filename: string }> {
    console.log("📦 Download request started...");
    console.log("➡️ File object received:", file);

    try {
      const formData = new FormData();

      // ✅ Correct fields
      formData.append("Filecategory", file.category);
      formData.append("Filename", file.AttachUniqueName);
      const bodyData = {
        filecategory: file.category,
        filename: file.AttachUniqueName,
      };
      const resp1: any = await quickOrderService.downloadAttachmentQuickOrder(bodyData)
      console.log("➡️ FormData sent:", formData);
      // const token = JSON.parse(localStorage.getItem('token') || '{}');
      // const resp = await fetch(`${API_CONFIG.BASE_URL+API_ENDPOINTS.TRIPS.FILE_UPDATEDOWN}`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token.access_token}`,
      //     Accept: "application/json",
      //     Is_JSON_Format: "true",
      //   },
      //   body: formData,
      // });

      // console.log("🌐 HTTP status:", resp.status, resp.statusText);

      // if (!resp.ok) throw new Error(`Server returned ${resp.status}`);

      // const contentType = resp.headers.get("content-type") || "";
      // console.log("📑 Content-Type:", contentType);
      console.log("RESP 2222:", resp1);
      let blob: Blob;
      let filename = file.fileName || "downloaded_file";

      // if (contentType.includes("application/json")) {
      //   const json = await resp.json();
      //   console.log("🧾 JSON response:", json);

      //   if (!json.FileData) {
      //     throw new Error("⚠️ FileData is null — backend did not return actual file data");
      //   }

      const b64 = resp1.data.FileData;
      // const mime = resp1.ContentType || "application/octet-stream";
      const mime =  getMimeType(resp1.data.FileName);
      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++)
        byteNumbers[i] = byteChars.charCodeAt(i);

      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: mime });

      filename = filename;
      // } else {
      //   blob = await resp.blob();
      // }

      console.log("✅ File ready:", { filename, blobType: blob.type, size: blob.size });

      return { blob, filename };
    } catch (err) {
      console.error("❌ Download failed:", err);
      throw err;
    }
  }
 
  function getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
      case "pdf": return "application/pdf";
      case "xls": return "application/vnd.ms-excel";
      case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "csv": return "text/csv";
      case "jpg":
      case "jpeg": return "image/jpeg";
      case "png": return "image/png";
      case "txt": return "text/plain";
      case "doc": return "application/msword";
      case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      default: return "application/octet-stream"; // fallback
    }
  }



  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full pr-6 bg-[#f8fafd]">
      {/* Left Form */}

      {/* Main Component */}
      {loading && attachmentData ? (
        <DynamicFileUpload
          // key={attachmentData?.TotalAttachment}
          key={reloadKey}
          config={{
            // categories: ["BR Amendment", "Invoice", "Contract", "Other"],
            categories: fileCategory,
            maxFiles: 10,
            maxFileSizeMB: 2,
            allowedTypes: [
              "pdf",
              "jpg",
              "jpeg",
              "png",
              "gif",
              "svg",
              "xls",
              "xlsx",
              "doc",
              "docx",
            ],
          }}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onDownload={handleDownload}
          className="max-w-4xl mx-auto"
          isTripLogAttachments={true}
          // isEditQuickOrder={isEditQuickOrder}
          // isResourceGroupAttchment={isResourceGroupAttchment}
          loadAttachmentData={attachmentData}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default Attachments;
