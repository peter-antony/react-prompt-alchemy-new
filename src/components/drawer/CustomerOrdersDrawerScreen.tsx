import React, { useState } from 'react';
import { ArrowLeft, X, Plus, Search, Download, Filter, Copy, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CustomerOrdersDrawerScreenProps {
  onClose: () => void;
  tripId?: string;
}

interface CustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  executionPlanId: string;
  legBehaviour: string;
  departure: string;
  arrival: string;
  pickupDate: string;
  deliveryDate: string;
  planFromDate: string;
  planToDate: string;
}

const mockOrders: CustomerOrder[] = [
  {
    id: 'CO00000001',
    customerId: 'CO00000001',
    customerName: 'ABC Customer',
    executionPlanId: 'EXE302492304',
    legBehaviour: 'Line Haul',
    departure: 'Frankfurt Station A',
    arrival: 'Frankfurt Station B',
    pickupDate: '12-Mar-2025',
    deliveryDate: '14-Mar-2025',
    planFromDate: '12-Mar-2025',
    planToDate: '14-Mar-2025',
  },
  {
    id: 'CO00000002',
    customerId: 'CO00000002',
    customerName: 'ABC Customer',
    executionPlanId: 'EXE302492304',
    legBehaviour: 'Line Haul',
    departure: 'Frankfurt Station A',
    arrival: 'Frankfurt Station B',
    pickupDate: '12-Mar-2025',
    deliveryDate: '14-Mar-2025',
    planFromDate: '12-Mar-2025',
    planToDate: '14-Mar-2025',
  },
  {
    id: 'CO00000003',
    customerId: 'CO00000003',
    customerName: 'ABC Customer',
    executionPlanId: 'EXE302492304',
    legBehaviour: 'Line Haul',
    departure: 'Frankfurt Station A',
    arrival: 'Frankfurt Station B',
    pickupDate: '12-Mar-2025',
    deliveryDate: '14-Mar-2025',
    planFromDate: '12-Mar-2025',
    planToDate: '14-Mar-2025',
  },
  {
    id: 'CO00000004',
    customerId: 'CO00000004',
    customerName: 'ABC Customer',
    executionPlanId: 'EXE302492304',
    legBehaviour: 'Line Haul',
    departure: 'Frankfurt Station A',
    arrival: 'Frankfurt Station B',
    pickupDate: '12-Mar-2025',
    deliveryDate: '14-Mar-2025',
    planFromDate: '12-Mar-2025',
    planToDate: '14-Mar-2025',
  },
  {
    id: 'CO00000005',
    customerId: 'CO00000005',
    customerName: 'ABC Customer',
    executionPlanId: 'EXE302492304',
    legBehaviour: 'Line Haul',
    departure: 'Frankfurt Station A',
    arrival: 'Frankfurt Station B',
    pickupDate: '12-Mar-2025',
    deliveryDate: '14-Mar-2025',
    planFromDate: '12-Mar-2025',
    planToDate: '14-Mar-2025',
  },
];

export const CustomerOrdersDrawerScreen: React.FC<CustomerOrdersDrawerScreenProps> = ({
  onClose,
  tripId = 'TRIP00000001',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders] = useState<CustomerOrder[]>(mockOrders);

  const filteredOrders = orders.filter(
    (order) =>
      order.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.executionPlanId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="px-6 py-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Bookings</span>
            <Badge variant="secondary" className="rounded-full">
              {orders.length}
            </Badge>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add CO to Running Trip
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 border-b bg-card">
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
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6">
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
      </div>
    </div>
  );
};