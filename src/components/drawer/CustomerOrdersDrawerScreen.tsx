import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Plus,Trash2, Search, Download, Filter, Copy, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GridColumnConfig } from '@/types/smartgrid';
import { DraggableSubRow, SmartGrid, SmartGridWithGrouping, useSmartGridState } from '@/components/SmartGrid';
import { manageTripStore } from '@/stores/mangeTripStore';
import { tripService } from '@/api/services/tripService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sub } from '@radix-ui/react-dropdown-menu';
import { filterService } from '@/api/services/filterService';
import { toast } from '@/hooks/use-toast';
import { AddCOToTripSidedraw } from '../TripPlanning/AddCOToTripSidedraw';

interface CustomerOrdersDrawerScreenProps {
  onClose: () => void;
  tripId?: string;
  tripData?: any;
}

interface CustomerOrder {
  id: string;
  CustomerID: string;
  CustomerName: string;
  CustomerOrderNo: string;
  ExecutionPlanID: string;
  LegBehaviour: string;
  DeparturePoint: string;
  DeparturePointDescription: string;
  ArrivalPoint: string;
  ArrivalPointDescription: string;
  PickupDateTime: string;
  DeliveryDateTime: string;
  PlannedFromDateTime: string;
  PlannedToDateTime: string;
  Consignor?: string | null;
  Consignee?: string | null;
  ServiceType?: string | null;
  ServiceTypeDescription?: string | null;
  SubServiceType?: string | null;
  SubServiceTypeDescription?: string | null;
  LoadType?: string | null;
}

// Smart Grid configuration for Customer Orders with configured widths
const customerOrdersGridColumns: GridColumnConfig[] = [
  {
    key: 'CustomerID',
    label: 'Customer ID',
    type: 'Text',
    width: 150,
    sortable: true,
    filterable: true,
    editable: false,
  },
  {
    key: 'CustomerOrderNo',
    label: 'Customer Order No',
    type: 'Text',
    width: 150,
    sortable: true,
    filterable: true,
    editable: false,
  },
  {
    key: 'CustomerName',
    label: 'Customer Name',
    type: 'Text',
    width: 150,
    sortable: true,
    filterable: true,
    editable: false,
  },
  {
    key: 'ExecutionPlanID',
    label: 'Execution Plan Id',
    type: 'Text',
    width: 160,
    sortable: true,
    filterable: true,
    editable: false,
  },
  {
    key: 'LegBehaviour',
    label: 'Leg Behaviour',
    type: 'Text',
    width: 140,
    sortable: true,
    filterable: true,
    editable: false,
  },
  {
    key: 'DepartureArrival',
    label: 'Departure',
    type: 'Text',
    width: 180,
    sortable: false,
    filterable: true,
    editable: false,
  },
  {
    key: 'DepartureArrivalDescription',
    label: 'Arrival',
    type: 'Text',
    width: 180,
    sortable: false,
    filterable: true,
    editable: false,
  },
  {
    key: 'PickupDelivery',
    label: 'Pickup and Delivery',
    type: 'Text',
    width: 180,
    sortable: false,
    filterable: false,
    editable: false,
  },
  {
    key: 'PlanFromToDate',
    label: 'Plan From & To Date',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
  },
  {
    key: 'Consignor',
    label: 'Consignor ID',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: true
  },
  {
    key: 'Consignee',
    label: 'Consignee ID',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: true
  },
  {
    key: 'ServiceType',
    label: 'Service',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: true
  },
  {
    key: 'ServiceTypeDescription',
    label: 'Service Type Description',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: true
  },
  {
    key: 'SubServiceType',
    label: 'Sub Service',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: true
  },
  {
    key: 'SubServiceTypeDescription',
    label: 'Sub Service Type Description',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: true
  },
  {
    key: 'LoadType',
    label: 'Load Type',
    type: 'Text',
    width: 140,
    sortable: false,
    filterable: false,
    editable: false,
    subRow: true
  },
];

