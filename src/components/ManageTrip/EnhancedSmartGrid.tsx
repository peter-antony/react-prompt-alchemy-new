import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search,
  Filter,
  MoreHorizontal,
  Info,
  CheckCircle,
  Package,
  Edit3
} from 'lucide-react';
import { DraggableSubRow, SmartGridWithGrouping } from "@/components/SmartGrid";
import { GridColumnConfig } from '@/types/smartgrid';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { toast } from '../ui/sonner';


interface ActivityData {
  sno: number;
  behaviour: 'pickup' | 'via' | 'bhub';
  location: string;
  locationDetails?: { code: string; name: string }[];
  plannedActual: string;
  plannedActualDetails?: {
    wagonQuantity: string;
    containerQuantity: string;
    productWeight: string;
    thuQuantity: string;
  };
  consignment: string;
  status: 'completed' | 'in-progress' | 'pending';
}

const activitiesData: ActivityData[] = [
  {
    sno: 1,
    behaviour: 'pickup',
    location: 'BER-BER',
    locationDetails: [
      { code: 'BER', name: 'Berlin' },
      { code: 'BER', name: 'Berlin' }
    ],
    plannedActual: 'Planned: 12:00\nActual: 12:15',
    plannedActualDetails: {
      wagonQuantity: '12 Nos',
      containerQuantity: '12 Nos',
      productWeight: '23 Ton',
      thuQuantity: '12 Nos'
    },
    consignment: 'CON001',
    status: 'completed'
  },
  {
    sno: 2,
    behaviour: 'via',
    location: 'BER-FRK',
    plannedActual: 'Planned: 18:00\nActual: -',
    consignment: 'CON001',
    status: 'completed'
  },
  {
    sno: 3,
    behaviour: 'bhub',
    location: 'FRK-PAR',
    plannedActual: 'Planned: 06:00\nActual: -',
    consignment: 'CON001',
    status: 'completed'
  }
];

const BehaviorBadge = ({ behavior }: { behavior: 'pickup' | 'via' | 'bhub' }) => {
  const config = {
    pickup: { label: 'Pickup', className: 'bg-behavior-pickup text-behavior-pickup-text border-behavior-pickup-text/20' },
    via: { label: 'Via', className: 'bg-pink-50 text-behavior-via-text border-behavior-via-text/20' },
    bhub: { label: 'Bhub', className: 'bg-teal-50 text-behavior-bhub-text border-behavior-bhub-text/20' }
  };

  return (
    <Badge variant="outline" className={`${config[behavior].className} border`}>
      {config[behavior].label}
    </Badge>
  );
};

