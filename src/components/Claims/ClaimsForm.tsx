import React, { useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel"; // Changed import
import { Banknote, Search, Plus, FileSearch, SquarePen, ClipboardCheck, FileText, FileBarChart, ChevronDown, ChevronUp, Copy, MoreVertical, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SmartGrid } from "@/components/SmartGrid";
import { GridColumnConfig } from "@/types/smartgrid";
import { useFooterStore } from "@/stores/footerStore";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InvestigationDetails } from "./InvestigationDetails";
import { ClaimFindings } from "./ClaimFindings";
import ClaimLinkedInternalOrders from "./ClaimLinkedInternalOrders";
import { quickOrderService } from "@/api/services";

const ClaimsForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const formRef = useRef<DynamicPanelRef>(null);
    const { setFooter, resetFooter } = useFooterStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [claimStatus, setClaimStatus] = useState<string>("Approved"); // Default status
    const [showTooltip, setShowTooltip] = useState(false);
    const [showDropdownMenu, setShowDropdownMenu] = useState(false);
    const [investigationCount, setInvestigationCount] = useState(3); // State for investigation count
    const [isDocumentDetailsOpen, setIsDocumentDetailsOpen] = useState(true); // State for document details collapse
    const [investigationDetailsOpen, setInvestigationDetailsOpen] = useState(false); // State for investigation details sidedrawer
    const [claimFindingsOpen, setClaimFindingsOpen] = useState(false); // State for claim findings sidedrawer
    const [linkedInternalOrdersOpen, setLinkedInternalOrdersOpen] = useState(false); // State for linked internal orders sidedrawer
    // Function to get status color classes based on status name (same as ClaimsHub)
    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            // Status column colors
            'Released': 'badge-fresh-green rounded-2xl',
            'Executed': 'badge-purple rounded-2xl',
            'Open': 'badge-blue rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Rejected': 'badge-red rounded-2xl',
            'Approved': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Completed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
            'Under Revision': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'In Progress': 'badge-orange rounded-2xl',
            'Processed': 'badge-blue rounded-2xl',
            'Claim Initiated': 'badge-fresh-green rounded-2xl',
            'Draft': 'badge-orange rounded-2xl',
        };
        return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
    };

    // Get claim ID and status from URL and bind to searchQuery
    useEffect(() => {
        const claimId = searchParams.get('id') || searchParams.get('claimId') || searchParams.get('claimNo');
        const status = searchParams.get('status') || searchParams.get('claimStatus');
        
        if (claimId) {
            setSearchQuery(claimId);
        }
        
        if (status) {
            setClaimStatus(status);
        }
    }, [searchParams]);

    // Claims Findings data state - bound to form fields
    const [claimsFindingsData, setClaimsFindingsData] = useState({
        refDocTypeID: "Internal Order - IO_DE24_0239",
        finalClaimAmount: "€ 1000.00",
        usageIDGLAccount: "---",
        supplierNoteNo: "SU/001",
        supplierNoteAmount: "€ 1000.00",
        commentsRemarks: "Mistake Invoice"
    });

    // Document Details data state
    const [documentDetailsData, setDocumentDetailsData] = useState({
        totalInvoiceAmount: 4800.00,
        totalClaimAmount: 800.00,
        totalBalanceAmount: 4000.00,
        lineItems: [
            {
                lineNo: 1,
                tariffUsage: {
                    code: "TAR_HR_DE_22_0016",
                    description: "Crane-Army-Freight SNCF"
                },
                refDocument: {
                    type: "Internal Order",
                    date: "12-Mar-2025"
                },
                invoiceAmount: 1200.00,
                claimAmount: 200.00,
                balanceAmount: 1000.00,
                creditNoteNo: "CRN10002025/34",
                supplierNoteNo: "SPN10002025/34"
            },
            {
                lineNo: 2,
                tariffUsage: {
                    code: "TAR_HR_DE_22_0017",
                    description: "Crane-Army-Freight SNCF"
                },
                refDocument: {
                    type: "Internal Order",
                    date: "12-Mar-2025"
                },
                invoiceAmount: 1200.00,
                claimAmount: 200.00,
                balanceAmount: 1000.00,
                creditNoteNo: "CRN10002025/35",
                supplierNoteNo: "SPN10002025/35"
            },
            {
                lineNo: 3,
                tariffUsage: {
                    code: "TAR_HR_DE_22_0018",
                    description: "Crane-Army-Freight SNCF"
                },
                refDocument: {
                    type: "Internal Order",
                    date: "12-Mar-2025"
                },
                invoiceAmount: 1200.00,
                claimAmount: 200.00,
                balanceAmount: 1000.00,
                creditNoteNo: "CRN10002025/36",
                supplierNoteNo: "SPN10002025/36"
            },
            {
                lineNo: 4,
                tariffUsage: {
                    code: "TAR_HR_DE_22_0019",
                    description: "Crane-Army-Freight SNCF"
                },
                refDocument: {
                    type: "Internal Order",
                    date: "12-Mar-2025"
                },
                invoiceAmount: 1200.00,
                claimAmount: 200.00,
                balanceAmount: 1000.00,
                creditNoteNo: "CRN10002025/37",
                supplierNoteNo: "SPN10002025/37"
            }
        ]
    });

    // Format line items data for SmartGrid - store full objects for custom rendering
    const formattedLineItems = documentDetailsData.lineItems.map(item => ({
        lineNo: item.lineNo,
        tariffUsage: item.tariffUsage.code, // Link value
        tariffUsageFull: item.tariffUsage, // Full object for custom display
        refDocument: item.refDocument.type, // Main text
        refDocumentFull: item.refDocument, // Full object for custom display
        invoiceAmount: item.invoiceAmount,
        claimAmount: item.claimAmount,
        balanceAmount: item.balanceAmount,
        creditNoteNo: item.creditNoteNo,
        supplierNoteNo: item.supplierNoteNo
    }));

    // Document Details Grid Columns
    const documentDetailsColumns: GridColumnConfig[] = [
        {
            key: 'lineNo',
            label: 'Line No.',
            type: 'Text',
            sortable: false,
            editable: false,
            width: 100
        },
        {
            key: 'tariffUsage',
            label: 'Tariff/Usage',
            type: 'Link',
            sortable: false,
            editable: false,
            width: 250
        },
        {
            key: 'refDocument',
            label: 'Ref. Document',
            type: 'Text',
            sortable: false,
            editable: false,
            width: 200
        },
        {
            key: 'invoiceAmount',
            label: 'Invoice Amount',
            type: 'CurrencyWithSymbol',
            sortable: false,
            editable: false,
            width: 150
        },
        {
            key: 'claimAmount',
            label: 'Claim Amount',
            type: 'CurrencyWithSymbol',
            sortable: false,
            editable: false,
            width: 150
        },
        {
            key: 'balanceAmount',
            label: 'Balance Amount',
            type: 'CurrencyWithSymbol',
            sortable: false,
            editable: false,
            width: 150
        },
        {
            key: 'creditNoteNo',
            label: 'Credit Note No.',
            type: 'Link',
            sortable: false,
            editable: false,
            width: 180
        },
        {
            key: 'supplierNoteNo',
            label: 'Supplier Note No.',
            type: 'Link',
            sortable: false,
            editable: false,
            width: 180
        }
    ];

    // Dummy fetcher for lazyselect fields
    const fetchMaster = (
        messageType: string,
        // additionalFilter?: { FilterName: string; FilterValue: string }[]
        extraParams?: Record<string, any>
      ) => {
        return async ({ searchTerm, offset, limit }) => {
          try {
            const response = await quickOrderService.getMasterCommonData({
              messageType,
              searchTerm: searchTerm || "",
              offset,
              limit,
              ...(extraParams || {}),
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

    // Defining the config as PanelConfig object (Record<string, FieldConfig>)
    const claimPanelConfig: PanelConfig = {
        InvestigationNeeded: {
            id: "InvestigationNeeded",
            label: "Investigation Required",
            fieldType: "switch",
            width: "full",
            value: false,
            mandatory: false,
            visible: true,
            editable: true,
            order: 1
        },
        InitiatedBy: {
            id: "InitiatedBy",
            label: "Initiate By",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims Initiated by Init"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 2
        },
        Counterparty: {
            id: "Counterparty",
            label: "Counterparty",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims Counter Party Init"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 3
        },
        ForwardisFinancialAction: {
            id: "ForwardisFinancialAction",
            label: "Forwardis Financial Action",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims Forwardis Financial Action Init"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 4
        },
        ExpectedDocument: {
            id: "ExpectedDocument",
            label: "Expected Document",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims Expected Document Init"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 5
        },
        BusinessPartnerID: {
            id: "BusinessPartnerID",
            label: "Business Partner",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims Counter Party OnSelect"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 6
        },
        ClaimDate: {
            id: "ClaimDate",
            label: "Claim Date",
            fieldType: "date",
            width: "four",
            value: null,
            mandatory: true,
            visible: true,
            editable: true,
            order: 7
        },
        ClaimCategory: {
            id: "ClaimCategory",
            label: "Claim Category",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claim Category Init"),
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 8
        },
        ClaimAmount: {
            id: "ClaimAmount",
            label: "Claim Amount",
            fieldType: "currency",
            width: "four",
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 9
        },
        ClaimantRefNo: {
            id: "ClaimantRefNo",
            label: "Claimant Ref. No.",
            fieldType: "text",
            width: "four",
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 10
        },
        IncidentType: {
            id: "IncidentType",
            label: "Incident Type",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claim Incident Type Init"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 11
        },
        IncidentDateTime: {
            id: "IncidentDateTime",
            label: "Incident Date and Time",
            fieldType: "date",
            width: "four",
            value: null,
            mandatory: false,
            visible: true,
            editable: true,
            order: 12
        },
        IncidentLocation: {
            id: "IncidentLocation",
            label: "Incident Location",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Location Init"),
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 13
        },
        RefDocType: {
            id: "RefDocType",
            label: "Ref. Doc. Type/ ID",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claim Ref Doc Type Init"),
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 14
        },
        Wagon: {
            id: "Wagon",
            label: "Wagon No.",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims RefDocType OnSelect"),
            value: [],
            mandatory: false,
            visible: true,
            editable: true,
            order: 15,
            // multiSelect: true // Not supported in FieldConfig yet, commenting out to avoid error
        },
        Container: {
            id: "Container",
            label: "Container ID",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims RefDocType OnSelect"),
            value: [],
            mandatory: false,
            visible: true,
            editable: true,
            order: 16,
            // multiSelect: true
        },
        THU: {
            id: "THU",
            label: "THU ID",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims RefDocType OnSelect"),
            value: [],
            mandatory: false,
            visible: true,
            editable: true,
            order: 17,
            // multiSelect: true
        },
        WBS: {
            id: "WBS",
            label: "WBS",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("WBS Init"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 18
        },
        ActionResolution: {
            id: "ActionResolution",
            label: "Action/ Resolution",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Claims Action/Resolution Init"),
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 19
        },
        AssignedUser: {
            id: "AssignedUser",
            label: "Assigned User",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: fetchMaster("Createdby Init"),
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 20
        },
        SecondaryRefNo: {
            id: "SecondaryRefNo",
            label: "Secondary Ref. No.",
            fieldType: "text",
            width: "four",
            placeholder: "Enter Secondary Ref. No.",
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 21
        },
        ActionResolutionRemark: {
            id: "ActionResolutionRemark",
            label: "Remark for Action/Resolution",
            fieldType: "text",
            width: "half",
            value: "",
            maxLength: 255,
            placeholder: "Enter Remark for Action/Resolution",
            mandatory: true,
            visible: true,
            editable: true,
            order: 22
        },
        FirstInformationRegister: {
            id: "FirstInformationRegister",
            label: "First Information Register",
            fieldType: "text",
            width: "half",
            maxLength: 255,
            placeholder: "Enter First Information Register",
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 23
        },
    };

    useEffect(() => {
        setFooter({
            visible: true,
            leftButtons: [],
            rightButtons: [
                {
                    label: "Cancel",
                    onClick: () => navigate(-1),
                    // variant: "outline", // Removed unauthorized property
                    type: "Button"
                },
                {
                    label: "Save",
                    onClick: () => {
                        // Sync form data to findings before save
                        syncFormDataToFindings();
                        const formValues = formRef.current?.getFormValues();
                        console.log("Save clicked", formValues);
                        console.log("Claims Findings Data", claimsFindingsData);
                    },
                    // variant: "default", // Removed unauthorized property
                    type: "Button"
                },
            ],
        });
        return () => resetFooter();
    }, [setFooter, resetFooter, navigate]);

    // Function to sync form field data to Claims Findings panel
    const syncFormDataToFindings = () => {
        if (!formRef.current) return;

        const formValues = formRef.current.getFormValues();
        if (formValues) {
            // Map form fields to claims findings data
            setClaimsFindingsData(prev => {
                const updated: typeof prev = { ...prev };

                // Map RefDocTypeID from form to refDocTypeID
                if (formValues.RefDocTypeID) {
                    if (typeof formValues.RefDocTypeID === 'string') {
                        updated.refDocTypeID = formValues.RefDocTypeID;
                    } else if (typeof formValues.RefDocTypeID === 'object') {
                        const docType = formValues.RefDocTypeID;
                        const typeName = docType.name || docType.label || '';
                        const typeId = docType.id || docType.value || '';
                        updated.refDocTypeID = typeName && typeId
                            ? `${typeName} - ${typeId}`
                            : typeName || typeId || prev.refDocTypeID;
                    }
                }

                // Map ClaimAmount to finalClaimAmount (format as currency)
                if (formValues.ClaimAmount) {
                    const amount = parseFloat(formValues.ClaimAmount);
                    if (!isNaN(amount)) {
                        updated.finalClaimAmount = `€ ${amount.toFixed(2)}`;
                    }
                }

                // You can add more field mappings here as needed
                // Example: updated.supplierNoteNo = formValues.SupplierNoteNo || prev.supplierNoteNo;

                return updated;
            });
        }
    };

    // Sync form data to findings when component mounts or when form data might have changed
    useEffect(() => {
        // Initial sync after a short delay to ensure form is ready
        const timer = setTimeout(() => {
            syncFormDataToFindings();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Manage Claims", href: "/claims-hub" },
        { label: "Claims", active: true },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-gray-50">
                {/* Breadcrumb */}
                <div className="px-6 pt-4">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-semibold">Claims</h1>
                        <div className="relative max-w-md">
                            <Input
                                placeholder="Search Claim No."
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="">
                            <span className={getStatusColor(claimStatus) + ' text-xs'}>
                                {claimStatus}
                            </span>
                        </div>
                    </div>

                    {/* new claim button and action buttons */}
                    <div className="flex items-center gap-3">
                        {/* New Claim Button */}
                        <div className="relative inline-block">
                            <button
                                onClick={() => {
                                    // Dynamically get the base path from the current URL
                                    const { pathname } = window.location;
                                    // Find the base path 
                                    const basePathMatch = pathname.match(/^\/[^/]+/);
                                    const basePath = basePathMatch ? basePathMatch[0] : "";
                                    window.location.href = `${basePath}/create-claim`;
                                }}
                                className="border border-blue-500 text-blue-500 text-sm font-medium hover:bg-blue-50 h-9 rounded flex items-center transition-colors duration-200 gap-2 px-3"
                                type='button'
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                <Plus className="h-4 w-4" />
                                New Claim
                            </button>

                            {/* Tooltip */}
                            {showTooltip && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-50 whitespace-nowrap">
                                    Create New Claim
                                    {/* Tooltip arrow */}
                                    <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 top-full left-1/2 -translate-x-1/2 -mt-1" />
                                </div>
                            )}
                        </div>

                        {/* Copy Icon Button */}
                        <button
                            onClick={() => {
                                // Handle copy action
                                console.log("Copy clicked");
                            }}
                            className="h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors duration-200"
                            type='button'
                            title="Copy"
                        >
                            <Copy className="h-4 w-4 text-gray-600" />
                        </button>

                        {/* 3 Dots Menu Button */}
                        <div className="relative inline-block">
                            <button
                                onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                                className="h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors duration-200"
                                type='button'
                                title="More options"
                            >
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdownMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdownMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Quick Billing clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Quick Billing
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Manage Logistic Payable clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Manage Logistic Payable
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Manage Logistic Receivable clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Manage Logistic Receivable
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Edit & View Customer Credit Note clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Edit & View Customer Credit Note
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Edit & View Supplier Credit Note clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Edit & View Supplier Credit Note
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Attachments clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Attachments
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Audit Trail clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Audit Trail
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setLinkedInternalOrdersOpen(true);
                                                    setShowDropdownMenu(false);
                                                    console.log("Linked Claims and IO clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Linked Claims and IO
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdownMenu(false);
                                                    console.log("Workflow clicked");
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Workflow
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto px-6 pb-20 pt-3">
                    {/* Claim & Reference Panel */}
                    <DynamicPanel
                        ref={formRef}
                        panelId="claim-form-panel"
                        panelIcon={<Banknote className="h-5 w-5 text-green-600" />}
                        panelTitle="Claim & Reference"
                        collapsible={true}
                        panelConfig={claimPanelConfig}
                        initialData={{}}
                        badgeValue=""
                    />

                    {/* Investigation Details Panel */}
                    <div className="mt-4">
                        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3">
                                {/* Left side: Icon and Title */}
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg">
                                        <FileSearch className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-700">Investigation Details</h3>
                                </div>

                                {/* Right side: Badge and Edit Button */}
                                <div className="flex items-center gap-3 cursor-pointer">
                                    {/* Count Badge */}
                                    <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium text-center">
                                        {investigationCount} Nos
                                    </div>

                                    {/* Edit Button */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-md border-gray-300 hover:bg-gray-50"
                                        onClick={() => {
                                            // Handle edit action
                                            console.log("Edit Investigation Details clicked");
                                            setInvestigationDetailsOpen(true);
                                        }}
                                    >
                                        <SquarePen className="h-4 w-4 text-gray-600" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Claims Findings Panel */}
                    <div className="mt-4">
                        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            {/* Header Section */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                {/* Left side: Icon and Title */}
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-md">
                                        <FileText className="h-5 w-5 text-red-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Claims Findings</h3>
                                </div>

                                {/* Right side: Edit Button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-md border-gray-300 hover:bg-gray-50"
                                    onClick={() => {
                                        // Handle edit action
                                        console.log("Edit Claims Findings clicked");
                                        setClaimFindingsOpen(true);
                                    }}
                                >
                                    <SquarePen className="h-4 w-4 text-gray-600" />
                                </Button>
                            </div>

                            {/* Content Section */}
                            <div className="p-4">
                                {/* First Row - 5 Key-Value Pairs */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                    {/* Ref. Doc. Type/ ID */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">Ref. Doc. Type/ ID</label>
                                        <span className="text-sm font-semibold text-foreground">
                                            {claimsFindingsData.refDocTypeID || "---"}
                                        </span>
                                    </div>

                                    {/* Final Claim Amount */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">Final Claim Amount</label>
                                        <span className="text-sm font-semibold text-foreground">
                                            {claimsFindingsData.finalClaimAmount || "---"}
                                        </span>
                                    </div>

                                    {/* Usage ID/GL Account */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">Usage ID/GL Account</label>
                                        <span className="text-sm font-semibold text-foreground">
                                            {claimsFindingsData.usageIDGLAccount || "---"}
                                        </span>
                                    </div>

                                    {/* Supplier Note No. */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">Supplier Note No.</label>
                                        <span className="text-sm font-semibold text-foreground">
                                            {claimsFindingsData.supplierNoteNo || "---"}
                                        </span>
                                    </div>

                                    {/* Supplier Note Amount */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">Supplier Note Amount</label>
                                        <span className="text-sm font-semibold text-foreground">
                                            {claimsFindingsData.supplierNoteAmount || "---"}
                                        </span>
                                    </div>
                                </div>

                                {/* Second Row - Comments/Remarks (Full Width) */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-muted-foreground mb-1">Comments/Remarks</label>
                                    <span className="text-sm font-semibold text-foreground">
                                        {claimsFindingsData.commentsRemarks || "---"}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Document Details Panel */}
                    <div className="mt-4">
                        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <Collapsible open={isDocumentDetailsOpen} onOpenChange={setIsDocumentDetailsOpen}>
                                {/* Header Section */}
                                <CollapsibleTrigger className="w-full">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                        {/* Left side: Icon and Title */}
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-md">
                                                <FileBarChart className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-800">Document Details</h3>
                                        </div>

                                        {/* Right side: Edit Button and Chevron */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-md border-gray-300 hover:bg-gray-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle edit action
                                                    console.log("Edit Document Details clicked");
                                                }}
                                            >
                                                <SquarePen className="h-4 w-4 text-gray-600" />
                                            </Button>
                                            {isDocumentDetailsOpen ? (
                                                <ChevronUp className="h-5 w-5 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    {/* Summary Boxes Section */}
                                    <div className="px-4 pb-4 mt-3">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            {/* Total Invoice Amount */}
                                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                                <label className="text-xs text-gray-700 font-medium mb-1 block">Total Invoice Amount</label>
                                                <span className="text-lg font-semibold text-purple-600">
                                                    € {documentDetailsData.totalInvoiceAmount.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Total Claim Amount */}
                                            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                                                <label className="text-xs text-gray-700 font-medium mb-1 block">Total Claim Amount</label>
                                                <span className="text-lg font-semibold text-pink-600">
                                                    € {documentDetailsData.totalClaimAmount.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Total Balance Amount */}
                                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                                <label className="text-xs text-gray-700 font-medium mb-1 block">Total Balance Amount</label>
                                                <span className="text-lg font-semibold text-green-600">
                                                    € {documentDetailsData.totalBalanceAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SmartGrid Table Section */}
                                    <div className="px-4 pb-4">
                                        <SmartGrid
                                            columns={documentDetailsColumns}
                                            data={formattedLineItems}
                                            hideToolbar={true}
                                            hideRightToolbar={true}
                                            hideCheckboxToggle={true}
                                            onLinkClick={(rowData: any, columnKey: string) => {
                                                console.log("Link clicked:", columnKey, rowData);
                                                // Handle link clicks for Credit Note No. and Supplier Note No.
                                            }}
                                        />
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    </div>

                </div>
            </div>

            {/* Investigation Details Section */}
            <InvestigationDetails
                isOpen={investigationDetailsOpen}
                onClose={() => setInvestigationDetailsOpen(false)}
            />

            {/* Claim Findings Section */}
            <ClaimFindings
                isOpen={claimFindingsOpen}
                onClose={() => setClaimFindingsOpen(false)}
            />
            {/* Linked Internal Orders Section */}
            <ClaimLinkedInternalOrders
                isOpen={linkedInternalOrdersOpen}
                onClose={() => setLinkedInternalOrdersOpen(false)}
                claimNo={searchQuery}
            />
        </AppLayout>
    );
};

export default ClaimsForm;
