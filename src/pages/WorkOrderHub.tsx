import React, { useState, useEffect, useMemo } from "react";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { GridColumnConfig, ServerFilter } from '@/types/smartgrid';
import { X, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from '../components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFooterStore } from '@/stores/footerStore';
import { filterService, quickOrderService, tripService } from '@/api/services';
import { workOrderSearchCriteria, SearchCriteria } from "@/constants/workOrderSearchCriteria";
import TripBulkCancelModal from "@/components/ManageTrip/TripBulkCancelModal";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui/button";
import { dateFormatter } from "@/utils/formatter";
import { workOrderService } from "@/api/services/workOrderService";

export const WorkOrderHub = () => {
  const [searchParams] = useSearchParams();
  const createTripPlan = searchParams.get('id');

  const gridId = "work-order-hub"; // same id you pass to SmartGridWithGrouping
  const { activeFilters } = useFilterStore();
  const filtersForThisGrid = activeFilters[gridId] || {};
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const { toast } = useToast();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle] = useState('Cancel Trip');
  const [popupButtonName] = useState('Cancel');

  // New modal states for createTripPlan actions
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
  // console.log('filtersForThisGrid: ', filtersForThisGrid);
  const handleFieldChange = (name, value) => {
    console.log('Field changed:', name, value);
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const handleGridPreferenceSave = async (preferences: any) => {
    try {
      // Get the latest preferences from localStorage to ensure we have the full state
      const storedPreferences = localStorage.getItem('smartgrid-preferences');
      const preferencesToSave = storedPreferences ? JSON.parse(storedPreferences) : preferences;

      console.log('Saving WorkOrderHub SmartGrid preferences:', preferencesToSave);
      console.log('Preference ModeFlag:', preferenceModeFlag);

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        LevelKey: 'ramcouser',
        ScreenName: 'WorkOrderHub',
        ComponentName: 'smartgrid-preferences',
        JsonData: preferencesToSave,
        IsActive: "1",
        ModeFlag: preferenceModeFlag // Use the state variable
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
        await fetchWorkOrders();
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
    { label: "Work Order Management", active: true }
  ];

  const initialColumns: GridColumnConfig[] = [
    {
      key: "WorkOrderNumber",
      label: "Work Order No.",
      type: "Link",
      width: 150,
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1
    },
    {
      key: "WagonOrContainerID",
      label: "Wagon/Container",
      type: "Link",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false,
      order: 2
    },
    {
      key: "WorkOrderStatus",
      label: "Work Order Status",
      type: "Badge",
      width: 30,
      sortable: true,
      editable: false,
      subRow: false,
      order: 3
    },
    {
      key: "WorkOrderFrom",
      label: "Work Order From & To",
      type: "Date",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "WagonOwnerName",
      label: "Wagon Owner Name",
      type: "Text",
      width: 70,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "SupplierName",
      label: "Supplier",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "MarketOrCluster",
      label: "Market/Cluster",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "CustomerContract",
      label: "Customer Contract No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "OperationDetails",
      label: "Operation Details",
      type: "CustomerCountBadge",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "SupplierContractNumber",
      label: "Supplier Contract No.",
      type: "Text",
      width: 50,
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "CustomerSupport",
      label: "Customer support / Inside sales",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true
    },
    // {
    //   key: "OperationNumber",
    //   label: "Operation Number",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: true
    // },
    // {
    //   key: "TypeOfAction",
    //   label: "Type of action",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: true
    // },
    // {
    //   key: "OperationStatus",
    //   label: "Operation Status",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: true,
    // },
    {
      key: "LastMaintenance",
      label: "Last Maintenance",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "NextMaintenance",
      label: "Next Maintenance",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "AppointmentDateForTheWorkshop",
      label: "Appointment date for the workshop",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "OwnerType",
      label: "Owner Type",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "LeasingType",
      label: "Leasing Type",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "InvoiceReference",
      label: "Invoice Reference",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ReinvoicingCostTo",
      label: "Re-invoicing Cost To",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "EquipmentCategory",
      label: "Equipment Category",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CreationDate",
      label: "Creation date",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "PlaceOfOperation",
      label: "Place of operation",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    }
  ];

  const pipedData = (id: any, desc: any) => {
    if (id && desc) return `${id} || ${desc}`;
    return id || desc || '-';
  }

  const fetchWorkOrders = async () => {
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
        searchCriteria = buildSearchCriteria({});
      }

      // const ResultSearchCriteria = buildSearchCriteria(defaultsTo);
      const response: any = await workOrderService.getWorkOrdersForHub({ searchCriteria });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse.ResponseResult;
      console.log("data: ", data);
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
            'Open': 'badge-blue rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Deleted': 'badge-red rounded-2xl',
            'Save': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Completed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'In Progress': 'badge-orange rounded-2xl',
            'Draft': 'badge-blue rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };
        return {
          ...row,
          WorkOrderStatus: {
            value: row.WorkOrderStatus,
            variant: getStatusColorLocal(row.WorkOrderStatus),
          },
          WorkOrderFrom: dateFormatter(row.WorkOrderFrom) + ' to ' + dateFormatter(row.WorkOrderTo),
          SupplierName: pipedData(row.SupplierID, row.SupplierDescription),
          CustomerContract: pipedData(row.CustomerContractID, row.CustomerContractDescription),
          CustomerSupport: pipedData(row.CustomerSupportID, row.CustomerSupportIDDescription),
          PlaceOfOperation: pipedData(row.PlaceOfOperationID, row.PlaceOfOperationDescription),
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

  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const [preferenceModeFlag, setPreferenceModeFlag] = useState<'Insert' | 'Update'>('Insert');

  // Initialize columns and data
  useEffect(() => {
    const init = async () => {
      try {
        const personalizationResponse: any = await quickOrderService.getPersonalization({
          LevelType: 'User',
          LevelKey: 'ramcouser',
          ScreenName: 'WorkOrderHub',
          ComponentName: 'smartgrid-preferences'
        });

        // Extract columns with subRow = true from initialColumns
        const subRowColumns = initialColumns
          .filter(col => col.subRow === true)
          .map(col => col.key);

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
              localStorage.setItem('smartgrid-preferences', JSON.stringify(personalizationData.JsonData));
              console.log('WorkOrderHub SmartGrid Personalization data set to localStorage:', personalizationData.JsonData);
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
      } catch (error) {
        console.error('Failed to load personalization:', error);
        // On error, default to Insert might be safer, or keep default
      } finally {
        setIsPreferencesLoaded(true); // Set to true after personalization is loaded
      }

      // Call fetchWorkOrders AFTER personalization is loaded (or failed)
      fetchWorkOrders();
    };

    init();
    // fetchWorkOrders();
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
      if (selectedRowIds.has(row.WorkOrderNumber)) {
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
      leftButtons: [],
      rightButtons: [
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
    // console.log("createTripPlan: ", createTripPlan);
    if (columnKey === 'WorkOrderNumber') {
      navigate(`/create-work-order?id=${value.WorkOrderNumber}`);
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
    const newSelectedRowIds = new Set(selectedObjects.map(row => row.WorkOrderNumber));

    // Update selected row objects to ensure uniqueness by ID
    const uniqueSelectedObjects = selectedObjects.filter((row, index, self) =>
      self.findIndex(r => r.id === row.WorkOrderNumber) === index
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
    const isRowSelected = newSelectedRowIds.has(row.WorkOrderNumber);

    if (isRowSelected) {
      // Remove row: remove from all tracking sets/arrays
      newSelectedRows.delete(index);
      newSelectedRowIds.delete(row.WorkOrderNumber);
      const objectIndex = newSelectedRowObjects.findIndex(obj => obj.WorkOrderNumber === row.WorkOrderNumber);
      if (objectIndex > -1) {
        newSelectedRowObjects.splice(objectIndex, 1);
      }
      console.log('Removed row:', row.WorkOrderNumber);
    }
    else {
      // Add row: add to all tracking sets/arrays (ensure uniqueness)
      newSelectedRows.add(index);
      newSelectedRowIds.add(row.WorkOrderNumber);
      // Only add if not already in objects array (double-check uniqueness)
      if (!newSelectedRowObjects.some(obj => obj.WorkOrderNumber === row.WorkOrderNumber)) {
        newSelectedRowObjects.push(row);
      }
      console.log('Added row:', row.WorkOrderNumber);
    }
    // Update all state
    setSelectedRows(newSelectedRows);
    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(newSelectedRowObjects);
    console.log('Selected row objects after click:', newSelectedRowObjects);
    setRowTripId(Array.from(newSelectedRowIds));
    console.log('new set: ', Array.from(newSelectedRowIds)); // ✅ log directly
    console.log('Selected row IDs after click:', Array.from(newSelectedRowIds));
  };

  useEffect(() => {
    console.log("rowTripId updated:", rowTripId);
  }, [rowTripId]);

  // Configure the Create Trip button for the grid toolbar
  const gridConfigurableButtons: ConfigurableButtonConfig[] = [
    {
      label: " Create Work Order",
      tooltipTitle: "Create a new work order",
      showDropdown: false,
      tooltipPosition: "top" as const,
      onClick: () => {
        console.log('nav work-order');
        // No redirection here right now.
        navigate('/create-work-order');
      }
    }
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
    const criteria: SearchCriteria = { ...workOrderSearchCriteria };
    // Set ScreenName based on createTripPlan parameter
    if (Object.keys(latestFilters).length > 0) {
      Object.entries(latestFilters).forEach(([key, value]): any => {
        const filter: any = value; // 👈 cast to any
        if (key === "WorkOrderDate") {
          criteria.WorkOrderFrom = filter?.value?.from.replace(/-/g, "/");
          criteria.WorkOrderTo = filter?.value?.to.replace(/-/g, "/");
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
    // const plannedDate = latestFilters["WorkOrderDate"];
    // if (!plannedDate?.value?.from || !plannedDate?.value?.to) {
    //   toast({
    //     title: "Planned Execution Date Range",
    //     description: "Please select a Planned Execution Date before searching.",
    //     variant: "destructive", // 👈 makes it red/error style
    //   });
    //   return;
    // }

    const finalSearchCriteria = buildSearchCriteria(latestFilters);

    try {
      gridState.setLoading(true);
      setApiStatus('loading');

      const response: any = await workOrderService.getWorkOrdersForHub({
        searchCriteria: finalSearchCriteria
      });

      console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.ResponseResult;

      const { IsSuccess, Message } = response.data;

      if (!IsSuccess) {
        setApiStatus('error');
        gridState.setGridData([]);
        gridState.setLoading(false);
        toast({
          title: "Error!",
          description: Message,
          variant: 'destructive'
        });
        return;
      }

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
            'Open': 'badge-blue rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Deleted': 'badge-red rounded-2xl',
            'Save': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Completed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'In Progress': 'badge-orange rounded-2xl',
            'Draft': 'badge-blue rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };

        return {
          ...row,
          WorkOrderStatus: {
            value: row.WorkOrderStatus,
            variant: getStatusColorLocal(row.WorkOrderStatus),
          },
          WorkOrderFrom: dateFormatter(row.WorkOrderFrom) + ' to ' + dateFormatter(row.WorkOrderTo),
          SupplierName: pipedData(row.SupplierID, row.SupplierDescription),
          CustomerContract: pipedData(row.CustomerContractID, row.CustomerContractDescription),
          CustomerSupport: pipedData(row.CustomerSupportID, row.CustomerSupportIDDescription),
          PlaceOfOperation: pipedData(row.PlaceOfOperationID, row.PlaceOfOperationDescription),
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

  useEffect(() => {
    const equipmentCategory = filtersForThisGrid['EquipmentCategory'];

    if (equipmentCategory) {
      console.log('Selected Equipment Category:', equipmentCategory);
      // here you can set local state or call any API you need
      // setSelectedEquipmentCategory(equipmentCategory);
    }
  }, [filtersForThisGrid]);

  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
  // utils/fetchOptionsHelper.ts
  const makeLazyFetcher = (messageType: string, extraParams?: Record<string, any>) => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      // Merge standard params with any additional params supplied by caller
      const payload = {
        messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
        ...(extraParams),
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
    { key: 'WorkorderNo', label: 'Work Order No.', type: 'text' },
    {
      key: 'EquipmentID',
      label: 'Wagon/Container',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Equipment ID Init", { EquipmentType: selectedEquipmentCategory })
    },
    {
      key: 'Status', label: 'Work Order Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Work Order status"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: "WorkOrderDate", label: "Work Order From & To", type: 'dateRange',
      // defaultValue: {
      //   // from: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
      //   // to: format(new Date(), 'yyyy-MM-dd')
      //   from: format(subMonths(new Date(), 1), "yyyy-MM-dd"), // 2 months back
      //   to: format(addMonths(new Date(), 2), "yyyy-MM-dd"),   // 1 month ahead
      // }
    },
    {
      key: 'WagonOwnerName',
      label: 'Wagon owner name',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Wagon owner name")
    },
    {
      key: 'SupplierID',
      label: 'Supplier Name',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Supplier Init")
    },
    {
      key: 'SupplierContractID',
      label: 'Supplier Contract No.',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Contract Init", { OrderType: 'Buy' })
    },
    {
      key: 'Cluster',
      label: 'Cluster/Market',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Cluster Init")
    },
    {
      key: 'CustomerContractID',
      label: 'Customer Contract No. / Desc.',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Contract Init", { OrderType: 'Sell' })
    },
    {
      key: 'CustomerSupportID',
      label: 'Customer support',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Customer support"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'TypeOfAction', label: 'Type of action', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("WO Type of Action Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'Operation', label: 'Operation', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("WO Operations Type of Action Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'OperationStatus', label: 'Operation status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Work Order Operation Status Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'EquipmentCategory', label: 'Equipment category', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Equipment category"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'PlaceOfOperationID', label: 'Place Of Operation', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Location Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    { key: 'InvoiceReference', label: 'Invoice reference', type: 'text' },
    {
      key: 'ReInvoicingCostTo', label: 'Re-invoicing cost to', type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Re invoicing cost to'),
      hideSearch: true,
      disableLazyLoading: true
    }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  // at the top of WorkOrderHub component

  // this is called whenever any serverside filter (including EquipmentCategory) changes
  const handleServerFiltersChange = (filters: Record<string, any>) => {
    const equipmentFilter = filters['EquipmentCategory'];

    // Filters from ServersideFilter are usually { value, operator }
    const value =
      equipmentFilter && typeof equipmentFilter === 'object'
        ? equipmentFilter.value
        : equipmentFilter;

    setSelectedEquipmentCategory(value || null);
    // console.log('EquipmentCategory changed:', value);
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
              {selectedRowObjects.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 mb-2">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">{selectedRowObjects.length}</span> row{selectedRowObjects.length !== 1 ? 's' : ''} selected
                    <span className="ml-2 text-xs">
                      ({selectedRowObjects.map(row => row.WorkOrderNumber).join(', ')})
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
              {/* Load the grid only when preferences are loaded */}
              {isPreferencesLoaded ? (
              <SmartGridWithGrouping
                key={`grid-${gridState.forceUpdate}`}
                onPreferenceSave={handleGridPreferenceSave}
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
                onFiltersChange={handleServerFiltersChange}
                onSearch={handleServerSideSearch}
                onClearAll={clearAllFilters}
                // rowClassName={(row: any, index: number) =>
                //   selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                // }
                rowClassName={(row: any, index: number) => {
                  return selectedRowIds.has(row.WorkOrderNumber) ? 'selected' : '';
                }}
                nestedRowRenderer={renderSubRow}
                configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Work Order Management"
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
