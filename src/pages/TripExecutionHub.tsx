import React, { useState, useEffect, useMemo } from "react";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { tripService } from "@/api/services";
import { GridColumnConfig, FilterConfig, ServerFilter } from '@/types/smartgrid';
import { Plus, Search, CloudUpload, NotebookPen, X, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from '../components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFooterStore } from '@/stores/footerStore';
import { filterService, quickOrderService } from '@/api/services';
import { format, subDays, subMonths, addMonths } from 'date-fns';
import { defaultSearchCriteria, SearchCriteria } from "@/constants/tripHubSearchCriteria";
import TripBulkCancelModal from "@/components/ManageTrip/TripBulkCancelModal";
import TripPlanActionModal from "@/components/ManageTrip/TripPlanActionModal";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui/button";
import { tripPlanningService } from "@/api/services/tripPlanningService";

export const TripExecutionHub = () => {
  const [searchParams] = useSearchParams();
  const createTripPlan = searchParams.get('createTripPlan');
  
  const gridId = "trip-hub"; // same id you pass to SmartGridWithGrouping
  const { activeFilters, setActiveFilters } = useFilterStore();
  const filtersForThisGrid = activeFilters[gridId] || {};
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [searchData, setSearchData] = useState<Record<string, any>>({});
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const { toast } = useToast();
  const { config, setFooter, resetFooter } = useFooterStore();

  // Handle createTripPlan parameter
  // useEffect(() => {
  //   if (createTripPlan === 'true') {
  //     toast({
  //       title: "Create Trip Plan Mode",
  //       description: "You are now in trip plan creation mode. Use the available options to create a new trip plan.",
  //       variant: "default",
  //     });
  //   }
  // }, [createTripPlan, toast]);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('Cancel Trip');
  const [popupButtonName, setPopupButtonName] = useState('Cancel');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  
  // New modal states for createTripPlan actions
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<'cancel' | 'amend'>('cancel');
  const [tripNo, setTripNo] = useState<string>('');
  const [fields, setFields] = useState([
    {
      type: "date",
      label: "Requested Date and Time",
      name: "date",
      placeholder: "Select Requested Date and Time",
      value: "",
      required: true,
      mappedName: 'Canceldatetime'
    },
    {
      type: "select",
      label: "Reason Code and Description",
      name: "ReasonCode",
      placeholder: "Enter Reason Code and Description",
      options: [],
      value: "",
      required: true,
      mappedName: 'ReasonCode'
    },
    {
      type: "text",
      label: "Remarks",
      name: "remarks",
      placeholder: "Enter Remarks",
      value: "",
      mappedName: 'Remarks'
    },
  ]);
  console.log('filtersForThisGrid: ', filtersForThisGrid);
  const handleFieldChange = (name, value) => {
    console.log('Field changed:', name, value);
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const handleTripsCancelSubmit = async (formFields: any) => {
    console.log(formFields);
    let mappedObj = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for API:', mappedObj);
    console.log('rowTripId --------------- ', rowTripId);
    let tripPayload = [];
    rowTripId.forEach((tripId: any, index) => {
      tripPayload.push({
        'TripID': tripId,
        'UniqueID': tripId,
        ...mappedObj
      })
    });
    console.log('tripPayload', tripPayload);
    if (tripPayload.length > 0) {
      try {
        gridState.setLoading(true);
        setApiStatus('loading');

        const response: any = await tripService.bulkCancelTrip(tripPayload);

        console.log('Server-side Search API Response:', response);

        const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
        const data = parsedResponse;
        setApiStatus('success');
        setPopupOpen(false);

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
        const successCount = data.filter(item => item.Status === "SUCCESS").length;
        const failCount = data.filter(item => item.Status === "FAILED").length;
        if (successCount > 0 || failCount > 0) {
          const descriptionParts: string[] = [];
          if (successCount > 0) {
            descriptionParts.push(`${successCount} trip${successCount > 1 ? "s" : ""} cancelled successfully`);
          }
          if (failCount > 0) {
            descriptionParts.push(`${failCount} trip${failCount > 1 ? "s" : ""} already cancelled`);
          }
          toast({
            title: "Trip Cancellation Summary",
            description: descriptionParts.join(" • "), // join with a separator
            variant: failCount > 0 ? "destructive" : "default", // red if any failure, green otherwise
            duration: 5000,
          });
        }

        // ✅ 1. Clear selected rows
        setSelectedRows(new Set());
        setSelectedRowIds(new Set());
        setSelectedRowObjects([]);
        setRowTripId([]);

        // ✅ 2. Re-fetch grid data fresh
        await fetchTripsAgain();
        // toast({
        //   title: "Success",
        //   description: `Found ${processedData.length} orders`,
        // });

      } catch (error) {
        console.error('Server-side search failed:', error);
        setApiStatus('error');
        toast({
          title: "Error",
          description: "Failed to search orders. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/", active: false },
    { label: createTripPlan === 'true' ? "Manage Trip Plan" : 'Transport Execution', active: true },
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
      key: "DeparturePointDescription",
      label: "Departure Point",
      type: "TextPipedData",
      sortable: true,
      editable: false,
      subRow: false,
      order: 5
    },
    {
      key: "ArrivalPointDescription",
      label: "Arrival Point",
      type: "TextPipedData",
      sortable: true,
      editable: false,
      subRow: false,
      order: 6
    },
    {
      key: "PlannedStartDateandTime",
      label: "Planned Start Date and Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
      order: 7
    },
    {
      key: "DraftBillNo",
      label: "Draft Bill",
      type: "Link",
      sortable: true,
      editable: false,
      subRow: false,
      order: 8
    },
    {
      key: "ActualdateandtimeStart",
      label: "Actual Start Date and Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: true,
      order: 9
    },
    {
      key: "PlannedEndDateandTime",
      label: "Planned End Date and Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: true,
      order: 10
    },
    {
      key: "ActualdateandtimeTo",
      label: "Actual End Date and Time",
      type: "DateTimeRange",
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
      key: "Invoiceno",
      label: "Invoice No",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "InvoiceStatusDescription",
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
      key: "IncidentDetails",
      label: "Incident Details",
      type: "CustomerCountBadge",
      sortable: true,
      editable: false,
      subRow: true,
    },
    // {
    //   key: "IncidentStatus",
    //   label: "Incident Status",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: true,
    // },
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
      key: "WorkOrderDetails",
      label: "Work Order Details",
      type: "CustomerCountBadge",
      sortable: true,
      editable: false,
      subRow: true,
    },
    // {
    //   key: "WorkOrderStatus",
    //   label: "Work Order Status",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: true,
    // },
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

  const fetchTripsAgain = async () => {
    gridState.setColumns(initialColumns);
    gridState.setLoading(true);
    setApiStatus("loading");

    try {
      let searchCriteria;
      if (Object.keys(filtersForThisGrid).length > 0) {
        // ✅ Build criteria from store filters
        searchCriteria = buildSearchCriteria(filtersForThisGrid);
      } else {
        // ✅ Fallback defaults
        searchCriteria = buildSearchCriteria({
          PlannedExecutionDate: {
            value: {
              from: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
              to: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
            }
          }
        });
      }

      // const ResultSearchCriteria = buildSearchCriteria(defaultsTo);
      const response: any = await tripService.getTrips({ searchCriteria });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse;

      if (!data || !Array.isArray(data)) {
        gridState.setGridData([]);
        setApiStatus("error");
        return;
      }

      const processedData = data.map((row: any) => {
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
            'Invoice Approved': 'badge-fresh-green rounded-2xl',
            'Draft': 'badge-blue rounded-2xl'
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
        }
      });

      gridState.setGridData(processedData);
      setApiStatus("success");
    } catch (error) {
      console.error("Fetch trips failed:", error);
      gridState.setGridData([]);
      setApiStatus("error");
    } finally {
      gridState.setLoading(false);
    }
  };

  // Initialize columns and data
  useEffect(() => {
    fetchTripsAgain();
  }, []); // Add dependencies if needed

  // Initialize columns and processed data in the grid state
  // useEffect(() => {
  //   console.log('Initializing columns and data in GridDemo');
  //   gridState.setColumns(initialColumns);
  //   gridState.setGridData(processedData);
  // }, [processedData]);
  const processedData = useMemo(() => {
    return gridState.gridData.map(row => ({
      ...row,
      status: {
        value: row.status,
        // variant: getStatusColor(row.status)
      },
      tripBillingStatus: {
        value: row.tripBillingStatus,
        // variant: getStatusColor(row.tripBillingStatus)
      }
    }));
  }, []);

  // Update selected row indices based on current page data to maintain selection state
  useEffect(() => {
    const currentData = gridState.gridData.length > 0 ? gridState.gridData : processedData;
    const newSelectedIndices = new Set<number>();

    // Find indices of currently selected row IDs in the current page data
    currentData.forEach((row: any, index: number) => {
      if (selectedRowIds.has(row.TripPlanID)) {
        newSelectedIndices.add(index);
      }
    });

    // Only update if there's a difference to avoid infinite loops
    // Also prevent updates that might trigger unwanted side effects
    if (newSelectedIndices.size !== selectedRows.size ||
      !Array.from(newSelectedIndices).every(index => selectedRows.has(index))) {
      console.log('Updating selected row indices without affecting pagination');
      setSelectedRows(newSelectedIndices);
    }
  }, [gridState.gridData, processedData, selectedRowIds]);

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
      rightButtons: createTripPlan === 'true' ? [
        {
          label: "Cancel",
          onClick: () => {
            console.log("Cancel clicked");
            setCurrentActionType('cancel');
            setCancelModalOpen(true);
          },
          type: 'Button',
          disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
        },
        {
          label: "Confirm",
          onClick: () => {
            console.log("Confirm clicked");
            confirmTripPlanning();
          },
          type: 'Button',
          disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
        },
        {
          label: "Release",
          onClick: () => {
            console.log("Release clicked");
            releseTripPlanning();
          },
          type: 'Button',
          disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
        },
        {
          label: "Amend",
          onClick: () => {
            console.log("Amend clicked");
            setCurrentActionType('amend');
            setAmendModalOpen(true);
          },
          type: 'Button',
          disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
        },
      ] : [
        {
          label: "Cancel",
          onClick: () => {
            console.log("Cancel clicked");
            setPopupOpen(true);
          },
          type: 'Button',
          disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
        },
      ],
    });
    return () => resetFooter();
  }, [setFooter, resetFooter, selectedRows, createTripPlan]);

  // Navigate to the create new quick order page
  const navigate = useNavigate();

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    console.log("createTripPlan: ", createTripPlan);
    if (columnKey === 'TripPlanID' && createTripPlan !== 'true') {
      navigate(`/manage-trip?id=${value.TripPlanID}`);
    }else{
      navigate(`/trip-planning?manage=true&tripId=${value.TripPlanID}`);
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
    console.log('Selected rows changed via checkbox:', selectedRowIndices);
    setSelectedRows(selectedRowIndices);
    // Update selected row objects and IDs using unique row identification

    const currentData = gridState.gridData.length > 0 ? gridState.gridData : [];
    const selectedObjects = Array.from(selectedRowIndices)
      .map(index => currentData[index])
      .filter(Boolean);

    // Create a new Set of unique row IDs
    const newSelectedRowIds = new Set(selectedObjects.map(row => row.TripPlanID));

    // Update selected row objects to ensure uniqueness by ID
    const uniqueSelectedObjects = selectedObjects.filter((row, index, self) =>
      self.findIndex(r => r.id === row.TripPlanID) === index
    );

    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(uniqueSelectedObjects);
    console.log('Selected row objects:', uniqueSelectedObjects);
    console.log('Selected row IDs:', Array.from(newSelectedRowIds));
  };

  const [rowTripId, setRowTripId] = useState<any>([]);
  const handleRowClick = (row: any, index: number) => {
    console.log('Row clicked:', row, index);

    // Toggle row selection
    const newSelectedRows = new Set(selectedRows);
    // if (newSelectedRows.has(index)) {
    const newSelectedRowIds = new Set(selectedRowIds);
    const newSelectedRowObjects = [...selectedRowObjects];

    // Check if this row is already selected by ID (not index)
    const isRowSelected = newSelectedRowIds.has(row.TripPlanID);

    if (isRowSelected) {
      // Remove row: remove from all tracking sets/arrays
      newSelectedRows.delete(index);
      newSelectedRowIds.delete(row.TripPlanID);
      const objectIndex = newSelectedRowObjects.findIndex(obj => obj.TripPlanID === row.TripPlanID);
      if (objectIndex > -1) {
        newSelectedRowObjects.splice(objectIndex, 1);
      }
      console.log('Removed row:', row.TripPlanID);
    }
    else {
      // Add row: add to all tracking sets/arrays (ensure uniqueness)
      newSelectedRows.add(index);
      newSelectedRowIds.add(row.TripPlanID);
      // Only add if not already in objects array (double-check uniqueness)
      if (!newSelectedRowObjects.some(obj => obj.TripPlanID === row.TripPlanID)) {
        newSelectedRowObjects.push(row);
      }
      console.log('Added row:', row.TripPlanID);
    }

    // Update all state
    setSelectedRows(newSelectedRows);
    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(newSelectedRowObjects);

    // Update selected row objects
    // const currentData = gridState.gridData.length > 0 ? gridState.gridData : [];
    // const selectedObjects = Array.from(newSelectedRows).map(idx => currentData[idx]).filter(Boolean);
    // setSelectedRowObjects(selectedObjects);
    // console.log('Selected row objects after click:', selectedObjects);
    console.log('Selected row objects after click:', newSelectedRowObjects);
    setRowTripId(Array.from(newSelectedRowIds));
    console.log('new set: ', Array.from(newSelectedRowIds)); // ✅ log directly
    console.log('Selected row IDs after click:', Array.from(newSelectedRowIds));

    // if(createTripPlan === 'true') {
    //   getTripDataByID(newSelectedRowObjects?.[0].TripPlanID);
    // }
  };

  // const getTripDataByID = async (tripID: string) => {
  //   const response: any = await tripPlanningService.getTripDataByID(tripID);
  //   console.log("response ===", JSON.parse(response?.data?.ResponseData || "{}"));
  //   const data = JSON.parse(response?.data?.ResponseData || "{}");
  //   const tripNoFromAPI = data?.Header?.TripNo;
  //   console.log("data ===", tripNoFromAPI);
  //   setTripNo(tripNoFromAPI);
    
  //   // Also update the selected row objects with the TripNo if available
  //   if (tripNoFromAPI && selectedRowObjects?.[0]) {
  //     const updatedSelectedRowObjects = [...selectedRowObjects];
  //     updatedSelectedRowObjects[0] = {
  //       ...updatedSelectedRowObjects[0],
  //       TripNo: tripNoFromAPI
  //     };
  //     setSelectedRowObjects(updatedSelectedRowObjects);
  //     console.log("Updated selectedRowObjects with TripNo:", updatedSelectedRowObjects);
  //   }
    
  //   return tripNoFromAPI;
  // }

  useEffect(() => {
    console.log("rowTripId updated:", rowTripId);
  }, [rowTripId]);

  // Debug useEffect to track tripNo changes
  useEffect(() => {
    console.log("🔍 tripNo updated:", tripNo);
  }, [tripNo]);

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
      showDropdown: false,
      tooltipPosition: "top" as const,
      onClick: () => {
        console.log('nav manage-trip');
        // No redirection here right now.
        navigate('/trip-planning');
      },
      // dropdownItems: [
      //   {
      //     label: "Create Trip",
      //     icon: <Plus className="h-4 w-4" />,
      //     onClick: () => {
      //       // No redirection here right now.
      //       navigate('/trip-planning');
      //     },
      //   },
      //   {
      //     label: "Bulk Upload",
      //     icon: <CloudUpload className="h-4 w-4" />,
      //     onClick: handleBulkUpload,
      //   },
      // ],
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
    // Set ScreenName based on createTripPlan parameter
    criteria.ScreenName = createTripPlan === 'true' ? 'ManageTripPlan' : 'TripExecution';
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
    return criteria;
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
            'Invoice Approved': 'badge-fresh-green rounded-2xl',
            'Draft': 'badge-blue rounded-2xl'
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
      fetchOptions: makeLazyFetcher("Equipment ID Init", { EquipmentType: 'Wagon' })
    },
    { key: 'TripId', label: 'Trip No.', type: 'text' },
    { key: 'CustomerOrderNumber', label: 'Customer Order', type: 'text' },
    {
      key: 'TripStatus', label: 'Trip Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Trip status Init", { ScreenName: createTripPlan === 'true' ? 'ManageTripPlan' : 'TripExecution' }),
      ...(createTripPlan === 'true' ? { defaultValue: ['CF', 'DR', 'RL'] } : {}),
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
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'SupplierContract', label: 'Supplier Contract', type: 'lazyselect',
      // Pass OrderType: 'SELL' when fetching Supplier Contract options
      fetchOptions: makeLazyFetcher("Contract Init", { OrderType: 'BUY' })
    },
    {
      key: 'ScheduleID', label: 'Schedule ID', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Schedule ID Init"),
      // hideSearch: true,
      // disableLazyLoading: true
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
      fetchOptions: makeLazyFetcher("Equipment ID Init", { EquipmentType: 'Container' }),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'RoundTrip', label: 'Round Trip', type: 'select',
      options: [
        { id: 'One Way', name: 'One Way', default: "N", description: "", seqNo: 1 },
        { id: 'Round Trip', name: 'Round Trip', default: "N", description: "", seqNo: 2 },
      ] as any[],
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
      fetchOptions: makeLazyFetcher("Work order status"),
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

  const confirmTripPlanning = async () => {
    console.log("confirmTripPlanning ===", selectedRowObjects);
    console.log("confirmTripPlanning ===", tripNo);
    const messageType = "Manage Trip Plan - Confirm Trip";
    
    // Get TripNo from selected row data or state
    // let currentTripNo = selectedRowObjects?.[0]?.TripNo || tripNo;
    // console.log("Using TripNo:", currentTripNo);
    
    // // If TripNo is not available, try to get it from the API
    // if (!currentTripNo && selectedRowObjects?.[0]?.TripPlanID) {
    //   console.log("TripNo not available, fetching from API...");
    //   try {
    //     currentTripNo = await getTripDataByID(selectedRowObjects[0].TripPlanID);
    //     console.log("Fetched TripNo from API:", currentTripNo);
    //   } catch (error) {
    //     console.error("Error fetching TripNo:", error);
    //   }
    // }
        
    
      let Header = {
        "TripNo": selectedRowObjects?.[0]?.TripPlanID,
        // "TripOU": selectedRowObjects[0].TripOU,
        // "TripStatus": selectedRowObjects[0].TripStatus,
        // "TripStatusDescription": selectedRowObjects[0].TripStatusDescription,
        // "Modeflag": "Nochange",
        "Cancellation": null,
        "ShortClose": null,
        "Amendment": null
      }
    
    console.log("Payload:", Header);
    
    try{
      const response = await tripPlanningService.confirmTripPlanning({Header, messageType});
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "✅ Trip Confirmed",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Trip Confirmation Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    }    
  }
  const releseTripPlanning = async () => {
    console.log("releaseTripPlanning ===");
    const messageType = "Manage Trip Plan - Release Trip";
    let Header = {
        "TripNo": selectedRowObjects?.[0]?.TripPlanID,
        "Cancellation": null,
        "ShortClose": null,
        "Amendment": null
      
    }
    console.log("Payload:", Header);
    try{
      const response = await tripPlanningService.confirmTripPlanning({Header, messageType});
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "✅ Trip Released",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Trip Release Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    } 
  }

  // New submit handlers for createTripPlan actions
  const handleCancelTripPlanSubmit = async (formFields: any) => {
    console.log("Cancel Trip Plan Submit:", formFields);
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for Cancel API:', mappedObj);
    const messageType = "Manage Trip Plan - cancel Trip";

    let Header = {
      "TripNo": selectedRowObjects?.[0]?.TripPlanID,
      "Cancellation": {
        "CancellationRequestedDateTime": mappedObj.RequestedDateTime || "",
        "CancellationReasonCode": mappedObj.ReasonCode || "",
        "CancellationReasonCodeDescription": mappedObj.ReasonDescription || "",
        "CancellationRemarks": mappedObj.Remarks || ""
      },
      "ShortClose": null,
      "Amendment": null
    }
    console.log("Payload:", Header);
    try{
      const response = await tripPlanningService.confirmTripPlanning({Header, messageType});
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "✅ Trip Cancelled",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Trip Cancellation Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    }    
  };

  const handleAmendTripPlanSubmit = async (formFields: any) => {
    console.log("Amend Trip Plan Submit:", formFields);
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for Amend API:', mappedObj);
    const messageType = "Manage Trip Plan - Amend Trip";
    // Create payload for amend action
    const Header = {
      "TripNo": selectedRowObjects?.[0]?.TripPlanID,
      "Cancellation": null,
      "ShortClose": null,
      "Amendment": {
        "AmendmentRequestedDateTime": mappedObj.RequestedDateTime || "",
        "AmendmentReasonCode": mappedObj.ReasonCode || "",
        "AmendmentReasonCodeDescription": mappedObj.ReasonDescription || "",
        "AmendmentRemarks": mappedObj.Remarks || ""
      }
    };
    console.log('Amend Payload:', Header);
    try{
      const response = await tripPlanningService.confirmTripPlanning({Header, messageType});
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "✅ Trip Amended",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Trip Amendment Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    } 
  };

  const amendTripPlanning = async () => {
    console.log("amendTripPlanning ===");
    const messageType = "Manage Trip Plan - Amend Trip";
    let payload = {
      "Header": {
        "TripNo": selectedRowObjects?.[0]?.TripPlanID,
        "Cancellation": null,
        "ShortClose": null,
        "Amendment": null
      }
    }
    console.log("Payload:", payload);
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
              {/* Selected rows indicator */}
              {selectedRowObjects.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 mb-2">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">{selectedRowObjects.length}</span> row{selectedRowObjects.length !== 1 ? 's' : ''} selected
                    <span className="ml-2 text-xs">
                      ({selectedRowObjects.map(row => row.TripPlanID).join(', ')})
                    </span>
                  </div>
                  {/* Right section - clear icon */}
                  {/* <button
                    onClick={() => {
                      setSelectedRows(new Set());
                      setSelectedRowIds(new Set());
                      setSelectedRowObjects([]);
                      setRowTripId([]);
                      // If you also want to clear filters from Zustand:
                      // clearAllFilters("trip-hub");
                    }}
                    className="transform -translate-y-1/2 h-6 w-6 p-0 bg-gray-50 hover:bg-gray-100"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button> */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRows(new Set());
                      setSelectedRowIds(new Set());
                      setSelectedRowObjects([]);
                      setRowTripId([]);
                      // If you also want to clear filters from Zustand:
                      // clearAllFilters("trip-hub");
                    }}
                    title="Clear row selection"
                    className="h-6 w-6 p-0 bg-gray-50 hover:bg-gray-100 border border-blue-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

              )}
              <style>{`
            
             ${Array.from(selectedRowIds).map((rowId) => {
                return `
                tr[data-row-id="${rowId}"] {
                  background-color: #eff6ff !important;
                  border-left: 4px solid #3b82f6 !important;
                }
                tr[data-row-id="${rowId}"]:hover {
                  background-color: #dbeafe !important;
                }
              `;
              }).join('\n')}
          `}</style>
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
                onRowClick={handleRowClick}
                // onFiltersChange={setCurrentFilters}
                onSearch={handleServerSideSearch}
                onClearAll={clearAllFilters}
                // rowClassName={(row: any, index: number) =>
                //   selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                // }
                rowClassName={(row: any, index: number) => {
                  return selectedRowIds.has(row.TripPlanID) ? 'selected' : '';
                }}
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
                hideCheckboxToggle={true}
                serverFilters={dynamicServerFilters}
                showFilterTypeDropdown={false}
                showServersideFilter={showServersideFilter}
                onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
                gridId={gridId}
                userId="current-user"
                api={filterService}
              />
            </div>
          </div>
        </div>
      </AppLayout>

      <TripBulkCancelModal
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        // titleColor={popupTextColor}
        // titleBGColor={popupTitleBgColor}
        icon={<Ban className="w-4 h-4 Error-700" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={handleTripsCancelSubmit}
        submitLabel={popupButtonName}
      // submitColor={popupBGColor}
      />

      {/* New TripPlan Action Modals */}
      <TripPlanActionModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Trip Plan"
        icon={<Ban className="w-4 h-4" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={handleCancelTripPlanSubmit}
        submitLabel="Cancel Trip"
        actionType="cancel"
      />

      <TripPlanActionModal
        open={amendModalOpen}
        onClose={() => setAmendModalOpen(false)}
        title="Amend Trip Plan"
        icon={<NotebookPen className="w-4 h-4" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={handleAmendTripPlanSubmit}
        submitLabel="Amend Trip"
        actionType="amend"
      />

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
