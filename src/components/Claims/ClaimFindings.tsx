import React, { useEffect, useState } from "react";
import { SideDrawer } from "../Common/SideDrawer";
import { Button } from "@/components/ui/button";

type ClaimFindingsData = {
  docType?: string;
  finalAmount?: string;
  currency?: string;
  comments?: string;
  supplierNoteNo?: string;
  supplierNoteAmount?: string;
  supplierCurrency?: string;
};

export const ClaimFindings: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initial?: ClaimFindingsData;
  onSave?: (data: ClaimFindingsData) => void;
}> = ({ isOpen, onClose, initial, onSave }) => {
  const [form, setForm] = useState<ClaimFindingsData>({
    docType: initial?.docType || "",
    finalAmount: initial?.finalAmount || "",
    currency: initial?.currency || "€",
    comments: initial?.comments || "",
    supplierNoteNo: initial?.supplierNoteNo || "",
    supplierNoteAmount: initial?.supplierNoteAmount || "",
    supplierCurrency: initial?.supplierCurrency || "€",
  });

  useEffect(() => {
    if (initial) setForm({ ...form, ...initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const handleSave = () => {
    if (onSave) onSave(form);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="32%"
      title="Claim Findings"
      isBack={false}
      contentBgColor="#ffffff"
      onScrollPanel={true}
      isBadgeRequired={false}
    >
      <div className="flex flex-col h-full">
        <style>{`
          .investigation-scroll { scroll-behavior: smooth; scrollbar-width: thin; -ms-overflow-style: auto; }
          .investigation-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
          .investigation-scroll::-webkit-scrollbar-track { background: transparent; }
          .investigation-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.2); border-radius: 6px; }
          .investigation-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.35); }
        `}</style>
        <div className="flex-1 overflow-auto px-6 py-4 investigation-scroll bg-[#F8F9FC]">
          <div className="mb-4">
            <label className="text-xs text-gray-600 font-medium">Credit Note Based on Adjustment Doc. Type/No.*</label>
            <select value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))} className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1">
              <option value="">Select</option>
              <option>Supplier Invoice</option>
              <option>Internal Note</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-medium">Final Claim Amount *</label>
            <div className="flex items-center gap-2">
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="rounded-md border px-2 py-2 h-9 text-[13px] w-20 mt-1">
                <option>€</option>
                <option>$</option>
                <option>£</option>
              </select>
              <input value={form.finalAmount} onChange={e => setForm(f => ({ ...f, finalAmount: e.target.value }))} className="flex-1 rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-medium">Comments/Remarks *</label>
            <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} rows={3} className="w-full rounded-md border px-3 py-2 text-[13px] mt-1" />
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-medium">Supplier Note No.</label>
            <input value={form.supplierNoteNo} onChange={e => setForm(f => ({ ...f, supplierNoteNo: e.target.value }))} className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
          </div>

          <div className="mb-2">
            <label className="text-xs text-gray-600 font-medium">Supplier Note Amount</label>
            <div className="flex items-center gap-2">
              <select value={form.supplierCurrency} onChange={e => setForm(f => ({ ...f, supplierCurrency: e.target.value }))} className="rounded-md border px-2 py-2 h-9 text-[13px] w-20 mt-1">
                <option>€</option>
                <option>$</option>
                <option>£</option>
              </select>
              <input value={form.supplierNoteAmount} onChange={e => setForm(f => ({ ...f, supplierNoteAmount: e.target.value }))} className="flex-1 rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
            </div>
          </div>
        </div>

        <div className="border-t bg-white px-6 py-3">
          <div className="flex justify-end">
            <Button className="bg-[#0073E6] text-white rounded-sm h-9 font-semibold" variant="default" onClick={handleSave}>Save Details</Button>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default ClaimFindings;
