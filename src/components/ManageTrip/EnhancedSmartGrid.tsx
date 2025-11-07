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
import { DraggableSubRow, SmartGridWithGrouping, SmartGridWithNestedRows } from "@/components/SmartGrid";
import { GridColumnConfig } from '@/types/smartgrid';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { toast } from '../ui/sonner';
import { manageTripStore } from '@/stores/mangeTripStore';
import { useDrawerStore } from '@/stores/drawerStore';

// Smart Grid configuration for Activities & Consignment with configured widths
const activitiesColumns: GridColumnConfig[] = [
  {
    key: 'LegSequence',
    label: 'S. No.',
    type: 'Text',
    width: 40,
    sortable: true,
    filterable: true,
    editable: false,
    mandatory: true,
    subRow: false,
    order: 1,
  },
  {
    key: 'LegBehaviour',
    label: 'Behaviour',
    type: 'Badge',
    width: 50,
    sortable: true,
    filterable: true,
    editable: false,
    statusMap: {
      'Pick': 'badge-blue rounded-2xl',
      'Drvy': 'bg-green-100 text-green-800',
      'Bhub': 'badge-rose rounded-2xl',
      'CHA-Import': 'bg-cyan-100 text-cyan-800',
      'PUD': 'bg-emerald-100 text-emerald-800',
      'GTIN': 'bg-pink-100 text-pink-800',
      'GTOUT': 'bg-orange-100 text-orange-800',
      'LHTA': 'bg-purple-100 text-purple-800'
    },
    subRow: false,
    order: 2
  },
  {
    key: 'ArrivalPoint',
    label: 'Location',
    type: 'LegLocationFormat',
    // width: 120,
    sortable: true,
    filterable: true,
    editable: false,
    subRow: false,
    order: 3
  },
  {
    key: 'PlannedActual',
    label: 'Planned/Actual',
    type: 'LegLocationFormat',
    width: 50,
    sortable: true,
    filterable: true,
    editable: false,
    subRow: false,
    order: 4
  },
  {
    key: 'Consignment',
    label: 'Consignment',
    type: 'LegLocationFormat',
    width: 50,
    sortable: false,
    filterable: true,
    editable: false,
    subRow: false,
    order: 5
  },
  {
    key: 'status',
    label: 'Status',
    type: 'Badge',
    width: 50,
    sortable: true,
    filterable: true,
    editable: false,
    statusMap: {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-gray-100 text-gray-800'
    },
    subRow: false,
    order: 6
  }
];

// Mock data for trips with nested legs
const initialTripsData = [
  {
    tripId: 'TRIP-001',
    vehicleNo: 'MH-12-AB-1234',
    driverName: 'John Doe',
    status: 'In Transit',
    distance: 450,
    tripLegs: [
      { legNo: 1, from: 'Mumbai', to: 'Pune', distance: 150, eta: '2024-01-15 10:00', status: 'Completed' },
      { legNo: 2, from: 'Pune', to: 'Nashik', distance: 210, eta: '2024-01-15 14:30', status: 'In Progress' },
      { legNo: 3, from: 'Nashik', to: 'Aurangabad', distance: 90, eta: '2024-01-15 17:00', status: 'Pending' },
    ],
  },
  {
    tripId: 'TRIP-002',
    vehicleNo: 'DL-14-CD-5678',
    driverName: 'Jane Smith',
    status: 'Pending',
    distance: 320,
    tripLegs: [
      { legNo: 1, from: 'Delhi', to: 'Jaipur', distance: 280, eta: '2024-01-16 09:00', status: 'Pending' },
      { legNo: 2, from: 'Jaipur', to: 'Ajmer', distance: 40, eta: '2024-01-16 12:00', status: 'Pending' },
    ],
  },
  {
    tripId: 'TRIP-003',
    vehicleNo: 'KA-05-EF-9012',
    driverName: 'Robert Brown',
    status: 'Completed',
    distance: 180,
    tripLegs: [
      { legNo: 1, from: 'Bangalore', to: 'Mysore', distance: 180, eta: '2024-01-14 11:00', status: 'Completed' },
    ],
  },
  {
    tripId: 'TRIP-004',
    vehicleNo: 'TN-09-GH-3456',
    driverName: 'Emily Davis',
    status: 'Cancelled',
    distance: 0,
    tripLegs: [],
  },
];

