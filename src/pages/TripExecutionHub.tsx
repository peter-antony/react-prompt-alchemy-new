import React, { useState, useEffect } from "react";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { PanelConfig } from "@/types/dynamicPanel";
import { tripService } from "@/api/services";
import { GridColumnConfig, FilterConfig, ServerFilter } from '@/types/smartgrid';
import { Plus, Search, CloudUpload } from 'lucide-react';
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
import { useFooterStore } from '@/stores/footerStore';
import CommonPopup from '@/components/Common/CommonPopup';
import { filterService, quickOrderService } from '@/api/services';
import { SimpleDropDown } from '@/components/Common/SimpleDropDown';
import CardDetails, { CardDetailsItem } from '@/components/Common/GridResourceDetails';
import { Input } from '@/components/ui/input';
import GridResourceDetails from '@/components/Common/GridResourceDetails';
import { SimpleDropDownSelection } from '@/components/Common/SimpleDropDownSelection';
import { dateFormatter } from '@/utils/formatter';
import { format, subDays, subMonths, addMonths } from 'date-fns';
import { defaultSearchCriteria, SearchCriteria } from "@/constants/tripHubSearchCriteria";

export const TripExecutionHub = () => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchData, setSearchData] = useState<Record<string, any>>({});
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const { toast } = useToast();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);



  const breadcrumbItems = [
    { label: "Home", href: "/", active: false },
    { label: "Transport Execution Management", active: true },
    // { label: 'Trip Execution Management', active: false },
  ];

  const initialColumns: GridColumnConfig[] = [
    {
      key: "TripPlanID",
      label: "Trip Plan No",
      type: "Link",
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1
    },
    {
      key: "Status",
      label: "Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 2
    },
    {
      key: "TripBillingStatus",
      label: "Trip Billing Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 3
    },
    {
      key: "CustomerOrderDetails",
      label: "Customer",
      type: "CustomerCountBadge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 4
    },
    {
      key: "From",
      label: "Departure Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 5
    },
    {
      key: "PlannedStartDateandTime",
      label: "Planned Start Date and Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
      order: 6
    },
    {
      key: "ActualdateandtimeStart",
      label: "Actual Start Date and Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
      order: 7
    },
    {
      key: "To",
      label: "Arrival Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 8
    },
    {
      key: "PlannedEndDateandTime",
      label: "Planned End Date and Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: true,
      order: 9
    },
    {
      key: "ActualdateandtimeTo",
      label: "Actual End Date and Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: true,
      order: 10
    },
    {
      key: "DraftBillNo",
      label: "Draft Bill",
      type: "Link",
      sortable: true,
      editable: false,
      subRow: true,
      order: 11
    },
    {
      key: "DraftBillstatus",
      label: "Draft Bill status",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Billingfailedmessage",
      label: "Billing Failed message",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerTransportMode",
      label: "Transport Mode",
      type: "TextCustom",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "EstimatedCost",
      label: "Estimated Cost",
      type: "CurrencyWithSymbol",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Currency",
      label: "Currency",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SupplierRefno",
      label: "Supplier Ref no",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerService",
      label: "Service",
      type: "TextCustom",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerSubService",
      label: "Sub Service",
      type: "TextCustom",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CancellationRequestedDateandTime",
      label: "Cancellation date and time",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CancellationReasonDescription",
      label: "Cancellation Reason",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "InvoiceNo",
      label: "Invoice No",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Invoicestatus",
      label: "Invoice Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "WagonGroup",
      label: "Wagon Group",
      type: "CustomerCountBadge",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ContainerGroup",
      label: "Container Group",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ReturnTrip",
      label: "Return Trip",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Incidents",
      label: "Incident ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "IncidentStatus",
      label: "Incident Status",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "TripType",
      label: "Trip Type",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "VendorContractNo",
      label: "Vendor Contract No",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "VendorWBS",
      label: "Vendor WBS",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "WorkOrderNo",
      label: "Work Order No",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "WorkOrderStatus",
      label: "Work Order Status",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Remark",
      label: "Remarks",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Cluster",
      label: "Cluster",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "TrainID",
      label: "Train ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerOrders",
      label: "Customer Order",
      type: "TextCustom",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "DraftbilTotalAmount",
      label: "Draft Bill Total Amount",
      type: "CurrencyWithSymbol",
      sortable: true,
      editable: false,
      subRow: true,
    },

  ];

  // Initialize columns and data
  useEffect(() => {
    gridState.setColumns(initialColumns);
    gridState.setLoading(true); // Set loading state
    setApiStatus('loading');

    let isMounted = true;
    const defaultsTo: any = {
      PlannedExecutionDate: {
        value: {
          from: format(subMonths(new Date(), 2), "yyyy-MM-dd"), // 2 months back
        to: format(addMonths(new Date(), 1), "yyyy-MM-dd"),   // 1 month ahead
        }
      }
    }

    const ResultSearchCriteria = buildSearchCriteria(defaultsTo);
    console.log('ResultSearchCriteria: ', ResultSearchCriteria);
    tripService.getTrips({ searchCriteria: ResultSearchCriteria })
      .then((response: any) => {
        if (!isMounted) return;

        console.log('API Response:', response); // Debug log

        // Handle paginated response structure
        const parsedResponse = JSON.parse(response?.data.ResponseData || {});
        const data = parsedResponse;

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
              // Status column colors
              'Released': 'badge-fresh-green rounded-2xl',
              'Executed': 'badge-purple rounded-2xl',
              'Fresh': 'badge-blue rounded-2xl',
              'Cancelled': 'badge-red rounded-2xl',
              'Deleted': 'badge-red rounded-2xl',
              'Save': 'badge-green rounded-2xl',
              'Under Amendment': 'badge-orange rounded-2xl',
              'Confirmed': 'badge-green rounded-2xl',
              'Initiated': 'badge-blue rounded-2xl',
              'Under Execution': 'badge-purple rounded-2xl',
              // Trip Billing Status colors
              'Draft Bill Raised': 'badge-orange rounded-2xl',
              'Not Eligible': 'badge-red rounded-2xl',
              'Revenue leakage': 'badge-red rounded-2xl',
              'Invoice Created': 'badge-blue rounded-2xl',
              'Invoice Approved': 'badge-fresh-green rounded-2xl'
            };
            return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
          };

          return {
            ...row,
            Status: {
              value: row.Status,
              variant: getStatusColorLocal(row.Status),
            },
            TripBillingStatus: {
              value: row.TripBillingStatus,
              variant: getStatusColorLocal(row.TripBillingStatus),
            },
            // Add customer data for API data as well
            // customerData: [
            //   { name: "DB Cargo", id: "CUS00000123" },
            //   { name: "ABC Rail Goods", id: "CUS00003214" },
            //   { name: "Wave Cargo", id: "CUS00012345" },
            //   { name: "Express Logistics", id: "CUS00004567" },
            //   { name: "Global Freight", id: "CUS00007890" }
            // ].slice(0, parseInt(row.customer?.replace('+', '') || '3')),
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
        console.error("Trip fetch failed:", error);
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

  useEffect(() => {
    setFooter({
      visible: true,
      pageName: 'Trip_Execution',
      leftButtons: [
        {
          label: "CIM/CUV Report",
          onClick: () => console.log("CIM/CUV Report"),
          type: "Icon",
          iconName: 'BookText'
        },
        {
          label: "Dropdown Menu",
          onClick: () => console.log("Menu"),
          type: "Icon",
          iconName: 'EllipsisVertical'
        },
      ],
      rightButtons: [
        {
          label: "Cancel",
          onClick: () => {
            console.log("Cancel clicked");
          },
          type: 'Button',
          disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
        },
      ],
    });
    return () => resetFooter();
  }, [setFooter, resetFooter, selectedRows]);

  // Navigate to the create new quick order page
  const navigate = useNavigate();

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    if(columnKey === 'TripPlanID') {
      navigate(`/create-trip?id=${value.TripPlanID}`);
    }
  };

  const handleUpdate = async (updatedRow: any) => {
    console.log("Updating row:", updatedRow);
    gridState.setGridData((prev) =>
      prev.map((row, index) =>
        index === updatedRow.index ? { ...row, ...updatedRow } : row
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    toast({
      title: "Success",
      description: "Trip plan updated successfully",
    });
  };

  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    setSelectedRows(selectedRowIndices);
  };

  const handleSearchDataChange = (data: Record<string, any>) => {
    setSearchData(data);
    console.log("Search data changed:", data);
  };

  const handleSearch = () => {
    console.log("Searching with filters:", searchData);
    toast({
      title: "Search",
      description: "Search functionality would be implemented here",
    });
  };

  const handleClear = () => {
    setSearchData({});
    toast({
      title: "Cleared",
      description: "Search filters have been cleared",
    });
  };

  // Move function declarations before they are used
  const handleCreateTrip = () => {
    console.log("Creating new trip");
    toast({
      title: "Create Trip",
      description: "Create trip functionality would be implemented here",
    });
  };

  const handleBulkUpload = () => {
    console.log("Bulk upload");
    toast({
      title: "Bulk Upload",
      description: "Bulk upload functionality would be implemented here",
    });
  };

  // Configure the Create Trip button for the grid toolbar
  const gridConfigurableButtons: ConfigurableButtonConfig[] = [
    {
      label: " Create Trip",
      tooltipTitle: "Create a new trip or upload in bulk",
      showDropdown: true,
      tooltipPosition: "top" as const,
      onClick: () => {
        console.log('nav create-trip');
        // No redirection here right now.
        // navigate('/create-trip');
      },
      dropdownItems: [
        {
          label: "Create Trip",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            // No redirection here right now.
            // navigate('/create-trip');
          },
        },
        {
          label: "Bulk Upload",
          icon: <CloudUpload className="h-4 w-4" />,
          onClick: handleBulkUpload,
        },
      ],
    },
  ];

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

  const buildSearchCriteria: any = (latestFilters: any) => {
    const criteria: SearchCriteria = { ...defaultSearchCriteria };
    if (Object.keys(latestFilters).length > 0) {
      Object.entries(latestFilters).forEach(([key, value]): any => {
        const filter: any = value; // 👈 cast to any
        if (key === "PlannedExecutionDate") {
          criteria.PlannedExecutionDateFrom = filter?.value?.from.replace(/-/g, "/");
          criteria.PlannedExecutionDateTo = filter?.value?.to.replace(/-/g, "/");
        } else {
          // all other keys map directly
          criteria[key] = filter.value;
        }
      });
      return criteria;
    }
  }

  const handleServerSideSearch = async () => {
    // // console.log("Server-side search with filters:", filterService.applyGridFiltersSet());
    let latestFilters = filterService.applyGridFiltersSet();
    // if (Object.keys(latestFilters).length == 0) {
    //   return;
    // }
    console.log('LatestFilters Trip log: ', latestFilters);
    console.log('buildSearchCriteria: ', buildSearchCriteria(latestFilters));
    const plannedDate = latestFilters["PlannedExecutionDate"];
    if (!plannedDate?.value?.from || !plannedDate?.value?.to) {
      toast({
        title: "Planned Execution Date Range",
        description: "Please select a Planned Execution Date before searching.",
        variant: "destructive", // 👈 makes it red/error style
      });
      return;
    }

    const finalSearchCriteria = buildSearchCriteria(latestFilters);

    try {
      gridState.setLoading(true);
      setApiStatus('loading');

      const response: any = await tripService.getTrips({
        searchCriteria: finalSearchCriteria
      });

      console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse;

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
            'Executed': 'badge-purple rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Deleted': 'badge-red rounded-2xl',
            'Save': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Confirmed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
            "Revenue leakage": 'badge-red rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'Draft Bill Raised': 'badge-orange rounded-2xl',
            'Not Eligible': 'badge-red rounded-2xl',
            'Invoice Created': 'badge-blue rounded-2xl',
            'Invoice Approved': 'badge-fresh-green rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
        };

        return {
          ...row,
          Status: {
            value: row.Status,
            variant: getStatusColorLocal(row.Status),
          },
          TripBillingStatus: {
            value: row.TripBillingStatus,
            variant: getStatusColorLocal(row.TripBillingStatus),
          },
          // QuickOrderDate: dateFormatter(row.QuickOrderDate)
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

  // utils/fetchOptionsHelper.ts
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

  const dynamicServerFilters: ServerFilter[] = [
    {
      key: 'CustomerID',
      label: 'Customer',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Customer Init"),
      multiSelect: true
    },
    {
      key: "PlannedExecutionDate", label: "Planned Execution Date", type: 'dateRange',
      defaultValue: {
        // from: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
        // to: format(new Date(), 'yyyy-MM-dd')
        from: format(subMonths(new Date(), 2), "yyyy-MM-dd"), // 2 months back
        to: format(addMonths(new Date(), 1), "yyyy-MM-dd"),   // 1 month ahead
      }
    },
    {
      key: 'Departurepoint', label: 'Departure Point', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Departure Init")
    },
    {
      key: 'ArrivalPoint', label: 'Arrival Point', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Arrival Init")
    },
    {
      key: 'Supplier', label: 'Supplier', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Supplier Init")
    },
    {
      key: 'ServiceType', label: 'Service', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Service type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'Cluster', label: 'Cluster', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Cluster Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'LoadType', label: 'Trip Load Type', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Load type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'WagonID', label: 'Wagon ID', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Wagon id Init")
    },
    { key: 'TripId', label: 'Trip No.', type: 'text' },
    { key: 'CustomerOrderNumber', label: 'Customer Order', type: 'text' },
    {
      key: 'TripStatus', label: 'Trip Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Trip status Init"),
      multiSelect: true,
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'TripBillingStatus', label: 'Trip Billing Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Trip Billing Status Init"),
      multiSelect: true,
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'UserID', label: 'User', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Createdby Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'SupplierContract', label: 'Supplier Contract', type: 'lazyselect',
      // Pass OrderType: 'SELL' when fetching Supplier Contract options
      fetchOptions: makeLazyFetcher("Contract Init", { OrderType: 'BUY' })
    },
    {
      key: 'ScheduleID', label: 'Schedule ID', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Schedule ID Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'CustomerContract', label: 'Customer Contract', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Contract Init", { OrderType: 'SELL' })
    },
    {
      key: 'LegFrom', label: 'Leg From', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Leg From Init")
    },
    {
      key: 'LegTo', label: 'Leg To', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Leg To Init")
    },
    {
      key: 'ExecutiveCarrierID', label: 'Executive Carrier', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Executive Carrier Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    { key: 'TrainID', label: 'Train No.', type: 'text' },
    {
      key: 'SubServiceType', label: 'Sub Service Type', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Sub Service type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'WBS', label: 'WBS', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("WBS Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    { key: 'PathNo', label: 'Path No.', type: 'text' },
    {
      key: 'ContainerID', label: 'Container No.', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Container ID Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'RoundTrip', label: 'Round Trip', type: 'select',
      options: [
        { id: 'One Way', name: 'One Way', default: "N", description: "", seqNo: 1 },
        { id: 'Round Trip', name: 'Round Trip', default: "N", description: "", seqNo: 2 },
      ]
    },
    {
      key: 'TripType', label: 'Trip Type', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Trip Type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: 'CustomerRefNo', label: 'Customer Ref. No.', type: 'text' },
    {
      key: 'RefDocType', label: 'Ref. Doc. Type', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Ref Doc Type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: 'RefDocNo', label: 'Ref. Doc. No.', type: 'text' },
    { key: 'IncidentID', label: 'Incident No.', type: 'text' },
    {
      key: 'IncidentStatus', label: 'Incident status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Incident status Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'TransportMode', label: 'Transport Mode', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Transport Mode Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: 'ReturnTripID', label: 'Return Trip ID', type: 'text' },
    {
      key: 'CancellationReason', label: 'Cancellation Reason', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Cancellation Reason Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'WorkshopStatus', label: 'Workshop Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Workshop Status Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'VendorFeedback', label: 'Vendor Feedback', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Vendor Feedback Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'VendorFeedbackReason', label: 'Vendor Feedback Reason', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Vendor Feedback Reason Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'WagonGroup', label: 'Wagon Group', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Wagon Group Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'ContainerGroup', label: 'Container Group', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Container Group Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'Via', label: 'VIA', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("VIA Init")
    },
    {
      key: 'DocumentType', label: 'Document Type', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Document Type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: 'Document', label: 'Document', type: 'text' },
    { key: 'CustomerSenderRefNo', label: 'Customer Sender Ref no', type: 'text' },
    {
      key: 'VehicleID', label: 'Vehicle', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Vehicle Init")
    },
    {
      key: 'DriverID', label: 'Driver', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Driver Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'CarrierID', label: 'Carrier', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Carrier Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },

    // { key: 'QuickUniqueID', label: 'Quick Unique ID', type: 'text' },
    // { key: 'QuickOrderNo', label: 'Quick Order No', type: 'text' },
    // { key: 'FromOrderDate', label: 'Quick Order Date', type: 'dateRange' },
    // { key: 'CreatedFromDate', label: 'Created From Date', type: 'text' },
    // { key: 'CreatedToDate', label: 'Created To Date', type: 'text' }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

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
              {/* <SmartGridWithGrouping
                key={`grid-${gridState.forceUpdate}`}
                columns={gridState.columns}
                data={gridState.gridData}
                groupableColumns={['id', 'status', 'tripBillingStatus', 'departurePoint', 'arrivalPoint']}
                showGroupingDropdown={true}
                editableColumns={['plannedStartEndDateTime']}
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
                configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Trip Plans"
                recordCount={gridState.gridData.length}
                showCreateButton={true}
                searchPlaceholder="Search"
                clientSideSearch={true}
                extraFilters={[
                  {
                    key: 'priority',
                    label: 'Priority Level',
                    type: 'select',
                    options: ['High Priority', 'Medium Priority', 'Low Priority']
                  }
                ]}
                showSubHeaders={false}
              /> */}
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
                // onFiltersChange={setCurrentFilters}
                onSearch={handleServerSideSearch}
                onClearAll={clearAllFilters}
                rowClassName={(row: any, index: number) =>
                  selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                }
                nestedRowRenderer={renderSubRow}
                configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Trip Plans"
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
                gridId="trip-hub"
                userId="current-user"
                api={filterService}
              />
            </div>
          </div>
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

      {/* <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 space-y-6">
          
          <div className="bg-white rounded-lg shadow-sm">
            <style>{`
            .smart-grid-row-selected {
              background-color: #eff6ff !important;
              border-left: 4px solid #3b82f6 !important;
            }
            .smart-grid-row-selected:hover {
              background-color: #dbeafe !important;
            }
          `}</style>
            <SmartGrid
              key={`grid-${gridState.forceUpdate}`}
              columns={gridState.columns}
              data={
                gridState.gridData.length > 0
                  ? gridState.gridData
                  : processedData
              }
              paginationMode="pagination"
              onLinkClick={handleLinkClick}
              onUpdate={handleUpdate}
              onSubRowToggle={gridState.handleSubRowToggle}
              selectedRows={selectedRows}
              onSelectionChange={handleRowSelection}
              rowClassName={(row: any, index: number) =>
                selectedRows.has(index) ? "smart-grid-row-selected" : ""
              }
              nestedRowRenderer={renderSubRow}
              configurableButtons={gridConfigurableButtons}
              showDefaultConfigurableButton={false}
              gridTitle="Trip Plans"
              recordCount={
                gridState.gridData.length > 0
                  ? gridState.gridData.length
                  : processedData.length
              }
            />
          </div>
        </div>
      </div> */}
    </>
  );
};
