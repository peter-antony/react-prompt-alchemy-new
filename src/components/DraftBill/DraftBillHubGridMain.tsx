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

const DraftBillHubGridMain = () => {
    const { toast } = useToast();
    const [gridData, setGridData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);
    const [
        isDraftBillDetailsSideDrawOpen,
        setIsDraftBillDetailsSideDraw,
    ] = useState(false);
    const [draftBillData, setDraftBillData] = useState<any>(null);
    const [loadingDrawerData, setLoadingDrawerData] = useState(false);
    
    const columns: GridColumnConfig[] = useMemo(() => [
        {
            key: 'DraftBillNo',
            label: 'Draft Bill No',
            type: 'Link',
            sortable: true,
            filterable: true,
            width: 200
        },
        {
            key: 'DraftBillDate',
            label: 'Draft Bill Date',
            type: 'DateTimeRange',
            sortable: true,
            filterable: true,
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
            width: 150
        },
        {
            key: 'DBTotalValue',
            label: 'DB Total Value',
            type: 'CurrencyWithSymbol',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'BusinessPartnerName',
            label: 'Business Partner',
            type: 'TextPipedData',
            sortable: true,
            filterable: true,
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
            width: 150
        },
        {
            key: 'ContractID',
            label: 'Contract ID',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 200
        },
        {
            key: 'ContractDescription',
            label: 'Contract Description',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 250
        },
        {
            key: 'ContractType',
            label: 'Contract Type',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 100
        },
        {
            key: 'DraftbillValidationDate',
            label: 'Validation Date',
            type: 'Date',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'InvoiceNo',
            label: 'Invoice No',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'InvoiceDate',
            label: 'Invoice Date',
            type: 'Date',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'InvoiceStatus',
            label: 'Invoice Status',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'TransferInvoiceNo',
            label: 'Transfer Invoice No',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'LatestJournalVoucher',
            label: 'Latest JV',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'GLAccount',
            label: 'GL Account',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'DBAcceptedValue',
            label: 'Accepted Value',
            type: 'Integer',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'DraftBillStage',
            label: 'Stage',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 200
        },
        {
            key: 'WorkFlowStatus',
            label: 'Workflow Status',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'CustomerGroup',
            label: 'Customer Group',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'SupplierGroup',
            label: 'Supplier Group',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'Cluster',
            label: 'Cluster',
            type: 'Text',
            sortable: true,
            filterable: true,
            width: 150
        },
        {
            key: 'Attribute1',
            label: 'Attribute 1',
            type: 'Text',
            sortable: true,
            filterable: true,
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
            type: 'Text',
            width: 250
        },
        {
            key: 'CustomerOrderNo',
            label: 'Customer Order No',
            type: 'Text',
            width: 250
        }
    ], []);


    const { activeFilters } = useFilterStore();
    const gridId = "draft-bill-grid";
    const filtersForThisGrid = activeFilters[gridId] || {};

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
        setLoading(true);
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
                            id: `${(header.DraftBillNo || index + 1)}-${detailIndex + 1}`,
                            ...detail
                        }))
                    };
                });
                setGridData(processedData);
            } else {
                setGridData([]);
                console.warn("No ResultSet or ResponseResult found in parsed response", parsedResponse);
            }

        } catch (error) {
            console.error("Error fetching draft bills:", error);
            toast({
                title: "Error",
                description: "Failed to fetch draft bills.",
                variant: "destructive"
            });
            setGridData([]);
        } finally {
            setLoading(false);
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
                console.log('data: ', parsed);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
                if (parsed?.error) {
                    // Error case → handle gracefully
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

    const dynamicServerFilters: ServerFilter[] = [
        // { 
        //     key: 'DraftBillNo', label: 'Draft Bill No', type: 'text',
        // },
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
            key: 'RefDocNo', label: 'Ref Doc ID', type: 'lazyselect',
            fetchOptions: makeLazyFetcher(''),
        },
        {
            key: 'RefDocType', label: 'Ref Doc Type', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('DB Ref Doc Type Init'),
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
            defaultValue: {
                from: "2025-12-17",
                to: "2025-12-18"
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
            fetchOptions: makeLazyFetcher('	DB Invoice Status Init'),
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
            key: 'TriggeringDocID', label: 'Triggering Doc ID', type: 'lazyselect',
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
            key: 'QC1', label: 'QC 1', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Draft Bill QC1 Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'QC1Value', label: 'QC 1 Value', type: 'text'
        },
        {
            key: 'QC2', label: 'QC 2', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Draft Bill QC2 Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'QC2Value', label: 'QC 2 Value', type: 'text'
        },
        {
            key: 'QC3', label: 'QC 3', type: 'lazyselect',
            fetchOptions: makeLazyFetcher('Draft Bill QC3 Init'),
            disableLazyLoading: true, hideSearch: true
        },
        {
            key: 'QC3Value', label: 'QC 3 Value', type: 'text'
        }
    ];

    const clearAllFilters = async () => {
        console.log('Cleared all filters sets');
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

    return (
        <div className="h-full flex flex-col relative">
            {loading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                    <div className="text-lg font-semibold text-blue-700">Loading Draft Bills...</div>
                    <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
                </div>
            )}
            <SmartGridWithNestedRows
                gridId="draft-bill-grid"
                gridTitle="Draft Bill"
                recordCount={gridData.length}
                data={gridData}
                columns={columns}
                onLinkClick={handleLinkClick}
                paginationMode="pagination"
                customPageSize={20}
                clientSideSearch={true}
                hideCheckboxToggle={false}
                showDefaultConfigurableButton={false}
                onClearAll={clearAllFilters}
                serverFilters={dynamicServerFilters}
                showServersideFilter={showServersideFilter}
                onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
                selectionMode='multi'
                onSelectedRowsChange={(selectedRows) => {
                    console.log("Selected rows:", selectedRows)
                }}
                nestedSectionConfig={{
                    nestedDataKey: 'lineItems',
                    columns: nestedColumns,
                    title: 'Line Level Info',
                    initiallyExpanded: false,
                    showNestedRowCount: true,
                    editableColumns: false
                }}
            />
            
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
        </div>
    );
};

export default DraftBillHubGridMain;
