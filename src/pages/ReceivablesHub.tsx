import { useState, useEffect } from "react";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { GridColumnConfig, ServerFilter } from '@/types/smartgrid';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from '../components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useFooterStore } from '@/stores/footerStore';
import { filterService, quickOrderService } from '@/api/services';
import { ReceivablesSearchCriteria, SearchCriteria } from "@/constants/receivablesSearchCriteria";
import { useFilterStore } from "@/stores/filterStore";
import { ReceivablesService } from "@/api/services/ReceivablesService";

export const ReceivablesHub = () => {
  const gridId = "receivables-hub"; // same id you pass to SmartGridWithGrouping
  const { activeFilters } = useFilterStore();
  const filtersForThisGrid = activeFilters[gridId] || {};
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);

  // State for server filtering
  const [serverFilterVisibleFields, setServerFilterVisibleFields] = useState<string[]>([]); // Store the visible fields for server filtering
  const [serverFilterFieldOrder, setServerFilterFieldOrder] = useState<string[]>([]); // Store the field order for server filtering
  const [serverFilterFieldLabels, setServerFilterFieldLabels] = useState<Record<string, string>>({}); // Store custom labels
  const [isServerFilterPersonalizationEmpty, setIsServerFilterPersonalizationEmpty] = useState(false); // Flag to check if server filter personalization is empty (Insert / Update)

  const handleGridPreferenceSave = async (preferences: any) => {
    try {
      // Get the latest preferences from localStorage to ensure we have the full state
      const storedPreferences = localStorage.getItem('smartgrid-preferences');
      const preferencesToSave = storedPreferences ? JSON.parse(storedPreferences) : preferences;

      console.log('Saving ReceivablesHub SmartGrid preferences:', preferencesToSave);
      console.log('Preference ModeFlag:', preferenceModeFlag);

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ReceivablesHub',
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

  const handleServerFilterPreferenceSave = async (visibleFields: string[], fieldOrder: string[], fieldLabels?: Record<string, string>) => {
    console.log('ClaimsHub: handleServerFilterPreferenceSave called', { visibleFields, fieldOrder, fieldLabels });
    try {
      const preferencesToSave = {
        visibleFields,
        fieldOrder,
        fieldLabels
      };

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ReceivablesHub',
        ComponentName: 'smartgrid-serverside-filtersearch-preferences',
        JsonData: preferencesToSave,
        IsActive: "1",
        ModeFlag: isServerFilterPersonalizationEmpty ? "Insert" : "Update"
      });

      const apiData = response?.data;

      if (apiData?.IsSuccess) {
        setServerFilterVisibleFields(visibleFields);
        setServerFilterFieldOrder(fieldOrder);
        if (fieldLabels) setServerFilterFieldLabels(fieldLabels);
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/", active: false },
    { label: "Receivables and Customer Credit Note Management", active: true }
  ];

  // Initial column configuration for the grid
  const initialColumns: GridColumnConfig[] = [
    {
      key: "Document_Type",
      label: "Document Type",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1
    },
    {
      key: "Invoice_Note_Number",
      label: "Invoice / Note Number",
      type: "Link",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false,
      order: 2
    },
    {
      key: "DocumentDate",
      label: "Document Date",
      type: "Date",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "BusinessPartnerID", // This is formatted with BusinessPartnerID - BusinessPartnerDescription
      label: "Business Partner",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Total_Amount_Exc_VAT",
      label: "Total Amount (Exc. VAT)",
      type: "CurrencyWithSymbol",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Currency",
      label: "Currency",
      type: "Text",
      width: 50,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Status",
      label: "Status",
      type: "Badge",
      width: 30,
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "WBS_Cost_Center",
      label: "WBS / Cost Center",
      type: "Text",
      width: 30,
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "Authorization_Date",
      label: "Authorization Date",
      type: "Date",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Contract_ID",
      label: "Contract ID",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Total_Amount_Incl_VAT", // This needs to be formatted with NoteType - NoteNo
      label: "Total Amount (Incl. VAT)",
      type: "CurrencyWithSymbol",
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Total_Amount_Excl_VAT_EUR",
      label: "Total Amount Excl. VAT (EUR)",
      type: "CurrencyWithSymbol",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "Country_Code",
      label: "Country Code",
      type: "Text",
      width: 50,
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "Payment_Date",
      label: "Payment Date",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "Remarks",
      label: "Remarks",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Balance_Amount",
      label: "Balance Amount",
      type: "CurrencyWithSymbol",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Adjustment_Doc",
      label: "Adjustment Doc",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Assigned_User",
      label: "Assigned User",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Preview",
      label: "Preview",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Transfer_Invoice_No",
      label: "Transfer Invoice No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Transfer_Date",
      label: "Transfer Date",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Financial_Year",
      label: "Financial Year",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Secondary_Ref_No",
      label: "Secondary Ref No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Remark_1",
      label: "Remark 1",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Remark_2",
      label: "Remark 2",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Remark_3",
      label: "Remark 3",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "QC1",
      label: "QC 1",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "QC2",
      label: "QC 2",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "QC3",
      label: "QC 3",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "QC_Value_1",
      label: "QC Value 1",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "QC_Value_2",
      label: "QC Value 2",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "QC_Value_3",
      label: "QC Value 3",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Due_Date",
      label: "Due Date",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    }
  ];

  // Helper function to format ID and Description
  const pipedData = (id: any, desc: any) => {
    if (id && desc) return `${id} || ${desc}`;
    return id || desc || '-';
  }

  // Status filtering state and helper
  const [fullData, setFullData] = useState<any[]>([]); // keep original data for client-side filtering
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());

  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Fetch status options from API (Receivables Status Init)
  const fetchStatusOptions = async (name?: string) => {
    try {
      const params: any = { messageType: 'Receivables Status Init', searchTerm: name || '', offset: 1, limit: 1000 };
      const resp: any = await ReceivablesService.getMasterCommonData(params);
      // Response likely contains ResponseData as JSON string
      let parsed: any = [];
      try {
        parsed = JSON.parse(resp?.data?.ResponseData || resp?.data?.ResponseData || '[]');
      } catch (err) {
        // If resp is already an object/array
        parsed = Array.isArray(resp) ? resp : resp?.data?.ResponseData || [];
      }

      if (Array.isArray(parsed)) {
        const names = parsed.map((p: any) => (p?.name)).filter(name => name && name !== "All");
        setStatusOptions(names);
        // Default-select 'Fresh' if available and no selection exists yet
        setSelectedStatuses(prev => {
          if ((prev && prev.size > 0) || !names.includes('Fresh')) return prev;
          return new Set(['Fresh']);
        });
        // Recompute counts if we already have data loaded
        if (fullData && fullData.length > 0) {
          const counts = fullData.reduce((acc: Record<string, number>, r: any) => {
            const key = (r?.Status?.value || r?.Status);
            if (!key) return acc;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
          setStatusCounts(counts);
        }
      } else {
        setStatusOptions([]);
      }
    } catch (error) {
      console.error('Failed to fetch status options:', error);
      setStatusOptions([]);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusColors: Record<string, string> = {
      'Fresh': 'badge-blue rounded-2xl',
      'Deleted': 'badge-red rounded-2xl',
      'Completed': 'badge-green rounded-2xl',
      'In Progress': 'badge-orange rounded-2xl',
      'Processed': 'badge-blue rounded-2xl',
      'Claim Initiated': 'badge-fresh-green rounded-2xl',
      'Authorized': 'badge-green rounded-2xl',
      'Paid': 'badge-fresh-green rounded-2xl',
      'Partly Paid': 'badge-purple rounded-2xl',
      'Held': 'badge-orange rounded-2xl',
      'Held Partly Paid': 'badge-orange rounded-2xl',
      'Returned': 'badge-orange rounded-2xl',
      'Reversed': 'badge-orange rounded-2xl',
      'Adjusted': 'badge-orange rounded-2xl',
      'Fully Adjusted': 'badge-orange rounded-2xl',
      'Partly Adjusted': 'badge-orange rounded-2xl',
      'Draft': 'badge-orange rounded-2xl',
      'Short Closed': 'badge-gray rounded-2xl',
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
  };

  const toggleStatus = (status: string) => {
    const next = new Set(selectedStatuses);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    setSelectedStatuses(next);
  };

  const clearStatusSelection = () => setSelectedStatuses(new Set());

  // Control whether to show status filter in view (configurable from this parent)
  const [showStatusFilterEnabled] = useState<boolean>(true);

  const selectedStatusesKey = Array.from(selectedStatuses).join('|');

  // Apply client-side filtering when status selection changes or when fullData updates
  useEffect(() => {
    if (!fullData || fullData.length === 0) return;
    if (selectedStatuses.size === 0) {
      gridState.setGridData(fullData);
      return;
    }
    const selectedArray = Array.from(selectedStatuses);
    const filtered = fullData.filter((row: any) => selectedArray.includes(row?.Status?.value));
    gridState.setGridData(filtered);
  }, [selectedStatusesKey, fullData]);

  // Fetch claims data from the API
  const fetchReceivables = async () => {
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
      const response: any = await ReceivablesService.getReceivablesHubSearch({ searchCriteria });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse.CustomerReceiveCreditReport;
      console.log("data: ", data);
      if (!data || !Array.isArray(data)) {
        setFullData([]);
        setStatusCounts({});
        gridState.setGridData([]);
        setApiStatus("error");
        return;
      }

      const processedData = data.map((row: any) => ({
        ...row,
        Status: {
          value: row.Status,
          variant: getStatusBadgeClass(row.Status),
        },
        BusinessPartnerID: pipedData(row.BusinessPartnerID, row.BusinessPartnerDescription),
        Contract_ID: pipedData(row.Contract_ID, row.Contract_Description)
      }));

      setFullData(processedData);
      gridState.setGridData(processedData);
      // compute and store status counts from this payload
      const counts = processedData.reduce((acc: Record<string, number>, r: any) => {
        const key = (r?.Status?.value || r?.Status);
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      setStatusCounts(counts);
      setApiStatus("success");
    } catch (error) {
      console.error("Fetch trips failed:", error);
      setFullData([]);
      setStatusCounts({});
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
          ScreenName: 'ReceivablesHub',
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
              console.log('ClaimsHub SmartGrid Personalization data set to localStorage:', personalizationData.JsonData);
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
        console.log('ReceivablesHub: Fetching server-side filter personalization...');
        try {
          const serverFilterPersonalizationResponse: any = await quickOrderService.getPersonalization({
            LevelType: 'User',
            // LevelKey: 'ramcouser',
            ScreenName: 'ReceivablesHub',
            ComponentName: 'smartgrid-serverside-filtersearch-preferences'
          });
          console.log('ReceivablesHub: Server-side filter personalization response:', serverFilterPersonalizationResponse);

          let isServerFilterEmpty = true;
          if (serverFilterPersonalizationResponse?.data?.ResponseData) {
            const parsed = JSON.parse(serverFilterPersonalizationResponse.data.ResponseData);
            if (parsed?.PersonalizationResult && parsed.PersonalizationResult.length > 0) {
              isServerFilterEmpty = false;
              const data = parsed.PersonalizationResult[0].JsonData;
              if (data) {
                if (data.visibleFields) setServerFilterVisibleFields(data.visibleFields);
                if (data.fieldOrder) setServerFilterFieldOrder(data.fieldOrder);
                if (data.fieldLabels) setServerFilterFieldLabels(data.fieldLabels);
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

      // Call fetchReceivables AFTER personalization is loaded (or failed)
      fetchReceivables();
    };

    init();
  }, []);

  // Fetch status options on mount
  useEffect(() => {
    fetchStatusOptions();
  }, []);

  useEffect(() => {
    setFooter({
      visible: true,
      pageName: 'Receivables_Hub',
      leftButtons: [],
      rightButtons: [
        {
          label: "Save",
          type: 'Button',
          onClick: () => {
            console.log('Save clicked');
          },
        }
      ],
    });
    return () => resetFooter();
  }, [setFooter, resetFooter, toast]);

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    // if (columnKey === 'ClaimNo') {
    //   navigate(`/create-claim?id=${value.ClaimNo}`);
    // }
  };

  const handleUpdate = async (updatedRow: any) => {
    console.log("Updating row:", updatedRow);
    gridState.setGridData((prev) =>
      prev.map((row, index) =>
        index === updatedRow.index ? { ...row, ...updatedRow } : row
      )
    );
  };

  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    console.log('Selected rows changed via checkbox (raw):', selectedRowIndices);
  };

  const handleRowClick = (row: any, index: number) => {
    console.log('Row clicked:', row, index);
  };

  // Configure the Create Trip button for the grid toolbar
  const gridConfigurableButtons: ConfigurableButtonConfig[] = [
    // {
    //   label: " New Claim",
    //   tooltipTitle: "Create a new Claim",
    //   showDropdown: false,
    //   tooltipPosition: "top" as const,
    //   onClick: () => {
    //     console.log('nav claim');
    //     // No redirection here right now.
    //     navigate('/create-claim');
    //   }
    // }
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
    const criteria: SearchCriteria = { ...ReceivablesSearchCriteria };
    // Set ScreenName based on parameter
    if (Object.keys(latestFilters).length > 0) {
      Object.entries(latestFilters).forEach(([key, value]): any => {
        const filter: any = value; // 👈 cast to any
        if (key === "DocumentsDate") {
          criteria.DocumentsFromDate = filter?.value?.from.replace(/-/g, "/");
          criteria.DocumentsToDate = filter?.value?.to.replace(/-/g, "/");
        } else if (key === "TransferInvoiceDate") {
          criteria.TransferInvoiceFromDate = filter?.value?.from.replace(/-/g, "/");
          criteria.TransferInvoiceToDate = filter?.value?.to.replace(/-/g, "/");
        } else if (key === "AuthorizationDate") {
          criteria.AuthorizationFromDate = filter?.value?.from.replace(/-/g, "/");
          criteria.AuthorizationToDate = filter?.value?.to.replace(/-/g, "/");
        } else if (key === "PaymentDate") {
          criteria.PaymentFromDate = filter?.value?.from.replace(/-/g, "/");
          criteria.PaymentToDate = filter?.value?.to.replace(/-/g, "/");
        } else if (key === "DueDate") {
          criteria.DueFromDate = filter?.value?.from.replace(/-/g, "/");
          criteria.DueToDate = filter?.value?.to.replace(/-/g, "/");
        } 
        // else if (key === "ClaimStatus") {
        //   // Convert to array if it's a string
        //   criteria.ClaimStatus = Array.isArray(filter.value)
        //     ? filter.value
        //     : filter.value ? [filter.value] : [];
        // } 
        else {
        // all other keys map directly
        criteria[key] = filter.value;
        }
      });
      return criteria;
    }
    return criteria;
  }

  const handleServerSideSearch = async () => {
    // // console.log("Server-side search with filters:", filterService.applyGridFiltersSet());
    let latestFilters = filterService.applyGridFiltersSet();
    // if (Object.keys(latestFilters).length == 0) {
    //   return;
    // }
    console.log('LatestFilters Trip log: ', latestFilters);
    console.log('buildSearchCriteria: ', buildSearchCriteria(latestFilters));
    // const plannedDate = latestFilters["OrderDate"];
    // if (!plannedDate?.value?.from || !plannedDate?.value?.to) {
    //   toast({
    //     title: "Planned Execution Date Range",
    //     description: "Please select a Planned Execution Date before searching.",
    //     variant: "destructive", // 👈 makes it red/error style
    //   });
    //   return;
    // }
    const finalSearchCriteria = buildSearchCriteria(latestFilters);
    try {
      gridState.setLoading(true);
      setApiStatus('loading');
      const response: any = await ReceivablesService.getReceivablesHubSearch({
        searchCriteria: finalSearchCriteria
      });

      console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.CustomerReceiveCreditReport;

      const { IsSuccess, Message } = response.data;

      if (!IsSuccess) {
        setFullData([]);
        setStatusCounts({});
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
        setFullData([]);
        setStatusCounts({});
        gridState.setGridData([]);
        gridState.setLoading(false);
        setApiStatus('error');
        toast({
          title: "No Results",
          description: "No orders found matching your criteria",
        });
        return;
      }

      const processedData = data.map((row: any) => ({
        ...row,
        Status: {
          value: row.Status,
          variant: getStatusBadgeClass(row.Status),
        },
        BusinessPartnerID: pipedData(row.BusinessPartnerID, row.BusinessPartnerDescription),
        Contract_ID: pipedData(row.Contract_ID, row.Contract_Description)
      }));
      // console.log('Processed Server-side Search Data:', processedData);

      setFullData(processedData);
      gridState.setGridData(processedData);
      // compute and set status counts from server search result
      const counts = processedData.reduce((acc: Record<string, number>, r: any) => {
        const key = (r?.Status?.value || r?.Status);
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      setStatusCounts(counts);
      gridState.setLoading(false);
      setApiStatus('success');

      toast({
        title: "Success",
        description: `Found ${processedData.length} orders`,
      });

    } catch (error) {
      console.error('Server-side search failed:', error);
      setFullData([]);
      setStatusCounts({});
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
      key: 'DocumentNumber',
      label: 'Documnent Number',
      type: 'text'
    },
    {
      key: 'DocumentType',
      label: 'Document Type',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Receivables Document Type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'WBSNumber',
      label: 'WBS Number',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("WBS Init")
    },
    {
      key: "DocumentsDate", label: "Document's Date", type: 'dateRange',
      // defaultValue: {
      //   // from: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
      //   // to: format(new Date(), 'yyyy-MM-dd')
      //   from: format(subMonths(new Date(), 1), "yyyy-MM-dd"), // 2 months back
      //   to: format(addMonths(new Date(), 2), "yyyy-MM-dd"),   // 1 month ahead
      // }
    },
    {
      key: 'PurchaseOrderNumber',
      label: 'Purchase Order Number',
      type: 'text'
    },
    {
      key: 'ClaimNumber',
      label: 'Claim Number',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim No Init")
    },
    {
      key: 'DraftBillNumber',
      label: 'Draft Bill Number',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Draft Bill No Init")
    },
    {
      key: 'CustomerOrderNo',
      label: 'Customer Order No.',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("CustomerOrder Number Init")
    },
    {
      key: 'CustomerID',
      label: 'Customer ID/ Name',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Customer Init")
    },
    {
      key: "CustomerRefDocNo",
      label: "Customer Ref. Doc. No.",
      type: 'text'
    },
    {
      key: "CreditNoteCategory",
      label: "Credit Note Category",
      type: 'text'
    },
    {
      key: "TotalAmountExcVATRange",
      label: "Total Amount (Exc. VAT)",
      type: 'numberRange'
    },
    {
      key: "TransferInvoiceNumber",
      label: "Transfer Invoice Number",
      type: 'text'
    },
    {
      key: "TransferInvoiceDate",
      label: "Transfer Invoice Date",
      type: 'dateRange'
    },
    {
      key: "AuthorizationDate",
      label: "Authorization Date",
      type: 'dateRange'
    },
    {
      key: "PaymentDate",
      label: "Payment Date",
      type: 'dateRange'
    },
    {
      key: "RefDocID",
      label: "Ref Doc ID",
      type: 'text'
    },
    {
      key: 'Currency',
      label: 'Currency',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Currency Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'User',
      label: 'User',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Createdby Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'AssignedUser',
      label: 'Assigned User',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Createdby Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'FinancialYear',
      label: 'Financial Year',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Financial Year Init"),
      hideSearch: true,
    },
    {
      key: 'ContractID',
      label: 'Contract ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Contract Init"),
      multiSelect: true
    },
    {
      key: 'QC1',
      label: 'QC1',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Receivables QC1 Init"),
      hideSearch: true
    },
    { key: 'QCValue1', label: 'QC Value 1', type: 'text' },
    {
      key: 'QC2',
      label: 'QC2',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Receivables QC2 Init"),
      hideSearch: true
    },
    { key: 'QCValue2', label: 'QC Value 2', type: 'text' },
    {
      key: 'QC3',
      label: 'QC3',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Receivables QC3 Init"),
      hideSearch: true
    },
    { key: 'QCValue3', label: 'QC Value 3', type: 'text' },
    { key: 'SecondaryRefNo', label: 'Secondary Ref. No.', type: 'text' },
    {
      key: 'DueDate',
      label: 'Due Date',
      type: 'dateRange'
    }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  // this is called whenever any serverside filter (including EquipmentCategory) changes
  const handleServerFiltersChange = (filters: Record<string, any>) => {
    const claimTypeFilter = filters['Type'];
    const claimCounterPartyFilter = filters['CounterParty'];
    console.log('Server filters changed:', filters);
  };

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
              {/* Selected rows indicator */}
              {/* Load the grid only when preferences are loaded */}
              {isPreferencesLoaded ? (
                <SmartGridWithGrouping
                  key={`grid-${gridState.forceUpdate}`}
                  onPreferenceSave={handleGridPreferenceSave}
                  columns={gridState.columns}
                  data={gridState.gridData}
                  groupableColumns={[]}
                  showGroupingDropdown={true}
                  editableColumns={[]}
                  paginationMode="pagination"
                  onLinkClick={handleLinkClick}
                  onUpdate={handleUpdate}
                  onSubRowToggle={gridState.handleSubRowToggle}
                  // selectedRows={selectedRows}
                  onSelectionChange={handleRowSelection}
                  onRowClick={handleRowClick}
                  onFiltersChange={handleServerFiltersChange}
                  onSearch={handleServerSideSearch}
                  onClearAll={clearAllFilters}
                  // rowClassName={(row: any, index: number) =>
                  //   selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                  // }
                  // rowClassName={(row: any, index: number) => {
                  //   return selectedRowIds.has(row.ClaimNo) ? 'selected' : '';
                  // }}
                  nestedRowRenderer={renderSubRow}
                  configurableButtons={gridConfigurableButtons}
                  showDefaultConfigurableButton={false}
                  gridTitle="Receivables and Customer Credit Note"
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
                  serverFilterFieldLabels={serverFilterFieldLabels}
                  onServerFilterPreferenceSave={handleServerFilterPreferenceSave}
                  // Status filter configuration (rendered inside SmartGrid below server-side filter)
                  showStatusFilter={showStatusFilterEnabled}
                  statusOptions={statusOptions}
                  selectedStatuses={Array.from(selectedStatuses)}
                  onToggleStatus={(s: string) => toggleStatus(s)}
                  onClearStatusSelection={clearStatusSelection}
                  statusCounts={statusCounts}
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
        </div>
      </AppLayout>

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
