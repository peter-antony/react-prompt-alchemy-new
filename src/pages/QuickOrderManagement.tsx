import React, { useState, useMemo, useEffect } from 'react';
import { SmartGrid } from '@/components/SmartGrid';
import { GridColumnConfig } from '@/types/smartgrid';
import { Button } from '@/components/ui/button';
import { Printer, MoreHorizontal, User, Train, UserCheck, Container, Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from '../components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { SideDrawer } from '@/components/Common/SideDrawer';
import BulkUpload from '@/components/QuickOrderNew/BulkUpload';
import { PlanAndActualDetails } from '@/components/QuickOrderNew/PlanAndActualDetails';
import jsonStore from '@/stores/jsonStore';
import { useFooterStore } from '@/stores/footerStore';

interface SampleData {
  QuickUniqueID: any;
  QuickOrderNo: any;
  QuickOrderDate: string;
  Status: string;
  CustomerOrVendor: any;
  Customer_Supplier_RefNo: any;
  Contract: string;
  OrderType: string;
  TotalNet: number;
  tripBillingStatus?: string;
  departurePointDetails?: string;
  arrivalPointDetails?: string;
  customerDetails?: Array<{
    name: string;
    id: string;
    type: 'customer';
  }>;
  resourceDetails?: Array<{
    name: string;
    id: string;
    type: 'train' | 'agent' | 'container';
  }>;
}

const QuickOrderManagement = () => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const gridState = useSmartGridState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { setFooter, resetFooter } = useFooterStore();

  useEffect(() => {
    setFooter({
      visible: true,
      pageName: 'Quick_Order',
      leftButtons: [
        {
          label: "CIM/CUV Report",
          onClick: () => console.log("CIM/CUV Report"),
          type: "Icon",
          iconName: 'BookText'
        },
      ],
      rightButtons: [
        {
          label: "Cancel",
          onClick: () => console.log("Cancel clicked"),
          // disabled: true,
          type: 'Button'
        },
        {
          label: "Confirm",
          onClick: () => console.log("Confirm clicked"),
          // disabled: true,
          type: "Button",
        },
      ],
    });
    return () => resetFooter();
  }, [setFooter, resetFooter]);

  const initialColumns: GridColumnConfig[] = [
    {
      key: 'QuickOrderNo',
      label: 'Quick Order No.',
      type: 'Link',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'QuickOrderDate',
      label: 'Quick Order Date',
      type: 'DateFormat',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'Status',
      label: 'Status',
      type: 'Badge',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'CustomerOrVendor',
      label: 'Customer/Supplier',
      type: 'EditableText',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'Customer_Supplier_RefNo',
      label: 'Cust/Sup.Ref.No.',
      type: 'Text',
      // type: 'TextWithTooltip',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'Contract',
      label: 'Contract',
      type: 'Text',
      sortable: true,
      editable: false,
      // infoTextField: 'arrivalPointDetails',
      subRow: false
    },
    {
      key: 'OrderType',
      label: 'Order Type',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'TotalNet',
      label: 'Total Net',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },

  ];

  // const initialColumns: GridColumnConfig[] = [
  //   {
  //     key: 'id',
  //     label: 'Trip Plan No',
  //     type: 'Link',
  //     sortable: true,
  //     editable: false,
  //     mandatory: true,
  //     subRow: false
  //   },
  //   {
  //     key: 'status',
  //     label: 'Status',
  //     type: 'Badge',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'tripBillingStatus',
  //     label: 'Trip Billing Status',
  //     type: 'Badge',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'plannedStartEndDateTime',
  //     label: 'Planned Start and End Date Time',
  //     type: 'EditableText',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'actualStartEndDateTime',
  //     label: 'Actual Start and End Date Time',
  //     type: 'DateTimeRange',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'departurePoint',
  //     label: 'Departure Point',
  //     type: 'TextWithTooltip',
  //     sortable: true,
  //     editable: false,
  //     infoTextField: 'departurePointDetails',
  //     subRow: true
  //   },
  //   {
  //     key: 'arrivalPoint',
  //     label: 'Arrival Point',
  //     type: 'TextWithTooltip',
  //     sortable: true,
  //     editable: false,
  //     infoTextField: 'arrivalPointDetails',
  //     subRow: true
  //   },
  //   {
  //     key: 'customer',
  //     label: 'Customer',
  //     type: 'ExpandableCount',
  //     sortable: true,
  //     editable: false,
  //     renderExpandedContent: (row: SampleData) => (
  //       <div className="space-y-3">
  //         <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
  //           <User className="h-4 w-4" />
  //           Customer Details
  //         </div>
  //         {row.customerDetails?.map((customer, index) => (
  //           <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
  //             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
  //               <User className="h-4 w-4 text-blue-600" />
  //             </div>
  //             <div>
  //               <div className="font-medium text-gray-900">{customer.name}</div>
  //               <div className="text-sm text-gray-500">{customer.id}</div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     )
  //   },
  //   {
  //     key: 'resources',
  //     label: 'Resources',
  //     type: 'ExpandableCount',
  //     sortable: true,
  //     editable: false,
  //     renderExpandedContent: (row: SampleData) => (
  //       <div className="space-y-3">
  //         <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
  //           <Container className="h-4 w-4" />
  //           Resource Details
  //         </div>
  //         {row.resourceDetails?.map((resource, index) => (
  //           <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
  //             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
  //               {resource.type === 'train' && <Train className="h-4 w-4 text-green-600" />}
  //               {resource.type === 'agent' && <UserCheck className="h-4 w-4 text-green-600" />}
  //               {resource.type === 'container' && <Container className="h-4 w-4 text-green-600" />}
  //             </div>
  //             <div>
  //               <div className="font-medium text-gray-900">{resource.name}</div>
  //               <div className="text-sm text-gray-500">{resource.id}</div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     )
  //   }
  // ];

  // Initialize columns and data in the grid state
  useEffect(() => {
    console.log('Initializing columns in QuickOrderManagement');
    gridState.setColumns(initialColumns);
    gridState.setGridData(processedData);
    console.log(gridState.filters);
  }, []);

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard', active: false },
    { label: 'Quick Order Management', active: true }
    // { label: 'Trip Execution Management', active: false },
  ];

  // Log when columns change
  useEffect(() => {
    console.log('Columns changed in QuickOrderManagement:', gridState.columns);
    const oldQuickOrder = jsonStore.getQuickOrder();
    console.log("QUICK ORDER OBJECT IN LIST PAGE : ", oldQuickOrder)
    console.log('Sub-row columns:', gridState.columns.filter(col => col.subRow).map(col => col.key));
  }, [gridState.columns, gridState.forceUpdate]);

  const { toast } = useToast();

  const sampleData: SampleData[] = [
    {
      "QuickUniqueID": 99,
      "QuickOrderNo": "",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Save",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "Hire",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 104,
      "QuickOrderNo": "-1/BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Save",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 109,
      "QuickOrderNo": "109/BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Save",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 110,
      "QuickOrderNo": "110/BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 111,
      "QuickOrderNo": "111/BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 112,
      "QuickOrderNo": "112/BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 113,
      "QuickOrderNo": "113/BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 114,
      "QuickOrderNo": "114-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 115,
      "QuickOrderNo": "115-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 116,
      "QuickOrderNo": "116-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 117,
      "QuickOrderNo": "117-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 118,
      "QuickOrderNo": "118-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 119,
      "QuickOrderNo": "119-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 120,
      "QuickOrderNo": "120-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 121,
      "QuickOrderNo": "121-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 122,
      "QuickOrderNo": "122-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 123,
      "QuickOrderNo": "123-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 124,
      "QuickOrderNo": "124-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 126,
      "QuickOrderNo": "126-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 129,
      "QuickOrderNo": "129-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 130,
      "QuickOrderNo": "130-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 131,
      "QuickOrderNo": "131-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 132,
      "QuickOrderNo": "132-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 133,
      "QuickOrderNo": "133-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 134,
      "QuickOrderNo": "134-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 135,
      "QuickOrderNo": "135-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 136,
      "QuickOrderNo": "136-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 137,
      "QuickOrderNo": "137-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 138,
      "QuickOrderNo": "138-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 139,
      "QuickOrderNo": "139-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    },
    {
      "QuickUniqueID": 140,
      "QuickOrderNo": "140-BUY",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Status": "Fresh",
      "CustomerOrVendor": "",
      "Customer_Supplier_RefNo": "",
      "Contract": "CON000000116",
      "OrderType": "BUY",
      "TotalNet": 284.52
    }
  ];

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      // Status column colors
      'Released': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Under Execution': 'bg-purple-100 text-purple-800 border-purple-300',
      'Fresh': 'bg-blue-100 text-blue-800 border-blue-300 rounded-2xl',
      'Cancelled': 'bg-red-100 text-red-800 border-red-300',
      'Deleted': 'bg-red-100 text-red-800 border-red-300',
      'Save': 'bg-green-100 text-green-800 border-green-300 rounded-2xl',

      // Trip Billing Status colors
      'Confirmed': 'bg-orange-100 text-orange-800 border-orange-300',
      'Not Eligible': 'bg-red-100 text-red-800 border-red-300',
      'Revenue Leakage': 'bg-red-100 text-red-800 border-red-300',
      'Invoice Created': 'bg-blue-100 text-blue-800 border-blue-300',
      'Invoice Approved': 'bg-green-100 text-green-800 border-green-300'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const processedData = useMemo(() => {
    return sampleData.map(row => ({
      ...row,
      Status: {
        value: row.Status,
        variant: getStatusColor(row.Status)
      },
      tripBillingStatus: {
        value: row.tripBillingStatus,
        variant: getStatusColor(row.tripBillingStatus)
      }
    }));
  }, []);
  // Navigate to the create new quick order page
  const navigate = useNavigate();
  // Configurable buttons for the grid toolbar
  const configurableButtons: ConfigurableButtonConfig[] = [
    {
      label: "Create Order",
      tooltipTitle: "Create new quick order",
      showDropdown: true, // Enable dropdown for future functionality
      onClick: () => {
        navigate('/create-quick-order');
      },
      dropdownItems: [
        {
          label: "Add New",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            setIsDrawerOpen(true);
          }
        },
        {
          label: "Bulk Upload",
          icon: <Upload className="h-4 w-4" />,
          onClick: () => {
            setMoreInfoOpen(true);
          }
        }
      ]
    }
  ];

  const handleLinkClick = (row: any, columnKey: string) => {
    // Only navigate if the clicked column is the Quick Order No. (id)
    if (columnKey === 'QuickOrderNo' && row.QuickUniqueID) {
      navigate(`/create-quick-order?id=${encodeURIComponent(row.QuickUniqueID)}`);
    }
  };

  const handleUpdate = async (updatedRow: any) => {
    console.log('Updating row:', updatedRow);
    // Update the grid data
    gridState.setGridData(prev =>
      prev.map((row, index) =>
        index === updatedRow.index ? { ...row, ...updatedRow } : row
      )
    );

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: "Success",
      description: "Trip plan updated successfully"
    });
  };

  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    console.log('Selected rows changed:', selectedRowIndices);
    setSelectedRows(selectedRowIndices);
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

  const [isMoreInfoOpen, setMoreInfoOpen] = useState(false);


  return (
    <>
      <AppLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container-fluid mx-auto p-4 px-6 space-y-6">
            <div className="hidden md:block">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Grid Container */}
            <div className="rounded-lg mt-4">
              <SmartGrid
                key={`grid-${gridState.forceUpdate}`}
                parentPage="quickOrder"
                columns={gridState.columns}
                data={gridState.gridData.length > 0 ? gridState.gridData : processedData}
                editableColumns={['customerSub']}
                paginationMode="pagination"
                onLinkClick={handleLinkClick}
                onUpdate={handleUpdate}
                onSubRowToggle={gridState.handleSubRowToggle}
                selectedRows={selectedRows}
                onSelectionChange={handleRowSelection}
                rowClassName={(row: any, index: number) =>
                  selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                }
                nestedRowRenderer={renderSubRow}
                configurableButtons={configurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Quick Order"
                recordCount={gridState.gridData.length > 0 ? gridState.gridData.length : processedData.length}
                showCreateButton={true}
                searchPlaceholder="Search all columns..."
              />
              {/* SideDrawer for PlanAndActualDetails */}
              <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Plan and Actual Details"
                isBack={false}
                width='85%'
              >
                <PlanAndActualDetails onCloseDrawer={() => setIsDrawerOpen(false)} />
              </SideDrawer>
              {/* Footer with action buttons matching the screenshot style */}
              {/* <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 px-4 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                Cancel
              </Button>
            </div> */}
            </div>


          </div>
          <SideDrawer isOpen={isMoreInfoOpen} onClose={() => setMoreInfoOpen(false)} width="50%" title="Add Files" isBack={false}>
            <div className="">
              <div className="mt-0 text-sm text-gray-600"><BulkUpload /></div>
            </div>
          </SideDrawer>
        </div>
      </AppLayout>
    </>
  );
};

export default QuickOrderManagement;
