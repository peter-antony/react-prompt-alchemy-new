import React, { useState, useMemo, useEffect } from 'react';
import { SmartGrid } from '@/components/SmartGrid';
import { GridColumnConfig, FilterConfig } from '@/types/smartgrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MoreHorizontal, Plus, Printer, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { ConfigurableButton, ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from "../components/Breadcrumb";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { tripService } from "@/api/services";
import { useFooterStore } from "@/stores/footerStore";

import { useTrips, useCreateTrip, useUpdateTrip, useDeleteTrip } from '@/hooks/queries/useTripQueries';
import { QueryParams, TripCreateInput } from '@/api/types';

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

const TripPlansSearchHubAPI = () => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchData, setSearchData] = useState<Record<string, any>>({});
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc'
  });

  const gridState = useSmartGridState();
  const { toast } = useToast();
  const { setFooter, resetFooter } = useFooterStore();


  // API hooks
  const { data: tripsResponse, isLoading, error, refetch } = useTrips(queryParams);
  const createTripMutation = useCreateTrip();
  const updateTripMutation = useUpdateTrip();
  const deleteTripMutation = useDeleteTrip();

  // Search Panel Configuration
  const searchPanelConfig: PanelConfig = {
    tripPlanNo: {
      id: 'tripPlanNo',
      label: 'Trip Plan No',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      placeholder: 'Enter trip plan number'
    },
    status: {
      id: 'status',
      label: 'Status',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' }
      ]
    },
    startDate: {
      id: 'startDate',
      label: 'Start Date',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3
    },
    endDate: {
      id: 'endDate',
      label: 'End Date',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4
    }
  };

  // Initialize columns and data
  useEffect(() => {
    gridState.setColumns(columns);
    if (!tripsResponse) return;


    const processedData = tripsResponse.data?.map((row: any) => ({
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
    console.log('GridState------', processedData);

  }, [tripsResponse]);

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
    { label: "Home", href: "/", active: false },
    { label: "Trip Execution API", active: true },
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
      filterable: true,
      filterMode: 'server'
    },
    {
      key: "status",
      label: "Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      filterable: true,
      filterMode: 'server'
    },
    {
      key: "tripBillingStatus",
      label: "Trip Billing Status",
      type: "Badge",
      sortable: true,
      editable: false,
      subRow: false,
      filterable: true,
      filterMode: 'server'
    },
    {
      key: "plannedStartEndDateTime",
      label: "Planned Start and End Date Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: "actualStartEndDateTime",
      label: "Actual Start and End Date Time",
      type: "DateTimeRange",
      sortable: true,
      editable: false,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: "departurePoint",
      label: "Departure Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: "arrivalPoint",
      label: "Arrival Point",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: "customer",
      label: "Customer",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: "draftBill",
      label: "Draft Bill",
      type: "Link",
      sortable: true,
      editable: false,
      subRow: false,
      filterable: true,
      filterMode: 'local'
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
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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
    console.log('Trip clicked:', value, row);
    // toast({
    //   title: "Trip Details",
    //   description: `Clicked on trip: ${row.id}`
    // });
  };

  const handleUpdate = async (updatedRow: any) => {
    try {
      await updateTripMutation.mutateAsync({
        id: updatedRow.id,
        data: {
          title: updatedRow.title,
          description: updatedRow.description,
          startDate: updatedRow.startDate,
          endDate: updatedRow.endDate,
          cost: parseFloat(updatedRow.cost) || 0,
          currency: updatedRow.currency
        }
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    setSelectedRows(selectedRowIndices);
  };

  const handleSearchDataChange = (data: Record<string, any>) => {
    setSearchData(data);
    console.log('Search data changed:', data);
  };

  const handleSearch = () => {
    console.log('handleSearch');
    const newQueryParams: QueryParams = {
      ...queryParams,
      page: 1,
      filters: {
        ...searchData
      }
    };
    setQueryParams(newQueryParams);

    toast({
      title: "Search",
      description: "Searching with filters..."
    });
  };

  const handleClear = () => {
    setSearchData({});
    setQueryParams({
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc'
    });

    toast({
      title: "Cleared",
      description: "Search filters have been cleared"
    });
  };

  const handleCreateTrip = async () => {
    try {
      const newTrip: TripCreateInput = {
        title: 'New Trip Plan',
        description: 'Description for new trip',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        cost: 0,
        currency: 'USD'
      };

      await createTripMutation.mutateAsync(newTrip);
    } catch (error) {
      console.error('Create trip failed:', error);
    }
  };

  const handleBulkUpload = () => {
    console.log('Bulk upload');
    toast({
      title: "Bulk Upload",
      description: "Bulk upload functionality would be implemented here"
    });
  };

  const handleServerFilter = async (filters: FilterConfig[]) => {
    console.log('Server filters applied:', filters);

    // Convert FilterConfig[] to QueryParams filters format
    const serverFilters: Record<string, any> = {};

    filters.forEach(filter => {
      if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
        serverFilters[filter.column] = filter.value;
      }
    });

    const newQueryParams: QueryParams = {
      ...queryParams,
      page: 1, // Reset to first page when filtering
      filters: {
        ...queryParams.filters,
        ...serverFilters
      }
    };

    setQueryParams(newQueryParams);

    toast({
      title: "Column Filters Applied",
      description: `Applied ${filters.length} server-side filters`
    });
  };

  // Configure the Create Trip button for the grid toolbar
  const gridConfigurableButtons: ConfigurableButtonConfig[] = [
    {
      label: "+ Create Trip",
      tooltipTitle: "Create a new trip or upload in bulk",
      showDropdown: true,
      tooltipPosition: 'top' as const,
      dropdownItems: [
        {
          label: "Create Trip",
          icon: <Plus className="h-4 w-4" />,
          onClick: handleCreateTrip
        },
        {
          label: "Bulk Upload",
          icon: <Upload className="h-4 w-4" />,
          onClick: handleBulkUpload
        }
      ],
      onClick: function (): void {
        throw new Error('Function not implemented.');
      }
    }
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

  // Handle loading and error states
  if (error) {
    // return (
    //   <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    //     <div className="text-center">
    //       <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Trips</h2>
    //       <p className="text-gray-600 mb-4">Failed to load trip data from the server.</p>
    //       <Button onClick={() => refetch()}>
    //         Try Again
    //       </Button>
    //     </div>
    //   </div>
    // );
  }

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
                columns={gridState.columns.length > 0 ? gridState.columns : columns}
                data={gridState.gridData.length > 0
                  ? gridState.gridData
                  : gridState.gridData}
                paginationMode="pagination"
                onLinkClick={handleLinkClick}
                onUpdate={handleUpdate}
                onSubRowToggle={gridState.handleSubRowToggle}
                onServerFilter={handleServerFilter}
                selectedRows={selectedRows}
                onSelectionChange={handleRowSelection}
                rowClassName={(row: any, index: number) =>
                  selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                }
                nestedRowRenderer={renderSubRow}
                configurableButtons={gridConfigurableButtons}
                showDefaultConfigurableButton={false}
                gridTitle="Trip Plans (API)"
                // recordCount={tripsResponse?.pagination?.total || processedNoAPIData.length}
                recordCount={gridState.gridData.length > 0
                  ? gridState.gridData.length
                  : gridState.gridData.length}
              />
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-700">Loading trips...</span>
                </div>
              </div>
            )}
          </div>

          {/* <style>{`
              .smart-grid-row-selected {
                background-color: #eff6ff !important;
                border-left: 4px solid #3b82f6 !important;
              }
              .smart-grid-row-selected:hover {
                background-color: #dbeafe !important;
              }
            `}</style> */}
        </div>
      </AppLayout >
    </>
  );
};

export default TripPlansSearchHubAPI;
