import React, { useRef, useState, useEffect } from "react";
import {
  MoreVertical, Link as LinkIcon, Calendar, MapPin,
  Wrench, BadgeCheck, AlertCircle, UsersRound, FileText, Banknote,
  Settings, CirclePercent, Repeat1,
  Copy, Trash2,
  Filter,
} from "lucide-react";
import { ChevronDown, Search } from "lucide-react";
import Attachments from "../QuickOrderNew/OrderForm/Attachments";
import ResourceGroupDetailsForm from "../QuickOrderNew/ResourceGroupDetails";
import { SideDrawer } from "./SideDrawer";
import { format } from 'date-fns';
import { formattedAmount } from '@/utils/formatter';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { quickOrderService } from "@/api/services/quickOrderService";
import ResourceGroupSearch from "./ResourceGroupSearch";
interface CardStatus {
  label: string;
  color: string;
  bg: string;
  statusColor: string;
}

// const statusMap: Record<string, CardStatus> = {
//     Approved: { label: "Approved", color: "text-green-600", bg: "bg-green-50" },
//     Failed: { label: "Failed", color: "text-red-600", bg: "bg-red-50" },
//     "Under Amendment": { label: "Under Amendment", color: "text-orange-600", bg: "bg-orange-50" },
// };
const statusMap: any = {
  Approved: { label: "Approved", statusColor: "badge-green rounded-2xl", color: "text-green-600", bg: "bg-green-50" },
  Failed: { label: "Failed", statusColor: "badge-red rounded-2xl", color: "text-red-600", bg: "bg-red-50" },
  // "Under Amendment": { label: "Under Amendment", statusColor: "badge-orange rounded-2xl", color: "text-orange-600", bg: "bg-orange-50" },
  Released: { label: "Under Amendment", statusColor: 'badge-fresh-green rounded-2xl' },
  'Under Execution': 'badge-purple rounded-2xl',
  'Fresh': 'badge-blue rounded-2xl',
  'Cancelled': 'badge-red rounded-2xl',
  'Deleted': 'badge-red rounded-2xl',
  'Save': 'badge-green rounded-2xl',
  'Under Amendment': 'badge-orange rounded-2xl',
  'Confirmed': 'badge-green rounded-2xl',
  'Initiated': 'badge-blue rounded-2xl',
};

export interface CardDetailsItem {
  ResourceUniqueID: string;
  title: string;
  subtitle: string;
  BillingDetails: any;
  price: string;
  BasicDetails: any;
  repairType: string;
  OperationalDetails: any;
  rateType: string;
  location: string;
  draftBill: string;
  ResourceStatus: keyof typeof statusMap;
  PlanDetails: any
}

interface CardDetailsProps {
  data: CardDetailsItem[];
  isEditQuickOrder: boolean;
  passedQuickUniqueID?: string;
  // showMenuButton?: boolean; // New prop to control menu button visibility
}

