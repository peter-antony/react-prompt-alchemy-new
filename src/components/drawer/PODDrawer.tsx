import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DynamicLazySelect } from "../DynamicPanel/DynamicLazySelect";
import { Button } from "@/components/ui/button";
import { quickOrderService, tripService } from "@/api/services";
import { useToast } from '@/hooks/use-toast';
import { manageTripStore } from "@/stores/mangeTripStore";
import {
  UploadCloud,
  FileText,
  BookPlus,
  FileImage,
  DownloadCloud,
  Trash2,
} from "lucide-react";

// File icon helper
const getFileIcon = (mime: string) => {
  const m = (mime || "").toLowerCase();
  if (!m) return <FileText className="text-gray-500 w-6 h-6" />;
  if (m.includes("pdf") || m === "pdf") return <FileText className="text-red-500 w-6 h-6" />;
  if (m.includes("spreadsheet") || m.includes("excel") || m.includes("sheet") || m === "xls" || m === "xlsx")
    return <BookPlus className="text-green-500 w-6 h-6" />;
  if (
    m.includes("image") ||
    m === "jpg" ||
    m === "jpeg" ||
    m === "png" ||
    m === "gif" ||
    m === "bmp" ||
    m === "webp"
  )
    return <FileImage className="text-orange-400 w-6 h-6" />;
  return <FileText className="text-gray-500 w-6 h-6" />;
};
 
interface PODDrawerProps {
  tripNo: string;
  legNumber: string;
  customerOrderNo: string;
  dispatchDocNo?: string;
}

