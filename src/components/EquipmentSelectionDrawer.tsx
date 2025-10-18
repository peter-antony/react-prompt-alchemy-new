import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/SideDrawer';
import { SmartGrid } from '@/components/SmartGrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Calendar, List } from 'lucide-react';
import { GridColumnConfig, GridColumnType } from '@/types/smartgrid';
import { quickOrderService } from '@/api/services/quickOrderService';

interface EquipmentSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEquipment: (selectedEquipment: any[]) => void;
}

interface EquipmentItem {
  id: string;
  equipmentType: string;
  equipmentId: string;
  equipmentDescription: string;
  ownerId: string;
  ownerDescription: string;
  wagonContainer: string;
  wagonContainerDescription: string;
  ownership: string;
  keeper: string;
  status: string;
  effectiveFromDate: string;
  effectiveToDate: string;
}

export const EquipmentSelectionDrawer: React.FC<EquipmentSelectionDrawerProps> = ({
  isOpen,
  onClose,
  onAddEquipment
}) => {
  const [serviceType, setServiceType] = useState<string>('Service Type 1');
  const [subServiceType, setSubServiceType] = useState<string>('Subservice Type 1');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Grid columns configuration
  const equipmentColumns: GridColumnConfig[] = [
    {
      key: 'select',
      label: '',
      type: 'Checkbox' as GridColumnType,
      width: 50,
      editable: false,
      sortable: false,
      filterable: false
    },
    {
      key: 'equipmentType',
      label: 'Equipment Type',
      type: 'Text',
      width: 150,
      editable: false
    },
    {
      key: 'equipmentId',
      label: 'Equipment ID',
      type: 'Text',
      width: 200,
      editable: false
    },
    {
      key: 'ownerId',
      label: 'Owner ID',
      type: 'Text',
      width: 150,
      editable: false
    },
    {
      key: 'wagonContainer',
      label: 'Wagon/Container',
      type: 'Text',
      width: 150,
      editable: false
    },
    {
      key: 'ownership',
      label: 'Ownership',
      type: 'Badge',
      width: 120,
      editable: false
    },
    {
      key: 'keeper',
      label: 'Keeper',
      type: 'Text',
      width: 120,
      editable: false
    }
  ];

  // Mock data for equipment
  const mockEquipmentData: EquipmentItem[] = [
    {
      id: '1',
      equipmentType: 'Equipment Type 1',
      equipmentId: 'EQP-ID-000001',
      equipmentDescription: 'Description',
      ownerId: 'OWN00001',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00001',
      wagonContainerDescription: 'Description',
      ownership: 'Owned',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    },
    {
      id: '2',
      equipmentType: 'Equipment Type 2',
      equipmentId: 'EQP-ID-000002',
      equipmentDescription: 'Description',
      ownerId: 'OWN00002',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00002',
      wagonContainerDescription: 'Description',
      ownership: 'Leased',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    },
    {
      id: '3',
      equipmentType: 'Equipment Type 3',
      equipmentId: 'EQP-ID-000003',
      equipmentDescription: 'Description',
      ownerId: 'OWN00003',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00003',
      wagonContainerDescription: 'Description',
      ownership: 'Owned',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    },
    {
      id: '4',
      equipmentType: 'Equipment Type 4',
      equipmentId: 'EQP-ID-000004',
      equipmentDescription: 'Description',
      ownerId: 'OWN00004',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00004',
      wagonContainerDescription: 'Description',
      ownership: 'Owned',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    },
    {
      id: '5',
      equipmentType: 'Equipment Type 5',
      equipmentId: 'EQP-ID-000005',
      equipmentDescription: 'Description',
      ownerId: 'OWN00005',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00005',
      wagonContainerDescription: 'Description',
      ownership: 'Leased',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    },
    {
      id: '6',
      equipmentType: 'Equipment Type 6',
      equipmentId: 'EQP-ID-000006',
      equipmentDescription: 'Description',
      ownerId: 'OWN00006',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00006',
      wagonContainerDescription: 'Description',
      ownership: 'Owned',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    },
    {
      id: '7',
      equipmentType: 'Equipment Type 7',
      equipmentId: 'EQP-ID-000007',
      equipmentDescription: 'Description',
      ownerId: 'OWN00007',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00007',
      wagonContainerDescription: 'Description',
      ownership: 'Owned',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    },
    {
      id: '8',
      equipmentType: 'Equipment Type 8',
      equipmentId: 'EQP-ID-000008',
      equipmentDescription: 'Description',
      ownerId: 'OWN00008',
      ownerDescription: 'Description',
      wagonContainer: 'WAG00008',
      wagonContainerDescription: 'Description',
      ownership: 'Leased',
      keeper: 'Keeper',
      status: 'Active',
      effectiveFromDate: '2024-01-01',
      effectiveToDate: '2024-12-31'
    }
  ];

  // Service Type options fetch function
  const fetchServiceTypeOptions = async (params: { searchTerm: string; offset: number; limit: number }) => {
    // Mock API call - replace with actual API
    const mockOptions = [
      { label: 'Service Type 1', value: 'Service Type 1' },
      { label: 'Service Type 2', value: 'Service Type 2' },
      { label: 'Service Type 3', value: 'Service Type 3' }
    ];
    
    return mockOptions.filter(option => 
      option.label.toLowerCase().includes(params.searchTerm.toLowerCase())
    );
  };

  // Sub Service Type options fetch function
  const fetchSubServiceTypeOptions = async (params: { searchTerm: string; offset: number; limit: number }) => {
    // Mock API call - replace with actual API
    const mockOptions = [
      { label: 'Subservice Type 1', value: 'Subservice Type 1' },
      { label: 'Subservice Type 2', value: 'Subservice Type 2' },
      { label: 'Subservice Type 3', value: 'Subservice Type 3' }
    ];
    
    return mockOptions.filter(option => 
      option.label.toLowerCase().includes(params.searchTerm.toLowerCase())
    );
  };

  // Load equipment data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEquipmentData(mockEquipmentData);
      setLoading(false);
    }, 500);
  }, []);

  // Handle equipment selection
  const handleEquipmentSelection = (equipmentId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedEquipment);
    if (isSelected) {
      newSelection.add(equipmentId);
    } else {
      newSelection.delete(equipmentId);
    }
    setSelectedEquipment(newSelection);
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = new Set(equipmentData.map(item => item.id));
      setSelectedEquipment(allIds);
    } else {
      setSelectedEquipment(new Set());
    }
  };

  // Handle add equipment
  const handleAddEquipment = () => {
    const selectedItems = equipmentData.filter(item => selectedEquipment.has(item.id));
    onAddEquipment(selectedItems);
    onClose();
  };

  // Filter equipment data based on search
  const filteredEquipmentData = equipmentData.filter(item =>
    item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.equipmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ownerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Process data for grid with selection state
  const processedData = filteredEquipmentData.map(item => ({
    ...item,
    select: selectedEquipment.has(item.id),
    ownership: item.ownership
  }));

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Select Equipment"
      width="75%"
      slideDirection="right"
      showFooter={true}
      footerButtons={[
        {
          label: 'Add Equipment to CO',
          variant: 'default',
          action: handleAddEquipment,
          disabled: selectedEquipment.size === 0
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

          {/* View Toggle */}
          {/* <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-md rounded-r-none"
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-l-none rounded-r-md"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </div> */}
        </div>

        {/* Equipment Section */}
        <div className="space-y-4">
          {/* Equipment Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Equipment</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {equipmentData.length}
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

          {/* Equipment Grid */}
          <div className="border rounded-lg overflow-hidden">
             <SmartGrid
               columns={equipmentColumns}
               data={processedData}
               gridTitle=""
               recordCount={processedData.length}
               showCreateButton={false}
               searchPlaceholder=""
               clientSideSearch={false}
               showSubHeaders={false}
               hideAdvancedFilter={false}
               hideCheckboxToggle={false}
               hideToolbar={true}
               showServersideFilter={false}
            //   selectedRows={selectedEquipment}
              onSelectionChange={(selectedRows) => {
                const newSelection = new Set<string>();
                selectedRows.forEach(index => {
                  const item = processedData[index];
                  if (item) {
                    newSelection.add(item.id);
                  }
                });
                setSelectedEquipment(newSelection);
              }}
              onRowClick={(row, index) => {
                const item = processedData[index];
                if (item) {
                  handleEquipmentSelection(item.id, !selectedEquipment.has(item.id));
                }
              }}
            />
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};
