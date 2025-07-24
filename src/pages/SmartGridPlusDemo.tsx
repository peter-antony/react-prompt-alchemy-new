import React, { useState } from 'react';
import { SmartGridPlus } from '@/components/SmartGrid';
import { GridColumnConfig } from '@/types/smartgrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for the demo
const initialData = [
  {
    id: '1',
    productName: 'Laptop Pro',
    quantity: 5,
    unitPrice: 1299.99,
    category: 'Electronics',
    status: 'Active',
    dateAdded: '2024-01-15',
    supplier: 'TechCorp',
    specifications: [
      { spec: 'RAM', value: '16GB DDR4' },
      { spec: 'Storage', value: '512GB SSD' },
      { spec: 'Processor', value: 'Intel i7' }
    ],
    reviews: [
      { reviewer: 'John D.', rating: 5, comment: 'Excellent performance' },
      { reviewer: 'Jane S.', rating: 4, comment: 'Great value for money' }
    ]
  },
  {
    id: '2',
    productName: 'Office Chair',
    quantity: 12,
    unitPrice: 199.99,
    category: 'Furniture',
    status: 'Active',
    dateAdded: '2024-01-10',
    supplier: 'FurniCorp',
    specifications: [
      { spec: 'Material', value: 'Mesh Back' },
      { spec: 'Height', value: 'Adjustable' },
      { spec: 'Wheels', value: 'Caster Wheels' }
    ],
    reviews: [
      { reviewer: 'Mike R.', rating: 4, comment: 'Very comfortable' }
    ]
  },
  {
    id: '3',
    productName: 'Smartphone X',
    quantity: 8,
    unitPrice: 899.99,
    category: 'Electronics',
    status: 'Low Stock',
    dateAdded: '2024-01-08',
    supplier: 'MobileTech',
    specifications: [
      { spec: 'Screen', value: '6.5" OLED' },
      { spec: 'Camera', value: '108MP Triple' },
      { spec: 'Battery', value: '4500mAh' }
    ],
    reviews: [
      { reviewer: 'Sarah T.', rating: 5, comment: 'Amazing camera quality' }
    ]
  }
];

const columns: GridColumnConfig[] = [
  {
    key: 'productName',
    label: 'Product Name',
    type: 'Text',
    sortable: true,
    filterable: true,
    width: 200
  },
  {
    key: 'quantity',
    label: 'Quantity',
    type: 'Text',
    sortable: true,
    filterable: true,
    width: 100
  },
  {
    key: 'unitPrice',
    label: 'Unit Price',
    type: 'Text',
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'category',
    label: 'Category',
    type: 'Text',
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'status',
    label: 'Status',
    type: 'Badge',
    sortable: true,
    filterable: true,
    width: 100,
    statusMap: {
      'Active': 'green',
      'Low Stock': 'orange', 
      'Out of Stock': 'red'
    }
  },
  {
    key: 'dateAdded',
    label: 'Date Added',
    type: 'Text',
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'supplier',
    label: 'Supplier',
    type: 'Text',
    sortable: true,
    filterable: true,
    width: 150
  },
  {
    key: 'specifications',
    label: 'Specifications',
    type: 'SubRow',
    sortable: false,
    filterable: false,
    width: 150,
    subRowColumns: [
      { key: 'spec', label: 'Spec', type: 'Text', width: 80 },
      { key: 'value', label: 'Value', type: 'Text', width: 120 }
    ]
  },
  {
    key: 'reviews',
    label: 'Reviews',
    type: 'SubRow',
    sortable: false,
    filterable: false,
    width: 150,
    subRowColumns: [
      { key: 'reviewer', label: 'Reviewer', type: 'Text', width: 80 },
      { key: 'rating', label: 'Rating', type: 'Text', width: 60 },
      { key: 'comment', label: 'Comment', type: 'Text', width: 150 }
    ]
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'Text',
    sortable: false,
    filterable: false,
    width: 120
  }
];

export default function SmartGridPlusDemo() {
  const [data, setData] = useState(initialData);

  const handleAddRow = async (newRow: any) => {
    console.log('Adding new row:', newRow);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleEditRow = async (editedRow: any, rowIndex: number) => {
    console.log('Editing row:', editedRow, 'at index:', rowIndex);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleDeleteRow = async (row: any, rowIndex: number) => {
    console.log('Deleting row:', row, 'at index:', rowIndex);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const defaultRowValues = {
    productName: '',
    quantity: 0,
    unitPrice: 0,
    category: 'Electronics',
    status: 'Active',
    dateAdded: new Date().toISOString().split('T')[0],
    supplier: '',
    specifications: [
      { spec: '', value: '' }
    ],
    reviews: [
      { reviewer: '', rating: 5, comment: '' }
    ]
  };

  const validationRules = {
    requiredFields: ['productName', 'supplier'],
    maxLength: {
      productName: 50,
      supplier: 30
    },
    customValidationFn: (values: Record<string, any>) => {
      const errors: Record<string, string> = {};
      
      if (values.quantity && values.quantity < 0) {
        errors.quantity = 'Quantity must be positive';
      }
      
      if (values.unitPrice && values.unitPrice < 0) {
        errors.unitPrice = 'Unit price must be positive';
      }
      
      return errors;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SmartGridPlus Demo</h1>
        <p className="text-muted-foreground mt-2">
          Enhanced grid component with inline row addition and editing capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.filter(item => item.status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.filter(item => item.status === 'Low Stock').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your product inventory with inline editing capabilities. 
            Double-click any row to edit, or use the Add Row button to create new entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmartGridPlus
            columns={columns}
            data={data}
            gridTitle="Product Inventory"
            inlineRowAddition={true}
            inlineRowEditing={true}
            onAddRow={handleAddRow}
            onEditRow={handleEditRow}
            onDeleteRow={handleDeleteRow}
            defaultRowValues={defaultRowValues}
            validationRules={validationRules}
            addRowButtonLabel="Add Product"
            addRowButtonPosition="top-left"
            paginationMode="pagination"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Inline Row Addition</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click "Add Product" to create new rows</li>
                <li>• Form validation with error messages</li>
                <li>• Auto-focus on first editable cell</li>
                <li>• Configurable default values</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Inline Row Editing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Double-click rows to edit inline</li>
                <li>• Real-time validation feedback</li>
                <li>• Save/cancel actions with keyboard shortcuts</li>
                <li>• Row highlighting during edit mode</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Data Operations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Delete rows with confirmation</li>
                <li>• Export data to CSV</li>
                <li>• Advanced filtering and sorting</li>
                <li>• Pagination support</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Validation & UX</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Required field validation</li>
                <li>• Custom validation functions</li>
                <li>• Smooth animations and transitions</li>
                <li>• Toast notifications for actions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}