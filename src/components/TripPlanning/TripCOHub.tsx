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

export const TripCOHub = ({onCustomerOrderClick }) => {
  const pageSize = 15;
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

  console.log('filtersForThisGrid: ', filtersForThisGrid);

  const initialColumns: GridColumnConfig[] = [
    {
      key: "CustomerOrderID",
      label: "Customer Order",
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
      key: "TripID",
      label: "Trip ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 3
    },
    {
      key: "TripStatus",
      label: "Trip Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 4
    },
    {
      key: "LegFromDescription",
      label: "Leg From & To",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 5
    },
    {
      key: "DepartureDate",
      label: "Departure Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 6
    },
    {
      key: "ArrivalDate",
      label: "Arrival Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 9
    },
    {
      key: "Resources",
      label: "Resources",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 10
    },
    {
      key: "TrainParams",
      label: "Train Para.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 11
    },
    {
      key: "Actions",
      label: "Actions",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 11
    }
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
        searchCriteria = buildSearchCriteria(
          // PlannedExecutionDate: {
          //   value: {
          //     from: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
          //     to: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
          //   }
          //
          tripCOSearchCriteria
      );
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

  // Navigate to the create new quick order page
  const navigate = useNavigate();

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    if (columnKey === 'TripPlanID') {
      navigate(`/manage-trip?id=${value.TripPlanID}`);
    }
    if(columnKey == "CustomerOrderID") {
      onCustomerOrderClick(value.CustomerOrderID);
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
  };

  useEffect(() => {
    console.log("rowTripId updated:", rowTripId);
  }, [rowTripId]);

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
    if (filter && typeof filter === "object" && "value" in filter) {
      (criteria as any)[key] = filter.value;
    } else {
      (criteria as any)[key] = value;
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
      // multiSelect: true
    },
    {
      key: 'PlanningProfileID',
      label: 'Planning Profile',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("PlanningProfile Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'Location',
      label: 'Location',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Location Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'Customer Name',
      label: 'Customer Name',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Customer Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'Contract ID', label: 'Contract ID', type: 'text'
    },
    {
      key: 'Contract Description', label: 'Contract Description', type: 'text'
    },
    {
      key: 'CustomerOrderProfileID', label: 'Customer Order ID', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("CustomerOrder Number Init")
    },
    {
      key: 'Departurepoint', label: 'Departure Location', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Departure Init")
    },
    {
      key: 'Departure Location Description', label: 'Departure Location Description', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Departure Init")
    },
    {
      key: 'ArrivalPoint', label: 'Arrival Location', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Arrival Init")
    },
    {
      key: 'leg ID', label: 'leg ID', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Leg ID Init")
    },
    {
      key: 'leg Description', label: 'leg Description', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Leg ID Init")
    },
    {
      key: 'Transport Mode', label: 'Transport Mode', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Transport Mode Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'CO Status', label: 'CO Status', type: 'lazyselect',
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
      key: 'Customer Ref. No.', label: 'Customer Ref. No.', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("CustomerRefNo Init"),
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
      key: 'Shunted out equipment', label: 'Shunted out equipment', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Equipment ID Init")
    },
    { key: 'Shunted out wagons', label: 'Shunted out wagons', type: 'text'},
    { key: 'Show Forward', label: 'Show Forward', type: 'text' }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  return (
    <>
      {/* <AppLayout> */}
        <div className="">
          <div className="container-fluid mx-auto space-y-6">
            {/* Grid Container */}
            <div className={`rounded-lg mt-4 ${config.visible ? 'pb-4' : ''}`}>
              {/* Selected rows indicator */}
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
                // configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Trip Customer Orders"
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
                api={filterService}
              />
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
