import React, { useMemo, useState } from 'react';
import { SideDrawer } from '../Common/SideDrawer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Filter, Plus } from 'lucide-react';

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

  const claims = useMemo(() => {
    if (!query) return sampleClaims;
    return sampleClaims.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || (c.reference || '').toLowerCase().includes(query.toLowerCase()));
  }, [query]);

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
                  <button className="p-1 rounded-lg text-gray-600 hover:bg-blue-50 border border-[#D0D5DD]" title="Add">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {claims.map(c => (
                  <div key={c.id} className="p-4 rounded-lg border bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">{c.typeLetter}</div>
                        <div>
                          <div className="font-semibold text-sm">{c.title}</div>
                          <div className="text-xs text-gray-500">{c.subtitle}</div>
                        </div>
                      </div>
                      <div className="text-xs badge-gray rounded-2xl">{c.status}</div>
                    </div>

                    <div className="text-xs text-gray-600 mb-3">{c.reference}</div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div>{c.date}</div>
                      <div className="font-semibold">{c.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="internal">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-md font-semibold text-gray-600">Total Net Amount
                  <span className="ml-4 inline-flex items-center gap-2">
                    <span className="badge-blue rounded-2xl px-2 py-0.5 text-xs">Customer € 45595.00</span>
                    <span className="badge-blue rounded-2xl px-2 py-0.5 text-xs">Supplier € 45595.00</span>
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center border rounded-md px-2 py-1 bg-white">
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="ml-2 outline-none text-sm w-56" />
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  {/* <button className="p-2 rounded-md border bg-white"><Filter className="w-4 h-4 text-gray-600" /></button> */}
                  {/* <button className="p-2 rounded-md border bg-white h-9">+</button> */}
                  <button className="p-1 rounded-lg text-gray-600 hover:bg-blue-50 border border-[#D0D5DD]" title="Add">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {sampleIO.map(io => (
                  <div key={io.id} className="p-4 rounded-lg border bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-semibold">{io.typeLetter}</div>
                        <div>
                          <div className="font-semibold text-sm">{io.title}</div>
                          <div className="text-xs text-gray-500">{io.subtitle}</div>
                        </div>
                      </div>
                      <div className="text-xs badge-gray rounded-2xl">{io.status}</div>
                    </div>

                    <div className="text-xs text-gray-600 mb-3">{io.reference}</div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2"><span className="text-gray-400">📄</span> <span>{'CUS3433200/01'}</span></div>
                      <div className="flex items-center justify-end">{io.amount}</div>
                      <div className="flex items-center gap-2"><span className="text-gray-400">📁</span> <span>{'QO038200/32'}</span></div>
                      <div className="flex items-center justify-end">{io.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </SideDrawer>
  );
};

export default ClaimLinkedInternalOrders;
