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
  isEditQuickOrder?: boolean;
  isResourceGroupAttchment?: boolean;
  isResourceID?: any;
}

const Attachments = ({
  isTripLogAttachments,
  isEditQuickOrder,
  isResourceGroupAttchment,
  isResourceID,
}: NewAttachmentGroupProps) => {
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
  const [uniqueName, setUniqueName] = useState(
    "2362e1a23a5a49f99c077072b7f0f8b9.png"
  );

  useEffect(() => {
    setLoading(false);
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
    const response = await tripService.getAttachments(tripUniqueID);
    const res : any= response.data;
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
        formData.append("AttachmentType", fileType);
        formData.append("AttachName", fileName);
        formData.append("FileCategory", file.category);
        formData.append("Attachuniquename", file.Attachuniquename);
        console.log(formData);
        const data: any =
          await quickOrderService.updateAttachmentQuickOrderResource(formData);

        // Send to API with FormData containing binary file
        const uploadedFiles = {
          AttachItemID: -1,
          ModeFlag: "Insert",
          AttachmentType: data.Attachmenttype,
          FileCategory: data.Filecategory,
          AttachName: data.Attachname,
          AttachUniqueName: data.Attachuniquename,
          AttachRelPath: data.Attachrelpath,
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
          tripUniqueID
        );
        console.log("Upload Trip attachments response:", response);
        getAttachments();

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
      tripUniqueID
    );
    const responseData = response as any;
    if (responseData && responseData.data) {
      console.log("TRIPLOG FILE DELETE RESPONSE : ", response);
      getAttachments();
      // setReloadKey(prev => prev + 1);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("Delete completed");
          resolve();
        }, 1000);
      });
    }
  };

  // const handleDownload = async (file: any) => {
  //     try {
  //       const response = await fetch(file.downloadUrl);
  //       const blob = await response.blob();
  //       const url = window.URL.createObjectURL(blob);

  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.download = file.fileName || "downloaded_file";
  //       document.body.appendChild(link);
  //       link.click();

  //       // Cleanup
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(url);
  //     } catch (error) {
  //       console.error("Error downloading file:", error);
  //     }
  //   };
  // async function handleDownload(file) {
  //     try {
  //         // adjust headers/credentials if your API requires auth/cookies
  //         const resp = await fetch(file.downloadUrl, {
  //             credentials: 'include',
  //             // headers: { Authorization: `Bearer ${token}` },
  //         });

  //         console.log('HTTP status:', resp.status, resp.statusText);
  //         const contentType = resp.headers.get('content-type') || '';
  //         const contentDisp = resp.headers.get('content-disposition') || '';
  //         console.log('Content-Type:', contentType);
  //         console.log('Content-Disposition:', contentDisp);

  //         // peek at start of body to see if it's HTML or JSON (clone so we can still read blob)
  //         const peek = await resp.clone().text();
  //         console.log('Response body preview (first 300 chars):', peek.slice(0, 300));

  //         if (!resp.ok) {
  //             throw new Error(`Server returned ${resp.status}`);
  //         }

  //         // If server returned JSON containing base64 file data
  //         if (contentType.includes('application/json')) {
  //             const json = await resp.json();
  //             // try common fields where base64 might be found
  //             const b64 = json.base64 || json.data || json.file || json.fileBase64 || null;
  //             const mime = json.contentType || json.mime || 'application/octet-stream';
  //             if (!b64) throw new Error('JSON response but no base64 field found');

  //             // decode base64 -> blob
  //             const byteChars = atob(b64);
  //             const byteNumbers = new Array(byteChars.length);
  //             for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  //             const byteArray = new Uint8Array(byteNumbers);
  //             const blob = new Blob([byteArray], { type: mime });
  //             const filename = file.fileName || (json.fileName || 'downloaded_file');
  //             downloadBlob(blob, filename);
  //             return;
  //         }

  //         // Otherwise assume binary blob
  //         const blob = await resp.blob();
  //         console.log('Blob type:', blob.type, 'size:', blob.size);

  //         // Determine filename:
  //         let filename = file.fileName || 'downloaded_file';
  //         // try extract from content-disposition: e.g. attachment; filename="abc.pdf"
  //         const fnameFromHeader = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(contentDisp);
  //         if (fnameFromHeader) {
  //             filename = decodeURIComponent((fnameFromHeader[1] || fnameFromHeader[2] || fnameFromHeader[3] || '').trim());
  //         } else {
  //             // add extension based on blob.type if missing
  //             if (!filename.includes('.') && blob.type) {
  //                 const ext = mimeToExt(blob.type);
  //                 if (ext) filename = `${filename}.${ext}`;
  //             }
  //         }

  //         downloadBlob(blob, filename);
  //     } catch (err) {
  //         console.error('download error:', err);
  //     }
  // }

  // function downloadBlob(blob, filename = 'downloaded_file') {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //     console.log('Downloaded as:', filename);
  // }

  // Inside Attachment.tsx (can be inside the component as const function)
async function handleDownload(file): Promise<{ blob: Blob; filename: string }> {
  console.log("📦 Download request started...");
  console.log("➡️ File object received:", file);

  try {
    const formData = new FormData();

    // ✅ Correct fields
    formData.append("Filecategory", file.category);
    formData.append("Filename", file.AttachUniqueName);

    console.log("➡️ FormData sent:", formData);

    const resp = await fetch(`${API_CONFIG.BASE_URL+API_ENDPOINTS.TRIPS.FILE_UPDATEDOWN}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Is_JSON_Format: "true",
      },
      body: formData,
    });

    console.log("🌐 HTTP status:", resp.status, resp.statusText);

    if (!resp.ok) throw new Error(`Server returned ${resp.status}`);

    const contentType = resp.headers.get("content-type") || "";
    console.log("📑 Content-Type:", contentType);

    let blob: Blob;
    let filename = file.AttachUniqueName || file.fileName || "downloaded_file";

    if (contentType.includes("application/json")) {
      const json = await resp.json();
      console.log("🧾 JSON response:", json);

      if (!json.FileData) {
        throw new Error("⚠️ FileData is null — backend did not return actual file data");
      }

      const b64 = json.FileData;
      const mime = json.ContentType || "application/octet-stream";

      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++)
        byteNumbers[i] = byteChars.charCodeAt(i);

      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: mime });

      filename = json.FileName || filename;
    } else {
      blob = await resp.blob();
    }

    console.log("✅ File ready:", { filename, blobType: blob.type, size: blob.size });

    return { blob, filename };
  } catch (err) {
    console.error("❌ Download failed:", err);
    throw err;
  }
}


  function mimeToExt(mime) {
    mime = (mime || "").toLowerCase();
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("png")) return "png";
    if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
    if (mime.includes("zip")) return "zip";
    if (
      mime.includes("excel") ||
      mime.includes("spreadsheet") ||
      mime.includes("xlsx")
    )
      return "xlsx";
    if (
      mime.includes("word") ||
      mime.includes("msword") ||
      mime.includes("doc")
    )
      return "docx";
    return "";
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
            categories: ["BR Amendment", "Invoice", "Contract", "Other"],
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
