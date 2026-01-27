import React, { useState, useEffect, useMemo } from "react";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { tripService } from "@/api/services";
import { GridColumnConfig, FilterConfig, ServerFilter } from '@/types/smartgrid';
import { Plus, Search, CloudUpload, NotebookPen, X, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useFooterStore } from '@/stores/footerStore';
import { filterService, quickOrderService } from '@/api/services';
import { format, subDays, subMonths, addMonths } from 'date-fns';
import { tripCOSearchCriteria, SearchCriteria } from "@/constants/tripCOSearchCriteria";
import TripBulkCancelModal from "@/components/ManageTrip/TripBulkCancelModal";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui/button";
import { tripPlanningService } from "@/api/services/tripPlanningService";
import { dateFormatter } from "@/utils/formatter";

interface TripCOHubMultipleProps {
  onCustomerOrderClick: (selectedRows: any[]) => void;
  data?: any[]; // optional override data from parent
}

export const TripCOHubMultiple = ({ onCustomerOrderClick, data }: TripCOHubMultipleProps) => {
  const pageSize = 50;
  const gridId = "trip-CO"; // same id you pass to SmartGridWithGrouping
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
  const [preferenceModeFlag, setPreferenceModeFlag] = useState<'Insert' | 'Update'>('Insert');
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);

  // State for server filtering
  const [serverFilterVisibleFields, setServerFilterVisibleFields] = useState<string[]>([]); // Store the visible fields for server filtering
  const [serverFilterFieldOrder, setServerFilterFieldOrder] = useState<string[]>([]); // Store the field order for server filtering
  const [serverFilterFieldLabels, setServerFilterFieldLabels] = useState<Record<string, string>>({}); // Store custom labels
  const [isServerFilterPersonalizationEmpty, setIsServerFilterPersonalizationEmpty] = useState(false); // Flag to check if server filter personalization is empty (Insert / Update)
  

  // Initialize columns and data
  useEffect(() => {
    const init = async () => {
      try {
        const personalizationResponse: any = await quickOrderService.getPersonalization({
          LevelType: 'User',
          // LevelKey: 'ramcouser',
          ScreenName: 'TripCOHubMultiple',
          ComponentName: 'smartgrid-preferences'
        });

        // Extract columns with subRow = true from initialColumns
        const subRowColumns = initialColumns
          .filter(col => col.subRow === true)
          .map(col => col.key);

        console.log('TripCOHubMultiple SmartGrid - Extracted subRow columns:', subRowColumns);

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
                console.log('TripCOHubMultiple SmartGrid - subRowColumns was empty, populated with:', subRowColumns);
              }

              localStorage.setItem('smartgrid-preferences', JSON.stringify(jsonData));
              console.log('TripCOHubMultiple SmartGrid Personalization data set to localStorage:', jsonData);
            }
            // If we have data, next save should be an Update
            setPreferenceModeFlag('Update');
          } else {
            // If result is empty array or no result, next save should be Insert
            console.log('TripCOHubMultiple SmartGrid: No existing personalization found, setting mode to Insert');
            setPreferenceModeFlag('Insert');
          }
        } else {
          // If ResponseData is empty/null, next save should be Insert
          console.log('Empty personalization response, setting mode to Insert');
          setPreferenceModeFlag('Insert');
        }

        // Fetch Server-side Filter Personalization
        console.log('TripCOHubMultiple: Fetching server-side filter personalization...');
        try {
          const serverFilterPersonalizationResponse: any = await quickOrderService.getPersonalization({
            LevelType: 'User',
            // LevelKey: 'ramcouser',
            ScreenName: 'TripCOHubMultiple',
            ComponentName: 'smartgrid-serverside-filtersearch-preferences'
          });
          console.log('TripCOHubMultiple: Server-side filter personalization response:', serverFilterPersonalizationResponse);

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
    };

    init();
  }, []);

  console.log('filtersForThisGrid: ', filtersForThisGrid);


  // Helper function to notify parent component about selected rows
  const notifyParentOfSelection = (selectedObjects: any[]) => {
    if (onCustomerOrderClick) {
      onCustomerOrderClick(selectedObjects);
    }
  };

  const initialColumns: GridColumnConfig[] = [
    {
      key: "CustomerOrderID",
      label: "Customer Order ID",
      type: "Link",
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1
    },
    {
      key: "CustomerOrderStatus",
      label: "CO Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 2
    },
    {
      key: "LegBehaviour",
      label: "Leg Behaviour",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 3
    },
    // {
    //   key: "TripID",
    //   label: "Trip ID",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 3
    // },
    // {
    //   key: "TripStatus",
    //   label: "Trip Status",
    //   type: "Badge",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 4
    // },
    {
      key: "LegFromDescription",
      label: "Leg From",
      type: "TextPipedData",
      sortable: true,
      editable: false,
      subRow: false,
      order: 4
    },
    // {
    //   key: "LegFromDescription",
    //   label: "Leg From Description",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 5
    // },
    {
      key: "LegToDescription",
      label: "Leg To",
      type: "TextPipedData",
      sortable: true,
      editable: false,
      subRow: false,
      order: 8
    },
    // {
    //   key: "LegToDescription",
    //   label: "Leg To Description",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 7
    // },
    {
      key: "TransportMode",
      label: "Transport Mode",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 8
    },
    {
      key: "DepartureDate",
      label: "Departure Date",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: false,
      order: 9
    },
    {
      key: "DepartureLocation",
      label: "Departure Location",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "ArrivalLocation",
      label: "Arrival Location",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "DepartureTime",
      label: "Departure Time",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "ArrivalDate",
      label: "Arrival Date",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "ArrivalTime",
      label: "Arrival Time",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "ShuntedOutEquipmentNo",
      label: "Shunted out equipment No",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ShuntedOutDate",
      label: "Shunted out date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Service",
      label: "Service",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ServiceDescription",
      label: "Service Description",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SubService",
      label: "Sub service",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SubServiceDescription",
      label: "Sub Service Description",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerID",
      label: "Customer ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerName",
      label: "Customer Name",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ReturnOrForward",
      label: "Return or forward",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ContractID",
      label: "Contract ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ContractDescription",
      label: "Contract Description",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ScheduleInfo",
      label: "Schedule Info",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "OnewayOrRoundtrip",
      label: "One way / Roundtrip",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "LoadType",
      label: "Load Type",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CreationDate",
      label: "Creation Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerOrderDate",
      label: "Customer Order Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "RequiredWagonQuantity",
      label: "Wagon quantity Required",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "PlannedWagonQuantity",
      label: "Planned wagon quantity",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "PendingWagonQuantity",
      label: "Pending wagon quantity",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "NHM",
      label: "NHM",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ProductWeight",
      label: "Product weight",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ProductWeightUOM",
      label: "Product Weight UOM",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "RIDForEmptyWagon",
      label: "RID for Empty Wagon",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SupplierID",
      label: "Supplier ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SupplierName",
      label: "Supplier Name",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SpecialInstruction",
      label: "Special instructions",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Equipment",
      label: "Equipment",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "PassNo",
      label: "Pass No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ExecutiveCarrier",
      label: "Executive carrier",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ScheduleNo",
      label: "Schedule No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    // {
    //   key: "Resources",
    //   label: "Resources",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 10
    // },
    // {
    //   key: "TrainParams",
    //   label: "Train Para.",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 11
    // },
    // {
    //   key: "Actions",
    //   label: "Actions",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 11
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
        // ✅ Fallback defaults
        const defaultFilters = {
          ...tripCOSearchCriteria,
          CustomerOrderCreationDate: {
            from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            to: format(new Date(), 'yyyy-MM-dd')
          }
        };
        searchCriteria = buildSearchCriteria(defaultFilters);
      }
      console.log('searchCriteria: ', searchCriteria);
      // const ResultSearchCriteria = buildSearchCriteria(defaultsTo);
      const response: any = await tripService.getCOs({ searchCriteria });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse.COResult;

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
            'Invoice Approved': 'badge-fresh-green rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };
        return {
          ...row,
          CustomerOrderStatus: {
            value: row.CustomerOrderStatus,
            variant: getStatusColorLocal(row.CustomerOrderStatus),
          },
          TripBillingStatus: {
            value: row.TripBillingStatus,
            variant: getStatusColorLocal(row.TripBillingStatus),
          },
          DepartureDate: dateFormatter(row.DepartureDate),
          ArrivalDate: dateFormatter(row.ArrivalDate),
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
    // If parent provided data, use it; else fetch from API
    if (Array.isArray(data) && data.length > 0) {
      gridState.setColumns(initialColumns);
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
            'Under Execution': 'badge-purple rounded-2xl',
            'Draft Bill Raised': 'badge-orange rounded-2xl',
            'Not Eligible': 'badge-red rounded-2xl',
            'Revenue leakage': 'badge-red rounded-2xl',
            'Invoice Created': 'badge-blue rounded-2xl',
            'Invoice Approved': 'badge-fresh-green rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };
        return {
          ...row,
          CustomerOrderStatus: row.CustomerOrderStatus ? {
            value: row.CustomerOrderStatus,
            variant: getStatusColorLocal(row.CustomerOrderStatus),
          } : row.CustomerOrderStatus,
          TripBillingStatus: row.TripBillingStatus ? {
            value: row.TripBillingStatus,
            variant: getStatusColorLocal(row.TripBillingStatus),
          } : row.TripBillingStatus,
        };
      });
      gridState.setGridData(processedData);
      setApiStatus('success');
    } else {
      fetchTripsAgain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

  // Helper function to create unique row identifier
  const getUniqueRowId = (row: any) => {
    return `${row.CustomerOrderID}-${row.LegBehaviour}`;
  };

  // Update selected row indices based on current page data to maintain selection state
  useEffect(() => {
    const currentData = gridState.gridData.length > 0 ? gridState.gridData : processedData;
    const newSelectedIndices = new Set<number>();

    // Find indices of currently selected rows in the current page data
    // Use composite key (CustomerOrderID + LegBehaviour) for unique identification
    currentData.forEach((row: any, index: number) => {
      const uniqueId = getUniqueRowId(row);
      if (selectedRowIds.has(uniqueId)) {
        newSelectedIndices.add(index);
      }
    });

    // Only update if there's a difference to avoid infinite loops
    if (newSelectedIndices.size !== selectedRows.size ||
      !Array.from(newSelectedIndices).every(index => selectedRows.has(index))) {
      console.log('Updating selected row indices for current page:', Array.from(newSelectedIndices));
      setSelectedRows(newSelectedIndices);
    }
  }, [gridState.gridData, processedData, selectedRowIds]);

  // Navigate to the create new quick order page
  const navigate = useNavigate();

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    if (columnKey === 'TripPlanID') {
      navigate(`/manage-trip?id=${value.TripPlanID}`);
    }
    if (columnKey == "CustomerOrderID") {
      // onCustomerOrderClick(value);
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
    // Update selected row objects using composite key (CustomerOrderID + LegBehaviour)

    const currentData = gridState.gridData.length > 0 ? gridState.gridData : [];
    const selectedObjects = Array.from(selectedRowIndices)
      .map(index => currentData[index])
      .filter(Boolean);

    // Create a new Set of unique row IDs using composite key
    const newSelectedRowIds = new Set(selectedObjects.map(row => getUniqueRowId(row)));

    // Update selected row objects - no need to filter for uniqueness since we're using composite key
    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(selectedObjects);

    // Notify parent component about the selection change
    notifyParentOfSelection(selectedObjects);

    console.log('Selected row objects:', selectedObjects);
    console.log('Selected row IDs (composite keys):', Array.from(newSelectedRowIds));
  };

  const [rowTripId, setRowTripId] = useState<any>([]);

  const handleRowClick = (row: any, index: number) => {
    console.log('Row clicked:', row, index);

    // Toggle row selection using composite key (CustomerOrderID + LegBehaviour)
    const newSelectedRows = new Set(selectedRows);
    const newSelectedRowIds = new Set(selectedRowIds);
    const newSelectedRowObjects = [...selectedRowObjects];

    // Check if this row is already selected by composite key
    const uniqueId = getUniqueRowId(row);
    const isRowSelected = newSelectedRowIds.has(uniqueId);

    if (isRowSelected) {
      // Remove row: remove from all tracking sets/arrays
      newSelectedRows.delete(index);
      newSelectedRowIds.delete(uniqueId);
      const objectIndex = newSelectedRowObjects.findIndex(obj => getUniqueRowId(obj) === uniqueId);
      if (objectIndex > -1) {
        newSelectedRowObjects.splice(objectIndex, 1);
      }
      console.log('Removed row with composite key:', uniqueId);
    }
    else {
      // Add row: add to all tracking sets/arrays
      newSelectedRows.add(index);
      newSelectedRowIds.add(uniqueId);
      newSelectedRowObjects.push(row);
      console.log('Added row with composite key:', uniqueId);
    }

    // Update all state
    setSelectedRows(newSelectedRows);
    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(newSelectedRowObjects);

    // Notify parent component about the selection change
    notifyParentOfSelection(newSelectedRowObjects);

    console.log('Selected row objects after click:', newSelectedRowObjects);
    setRowTripId(Array.from(newSelectedRowIds));
    console.log('new set: ', Array.from(newSelectedRowIds)); // ✅ log directly
    console.log('Selected row IDs (composite keys) after click:', Array.from(newSelectedRowIds));
  };

  useEffect(() => {
    console.log("rowTripId updated:", rowTripId);
  }, [rowTripId]);

  // Notify parent component when selectedRowObjects changes
  useEffect(() => {
    notifyParentOfSelection(selectedRowObjects);
  }, [selectedRowObjects]);

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
          ScreenName: 'TripCOHubMultiple',
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
            ScreenName: 'TripCOHubMultiple',
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
            ScreenName: 'TripCOHubMultiple',
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
            ScreenName: 'TripCOHubMultiple',
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

  // const buildSearchCriteria: any = (latestFilters: any) => {
  //   const criteria: SearchCriteria = { ...tripCOSearchCriteria };
  //   if (Object.keys(latestFilters).length > 0) {
  //     Object.entries(latestFilters).forEach(([key, value]): any => {
  //       const filter: any = value; // 👈 cast to any
  //       if (key === "PlannedExecutionDate") {
  //         // criteria.PlannedExecutionDateFrom = filter?.value?.from.replace(/-/g, "/");
  //         // criteria.PlannedExecutionDateTo = filter?.value?.to.replace(/-/g, "/");
  //       } else {
  //         // all other keys map directly
  //         criteria[key] = filter.value;
  //       }
  //     });
  //     return criteria;
  //   }
  //   return criteria;
  // }

  const buildSearchCriteria = (latestFilters: Record<string, any> = {}): SearchCriteria => {
    const criteria: SearchCriteria = { ...tripCOSearchCriteria };

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

      // Convert Yes/No values to 1/0 for specific boolean fields
      if (key === 'IsShowForwardCustomerOrders' ||
        key === 'IsShowReturnCustomerOrders' ||
        key === 'IsShuntedOutWagons') {
        if (filterValue === true) {
          (criteria as any)[key] = '1';
        } else if (filterValue === false) {
          (criteria as any)[key] = '0';
        } else {
          (criteria as any)[key] = filterValue;
        }
      }
      // Handle date range fields - split into From/To fields
      else if (key === 'CustomerOrderCreationDate') {
        if (filterValue && typeof filterValue === 'object' && filterValue.from && filterValue.to) {
          (criteria as any)['CustomerOrderFromCreationDate'] = filterValue.from;
          (criteria as any)['CustomerOrderToCreationDate'] = filterValue.to;
        } else {
          (criteria as any)[key] = filterValue;
        }
      }
      else if (key === 'CustomerOrderDate') {
        if (filterValue && typeof filterValue === 'object' && filterValue.from && filterValue.to) {
          (criteria as any)['CustomerOrderDateFrom'] = filterValue.from;
          (criteria as any)['CustomerTOrderDateTo'] = filterValue.to;
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
    const finalSearchCriteria = buildSearchCriteria(latestFilters);
    console.log('buildSearchCriteria: ', finalSearchCriteria);

    // Debug: Log Yes/No field conversions
    const yesNoFields = ['IsShowForwardCustomerOrders', 'IsShowReturnCustomerOrders', 'IsShuntedOutWagons'];
    yesNoFields.forEach(field => {
      if (latestFilters[field]) {
        console.log(`${field}: "${latestFilters[field]?.value || latestFilters[field]}" -> "${finalSearchCriteria[field]}"`);
      }
    });

    // Debug: Log date range field conversions
    const dateRangeFields = ['CustomerOrderCreationDate', 'CustomerOrderDate'];
    dateRangeFields.forEach(field => {
      if (latestFilters[field]) {
        const filterValue = latestFilters[field]?.value || latestFilters[field];
        if (filterValue && typeof filterValue === 'object' && filterValue.from && filterValue.to) {
          console.log(`${field}: {from: "${filterValue.from}", to: "${filterValue.to}"} -> CustomerOrderFrom${field.replace('CustomerOrder', '')}: "${finalSearchCriteria[`CustomerOrderFrom${field.replace('CustomerOrder', '')}`]}" & CustomerOrderTo${field.replace('CustomerOrder', '')}: "${finalSearchCriteria[`CustomerOrderTo${field.replace('CustomerOrder', '')}`]}"`);
        }
      }
    });
    const plannedDate = latestFilters["PlannedExecutionDate"];
    // if (!plannedDate?.value?.from || !plannedDate?.value?.to) {
    //   toast({
    //     title: "Planned Execution Date Range",
    //     description: "Please select a Planned Execution Date before searching.",
    //     variant: "destructive", // 👈 makes it red/error style
    //   });
    //   return;
    // }

    try {
      gridState.setLoading(true);
      setApiStatus('loading');

      const response: any = await tripService.getCOs({
        searchCriteria: finalSearchCriteria
      });

      console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.COResult;

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
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
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
          DepartureDate: dateFormatter(row.DepartureDate),
          ArrivalDate: dateFormatter(row.ArrivalDate),
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
      label: 'Customer ID',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Customer Init"),
      // multiSelect: true
    },
    {
      key: 'PlanningProfileID',
      label: 'Planning Profile',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("PlanningProfile Init"),
      hideSearch: false,
      disableLazyLoading: true
    },
    {
      key: 'Location',
      label: 'Location',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Location Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'PlanDate',
      label: 'Plan Date',
      type: 'date'
    },
    // {
    //   key: 'Customer Name',
    //   label: 'Customer Name',
    //   type: 'lazyselect', // lazy-loaded dropdown
    //   fetchOptions: makeLazyFetcher("Customer Init"),
    //   hideSearch: true,
    //   disableLazyLoading: true
    // },
    {
      key: 'ContractID',
      label: 'Contract ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Contract Init'),
    },
    {
      key: 'DepartureDate',
      label: 'Departure Date',
      type: 'date'
    },
    {
      key: 'ArrivalDate',
      label: 'Arrival Date',
      type: 'date'
    },
    {
      key: 'CustomerOrderID', label: 'Customer Order ID', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("CustomerOrder Number Init")
    },
    {
      key: 'DepartureLocation', label: 'Departure Location', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Departure Init")
    },
    // {
    //   key: 'Departure Location Description', label: 'Departure Location Description', type: 'lazyselect',
    //   fetchOptions: makeLazyFetcher("Departure Init")
    // },
    {
      key: 'ArrivalLocation', label: 'Arrival Location', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Arrival Init")
    },
    {
      key: 'LegID', label: 'leg ID', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Leg ID Init")
    },
    // {
    //   key: 'leg Description', label: 'leg Description', type: 'lazyselect',
    //   fetchOptions: makeLazyFetcher("Leg ID Init")
    // },
    {
      key: 'TransportMode', label: 'Transport Mode', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Transport Mode Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'COStatus', label: 'CO Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Customer Order status Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'Service', label: 'Service', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Service type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'CustomerOrderCreationDate',
      label: 'Creation Date Between',
      type: 'dateRange',
      defaultValue: {
        from: format(subMonths(new Date(), 3), "yyyy-MM-dd"), // 2 months back
        to: format(addMonths(new Date(), 3), "yyyy-MM-dd"),   // 1 month ahead
      }
    },
    {
      key: 'CustomerOrderDate',
      label: 'Customer Order Date',
      type: 'dateRange',
    },
    {
      key: 'CustomerRefNo', label: 'Customer Ref. No.', type: 'text',
      // fetchOptions: makeLazyFetcher("CustomerRefNo Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'Cluster', label: 'Cluster', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Cluster Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'LoadType', label: 'Load Type', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Load type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'ShuntedOutEquipment', label: 'Shunted out equipment', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Equipment ID Init")
    },
    {
      key: 'IsShuntedOutWagons',
      label: 'Shunted out wagons',
      type: 'select',
      options: [
        { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
        { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
      ] as any[],
    },
    // {
    //   key: 'IsShowForwardCustomerOrders',
    //   label: 'Show Forward',
    //   type: 'select',
    //   options: [
    //     { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
    //     { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
    //   ] as any[],
    // },
    // {
    //   key: 'IsShowReturnCustomerOrders',
    //   label: 'Show Return',
    //   type: 'select',
    //   options: [
    //     { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
    //     { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
    //   ] as any[],
    // }
    {
      key: 'IsShowForwardCustomerOrders',
      label: 'Show Forward',
      type: 'switch'
    },
    {
      key: 'IsShowReturnCustomerOrders',
      label: 'Show Return',
      type: 'switch'
    }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  const handleGridPreferenceSave = async (preferences: any) => {
    try {
      // Get the latest preferences from localStorage to ensure we have the full state
      const storedPreferences = localStorage.getItem('smartgrid-preferences');
      const preferencesToSave = storedPreferences ? JSON.parse(storedPreferences) : preferences;

      console.log('Saving TripCOHubMultiple SmartGrid preferences:', preferencesToSave);
      console.log('Preference ModeFlag:', preferenceModeFlag);

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'TripCOHubMultiple',
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
        console.log('TripCOHubMultiple: handleServerFilterPreferenceSave called', { visibleFields, fieldOrder, fieldLabels });
        try {
          const preferencesToSave = {
            visibleFields,
            fieldOrder,
            fieldLabels
          };
    
          const response = await quickOrderService.savePersonalization({
            LevelType: 'User',
            // LevelKey: 'ramcouser',
            ScreenName: 'TripCOHubMultiple',
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

  return (
    <>
      {/* <AppLayout> */}
      <div className="">
        <div className="container-fluid mx-auto space-y-6">
          {/* Grid Container */}
          <div className={`rounded-lg ${config.visible ? 'pb-4' : ''}`}>
            {selectedRowObjects.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 mb-2">
                <div className="text-sm text-blue-700">
                  <span className="font-medium">{selectedRowObjects.length}</span> row{selectedRowObjects.length !== 1 ? 's' : ''} selected
                  <span className="ml-2 text-xs">
                    ({selectedRowObjects.map(row => row.CustomerOrderID).join(', ')})
                  </span>
                </div>
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
                  background-color: #ffa50026 !important;
                  border-left: 4px solid orange !important;
                }
                tr[data-row-id="${rowId}"]:hover {
                  background-color: #ffa50026 !important; 
                }
              `;
            }).join('\n')}
                        `}</style>
            {/* Selected rows indicator */}
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
                rowClassName={(row: any, index: number) => {
                  const uniqueId = getUniqueRowId(row);
                  return selectedRowIds.has(uniqueId) ? 'selected' : '';
                }}
                nestedRowRenderer={renderSubRow}
                // configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Trip Customer Orders Multi"
                recordCount={gridState.gridData.length}
                showCreateButton={true}
                searchPlaceholder="Search"
                clientSideSearch={true}
                showSubHeaders={false}
                hideAdvancedFilter={true}
                customPageSize={pageSize}
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
      {/* </AppLayout> */}

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
