import React, { useState } from 'react';
import { X, Search, Plus, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SupplierBillingDrawerScreenProps {
  onClose: () => void;
  tripId?: string;
}

interface BillingRecord {
  draftBillNo: string;
  supplier: string;
  status: 'Draft' | 'Submitted';
  totalItems: string;
  itemCount: number;
  totalQuantity: number;
  totalAmount: string;
}

export const SupplierBillingDrawerScreen: React.FC<SupplierBillingDrawerScreenProps> = ({
  onClose,
  tripId = 'TRIPQ0000001',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const billingData: BillingRecord[] = [
    {
      draftBillNo: 'DRB000348',
      supplier: 'ABC Supplier',
      status: 'Draft',
      totalItems: 'Rate Per Wagon by Distance',
      itemCount: 3,
      totalQuantity: 4,
      totalAmount: '€ 1200.00',
    },
    {
      draftBillNo: 'DRB000348',
      supplier: 'ABC Supplier',
      status: 'Submitted',
      totalItems: 'Rate Per Wagon by Distance',
      itemCount: 4,
      totalQuantity: 10,
      totalAmount: '€ 12000.00',
    },
    {
      draftBillNo: 'DRB000348',
      supplier: 'ABC Supplier',
      status: 'Draft',
      totalItems: 'Rate Per Wagon by Distance',
      itemCount: 4,
      totalQuantity: 12,
      totalAmount: '€ 34300.00',
    },
    {
      draftBillNo: 'DRB000348',
      supplier: 'ABC Supplier',
      status: 'Submitted',
      totalItems: 'Rate Per Wagon by Distance',
      itemCount: 4,
      totalQuantity: 15,
      totalAmount: '€ 76765.00',
    },
  ];

  const totalCost = '€ 321432.00';
  const totalCount = billingData.length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-card">
        {/* <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Supplier Billing</h2>
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

        {/* Total Section */}
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Supplier Billing</span>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
              {totalCount}
            </Badge>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Total Cost: {totalCost}
          </Badge>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <h3 className="text-sm font-semibold">Supplier Billing</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-64"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <SquarePen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Draft Bill No.</TableHead>
              <TableHead className="font-semibold">Supplier</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Total Items</TableHead>
              <TableHead className="font-semibold text-right">Total Quantity</TableHead>
              <TableHead className="font-semibold text-right">Total Amount</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingData.map((record, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">{record.draftBillNo}</TableCell>
                <TableCell>{record.supplier}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      record.status === 'Draft'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                        : 'bg-green-100 text-green-800 hover:bg-green-100'
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{record.totalItems}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      +{record.itemCount}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">{record.totalQuantity}</TableCell>
                <TableCell className="text-right font-medium">{record.totalAmount}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SquarePen className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};