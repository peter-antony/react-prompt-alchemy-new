import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/SideDrawer';
import { SmartGrid, SmartGridWithGrouping } from '@/components/SmartGrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { GridColumnConfig, GridColumnType } from '@/types/smartgrid';
import { quickOrderService } from '@/api/services/quickOrderService';

interface ResourceSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (formattedData?: { ResourceID: string; ResourceType: string }[]) => void;
  resourceType: 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule';
  resourceData?: any[];
  selectedResourcesRq?: any;
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

export const ResourceSelectionDrawer: React.FC<ResourceSelectionDrawerProps> = ({
  isOpen,
  onClose,
  onAddResource,
  resourceType,
  selectedResourcesRq,
  resourceData: propResourceData,
  isLoading = false
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
  //checking with all equipment ids coming from Trip-Planning page
  useEffect(() => {
    if (isOpen) {
      console.log("INSIDE useEffect, isOpen-true", selectedResourcesRq);
  
      // Step 1: Clear previous selections
      setSelectedRows(new Set());
      setSelectedRowIds(new Set());
      setSelectedRowObjects([]);
      setRowTripId([]);
      console.log("Selection cleared on drawer open");
  
      // Step 2: Prepare ID field and the list of EquipmentIDs to match
      const idField = getIdField(); // e.g. "EquipmentID", "DriverID", etc.
      console.log("idField:", idField);
  
      // Extract all EquipmentIDs from selectedResourcesRq
      if(selectedResourcesRq!=0){
        const equipmentIds = selectedResourcesRq
          ?.filter((r) => r?.ResourceType === "Equipment" && r?.EquipmentID)
          ?.map((r) => r.EquipmentID);
    
        console.log("equipmentIds to match:", equipmentIds);
    
        if (equipmentIds?.length > 0) {
          const newSelectedRows = new Set<number>();
          const newSelectedRowIds = new Set<string>();
          const newSelectedRowObjects: any[] = [];
    
          currentResourceData?.forEach((row: any, index: number) => {
            const rowId = row[idField];
            if (equipmentIds.includes(rowId)) {
              newSelectedRows.add(index);
              newSelectedRowIds.add(rowId);
              newSelectedRowObjects.push(row);
            }
          });
    
          if (newSelectedRowIds.size > 0) {
            setSelectedRows(newSelectedRows);
            setSelectedRowIds(newSelectedRowIds);
            setSelectedRowObjects(newSelectedRowObjects);
            setRowTripId(Array.from(newSelectedRowIds));
    
            console.log("Auto-selected equipment rows:", newSelectedRowObjects);
          } else {
            console.log("No matching equipment rows found.");
          }
        }
      }
    }
  }, [isOpen, selectedResourcesRq, currentResourceData]);
  

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
        console.log('Selected only this row (cleared previous selections):', rowId);
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
      }
    }

    console.log('Selected row objects after click:', isSingleSelectionMode ? [row] : selectedRowObjects);
    console.log('Selected row IDs after click:', isSingleSelectionMode ? [rowId] : Array.from(selectedRowIds));
  };

  // Handle add resource
  const handleAddResource = () => {
    const idField = getIdField();
    const selectedItems = currentResourceData.filter(item => selectedRowIds.has(item[idField]));
    
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
    
    // Format the data based on resource type - loop through all selected IDs
    const formattedDataArray: any = rowTripId.map(resourceId => ({
      ResourceID: resourceId,
      ResourceType: getResourceTypeFromIdField(idField),
      Service: Service,
      ServiceDescription: ServiceDescription,
      SubService: SubService,
      SubServiceDescription: SubServiceDescription,
    }));
    
    console.log('handle resource click', idField, serviceType, subServiceType);
    console.log('rowTripId"s===========', rowTripId);
    console.log('formattedDataArray===========', formattedDataArray);
    
    // Pass both original selected items and formatted data array to parent
    onAddResource(formattedDataArray);
    onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      width="75%"
      slideDirection="right"
      showFooter={true}
      footerButtons={[
        {
          label: config.buttonText,
          variant: 'default',
          action: handleAddResource,
          disabled: selectedRowIds.size === 0
        }
      ]}
    >
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="space-y-4 px-4 mt-4">
          {/* Service Type and Sub Service Type */}
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
          </div>
        </div>

        {/* Resource Section */}
        <div className="space-y-4 px-4">
          {/* Resource Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{config.gridTitle}</h3>
               <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                 {currentResourceData.length}
               </Badge>
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
                showSubHeaders={false}
                hideAdvancedFilter={true}
                hideCheckboxToggle={true}
                showFilterTypeDropdown={false}
                showServersideFilter={false}
                userId="current-user"
              />
            )}
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};
