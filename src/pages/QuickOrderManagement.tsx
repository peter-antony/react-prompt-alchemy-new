import React, { useState, useMemo, useEffect } from 'react';
import { SmartGrid } from '@/components/SmartGrid';
import { GridColumnConfig } from '@/types/smartgrid';
import { Button } from '@/components/ui/button';
import { Printer, MoreHorizontal, User, Train, UserCheck, Container, Plus, Upload, NotebookPen, Edit, Trash2, Eye, Settings, GitPullRequest } from 'lucide-react';
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
import CommonPopup from '@/components/Common/CommonPopup';
import { quickOrderService } from '@/api/services';

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
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const gridState = useSmartGridState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { config, setFooter, resetFooter } = useFooterStore();
  const [popupOpen, setPopupOpen] = useState(false);
  const [fields, setFields] = useState([
    {
      type: "select",
      label: "Reason Code",
      name: "reasonCode",
      placeholder: "Select Reason Code",
      options: [
        { value: "A", label: "Reason A" },
        { value: "B", label: "Reason B" },
      ],
      value: "",
    },
    {
      type: "text",
      label: "Reason Code Desc.",
      name: "reasonDesc",
      placeholder: "Enter Reason Code Description",
      value: "",
    },
  ]);

  const handleFieldChange = (name, value) => {
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const [popupTitle, setPopupTitle] = useState('');
  const [popupButtonName, setPopupButtonName] = useState('');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  const orderConfirmhandler = () => {
    setPopupOpen(true);
    setPopupTitle('Amend');
    setPopupButtonName('Amend');
    setPopupBGColor('bg-blue-600');
    setPopupTextColor('text-blue-600');
    setPopupTitleBgColor('bg-blue-100');
  };

  const quickOrderCancelhandler = () => {
    setPopupOpen(true);
    setPopupTitle('Cancel Bill');
    setPopupButtonName('Cancel');
    setPopupBGColor('bg-red-600');
    setPopupTextColor('text-red-500');
    setPopupTitleBgColor('bg-red-50');
  };

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
          // disabled: true,
          type: 'Button',
          onClick: () => {
            console.log("Cancel clicked");
            // quickOrderCancelhandler();
          },
        },
        {
          label: "Confirm",
          type: "Button",
          // disabled: true,
          onClick: () => {
            console.log("Confirm clicked");
            // orderConfirmhandler();
          },
        },
      ],
    });
    return () => resetFooter();
  }, []);

  const GitPullActionButton = () => {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 1.5V10C1.5 11.4001 1.5 12.1002 1.77248 12.635C2.01217 13.1054 2.39462 13.4878 2.86502 13.7275C3.3998 14 4.09987 14 5.5 14H11.5M11.5 14C11.5 15.3807 12.6193 16.5 14 16.5C15.3807 16.5 16.5 15.3807 16.5 14C16.5 12.6193 15.3807 11.5 14 11.5C12.6193 11.5 11.5 12.6193 11.5 14ZM1.5 5.66667L11.5 5.66667M11.5 5.66667C11.5 7.04738 12.6193 8.16667 14 8.16667C15.3807 8.16667 16.5 7.04738 16.5 5.66667C16.5 4.28595 15.3807 3.16667 14 3.16667C12.6193 3.16667 11.5 4.28596 11.5 5.66667Z" stroke="#475467" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

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
      label: 'Cust/Sup. Ref. No.',
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
      type: 'CurrencyWithSymbol',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'actions',
      label: '',
      type: 'ActionButton',
      sortable: false,
      editable: false,
      subRow: false,
      width: 80,
      actionButtons: [
        // {
        //   icon: <Eye className="h-4 w-4 text-blue-600" />,
        //   tooltip: 'View Details',
        //   onClick: (rowData) => {
        //     console.log('View clicked for:', rowData);
        //     // Navigate to view page or open modal
        //     navigate(`/create-quick-order?id=${encodeURIComponent(rowData.QuickUniqueID)}&mode=view`);
        //   },
        //   variant: 'ghost',
        //   size: 'sm'
        // },
        {
          icon: <GitPullActionButton />,
          tooltip: 'Order',
          onClick: (rowData) => {
            console.log('clicked for:', rowData);
            // Show confirmation dialog
          },
          variant: 'ghost',
          size: 'lg',
          // disabled: (rowData) => rowData.Status.value === 'Save' || rowData.Status.value === 'Deleted'
        }
      ]
    }
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

  // Initialize columns and data
  useEffect(() => {

    gridState.setColumns(initialColumns);
    gridState.setLoading(true); // Set loading state
    setApiStatus('loading');

    let isMounted = true;

    quickOrderService.getQuickOrders({
      filters: searchFilters
    })
      .then((response: any) => {
        if (!isMounted) return;

        console.log('API Response:', response); // Debug log

        // Handle paginated response structure - try different possible response formats
        const data = response?.ResponseResult || response?.data || response?.result || response;

        if (!data || !Array.isArray(data)) {
          console.warn('API returned invalid data format:', response);
          console.warn('Expected array but got:', typeof data, data);
          if (isMounted) {
            gridState.setGridData([]);
            gridState.setLoading(false);
            setApiStatus('error');
          }
          return;
        }

        const processedData = data.map((row: any) => {
          // Helper function for status color (defined inline to avoid hoisting issues)
          const getStatusColorLocal = (status: string) => {
            const statusColors: Record<string, string> = {
              'Released': 'badge-fresh-green rounded-2xl',
              'Under Execution': 'badge-purple rounded-2xl',
              'Fresh': 'badge-blue rounded-2xl',
              'Cancelled': 'badge-red rounded-2xl',
              'Deleted': 'badge-red rounded-2xl',
              'Save': 'badge-green rounded-2xl',
              'Under Amendment': 'badge-orange rounded-2xl',
              'Confirmed': 'badge-green rounded-2xl',
              'Initiated': 'badge-blue rounded-2xl',
            };
            return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
          };

          return {
            ...row,
            Status: {
              value: row.Status,
              variant: getStatusColorLocal(row.Status),
            },
          };
        });

        console.log('Processed Data:', processedData); // Debug log

        if (isMounted) {
          gridState.setGridData(processedData);
          gridState.setLoading(false);
          setApiStatus('success');
        }
      })
      .catch((error: any) => {
        console.error("Quick order fetch failed:", error);
        if (isMounted) {
          gridState.setGridData([]);
          gridState.setLoading(false);
          setApiStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []); // Add dependencies if needed

  const breadcrumbItems = [
    { label: 'Home', href: '/', active: false },
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

  const handleSearchDataChange = (data: Record<string, any>) => {
    console.log("Search data changed:", data);
  };

  const handleSearch = () => {
    console.log("Searching with filters:", searchFilters);
    // Trigger API call with new filters
    setSearchFilters(searchFilters);
    toast({
      title: "Search",
      description: "Search functionality would be implemented here",
    });
  };

  const handleClear = () => {
    setSearchFilters({});
    toast({
      title: "Cleared",
      description: "Search filters have been cleared",
    });
  };

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
        <div className="min-h-screen main-bg">
          <div className="container-fluid mx-auto p-4 px-6 space-y-6">
            <div className="hidden md:block">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Grid Container */}
            <div className={`rounded-lg mt-4 ${config.visible ? 'pb-4' : ''}`}>
              <SmartGrid
                key={`grid-${gridState.forceUpdate}`}
                parentPage="quickOrder"
                columns={gridState.columns}
                data={gridState.gridData}
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
                recordCount={gridState.gridData.length}
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
          <CommonPopup
            open={popupOpen}
            onClose={() => setPopupOpen(false)}
            title={popupTitle}
            titleColor={popupTextColor}
            titleBGColor={popupTitleBgColor}
            icon={<NotebookPen className="w-4 h-4" />}
            fields={fields as any}
            onFieldChange={handleFieldChange}
            onSubmit={() => {
              setPopupOpen(false);
            }}
            submitLabel={popupButtonName}
            submitColor={popupBGColor}
          />
        </div>
      </AppLayout>
    </>
  );
};

export default QuickOrderManagement;
