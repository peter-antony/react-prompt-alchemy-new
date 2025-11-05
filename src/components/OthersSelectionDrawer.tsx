import React, { useState, useEffect } from 'react';
// import { SideDrawer } from '@/components/SideDrawer';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { SimpleDropDown } from './Common/SimpleDropDown'
import { Calendar, Clock } from 'lucide-react';

import { SmartGrid, SmartGridWithGrouping } from '@/components/SmartGrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { GridColumnConfig, GridColumnType } from '@/types/smartgrid';
import { quickOrderService } from '@/api/services/quickOrderService';
import { InputDropdown, InputDropdownValue } from '@/components/ui/input-dropdown';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { tripPlanningService } from '@/api/services/tripPlanningService';

interface OthersSelectionDrawerProps {
  tripNo?: any;
  tripStatus?: any;
  isOpen: boolean;
  onClose: () => void;
  // onAddResource: (formattedData?: { ResourceID: string; ResourceType: string }[]) => void;
  resourceType: 'Others' | 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule';
  // resourceData?: any[];
  // selectedResourcesRq?: any;
  isLoading?: boolean;
  onSubmit?: any
}
const wagonGroups = [
  { id: 1, name: "Load1", seqNo: 1, default: "Y", description: "Load1" },
  { id: 2, name: "Load2", seqNo: 2, default: "N", description: "Load1" },
];
// Resource type configurations
const resourceConfigs = {
  Others: {
    messageType: 'GetEquipment-CreateTripPlan',
    title: 'Others',
    buttonText: 'Update',
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

};

export const OthersSelectionDrawer: React.FC<OthersSelectionDrawerProps> = ({
  tripNo,
  tripStatus,
  isOpen,
  onClose,
  // onAddResource,
  resourceType,
  // selectedResourcesRq,
  // resourceData: propResourceData,
  onSubmit,
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
  const [wagonDetailsQuantity, setWagonDetailsQuantity] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [wagonQty, setWagonQty] = useState<any>([]);
  const [remark, setRemark] = useState('');
  const [supplierRefNo, setSupplierRefNo] = useState('');
  const [planType, setPlanType] = useState("roundTrip");
  const [loadType, setLoadType] = useState('Load Type');
  const [passNo, setPassNo] = useState('');
  
  const [tripStartDate, setTripStartDate] = useState('22-04-2025');
  const [tripStartTime, setTripStartTime] = useState('14:00');
  const [tripEndDate, setTripEndDate] = useState('22-04-2025');
  const [tripEndTime, setTripEndTime] = useState('14:00');


  const [apiData, setApiData] = useState(null);
  const messageTypes = [
    "Load type Init",
    "Wagon Qty UOM Init",
    "Container Qty UOM Init",
    "Product Qty UOM Init",
    "THU Qty UOM Init",
  ];

  const config = resourceConfigs[resourceType];
  // Iterate through all messageTypes
  const fetchAll = async () => {
    setLoading(false);
    for (const type of messageTypes) {
      await fetchData(type);
    }
  };

  useEffect(() => {
    getTripDataByID(tripNo);
    fetchAll();

  }, []);
  const getTripDataByID = async (tripID: string) => {
    console.log("Inside getTripDataByID")
    const response: any = await tripPlanningService.getTripDataByID(tripID);
    console.log("response ===", JSON.parse(response?.data?.ResponseData || "{}"));
    const data = JSON.parse(response?.data?.ResponseData || "{}");
    const tripNoFromAPI = data?.Header?.TripNo;
    console.log("data ===", tripNoFromAPI);
    if (data.SupplierRefNo != undefined && data.SupplierRefNo != null) {
      // setSupplierRefNo(data.SupplierRefNo)
      setSupplierRefNo("bbbbbbb")
    }
    if (data.SupplierRefNo != undefined && data.SupplierRefNo != null) {
      setSupplierRefNo(data.SupplierRefNo)
    }
    if(data.IsRoundTrip=="1"){
      setPlanType("roundTrip");
    }
    if(data.IsOneWay=="1"){
      setPlanType("oneWay");
    }
    // Also update the selected row objects with the TripNo if available
    if (tripNoFromAPI && selectedRowObjects?.[0]) {
      const updatedSelectedRowObjects = [...selectedRowObjects];
      updatedSelectedRowObjects[0] = {
        ...updatedSelectedRowObjects[0],
        TripNo: tripNoFromAPI
      };
      setSelectedRowObjects(updatedSelectedRowObjects);
      console.log("Updated selectedRowObjects with TripNo:", updatedSelectedRowObjects);
    }

    return tripNoFromAPI;
  }
  useEffect(() => {
  })
  //API Call for dropdown data
  const fetchData = async (messageType) => {
    console.log("fetch data");
    setLoading(false);
    // setError(null);
    try {
      console.log("fetch try");
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType });
      setApiData(data);
      console.log("load inside try", data);

      if (messageType == "Wagon Qty UOM Init") {
        setWagonQty(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "Load type Init") {
        setLoadType(JSON.parse(data?.data?.ResponseData) || []);
      }

    } catch (err) {
      // setError(`Error fetching API data for ${messageType}`);
      // setApiData(data);
    }
    finally {
      setLoading(true);
    }
  };
  // Generic fetch function for master common data using quickOrderService.getMasterCommonData
  const fetchMasterData = (messageType: string) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data
      return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
        ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
          ? {
            label: `${item.id} || ${item.name}`,
            value: `${item.id} || ${item.name}`,
          }
          : {})
      }));

      // Fallback to empty array if API call fails
      return [];
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      // Return empty array on error
      return [];
    }
  };
  // Get configuration for current resource type
  const fetchLoadType= fetchMasterData("Load type Init");
  const fetchActivityName = fetchMasterData("Activity Name Init");

  // Use prop data if provided, otherwise use local data
  // const currentResourceData = propResourceData || resourceData;

  // Get the ID field for the current resource type
  // const getIdField = () => config.idField;

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
  // useEffect(() => {
  //   if (isOpen) {
  //     console.log("INSIDE useEffect, isOpen-true", selectedResourcesRq);

  //     // Step 1: Clear previous selections
  //     setSelectedRows(new Set());
  //     setSelectedRowIds(new Set());
  //     setSelectedRowObjects([]);
  //     setRowTripId([]);
  //     console.log("Selection cleared on drawer open");

  //     // Step 2: Prepare ID field and the list of EquipmentIDs to match
  //     const idField = getIdField(); // e.g. "EquipmentID", "DriverID", etc.
  //     console.log("idField:", idField);

  //     // Extract all EquipmentIDs from selectedResourcesRq
  //     if(selectedResourcesRq!=0){
  //       const equipmentIds = selectedResourcesRq
  //         ?.filter((r) => r?.ResourceType === "Equipment" && r?.EquipmentID)
  //         ?.map((r) => r.EquipmentID);

  //       console.log("equipmentIds to match:", equipmentIds);

  //       if (equipmentIds?.length > 0) {
  //         const newSelectedRows = new Set<number>();
  //         const newSelectedRowIds = new Set<string>();
  //         const newSelectedRowObjects: any[] = [];

  //         currentResourceData?.forEach((row: any, index: number) => {
  //           const rowId = row[idField];
  //           if (equipmentIds.includes(rowId)) {
  //             newSelectedRows.add(index);
  //             newSelectedRowIds.add(rowId);
  //             newSelectedRowObjects.push(row);
  //           }
  //         });

  //         if (newSelectedRowIds.size > 0) {
  //           setSelectedRows(newSelectedRows);
  //           setSelectedRowIds(newSelectedRowIds);
  //           setSelectedRowObjects(newSelectedRowObjects);
  //           setRowTripId(Array.from(newSelectedRowIds));

  //           console.log("Auto-selected equipment rows:", newSelectedRowObjects);
  //         } else {
  //           console.log("No matching equipment rows found.");
  //         }
  //       }
  //     }
  //   }
  // }, [isOpen, selectedResourcesRq, currentResourceData]);


  // Load resource data only if no prop data is provided
  // useEffect(() => {
  //   console.log("propResourceData ===", propResourceData);
  //   console.log("currentResourceData", currentResourceData);
  //   if (!propResourceData) {
  //     setLoading(true);
  //     // Simulate API call
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 500);
  //   }
  // }, [propResourceData]);

  // Handle row selection from checkbox
  // const handleRowSelection = (selectedRowIndices: Set<number>) => {
  //   console.log('Selected rows changed via checkbox:', selectedRowIndices);

  //   const currentData = currentResourceData.length > 0 ? currentResourceData : [];

  //   // Get the ID field for current resource type
  //   const idField = getIdField();

  //   // Check if this resource type should use single selection
  //   const isSingleSelectionMode = config.gridTitle === 'Supplier' || config.gridTitle === 'Schedule';

  //   if (isSingleSelectionMode) {
  //     // Single selection mode for Supplier and Schedule
  //     if (selectedRowIndices.size > 1) {
  //       const lastSelectedIndex = Math.max(...Array.from(selectedRowIndices));
  //       const lastSelectedRow = currentData[lastSelectedIndex];

  //       if (lastSelectedRow) {
  //         const rowId = lastSelectedRow[idField];
  //         setSelectedRows(new Set([lastSelectedIndex]));
  //         setSelectedRowIds(new Set([rowId]));
  //         setSelectedRowObjects([lastSelectedRow]);
  //         setRowTripId([rowId]);
  //         console.log('Multiple selection detected - keeping only last selected:', rowId);
  //       }
  //     } else if (selectedRowIndices.size === 1) {
  //       // Single row selected
  //       const selectedIndex = Array.from(selectedRowIndices)[0];
  //       const selectedRow = currentData[selectedIndex];

  //       if (selectedRow) {
  //         const rowId = selectedRow[idField];
  //         setSelectedRows(selectedRowIndices);
  //         setSelectedRowIds(new Set([rowId]));
  //         setSelectedRowObjects([selectedRow]);
  //         setRowTripId([rowId]);
  //         console.log('Single row selected:', rowId);
  //       }
  //     } else {
  //       // No rows selected
  //       setSelectedRows(new Set());
  //       setSelectedRowIds(new Set());
  //       setSelectedRowObjects([]);
  //       setRowTripId([]);
  //       console.log('No rows selected');
  //     }
  //   } else {
  //     // Multi-selection mode for other resource types (Equipment, Driver, Handler, Vehicle)
  //     setSelectedRows(selectedRowIndices);

  //     const selectedObjects = Array.from(selectedRowIndices)
  //       .map(index => currentData[index])
  //       .filter(Boolean);

  //     // Create a new Set of unique row IDs using dynamic ID field
  //     const newSelectedRowIds = new Set(selectedObjects.map(row => row[idField]));

  //     // Update selected row objects to ensure uniqueness by ID
  //     const uniqueSelectedObjects = selectedObjects.filter((row, index, self) =>
  //       self.findIndex(r => r[idField] === row[idField]) === index
  //     );

  //     setSelectedRowIds(newSelectedRowIds);
  //     setSelectedRowObjects(uniqueSelectedObjects);
  //     setRowTripId(Array.from(newSelectedRowIds));

  //     console.log('Multi-selection mode - selected row objects:', uniqueSelectedObjects);
  //     console.log('Multi-selection mode - selected row IDs:', Array.from(newSelectedRowIds));
  //   }
  // };

  // Handle select all
  // const handleSelectAll = (isSelected: boolean) => {
  //   // Check if this resource type should use single selection
  //   const isSingleSelectionMode = config.gridTitle === 'Supplier' || config.gridTitle === 'Schedule';

  //   if (isSelected) {
  //     if (isSingleSelectionMode) {
  //       // For single selection mode, select only the first row
  //       const firstRow = resourceData[0];
  //       if (firstRow) {
  //         const idField = getIdField();
  //         const rowId = firstRow[idField];
  //         setSelectedRows(new Set([0]));
  //         setSelectedRowIds(new Set([rowId]));
  //         setSelectedRowObjects([firstRow]);
  //         setRowTripId([rowId]);
  //         console.log('Select all (single mode) - keeping only first row:', rowId);
  //       }
  //     } else {
  //       // For multi-selection mode, select all rows
  //       const allIndices = new Set(resourceData.map((_, index) => index));
  //       const idField = getIdField();
  //       const allRowIds = new Set(resourceData.map(row => row[idField]));

  //       setSelectedRows(allIndices);
  //       setSelectedRowIds(allRowIds);
  //       setSelectedRowObjects([...resourceData]);
  //       setRowTripId(Array.from(allRowIds));
  //       console.log('Select all (multi mode) - selected all rows:', Array.from(allRowIds));
  //     }
  //   } else {
  //     // Clear all selections
  //     setSelectedRows(new Set());
  //     setSelectedRowIds(new Set());
  //     setSelectedRowObjects([]);
  //     setRowTripId([]);
  //     console.log('Select all - cleared all selections');
  //   }
  // };

  // Handle row click
  // const handleRowClick = (row: any, index: number) => {
  //   console.log('Row clicked:', row, index);
  //   console.log("selectedRowIds = ",)

  //   // Get the ID field for current resource type
  //   const idField = getIdField();
  //   const rowId = row[idField];

  //   // Check if this resource type should use single selection
  //   const isSingleSelectionMode = config.gridTitle === 'Supplier' || config.gridTitle === 'Schedule';

  //   if (isSingleSelectionMode) {
  //     // Single selection mode for Supplier and Schedule
  //     const isRowSelected = selectedRowIds.has(rowId);

  //     if (isRowSelected) {
  //       // If clicking on already selected row, deselect it (clear all)
  //       setSelectedRows(new Set());
  //       setSelectedRowIds(new Set());
  //       setSelectedRowObjects([]);
  //       setRowTripId([]);
  //       console.log('Deselected row and cleared all selections:', rowId);
  //     }
  //     else {
  //       // If clicking on new row, clear previous selections and select only this row
  //       setSelectedRows(new Set([index]));
  //       setSelectedRowIds(new Set([rowId]));
  //       setSelectedRowObjects([row]);
  //       setRowTripId([rowId]);
  //       console.log('Selected only this row (cleared previous selections):', rowId);
  //     }
  //   } else {
  //     // Multi-selection mode for other resource types (Equipment, Driver, Handler, Vehicle)
  //     const isRowSelected = selectedRowIds.has(rowId);

  //     if (isRowSelected) {
  //       // Remove row: remove from all tracking sets/arrays
  //       const newSelectedRows = new Set(selectedRows);
  //       const newSelectedRowIds = new Set(selectedRowIds);
  //       const newSelectedRowObjects = [...selectedRowObjects];

  //       newSelectedRows.delete(index);
  //       newSelectedRowIds.delete(rowId);
  //       const objectIndex = newSelectedRowObjects.findIndex(obj => obj[idField] === rowId);
  //       if (objectIndex > -1) {
  //         newSelectedRowObjects.splice(objectIndex, 1);
  //       }

  //       setSelectedRows(newSelectedRows);
  //       setSelectedRowIds(newSelectedRowIds);
  //       setSelectedRowObjects(newSelectedRowObjects);
  //       setRowTripId(Array.from(newSelectedRowIds));
  //       console.log('Removed row from multi-selection:', rowId);
  //     }
  //     else {
  //       // Add row: add to all tracking sets/arrays (ensure uniqueness)
  //       const newSelectedRows = new Set(selectedRows);
  //       const newSelectedRowIds = new Set(selectedRowIds);
  //       const newSelectedRowObjects = [...selectedRowObjects];

  //       newSelectedRows.add(index);
  //       newSelectedRowIds.add(rowId);
  //       // Only add if not already in objects array (double-check uniqueness)
  //       if (!newSelectedRowObjects.some(obj => obj[idField] === rowId)) {
  //         newSelectedRowObjects.push(row);
  //       }

  //       setSelectedRows(newSelectedRows);
  //       setSelectedRowIds(newSelectedRowIds);
  //       setSelectedRowObjects(newSelectedRowObjects);
  //       setRowTripId(Array.from(newSelectedRowIds));
  //       console.log('Added row to multi-selection:', rowId);
  //     }
  //   }

  //   console.log('Selected row objects after click:', isSingleSelectionMode ? [row] : selectedRowObjects);
  //   console.log('Selected row IDs after click:', isSingleSelectionMode ? [rowId] : Array.from(selectedRowIds));
  // };

  // Handle add resource
  // const handleAddResource = () => {
  //   const idField = getIdField();
  //   const selectedItems = currentResourceData.filter(item => selectedRowIds.has(item[idField]));

  //   // Map ResourceType based on idField
  //   const getResourceTypeFromIdField = (idField: string) => {
  //     switch (idField) {
  //       case 'EquipmentID':
  //         return 'Equipment';
  //       case 'VendorID':
  //         return 'Agent';
  //       case 'DriverCode':
  //         return 'Driver';
  //       case 'HandlerID':
  //         return 'Handler';
  //       case 'VehicleID':
  //         return 'Vehicle';
  //       case 'SupplierID':
  //         return 'Schedule';
  //       default:
  //         return resourceType; // fallback to prop value
  //     }
  //   };

  //   // Parse serviceType to extract Service and ServiceDescription
  //   const parseServiceType = (serviceTypeValue: string | undefined) => {
  //     if (!serviceTypeValue) {
  //       return { Service: "", ServiceDescription: "" };
  //     }

  //     const parts = serviceTypeValue.split(' || ');
  //     return {
  //       Service: (parts[0] || "").trim(),
  //       ServiceDescription: (parts[1] || "").trim()
  //     };
  //   };

  //   // Parse subServiceType to extract SubService and SubServiceDescription
  //   const parseSubServiceType = (subServiceTypeValue: string | undefined) => {
  //     if (!subServiceTypeValue) {
  //       return { SubService: "", SubServiceDescription: "" };
  //     }

  //     const parts = subServiceTypeValue.split(' || ');
  //     return {
  //       SubService: (parts[0] || "").trim(),
  //       SubServiceDescription: (parts[1] || "").trim()
  //     };
  //   };

  //   const { Service, ServiceDescription } = parseServiceType(serviceType);
  //   const { SubService, SubServiceDescription } = parseSubServiceType(subServiceType);

  //   // Format the data based on resource type - loop through all selected IDs
  //   const formattedDataArray: any = rowTripId.map(resourceId => ({
  //     ResourceID: resourceId,
  //     ResourceType: getResourceTypeFromIdField(idField),
  //     Service: Service,
  //     ServiceDescription: ServiceDescription,
  //     SubService: SubService,
  //     SubServiceDescription: SubServiceDescription,
  //   }));

  //   console.log('handle resource click', idField, serviceType, subServiceType);
  //   console.log('rowTripId"s===========', rowTripId);
  //   console.log('formattedDataArray===========', formattedDataArray);

  //   // Pass both original selected items and formatted data array to parent
  //   onAddResource(formattedDataArray);
  //   onClose();
  // };
  const handleQcChange = (dropdownValue: string, inputValue: string) => {
    // setQc3Dropdown(dropdownValue);
    // setQc3Input(inputValue);
    // setFormData(prev => ({
    //   ...prev,
    //   qcValue: `${dropdownValue}-${inputValue}`
    // }));
  };
  const handleAddOthers = () => {
    console.log("Handle Others save")
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="40%"
      title="Trip Details"
      isBack={false}
      contentBgColor='#f8f9fc'
      onScrollPanel={true}
      badgeContent={tripNo}
      // badgeContent='BR/2025/0286'
      isBadgeRequired={true}
      statusBadgeContent={tripStatus}
      isStatusBadgeRquired={true}>
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="space-y-4 px-2 m-4">

          {/* <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 font-medium mb-1">Trip From</label>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <span>PAR565, Paris</span>
                <i className="fa fa-info-circle text-gray-400 text-xs"></i>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 font-medium mb-1">Trip To</label>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <span>BER323, Berlin</span>
                <i className="fa fa-info-circle text-gray-400 text-xs"></i>
              </div>
            </div>
          </div> */}
          {/* Radio Buttons */}
          <div className="flex items-center justify-between gap-6 items-center">
            <div>
              <RadioGroup
                value={planType}
                onValueChange={setPlanType}
                className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oneWay" id="plan" />
                  <label htmlFor="plan" className="cursor-pointer text-sm font-medium text-gray-700">
                    One Way
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="roundTrip" id="actual" />
                  <label htmlFor="actual" className="cursor-pointer text-sm font-medium text-gray-700">
                    Round Trip
                  </label>
                </div>
              </RadioGroup>
            </div>
            {/* Search */}
            {/* <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pass No"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pr-10"
              />
            </div> */}
            {/* </div> */}
          </div>


          <div className="grid grid-cols-1 gap-4" >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Load Type</label>

              <DynamicLazySelect
                fetchOptions={fetchLoadType}
                value={loadType}
                onChange={(value) => setLoadType(value as string)}
                hideSearch={true}
                disableLazyLoading={true}
                placeholder="Select"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pass No.</label>

              {/* <DynamicLazySelect
                fetchOptions={fetchActivityName}
                value={wagonGroup}
                onChange={(value) => setWagonGroup(value as string)}
                placeholder="Select"
              /> */}
              <Input
                type="text"
                value={passNo}
                onChange={(e) => setPassNo(e.target.value)}
                placeholder="Enter Pass No"
              />
            </div>
            {/* Trip Start Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Trip Start Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip Start Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    placeholder="DD-MMM-YYYY"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Trip Start Time */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip Start Time</label>
                <div className="relative">
                  <Input
                    type="time"
                    id="incidentTime"
                    value={tripStartTime}
                    onChange={(e) => setTripStartTime(e.target.value)}
                    placeholder="HH:MM"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Trip End Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Trip Start Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip End Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={tripEndDate}
                    onChange={(e) => setTripEndDate(e.target.value)}
                    placeholder="DD-MMM-YYYY"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Trip Start Time */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip End Time</label>
                <div className="relative">
                  <Input
                    type="time"
                    id="endTime"
                    value={tripEndTime}
                    onChange={(e) => setTripEndTime(e.target.value)}
                    placeholder="HH:MM"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">QC UserDefined</label>
              <InputDropdown
                value={wagonDetailsQuantity}
                onChange={setWagonDetailsQuantity}
                options={wagonQty}
                placeholder="Enter Value"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="Remark">Remarks</label>
              <Input
                id="Remark"
                value=""
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter Remark" />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplierRefNo">Supplier Ref No.</label>
              <Input
                id="supplierRefNo"
                value=""
                onChange={(e) => setSupplierRefNo(e.target.value)}
                placeholder="Enter supplier Referenc No." />
            </div>
          </div>
        </div>

        {/* Resource Section */}
        {/* <div className="space-y-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Trip Details</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              </Badge>
            </div>


          </div>


        </div> */}
      </div>
      <div className="absolute bottom-0 right-0 w-full bg-white border-t border-gray-200 flex justify-end px-6 py-3">
        <button
          onClick={handleAddOthers} // define this function as needed
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md px-6 py-2 shadow-sm"
        >
          Update
        </button>
      </div>

    </SideDrawer>
    // <SideDrawer
    //   isOpen={isOpen}
    //   onClose={onClose}
    //   title="Trip Details"
    //   width="45%"
    //   slideDirection="right"
    //   showFooter={true}
    //   footerButtons={[
    //     {
    //       label: config.buttonText,
    //       variant: 'default',
    //       action: handleAddOthers,
    //       disabled: false
    //     }
    //   ]}
    // >
    //   <div className="space-y-6">
    //     {/* Filter Section */}
    //     <div className="space-y-4 px-2 m-4">

    //       <div className="grid grid-cols-2 gap-4 items-center">
    //         {/* Trip From */}
    //         <div className="flex flex-col">
    //           <label className="text-xs text-gray-500 font-medium mb-1">Trip From</label>
    //           <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
    //             <span>PAR565, Paris</span>
    //             <i className="fa fa-info-circle text-gray-400 text-xs"></i>
    //           </div>
    //         </div>

    //         {/* Trip To */}
    //         <div className="flex flex-col">
    //           <label className="text-xs text-gray-500 font-medium mb-1">Trip To</label>
    //           <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
    //             <span>BER323, Berlin</span>
    //             <i className="fa fa-info-circle text-gray-400 text-xs"></i>
    //           </div>
    //         </div>
    //         </div>
    //         {/* Radio Buttons */}
    //         <div className="grid grid-cols-3 gap-4 items-center">
    //           <div>
    //           <RadioGroup
    //             value={planType}
    //             onValueChange={setPlanType}
    //             className="flex gap-6"
    //           >
    //             <div className="flex items-center space-x-2">
    //               <RadioGroupItem value="plan" id="plan" />
    //               <label htmlFor="plan" className="cursor-pointer text-sm font-medium text-gray-700">
    //                 One Way
    //               </label>
    //             </div>
    //             <div className="flex items-center space-x-2">
    //               <RadioGroupItem value="actual" id="actual" />
    //               <label htmlFor="actual" className="cursor-pointer text-sm font-medium text-gray-700">
    //                 Round Trip
    //               </label>
    //             </div>
    //           </RadioGroup>
    //           </div>
    //         </div>


    //       <div className="grid grid-cols-1 gap-4" >
    //         <div className="space-y-2">
    //           <label className="text-sm font-medium text-gray-700">QC UserDefined1</label>
    //           <InputDropdown
    //             value={wagonDetailsQuantity}
    //             onChange={setWagonDetailsQuantity}
    //             options={wagonQty}
    //             placeholder="Enter Quantity"
    //           />
    //         </div>
    //         <div className="space-y-2">
    //           <label htmlFor="Remark">Remarks1</label>
    //           <Input
    //             id="Remark"
    //             value=""
    //             onChange={(e) => setRemark(e.target.value)}
    //             placeholder="Enter Remark" />
    //         </div>

    //         <div className="space-y-2">
    //           <label htmlFor="supplierRefNo">Supplier Ref No:</label>
    //           <Input
    //             id="supplierRefNo"
    //             value=""
    //             onChange={(e) => setSupplierRefNo(e.target.value)}
    //             placeholder="Enter supplier Referenc No:" />
    //         </div>
    //       </div>
    //     </div>

    //     {/* Resource Section */}
    //     <div className="space-y-4 px-4">
    //       {/* Resource Header */}
    //       <div className="flex items-center justify-between">
    //         <div className="flex items-center space-x-2">
    //           <h3 className="text-lg font-semibold text-gray-900">Trip Details</h3>
    //           <Badge variant="secondary" className="bg-blue-100 text-blue-800">
    //             {/* {currentResourceData.length} */}
    //           </Badge>
    //         </div>

    //         {/* Search */}
    //         {/* <div className="relative">
    //           <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    //           <Input
    //             placeholder="Search"
    //             value={searchTerm}
    //             onChange={(e) => setSearchTerm(e.target.value)}
    //             className="w-64 pr-10"
    //           />
    //         </div> */}
    //       </div>


    //     </div>
    //   </div>
    // </SideDrawer>
  );
};
