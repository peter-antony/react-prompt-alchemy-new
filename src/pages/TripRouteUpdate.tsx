import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { TransportRouteLegDrawer, TransportRouteLegDrawerRef } from '@/components/drawer/TransportRouteLegDrawer';
import { useTransportRouteStore } from '@/stores/transportRouteStore';
import { SideDrawer } from "@/components/SideDrawer";
import { dateFormatter } from "@/utils/formatter";

export const TripRouteUpdate = () => {
  const [searchParams] = useSearchParams();
  const createTripPlan = searchParams.get('createTripPlan');
  
  // Ref for TransportRouteLegDrawer
  const transportRouteLegDrawerRef = useRef<TransportRouteLegDrawerRef>(null);
  const {
    routes,
    selectedOrder,
    selectedRoute,
    isDrawerOpen,
    isRouteDrawerOpen,
    highlightedIndexes,
    isLoading,
    isRouteLoading,
    error,
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
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false); // SmartGrid Preferences loaded state
  const [serverFilterVisibleFields, setServerFilterVisibleFields] = useState<string[]>([]); // Store the visible fields for server filtering
  const [serverFilterFieldOrder, setServerFilterFieldOrder] = useState<string[]>([]); // Store the field order for server filtering
  const [serverFilterFieldLabels, setServerFilterFieldLabels] = useState<Record<string, string>>({}); // Store custom labels
  const [isServerFilterPersonalizationEmpty, setIsServerFilterPersonalizationEmpty] = useState(false); // Flag to check if server filter personalization is empty (Insert / Update)

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
      type: "Date",
      sortable: true,
      editable: false,
      subRow: false,
      order: 5
    },
    {
      key: "COArrivalDate",
      label: "Arrival Date",
      type: "Date",
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
            from: format(subMonths(new Date(), 2), 'yyyy-MM-dd'),
            to: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
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
          CODepartureDate: dateFormatter(row.CODepartureDate),
          COArrivalDate: dateFormatter(row.COArrivalDate),
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

  const [preferenceModeFlag, setPreferenceModeFlag] = useState<'Insert' | 'Update'>('Insert');

  // Initialize columns and data
  useEffect(() => {
    const init = async () => {
      try {
        const personalizationResponse: any = await quickOrderService.getPersonalization({
          LevelType: 'User',
          // LevelKey: 'ramcouser',
          ScreenName: 'TransportRouteUpdate',
          ComponentName: 'smartgrid-preferences'
        });

        // Extract columns with subRow = true from initialColumns
        const subRowColumns = initialColumns
          .filter(col => col.subRow === true)
          .map(col => col.key);

        console.log('TransportRouteUpdate SmartGrid - Extracted subRow columns:', subRowColumns);

        // Parse and set personalization data to localStorage
        if (personalizationResponse?.data?.ResponseData) {
          const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);

          if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
            const personalizationData = parsedPersonalization.PersonalizationResult[0];

            // Set the JsonData to localStorage
            if (personalizationData.JsonData) {
              const jsonData = personalizationData.JsonData;

              // If subRowColumns is empty in the API response, populate it with extracted columns
              if (!jsonData.subRowColumns || jsonData.subRowColumns.length === 0) {
                jsonData.subRowColumns = subRowColumns;
                console.log('TransportRouteUpdate SmartGrid - subRowColumns was empty, populated with:', subRowColumns);
              }

              localStorage.setItem('smartgrid-preferences', JSON.stringify(jsonData));
              console.log('TransportRouteUpdate SmartGrid Personalization data set to localStorage:', jsonData);
            }
            // If we have data, next save should be an Update
            setPreferenceModeFlag('Update');
          } else {
            // If result is empty array or no result, next save should be Insert
            console.log('No existing personalization found, setting mode to Insert');
            setPreferenceModeFlag('Insert');
          }
        } else {
          // If ResponseData is empty/null, next save should be Insert
          console.log('Empty personalization response, setting mode to Insert');
          setPreferenceModeFlag('Insert');
        }

        // Fetch Server-side Filter Personalization
        console.log('TripRouteUpdate: Fetching server-side filter personalization...');
        try {
          const serverFilterPersonalizationResponse: any = await quickOrderService.getPersonalization({
            LevelType: 'User',
            // LevelKey: 'ramcouser',
            ScreenName: 'TransportRouteUpdate',
            ComponentName: 'smartgrid-serverside-filtersearch-preferences'
          });
          console.log('TripRouteUpdate: Server-side filter personalization response:', serverFilterPersonalizationResponse);

          let isServerFilterEmpty = true;
          if (serverFilterPersonalizationResponse?.data?.ResponseData) {
            const parsed = JSON.parse(serverFilterPersonalizationResponse.data.ResponseData);
            if (parsed?.PersonalizationResult && parsed.PersonalizationResult.length > 0) {
              isServerFilterEmpty = false;
              const data = parsed.PersonalizationResult[0].JsonData;
              if (data) {
                if (data.visibleFields) setServerFilterVisibleFields(data.visibleFields);
                if (data.fieldOrder) setServerFilterFieldOrder(data.fieldOrder);
                if (data.fieldLabels) setServerFilterFieldLabels(data.fieldLabels);
              }
            }
          }
          setIsServerFilterPersonalizationEmpty(isServerFilterEmpty);
        } catch (error) {
          console.error('Failed to fetch server-side filter personalization:', error);
        }
        
      } catch (error) {
        console.error('Failed to load personalization:', error);
      } finally {
        setIsPreferencesLoaded(true); // Set to true after personalization is loaded
      }

      fetchTripsAgain();
    };

    init();
  }, []);

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

  const handleLinkClick = async (rowData: any, columnKey: any, rowIndex: any) => {
    console.log("Link clicked:", rowData, columnKey, rowIndex);
    
    if (columnKey == "CustomerOrderNo") {
      console.log('Clicked row data:', rowData);
      console.log('CustomerOrderID:', rowData?.CustomerOrderNo);
      console.log('Available data keys:', rowData ? Object.keys(rowData) : 'No row data');
      
      if (rowData?.CustomerOrderNo) {
        setApiStatus('loading');  // Loading indicator
        // Call the API with the actual row data
        await openRouteDrawer(rowData);
        setApiStatus('idle');
      } else {
        console.error('No CustomerOrderID found in clicked row');
        console.error('Available row data:', rowData);
        // setApiStatus('error');
        toast({
          title: "Error",
          description: "Unable to find Customer Order ID for this row",
          variant: "destructive",
        });
      }
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

  const handleGridPreferenceSave = async (preferences: any) => {
    try {
      // Get the latest preferences from localStorage to ensure we have the full state
      const storedPreferences = localStorage.getItem('smartgrid-preferences');
      const preferencesToSave = storedPreferences ? JSON.parse(storedPreferences) : preferences;

      console.log('Saving TransportRouteUpdate SmartGrid preferences:', preferencesToSave);
      console.log('Preference ModeFlag:', preferenceModeFlag);

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'TransportRouteUpdate',
        ComponentName: 'smartgrid-preferences',
        JsonData: preferencesToSave,
        IsActive: "1",
        ModeFlag: preferenceModeFlag
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

        // If save was successful and we were in Insert mode, switch to Update mode for future saves
        if (isSuccess && preferenceModeFlag === 'Insert') {
          setPreferenceModeFlag('Update');
        }
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

  const handleServerFilterPreferenceSave = async (visibleFields: string[], fieldOrder: string[], fieldLabels?: Record<string, string>) => {
    console.log('TripRouteUpdate: handleServerFilterPreferenceSave called', { visibleFields, fieldOrder, fieldLabels });
    try {
      const preferencesToSave = {
        visibleFields,
        fieldOrder,
        fieldLabels
      };

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'TransportRouteUpdate',
        ComponentName: 'smartgrid-serverside-filtersearch-preferences',
        JsonData: preferencesToSave,
        IsActive: "1",
        ModeFlag: isServerFilterPersonalizationEmpty ? "Insert" : "Update"
      });

      const apiData = response?.data;

      if (apiData?.IsSuccess) {
        setServerFilterVisibleFields(visibleFields);
        setServerFilterFieldOrder(fieldOrder);
        if (fieldLabels) setServerFilterFieldLabels(fieldLabels);
        // Update the empty flag since we now have saved data
        setIsServerFilterPersonalizationEmpty(false);

        toast({
          title: "✅ Filter Preferences Saved",
          description: "Your search field preferences have been saved.",
          variant: "default",
        });
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

  // Helper to fetch filter sets (used internally and exposed via service)
    const fetchFilterSets = async (userId: string, gridId: string) => {
      try {
        console.log(`Fetching filter sets for ${userId} - ${gridId}`);
        const response: any = await quickOrderService.getPersonalization({
          LevelType: 'User',
          // LevelKey: 'ramcouser', // Should ideally come from user context
          ScreenName: 'TransportRouteUpdate',
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
            ScreenName: 'TransportRouteUpdate',
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
          const { sets: existingSets } = await fetchFilterSets('ramcouser', `${gridId}`); // Hardcoded for now as per context
  
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
            ScreenName: 'TransportRouteUpdate',
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
          const { sets: existingSets } = await fetchFilterSets('ramcouser', `${gridId}`); // Hardcoded for now as per context
  
          // 2. Filter out
          const updatedSets = existingSets.filter((s: any) => s.id !== filterId);
  
          // 3. Save to API
          await quickOrderService.savePersonalization({
            LevelType: 'User',
            // LevelKey: 'ramcouser',
            ScreenName: 'TransportRouteUpdate',
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
          CODepartureDate: dateFormatter(row.CODepartureDate),
          COArrivalDate: dateFormatter(row.COArrivalDate),
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
        from: format(subMonths(new Date(), 2), 'yyyy-MM-dd'),
        to: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
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

  // badge color for the transport route leg sidedrawer
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
              {/* {selectedRowObjects.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 mb-2">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">{selectedRowObjects.length}</span> row{selectedRowObjects.length !== 1 ? 's' : ''} selected
                    <span className="ml-2 text-xs">
                      ({selectedRowObjects.map(row => row.TripPlanID).join(', ')})
                    </span>
                  </div> */}
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
                  {/* <Button
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
          `}</style> */}
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

              {/* Load the grid only when preferences are loaded */}
              {isPreferencesLoaded ? (
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
                  onPreferenceSave={handleGridPreferenceSave}
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
                  api={customFilterService}
                  serverFilterVisibleFields={serverFilterVisibleFields}
                  serverFilterFieldOrder={serverFilterFieldOrder}
                  serverFilterFieldLabels={serverFilterFieldLabels}
                  onServerFilterPreferenceSave={handleServerFilterPreferenceSave}
                  enableExpandCollapseAll={true}
                />
              ) : (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                  <div className="text-lg font-semibold text-blue-700">Loading...</div>
                  <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
                </div>
              )}
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
        title="Leg Details"
        titleBadge={selectedRoute?.CustomerOrderID || ''}
        titleBadgeStyles="badge-blue rounded-2xl"
        titleBadgeStatus={selectedRoute?.StatusDescription || ''} 
        titleBadgeStatusStyles={getStatusColorLocal(selectedRoute?.StatusDescription || '')} // same badge styles as in grid
        width="100%"
        showFooter={false}
        slideDirection="right"
      >
        <TransportRouteLegDrawer ref={transportRouteLegDrawerRef} />
      </SideDrawer>

    </>
  );
};
