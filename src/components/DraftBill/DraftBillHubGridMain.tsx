import React, { useMemo, useState, useEffect } from 'react';
import { SmartGridWithNestedRows } from '@/components/SmartGrid';
import { GridColumnConfig, ServerFilter } from '@/types/smartgrid';
import { Loader2 } from 'lucide-react';
import { draftBillService, quickOrderService } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { dateFormatter } from "@/utils/formatter";
import { useFilterStore } from '@/stores/filterStore';
import { DraftBillSearchCriteria, draftBillSearchCriteria } from '@/constants/draftBillSearchCriteria';
import DraftBillDetailsSideDraw from './DraftBillDetailsSideDraw';
import { CimCuvService } from '@/api/services/CimCuvService';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { useFooterStore } from '@/stores/footerStore';
import { filterService } from '@/api/services';
import { NestedRowSelection } from '../SmartGrid/SmartGridWithNestedRows';
import CancelConfirmationModal from '../Template/CancelConfirmationModal';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import GenerateInvoiceModal from './GenerateInvioceModal';
import { format, subDays } from 'date-fns';

const DraftBillHubGridMain = ({ onDraftBillSelection }: any) => {
    const { toast } = useToast();
    const gridState = useSmartGridState();
    const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);
    const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false); // SmartGrid Preferences loaded state
    const [isPersonalizationEmpty, setIsPersonalizationEmpty] = useState(false); // State to check if personalization is empty
    const [serverFilterVisibleFields, setServerFilterVisibleFields] = useState<string[]>([]); // Store the visible fields for server filtering  
    const [serverFilterFieldOrder, setServerFilterFieldOrder] = useState<string[]>([]); // Store the field order for server filtering
    const [isServerFilterPersonalizationEmpty, setIsServerFilterPersonalizationEmpty] = useState(false); // Flag to check if server filter personalization is empty (Insert / Update)
    const [
        isDraftBillDetailsSideDrawOpen,
        setIsDraftBillDetailsSideDraw,
    ] = useState(false);
    const [draftBillData, setDraftBillData] = useState<any>(null);
    const [loadingDrawerData, setLoadingDrawerData] = useState(false);
    const [selectedDraftBills, setSelectedDraftBills] = useState<any[]>([]);
    const [qc1, setQc1] = useState<any[]>([]);
    const [qc2, setQc2] = useState<any[]>([]);
    const [qc3, setQc3] = useState<any[]>([]);

    const { setFooter, resetFooter } = useFooterStore();
    const [selectedBillItemsFlag, setSelectedBillItemsFlag] = useState(false);
    const [forceGridUpdate, setForceGridUpdate] = useState(0);

    // State for nested row selections
    const [selectedDbLines, setselectedDbLines] = useState<NestedRowSelection[]>([]);

    const handleDraftBillSelection = (rows: any[]) => {
        console.log("12-----------------", rows);
        console.log("selectedDbLines", selectedDbLines)
        setSelectedDraftBills(rows);
        setselectedDbLines([]);
        setSelectedBillItemsFlag(true);
    };

    const fetchMaster = (
        messageType: string,
        extraParams?: Record<string, any>
    ) => {
        return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
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
                    const id = item.id ?? item.ID ?? item.value ?? "";
                    const name = item.name ?? item.Name ?? item.label ?? "";
                    return {
                        label: `${id} || ${name}`,
                        value: `${id} || ${name}`,
                    };
                });
            } catch (err) {
                console.error(`Error fetching ${messageType}:`, err);
                return [];
            }
        };
    };

    useEffect(() => {
    //   setSelectedDraftBills([])
        //   smartGridRef.current?.setShowCheckboxes(false);
    }, [selectedDbLines, handleDraftBillSelection])

    // Helper to get selected nested row data objects (ONLY the current sub-row object, not parent)
    // This returns an array of individual nested row objects - each is a SINGLE sub-row
    // Example: If you select 2 nested rows, this returns [subRow1, subRow2]
    // Each subRow is just that one row's data, NOT the parent with all nested rows

    // const selectedNestedRowData = useMemo(() => {
    //     return selectedDbLines.map(sel => {
    //         // sel.nestedRow is the individual nested row object (the sub-row you clicked)
    //         // This is NOT the parent row - it's just the one nested row
    //         // Example: If parent has lineItems: [row1, row2, row3] and you click row2,
    //         // then sel.nestedRow is just row2, not the parent with all lineItems
    //         return { ...sel.nestedRow };
    //     });
    // }, [selectedDbLines]);

    const selectedNestedRowData = useMemo(() => {
        return selectedDbLines.length > 0
            ? [{ ...selectedDbLines[0].nestedRow }]
            : [];
    }, [selectedDbLines]);




    // Helper to get selected parent row data objects
    const selectedParentRowData = useMemo(() => {
        return selectedDbLines.map(sel => sel.parentRow);
    }, [selectedDbLines]);

    // Effect to handle selected nested row data
    useEffect(() => {
        if (selectedDbLines.length > 0) {
            console.log("=== Selected Nested Row Data ===");
            console.log("Total selections:", selectedDbLines.length);

            // Log each selected nested row (the actual sub-row object)
            selectedDbLines.forEach((selection, index) => {
                console.log(`\n--- Selected Sub-Row ${index + 1} ---`);
                console.log("Sub-Row Object (nestedRow - this is what you need):", selection.nestedRow);
                console.log("Sub-Row Index:", selection.nestedRowIndex);
                console.log("Parent Row Index:", selection.parentRowIndex);
                console.log("Parent Row (for reference only):", selection.parentRow);
            });

            // Log all selected nested row objects as an array
            console.log("\n=== All Selected Sub-Row Objects (Array) ===");
            console.log("selectedNestedRowData:", selectedNestedRowData);
        } else {
            console.log("No nested rows selected");
        }
    }, [selectedDbLines, selectedNestedRowData]);

    const columns: GridColumnConfig[] = useMemo(() => [
        {
            key: 'DraftBillNo',
            label: 'Draft Bill No',
            type: 'Link',
            mandatory: true,
            sortable: true,
            filterable: true,
            editable: false,
            subRow: false,
            width: 200
        },
        {
            key: 'DraftBillDate',
            label: 'Draft Bill Date',
            type: 'DateTimeRange',
            sortable: true,
            filterable: true,
            editable: false,
            subRow: false,
            width: 250
        },
        // { 
        //     key: 'DBStatus', 
        //     label: 'Status Code', 
        //     type: 'Text', 
        //     sortable: true, 
        //     filterable: true, 
        //     width: 100 
        // },
        {
            key: 'DBStatusDescription',
            label: 'Status',
            type: 'Badge',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150,
            statusMap: {
                'Open': 'badge-blue rounded-2xl',
                'In Progress': 'badge-orange rounded-2xl',
                'Approved': 'badge-green rounded-2xl',
                'Cancelled': 'badge-red rounded-2xl',
                'Hold': 'badge-yellow rounded-2xl',
                'Rerun Triggered': 'badge-purple rounded-2xl',
                'Returned': 'badge-fresh-green rounded-2xl'
            }
        },
        {
            key: 'FromLocationDescription',
            label: 'From Location',
            type: 'TextPipedData',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 300
        },
        // {
        //     key: 'FromLocationDescription',
        //     label: 'From Location DESC',
        //     type: 'Text',
        //     sortable: true,
        //     filterable: true,
        //     width: 200
        // },
        {
            key: 'ToLocationDescription',
            label: 'To Location',
            type: 'TextPipedData',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 300
        },
        // {
        //     key: 'ToLocationDescription',
        //     label: 'To Location DESC',
        //     type: 'Text',
        //     sortable: true,
        //     filterable: true,
        //     width: 200
        // },
        {
            key: 'WBS',
            label: 'WBS',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'DBTotalValue',
            label: 'DB Total Value',
            type: 'CurrencyWithSymbol',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'BusinessPartnerName',
            label: 'Business Partner',
            type: 'TextPipedData',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 300
        },
        // {
        //     key: 'BusinessPartnerName',
        //     label: 'Business Partner',
        //     type: 'Text',
        //     sortable: true,
        //     filterable: true,
        //     width: 200
        // },
        {
            key: 'BusinessPartnerType',
            label: 'Business Partner Type',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'ContractID',
            label: 'Contract ID',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 200
        },
        {
            key: 'ContractDescription',
            label: 'Contract Description',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 250
        },
        {
            key: 'ContractType',
            label: 'Contract Type',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 100
        },
        {
            key: 'DraftbillValidationDate',
            label: 'Validation Date',
            type: 'Date',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'InvoiceNo',
            label: 'Invoice No',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'InvoiceDate',
            label: 'Invoice Date',
            type: 'Date',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'InvoiceStatus',
            label: 'Invoice Status',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'TransferInvoiceNo',
            label: 'Transfer Invoice No',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'LatestJournalVoucher',
            label: 'Latest JV',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'GLAccount',
            label: 'GL Account',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'DBAcceptedValue',
            label: 'Accepted Value',
            type: 'Integer',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'DraftBillStage',
            label: 'Stage',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 200
        },
        {
            key: 'WorkFlowStatus',
            label: 'Workflow Status',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'CustomerGroup',
            label: 'Customer Group',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'SupplierGroup',
            label: 'Supplier Group',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'Cluster',
            label: 'Cluster',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        },
        {
            key: 'Attribute1',
            label: 'Attribute 1',
            type: 'Text',
            sortable: true,
            filterable: true,
            subRow: false,
            width: 150
        }
    ], []);

    const nestedColumns: GridColumnConfig[] = useMemo(() => [
        {
            key: 'DBLineNo',
            label: 'DB Line No',
            type: 'Integer',
            width: 80
        },
        {
            key: 'BillToID',
            label: 'Bill To ID',
            type: 'Text',
            width: 120
        },
        {
            key: 'RefDocIDType',
            label: 'Ref Doc ID Type',
            type: 'TextPipedData',
            width: 300
        },
        // {
        //     key: 'RefDocIDTypeDescription',
        //     label: 'Ref Doc Type',
        //     type: 'Text',
        //     width: 200
        // },
        {
            key: 'RefDocDate',
            label: 'Ref Doc Date',
            type: 'DateTimeRange',
            width: 250
        },
        {
            key: 'ReferenceInformation',
            label: 'Ref Info',
            type: 'Text',
            width: 200
        },
        {
            key: 'EquipmentType',
            label: 'Equipment Type',
            type: 'Text',
            width: 150
        },
        {
            key: 'EquipmentID',
            label: 'Equipment ID',
            type: 'Text',
            width: 150
        },
        {
            key: 'EquipmentDescription',
            label: 'Equipment Description',
            type: 'Text',
            width: 250
        },
        {
            key: 'AcceptedValue',
            label: 'Accepted Value',
            type: 'Integer',
            width: 150
        },
        {
            key: 'BillingCurrency',
            label: 'Billing Currency',
            type: 'Text',
            width: 200
        },
        {
            key: 'TriggerDocType',
            label: 'Trigger Doc Type',
            type: 'Text',
            width: 150
        },
        {
            key: 'TriggerDocID',
            label: 'Trigger Doc ID',
            type: 'Text',
            width: 200
        },
        {
            key: 'TariffID',
            label: 'Tariff ID',
            type: 'Text',
            width: 150
        },
        {
            key: 'TariffIDType',
            label: 'Tariff Type',
            type: 'Text',
            width: 150
        },
        {
            key: 'TariffDescription',
            label: 'Tariff Description',
            type: 'Text',
            width: 350
        },
        // Duplicate from main grid, leaving commented unless needed
        {
            key: 'InvoiceNo',
            label: 'Invoice No',
            type: 'Text',
            width: 150
        },
        {
            key: 'InvoiceDate',
            label: 'Invoice Date',
            type: 'Date',
            width: 150
        },
        {
            key: 'InvoiceStatus',
            label: 'Invoice Status',
            type: 'Text',
            width: 150
        },
        {
            key: 'TransferInvoiceNo',
            label: 'Transfer Invoice No',
            type: 'Text',
            width: 200
        },
        {
            key: 'LatestJournalVoucher',
            label: 'Latest Journal Voucher',
            type: 'Text',
            width: 150
        },
        {
            key: 'Attribute1',
            label: 'Attribute 1',
            type: 'Text',
            width: 150
        },
        {
            key: 'Remark1',
            label: 'Remark 1',
            type: 'Text',
            width: 200
        },
        {
            key: 'Remark2',
            label: 'Remark 2',
            type: 'Text',
            width: 200
        },
        {
            key: 'Remark3',
            label: 'Remark 3',
            type: 'Text',
            width: 200
        },
        {
            key: 'QC1',
            label: 'QC1',
            type: 'Text',
            width: 100
        },
        {
            key: 'QCValue1',
            label: 'QC Value 1',
            type: 'Text',
            width: 100
        },
        {
            key: 'QC2',
            label: 'QC2',
            type: 'Text',
            width: 100
        },
        {
            key: 'QCValue2',
            label: 'QC Value 2',
            type: 'Text',
            width: 100
        },
        {
            key: 'QC3',
            label: 'QC3',
            type: 'Text',
            width: 100
        },
        {
            key: 'QCValue3',
            label: 'QC Value 3',
            type: 'Text',
            width: 100
        },
        {
            key: 'SecondaryRefNo',
            label: 'Secondary Ref No',
            type: 'Text',
            width: 150
        },
        {
            key: 'RemarkForAssignedUser',
            label: 'Remark for Assigned User',
            type: 'Text',
            width: 200
        },
        {
            key: 'ProposedValue',
            label: 'Proposed Value',
            type: 'Integer',
            width: 150
        },
        {
            key: 'TriggeringDocDate',
            label: 'Triggering Doc Date',
            type: 'DateTimeRange',
            width: 250
        },
        {
            key: 'FinancialYear',
            label: 'Financial Year',
            type: 'Text',
            width: 200
        },
        {
            key: 'UserAssigned',
            label: 'User Assigned',
            type: 'Text',
            width: 200
        },
        {
            key: 'Remark',
            label: 'Remark',
            type: 'Text',
            width: 200
        },
        {
            key: 'ReasonForAmendment',
            label: 'Reason for Amendment',
            type: 'Text',
            width: 200
        },
        {
            key: 'ReasonForCancellation',
            label: 'Reason for Cancellation',
            type: 'Text',
            width: 200
        },
        {
            key: 'QTY',
            label: 'Qty',
            type: 'Integer',
            width: 80
        },
        {
            key: 'UOM',
            label: 'UOM',
            type: 'Text',
            width: 80
        },
        {
            key: 'Rate',
            label: 'Rate',
            type: 'Integer',
            width: 120
        },
        {
            key: 'BasicCharge',
            label: 'Basic Charge',
            type: 'Integer',
            width: 120
        },
        {
            key: 'MinimumCharge',
            label: 'Min Charge',
            type: 'Integer',
            width: 120
        },
        {
            key: 'MaximumCharge',
            label: 'Max Charge',
            type: 'Integer',
            width: 120
        },
        {
            key: 'CustomerSupplierRefNo',
            label: 'Customer/Supplier Ref No',
            type: 'Text',
            width: 300
        },
        {
            key: 'DD1',
            label: 'DD 1',
            type: 'Text',
            width: 120
        },
        {
            key: 'DD2',
            label: 'DD 2',
            type: 'Text',
            width: 120
        },
        {
            key: 'DBLineStatus',
            label: 'DB Line Status',
            type: 'Badge',
            width: 250,
            statusMap: {
                'OPN': 'badge-blue rounded-2xl',
                'IP': 'badge-orange rounded-2xl',
                // 'Approved': 'badge-green rounded-2xl',
                'CN': 'badge-red rounded-2xl',
                // 'Hold': 'badge-yellow rounded-2xl',
                // 'Rerun Triggered': 'badge-purple rounded-2xl',
                // 'Returned': 'badge-fresh-green rounded-2xl'
            }
        },
        {
            key: 'CustomerOrderNo',
            label: 'Customer Order No',
            type: 'Text',
            width: 250
        }
    ], []);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] = useState(false);



    const { activeFilters } = useFilterStore();
    const gridId = "draft-bill-grid";
    const filtersForThisGrid = activeFilters[gridId] || {};


    useEffect(() => {
        const initPersonalization = async () => {
            // Fetch Grid Personalization
            try {
                const personalizationResponse: any = await quickOrderService.getPersonalization({
                    LevelType: 'User',
                    // LevelKey: 'ramcouser',
                    ScreenName: 'DraftBillManagement',
                    ComponentName: 'smartgrid-preferences'
                });

                // Extract columns with subRow = true from initialColumns
                const subRowColumns = columns
                    .filter(col => col.subRow === true)
                    .map(col => col.key);

                console.log('DraftBillHub Nested SmartGrid - Extracted subRow columns:', subRowColumns);

                // Parse and set personalization data to localStorage
                let isEmptyResponse = true;
                if (personalizationResponse?.data?.ResponseData) {
                    const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);

                    if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
                        isEmptyResponse = false;
                        const personalizationData = parsedPersonalization.PersonalizationResult[0];

                        // Set the JsonData to localStorage
                        if (personalizationData.JsonData) {
                            const jsonData = personalizationData.JsonData;

                            // If subRowColumns is empty in the API response, populate it with extracted columns
                            if (!jsonData.subRowColumns || jsonData.subRowColumns.length === 0) {
                                jsonData.subRowColumns = subRowColumns;
                                console.log('DraftBillHub Nested SmartGrid - subRowColumns was empty, populated with:', subRowColumns);
                            }

                            localStorage.setItem('smartgrid-preferences', JSON.stringify(jsonData));
                            console.log('DraftBillHub Nested SmartGrid Personalization data set to localStorage:', jsonData);
                        }
                    }
                }
                setIsPersonalizationEmpty(isEmptyResponse);
            } catch (error) {
                console.error("Failed to fetch grid preferences:", error);
            }

            // Fetch Server-side Filter Personalization
            try {
                console.log('DraftBillHub: Fetching server-side filter personalization...');
                const serverFilterPersonalizationResponse: any = await quickOrderService.getPersonalization({
                    LevelType: 'User',
                    // LevelKey: 'ramcouser',
                    ScreenName: 'DraftBillManagement',
                    ComponentName: 'smartgrid-serverside-filtersearch-preferences'
                });
                console.log('DraftBillHub: Server-side filter personalization response:', serverFilterPersonalizationResponse);

                let isServerFilterEmpty = true;
                if (serverFilterPersonalizationResponse?.data?.ResponseData) {
                    const parsed = JSON.parse(serverFilterPersonalizationResponse.data.ResponseData);
                    if (parsed?.PersonalizationResult && parsed.PersonalizationResult.length > 0) {
                        isServerFilterEmpty = false;
                        const data = parsed.PersonalizationResult[0].JsonData;
                        if (data) {
                            if (data.visibleFields) setServerFilterVisibleFields(data.visibleFields);
                            if (data.fieldOrder) setServerFilterFieldOrder(data.fieldOrder);
                        }
                    }
                }
                setIsServerFilterPersonalizationEmpty(isServerFilterEmpty);
            } catch (error) {
                console.error('Failed to fetch server-side filter personalization:', error);
            } finally {
                setIsPreferencesLoaded(true); // Set to true after personalization is loaded
            }
        };

        initPersonalization();
    }, [columns]);

    useEffect(() => {
        console.log(onDraftBillSelection, "onDraftBillSelection")
    }, [onDraftBillSelection])


    useEffect(() => {
        const rightButtons = [];

        // 1️⃣ Parent rows selected (PRIORITY)
        if (selectedDraftBills.length > 0) {
            rightButtons.push(
                {
                    label: "Cancel",
                    onClick: () => setIsCancelModalOpen(true),
                    type: "Button",
                },
                {
                    label: "Approve",
                    onClick: () => handleNewApprove(),
                    type: "Button",
                },
                {
                    label: "Revert",
                    onClick: () => handleReTreat(),
                    type: "Button",
                },
                {
                    label: "Generate Invoice",
                    onClick: () => setIsGenerateInvoiceModalOpen(true),
                    type: "Button",
                }
            );
        }

        // 2️⃣ ONLY DB lines selected
        else if (selectedDbLines.length > 0) {
            rightButtons.push(
                {
                    label: "Cancel",
                    onClick: () => setIsCancelModalOpen(true),
                    type: "Button",
                },
                {
                    label: "Approve",
                    onClick: () => handleNewApprove(),
                    type: "Button",
                },
                {
                    label: "Rerun",
                    onClick: () => handleReRun(),
                    type: "Button",
                }
            );
        }

        // 3️⃣ Nothing selected → no buttons

        setFooter({
            visible: true,
            pageName: "Draft_Bill",
            leftButtons: [],
            rightButtons,
        });

        return () => resetFooter();
    }, [
        setFooter,
        resetFooter,
        selectedDbLines,
        selectedDraftBills,
    ]);

    // Initialize grid columns in state
    useEffect(() => {
        gridState.setColumns(columns);
    }, [columns]);




    // Footer Configuration
    // useEffect(() => {
    //     setFooter({
    //         visible: true,
    //         pageName: 'Draft_Bill',
    //         leftButtons: [],
    //         rightButtons: [
    //             {
    //                 label: "Cancel",
    //                 onClick: () => {
    //                     setIsCancelModalOpen(true)
    //                 },
    //                 type: 'Button',
    //             },
    //             {
    //                 label: "Approve",
    //                 onClick: () => {
    //                     console.log("Approve clicked");
    //                     handleApprove()
    //                 },
    //                 type: 'Button',
    //             },
    //             {
    //                 label: "Rerun",
    //                 onClick: () => {
    //                     console.log("Approve clicked");
    //                     handleReRun()
    //                 },
    //                 type: 'Button',
    //             },
    //             {
    //                 label: "Revert",
    //                 onClick: () => {
    //                     handleReTreat()
    //                 },
    //                 type: 'Button',
    //             },
    //             {
    //                 label: "Generate Invoice",
    //                 onClick: () => {
    //                     setIsGenerateInvoiceModalOpen(true);
    //                     console.log("Generate Invoice clicked");
    //                     const selectedRows = getSelectedNestedRows();
    //                     console.log("Selected rows:", selectedRows);
    //                 },
    //                 type: 'Button',
    //             },
    //         ],
    //     });
    //     return () => resetFooter();
    // }, [setFooter, resetFooter , selectedDbLines]);

    const renderSubRow = (row: any, rowIndex: number) => {
        return (
            <DraggableSubRow
                row={row}
                rowIndex={rowIndex}
                columns={gridState.columns}
                subRowColumnOrder={gridState.subRowColumnOrder} // Pass appropriate order if needed
                editingCell={gridState.editingCell} // Pass editing state if needed
                onReorderSubRowColumns={gridState.handleReorderSubRowColumns} // Pass handler
                onSubRowEdit={gridState.handleSubRowEdit} // Pass handler
                onSubRowEditStart={gridState.handleSubRowEditStart} // Pass handler
                onSubRowEditCancel={gridState.handleSubRowEditCancel} // Pass handler
            />
        );
    };

    const handleServerSideSearch = async () => {
        let latestFilters = filterService.applyGridFiltersSet();
        console.log('LatestFilters Draft Bill: ', latestFilters);

        const searchCriteria = buildSearchCriteria(latestFilters);

        try {
            gridState.setLoading(true);
            const response = await draftBillService.getDraftBillsForHub({ searchCriteria });

            // Check if response has ResponseData and parse it
            let parsedResponse;
            if (response?.data?.ResponseData) {
                try {
                    parsedResponse = JSON.parse(response.data.ResponseData);
                } catch (e) {
                    console.error("Failed to parse response.data.ResponseData", e);
                }
            } else if (response?.ResponseData) {
                try {
                    parsedResponse = JSON.parse(response.ResponseData);
                } catch (e) {
                    console.error("Failed to parse ResponseData", e);
                }
            } else if (response?.ResultSet || response?.ResponseResult) {
                parsedResponse = response;
            }

            console.log("DraftBill API Response:", response);
            console.log("Parsed Response:", parsedResponse);

            const resultSet = parsedResponse?.ResultSet || parsedResponse?.ResponseResult;

            if (Array.isArray(resultSet)) {
                const processedData = resultSet.map((item: any, index: number) => {
                    const header = item.Header || item;
                    const itemDetails = item.ItemDetails || [];

                    return {
                        id: header.DraftBillNo || index + 1,
                        ...header,
                        DraftBillDate: header.DraftBillDate ? header.DraftBillDate : null,
                        lineItems: itemDetails.map((detail: any, detailIndex: number) => ({
                            // id: `${(header.DraftBillNo || index + 1)}-${detailIndex + 1}`,
                            // id: `${(header.DraftBillNo)}`,
                            ...detail
                        }))
                    };
                });
                gridState.setGridData(processedData);
            } else {
                gridState.setGridData([]);
                console.warn("No ResultSet or ResponseResult found in parsed response", parsedResponse);
                toast({
                    title: "No Results",
                    description: "No draft bills found matching your criteria",
                });
            }

        } catch (error) {
            console.error("Error fetching draft bills:", error);
            toast({
                title: "Error",
                description: "Failed to fetch draft bills.",
                variant: "destructive"
            });
            gridState.setGridData([]);
        } finally {
            gridState.setLoading(false);
        }
    };

    const buildSearchCriteria = (latestFilters: any) => {
        const criteria: DraftBillSearchCriteria = { ...draftBillSearchCriteria };

        if (Object.keys(latestFilters).length > 0) {
            Object.entries(latestFilters).forEach(([key, value]: [string, any]) => {
                if (key === "DraftBillDate") {
                    if (value?.value?.from) criteria.DraftBillFromDate = `${value.value.from} 00:00:00.000`.replace(/-/g, "-");
                    if (value?.value?.to) criteria.DraftBillToDate = `${value.value.to} 00:00:00.000`.replace(/-/g, "-");
                }
                else if (key === "TripPlanPickUpDate") {
                    if (value?.value?.from) criteria.TripPlanPickUpFromDate = `${value.value.from} 00:00:00.000`.replace(/-/g, "-");
                    if (value?.value?.to) criteria.TripPlanPickUpToDate = `${value.value.to} 00:00:00.000`.replace(/-/g, "-");
                }
                else if (key === "RefDocDate") {
                    if (value?.value?.from) criteria.RefDocFromDate = `${value.value.from} 00:00:00.000`.replace(/-/g, "-");
                    if (value?.value?.to) criteria.RefDocToDate = `${value.value.to} 00:00:00.000`.replace(/-/g, "-");
                }
                else if (key === "TripActualPickupDate") {
                    if (value?.value?.from) criteria.TripActualPickupFromDate = `${value.value.from} 00:00:00.000`.replace(/-/g, "-");
                    if (value?.value?.to) criteria.TripActualPickupToDate = `${value.value.to} 00:00:00.000`.replace(/-/g, "-");
                }
                else if (key === "TriggeringDocDate") {
                    if (value?.value?.from) criteria.TriggeringDocFromDate = `${value.value.from} 00:00:00.000`.replace(/-/g, "-");
                    if (value?.value?.to) criteria.TriggeringDocToDate = `${value.value.to} 00:00:00.000`.replace(/-/g, "-");
                }
                else if (key === "ApprovalDate") {
                    if (value?.value?.from) criteria.ApprovalFromDate = `${value.value.from} 00:00:00.000`.replace(/-/g, "-");
                    if (value?.value?.to) criteria.ApprovalToDate = `${value.value.to} 00:00:00.000`.replace(/-/g, "-");
                }
                else if (value?.value) {
                    criteria[key as keyof DraftBillSearchCriteria] = value.value;
                }
            });
        }
        return criteria;
    }

    const fetchDraftBills = async () => {
        gridState.setLoading(true);
        try {
            let searchCriteria;
            if (Object.keys(filtersForThisGrid).length > 0) {
                searchCriteria = buildSearchCriteria(filtersForThisGrid);
            } else {
                // Fallback to defaults (which includes the specific date range)
                searchCriteria = buildSearchCriteria({});
            }

            const response = await draftBillService.getDraftBillsForHub({ searchCriteria });

            // Check if response has ResponseData and parse it
            let parsedResponse;
            if (response?.data?.ResponseData) {
                try {
                    parsedResponse = JSON.parse(response.data.ResponseData);
                } catch (e) {
                    console.error("Failed to parse response.data.ResponseData", e);
                }
            } else if (response?.ResponseData) {
                try {
                    parsedResponse = JSON.parse(response.ResponseData);
                } catch (e) {
                    console.error("Failed to parse ResponseData", e);
                }
            } else if (response?.ResultSet || response?.ResponseResult) {
                // If it's already in the structure we expect (or if mock API returns it directly)
                parsedResponse = response;
            }

            console.log("DraftBill API Response:", response);
            console.log("Parsed Response:", parsedResponse);

            // Extract ResultSet
            // Handle both ResultSet and ResponseResult (WorkOrder pattern)
            const resultSet = parsedResponse?.ResultSet || parsedResponse?.ResponseResult;

            if (Array.isArray(resultSet)) {
                // Transform data for the grid
                const processedData = resultSet.map((item: any, index: number) => {
                    const header = item.Header || item; // Fallback if Header is missing
                    const itemDetails = item.ItemDetails || [];

                    return {
                        id: header.DraftBillNo || index + 1,
                        ...header,
                        // Fix date formats if necessary
                        DraftBillDate: header.DraftBillDate ? header.DraftBillDate : null,
                        // Map nested data
                        lineItems: itemDetails.map((detail: any, detailIndex: number) => ({
                            // id: `${(header.DraftBillNo)}`,
                            // id: `${(header.DraftBillNo || index + 1)}-${detailIndex + 1}`,
                            ...detail
                        }))
                    };
                });
                gridState.setGridData(processedData);
            } else {
                gridState.setGridData([]);
                console.warn("No ResultSet or ResponseResult found in parsed response", parsedResponse);
            }

        } catch (error) {
            console.error("Error fetching draft bills:", error);
            toast({
                title: "Error",
                description: "Failed to fetch draft bills.",
                variant: "destructive"
            });
            gridState.setGridData([]);
        } finally {
            gridState.setLoading(false);
        }
    };

    const makeLazyFetcher = (messageType: string, extraParams?: Record<string, any>) => {
        return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
            // Merge standard params with any additional params supplied by caller
            const payload = {
                messageType,
                searchTerm: searchTerm || '',
                offset,
                limit,
                ...(extraParams || {}),
            };

            const response: any = await quickOrderService.getMasterCommonData(payload);
            let parsed = JSON.parse(response?.data?.ResponseData || '[]');

            try {
                if (Array.isArray(parsed)) {
                    return parsed.map((o: any) => ({
                        ...o,
                        id: String(o.id ?? o.value ?? o.ID ?? o.Id ?? ""),
                        name: o.name ?? o.label ?? o.description ?? "",
                    }));
                }

                if (parsed?.error) {
                    console.error('API Error:', parsed.error.errorMessage);
                    return [];
                }
            } catch (err) {
                console.error(`Failed to parse ResponseData for ${messageType}:`, err);
                return [];
            }

        };
    };

    useEffect(() => {
        fetchDraftBills();
    }, [JSON.stringify(filtersForThisGrid)]); // Re-fetch when filters change

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const QC1 = makeLazyFetcher('Draft Bill QC1 Init');
                const QC2 = makeLazyFetcher('Draft Bill QC1 Init');
                const QC3 = makeLazyFetcher('Draft Bill QC1 Init');


                const [primaryRaw, secondaryRaw] = await Promise.all([
                    QC1({ searchTerm: "", offset: 0, limit: 1000 }),

                    QC2({ searchTerm: "", offset: 0, limit: 1000 }),
                    QC3({ searchTerm: "", offset: 0, limit: 1000 })


                ]);

                if (!mounted) return;

                const mapFn = (o: any) => ({ id: o.id ?? o.value ?? o.ID ?? o.Id ?? String(o), name: o.name ?? o.label ?? o.description ?? o.value ?? String(o) });

                setQc1(Array.isArray(primaryRaw) ? primaryRaw : []);
                setQc1(Array.isArray(secondaryRaw) ? secondaryRaw : []);
                setQc3(Array.isArray(secondaryRaw) ? secondaryRaw : []);

            } catch (err) {
                console.error('Failed to preload ref doc options:', err);
            }
        };

        load();
        return () => { mounted = false; };
    }, []);

    const dynamicServerFilters: ServerFilter[] = [
        // { 
        //     key: 'DraftBillNo', label: 'Draft Bill No', type: 'text',
        // },
        {
            key: 'DraftBillNo', label: 'Draft Bill No', type: 'text',
            // fetchOptions: makeLazyFetcher('Customer Init')
        },
        {
            key: 'CustomerID', label: 'Customer ID / Name', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Customer Init')
        },
        {
            key: 'SupplierID', label: 'Supplier ID / Name', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Supplier Init')
        },
        {
            key: 'DraftbillStatus', label: 'Draft Bill Status', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('DB Status Init'),
            disableLazyLoading: true, hideSearch: true,
        },
        {
            key: 'RefDocNo', label: 'Ref Doc ID', type: 'text',
            fetchOptions: makeLazyFetcher(''),
        },
        {
            key: 'RefDocType', label: 'Ref Doc Type', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('DB Status Init'),
            disableLazyLoading: true, hideSearch: true,
        },
        {
            key: 'TripPlanPickUpDate', label: 'Trip Plan Pick Up Date', type: 'dateRange'

        },
        {
            key: 'WBSNo', label: 'WBS No', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('DB WBS No Init')
        },
        {
            key: 'RefDocDate', label: 'Ref Doc Date', type: 'dateRange'

        },
        {
            key: 'FromShipPointID', label: 'From Ship Point', type: 'text'
        },
        {
            key: 'ToShipPointID', label: 'To Ship Point', type: 'text'

        },
        {
            key: 'ContractID', label: 'Contract ID / Name', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Contract Init')
        },
        {
            key: 'DraftBillDate', label: 'Draft Bill Date', type: 'dateRange',
            // defaultValue: {
            //     from: "2025-12-17",
            //     to: "2025-12-18"
            // }
            defaultValue: {
                from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                to: format(new Date(), 'yyyy-MM-dd')
            }
        },
        {
            key: 'TripActualPickupDate', label: 'Trip Actual From/To', type: 'dateRange'

        },
        {
            key: 'CustomerOrderNo', label: 'Customer Order No', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('CustomerOrder Number Init')
        },
        {
            key: 'ContractType', label: 'Contract Type', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('DB Contract Type Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'User', label: 'User', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Createdby Init')
        },
        {
            key: 'InvoiceNo', label: 'Invoice No', type: 'text'

        },
        {
            key: 'TotalFromValue', label: 'Total From Value', type: 'text'
        },
        {
            key: 'TotalToValue', label: 'Total To Value', type: 'text'
        },
        {
            key: 'JournalVoucherNo', label: 'Journal Voucher No', type: 'text'
        },
        {
            key: 'InvoiceStatus', label: 'Invoice Status', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('DB Invoice Status Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'BillingCurrency', label: 'Billing Currency', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Currency Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'ReverserJournalVoucherNo', label: 'Reverser Journal Voucher No', type: 'text'
        },
        {
            key: 'TriggeringDocID', label: 'Triggering Doc ID', type: 'text',
            fetchOptions: makeLazyFetcher('')
        },
        {
            key: 'TriggeringDocType', label: 'Triggering Doc Type', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('DB Triggering Doc Type Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'PurchaseOrderNo', label: 'Purchase Order No', type: 'text'
        },
        {
            key: 'TransferInvoiceNo', label: 'Transfer Invoice No', type: 'text'

        },
        {
            key: 'TriggeringDocDate', label: 'Triggering Doc Date', type: 'dateRange'

        },
        {
            key: 'ApprovalDate', label: 'Approval Date', type: 'dateRange'
        },
        {
            key: 'CustomerReferenceNo', label: 'Customer Reference No', type: 'text'
        },
        {
            key: 'DraftBillStage', label: 'Draft Bill Stage', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Draft Bill Stage Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'TariffType', label: 'Tariff Type', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Tariff Type Lazy Combo Init'),
        },
        {
            key: 'WorkflowAssignedUser', label: 'Workflow Assigned User', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Createdby Init')
        },
        {
            key: 'SecondaryReferenceNumber', label: 'Secondary Reference Number', type: 'text'
        },
        {
            key: 'Remark1', label: 'Remark 1', type: 'text'
        },
        {
            key: 'Remark2', label: 'Remark 2', type: 'text'
        },
        {
            key: 'Remark3', label: 'Remark 3', type: 'text'
        },

        {
            key: 'QC1Value', label: 'QC 1 Value', type: 'dropdownText',
            options: [
                ...qc1
            ]
        },
        {
            key: 'QC2Value', label: 'QC 2 Value', type: 'dropdownText',
            options: [
                ...qc2
            ]
        },
        {
            key: 'QC3Value', label: 'QC 3 Value', type: 'dropdownText',
            options: [
                ...qc3
            ]
        },
    ];

    const clearAllFilters = async () => {
        console.log('Cleared all filters sets');
    }

    const splitIdName = (value: any) => {
        if (!value || typeof value !== "string") {
            return { id: "", name: "" };
        }

        if (value.includes("||")) {
            const [id, name] = value.split("||").map(v => v.trim());
            return { id, name };
        }

        return { id: value.trim(), name: "" };
    };

    // Helper function to get the current selected nested row objects
    // Returns: Array of individual nested row objects (sub-rows only, not parent)
    // Usage: const selectedRows = getSelectedNestedRows();
    //        selectedRows[0] is the first selected sub-row object
    const getSelectedNestedRows = () => {
        return selectedNestedRowData;
    }

    // Helper function to get a specific selected nested row by index
    // Returns: Single nested row object (sub-row only, not parent)
    // Usage: const firstRow = getSelectedNestedRow(0);
    const getSelectedNestedRow = (index: number) => {
        if (index >= 0 && index < selectedDbLines.length) {
            // Return just the nested row object, not the parent
            return { ...selectedDbLines[index].nestedRow };
        }
        return null;
    }

    const handleLinkClick = async (value: any, row: any) => {
        console.log("Link clicked:", value, row);
        setLoadingDrawerData(true);
        setIsDraftBillDetailsSideDraw(true);

        try {
            const response = await draftBillService.getDraftBillByID({
                searchCriteria: { DraftBillNo: value.id }
            });

            console.log("Draft Bill By ID API response:", response);

            const parsedResponse = JSON.parse(response?.data?.ResponseData || "{}");
            const resourceStatus = (response as any)?.data?.IsSuccess;

            console.log("parsedResponse ====", parsedResponse);

            if (resourceStatus) {
                console.log("Draft Bill By ID fetched successfully");
                // Set the draft bill data in state
                setDraftBillData(parsedResponse);
            } else {
                throw new Error("Failed to fetch draft bill details");
            }
        } catch (error) {
            console.error("Error fetching draft bill:", error);
            toast({
                title: "Error",
                description: error instanceof Error
                    ? error.message
                    : "Failed to fetch draft bill details.",
                variant: "destructive"
            });
            setIsDraftBillDetailsSideDraw(false);
            setDraftBillData(null);
        } finally {
            setLoadingDrawerData(false);
        }
    };

    // Helper function to clear all selections and uncheck checkboxes
    const clearAllSelections = () => {
        // Clear parent row selections
        setSelectedDraftBills([]);
        // Clear nested row selections
        setselectedDbLines([]);
        // Reset flag
        setSelectedBillItemsFlag(false);
        // Force grid re-render to uncheck checkboxes
        setForceGridUpdate((prev: number) => prev + 1);
        // Trigger parent row selection change callback with empty array
        handleDraftBillSelection([]);
    };

    const handleNewCancel = async (reasonCode: string, reasonDescription: string) => {
        console.log("setSelectedBillItemsFlag", selectedBillItemsFlag);
        console.log("selectedDraftBills", selectedDraftBills);
        console.log("selectedDraftBills", selectedDraftBills[0]?.lineItems ?? [])

        console.log("mk", selectedDbLines[0]?.parentRow?.DraftBillNo)

        if (selectedBillItemsFlag) {
            // Header level payload - make separate API calls for each selected draft bill
            try {
                const apiCalls = selectedDraftBills.map(async (draftBill) => {
                    const headerLevelPayload = {
                        Header: {
                            "DraftBillNo": draftBill.DraftBillNo || draftBill.id,
                            "ReasonCode": splitIdName(reasonCode).id,
                            "ReasonforComments": reasonDescription,
                        },
                        ItemDetails: [
                            ...(draftBill.lineItems || []).map((item: any) => ({
                                ...item,
                                ModeFlag: "Checked",
                            })),
                        ],
                    };

                    console.log(`Header Level Payload for ${draftBill.DraftBillNo || draftBill.id}:`, JSON.stringify(headerLevelPayload, null, 2));

                    return await draftBillService.cancelDraftBillByID(headerLevelPayload);
                });

                // Execute all API calls
                const responses = await Promise.all(apiCalls);

                // Process responses
                let successCount = 0;
                let failureCount = 0;
                const failureMessages: string[] = [];
                const successfullyCancelledDraftBillNos: string[] = [];

                responses.forEach((response, index) => {
                    const parsedResponse = JSON.parse(response?.data?.ResponseData || "{}");
                    const resourceStatus = (response as any)?.data?.IsSuccess;
                    const draftBillNo = selectedDraftBills[index]?.DraftBillNo || selectedDraftBills[index]?.id;

                    if (resourceStatus) {
                        successCount++;
                        successfullyCancelledDraftBillNos.push(draftBillNo);
                        console.log(`Draft Bill ${draftBillNo} cancelled successfully`);
                    } else {
                        failureCount++;
                        const errorMessage = (response as any)?.data?.Message || `Failed to cancel draft bill ${draftBillNo}`;
                        failureMessages.push(errorMessage);
                        console.log(`Error cancelling draft bill ${draftBillNo}:`, errorMessage);
                    }
                });

                // Remove successfully cancelled draft bills from grid data
                if (successfullyCancelledDraftBillNos.length > 0) {
                    const updatedGridData = gridState.gridData.filter((item: any) => {
                        const draftBillNo = item.DraftBillNo || item.id;
                        return !successfullyCancelledDraftBillNos.includes(draftBillNo);
                    });
                    gridState.setGridData(updatedGridData);
                }

                // Show appropriate toast based on results
                if (successCount > 0 && failureCount === 0) {
                    toast({
                        title: "✅ Draft Bills Cancelled Successfully",
                        description: `Successfully cancelled ${successCount} draft bill(s).`,
                        variant: "default",
                    });
                    // Clear all selections and uncheck checkboxes on full success
                    clearAllSelections();
                } else if (successCount > 0 && failureCount > 0) {
                    toast({
                        title: "⚠️ Partial Success",
                        description: `Cancelled ${successCount} draft bill(s), but ${failureCount} failed. ${failureMessages.join('; ')}`,
                        variant: "default",
                    });
                    // Remove successfully cancelled bills from selection
                    setSelectedDraftBills(selectedDraftBills.filter((bill) => {
                        const draftBillNo = bill.DraftBillNo || bill.id;
                        return !successfullyCancelledDraftBillNos.includes(draftBillNo);
                    }));
                    // Force grid update
                    setForceGridUpdate((prev: number) => prev + 1);
                    handleDraftBillSelection(selectedDraftBills.filter((bill) => {
                        const draftBillNo = bill.DraftBillNo || bill.id;
                        return !successfullyCancelledDraftBillNos.includes(draftBillNo);
                    }));
                } else {
                    toast({
                        title: "⚠️ Cancel Failed",
                        description: failureMessages.join('; ') || "Failed to cancel draft bills.",
                        variant: "destructive",
                    });
                }
                fetchDraftBills();
                setIsCancelModalOpen(false);
            } catch (error) {
                console.error("Error canceling Draft:", error);
                toast({
                    title: "⚠️ Error",
                    description: error instanceof Error ? error.message : "An error occurred while cancelling draft bill(s).",
                    variant: "destructive",
                });
                setIsCancelModalOpen(false);
            }
        } else {
            // Line level payload - existing logic (no changes)
            const lineLevelPayload = {
                Header: {
                    "DraftBillNo": selectedDbLines[0]?.parentRow?.DraftBillNo,
                    "ReasonCode": splitIdName(reasonCode).id,
                    "ReasonforComments": reasonDescription,
                },

                ItemDetails: selectedDbLines.map(({ nestedRow }) => {
                    const { ReasonForCancellation, ModeFlag, ...rest } = nestedRow;

                    return {
                        ...rest,

                        // 1️⃣ If ModeFlag field exists → force to Checked
                        ...("ModeFlag" in nestedRow && { ModeFlag: "Checked" }),

                        // 2️⃣ Send ReasonForCancellation only if NOT null
                        ...(ReasonForCancellation != null && { ReasonForCancellation }),

                        // 3️⃣ Backend hates null
                        Remark: rest.Remark ?? "",
                    };
                }),

            };

            console.log("lineLevelPayload", JSON.stringify(lineLevelPayload, null, 2));

            try {
                const response = await draftBillService.cancelDraftBillByID(lineLevelPayload);

                const parsedResponse = JSON.parse(response?.data?.ResponseData || "{}");
                const resourceStatus = (response as any)?.data?.IsSuccess;
                if (resourceStatus) {
                    console.log("Template cancelled successfully");
                    
                    // Track successfully cancelled line items
                    const cancelledLineNos = selectedDbLines.map(({ nestedRow }) => nestedRow.DBLineNo).filter(Boolean);
                    const parentDraftBillNo = selectedDbLines[0]?.parentRow?.DraftBillNo;

                    // Remove cancelled line items from grid data
                    if (cancelledLineNos.length > 0 && parentDraftBillNo) {
                        const updatedGridData = gridState.gridData.map((item: any) => {
                            const draftBillNo = item.DraftBillNo || item.id;
                            if (draftBillNo === parentDraftBillNo && item.lineItems) {
                                // Filter out cancelled line items
                                const updatedLineItems = item.lineItems.filter((lineItem: any) => {
                                    return !cancelledLineNos.includes(lineItem.DBLineNo);
                                });
                                return {
                                    ...item,
                                    lineItems: updatedLineItems
                                };
                            }
                            return item;
                        });
                        gridState.setGridData(updatedGridData);
                    }

                    // Clear all selections and uncheck checkboxes
                    clearAllSelections();

                    toast({
                        title: "✅ Draft Cancelled Successfully",
                        description: (response as any)?.data?.ResponseData?.Message || "Your changes have been cancelled.",
                        variant: "default",
                    });
                    setIsCancelModalOpen(false);
                    fetchDraftBills();
                } else {
                    console.log("error as any ===", (response as any)?.data?.Message);
                    toast({
                        title: "⚠️ Cancel Failed",
                        description: (response as any)?.data?.Message || "Failed to cancel changes.",
                        variant: "destructive",
                    });
                }
                setIsCancelModalOpen(false);
            } catch (error) {
                console.error("Error canceling Draft:", error);
                toast({
                    title: "⚠️ Error",
                    description: error instanceof Error ? error.message : "An error occurred while cancelling draft bill.",
                    variant: "destructive",
                });
                setIsCancelModalOpen(false);
            }
        }
    };

    // const handleCancel = async (reasonCode: string, reasonDescription: string) => {


    //     console.log("selectedDraftBills", selectedDraftBills);
    //     console.log("selectedDraftBills", selectedDraftBills[0]?.lineItems ?? [])
    //     //  const payload = {

    //     //     Header: {
    //     //       "DraftBillNo": selectedDraftBills[0]?.id,
    //     //       "ReasonCode": splitIdName(reasonCode).id,
    //     //       "ReasonforComments": reasonDescription,       
    //     //     },
    //     //     ItemDetails: 
    //     //         selectedDraftBills[0]?.lineItems ?? []    
    //     //     ,
    //     // };
    //     console.log("mk", selectedDbLines[0]?.parentRow?.DraftBillNo)
    //     const payload = {
    //         Header: {
    //             "DraftBillNo": selectedDbLines[0]?.parentRow?.DraftBillNo,
    //             "ReasonCode": splitIdName(reasonCode).id,
    //             "ReasonforComments": reasonDescription,
    //         },

    //         ItemDetails: selectedDbLines.map(({ nestedRow }) => {
    //             const { ReasonForCancellation, ModeFlag, ...rest } = nestedRow;

    //             return {
    //                 ...rest,

    //                 // 1️⃣ If ModeFlag field exists → force to Checked
    //                 ...("ModeFlag" in nestedRow && { ModeFlag: "Checked" }),

    //                 // 2️⃣ Send ReasonForCancellation only if NOT null
    //                 ...(ReasonForCancellation != null && { ReasonForCancellation }),

    //                 // 3️⃣ Backend hates null
    //                 Remark: rest.Remark ?? "",
    //             };
    //         }),

    //     };


    //     console.log(JSON.stringify(payload, null, 2))
    //     try {
    //         // const payload = {
    //         //     Header: {
    //         //         "DraftBillNo": selectedDraftBills[0]?.id,

    //         //     },
    //         //     ItemDetails:
    //         //         selectedDraftBills[0]?.lineItems ?? []
    //         //     ,
    //         // };
    //         const response = await draftBillService.cancelDraftBillByID(payload);

    //         const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
    //         const resourceStatus = (response as any)?.data?.IsSuccess;
    //         if (resourceStatus) {
    //             console.log("Template cancelled successfully");
    //             toast({
    //                 title: "✅ Draf Cancelled Successfully",
    //                 description: (response as any)?.data?.ResponseData?.Message || "Your changes have been cancelled.",
    //                 variant: "default",
    //             });
    //             setIsCancelModalOpen(false);
    //         } else {
    //             console.log("error as any ===", (response as any)?.data?.Message);
    //             toast({
    //                 title: "⚠️ Cancel Failed",
    //                 description: (response as any)?.data?.Message || "Failed to cancel changes.",
    //                 variant: "destructive",
    //             });
    //         }
    //         // Optionally, handle success or display a message
    //     } catch (error) {
    //         console.error("Error canceling Draft:", error);
    //         // Optionally, handle error or display an error message
    //     }
    //     setIsCancelModalOpen(false);
    // };

    // const handleApprove = async () => {


    //     console.log("mk2", selectedDbLines)

    //     const payload = {
    //         Header: {
    //             "DraftBillNo": selectedDbLines[0]?.parentRow?.DraftBillNo,

    //         },
    //         // ItemDetails: (selectedDraftBills[0]?.lineItems ?? []).map(
    //         //     ({ ReasonForCancellation, ModeFlag, ...rest }) => ({
    //         //         ...rest,

    //         //         // 1️⃣ Force ModeFlag to "Checked" if it exists
    //         //         ...(ModeFlag && { ModeFlag: "Checked" }),

    //         //         // 2️⃣ Only include ReasonForCancellation if NOT null
    //         //         ...(ReasonForCancellation != null && {
    //         //             ReasonForCancellation,
    //         //         }),

    //         //         // 3️⃣ Backend hates null remarks → normalize
    //         //         Remark: rest.Remark ?? "",
    //         //     })
    //         // ),
    //         ItemDetails: selectedDbLines.map(({ nestedRow }) => {
    //             const { ReasonForCancellation, ModeFlag, ...rest } = nestedRow;

    //             return {
    //                 ...rest,

    //                 // 1️⃣ If ModeFlag field exists → force to Checked
    //                 ...("ModeFlag" in nestedRow && { ModeFlag: "Checked" }),

    //                 // 2️⃣ Send ReasonForCancellation only if NOT null
    //                 ...(ReasonForCancellation != null && { ReasonForCancellation }),

    //                 // 3️⃣ Backend hates null
    //                 Remark: rest.Remark ?? "",
    //             };
    //         }),

    //     };


    //     console.log(JSON.stringify(payload, null, 2))


    //     try {

    //         console.log("payload ===", payload);
    //         const response = await draftBillService.approveDraftBillByID(payload);

    //         console.log("Cancel API response:", response);
    //         const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
    //         const resourceStatus = (response as any)?.data?.IsSuccess;
    //         console.log("parsedResponse ====", parsedResponse);
    //         if (resourceStatus) {
    //             toast({
    //                 title: "✅ Approved Successfully",
    //                 description: (response as any)?.data?.ResponseData?.Message || "Your changes have been Approved.",
    //                 variant: "default",
    //             });
    //             setIsCancelModalOpen(false);
    //         } else {
    //             console.log("error as any ===", (response as any)?.data?.Message);
    //             toast({
    //                 title: "⚠️ Approved Failed",
    //                 description: (response as any)?.data?.Message || "Failed to Approve changes.",
    //                 variant: "destructive",
    //             });
    //         }
    //         // Optionally, handle success or display a message
    //     } catch (error) {
    //         console.error("Error canceling Draft:", error);
    //         // Optionally, handle error or display an error message
    //     }
    //     setIsCancelModalOpen(false);
    // };
   const handleNewApprove = async () => {
        console.log("setSelectedBillItemsFlag", selectedBillItemsFlag);
        console.log("selectedDraftBills", selectedDraftBills);
        console.log("selectedDraftBills", selectedDraftBills[0]?.lineItems ?? [])

        console.log("mk", selectedDbLines[0]?.parentRow?.DraftBillNo)

        if (selectedBillItemsFlag) {
            // Header level payload - make separate API calls for each selected draft bill
            try {
                const apiCalls = selectedDraftBills.map(async (draftBill) => {
                    const headerLevelPayload = {
                        Header: {
                            "DraftBillNo": draftBill.DraftBillNo || draftBill.id,
                           
                        },
                        ItemDetails: [
                            ...(draftBill.lineItems || []).map((item: any) => ({
                                ...item,
                                ModeFlag: "Checked",
                            })),
                        ],
                    };

                    console.log(`Header Level Payload for ${draftBill.DraftBillNo || draftBill.id}:`, JSON.stringify(headerLevelPayload, null, 2));

                    return await draftBillService.approveDraftBillByID(headerLevelPayload);
                });

                // Execute all API calls
                const responses = await Promise.all(apiCalls);

                // Process responses
                let successCount = 0;
                let failureCount = 0;
                const failureMessages: string[] = [];
                const successfullyCancelledDraftBillNos: string[] = [];

                responses.forEach((response, index) => {
                    const parsedResponse = JSON.parse(response?.data?.ResponseData || "{}");
                    const resourceStatus = (response as any)?.data?.IsSuccess;
                    const draftBillNo = selectedDraftBills[index]?.DraftBillNo || selectedDraftBills[index]?.id;

                    if (resourceStatus) {
                        successCount++;
                        successfullyCancelledDraftBillNos.push(draftBillNo);
                        console.log(`Draft Bill ${draftBillNo} Approved successfully`);
                    } else {
                        failureCount++;
                        const errorMessage = (response as any)?.data?.Message || `Failed to Approve draft bill ${draftBillNo}`;
                        failureMessages.push(errorMessage);
                        console.log(`Error Approving draft bill ${draftBillNo}:`, errorMessage);
                    }
                });

                // Remove successfully cancelled draft bills from grid data
                if (successfullyCancelledDraftBillNos.length > 0) {
                    const updatedGridData = gridState.gridData.filter((item: any) => {
                        const draftBillNo = item.DraftBillNo || item.id;
                        return !successfullyCancelledDraftBillNos.includes(draftBillNo);
                    });
                    gridState.setGridData(updatedGridData);
                }

                // Show appropriate toast based on results
                if (successCount > 0 && failureCount === 0) {
                    toast({
                        title: "✅ Draft Bills Approved Successfully",
                        description: `Successfully Approved ${successCount} draft bill(s).`,
                        variant: "default",
                    });
                    // Clear all selections and uncheck checkboxes on full success
                    clearAllSelections();
                } else if (successCount > 0 && failureCount > 0) {
                    toast({
                        title: "⚠️ Partial Success",
                        description: `Approved ${successCount} draft bill(s), but ${failureCount} failed. ${failureMessages.join('; ')}`,
                        variant: "default",
                    });
                    // Remove successfully cancelled bills from selection
                    setSelectedDraftBills(selectedDraftBills.filter((bill) => {
                        const draftBillNo = bill.DraftBillNo || bill.id;
                        return !successfullyCancelledDraftBillNos.includes(draftBillNo);
                    }));
                    // Force grid update
                    setForceGridUpdate((prev: number) => prev + 1);
                    handleDraftBillSelection(selectedDraftBills.filter((bill) => {
                        const draftBillNo = bill.DraftBillNo || bill.id;
                        return !successfullyCancelledDraftBillNos.includes(draftBillNo);
                    }));
                } else {
                    toast({
                        title: "⚠️ Approve Failed",
                        description: failureMessages.join('; ') || "Failed to Approve draft bills.",
                        variant: "destructive",
                    });
                }
                fetchDraftBills();
                setIsCancelModalOpen(false);
            } catch (error) {
                console.error("Error Approving Draft:", error);
                toast({
                    title: "⚠️ Error",
                    description: error instanceof Error ? error.message : "An error occurred while cancelling draft bill(s).",
                    variant: "destructive",
                });
                setIsCancelModalOpen(false);
            }
        } else {
            // Line level payload - existing logic (no changes)
            const lineLevelPayload = {
                Header: {
                    "DraftBillNo": selectedDbLines[0]?.parentRow?.DraftBillNo,
                   
                },

                ItemDetails: selectedDbLines.map(({ nestedRow }) => {
                    const { ReasonForCancellation, ModeFlag, ...rest } = nestedRow;

                    return {
                        ...rest,

                        // 1️⃣ If ModeFlag field exists → force to Checked
                        ...("ModeFlag" in nestedRow && { ModeFlag: "Checked" }),

                        // 2️⃣ Send ReasonForCancellation only if NOT null
                        ...(ReasonForCancellation != null && { ReasonForCancellation }),

                        // 3️⃣ Backend hates null
                        Remark: rest.Remark ?? "",
                    };
                }),

            };

            console.log("lineLevelPayload", JSON.stringify(lineLevelPayload, null, 2));

            try {
                const response = await draftBillService.approveDraftBillByID(lineLevelPayload);

                const parsedResponse = JSON.parse(response?.data?.ResponseData || "{}");
                const resourceStatus = (response as any)?.data?.IsSuccess;
                if (resourceStatus) {
                    console.log("Approve successfully");
                    
                    // Track successfully cancelled line items
                    const cancelledLineNos = selectedDbLines.map(({ nestedRow }) => nestedRow.DBLineNo).filter(Boolean);
                    const parentDraftBillNo = selectedDbLines[0]?.parentRow?.DraftBillNo;

                    // Remove cancelled line items from grid data
                    if (cancelledLineNos.length > 0 && parentDraftBillNo) {
                        const updatedGridData = gridState.gridData.map((item: any) => {
                            const draftBillNo = item.DraftBillNo || item.id;
                            if (draftBillNo === parentDraftBillNo && item.lineItems) {
                                // Filter out cancelled line items
                                const updatedLineItems = item.lineItems.filter((lineItem: any) => {
                                    return !cancelledLineNos.includes(lineItem.DBLineNo);
                                });
                                return {
                                    ...item,
                                    lineItems: updatedLineItems
                                };
                            }
                            return item;
                        });
                        gridState.setGridData(updatedGridData);
                    }

                    // Clear all selections and uncheck checkboxes
                    clearAllSelections();

                    toast({
                        title: "✅ Draft Approve Successfully",
                        description: (response as any)?.data?.ResponseData?.Message || "Your changes have been Approve.",
                        variant: "default",
                    });
                    setIsCancelModalOpen(false);
                    fetchDraftBills();
                } else {
                    console.log("error as any ===", (response as any)?.data?.Message);
                    toast({
                        title: "⚠️ Approve Failed",
                        description: (response as any)?.data?.Message || "Failed to Approve changes.",
                        variant: "destructive",
                    });
                }
                setIsCancelModalOpen(false);
            } catch (error) {
                console.error("Error Approving Draft:", error);
                toast({
                    title: "⚠️ Error",
                    description: error instanceof Error ? error.message : "An error occurred while cancelling draft bill.",
                    variant: "destructive",
                });
                setIsCancelModalOpen(false);
            }
        }
    };
    const handleGenerateInvoice = async (consolidationCode: string) => {
        console.log("selectedDraftBills", selectedDraftBills);
        console.log("selectedDraftBills", selectedDraftBills[0]);

        // Map all selected draft bills to extract DraftBillNo
        // Each draftBill has both DraftBillNo (from header) and id (which is also DraftBillNo)
        const draftBillsArray = selectedDraftBills.map((draftBill) => ({
            "DraftBillNo": draftBill.DraftBillNo || draftBill.id, // Prefer DraftBillNo, fallback to id
            "RecordSupplierInvoiceNo": "RECINV01212121", // Same for all
            "RecordSupplierInvoiceDate": "2025-12-12" // Same for all
        }));

        const payload = {
            ConsolidationType: splitIdName(consolidationCode).name,
            TriggerType: {
                "IsGenerateTransferInvoice": 1,
                "IsGenerateFinanceInvoice": 1
            },
            DraftBills: draftBillsArray
        };


        console.log(JSON.stringify(payload, null, 2))
        try {
            console.log("payload ===", payload);
            const response = await draftBillService.generateInvoiceBill(payload);

            console.log("Cancel API response:", response);
            const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
            const resourceStatus = (response as any)?.data?.IsSuccess;
            console.log("parsedResponse ====", parsedResponse);
            if (resourceStatus) {
                console.log("Template cancelled successfully");
                toast({
                    title: "✅ Draf Cancelled Successfully",
                    description: (response as any)?.data?.ResponseData?.Message || "Your changes have been cancelled.",
                    variant: "default",
                });
                setIsGenerateInvoiceModalOpen(false);
            } else {
                console.log("error as any ===", (response as any)?.data?.Message);
                toast({
                    title: "⚠️ Cancel Failed",
                    description: (response as any)?.data?.Message || "Failed to cancel changes.",
                    variant: "destructive",
                });
            }
            // Optionally, handle success or display a message
        } catch (error) {
            console.error("Error canceling Draft:", error);
            // Optionally, handle error or display an error message
        }
        setIsGenerateInvoiceModalOpen(false);
    };

    const handleReRun = async () => {


        console.log("selectedDraftBills", selectedDraftBills[0]?.lineItems ?? [])
        const selectedBill = selectedDbLines[0]?.parentRow;

        const payload = {
            Header: {
                DraftBillNo: selectedBill?.DraftBillNo,
                DraftBillDate: selectedBill.DraftBillDate,
                DBStatus: selectedBill.DBStatus,
                DBStatusDescription: selectedBill.DBStatusDescription,
                FromLocation: selectedBill.FromLocation,
                FromLocationDescription: selectedBill.FromLocationDescription,
                ToLocation: selectedBill.ToLocation,
                ToLocationDescription: selectedBill.ToLocationDescription,
                WBS: selectedBill.WBS,
                DBTotalValue: selectedBill.DBTotalValue,
                BusinessPartnerID: selectedBill.BusinessPartnerID,
                BusinessPartnerName: selectedBill.BusinessPartnerName,
                BusinessPartnerType: selectedBill.BusinessPartnerType,
                ContractID: selectedBill.ContractID,
                ContractDescription: selectedBill.ContractDescription,
                ContractType: selectedBill.ContractType,
                DraftbillValidationDate: selectedBill.DraftbillValidationDate,
                InvoiceNo: selectedBill.InvoiceNo,
                InvoiceDate: selectedBill.InvoiceDate,
                InvoiceStatus: selectedBill.InvoiceStatus,
                TransferInvoiceNo: selectedBill.TransferInvoiceNo,
                LatestJournalVoucher: selectedBill.LatestJournalVoucher,
                GLAccount: selectedBill.GLAccount,
                DBAcceptedValue: selectedBill.DBAcceptedValue,
                DraftBillStage: selectedBill.DraftBillStage,
                WorkFlowStatus: selectedBill.WorkFlowStatus,
                CustomerGroup: selectedBill.CustomerGroup,
                SupplierGroup: selectedBill.SupplierGroup,
                Cluster: selectedBill.Cluster,
                Attribute1: selectedBill.Attribute1
            },
            ReverseJournalVoucher: [{
                JournalVoucherNo: null
            }],
            //   ItemDetails: (selectedDraftBills[0]?.lineItems ?? []).map(
            //     ({ ReasonForCancellation, ModeFlag, ...rest }) => ({
            //       ...rest,

            //       // 1️⃣ Force ModeFlag to "Checked" if it exists
            //       ...(ModeFlag  && { ModeFlag: "UPDATE" }),

            //       // 2️⃣ Only include ReasonForCancellation if NOT null
            //       ...(ReasonForCancellation != null && {
            //         ReasonForCancellation,
            //       }),

            //       // 3️⃣ Backend hates null remarks → normalize
            //       Remark: rest.Remark ?? "",
            //     })
            //   ),
            ItemDetails: selectedDbLines.map(({ nestedRow }) => {
                const { ReasonForCancellation, ModeFlag, ...rest } = nestedRow;

                return {
                    ...rest,

                    // 1️⃣ If ModeFlag field exists → force to Checked
                    ...("ModeFlag" in nestedRow && { ModeFlag: "UPDATE" }),

                    // 2️⃣ Send ReasonForCancellation only if NOT null
                    ...(ReasonForCancellation != null && { ReasonForCancellation }),

                    // 3️⃣ Backend hates null
                    Remark: rest.Remark ?? "",
                };
            }),
        };


        console.log(JSON.stringify(payload, null, 2))
        try {
            //    const payload = {
            //     Header: {
            //       "DraftBillNo": selectedDraftBills[0]?.id,

            //     },
            //     ItemDetails: 
            //         selectedDraftBills[0]?.lineItems ?? []    
            //     ,
            // };
            console.log("payload ===", payload);
            const response = await draftBillService.reRuntDraftBillByID(payload);

            console.log("Cancel API response:", response);
            const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
            const resourceStatus = (response as any)?.data?.IsSuccess;
            console.log("parsedResponse ====", parsedResponse);
            if (resourceStatus) {
                console.log("Approved successfully");
                toast({
                    title: "✅ Approved Successfully",
                    description: (response as any)?.data?.ResponseData?.Message || "Your changes have been Approved.",
                    variant: "default",
                });
                setIsCancelModalOpen(false);
            } else {
                console.log("error as any ===", (response as any)?.data?.Message);
                toast({
                    title: "⚠️ Approved Failed",
                    description: (response as any)?.data?.Message || "Failed to Approve changes.",
                    variant: "destructive",
                });
            }
            // Optionally, handle success or display a message
        } catch (error) {
            console.error("Error canceling Draft:", error);
        }

    };

    const handleReTreat = async () => {

        console.log("handleReTreat", selectedDraftBills)

        const payload = {
            TriggerType: {
                IsRevertTransferInvoice: 1,
                IsRevertFinanceInvoice: 1
            },
            DraftBills: selectedDraftBills.map(bill => ({
                DraftBillNo: bill.DraftBillNo
            }))
        };



        console.log(JSON.stringify(payload, null, 2))
        try {

            console.log("payload ===", payload);
            const response = await draftBillService.revertDraftBillByID(payload);

            console.log("Cancel API response:", response);
            const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
            const resourceStatus = (response as any)?.data?.IsSuccess;
            console.log("parsedResponse ====", parsedResponse);
            if (resourceStatus) {
                console.log("Approved successfully");
                toast({
                    title: "✅ Approved Successfully",
                    description: (response as any)?.data?.ResponseData?.Message || "Your changes have been Approved.",
                    variant: "default",
                });
                setIsCancelModalOpen(false);
            } else {
                console.log("error as any ===", (response as any)?.data?.Message);
                toast({
                    title: "⚠️ Approved Failed",
                    description: (response as any)?.data?.Message || "Failed to Approve changes.",
                    variant: "destructive",
                });
            }
            // Optionally, handle success or display a message
        } catch (error) {
            console.error("Error canceling Draft:", error);
            // Optionally, handle error or display an error message
        }

    };

    // Helper to fetch filter sets (used internally and exposed via service)
    const fetchFilterSets = async (userId: string, gridId: string) => {
        try {
            console.log(`Fetching filter sets for ${userId} - ${gridId}`);
            const response: any = await quickOrderService.getPersonalization({
                LevelType: 'User',
                // LevelKey: 'ramcouser', // Should ideally come from user context
                ScreenName: 'DraftBillManagement',
                ComponentName: 'filterSets_serverside-filter_preferences'
            });

            if (response?.data?.ResponseData) {
                const parsedData = JSON.parse(response.data.ResponseData);
                if (parsedData?.PersonalizationResult && parsedData.PersonalizationResult.length > 0) {
                    const jsonData = parsedData.PersonalizationResult[0].JsonData;
                    return {
                        sets: jsonData?.filterSets || [],
                        recordExists: true
                    };
                }
            }
            return { sets: [], recordExists: false };
        } catch (error) {
            console.error('Failed to fetch filter sets:', error);
            return { sets: [], recordExists: false };
        }
    };

    // Custom Filter Service to handle Personalization API for Filter Sets
    const customFilterService = useMemo(() => ({
        getUserFilterSets: async (userId: string, gridId: string) => {
            const { sets } = await fetchFilterSets(userId, gridId);
            return sets;
        },

        saveUserFilterSet: async (userId: string, name: string, filters: Record<string, any>, isDefault: boolean = false, gridId: string = 'default') => {
            try {
                // 1. Get existing sets first
                const { sets: existingSets, recordExists } = await fetchFilterSets(userId, gridId);

                // 2. Create new set
                const newSet = {
                    id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    userId,
                    gridId,
                    filters,
                    isDefault,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                // 3. Update list (handle default logic)
                let updatedSets = [...existingSets];
                if (isDefault) {
                    updatedSets = updatedSets.map((s: any) => ({ ...s, isDefault: false }));
                }
                updatedSets.push(newSet);

                // 4. Save to API
                await quickOrderService.savePersonalization({
                    LevelType: 'User',
                    // LevelKey: 'ramcouser',
                    ScreenName: 'DraftBillManagement',
                    ComponentName: 'filterSets_serverside-filter_preferences',
                    JsonData: { filterSets: updatedSets },
                    IsActive: "1",
                    ModeFlag: recordExists ? "Update" : "Insert"
                });

                return newSet;
            } catch (error) {
                console.error('Failed to save filter set:', error);
                throw error;
            }
        },

        updateFilterSet: async (filterId: string, updates: any) => {
            try {
                // 1. Get existing sets
                const { sets: existingSets } = await fetchFilterSets('ramcouser', 'draft-bill-management'); // Hardcoded for now as per context

                // 2. Find and update
                const index = existingSets.findIndex((s: any) => s.id === filterId);
                if (index === -1) throw new Error('Filter set not found');

                const updatedSet = { ...existingSets[index], ...updates, updatedAt: new Date().toISOString() };

                let updatedSets = [...existingSets];
                if (updates.isDefault) {
                    updatedSets = updatedSets.map((s: any) => ({ ...s, isDefault: false }));
                }
                updatedSets[index] = updatedSet;

                // 3. Save to API
                await quickOrderService.savePersonalization({
                    LevelType: 'User',
                    // LevelKey: 'ramcouser',
                    ScreenName: 'DraftBillManagement',
                    ComponentName: 'filterSets_serverside-filter_preferences',
                    JsonData: { filterSets: updatedSets },
                    IsActive: "1",
                    ModeFlag: "Update"
                });

                return updatedSet;
            } catch (error) {
                console.error('Failed to update filter set:', error);
                throw error;
            }
        },

        deleteFilterSet: async (filterId: string) => {
            try {
                // 1. Get existing sets
                const { sets: existingSets } = await fetchFilterSets('ramcouser', 'draft-bill-management');

                // 2. Filter out
                const updatedSets = existingSets.filter((s: any) => s.id !== filterId);

                // 3. Save to API
                await quickOrderService.savePersonalization({
                    LevelType: 'User',
                    // LevelKey: 'ramcouser',
                    ScreenName: 'DraftBillManagement',
                    ComponentName: 'filterSets_serverside-filter_preferences',
                    JsonData: { filterSets: updatedSets },
                    IsActive: "1",
                    ModeFlag: "Update"
                });
            } catch (error) {
                console.error('Failed to delete filter set:', error);
                throw error;
            }
        },

        applyGridFilters: async (filters: Record<string, any>) => {
            // Delegate to the global filterService so handleServerSideSearch can pick it up
            console.log('CustomFilterService: Applying filters via global service', filters);
            return filterService.applyGridFilters(filters);
        }
    }), []);


    const handleGridPreferenceSave = async (preferences: any) => {
        try {
            // Get the latest preferences from localStorage to ensure we have the full state
            const storedPreferences = localStorage.getItem('smartgrid-preferences');
            const preferencesToSave = storedPreferences ? JSON.parse(storedPreferences) : preferences;

            console.log('Saving DraftBillHub Nested SmartGrid preferences:', preferencesToSave);

            const response = await quickOrderService.savePersonalization({
                LevelType: 'User',
                // LevelKey: 'ramcouser',
                ScreenName: 'DraftBillManagement',
                ComponentName: 'smartgrid-preferences',
                JsonData: preferencesToSave,
                IsActive: "1",
                ModeFlag: isPersonalizationEmpty ? "Insert" : "Update"
            });

            const apiData = response?.data;

            if (apiData) {
                const isSuccess = apiData?.IsSuccess;
                // const message = apiData?.Message || "No message returned";

                toast({
                    title: isSuccess ? "✅ Preferences Saved Successfully" : "⚠️ Error Saving Preferences",
                    description: apiData?.Message,
                    variant: isSuccess ? "default" : "destructive",
                });

                // If success, update the empty flag
                if (isSuccess) setIsPersonalizationEmpty(false);

            } else {
                throw new Error("Invalid API response");
            }
        } catch (error) {
            console.error("Failed to save grid preferences:", error);
            toast({
                title: "Error",
                description: "Failed to save grid preferences",
                variant: "destructive",
            });
        }
    };

    const handleServerFilterPreferenceSave = async (visibleFields: string[], fieldOrder: string[]) => {
        console.log('DraftBillHubGridMain: handleServerFilterPreferenceSave called', { visibleFields, fieldOrder });
        try {
            const preferencesToSave = {
                visibleFields,
                fieldOrder
            };

            const response = await quickOrderService.savePersonalization({
                LevelType: 'User',
                // LevelKey: 'ramcouser',
                ScreenName: 'DraftBillManagement',
                ComponentName: 'smartgrid-serverside-filtersearch-preferences',
                JsonData: preferencesToSave,
                IsActive: "1",
                ModeFlag: isServerFilterPersonalizationEmpty ? "Insert" : "Update"
            });

            const apiData = response?.data;

            if (apiData?.IsSuccess) {
                setServerFilterVisibleFields(visibleFields);
                setServerFilterFieldOrder(fieldOrder);
                // Update the empty flag since we now have saved data
                setIsServerFilterPersonalizationEmpty(false);

                toast({
                    title: "✅ Filter Preferences Saved",
                    description: "Your search field preferences have been saved.",
                    variant: "default",
                });

                // Refresh data to reflect any changes (optional, but good practice if filters affect data fetching)
                // handleServerSideSearch(); 
            } else {
                throw new Error(apiData?.Message || "Invalid API response");
            }
        } catch (error) {
            console.error("Failed to save server filter preferences:", error);
            toast({
                title: "Error",
                description: "Failed to save filter preferences",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="h-full flex flex-col relative">
            {gridState.loading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                    <div className="text-lg font-semibold text-blue-700">Loading Draft Bills...</div>
                    <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
                </div>
            )}
            {/* Load the grid only when preferences are loaded */}
            {isPreferencesLoaded ? (
                <SmartGridWithNestedRows
                    key={`grid-${gridState.forceUpdate}-${forceGridUpdate}`}
                    gridId="draft-bill-grid"
                    gridTitle="Draft Bill"
                    recordCount={gridState.gridData.length}
                    data={gridState.gridData}
                    columns={gridState.columns}
                    onLinkClick={handleLinkClick}
                    onSubRowToggle={gridState.handleSubRowToggle}
                    paginationMode="pagination"
                    customPageSize={20}
                    clientSideSearch={true}
                    hideCheckboxToggle={false}
                    showDefaultConfigurableButton={false}
                    onClearAll={clearAllFilters}
                    onSearch={handleServerSideSearch}
                    serverFilters={dynamicServerFilters}
                    showServersideFilter={showServersideFilter}
                    onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
                    api={customFilterService}
                    onPreferenceSave={handleGridPreferenceSave}
                    serverFilterVisibleFields={serverFilterVisibleFields}
                    serverFilterFieldOrder={serverFilterFieldOrder}
                    onServerFilterPreferenceSave={handleServerFilterPreferenceSave}



                    onRowSelectionChange={handleDraftBillSelection}

                    // nestedRowRenderer={renderSubRow}
                    // selectionMode='multi'
                    onSelectedRowsChange={(selectedRows) => {
                        console.log("✅ Selected rows from grid:", selectedRows);
                        console.log("selectedDbLines", selectedDbLines)
                        setSelectedDraftBills(selectedRows);
                        onDraftBillSelection?.(selectedRows);
                    }}

                    nestedSectionConfig={{
                        nestedDataKey: 'lineItems',
                        columns: nestedColumns,
                        title: 'Line Level Info',
                        initiallyExpanded: false,
                        showNestedRowCount: true,
                        editableColumns: false,
                        selectionMode: "multi",
                        selectedRows: selectedDbLines,
                        // onSelectionChange: setselectedDbLines,
                        onSelectionChange: (rows) => {
                            console.log("rows", rows);
                            setSelectedBillItemsFlag(false);
                            if (!rows || rows.length === 0) {
                                setselectedDbLines([]);
                                return;
                            }

                            const latest = rows[rows.length - 1];

                            const latestParentId =
                                latest.parentRow?.DraftBillNo || latest.parentRow?.id;

                            setselectedDbLines((prev) => {
                                if (prev.length === 0) {
                                    return [latest];
                                }

                                const prevParentId =
                                    prev[0]?.parentRow?.DraftBillNo || prev[0]?.parentRow?.id;

                                if (prevParentId === latestParentId) {
                                    return rows;
                                }

                                return [latest];
                            });
                        },


                    }}
                />
            ) : (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                    <div className="text-lg font-semibold text-blue-700">Loading Draft Bills...</div>
                    <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
                </div>
            )}

            {/* Draft Bill Details Side Drawer */}
            {isDraftBillDetailsSideDrawOpen && (
                <DraftBillDetailsSideDraw
                    isOpen={isDraftBillDetailsSideDrawOpen}
                    onClose={() => {
                        setIsDraftBillDetailsSideDraw(false);
                        setDraftBillData(null);
                    }}
                    lineItems={loadingDrawerData ? [] : (draftBillData?.ItemDetails || [])}
                    headerData={loadingDrawerData ? null : (draftBillData?.Header || null)}
                    isLoading={loadingDrawerData}
                />
            )}
            <CancelConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirmCancel={handleNewCancel}
            />
            <GenerateInvoiceModal
                isOpen={isGenerateInvoiceModalOpen}
                onClose={() => setIsGenerateInvoiceModalOpen(false)}
                onConfirmGenerateInvoice={handleGenerateInvoice}
            />
        </div>
    );
};

export default DraftBillHubGridMain;
