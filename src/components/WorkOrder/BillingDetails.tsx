import React, { useState, useEffect } from "react";
import { DynamicPanel } from "@/components/DynamicPanel";
import type { PanelConfig } from "@/types/dynamicPanel";
import { Expand, FileChartColumn, FileText, Maximize2, Trash, Truck, User, Wrench, ChevronDown, ChevronUp, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { quickOrderService } from "@/api/services";
import { Input } from "../ui/input";
import { DynamicLazySelect } from "../DynamicPanel/DynamicLazySelect";
import { InputDropdown } from "../ui/input-dropdown";
import { workOrderService } from "@/api/services/workOrderService";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { GridColumnConfig } from "@/types/smartgrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface BillingDetailsProps {
    workOrderNumber?: string;
}

// Collapsible Billing Panel Component
interface CollapsibleBillingPanelProps {
    title: string;
    icon: React.ReactNode;
    isExpanded: boolean;
    badge?: React.ReactNode;
    children?: React.ReactNode;
}

const CollapsibleBillingPanel: React.FC<CollapsibleBillingPanelProps> = ({ title, icon, isExpanded, badge, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Sync with parent's isAllExpanded state
    useEffect(() => {
        setIsOpen(isExpanded);
    }, [isExpanded]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Panel Header */}
            <div
                className="flex items-center justify-between px-4 py-3 border-b border-gray-300 cursor-pointer hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <div>{icon}</div>
                    <h3 className="text-md font-medium text-gray-700">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {badge && (
                        typeof badge === 'string' ? (
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-medium px-3 py-1 rounded-full">
                                {badge}
                            </span>
                        ) : badge
                    )}
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Panel Content */}
            {isOpen && (
                <div className="px-4 py-4">
                    {children || (
                        <div className="text-center text-gray-500 py-8 text-sm">
                            No content configured.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const BillingDetails: React.FC<BillingDetailsProps> = ({ workOrderNumber }) => {
    const [contractType, setContractType] = useState<"full" | "dry">("full");
    const [isAllExpanded, setIsAllExpanded] = useState(false);
    const [showBillingSummary, setShowBillingSummary] = useState(false);
    const { toast } = useToast();

    // Billing data state
    const [billingData, setBillingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currencyOptions, setCurrencyOptions] = useState<{ label: string; value: string }[]>([]);
    const [quantityUOMOptions, setQuantityUOMOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

    const gridColumns: GridColumnConfig[] = [
        { key: "ItemName", label: "Item Name", width: 150, type: "Text" },
        { key: "OperationID", label: "Operation ID", width: 150, type: "Text" },
        { key: "SubLineItem", label: "Sub Line Item", width: 150, type: "Text" },
        { key: "BillCost", label: "Bill Cost", width: 100, type: "Text" },
        { key: "MarginAmount", label: "Margin Amount", width: 100, type: "Text" },
        { key: "SubTotal", label: "Sub Total", width: 100, type: "Text" },
    ];

    const reinvoiceData = billingData?.BillingDetails?.ReinvoiceCostTo?.ReinvoiceCostToDetails || [];

    const handleRowClick = (row: any, index: number) => {
        const id = row.ItemName;
        const newSelectedRowIds = new Set(selectedRowIds);
        const newSelectedRows = new Set(selectedRows);

        if (newSelectedRowIds.has(id)) {
            newSelectedRowIds.delete(id);
            reinvoiceData.forEach((r: any, i: number) => {
                if (r.ItemName === id) newSelectedRows.delete(i);
            });
        } else {
            newSelectedRowIds.add(id);
            reinvoiceData.forEach((r: any, i: number) => {
                if (r.ItemName === id) newSelectedRows.add(i);
            });
        }

        setSelectedRowIds(newSelectedRowIds);
        setSelectedRows(newSelectedRows);
    };

    // Fetch billing details when workOrderNumber changes
    useEffect(() => {
        const fetchBillingDetails = async () => {
            if (!workOrderNumber) {
                console.log("No work order number provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                console.log("Fetching billing details for:", workOrderNumber);
                const response = await workOrderService.getBillingDetails(workOrderNumber);

                // Parse the response
                const parsedData = response?.data?.ResponseData
                    ? JSON.parse(response.data.ResponseData)
                    : response?.data;

                console.log("Billing Details Response:", parsedData);
                setBillingData(parsedData);

                // Set contract type based on API response
                if (parsedData?.Header?.BillingHeaderDetails) {
                    const { FullLeasingContract, DryLeasingContract } = parsedData.Header.BillingHeaderDetails;
                    if (FullLeasingContract === 1) {
                        setContractType("full");
                    } else if (DryLeasingContract === 1) {
                        setContractType("dry");
                    }
                }

                // Pre-select grid rows based on IsBilled
                if (parsedData?.BillingDetails?.ReinvoiceCostTo?.ReinvoiceCostToDetails) {
                    const details = parsedData.BillingDetails.ReinvoiceCostTo.ReinvoiceCostToDetails;
                    const newSelectedRowIds = new Set<string>();
                    const newSelectedRows = new Set<number>();

                    details.forEach((row: any, index: number) => {
                        if (row.IsBilled === 1) {
                            newSelectedRowIds.add(row.ItemName);
                            // Also select all rows with same ItemName
                            details.forEach((r: any, i: number) => {
                                if (r.ItemName === row.ItemName) {
                                    newSelectedRows.add(i);
                                }
                            });
                        }
                    });
                    setSelectedRowIds(newSelectedRowIds);
                    setSelectedRows(newSelectedRows);
                }
            } catch (err: any) {
                console.error("Error fetching billing details:", err);
                setError(err.message || "Failed to fetch billing details");
            } finally {
                setLoading(false);
            }
        };

        fetchBillingDetails();
    }, [workOrderNumber]);

    // Fetch Dropdown Options
    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                // Fetch Currency Options
                const currencyRes = await quickOrderService.getMasterCommonData({ messageType: "Currency Init" });
                const currencyData = currencyRes?.data?.ResponseData ? JSON.parse(currencyRes.data.ResponseData) : [];
                setCurrencyOptions(currencyData.map((item: any) => ({
                    label: item.name,
                    value: item.id
                })));

                // Fetch Quantity UOM Options
                const uomRes = await quickOrderService.getMasterCommonData({ messageType: "THU Qty UOM Init" });
                const uomData = uomRes?.data?.ResponseData ? JSON.parse(uomRes.data.ResponseData) : [];
                setQuantityUOMOptions(uomData.map((item: any) => ({
                    label: item.name,
                    value: item.id
                })));

            } catch (err) {
                console.error("Error fetching dropdown options:", err);
            }
        };

        fetchDropdownOptions();
    }, []);

    const handleNestedChange = (path: string, value: any) => {
        setBillingData((prev: any) => {
            if (!prev) return prev;
            const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
            const keys = path.split('.');
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const fetchMaster = (
        messageType: string,
        additionalFilter?: { FilterName: string; FilterValue: string }[]
    ) => {
        return async ({ searchTerm, offset, limit }) => {
            try {
                const response = await quickOrderService.getMasterCommonData({
                    messageType,
                    searchTerm: searchTerm || "",
                    offset,
                    limit,
                    AdditionalFilter: additionalFilter || [], // <-- FIXED HERE
                });

                const rr: any = response?.data;
                const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

                return arr.map((item: any) => {
                    const id = item.id ?? "";
                    const name = item.name ?? "";
                    return {
                        label: `${id} || ${name}`,
                        value: `${id} || ${name}`,
                    };
                });
            } catch (err) {
                return [];
            }
        };
    };

    const handleSave = async () => {
        if (!billingData) return;

        setLoading(true);
        try {
            // Construct Payload
            const payload = {
                context: {
                    UserID: "ramcouser",
                    OUID: 4,
                    Role: "RAMCOROLE",
                    MessageID: "12345",
                    MessageType: "WorkOrder-Save Billing Details"
                },
                RequestPayload: {
                    Header: {
                        ...billingData.Header,
                        BillingHeaderDetails: {
                            ...billingData.Header.BillingHeaderDetails,
                        }
                    },
                    BillingDetails: {
                        // TransportCharges: Pass as is
                        TransportCharges: billingData.BillingDetails.TransportCharges,

                        // Disposal: Pass as is
                        Disposal: billingData.BillingDetails.Disposal,

                        // ReinvoiceCostTo
                        ReinvoiceCostTo: {
                            ...billingData.BillingDetails.ReinvoiceCostTo,
                            ReinvoiceCostToDetails: billingData.BillingDetails.ReinvoiceCostTo.ReinvoiceCostToDetails.map((item: any) => {
                                // Check if this item (or its group) is selected
                                // Logic from handleRowClick: if item.ItemName is in selectedRowIds
                                const isSelected = selectedRowIds.has(item.ItemName);
                                const newIsBilled = isSelected ? 1 : 0;
                                let modeFlag = item.ModeFlag;

                                if (item.IsBilled !== newIsBilled) {
                                    modeFlag = "Update";
                                }

                                return {
                                    ...item,
                                    IsBilled: newIsBilled,
                                    ModeFlag: modeFlag
                                };
                            })
                        }
                    }
                }
            };

            console.log("Saving Billing Details Payload:", JSON.stringify(payload, null, 2));

            const response = await workOrderService.saveBillingDetails(payload);
            console.log("Save Response:", response);

            // Check nested IsSuccess (response.data.IsSuccess)
            if (response?.data?.IsSuccess) {
                toast({
                    title: "Saved Successfully",
                    description: response.data.Message || "Details saved successfully",
                    variant: "default",
                });

                // Re-bind data if available
                if (response.data.ResponseData) {
                    try {
                        const parsedData = JSON.parse(response.data.ResponseData);
                        console.log("Updated Billing Data:", parsedData);
                        setBillingData(parsedData);

                        // Update contract type state if needed
                        if (parsedData?.Header?.BillingHeaderDetails) {
                            const { FullLeasingContract, DryLeasingContract } = parsedData.Header.BillingHeaderDetails;
                            if (FullLeasingContract === 1) {
                                setContractType("full");
                            } else if (DryLeasingContract === 1) {
                                setContractType("dry");
                            }
                        }
                    } catch (parseError) {
                        console.error("Error parsing updated billing data:", parseError);
                    }
                }
            } else {
                toast({
                    title: "Error",
                    description: response?.data?.Message || "Save failed",
                    variant: "destructive",
                });
            }

        } catch (error: any) {
            console.error("Error saving billing details:", error);
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    //  panel configs for now
    const transportChargesConfig: PanelConfig = {};
    const itemServiceConfig: PanelConfig = {};
    const disposalConfig: PanelConfig = {
        Supplier: {
            id: "Supplier",
            label: "Supplier",
            fieldType: "lazyselect",
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 1,
            width: "four",
            fetchOptions: fetchMaster(""),
        },
        ProccessingReference: {
            id: "ProccessingReference",
            label: "Proccessing Reference",
            fieldType: "lazyselect",
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 2,
            width: "four",
            fetchOptions: fetchMaster(""),
        },
        QualityProcessed: {
            id: "QualityProcessed",
            label: "Quality Processed",
            fieldType: "text",
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 3,
            width: "four",
            // fetchOptions: fetchMaster(""),
        },
        Quantity: {
            id: "Quantity",
            label: "Quantity",
            fieldType: "inputdropdown",
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 4,
            width: "four"
            // fetchOptions: fetchMaster(""),
        },
        CostEXVAT: {
            id: "CostEXVAT",
            label: "Cost EX VAT",
            fieldType: "inputdropdown",
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 5,
            width: "four"
            // fetchOptions: fetchMaster(""),
        }
    };
    const reInvoiceCostConfig: PanelConfig = {};

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Header Section with Total Amount, Radio Buttons, and Action Buttons */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left Section: Total Amount and Radio Buttons */}
                    <div className="flex items-center gap-6">
                        {/* Total Net Amount */}
                        <div className="flex items-center gap-2">
                            <span className="text-md font-semibold text-gray-800">
                                Total Net Amount :
                            </span>
                            <span className="text-lg font-bold text-green-600">
                                € {billingData?.Header?.BillingHeaderDetails?.TotalNetAmount?.toFixed(2) || "0.00"}
                            </span>
                        </div>

                        {/* Radio Buttons */}
                        <RadioGroup
                            value={contractType}
                            onValueChange={(value) => {
                                setContractType(value as "full" | "dry");
                                // Update billingData based on selection
                                if (billingData?.Header?.BillingHeaderDetails) {
                                    const isFull = value === "full";
                                    handleNestedChange("Header.BillingHeaderDetails.FullLeasingContract", isFull ? 1 : 0);
                                    handleNestedChange("Header.BillingHeaderDetails.DryLeasingContract", isFull ? 0 : 1);
                                    handleNestedChange("Header.BillingHeaderDetails.ModeFlag", "Update");
                                }
                            }}
                            className="flex items-center gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="full" id="full" />
                                <Label htmlFor="full" className="text-sm text-gray-700 cursor-pointer">
                                    Full Leasing Contract
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="dry" id="dry" />
                                <Label htmlFor="dry" className="text-sm text-gray-700 cursor-pointer">
                                    Dry Leasing Contract
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Right Section: Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100"
                            aria-label="Document"
                            onClick={() => {
                                setShowBillingSummary(true)
                                console.log("Billing Summary clicked");
                            }}
                        >
                            <FileChartColumn className="w-5 h-5 text-gray-500 cursor-pointer" />
                        </button>
                        <button
                            className={`rounded-lg p-3 cursor-pointer transition-colors ${isAllExpanded
                                ? "bg-blue-600 border border-blue-600 hover:bg-blue-700"
                                : "bg-white border border-gray-300 hover:bg-gray-100"
                                }`}
                            aria-label="Expand/Collapse All"
                            onClick={() => {
                                setIsAllExpanded(!isAllExpanded);
                                console.log("Expand/Collapse All clicked");
                            }}

                        >
                            <Expand className={`w-4 h-4 ${isAllExpanded ? "text-white" : "text-gray-700"}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Section with Dynamic Panels */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 pb-20">
                <div className="space-y-4">
                    {/* 1. Transport Charges Panel */}
                    {/* Dynamic Panel */}
                    {/* <div className="">
                        <DynamicPanel
                            panelId="transport-charges"
                            panelTitle="Transport Charges"
                            panelConfig={transportChargesConfig}
                            panelOrder={1}
                            collapsible={true}
                            initialData={{}}
                            panelIcon={<Truck className="w-5 h-5 text-blue-500" />}
                        />
                    </div> */}

                    <CollapsibleBillingPanel
                        title="Transport Charges"
                        icon={<Truck className="w-5 h-5 text-blue-500" />}
                        isExpanded={isAllExpanded}
                        badge={`Total Cost : € ${(
                            (billingData?.BillingDetails?.TransportCharges?.RUForward?.TotalCost || 0) +
                            (billingData?.BillingDetails?.TransportCharges?.RUReturn?.TotalCost || 0)
                        ).toFixed(2)}`}
                    >
                        <div className="grid grid-cols-2 gap-4">

                            {/* RU Forward */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="bg-purple-50 text-purple-500 rounded-lg p-2 border border-purple-100">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>


                                        {/* Title + Supplier */}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-800">RU Forward</h4>
                                            <span className="text-xs text-gray-500">
                                                {billingData?.BillingDetails?.TransportCharges?.RUForward?.SupplierID || "-"}
                                                {billingData?.BillingDetails?.TransportCharges?.RUForward?.SupplierDescription
                                                    ? ` - ${billingData.BillingDetails.TransportCharges.RUForward.SupplierDescription}`
                                                    : "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="text-xs bg-green-50 text-green-600 border border-green-200 font-medium px-3 py-1 rounded-full">
                                        Total Cost : € {billingData?.BillingDetails?.TransportCharges?.RUForward?.TotalCost?.toFixed(2) || "0.00"}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="grid grid-cols-3 gap-3">

                                        {/* Invoice */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Invoice Reference</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUForward?.DraftBillNo || ""}
                                                onChange={(e) => handleNestedChange("BillingDetails.TransportCharges.RUForward.DraftBillNo", e.target.value)}
                                                placeholder="Enter Invoice Reference"
                                            />
                                        </div>

                                        {/* Cost */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Cost</label>
                                            <InputDropdown
                                                value={{
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUForward?.CostCurrency,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUForward?.Cost?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.CostCurrency", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.Cost", val.input);
                                                }}
                                                options={currencyOptions}
                                                placeholder="0.00"
                                                editable={false}
                                            />
                                        </div>

                                        {/* Fee AT */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Fee AT</label>
                                            <InputDropdown
                                                value={{
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUForward?.FeeAtCurrency,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUForward?.FeeAt?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.FeeAtCurrency", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.FeeAt", val.input);
                                                }}
                                                options={currencyOptions}
                                                placeholder="0.00"
                                                editable={false}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* RU Return */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-4">

                                        {/* Icon */}
                                        <div className="bg-purple-50 text-purple-500 rounded-lg p-2 border border-purple-100">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M19 12H5M12 19l-7-7 7-7" />
                                            </svg>
                                        </div>


                                        {/* Title + Supplier */}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-800">RU Return</h4>
                                            <span className="text-xs text-gray-500">
                                                {billingData?.BillingDetails?.TransportCharges?.RUReturn?.SupplierID || "-"}
                                                {billingData?.BillingDetails?.TransportCharges?.RUReturn?.SupplierDescription
                                                    ? ` - ${billingData.BillingDetails.TransportCharges.RUReturn.SupplierDescription}`
                                                    : "-"}
                                            </span>
                                        </div>

                                    </div>

                                    <span className="text-xs bg-green-50 text-green-600 border border-green-200 font-medium px-3 py-1 rounded-full">
                                        Total Cost : € {billingData?.BillingDetails?.TransportCharges?.RUReturn?.TotalCost?.toFixed(2) || "0.00"}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="grid grid-cols-3 gap-3">

                                        {/* Invoice Reference */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Invoice Reference</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUReturn?.DraftBillNo || ""}
                                                onChange={(e) => handleNestedChange("BillingDetails.TransportCharges.RUReturn.DraftBillNo", e.target.value)}
                                                placeholder="Enter Invoice Reference"
                                            />
                                        </div>

                                        {/* Cost */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Cost</label>
                                            <InputDropdown
                                                value={{
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUReturn?.CostCurrency,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUReturn?.Cost?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.CostCurrency", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.Cost", val.input);
                                                }}
                                                options={currencyOptions}
                                                placeholder="0.00"
                                                editable={false}
                                            />
                                        </div>

                                        {/* Fee AT */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Fee AT</label>
                                            <InputDropdown
                                                value={{
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUReturn?.FeeAtCurrency,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUReturn?.FeeAt?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.FeeAtCurrency", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.FeeAt", val.input);
                                                }}
                                                options={currencyOptions}
                                                placeholder="0.00"
                                                editable={false}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>

                    </CollapsibleBillingPanel>

                    {/* 2. Item Service Panel */}
                    <CollapsibleBillingPanel
                        title="Item Service"
                        icon={<Wrench className="w-5 h-5 text-green-500" />}
                        isExpanded={isAllExpanded}
                    >
                        {/* Panel content goes here */}
                    </CollapsibleBillingPanel>

                    {/* 3. Disposal Panel */}
                    {/* <div className="">
                        <DynamicPanel
                            panelId="disposal"
                            panelTitle="Disposal"
                            panelConfig={disposalConfig}
                            panelOrder={3}
                            collapsible={true}
                            initialData={{}}
                            panelIcon={<Trash className="w-5 h-5 text-blue-500" />}
                        />
                    </div> */}
                    <CollapsibleBillingPanel
                        title="Disposal"
                        icon={<Trash className="w-5 h-5 text-orange-500" />}
                        isExpanded={isAllExpanded}
                        badge={`Total Cost : € ${billingData?.BillingDetails?.Disposal?.TotalCost?.toFixed(2) || "0.00"}`}
                    >
                        {/* Panel content */}
                        <div className="grid grid-cols-5 gap-3">
                            {/* Supplier */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Supplier</label>
                                <DynamicLazySelect
                                    className="h-8"
                                    fetchOptions={fetchMaster("Supplier Init")}
                                    value={billingData?.BillingDetails?.Disposal?.SupplierID
                                        ? `${billingData.BillingDetails.Disposal.SupplierID} || ${billingData.BillingDetails.Disposal.SupplierDescription || ""}`
                                        : ""}
                                    onChange={(val) => {
                                        if (val) {
                                            const [id, desc] = val.split(" || ");
                                            handleNestedChange("BillingDetails.Disposal.SupplierID", id);
                                            handleNestedChange("BillingDetails.Disposal.SupplierDescription", desc);
                                        } else {
                                            handleNestedChange("BillingDetails.Disposal.SupplierID", "");
                                            handleNestedChange("BillingDetails.Disposal.SupplierDescription", "");
                                        }
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    hideSearch={false}
                                    disableLazyLoading={false}
                                    placeholder="Select Supplier"
                                />
                            </div>

                            {/* Processing Reference */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Processing Reference</label>
                                <DynamicLazySelect
                                    className="h-8"
                                    fetchOptions={fetchMaster("Processing reference")}
                                    value={billingData?.BillingDetails?.Disposal?.ProcessingReference || ""}
                                    onChange={(val) => {
                                        handleNestedChange("BillingDetails.Disposal.ProcessingReference", val);
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    hideSearch={false}
                                    disableLazyLoading={false}
                                    placeholder="Select Processing Reference"
                                />
                            </div>

                            {/* Quality Processed */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Quality Processed</label>
                                <Input
                                    type="text"
                                    value={billingData?.BillingDetails?.Disposal?.QuantityProcessed?.toString() || ""}
                                    onChange={(e) => {
                                        handleNestedChange("BillingDetails.Disposal.QuantityProcessed", e.target.value);
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    placeholder="Enter Quality Processed"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Quantity</label>
                                <InputDropdown
                                    value={{
                                        dropdown: billingData?.BillingDetails?.Disposal?.QuantityUOM,
                                        input: billingData?.BillingDetails?.Disposal?.Quantity?.toString()
                                    }}
                                    onChange={(val) => {
                                        handleNestedChange("BillingDetails.Disposal.QuantityUOM", val.dropdown);
                                        handleNestedChange("BillingDetails.Disposal.Quantity", val.input);
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    options={quantityUOMOptions}
                                    placeholder="0"
                                />
                            </div>

                            {/* Cost EX VAT */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Cost EX VAT</label>
                                <InputDropdown
                                    value={{
                                        dropdown: billingData?.BillingDetails?.Disposal?.CostEXVatUOM,
                                        input: billingData?.BillingDetails?.Disposal?.CostEXVat?.toString()
                                    }}
                                    onChange={(val) => {
                                        handleNestedChange("BillingDetails.Disposal.CostEXVatUOM", val.dropdown);
                                        handleNestedChange("BillingDetails.Disposal.CostEXVat", val.input);
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    options={currencyOptions}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </CollapsibleBillingPanel>

                    {/* 4. Re-Invoice Cost to Panel */}
                    <CollapsibleBillingPanel
                        title="Re-Invoice Cost to"
                        icon={<User className="w-5 h-5 text-blue-400" />}
                        isExpanded={isAllExpanded}
                        badge={
                            <>
                                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-medium px-3 py-1 rounded-full">
                                    Total Cost : € {billingData?.BillingDetails?.ReinvoiceCostTo?.TotalCost?.toFixed(2) || "0.00"}
                                </span>
                                {billingData?.BillingDetails?.ReinvoiceCostTo?.InvoiceTo && (
                                    <span className="text-xs bg-gray-100 text-gray-600 border border-gray-300 font-medium px-3 py-1 rounded-full">
                                        {billingData.BillingDetails.ReinvoiceCostTo.InvoiceTo}
                                    </span>
                                )}
                            </>
                        }
                    >
                        {/* panel fields */}
                        <div className="grid grid-cols-4 gap-4">
                            {/* Stakeholder */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Stakeholder</label>
                                <DynamicLazySelect
                                    className="h-8"
                                    fetchOptions={fetchMaster("Customer Init")}
                                    value={billingData?.BillingDetails?.ReinvoiceCostTo?.Stakeholder
                                        ? `${billingData.BillingDetails.ReinvoiceCostTo.Stakeholder} || ${billingData.BillingDetails.ReinvoiceCostTo.StakeholderDescription || ""}`
                                        : ""}
                                    onChange={(val) => {
                                        if (val) {
                                            const [id, desc] = val.split(" || ");
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.Stakeholder", id);
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.StakeholderDescription", desc);
                                        } else {
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.Stakeholder", "");
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.StakeholderDescription", "");
                                        }
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
                                    }}
                                    hideSearch={false}
                                    disableLazyLoading={false}
                                    disabled
                                    placeholder="Select Stakeholder"
                                />
                            </div>

                            {/* Total Bill Cost */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Total Bill Cost</label>
                                <InputDropdown
                                    value={{
                                        dropdown: billingData?.BillingDetails?.ReinvoiceCostTo?.CurrencyUOM || "€",
                                        input: billingData?.BillingDetails?.ReinvoiceCostTo?.TotalBillCost?.toString() || "0.00"
                                    }}
                                    onChange={(val) => {
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.CurrencyUOM", val.dropdown);
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.TotalBillCost", val.input);
                                    }}
                                    options={currencyOptions}
                                    placeholder="0.00"
                                    editable={false}
                                />
                            </div>

                            {/* Total Margin Amount */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Total Margin Amount</label>
                                <InputDropdown
                                    value={{
                                        dropdown: billingData?.BillingDetails?.ReinvoiceCostTo?.CurrencyUOM || "€",
                                        input: billingData?.BillingDetails?.ReinvoiceCostTo?.TotalMarginAmount?.toString() || "0.00"
                                    }}
                                    onChange={(val) => {
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.CurrencyUOM", val.dropdown);
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.TotalMarginAmount", val.input);
                                    }}
                                    options={currencyOptions}
                                    placeholder="0.00"
                                    editable={false}
                                />
                            </div>

                            {/* Overall Sub Total */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Overall Sub Total</label>
                                <InputDropdown
                                    value={{
                                        dropdown: billingData?.BillingDetails?.ReinvoiceCostTo?.CurrencyUOM || "€",
                                        input: billingData?.BillingDetails?.ReinvoiceCostTo?.OverAllSubTotal?.toString() || "0.00"
                                    }}
                                    onChange={(val) => {
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.CurrencyUOM", val.dropdown);
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.OverAllSubTotal", val.input);
                                    }}
                                    options={currencyOptions}
                                    placeholder="0.00"
                                    editable={false}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-semibold text-gray-800">Re-Invoicing Selection</h4>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    {reinvoiceData.length}
                                </Badge>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                {selectedRows.size > 0 && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200">
                                        <div className="text-sm text-blue-700">
                                            <span className="font-medium">{selectedRows.size}</span> row{selectedRows.size !== 1 ? 's' : ''} selected
                                            <span className="ml-2 text-xs">
                                                ({Array.from(selectedRowIds).join(', ')})
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedRows(new Set());
                                                setSelectedRowIds(new Set());
                                            }}
                                            title="Clear row selection"
                                            className="h-6 w-6 p-0 bg-gray-50 hover:bg-gray-100 border border-blue-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                <style>{`
                                    tr.selected {
                                      background-color: #eff6ff !important;
                                      border-left: 4px solid #3b82f6 !important;
                                    }
                                    tr.selected:hover {
                                      background-color: #dbeafe !important;
                                    }
                                `}</style>
                                <SmartGridWithGrouping
                                    columns={gridColumns}
                                    data={reinvoiceData}
                                    groupableColumns={[]}
                                    showGroupingDropdown={false}
                                    paginationMode="pagination"
                                    customPageSize={500} // made 500 for infinte pagnation replication
                                    selectedRows={selectedRows}
                                    onSelectionChange={setSelectedRows}
                                    onRowClick={handleRowClick}
                                    hideToolbar={true}
                                    rowClassName={(row: any, index: number) => {
                                        return selectedRowIds.has(row.ItemName) ? 'selected' : '';
                                    }}
                                    showDefaultConfigurableButton={false}
                                    gridTitle=""
                                    recordCount={reinvoiceData.length || 0}
                                    showCreateButton={false}
                                    clientSideSearch={false}
                                    showSubHeaders={false}
                                    hideAdvancedFilter={true}
                                    hideCheckboxToggle={true}
                                    showFilterTypeDropdown={false}
                                    showServersideFilter={false}
                                    userId="current-user"
                                />
                            </div>
                        </div>
                    </CollapsibleBillingPanel>
                </div>
            </div>

            {/* Footer with Save and Confirm Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end gap-3 z-50">
                <button
                    className="px-4 py-2 text-[13px] font-semibold text-blue-600 bg-white border border-blue-600 rounded-sm hover:bg-blue-50 transition-colors"
                    onClick={handleSave}
                // disabled={loading}
                >
                    {/* {loading ? "Saving..." : "Save"} */}
                    Save
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                    Confirm
                </button>
            </div>

            {/* Billing Summary SideDrawer */}
            <SideDrawer
                isOpen={showBillingSummary}
                onClose={() => setShowBillingSummary(false)}
                width="80%"
                title="Billing Summary"
                isBack={true}
                badgeContent={workOrderNumber || "-"}
                isBadgeRequired={true}
            >
                <div className="p-6">
                    {/* billing summary content */}
                </div>
            </SideDrawer>
        </div>
    );
};

export default BillingDetails;
