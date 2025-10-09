import React, { useRef, useState, useEffect } from "react";
import {
    MoreVertical, Link as LinkIcon, Calendar, MapPin,
    Wrench, BadgeCheck, AlertCircle, UsersRound, FileText, Banknote,
    Settings, CirclePercent, Repeat1,
    Copy, Trash2, PlaneLanding, PlaneTakeoff, Files, File, Wallet
} from "lucide-react";
import Attachments from "../QuickOrderNew/OrderForm/Attachments";
import ResourceGroupDetailsForm from "../QuickOrderNew/ResourceGroupDetails";
import { SideDrawer } from "./SideDrawer";
import { dateFormatter, formattedAmount } from "@/utils/formatter";
import { format } from 'date-fns';
import jsonStore from '@/stores/jsonStore';
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
const statusMap: Record<string, CardStatus> = {
    Approved: { label: "Approved", statusColor: "badge-green rounded-2xl", color: "text-green-600", bg: "bg-green-50" },
    Failed: { label: "Failed", statusColor: "badge-red rounded-2xl", color: "text-red-600", bg: "bg-red-50" },
    "Under Amendment": { label: "Under Amendment", statusColor: "badge-orange rounded-2xl", color: "text-orange-600", bg: "bg-orange-50" },
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
    MoreRefDocs: any;
    status: keyof typeof statusMap;
}

interface CardDetailsProps {
    data: CardDetailsItem[];
    isEditQuickOrder: boolean;
    showMenuButton?: boolean; // New prop to control menu button visibility
    onDeleteResourceGroup?: (item: CardDetailsItem) => void;
    onCopyResourceGroup?: (item: CardDetailsItem) => void;
}

