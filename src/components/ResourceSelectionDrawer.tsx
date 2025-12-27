import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SideDrawer } from '@/components/SideDrawer';
import { SmartGrid, SmartGridWithGrouping } from '@/components/SmartGrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { GridColumnConfig, GridColumnType } from '@/types/smartgrid';
import { quickOrderService } from '@/api/services/quickOrderService';
import { toast } from '@/hooks/use-toast';
import { tripPlanningService } from '@/api/services/tripPlanningService';
import EquipmentCalendarPanel from '@/components/EquipmentCalendarPanel';
import { EquipmentItem, EquipmentCalendarEvent } from '@/types/equipmentCalendar';

interface ResourceSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (formattedData?: { ResourceID: string; ResourceType: string }[]) => void;
  resourceType: 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule';
  resourceData?: any[];
  selectedResourcesRq?: any;
  isLoading?: boolean;
  saveButtonEnableFlag?: boolean;
  tripInformation?: any;
  onUpdateTripInformation?: (updatedTripInformation: any) => void;
  onRefresh?: () => void;
  /** Callback to expose current filter state for list view API calls */
  onFiltersChange?: (filters: any) => void;
}

// Resource type configurations
const resourceConfigs = {
  Equipment: {
    messageType: 'GetEquipment-CreateTripPlan',
    title: 'Select Equipment',
    buttonText: 'Add Equipment to Trip',
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
    buttonText: 'Add Supplier to Trip',
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
    buttonText: 'Add Driver to Trip',
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
    buttonText: 'Add Handler to Trip',
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
    buttonText: 'Add Vehicle to Trip',
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
    buttonText: 'Add Schedule to Trip',
    gridTitle: 'Schedule',
    idField: 'ScheduleNo', // Primary ID field for this resource type
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
      {
        key: 'Viadummy',  // dummy field. later replace with implementation logic
        label: 'Via',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'ReccuringScheduledummy',  // dummy field. later replace with implementation logic
        label: 'Reccuring Schedule (RS)',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
    ]
  }
};

export const ResourceSelectionDrawer: React.FC<ResourceSelectionDrawerProps> = ({
  isOpen,
  onClose,
  onAddResource,
  resourceType,
  selectedResourcesRq,
  resourceData: propResourceData,
  isLoading = false,
  saveButtonEnableFlag = false,
  tripInformation,
  onUpdateTripInformation,
  onRefresh,
  onFiltersChange
}) => {
  const [serviceType, setServiceType] = useState<string>();
  const [subServiceType, setSubServiceType] = useState<string>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [rowTripId, setRowTripId] = useState<any>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list'); // View mode state
  const [isCalendarFilterOpen, setIsCalendarFilterOpen] = useState(false);
  const [applyCalendarFilter, setApplyCalendarFilter] = useState<((payload: any) => Promise<void> | void) | null>(null);
  const [getCalendarEquipments, setGetCalendarEquipments] = useState<(() => EquipmentItem[]) | null>(null);

  // Calendar filter form state
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<'Wagon' | 'Container' | ''>('');
  const [wagonSelection, setWagonSelection] = useState<string | undefined>();
  const [containerSelection, setContainerSelection] = useState<string | undefined>();
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState<string>('');
  const [fromDateTime, setFromDateTime] = useState<string>('');
  const [toDateTime, setToDateTime] = useState<string>('');
  const [equipmentGroup, setEquipmentGroup] = useState<string | undefined>();
  const [equipmentContract, setEquipmentContract] = useState<string | undefined>();
  const [contractSupplier, setContractSupplier] = useState<string | undefined>();
  const [equipmentOwner, setEquipmentOwner] = useState<string | undefined>();

  // Helper: extract ID or Name from piped data "ID || Name" (same as EquipmentCalendarPanel)
  const getPipedPart = (value: string | undefined, part: 'id' | 'name'): string => {
    if (!value) return '';
    const raw = String(value);
    const [idPart, namePart] = raw.split('||').map((s) => s?.trim());

    if (!namePart) {
      // Not actually piped data, just return the whole value
      return raw.trim();
    }

    return part === 'id' ? (idPart || '') : (namePart || '');
  };

  // Helper: build filter payload for calendar view (includes FromDate/ToDate)
  const buildCalendarFilterPayload = () => {
    if (resourceType !== 'Equipment') {
      return null;
    }
    const payload = {
      EquipmentCategory: equipmentTypeFilter || '',
      EquipmentType: '',
      EquipmentCode: wagonSelection || '',
      EquipmentStatus: equipmentStatusFilter || '',
      FromDate: fromDateTime || '',
      ToDate: toDateTime || '',
      EquipmentGroup: equipmentGroup || '',
      EquipmentContract: equipmentContract || '',
      ContractAgent: contractSupplier || '',
      EquipmentOwner: equipmentOwner || '',
    };
    console.log('ResourceSelectionDrawer: buildCalendarFilterPayload - built payload:', payload);
    return payload;
  };

  // Handler to clear all filter values
  const handleClearFilters = () => {
    setEquipmentTypeFilter('');
    setWagonSelection(undefined);
    setContainerSelection(undefined);
    setEquipmentStatusFilter('');
    setFromDateTime('');
    setToDateTime('');
    setEquipmentGroup(undefined);
    setEquipmentContract(undefined);
    setContractSupplier(undefined);
    setEquipmentOwner(undefined);
    console.log('ResourceSelectionDrawer: All filters cleared');
  };

  // Get configuration for current resource type
  const config = resourceConfigs[resourceType];

  // Use prop data if provided, otherwise use local data
  const currentResourceData = propResourceData || resourceData;

  // Get the ID field for the current resource type
  const getIdField = () => config.idField;

  // Service Type options fetch function
  // const fetchServiceTypeOptions = async (params: { searchTerm: string; offset: number; limit: number }) => {
  //   // Mock API call - replace with actual API
  //   const mockOptions = [
  //     { label: 'Service Type 1', value: 'Service Type 1' },
  //     { label: 'Service Type 2', value: 'Service Type 2' },
  //     { label: 'Service Type 3', value: 'Service Type 3' }
  //   ];
    
  //   return mockOptions.filter(option => 
  //     option.label.toLowerCase().includes(params.searchTerm.toLowerCase())
  //   );
  // };

  // Service Type options fetch function (real API)
  const fetchServiceTypeOptions = async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      const response = await quickOrderService.getMasterCommonData({
        messageType: "Service type Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data;
      const parsedData = JSON.parse(rr.ResponseData) || [];

      return parsedData
        .filter((item: any) => item.id && item.name)
        .map((item: any) => ({
          label: `${item.id} || ${item.name}`,
          value: `${item.id} || ${item.name}`,
        }));
    } catch (error) {
      console.error("Error fetching service type options:", error);
      return [];
    }
  };

  // Sub Service Type options fetch function
  // const fetchSubServiceTypeOptions = async (params: { searchTerm: string; offset: number; limit: number }) => {
  //   // Mock API call - replace with actual API
  //   const mockOptions = [
  //     { label: 'Subservice Type 1', value: 'Subservice Type 1' },
  //     { label: 'Subservice Type 2', value: 'Subservice Type 2' },
  //     { label: 'Subservice Type 3', value: 'Subservice Type 3' }
  //   ];
    
  //   return mockOptions.filter(option => 
  //     option.label.toLowerCase().includes(params.searchTerm.toLowerCase())
  //   );
  // };

  // Sub Service Type options fetch function (real API)
  const fetchSubServiceTypeOptions = async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      const response = await quickOrderService.getMasterCommonData({
        messageType: "Sub Service type Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data;
      const parsedData = JSON.parse(rr.ResponseData) || [];

      return parsedData
        .filter((item: any) => item.id && item.name)
        .map((item: any) => ({
          label: `${item.id} || ${item.name}`,
          value: `${item.id} || ${item.name}`,
        }));
    } catch (error) {
      console.error("Error fetching sub service type options:", error);
      return [];
    }
  };

  // Helper to create lazy fetchers for calendar filter
  const fetchMasterData = (messageType: string) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data;
      return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
        ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
          ? {
            label: `${item.id} || ${item.name}`,
            value: `${item.id} || ${item.name}`,
          }
          : {})
      }));
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      return [];
    }
  };

  // Clear selection when drawer opens - old code
  // useEffect(() => {
  //   if (isOpen) {
  //     11992420202020289
  //     console.log("INSIDE Useeffect, isOpen-true",selectedResourcesRq)
  //     setSelectedRows(new Set());
  //     setSelectedRowIds(new Set());
  //     setSelectedRowObjects([]);
  //     setRowTripId([]);
  //     console.log('Selection cleared on drawer open');
  //   }
  // }, [isOpen]);
