import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { SideDrawer } from '../Common/SideDrawer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Filter, Plus, LucidePaperclip, Link, Users, FileText, Calendar, Banknote, ReceiptText, Type } from 'lucide-react';
import { DynamicLazySelect } from '../DynamicPanel/DynamicLazySelect';
import { quickOrderService } from '@/api/services';
import { ClaimService } from '@/api/services/ClaimService';
import { dateFormatter } from '@/utils/formatter';
import { link } from 'fs';

type ClaimCard = {
  id: string;
  typeLetter: string;
  title: string;
  subtitle?: string;
  reference?: string;
  date?: string;
  amount?: string;
  status?: string;
};

const sampleClaims: ClaimCard[] = [
  { id: 'c1', typeLetter: 'C', title: 'CLM/2025/00000498', subtitle: 'Compensation', reference: '46700070 - Hexafret', date: '12-Apr-2025', amount: '€ 23388.00', status: 'Sell' },
  { id: 'c2', typeLetter: 'S', title: 'CLM/2025/00000498', subtitle: 'Compensation', reference: '46700070 - Hexafret', date: '12-Apr-2025', amount: '€ 23388.00', status: 'Buy' },
  { id: 'c3', typeLetter: 'S', title: 'CLM/2025/00000498', subtitle: 'Compensation', reference: '46700070 - Hexafret', date: '12-Apr-2025', amount: '€ 23388.00', status: 'Buy' }
];

const sampleIO: ClaimCard[] = [
  { id: 'io1', typeLetter: 'C', title: 'IO/0000000042', subtitle: 'CON000000439', reference: 'XYZ Manufacturer Pvt. Ltd.', date: '12-Mar-2025', amount: '€ 45595.00', status: 'Sell' },
  { id: 'io2', typeLetter: 'S', title: 'IO/0000000042', subtitle: 'CON000000439', reference: 'XYZ Manufacturer Pvt. Ltd.', date: '12-Mar-2025', amount: '€ 45595.00', status: 'Buy' },
  { id: 'io3', typeLetter: 'C', title: 'IO/0000000042', subtitle: 'CON000000439', reference: 'XYZ Manufacturer Pvt. Ltd.', date: '12-Mar-2025', amount: '€ 45595.00', status: 'Sell' },
  { id: 'io4', typeLetter: 'S', title: 'IO/0000000042', subtitle: 'CON000000439', reference: 'XYZ Manufacturer Pvt. Ltd.', date: '12-Mar-2025', amount: '€ 45595.00', status: 'Buy' }
];

