import React, { useState, useMemo, useEffect } from "react";
import { SmartGrid } from "@/components/SmartGrid";
import { GridColumnConfig } from "@/types/smartgrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Plus, Printer, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSmartGridState } from "@/hooks/useSmartGridState";
import { DraggableSubRow } from "@/components/SmartGrid/DraggableSubRow";
import { DynamicPanel } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel";
import {
  ConfigurableButton,
  ConfigurableButtonConfig,
} from "@/components/ui/configurable-button";
import { Breadcrumb } from "../components/Breadcrumb";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { tripService } from "@/api/services";
import { useFooterStore } from "@/stores/footerStore";



const TripPlansSearchHub = () => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchData, setSearchData] = useState<Record<string, any>>({});
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const { toast } = useToast();
  const { setFooter, resetFooter } = useFooterStore();

  // Search Panel Configuration
  const searchPanelConfig: PanelConfig = {
    tripPlanNo: {
      id: "tripPlanNo",
      label: "Trip Plan No",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      placeholder: "Enter trip plan number",
    },
    status: {
      id: "status",
      label: "Status",
      fieldType: "select",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: "Released", value: "Released" },
        { label: "Under Execution", value: "Under Execution" },
        { label: "Initiated", value: "Initiated" },
        { label: "Cancelled", value: "Cancelled" },
        { label: "Deleted", value: "Deleted" },
        { label: "Confirmed", value: "Confirmed" },
      ],
    },
    customer: {
      id: "customer",
      label: "Customer",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      placeholder: "Enter customer name",
    },
    departurePoint: {
      id: "departurePoint",
      label: "Departure Point",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      placeholder: "Enter departure point",
    },
    arrivalPoint: {
      id: "arrivalPoint",
      label: "Arrival Point",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      placeholder: "Enter arrival point",
    },
    plannedStartDate: {
      id: "plannedStartDate",
      label: "Planned Start Date",
      fieldType: "date",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
    },
    plannedEndDate: {
      id: "plannedEndDate",
      label: "Planned End Date",
      fieldType: "date",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
    },
  };
  const columns: GridColumnConfig[] = [
    {
      key: "id",
      label: "Trip Plan No",
      type: "Link",
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
    },
    {
      key: "status",
      label: "Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "tripBillingStatus",
      label: "Trip Billing Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "plannedStartEndDateTime",
      label: "Planned Start and End Date Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "actualStartEndDateTime",
      label: "Actual Start and End Date Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "departurePoint",
      label: "Departure Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "arrivalPoint",
      label: "Arrival Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "customer",
      label: "Customer",
      type: "CustomerCountBadge",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "draftBill",
      label: "Draft Bill",
      type: "Link",
      sortable: true,
      editable: false,
      subRow: false,
    },
  ];

  // Initialize columns and data
  useEffect(() => {
    gridState.setColumns(columns);
    gridState.setLoading(true); // Set loading state
    setApiStatus('loading');

    let isMounted = true;

    tripService.getTrips()
      .then((response: any) => {
        if (!isMounted) return;

        console.log('API Response:', response); // Debug log

        // Handle paginated response structure
        const data = response?.data || response;

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
              // Status column colors
              'Released': 'badge-fresh-green rounded-2xl',
              'Under Execution': 'badge-purple rounded-2xl',
              'Fresh': 'badge-blue rounded-2xl',
              'Cancelled': 'badge-red rounded-2xl',
              'Deleted': 'badge-red rounded-2xl',
              'Save': 'badge-green rounded-2xl',
              'Under Amendment': 'badge-orange rounded-2xl',
              'Confirmed': 'badge-green rounded-2xl',
              'Initiated': 'badge-blue rounded-2xl',

              // Trip Billing Status colors
              'Draft Bill Raised': 'badge-orange rounded-2xl',
              'Not Eligible': 'badge-red rounded-2xl',
              'Revenue Leakage': 'badge-red rounded-2xl',
              'Invoice Created': 'badge-blue rounded-2xl',
              'Invoice Approved': 'badge-fresh-green rounded-2xl'
            };
            return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
          };

          return {
            ...row,
            status: {
              value: row.status,
              variant: getStatusColorLocal(row.status),
            },
            tripBillingStatus: {
              value: row.tripBillingStatus,
              variant: getStatusColorLocal(row.tripBillingStatus),
            },
            // Add customer data for API data as well
            customerData: [
              { name: "DB Cargo", id: "CUS00000123" },
              { name: "ABC Rail Goods", id: "CUS00003214" },
              { name: "Wave Cargo", id: "CUS00012345" },
              { name: "Express Logistics", id: "CUS00004567" },
              { name: "Global Freight", id: "CUS00007890" }
            ].slice(0, parseInt(row.customer?.replace('+', '') || '3')),
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
        console.error("Trip fetch failed:", error);
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

  useEffect(() => {
    setFooter({
      visible: true,
      pageName: 'Trip_Execution',
      leftButtons: [
        {
          label: "CIM/CUV Report",
          onClick: () => console.log("CIM/CUV Report"),
          type: "Icon",
          iconName: 'BookText'
        },
        {
          label: "Dropdown Menu",
          onClick: () => console.log("Menu"),
          type: "Icon",
          iconName: 'EllipsisVertical'
        },
      ],
      rightButtons: [
        {
          label: "Cancel",
          onClick: () => {
            console.log("Cancel clicked");
          },
          type: 'Button'
        },
      ],
    });
    return () => resetFooter();
  }, [setFooter, resetFooter]);

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard", active: false },
    { label: "Trip Execution Management", active: true },
    // { label: 'Trip Execution Management', active: false },
  ];

  // Navigate to the create new quick order page
  const navigate = useNavigate();
  // Configurable buttons for the grid toolbar
  const configurableButtons: ConfigurableButtonConfig[] = [
    {
      label: "Create Trip",
      tooltipTitle: "Create trip",
      showDropdown: true, // Enable dropdown for future functionality
      onClick: () => {
        navigate("/");
      },
      dropdownItems: [
        {
          label: "Add New",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            // setIsDrawerOpen(true);
          },
        },
        {
          label: "Bulk Upload",
          icon: <Upload className="h-4 w-4" />,
          onClick: () => {
            toast({
              title: "Bulk Upload",
              description: "Opening bulk upload dialog...",
            });
          },
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      // Status column colors
      'Released': 'badge-fresh-green rounded-2xl',
      'Under Execution': 'badge-purple rounded-2xl',
      'Fresh': 'badge-blue rounded-2xl',
      'Cancelled': 'badge-red rounded-2xl',
      'Deleted': 'badge-red rounded-2xl',
      'Save': 'badge-green rounded-2xl',
      'Under Amendment': 'badge-orange rounded-2xl',
      'Confirmed': 'badge-green rounded-2xl',
      'Initiated': 'badge-blue rounded-2xl',

      // Trip Billing Status colors
      'Draft Bill Raised': 'badge-orange rounded-2xl',
      'Not Eligible': 'badge-red rounded-2xl',
      'Revenue Leakage': 'badge-red rounded-2xl',
      'Invoice Created': 'badge-blue rounded-2xl',
      'Invoice Approved': 'badge-fresh-green rounded-2xl'
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

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

    toast({
      title: "Success",
      description: "Trip plan updated successfully",
    });
  };

  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    setSelectedRows(selectedRowIndices);
  };

  const handleSearchDataChange = (data: Record<string, any>) => {
    setSearchData(data);
    console.log("Search data changed:", data);
  };

  const handleSearch = () => {
    console.log("Searching with filters:", searchData);
    toast({
      title: "Search",
      description: "Search functionality would be implemented here",
    });
  };

  const handleClear = () => {
    setSearchData({});
    toast({
      title: "Cleared",
      description: "Search filters have been cleared",
    });
  };

  // Move function declarations before they are used
  const handleCreateTrip = () => {
    console.log("Creating new trip");
    toast({
      title: "Create Trip",
      description: "Create trip functionality would be implemented here",
    });
  };

  const handleBulkUpload = () => {
    console.log("Bulk upload");
    toast({
      title: "Bulk Upload",
      description: "Bulk upload functionality would be implemented here",
    });
  };

  // Configure the Create Trip button for the grid toolbar
  const gridConfigurableButtons: ConfigurableButtonConfig[] = [
    {
      label: " Create Trip",
      tooltipTitle: "Create a new trip or upload in bulk",
      showDropdown: true,
      tooltipPosition: "top" as const,
      dropdownItems: [
        {
          label: "Create Trip",
          icon: <Plus className="h-4 w-4" />,
          onClick: handleCreateTrip,
        },
        {
          label: "Bulk Upload",
          icon: <Upload className="h-4 w-4" />,
          onClick: handleBulkUpload,
        },
      ],
      onClick: function (): void {
        console.log("Function not implemented.");
      },
    },
  ];

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
                columns={gridState.columns}
                data={gridState.gridData}
                paginationMode="pagination"
                onLinkClick={handleLinkClick}
                onUpdate={handleUpdate}
                onSubRowToggle={gridState.handleSubRowToggle}
                selectedRows={selectedRows}
                onSelectionChange={handleRowSelection}
                rowClassName={(row: any, index: number) =>
                  selectedRows.has(index) ? "smart-grid-row-selected" : ""
                }
                nestedRowRenderer={renderSubRow}
                configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Trip Plans"
                recordCount={gridState.gridData.length}
              />
              {/* SideDrawer for PlanAndActualDetails */}
              {/* <SideDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              title="Plan and Actual Details"
              isBack={false}
              width='85%'
            >
              <PlanAndActualDetails onCloseDrawer={() => setIsDrawerOpen(false)} />
            </SideDrawer> */}
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
        </div>
      </AppLayout>

      {/* <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 space-y-6">
          
          <div className="bg-white rounded-lg shadow-sm">
            <style>{`
            .smart-grid-row-selected {
              background-color: #eff6ff !important;
              border-left: 4px solid #3b82f6 !important;
            }
            .smart-grid-row-selected:hover {
              background-color: #dbeafe !important;
            }
          `}</style>
            <SmartGrid
              key={`grid-${gridState.forceUpdate}`}
              columns={gridState.columns}
              data={
                gridState.gridData.length > 0
                  ? gridState.gridData
                  : processedData
              }
              paginationMode="pagination"
              onLinkClick={handleLinkClick}
              onUpdate={handleUpdate}
              onSubRowToggle={gridState.handleSubRowToggle}
              selectedRows={selectedRows}
              onSelectionChange={handleRowSelection}
              rowClassName={(row: any, index: number) =>
                selectedRows.has(index) ? "smart-grid-row-selected" : ""
              }
              nestedRowRenderer={renderSubRow}
              configurableButtons={gridConfigurableButtons}
              showDefaultConfigurableButton={false}
              gridTitle="Trip Plans"
              recordCount={
                gridState.gridData.length > 0
                  ? gridState.gridData.length
                  : processedData.length
              }
            />
          </div>
        </div>
      </div> */}
    </>
  );
};

export default TripPlansSearchHub;
