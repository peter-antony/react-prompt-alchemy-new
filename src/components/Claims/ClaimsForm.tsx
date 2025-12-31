import React, { useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel"; // Changed import
import { Banknote, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFooterStore } from "@/stores/footerStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ClaimsForm = () => {
    const navigate = useNavigate();
    const formRef = useRef<DynamicPanelRef>(null);
    const { setFooter, resetFooter } = useFooterStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);

    // Dummy fetcher for lazyselect fields
    const dummyFetcher = async ({ searchTerm }: { searchTerm: string }) => {
        return [];
    };

    // Defining the config as PanelConfig object (Record<string, FieldConfig>)
    const claimPanelConfig: PanelConfig = {
        InvestigationRequired: {
            id: "InvestigationRequired",
            label: "Investigation Required",
            fieldType: "switch",
            width: "full",
            value: false,
            mandatory: false,
            visible: true,
            editable: true,
            order: 1
        },
        InitiateBy: {
            id: "InitiateBy",
            label: "Initiate By",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 5
        },
        BusinessPartner: {
            id: "BusinessPartner",
            label: "Business Partner",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
            value: "",
            mandatory: true,
            visible: true,
            editable: true,
            order: 11
        },
        IncidentDateAndTime: {
            id: "IncidentDateAndTime",
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
            fetchOptions: dummyFetcher,
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 13
        },
        RefDocTypeID: {
            id: "RefDocTypeID",
            label: "Ref. Doc. Type/ ID",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: dummyFetcher,
            value: "",
            mandatory: false,
            visible: true,
            editable: true,
            order: 14
        },
        WagonNo: {
            id: "WagonNo",
            label: "Wagon No.",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: dummyFetcher,
            value: [],
            mandatory: false,
            visible: true,
            editable: true,
            order: 15,
            // multiSelect: true // Not supported in FieldConfig yet, commenting out to avoid error
        },
        ContainerID: {
            id: "ContainerID",
            label: "Container ID",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: dummyFetcher,
            value: [],
            mandatory: false,
            visible: true,
            editable: true,
            order: 16,
            // multiSelect: true
        },
        THUID: {
            id: "THUID",
            label: "THU ID",
            fieldType: "lazyselect",
            width: "four",
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
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
            fetchOptions: dummyFetcher,
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
                        console.log("Save clicked", formRef.current?.getFormValues());
                    },
                    // variant: "default", // Removed unauthorized property
                    type: "Button"
                },
            ],
        });
        return () => resetFooter();
    }, [setFooter, resetFooter, navigate]);

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
                    </div>

                    {/* new claim button */}
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
                </div>
            </div>
        </AppLayout>
    );
};

export default ClaimsForm;
