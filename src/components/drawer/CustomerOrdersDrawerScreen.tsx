import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Plus, Search, Download, Filter, Copy, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GridColumnConfig } from '@/types/smartgrid';
import { SmartGrid } from '@/components/SmartGrid';
import { manageTripStore } from '@/stores/mangeTripStore';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sub } from '@radix-ui/react-dropdown-menu';

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
    filterable: false,
    editable: false,
  },
  {
    key: 'DepartureArrivalDescription',
    label: 'Arrival',
    type: 'Text',
    width: 180,
    sortable: false,
    filterable: false,
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
  const [searchQuery, setSearchQuery] = useState('');

  const { tripData } = manageTripStore();

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
      setOrders(mappedOrders);
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



  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      {/* <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Customer Order</h2>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            {tripId}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div> */}

      {/* Sub Header with Total Bookings */}
      <div className="px-6 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Bookings</span>
            <Badge variant="secondary" className="rounded-full">
              {orders.length}
            </Badge>
          </div>
          {/* <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add CO to Running Trip
          </Button> */}
        </div>
      </div>

      {/* Toolbar */}
      {/* <div className="px-6 py-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Customer Orders</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div> */}

      {/* SmartGrid */}
      <div className="flex-1 overflow-auto px-6">
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
      </div>

     
           


      {/* Table Component */}
      
      {/* <div className="flex-1 overflow-auto px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">
                <div className="flex flex-col">
                  <span className="font-semibold">Customer ID</span>
                  <span className="font-normal text-muted-foreground">Name</span>
                </div>
              </TableHead>
              <TableHead>Execution Plan Id</TableHead>
              <TableHead>Leg Behaviour</TableHead>
              <TableHead>Departure and Arrival</TableHead>
              <TableHead>Pickup and Delivery</TableHead>
              <TableHead>Plan From & To Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-blue-600 font-medium">{order.customerId}</span>
                    <span className="text-sm text-muted-foreground">{order.customerName}</span>
                  </div>
                </TableCell>
                <TableCell>{order.executionPlanId}</TableCell>
                <TableCell>{order.legBehaviour}</TableCell>
                <TableCell>
                  {order.departure} - {order.arrival}
                </TableCell>
                <TableCell>
                  {order.pickupDate} to {order.deliveryDate}
                </TableCell>
                <TableCell>
                  {order.planFromDate} to {order.planToDate}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> */}
     
    </div>
  );
};