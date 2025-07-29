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

interface TripPlanData {
  id: string;
  status: string;
  tripBillingStatus: string;
  plannedStartEndDateTime: string;
  actualStartEndDateTime: string;
  departurePoint: string;
  arrivalPoint: string;
  customer: string;
  draftBill: string;
}

const TripPlansSearchHub = () => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchData, setSearchData] = useState<Record<string, any>>({});

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

  // Initialize columns and data
  useEffect(() => {
    gridState.setColumns(columns);
    tripService.getTrips()
    .then((data: any) => {
      const processedData = data.map((row: any) => ({
          ...row,
          status: {
            value: row.status,
            variant: getStatusColor(row.status),
          },
          tripBillingStatus: {
            value: row.tripBillingStatus,
            variant: getStatusColor(row.tripBillingStatus),
          },
        }));
        gridState.setGridData(processedData);
    })
    .catch((error: any) =>{
      console.log(error);
      gridState.setGridData([]);
    }) 
    .finally(() => console.log('Trip finally'));
  }, []);

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
          onClick: () => console.log("Cancel clicked"),
          // disabled: true,
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
      subRow: true,
    },
    {
      key: "departurePoint",
      label: "Departure Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "arrivalPoint",
      label: "Arrival Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "customer",
      label: "Customer",
      type: "Text",
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

  const sampleNoAPIData: TripPlanData[] = [
    {
      id: "TRIP00000001",
      status: "Released",
      tripBillingStatus: "Draft Bill Raised",
      plannedStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      actualStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      departurePoint: "VLA-70",
      arrivalPoint: "CUR-25",
      customer: "+3",
      draftBill: "DB/000234",
    },
    {
      id: "TRIP00000002",
      status: "Under Execution",
      tripBillingStatus: "Not Eligible",
      plannedStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      actualStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      departurePoint: "VLA-70",
      arrivalPoint: "CUR-25",
      customer: "+3",
      draftBill: "DB/000234",
    },
    {
      id: "TRIP00000003",
      status: "Initiated",
      tripBillingStatus: "Revenue Leakage",
      plannedStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      actualStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      departurePoint: "VLA-70",
      arrivalPoint: "CUR-25",
      customer: "+3",
      draftBill: "DB/000234",
    },
    {
      id: "TRIP00000004",
      status: "Cancelled",
      tripBillingStatus: "Invoice Created",
      plannedStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      actualStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      departurePoint: "VLA-70",
      arrivalPoint: "CUR-25",
      customer: "+3",
      draftBill: "DB/000234",
    },
    {
      id: "TRIP00000005",
      status: "Deleted",
      tripBillingStatus: "Invoice Approved",
      plannedStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      actualStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      departurePoint: "VLA-70",
      arrivalPoint: "CUR-25",
      customer: "+3",
      draftBill: "DB/000234",
    },
    {
      id: "TRIP00000006",
      status: "Confirmed",
      tripBillingStatus: "Not Eligible",
      plannedStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      actualStartEndDateTime:
        "25-Mar-2025 11:22:34 PM\n27-Mar-2025 11:22:34 PM",
      departurePoint: "VLA-70",
      arrivalPoint: "CUR-25",
      customer: "+3",
      draftBill: "DB/000234",
    }
  ];

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      Released: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Under Execution": "bg-purple-100 text-purple-800 border-purple-300",
      Initiated: "bg-blue-100 text-blue-800 border-blue-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
      Deleted: "bg-red-100 text-red-800 border-red-300",
      Confirmed: "bg-green-100 text-green-800 border-green-300",
      "Draft Bill Raised": "bg-orange-100 text-orange-800 border-orange-300",
      "Not Eligible": "bg-red-100 text-red-800 border-red-300",
      "Revenue Leakage": "bg-red-100 text-red-800 border-red-300",
      "Invoice Created": "bg-blue-100 text-blue-800 border-blue-300",
      "Invoice Approved": "bg-green-100 text-green-800 border-green-300",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const processedNoAPIData = useMemo(() => {
    return sampleNoAPIData.map((row) => ({
      ...row,
      status: {
        value: row.status,
        variant: getStatusColor(row.status),
      },
      tripBillingStatus: {
        value: row.tripBillingStatus,
        variant: getStatusColor(row.tripBillingStatus),
      },
    }));
  }, []);

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
                data={
                  gridState.gridData.length > 0
                    ? gridState.gridData
                    : processedNoAPIData
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
                    : processedNoAPIData.length
                }
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
