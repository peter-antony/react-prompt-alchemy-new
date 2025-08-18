import React, { useRef, useState, useEffect } from "react";
import {
    MoreVertical, Link as LinkIcon, Calendar, MapPin,
    Wrench, BadgeCheck, AlertCircle, UsersRound, FileText, Banknote,
    Settings, CirclePercent, Repeat1,
    Copy, Trash2,
} from "lucide-react";
import Attachments from "../QuickOrderNew/OrderForm/Attachments";
import ResourceGroupDetailsForm from "../QuickOrderNew/ResourceGroupDetails";
import { SideDrawer } from "./SideDrawer";

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
    status: keyof typeof statusMap;
}

interface CardDetailsProps {
    data: CardDetailsItem[];
    isEditQuickOrder: boolean;
    showMenuButton?: boolean; // New prop to control menu button visibility
}

const CardDetails: React.FC<CardDetailsProps> = ({ data, isEditQuickOrder, showMenuButton = true }) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isResourceGroup, setResourceGroupOpen] = useState({
        isResourceGroupOpen: false,
        ResourceUniqueID: "0"
    });
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {data.map((item) => (
                <div key={item.ResourceUniqueID} className="bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-4 relative">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-violet-100 rounded-lg p-2">
                                    <UsersRound className="w-4 h-4 text-violet-500" />
                                </span>
                                <div>
                                    <div className="font-semibold text-sm" onClick={() => setResourceGroupOpen({ isResourceGroupOpen: true, ResourceUniqueID: item.ResourceUniqueID })}>title- {item.ResourceUniqueID}</div>
                                    {/* <div className="text-xs text-gray-400">subtitle :{item.subtitle}</div> */}
                                    <div className="text-xs text-gray-400">subtitle :{item.BasicDetails.Resource}</div>
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
                                    <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                        <span><Repeat1 className="w-4 h-4 text-gray-600" /></span> Compare Plan and Actuals
                                    </button>
                                    <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                        <span><FileText className="w-4 h-4 text-gray-600" /></span> CIM/CUV Report
                                    </button>
                                    <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                        <span><Copy className="w-4 h-4 text-gray-600" /></span> Copy
                                    </button>
                                    <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs gap-2">
                                        <span><FileText className="w-4 h-4 text-gray-600" /></span> Attachments
                                    </button>
                                    <div className="border-t my-1" />
                                    <button className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 text-xs gap-2">
                                        <span><Trash2 className="w-4 h-4 text-red-600" /></span> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item.BillingDetails.BillingQty} Wagons</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <Banknote className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item.BillingDetails.UnitPrice}</span>
                            {/* <span className="truncate">{item.price}</span> */}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <Settings className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item.BasicDetails.ServiceType}</span>
                            {/* <span className="truncate">{item.trainType}</span> */}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <Wrench className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item.BasicDetails.SubSericeType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-xs relative group">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="truncate cursor-pointer">
                                {item.OperationalDetails.FromTime}- {item.OperationalDetails.ToTime}
                            </span>
                            {/* <span className="truncate cursor-pointer">
                                {item.date}
                            </span> */}

                            <div className="absolute left-0 top-4 z-30 hidden group-hover:block min-w-[180px] max-w-xs bg-gray-900 text-white rounded-md shadow-xl border border-gray-200 text-xs">
                                <div className="px-3 py-2">
                                    <div className="font-semibold mb-1">From and To Date</div>
                                    <div className="text-[11px] font-medium">{item.OperationalDetails.FromTime}- {item.OperationalDetails.ToTime}</div>
                                    {/* <div className="text-[11px] font-medium">{item.date}</div> */}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                            <CirclePercent className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item.BillingDetails.TariffType}</span>
                            <div className="relative group inline-block">
                                <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
                                <div className="absolute right-0 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                    <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                        {item.BillingDetails.TariffType}
                                    </div>
                                    <div className="px-4 py-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-700">TAR_HR_DE_22_0016</div>
                                            <div className="font-semibold text-gray-700">€ 1595.00</div>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                            <div>Tariff ID</div>
                                            <div>Unit Price</div>
                                        </div>

                                        <div className="text-[11px] text-gray-400 mb-1 pt-2 border-t border-gray-300">Tariff Description</div>
                                        <div className="text-xs text-gray-700 font-medium">
                                            CR-SW (Guarding) FLAT RATE -ARMY-FRET SNCF
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-xs col-span-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{item.OperationalDetails.OperationalLocation}</span>
                        </div>
                    </div>
                    <div className="flex items-center text-blue-600 text-xs font-medium mt-2">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        {/* <span className="cursor-pointer">Draft Bill : {item.draftBill}</span> */}
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
    );
};

export default CardDetails;