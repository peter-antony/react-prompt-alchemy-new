import React, { useState, useMemo, useEffect } from 'react';
import { SmartGrid, SmartGridWithGrouping } from '@/components/SmartGrid';
import { GridColumnConfig, FilterConfig, ServerFilter } from '@/types/smartgrid';
import { Button } from '@/components/ui/button';
import { Printer, MoreHorizontal, User, Train, UserCheck, Container, Plus, Upload, NotebookPen, Edit, Trash2, Eye, Settings, GitPullRequest, Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from '../components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { SideDrawer } from '@/components/Common/SideDrawer';
import BulkUpload from '@/components/QuickOrderNew/BulkUpload';
import { PlanAndActualDetails } from '@/components/QuickOrderNew/PlanAndActualDetails';
import jsonStore from '@/stores/jsonStore';
import { useFooterStore } from '@/stores/footerStore';
import CommonPopup from '@/components/Common/CommonPopup';
import { filterService, quickOrderService } from '@/api/services';
import { SimpleDropDown } from '@/components/Common/SimpleDropDown';
import CardDetails, { CardDetailsItem } from '@/components/Common/GridResourceDetails';
import { Input } from '@/components/ui/input';
import GridResourceDetails from '@/components/Common/GridResourceDetails';
import { SimpleDropDownSelection } from '@/components/Common/SimpleDropDownSelection';
import { dateFormatter } from '@/utils/formatter';
import { format, subDays } from 'date-fns';

interface SampleData {
  QuickUniqueID: any;
  QuickOrderNo: any;
  QuickOrderDate: string;
  Status: string;
  CustomerOrVendor: any;
  Customer_Supplier_RefNo: any;
  Contract: string;
  OrderType: string;
  TotalNet: number;
  tripBillingStatus?: string;
  departurePointDetails?: string;
  arrivalPointDetails?: string;
  customerDetails?: Array<{
    name: string;
    id: string;
    type: 'customer';
  }>;
  resourceDetails?: Array<{
    name: string;
    id: string;
    type: 'train' | 'agent' | 'container';
  }>;
}

const QuickOrderManagement = () => {
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const [filterTimeout, setFilterTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFilterApiCallInProgress, setIsFilterApiCallInProgress] = useState(false);
  const [lastFilterCall, setLastFilterCall] = useState<number>(0);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const gridState = useSmartGridState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { config, setFooter, resetFooter } = useFooterStore();
  const [popupOpen, setPopupOpen] = useState(false);
  const [fields, setFields] = useState([
    {
      type: "select",
      label: "Reason Code",
      name: "reasonCode",
      placeholder: "Select Reason Code",
      options: [
        { value: "A", label: "Reason A" },
        { value: "B", label: "Reason B" },
      ],
      value: "",
    },
    {
      type: "text",
      label: "Reason Code Desc.",
      name: "reasonDesc",
      placeholder: "Enter Reason Code Description",
      value: "",
    },
  ]);

  // State for resourceGroups and cardData
  const [resourceGroups, setResourceGroups] = useState<any[]>([]);
  const [cardData, setCardData] = useState<CardDetailsItem[]>([]);
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);
  const [quickResourceId, setQuickResourceId] = useState<string>('');
  const GitPullActionButton = () => {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 1.5V10C1.5 11.4001 1.5 12.1002 1.77248 12.635C2.01217 13.1054 2.39462 13.4878 2.86502 13.7275C3.3998 14 4.09987 14 5.5 14H11.5M11.5 14C11.5 15.3807 12.6193 16.5 14 16.5C15.3807 16.5 16.5 15.3807 16.5 14C16.5 12.6193 15.3807 11.5 14 11.5C12.6193 11.5 11.5 12.6193 11.5 14ZM1.5 5.66667L11.5 5.66667M11.5 5.66667C11.5 7.04738 12.6193 8.16667 14 8.16667C15.3807 8.16667 16.5 7.04738 16.5 5.66667C16.5 4.28595 15.3807 3.16667 14 3.16667C12.6193 3.16667 11.5 4.28596 11.5 5.66667Z" stroke="#475467" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  const handleInputChange = (field: string, value: string) => {
    // Handle input change logic here
    console.log(`Field: ${field}, Value: ${value}`);
  };

  const handleFieldChange = (name, value) => {
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const [isGroupLevelModalOpen, setGroupLevelModalOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupButtonName, setPopupButtonName] = useState('');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  const orderConfirmhandler = () => {
    // Access selected row data for Confirm action
    const selectedRowData = Array.from(selectedRows).map(idx => gridState.gridData[idx]);
    console.log('Confirm selected rows:', selectedRowData);
    setPopupOpen(true);
    setPopupTitle('Amend');
    setPopupButtonName('Amend');
    setPopupBGColor('bg-blue-600');
    setPopupTextColor('text-blue-600');
    setPopupTitleBgColor('bg-blue-100');
  };

  const quickOrderCancelhandler = () => {
    setPopupOpen(true);
    setPopupTitle('Cancel Bill');
    setPopupButtonName('Cancel');
    setPopupBGColor('bg-red-600');
    setPopupTextColor('text-red-500');
    setPopupTitleBgColor('bg-red-50');
  };

  const getSelectedRowData = () => {
    // Returns array of full row objects for selected rows
    return Array.from(selectedRows);
  };

  useEffect(() => {
    setFooter({
      visible: true,
      pageName: 'Quick_Order',
      leftButtons: [
        // {
        //   label: "CIM/CUV Report",
        //   onClick: () => console.log("CIM/CUV Report"),
        //   disabled: true,
        //   type: "Icon",
        //   iconName: 'BookText'
        // },
      ],
      rightButtons: [
        {
          label: "Cancel",
          type: 'Button',
          onClick: () => {
            const selectedData = getSelectedRowData();
            console.log("Cancel clicked, selected rows:", selectedData);
            // quickOrderCancelhandler();
          },
        },
        {
          label: "Confirm",
          type: "Button",
          onClick: () => {
            const selectedData = getSelectedRowData();
            console.log("Confirm clicked, selected rows:", selectedData);
            // orderConfirmhandler();
          },
        },
      ],
    });
    return () => resetFooter();
  }, [selectedRows, gridState.gridData]);

  const initialColumns: GridColumnConfig[] = [
    {
      key: 'QuickOrderNo',
      label: 'Quick Order No.',
      type: 'Link',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1
    },
    {
      key: 'QuickOrderDate',
      label: 'Quick Order Date',
      type: 'Date',
      sortable: true,
      editable: false,
      subRow: false,
      order: 2
    },
    {
      key: 'Status',
      label: 'Status',
      type: 'Badge',
      sortable: true,
      editable: false,
      subRow: false,
      order: 3
    },
    {
      key: 'CustomerOrVendor',
      label: 'Customer/Supplier',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      order: 4
    },
    {
      key: 'Contract',
      label: 'Contract',
      type: 'Text',
      sortable: true,
      editable: false,
      // infoTextField: 'arrivalPointDetails',
      subRow: false,
      order: 5
    },
    {
      key: 'Customer_Supplier_RefNo',
      // label: 'Cust/Sup. Ref. No.',
      label: 'Customer/Supplier Ref. No.',
      type: 'Text',
      // type: 'TextWithTooltip',
      sortable: true,
      editable: false,
      subRow: false,
      order: 6
    },

    {
      key: 'OrderType',
      label: 'Order Type',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      order: 7
    },
    {
      key: 'TotalNet',
      label: 'Total Net',
      type: 'CurrencyWithSymbol',
      sortable: true,
      editable: false,
      subRow: false,
      order: 8
    },
    {
      key: 'actions',
      label: '',
      type: 'ActionButton',
      sortable: false,
      editable: false,
      subRow: false,
      filterable: false,
      width: 80,
      actionButtons: [
        // {
        //   icon: <Eye className="h-4 w-4 text-blue-600" />,
        //   tooltip: 'View Details',
        //   onClick: (rowData) => {
        //     console.log('View clicked for:', rowData);
        //     // Navigate to view page or open modal
        //     navigate(`/create-quick-order?id=${encodeURIComponent(row.QuickUniqueID)}&mode=view`);
        //   },
        //   variant: 'ghost',
        //   size: 'sm'
        // },
        {
          icon: <GitPullActionButton />,
          tooltip: 'Order',
          onClick: async (rowData) => {
            console.log('clicked for:', rowData);
            if (rowData.QuickUniqueID) {
              setQuickResourceId(rowData.QuickUniqueID);
              // const resourceGroupAsyncFetch: any = await quickOrderService.screenFetchQuickOrder(rowData.QuickUniqueID);
              // // console.log('Quick order Resource Group Unique Data fecth: ', resourceGroupAsyncFetch);
              // const jsonParsedData: any = JSON.parse(resourceGroupAsyncFetch?.data?.ResponseData);
              // console.log('Parsed Data:', jsonParsedData);
              // setResourceGroups(jsonParsedData?.ResponseResult[0] ? [jsonParsedData.ResponseResult[0]] : []);
              // setCardData(jsonParsedData?.ResponseResult[0]?.ResourceGroup || []);
              setGroupLevelModalOpen(true);
            }
            // Show confirmation dialog
          },
          variant: 'ghost',
          size: 'lg',
          // disabled: (rowData) => rowData.Status.value === 'Save' || rowData.Status.value === 'Deleted'
        }
      ]
    }
  ];

  // Initialize columns and data
  useEffect(() => {
    let latestFilters = filterService.applyGridFiltersSet();
    console.log("useEffect Latest filters applied: ", latestFilters);
    gridState.setColumns(initialColumns);
    gridState.setLoading(true); // Set loading state
    setApiStatus('loading');

    let isMounted = true;
    let dates = {
      from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd')
    }
    // default date range filter: last 30 days added.
    let searchFilters = [
      { FilterName: 'CreatedFromDate', FilterValue: dates.from },
      { FilterName: 'CreatedToDate', FilterValue: dates.to }
    ];

    quickOrderService.getQuickOrders({
      filters: searchFilters
    })
      .then((response: any) => {
        if (!isMounted) return;

        console.log('API Response:', response); // Debug log

        // Handle paginated response structure - try different possible response formats
        // const data = response?.data?.ResponseData || response?.data || response?.result || response;
        const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
        const data = parsedResponse.ResponseResult;

        if (!data || !Array.isArray(data)) {
          console.warn('API returned invalid data format:', response);
          console.warn('Expected array but got:', typeof data, data);
          if (isMounted) {
            gridState.setGridData([]);
            gridState.setLoading(false);
            setApiStatus('error');
          }
          return;
        }

        const processedData = data.map((row: any) => {
          // Helper function for status color (defined inline to avoid hoisting issues)
          const getStatusColorLocal = (status: string) => {
            const statusColors: Record<string, string> = {
              'Released': 'badge-fresh-green rounded-2xl',
              'Under Execution': 'badge-purple rounded-2xl',
              'Fresh': 'badge-blue rounded-2xl',
              'Cancelled': 'badge-red rounded-2xl',
              'Deleted': 'badge-red rounded-2xl',
              'Save': 'badge-green rounded-2xl',
              'Under Amendment': 'badge-orange rounded-2xl',
              'Confirmed': 'badge-green rounded-2xl',
              'Initiated': 'badge-blue rounded-2xl',
            };
            return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
          };

          return {
            ...row,
            Status: {
              value: row.Status,
              variant: getStatusColorLocal(row.Status),
            },
            QuickOrderDate: dateFormatter(row.QuickOrderDate)
          };
        });

        console.log('Processed Data:', processedData); // Debug log

        if (isMounted) {
          gridState.setGridData(processedData);
          gridState.setLoading(false);
          setApiStatus('success');
        }
      })
      .catch((error: any) => {
        console.error("Quick order fetch failed:", error);
        if (isMounted) {
          gridState.setGridData([]);
          gridState.setLoading(false);
          setApiStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []); // Add dependencies if needed

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }
    };
  }, [filterTimeout]);

  const breadcrumbItems = [
    { label: 'Home', href: '/', active: false },
    { label: 'Quick Order Management', active: true }
    // { label: 'Trip Execution Management', active: false },
  ];

  // Log when columns change
  useEffect(() => {
    console.log('Columns changed in QuickOrderManagement:', gridState.columns);
    const oldQuickOrder = jsonStore.getQuickOrder();
    console.log("QUICK ORDER OBJECT IN LIST PAGE : ", oldQuickOrder)
    console.log('Sub-row columns:', gridState.columns.filter(col => col.subRow).map(col => col.key));
  }, [gridState.columns, gridState.forceUpdate]);

  const { toast } = useToast();

  const handleSearchDataChange = (data: Record<string, any>) => {
    console.log("Search data changed:", data);
  };

  // Server-side filters for the new ServersideFilter component
  const [serverFilterOptions, setServerFilterOptions] = useState<any>({});
  const [filtersLoading, setFiltersLoading] = useState(false);

  // utils/fetchOptionsHelper.ts
  const makeLazyFetcher = (messageType: string) => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      const response: any = await quickOrderService.getMasterCommonData({
        messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      try {
        return JSON.parse(response?.data?.ResponseData || '[]');
      } catch (err) {
        console.error(`Failed to parse ResponseData for ${messageType}:`, err);
        return [];
      }
    };
  };

  const dynamicServerFilters: ServerFilter[] = [
    {
      key: 'OrderType', label: 'Order Type', type: 'select',
      options: [
        // { id: '1', name: 'BOTH', default: "N", description: "", seqNo: 1 },
        { id: '2', name: 'SELL', default: "N", description: "", seqNo: 2 },
        { id: '3', name: 'BUY', default: "N", description: "", seqNo: 3 },
      ]
    },
    {
      key: 'Supplier', label: 'Supplier', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Supplier Init")
    },
    {
      key: 'Contract', label: 'Supplier/Customer Contract', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Contract Init")
    },
    {
      key: 'Cluster', label: 'Cluster', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Cluster Init")
    },
    {
      key: 'Customer',
      label: 'Customer',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Customer Init")
    },
    { key: 'CustomerSupplierRefNo', label: 'Customer/Supplier Ref No', type: 'text' },
    { key: 'DraftBillNo', label: 'Draft Bill No', type: 'text' },
    {
      key: 'DeparturePoint', label: 'Departure Point', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Departure Init")
    },
    {
      key: 'ArrivalPoint', label: 'Arrival Point', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Arrival Init")
    },
    {
      key: 'ServiceType', label: 'Service', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Service type Init")
    },
    { key: 'ServiceDate', label: 'Service Date', type: 'dateRange' },
    { key: 'QuickOrderDate', label: 'Quick Order Date', type: 'dateRange' },
    { key: 'TotalNet', label: 'Total Net Amount', type: 'numberRange' },
    {
      key: 'DraftBillStatus', label: 'Draft Bill Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("DraftBillStatus Init")
    },
    {
      key: 'IsBillingFailed', label: 'Billing Failed', type: 'select',
      options: [
        { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
        { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
      ]
    },
    {
      key: 'SubService', label: 'Sub Service', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Sub Service type Init")
    },
    { key: 'WBS', label: 'WBS', type: 'text' },
    {
      key: 'OperationalLocation', label: 'Operational Location', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Location Init")
    },
    {
      key: 'PrimaryRefDoc', label: 'Primary Ref Doc type and no.', type: 'text',
      // fetchOptions: makeLazyFetcher("Ref doc type Init")
    },
    {
      key: 'QuickCreatedDate', label: 'Quick Order Created Date', type: 'dateRange',
      defaultValue: {
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
      }
    },
    {
      key: 'CreatedBy', label: 'Quick Order Created By', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Createdby Init")
    },
    {
      key: 'SecondaryDoc', label: 'Secondary Doc', type: 'text',
      // fetchOptions: makeLazyFetcher("Ref doc type Init")
    },
    { key: 'InvoiceNo', label: 'Invoice No', type: 'text' },
    {
      key: 'InvoiceStatus', label: 'Invoice Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Finance Status Init")
    },
    {
      key: 'ResourceType', label: 'Resource Type', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("ResourceType Init")
    },
    {
      key: 'Wagon', label: 'Wagon', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Wagon id Init")
    },
    {
      key: 'Container', label: 'Container', type: 'lazyselect',
      // fetchOptions: makeLazyFetcher("Container Type Init")
      fetchOptions: makeLazyFetcher("Container ID Init")
    },
    // { key: 'QuickUniqueID', label: 'Quick Unique ID', type: 'text' },
    // { key: 'QuickOrderNo', label: 'Quick Order No', type: 'text' },
    // { key: 'FromOrderDate', label: 'Quick Order Date', type: 'dateRange' },
    // { key: 'CreatedFromDate', label: 'Created From Date', type: 'text' },
    // { key: 'CreatedToDate', label: 'Created To Date', type: 'text' }
  ];

  // console.log("dynamicServerFilters Server Filter Options: ", dynamicServerFilters);

  // const handleSimpleSearch = () => {
  //   // Use currentFilters for server-side search
  //   handleSearchWithCurrentFilters();
  // };

  const handleServerSideSearch = async () => {
    // console.log("Server-side search with filters:", filterService.applyGridFiltersSet());
    let latestFilters = filterService.applyGridFiltersSet();
    try {
      gridState.setLoading(true);
      setApiStatus('loading');

      // Convert filters to API format
      const filterParams: Record<string, any> = {};
      //filters.forEach(filter => {
      //  if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
      //    filterParams[filter.column] = filter.value;
      //  }
      //});
      const searchData: any = [];
      // Add any current advanced filters
      Object.keys(latestFilters).forEach(key => {
        if (latestFilters[key] !== undefined && latestFilters[key] !== null && latestFilters[key] !== '') {
          filterParams[key] = latestFilters[key];
        }
      });
      if (Object.keys(latestFilters).length > 0) {
        Object.entries(latestFilters).forEach(([key, value]) => {
          console.log(`Key: ${key}, Value: ${value.type}`);
          // if (value && value.value && value.type !== "dateRange") {
          //   searchData.push({ 'FilterName': key, 'FilterValue': value.value });
          // }
          if (key == 'ServiceDate' && value.type === "dateRange") {
            // Split into two separate filter keys
            searchData.push(
              { FilterName: `ServiceFromDate`, FilterValue: value.value.from ? value.value.from : value.value.to },
              { FilterName: `ServiceToDate`, FilterValue: value.value.to ? value.value.to : value.value.from }
            );
          }
          else if (key == 'QuickOrderDate' && value.type === "dateRange") {
            // Split into two separate filter keys
            searchData.push(
              { FilterName: `FromOrderDate`, FilterValue: value.value.from ? value.value.from : value.value.to },
              { FilterName: `ToOrderDate`, FilterValue: value.value.to ? value.value.to : value.value.from }
            );
          }
          else if (key == 'QuickCreatedDate') {
            // Split into two separate filter keys
            searchData.push(
              { FilterName: `CreatedFromDate`, FilterValue: value.value.from ? value.value.from : value.value.to },
              { FilterName: `CreatedToDate`, FilterValue: value.value.to ? value.value.to : value.value.from }
            );
          }
          else if (key == 'TotalNet' && value.type === "number") {
            // Split into two separate filter keys
            searchData.push(
              { FilterName: `TotalNetFrom`, FilterValue: value.value.from },
              { FilterName: `TotalNetTo`, FilterValue: value.value.to }
            );
          } else if (key == 'IsBillingFailed') {
            searchData.push({
              FilterName: key,
              FilterValue: value.value === 'Yes' ? '1' : '0'
            })
          }
          else {
            searchData.push({ 'FilterName': key, 'FilterValue': value.value });
          }
        });
      }

      console.log('Searching with filters:', filterParams);

      const response: any = await quickOrderService.getQuickOrders({
        filters: searchData
      });

      // console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.ResponseResult;

      if (!data || !Array.isArray(data)) {
        console.warn('API returned invalid data format:', response);
        gridState.setGridData([]);
        gridState.setLoading(false);
        setApiStatus('error');
        toast({
          title: "No Results",
          description: "No orders found matching your criteria",
        });
        return;
      }

      const processedData = data.map((row: any) => {
        const getStatusColorLocal = (status: string) => {
          const statusColors: Record<string, string> = {
            'Released': 'badge-fresh-green rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Deleted': 'badge-red rounded-2xl',
            'Save': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Confirmed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
        };

        return {
          ...row,
          Status: {
            value: row.Status,
            variant: getStatusColorLocal(row.Status),
          },
          QuickOrderDate: dateFormatter(row.QuickOrderDate)
        };
      });

      // console.log('Processed Server-side Search Data:', processedData);

      gridState.setGridData(processedData);
      gridState.setLoading(false);
      setApiStatus('success');

      toast({
        title: "Success",
        description: `Found ${processedData.length} orders`,
      });

    } catch (error) {
      console.error('Server-side search failed:', error);
      gridState.setGridData([]);
      gridState.setLoading(false);
      setApiStatus('error');
      toast({
        title: "Error",
        description: "Failed to search orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearAllFilters = async () => {
    let latestFilters = filterService.applyGridFiltersSet();
    // console.log("Clearing all filters latestFilters", filterService.applyGridFiltersSet(), latestFilters);
    try {
      gridState.setLoading(true);
      setApiStatus('loading');

      // Convert filters to API format
      const filterParams: Record<string, any> = {};
      let dates = {
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
      }
      const searchData: any = [
        { FilterName: 'CreatedFromDate', FilterValue: dates.from },
        { FilterName: 'CreatedToDate', FilterValue: dates.to }
      ];
      // Add any current advanced filters

      // console.log('Searching with filters:', filterParams);

      const response: any = await quickOrderService.getQuickOrders({
        filters: searchData
      });

      // console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.ResponseResult;

      if (!data || !Array.isArray(data)) {
        console.warn('API returned invalid data format:', response);
        gridState.setGridData([]);
        gridState.setLoading(false);
        setApiStatus('error');
        toast({
          title: "No Results",
          description: "No orders found matching your criteria",
        });
        return;
      }

      const processedData = data.map((row: any) => {
        const getStatusColorLocal = (status: string) => {
          const statusColors: Record<string, string> = {
            'Released': 'badge-fresh-green rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Deleted': 'badge-red rounded-2xl',
            'Save': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Confirmed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
        };

        return {
          ...row,
          Status: {
            value: row.Status,
            variant: getStatusColorLocal(row.Status),
          },
          QuickOrderDate: dateFormatter(row.QuickOrderDate)
        };
      });

      // console.log('Processed Server-side Search Data:', processedData);

      gridState.setGridData(processedData);
      gridState.setLoading(false);
      setApiStatus('success');

      toast({
        title: "Success",
        description: `Found ${processedData.length} orders`,
      });

    } catch (error) {
      console.error('Server-side search failed:', error);
      gridState.setGridData([]);
      gridState.setLoading(false);
      setApiStatus('error');
      toast({
        title: "Error",
        description: "Failed to search orders. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleSearch = async (filters: FilterConfig[]) => {
    try {
      gridState.setLoading(true);
      setApiStatus('loading');

      // Convert filters to API format
      const filterParams: Record<string, any> = {};
      filters.forEach(filter => {
        if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
          filterParams[filter.column] = filter.value;
        }
      });

      // Add any current advanced filters
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] !== undefined && currentFilters[key] !== null && currentFilters[key] !== '') {
          filterParams[key] = currentFilters[key];
        }
      });

      console.log('Searching with filters:', filterParams);

      const response: any = await quickOrderService.getQuickOrders({
        filters: [filterParams]
      });

      console.log('Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.ResponseResult;

      if (!data || !Array.isArray(data)) {
        console.warn('API returned invalid data format:', response);
        gridState.setGridData([]);
        gridState.setLoading(false);
        setApiStatus('error');
        toast({
          title: "No Results",
          description: "No orders found matching your criteria",
        });
        return;
      }

      const processedData = data.map((row: any) => {
        const getStatusColorLocal = (status: string) => {
          const statusColors: Record<string, string> = {
            'Released': 'badge-fresh-green rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Deleted': 'badge-red rounded-2xl',
            'Save': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Confirmed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
        };

        return {
          ...row,
          Status: {
            value: row.Status,
            variant: getStatusColorLocal(row.Status),
          },
        };
      });

      console.log('Processed Search Data:', processedData);

      gridState.setGridData(processedData);
      gridState.setLoading(false);
      setApiStatus('success');

      toast({
        title: "Success",
        description: `Found ${processedData.length} orders`,
      });

    } catch (error) {
      console.error('Search failed:', error);
      gridState.setGridData([]);
      gridState.setLoading(false);
      setApiStatus('error');
      toast({
        title: "Error",
        description: "Failed to search orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setSearchFilters({});
    setCurrentFilters({});
    toast({
      title: "Cleared",
      description: "Search filters have been cleared",
    });
  };

  // Navigate to the create new quick order page
  const navigate = useNavigate();
  // Configurable buttons for the grid toolbar
  const configurableButtons: ConfigurableButtonConfig[] = [
    {
      label: "Create Order",
      tooltipTitle: "Create new quick order",
      showDropdown: true, // Enable dropdown for future functionality
      onClick: () => {
        navigate('/create-quick-order');
      },
      dropdownItems: [
        {
          label: "Add New",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            setIsDrawerOpen(true);
          }
        },
        {
          label: "Bulk Upload",
          icon: <Upload className="h-4 w-4" />,
          onClick: () => {
            setMoreInfoOpen(true);
          }
        }
      ]
    }
  ];

  const handleLinkClick = (row: any, columnKey: string) => {
    // Only navigate if the clicked column is the Quick Order No. (id)
    if (columnKey === 'QuickOrderNo' && row.QuickUniqueID) {
      navigate(`/create-quick-order?id=${encodeURIComponent(row.QuickUniqueID)}`);
    }
  };

  const handleUpdate = async (updatedRow: any) => {
    console.log('Updating row:', updatedRow);
    // Update the grid data
    gridState.setGridData(prev =>
      prev.map((row, index) =>
        index === updatedRow.index ? { ...row, ...updatedRow } : row
      )
    );

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: "Success",
      description: "Trip plan updated successfully"
    });
  };

  const handleRowSelection = (selectedRowObjects: Set<any>) => {
    console.log('Selected row objects:', Array.from(selectedRowObjects));
    setSelectedRows(selectedRowObjects);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    console.log('Advanced Filters Changed:', filters);

    // Check if filters have actually changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(currentFilters);
    if (!filtersChanged) {
      console.log('Filters unchanged, skipping API call');
      return;
    }

    // Prevent multiple API calls if one is already in progress
    if (isFilterApiCallInProgress) {
      console.log('API call already in progress, skipping...');
      return;
    }

    // Rate limiting - prevent calls within 2 seconds of last call
    const now = Date.now();
    if (now - lastFilterCall < 2000) {
      console.log('Rate limiting: too soon since last API call');
      return;
    }

    // Clear any existing timeout
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }

    // Update current filters immediately to prevent duplicate calls
    setCurrentFilters(filters);

    // Set a new timeout to debounce the API call
    const timeout = setTimeout(() => {
      // Double-check if we're still in progress
      if (isFilterApiCallInProgress) {
        console.log('API call still in progress, skipping...');
        return;
      }

      setIsFilterApiCallInProgress(true);
      setLastFilterCall(Date.now());

      let searchData = [];
      // Process filters and convert to the required format
      // If filters are empty {}, still make the API call with empty searchData
      if (Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value.value) {
            searchData.push({ 'FilterName': key, 'FilterValue': value.value });
          }
        });
      }
      // If filters are empty, searchData will remain as empty array []

      console.log('Search Data:', searchData);

      // Update search filters state
      setSearchFilters(filters);

      // Call API with new filters (same as in useEffect)
      gridState.setLoading(true);
      setApiStatus('loading');

      quickOrderService.getQuickOrders({
        filters: searchData
      })
        .then((response: any) => {
          console.log('API Response with filters:', response);

          // Handle paginated response structure - same as in useEffect
          const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
          const data = parsedResponse.ResponseResult;

          if (!data || !Array.isArray(data)) {
            console.warn('API returned invalid data format:', response);
            gridState.setGridData([]);
            gridState.setLoading(false);
            setApiStatus('error');
            setIsFilterApiCallInProgress(false);
            return;
          }

          const processedData = data.map((row: any) => {
            // Helper function for status color (same as in useEffect)
            const getStatusColorLocal = (status: string) => {
              const statusColors: Record<string, string> = {
                'Released': 'badge-fresh-green rounded-2xl',
                'Under Execution': 'badge-purple rounded-2xl',
                'Fresh': 'badge-blue rounded-2xl',
                'Cancelled': 'badge-red rounded-2xl',
                'Deleted': 'badge-red rounded-2xl',
                'Save': 'badge-green rounded-2xl',
                'Under Amendment': 'badge-orange rounded-2xl',
                'Confirmed': 'badge-green rounded-2xl',
                'Initiated': 'badge-blue rounded-2xl',
              };
              return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
            };

            return {
              ...row,
              Status: {
                value: row.Status,
                variant: getStatusColorLocal(row.Status),
              },
            };
          });

          console.log('Processed Data with filters:', processedData);

          gridState.setGridData(processedData);
          gridState.setLoading(false);
          setApiStatus('success');
          setIsFilterApiCallInProgress(false);
        })
        .catch((error: any) => {
          console.error("Quick order fetch with filters failed:", error);
          gridState.setGridData([]);
          gridState.setLoading(false);
          setApiStatus('error');
          setIsFilterApiCallInProgress(false);
        });
    }, 1000); // Increased to 1000ms debounce delay

    setFilterTimeout(timeout);
  };

  const renderSubRow = (row: any, rowIndex: number) => {
    return (
      <DraggableSubRow
        row={row}
        rowIndex={rowIndex}
        columns={gridState.columns}
        subRowColumnOrder={gridState.subRowColumnOrder}
        editingCell={gridState.editingCell}
        onReorderSubRowColumns={gridState.handleReorderSubRowColumns}
        onSubRowEdit={gridState.handleSubRowEdit}
        onSubRowEditStart={gridState.handleSubRowEditStart}
        onSubRowEditCancel={gridState.handleSubRowEditCancel}
      />
    );
  };

  const [isMoreInfoOpen, setMoreInfoOpen] = useState(false);

  return (
    <>
      <AppLayout>
        <div className="min-h-screen main-bg">
          <div className="container-fluid mx-auto p-4 px-6 space-y-6">
            <div className="hidden md:block">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Grid Container */}
            <div className={`rounded-lg mt-4 ${config.visible ? 'pb-4' : ''}`}>
              {/* <SmartGrid
                key={`grid-${gridState.forceUpdate}`}
                parentPage="quickOrder"
                columns={gridState.columns}
                data={gridState.gridData}
                editableColumns={['customerSub']}
                paginationMode="pagination"
                onLinkClick={handleLinkClick}
                onUpdate={handleUpdate}
                onSubRowToggle={gridState.handleSubRowToggle}
                selectedRows={selectedRows}
                onSelectionChange={handleRowSelection}
                rowClassName={(row: any, index: number) =>
                  selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                }
                nestedRowRenderer={renderSubRow}
                configurableButtons={configurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Quick Order"
                recordCount={gridState.gridData.length}
                showCreateButton={true}
                searchPlaceholder="Search"
              /> */}
              {/* {!filtersLoading ? ( */}
              <SmartGridWithGrouping
                key={`grid-${gridState.forceUpdate}`}
                columns={gridState.columns}
                data={gridState.gridData}
                groupableColumns={['OrderType', 'CustomerOrVendor', 'Status', 'Contract']}
                showGroupingDropdown={true}
                editableColumns={['plannedStartEndDateTime']}
                paginationMode="pagination"
                onLinkClick={handleLinkClick}
                onUpdate={handleUpdate}
                onSubRowToggle={gridState.handleSubRowToggle}
                selectedRows={selectedRows}
                onSelectionChange={handleRowSelection}
                onFiltersChange={setCurrentFilters}
                onSearch={handleServerSideSearch}
                onClearAll={clearAllFilters}
                rowClassName={(row: any, index: number) =>
                  selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                }
                nestedRowRenderer={renderSubRow}
                configurableButtons={configurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Quick Order"
                recordCount={gridState.gridData.length}
                showCreateButton={true}
                searchPlaceholder="Search"
                clientSideSearch={true}
                showSubHeaders={false}
                hideAdvancedFilter={true}
                serverFilters={dynamicServerFilters}
                showFilterTypeDropdown={false}
                showServersideFilter={showServersideFilter}
                onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
                gridId="quick-order-management"
                userId="current-user"
                api={filterService}
              />
              {/* {!filtersLoading ? ( */}
              {/* ) : ( */}
              {/* <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                  <div className="text-lg font-semibold text-blue-700">Loading filter options...</div> 
                </div> */}
              {/* )} */}
              {/* SideDrawer for PlanAndActualDetails */}
              <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Plan and Actual Details"
                isBack={false}
                width='85%'
              >
                <PlanAndActualDetails onCloseDrawer={() => setIsDrawerOpen(false)} />
              </SideDrawer>
              {/* Footer with action buttons matching the screenshot style */}
              {/* <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 px-4 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                Cancel
              </Button>
            </div> */}
            </div>


          </div>
          <SideDrawer isOpen={isMoreInfoOpen} onClose={() => setMoreInfoOpen(false)} width="50%" title="Add Files" isBack={false}>
            <div className="">
              <div className="mt-0 text-sm text-gray-600"><BulkUpload /></div>
            </div>
          </SideDrawer>
          <CommonPopup
            open={popupOpen}
            onClose={() => setPopupOpen(false)}
            title={popupTitle}
            titleColor={popupTextColor}
            titleBGColor={popupTitleBgColor}
            icon={<NotebookPen className="w-4 h-4" />}
            fields={fields as any}
            onFieldChange={handleFieldChange}
            onSubmit={() => {
              setPopupOpen(false);
            }}
            submitLabel={popupButtonName}
            submitColor={popupBGColor}
          />
          {/* side draw for group level details on Grid actions */}

          <SideDrawer isOpen={isGroupLevelModalOpen} onClose={() => setGroupLevelModalOpen(false)} width="82%" title="Group Level Details" isBack={false} contentBgColor='#f8f9fc'>
            <div className="p-6 h-full overflow-auto">
              {/* <div className="mb-6"> */}
              <GridResourceDetails data={gridState.gridData} isEditQuickOrder={false} passedQuickUniqueID={quickResourceId} />
              {/* </div> */}
            </div>
          </SideDrawer>
        </div>
      </AppLayout>

      {/* Add a beautiful loading overlay when fetching data from API */}
      {apiStatus === 'loading' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
          <div className="text-lg font-semibold text-blue-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
        </div>
      )}
    </>
  );
};

export default QuickOrderManagement;