interface GridResourceDetailsProps {
  resourceGroups: any[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  // Add other props as needed
}

const GridResourceDetails: React.FC<CardDetailsProps> = ({ data, isEditQuickOrder, passedQuickUniqueID }) => {
  // console.log("Data in GridResourceDetails:", data);
  // console.log("quickResourceId: ", passedQuickUniqueID);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isResourceGroup, setResourceGroupOpen] = useState({
    isResourceGroupOpen: false,
    ResourceUniqueID: "0"
  });
  const [isBack, setIsBack] = useState(true);
  const [resourceGroups, setResourceGroups] = useState<any[]>([]);
  const [filteredResourceGroups, setFilteredResourceGroups] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(passedQuickUniqueID || "");
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), "dd-MMM-yyyy");
  };

  const filteredOrders: any = data && data.length > 0
    ? data.map((order: any) => ({
      QuickUniqueID: order.QuickUniqueID,
      QuickOrderNo: order.QuickOrderNo,
      Status: order.Status,
    }))
    : [];

  const onValueChange = async (value: string) => {
    setSelectedValue(value);
    if (!value) return;
    try {
      const response: any = await quickOrderService.screenFetchQuickOrder(value);
      const jsonParsedData = JSON.parse(response?.data?.ResponseData || "null");
      if (jsonParsedData && Array.isArray(jsonParsedData.ResponseResult)) {
        setResourceGroups(jsonParsedData?.ResponseResult[0].ResourceGroup);
      } else {
        setResourceGroups([]);
      }
    } catch (error) {
      console.error("Failed to fetch resource groups for selected id:", error);
      setResourceGroups([]);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    async function fetchResourceGroups() {
      if (!passedQuickUniqueID) return;
      try {
        const response: any = await quickOrderService.screenFetchQuickOrder(passedQuickUniqueID);
        const jsonParsedData = JSON.parse(response?.data?.ResponseData || "null");
        if (jsonParsedData && Array.isArray(jsonParsedData.ResponseResult)) {
          setResourceGroups(jsonParsedData?.ResponseResult[0].ResourceGroup);
          setFilteredResourceGroups(jsonParsedData?.ResponseResult[0].ResourceGroup);
        } else {
          setResourceGroups([]);
          setFilteredResourceGroups([]);
        }
      } catch (error) {
        console.error("Failed to fetch resource groups:", error);
        setResourceGroups([]);
        setFilteredResourceGroups([]);
      }
    }
    fetchResourceGroups();
  }, [passedQuickUniqueID]);

  const handleResourceGroupSearch = (filteredGroups: any[]) => {
    setFilteredResourceGroups(filteredGroups);
  };

  return (
    <div>
      <div className="w-80 mb-3">
        <div className="relative flex border border-gray-300 rounded-md overflow-hidden bg-white text-sm">
          <select
            value={selectedValue}
            onChange={e => onValueChange(e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-700 focus:outline-none appearance-none pr-8"
          >
            <option value="">Select Items</option>
            {filteredOrders.map((item: any, idx: number) => (
              <option key={item.QuickUniqueID || idx} value={item.QuickUniqueID}>{`${item.QuickOrderNo} || ${item.Status.value}`}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Resource Group Details
        </h2>
        <div className="flex items-center gap-3">
          <ResourceGroupSearch
            resourceGroups={resourceGroups}
            onSearch={handleResourceGroupSearch}
          />
          <Button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 bg-gray-50 text-gray-600 p-0 border border-gray-300">
            <Filter className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredResourceGroups.map((item: any, index) => (
          <div key={'Resource' + index} className="bg-white rounded-lg border border-[#EAECF0] px-4 py-4 relative">
            <div className="flex items-start justify-between mb-4 border-b border-b-[#EAECF0] pb-4">
              <div>
                <div className="flex gap-4">
                  <span className="bg-[#F4F3FF] rounded-xl p-4">
                    <UsersRound className="w-5 h-5 text-violet-500" />
                  </span>
                  <div className="flex flex-col justify-evenly">
                    {/* <div className="font-semibold text-sm" onClick={() => setResourceGroupOpen({ isResourceGroupOpen: true, ResourceUniqueID: item.ResourceUniqueID })}>{item?.ResourceUniqueID} - {item?.BasicDetails[0]?.Resource}</div> */}
                    <div className="font-semibold text-sm">{item?.ResourceUniqueID} - {item?.BasicDetails[0]?.Resource}</div>
                    {/* <div className="text-xs text-gray-400">subtitle :{item.subtitle}</div> */}
                    <div className="text-xs text-gray-400">{item?.BasicDetails[0]?.ResourceType}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative">
                <span className={`px-2 py-1 rounded-full text-xs ${statusMap[item?.ResourceStatus]}`}>
                  {item?.ResourceStatus}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm mb-3">
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="truncate">{item?.PlanDetails[0]?.WagonDetails[0]?.WagonQuantity} Wagons</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <Banknote className="w-4 h-4 text-gray-600" />
                <span className="truncate">€ {formattedAmount(item?.BillingDetails[0]?.UnitPrice)}</span>
                {/* <span className="truncate">{item.price}</span> */}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="truncate">{item?.BasicDetails[0]?.ServiceType}</span>
                {/* <span className="truncate">{item.trainType}</span> */}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                {/* <Wrench className="w-4 h-4 text-gray-600" /> */}
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.99984 3.99935L7.74984 7.74935M3.99984 3.99935H1.49984L0.666504 1.49935L1.49984 0.666016L3.99984 1.49935V3.99935ZM15.049 1.28353L12.8593 3.47321C12.5293 3.80322 12.3643 3.96823 12.3025 4.1585C12.2481 4.32587 12.2481 4.50616 12.3025 4.67353C12.3643 4.8638 12.5293 5.02881 12.8593 5.35882L13.057 5.55654C13.387 5.88655 13.552 6.05156 13.7423 6.11338C13.9097 6.16777 14.09 6.16777 14.2574 6.11338C14.4476 6.05156 14.6126 5.88655 14.9426 5.55654L16.9909 3.50828C17.2115 4.04509 17.3332 4.63301 17.3332 5.24935C17.3332 7.78065 15.2811 9.83268 12.7498 9.83268C12.4447 9.83268 12.1465 9.80286 11.858 9.74596C11.4528 9.66606 11.2503 9.62611 11.1275 9.63835C10.9969 9.65136 10.9326 9.67093 10.8169 9.73283C10.7081 9.79106 10.599 9.9002 10.3807 10.1185L4.4165 16.0827C3.72615 16.773 2.60686 16.773 1.91651 16.0827C1.22615 15.3923 1.22615 14.273 1.91651 13.5827L7.88069 7.61849C8.09898 7.4002 8.20813 7.29106 8.26635 7.18226C8.32825 7.06658 8.34783 7.00224 8.36084 6.87169C8.37307 6.74889 8.33312 6.54633 8.25323 6.14122C8.19633 5.85273 8.1665 5.55452 8.1665 5.24935C8.1665 2.71804 10.2185 0.666016 12.7498 0.666016C13.5878 0.666016 14.3732 0.890868 15.049 1.28353ZM8.99988 11.4993L13.5832 16.0826C14.2735 16.7729 15.3928 16.7729 16.0832 16.0826C16.7735 15.3922 16.7735 14.2729 16.0832 13.5826L12.3126 9.8121C12.0457 9.78684 11.7854 9.73868 11.5338 9.66963C11.2096 9.58064 10.854 9.64523 10.6162 9.88296L8.99988 11.4993Z" stroke="#475467" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="truncate">{item?.BasicDetails[0]?.SubServiceType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs relative group">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="truncate cursor-pointer">
                  {formatDate(item.OperationalDetails[0]?.FromDate)} to {formatDate(item?.OperationalDetails[0]?.ToDate)}
                </span>
                {/* <span className="truncate cursor-pointer">
                                {item.date}
                            </span> */}

                <div className="absolute left-0 top-4 z-30 hidden group-hover:block min-w-[180px] max-w-xs bg-[#344054] text-white rounded-lg shadow-xl border border-gray-200 text-xs">
                  <div className="py-2 pl-[14px] pr-[14px]">
                    <div className="font-semibold mb-1">From and To Date</div>
                    <div className="text-[11px] font-medium">{formatDate(item.OperationalDetails[0]?.FromDate)} to {formatDate(item?.OperationalDetails[0]?.ToDate)}</div>
                    {/* <div className="text-[11px] font-medium">{item.date}</div> */}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <CirclePercent className="w-4 h-4 text-gray-600" />
                <span className="truncate">{item?.BillingDetails[0].TariffType}</span>
                <div className="relative group inline-block">
                  <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
                  <div className="absolute right-0 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                    <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                      {item?.BillingDetails[0].TariffType}
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-gray-700">{item?.BillingDetails[0]?.Tariff}</div>
                        <div className="font-semibold text-gray-700">€ {formattedAmount(item?.BillingDetails[0]?.UnitPrice)}</div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                        <div>Tariff ID</div>
                        <div>Unit Price</div>
                      </div>

                      <div className="text-[11px] text-gray-400 mb-1 pt-2 border-t border-gray-300">Tariff Description</div>
                      <div className="text-xs text-gray-700 font-medium">
                        {item?.BillingDetails[0].TariffTypeDescription}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 col-span-2 text-xs relative group">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="truncate cursor-pointer">{item?.OperationalDetails[0].OperationalLocationDesc}</span>
                <div className="absolute left-0 top-4 z-30 hidden group-hover:block min-w-[180px] max-w-xs bg-[#344054] text-white rounded-lg shadow-xl border border-gray-200 text-xs">
                  <div className="py-2 pl-[14px] pr-[14px]">
                    {/* <div className="font-semibold mb-1">From and To Date</div> */}
                    <div className="text-[11px] font-medium">{item.OperationalDetails[0]?.OperationalLocationDesc} || {item.OperationalDetails[0]?.OperationalLocation}</div>
                    {/* <div className="text-[11px] font-medium">{item.date}</div> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center text-blue-600 text-xs font-medium mt-2 gap-2">
              <LinkIcon className="w-4 h-4" />
              {/* <span className="cursor-pointer">Draft Bill : {item?.BillingDetails[0].DraftBillNo}</span> */}
              <span className="cursor-pointer">Draft Bill : {item?.BillingDetails[0].DraftBillNo}</span>
            </div>
          </div>
        ))}
        <SideDrawer
          isOpen={isResourceGroup.isResourceGroupOpen}
          onClose={() => setResourceGroupOpen({ isResourceGroupOpen: false, ResourceUniqueID: "0" })}
          width="100%"
          title="Resource Group Details"
          isBack={isBack}
        >
          <div className="text-sm text-gray-600">
            <ResourceGroupDetailsForm isEditQuickOrder={isEditQuickOrder} resourceId={isResourceGroup.ResourceUniqueID} />
          </div>
        </SideDrawer>
      </div>
    </div>
  );
};

export default GridResourceDetails;