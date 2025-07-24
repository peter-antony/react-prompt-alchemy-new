import React, { useState, useMemo, useEffect } from 'react';
import { SmartGrid } from '@/components/SmartGrid';
import { GridColumnConfig, FilterConfig } from '@/types/smartgrid';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { ConfigurableButton, ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTrips, useCreateTrip, useUpdateTrip, useDeleteTrip } from '@/hooks/queries/useTripQueries';
import { QueryParams, TripCreateInput } from '@/api/types';

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

  // Initialize columns
  useEffect(() => {
    gridState.setColumns(columns);
  }, []);

  const columns: GridColumnConfig[] = [
    {
      key: 'id',
      label: 'Trip Plan No',
      type: 'Link',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      filterable: true,
      filterMode: 'server'
    },
    {
      key: 'title',
      label: 'Title',
      type: 'Text',
      sortable: true,
      editable: true,
      subRow: false,
      filterable: true,
      filterMode: 'server'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'Badge',
      sortable: true,
      editable: false,
      subRow: false,
      filterable: true,
      filterMode: 'server'
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'Date',
      sortable: true,
      editable: true,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: 'endDate',
      label: 'End Date',
      type: 'Date',
      sortable: true,
      editable: true,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: 'cost',
      label: 'Cost',
      type: 'Text',
      sortable: true,
      editable: true,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'Text',
      sortable: true,
      editable: true,
      subRow: true,
      filterable: true,
      filterMode: 'local'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'Text',
      sortable: false,
      editable: true,
      subRow: false,
      filterable: true,
      filterMode: 'local'
    }
  ];

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800 border-gray-300',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'approved': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const processedData = useMemo(() => {
    if (!tripsResponse?.data) return [];
    
    return tripsResponse.data.map(trip => ({
      ...trip,
      status: {
        value: trip.status,
        variant: getStatusColor(trip.status)
      },
      startDate: new Date(trip.startDate).toLocaleDateString(),
      endDate: new Date(trip.endDate).toLocaleDateString(),
      cost: `${trip.cost} ${trip.currency}`
    }));
  }, [tripsResponse]);

  const handleLinkClick = (value: any, row: any) => {
    console.log('Trip clicked:', value, row);
    toast({
      title: "Trip Details",
      description: `Clicked on trip: ${row.id}`
    });
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
      ]
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-600">
                Trip Plans Search Hub (API)
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Search Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
            <div className="flex space-x-2">
              <Button onClick={handleSearch} disabled={isLoading}>
                Search
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
          <DynamicPanel
            panelId="trip-search-filters"
            panelTitle="Search Filters"
            panelConfig={searchPanelConfig}
            initialData={searchData}
            onDataChange={handleSearchDataChange}
          />
        </div>

        {/* Grid Container */}
        <div className="bg-white rounded-lg shadow-sm">
          <SmartGrid
            key={`grid-${gridState.forceUpdate}`}
            columns={gridState.columns.length > 0 ? gridState.columns : columns}
            data={processedData}
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
            recordCount={tripsResponse?.pagination?.total || processedData.length}
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

      <style>{`
        .smart-grid-row-selected {
          background-color: #eff6ff !important;
          border-left: 4px solid #3b82f6 !important;
        }
        .smart-grid-row-selected:hover {
          background-color: #dbeafe !important;
        }
      `}</style>
    </div>
  );
};

export default TripPlansSearchHubAPI;