const CardDetails: React.FC<CardDetailsProps> = ({ data, isEditQuickOrder, showMenuButton = true, onDeleteResourceGroup, onCopyResourceGroup }) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isResourceGroup, setResourceGroupOpen] = useState({
        isResourceGroupOpen: false,
        ResourceUniqueID: "0",
        initialStep: 1
    });
    const [items, setItems] = useState<any[]>(data || []);
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return format(new Date(dateStr), "dd-MMM-yyyy");
    };
    const [isBack, setIsBack] = useState(true);
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

    const closeResource = () => {
        setResourceGroupOpen({ isResourceGroupOpen: false, ResourceUniqueID: "0", initialStep: 1 });
        setIsBack(true);
        const resourceGroups = jsonStore.getAllResourceGroups();
        setItems(resourceGroups || []);
        // console.log("RESOURCE GROUPS::::: ", resourceGroups);
        // const quickOrder = jsonStore.getQuickOrder();
        // setOrderType('BUY');
      }
      const [fetchedQuickOrderData, setFetchedQuickOrderData] = useState<any>(null);
      useEffect(()=>{
        console.log("Inside USEEFFECT CARD-VIEW")
        console.log("Inside Full JSON CARD-VIEW", jsonStore.getQuickOrder());
        setFetchedQuickOrderData(jsonStore.getQuickOrder());
        console.log("fetchedQuickOrderData ===", fetchedQuickOrderData);
        const resourceGroups = jsonStore.getAllResourceGroups();
        setItems(resourceGroups || []);
        console.log("resourceGroups = ",resourceGroups)
      }, [isResourceGroup,isBack,isEditQuickOrder])

	const [isAttachmentsOpen, setAttachmentsOpen] = useState(false);

    const handleDelete = (item: CardDetailsItem) => {
        console.log("Delete item: ", item);
        console.log("Delete item: ", jsonStore.getQuickOrder());
        console.log("fetchedQuickOrderData ===", fetchedQuickOrderData);
        jsonStore.setQuickOrder(fetchedQuickOrderData);
        // Pass the item data to the parent component via the callback
        if (typeof onDeleteResourceGroup === "function") {
            onDeleteResourceGroup(item);
        }
    };

    const handleCopy = (item: CardDetailsItem) => {
        console.log("fetchedQuickOrderData ===", fetchedQuickOrderData);
        jsonStore.setQuickOrder(fetchedQuickOrderData);
        // Pass the item data to the parent component via the callback
        if (typeof onCopyResourceGroup === "function") {
            onCopyResourceGroup(item);
        }
    }

    const handleShowPlanDetails = (item: CardDetailsItem) => {
        console.log("handleShowPlanDetails", item);
        // Open side drawer and set initial step to 2 (Plan data)
        setResourceGroupOpen({ 
            isResourceGroupOpen: true, 
            ResourceUniqueID: item.ResourceUniqueID,
            initialStep: 2
        });
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {items.map((item) => (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-4 relative">
                    <div key={item.ResourceUniqueID} className="">
                        <div className="flex items-center justify-between mb-3 border-b pb-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-violet-100 rounded-lg p-2">
                                        <UsersRound className="w-4 h-4 text-violet-500" />
                                    </span>
                                    <div>
                                        <div className="d-flex relative">
                                            <div className="font-semibold text-sm cursor-pointer" onClick={() => setResourceGroupOpen({ isResourceGroupOpen: true, ResourceUniqueID: item.ResourceUniqueID, initialStep: 1 })}>{item?.BillingDetails?.InternalOrderNo} - {item?.BasicDetails?.ResourceDescription}</div>
                                            {/* <div className="text-xs text-gray-400">subtitle :{item.subtitle}</div> */}
                                            <span className="absolute -top-1 left-full ml-2">
                                                <span className={`text-xs bg-blue-100 text-blue-600 border border-blue-300 font-semibold px-3 py-1 rounded-full cursor-pointer`}>
                                                    {item?.ResourceStatus}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400">{item?.BasicDetails?.ResourceTypeDescription}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 relative">
                                {/* <span className={`px-2 py-1 rounded-full text-xs ${statusMap[item.status].color} ${statusMap[item.status].bg}`}>
                                    {statusMap[item.status].label}
                                </span> */}
                                {showMenuButton && (
                                <button
                                    className="p-1"
                                    onClick={() => setOpenMenuId(openMenuId === item.ResourceUniqueID ? null : item.ResourceUniqueID)}
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
                                </button>
                                )}
                                {openMenuId === item.ResourceUniqueID && (
                                    <div
                                        ref={menuRef}
                                        className="absolute right-0 top-8 z-20 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2"
                                    >
                                        <button onClick={() => handleShowPlanDetails(item)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                            <span><Repeat1 className="w-4 h-4 text-gray-600" /></span> Compare Plan and Actuals
                                        </button>
                                        <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                            <span><FileText className="w-4 h-4 text-gray-600" /></span> CIM/CUV Report
                                        </button>
                                        <button onClick={() => handleCopy(item)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                            <span><Copy className="w-4 h-4 text-gray-600" /></span> Copy
                                        </button>
                                        <button onClick={() => setAttachmentsOpen(true)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                            <span><FileText className="w-4 h-4 text-gray-600" /></span> Attachments
                                        </button>
                                        <div className="border-t my-1" />
                                        {item?.ResourceStatus !== "Cancelled" && (
                                            <button onClick={() => handleDelete(item)} className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 text-xs gap-2">
                                                <span><Trash2 className="w-4 h-4 text-red-600" /></span> Cancel
                                            </button>
                                        )}
                                        </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-3">
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="truncate">{item?.BillingDetails?.BillingQty} {item?.BillingDetails?.BillingType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <Banknote className="w-4 h-4 text-gray-600" />
                                <span className="truncate">€ {formattedAmount(item?.BillingDetails?.NetAmount)}</span>
                                {/* <span className="truncate">{item.price}</span> */}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <Settings className="w-4 h-4 text-gray-600" />
                                <span className="truncate">{item?.BasicDetails?.ServiceTypeDescription || item?.BasicDetails?.ServiceType}</span>
                                {/* <span className="truncate">{item.trainType}</span> */}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                {/* <Wrench className="w-4 h-4 text-gray-600" /> */}
                                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.99984 3.99935L7.74984 7.74935M3.99984 3.99935H1.49984L0.666504 1.49935L1.49984 0.666016L3.99984 1.49935V3.99935ZM15.049 1.28353L12.8593 3.47321C12.5293 3.80322 12.3643 3.96823 12.3025 4.1585C12.2481 4.32587 12.2481 4.50616 12.3025 4.67353C12.3643 4.8638 12.5293 5.02881 12.8593 5.35882L13.057 5.55654C13.387 5.88655 13.552 6.05156 13.7423 6.11338C13.9097 6.16777 14.09 6.16777 14.2574 6.11338C14.4476 6.05156 14.6126 5.88655 14.9426 5.55654L16.9909 3.50828C17.2115 4.04509 17.3332 4.63301 17.3332 5.24935C17.3332 7.78065 15.2811 9.83268 12.7498 9.83268C12.4447 9.83268 12.1465 9.80286 11.858 9.74596C11.4528 9.66606 11.2503 9.62611 11.1275 9.63835C10.9969 9.65136 10.9326 9.67093 10.8169 9.73283C10.7081 9.79106 10.599 9.9002 10.3807 10.1185L4.4165 16.0827C3.72615 16.773 2.60686 16.773 1.91651 16.0827C1.22615 15.3923 1.22615 14.273 1.91651 13.5827L7.88069 7.61849C8.09898 7.4002 8.20813 7.29106 8.26635 7.18226C8.32825 7.06658 8.34783 7.00224 8.36084 6.87169C8.37307 6.74889 8.33312 6.54633 8.25323 6.14122C8.19633 5.85273 8.1665 5.55452 8.1665 5.24935C8.1665 2.71804 10.2185 0.666016 12.7498 0.666016C13.5878 0.666016 14.3732 0.890868 15.049 1.28353ZM8.99988 11.4993L13.5832 16.0826C14.2735 16.7729 15.3928 16.7729 16.0832 16.0826C16.7735 15.3922 16.7735 14.2729 16.0832 13.5826L12.3126 9.8121C12.0457 9.78684 11.7854 9.73868 11.5338 9.66963C11.2096 9.58064 10.854 9.64523 10.6162 9.88296L8.99988 11.4993Z" stroke="#475467" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="truncate">{item?.BasicDetails?.SubServiceTypeDescription}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs relative group">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="truncate cursor-pointer">
                                    {formatDate(item?.OperationalDetails?.FromDate)} to {formatDate(item?.OperationalDetails?.ToDate)}
                                </span>
                                {/* <span className="truncate cursor-pointer">
                                    {item.date}
                                </span> */}

                                <div className="absolute left-0 top-4 z-30 hidden group-hover:block min-w-[180px] max-w-xs bg-gray-900 text-white rounded-md shadow-xl border border-gray-200 text-xs">
                                    <div className="px-3 py-2">
                                        <div className="font-semibold mb-1">From and To Date</div>
                                        <div className="text-[11px] font-medium">{formatDate(item.OperationalDetails?.FromDate)} to {formatDate(item?.OperationalDetails?.ToDate)}</div>
                                        {/* <div className="text-[11px] font-medium">{item.date}</div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <CirclePercent className="w-4 h-4 text-gray-600" />
                                <span className="truncate">{item?.BillingDetails?.TariffTypeDescription}</span>
                                <div className="relative group inline-block">
                                    <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
                                    <div className="absolute right-0 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                        <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                            {item?.BillingDetails?.TariffTypeDescription}
                                        </div>
                                        <div className="px-4 py-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="font-semibold text-gray-700">{item?.BillingDetails?.Tariff}</div>
                                                <div className="font-semibold text-gray-700">€ {formattedAmount(item?.BillingDetails?.UnitPrice)}</div>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                                <div>Tariff ID</div>
                                                <div>Unit Price</div>
                                            </div>

                                            <div className="text-[11px] text-gray-400 mb-1 pt-2 border-t border-gray-300">Tariff Description</div>
                                            <div className="text-xs text-gray-700 font-medium">
                                                {item?.BillingDetails?.TariffIDDescription}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs col-span-2 text-xs relative group">
                                <MapPin className="w-4 h-4 text-gray-600" />
                                <span className="truncate">{item?.OperationalDetails?.OperationalLocationDesc}</span>
                                <div className="absolute left-0 top-4 z-30 hidden group-hover:block min-w-[180px] max-w-xs bg-[#344054] text-white rounded-lg shadow-xl border border-gray-200 text-xs">
                                    <div className="py-2 pl-[14px] pr-[14px]">
                                    {/* <div className="font-semibold mb-1">From and To Date</div> */}
                                    <div className="text-[11px] font-medium">{item?.OperationalDetails?.OperationalLocationDesc} || {item?.OperationalDetails?.OperationalLocation}</div>
                                    {/* <div className="text-[11px] font-medium">{item.date}</div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <PlaneLanding className="w-4 h-4 text-gray-600" />
                                <span className="truncate" title={item?.OperationalDetails?.ArrivalPointDescription + ' || ' + item?.OperationalDetails?.ArrivalPoint}>{item?.OperationalDetails?.ArrivalPointDescription} || {item?.OperationalDetails?.ArrivalPoint}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <PlaneTakeoff className="w-4 h-4 text-gray-600" />
                                <span className="truncate" title={item?.OperationalDetails?.DepartPointDescription + ' || ' + item?.OperationalDetails?.DepartPoint}>{item?.OperationalDetails?.DepartPointDescription} || {item?.OperationalDetails?.DepartPoint}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <File className="w-4 h-4 text-gray-600" />
                                <span className="truncate" title={item?.MoreRefDocs?.PrimaryDocTypeDescription || item?.MoreRefDocs?.PrimaryDocNo}>{item?.MoreRefDocs?.PrimaryDocTypeDescription} - {item?.MoreRefDocs?.PrimaryDocNo}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-xs">
                                <Files className="w-4 h-4 text-gray-600" />
                                <span className="truncate" title={item?.MoreRefDocs?.SecondaryDocTypeDescription || item?.MoreRefDocs?.SecondaryDocNo}>{item?.MoreRefDocs?.SecondaryDocTypeDescription} - {item?.MoreRefDocs?.SecondaryDocNo}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-blue-600 text-xs font-medium mt-2">
                            <LinkIcon className="w-4 h-4 mr-1" />
                            <span className="cursor-pointer">Draft Bill : {item?.BillingDetails?.DraftBillNo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${statusMap[item?.BillingDetails?.DraftBillStatus]}`}>
                                {item?.BillingDetails?.DraftBillStatus}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <Wallet className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item?.BillingDetails?.InvoiceNo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <Wallet className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item?.BillingDetails?.InvoiceStatus}</span>
                        </div>
                    </div>
                </div>
            ))}
            <SideDrawer
                isOpen={isResourceGroup.isResourceGroupOpen}
                onClose={() => setResourceGroupOpen({ isResourceGroupOpen: false, ResourceUniqueID: "0", initialStep: 1 })}
                width="100%"
                title="Resource Group Details"
                isBack={isBack}
            >
                <div className="text-sm text-gray-600">
                    <ResourceGroupDetailsForm 
                        isEditQuickOrder={true} 
                        onSaveSuccess={closeResource} 
                        resourceId={isResourceGroup.ResourceUniqueID}
                        initialStep={isResourceGroup.initialStep}
                    />
                </div>
            </SideDrawer>

            <SideDrawer isOpen={isAttachmentsOpen} onClose={() => setAttachmentsOpen(false)} width="80%" title="Attachments" isBack={false} onScrollPanel={true} badgeContent={jsonStore.getQuickOrderNo()} isBadgeRequired={true}>
                <div className="">
                    <div className="mt-0 text-sm text-gray-600"><Attachments isEditQuickOrder={isEditQuickOrder} isResourceGroupAttchment={true} /></div>
                </div>
            </SideDrawer>
        </div>
    );
};

export default CardDetails;