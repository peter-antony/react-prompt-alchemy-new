import React, { useEffect, useRef, useState } from "react";
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
import { API_CONFIG, API_ENDPOINTS } from "@/api/config";
import {
  UploadCloud,
  FileText,
  BookPlus,
  FileImage,
  DownloadCloud,
  Trash2,
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { manageTripStore } from "@/stores/mangeTripStore";
// import { console } from "inspector";
 
/* ---------------- ICON HANDLER ---------------- */
const getFileIcon = (mime: string) => {
  if (!mime) return <FileText className="text-gray-500 w-6 h-6" />;
 
  if (mime.includes("pdf"))
    return <FileText className="text-red-500 w-6 h-6" />;
 
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime.includes("sheet")
  )
    return <BookPlus className="text-green-500 w-6 h-6" />;
 
  if (mime.includes("image"))
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
 
  /* ---------------- WAGON LIST WITH SEPARATE ATTACHMENTS ---------------- */
  // useEffect(() => {
  //   fetchPODStatusOptions({
  //     searchTerm: "",
  //     offset: 1,
  //     limit: 1000
  //   });
  // }, []);
 
  const [selectedWagonIndex, setSelectedWagonIndex] = useState(0);
  const [attachItems, setAttachItems] = useState([]);
 
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newFiles = files.reduce((acc: any[], file: any) => {
      // 2MB size check with same toast pattern as OrderForm
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Upload Error",
          description: "File size exceeds 2MB limit",
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

    setWagonList((prev) => {
      const updated = [...prev];
      const current = updated[selectedWagonIndex];
      if (!current) return prev;
      current.attachments = [...(current.attachments || []), ...newFiles];
      return updated;
    });
  };
 
  const deleteFile = (index: number) => {
    setWagonList((prev) => {
      const updated = [...prev];
      const current = updated[selectedWagonIndex];
      if (!current || !Array.isArray(current.attachments)) return prev;
      current.attachments = current.attachments.filter((_, i) => i !== index);
      return updated;
    });
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

      await handleSaveAttachments();

    } catch (error) {
      toast({ title: "POD Save Failed", description: "An error occurred while saving POD.", variant: "destructive" });
    }
  };

  const handleSaveAttachments = async () => {
    try {
      const current = wagonList[selectedWagonIndex];
      if (!current) {
        toast({ title: "No Wagon Selected", description: "Select a wagon to save attachments.", variant: "destructive" });
        return;
      }

      const staged = (current.attachments || []).filter((f: any) => !!f.rawFile);
      if (staged.length === 0) {
        toast({ title: "No New Files", description: "No newly uploaded files to save.", variant: "default" });
        return;
      }

      const attachItems: any[] = [];
      for (const f of staged) {
        const rawFile: File = f.rawFile as File;
        // revalidate size safety
        if (rawFile.size > 2 * 1024 * 1024) {
          toast({ title: "File Upload Error", description: `"${rawFile.name}" exceeds 2MB limit`, variant: "destructive" });
          continue;
        }

        const fileName = rawFile.name;
        const fileExt = fileName.split(".").pop()?.toUpperCase() || "";

        const formData = new FormData();
        formData.append("Files", rawFile, fileName);
        formData.append("Attachmenttype", fileExt);
        formData.append("Attachname", fileName);
        formData.append("Filecategory", "POD");

        const uploadRes: any = await quickOrderService.updateAttachmentQuickOrderResource(formData);

        const item = {
          AttachItemID: null,
          AttachmentType: uploadRes.Attachmenttype || fileExt,
          FileCategory: uploadRes.Filecategory || "POD",
          AttachName: uploadRes.Attachname || fileName,
          AttachUniqueName: uploadRes.Attachuniquename,
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

      const saveRes = await tripService.savePODLegAttachments({
        TripNo: tripNo,
        LegNumber: legNumber,
        CustomerOrderNo: customerOrderNo,
        DispatchDocNo: resolvedDispatchDocNo || dispatchDocNo || "",
        WagonID: current.WagonID,
        AttachItems: attachItems,
      });

      const success = (saveRes as any)?.IsSuccess || (saveRes as any)?.data?.IsSuccess;
      if (!success) {
        toast({ title: "Save Failed", description: (saveRes as any)?.Message || "Could not save attachments.", variant: "destructive" });
        return;
      }

      // Refresh attachment list from server and bind to UI
      try {
        const attRes = await tripService.getPODLegAttachments({
          TripNo: tripNo,
          LegNumber: legNumber,
          CustomerOrderNo: customerOrderNo,
          DispatchDocNo: resolvedDispatchDocNo || dispatchDocNo || "",
        });
        const attParsed = attRes?.data?.ResponseData ? JSON.parse(attRes.data.ResponseData) : attRes?.data || {};
        console.log("attParsed", attParsed);
        const attachItemsServer: any[] = Array.isArray(attParsed?.AttachItems) ? attParsed.AttachItems : [];
        const filesForThisWagon = attachItemsServer.filter((it) => (it?.RefDocNo4 ?? current.WagonID) === current.WagonID);
        const mapped = filesForThisWagon.map((it) => ({
          fileName: it?.AttachName || "",
          type: it?.AttachmentType || "",
          size: "",
          date: "",
          downloadUrl: `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TRIPS.FILE_UPDATEDOWN}`,
          rawItem: it,
        }));
        setWagonList((prev) => {
          const up = [...prev];
          if (up[selectedWagonIndex]) {
            up[selectedWagonIndex] = { ...up[selectedWagonIndex], attachments: mapped };
          }
          return up;
        });
      } catch (e) {
        // If refresh fails, leave staged files as-is
      }

      toast({ title: "Attachments Saved", description: `${attachItems.length} file(s) saved successfully.`, variant: "default" });
    } catch (error) {
      toast({ title: "Save Failed", description: "An error occurred while saving attachments.", variant: "destructive" });
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
        console.log("attachments", attParsed);
        const attachItems: any[] = Array.isArray(attParsed?.AttachItems) ? attParsed.AttachItems : [];
        console.log("attachItems", attachItems);
        setAttachItems(attachItems);
        const byWagon: Record<string, any[]> = {};
        attachItems.forEach((item) => {
          const key = item?.RefDocNo4 || "";
          if (!byWagon[key]) byWagon[key] = [];
          byWagon[key].push(item);
        });
        setWagonList((prev) =>
          prev.map((w) => {
            const items = byWagon[w.WagonID] || [];
            const files = items.map((it) => ({
              fileName: it?.AttachName || "",
              type: it?.AttachmentType || "",
              size: "",
              date: "",
              downloadUrl: `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TRIPS.FILE_UPDATEDOWN}`,
              rawItem: it,
            }));
            return { ...w, attachments: files };
          })
        );
      } catch (e) {
        // silently ignore attachment load errors
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
 
                <Badge variant="secondary">{w.PODStatusDescription || w.PODStatus}</Badge>
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
              Supports all file types (Max 2 MB)
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
 
          <div className="mt-4">
            <div className="text-lg font-semibold mb-2">
              Attached Files 
              {/* ({wagonList[selectedWagonIndex]?.WagonTypeDescription || '-'}) */}
            </div>
 
            <div className="grid gap-4 sm:grid-cols-1">
              {(attachItems || []).map((file, index) => (
                <div  className="p-4 border rounded-lg bg-white">
                  <div className="flex flex-col md:flex-row md:justify-between gap-3">
                    <div className="flex gap-3 items-start">
                      <div className="p-2 bg-gray-100 rounded h-10 w-10 flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
 
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate">
                          {file.AttachName}
                        </h4>
                        {/* <div className="text-xs text-gray-500">
                          {file.size} • {file.date}
                        </div> */}
                      </div>
                    </div>
 
                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 self-end md:self-auto">
                      <a href={file.downloadUrl || file.blobUrl} download={file.fileName}>
                        <DownloadCloud className="w-4 h-4" />
                      </a>
 
                      <button onClick={() => deleteFile(index)}>
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
 
 