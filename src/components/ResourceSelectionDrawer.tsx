import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/SideDrawer';
import { SmartGrid } from '@/components/SmartGrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { GridColumnConfig, GridColumnType } from '@/types/smartgrid';
import { quickOrderService } from '@/api/services/quickOrderService';

interface ResourceSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (selectedResources: any[]) => void;
  resourceType: 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle';
  resourceData?: any[];
  isLoading?: boolean;
}

// Resource type configurations
const resourceConfigs = {
  Equipment: {
    messageType: 'GetEquipment-CreateTripPlan',
    title: 'Select Equipment',
    buttonText: 'Add Equipment to CO',
    gridTitle: 'Equipment',
    columns: [
      {
        key: 'EquipmentType',
        label: 'Equipment Type',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'EquipmentID',
        label: 'Equipment ID',
        type: 'Text',
        width: 200,
        editable: false
      },
      {
        key: 'OwnerID',
        label: 'Owner ID',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'EquipmentCategory',
        label: 'Wagon/Container',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'Ownership',
        label: 'Ownership',
        type: 'Badge',
        width: 120,
        editable: false
      },
      {
        key: 'Keeper',
        label: 'Keeper',
        type: 'Text',
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
    columns: [
      {
        key: 'VendorID',
        label: 'Vendor ID',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'VendorName',
        label: 'Vendor Name',
        type: 'Text',
        width: 200,
        editable: false
      },
      {
        key: 'ServiceType',
        label: 'Service Type',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'SubServiceType',
        label: 'Sub Service Type',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'ContractID',
        label: 'Contract ID',
        type: 'Text',
        width: 120,
        editable: false
      },
      {
        key: 'RatingOnTime',
        label: 'Rating',
        type: 'Text',
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
    columns: [
      {
        key: 'DriverCode',
        label: 'Driver ID',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'DriverName',
        label: 'Driver Name',
        type: 'Text',
        width: 200,
        editable: false
      },
      {
        key: 'DriverStatus',
        label: 'Status',
        type: 'Badge',
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
    columns: [
      {
        key: 'HandlerID',
        label: 'Handler ID',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'HandlerName',
        label: 'Handler Name',
        type: 'Text',
        width: 200,
        editable: false
      },
      {
        key: 'HandlerGrade',
        label: 'Handler Grade',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'Supplier',
        label: 'Supplier',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'ContractID',
        label: 'ContractID',
        type: 'Text',
        width: 120,
        editable: false
      },
      {
        key: 'TarifID',
        label: 'TarifID',
        type: 'Text',
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
    columns: [
      {
        key: 'VehicleID',
        label: 'Vehicle ID',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'VehicleType',
        label: 'Vehicle Type',
        type: 'Text',
        width: 200,
        editable: false
      },
      {
        key: 'ContractID',
        label: 'Contract ID',
        type: 'Text',
        width: 120,
        editable: false
      },
      {
        key: 'OwnerID',
        label: 'Owner ID',
        type: 'Text',
        width: 150,
        editable: false
      },
      {
        key: 'VehicleStatus',
        label: 'Vehicle Status',
        type: 'Badge',
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

  // Get configuration for current resource type
  const config = resourceConfigs[resourceType];

  // Use prop data if provided, otherwise use local data
  const currentResourceData = propResourceData || resourceData;

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

  // Handle resource selection
  const handleResourceSelection = (resourceId: string, isSelected: boolean) => {
    console.log("==== resourceId", resourceId);
    console.log("==== isSelected", isSelected);
    console.log("==== selectedRows", selectedRows);
    const newSelection = new Set(selectedRows);
    if (isSelected) {
      newSelection.add(Number(resourceId));
    } else {
      newSelection.delete(Number(resourceId));
    }
    setSelectedRows(newSelection);
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = new Set(resourceData.map(item => item.id));
      setSelectedResources(allIds);
    } else {
      setSelectedResources(new Set());
    }
  };

  // Handle add resource
  const handleAddResource = () => {
    const selectedItems = currentResourceData.filter(item => selectedResources.has(item.id));
    onAddResource(selectedItems);
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
          disabled: selectedResources.size === 0
        }
      ]}
    >
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="space-y-4">
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
        <div className="space-y-4">
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-b-2 border-gray-200"></div>
                  <div className="text-sm text-gray-600">Loading {config.gridTitle.toLowerCase()} data...</div>
                </div>
              </div>
            ) : (
              <SmartGrid
                columns={config.columns}
                data={currentResourceData}
                gridTitle=""
                recordCount={currentResourceData.length}
                showCreateButton={false}
                searchPlaceholder=""
                paginationMode="pagination"
                clientSideSearch={false}
                showSubHeaders={false}
                hideAdvancedFilter={false}
                hideCheckboxToggle={false}
                hideToolbar={true}
                showServersideFilter={false}
                selectedRows={selectedRows}
                onSelectionChange={(selectedRows) => {
                  const newSelection = new Set<number>();
                  selectedRows.forEach(index => {
                    const item = currentResourceData[index];
                    if (item) {
                      newSelection.add(Number(item.id));
                    }
                  });
                  setSelectedRows(newSelection);
                }}
                onRowClick={(row, index) => {
                  const item = currentResourceData[index];
                  if (item) {
                    handleResourceSelection(item.id, !selectedResources.has(item.id));
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};
