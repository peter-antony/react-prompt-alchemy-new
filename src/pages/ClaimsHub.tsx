import { useState, useEffect, useMemo } from "react";
import { SmartGridWithGrouping } from "@/components/SmartGrid";
import { GridColumnConfig, ServerFilter } from '@/types/smartgrid';
import { Ban, SquarePen, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { DraggableSubRow } from '@/components/SmartGrid/DraggableSubRow';
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { Breadcrumb } from '../components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFooterStore } from '@/stores/footerStore';
import { filterService, quickOrderService } from '@/api/services';
import { ClaimSearchCriteria, DEFAULT_CLAIM_SEARCH_CRITERIA } from "@/constants/claimSearchCriteria";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui/button";
import { ClaimService } from "@/api/services/ClaimService";
import { ClaimsHubAuditTrail } from "@/components/Claims/ClaimsHubAuditTrail";
import { ClaimsHubEditSave } from "@/components/Claims/ClaimsHubEditSave";
import TripPlanActionModal from "@/components/ManageTrip/TripPlanActionModal";

export const ClaimsHub = () => {
  const [searchParams] = useSearchParams();
  const createTripPlan = searchParams.get('id');
  const gridId = "claims-hub"; // same id you pass to SmartGridWithGrouping
  const { activeFilters } = useFilterStore();
  const filtersForThisGrid = activeFilters[gridId] || {};
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const gridState = useSmartGridState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditClaimNo, setAuditClaimNo] = useState<any | null>(null);
  const [selectedEditAndSaveRow, setSelectedEditAndSaveRow] = useState<any>(null);
  const [isClaimsEditOpen, setIsClaimsEditOpen] = useState(false);
  const [showServersideFilter, setShowServersideFilter] = useState<boolean>(false);

  // State for server filtering
  const [serverFilterVisibleFields, setServerFilterVisibleFields] = useState<string[]>([]); // Store the visible fields for server filtering
  const [serverFilterFieldOrder, setServerFilterFieldOrder] = useState<string[]>([]); // Store the field order for server filtering
  const [isServerFilterPersonalizationEmpty, setIsServerFilterPersonalizationEmpty] = useState(false); // Flag to check if server filter personalization is empty (Insert / Update)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [shortCloseModalOpen, setShortCloseModalOpen] = useState(false);

  const [fields, setFields] = useState([
    {
      type: "date",
      label: "Requested Date and Time",
      name: "date",
      placeholder: "Select Requested Date and Time",
      value: "",
      required: true,
      mappedName: 'Canceldatetime'
    },
    {
      type: "select",
      label: "Reason Code and Description",
      name: "ReasonCode",
      placeholder: "Enter Reason Code and Description",
      options: [],
      value: "",
      required: true,
      mappedName: 'ReasonCode'
    },
    {
      type: "text",
      label: "Remarks",
      name: "remarks",
      placeholder: "Enter Remarks",
      value: "",
      mappedName: 'Remarks'
    },
  ]);

  const handleFieldChange = (name, value) => {
    console.log('Field changed:', name, value);
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const cancelClaimsubmission = async (formFields: any) => {
    console.log("Cancel Trip Plan Submit:", formFields);
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for Cancel API:', mappedObj);
    const messageType = "Manage Trip Plan - cancel Trip";

    let payload = {
      "Header": {
        "ClaimNo": selectedRowObjects?.[0]?.ClaimNo,
        "ClaimStatus": "",
        "ClaimStatusDescription": "",
        "Reason": {
          "Cancel": {
            "ReasonCode": mappedObj.ReasonCode.split(' || ')[0] || "",
            "ReasonDescription": mappedObj.ReasonCode.split(' || ')[1] || "",
            "Remarks": mappedObj.Remarks || "",
            "RecordedDateTime": mappedObj.Canceldatetime || "",
            "ModeFlag": ""
          }
        }
      }
    }
    console.log("Payload:", payload);
    try {
      const response = await ClaimService.cancelClaim(payload);
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "Claim Cancelled",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
        // Refresh the grid data to show the updated trip status and close the modal
        setCancelModalOpen(false);
        await fetchClaims();
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "Claim Cancellation Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    }
  };

  const shortCloseClaimsubmission = async (formFields: any) => {
    console.log("Short Close Trip Plan Submit:", formFields);
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for Cancel API:', mappedObj);
    const messageType = "Manage Trip Plan - cancel Trip";

    let payload = {
      "Header": {
        "ClaimNo": selectedRowObjects?.[0]?.ClaimNo,
        "ClaimStatus": "",
        "ClaimStatusDescription": "",
        "Reason": {
          "ShortClosed": {
            "ReasonCode": mappedObj.ReasonCode.split(' || ')[0] || "",
            "ReasonDescription": mappedObj.ReasonCode.split(' || ')[1] || "",
            "Remarks": mappedObj.Remarks || "",
            "RecordedDateTime": mappedObj.Canceldatetime || "",
            "ModeFlag": "Insert"
          }
        }
      }
    }
    console.log("Payload:", payload);
    try {
      const response = await ClaimService.shortCloseClaim(payload);
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "Success",
          description: "Claim has been short closed successfully.",
          variant: "default",
        });
        // Refresh the grid data to show the updated trip status and close the modal
        setShortCloseModalOpen(false);
        await fetchClaims();
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "Error",
          description: "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    }
  };

  const handleGridPreferenceSave = async (preferences: any) => {
    try {
      // Get the latest preferences from localStorage to ensure we have the full state
      const storedPreferences = localStorage.getItem('smartgrid-preferences');
      const preferencesToSave = storedPreferences ? JSON.parse(storedPreferences) : preferences;

      console.log('Saving ClaimsHub SmartGrid preferences:', preferencesToSave);
      console.log('Preference ModeFlag:', preferenceModeFlag);

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ClaimsHub',
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
    console.log('ClaimsHub: handleServerFilterPreferenceSave called', { visibleFields, fieldOrder });
    try {
      const preferencesToSave = {
        visibleFields,
        fieldOrder
      };

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ClaimsHub',
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/", active: false },
    { label: "Manage Claims", active: true }
  ];

  // Initial column configuration for the grid
  const initialColumns: GridColumnConfig[] = [
    {
      key: "ClaimNo",
      label: "Claim No.",
      type: "Link",
      width: 180,
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      order: 1
    },
    {
      key: "Counterparty",
      label: "Type",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false,
      order: 2
    },
    {
      key: "ClaimDate",
      label: "Claim Date",
      type: "Date",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "ClaimCategory",
      label: "Claim Category",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "ClaimAmount", // This is formatted with Currency with ClaimAmount
      label: "Claim Amount",
      type: "CurrencyWithSymbol",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "ClaimStatus",
      label: "Status",
      type: "Badge",
      width: 30,
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "BusinessPartnerID", // This is formatted with BusinessPartnerID - BusinessPartnerName
      label: "Business Partner ID",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "RefDocType",
      label: "Ref. Doc. Type",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "RefDocNo",
      label: "Ref. Doc. No.",
      type: "Link",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'actions',
      label: 'Edit',
      type: 'ActionButton',
      sortable: false,
      editable: false,
      subRow: false,
      filterable: false,
      width: 50,
      actionButtons: [
        {
          icon: <SquarePen size={18} strokeWidth={1.2} />,
          tooltip: 'Edit Claim',
          onClick: async (rowData) => {
            console.log('clicked for:', rowData);
            if (rowData) {
              setSelectedEditAndSaveRow(rowData);
              setIsClaimsEditOpen(true);
            }
          },
          variant: 'ghost',
          size: 'lg',
        }
      ]
    },
    {
      key: "ActionResolution",
      label: "Action/Resolution",
      type: "Text",
      width: 70,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "Investigation",
      label: "Investigation",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "ActionResolutionRemark",
      label: "Remark for Action/Reslution",
      type: "Text",
      width: 100,
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "NoteType", // This needs to be formatted with NoteType - NoteNo
      label: "Note type/No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: "NoteDate",
      label: "Note Date",
      type: "Date",
      sortable: true,
      editable: false,
      subRow: false,
    },
    {
      key: "CommentRemark",
      label: "Comment / Remark",
      type: "Text",
      width: 50,
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "AdjustmentDocumentInvoiceNo",
      label: "Adjustment Document Invoice no",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "InvoiceAmount",
      label: "Invoice amount",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: "BalanceInvoiceAmount",
      label: "Balance invoice Amount",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Currency",
      label: "Currency",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "WBS",
      label: "WBS/Cost Center",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "CustomerOrderNo",
      label: "Customer Order No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "AssignedUser",
      label: "Assigned User",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "MatchingStatus",
      label: "Matching status",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ClaimantRefNo",
      label: "Claimant Ref. No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SupplierNoteNo",
      label: "Supplier Note No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "DraftBillNo",
      label: "Draft bill No.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "SecondaryRefNo",
      label: "Secondary ref no.",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Remark1",
      label: "Remark 1",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Remark2",
      label: "Remark 2",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "Remark3",
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
      key: "QCValue1",
      label: "QC Value 1",
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
      key: "QCValue2",
      label: "QC Value 2",
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
      key: "QCValue3",
      label: "QC Value 3",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "InitiatedBy",
      label: "Initiated by",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ExpectedDocument",
      label: "Expected document",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
    {
      key: "ForwardisFinancialAction",
      label: "Forwardis Financial action",
      type: "Text",
      sortable: true,
      editable: false,
      subRow: true,
    },
  ];

  const pipedData = (id: any, desc: any) => {
    if (id && desc) return `${id} || ${desc}`;
    return id || desc || '-';
  }

  // Fetch claims data from the API
  const fetchClaims = async () => {
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
      const response: any = await ClaimService.getClaimsHubSearch({ searchCriteria });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse.ResultSet;
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
            'Released': 'badge-fresh-green rounded-2xl',
            'Executed': 'badge-purple rounded-2xl',
            'Open': 'badge-blue rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Rejected': 'badge-red rounded-2xl',
            'Approved': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Completed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
            'Under Revision': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'In Progress': 'badge-orange rounded-2xl',
            'Processed': 'badge-blue rounded-2xl',
            'Claim Initiated': 'badge-fresh-green rounded-2xl',
            'Draft': 'badge-orange rounded-2xl',
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };
        return {
          ...row,
          ClaimStatus: {
            value: row.ClaimStatus,
            variant: getStatusColorLocal(row.ClaimStatus),
          },
          BusinessPartnerID: pipedData(row.BusinessPartnerID, row.BusinessPartnerName),
          NoteType: pipedData(row.NoteType, row.NoteNo)
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
          ScreenName: 'ClaimsHub',
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
        console.log('ClaimsHub: Fetching server-side filter personalization...');
        try {
          const serverFilterPersonalizationResponse: any = await quickOrderService.getPersonalization({
            LevelType: 'User',
            // LevelKey: 'ramcouser',
            ScreenName: 'ClaimsHub',
            ComponentName: 'smartgrid-serverside-filtersearch-preferences'
          });
          console.log('ClaimsHub: Server-side filter personalization response:', serverFilterPersonalizationResponse);

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

      // Call fetchClaims AFTER personalization is loaded (or failed)
      fetchClaims();
    };

    init();
    // fetchClaims();
  }, []); // Add dependencies if needed

  // Initialize columns and processed data in the grid state
  // useEffect(() => {
  //   console.log('Initializing columns and data in GridDemo');
  //   gridState.setColumns(initialColumns);
  //   gridState.setGridData(processedData);
  // }, [processedData]);
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
      if (selectedRowIds.has(row.ClaimNo)) {
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
      pageName: 'Claims_Hub',
      leftButtons: [],
      rightButtons: [
        {
          label: "Short Close",
          type: 'Button',
          disabled: selectedRowObjects.length !== 1, // <-- Enable if at least one row is selected
          onClick: () => {
            console.log('Short Close clicked');
            setShortCloseModalOpen(true);
          },
        },
        {
          label: "Cancel",
          type: 'Button',
          disabled: selectedRowObjects.length !== 1, // <-- Enable if at least one row is selected
          onClick: () => {
            console.log("Cancel clicked");
            setCancelModalOpen(true);
            // setPopupOpen(true);
          }
        },
        {
          label: "Audit Trail",
          type: 'Button',
          // disabled: selectedRowObjects.length !== 1, // <-- Enable if exactly one row is selected
          disabled: true, // <-- Enable if exactly one row is selected
          onClick: () => {
            console.log("Audit Trail clicked");
            if (selectedRowObjects.length === 0) {
              toast({
                title: "Select Claim",
                description: "Please select a claim to view audit trail",
                variant: 'destructive'
              });
              return;
            }
            console.log("Selected Row Objects for Audit:", selectedRowObjects);
            const claimNo = selectedRowObjects[0] || null;
            setAuditClaimNo(claimNo);
            setIsAuditOpen(true);
          }
        }
      ],
    });
    return () => resetFooter();
  }, [setFooter, resetFooter, selectedRows, createTripPlan, toast]);

  const handleLinkClick = (value: any, columnKey: any) => {
    console.log("Link clicked:", value, columnKey);
    // console.log("createTripPlan: ", createTripPlan);
    if (columnKey === 'ClaimNo') {
      navigate(`/create-claim?id=${value.ClaimNo}`);
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
    console.log('Selected rows changed via checkbox (raw):', selectedRowIndices);
    const currentData = gridState.gridData.length > 0 ? gridState.gridData : [];

    // If nothing selected, clear all
    if (selectedRowIndices.size === 0) {
      setSelectedRows(new Set());
      setSelectedRowIds(new Set());
      setSelectedRowObjects([]);
      setRowTripId([]);
      console.log('Cleared selection via checkbox');
      return;
    }

    // Keep only the latest selected index (user expectation: latest replaces previous)
    const indicesArray = Array.from(selectedRowIndices);
    const lastIndex = indicesArray[indicesArray.length - 1];
    const row = currentData[lastIndex];
    if (!row) return;

    const newSelectedRows = new Set<number>([lastIndex]);
    const newSelectedRowIds = new Set<string>([row.ClaimNo]);
    const newSelectedRowObjects = [row];

    setSelectedRows(newSelectedRows);
    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(newSelectedRowObjects);
    setRowTripId(Array.from(newSelectedRowIds));
    console.log('Selected row objects (single):', newSelectedRowObjects);
    console.log('Selected row IDs (single):', Array.from(newSelectedRowIds));
  };

  const [rowTripId, setRowTripId] = useState<any>([]);
  const handleRowClick = (row: any, index: number) => {
    console.log('Row clicked:', row, index);
    // New behaviour: single selection — clicking a row selects it and clears previous selection.
    const isRowSelected = selectedRowIds.has(row.ClaimNo);

    if (isRowSelected) {
      // If clicked existing selection -> clear selection
      setSelectedRows(new Set());
      setSelectedRowIds(new Set());
      setSelectedRowObjects([]);
      setRowTripId([]);
      console.log('Cleared selection by clicking the same row:', row.ClaimNo);
      return;
    }

    // Otherwise select only this row (replace previous)
    const newSelectedRows = new Set<number>([index]);
    const newSelectedRowIds = new Set<string>([row.ClaimNo]);
    const newSelectedRowObjects = [row];

    setSelectedRows(newSelectedRows);
    setSelectedRowIds(newSelectedRowIds);
    setSelectedRowObjects(newSelectedRowObjects);
    setRowTripId(Array.from(newSelectedRowIds));
    console.log('Selected row (replaced previous):', row.ClaimNo);
  };

  useEffect(() => {
    console.log("rowTripId updated:", rowTripId);
  }, [rowTripId]);

  // Configure the Create Trip button for the grid toolbar
  const gridConfigurableButtons: ConfigurableButtonConfig[] = [
    {
      label: " New Claim",
      tooltipTitle: "Create a new Claim",
      showDropdown: false,
      tooltipPosition: "top" as const,
      onClick: () => {
        console.log('nav claim');
        // No redirection here right now.
        navigate('/create-claim');
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
    const criteria: ClaimSearchCriteria = { ...DEFAULT_CLAIM_SEARCH_CRITERIA };
    // Set ScreenName based on createTripPlan parameter
    if (Object.keys(latestFilters).length > 0) {
      Object.entries(latestFilters).forEach(([key, value]): any => {
        const filter: any = value; // 👈 cast to any
        if (key === "CustomerOrderDate") {
          criteria.CustomerOrderFromDate = filter?.value?.from.replace(/-/g, "/");
          criteria.CustomerOrderToDate = filter?.value?.to.replace(/-/g, "/");
        } else if (key === "IncidentDate") {
          criteria.IncidentDateFrom = filter?.value?.from.replace(/-/g, "/");
          criteria.IncidentDateTo = filter?.value?.to.replace(/-/g, "/");
        } else if (key === "ClaimDates") {
          criteria.ClaimDateFrom = filter?.value?.from.replace(/-/g, "/");
          criteria.ClaimDateTo = filter?.value?.to.replace(/-/g, "/");
        } else if (key === "ClaimStatus") {
          // Convert to array if it's a string
          criteria.ClaimStatus = Array.isArray(filter.value)
            ? filter.value
            : filter.value ? [filter.value] : [];
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

      const response: any = await ClaimService.getClaimsHubSearch({
        searchCriteria: finalSearchCriteria
      });

      console.log('Server-side Search API Response:', response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || '{}');
      const data = parsedResponse.ResultSet;

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
            'Released': 'badge-fresh-green rounded-2xl',
            'Executed': 'badge-purple rounded-2xl',
            'Open': 'badge-blue rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Rejected': 'badge-red rounded-2xl',
            'Approved': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Completed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
            'Under Revision': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'In Progress': 'badge-orange rounded-2xl',
            'Processed': 'badge-blue rounded-2xl',
            'Claim Initiated': 'badge-fresh-green rounded-2xl',
            'Draft': 'badge-orange rounded-2xl',
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
        };

        return {
          ...row,
          ClaimStatus: {
            value: row.ClaimStatus,
            variant: getStatusColorLocal(row.ClaimStatus),
          },
          BusinessPartnerID: pipedData(row.BusinessPartnerID, row.BusinessPartnerName),
          NoteType: pipedData(row.NoteType, row.NoteNo)
        };
      });

      // console.log('Processed Server-side Search Data:', processedData);

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

  useEffect(() => {
    const equipmentCategory = filtersForThisGrid['Type'];

    if (equipmentCategory) {
      console.log('Selected Equipment Category:', equipmentCategory);
      // here you can set local state or call any API you need
      // setSelectedEquipmentCategory(equipmentCategory);
    }
  }, [filtersForThisGrid]);

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
  const makeLazyFetcher1 = () => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      // Merge standard params with any additional params supplied by caller
      console.log('claimType:', selectedClaimType);
      console.log('selectedClaimCounterParty:', selectedClaimCounterParty);
      const payload = {
        messageType: selectedClaimType ? 'Claims Type OnSelect' : 'Claims Counter Party OnSelect',
        searchTerm: searchTerm || '',
        offset,
        limit,
        selectedClaimType: selectedClaimType || '',
        selectedClaimCounterParty: selectedClaimCounterParty || '',
        // ...(extraParams),
      };

      const response: any = await ClaimService.getMasterCommonData(payload);
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
        return [];
      }
    };
  };

  const dynamicServerFilters: ServerFilter[] = [
    {
      key: 'CustomerOrderNo',
      label: 'Customer Order No.',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("CustomerOrder Number Init")
    },
    {
      key: "CustomerOrderDate", label: "Customer Order Date", type: 'dateRange',
      // defaultValue: {
      //   // from: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
      //   // to: format(new Date(), 'yyyy-MM-dd')
      //   from: format(subMonths(new Date(), 1), "yyyy-MM-dd"), // 2 months back
      //   to: format(addMonths(new Date(), 2), "yyyy-MM-dd"),   // 1 month ahead
      // }
    },
    {
      key: 'ClaimStatus', label: 'Claim Status', type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim Status Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: "ClaimDate", label: "Claim Date", type: 'date' },
    {
      key: 'Type',
      label: 'Type',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Claim Type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'CounterParty',
      label: 'Counter Party',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Claims Counter Party Init"),
      hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'NoteNo',
      label: 'Credit Note No.',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Claim Credit Note No Init"),
      // hideSearch: true,
      // disableLazyLoading: true
    },
    {
      key: 'RefDocType',
      label: 'Ref. Doc. Type',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim Ref Doc Type Init"),
      hideSearch: true,
    },
    { key: 'RefDocNo', label: 'Ref. Doc. No.', type: 'text' },
    {
      key: 'ClaimCategory',
      label: 'Claim Category',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim Category Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'WBSNo',
      label: 'WBS No.',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("WBS Init"),
      hideSearch: true
    },
    {
      key: 'BusinessPartnerID',
      label: 'Business Partner ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher1(),
    },
    {
      key: 'ClaimLocationID',
      label: 'Claim Location ID',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Location Init"),
    },
    {
      key: 'ContractID',
      label: 'Contract ID',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Contract Init", { OrderType: 'Buy' })
    },
    {
      key: 'AssignedUser',
      label: 'Assigned User',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Createdby Init")
    },
    { key: 'NoteDate', label: 'Credit Note Date', type: 'date' },
    {
      key: 'ClaimantRefNo',
      label: 'Claimant Ref. No.',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher("Claiment Ref No Init")
    },
    {
      key: 'AdjustmentInvoiceNo',
      label: 'Adjustment Invoice No.',
      type: 'lazyselect', // lazy-loaded dropdown
      fetchOptions: makeLazyFetcher(""),
    },
    {
      key: 'IncidentDate', label: 'Incident Date', type: 'dateRange'
    },
    {
      key: 'Investigation',
      label: 'Investigation',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim Investigation Required Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'ClaimDates', label: 'Claim Date', type: 'dateRange'
    },
    {
      key: 'SupplierNoteNumber',
      label: 'Supplier Note Number',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim Supplier Note No Init"),
      hideSearch: true
    },
    {
      key: 'DraftBill',
      label: 'DraftBill',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim Draft Bill No Init")
    },
    {
      key: 'IncidentLocation',
      label: 'Incident Location',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Location Init")
    },
    {
      key: 'IncidentType',
      label: 'Incident type',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claim Incident Type Init"),
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: 'ClaimInitiatedBy',
      label: 'Claim Initiated by',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher("Claims Initiated by Init"),
      hideSearch: true
    },
    { key: 'CommentRemark', label: 'Comment / Remark', type: 'text' },
    { key: 'Remark1', label: 'Remark 1', type: 'text' },
    { key: 'Remark2', label: 'Remark 2', type: 'text' },
    { key: 'Remark3', label: 'Remark 3', type: 'text' },
    {
      key: 'QC1',
      label: 'QC1',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Claim QC1 Init'),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: 'QCValue1', label: 'QC Value 1', type: 'text' },
    {
      key: 'QC2',
      label: 'QC2',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Claim QC2 Init'),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: 'QCValue2', label: 'QC Value 2', type: 'text' },
    {
      key: 'QC3',
      label: 'QC3',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Claim QC3 Init'),
      hideSearch: true,
      disableLazyLoading: true
    },
    { key: 'QCValue3', label: 'QC Value 3', type: 'text' },
    {
      key: 'ActionResolution',
      label: 'Action/Resolution',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Claims Action/Resolution Init'),
      hideSearch: true
    },
    { key: 'SecondaryRefNo', label: 'Secondary ref no', type: 'text' },
    {
      key: 'InitiatedBy',
      label: 'Initiated by',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Claims Initiated by Init'),
      hideSearch: true
    },
    {
      key: 'ForwardIsFinancialAction',
      label: 'Forwardis Financial action',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Claims Forwardis Financial Action Init'),
      hideSearch: true
    },
    {
      key: 'ExpectedDocument',
      label: 'Expected document',
      type: 'lazyselect',
      fetchOptions: makeLazyFetcher('Claims Expected Document Init'),
      hideSearch: true
    }
  ];

  const clearAllFilters = async () => {
    console.log('Clear all filters');
  }

  const [selectedClaimType, setSelectedClaimType] = useState<string | null>("");
  const [selectedClaimCounterParty, setSelectedClaimCounterParty] = useState<string | null>("");

  // this is called whenever any serverside filter (including EquipmentCategory) changes
  const handleServerFiltersChange = (filters: Record<string, any>) => {
    const claimTypeFilter = filters['Type'];
    const claimCounterPartyFilter = filters['CounterParty'];

    // Filters from ServersideFilter are usually { value, operator }
    const type = claimTypeFilter && typeof claimTypeFilter === 'object' ? claimTypeFilter.value : claimTypeFilter;
    const counterParty = claimCounterPartyFilter && typeof claimCounterPartyFilter === 'object' ? claimCounterPartyFilter.value : claimCounterPartyFilter;

    setSelectedClaimType(type || null);
    setSelectedClaimCounterParty(counterParty || null);
    // console.log('Serverside filters changed. Claim Type:', type, 'Counter Party:', counterParty);
  };

  const saveClaimFieldsFromSidedraw = async (data: any) => {
    console.log('Data received from sidedraw to save:', data);
    const Payload = {
      ClaimNo: data.ClaimNo,
      ClaimantRefNo: data.ClaimantRefNo,
      SecondaryRefNo: data.SecondaryRefNo
    };

    try {
      const response = await ClaimService.claimHubSmartEdit(Payload);
      const responseDataString = response?.data?.ResponseData;
      if (!responseDataString) return;
      if(response?.data?.IsSuccess) {
        setIsClaimsEditOpen(false);
        fetchClaims(); // Refresh the grid data
        toast({
        title: "Success",
        description: `Claim fields updated successfully`,
      });
      }
    }
    catch (error) {
      console.error('Error saving claim fields from sidedraw:', error);
    }
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
              {selectedRowObjects.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 mb-2">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">{selectedRowObjects.length}</span> row{selectedRowObjects.length !== 1 ? 's' : ''} selected
                    <span className="ml-2 text-xs">
                      ({selectedRowObjects.map(row => row.ClaimNo).join(', ')})
                    </span>
                  </div>
                  {/* Right section - clear icon */}
                  {/* <button
                    onClick={() => {
                      setSelectedRows(new Set());
                      setSelectedRowIds(new Set());
                      setSelectedRowObjects([]);
                      setRowTripId([]);
                      // If you also want to clear filters from Zustand:
                      // clearAllFilters("trip-hub");
                    }}
                    className="transform -translate-y-1/2 h-6 w-6 p-0 bg-gray-50 hover:bg-gray-100"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button> */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRows(new Set());
                      setSelectedRowIds(new Set());
                      setSelectedRowObjects([]);
                      setRowTripId([]);
                      // If you also want to clear filters from Zustand:
                      // clearAllFilters("trip-hub");
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
                  onFiltersChange={handleServerFiltersChange}
                  onSearch={handleServerSideSearch}
                  onClearAll={clearAllFilters}
                  // rowClassName={(row: any, index: number) =>
                  //   selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                  // }
                  rowClassName={(row: any, index: number) => {
                    return selectedRowIds.has(row.ClaimNo) ? 'selected' : '';
                  }}
                  nestedRowRenderer={renderSubRow}
                  configurableButtons={gridConfigurableButtons}
                  showDefaultConfigurableButton={false}
                  gridTitle="Manage Claims"
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
        </div>
      </AppLayout>

      {/* Audit Trail Side Drawer */}
      <ClaimsHubAuditTrail
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditClaimObj={auditClaimNo}
      />

      {/* Claims Hub Edit Save Component */}
      <ClaimsHubEditSave
        isOpen={isClaimsEditOpen}
        onClose={() => setIsClaimsEditOpen(false)}
        rowEditData={selectedEditAndSaveRow}
        onSave={saveClaimFieldsFromSidedraw}
      />

      {/* New TripPlan Action Modals */}
      <TripPlanActionModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Claim"
        icon={<Ban className="w-4 h-4" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={cancelClaimsubmission}
        submitLabel="Cancel"
        actionType="cancel"
      />

      {/* New TripPlan Action Modals */}
      <TripPlanActionModal
        open={shortCloseModalOpen}
        onClose={() => setShortCloseModalOpen(false)}
        title="Short Close Claim"
        icon={<Ban className="w-4 h-4" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={shortCloseClaimsubmission}
        submitLabel="Short Close"
        actionType="short close"
      />

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
