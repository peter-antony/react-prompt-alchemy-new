import React, { useState, useEffect } from "react";
import { DynamicPanel } from "@/components/DynamicPanel";
import type { PanelConfig } from "@/types/dynamicPanel";
import { Expand, FileChartColumn, FileText, Maximize2, Trash, Truck, User, Wrench, ChevronDown, ChevronUp, X, Search } from "lucide-react";
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
import { SmartGridPlusWithNestedRows } from '@/components/SmartGrid/SmartGridPlusWithNestedRows';
import CodeInformationDrawer from "./CodeInformationDrawer";

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
    const [selectedOperationRow, setSelectedOperationRow] = useState<any>(null); // Track selected operation row for confirm/amend

    const { toast } = useToast();

    // Billing data state
    const [billingData, setBillingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currencyOptions, setCurrencyOptions] = useState<{ label: string; value: string }[]>([]);
    const [quantityUOMOptions, setQuantityUOMOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

    const [showCodeInformation, setShowCodeInformation] = useState(false); // State for Code Information drawer
    const [selectedCode, setSelectedCode] = useState<any>(null); // Track selected code row

    // Billing Summary states
    const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [billingSummaryData, setBillingSummaryData] = useState<any>(null);
    const [loadingBillingSummary, setLoadingBillingSummary] = useState(false);

    // Billing Summary Grid Columns
    const supplierBillingColumns: GridColumnConfig[] = [
        { key: "DraftBillNo", label: "Draft Bill No.", width: 150, type: "Text" },
        // { key: "SupplierDescription", label: "Supplier ID", width: 150, type: "Text" },
        { key: "SupplierDescription", label: "Supplier", width: 200, type: "Text" },
        { key: "TariffType", label: "Tariff Type", width: 200, type: "Text" },
        { key: "DraftBillStatus", label: "Status", width: 120, type: "Badge" },
        { key: "NoOfLines", label: "No. of Lines", width: 120, type: "Text" },
        { key: "TotalAmount", label: "Total Amount", width: 150, type: "CurrencyWithSymbol" },
    ];

    const customerBillingColumns: GridColumnConfig[] = [
        { key: "DraftBillNo", label: "Draft Bill No.", width: 150, type: "Text" },
        // { key: "CustomerID", label: "Customer ID", width: 150, type: "Text" },
        { key: "CustomerDescription", label: "Customer", width: 200, type: "Text" },
        { key: "TariffType", label: "Tariff Type", width: 200, type: "Text" },
        { key: "DraftBillStatus", label: "Status", width: 120, type: "Badge" },
        { key: "NoOfLines", label: "No. of Lines", width: 120, type: "Text" },
        { key: "TotalAmount", label: "Total Amount", width: 150, type: "CurrencyWithSymbol" },
    ];

    // Get data from API response
    const supplierBillingData = billingSummaryData?.SupplierBilling?.Entries || [];
    const customerBillingData = billingSummaryData?.CustomerBilling?.Entries || [];

    // Get total costs and counts directly from API
    const supplierTotalCost = billingSummaryData?.SupplierBilling?.TotalCost || 0;
    const customerTotalCost = billingSummaryData?.CustomerBilling?.TotalCost || 0;
    const supplierTotalCount = billingSummaryData?.SupplierBilling?.TotalCounts || 0;
    const customerTotalCount = billingSummaryData?.CustomerBilling?.TotalCounts || 0;

    const gridColumns: GridColumnConfig[] = [
        { key: "ItemName", label: "Item Name", width: 150, type: "Text" },
        { key: "OperationID", label: "Operation ID", width: 150, type: "Text" },
        { key: "SubLineItem", label: "Sub Line Item", width: 150, type: "Text" },
        { key: "BillCost", label: "Bill Cost", width: 100, type: "Text" },
        { key: "MarginAmount", label: "Margin Amount", width: 100, type: "Integer", editable: true },
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
        const userContext = workOrderService.getUserContext();
        try {
            // Construct Payload
            const payload = {
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

                    // OperationBillingDetails: Clean up any remaining || symbols
                    OperationBillingDetails: (billingData.BillingDetails.OperationBillingDetails || []).map((operation: any) => {
                        // Clean up main operation fields
                        const cleanedOperation: any = { ...operation };

                        // Remove || from Supplier if it exists
                        if (typeof cleanedOperation.Supplier === 'string' && cleanedOperation.Supplier.includes(' || ')) {
                            const [id] = cleanedOperation.Supplier.split(' || ').map((v: string) => v.trim());
                            cleanedOperation.Supplier = id;
                        }

                        // Remove || from SupplierContractID if it exists
                        if (typeof cleanedOperation.SupplierContractID === 'string' && cleanedOperation.SupplierContractID.includes(' || ')) {
                            const [id] = cleanedOperation.SupplierContractID.split(' || ').map((v: string) => v.trim());
                            cleanedOperation.SupplierContractID = id;
                        }

                        // Clean up ItemService array
                        if (cleanedOperation.ItemService && Array.isArray(cleanedOperation.ItemService)) {
                            cleanedOperation.ItemService = cleanedOperation.ItemService.map((item: any) => {
                                const cleanedItem = { ...item };

                                // Remove || from Service if it exists
                                if (typeof cleanedItem.Service === 'string' && cleanedItem.Service.includes(' || ')) {
                                    const [id] = cleanedItem.Service.split(' || ').map((v: string) => v.trim());
                                    cleanedItem.Service = id;
                                }

                                return cleanedItem;
                            });
                        }

                        return cleanedOperation;
                    }),

                    // ReinvoiceCostTo
                    ReinvoiceCostTo: {
                        ...billingData?.BillingDetails?.ReinvoiceCostTo,
                        ReinvoiceCostToDetails: (billingData?.BillingDetails?.ReinvoiceCostTo?.ReinvoiceCostToDetails || []).map((item: any) => {
                            // Check if this item (or its group) is selected
                            // Logic from handleRowClick: if item.ItemName is in selectedRowIds
                            const isSelected = selectedRowIds.has(item.ItemName);
                            const newIsBilled = isSelected ? 1 : 0;
                            // If the row was edited inline, its ModeFlag will already be 'Update'.
                            // Otherwise, mark 'Update' only if IsBilled changed.
                            let modeFlag = item.ModeFlag || "NoChange";

                            if (item.IsBilled !== newIsBilled) {
                                modeFlag = "Update";
                            }

                            if (item.ModeFlag === 'Update') {
                                modeFlag = 'Update';
                            }

                            return {
                                ...item,
                                IsBilled: newIsBilled,
                                ModeFlag: modeFlag
                            };
                        })
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

    // Handler for Confirm Disposal
    const handleConfirmDisposal = async () => {
        if (!billingData) return;

        try {
            setLoading(true);

            const userContext = workOrderService.getUserContext();
            const payload = {
                Header: {
                    ...billingData.Header,
                    BillingHeaderDetails: {
                        ...billingData.Header.BillingHeaderDetails,
                        ModeFlag: "NoChanges"
                    }
                },
                BillingDetails: {
                    Disposal: {
                        ...billingData.BillingDetails.Disposal,
                        ModeFlag: "Update"
                    }
                }
            };

            console.log("Confirm Disposal Payload:", JSON.stringify(payload, null, 2));

            const response = await workOrderService.supplierBillingConfirm(payload);
            console.log("Confirm Disposal Response:", response);

            if (response?.data?.IsSuccess) {
                toast({
                    title: "Disposal Confirmed Successfully",
                    description: response.data.Message || "Disposal confirmed successfully",
                    variant: "default",
                });

                // Re-fetch billing details to get updated status
                if (workOrderNumber) {
                    const updatedResponse = await workOrderService.getBillingDetails(workOrderNumber);
                    if (updatedResponse?.data?.ResponseData) {
                        const parsedData = JSON.parse(updatedResponse.data.ResponseData);
                        setBillingData(parsedData);
                    }
                }
            } else {
                toast({
                    title: "Error Confirming Disposal",
                    description: response?.data?.Message || "Confirm failed",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error confirming disposal:", error);
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler for Amend Disposal
    const handleAmendDisposal = async () => {
        if (!billingData) return;

        try {
            setLoading(true);

            const userContext = workOrderService.getUserContext();
            const payload = {
                Header: {
                    ...billingData.Header,
                    BillingHeaderDetails: {
                        ...billingData.Header.BillingHeaderDetails,
                        ModeFlag: "NoChanges"
                    }
                },
                BillingDetails: {
                    Disposal: {
                        ...billingData.BillingDetails.Disposal,
                        ModeFlag: "Update"
                    }
                }
            };

            console.log("Amend Disposal Payload:", JSON.stringify(payload, null, 2));

            const response = await workOrderService.supplierBillingAmend(payload);
            console.log("Amend Disposal Response:", response);

            if (response?.data?.IsSuccess) {
                toast({
                    title: "Disposal Amended Successfully",
                    description: response.data.Message || "Disposal amended successfully",
                    variant: "default",
                });

                // Re-fetch billing details to get updated status
                if (workOrderNumber) {
                    const updatedResponse = await workOrderService.getBillingDetails(workOrderNumber);
                    if (updatedResponse?.data?.ResponseData) {
                        const parsedData = JSON.parse(updatedResponse.data.ResponseData);
                        setBillingData(parsedData);
                    }
                }
            } else {
                toast({
                    title: "Error Amending Disposal",
                    description: response?.data?.Message || "Amend failed",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error amending disposal:", error);
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler for Confirm Re-Invoice
    const handleConfirmReinvoice = async () => {
        if (!billingData) return;

        try {
            setLoading(true);

            const userContext = workOrderService.getUserContext();
            const payload = {
                Header: {
                    ...billingData.Header,
                    BillingHeaderDetails: {
                        ...billingData.Header.BillingHeaderDetails,
                        ModeFlag: "NoChanges"
                    }
                },
                BillingDetails: {
                    ReinvoiceCostTo: {
                        ...billingData.BillingDetails.ReinvoiceCostTo,
                        ModeFlag: "Update"
                    }
                }
            };

            console.log("Confirm Re-Invoice Payload:", JSON.stringify(payload, null, 2));

            const response = await workOrderService.customerBillingConfirm(payload);
            console.log("Confirm Re-Invoice Response:", response);

            if (response?.data?.IsSuccess) {
                toast({
                    title: "Re-Invoice Confirmed Successfully",
                    description: response.data.Message || "Re-Invoice confirmed successfully",
                    variant: "default",
                });

                // Re-fetch billing details to get updated status
                if (workOrderNumber) {
                    const updatedResponse = await workOrderService.getBillingDetails(workOrderNumber);
                    if (updatedResponse?.data?.ResponseData) {
                        const parsedData = JSON.parse(updatedResponse.data.ResponseData);
                        setBillingData(parsedData);
                    }
                }
            } else {
                toast({
                    title: "Error Confirming Re-Invoice",
                    description: response?.data?.Message || "Confirm failed",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error confirming re-invoice:", error);
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler for Amend Re-Invoice
    const handleAmendReinvoice = async () => {
        if (!billingData) return;

        try {
            setLoading(true);

            const userContext = workOrderService.getUserContext();
            const payload = {
                Header: {
                    ...billingData.Header,
                    BillingHeaderDetails: {
                        ...billingData.Header.BillingHeaderDetails,
                        ModeFlag: "NoChanges"
                    }
                },
                BillingDetails: {
                    ReinvoiceCostTo: {
                        ...billingData.BillingDetails.ReinvoiceCostTo,
                        ModeFlag: "Update"
                    }
                }
            };

            console.log("Amend Re-Invoice Payload:", JSON.stringify(payload, null, 2));

            const response = await workOrderService.customerBillingAmend(payload);
            console.log("Amend Re-Invoice Response:", response);

            if (response?.data?.IsSuccess) {
                toast({
                    title: "Re-Invoice Amended Successfully",
                    description: response.data.Message || "Re-Invoice amended successfully",
                    variant: "default",
                });

                // Re-fetch billing details to get updated status
                if (workOrderNumber) {
                    const updatedResponse = await workOrderService.getBillingDetails(workOrderNumber);
                    if (updatedResponse?.data?.ResponseData) {
                        const parsedData = JSON.parse(updatedResponse.data.ResponseData);
                        setBillingData(parsedData);
                    }
                }
            } else {
                toast({
                    title: "Error Amending Re-Invoice",
                    description: response?.data?.Message || "Amend failed",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error amending re-invoice:", error);
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler for Confirm Item Service
    const handleConfirmItemService = async () => {
        if (!billingData) return;

        // Validation: Must select a row
        if (!selectedOperationRow) {
            toast({
                title: "Selection Required",
                description: "Please select any row before confirming",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            const userContext = workOrderService.getUserContext();
            const supplierParts = selectedOperationRow.Supplier?.split('||').map((s: string) => s.trim()) || [];
            const supplierContractParts = selectedOperationRow.SupplierContractID?.split('||').map((s: string) => s.trim()) || [];
 
            const supplierId = supplierParts[0] || '';
            const supplierDescription = supplierParts[1] || '';
            const supplierContractId = supplierContractParts[0] || '';
            const supplierContractDescription = supplierContractParts[1] || '';

            // Construct the selected operation with all its ItemService data
            const selectedOperation = {
                ...selectedOperationRow,
                Supplier: supplierId,
                SupplierDescription: supplierDescription,
                SupplierContractID: supplierContractId,
                SupplierContractDescription: supplierContractDescription,
                ModeFlag: "Update",
                // ItemService: selectedOperationRow.ItemService?.map((item: any) => ({
                //     ...item,
                //     Service: (typeof item?.Service === 'string')
                //             ? (item.Service.includes(' || ') 
                //                 ? item.Service.split(' || ')[0].trim() 
                //                 : item.Service
                //             )
                //             : "",
                //     ModeFlag: item.ModeFlag || "NoChange"
                // })) || []
                ItemService: selectedOperationRow.ItemService?.map((item: any) => {
                    const serviceParts = item.Service?.split('||').map((s: string) => s.trim()) || [];
                    const serviceId = serviceParts[0] || '';
                    const serviceDescription = serviceParts[1] || serviceParts[0] || ''; // Use serviceId as fallback for description
                    return {
                        ...item,
                        Service: serviceId, // Send only the ID part
                        ServiceDescription: serviceDescription, // Send the description part
                        ModeFlag: item.ModeFlag || "NoChange"
                    };
                }) || []
            };

            const payload = {
                Header: {
                    ...billingData.Header,
                    BillingHeaderDetails: {
                        ...billingData.Header.BillingHeaderDetails,
                        ModeFlag: "NoChanges"
                    }
                },
                BillingDetails: {
                    OperationBillingDetails: [selectedOperation]
                }
            };

            console.log("Confirm Item Service Payload:", JSON.stringify(payload, null, 2));

            const response = await workOrderService.supplierBillingConfirm(payload);
            console.log("Confirm Item Service Response:", response);

            if (response?.data?.IsSuccess) {
                toast({
                    title: "Item Service Confirmed Successfully",
                    description: response.data.Message || "Item Service confirmed successfully",
                    variant: "default",
                });

                // Re-fetch billing details to get updated status
                if (workOrderNumber) {
                    const updatedResponse = await workOrderService.getBillingDetails(workOrderNumber);
                    if (updatedResponse?.data?.ResponseData) {
                        const parsedData = JSON.parse(updatedResponse.data.ResponseData);
                        setBillingData(parsedData);
                        // Update selection with the updated row from response
                        if (selectedOperationRow?.OrderID) {
                            const updatedRow = parsedData.BillingDetails?.OperationBillingDetails?.find(
                                (row: any) => row.OrderID === selectedOperationRow.OrderID
                            );
                            if (updatedRow) {
                                setSelectedOperationRow(updatedRow);
                            } else {
                                setSelectedOperationRow(null);
                            }
                        }
                    }
                }
            } else {
                toast({
                    title: "Error Confirming Item Service",
                    description: response?.data?.Message || "Confirm failed",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error confirming item service:", error);
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler for Amend Item Service
    const handleAmendItemService = async () => {
        if (!billingData) return;

        // Validation: Must select a row
        if (!selectedOperationRow) {
            toast({
                title: "Selection Required",
                description: "Please select any row before amending",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            const userContext = workOrderService.getUserContext();
            const supplierParts = selectedOperationRow.Supplier?.split('||').map((s: string) => s.trim()) || [];
            const supplierContractParts = selectedOperationRow.SupplierContractID?.split('||').map((s: string) => s.trim()) || [];
 
            const supplierId = supplierParts[0] || '';
            const supplierDescription = supplierParts[1] || '';
            const supplierContractId = supplierContractParts[0] || '';
            const supplierContractDescription = supplierContractParts[1] || '';

            // Construct the selected operation with all its ItemService data
            const selectedOperation = {
                ...selectedOperationRow,
                Supplier: supplierId,
                SupplierDescription: supplierDescription,
                SupplierContractID: supplierContractId,
                SupplierContractDescription: supplierContractDescription,
                ModeFlag: "Update",
                // ItemService: selectedOperationRow.ItemService?.map((item: any) => ({
                //     ...item,
                //     ModeFlag: item.ModeFlag || "NoChange"
                // })) || []
                ItemService: selectedOperationRow.ItemService?.map((item: any) => {
                    const serviceParts = item.Service?.split('||').map((s: string) => s.trim()) || [];
                    const serviceId = serviceParts[0] || '';
                    const serviceDescription = serviceParts[1] || serviceParts[0] || ''; // Use serviceId as fallback for description
                    return {
                        ...item,
                        Service: serviceId, // Send only the ID part
                        ServiceDescription: serviceDescription, // Send the description part
                        ModeFlag: item.ModeFlag || "NoChange"
                    };
                }) || []
            };

            const payload = {
                Header: {
                    ...billingData.Header,
                    BillingHeaderDetails: {
                        ...billingData.Header.BillingHeaderDetails,
                        ModeFlag: "NoChanges"
                    }
                },
                BillingDetails: {
                    OperationBillingDetails: [selectedOperation]
                }
            };

            console.log("Amend Item Service Payload:", JSON.stringify(payload, null, 2));

            const response = await workOrderService.supplierBillingAmend(payload);
            console.log("Amend Item Service Response:", response);

            if (response?.data?.IsSuccess) {
                toast({
                    title: "Item Service Amended Successfully",
                    description: response.data.Message || "Item Service amended successfully",
                    variant: "default",
                });

                // Re-fetch billing details to get updated status
                if (workOrderNumber) {
                    const updatedResponse = await workOrderService.getBillingDetails(workOrderNumber);
                    if (updatedResponse?.data?.ResponseData) {
                        const parsedData = JSON.parse(updatedResponse.data.ResponseData);
                        setBillingData(parsedData);
                        // Update selection with the updated row from response
                        if (selectedOperationRow?.OrderID) {
                            const updatedRow = parsedData.BillingDetails?.OperationBillingDetails?.find(
                                (row: any) => row.OrderID === selectedOperationRow.OrderID
                            );
                            if (updatedRow) {
                                setSelectedOperationRow(updatedRow);
                            } else {
                                setSelectedOperationRow(null);
                            }
                        }
                    }
                }
            } else {
                toast({
                    title: "Error Amending Item Service",
                    description: response?.data?.Message || "Amend failed",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error amending item service:", error);
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

    // Mock data for orders with nested order items (COMMENTED - Using API data instead)
    /*
    const initialOrdersData = [
        {
            id: 1,
            orderNumber: 'ORD-2024-001',
            customer: 'Acme Corp',
            orderDate: '2024-01-15',
            status: 'Delivered',
            totalAmount: 15420.50,
            shippingAddress: '123 Main St, New York, NY 10001',
            contactPerson: 'John Smith',
            contactPhone: '+1-555-0101',
            deliveryNotes: 'Deliver to loading dock B, call before arrival',
            orderItems: [
            { id: 101, itemName: 'Widget A', quantity: 50, unitPrice: 125.50, total: 6275.00, status: 'Shipped' },
            { id: 102, itemName: 'Widget B', quantity: 30, unitPrice: 89.99, total: 2699.70, status: 'Shipped' },
            { id: 103, itemName: 'Widget C', quantity: 100, unitPrice: 64.458, total: 6445.80, status: 'Delivered' }
            ]
        },
        {
            id: 2,
            orderNumber: 'ORD-2024-002',
            customer: 'Tech Solutions Inc',
            orderDate: '2024-01-18',
            status: 'Processing',
            totalAmount: 8950.00,
            shippingAddress: '456 Tech Park, San Francisco, CA 94105',
            contactPerson: 'Sarah Johnson',
            contactPhone: '+1-555-0202',
            deliveryNotes: 'Ring doorbell, signature required',
            orderItems: [
            { id: 201, itemName: 'Component X', quantity: 25, unitPrice: 150.00, total: 3750.00, status: 'Processing' },
            { id: 202, itemName: 'Component Y', quantity: 40, unitPrice: 130.00, total: 5200.00, status: 'Processing' }
            ]
        },
        {
            id: 3,
            orderNumber: 'ORD-2024-003',
            customer: 'Global Enterprises',
            orderDate: '2024-01-20',
            status: 'Pending',
            totalAmount: 22500.00,
            shippingAddress: '789 Corporate Blvd, Chicago, IL 60601',
            contactPerson: 'Michael Chen',
            contactPhone: '+1-555-0303',
            deliveryNotes: 'Schedule delivery between 9 AM - 5 PM, weekdays only',
            orderItems: [
            { id: 301, itemName: 'Product Alpha', quantity: 150, unitPrice: 150.00, total: 22500.00, status: 'Pending' }
            ]
        }
    ];
    */

    // Use API data from billingData.BillingDetails.OperationBillingDetails
    const operationBillingData = billingData?.BillingDetails?.OperationBillingDetails || [];

    // Operation Billing columns configuration (Main rows)
    const orderColumns: GridColumnConfig[] = [
        {
            key: 'OrderID',
            label: 'Order ID',
            type: 'EditableText',
            width: 150,
            sortable: true,
            filterable: true,
            editable: false
        },
        {
            key: 'TypeOfAction',
            label: 'Type of Action',
            type: 'EditableText',
            width: 200,
            sortable: true,
            filterable: true,
            editable: false
        },
        {
            key: 'TypeOfActionDescription',
            label: 'Type of Action Description',
            type: 'EditableText',
            width: 200,
            sortable: true,
            filterable: true,
            editable: false
        },
        {
            key: 'Operation',
            label: 'Operation',
            type: 'EditableText',
            width: 130,
            sortable: true,
            filterable: true,
            editable: false
        },
        {
            key: 'OperationDescription',
            label: 'Operation Description',
            type: 'EditableText',
            width: 350,
            sortable: true,
            filterable: true,
            editable: false
        },
        {
            key: 'Supplier',
            label: 'Supplier',
            type: 'LazySelect',
            width: 300,
            sortable: true,
            filterable: true,
            fetchOptions: fetchMaster('Supplier Init'),
            onChange: (value: any, rowData: any) => {
                // Extract ID and Description from piped format "id || name"
                if (typeof value === 'string' && value.includes(' || ')) {
                    const [id, desc] = value.split(' || ').map((v: string) => v.trim());
                    console.log("Supplier changed - ID:", id, "Description:", desc);
                    // Update both Supplier and SupplierDescription
                    return {
                        Supplier: id,
                        SupplierDescription: desc
                    };
                }
                return value;
            }
        },
        {
            key: 'SupplierDescription',
            label: 'Supplier Description',
            type: 'EditableText',
            width: 200,
            sortable: true,
            filterable: true,
            editable: false
        },
        {
            key: 'SupplierContractID',
            label: 'Supplier Contract',
            type: 'LazySelect',
            width: 350,
            sortable: true,
            filterable: true,
            subRow: true,
            fetchOptions: fetchMaster('Contract Init'),
            onChange: (value: any, rowData: any) => {
                // Extract ID and Description from piped format "id || name"
                if (typeof value === 'string' && value.includes(' || ')) {
                    const [id, desc] = value.split(' || ').map((v: string) => v.trim());
                    console.log("SupplierContractID changed - ID:", id, "Description:", desc);
                    // Update both SupplierContractID and SupplierContractDescription
                    return {
                        SupplierContractID: id,
                        SupplierContractDescription: desc
                    };
                }
                return value;
            }
        },
        {
            key: 'QuickOrderNo',
            label: 'Quick Order No',
            type: 'EditableText',
            width: 150,
            sortable: true,
            filterable: true,
            subRow: true,
            editable: false
        },
        {
            key: 'BillStatus',
            label: 'QO Status',
            type: 'Badge',
            width: 120,
            sortable: true,
            filterable: true,
            statusMap: {
                'InProgress': 'bg-blue-500 text-white',
                'Completed': 'bg-green-500 text-white',
                'Pending': 'bg-yellow-500 text-white',
                'Cancelled': 'bg-red-500 text-white'
            },
            editable: false
        },
        {
            key: 'TotalCost',
            label: 'Total Cost',
            type: 'CurrencyWithSymbol',
            width: 140,
            sortable: true,
            filterable: true,
            editable: false
        },
        {
            key: "ActionButton",
            label: "Actions",
            type: "Text",
            sortable: false,
            filterable: false,
            editable: false,
            width: 50,
        }
    ];

    // Item Service columns configuration (Nested rows)
    const orderItemColumns: GridColumnConfig[] = [
        {
            key: 'Service',
            label: 'Service',
            type: 'LazySelect',
            width: 300,
            sortable: true,
            fetchOptions: fetchMaster('Work Order Services Init'),
            onChange: (value: any, rowData: any) => {
                // Extract ID and Description from piped format "id || name"
                if (typeof value === 'string' && value.includes(' || ')) {
                    const [id, desc] = value.split(' || ').map((v: string) => v.trim());
                    console.log("Service changed - ID:", id, "Description:", desc);
                    // Update both Service and ServiceDescription
                    return {
                        Service: id,
                        ServiceDescription: desc
                    };
                }
                return value;
            }
        },
        {
            key: 'Reference',
            label: 'Reference',
            type: 'EditableText',
            width: 200,
            sortable: true
        },
        {
            key: 'CostEXVat',
            label: 'Cost EX VAT',
            // type: 'CurrencyWithSymbol',
            type: 'Integer',
            width: 200,
            sortable: true,
        },
        // {
        //     key: "DeleteAction",
        //     label: "Actions",
        //     type: "Text",
        //     sortable: false,
        //     filterable: false,
        //     editable: false,
        //     width: 40,
        // }
    ];

    // Handle parent operation row addition
    const handleAddOrder = async (newOrder: any) => {
        console.log('Adding new operation:', newOrder);

        // Split LazySelect values (ID || Description format)
        const processedOrder = { ...newOrder };

        // Split Supplier
        if (typeof processedOrder.Supplier === 'string' && processedOrder.Supplier.includes(' || ')) {
            const [id, desc] = processedOrder.Supplier.split(' || ').map((v: string) => v.trim());
            processedOrder.Supplier = id;
            processedOrder.SupplierDescription = desc;
        }

        // Split SupplierContractID
        if (typeof processedOrder.SupplierContractID === 'string' && processedOrder.SupplierContractID.includes(' || ')) {
            const [id, desc] = processedOrder.SupplierContractID.split(' || ').map((v: string) => v.trim());
            processedOrder.SupplierContractID = id;
            processedOrder.SupplierContractDescription = desc;
        }

        const updatedData = {
            ...billingData,
            BillingDetails: {
                ...billingData.BillingDetails,
                OperationBillingDetails: [
                    ...operationBillingData,
                    {
                        ...processedOrder,
                        ItemService: [],
                        ModeFlag: 'Insert'
                    }
                ]
            }
        };
        setBillingData(updatedData);
        return newOrder;
    };

    // Handle parent operation row editing
    const handleEditOrder = async (updatedOrder: any, rowIndex: number) => {
        console.log('Editing operation:', { rowIndex, updatedOrder });

        const processedOrder = { ...updatedOrder };

        // Split Supplier
        if (typeof processedOrder.Supplier === 'string' && processedOrder.Supplier.includes(' || ')) {
            const [id, desc] = processedOrder.Supplier.split(' || ').map((v: string) => v.trim());
            processedOrder.Supplier = id;
            processedOrder.SupplierDescription = desc;
        }

        // Split SupplierContractID
        if (typeof processedOrder.SupplierContractID === 'string' && processedOrder.SupplierContractID.includes(' || ')) {
            const [id, desc] = processedOrder.SupplierContractID.split(' || ').map((v: string) => v.trim());
            processedOrder.SupplierContractID = id;
            processedOrder.SupplierContractDescription = desc;
        }

        const updated = [...operationBillingData];
        updated[rowIndex] = {
            ...updated[rowIndex],
            ...processedOrder,
            ModeFlag: 'Update'
        };
        setBillingData({
            ...billingData,
            BillingDetails: {
                ...billingData.BillingDetails,
                OperationBillingDetails: updated
            }
        });
    };

    // Handle parent operation row deletion
    const handleDeleteOrder = async (rowIndex: number) => {
        console.log('Deleting operation at index:', rowIndex);
        const updated = operationBillingData.filter((_, idx) => idx !== rowIndex);
        setBillingData({
            ...billingData,
            BillingDetails: {
                ...billingData.BillingDetails,
                OperationBillingDetails: updated
            }
        });
    };

    // Handle nested item service inline edit
    const handleOrderItemEdit = async (
        parentRowIndex: number,
        nestedRowIndex: number,
        updatedItem: any
    ) => {
        console.log('Editing item service:', { parentRowIndex, nestedRowIndex, updatedItem });

        const updated = [...operationBillingData];
        const operation = { ...updated[parentRowIndex] };
        const items = [...(operation.ItemService || [])];

        items[nestedRowIndex] = {
            ...items[nestedRowIndex],
            ...updatedItem,
            ModeFlag: 'Update'
        };

        operation.ItemService = items;
        operation.TotalCost = items.reduce((sum, item) => sum + (item.CostEXVat || 0), 0);
        operation.ModeFlag = 'Update';

        updated[parentRowIndex] = operation;

        setBillingData({
            ...billingData,
            BillingDetails: {
                ...billingData.BillingDetails,
                OperationBillingDetails: updated
            }
        });
    };

    // Handle adding new nested item service
    const handleAddOrderItem = async (
        parentRowIndex: number,
        newItem: any
    ) => {
        console.log('Adding new item service:', { parentRowIndex, newItem });
        const updated = [...operationBillingData];
        const operation = { ...updated[parentRowIndex] };
        const items = [...(operation.ItemService || [])];

        const newItemWithModeFlag = {
            ...newItem,
            ModeFlag: 'Insert'
        };

        items.push(newItemWithModeFlag);
        operation.ItemService = items;
        operation.TotalCost = items.reduce((sum, item) => sum + (item.CostEXVat || 0), 0);
        operation.ModeFlag = 'Update';

        updated[parentRowIndex] = operation;

        setBillingData({
            ...billingData,
            BillingDetails: {
                ...billingData.BillingDetails,
                OperationBillingDetails: updated
            }
        });
    };

    // Handle deleting nested item service
    const handleDeleteOrderItem = async (
        parentRowIndex: number,
        nestedRowIndex: number
    ) => {
        console.log('Deleting item service:', { parentRowIndex, nestedRowIndex });
        const updated = [...operationBillingData];
        const operation = { ...updated[parentRowIndex] };
        const items = [...(operation.ItemService || [])];

        // Mark the item as deleted instead of removing it
        items[nestedRowIndex] = {
            ...items[nestedRowIndex],
            ModeFlag: 'Delete'
        };

        // Filter out deleted items for display purposes
        const visibleItems = items.filter(item => item.ModeFlag !== 'Delete');

        operation.ItemService = items; // Keep all items including deleted ones
        operation.TotalCost = visibleItems.reduce((sum, item) => sum + (item.CostEXVat || 0), 0);
        // Don't change the parent's ModeFlag - keep it as is (NoChange or whatever it was)

        updated[parentRowIndex] = operation;

        setBillingData({
            ...billingData,
            BillingDetails: {
                ...billingData.BillingDetails,
                OperationBillingDetails: updated
            }
        });
    };

    // Default values for new operation rows
    const defaultOrderValues = {
        OrderID: '',
        TypeOfAction: '',
        Operation: '',
        Supplier: '',
        SupplierDescription: '',
        SupplierContractID: '',
        SupplierContractDescription: '',
        QuickOrderNo: '',
        BillStatus: '',
        TotalCost: 0
    };

    // Default values for new item service rows
    const defaultOrderItemValues = {
        Service: '',
        ServiceDescription: '',
        Reference: '',
        CostEXVat: 0,
        CostEXVatUom: ''
    };

    const handleMarginAmountEditable = (rowIndex: number, row: any) => {
        // Update local state only. Mark the edited row's ModeFlag so handleSave will send the update.
        try {
            const newData = JSON.parse(JSON.stringify(billingData || {}));
            const details = newData?.BillingDetails?.ReinvoiceCostTo?.ReinvoiceCostToDetails || [];

            if (typeof rowIndex === 'number' && details[rowIndex]) {
                details[rowIndex] = {
                    ...details[rowIndex],
                    ...row,
                    ModeFlag: 'Update'
                };

                newData.BillingDetails.ReinvoiceCostTo.ReinvoiceCostToDetails = details;
                setBillingData(newData);
            }
        } catch (err) {
            console.error('Error applying local margin update', err);
        }
    };

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
                            onClick={async () => {
                                setShowBillingSummary(true);
                                console.log("Billing Summary clicked");

                                // Fetch billing summary data
                                if (workOrderNumber) {
                                    setLoadingBillingSummary(true);
                                    try {
                                        const response = await workOrderService.getBillingSummary(workOrderNumber);
                                        const parsedData = response?.data?.ResponseData
                                            ? JSON.parse(response.data.ResponseData)
                                            : response?.data;

                                        console.log("Billing Summary Response:", parsedData);
                                        setBillingSummaryData(parsedData);

                                        // toast({
                                        //     title: "Success",
                                        //     description: "Billing summary loaded successfully",
                                        // });
                                    } catch (error) {
                                        console.error("Error fetching billing summary:", error);
                                        toast({
                                            title: "Error",
                                            description: "Failed to load billing summary",
                                            variant: "destructive",
                                        });
                                    } finally {
                                        setLoadingBillingSummary(false);
                                    }
                                }
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
                                    <div className="grid grid-cols-3 gap-3 mb-3">

                                        {/* Invoicing Reference */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Invoicing Reference</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUForward?.InvoicingReference || ""}
                                                onChange={(e) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.InvoicingReference", e.target.value);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.ModeFlag", "Update");
                                                }}
                                                placeholder="Enter Invoicing Reference"
                                            />
                                        </div>

                                        {/* Cost */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Cost</label>
                                            <InputDropdown
                                                value={{
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUForward?.CurrencyUOM,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUForward?.Cost?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.CurrencyUOM", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.Cost", val.input);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.ModeFlag", "Update");
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
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUForward?.CurrencyUOM,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUForward?.FeeAt?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.CurrencyUOM", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.FeeAt", val.input);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.ModeFlag", "Update");
                                                }}
                                                options={currencyOptions}
                                                placeholder="0.00"
                                                editable={false}
                                            />
                                        </div>





                                        {/* Draft Bill No */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Draft Bill No.</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUForward?.DraftBillNo || ""}
                                                onChange={(e) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.DraftBillNo", e.target.value);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.ModeFlag", "Update");
                                                }}
                                                placeholder="Enter Draft Bill No"
                                            />
                                        </div>

                                        {/* Trip No */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Trip No.</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUForward?.TripNo || ""}
                                                onChange={(e) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.TripNo", e.target.value);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUForward.ModeFlag", "Update");
                                                }}
                                                placeholder="Enter Trip No"
                                                disabled={true}
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
                                    <div className="grid grid-cols-3 gap-3 mb-3">

                                        {/* Invoicing Reference */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Invoicing Reference</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUReturn?.InvoicingReference || ""}
                                                onChange={(e) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.InvoicingReference", e.target.value);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.ModeFlag", "Update");
                                                }}
                                                placeholder="Enter Invoicing Reference"
                                            />
                                        </div>

                                        {/* Cost */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Cost</label>
                                            <InputDropdown
                                                value={{
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUReturn?.CurrencyUOM,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUReturn?.Cost?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.CurrencyUOM", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.Cost", val.input);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.ModeFlag", "Update");
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
                                                    dropdown: billingData?.BillingDetails?.TransportCharges?.RUReturn?.CurrencyUOM,
                                                    input: billingData?.BillingDetails?.TransportCharges?.RUReturn?.FeeAt?.toString()
                                                }}
                                                onChange={(val) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.CurrencyUOM", val.dropdown);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.FeeAt", val.input);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.ModeFlag", "Update");
                                                }}
                                                options={currencyOptions}
                                                placeholder="0.00"
                                                editable={false}
                                            />
                                        </div>





                                        {/* Draft Bill No */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Draft Bill No</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUReturn?.DraftBillNo || ""}
                                                onChange={(e) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.DraftBillNo", e.target.value);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.ModeFlag", "Update");
                                                }}
                                                placeholder="Enter Draft Bill No"
                                            />
                                        </div>

                                        {/* Trip No */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Trip No</label>
                                            <Input
                                                type="text"
                                                value={billingData?.BillingDetails?.TransportCharges?.RUReturn?.TripNo || ""}
                                                onChange={(e) => {
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.TripNo", e.target.value);
                                                    handleNestedChange("BillingDetails.TransportCharges.RUReturn.ModeFlag", "Update");
                                                }}
                                                placeholder="Enter Trip No"
                                                disabled={true}
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
                        badge={
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-medium px-3 py-1 rounded-full">
                                Total Cost : € {(
                                    operationBillingData.reduce((sum, operation) => sum + (operation.TotalCost || 0), 0)
                                ).toFixed(2)}
                            </span>
                        }
                    >
                        {/* item service panel - nested editable grid */}
                        <div className="">
                            <SmartGridPlusWithNestedRows
                                gridTitle="Item Service"
                                columns={orderColumns}
                                data={operationBillingData}
                                onAddRow={handleAddOrder}
                                onEditRow={handleEditOrder}
                                onDeleteRow={handleDeleteOrder}
                                defaultRowValues={defaultOrderValues}
                                hideToolbar={false}
                                paginationMode="pagination"
                                customPageSize={10}
                                inlineRowEditing={true}
                                inlineRowAddition={false}
                                selectionMode="single"
                                onSelectedRowsChange={(selectedRows) => {
                                    console.log('Selected rows:', selectedRows);
                                    // Since selectionMode is "single", selectedRows will have 0 or 1 item
                                    if (selectedRows && selectedRows.length === 1) {
                                        setSelectedOperationRow(selectedRows[0]);
                                    } else {
                                        setSelectedOperationRow(null);
                                    }
                                }}
                                nestedSectionConfig={{
                                    nestedDataKey: 'ItemService',
                                    columns: orderItemColumns,
                                    title: 'Item Services Nested',
                                    showNestedRowCount: true,
                                    onInlineEdit: handleOrderItemEdit,
                                    onAddRow: handleAddOrderItem,
                                    onDeleteRow: handleDeleteOrderItem,
                                    defaultRowValues: defaultOrderItemValues,
                                    validationRules: {
                                        requiredFields: ['Service']
                                    }
                                }}
                                onInfoClick={(rowData, rowIndex) => {
                                    console.log("Info clicked:", rowData, "at index:", rowIndex);
                                    setSelectedCode(rowData);
                                    setShowCodeInformation(true);
                                }}
                            />
                        </div>

                        {/* Item Service Panel Footer with Confirm/Amend Buttons */}
                        <div className="flex justify-end mt-4 pt-3">
                            {/* Show Amend ONLY if a row is selected AND status is Approved */}
                            {selectedOperationRow?.BillStatus === "Approved" ? (
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                    onClick={handleAmendItemService}
                                // disabled={loading}
                                >
                                    {/* {loading ? "Processing..." : "Amend Item Service"} */}
                                    Amend Item Service
                                </button>
                            ) : (
                                /* Show Confirm by default (no selection) OR if status is NOT Approved */
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                    onClick={handleConfirmItemService}
                                // disabled={loading}
                                >
                                    {/* {loading ? "Processing..." : "Confirm Item Service"} */}
                                    Confirm Item Service
                                </button>
                            )}
                        </div>

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
                        badge={
                            <>
                                {billingData?.BillingDetails?.Disposal?.BillStatus && (
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${billingData.BillingDetails.Disposal.BillStatus === 'InProgress' ? 'badge-orange rounded-2xl' :
                                        billingData.BillingDetails.Disposal.BillStatus === 'Approved' ? 'badge-green rounded-2xl' :
                                            billingData.BillingDetails.Disposal.BillStatus === 'Pending' ? 'badge-yellow rounded-2xl' :
                                                billingData.BillingDetails.Disposal.BillStatus === 'Cancelled' ? 'badge-red rounded-2xl' :
                                                    'bg-gray-500 text-white'
                                        }`}>
                                        {billingData.BillingDetails.Disposal.BillStatus === 'InProgress' ? 'In-Progress' :
                                            billingData.BillingDetails.Disposal.BillStatus === 'Approved' ? 'Approved' : "-"}
                                    </span>
                                )}
                                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-medium px-3 py-1 rounded-full">
                                    Total Cost : € {billingData?.BillingDetails?.Disposal?.TotalCost?.toFixed(2) || "0.00"}
                                </span>
                            </>
                        }
                    >
                        {/* Panel content */}
                        <div className="grid grid-cols-4 gap-3 mb-3">
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

                            {/* Supplier Contract */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Supplier Contract</label>
                                <DynamicLazySelect
                                    className="h-8"
                                    fetchOptions={fetchMaster("Contract Init")}
                                    value={billingData?.BillingDetails?.Disposal?.SupplierContractID
                                        ? `${billingData.BillingDetails.Disposal.SupplierContractID} || ${billingData.BillingDetails.Disposal.SupplierContractDescription || ""}`
                                        : ""}
                                    onChange={(val) => {
                                        if (val) {
                                            const [id, desc] = val.split(" || ");
                                            handleNestedChange("BillingDetails.Disposal.SupplierContractID", id);
                                            handleNestedChange("BillingDetails.Disposal.SupplierContractDescription", desc);
                                        } else {
                                            handleNestedChange("BillingDetails.Disposal.SupplierContractID", "");
                                            handleNestedChange("BillingDetails.Disposal.SupplierContractDescription", "");
                                        }
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    hideSearch={false}
                                    disableLazyLoading={false}
                                    placeholder="Select Supplier Contract"
                                />
                            </div>

                            {/* WBS */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">WBS</label>
                                <DynamicLazySelect
                                    className="h-8"
                                    fetchOptions={fetchMaster("WBS Init")}
                                    value={billingData?.BillingDetails?.Disposal?.WBS
                                        ? `${billingData.BillingDetails.Disposal.WBS} || ${billingData.BillingDetails.Disposal.WBSDescription || ""}`
                                        : ""}
                                    onChange={(val) => {
                                        if (val) {
                                            const [id, desc] = val.split(" || ");
                                            handleNestedChange("BillingDetails.Disposal.WBS", id);
                                            handleNestedChange("BillingDetails.Disposal.WBSDescription", desc);
                                        } else {
                                            handleNestedChange("BillingDetails.Disposal.WBS", "");
                                            handleNestedChange("BillingDetails.Disposal.WBSDescription", "");
                                        }
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    hideSearch={false}
                                    disableLazyLoading={false}
                                    placeholder="Select WBS"
                                />
                            </div>

                            {/* Processing Reference */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Processing Reference</label>
                                <Input
                                    type="text"
                                    value={billingData?.BillingDetails?.Disposal?.ProcessingReference || ""}
                                    onChange={(e) => {
                                        handleNestedChange("BillingDetails.Disposal.ProcessingReference", e.target.value);
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    placeholder="Enter Processing Reference"
                                />
                            </div>

                            {/* Quatity Processed */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Quatity Processed</label>
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

                            {/* Quick Order No */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Quick Order No</label>
                                <Input
                                    type="text"
                                    value={billingData?.BillingDetails?.Disposal?.QuickOrderNo || ""}
                                    onChange={(e) => {
                                        handleNestedChange("BillingDetails.Disposal.QuickOrderNo", e.target.value);
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    placeholder="Enter Quick Order No"
                                    disabled
                                />
                            </div>

                            {/* Bill Status */}
                            {/* <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Bill Status</label>
                                <Input
                                    type="text"
                                    value={billingData?.BillingDetails?.Disposal?.BillStatus || ""}
                                    onChange={(e) => {
                                        handleNestedChange("BillingDetails.Disposal.BillStatus", e.target.value);
                                        handleNestedChange("BillingDetails.Disposal.ModeFlag", "Update");
                                    }}
                                    placeholder="Enter Bill Status"
                                />
                            </div> */}
                        </div>

                        {/* Disposal Panel Footer with Confirm/Amend Buttons */}
                        {billingData?.BillingDetails?.Disposal && (
                            <div className="flex justify-end mt-4 pt-3">
                                {billingData.BillingDetails.Disposal.BillStatus === "InProgress" && (
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={handleConfirmDisposal}
                                    // disabled={loading}
                                    >
                                        {/* {loading ? "Processing..." : "Confirm Disposal"} */}
                                        Confirm Disposal
                                    </button>
                                )}
                                {billingData.BillingDetails.Disposal.BillStatus === "Approved" && (
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={handleAmendDisposal}
                                    // disabled={loading}
                                    >
                                        {/* {loading ? "Processing..." : "Amend Disposal"} */}
                                        Amend Disposal
                                    </button>
                                )}
                            </div>
                        )}
                    </CollapsibleBillingPanel>

                    {/* 4. Re-Invoice Cost to Panel */}
                    <CollapsibleBillingPanel
                        title="Re-Invoice Cost to"
                        icon={<User className="w-5 h-5 text-blue-400" />}
                        isExpanded={isAllExpanded}
                        badge={
                            <>
                                {billingData?.BillingDetails?.ReinvoiceCostTo?.BillStatus && (
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${billingData.BillingDetails.ReinvoiceCostTo.BillStatus === 'InProgress' ? 'badge-orange rounded-2xl' :
                                        billingData.BillingDetails.ReinvoiceCostTo.BillStatus === 'Approved' ? 'badge-green rounded-2xl' :
                                            billingData.BillingDetails.ReinvoiceCostTo.BillStatus === 'Pending' ? 'badge-yellow rounded-2xl' :
                                                billingData.BillingDetails.ReinvoiceCostTo.BillStatus === 'Cancelled' ? 'badge-red rounded-2xl' :
                                                    'bg-gray-500 text-white'
                                        }`}>
                                        {billingData.BillingDetails.ReinvoiceCostTo.BillStatus === 'InProgress' ? 'In-Progress' :
                                            billingData.BillingDetails.ReinvoiceCostTo.BillStatus === 'Approved' ? 'Approved' : "-"}
                                    </span>
                                )}
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
                        <div className="grid grid-cols-4 gap-4 mb-3">
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

                            {/* Customer Contract */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Customer Contract</label>
                                <DynamicLazySelect
                                    className="h-8"
                                    fetchOptions={fetchMaster("Contract Init")}
                                    value={billingData?.BillingDetails?.ReinvoiceCostTo?.CustomerContractID
                                        ? `${billingData.BillingDetails.ReinvoiceCostTo.CustomerContractID} || ${billingData.BillingDetails.ReinvoiceCostTo.CustomerContractDescription || ""}`
                                        : ""}
                                    onChange={(val) => {
                                        if (val) {
                                            const [id, desc] = val.split(" || ");
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.CustomerContractID", id);
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.CustomerContractDescription", desc);
                                        } else {
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.CustomerContractID", "");
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.CustomerContractDescription", "");
                                        }
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
                                    }}
                                    hideSearch={false}
                                    disableLazyLoading={false}
                                    placeholder="Select Customer Contract"
                                />
                            </div>

                            {/* WBS */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">WBS</label>
                                <DynamicLazySelect
                                    className="h-8"
                                    fetchOptions={fetchMaster("WBS Init")}
                                    value={billingData?.BillingDetails?.ReinvoiceCostTo?.WBS
                                        ? `${billingData.BillingDetails.ReinvoiceCostTo.WBS} || ${billingData.BillingDetails.ReinvoiceCostTo.WBSDescription || ""}`
                                        : ""}
                                    onChange={(val) => {
                                        if (val) {
                                            const [id, desc] = val.split(" || ");
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.WBS", id);
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.WBSDescription", desc);
                                        } else {
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.WBS", "");
                                            handleNestedChange("BillingDetails.ReinvoiceCostTo.WBSDescription", "");
                                        }
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
                                    }}
                                    hideSearch={false}
                                    disableLazyLoading={false}
                                    placeholder="Select WBS"
                                />
                            </div>

                            {/* Quick Order No */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Quick Order No</label>
                                <Input
                                    type="text"
                                    value={billingData?.BillingDetails?.ReinvoiceCostTo?.QuickOrderNo || ""}
                                    onChange={(e) => {
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.QuickOrderNo", e.target.value);
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
                                    }}
                                    placeholder="Enter Quick Order No"
                                    disabled
                                />
                            </div>

                            {/* Bill Status */}
                            {/* <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Bill Status</label>
                                <Input
                                    type="text"
                                    value={billingData?.BillingDetails?.ReinvoiceCostTo?.BillStatus || ""}
                                    onChange={(e) => {
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.BillStatus", e.target.value);
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
                                    }}
                                    placeholder="Enter Bill Status"
                                />
                            </div> */}

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
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
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
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
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
                                        handleNestedChange("BillingDetails.ReinvoiceCostTo.ModeFlag", "Update");
                                    }}
                                    options={currencyOptions}
                                    placeholder="0.00"
                                    editable={false}
                                />
                            </div>
                        </div>


                        {/* Grid for Re-Invoicing */}
                        <div className="mt-6">
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
                                        return selectedRowIds.has(row.ItemName) ? 'selected' : ''; // Row Selection based on ItemName
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
                                    onInlineEdit={handleMarginAmountEditable}

                                />
                            </div>
                        </div>

                        {/* Re-Invoice Panel Footer with Confirm/Amend Buttons */}
                        {billingData?.BillingDetails?.ReinvoiceCostTo && (
                            <div className="flex justify-end mt-4 pt-3">
                                {billingData.BillingDetails.ReinvoiceCostTo.BillStatus === "InProgress" && (
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={handleConfirmReinvoice}
                                    // disabled={loading}
                                    >
                                        {/* {loading ? "Processing..." : "Confirm Re-Invoice"} */}
                                        Confirm Re-Invoice
                                    </button>
                                )}
                                {billingData.BillingDetails.ReinvoiceCostTo.BillStatus === "Approved" && (
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={handleAmendReinvoice}
                                    // disabled={loading}
                                    >
                                        {/* {loading ? "Processing..." : "Amend Re-Invoice"} */}
                                        Amend Re-Invoice
                                    </button>
                                )}
                            </div>
                        )}
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
                {/* <button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => { console.log('confirm button clicked') }}
                >
                    Confirm
                </button> */}
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
                <div className="p-6 space-y-20">
                    {/* Total Supplier Billing Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">Total Supplier Billing</h3>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    {supplierTotalCount}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm bg-blue-50 text-blue-600 border border-blue-200 font-medium px-4 py-2 rounded-full">
                                    Total Cost : € {supplierTotalCost.toFixed(2)}
                                </span>
                                {/* Search bar for Supplier Billing */}
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search"
                                        value={supplierSearchTerm}
                                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <SmartGridWithGrouping
                                gridId="supplier-billing-summary"
                                columns={supplierBillingColumns}
                                data={supplierBillingData}
                                groupableColumns={[]}
                                showGroupingDropdown={false}
                                paginationMode="pagination"
                                customPageSize={10}
                                hideToolbar={true}
                                showDefaultConfigurableButton={false}
                                gridTitle=""
                                recordCount={supplierTotalCount}
                                showCreateButton={false}
                                clientSideSearch={true}
                                externalSearchQuery={supplierSearchTerm}
                                showSubHeaders={false}
                                hideAdvancedFilter={true}
                                hideCheckboxToggle={true}
                                showFilterTypeDropdown={false}
                                showServersideFilter={false}
                                userId="current-user"
                            />
                        </div>
                    </div>

                    {/* Total Customer Billing Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">Total Customer Billing</h3>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    {customerTotalCount}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm bg-blue-50 text-blue-600 border border-blue-200 font-medium px-4 py-2 rounded-full">
                                    Total Cost : € {customerTotalCost.toFixed(2)}
                                </span>
                                {/* Search bar for Customer Billing */}
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search"
                                        value={customerSearchTerm}
                                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <SmartGridWithGrouping
                                gridId="customer-billing-summary"
                                columns={customerBillingColumns}
                                data={customerBillingData}
                                groupableColumns={[]}
                                showGroupingDropdown={false}
                                paginationMode="pagination"
                                customPageSize={10}
                                hideToolbar={true}
                                showDefaultConfigurableButton={false}
                                gridTitle=""
                                recordCount={customerTotalCount}
                                showCreateButton={false}
                                clientSideSearch={true}
                                externalSearchQuery={customerSearchTerm}
                                showSubHeaders={false}
                                hideAdvancedFilter={true}
                                hideCheckboxToggle={true}
                                showFilterTypeDropdown={false}
                                showServersideFilter={false}
                                userId="current-user"
                            />
                        </div>
                    </div>
                </div>
            </SideDrawer>

            {/* Code Information Drawer */}
            <CodeInformationDrawer
                isOpen={showCodeInformation}
                onClose={() => setShowCodeInformation(false)}
                operationCode={selectedCode?.OrderID ? `${selectedCode.OrderID}` : "Operation"}
                selectedOnlyCodes={selectedCode?.CodeInformation}
                // selectedCode={selectedCode?.CodeNo}
                onCodeSelect={(code) => {
                    console.log("Code selected:", code);
                    // Handle code selection if needed
                }}
            />

            {loading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                    <div className="text-lg font-semibold text-blue-700">Loading...</div>
                    <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
                </div>
            )}

        </div>
    );
};

export default BillingDetails;
