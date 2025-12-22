import React, { useState, useEffect } from "react";
import { Paperclip, Trash, CircleCheck, FileText, BookPlus, FileImage, BookA, UploadCloud, Search, Filter } from "lucide-react";
import { DynamicFileUpload } from '@/components/DynamicFileUpload';
import { StagedFile } from '@/types/fileUpload';
import jsonStore from '@/stores/jsonStore';
import { quickOrderService } from "@/api/services/quickOrderService";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINTS, API_CONFIG } from "@/api/config";

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
  const [searchParams] = useSearchParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [uniqueName, setUniqueName] = useState(
    "2362e1a23a5a49f99c077072b7f0f8b9.png"
  );
  useEffect(() => {
    console.log("AttachmentData updated:", attachmentData);
    const attachmentList = jsonStore.getQuickOrder();
    setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });

  }, [attachmentData]);
  useEffect(() => {
    setLoading(false);
    console.log("isResourceGroupAttchment", isResourceGroupAttchment);
    console.log("isResourceID", isResourceID);

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

    setLoading(true);
  }, [isResourceGroupAttchment, isResourceID]);

  const getAttachments = async () => {
    const response = jsonStore.getQuickOrder();
    const res = response.data;
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
        const dataS: any = await quickOrderService.updateAttachmentQuickOrderResource(formData);
        console.log("Upload response data:", dataS);
        // const ss= (dataS.data);
        // console.log("Upload response ss.Attachmenttype:", ss.Attachmenttype);
        // console.log("Upload response: data.data", dataS.data.Attachmenttype);
        const uploadedFiles = {
          AttachItemID: -1,
          ModeFlag: "Insert",
          AttachmentType: dataS.data.AttachmentType,
          FileCategory: dataS.data.FileCategory,
          AttachName: dataS.data.AttachName,
          AttachUniqueName: dataS.data.AttachUniqueName,
          AttachRelPath: dataS.data.AttachRelPath,
          Remarks: file.remarks,

        };
        console.log("uploadedFiles", uploadedFiles);
        console.log("isResourceGroupAttchment", isResourceGroupAttchment);
        if (isResourceGroupAttchment) {
          console.log("if");
          jsonStore.pushResourceGroupAttachmentsByUniqueID(isResourceID, uploadedFiles);
          // Refresh attachment data for ResourceGroup
          const updatedResourceGroupAttachmentData = jsonStore.getResourceGroupAttachmentDataByUniqueID(isResourceID);
          setAttachmentData(updatedResourceGroupAttachmentData);
        } else {
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
            console.log("AFTER UPLOAD::Parsed result:", (parsedData?.ResponseResult)[0]);
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
  //Old code for handle delete
  // const handleDelete = async (file: any) => {
  //   // Simulate API call
  //   console.log('Deleting %% file:', file);
  //   console.log('Deleting %% file ID:', file.id);
  //    if(isResourceGroupAttchment && isResourceID){

  //    }else{
  //     console.log("Inside else-- delete file fom QUICKORDER")
  //     jsonStore.markAttachmentAsDeleted(file.id)
  //     //  jsonStore.deleteQuickOrderAttachmentById(file.id);
  //     console.log("FULL Plan JSON :: ", jsonStore.getQuickOrder());

  //      jsonStore.setQuickOrder({
  //       ...jsonStore.getJsonData().quickOrder,
  //       // ...formValues.QuickOrder,
  //       "ModeFlag": "Update",
  //     });
  //     // const fullJson = jsonStore.getJsonData().ResponseResult.QuickOrder;
  //     const fullJson = jsonStore.getQuickOrder();
  //     console.log("FULL Plan JSON :: ", fullJson);

  //     setTimeout(async () => {
  //       const dataRes: any = await quickOrderService.updateQuickOrderAttachment(fullJson);
  //       console.log(" try", dataRes);
  //       //  Get OrderNumber from response
  //       const resourceGroupID = JSON.parse(dataRes?.data?.ResponseData)[0].QuickUniqueID;
  //       console.log("OrderNumber:", resourceGroupID);
  //       //  Fetch the full quick order details
  //       quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
  //       let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
  //       console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
  //       console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
  //       // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
  //       jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
  //       const attachmentList = jsonStore.getQuickOrder();
  //       console.log("AFTER DELETE JSON STORE- AttachmetList: ",attachmentList?.Attachments?.[0])
  //      jsonStore.deleteQuickOrderAttachmentById(file.id);

  //       setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });
  //       setReloadKey(prev => prev + 1);
  //       // setAttachmentData(
  //       //   attachmentList?.Attachments?.[0]
  //       //     ? { ...attachmentList.Attachments[0] }  // clone
  //       //     : { AttachItems: [], TotalAttachment: 0 }
  //       // );
  //       })
  //     }, 1000);
  //    }
  //   return new Promise<void>((resolve) => {
  //     setTimeout(() => {
  //       console.log('Delete completed');
  //       resolve();
  //     }, 1000);
  //   });
  // };

  const waitForCondition = async (
    checkFn: () => boolean,
    { interval = 300, timeout = 5000 } = {}
  ): Promise<boolean> => {
    const start = Date.now();
    return new Promise<boolean>((resolve) => {
      const tick = async () => {
        try {
          if (checkFn()) return resolve(true);
          if (Date.now() - start >= timeout) return resolve(false);
          setTimeout(tick, interval);
        } catch {
          return resolve(false);
        }
      };
      tick();
    });
  };

  const handleDelete = async (file: any): Promise<void> => {
    console.log("Delete requested for file:", file.id);

    try {
      if (isResourceGroupAttchment && isResourceID) {
        console.log("ResourceGroup delete flow - not implemented here");
        return;
      }



      const needsServerFields = !file.AttachUniqueName && !file.fileName && !file.id;
      if (needsServerFields) {

        const succeeded = await waitForCondition(() => {

          const currentQuickOrder = jsonStore.getQuickOrder();
          const attachments = currentQuickOrder?.Attachments?.[0]?.AttachItems || [];
          const match = attachments.find((a: any) =>
            a.AttachUniqueName === file.AttachUniqueName ||
            a.fileName === file.fileName ||
            a.id === file.id
          );
          return !!match;
        }, { interval: 300, timeout: 7000 });

        if (!succeeded) {
          throw new Error("Upload not finished yet; please try delete after a moment.");
        }

        console.log("Upload finished / store updated. Proceeding to delete.");
      }
      console.log("BEFORE mark delete--ID =", file.id)
      if (file.id == -1) {
        jsonStore.markAttachmentAsDeletedByCategoryAndName(file.category, file.fileName);
      } else {
        jsonStore.markAttachmentAsDeleted(file.id)
      }
      const currentQuickOrder = jsonStore.getJsonData()?.quickOrder || jsonStore.getQuickOrder();
      jsonStore.setQuickOrder({
        ...currentQuickOrder,
        ModeFlag: "Update",
      });

      const fullJson = jsonStore.getQuickOrder();
      console.log("Sending updateQuickOrderAttachment with payload:", fullJson);

      const dataRes: any = await quickOrderService.updateQuickOrderAttachment(fullJson);
      console.log("updateQuickOrderAttachment response:", dataRes);

      const parsedResp = dataRes?.data?.ResponseData ? JSON.parse(dataRes.data.ResponseData) : null;
      const resourceGroupID = parsedResp?.[0]?.QuickUniqueID;
      if (!resourceGroupID) {
        console.warn("No QuickUniqueID returned. Trying to refresh local store anyway.");
      } else {
        console.log("QuickUniqueID:", resourceGroupID);
        const fetchRes: any = await quickOrderService.getQuickOrder(resourceGroupID);
        const parsedFetch = fetchRes?.data?.ResponseData ? JSON.parse(fetchRes.data.ResponseData) : null;
        const freshQuickOrder = parsedFetch?.ResponseResult?.[0] || null;
        if (freshQuickOrder) {
          jsonStore.setQuickOrder(freshQuickOrder);
          console.log("jsonStore synced with backend after delete.");
        } else {
          console.warn("Fetch returned no fresh quick order - keeping existing store.");
        }
      }

      jsonStore.deleteQuickOrderAttachmentById(file.id);
      const attachmentList = jsonStore.getQuickOrder();
      setAttachmentData(attachmentList?.Attachments?.[0] || { AttachItems: [], TotalAttachment: 0 });
      setReloadKey((prev) => prev + 1);


    } catch (err) {
      throw err;
    }
  };
  async function handleDownload(file) {
    console.log("📦 Download request started...");
    console.log("➡️ File object received:", file);

    try {
      const formData = new FormData();
      console.log("localStorage.getItem('accessToken') = ", localStorage.getItem('token'))
      // ✅ Correct fields
      formData.append("Filecategory", file.category);
      formData.append("Filename", file.AttachUniqueName);
      const bodyData = {
        filecategory: file.category,
        filename: file.AttachUniqueName,
      };
      const resp1: any = await quickOrderService.downloadAttachmentQuickOrder(bodyData)
      // const token = JSON.parse(localStorage.getItem('accessToken') || '{}');
      // const resp = await fetch(`${API_CONFIG.BASE_URL+API_ENDPOINTS.TRIPS.FILE_UPDATEDOWN}`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token.access_token}`,
      //     // Accept: "application/json",
      //     // Is_JSON_Format: "true",
      //     "Content-Type": "application/json",
      //     "Accept": "application/json",
      //     "context-lang-id": "1",
      //     "context-ou-id": "4",
      //     "context-role-name": "RAMCOROLE",
      //   },
      //   // body: formData,
      //   body: JSON.stringify(bodyData)
      // });

      console.log("RESP 1111:", resp1);
      // console.log("🌐 HTTP status:", resp.status, resp.statusText);

      // if (!resp.ok) throw new Error(`Server returned ${resp.status}`);

      // const contentType = resp1.headers.get("content-type") || "";
      // console.log("📑 Content-Type:", resp1.headers.get("content-type"));

      // let blob: Blob;
      // let filename = file.AttachUniqueName || file.fileName || "downloaded_file";
      let filename = file.fileName || "downloaded_file";

      // if (contentType.includes("application/json")) {
      //   const json = await resp.json();
      //   console.log("🧾 JSON response:", json);

      //   if (!json.FileData) {
      //     throw new Error("⚠️ FileData is null — backend did not return actual file data");
      //   }

      const b64 = resp1.data.FileData;
      // const mime = resp1.ContentType || "application/octet-stream";
      const mime = getMimeType(resp1.data.FileName)
      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++)
        byteNumbers[i] = byteChars.charCodeAt(i);

      const byteArray = new Uint8Array(byteNumbers);
      let blob = new Blob([byteArray], { type: mime });

      filename = filename;
      // } else {
      //   blob = await resp.blob();
      // }

      // console.log("✅ File ready:", { filename, blobType: blob.type, size: blob.size });


      // const blob = base64ToBlob(resp1?.FileData, "application/json");

      // Convert base64 → PDF blob
      // const blob = base64ToBlob(resp1?.FileData, "application/pdf");

      // Download file
      // downloadBlob(blob, resp1?.FileName || "download.pdf");
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
  function base64ToBlob(base64: string, contentType = "application/pdf") {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    const byteArray = new Uint8Array(byteArrays);
    return new Blob([byteArray], { type: contentType });
  }
  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
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
            maxFileSizeMB: 5,
            allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'xls', 'xlsx', 'doc', 'docx']
          }}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onDownload={handleDownload}
          className="max-w-4xl mx-auto"
          isEditQuickOrder={isEditQuickOrder}
          isResourceGroupAttchment={isResourceGroupAttchment}
          loadAttachmentData={attachmentData}
        /> : ''
      }

    </div>
  );
}

export default Attachments;