const LocationCell = ({ location, details }: { location: string; details?: { code: string; name: string }[] }) => {
  if (!details) return <span className="text-sm">{location}</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-sm">{location}</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Location Details</h4>
            {details.map((detail, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                <span className="font-medium">{detail.code}</span>
                <div className="text-xs">{detail.name}</div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const PlannedActualCell = ({ plannedActual, details }: {
  plannedActual: string;
  details?: {
    wagonQuantity: string;
    containerQuantity: string;
    productWeight: string;
    thuQuantity: string;
  }
}) => {
  if (!details) {
    return (
      <div className="flex items-center gap-1">
        <Info className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer">
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Planned/Actual Details</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Wagon Quantity</span>
                <span className="text-primary font-medium">{details.wagonQuantity}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Container Quantity</span>
                <span className="text-primary font-medium">{details.containerQuantity}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Product Weight</span>
                <span className="text-primary font-medium">{details.productWeight}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">THU Quantity</span>
                <span className="text-primary font-medium">{details.thuQuantity}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
// Smart Grid configuration for Activities & Consignment with configured widths
const activitiesColumns: GridColumnConfig[] = [
  {
    key: 'leg',
    label: 'S. No.',
    type: 'Text',
    width: 100,
    sortable: true,
    filterable: true,
    editable: false,
    mandatory: true,
    subRow: false,
  },
  {
    key: 'behaviour',
    label: 'Behaviour',
    type: 'Badge',
    width: 130,
    sortable: true,
    filterable: true,
    editable: false,
    statusMap: {
      'Pick': 'bg-blue-100 text-blue-800',
      'Drvy': 'bg-green-100 text-green-800',
      'CHA-Import': 'bg-cyan-100 text-cyan-800',
      'PUD': 'bg-emerald-100 text-emerald-800',
      'GTIN': 'bg-pink-100 text-pink-800',
      'GTOUT': 'bg-orange-100 text-orange-800',
      'LHTA': 'bg-purple-100 text-purple-800'
    },
    subRow: false,
  },
  {
    key: 'location',
    label: 'Location',
    type: 'Text',
    width: 120,
    sortable: true,
    filterable: true,
    editable: false,
    subRow: false,
  },
  {
    key: 'plannedActual',
    label: 'Planned/Actual',
    type: 'Text',
    width: 140,
    sortable: true,
    filterable: true,
    editable: false,
    subRow: false,
  },
  {
    key: 'consignment',
    label: 'Consignment',
    type: 'Text',
    width: 150,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: false,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'Badge',
    width: 110,
    sortable: true,
    filterable: true,
    editable: false,
    statusMap: {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-gray-100 text-gray-800'
    },
    subRow: false,
  },
  {
    key: 'action',
    label: 'Action',
    type: 'Text',
    width: 100,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: false,
  },
  {
    key: 'actualDateTime',
    label: 'Actual date and time',
    type: 'Date',
    width: 180,
    sortable: true,
    filterable: true,
    editable: true,
    subRow: true
  }
];

const activitiesGridData = [
  {
    leg: '1',
    behaviour: 'Pick',
    location: 'CHN-MUM',
    plannedActual: '20/20',
    consignment: '',
    status: 'completed',
    action: '',
    actualDateTime: '2024-01-15T10:30:00'
  },
  {
    leg: '2',
    behaviour: 'Drvy',
    location: 'CHN-DEL',
    plannedActual: '20/20',
    consignment: '',
    status: 'completed',
    action: '',
    actualDateTime: '2024-01-16T14:15:00'
  },
  {
    leg: '3',
    behaviour: 'CHA-Import',
    location: 'DEL-CHN',
    plannedActual: '20/20',
    consignment: '',
    status: 'completed',
    action: '',
    actualDateTime: '2024-01-17T08:45:00'
  },
  {
    leg: '4',
    behaviour: 'PUD',
    location: 'CHN-HYD',
    plannedActual: '20/20',
    consignment: '',
    status: 'completed',
    action: '',
    actualDateTime: '2024-01-18T16:20:00'
  }
];

export const EnhancedSmartGrid = () => {
  const gridState = useSmartGridState();
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  

  const handleLinkClick = (value: any, row: any) => {
    console.log("Link clicked:", value, row);
  };

  const handleUpdate = async (updatedRow: any) => {
    console.log("Updating row:", updatedRow);
    gridState.setGridData((prev) =>
      prev.map((row, index) =>
        index === updatedRow.index ? { ...row, ...updatedRow } : row
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
  };

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

  useEffect(() => {
    console.log('Activities Grid Data:', activitiesGridData);
    setApiStatus('loading');
    gridState.setColumns(activitiesColumns);
    gridState.setGridData(activitiesGridData);
    gridState.setLoading(false);
  }, []);


  return (
    <div className="space-y-4">
      {/* <SmartGridWithGrouping
        columns={activitiesColumns}
        data={activitiesGridData}
        gridTitle="Activities & Consignment"
        recordCount={7}
        searchPlaceholder="Search activities..."
        showCreateButton={false}
        editableColumns={false}
        paginationMode="pagination"
      /> */}
      <SmartGridWithGrouping
        key={`grid-${gridState.forceUpdate}`}
        columns={gridState.columns}
        data={gridState.gridData}
        groupableColumns={[]}
        showGroupingDropdown={true}
        editableColumns={['plannedStartEndDateTime']}
        paginationMode="pagination"
        onLinkClick={handleLinkClick}
        onUpdate={handleUpdate}
        onSubRowToggle={gridState.handleSubRowToggle}
        // selectedRows={selectedRows}
        // onSelectionChange={handleRowSelection}
        // onFiltersChange={setCurrentFilters}
        // onSearch={handleServerSideSearch}
        // onClearAll={clearAllFilters}
        // rowClassName={(row: any, index: number) =>
        //   selectedRows.has(index) ? 'smart-grid-row-selected' : ''
        // }
        nestedRowRenderer={renderSubRow}
        // configurableButtons={gridConfigurableButtons}
        showDefaultConfigurableButton={false}
        gridTitle="Trip Execution Create"
        recordCount={gridState.gridData.length}
        showCreateButton={true}
        searchPlaceholder="Search"
        clientSideSearch={true}
        showSubHeaders={false}
        hideAdvancedFilter={true}
        serverFilters={[]}
        showFilterTypeDropdown={false}
        showServersideFilter={showServersideFilter}
        onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
        gridId="trip-execution-hub"
        userId="current-user"
      // api={}
      />
      {/* Header with title and controls */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
            <span className="text-white text-xs font-medium">3</span>
          </div>
          <h3 className="font-semibold text-base">Activities & Consignment</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-9 h-8 w-64" />
          </div>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div> */}

      {/* Table */}
      {/* <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">S. No.</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Behaviour</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Location</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Planned/Actual</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Consignment</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {activitiesData.map((activity, index) => (
                <tr key={activity.sno} className="border-t hover:bg-muted/20">
                  <td className="p-3 text-sm">{activity.sno}</td>
                  <td className="p-3">
                    <BehaviorBadge behavior={activity.behaviour} />
                  </td>
                  <td className="p-3">
                    <LocationCell location={activity.location} details={activity.locationDetails} />
                  </td>
                  <td className="p-3">
                    <PlannedActualCell 
                      plannedActual={activity.plannedActual} 
                      details={activity.plannedActualDetails} 
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{activity.consignment}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <CheckCircle className="h-4 w-4 text-status-success" />
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
};