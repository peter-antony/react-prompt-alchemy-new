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

export const TripCOHub = ({ onCustomerOrderClick, tripID, manageFlag, customerOrdersData }) => {
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
  console.log('TripCOHub received props - tripID:', tripID, 'manageFlag:', manageFlag, 'customerOrdersData:', customerOrdersData);

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
    {
      key: "TripID",
      label: "Trip ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 4
    },
    {
      key: "TripStatus",
      label: "Trip Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 5
    },
    {
      key: "LegFromDescription",
      label: "Leg From",
      type: "TextPipedData",
      sortable: true,
      editable: false,
      subRow: false,
      order: 6
    },
    // {
    //   key: "LegFromDescription",
    //   label: "Leg From Description",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 7
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
    //   order: 9
    // },
    {
      key: "TransportMode",
      label: "Transport Mode",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 10
    },
    {
      key: "DepartureDate",
      label: "Departure Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 11
    },
    {
      key: "ArrivalDate",
      label: "Arrival Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 12
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

  // Copy of initialColumns for when tripID is available
  const tripColumns: GridColumnConfig[] = [
    {
      key: "CustomerOrderNo",
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
    {
      key: "TripID",
      label: "Trip ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 4
    },
    {
      key: "TripStatus",
      label: "Trip Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      order: 5
    },
    {
      key: "LegFromDescription",
      label: "Leg From",
      type: "TextPipedData",
      sortable: true,
      editable: false,
      subRow: false,
      order: 6
    },
    // {
    //   key: "LegFromDescription",
    //   label: "Leg From Description",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: false,
    //   order: 7
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
    //   order: 9
    // },
    {
      key: "TransportMode",
      label: "Transport Mode",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 10
    },
    {
      key: "DepartureDate",
      label: "Departure Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 11
    },
    {
      key: "ArrivalDate",
      label: "Arrival Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      order: 12
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
  ];

  const [highlightedRows, setHighlightedRows] = useState<string[]>([]);

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
          ...tripCOSearchCriteria,
          CustomerOrderCreationDate: {
            from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            to: format(new Date(), 'yyyy-MM-dd')
          }
        };
        searchCriteria = buildSearchCriteria(defaultFilters);
        console.log('Using default filters with CustomerOrderCreationDate:', defaultFilters);
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
        }
      });
      console.log("processedData", processedData);
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

  // Log when tripID or manageFlag props change
  useEffect(() => {
    console.log('TripCOHub props updated - tripID:', tripID, 'manageFlag:', manageFlag);
  }, [tripID, manageFlag]);

  // Handle CustomerOrders data from parent component
  useEffect(() => {
    console.log("customerOrdersData", customerOrdersData);
    if (customerOrdersData && customerOrdersData.length > 0) {
      console.log('📋 Received CustomerOrders data from parent:', customerOrdersData);
      
      // Process the CustomerOrders data similar to API response
      const processedData = customerOrdersData.map((row: any) => {
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
          CustomerOrderStatus: {
            value: row.CustomerOrderStatus,
            variant: getStatusColorLocal(row.CustomerOrderStatus),
          },
          TripBillingStatus: {
            value: row.TripBillingStatus,
            variant: getStatusColorLocal(row.TripBillingStatus),
          },
        }
      });

      // Use tripColumns if tripID is available, otherwise use initialColumns
      const columnsToUse = tripID ? tripColumns : initialColumns;
      
      // Set the processed data to grid
      gridState.setColumns(columnsToUse);
      gridState.setGridData(processedData);
      setApiStatus("success");
      console.log('✅ CustomerOrders data bound to grid:', processedData);
    }
  }, [customerOrdersData, tripID]);

  // Initialize columns and data
  useEffect(() => {
    // Don't fetch if tripID is provided (parent will handle data fetch)
    if (tripID) {
      console.log('📋 TripID provided, waiting for parent to fetch data...');
      return;
    }
    
    // Only fetch from API if no CustomerOrders data is provided from parent
    if (!customerOrdersData || customerOrdersData.length === 0) {
      console.log('🔄 No CustomerOrders data from parent, fetching from API...');
      fetchTripsAgain();
    } else {
      console.log('📋 Using CustomerOrders data from parent, skipping API fetch');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripID]); // Only run when tripID changes

  // Log highlightedRows changes
  useEffect(() => {
    console.log('highlightedRows updated (composite keys):', highlightedRows);
  }, [highlightedRows]);

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

  const handleLinkClick = (value: any, columnKey: any, rowIndex: any) => {
    console.log("Link clicked:", value, columnKey);
    if (columnKey === 'TripPlanID') {
      navigate(`/manage-trip?id=${value.TripPlanID}`);
    }
    if (columnKey == "CustomerOrderID") {
      console.log('rowIndex', rowIndex);
      
      // Create composite key string from CustomerOrderID and LegBehaviour
      const compositeKey = `${value.CustomerOrderID}-${value.LegBehaviour}`;
      console.log('compositeKey:', compositeKey);
      
      // Check if this row is currently highlighted
      const isCurrentlyHighlighted = highlightedRows.includes(compositeKey);
      
      if (isCurrentlyHighlighted) {
        // If it's already highlighted, remove it (toggle off)
        setHighlightedRows(prev => prev.filter(key => key !== compositeKey));
        onCustomerOrderClick(value, false); // Pass false to indicate deselection
        console.log('Row unselected:', compositeKey);
      } else {
        // If it's not highlighted, add it (toggle on)
        setHighlightedRows(prev => [...prev, compositeKey]);
        onCustomerOrderClick(value, true); // Pass true to indicate selection
        console.log('Row selected:', compositeKey);
      }
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
        if (filterValue === 'Yes') {
          (criteria as any)[key] = '1';
        } else if (filterValue === 'No') {
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
      hideSearch: true,
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
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
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
      ]
    },
    {
      key: 'IsShowForwardCustomerOrders',
      label: 'Show Forward',
      type: 'select',
      options: [
        { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
        { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
      ]
    },
    {
      key: 'IsShowReturnCustomerOrders',
      label: 'Show Return',
      type: 'select',
      options: [
        { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
        { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
      ]
    }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  // Function to clear all highlighted rows
  const clearAllSelections = () => {
    setHighlightedRows([]);
    // Also clear the parent component's selected data
    onCustomerOrderClick(null, false);
    console.log('All selections cleared');
  }

  return (
    <>
      {/* <AppLayout> */}
      <div className="">
        <div className="container-fluid mx-auto space-y-6">
          {/* Clear Selections Button */}
          {/* {highlightedRows.length > 0 && (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllSelections}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All Selections ({highlightedRows.length})
              </Button>
            </div>
          )} */}
          
          {/* Grid Container */}
          <div className={`rounded-lg ${config.visible ? 'pb-4' : ''}`}>
            {/* Selected rows indicator */}
            <SmartGridWithGrouping
              key={`grid-${gridState.forceUpdate}`}
              columns={gridState.columns}
              data={gridState.gridData}
              highlightedRowIndices={highlightedRows}
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
