import React, { useState, useEffect, useMemo } from 'react';
import { SideDrawer } from '@/components/SideDrawer';
import { SmartGrid, SmartGridWithGrouping } from '@/components/SmartGrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { GridColumnConfig, GridColumnType, FilterConfig, ServerFilter } from '@/types/smartgrid';
import { quickOrderService } from '@/api/services/quickOrderService';
import { useFilterStore } from "@/stores/filterStore";
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subMonths, addMonths } from 'date-fns';
import { tripCOSearchCriteria, SearchCriteria } from "@/constants/tripCOSearchCriteria";
import { tripService } from "@/api/services/tripService";
import { useNavigate } from 'react-router-dom';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { filterService } from '@/api/services';

interface AddCOToTripSidedrawProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCO: () => void;
  // onAddResource: (formattedData?: { ResourceID: string; ResourceType: string }[]) => void;
  // resourceType: 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule';
  resourceData?: any[];
  selectedTripData?: any;
  isLoading?: boolean;
}

// Resource type configurations
const resourceConfigs = {
  Equipment: {
    messageType: 'GetEquipment-CreateTripPlan',
    title: 'Select Equipment',
    buttonText: 'Add Equipment to CO',
    gridTitle: 'Equipment',
    idField: 'EquipmentID', // Primary ID field for this resource type
    columns: [
      {
        key: 'EquipmentType',
        label: 'Equipment Type',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'EquipmentID',
        label: 'Equipment ID',
        type: 'Text' as GridColumnType,
        width: 200,
        editable: false
      },
      {
        key: 'OwnerID',
        label: 'Owner ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'EquipmentCategory',
        label: 'Wagon/Container',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'Ownership',
        label: 'Ownership',
        type: 'Badge' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'Keeper',
        label: 'Keeper',
        type: 'Text' as GridColumnType,
        width: 120,
        editable: false
      }
    ]
  },
  Supplier: {
    messageType: 'GetAgents-CreateTripPlan',
    title: 'Select Supplier',
    buttonText: 'Add Supplier to CO',
    gridTitle: 'Supplier',
    idField: 'VendorID', // Primary ID field for this resource type
    columns: [
      {
        key: 'VendorID',
        label: 'Vendor ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'VendorName',
        label: 'Vendor Name',
        type: 'Text' as GridColumnType,
        width: 200,
        editable: false
      },
      {
        key: 'ServiceType',
        label: 'Service Type',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'SubServiceType',
        label: 'Sub Service Type',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'ContractID',
        label: 'Contract ID',
        type: 'Text' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'RatingOnTime',
        label: 'Rating',
        type: 'Text' as GridColumnType,
        width: 100,
        editable: false
      }
    ]
  },
  Driver: {
    messageType: 'GetDrivers-CreateTripPlan',
    title: 'Select Driver',
    buttonText: 'Add Driver to CO',
    gridTitle: 'Driver',
    idField: 'DriverCode', // Primary ID field for this resource type
    columns: [
      {
        key: 'DriverCode',
        label: 'Driver ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'DriverName',
        label: 'Driver Name',
        type: 'Text' as GridColumnType,
        width: 200,
        editable: false
      },
      {
        key: 'DriverStatus',
        label: 'Status',
        type: 'Badge' as GridColumnType,
        width: 120,
        editable: false
      },
    ]
  },
  Handler: {
    messageType: 'GetHandlers-CreateTripPlan',
    title: 'Select Handler',
    buttonText: 'Add Handler to CO',
    gridTitle: 'Handler',
    idField: 'HandlerID', // Primary ID field for this resource type
    columns: [
      {
        key: 'HandlerID',
        label: 'Handler ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'HandlerName',
        label: 'Handler Name',
        type: 'Text' as GridColumnType,
        width: 200,
        editable: false
      },
      {
        key: 'HandlerGrade',
        label: 'Handler Grade',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'Supplier',
        label: 'Supplier',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'ContractID',
        label: 'ContractID',
        type: 'Text' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'TarifID',
        label: 'TarifID',
        type: 'Text' as GridColumnType,
        width: 100,
        editable: false
      }
    ]
  },
  Vehicle: {
    messageType: 'GetVehicle-CreateTripPlan',
    title: 'Select Vehicle',
    buttonText: 'Add Vehicle to CO',
    gridTitle: 'Vehicle',
    idField: 'VehicleID', // Primary ID field for this resource type
    columns: [
      {
        key: 'VehicleID',
        label: 'Vehicle ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'VehicleType',
        label: 'Vehicle Type',
        type: 'Text' as GridColumnType,
        width: 200,
        editable: false
      },
      {
        key: 'ContractID',
        label: 'Contract ID',
        type: 'Text' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'OwnerID',
        label: 'Owner ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'VehicleStatus',
        label: 'Vehicle Status',
        type: 'Badge' as GridColumnType,
        width: 120,
        editable: false
      },
    ]
  },
  Schedule: {
    messageType: 'GetSchedules-CreateTripPlan',
    title: 'Select Schedule',
    buttonText: 'Add Schedule to CO',
    gridTitle: 'Schedule',
    idField: 'SupplierID', // Primary ID field for this resource type
    columns: [
      {
        key: 'SupplierID',
        label: 'Supplier ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'ScheduleNo',
        label: 'Schedule No',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'SupplierName',
        label: 'Supplier Name',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'ExecutiveCarrierID',
        label: 'Executive Carrier ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'ExecutiveCarrierName',
        label: 'Executive Carrier Name',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      // {
      //   key: '',
      //   label: 'Via',
      //   type: 'Text' as GridColumnType,
      //   width: 150,
      //   editable: false
      // },
      // {
      //   key: '',
      //   label: 'Reccuring Schedule (RS)',
      //   type: 'Text' as GridColumnType,
      //   width: 150,
      //   editable: false
      // },
      {
        key: 'FromLocation',
        label: 'From Location',
        type: 'Text' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'ToLocation',
        label: 'To Location',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'TotalTransitTime',
        label: 'Total Transit Time',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'TransitTimeUnit',
        label: 'Transit Time Unit',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'PathNo',
        label: 'Path No',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'Resources',
        label: 'Resources',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'Distance',
        label: 'Distance',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'DistanceUOM',
        label: 'Distance UOM',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'MaxLength',
        label: 'Max Length',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'MaxGrossWeight',
        label: 'Max Gross Weight',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'MaxNoOfWagon',
        label: 'Max No of Wagon',
        type: 'Date' as GridColumnType,
        width: 120,
        editable: false
      },
    ]
  }
};

export const AddCOToTripSidedraw: React.FC<AddCOToTripSidedrawProps> = ({
  isOpen,
  onClose,
  onAddCO,
  selectedTripData,
  resourceData: propResourceData,
  isLoading = false
}) => {
  const pageSize = 15;
  const gridId = "CO-Trip"; // same id you pass to SmartGridWithGrouping
  const { activeFilters, setActiveFilters } = useFilterStore();
  const filtersForThisGrid = activeFilters[gridId] || {};
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [searchData, setSearchData] = useState<Record<string, any>>({});
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const { toast } = useToast();
  // const { config, setFooter, resetFooter } = useFooterStore();
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);

  console.log('filtersForThisGrid: ', filtersForThisGrid);
  console.log('selectedTripData ----------', selectedTripData);
  // Helper function to notify parent component about selected rows
  const notifyParentOfSelection = (selectedObjects: any[]) => {
    if (onAddCO) {
      // onAddCO(selectedObjects);
    }
  };
  // console.log('TripCOHub received props - tripID:', tripID, 'manageFlag:', manageFlag, 'customerOrdersData:', customerOrdersData);
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
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
      order: 9
    },
    {
      key: "ArrivalDate",
      label: "Arrival Date",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
      order: 10
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
          TripStatus: {
            value: row.TripStatus,
            variant: getStatusColorLocal(row.TripStatus),
          }
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
  }, []);

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
      // navigate(`/manage-trip?id=${value.TripPlanID}`);
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
    {
      key: 'IsShowForwardCustomerOrders',
      label: 'Show Forward',
      type: 'select',
      options: [
        { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
        { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
      ] as any[],
    },
    {
      key: 'IsShowReturnCustomerOrders',
      label: 'Show Return',
      type: 'select',
      options: [
        { id: '1', name: 'Yes', default: "N", description: "", seqNo: 1 },
        { id: '2', name: 'No', default: "N", description: "", seqNo: 2 }
      ] as any[],
    }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  /**
   * Transform selected CO row objects to include only the required fields
   * These fields are needed for the trip planning workflow
   */
  function flattenStatusFields(obj) {
    const newObj = { ...obj };
    for (const key in newObj) {
      const val = newObj[key];
      if (val && typeof val === "object" && "value" in val) {
        newObj[key] = val.value;
        newObj['DepartureLegFrom'] = newObj['LegFromDescription'];
        newObj['DepartureLegTo'] = newObj['LegToDescription'];
      }
    }
    return newObj;
  }

  const handleCOToTrip = async () => {
    console.log("handleCOToTrip - Original selectedRowObjects ===", selectedRowObjects);

    // Transform the selected rows to include only required fields
    // const transformedCOData = selectedRowObjects.map(flattenStatusFields);
    console.log("handleCOToTrip - Transformed CO Data ===", selectedRowObjects);

    // Pass transformed data to parent callback
    // onAddCO();// Send to API
    let dataToSave = {
      Header: {
        TripNo: selectedTripData?.Header?.TripNo,
      },
      CustomerOrders: [
        ...(selectedTripData?.CustomerOrders?.map(order => ({
          CustomerOrderNo: order.CustomerOrderNo,
          LegBehaviour: order.LegBehaviour,
          ModeFlag: order.ModeFlag || "Nochange", // default if missing
        })) || []),
        ...(selectedRowObjects?.map(order => ({
          CustomerOrderNo: order.CustomerOrderID,
          LegBehaviour: order.LegBehaviour,
          ModeFlag: 'Insert', // New CO to be added to the trip
        })) || []),
      ]
    };
    const response: any = await tripService.saveLegAndEventsTripLevel(dataToSave);
    console.log('response = ', response);

    // Check if response has data
    if (response?.data) {
      const { IsSuccess, ResponseData, Message } = response.data;

      // Parse ResponseData if it exists (it's a JSON string)
      let parsedResponseData: any = null;
      if (ResponseData) {
        try {
          parsedResponseData = JSON.parse(ResponseData);
        } catch (parseError) {
          console.warn('Failed to parse ResponseData:', parseError);
        }
      }

      // Check for error in parsed ResponseData even if IsSuccess is true
      if (parsedResponseData?.error) {
        const { errorCode, errorMessage } = parsedResponseData.error;
        toast({
          title: errorCode || "Error",
          description: errorMessage || Message || "Failed to save CO",
          variant: "destructive",
        });
        return;
      }

      // If IsSuccess is true and no error in ResponseData, show success
      if (IsSuccess) {
        toast({
          title: "Success",
          description: Message || "",
        });
        onAddCO();// Send to API
        // Refresh data from API after successful save
        // if (tripId) {
        //   await loadFromApi({ tripId });
        // }
        // Also call the optional onSave callback if provided
        // if (onSave) {
        //   await onSave();
        // }
      } else {
        throw new Error(Message || "Failed to save leg and events");
      }
    } else {
      throw new Error("No response data received");
    }


  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title='Select Customer Order'
      width="85%"
      slideDirection="right"
      showFooter={true}
      footerButtons={[
        {
          label: 'Add CO to Trip',
          variant: 'default',
          action: handleCOToTrip,
          disabled: selectedRowIds.size === 0
        }
      ]}
    >
      {/* <AppLayout> */}
      <div className="p-6">
        <div className="container-fluid mx-auto space-y-6">
          {/* Grid Container */}
          <div>
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
                  background-color: #eff6ff !important;
                  border-left: 4px solid #3b82f6 !important;
                }
                tr[data-row-id="${rowId}"]:hover {
                  background-color: #dbeafe !important;
                }
              `;
            }).join('\n')}
                        `}</style>
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
                const uniqueId = getUniqueRowId(row);
                return selectedRowIds.has(uniqueId) ? 'selected' : '';
              }}
              nestedRowRenderer={renderSubRow}
              // configurableButtons={gridConfigurableButtons}
              showDefaultConfigurableButton={false}
              gridTitle="Customer Order"
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
    </SideDrawer>
  );
};
