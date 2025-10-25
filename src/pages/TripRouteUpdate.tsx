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
import { tripRouteSearchCriteria, tripRouteSearch } from "@/constants/tripRouteSearchCriteria";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui/button";
import { tripPlanningService } from "@/api/services/tripPlanningService";
import { TransportRouteLegDrawer } from '@/components/drawer/TransportRouteLegDrawer';
import { useTransportRouteStore } from '@/stores/transportRouteStore';
import { SideDrawer } from "@/components/SideDrawer";

export const TripRouteUpdate = () => {
  const [searchParams] = useSearchParams();
  const createTripPlan = searchParams.get('createTripPlan');
  const {
    routes,
    selectedOrder,
    selectedRoute,
    isDrawerOpen,
    isRouteDrawerOpen,
    highlightedIndexes,
    fetchRoutes,
    handleCustomerOrderClick,
    openRouteDrawer,
    closeDrawer,
    closeRouteDrawer,
    highlightRowIndexes,
    addLegPanel,
    removeLegPanel,
    updateLegData,
    saveRouteDetails,
    fetchDepartures,
    fetchArrivals
  } = useTransportRouteStore();
  // const [isRouteDrawerOpen, setIsRouteDrawerOpen] = useState(false);

  const gridId = "trip-route"; // same id you pass to SmartGridWithGrouping
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

  const breadcrumbItems = [
    { label: "Home", href: "/", active: false },
    { label: "Transport Route Update", active: true },
    // { label: 'Trip Execution Management', active: false },
  ];

  const initialColumns: GridColumnConfig[] = [
    {
      key: "CustomerOrderNo",
      label: "Customer Order No.",
      type: "Link",
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1,
      // onClick: (row: any) => openRouteDrawer(row)
    },
    {
      key: "COStatus",
      label: "CO Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 2
    },
    {
      key: "CODepartureLocation",
      label: "Departure",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 3
    },
    {
      key: "COArrivalLocation",
      label: "Arrival",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 4
    },
    {
      key: "CODepartureDate",
      label: "Departure Date",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
      order: 5
    },
    {
      key: "COArrivalDate",
      label: "Arrival Date",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
      order: 6
    },
    {
      key: "Mode",
      label: "Mode",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 7
    },
    {
      key: "LegExecuted",
      label: "Leg Executed",
      type: "BadgeCombinationCount",
      sortable: true,
      editable: false,
      subRow: false,
      order: 8
    },
    // {
    //   key: "TotalLegs",
    //   label: "Leg Details",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 9
    // }
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
      }
      else {
        // ✅ Fallback defaults with default CustomerOrderCreationDate
        const defaultFilters = {
          ...tripRouteSearchCriteria,
          OrderDate: {
            from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            to: format(new Date(), 'yyyy-MM-dd')
          }
        };
        searchCriteria = buildSearchCriteria(defaultFilters);
        console.log('Using default filters with CustomerOrderCreationDate:', defaultFilters);
      }

      // const ResultSearchCriteria = buildSearchCriteria(defaultsTo);
      const response: any = await tripService.getTripRoutes({ searchCriteria });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse.ExecutionPlans;

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
            'Planned': 'badge-blue rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'Draft Bill Raised': 'badge-orange rounded-2xl',
            'Not Eligible': 'badge-red rounded-2xl',
            'Revenue leakage': 'badge-red rounded-2xl',
            'Invoice Created': 'badge-blue rounded-2xl',
            'Under Planning': 'badge-fresh-green rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };
        return {
          ...row,
          COStatus: {
            value: row.COStatus,
            variant: getStatusColorLocal(row.COStatus),
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

  // Footer is not required for this page
  // useEffect(() => {
  //   setFooter({
  //     visible: false,
  //     pageName: 'Trip_Execution',
  //     leftButtons: [
  //       {
  //         label: "CIM/CUV Report",
  //         onClick: () => console.log("CIM/CUV Report"),
  //         type: "Icon",
  //         iconName: 'BookText'
  //       },
  //       {
  //         label: "Dropdown Menu",
  //         onClick: () => console.log("Menu"),
  //         type: "Icon",
  //         iconName: 'EllipsisVertical'
  //       },
  //     ],
  //     rightButtons: createTripPlan === 'true' ? [
  //       {
  //         label: "Cancel",
  //         onClick: () => {
  //           console.log("Cancel clicked");
  //           setCurrentActionType('cancel');
  //           setCancelModalOpen(true);
  //         },
  //         type: 'Button',
  //         disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
  //       },
  //       {
  //         label: "Confirm",
  //         onClick: () => {
  //           console.log("Confirm clicked");
  //         },
  //         type: 'Button',
  //         disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
  //       },
  //       {
  //         label: "Release",
  //         onClick: () => {
  //           console.log("Release clicked");
  //         },
  //         type: 'Button',
  //         disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
  //       },
  //       {
  //         label: "Amend",
  //         onClick: () => {
  //           console.log("Amend clicked");
  //           setCurrentActionType('amend');
  //           setAmendModalOpen(true);
  //         },
  //         type: 'Button',
  //         disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
  //       },
  //     ] : [
  //       {
  //         label: "Cancel",
  //         onClick: () => {
  //           console.log("Cancel clicked");
  //           setPopupOpen(true);
  //         },
  //         type: 'Button',
  //         disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
  //       },
  //     ],
  //   });
  //   return () => resetFooter();
  // }, [setFooter, resetFooter, selectedRows, createTripPlan]);

  // Navigate to the create new quick order page
  const navigate = useNavigate();

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    let row = {
      "ExecutionPlanID": "EXE/2021/00005668",
      "CustomerOrderID": "BR/2025/0259",
      "CustomerID": "1005",
      "CustomerName": "ramcotest",
      "Service": "BT",
      "ServiceDescription": "BLOCK TRAIN CONVENTIONAL",
      "SubService": "WOW",
      "SubServiceDescription": "WITHOUT  EQUIPMENT / SOC",
      "CODeparture": "10-00001",
      "CODepartureDescription": "10-00001",
      "COArrival": "10-00004",
      "COArrivalDescription": "10-00004",
      "RouteID": "ROUTE 78",
      "RouteDescription": "ROUTE 78",
      "Status": "PLND",
      "LoadType": "Loaded",
      "LegDetails": [
        {
          "LegSequence": 1,
          "LegID": "Leg 1",
          "LegUniqueId": "BDAE29DB-15BD-4804-8CBD-E53771EBFC41",
          "Departure": "10-00001",
          "DepartureDescription": "North Chennai",
          "Arrival": "10-00002",
          "ArrivalDescription": "East Chennai",
          "LegBehaviour": "Pick",
          "LegBehaviourDescription": "Pick",
          "TransportMode": "Rail",
          "LegStatus": "CF",
          "TripInfo": [
            {
              "TripID": "TP/2021/00024972",
              "Departure": "10-00001",
              "DepartureDescription": "North Chennai",
              "Arrival": "10-00002",
              "ArrivalDescription": "East Chennai",
              "DepartureActualDate": null,
              "ArrivalActualDate": null,
              "LoadType": "Loaded",
              "TripStatus": "Released",
              "DraftBillNo": null,
              "DraftBillStatus": null,
              "DraftBillWarning": null,
              "SupplierID": "10020296",
              "SupplierDescription": "ZIMMERMANN SPEDITION GMBH"
            }
          ],
          "ModeFlag": "Nochange",
          "ReasonForUpdate": null,
          "QCCode1": null,
          "QCCode1Value": null,
          "Remarks": null
        },
        {
          "LegSequence": 2,
          "LegID": "Leg 2",
          "LegUniqueId": "C53AE354-E8A9-48F9-9590-6B56C5D6EDB9",
          "Departure": "10-00002",
          "DepartureDescription": "East Chennai",
          "Arrival": "10-00003",
          "ArrivalDescription": "West Chennai",
          "LegBehaviour": "LHV",
          "LegBehaviourDescription": "LHV",
          "TransportMode": "Rail",
          "LegStatus": "AC",
          "TripInfo": null,
          "ModeFlag": "Nochange",
          "ReasonForUpdate": null,
          "QCCode1": null,
          "QCCode1Value": null,
          "Remarks": null
        },
        {
          "LegSequence": 3,
          "LegID": "Leg 3",
          "LegUniqueId": "DA84BAF0-A11C-471F-9A36-47F372686A06",
          "Departure": "10-00003",
          "DepartureDescription": "West Chennai",
          "Arrival": "10-00004",
          "ArrivalDescription": "10-00004",
          "LegBehaviour": "Dvry",
          "LegBehaviourDescription": "Dvry",
          "TransportMode": "Rail",
          "LegStatus": null,
          "TripInfo": null,
          "ModeFlag": "Nochange",
          "ReasonForUpdate": null,
          "QCCode1": null,
          "QCCode1Value": null,
          "Remarks": null
        }
      ],
      "ReasonForUpdate": ""
    }
    if (columnKey == "CustomerOrderNo") {
      // setIsRouteDrawerOpen(true);
      openRouteDrawer(row);
      console.log('row', row);
    }
  };

  // const closeRouteDrawer = () => {
  //   setIsRouteDrawerOpen(false);
  // }

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

  const buildSearchCriteria = (latestFilters: Record<string, any> = {}): tripRouteSearch => {
    const criteria: tripRouteSearch = { ...tripRouteSearchCriteria };

    // If incoming filters are already a flat criteria object (like your defaults)
    const isAlreadyCriteria = Object.values(latestFilters).every(
      (val) => typeof val === "string" || typeof val === "number" || val === ""
    );

    if (isAlreadyCriteria) {
      // Directly merge and return
      return { ...criteria, ...latestFilters };
    }

    // Otherwise, treat it like filter objects
    for (const [key, value] of Object.entries(latestFilters)) {
      const filter: any = value;
      let filterValue;

      if (filter && typeof filter === "object" && "value" in filter) {
        filterValue = filter.value;
      } else {
        filterValue = value;
      }

      // Handle date range fields - split into From/To fields
      if (key === 'OrderDate') {
        if (filterValue && typeof filterValue === 'object' && filterValue.from && filterValue.to) {
          (criteria as any)['FromOrderDate'] = filterValue.from;
          (criteria as any)['ToOrderDate'] = filterValue.to;
        } else {
          (criteria as any)[key] = filterValue;
        }
      }
      else {
        (criteria as any)[key] = filterValue;
      }
    }

    return criteria;
  };

  const handleServerSideSearch = async () => {
    // // console.log("Server-side search with filters:", filterService.applyGridFiltersSet());
    let latestFilters = filterService.applyGridFiltersSet();
    // if (Object.keys(latestFilters).length == 0) {
    //   return;
    // }
    console.log('LatestFilters Trip log: ', latestFilters);
    console.log('buildSearchCriteria: ', buildSearchCriteria(latestFilters));
    const plannedDate = latestFilters["PlannedExecutionDate"];

    const finalSearchCriteria = buildSearchCriteria(latestFilters);

    try {
      gridState.setLoading(true);
      setApiStatus('loading');

      const response: any = await tripService.getTripRoutes({
        searchCriteria: finalSearchCriteria
      });

      console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.ExecutionPlans;

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
            'Planned': 'badge-blue rounded-2xl',
            "Revenue leakage": 'badge-red rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'Draft Bill Raised': 'badge-orange rounded-2xl',
            'Not Eligible': 'badge-red rounded-2xl',
            'Invoice Created': 'badge-blue rounded-2xl',
            'Under Planning': 'badge-fresh-green rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };

        return {
          ...row,
          COStatus: {
            value: row.COStatus,
            variant: getStatusColorLocal(row.COStatus),
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
      key: 'Contract', label: 'Contract', type: 'lazyselect',
      // Pass OrderType: 'SELL' when fetching Supplier Contract options
      fetchOptions: makeLazyFetcher("Contract Init", { OrderType: 'SELL' })
    },
    {
      key: 'Departure', label: 'Departure', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Departure Init")
    },
    {
      key: 'Arrival', label: 'Arrival', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Arrival Init")
    },
    {
      key: 'Customer',
      label: 'Customer ID',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Customer Init"),
      // multiSelect: true
    },
    {
      key: 'CustomerOrderStatus',
      label: 'Customer Order Status',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Customer Order status Init"),
      // multiSelect: true
    },
    {
      key: 'CustomerOrderNo',
      label: 'Customer Order NO',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("CustomerOrder Number Init"),
      // multiSelect: true
    },
    {
      key: 'OrderDate',
      label: 'Customer Order Date',
      type: 'dateRange',
      defaultValue: {
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
      }
    }
    // {
    //   key: 'Supplier', label: 'Supplier', type: 'lazyselect',
    //   fetchOptions: makeLazyFetcher("Supplier Init")
    // },
    // {
    //   key: 'ServiceType', label: 'Service', type: 'lazyselect',
    //   fetchOptions: makeLazyFetcher("Service type Init"),
    //   hideSearch: true,
    //   disableLazyLoading: true
    // }
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
                // rowClassName={(row: any, index: number) => {
                //   return selectedRowIds.has(row.TripPlanID) ? 'selected' : '';
                // }}
                nestedRowRenderer={renderSubRow}
                // configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Transport Route Update"
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


      {/* Add a beautiful loading overlay when fetching data from API */}
      {apiStatus === 'loading' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
          <div className="text-lg font-semibold text-blue-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
        </div>
      )}

      {/* Transport Route Leg Drawer */}
      <SideDrawer
        isOpen={isRouteDrawerOpen}
        onClose={closeRouteDrawer}
        title="Transport Route Details"
        width="100%"
        showFooter={false}
      >
        {/* <TransportRouteLegDrawer /> */}
        {selectedRoute && (
          <TransportRouteLegDrawer
            route={selectedRoute}
            onAddLeg={addLegPanel}
            onRemoveLeg={removeLegPanel}
            onUpdateLeg={updateLegData}
            onSave={saveRouteDetails}
            fetchDepartures={fetchDepartures}
            fetchArrivals={fetchArrivals}
          />
        )}
      </SideDrawer>

    </>
  );
};