export const CustomerOrdersDrawerScreen: React.FC<CustomerOrdersDrawerScreenProps> = ({
  onClose,
  tripId = 'TRIP00000001',
  // tripData
}) => {
  const gridId = "CustomerOrdersTrip";
  const gridState = useSmartGridState();
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [searchData, setSearchData] = useState<Record<string, any>>({});
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedRows, setHighlightedRows] = useState<string[]>([]);
  const [isAddCOToTripOpen, setIsAddCOToTripOpen] = useState(false);
  const [customerOrderList, setCustomerOrderList] = useState<any[]>([]);

  const { tripData, fetchTrip } = manageTripStore();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  console.log('tripData', tripData);

  useEffect(() => {
    if (tripData?.CustomerOrders) {
      // map JSON to CustomerOrder interface
      const mappedOrders = tripData.CustomerOrders.map((co: any) => ({
        id: co.CustomerOrderNo,
        CustomerID: co.CustomerID,
        CustomerName: co.CustomerName,
        CustomerOrderNo: co.CustomerOrderNo,
        CustomerOrderID: co.CustomerOrderID,
        ExecutionPlanID: co.ExecutionPlanID,
        LegBehaviour: co.LegBehaviour,
        DeparturePoint: co.DeparturePoint,
        ArrivalPoint: co.ArrivalPoint,
        ArrivalPointDescription: co.ArrivalPointDescription,
        DeparturePointDescription: co.DeparturePointDescription,
        PickupDateTime: co.PickupDateTime,
        DeliveryDateTime: co.DeliveryDateTime,
        PlannedFromDateTime: co.PlannedFromDateTime,
        PlannedToDateTime: co.PlannedToDateTime,
        Consignor: co.Consignor,
        Consignee: co.Consignee,
        ServiceType: co.ServiceType,
        ServiceTypeDescription: co.ServiceTypeDescription,
        SubServiceType: co.SubServiceType,
        SubServiceTypeDescription: co.SubServiceTypeDescription,
        LoadType: co.LoadType,
      }));
      const filteredOrders = mappedOrders
        // .filter(
        //   (order) =>
        //     order.CustomerID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        //     order.CustomerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        //     order.ExecutionPlanID.toLowerCase().includes(searchQuery.toLowerCase())
        // )

        // if both values are null use -, instead of " - to - " 
        .map((order) => {
          const formatPair = (a, b, separator = " || ") => {
            if (!a && !b) return "-";
            return `${a || "-"}${separator}${b || "-"}`;
          };

          const formatRange = (a, b, separator = " to ") => {
            if (!a && !b) return "-";
            return `${a || "-"}${separator}${b || "-"}`;
          };

          return {
            ...order,
            DepartureArrival: formatPair(order.DeparturePoint, order.DeparturePointDescription),
            DepartureArrivalDescription: formatPair(order.ArrivalPoint, order.ArrivalPointDescription),
            PickupDelivery: formatRange(order.PickupDateTime, order.DeliveryDateTime),
            PlanFromToDate: formatRange(order.PlannedFromDateTime, order.PlannedToDateTime),
          };
        });
      setOrders(filteredOrders);
      gridState.setColumns(customerOrdersGridColumns);
      gridState.setGridData(filteredOrders);
      setApiStatus("success");
      console.log('✅ CustomerOrders data bound to grid:', filteredOrders);
    }
  }, [tripData]);

  const filteredOrders = orders
    // .filter(
    //   (order) =>
    //     order.CustomerID.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     order.CustomerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     order.ExecutionPlanID.toLowerCase().includes(searchQuery.toLowerCase())
    // )

    // if both values are null use -, instead of " - to - " 
    .map((order) => {
      const formatPair = (a, b, separator = " || ") => {
        if (!a && !b) return "-";
        return `${a || "-"}${separator}${b || "-"}`;
      };

      const formatRange = (a, b, separator = " to ") => {
        if (!a && !b) return "-";
        return `${a || "-"}${separator}${b || "-"}`;
      };

      return {
        ...order,
        DepartureArrival: formatPair(order.DeparturePoint, order.DeparturePointDescription),
        DepartureArrivalDescription: formatPair(order.ArrivalPoint, order.ArrivalPointDescription),
        PickupDelivery: formatRange(order.PickupDateTime, order.DeliveryDateTime),
        PlanFromToDate: formatRange(order.PlannedFromDateTime, order.PlannedToDateTime),
      };
    });

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

    const compositeKey = `${row.CustomerOrderID}-${row.LegBehaviour}`;
    const isHighlighted = highlightedRows.includes(compositeKey);

    if (isHighlighted) {
      // Unselecting - remove from highlightedRows and customerOrderList
      setHighlightedRows(prev => prev.filter(key => key !== compositeKey));
      
      setCustomerOrderList(prev => {
        const updated = prev.filter(
          order => !(order.CustomerOrderID === row.CustomerOrderID && order.LegBehaviour === row.LegBehaviour)
        );
        console.log('🗑️ Removed from customerOrderList:', row.CustomerOrderID, row.LegBehaviour);
        console.log('📊 Updated customerOrderList length:', updated.length);
        return updated;
      });
      // onCustomerOrderClick(row, false);
    } else {
      // Selecting - add to highlightedRows and customerOrderList
      setHighlightedRows(prev => [...prev, compositeKey]);
      
      setCustomerOrderList(prev => {
        // Check if already exists to avoid duplicates
        const exists = prev.some(
          order => order.CustomerOrderID === row.CustomerOrderID && order.LegBehaviour === row.LegBehaviour
        );
        
        if (!exists) {
          const updated = [...prev, row];
          console.log('✅ Added to customerOrderList:', row.CustomerOrderID, row.LegBehaviour);
          console.log('📊 Updated customerOrderList length:', updated.length);
          return updated;
        }
        
        console.log('ℹ️ Already exists in customerOrderList:', row.CustomerOrderID, row.LegBehaviour);
        return prev;
      });
      // onCustomerOrderClick(row, true);
    }
  };

  useEffect(() => {
    console.log("rowTripId updated:", rowTripId);
  }, [rowTripId]);

  // Log highlightedRows changes
  useEffect(() => {
    console.log('highlightedRows updated (composite keys):', highlightedRows);
  }, [highlightedRows]);

  // Log customerOrderList changes
  useEffect(() => {
    console.log('🔍 customerOrderList updated:', customerOrderList);
    console.log('🔍 customerOrderList count:', customerOrderList.length);
    console.log('🔍 customerOrderList IDs:', customerOrderList.map(o => `${o.CustomerOrderID}-${o.LegBehaviour}`));
  }, [customerOrderList]);

  const removeCOFromTrip = async () => {
    // Check if any customer orders are selected
    if (customerOrderList.length === 0) {
      toast({
        title: "⚠️ No Customer Orders Selected",
        description: "Please select at least one customer order to remove from the trip.",
        variant: "destructive",
      });
      return;
    }

    console.log('🗑️ Removing customer orders:', customerOrderList);

    // Build the customer orders array with proper ModeFlag
    const customerOrders = (tripData?.CustomerOrders || []).map((order: any) => {
      // Check if this order is in the list to be removed
      const isMatchingOrder = customerOrderList.some(
        co => co.CustomerOrderID === order.CustomerOrderID && co.LegBehaviour === order.LegBehaviour
      );
      
      return {
        CustomerOrderNo: order.CustomerOrderID,
        LegBehaviour: order.LegBehaviour,
        ModeFlag: isMatchingOrder ? 'Delete' : (order.ModeFlag || 'NoChange')
      };
    });

    const dataToSave = {
      Header: {
        TripNo: tripData?.Header?.TripNo,
      },
      CustomerOrders: customerOrders
    };

    console.log('removeCOFromTrip - dataToSave:', dataToSave);
    console.log('removeCOFromTrip - Orders to delete:', customerOrders.filter(o => o.ModeFlag === 'Delete'));

    try {
      const response: any = await tripService.saveLegAndEventsTripLevel(dataToSave);
      console.log('removeCOFromTrip - response:', response);

      if (response?.data) {
        const { IsSuccess, ResponseData, Message } = response.data;

        let parsedResponseData: any = null;
        if (ResponseData) {
          try {
            parsedResponseData = JSON.parse(ResponseData);
          } catch (parseError) {
            console.warn('Failed to parse ResponseData:', parseError);
          }
        }

        if (parsedResponseData?.error) {
          const { errorCode, errorMessage } = parsedResponseData.error;
          toast({
            title: errorCode || "Error",
            description: errorMessage || Message || "Failed to remove CO",
            variant: "destructive",
          });
          return;
        }

        if (IsSuccess) {
          toast({
            title: "✅ Success",
            description: `${customerOrderList.length} customer order(s) removed successfully`,
          });
          
          // Clear selections
          setCustomerOrderList([]);
          setHighlightedRows([]);
          
          // Reload trip data
          if (tripData?.Header?.TripNo) {
            fetchTrip(tripData.Header.TripNo);
          }
        } else {
          toast({
            title: "Error",
            description: Message || "Failed to remove customer order",
            variant: "destructive",
          });
        }
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error('removeCOFromTrip - error:', error);
      toast({
        title: "Error",
        description: "Failed to remove customer order. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleAddCO = () => {
    console.log("handleAddCO - Reloading trip data");
    // Close the drawer
    setIsAddCOToTripOpen(false);
    fetchTrip(tripData?.Header?.TripNo);
    // Reload trip data using fetchTripData method
    
    // Show success toast
    // toast({
    //   title: "✅ Customer Orders Added",
    //   description: "Trip data reloaded successfully.",
    //   variant: "default",
    // });
    // window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sub Header with Total Bookings */}
      <div className="px-6 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Bookings</span>
            <Badge variant="secondary" className="rounded-full">
              {orders.length}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant="ghost"
              size="icon"
              className='h-8 rounded-lg px-2 w-fit bg-red-100 hover:bg-red-200 border border-red-300'
              onClick={() => { removeCOFromTrip() }}
              title="Remove CO"
              disabled={customerOrderList.length === 0}>
              Remove CO <Trash2 className="h-4 w-4" size={16} color="#ea3939" strokeWidth={2} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className='h-8 rounded-lg px-2 w-fit bg-green-100 hover:bg-green-200 border border-green-300'
              onClick={() => { setIsAddCOToTripOpen(true) }}
              title="Add Customer Order">
              Add CO <Plus className="h-4 w-4" size={16} color="#156534" strokeWidth={2} />
            </Button>
          </div>
          {/* <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add CO to Running Trip
          </Button> */}
        </div>
      </div>

      {/* Toolbar */}

      {/* SmartGrid */}
      {/* <div className="flex-1 overflow-auto px-6">
        <SmartGrid
          columns={customerOrdersGridColumns}
          data={filteredOrders}
          gridTitle="Customer Orders"
          recordCount={filteredOrders.length}
          searchPlaceholder="Search orders..."
          showCreateButton={false}
          editableColumns={false}
          paginationMode="pagination"
          hideCheckboxToggle={true}
        />
      </div> */}

      <div className="px-6">
        <div className="container-fluid mx-auto">
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
          <div className={`rounded-lg`}>
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
              // customPageSize={pageSize}
              // onLinkClick={handleLinkClick}
              // onUpdate={handleUpdate}
              onSubRowToggle={gridState.handleSubRowToggle}
              selectedRows={selectedRows}
              onSelectionChange={handleRowSelection}
              onRowClick={handleRowClick}
              // onFiltersChange={setCurrentFilters}
              // onSearch={handleServerSideSearch}
              // onClearAll={clearAllFilters}
              // rowClassName={(row: any, index: number) =>
              //   selectedRows.has(index) ? 'smart-grid-row-selected' : ''
              // }
              rowClassName={(row: any, index: number) => {
                // return selectedRowIds.has(row.TripPlanID) ? 'selected' : '';
                const uniqueId = `${row.CustomerOrderID}-${row.LegBehaviour}`;
                return highlightedRows.includes(uniqueId) ? 'selected' : '';
              }}
              nestedRowRenderer={renderSubRow}
              // configurableButtons={gridConfigurableButtons}
              showDefaultConfigurableButton={false}
              gridTitle="Customer Orders"
              recordCount={gridState.gridData.length}
              showCreateButton={true}
              searchPlaceholder="Search"
              clientSideSearch={true}
              showSubHeaders={false}
              hideAdvancedFilter={true}
              hideCheckboxToggle={true}
              // hideRightToolbar={tripID ? true : false}
              // serverFilters={dynamicServerFilters}
              showFilterTypeDropdown={false}
              // showServersideFilter={showServersideFilter}
              // onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
              gridId={gridId}
              userId="current-user"
              api={filterService}
            />
          </div>
        </div>
      </div>

      {/* Add customer order to trip */}
      <AddCOToTripSidedraw
        isOpen={isAddCOToTripOpen}
        onClose={() => setIsAddCOToTripOpen(false)}
        onAddCO={handleAddCO}
        selectedTripData={tripData}
      />

    </div>
  );
};