const PODDrawer: React.FC<PODDrawerProps> = ({ tripNo, legNumber, customerOrderNo, dispatchDocNo = "" }) => {
  const { tripData } = manageTripStore();
  const { toast } = useToast();
 
 
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  
  // useEffect(() => {
  //   fetchPODStatusOptions({
  //     searchTerm: "",
  //     offset: 1,
  //     limit: 1000
  //   });
  // }, []);
 
  const [selectedWagonIndex, setSelectedWagonIndex] = useState(0);
  const [attachItems, setAttachItems] = useState([]);
  const [stagedAttachItems, setStagedAttachItems] = useState<any[]>([]);
  const [initialWagonSnapshot, setInitialWagonSnapshot] = useState({
    PODStatus: "",
    PODStatusDescription: "",
    ReasonCode: "",
    ReasonCodeDescription: "",
    Remarks: "",
  });
  const [attachmentData, setAttachmentData] = useState<{ AttachItems: any[]; TotalAttachment: number }>({
    AttachItems: [],
    TotalAttachment: 0,
  });
  const [reloadKey, setReloadKey] = useState(0);


 


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newFiles = files.reduce((acc: any[], file: any) => {
      // 2MB size check with same toast pattern as OrderForm
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Upload Error",
          description: "File size exceeds 50 MB limit",
          variant: "destructive",
        });
        return acc; // skip this file
      }

      acc.push({
        fileName: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " mb",
        date: new Date().toLocaleString(),
        type: file.type,
        blobUrl: URL.createObjectURL(file),
        rawFile: file,
      });
      return acc;
    }, [] as any[]);

    if (newFiles.length === 0) return;

    setStagedAttachItems((prev) => [...prev, ...newFiles]);
  };
 
  const deleteStagedFile = (index: number) => {
    setStagedAttachItems((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteSavedFile = async (index: number) => {
    try {
      const file: any = (attachItems || [])[index];
      if (!file) return;

      const item = {
        AttachItemID: file?.rawItem?.AttachItemID ?? null,
        AttachmentType: file?.AttachmentType || file?.rawItem?.AttachmentType || "",
        FileCategory: file?.rawItem?.FileCategory || "POD",
        AttachName: file?.AttachName || file?.rawItem?.AttachName || "",
        AttachUniqueName: file?.AttachUniqueName || file?.rawItem?.Attachuniquename || file?.rawItem?.AttachUniqueName,
        AttachRelPath: file?.AttachRelPath || file?.rawItem?.Attachrelpath || file?.rawItem?.AttachRelPath,
        Remarks: null,
        ModeFlag: "Delete",
        RefDocType1: "Legno",
        RefDocNo1: Number(legNumber),
        RefDocType2: "DispatchDoc",
        RefDocNo2: resolvedDispatchDocNo || dispatchDocNo || "",
        RefDocType3: "CustomerOrderNo",
        RefDocNo3: customerOrderNo,
      };

      const saveRes = await tripService.savePODLegAttachments({
        TripNo: tripNo,
        LegNumber: legNumber,
        CustomerOrderNo: customerOrderNo,
        DispatchDocNo: resolvedDispatchDocNo || dispatchDocNo || "",
        WagonID: "",
        AttachItems: [item],
      });

      const success = (saveRes as any)?.IsSuccess || (saveRes as any)?.data?.IsSuccess;
      if (!success) {
        toast({ title: "Delete Failed", description: (saveRes as any)?.Message || "Could not delete attachment.", variant: "destructive" });
        return;
      }

      await refreshAttachmentsFromServer();
      toast({ title: "Attachment Deleted", description: "File deleted successfully.", variant: "default" });
    } catch (error) {
      toast({ title: "Delete Failed", description: "An error occurred while deleting attachment.", variant: "destructive" });
    }
  };

  const buildWagonPayloadForSave = (applyAll: boolean = false) => {
    const current = wagonList[selectedWagonIndex];
    const baseFields = {
      PODStatus: current?.PODStatus || "",
      PODStatusDescription: current?.PODStatusDescription || "",
      ReasonCode: current?.ReasonCode || "",
      ReasonCodeDescription: current?.ReasonCodeDescription || "",
      Remarks: current?.Remarks || "",
    };
    const bulkUpdate = applyAll
      ? { ...baseFields }
      : { PODStatus: "", PODStatusDescription: "", ReasonCode: "", ReasonCodeDescription: "", Remarks: "" };

    const wagonDetails = wagonList.map((w, idx) => ({
      WagonType: w.WagonType,
      WagonTypeDescription: w.WagonTypeDescription,
      WagonID: w.WagonID,
      WagonQty: w.WagonQty,
      PODStatus: applyAll ? baseFields.PODStatus : w.PODStatus,
      PODStatusDescription: applyAll ? baseFields.PODStatusDescription : w.PODStatusDescription,
      ReasonCode: applyAll ? baseFields.ReasonCode : w.ReasonCode,
      ReasonCodeDescription: applyAll ? baseFields.ReasonCodeDescription : w.ReasonCodeDescription,
      Remarks: applyAll ? baseFields.Remarks : w.Remarks,
      LineUniqueID: w.LineUniqueID || null,
      ModeFlag: applyAll ? "Update" : idx === selectedWagonIndex ? "Update" : "NoChanges",
    }));

    return { bulkUpdate, wagonDetails };
  };

  const handleApplyAllPODSave = async () => {
    try {
      const { bulkUpdate, wagonDetails } = buildWagonPayloadForSave(true);
      const saveRes = await tripService.savePOD({
        TripNo: tripNo,
        LegNumber: legNumber,
        CustomerOrderNo: customerOrderNo,
        DispatchDocNo: resolvedDispatchDocNo || dispatchDocNo || "",
        WagonDetails: wagonDetails,
        BulkUpdate: bulkUpdate,
      });

      const success = (saveRes as any)?.IsSuccess || (saveRes as any)?.data?.IsSuccess;
      if (!success) {
        toast({ title: "POD Save Failed", description: (saveRes as any)?.Message || "Could not save POD.", variant: "destructive" });
        return;
      }

      toast({ title: "POD Updated for All", description: "Applied current changes to all wagons.", variant: "default" });

    } catch (error) {
      toast({ title: "POD Save Failed", description: "An error occurred while saving POD.", variant: "destructive" });
    }
  };

  const handleSavePODAndAttachments = async () => {
    try {
      const staged = (stagedAttachItems || []).filter((f: any) => !!f.rawFile);
      const w = wagonList[selectedWagonIndex];
      const podFieldsChanged = !!w && (
        (w.PODStatus || "") !== (initialWagonSnapshot.PODStatus || "") ||
        (w.PODStatusDescription || "") !== (initialWagonSnapshot.PODStatusDescription || "") ||
        (w.ReasonCode || "") !== (initialWagonSnapshot.ReasonCode || "") ||
        (w.ReasonCodeDescription || "") !== (initialWagonSnapshot.ReasonCodeDescription || "") ||
        (w.Remarks || "") !== (initialWagonSnapshot.Remarks || "")
      );

      const { bulkUpdate, wagonDetails } = buildWagonPayloadForSave(false);
      const saveRes = await tripService.savePOD({
        TripNo: tripNo,
        LegNumber: legNumber,
        CustomerOrderNo: customerOrderNo,
        DispatchDocNo: resolvedDispatchDocNo || dispatchDocNo || "",
        WagonDetails: wagonDetails,
        BulkUpdate: bulkUpdate,
      });

      const success = (saveRes as any)?.IsSuccess || (saveRes as any)?.data?.IsSuccess;
      if (!success) {
        toast({ title: "POD Save Failed", description: (saveRes as any)?.Message || "Could not save POD.", variant: "destructive" });
        return;
      }

      let attachmentsSaved = false;
      if (staged.length > 0) {
        await handleSaveAttachments();
        attachmentsSaved = true;
      }

      if (podFieldsChanged && attachmentsSaved) {
        toast({ title: "Updated", description: "POD and attachments updated successfully.", variant: "default" });
      } else if (podFieldsChanged && !attachmentsSaved) {
        toast({ title: "POD Updated", description: "POD updated successfully.", variant: "default" });
      } else if (!podFieldsChanged && attachmentsSaved) {
        toast({ title: "Attachments Uploaded", description: "Attachments uploaded successfully.", variant: "default" });
      } else {
        toast({ title: "No Changes", description: "No changes to save.", variant: "default" });
      }

      setInitialWagonSnapshot({
        PODStatus: w?.PODStatus || "",
        PODStatusDescription: w?.PODStatusDescription || "",
        ReasonCode: w?.ReasonCode || "",
        ReasonCodeDescription: w?.ReasonCodeDescription || "",
        Remarks: w?.Remarks || "",
      });

    } catch (error) {
      toast({ title: "POD Save Failed", description: "An error occurred while saving POD.", variant: "destructive" });
    }
  };

  const handleSaveAttachments = async () => {
    try {
      const staged = (stagedAttachItems || []).filter((f: any) => !!f.rawFile);
      if (staged.length === 0) return;

      const attachItems: any[] = [];
      for (const f of staged) {
        const rawFile: File = f.rawFile as File;
        // revalidate size safety
        if (rawFile.size > 50 * 1024 * 1024) {
          toast({ title: "File Upload Error", description: `"${rawFile.name}" exceeds 50MB limit`, variant: "destructive" });
          continue;
        }

        const fileName = rawFile.name;
        const fileExt = fileName.split(".").pop()?.toUpperCase() || "";

        const formData = new FormData();
        formData.append("Files", rawFile, fileName);
        formData.append("Attachmenttype", fileExt);
        formData.append("Attachname", fileName);
        formData.append("Filecategory", "POD");

        // Only upload the file to get the unique name and path
        const uploadRes: any = await quickOrderService.updateAttachmentQuickOrderResource(formData);
        console.log("uploadRes=", uploadRes);
        const item = {
          AttachItemID: null,
          AttachmentType: uploadRes.Attachmenttype || fileExt,
          FileCategory: uploadRes.Filecategory || "POD",
          AttachName: uploadRes.Attachname || fileName,
          AttachUniqueName: uploadRes.data?.AttachUniqueName,
          AttachRelPath: uploadRes.Attachrelpath,
          Remarks: null,
          ModeFlag: "Insert",
          RefDocType1: "Legno",
          RefDocNo1: Number(legNumber),
          RefDocType2: "DispatchDoc",
          RefDocNo2: resolvedDispatchDocNo || dispatchDocNo || "",
          RefDocType3: "CustomerOrderNo",
          RefDocNo3: customerOrderNo,
        };
        attachItems.push(item);
      }

      if (attachItems.length === 0) {
        // nothing valid to save
        return;
      }
      console.log("attachItems=", attachItems);
      // Save attachments to database
      const saveRes = await tripService.savePODLegAttachments({
        TripNo: tripNo,
        LegNumber: legNumber,
        CustomerOrderNo: customerOrderNo,
        DispatchDocNo: resolvedDispatchDocNo || dispatchDocNo || "",
        WagonID: "",
        AttachItems: attachItems,
      });

      const success = (saveRes as any)?.IsSuccess || (saveRes as any)?.data?.IsSuccess;
      if (!success) {
        toast({ title: "Save Failed", description: (saveRes as any)?.Message || "Could not save attachments.", variant: "destructive" });
        return;
      }

      await refreshAttachmentsFromServer();
      setStagedAttachItems([]);
    } catch (error) {
      toast({ title: "Save Failed", description: "An error occurred while saving attachments.", variant: "destructive" });
    }
  };

  const refreshAttachmentsFromServer = async () => {
    const attRes = await tripService.getPODLegAttachments({
      TripNo: tripNo,
      LegNumber: legNumber,
      CustomerOrderNo: customerOrderNo,
      DispatchDocNo: resolvedDispatchDocNo || dispatchDocNo || "",
    });
    const attParsed = attRes?.data?.ResponseData ? JSON.parse(attRes.data.ResponseData) : attRes?.data || {};
    const attachItemsServer: any[] = Array.isArray(attParsed?.AttachItems) ? attParsed.AttachItems : [];
    const mapped = attachItemsServer.map((it) => ({
      AttachName: it?.AttachName || "",
      AttachmentType: (it?.AttachmentType || "").toString().toLowerCase(),
      AttachUniqueName: it?.AttachUniqueName || it?.Attachuniquename,
      AttachRelPath: it?.AttachRelPath || it?.Attachrelpath,
      rawItem: it,
    }));
    setAttachItems(mapped);
    setAttachmentData({
      AttachItems: attachItemsServer,
      TotalAttachment: attachItemsServer.length
    });
    setReloadKey((prev) => prev + 1);
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const resolveAttachUniqueName = (f: any): string => {
    return (
      f?.AttachUniqueName ||
      f?.AttachName ||
      f?.rawItem?.AttachUniqueName ||
      f?.rawItem?.AttachName ||
      ""
    );
  };

  // const onDownloadSaved = async (file: any) => {
  async function onDownloadSaved(file): Promise<{ blob: Blob; filename: string }> {
    console.log("file info=", file);
    try {
      const uniqueName = resolveAttachUniqueName(file);
      const bodyData = {
        filecategory: file?.rawItem?.FileCategory || "POD",
        filename: uniqueName,
      };
      const resp1: any = await quickOrderService.downloadAttachmentQuickOrder(bodyData);
      console.log("resp1=", resp1);
      const b64 = resp1.data.FileData;
      const mime = getMimeType(resp1.data.FileName);
      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const filename = file.AttachName || resp1.data.FileName || "downloaded_file";
      downloadBlob(blob, filename);
      return { blob, filename };
    } catch (e) {
      toast({ title: "Download Failed", description: "Could not download attachment.", variant: "destructive" });
    }
  };
 
  //   const handleSave = async () => {
  //   try {
  //     const response = await fetch("", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         tripNo,
  //         podStatus,
  //         reasonCode,
  //         remarks,
  //         wagonList,
  //       }),
  //     });
 
  //     const data = await response.json();
  //     console.log("API response:", data);
  //   } catch (err) {
  //     console.error("API Error:", err);
  //   }
  // };
 
  interface WagonItem {
    WagonType: string;
    WagonTypeDescription: string;
    WagonID: string;
    WagonQty: number;
    PODStatus: string;
    PODStatusDescription: string;
    ReasonCode: string;
    ReasonCodeDescription: string;
    Remarks: string;
    LineUniqueID: string;
    ModeFlag: string;
    attachments: Array<{
      fileName: string;
      type?: string;
      size?: string;
      date?: string;
      blobUrl?: string;
      downloadUrl?: string;
      rawItem?: any;
      rawFile?: File;
    }>;
  }

  const [wagonList, setWagonList] = useState<WagonItem[]>([]);
 
 
  interface FormData {
    PODStatus: string;
    PODStatusDescription: string;
    ReasonCode: string;
    ReasonCodeDescription: string;
    Remarks: string;
  }
  const initialFormData: FormData = {
    PODStatus: "",
    PODStatusDescription: "",
    ReasonCode: "",
    ReasonCodeDescription: "",
    Remarks: "",
  };
 
  const fetchMasterData =
    (messageType: string) =>
    async ({
      searchTerm,
      offset,
      limit,
    }: {
      searchTerm: string;
      offset: number;
      limit: number;
    }) => {
      try {
        // Call the API using the same service pattern as PlanAndActualDetails component
        const response = await quickOrderService.getMasterCommonData({
          messageType: messageType,
          searchTerm: searchTerm || "",
          offset,
          limit,
        });
 
        const rr: any = response.data;
        console.log("adsf", response.data);
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined &&
          item.id !== "" &&
          item.name !== undefined &&
          item.name !== ""
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {}),
        }));
 
        // Fallback to empty array if API call fails
        return [];
      } catch (error) {
        return [];
      }
    };
  const fetchStatus = fetchMasterData("POD Status Init");
  const reasonCodeDescription = fetchMasterData("POD ReasonCode Init");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [resolvedDispatchDocNo, setResolvedDispatchDocNo] = useState<string>("");

  useEffect(() => {
    const loadPOD = async () => {
      if (!tripNo || !legNumber || !customerOrderNo) return;
      const response = await tripService.getPODFromTrip({
        TripNo: tripNo,
        LegNumber: legNumber,
        CustomerOrderNo: customerOrderNo,
        DispatchDocNo: dispatchDocNo || "",
      });
      const parsed = response?.data?.ResponseData ? JSON.parse(response.data.ResponseData) : response?.data || {};
      const wagons = Array.isArray(parsed?.WagonDetails) ? parsed.WagonDetails : [];
      const mapped = wagons.map((w: any) => ({
        WagonType: w?.WagonType || "",
        WagonTypeDescription: w?.WagonTypeDescription || "",
        WagonID: w?.WagonID || "",
        WagonQty: Number(w?.WagonQty ?? 0),
        PODStatus: w?.PODStatus || "",
        PODStatusDescription: w?.PODStatusDescription || "",
        ReasonCode: w?.ReasonCode || "",
        ReasonCodeDescription: w?.ReasonCodeDescription || "",
        Remarks: w?.Remarks || "",
        LineUniqueID: w?.LineUniqueID || "",
        ModeFlag: w?.ModeFlag || "NoChanges",
        attachments: [],
      }));
      setWagonList(mapped);
      const refTripNo = parsed?.TripNo || tripNo;
      const refLegNo = parsed?.LegNumber || `${legNumber}`;
      const refDispatchDocNo = parsed?.DispatchDocNo || dispatchDocNo || "";
      const refCustomerOrderNo = parsed?.CustomerOrderNo || customerOrderNo;
      setResolvedDispatchDocNo(refDispatchDocNo);
      try {
        const attRes = await tripService.getPODLegAttachments({
          TripNo: refTripNo,
          LegNumber: refLegNo,
          CustomerOrderNo: refCustomerOrderNo,
          DispatchDocNo: refDispatchDocNo,
        });
        const attParsed = attRes?.data?.ResponseData ? JSON.parse(attRes.data.ResponseData) : attRes?.data || {};
        const attachItemsServer: any[] = Array.isArray(attParsed?.AttachItems) ? attParsed.AttachItems : [];

        // Map server attachments to display format
        const mapped = attachItemsServer.map((it) => ({
          AttachName: it?.AttachName || "",
          AttachmentType: (it?.AttachmentType || "").toString().toLowerCase(),
          AttachUniqueName: it?.AttachUniqueName || it?.Attachuniquename,
          AttachRelPath: it?.AttachRelPath || it?.Attachrelpath,
          rawItem: it,
        }));
        setAttachItems(mapped);

        setAttachmentData({
          AttachItems: attachItemsServer,
          TotalAttachment: attachItemsServer.length
        });
      } catch (e) {
        // silently ignore attachment load errors
        setAttachItems([]);
        setAttachmentData({
          AttachItems: [],
          TotalAttachment: 0
        });
      }
      if (mapped.length > 0) {
        setSelectedWagonIndex(0);
        setFormData({
          PODStatus: mapped[0].PODStatus,
          PODStatusDescription: mapped[0].PODStatusDescription,
          ReasonCode: mapped[0].ReasonCode,
          ReasonCodeDescription: mapped[0].ReasonCodeDescription,
          Remarks: mapped[0].Remarks,
        });
        setInitialWagonSnapshot({
          PODStatus: mapped[0].PODStatus,
          PODStatusDescription: mapped[0].PODStatusDescription,
          ReasonCode: mapped[0].ReasonCode,
          ReasonCodeDescription: mapped[0].ReasonCodeDescription,
          Remarks: mapped[0].Remarks,
        });
      }
    };
    loadPOD();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripNo, legNumber, customerOrderNo, dispatchDocNo]);

  useEffect(() => {
    const w = wagonList[selectedWagonIndex];
    if (w) {
      setFormData({
        PODStatus: w.PODStatus,
        PODStatusDescription: w.PODStatusDescription,
        ReasonCode: w.ReasonCode,
        ReasonCodeDescription: w.ReasonCodeDescription,
        Remarks: w.Remarks,
      });
      setInitialWagonSnapshot({
        PODStatus: w.PODStatus,
        PODStatusDescription: w.PODStatusDescription,
        ReasonCode: w.ReasonCode,
        ReasonCodeDescription: w.ReasonCodeDescription,
        Remarks: w.Remarks,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWagonIndex]);
 
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full bg-[#f8fafd]">
      <div className="md:w-1/3 w-full bg-white p-6 flex flex-col gap-6">
        <div className="relative bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-sm font-semibold">{tripNo}</div>
          <div className="text-xs text-muted-foreground">{customerOrderNo}</div>
 
          <span className="absolute right-3 top-3 px-2 py-0.5 text-xs font-medium border border-blue-200 text-blue-600 rounded-full">
            {`Leg ${legNumber || '1'}`}
          </span>
        </div>
 
        <div className="space-y-2">
          <label className="text-sm font-medium">Wagon Type</label>
 
          <div className="space-y-2">
            {wagonList.map((w, idx) => (
              <button
                key={w.WagonID}
                onClick={() => setSelectedWagonIndex(idx)}
                className={`w-full flex items-center justify-between rounded px-3 py-4 border ${
                  selectedWagonIndex === idx
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{w.WagonTypeDescription}</div>
                  <div className="text-xs text-muted-foreground">{w.WagonID}</div>
                </div>
 
                <Badge variant="secondary"></Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
 
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* POD Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">POD Status</label>
            {/* <Select value={podStatus} onValueChange={setPodStatus}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Not Delivered">Not Delivered</SelectItem>
              </SelectContent>
            </Select> */}
            <DynamicLazySelect
              fetchOptions={fetchStatus}
              value={
                formData.PODStatus && formData.PODStatusDescription
                  ? `${formData.PODStatus} || ${formData.PODStatusDescription}`
                  : formData.PODStatus || formData.PODStatusDescription || ""
              }
              onChange={(value) => {
                const v = (value as string) || "";
                const id = v.includes("||") ? v.split("||")[0].trim() : v;
                const name = v.includes("||") ? v.split("||")[1].trim() : "";
                setFormData({ ...formData, PODStatus: id, PODStatusDescription: name });
                setWagonList((prev) => {
                  const up = [...prev];
                  if (up[selectedWagonIndex]) {
                    up[selectedWagonIndex] = { ...up[selectedWagonIndex], PODStatus: id, PODStatusDescription: name };
                  }
                  return up;
                });
              }}
              placeholder="Select Status"
            />
          </div>
 
          {/* Reason Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason Code & Description
            </label>
            <DynamicLazySelect
              fetchOptions={reasonCodeDescription}
              value={
                formData.ReasonCode && formData.ReasonCodeDescription
                  ? `${formData.ReasonCode} || ${formData.ReasonCodeDescription}`
                  : formData.ReasonCode || formData.ReasonCodeDescription || ""
              }
              onChange={(value) => {
                const v = (value as string) || "";
                const id = v.includes("||") ? v.split("||")[0].trim() : v;
                const name = v.includes("||") ? v.split("||")[1].trim() : v;
                setFormData({ ...formData, ReasonCode: id, ReasonCodeDescription: name });
                setWagonList((prev) => {
                  const up = [...prev];
                  if (up[selectedWagonIndex]) {
                    up[selectedWagonIndex] = { ...up[selectedWagonIndex], ReasonCode: id, ReasonCodeDescription: name };
                  }
                  return up;
                });
              }}
              placeholder="Reason Code & Description"
            />
          </div>
        </div>
 
        {/* Remarks */}
        <div className="space-y-2 mt-4">
          <label className="text-sm font-medium">Remarks</label>
          <Textarea
            className="min-h-[80px] resize-none"
            value={wagonList[selectedWagonIndex]?.Remarks || ""}
            onChange={(e) => {
              const v = e.target.value;
              setWagonList((prev) => {
                const up = [...prev];
                up[selectedWagonIndex] = {
                  ...up[selectedWagonIndex],
                  Remarks: v,
                };
                return up;
              });
            }}
          />
        </div>
 
        <div className="mt-4">
          <label className="text-sm font-medium mb-3 block">Attachment</label>

          <div
            className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-blue-50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            
            <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mb-2">
              <UploadCloud className="w-7 h-7 p-1 text-gray-500 bg-gray-200 rounded-full" />
            </div>
            
            <span className="text-blue-600 font-medium text-sm">
              Click to Upload
            </span>
            
            <span className="text-gray-500 text-sm"> or drag & drop</span>

            <p className="text-xs text-gray-400 mt-2">
              Supports all file types (Max 50 MB)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="*/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          
          </div>

          {((stagedAttachItems || []).length > 0) && (
            <div className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {(stagedAttachItems || []).map((file: any, index: number) => (
                  file?.rawFile ? (
                    <div key={`staged-${index}`} className="p-4 border rounded-lg bg-white">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div className="flex gap-3 items-start md:items-center">
                          <div className="p-2 bg-gray-100 rounded h-10 w-10 flex items-center justify-center">
                            {getFileIcon(file.type || file.rawFile?.type || "")}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm truncate">
                              {file.fileName || file.rawFile?.name}
                            </h4>
                            <p className="text-xs text-gray-500">Not saved yet</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {/* <a
                            href={file.blobUrl}
                            download={file.fileName}
                            className="text-blue-600"
                          >
                            <DownloadCloud className="w-4 h-4" />
                          </a> */}
                          <button onClick={() => deleteStagedFile(index)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="text-lg font-semibold mb-2">
              Attached Files
              {/* ({wagonList[selectedWagonIndex]?.WagonTypeDescription || '-'}) */}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(attachItems || []).map((file: any, index: number) => (
                <div key={`saved-${index}`} className="p-4 border rounded-lg bg-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div className="flex gap-3 items-start md:items-center">
                      <div className="p-2 bg-gray-100 rounded h-10 w-10 flex items-center justify-center">
                        {getFileIcon(file.AttachmentType)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate">
                          {file.AttachName}
                        </h4>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => onDownloadSaved(file)} className="text-blue-600">
                        <DownloadCloud className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSavedFile(index)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => handleApplyAllPODSave()}>Apply to All</Button>
          <Button onClick={() => handleSavePODAndAttachments()}>Save</Button>
        </div>
      </div>
    </div>
  );
};
 
export default PODDrawer;
 
 