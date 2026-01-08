import React, { useState, useEffect } from "react";
import { SideDrawer } from "../Common/SideDrawer";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download } from 'lucide-react';
import { DynamicLazySelect } from "../DynamicPanel/DynamicLazySelect";
import { quickOrderService } from "@/api/services";

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
}> = ({ isOpen, onClose, rowData }) => {
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

  const [entries, setEntries] = useState<InvestigationEntry[]>(sampleEntries);
  const [selectedId, setSelectedId] = useState<string | null>(entries[0]?.UniqueID ?? null);

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
  const selected = entries.find(e => e.UniqueID === selectedId) || null;
  const [formData, setFormData] = useState<FormData>(selected ? { ...selected } : emptyForm());
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

  const fetchUsers = fetchMasterData("Createdby Init");

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
    // setEntries(prev => [newEntry, ...prev]);
    setSelectedId(id);
    setFormData({ ...newEntry });
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.UniqueID !== id));
    if (selectedId === id) setSelectedId(entries[0]?.UniqueID ?? null);
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

  const saveDetails = () => {
    if (!selectedId) return;
    const currentForm = { ...formData };
    // determine if entry exists already
    const existing = entries.find(e => e.UniqueID === selectedId);
    if (!existing) {
      // new insert
      const toInsert: InvestigationEntry = { ...currentForm, UniqueID: selectedId, ModeFlag: currentForm.ModeFlag || 'Insert' };
      // setEntries(prev => [toInsert, ...prev]);
      console.log('Inserted investigation entry:', toInsert);
      return;
    }

    // compare fields to detect changes
    const fieldsChanged = (
      existing.Date !== (currentForm.Date || '') ||
      existing.CommunicationChannel !== (currentForm.CommunicationChannel || '') ||
      existing.RemarkMessage !== (currentForm.RemarkMessage || '') ||
      existing.User !== (currentForm.User || '') ||
      (existing.AdditionalRemark || '') !== (currentForm.AdditionalRemark || '') ||
      JSON.stringify(existing.AdditionalAttachment || []) !== JSON.stringify(currentForm.AdditionalAttachment || [])
    );

    const newMode = existing.ModeFlag === 'Insert' ? 'Insert' : (fieldsChanged ? 'Update' : existing.ModeFlag || 'NoChange');

    // setEntries(prev => prev.map(e => e.UniqueID === selectedId ? ({ ...e, ...currentForm, UniqueID: selectedId, ModeFlag: newMode }) : e));
    console.log('Saved investigation entry:', { ...currentForm, UniqueID: selectedId, ModeFlag: newMode });
    // keep drawer open — or close depending on requirements
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
                      <button className="text-red-500 p-1" onClick={() => removeEntry(e.UniqueID)} title="Delete">
                        <Trash2 className="w-4 h-4" />
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