// checking with static equipment id- working
  // useEffect(() => {
  //   if (isOpen) {
  //     const rId = "0080980970707070707";
  //     console.log("INSIDE useEffect, isOpen-true", selectedResourcesRq);
  
  //     // Step 1: Clear previous selections
  //     setSelectedRows(new Set());
  //     setSelectedRowIds(new Set());
  //     setSelectedRowObjects([]);
  //     setRowTripId([]);
  //     console.log("Selection cleared on drawer open");
  
  //     // Step 2: Auto-select the matching row
  //     const idField = getIdField(); // same helper you use in handleRowClick
  //     console.log("idField : ",idField)
  //     const matchingIndex = currentResourceData?.findIndex(
  //       (row) => row[idField] === rId
  //     );
  //     console.log("matchingIndex :",matchingIndex)
  //     if (matchingIndex !== -1) {
  //       const matchingRow = currentResourceData[matchingIndex];
  
  //       // Step 3: Use the same logic as inside handleRowClick to mark it as selected
  //       const newSelectedRows = new Set([matchingIndex]);
  //       const newSelectedRowIds = new Set([rId]);
  //       const newSelectedRowObjects = [matchingRow];
  
  //       setSelectedRows(newSelectedRows);
  //       setSelectedRowIds(newSelectedRowIds);
  //       setSelectedRowObjects(newSelectedRowObjects);
  //       setRowTripId([rId]);
  
  //       console.log("Auto-selected row:", matchingRow);
  //     }
  //   }
  // }, [isOpen]);
  // Auto-select resources based on selectedResourcesRq when drawer opens
  useEffect(() => {
    if (isOpen && selectedResourcesRq && Array.isArray(selectedResourcesRq) && selectedResourcesRq.length > 0) {
      console.log("INSIDE useEffect, isOpen-true", selectedResourcesRq);
      console.log("Current resourceType:", resourceType);
      console.log("saveButtonEnableFlag:", saveButtonEnableFlag);
  
      // Step 1: Clear previous selections
      setSelectedRows(new Set());
      setSelectedRowIds(new Set());
      setSelectedRowObjects([]);
      setRowTripId([]);
      console.log("Selection cleared on drawer open");
  
      // Step 2: Prepare ID field for the current resource type
      const idField = getIdField(); // e.g. "EquipmentID", "DriverID", "HandlerID", "VehicleID", "VendorID", "SupplierID"
      console.log("idField:", idField);
  
      // Step 3: Extract IDs from selectedResourcesRq based on resource type
      // The selectedResourcesRq array contains objects like:
      // Equipment: [{ EquipmentID: "..." }]
      // Handler: [{ HandlerID: "..." }]
      // Vehicle: [{ VehicleID: "..." }]
      // Driver: [{ DriverID: "..." }]
      // Supplier: [{ VendorID: "..." }] or similar
      // Schedule: [{ SupplierID: "..." }] or similar
      
      let resourceIds: string[] = [];
      
      // Extract IDs based on the ID field name
      if (idField === 'EquipmentID') {
        resourceIds = selectedResourcesRq
          .filter((r) => r?.EquipmentID)
          .map((r) => r.EquipmentID);
      } else if (idField === 'HandlerID') {
        resourceIds = selectedResourcesRq
          .filter((r) => r?.HandlerID)
          .map((r) => r.HandlerID);
      } else if (idField === 'VehicleID') {
        resourceIds = selectedResourcesRq
          .filter((r) => r?.VehicleID)
          .map((r) => r.VehicleID);
      } else if (idField === 'DriverCode') {
        resourceIds = selectedResourcesRq
          .filter((r) => r?.DriverID || r?.DriverCode)
          .map((r) => r.DriverID || r.DriverCode);
      } else if (idField === 'VendorID') {
        // For Supplier
        resourceIds = selectedResourcesRq
          .filter((r) => r?.VendorID)
          .map((r) => r.VendorID);
      } else if (idField === 'SupplierID') {
        // For Schedule
        resourceIds = selectedResourcesRq
          .filter((r) => r?.SupplierID)
          .map((r) => r.SupplierID);
      }
    
      console.log(`${resourceType} IDs to match:`, resourceIds);
    
      // Step 4: Match and select rows in the grid
      if (resourceIds?.length > 0 && currentResourceData?.length > 0) {
        const newSelectedRows = new Set<number>();
        const newSelectedRowIds = new Set<string>();
        const newSelectedRowObjects: any[] = [];
    
        currentResourceData?.forEach((row: any, index: number) => {
          const rowId = row[idField];
          if (rowId && resourceIds.includes(String(rowId))) {
            newSelectedRows.add(index);
            newSelectedRowIds.add(String(rowId));
            newSelectedRowObjects.push(row);
          }
        });
    
        if (newSelectedRowIds.size > 0) {
          setSelectedRows(newSelectedRows);
          setSelectedRowIds(newSelectedRowIds);
          setSelectedRowObjects(newSelectedRowObjects);
          setRowTripId(Array.from(newSelectedRowIds));
    
          console.log(`Auto-selected ${resourceType} rows:`, newSelectedRowObjects);
        } else {
          console.log(`No matching ${resourceType} rows found in grid.`);
        }
      } else {
        console.log(`No ${resourceType} IDs to match or no grid data available.`);
      }
    } else if (isOpen) {
      // Clear selections if drawer opens but no selected resources
      setSelectedRows(new Set());
      setSelectedRowIds(new Set());
      setSelectedRowObjects([]);
      setRowTripId([]);
      console.log("Drawer opened with no selected resources - cleared selections");
    }
  }, [isOpen, selectedResourcesRq, currentResourceData, resourceType]);

  // Store last applied filters (single shared payload with FromDate/ToDate for both views)
  const lastAppliedFiltersRef = useRef<any>(null);

  // Memoize the callback to register the calendar filter function
  // This prevents the child component's useEffect from running multiple times
  const handleRegisterApplyFilter = useCallback((fn: (payload: any) => Promise<void> | void) => {
    setApplyCalendarFilter(() => fn);
  }, []);

  // Memoize the callback to register the function to get equipment objects from calendar
  const handleRegisterGetEquipments = useCallback((fn: () => EquipmentItem[]) => {
    setGetCalendarEquipments(() => fn);
  }, []);

  // When view mode changes, apply the stored filters to the new view
  // Same payload (with dates) applies to both views
  useEffect(() => {
    if (resourceType === 'Equipment' && isOpen) {
      if (viewMode === 'list') {
        // Switching to list view: apply stored filters (full payload with dates)
        if (lastAppliedFiltersRef.current && onFiltersChange) {
          onFiltersChange(lastAppliedFiltersRef.current);
        }
      } else if (viewMode === 'calendar') {
        // Switching to calendar view: apply stored filters (full payload with dates)
        // Apply filters immediately - they will be stored in EquipmentCalendarPanel's ref
        // This ensures filters are available when handleDateRangeChange is called
        if (applyCalendarFilter) {
          if (lastAppliedFiltersRef.current) {
            console.log('ResourceSelectionDrawer: Applying stored filters on calendar view switch:', lastAppliedFiltersRef.current);
            // Apply stored filters - pass isInitialLoad: false to ensure filters are preserved
            // The filters will be stored in EquipmentCalendarPanel's ref before handleDateRangeChange runs
            // Use setTimeout to ensure this runs before SmartEquipmentCalendar's initial render
            setTimeout(() => {
              applyCalendarFilter(lastAppliedFiltersRef.current);
            }, 0);
          } else {
            // No stored filters - apply empty filters so they're available for handleDateRangeChange
            // This ensures handleDateRangeChange always has filters (even if empty) to pass to API
            const emptyFilters = {
              EquipmentType: '',
              EquipmentCode: '',
              EquipmentStatus: '',
              FromDate: '',
              ToDate: '',
              EquipmentGroup: '',
              EquipmentContract: '',
              ContractAgent: '',
              EquipmentOwner: '',
              EquipmentCategory: '',
            };
            console.log('ResourceSelectionDrawer: No stored filters, applying empty filters:', emptyFilters);
            setTimeout(() => {
              applyCalendarFilter(emptyFilters);
            }, 0);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, resourceType, isOpen]);

  // Reset viewMode to 'list' when drawer opens or resource type changes
  useEffect(() => {
    if (isOpen) {
      // Always reset to list view when drawer opens
      // For non-Equipment types, always show list view
      // For Equipment, default to list view but allow switching to calendar
      if (resourceType !== 'Equipment') {
        setViewMode('list');
      } else {
        // For Equipment, reset to list when drawer opens (fresh start)
        setViewMode('list');
      }
    }
  }, [isOpen, resourceType]);

  // Clear all filter states when drawer opens (fresh start)
  useEffect(() => {
    if (isOpen && resourceType === 'Equipment') {
      // Clear all filter-related states
      setEquipmentTypeFilter('');
      setWagonSelection(undefined);
      setContainerSelection(undefined);
      setEquipmentStatusFilter('');
      setFromDateTime('');
      setToDateTime('');
      setEquipmentGroup(undefined);
      setEquipmentContract(undefined);
      setContractSupplier(undefined);
      setEquipmentOwner(undefined);
      // Clear the last applied filters ref
      lastAppliedFiltersRef.current = null;
      console.log('ResourceSelectionDrawer: All filters cleared on drawer open');
    }
  }, [isOpen, resourceType]);

  // Load resource data only if no prop data is provided
  useEffect(() => {
    console.log("propResourceData ===", propResourceData);
    console.log("currentResourceData", currentResourceData);
    if (!propResourceData) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [propResourceData]);

  // Handle row selection from checkbox
  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    console.log('Selected rows changed via checkbox:', selectedRowIndices);
    
    const currentData = currentResourceData.length > 0 ? currentResourceData : [];
    
    // Get the ID field for current resource type
    const idField = getIdField();
    
    // Check if this resource type should use single selection
    const isSingleSelectionMode = config.gridTitle === 'Supplier' || config.gridTitle === 'Schedule';
    
    if (isSingleSelectionMode) {
      // Single selection mode for Supplier and Schedule
      if (selectedRowIndices.size > 1) {
        const lastSelectedIndex = Math.max(...Array.from(selectedRowIndices));
        const lastSelectedRow = currentData[lastSelectedIndex];
        
        if (lastSelectedRow) {
          const rowId = lastSelectedRow[idField];
          setSelectedRows(new Set([lastSelectedIndex]));
          setSelectedRowIds(new Set([rowId]));
          setSelectedRowObjects([lastSelectedRow]);
          setRowTripId([rowId]);
          console.log('Multiple selection detected - keeping only last selected:', rowId);
        }
      } else if (selectedRowIndices.size === 1) {
        // Single row selected
        const selectedIndex = Array.from(selectedRowIndices)[0];
        const selectedRow = currentData[selectedIndex];
        
        if (selectedRow) {
          const rowId = selectedRow[idField];
          setSelectedRows(selectedRowIndices);
          setSelectedRowIds(new Set([rowId]));
          setSelectedRowObjects([selectedRow]);
          setRowTripId([rowId]);
          console.log('Single row selected:', rowId);
        }
      } else {
        // No rows selected
        setSelectedRows(new Set());
        setSelectedRowIds(new Set());
        setSelectedRowObjects([]);
        setRowTripId([]);
        console.log('No rows selected');
      }
    } else {
      // Multi-selection mode for other resource types (Equipment, Driver, Handler, Vehicle)
      setSelectedRows(selectedRowIndices);
      
      const selectedObjects = Array.from(selectedRowIndices)
        .map(index => currentData[index])
        .filter(Boolean);

      // Create a new Set of unique row IDs using dynamic ID field
      const newSelectedRowIds = new Set(selectedObjects.map(row => row[idField]));

      // Update selected row objects to ensure uniqueness by ID
      const uniqueSelectedObjects = selectedObjects.filter((row, index, self) =>
        self.findIndex(r => r[idField] === row[idField]) === index
      );

      setSelectedRowIds(newSelectedRowIds);
      setSelectedRowObjects(uniqueSelectedObjects);
      setRowTripId(Array.from(newSelectedRowIds));
      
      console.log('Multi-selection mode - selected row objects:', uniqueSelectedObjects);
      console.log('Multi-selection mode - selected row IDs:', Array.from(newSelectedRowIds));
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    // Check if this resource type should use single selection
    const isSingleSelectionMode = config.gridTitle === 'Supplier' || config.gridTitle === 'Schedule';
    
    if (isSelected) {
      if (isSingleSelectionMode) {
        // For single selection mode, select only the first row
        const firstRow = resourceData[0];
        if (firstRow) {
          const idField = getIdField();
          const rowId = firstRow[idField];
          setSelectedRows(new Set([0]));
          setSelectedRowIds(new Set([rowId]));
          setSelectedRowObjects([firstRow]);
          setRowTripId([rowId]);
          console.log('Select all (single mode) - keeping only first row:', rowId);
        }
      } else {
        // For multi-selection mode, select all rows
        const allIndices = new Set(resourceData.map((_, index) => index));
        const idField = getIdField();
        const allRowIds = new Set(resourceData.map(row => row[idField]));
        
        setSelectedRows(allIndices);
        setSelectedRowIds(allRowIds);
        setSelectedRowObjects([...resourceData]);
        setRowTripId(Array.from(allRowIds));
        console.log('Select all (multi mode) - selected all rows:', Array.from(allRowIds));
      }
    } else {
      // Clear all selections
      setSelectedRows(new Set());
      setSelectedRowIds(new Set());
      setSelectedRowObjects([]);
      setRowTripId([]);
      console.log('Select all - cleared all selections');
    }
  };

  // Handle row click
  const handleRowClick = (row: any, index: number) => {
    console.log('Row clicked:', row, index);
    console.log("selectedRowIds = ",)

    // Get the ID field for current resource type
    const idField = getIdField();
    console.log("idField Select = ", idField);
    const rowId = row[idField];

    // Check if this resource type should use single selection
    const isSingleSelectionMode = config.gridTitle === 'Supplier' || config.gridTitle === 'Schedule';

    if (isSingleSelectionMode) {
      // Single selection mode for Supplier and Schedule
      const isRowSelected = selectedRowIds.has(rowId);

      if (isRowSelected) {
        // If clicking on already selected row, deselect it (clear all)
        setSelectedRows(new Set());
        setSelectedRowIds(new Set());
        setSelectedRowObjects([]);
        setRowTripId([]);
        console.log('Deselected row and cleared all selections:', rowId);
      }
      else {
        // If clicking on new row, clear previous selections and select only this row
        setSelectedRows(new Set([index]));
        setSelectedRowIds(new Set([rowId]));
        setSelectedRowObjects([row]);
        setRowTripId([rowId]);
        console.log('Selected only this row Select (cleared previous selections):', rowId);
        console.log('Selected row objects after click Select (computed):', [row]);
        console.log('Selected row IDs after click Select[rowId] (computed):', [rowId]);
      }
    } else {
      // Multi-selection mode for other resource types (Equipment, Driver, Handler, Vehicle)
      const isRowSelected = selectedRowIds.has(rowId);

      if (isRowSelected) {
        // Remove row: remove from all tracking sets/arrays
        const newSelectedRows = new Set(selectedRows);
        const newSelectedRowIds = new Set(selectedRowIds);
        const newSelectedRowObjects = [...selectedRowObjects];

        newSelectedRows.delete(index);
        newSelectedRowIds.delete(rowId);
        const objectIndex = newSelectedRowObjects.findIndex(obj => obj[idField] === rowId);
        if (objectIndex > -1) {
          newSelectedRowObjects.splice(objectIndex, 1);
        }

        setSelectedRows(newSelectedRows);
        setSelectedRowIds(newSelectedRowIds);
        setSelectedRowObjects(newSelectedRowObjects);
        setRowTripId(Array.from(newSelectedRowIds));
        console.log('Removed row from multi-selection:', rowId);
        console.log('Selected row objects after click (computed):', newSelectedRowObjects);
        console.log('Selected row IDs after click (computed):', Array.from(newSelectedRowIds));
      }
      else {
        // Add row: add to all tracking sets/arrays (ensure uniqueness)
        const newSelectedRows = new Set(selectedRows);
        const newSelectedRowIds = new Set(selectedRowIds);
        const newSelectedRowObjects = [...selectedRowObjects];

        newSelectedRows.add(index);
        newSelectedRowIds.add(rowId);
        // Only add if not already in objects array (double-check uniqueness)
        if (!newSelectedRowObjects.some(obj => obj[idField] === rowId)) {
          newSelectedRowObjects.push(row);
        }

        setSelectedRows(newSelectedRows);
        setSelectedRowIds(newSelectedRowIds);
        setSelectedRowObjects(newSelectedRowObjects);
        setRowTripId(Array.from(newSelectedRowIds));
        console.log('Added row to multi-selection:', rowId);
        console.log('Selected row objects after click (computed):', newSelectedRowObjects);
        console.log('Selected row IDs after click (computed):', Array.from(newSelectedRowIds));
      }
    }
  };

  // Handle add resource
  const handleAddResource = () => {
    const idField = getIdField();
    const selectedItems = currentResourceData.filter(item => selectedRowIds.has(item[idField]));
    console.log('[Add to CO] idField:', idField);
    console.log('[Add to CO] selectedRowIds:', Array.from(selectedRowIds));
    console.log('[Add to CO] selectedItems count:', selectedItems.length);
    
    // Map ResourceType based on idField
    const getResourceTypeFromIdField = (idField: string) => {
      switch (idField) {
        case 'EquipmentID':
          return 'Equipment';
        case 'VendorID':
          return 'Agent';
        case 'DriverCode':
          return 'Driver';
        case 'HandlerID':
          return 'Handler';
        case 'VehicleID':
          return 'Vehicle';
        case 'SupplierID':
          return 'Schedule';
        default:
          return resourceType; // fallback to prop value
      }
    };
    
    // Parse serviceType to extract Service and ServiceDescription
    const parseServiceType = (serviceTypeValue: string | undefined) => {
      if (!serviceTypeValue) {
        return { Service: "", ServiceDescription: "" };
      }
      
      const parts = serviceTypeValue.split(' || ');
      return {
        Service: (parts[0] || "").trim(),
        ServiceDescription: (parts[1] || "").trim()
      };
    };
    
    // Parse subServiceType to extract SubService and SubServiceDescription
    const parseSubServiceType = (subServiceTypeValue: string | undefined) => {
      if (!subServiceTypeValue) {
        return { SubService: "", SubServiceDescription: "" };
      }
      
      const parts = subServiceTypeValue.split(' || ');
      return {
        SubService: (parts[0] || "").trim(),
        SubServiceDescription: (parts[1] || "").trim()
      };
    };
    
    const { Service, ServiceDescription } = parseServiceType(serviceType);
    const { SubService, SubServiceDescription } = parseSubServiceType(subServiceType);
    
    // Format the data based on resource type - loop through all selected row objects
    // For Equipment: use EquipmentID and EquipmentType instead of ResourceID and ResourceType
    const formattedDataArray: any = selectedRowObjects.map((rowObj) => {
      const resourceId = rowObj[idField];
      const resourceTypeValue = getResourceTypeFromIdField(idField);
      
      // Base object with common fields
      const baseObj: any = {
        Service: Service,
        ServiceDescription: ServiceDescription,
        SubService: SubService,
        SubServiceDescription: SubServiceDescription
      };
      
      // For Equipment, use EquipmentID and EquipmentType
      if (resourceTypeValue === 'Equipment') {
        return {
          ...baseObj,
          EquipmentID: resourceId,
          EquipmentType: rowObj.EquipmentType || rowObj['Equipment Type'] || '',
          ResourceID: resourceId, // Keep for backward compatibility if needed
          ResourceType: resourceTypeValue // Keep for backward compatibility if needed
        };
      }
      
      // For other resource types, use ResourceID and ResourceType
      return {
        ...baseObj,
        ResourceID: resourceId,
        ResourceType: resourceTypeValue
      };
    });
    
    console.log('handle resource click', idField, serviceType, subServiceType);
    console.log('rowTripId"s===========', rowTripId);
    console.log('formattedDataArray===========', formattedDataArray);
    console.log('[Add to CO] Dispatching formatted selection payload count:', formattedDataArray.length);
    
    // Pass both original selected items and formatted data array to parent
    onAddResource(formattedDataArray);
    setViewMode('list');
    onClose();
  };

  // Handle save resource (when saveButtonEnableFlag is true)
  const handleSaveResource = async () => {
    const idField = getIdField();
    console.log('[Save Resource] idField:', idField);
    console.log('[Save Resource] selectedRowIds:', Array.from(selectedRowIds));
    
    // Map ResourceType based on idField
    const getResourceTypeFromIdField = (idField: string) => {
      switch (idField) {
        case 'EquipmentID':
          return 'Equipment';
        case 'VendorID':
          return 'Agent';
        case 'DriverCode':
          return 'Driver';
        case 'HandlerID':
          return 'Handler';
        case 'VehicleID':
          return 'Vehicle';
        case 'SupplierID':
          return 'Schedule';
        default:
          return resourceType;
      }
    };
    
    // Parse serviceType to extract Service and ServiceDescription
    const parseServiceType = (serviceTypeValue: string | undefined) => {
      if (!serviceTypeValue) {
        return { Service: "", ServiceDescription: "" };
      }
      const parts = serviceTypeValue.split(' || ');
      return {
        Service: (parts[0] || "").trim(),
        ServiceDescription: (parts[1] || "").trim()
      };
    };
    
    // Parse subServiceType to extract SubService and SubServiceDescription
    const parseSubServiceType = (subServiceTypeValue: string | undefined) => {
      if (!subServiceTypeValue) {
        return { SubService: "", SubServiceDescription: "" };
      }
      const parts = subServiceTypeValue.split(' || ');
      return {
        SubService: (parts[0] || "").trim(),
        SubServiceDescription: (parts[1] || "").trim()
      };
    };
    
    const { Service, ServiceDescription } = parseServiceType(serviceType);
    const { SubService, SubServiceDescription } = parseSubServiceType(subServiceType);
    
    // Format the data based on resource type - loop through all selected IDs
    // const formattedDataArray: any = rowTripId.map(resourceId => ({
    //   ResourceID: resourceId,
    //   ResourceType: getResourceTypeFromIdField(idField),
    //   Service: Service,
    //   ServiceDescription: ServiceDescription,
    //   SubService: SubService,
    //   SubServiceDescription: SubServiceDescription,
    // }));

    // Format the data based on resource type - loop through all selected row objects
    // For Equipment: use EquipmentID and EquipmentType instead of ResourceID and ResourceType
    const formattedDataArray: any = selectedRowObjects.map((rowObj) => {
      const resourceId = rowObj[idField];
      const resourceTypeValue = getResourceTypeFromIdField(idField);
      
      // Base object with common fields
      const baseObj: any = {
        Service: Service,
        ServiceDescription: ServiceDescription,
        SubService: SubService,
        SubServiceDescription: SubServiceDescription,
        EffectiveFromDate: "",
        EffectiveToDate: "",
        ModeFlag: "Insert"
      };
      
      console.log("resourceTypeValue -----", resourceTypeValue);
      // For Equipment, use EquipmentID and EquipmentType
      if (resourceTypeValue === 'Agent') {
        return {
          ...baseObj,
          VendorID: resourceId,
          // EquipmentType: rowObj.EquipmentType || rowObj['Equipment Type'] || '',
          ResourceID: resourceId, // Keep for backward compatibility if needed
          ResourceType: resourceTypeValue // Keep for backward compatibility if needed
        };
      }
      if (resourceTypeValue === 'Equipment') {
        return {
          ...baseObj,
          EquipmentID: resourceId,
          EquipmentType: rowObj.EquipmentType || rowObj['Equipment Type'] || '',
          ResourceID: resourceId, // Keep for backward compatibility if needed
          ResourceType: resourceTypeValue // Keep for backward compatibility if needed
        };
      }
      if (resourceTypeValue === 'Handler') {
        return {
          ...baseObj,
          HandlerID: resourceId,
          // EquipmentType: rowObj.EquipmentType || rowObj['Equipment Type'] || '',
          ResourceID: resourceId, // Keep for backward compatibility if needed
          ResourceType: resourceTypeValue // Keep for backward compatibility if needed
        };
      }
      if (resourceTypeValue === 'Vehicle') {
        return {
          ...baseObj,
          VehicleID: resourceId,
          // EquipmentType: rowObj.EquipmentType || rowObj['Equipment Type'] || '',
          ResourceID: resourceId, // Keep for backward compatibility if needed
          ResourceType: resourceTypeValue // Keep for backward compatibility if needed
        };
      }
      if (resourceTypeValue === 'Driver') {
        return {
          ...baseObj,
          // DriverCode: resourceId,
          DriverID: resourceId,
          // EquipmentType: rowObj.EquipmentType || rowObj['Equipment Type'] || '',
          ResourceID: resourceId, // Keep for backward compatibility if needed
          ResourceType: resourceTypeValue // Keep for backward compatibility if needed
        };
      }
      
      // For other resource types, use ResourceID and ResourceType
      return {
        ...baseObj,
        ResourceID: resourceId,
        ResourceType: resourceTypeValue
      };
    });
    
    console.log('[Save Resource] formattedDataArray:', formattedDataArray);
    console.log('[Save Resource] Dispatching formatted selection payload count:', formattedDataArray.length);
    console.log("tripInformation ====", tripInformation);
    // Update tripInformation.ResourceDetails based on formattedDataArray
    // Compare existing ResourceDetails with new formattedDataArray and set ModeFlag accordingly
    // ONLY update the resource type being edited in this drawer, leave other resource types unchanged
    if (tripInformation) {
      const existingResourceDetails = tripInformation.ResourceDetails || {};
      
      // Map ResourceType to the key used in ResourceDetails object
      const getResourceDetailsKey = (resourceType: string): string => {
        switch (resourceType) {
          case 'Equipment':
            return 'Equipments';
          case 'Handler':
            return 'Handlers';
          case 'Vehicle':
            return 'Vehicle';
          case 'Driver':
            return 'Drivers';
          case 'Agent':
          case 'Supplier':
            return 'Supplier';
          case 'Schedule':
            return 'Schedule';
          default:
            return resourceType;
        }
      };

      // Get the resource details key for the current resource type being edited
      const currentResourceDetailsKey = getResourceDetailsKey(resourceType);
      console.log('Updating ResourceDetails for resource type:', resourceType, '-> key:', currentResourceDetailsKey);

      // Get existing items for the current resource type only
      const existingItems = Array.isArray(existingResourceDetails[currentResourceDetailsKey]) 
        ? existingResourceDetails[currentResourceDetailsKey] 
        : [];
      console.log("existingItems ====", existingItems);
      
      // New items from formattedDataArray (should all be of the current resource type)
      const newItems = formattedDataArray || [];

      // Create a map of existing items by ResourceID for quick lookup
      const existingMap = new Map<string, any>();
      existingItems.forEach((item: any) => {
        console.log("item ====", item);
        // Handle different ID field names based on resource type
        let resourceId = '';
        if (currentResourceDetailsKey === 'Equipments') {
          resourceId = item.EquipmentID || item.ResourceID || item.id || '';
        } else if (currentResourceDetailsKey === 'Handlers') {
          resourceId = item.HandlerID || item.ResourceID || item.id || '';
        } else if (currentResourceDetailsKey === 'Vehicle') {
          resourceId = item.VehicleID || item.ResourceID || item.id || '';
        } else if (currentResourceDetailsKey === 'Drivers') {
          resourceId = item.DriverID || item.DriverCode || item.ResourceID || item.id || '';
        } else if (currentResourceDetailsKey === 'Supplier') {
          resourceId = item.VendorID || item.ResourceID || item.id || '';
        } else if (currentResourceDetailsKey === 'Schedule') {
          resourceId = item.SupplierID || item.ResourceID || item.id || '';
        } else {
          resourceId = item.ResourceID || item.id || '';
        }
        
        if (resourceId) {
          existingMap.set(String(resourceId), item);
        }
      });

      // Create a set of new ResourceIDs
      const newResourceIds = new Set<string>();
      newItems.forEach((item: any) => {
        const resourceId = item.ResourceID || item.id || '';
        if (resourceId) {
          newResourceIds.add(String(resourceId));
        }
      });

      // Process only the current resource type
      const updatedItems: any[] = [];

      // Process existing items for the current resource type
      existingItems.forEach((existingItem: any) => {
        // Get ResourceID based on resource type
        let resourceId = '';
        if (currentResourceDetailsKey === 'Equipments') {
          resourceId = String(existingItem.EquipmentID || existingItem.ResourceID || existingItem.id || '');
        } else if (currentResourceDetailsKey === 'Handlers') {
          resourceId = String(existingItem.HandlerID || existingItem.ResourceID || existingItem.id || '');
        } else if (currentResourceDetailsKey === 'Vehicle') {
          resourceId = String(existingItem.VehicleID || existingItem.ResourceID || existingItem.id || '');
        } else if (currentResourceDetailsKey === 'Drivers') {
          resourceId = String(existingItem.DriverID || existingItem.DriverCode || existingItem.ResourceID || existingItem.id || '');
        } else if (currentResourceDetailsKey === 'Supplier') {
          resourceId = String(existingItem.VendorID || existingItem.ResourceID || existingItem.id || '');
        } else if (currentResourceDetailsKey === 'Schedule') {
          resourceId = String(existingItem.SupplierID || existingItem.ResourceID || existingItem.id || '');
        } else {
          resourceId = String(existingItem.ResourceID || existingItem.id || '');
        }
        
        if (newResourceIds.has(resourceId)) {
          // Item exists in both - set ModeFlag to "NoChange"
          const newItem = newItems.find((item: any) => 
            String(item.ResourceID || item.id || '') === resourceId
          );
          updatedItems.push({
            ...existingItem,
            ...(newItem || {}),
            ModeFlag: "NoChange"
          });
        } else {
          // Item exists only in existing array - set ModeFlag to "Deleted"
          const deletedItem = {
            ...existingItem,
            ModeFlag: "Delete"
          };

          // Fix for Drivers: ensure DriverID is present (mapped from resourceId if missing)
          if (currentResourceDetailsKey === 'Drivers' && !deletedItem.DriverID) {
            deletedItem.DriverID = resourceId;
          }

          updatedItems.push(deletedItem);
        }
      });

      // Process new items that don't exist in existing array
      newItems.forEach((newItem: any) => {
        const resourceId = String(newItem.ResourceID || newItem.id || '');
        
        if (!existingMap.has(resourceId)) {
          // Item exists only in new array - add with ModeFlag "Update"
          updatedItems.push({
            ...newItem,
            ModeFlag: "Insert"
          });
        }
      });

      // Special cleanup for Drivers to match API expectations
      if (currentResourceDetailsKey === 'Drivers') {
        updatedItems.forEach((item: any) => {
          // Ensure DriverID is present (take from DriverCode if needed)
          if (item.DriverCode && !item.DriverID) {
            item.DriverID = item.DriverCode;
          }
          // Remove DriverCode as it should be DriverID
          if (item.DriverCode) {
            delete item.DriverCode;
          }
          // Remove internal fields that are not part of the schema
          delete item.ResourceID;
          delete item.ResourceType;
        });
      }

      // Update ONLY the current resource type array, preserve all other resource types unchanged
      const updatedResourceDetails: Record<string, any[]> = { ...existingResourceDetails };
      updatedResourceDetails[currentResourceDetailsKey] = updatedItems;

      console.log('=== UPDATED tripInformation.ResourceDetails (from ResourceSelectionDrawer) ===');
      console.log('Resource Type being updated:', resourceType);
      console.log('Resource Details Key:', currentResourceDetailsKey);
      console.log('Existing items count:', existingItems.length);
      console.log('New items count:', newItems.length);
      console.log('Updated items count:', updatedItems.length);
      console.log('Updated ResourceDetails:', updatedResourceDetails);

      // Update tripInformation in parent via callback
      const updatedTripInformation = {
        ...tripInformation, 
        ResourceDetails: updatedResourceDetails
      };

      const tripData = {
        "Header": tripInformation?.Header,
        "ResourceDetails": updatedResourceDetails
      }

      // Also call onAddResource to maintain existing functionality
      console.log("updatedTripInformation =====", updatedTripInformation);
      console.log("tripData =====", tripData);
      try {
        const response: any = await tripPlanningService.resourceUpdateTripLevel(tripData);
        const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
        // const data = parsedResponse;
        const resourceStatus = (response as any)?.data?.IsSuccess;
        console.log("parsedResponse ====", parsedResponse);
        if (resourceStatus) {
          console.log("Trip data updated in store");

          // Extract CustomerOrders from response
          const customerOrders = parsedResponse.CustomerOrders || [];
          console.log("📋 CustomerOrders from API response:", customerOrders);

          toast({
            title: "✅ Trip Created Successfully",
            description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
            variant: "default",
          });
          onUpdateTripInformation(updatedTripInformation);
          onAddResource(formattedDataArray);
          setViewMode('list');
          onClose();
          if (onRefresh) {
            onRefresh();
          }
          console.log("🔄 TripCOHub component reloaded with CustomerOrders data");
        } else {
          console.log("error as any ===", (response as any)?.data?.Message);
          toast({
            title: "⚠️ Save Failed",
            description: (response as any)?.data?.Message || "Failed to save changes.",
            variant: "destructive",
          });

        }
      } catch (error) {
        console.error("Error updating nested data:", error);
        toast({
          title: "⚠️ Error",
          description: "An error occurred while creating the trip. Please try again.",
          variant: "destructive",
        });
      } finally {
        
      }
    }
    
  };

  // Conditionally build footer buttons based on saveButtonEnableFlag
  const footerButtons = saveButtonEnableFlag ? [
    {
      label: 'Save',
      variant: 'default' as const,
      action: handleSaveResource,
      // disabled: selectedRowIds.size === 0
    }
  ]
: [
    {
      label: config.buttonText,
      variant: 'default' as const,
      action: handleAddResource,
      disabled: selectedRowIds.size === 0
    }
  ];


  

  const handleEquipmentClick = (equipment: EquipmentItem) => {
    // toast({
    //   title: "✅ Equipment Selected Successfully",
    //   description: `Supplier: ${equipment.supplier} | Status: ${equipment.status}`,
    //   variant: "default",
    // });
  };

  const handleAddToTrip = (selectedIds: string[]) => {
    // toast({
    //   title: "✅ Equipment Added to Trip Successfully",
    //   description: `Adding ${selectedIds.length} wagon(s) to CO/Trip`,
    //   variant: "default",
    // });
    // setSelectedEquipments([]);
  };

  const handleBarClick = (event: EquipmentCalendarEvent) => {
    // toast({
    //   title: "✅ Equipment Bar Clicked Successfully",
    //   description: `Type: ${event.type} | Equipment: ${event.equipmentId}`,
    //   variant: "default",
    // });
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      width="85%"
      slideDirection="right"
      showFooter={true}
      footerButtons={footerButtons}
    >
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="space-y-4 px-4 mt-4">
          {/* Service Type, Sub Service Type and Calendar Filter */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Service Type</label>
              <DynamicLazySelect
                fetchOptions={fetchServiceTypeOptions}
                value={serviceType}
                onChange={(value) => setServiceType(value as string)}
                placeholder="Select Service Type"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sub Service Type</label>
              <DynamicLazySelect
                fetchOptions={fetchSubServiceTypeOptions}
                value={subServiceType}
                onChange={(value) => setSubServiceType(value as string)}
                placeholder="Select Sub Service Type"
                className="w-full"
              />
            </div>
            {resourceType === 'Equipment' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Filter</label>
                  <button
                    type="button"
                    className="rounded-md hover:bg-accent/100 bg-gray-50 border border-input h-10 p-3"
                    onClick={() => setIsCalendarFilterOpen(true)}
                    title="Open equipment calendar filter"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Resource Section */}
        <div className="space-y-4 px-4">
          {/* View Toggle - Only for Equipment */}
          {resourceType === 'Equipment' && (
            <div className="flex items-center justify-start mb-2">
              <div className="inline-flex rounded-lg p-1" style={{background: '#EBEFF9'}}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900 font-normal'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white text-blue-600 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900 font-normal'
                  }`}
                >
                  Calendar View
                </button>
              </div>
            </div>
          )}

          {viewMode === 'list' ? (
            <>
              {/* Resource Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{config.gridTitle}</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {currentResourceData.length}
                  </Badge>
                  {/* {saveButtonEnableFlag && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      Add Resources Enabled
                    </Badge>
                  )} */}
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pr-10"
                  />
                </div>
              </div>

              {/* Resource Grid */}
              <div className="border rounded-lg overflow-hidden">
                {selectedRowObjects.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 mb-2">
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">{selectedRowObjects.length}</span> row{selectedRowObjects.length !== 1 ? 's' : ''} selected
                      <span className="ml-2 text-xs">
                        ({selectedRowObjects.map(row => row[getIdField()]).join(', ')})
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
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-b-2 border-gray-200"></div>
                      <div className="text-sm text-gray-600">Loading {config.gridTitle.toLowerCase()} data...</div>
                    </div>
                  </div>
                ) : (
                  <SmartGridWithGrouping
                    columns={config.columns}
                    data={currentResourceData}
                    groupableColumns={['OrderType', 'CustomerOrVendor', 'Status', 'Contract']}
                    showGroupingDropdown={true}
                    editableColumns={['plannedStartEndDateTime']}
                    paginationMode="pagination"
                    selectedRows={selectedRows}
                    onSelectionChange={handleRowSelection}
                    onRowClick={handleRowClick}
                    hideToolbar={true}
                    onClearAll={() => {
                      setSelectedRows(new Set());
                      setSelectedRowIds(new Set());
                      setSelectedRowObjects([]);
                      setRowTripId([]);
                    }}
                    rowClassName={(row: any, index: number) => {
                      const idField = getIdField();
                      return selectedRowIds.has(row[idField]) ? 'selected' : '';
                    }}
                    showDefaultConfigurableButton={false}
                    gridTitle="Planning Equipments"
                    recordCount={currentResourceData.length}
                    showCreateButton={true}
                    searchPlaceholder="Search"
                    clientSideSearch={true}
                    externalSearchQuery={searchTerm}
                    showSubHeaders={false}
                    hideAdvancedFilter={true}
                    hideCheckboxToggle={true}
                    showFilterTypeDropdown={false}
                    showServersideFilter={false}
                    userId="current-user"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Calendar View - calendar panel is only mounted when viewMode === 'calendar' */}
              <EquipmentCalendarPanel
                selectedEquipments={Array.from(selectedRowIds)} // Pass selected IDs from list view
                onSelectionChange={(ids) => {
                  // Update selections when calendar view selection changes
                  console.log('ResourceSelectionDrawer: Calendar selection changed:', ids);
                  const newSelectedRowIds = new Set(ids);
                  setSelectedRowIds(newSelectedRowIds);
                  
                  const idField = getIdField(); // For Equipment, this is 'EquipmentID'
                  
                  // First, try to find equipment from currentResourceData (list view data)
                  const listViewObjects = currentResourceData.filter(item => 
                    ids.includes(item[idField])
                  );
                  
                  // Get equipment objects from calendar view (apiEquipments)
                  // Calendar uses EquipmentCode as ID (stored in EquipmentItem.id), but list view uses EquipmentID
                  let calendarObjects: any[] = [];
                  if (getCalendarEquipments && viewMode === 'calendar') {
                    const calendarEquipments = getCalendarEquipments(); // Returns EquipmentItem[]
                    console.log('ResourceSelectionDrawer: Got equipment from calendar:', calendarEquipments);
                    console.log('ResourceSelectionDrawer: Selected IDs to match:', ids);
                    
                    // Convert EquipmentItem format to list view format
                    // EquipmentItem.id is EquipmentCode, list view needs EquipmentID
                    // For Equipment, EquipmentID and EquipmentCode might be the same or different
                    // We'll use EquipmentCode (eq.id) as EquipmentID for now
                    calendarObjects = calendarEquipments
                      .filter(eq => ids.includes(eq.id)) // Filter by selected IDs (EquipmentCode from calendar)
                      .map(eq => {
                        // Convert EquipmentItem to list view format
                        // EquipmentItem has: id (EquipmentCode), type (EquipmentType), owner, etc.
                        // List view format needs: EquipmentID, EquipmentType, OwnerID, EquipmentCategory, etc.
                        return {
                          EquipmentID: eq.id, // Use EquipmentCode as EquipmentID (calendar's ID)
                          EquipmentCode: eq.id, // Also keep EquipmentCode
                          EquipmentType: eq.type || '',
                          OwnerID: eq.owner || '',
                          EquipmentCategory: eq.title || eq.id || '', // Use title or id as category
                          // Preserve other EquipmentItem fields for reference
                          supplier: eq.supplier,
                          status: eq.status,
                          capacity: eq.capacity,
                          ownerDesc: eq.ownerDesc,
                        };
                      });
                    console.log('ResourceSelectionDrawer: Converted calendar equipment to list format:', calendarObjects);
                  }
                  
                  // Merge list view objects and calendar objects
                  // Priority: list view objects (if available), then calendar objects
                  const foundInList = new Set(listViewObjects.map(item => item[idField]));
                  const calendarOnlyObjects = calendarObjects.filter(obj => 
                    !foundInList.has(obj.EquipmentID) // EquipmentID is the ID field
                  );
                  
                  const mergedObjects = [...listViewObjects, ...calendarOnlyObjects];
                  console.log('ResourceSelectionDrawer: Merged selectedRowObjects (list + calendar):', mergedObjects);
                  setSelectedRowObjects(mergedObjects);
                  
                  // Also update selectedRows indices for list view sync
                  const newSelectedRows = new Set<number>();
                  currentResourceData.forEach((item, index) => {
                    if (ids.includes(item[idField])) {
                      newSelectedRows.add(index);
                    }
                  });
                  setSelectedRows(newSelectedRows);
                }}
                onAddToTrip={handleAddToTrip}
                onBarClick={handleBarClick}
                onEquipmentClick={handleEquipmentClick}
                enableDrag={false}
                tripInformation={tripInformation}
                onRegisterApplyFilter={handleRegisterApplyFilter}
                onRegisterGetEquipments={handleRegisterGetEquipments}
              />
              {/* <div className="flex items-center justify-center py-12 min-h-[400px]">
                <div className="text-sm text-gray-500">Calendar View - Schedule component will be added here</div>
              </div> */}
            </>
          )} 
        </div>
      </div>
      {/* Calendar filter drawer - shared for calendar (and later list) view */}
    <SideDrawer
    isOpen={isCalendarFilterOpen}
    onClose={() => setIsCalendarFilterOpen(false)}
    title={`Filter By`}
    width="40%"
    slideDirection="right"
    showFooter={true}
    footerButtons={[
      {
        label: 'Clear',
        variant: 'outline' as const,
        action: () => {
          handleClearFilters();
        },
        disabled: false,
      },
      {
        label: 'Apply',
        variant: 'default' as const,
        action: async () => {
          // Build full payload with FromDate/ToDate (same for both views)
          const fullPayload = buildCalendarFilterPayload();
          
          if (fullPayload) {
            // Store the same payload for both views
            lastAppliedFiltersRef.current = fullPayload;

            // Apply to the active view
            if (viewMode === 'calendar') {
              // Calendar view: apply full payload with dates
              if (applyCalendarFilter) {
                console.log('ResourceSelectionDrawer: Calling applyCalendarFilter with:', fullPayload);
                await applyCalendarFilter(fullPayload);
              } else {
                console.warn('ResourceSelectionDrawer: applyCalendarFilter is not available');
              }
            } else if (viewMode === 'list') {
              // List view: apply same full payload (parent will handle dates if needed)
              if (onFiltersChange) {
                onFiltersChange(fullPayload);
              }
            }
          } else {
            console.warn('ResourceSelectionDrawer: fullPayload is null');
          }
          setIsCalendarFilterOpen(false);
        },
        disabled: false,
      }
    ]}
  >
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Equipment Type *</div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="equipmentType"
                value="Wagon"
                checked={equipmentTypeFilter === 'Wagon'}
                onChange={() => setEquipmentTypeFilter('Wagon')}
                className="mr-2"
              />
              Wagon
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="equipmentType"
                value="Container"
                checked={equipmentTypeFilter === 'Container'}
                onChange={() => setEquipmentTypeFilter('Container')}
                className="mr-2"
              />
              Container
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Wagon/Container</div>
            <DynamicLazySelect
              fetchOptions={fetchMasterData(equipmentTypeFilter === 'Wagon' ? 'Wagon id Init' : 'Container ID Init')}
              value={wagonSelection}
              onChange={(v) => setWagonSelection(v as string | undefined)}
              placeholder="Select Wagon/Container"
            />
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Equipment Status</div>
          <DynamicLazySelect
            fetchOptions={fetchMasterData('Equipment OperationStatus Init')}
            value={equipmentStatusFilter}
            onChange={(v) => setEquipmentStatusFilter(v as string)}
            hideSearch={true}
            disableLazyLoading={true}
            placeholder="Select Equipment Status"
          />
        </div>

        {/* Date fields - only show for calendar view */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">From Date and Time</div>
              <Input
                type="datetime-local"
                value={fromDateTime}
                onChange={(e) => setFromDateTime(e.target.value)}
              />
            </div>
            <div>
              <div className="text-sm font-medium mb-2">To Date and Time</div>
              <Input
                type="datetime-local"
                value={toDateTime}
                onChange={(e) => setToDateTime(e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <div className="text-sm font-medium mb-2">Equipment Group</div>
          <DynamicLazySelect
            fetchOptions={fetchMasterData('Equipment Group Init')}
            value={equipmentGroup}
            onChange={(v) => setEquipmentGroup(v as string | undefined)}
            placeholder="Select Equipment Group"
          />
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Equipment Contract</div>
          <DynamicLazySelect
            fetchOptions={fetchMasterData('Equipment Contract Init')}
            value={equipmentContract}
            onChange={(v) => setEquipmentContract(v as string | undefined)}
            placeholder="Select Equipment Contract"
          />
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Contract Supplier</div>
          <DynamicLazySelect
            fetchOptions={fetchMasterData('Contract Agent Init')}
            value={contractSupplier}
            onChange={(v) => setContractSupplier(v as string | undefined)}
            placeholder="Select Contract Supplier"
          />
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Equipment Owner</div>
          <DynamicLazySelect
            fetchOptions={fetchMasterData('Equipment Owner Init')}
            value={equipmentOwner}
            onChange={(v) => setEquipmentOwner(v as string | undefined)}
            placeholder="Select Equipment Owner"
          />
        </div>
      </div>
    </div>
  </SideDrawer>
    </SideDrawer>
    
  );
};