export const ClaimLinkedInternalOrders: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  claimNo?: string;
}> = ({ isOpen, onClose, claimNo }) => {
  const [activeTab, setActiveTab] = useState<'claims' | 'internal'>('claims');
  const [query, setQuery] = useState('');
  const [showLinkClaimDialog, setShowLinkClaimDialog] = useState(false);
  const [showLinkInternalOrderDialog, setShowLinkInternalOrderDialog] = useState(false);
  const [linkClaimObj, setLinkClaimObj] = useState<any>({
    Type: '',
    Category: '',
    ClaimNo: ''
  });
  const [linkInternalOrderObj, setLinkInternalOrderObj] = useState<any>({
    Type: '',
    Contract: '',
    InternalOrderNo: ''
  });

  const [linkedClaims, setLinkedClaims] = useState<any[]>([]);
  const [linkedInternalOrders, setLinkedInternalOrders] = useState<any[]>([]);
  const [isLoadingLinked, setIsLoadingLinked] = useState(false);

  const claims = useMemo(() => {
    const source = linkedClaims.length ? linkedClaims : [];
    if (!query) return source;
    return source.filter((c: any) => {
      const title = (c.ClaimNo || c.title || '').toString().toLowerCase();
      const ref = (c.PartyName || c.reference || '').toString().toLowerCase();
      return title.includes(query.toLowerCase()) || ref.includes(query.toLowerCase());
    });
  }, [query, linkedClaims]);

  const internalOrders = useMemo(() => {
    const source = linkedInternalOrders.length ? linkedInternalOrders : [];
    if (!query) return source;
    const q = query.toLowerCase();
    return source.filter((io: any) => {
      const title = (io.InternalOrderNo || io.title || '').toString().toLowerCase();
      const party = (io.PartyName || io.reference || '').toString().toLowerCase();
      const contract = (io.ContractId || io.Contract || '').toString().toLowerCase();
      const refNo = (io.ReferenceNo || '').toString().toLowerCase();
      return title.includes(q) || party.includes(q) || contract.includes(q) || refNo.includes(q);
    });
  }, [query, linkedInternalOrders]);

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
  const fetchMasterDataOnSelection = (messageType: string, extraParams?: Record<string, any>) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await ClaimService.getOnSelectClaimLinked({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
        Type: extraParams?.Type || '',
        Category: extraParams?.Category || '',
        Contract: extraParams?.Contract || '',
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

  const splitPipeValue = (value: string | null | undefined): string => {
    if (!value || typeof value !== 'string') return '';
    // Split by "||" and return the code part (first part) trimmed
    const parts = value.split('||');
    return parts[0]?.trim() || '';
  }

  const fetchTypes = fetchMasterData("Claim For Init");
  const fetchCategories = fetchMasterData("Claim Category Init");
  const fetchClaims = fetchMasterDataOnSelection("Claim No Init", {
    // You can pass additional parameters based on selected Type and Category
    Type: linkClaimObj.Type ? splitPipeValue(linkClaimObj.Type) : '',
    Category: linkClaimObj.Category ? splitPipeValue(linkClaimObj.Category) : '',
  });
  const fetchContracts = [{ label: 'Buy', value: 'Buy' }, { label: 'Sell', value: 'Sell' }]; //fetchMasterData("Contract Init");
  const fetchInternalOrderNo = fetchMasterDataOnSelection("Internal Order No Init", {
    // You can pass additional parameters based on selected Type and Contract
    Type: linkInternalOrderObj.Type ? splitPipeValue(linkInternalOrderObj.Type) : '',
    Contract: linkInternalOrderObj.Contract ? splitPipeValue(linkInternalOrderObj.Contract) : '',
  });

  // Reusable fetchLinked function to load linked claims/internal orders
  const mountedRef = useRef(true);
  const fetchLinked = useCallback(async () => {
    if (!isOpen) return;
    if (!claimNo) {
      setLinkedClaims([]);
      setLinkedInternalOrders([]);
      return;
    }

    setIsLoadingLinked(true);
    try {
      const resp: any = await ClaimService.getLinkedIOClaims({ claimNo });
      const parsed = JSON.parse(resp?.data?.ResponseData || '{}');
      const record = Array.isArray(parsed?.ResultSet) && parsed.ResultSet.length > 0 ? parsed.ResultSet[0] : parsed;
      const lc = record?.LinkedClaims || [];
      const li = record?.LinkedInternalOrders || [];
      if (!mountedRef.current) return;
      setLinkedClaims(lc || []);
      setLinkedInternalOrders(li || []);
    } catch (err) {
      console.error('Failed to load linked claims/internal orders:', err);
      if (mountedRef.current) {
        setLinkedClaims([]);
        setLinkedInternalOrders([]);
      }
    } finally {
      if (mountedRef.current) setIsLoadingLinked(false);
    }
  }, [claimNo, isOpen]);

  useEffect(() => {
    mountedRef.current = true;
    fetchLinked();
    return () => { mountedRef.current = false; };
  }, [fetchLinked]);

  const saveLinkedClaimOrders = async (type: any) => {
    if (!claimNo) return;
    const RequestPayload = {
      Header: {
        ClaimNo: claimNo
      },
      LinkedOrders: type === 'claims' ? [
        {
          LinkedDocNo: linkClaimObj.ClaimNo ? splitPipeValue(linkClaimObj.ClaimNo) : '',
          LinkedDocType: "Claims",
          ModeFlag: "Insert"
        }
      ] : type === 'internal order' ? [
        {
          LinkedDocNo: linkInternalOrderObj.InternalOrderNo ? splitPipeValue(linkInternalOrderObj.InternalOrderNo) : '',
          LinkedDocType: "InternalOrderNo",
          ModeFlag: "Insert"
        }
      ] : []
    };
    try {
      setIsLoadingLinked(true);
      console.log('Calling saveLinkedClaimOrders API...');
      const response = await ClaimService.saveLinkedClaimOrders({ RequestPayload });
      console.log('Save Linked Claims/IO API Response:', response);

      if (response?.data?.IsSuccess) {
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse ResponseData:', parseError);
        }

        const successMessage = responseData?.Message || response?.data?.Message || "Claim cancelled successfully.";
        const reasonCode = responseData?.ReasonCode || "";

        // toast({
        //   title: "✅ Claim Cancelled",
        //   description: `${successMessage}${reasonCode ? ` (${reasonCode})` : ""}`,
        //   variant: "default",
        // });

        // Refresh claim data after successful cancellation
        if (claimNo) {
          await fetchLinked();
        }
        setLinkClaimObj({ Type: '', Category: '', ClaimNo: '' });
        setLinkInternalOrderObj({ Type: '', Contract: '', InternalOrderNo: '' });
        setShowLinkClaimDialog(false);
        setShowLinkInternalOrderDialog(false);
        setIsLoadingLinked(false);
      } else {
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed Error ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse error ResponseData:', parseError);
        }

        const errorMessage = responseData?.Message || responseData?.Errormessage || response?.data?.Message || "Claim cancellation failed.";

        // toast({
        //   title: "⚠️ Claim Cancellation Failed",
        //   description: errorMessage,
        //   variant: "destructive",
        // });
        setIsLoadingLinked(false);
      }
    } catch (error) {
      console.error('Cancel Claim API Error:', error);
      setIsLoadingLinked(false);

      let errorMessage = "An unexpected error occurred while cancelling the claim.";
      if ((error as any)?.response?.data?.Message) {
        errorMessage = (error as any).response.data.Message;
      } else if ((error as any)?.message) {
        errorMessage = (error as any).message;
      }

      // toast({
      //   title: "Error cancelling claim",
      //   description: errorMessage,
      //   variant: "destructive",
      // });
    }
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="80%"
      title="Linked Claims and Internal Order"
      isBack={false}
      contentBgColor="#ffffff"
      onScrollPanel={true}
      isBadgeRequired={true}
      badgeContent={claimNo || ''}
    // badgeContent could be dynamic
    >
      <div className="flex flex-col h-full bg-[#F8F9FC]">
        <style>{`
          .investigation-scroll { scroll-behavior: smooth; scrollbar-width: thin; -ms-overflow-style: auto; }
          .investigation-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
          .investigation-scroll::-webkit-scrollbar-track { background: transparent; }
          .investigation-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.2); border-radius: 6px; }
          .investigation-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.35); }
        `}</style>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="bg-[#EBEFF9] rounded-lg h-[36px]">
                <TabsTrigger value="claims" className={`px-4 py-1 text-[12px] font-normal transition-all rounded-md h-[26px] 
                  data-[state=active]:bg-white
                  data-[state=active]:text-[#0073E6]
                  data-[state=active]:font-medium
                  data-[state=active]:shadow-sm
                  data-[state=inactive]:text-[#475467]
                `}>Claims</TabsTrigger>
                <TabsTrigger value="internal"
                  className={`px-4 py-1 text-[12px] font-normal transition-all rounded-md h-[26px] 
                  data-[state=active]:bg-white
                  data-[state=active]:text-[#0073E6]
                  data-[state=active]:font-medium
                  data-[state=active]:shadow-sm
                  data-[state=inactive]:text-[#475467]
                `}>Internal Order</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 overflow-auto investigation-scroll p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsContent value="claims">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-md font-semibold text-gray-600">Total Claims <span className="ml-2 badge-blue rounded-2xl text-xs">{claims.length}</span></div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center border rounded-md px-2 py-1 bg-white">
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="ml-2 outline-none text-sm w-56" />
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  {/* <button className="p-2 rounded-md border bg-white"><Filter className="w-4 h-4 text-gray-600" /></button> */}
                  {/* <button className="p-2 rounded-md border bg-white h-9">+</button> */}
                  <button className="p-1 rounded-lg text-gray-600 hover:bg-blue-50 border border-[#D0D5DD]"
                    title="Add Claim"
                    onClick={() => {
                      setLinkClaimObj({ Type: '', Category: '', ClaimNo: '' });
                      setShowLinkClaimDialog(true)
                    }
                    }
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Link Claim Modal (fixed overlay format) */}
              {showLinkClaimDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowLinkClaimDialog(false)} />
                  <div className="relative bg-white rounded-lg w-[350px] shadow-lg z-10">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EAF4FF] text-[#0068CF] flex items-center justify-center">
                          <Link size={16} />
                        </div>
                        <div className="font-semibold text-sm text-gray-700">Link Claim</div>
                      </div>
                      <button onClick={() => setShowLinkClaimDialog(false)} className="text-gray-400">✕</button>
                    </div>

                    <div className="space-y-3 px-6 py-4 border-b">
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Type</label>
                        <DynamicLazySelect
                          fetchOptions={fetchTypes}
                          value={linkClaimObj.Type}
                          onChange={(value) => setLinkClaimObj({ ...linkClaimObj, Type: value as string })}
                          placeholder="Select Type"
                          className="w-full h-9 text-[13px] mt-1"
                          hideSearch={true}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 font-medium">Category</label>
                        <DynamicLazySelect
                          fetchOptions={fetchCategories}
                          value={linkClaimObj.Category}
                          onChange={(value) => setLinkClaimObj({ ...linkClaimObj, Category: value as string })}
                          placeholder="Select Category"
                          className="w-full h-9 text-[13px] mt-1"
                          hideSearch={true}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 font-medium">Claim No.</label>
                        <DynamicLazySelect
                          fetchOptions={fetchClaims}
                          value={linkClaimObj.ClaimNo}
                          onChange={(value) => setLinkClaimObj({ ...linkClaimObj, ClaimNo: value as string })}
                          placeholder="Select Claim No."
                          className="w-full h-9 text-[13px] mt-1 z-9999"
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <button onClick={() => {
                        saveLinkedClaimOrders('claims');
                        console.log('Link Claim payload:', linkClaimObj);
                        // TODO: emit payload to parent via prop or API call
                        // setShowLinkClaimDialog(false);
                        // setLinkClaimObj({ Type: '', Category: '', ClaimNo: '' });
                      }} className="w-full bg-blue-600 text-white py-2 rounded">Save</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                {claims.map((c: any, idx: number) => {
                  const partyType = typeof c.PartyType === 'string' ? c.PartyType.toLowerCase() : '';
                  const PartType = partyType === 'customer' ? 'C' : 'S';
                  const ClaimNo = c.ClaimNo || '';
                  const Category = c.ClaimCategoryDescription || c.ClaimCategory || '';
                  const PartyName = c.PartyName ? `${c.PartyName}${c.PartyCode ? ` - ${c.PartyCode}` : ''}` : '';
                  const RefDocs = c.RefDocType ? `${c.RefDocType}${c.RefDocNo ? ` - ${c.RefDocNo}` : ''}` : '';
                  const ClaimDate = c.ClaimDate ? dateFormatter(c.ClaimDate) : '';
                  const Amount =
                    c.Amount || c.amount
                      ? `${c.Currency?.includes('EUR') ? '€' : ''} ${c.Amount || c.amount}`.trim()
                      : '';
                  const status = c.ContractType ? c.ContractType : '';

                  return (
                    <div key={ClaimNo + idx} className="p-4 rounded-lg border bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">{PartType}</div>
                          <div>
                            <div className="font-semibold text-sm">{ClaimNo}</div>
                            <div className="text-xs text-gray-500">{Category}</div>
                          </div>
                        </div>
                        <div className="text-xs badge-gray rounded-2xl">{status}</div>
                      </div>

                      <div className="text-[13px] text-gray-700 font-normal mb-3 flex gap-2"><Users className='inline' size={16} color='#475467' />{PartyName}</div>
                      <div className="text-[13px] text-gray-700 font-normal mb-3 flex gap-2"><FileText className='inline' size={16} color='#475467' />{RefDocs}</div>
                      <div className="flex items-center justify-between text-[13px] text-gray-700">
                        <div className="flex items-center gap-2 font-normal"><Calendar className='inline' size={16} color='#475467' />{ClaimDate}</div>
                        <div className="flex items-center gap-2 font-normal"><Banknote className='inline' size={16} color='#475467' />{Amount}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="internal">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-md font-semibold text-gray-600">Total Net Amount
                  <span className="ml-4 inline-flex items-center gap-2">
                    {/* <span className="badge-blue rounded-2xl px-2 py-0.5 text-xs">Customer € 45595.00</span> */}
                    {/* <span className="badge-blue rounded-2xl px-2 py-0.5 text-xs">Supplier € 45595.00</span> */}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center border rounded-md px-2 py-1 bg-white">
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="ml-2 outline-none text-sm w-56" />
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  {/* <button className="p-2 rounded-md border bg-white"><Filter className="w-4 h-4 text-gray-600" /></button> */}
                  {/* <button className="p-2 rounded-md border bg-white h-9">+</button> */}
                  <button className="p-1 rounded-lg text-gray-600 hover:bg-blue-50 border border-[#D0D5DD]"
                    title="Add Internal Order"
                    onClick={() => {
                      console.log('Add Internal Orders Dialog');
                      setLinkInternalOrderObj({ Type: '', Contract: '', InternalOrderNo: '' });
                      setShowLinkInternalOrderDialog(true);
                    }}>
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Link Internal Order Modal (fixed overlay format) */}
              {showLinkInternalOrderDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowLinkInternalOrderDialog(false)} />
                  <div className="relative bg-white rounded-lg w-[350px] shadow-lg z-10">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EAF4FF] text-[#0068CF] flex items-center justify-center">
                          <Link size={16} />
                        </div>
                        <div className="font-semibold text-sm text-gray-700">Link Internal Order</div>
                      </div>
                      <button onClick={() => setShowLinkInternalOrderDialog(false)} className="text-gray-400">✕</button>
                    </div>

                    <div className="space-y-3 px-6 py-4 border-b">
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Type</label>
                        <DynamicLazySelect
                          fetchOptions={fetchTypes}
                          value={linkInternalOrderObj.Type}
                          onChange={(value) => setLinkInternalOrderObj({ ...linkInternalOrderObj, Type: value as string })}
                          placeholder="Select Type"
                          className="w-full h-9 text-[13px] mt-1"
                          hideSearch={true}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 font-medium">Contract</label>
                        <DynamicLazySelect
                          fetchOptions={async ({ searchTerm, offset, limit }) => {
                            // For demo, using static options. Replace with actual API call if needed.
                            return fetchContracts;
                          }}
                          value={linkInternalOrderObj.Contract}
                          onChange={(value) => setLinkInternalOrderObj({ ...linkInternalOrderObj, Contract: value as string })}
                          placeholder="Select Contract"
                          className="w-full h-9 text-[13px] mt-1"
                          hideSearch={true}
                        />
                        {/* select */}
                        {/* <select
                          value={linkInternalOrderObj.Contract}
                          onChange={(e) => setLinkInternalOrderObj({ ...linkInternalOrderObj, Contract: e.target.value })}
                          className="w-full h-9 text-[13px] mt-1 border border-gray-300 rounded-md px-2"
                        >
                          {fetchContracts.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select> */}
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 font-medium">Internal Order No.</label>
                        <DynamicLazySelect
                          fetchOptions={fetchInternalOrderNo}
                          value={linkInternalOrderObj.InternalOrderNo}
                          onChange={(value) => setLinkInternalOrderObj({ ...linkInternalOrderObj, InternalOrderNo: value as string })}
                          placeholder="Internal Order No."
                          className="w-full h-9 text-[13px] mt-1 z-9999"
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <button onClick={() => {
                        saveLinkedClaimOrders('internal order')
                        console.log('Link Internal Order payload:', linkInternalOrderObj);
                        // TODO: emit payload to parent via prop or API call
                        // setShowLinkInternalOrderDialog(false);
                        // setLinkInternalOrderObj({ Type: '', Contract: '', InternalOrderNo: '' });
                      }} className="w-full bg-blue-600 text-white py-2 rounded">Save</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                {internalOrders.map((io: any, idx: number) => {
                  const InternalOrderNo = io.InternalOrderNo || '';
                  const ContractId = io.ContractId || io.Contract || '';
                  const PartyType = (typeof io.PartyType === 'string' ? io.PartyType.toLowerCase() : '') === 'vendor' ? 'S' : 'C';
                  const PartyName = io.PartyName ? `${io.PartyName}${io.PartyCode ? ` - ${io.PartyCode}` : ''}` : '';
                  const ReferenceNo = io.ReferenceNo || '';
                  const OrderDate = io.OrderDate ? dateFormatter(io.OrderDate) : '';
                  const Amount =
                    io.Amount || io.amount
                      ? `${io.Currency?.includes('EUR') ? '€' : ''} ${io.Amount || io.amount}`.trim()
                      : ''; const ContractType = io.ContractType || '';

                  return (
                    <div key={InternalOrderNo + idx} className="p-4 rounded-lg border bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-semibold">{PartyType}</div>
                          <div>
                            <div className="font-semibold text-sm">{InternalOrderNo}</div>
                            <div className="text-xs text-gray-500">{ContractId}</div>
                          </div>
                        </div>
                        <div className="text-xs badge-gray rounded-2xl">{ContractType}</div>
                      </div>

                      <div className="text-[13px] text-gray-700 font-normal mb-3 flex gap-2"><Users className='inline' size={16} color='#475467' />{PartyName}</div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="text-[13px] mb-3 flex items-center gap-2 font-normal"><ReceiptText className='inline' size={16} color='#475467' />{ReferenceNo}</div>
                        <div className="text-[13px] mb-3 flex items-center gap-2 font-normal"><Banknote className='inline' size={16} color='#475467' />{Amount}</div>
                        {/* <div className="flex items-center gap-2"><span className="text-gray-400">📁</span> <span>{io.ContractId || io.subtitle || '—'}</span></div> */}
                        <div className="text-[13px] mb-3 flex items-center gap-2 font-normal"><Calendar className='inline' size={16} color='#475467' />{OrderDate}</div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </SideDrawer>
  );
};

export default ClaimLinkedInternalOrders;
