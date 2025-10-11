import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormData {
  customerOrderNo: string;
  applicableToCustomer: boolean;
  applicableToSupplier: boolean;
  vasId: string;
  customer: string;
  supplierContract: string;
  supplier: string;
  thuServed: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  remarks: string;
}

interface VASItem {
  id: string;
  name: string;
  quantity: number;
  formData: FormData;
}

const initialFormData: FormData = {
  customerOrderNo: '',
  applicableToCustomer: true,
  applicableToSupplier: true,
  vasId: '',
  customer: '',
  supplierContract: '',
  supplier: '',
  thuServed: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  remarks: '',
};

const initialVASItems: VASItem[] = [
  { 
    id: '1', 
    name: 'Bubble Wrap', 
    quantity: 2,
    formData: {
      customerOrderNo: 'CO000000001',
      applicableToCustomer: true,
      applicableToSupplier: true,
      vasId: 'vas1',
      customer: 'customer1',
      supplierContract: 'contract1',
      supplier: 'Supplier A',
      thuServed: '2',
      startDate: '2025-01-15',
      startTime: '08:00',
      endDate: '2025-01-15',
      endTime: '17:00',
      remarks: 'Handle with care',
    }
  },
  { 
    id: '2', 
    name: 'Packing', 
    quantity: 2,
    formData: {
      customerOrderNo: 'CO000000001',
      applicableToCustomer: true,
      applicableToSupplier: false,
      vasId: 'vas2',
      customer: 'customer2',
      supplierContract: 'contract2',
      supplier: 'Supplier B',
      thuServed: '2',
      startDate: '2025-01-16',
      startTime: '09:00',
      endDate: '2025-01-16',
      endTime: '18:00',
      remarks: 'Standard packing',
    }
  },
  { 
    id: '3', 
    name: 'Unpacking', 
    quantity: 2,
    formData: {
      customerOrderNo: 'CO000000001',
      applicableToCustomer: false,
      applicableToSupplier: true,
      vasId: 'vas1',
      customer: 'customer1',
      supplierContract: 'contract1',
      supplier: 'Supplier C',
      thuServed: '2',
      startDate: '2025-01-17',
      startTime: '10:00',
      endDate: '2025-01-17',
      endTime: '16:00',
      remarks: '',
    }
  },
  { 
    id: '4', 
    name: 'Gasoline', 
    quantity: 2,
    formData: {
      customerOrderNo: 'CO000000001',
      applicableToCustomer: true,
      applicableToSupplier: true,
      vasId: 'vas2',
      customer: 'customer2',
      supplierContract: 'contract2',
      supplier: 'Supplier D',
      thuServed: '2',
      startDate: '2025-01-18',
      startTime: '07:00',
      endDate: '2025-01-18',
      endTime: '15:00',
      remarks: 'Full tank',
    }
  },
  { 
    id: '5', 
    name: 'Unloading', 
    quantity: 2,
    formData: {
      customerOrderNo: 'CO000000001',
      applicableToCustomer: true,
      applicableToSupplier: true,
      vasId: 'vas1',
      customer: 'customer1',
      supplierContract: 'contract1',
      supplier: 'Supplier E',
      thuServed: '2',
      startDate: '2025-01-19',
      startTime: '11:00',
      endDate: '2025-01-19',
      endTime: '19:00',
      remarks: 'Careful unloading',
    }
  },
];

export const VASDrawerScreen = () => {
  const [vasItems, setVasItems] = useState<VASItem[]>(initialVASItems);
  const [selectedVAS, setSelectedVAS] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Auto-select first VAS on mount
  useEffect(() => {
    if (vasItems.length > 0 && !selectedVAS) {
      const firstVAS = vasItems[0];
      setSelectedVAS(firstVAS.id);
      setFormData(firstVAS.formData);
    }
  }, []);

  const handleVASClick = (vas: VASItem) => {
    setSelectedVAS(vas.id);
    setFormData(vas.formData);
  };

  const handleAddNew = () => {
    setSelectedVAS(null);
    setFormData(initialFormData);
  };

  const handleDeleteItem = (id: string) => {
    setVasItems(vasItems.filter(item => item.id !== id));
    if (selectedVAS === id) {
      setSelectedVAS(null);
      setFormData(initialFormData);
    }
  };

  const handleSave = () => {
    if (selectedVAS) {
      // Update existing VAS
      setVasItems(vasItems.map(item => 
        item.id === selectedVAS 
          ? { ...item, formData }
          : item
      ));
    } else {
      // Create new VAS
      const newVAS: VASItem = {
        id: Date.now().toString(),
        name: formData.vasId || 'New VAS',
        quantity: parseInt(formData.thuServed) || 1,
        formData,
      };
      setVasItems([...vasItems, newVAS]);
      setSelectedVAS(newVAS.id);
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setSelectedVAS(null);
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - VAS Items List */}
      <div className="w-64 border-r border-border bg-muted/30 p-4 flex flex-col">
        {/* Customer Order No */}
        <div className="space-y-2 mb-4">
          <Label>Customer Order No.</Label>
          <Select value={formData.customerOrderNo} onValueChange={(value) => setFormData({ ...formData, customerOrderNo: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CO000000001">CO000000001</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">All VAS</h3>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {vasItems.map((item) => (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-colors hover:bg-accent ${
                selectedVAS === item.id ? 'bg-accent border-primary' : ''
              }`}
              onClick={() => handleVASClick(item)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Qty {item.quantity}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Applicable To Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Applicable to</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customer"
                  checked={formData.applicableToCustomer}
                  onCheckedChange={(checked) => setFormData({ ...formData, applicableToCustomer: checked as boolean })}
                />
                <label htmlFor="customer" className="text-sm cursor-pointer">
                  Customer
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-7">
              <Checkbox
                id="supplier"
                checked={formData.applicableToSupplier}
                onCheckedChange={(checked) => setFormData({ ...formData, applicableToSupplier: checked as boolean })}
              />
              <label htmlFor="supplier" className="text-sm cursor-pointer">
                Supplier
              </label>
            </div>
          </div>

          {/* VAS and Customer Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>VAS</Label>
              <Select value={formData.vasId} onValueChange={(value) => setFormData({ ...formData, vasId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select VAS ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vas1">VAS 1</SelectItem>
                  <SelectItem value="vas2">VAS 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Customer <span className="text-destructive">*</span></Label>
              <Select value={formData.customer} onValueChange={(value) => setFormData({ ...formData, customer: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer1">Customer 1</SelectItem>
                  <SelectItem value="customer2">Customer 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Supplier and Contract */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input
                placeholder="Enter Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier Contract <span className="text-destructive">*</span></Label>
              <Select value={formData.supplierContract} onValueChange={(value) => setFormData({ ...formData, supplierContract: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Supplier Contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract1">Contract 1</SelectItem>
                  <SelectItem value="contract2">Contract 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* No of THU Served */}
          <div className="space-y-2">
            <Label>No of THU Served</Label>
            <Input
              type="number"
              value={formData.thuServed}
              onChange={(e) => setFormData({ ...formData, thuServed: e.target.value })}
            />
          </div>

          {/* Start Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="DD-MMM-YYYY"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  placeholder="HH:MM"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* End Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  placeholder="DD-MMM-YYYY"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  placeholder="HH:MM"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Enter remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSave}>
              Save VAS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
