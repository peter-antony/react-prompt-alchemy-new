import React, { useState, useEffect, useMemo } from "react";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { GridColumnConfig, ServerFilter } from '@/types/smartgrid';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFooterStore } from '@/stores/footerStore';
import { filterService, quickOrderService, tripService } from '@/api/services';
import { CimReportSearchCriteria, IReportCriteria, ITemplateCriteria } from "@/constants/cimcuvSearchCriteria";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui/button";
import { dateFormatter } from "@/utils/formatter";
import { CimCuvService } from "@/api/services/CimCuvService";

export const ReportSearchHub = () => {
  const [searchParams] = useSearchParams();
  const gridId = "CIM-report-hub"; // same id you pass to SmartGridWithGrouping
  const { activeFilters } = useFilterStore();
  const filtersForThisGrid = activeFilters[gridId] || {};
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const { toast } = useToast();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);

  // State for server filtering
  const [serverFilterVisibleFields, setServerFilterVisibleFields] = useState<string[]>([]); // Store the visible fields for server filtering
  const [serverFilterFieldOrder, setServerFilterFieldOrder] = useState<string[]>([]); // Store the field order for server filtering
  const [isServerFilterPersonalizationEmpty, setIsServerFilterPersonalizationEmpty] = useState(false); // Flag to check if server filter personalization is empty (Insert / Update)


  const handleGridPreferenceSave = async (preferences: any) => {
    try {
      // Get the latest preferences from localStorage to ensure we have the full state
      const storedPreferences = localStorage.getItem('smartgrid-preferences');
      const preferencesToSave = storedPreferences ? JSON.parse(storedPreferences) : preferences;

      console.log('Saving WorkOrderHub SmartGrid preferences:', preferencesToSave);
      console.log('Preference ModeFlag:', preferenceModeFlag);

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'CimReportHub',
        ComponentName: 'smartgrid-preferences',
        JsonData: preferencesToSave,
        IsActive: "1",
        ModeFlag: preferenceModeFlag // Use the state variable
      });

      const apiData = response?.data;

      if (apiData) {
        const isSuccess = apiData?.IsSuccess;
        // const message = apiData?.Message || "No message returned";

        toast({
          title: isSuccess ? "✅ Preferences Saved Successfully" : "⚠️ Error Saving Preferences",
          description: apiData?.Message,
          variant: isSuccess ? "default" : "destructive",
        });

        // If save was successful and we were in Insert mode, switch to Update mode for future saves
        if (isSuccess && preferenceModeFlag === 'Insert') {
          setPreferenceModeFlag('Update');
        }
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Failed to save grid preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save grid preferences",
        variant: "destructive",
      });
    }
  };

  const handleServerFilterPreferenceSave = async (visibleFields: string[], fieldOrder: string[]) => {
    console.log('WorkOrderHub: handleServerFilterPreferenceSave called', { visibleFields, fieldOrder });
    try {
      const preferencesToSave = {
        visibleFields,
        fieldOrder
      };

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'CimReportHub',
        ComponentName: 'smartgrid-serverside-filtersearch-preferences',
        JsonData: preferencesToSave,
        IsActive: "1",
        ModeFlag: isServerFilterPersonalizationEmpty ? "Insert" : "Update"
      });

      const apiData = response?.data;

      if (apiData?.IsSuccess) {
        setServerFilterVisibleFields(visibleFields);
        setServerFilterFieldOrder(fieldOrder);
        // Update the empty flag since we now have saved data
        setIsServerFilterPersonalizationEmpty(false);

        toast({
          title: "✅ Filter Preferences Saved",
          description: "Your search field preferences have been saved.",
          variant: "default",
        });
      } else {
        throw new Error(apiData?.Message || "Invalid API response");
      }
    } catch (error) {
      console.error("Failed to save server filter preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save filter preferences",
        variant: "destructive",
      });
    }
  };

  const initialColumns: GridColumnConfig[] = [
    {
      key: "CIMCUVID",
      label: "CIM/CUV ID",
      type: "Link",
      width: 150,
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1
    },
    {
      key: "CIMCUVIDDescription",
      label: "CIM/CUV Desc.",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: "doc_type",
      label: "Type",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Status",
      label: "Status",
      type: "Badge",
      width: 70,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "ConsignorID",
      label: "Consignor ID",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false,
    },
    // {
    //   key: "ConsignorDescription",
    //   label: "Consignor Description",
    //   type: "Text",
    //   width: 100,
    //   sortable: true,
    //   editable: false,
    //   subRow: false
    // },
    {
      key: "ConsigneeName",
      label: "Consignee Name",
      type: "Text",
      width: 70,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "CustomerID",
      label: "Customer",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "ContractID",
      label: "Contract",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "RouteID",
      label: "Route ID",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false
    },
    // {
    //   key: "RouteDescription",
    //   label: "Route Description",
    //   type: "Text",
    //   sortable: true,
    //   editable: false,
    //   subRow: true,
    // },
    {
      key: "Departure",
      label: "Departure",
      type: "Text",
      width: 50,
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "Arrival",
      label: "Arrival",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "UNCode",
      label: "UN Code",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "Supplier",
      label: "Supplier",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true
    }
  ];

  const pipedData = (id: any, desc: any) => {
    if (id && desc) return `${id} || ${desc}`;
    return id || desc || '-';
  }

  // Helper function From & To date formatter
  const formatDateRange = (from: string | null, to: string | null): string => {
    if (!from && !to) return '-';
    if (!from) return `${dateFormatter(to)}`;
    if (!to) return `${dateFormatter(from)}`;
    return `${dateFormatter(from)} to ${dateFormatter(to)}`;
  };

  const fetchCimCuvTemplateData = async () => {
    gridState.setColumns(initialColumns);
    gridState.setLoading(true);
    setApiStatus("loading");

    try {
      let searchCriteria;
      if (Object.keys(filtersForThisGrid).length > 0) {
        // ✅ Build criteria from store filters
        searchCriteria = buildSearchCriteria(filtersForThisGrid);
      } else {
        // ✅ Fallback defaults
        searchCriteria = buildSearchCriteria({});
      }

      // const ResultSearchCriteria = buildSearchCriteria(defaultsTo);
      const response: any = await CimCuvService.getCimCuvReportHub({ searchCriteria });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse.CIMCUVReport;
      console.log("data: ", data);
      if (!data || !Array.isArray(data)) {
        gridState.setGridData([]);
        setApiStatus("error");
        return;
      }

      const processedData = data.map((row: any) => {
        const getStatusColorLocal = (status: string) => {
          const statusColors: Record<string, string> = {
            // Status column colors
            'Under Amendment': 'badge-orange rounded-2xl',
            'Confirmed': 'badge-green rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };
        return {
          ...row,
          CustomerID: pipedData(row.CustomerID, row.CustomerDescription),
          ContractID: pipedData(row.ContractID, row.ContractDescription),
          ConsignorID: pipedData(row.ConsignorID, row.ConsignorDescription),
          RouteID: pipedData(row.RouteID, row.RouteDescription),
          Departure: pipedData(row.Departure, row.DepartureDescription),
          Arrival: pipedData(row.Arrival, row.ArrivalDescription),
          Status: {
            value: row.Status,
            variant: getStatusColorLocal(row.Status),
          },
        }
      });

      gridState.setGridData(processedData);
      setApiStatus("success");
    } catch (error) {
      console.error("Fetch trips failed:", error);
      gridState.setGridData([]);
      setApiStatus("error");
    } finally {
      gridState.setLoading(false);
    }
  };

  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const [preferenceModeFlag, setPreferenceModeFlag] = useState<'Insert' | 'Update'>('Insert');

  // Initialize columns and data
  useEffect(() => {
    const init = async () => {
      try {
        const personalizationResponse: any = await quickOrderService.getPersonalization({
          LevelType: 'User',
          // LevelKey: 'ramcouser',
          ScreenName: 'CimReportHub',
          ComponentName: 'smartgrid-preferences'
        });

        // Extract columns with subRow = true from initialColumns
        const subRowColumns = initialColumns
          .filter(col => col.subRow === true)
          .map(col => col.key);

        // Parse and set personalization data to localStorage
        if (personalizationResponse?.data?.ResponseData) {
          const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);

          if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
            const personalizationData = parsedPersonalization.PersonalizationResult[0];

            // Set the JsonData to localStorage
            if (personalizationData.JsonData) {
              const jsonData = personalizationData.JsonData;

              // If subRowColumns is empty in the API response, populate it with extracted columns
              if (!jsonData.subRowColumns || jsonData.subRowColumns.length === 0) {
                jsonData.subRowColumns = subRowColumns;
                console.log('TransportRouteUpdate SmartGrid - subRowColumns was empty, populated with:', subRowColumns);
              }
              localStorage.setItem('smartgrid-preferences', JSON.stringify(personalizationData.JsonData));
              console.log('WorkOrderHub SmartGrid Personalization data set to localStorage:', personalizationData.JsonData);
            }
            // If we have data, next save should be an Update
            setPreferenceModeFlag('Update');
          } else {
            // If result is empty array or no result, next save should be Insert
            console.log('No existing personalization found, setting mode to Insert');
            setPreferenceModeFlag('Insert');
          }
        } else {
          // If ResponseData is empty/null, next save should be Insert
          console.log('Empty personalization response, setting mode to Insert');
          setPreferenceModeFlag('Insert');
        }

        // Fetch Server-side Filter Personalization
        console.log('WorkOrderHub: Fetching server-side filter personalization...');
        try {
          const serverFilterPersonalizationResponse: any = await quickOrderService.getPersonalization({
            LevelType: 'User',
            // LevelKey: 'ramcouser',
            ScreenName: 'CimReportHub',
            ComponentName: 'smartgrid-serverside-filtersearch-preferences'
          });
          console.log('CimReportHub: Server-side filter personalization response:', serverFilterPersonalizationResponse);

          let isServerFilterEmpty = true;
          if (serverFilterPersonalizationResponse?.data?.ResponseData) {
            const parsed = JSON.parse(serverFilterPersonalizationResponse.data.ResponseData);
            if (parsed?.PersonalizationResult && parsed.PersonalizationResult.length > 0) {
              isServerFilterEmpty = false;
              const data = parsed.PersonalizationResult[0].JsonData;
              if (data) {
                if (data.visibleFields) setServerFilterVisibleFields(data.visibleFields);
                if (data.fieldOrder) setServerFilterFieldOrder(data.fieldOrder);
              }
            }
          }
          setIsServerFilterPersonalizationEmpty(isServerFilterEmpty);
        } catch (error) {
          console.error('Failed to fetch server-side filter personalization:', error);
        }

      } catch (error) {
        console.error('Failed to load personalization:', error);
        // On error, default to Insert might be safer, or keep default
      } finally {
        setIsPreferencesLoaded(true); // Set to true after personalization is loaded
      }

      // Call fetchCimCuvTemplateData AFTER personalization is loaded (or failed)
      fetchCimCuvTemplateData();
    };

    init();
    // fetchCimCuvTemplateData();
  }, []); // Add dependencies if needed

  const processedData = useMemo(() => {
    return gridState.gridData.map(row => ({
      ...row,
      status: {
        value: row.status,
        // variant: getStatusColor(row.status)
      },
      tripBillingStatus: {
        value: row.tripBillingStatus,
        // variant: getStatusColor(row.tripBillingStatus)
      }
    }));
  }, []);

  // Update selected row indices based on current page data to maintain selection state
  useEffect(() => {
    const currentData = gridState.gridData.length > 0 ? gridState.gridData : processedData;
    const newSelectedIndices = new Set<number>();

    // Find indices of currently selected row IDs in the current page data
    currentData.forEach((row: any, index: number) => {
      if (selectedRowIds.has(row.WorkOrderNumber)) {
        newSelectedIndices.add(index);
      }
    });

    // Only update if there's a difference to avoid infinite loops
    // Also prevent updates that might trigger unwanted side effects
    if (newSelectedIndices.size !== selectedRows.size ||
      !Array.from(newSelectedIndices).every(index => selectedRows.has(index))) {
      console.log('Updating selected row indices without affecting pagination');
      setSelectedRows(newSelectedIndices);
    }
  }, [gridState.gridData, processedData, selectedRowIds]);

  useEffect(() => {
    setFooter({
      visible: true,
      pageName: 'Trip_Execution',
      leftButtons: [],
      rightButtons: [
        {
          label: "Cancel",
          onClick: () => {
            console.log("Cancel clicked - TemplateHub");
            // setPopupOpen(true);
          },
          type: 'Button',
          disabled: selectedRows.size === 0, // <-- Enable if at least one row is selected
        },
      ],
    });
    return () => resetFooter();
  }, [setFooter, resetFooter, selectedRows]);

  // Navigate to the create new quick order page
  const navigate = useNavigate();

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    if (columnKey === 'CIMCUVID') {
      navigate(`/create-report?id=${value.CIMCUVID}`);
    }
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
    console.log('Selected rows changed via checkbox:', selectedRowIndices);
    setSelectedRows(selectedRowIndices);
    // Update selected row objects and IDs using unique row identification

    const currentData = gridState.gridData.length > 0 ? gridState.gridData : [];
    const selectedObjects = Array.from(selectedRowIndices)
      .map(index => currentData[index])
      .filter(Boolean);

    // Create a new Set of unique row IDs
    const newSelectedRowIds = new Set(selectedObjects.map(row => row.WorkOrderNumber));

    // Update selected row objects to ensure uniqueness by ID
    const uniqueSelectedObjects = selectedObjects.filter((row, index, self) =>
      self.findIndex(r => r.id === row.WorkOrderNumber) === index
    );

    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(uniqueSelectedObjects);
    console.log('Selected row objects:', uniqueSelectedObjects);
    console.log('Selected row IDs:', Array.from(newSelectedRowIds));
  };

  const [rowTripId, setRowTripId] = useState<any>([]);
  const handleRowClick = (row: any, index: number) => {
    console.log('Row clicked:', row, index);

    // Toggle row selection
    const newSelectedRows = new Set(selectedRows);
    // if (newSelectedRows.has(index)) {
    const newSelectedRowIds = new Set(selectedRowIds);
    const newSelectedRowObjects = [...selectedRowObjects];

    // Check if this row is already selected by ID (not index)
    const isRowSelected = newSelectedRowIds.has(row.WorkOrderNumber);

    if (isRowSelected) {
      // Remove row: remove from all tracking sets/arrays
      newSelectedRows.delete(index);
      newSelectedRowIds.delete(row.WorkOrderNumber);
      const objectIndex = newSelectedRowObjects.findIndex(obj => obj.WorkOrderNumber === row.WorkOrderNumber);
      if (objectIndex > -1) {
        newSelectedRowObjects.splice(objectIndex, 1);
      }
      console.log('Removed row:', row.WorkOrderNumber);
    }
    else {
      // Add row: add to all tracking sets/arrays (ensure uniqueness)
      newSelectedRows.add(index);
      newSelectedRowIds.add(row.WorkOrderNumber);
      // Only add if not already in objects array (double-check uniqueness)
      if (!newSelectedRowObjects.some(obj => obj.WorkOrderNumber === row.WorkOrderNumber)) {
        newSelectedRowObjects.push(row);
      }
      console.log('Added row:', row.WorkOrderNumber);
    }
    // Update all state
    setSelectedRows(newSelectedRows);
    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(newSelectedRowObjects);
    console.log('Selected row objects after click:', newSelectedRowObjects);
    setRowTripId(Array.from(newSelectedRowIds));
    console.log('new set: ', Array.from(newSelectedRowIds)); // ✅ log directly
    console.log('Selected row IDs after click:', Array.from(newSelectedRowIds));
  };

  useEffect(() => {
    console.log("rowTripId updated:", rowTripId);
  }, [rowTripId]);

  // Configure the Create Trip button for the grid toolbar
  const gridConfigurableButtons: ConfigurableButtonConfig[] = [
    {
      label: " Create CIM/CUV Report",
      tooltipTitle: "Create a new CIM/CUV Report",
      showDropdown: false,
      tooltipPosition: "top" as const,
      onClick: () => {
        console.log('create-report');
        setApiStatus('loading');
        setTimeout(() => {   // Simulate manual API call delay
          // No redirection here right now.
          navigate('/create-report');
        }, 1000);
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

  const buildSearchCriteria: any = (latestFilters: any) => {
    const criteria: IReportCriteria = { ...CimReportSearchCriteria };
    // Set ScreenName based on createTripPlan parameter
    if (Object.keys(latestFilters).length > 0) {
      Object.entries(latestFilters).forEach(([key, value]): any => {
        const filter: any = value; // 👈 cast to any
        if (key === "WorkOrderDate") {
          // criteria.WorkOrderFrom = filter?.value?.from.replace(/-/g, "/");
          // criteria.WorkOrderTo = filter?.value?.to.replace(/-/g, "/");
        } else {
          // all other keys map directly
          criteria[key] = filter.value;
        }
      });
      return criteria;
    }
    return criteria;
  }

  const handleServerSideSearch = async () => {
    let latestFilters = filterService.applyGridFiltersSet();
    console.log('LatestFilters Trip log: ', latestFilters);
    console.log('buildSearchCriteria: ', buildSearchCriteria(latestFilters));
    const finalSearchCriteria = buildSearchCriteria(latestFilters);
    try {
      gridState.setLoading(true);
      setApiStatus('loading');
      const response: any = await CimCuvService.getCimCuvReportHub({
        searchCriteria: finalSearchCriteria
      });
      console.log('Server-side Search API Response:', response);
      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.CIMCUVReport;
      const { IsSuccess, Message } = response.data;
      if (!IsSuccess) {
        setApiStatus('error');
        gridState.setGridData([]);
        gridState.setLoading(false);
        toast({
          title: "Error!",
          description: Message,
          variant: 'destructive'
        });
        return;
      }
      if (!data || !Array.isArray(data)) {
        console.warn('API returned invalid data format:', response);
        gridState.setGridData([]);
        gridState.setLoading(false);
        setApiStatus('error');
        toast({
          title: "No Results",
          description: "No orders found matching your criteria",
        });
        return;
      }
      const processedData = data.map((row: any) => {
        const getStatusColorLocal = (status: string) => {
          const statusColors: Record<string, string> = {
            // Status column colors
            'Under Amendment': 'badge-orange rounded-2xl',
            'Confirmed': 'badge-green rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };
        return {
          ...row,
          CustomerID: pipedData(row.CustomerID, row.CustomerDescription),
          ContractID: pipedData(row.ContractID, row.ContractDescription),
          ConsignorID: pipedData(row.ConsignorID, row.ConsignorDescription),
          RouteID: pipedData(row.RouteID, row.RouteDescription),
          Departure: pipedData(row.Departure, row.DepartureDescription),
          Arrival: pipedData(row.Arrival, row.ArrivalDescription),
          Status: {
            value: row.Status,
            variant: getStatusColorLocal(row.Status),
          },
        };
      });
      gridState.setGridData(processedData);
      gridState.setLoading(false);
      setApiStatus('success');
      toast({
        title: "Success",
        description: `Found ${processedData.length} orders`,
      });
    } catch (error) {
      console.error('Server-side search failed:', error);
      gridState.setGridData([]);
      gridState.setLoading(false);
      setApiStatus('error');
      toast({
        title: "Error",
        description: "Failed to search orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
  // utils/fetchOptionsHelper.ts
  const makeLazyFetcher = (messageType: string, extraParams?: Record<string, any>) => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      // Merge standard params with any additional params supplied by caller
      const payload = {
        messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
        ...(extraParams),
      };

      const response: any = await quickOrderService.getMasterCommonData(payload);
      let parsed = JSON.parse(response?.data?.ResponseData || '[]');

      try {
        console.log('data: ', parsed);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (parsed?.error) {
          // Error case → handle gracefully
          console.error('API Error:', parsed.error.errorMessage);
          return [];
        }
      } catch (err) {
        console.error(`Failed to parse ResponseData for ${messageType}:`, err);
        return [];
      }
    };
  };

  const dynamicServerFilters: ServerFilter[] = [
    {
      key: 'Type',
      label: 'Type(CIM/CUV)',
      type: 'select',
      options: [
        { id: 'CIM', name: 'CIM', seqNo: 1 },
        { id: 'CUV', name: 'CUV', seqNo: 2 },
      ] as any[],
    },
    {
      key: 'CIMCUVID',
      label: 'CIM/CUV ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("CIMCUV NO Init"),
    },
    {
      key: 'Status',
      label: 'Status',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("CIM CUV Status Init"),
    },
    {
      key: 'ConsignorID',
      label: 'Consignor ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Consignor Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'ConsigneeID', label: 'Consignee ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Consignee Init")
    },
    {
      key: 'CustomerID', label: 'Customer ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Customer Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'ContractID', label: 'Contract ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Contract Init")
    },
    {
      key: 'UNCode', label: 'UN Code',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("UN Code Init")
    },
    {
      key: 'RouteID', label: 'Route ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Route ID Init")
    },
    {
      key: 'Departure', label: 'Departure',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Departure Init")
    },
    {
      key: 'Arrival', label: 'Arrival',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Arrival Init")
    },
    {
      key: 'LoadType', label: 'Load Type',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Load type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'SupplierID', label: 'Supplier',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Supplier Init")
    }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  return (
    <>
      <div className="min-h-screen main-bg">
        {/* Grid Container */}
        <div className={`rounded-lg mt-4 ${config.visible ? 'pb-4' : ''}`}>
          {/* Selected rows indicator */}
          {selectedRowObjects.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 mb-2">
              <div className="text-sm text-blue-700">
                <span className="font-medium">{selectedRowObjects.length}</span> row{selectedRowObjects.length !== 1 ? 's' : ''} selected
                <span className="ml-2 text-xs">
                  ({selectedRowObjects.map(row => row.WorkOrderNumber).join(', ')})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRows(new Set());
                  setSelectedRowIds(new Set());
                  setSelectedRowObjects([]);
                  setRowTripId([]);
                }}
                title="Clear row selection"
                className="h-6 w-6 p-0 bg-gray-50 hover:bg-gray-100 border border-blue-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

          )}
          <style>{`
            
             ${Array.from(selectedRowIds).map((rowId) => {
            return `
                tr[data-row-id="${rowId}"] {
                  background-color: #eff6ff !important;
                  border-left: 4px solid #3b82f6 !important;
                }
                tr[data-row-id="${rowId}"]:hover {
                  background-color: #dbeafe !important;
                }
              `;
          }).join('\n')}
          `}</style>
          {/* Load the grid only when preferences are loaded */}
          {isPreferencesLoaded ? (
            <SmartGridWithGrouping
              key={`grid-${gridState.forceUpdate}`}
              onPreferenceSave={handleGridPreferenceSave}
              columns={gridState.columns}
              data={gridState.gridData}
              groupableColumns={['OrderType', 'CustomerOrVendor', 'Status', 'Contract']}
              showGroupingDropdown={true}
              editableColumns={['plannedStartEndDateTime']}
              paginationMode="pagination"
              onLinkClick={handleLinkClick}
              onUpdate={handleUpdate}
              onSubRowToggle={gridState.handleSubRowToggle}
              selectedRows={selectedRows}
              onSelectionChange={handleRowSelection}
              onRowClick={handleRowClick}
              onSearch={handleServerSideSearch}
              onClearAll={clearAllFilters}
              // rowClassName={(row: any, index: number) =>
              //   selectedRows.has(index) ? 'smart-grid-row-selected' : ''
              // }
              rowClassName={(row: any, index: number) => {
                return selectedRowIds.has(row.WorkOrderNumber) ? 'selected' : '';
              }}
              nestedRowRenderer={renderSubRow}
              configurableButtons={gridConfigurableButtons}
              showDefaultConfigurableButton={false}
              gridTitle="CIM/CUV Report"
              recordCount={gridState.gridData.length}
              showCreateButton={true}
              searchPlaceholder="Search"
              clientSideSearch={true}
              showSubHeaders={false}
              hideAdvancedFilter={true}
              hideCheckboxToggle={true}
              serverFilters={dynamicServerFilters}
              showFilterTypeDropdown={false}
              showServersideFilter={showServersideFilter}
              onToggleServersideFilter={() => setShowServersideFilter(prev => !prev)}
              gridId={gridId}
              userId="current-user"
              api={filterService}
              serverFilterVisibleFields={serverFilterVisibleFields}
              serverFilterFieldOrder={serverFilterFieldOrder}
              onServerFilterPreferenceSave={handleServerFilterPreferenceSave}
            />
          ) : (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
              <div className="text-lg font-semibold text-blue-700">Loading...</div>
              <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
            </div>
          )}
        </div>
      </div>

      {/* Add a beautiful loading overlay when fetching data from API */}
      {apiStatus === 'loading' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
          <div className="text-lg font-semibold text-blue-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
        </div>
      )}

    </>
  );
};
