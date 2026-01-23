import React, { useState, useEffect } from "react";
import { SideDrawer } from "../Common/SideDrawer";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download } from 'lucide-react';
import { DynamicLazySelect } from "../DynamicPanel/DynamicLazySelect";
import { quickOrderService } from "@/api/services";
import { useToast } from '@/hooks/use-toast';
import { ClaimService } from "@/api/services/ClaimService";

type InvestigationEntry = {
  UniqueID: string;
  Date: string; // yyyy-mm-dd
  CommunicationChannel: string;
  RemarkMessage: string;
  AdditionalRemark?: string;
  User: string;
  AdditionalAttachment?: any[];
  ModeFlag?: string;
};

type FormData = InvestigationEntry;

export const InvestigationDetails: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  rowData?: any;
  apiData?: any;
  onSaveCallback?: () => void;
}> = ({ isOpen, onClose, rowData, apiData, onSaveCallback }) => {
  console.log("InvestigationDetails render", { apiData });
  // Sample JSON data (temporary) — parent will pass real data later
  const sampleEntries: InvestigationEntry[] = [
    {
      UniqueID: '1',
      CommunicationChannel: 'Mail',
      Date: new Date('2025-03-12').toISOString().slice(0, 10),
      User: 'Samuel',
      RemarkMessage: 'Claim investigation initiated based on Internal order',
      AdditionalAttachment: [
        { id: 'a1', name: 'Routine Check between trips.pdf', sizeKb: 1524 }
      ],
      ModeFlag: 'NoChange'
    },
    {
      UniqueID: '2',
      CommunicationChannel: 'Mobile',
      Date: new Date('2025-03-12').toISOString().slice(0, 10),
      User: 'Eklavya',
      RemarkMessage: 'Claim investigation initiated based on Internal order',
      AdditionalAttachment: [],
      ModeFlag: 'NoChange'
    },
    {
      UniqueID: '3',
      CommunicationChannel: 'In-Person',
      Date: new Date('2025-03-12').toISOString().slice(0, 10),
      User: 'Danie Jacob',
      RemarkMessage: 'Claim investigation initiated based on Internal order',
      AdditionalAttachment: [],
      ModeFlag: 'NoChange'
    }
  ];

  const [entries, setEntries] = useState<InvestigationEntry[]>(apiData?.InvestigationDetails || []);
  const [selectedId, setSelectedId] = useState<string | null>(entries?.[0]?.UniqueID ?? null);

  // Ensure we default to the first entry when `entries` are loaded/changed.
  // apiData may arrive after initial render, so setSelectedId here instead
  // of relying only on initial useState value.
  useEffect(() => {
    if (!entries || entries.length === 0) {
      setSelectedId(null);
      return;
    }

    // If current selectedId is missing or not present in entries, pick the first one
    const exists = entries.some(e => e.UniqueID === selectedId);
    if (!exists) {
      setSelectedId(entries[0].UniqueID);
    }
  }, [entries]);

  const emptyForm = (): FormData => ({
    UniqueID: '',
    Date: '',
    CommunicationChannel: '',
    RemarkMessage: '',
    AdditionalRemark: '',
    User: '',
    AdditionalAttachment: [],
    ModeFlag: 'Insert',
  });

  // single formData for selected entry
  const selected = entries?.find(e => e.UniqueID === selectedId) || null;
  const [formData, setFormData] = useState<FormData>(selected ? { ...selected } : emptyForm());
  const { toast } = useToast();
  const fetchMasterData = (messageType: string, extraParams?: Record<string, any>) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
        ...(extraParams || {}),
      });

      const rr: any = response.data
      return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
        ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
          ? {
            label: `${item.id} || ${item.name}`,
            value: `${item.id} || ${item.name}`,
          }
          : {})
      }));
      return [];
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      // Return empty array on error
      return [];
    }
  };

  const fetchUsers = fetchMasterData("Employee Init");

  useEffect(() => {
    // when apiData changes (new data from parent), load entries
    // If apiData.InvestigationDetails is null/empty we must clear entries to avoid showing stale data
    if (apiData) {
      setEntries(apiData.InvestigationDetails || []);
    }

  }, [apiData]);

  useEffect(() => {
    // when selection or drawer open changes, load selected fields into formData
    // If selectedId exists but isn't in entries (unsaved new entry), keep current formData.
    if (selected) {
      setFormData({ ...selected, AdditionalAttachment: Array.isArray(selected.AdditionalAttachment) ? selected.AdditionalAttachment : [] });
    } else {
      setFormData(emptyForm());
    }
  }, [selectedId, isOpen]);

  const addEntry = () => {
    const id = String(Date.now());
    const newEntry: InvestigationEntry = {
      UniqueID: id,
      CommunicationChannel: '',
      Date: '',
      User: '',
      RemarkMessage: '',
      AdditionalAttachment: [],
      ModeFlag: 'Insert'
    };
    // Do NOT append a blank new entry into `entries` yet — wait until user fills required fields and saves.
    // Keep the new entry only in the form state until saveDetails commits it.
    setSelectedId(id);
    setFormData({ ...newEntry });
  };

  const removeEntry = (id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.UniqueID !== id);
      // If the removed entry was the currently selected one, select the first available
      if (selectedId === id) {
        setSelectedId(updated[0]?.UniqueID ?? null);
      }
      return updated;
    });
  };

  const onFileAdd = (file: File) => {
    const att: any = { id: String(Date.now()), name: file.name, sizeKb: Math.round(file.size / 1024) };
    setFormData(fd => ({ ...fd, AdditionalAttachment: [...(fd.AdditionalAttachment || []), att] }));
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) onFileAdd(file);
    e.currentTarget.value = '';
  };

  const pipedFormat = (user: any) => {
    if (user == null) {
      return null; // handles null & undefined
    }
    const value = String(user).trim();
    if (value.includes("||")) {
      return value.split("||")[0].trim();
    }
    return value;
  }

  const saveDetails = async () => {
    // if (!selectedId) return [];

    const currentForm = { ...formData };

    // Validate required fields before saving
    const errors: Record<string, string> = {};
    if (!currentForm.Date) errors.Date = 'Date is required';
    if (!currentForm.CommunicationChannel || !String(currentForm.CommunicationChannel).trim()) errors.CommunicationChannel = 'Communication Channel is required';
    if (!currentForm.RemarkMessage || !String(currentForm.RemarkMessage).trim()) errors.RemarkMessage = 'Remarks/Message is required';
    if (!currentForm.User || !String(currentForm.User).trim()) errors.User = 'User is required';

    if (Object.keys(errors).length > 0) {
      const messages = Object.values(errors);
      toast({
        title: "❌ Validation Error",
        description: messages.join(' • '),
        variant: 'destructive',
      });
      console.warn('Validation failed for investigation entry:', errors);
      return [];
    }

    // find existing index
    const idx = entries.findIndex(e => e.UniqueID === selectedId);
    let updatedEntries: InvestigationEntry[] = [];

    if (idx === -1) {
      // New insert: ensure ModeFlag is Insert
      const toInsert: InvestigationEntry = {
        ...currentForm,
        UniqueID: selectedId,
        User: pipedFormat(currentForm.User || ''),
        ModeFlag: currentForm.ModeFlag || 'Insert'
      };
      updatedEntries = [...entries, toInsert];
    } else {
      const existing = entries[idx];
      // lightweight comparison of relevant fields
      const fieldsChanged = (
        (existing.Date || '') !== (currentForm.Date || '') ||
        (existing.CommunicationChannel || '') !== (currentForm.CommunicationChannel || '') ||
        (existing.RemarkMessage || '') !== (currentForm.RemarkMessage || '') ||
        (existing.User || '') !== (currentForm.User || '') ||
        (existing.AdditionalRemark || '') !== (currentForm.AdditionalRemark || '') ||
        JSON.stringify(existing.AdditionalAttachment || []) !== JSON.stringify(currentForm.AdditionalAttachment || [])
      );

      const newMode = existing.ModeFlag === 'Insert' ? 'Insert' : (fieldsChanged ? 'Update' : (existing.ModeFlag || 'NoChange'));

      const merged: InvestigationEntry = {
        ...existing,
        ...currentForm,
        UniqueID: selectedId,
        ModeFlag: newMode
      };

      updatedEntries = entries.map(e => e.UniqueID === selectedId ? merged : e);
    }

    // Persist updated entries in state first
    // setEntries(updatedEntries);

    // Build payload: full list (existing + newly inserted + modified)
    const changesToSave = updatedEntries;

    console.log('Investigation changes to save:', changesToSave);
    let payloadFull: any = {
      ...apiData,
      Header: {
        ...apiData?.Header,
        Reference: {
          ...apiData?.Header?.Reference,
          InvestigationNeeded: 'Yes',
          ModeFlag: 'Update'
        }
      },
      InvestigationDetails: changesToSave
    }
    try {
      console.log('Calling saveClaim API...');
      const response: any = await ClaimService.saveClaim(payloadFull);

      console.log('Save Claim API Response:', response);
      if (response?.data?.IsSuccess) {
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse ResponseData:', parseError);
        }

        const successMessage = responseData?.Message || response?.data?.Message || "Claim saved successfully.";
        const reasonCode = responseData?.ReasonCode || "";

        toast({
          title: "✅ Claim Saved",
          description: `${successMessage}${reasonCode ? ` (${reasonCode})` : ""}`,
          variant: "default",
        });
        onClose();
        onSaveCallback?.();
        // Refresh claim data after successful short close
      } else {
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed Error ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse error ResponseData:', parseError);
        }

        const errorMessage = responseData?.Message || responseData?.Errormessage || response?.data?.Message || "Claim saved failed.";

        toast({
          title: "⚠️ Claim Saved Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Save Claim API Error:', error);
      let errorMessage = "An unexpected error occurred while saving the claim.";
      if ((error as any)?.response?.data?.Message) {
        errorMessage = (error as any).response.data.Message;
      } else if ((error as any)?.message) {
        errorMessage = (error as any).message;
      }
      toast({
        title: "Error saving claim",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="68%"
      title="Investigation Details"
      isBack={false}
      contentBgColor='#ffffff'
      onScrollPanel={true}
      isBadgeRequired={true}
    // badgeContent={rowData ? rowData?.ClaimNo : ''}
    // additionalBadge={rowData ? rowData.ClaimDate : ''}
    >
      <div className="flex flex-col h-full">
        <style>{`
          .investigation-scroll { scroll-behavior: smooth; scrollbar-width: thin; -ms-overflow-style: auto; }
          .investigation-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
          .investigation-scroll::-webkit-scrollbar-track { background: transparent; }
          .investigation-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.2); border-radius: 6px; }
          .investigation-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.35); }
        `}</style>
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Left column: list (scrollable) */}
            <div className="w-1/3 p-4 overflow-auto investigation-scroll">
              <div className="flex items-center justify-between mb-4">
                <div className="text-md font-semibold flex gap-2 items-center">Total <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{entries.length}</span></div>
                <button className="p-1 rounded-lg text-gray-600 hover:bg-blue-50 border border-[#D0D5DD]" onClick={addEntry} title="Add">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {entries.map((e, index) => (
                  <div key={'entry-' + index} className={`p-3 rounded-lg border hover:bg-gray-50 ${selectedId === e.UniqueID ? 'border-[#0073E6]' : 'border-[#EAECF0] bg-white'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0" onClick={() => setSelectedId(e.UniqueID)} style={{ cursor: 'pointer' }}>
                        <div className="font-semibold text-sm truncate text-gray-800">{e.CommunicationChannel}</div>
                        <div className="font-normal text-xs text-gray-500 truncate">{e.Date} | {e.User}</div>
                        <div className="font-normal text-xs text-gray-600 truncate mt-1 break-words">{e.RemarkMessage}</div>
                      </div>
                      <button className="text-red-500 p-1" title="Delete">
                        {/* <Trash2 onClick={() => removeEntry(e.UniqueID)} className="w-4 h-4" /> */}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: details form (scrollable) */}
            <div className="flex-1 px-6 py-4 overflow-auto investigation-scroll bg-[#F8F9FC]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 font-medium">Date</label>
                  <input type="date" value={formData.Date} onChange={(e) => setFormData(fd => ({ ...fd, Date: e.target.value }))} className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium">Communication Channel</label>
                  <input value={formData.CommunicationChannel} onChange={(e) => setFormData(fd => ({ ...fd, CommunicationChannel: e.target.value }))} className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-gray-600 font-medium">Remarks/Message</label>
                <textarea value={formData.RemarkMessage} onChange={(e) => setFormData(fd => ({ ...fd, RemarkMessage: e.target.value }))} rows={3} className="w-full rounded-md border px-3 py-2 text-[13px] mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs text-gray-600 font-medium">User</label>
                  {/* <input value={formData.User}
                    onChange={(e) => setFormData(fd => ({ ...fd, User: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1" /> */}
                  {/* <div className="w-full h-9 text-[13px] mt-1"> */}
                  <DynamicLazySelect
                    fetchOptions={fetchUsers}
                    value={formData.User}
                    onChange={(value) => setFormData({ ...formData, User: value as string })}
                    placeholder="Enter User"
                    className="w-full h-9 text-[13px] mt-1"
                  />
                  {/* </div> */}
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium">Additional Remarks</label>
                  <input value={formData.AdditionalRemark} onChange={(e) => setFormData(fd => ({ ...fd, AdditionalRemark: e.target.value }))} className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
                </div>
              </div>

              <div className="mt-6">
                <label className="text-xs text-gray-600 font-medium mb-2 block">Attachment</label>
                <div className="border-2 border-dashed border-blue-100 rounded-md p-6 text-center bg-blue-50 mt-1">
                  <div className="text-sm text-blue-700 mb-2">Click to Upload or drag and drop</div>
                  <div className="text-xs text-gray-500">SVG, PNG, JPG, GIF or PDF (Maximum File Size 2 MB)</div>
                  <div className="mt-3">
                    <input type="file" onChange={handleUploadChange} className="mx-auto" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold mb-2 text-gray-800">Attached Files</div>
                <div className="space-y-2">
                  {(formData.AdditionalAttachment || []).length === 0 && <div className="text-xs text-gray-500">No files attached.</div>}
                  {(formData.AdditionalAttachment || []).map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">PDF</div>
                        <div>
                          <div className="font-medium">{att.name}</div>
                          <div className="text-xs text-gray-500">{att.sizeKb} KB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="text-gray-600"><Download className="w-4 h-4" /></button>
                        <button className="text-red-500" onClick={() => setFormData(fd => ({ ...fd, AdditionalAttachment: (fd.AdditionalAttachment || []).filter(a => a.id !== att.id) }))}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: sticky full-width save button */}
        <div className="border-t bg-white px-6 py-3">
          <div className="flex justify-end">
            <Button className="bg-[#0073E6] text-white rounded-sm h-9 font-semibold" variant="default" onClick={saveDetails}>Save Details</Button>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};