export const EnhancedSmartGrid = () => {
  const gridState = useSmartGridState();
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { openDrawer } = useDrawerStore();
  const [tripsData, setTripsData] = useState(initialTripsData);

  const { getLegDetails, updateActivity, tripData } = manageTripStore();
  console.log('Leg Details from Store:', getLegDetails());

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
    setApiStatus('loading');

    // Add onClick handler to behaviour column
    const columnsWithHandlers = activitiesColumns.map(col =>
      col.key === 'behaviour'
        ? { ...col, onClick: () => openDrawer('trip-execution-create') }
        : col
    );
    gridState.setColumns(activitiesColumns);
    gridState.setGridData(getLegDetails() || []);
    gridState.setLoading(false);
  }, [openDrawer]);

  // Column config for trip legs (nested)
  const subRowEditableColumns: GridColumnConfig[] = [
    { key: 'ActivityDescription', label: 'Event', type: 'Text', width: 80 },
    { key: 'CustomerOrder', label: 'Customer Order', type: 'Text', width: 80 },
    { key: 'PlannedDate', label: 'Planned Date', type: 'Date', width: 160, editable: false },
    { key: 'PlannedTime', label: 'Planned Time', type: 'Time', width: 160, editable: false },
    { key: 'RevisedDate', label: 'Revised Date', type: 'Date', width: 160, editable: false },
    { key: 'RevisedTime', label: 'Revised Time', type: 'Time', width: 160, editable: false },
    { key: 'ActualDate', label: 'Actual Date', type: 'Date', width: 160, editable: false },
    { key: 'ActualTime', label: 'Actual Time', type: 'Time', width: 160, editable: false },
    { key: 'DelayedIn', label: 'Delay', type: 'Text', width: 180, editable: false },
  ];

  // Handler to update nested trip legs
  const handleTripLegUpdate = (LegIndex: number, ActivityIndex: number, updatedActivity: any) => {
    // setTripsData(prevData => {
    //   const newData = [...prevData];
    //   const trip = { ...newData[parentRowIndex] };
    //   const updatedLegs = [...trip.tripLegs];
    //   updatedLegs[legIndex] = { ...updatedLegs[legIndex], ...updatedLeg };
    //   trip.tripLegs = updatedLegs;
    //   newData[parentRowIndex] = trip;
    //   return newData;
    // });
    console.log('LegIndex: ', LegIndex);
    console.log('ActivityIndex: ', ActivityIndex);
    console.log('updatedActivity: ', updatedActivity);
    console.log('Updated trip legs:',tripsData);
    updateActivity(LegIndex, ActivityIndex, updatedActivity);
    console.log('Updated trip legs: tripDatatripDatatripDatatripDatatripDatatripDatatripDatatripData ========', tripData);
  };

  // Server callback for trip leg updates
  const handleTripLegServerUpdate = async (parentRow: any, nestedRow: any, updatedData: any) => {
    try {
      console.log('Sending trip leg update to server:', {
        tripId: parentRow,
        legNo: nestedRow,
        updatedData
      });

      // Replace with your actual API call
      // const response = await fetch('YOUR_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     tripId: parentRow.tripId,
      //     legNo: nestedRow.legNo,
      //     ...updatedData
      //   })
      // });
      // 
      // if (!response.ok) throw new Error('Failed to update');
    } catch (error) {
      console.error('Failed to update server:', error);
    }
  };


  return (
    <div className="space-y-4">
      {/* <SmartGridWithGrouping
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
        nestedRowRenderer={renderSubRow}
        showDefaultConfigurableButton={false}
        gridTitle="Leg Details"
        recordCount={gridState.gridData.length}
        showCreateButton={true}
        onRowClick={(row) => {
          console.log('Row clicked:', row);
          openDrawer('trip-execution-create');
        }}
        searchPlaceholder="Search"
        clientSideSearch={true}
        showSubHeaders={false}
        hideAdvancedFilter={true}
        serverFilters={[]}
        showFilterTypeDropdown={false}
        hideCheckboxToggle={true}
        showServersideFilter={false}
        onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
        gridId="trip-execution-hub"
        userId="current-user"
      /> */}

      <div className="space-y-4">
        {/* <div>
          <h2 className="text-2xl font-semibold mb-1">Trip Management with Nested Legs</h2>
          <p className="text-sm text-muted-foreground">
            Each trip can be expanded to view its leg details in a nested grid.
          </p>
        </div> */}
        <SmartGridWithNestedRows
          key={`grid-${gridState.forceUpdate}`}
          columns={gridState.columns}
          data={gridState.gridData}
          gridTitle="Leg Details"
          recordCount={gridState.gridData.length}
          clientSideSearch={true}
          nestedSectionConfig={{
            nestedDataKey: 'Activities',
            columns: subRowEditableColumns,
            title: 'Events',
            initiallyExpanded: true,
            showNestedRowCount: true,
            editableColumns: true,
            onInlineEdit: (parentRowIndex, legIndex, updatedLeg) => {
              handleTripLegUpdate(parentRowIndex, legIndex, updatedLeg);
            },
            onServerUpdate: handleTripLegServerUpdate,
          }}
          showDefaultConfigurableButton={false}
          hideCheckboxToggle={true}
          editableColumns={true}
          paginationMode="pagination"
          customPageSize={10}
          onRowClick={(row) => {
            console.log('Nested Row clicked:', row);
            openDrawer('trip-execution-create');
          }}
        />
      </div>

    </div>
  );
};