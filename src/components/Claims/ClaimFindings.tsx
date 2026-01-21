import React, { useEffect, useState } from "react";
import { SideDrawer } from "../Common/SideDrawer";
import { Button } from "@/components/ui/button";
import { DynamicLazySelect } from "../DynamicPanel/DynamicLazySelect";
import { DynamicLazySelect1 } from "../DynamicPanel/DynamicLazySelect1";
import { quickOrderService } from "@/api/services";

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
  onSave?: (data: any) => void;
  apiData?: any;
}> = ({ isOpen, onClose, onSave, apiData }) => {
  const [form, setForm] = useState<any>({});
  const [currencyList, setCurrencyList] = useState<any>();


  useEffect(() => {
    const loadQcMasters = async () => {
      try {
        const currencyList: any = await quickOrderService.getMasterCommonData({ messageType: "Currency Init" })
        console.log("res1?.data?.ResponseData", JSON.parse(currencyList?.data?.ResponseData));
        let mappedData = JSON.parse(currencyList?.data?.ResponseData || "[]")
          ?.filter((qc) => qc.id)
          .map((qc) => ({
            label: `${qc.id} || ${qc.name}`,
            value: qc.id,
            name: qc.name
          })) || [];
        setCurrencyList(mappedData);
      } catch (err) {
        console.error("QC API failed", err);
      }
    };
    loadQcMasters();
  }, []);

  // Initialize/refresh form when drawer opens or when apiData/initial change.
  useEffect(() => {
    if (!isOpen) return;

    if (apiData) {
      setForm({
        ...apiData?.ClaimFindings,
        CreditNoteBasedOnAdjustmentDoc: apiData?.ClaimFindings?.CreditNoteBasedOnAdjustmentDoc || "",
        FinalClaimAmount: apiData?.ClaimFindings?.FinalClaimAmount || "",
        Currency: apiData?.ClaimFindings?.Currency.trim() || "€",
        CommentRemark: apiData?.ClaimFindings?.CommentRemark || "",
        SupplierNoteNo: apiData?.ClaimFindings?.SupplierNoteNo || "",
        SupplierNoteAmount: apiData?.ClaimFindings?.SupplierNoteAmount || "",
        // supplierCurrency: apiData?.ClaimFindings?.Currency || "€",
      });
      return;
    }

    // if (initial) {
    //   setForm(prev => ({ ...prev, ...initial }));
    // }
  }, [isOpen, apiData]);

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

  const fetchUsageIDOptions = fetchMasterData("Claim Usage ID Init");

  const handleSave = () => {
    if (onSave) onSave(form);
    console.log("Saved Claim Findings:", form);
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
            <label className="text-xs text-gray-600 font-medium">Credit Note Based on Adjustment Doc. Type/No. <span className="text-red-500">*</span></label>
            <input value={form.CreditNoteBasedOnAdjustmentDoc} readOnly className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-medium">Final Claim Amount <span className="text-red-500">*</span></label>
            <div className="flex items-center">
              <select disabled value={form.Currency} onChange={e => setForm(f => ({ ...f, Currency: e.target.value, ModeFlag: 'Update' }))} className="rounded-l-md border px-2 py-2 h-9 text-[13px] w-20 mt-1">
                {/* <option>€</option>
                <option>$</option>
                <option>£</option> */}
                {currencyList?.map((currency: any) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.value}
                  </option>
                ))}
              </select>
              <input type="number" min={0} value={form.FinalClaimAmount} onChange={e => setForm(f => ({ ...f, FinalClaimAmount: e.target.value, ModeFlag: 'Update' }))} className="flex-1 rounded-r-md border border-l-0 px-3 py-2 h-9 text-[13px] mt-1" />
            </div>
          </div>
          {
            form?.CreditNoteBasedOnAdjustmentDoc?.toString().toLowerCase().includes('no source invoice') &&
            (<div className="mb-4">
              <label className="text-xs text-gray-600 font-medium">Usage ID/GL Account <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <DynamicLazySelect
                  fetchOptions={fetchUsageIDOptions}
                  value={form.UsageIDOrGLAccount}
                  onChange={(value) => setForm(f => ({ ...f, UsageIDOrGLAccount: value as string, ModeFlag: 'Update' }))}
                  placeholder="Select Type"
                  className="flex-1 rounded-md border px-3 py-2 h-9 text-[13px] mt-1"
                  hideSearch={true}
                />
              </div>
            </div>)
          }

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-medium">Comments/Remarks <span className="text-red-500">*</span></label>
            <textarea value={form.CommentRemark} onChange={e => setForm(f => ({ ...f, CommentRemark: e.target.value, ModeFlag: 'Update' }))} rows={3} className="w-full rounded-md border px-3 py-2 text-[13px] mt-1" />
          </div>

          {form?.CreditNoteBasedOnAdjustmentDoc?.toString().toLowerCase().includes('supplier invoice') && (
            <>
              <div className="mb-4">
                <label className="text-xs text-gray-600 font-medium">Supplier Note No.</label>
                <input value={form.SupplierNoteNo} onChange={e => setForm(f => ({ ...f, SupplierNoteNo: e.target.value, ModeFlag: 'Update' }))} className="w-full rounded-md border px-3 py-2 h-9 text-[13px] mt-1" />
              </div>

              <div className="mb-2">
                <label className="text-xs text-gray-600 font-medium">Supplier Note Amount</label>
                <div className="flex items-center">
                  <select disabled value={form.Currency} onChange={e => setForm(f => ({ ...f, Currency: e.target.value, ModeFlag: 'Update' }))} className="rounded-l-md border px-2 py-2 h-9 text-[13px] w-20 mt-1">
                    {/* <option>€</option>
                  <option>$</option>
                  <option>£</option> */}
                    {currencyList?.map((currency: any) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.value}
                      </option>
                    ))}
                  </select>
                  <input type="number" min={0} value={form.SupplierNoteAmount} onChange={e => setForm(f => ({ ...f, SupplierNoteAmount: e.target.value, ModeFlag: 'Update' }))} className="flex-1 rounded-r-md border border-l-0 px-3 py-2 h-9 text-[13px] mt-1" />
                </div>
              </div>
            </>
          )}
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
