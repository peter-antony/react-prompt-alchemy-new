import { useState, useEffect, useRef, useMemo } from "react";
import { X, Trash2, FileText, UserPlus, Info, Bookmark, ChevronLeft, Expand, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel";
import { splitInputDropdownValue, combineInputDropdownValue, InputDropdownValue } from "@/utils/inputDropdown";
import { draftBillService } from "@/api/services/DraftBillService";
import { AlertCircle, Workflow, FileSearchIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { quickOrderService } from "@/api/services";
import { DraftBillAuditTrail } from "./DraftBillAuditTrail";
import CancelConfirmationModal from '../Template/CancelConfirmationModal';

interface DraftBillDetailsSideDrawProps {
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  initialConsignorData?: any;
  initialConsigneeData?: any;
  lineItems: any[]; // Array of line items from the API response
  // onSave: (payload: any) => void;
  headerData: any; // Header data for the Static Display and Summary panels
  isLoading?: boolean; // Loading state while fetching data
}

const fetchMaster = (
  messageType: string,
  extraParams?: Record<string, any>
) => {
  return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      const response = await quickOrderService.getMasterCommonData({
        messageType,
        searchTerm: searchTerm || "",
        offset,
        limit,
        ...(extraParams || {}),
      });

      const rr: any = response?.data;
      const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

      return arr.map((item: any) => {
        const id = item.id ?? item.ID ?? item.value ?? "";
        const name = item.name ?? item.Name ?? item.label ?? "";
        return {
          label: `${id} || ${name}`,
          value: `${id} || ${name}`,
        };
      });
    } catch (err) {
      console.error(`Error fetching ${messageType}:`, err);
      return [];
    }
  };
};

const BasicDetailsPanelConfig: PanelConfig = {
  quantity: {
    id: "quantity",
    label: "Quantity",
    fieldType: "inputdropdown",
    value: "",
    mandatory: true,
    visible: true,
    editable: true,
    order: 1,
    width: "four",
    placeholder: "",
    options: [{ value: "TON", label: "TON" }], // Placeholder, replace with actual units
  },
  rate: {
    id: "rate",
    label: "Rate",
    fieldType: "inputdropdown",
    value: "",
    mandatory: true,
    visible: true,
    editable: true,
    order: 2,
    width: "four",
    placeholder: "",
    options: [{ value: "EUR", label: "€" }], // Placeholder, replace with actual currency
  },
  acceptedValue: {
    id: "acceptedValue",
    label: "Accepted Value",
    fieldType: "inputdropdown",
    value: "",
    mandatory: true,
    visible: true,
    editable: true,
    order: 3,
    width: "four",
    placeholder: "",
    options: [{ value: "EUR", label: "€" }], // Placeholder, replace with actual currency
  },
  userAssigned: {
    id: "userAssigned",
    label: "User Assigned",
    fieldType: "lazyselect",
    value: "",
    mandatory: true,
    visible: true,
    editable: true,
    order: 4,
    width: "four",
    placeholder: "",
    fetchOptions: fetchMaster('Createdby Init'),
    // fetchOptions: () => Promise.resolve([]), // Placeholder, implement actual fetch options

  },
  remarks: {
    id: "remarks",
    label: "Remarks",
    fieldType: "textarea",
    value: "",
    mandatory: false,
    visible: true,
    editable: true,
    order: 5,
    width: "half",
    placeholder: "Enter Remarks",
  },
  remarksForUserAssigned: {
    id: "remarksForUserAssigned",
    label: "Remarks for User Assigned",
    fieldType: "textarea",
    value: "",
    mandatory: false,
    visible: true,
    editable: true,
    order: 6,
    width: "half",
    placeholder: "",
  },
};


const DraftBillDetailsSideDraw: React.FC<DraftBillDetailsSideDrawProps> = ({
  isOpen,
  width,
  onClose,
  lineItems,
  // onSave,
  headerData,
  initialConsignorData,
  initialConsigneeData,
  isLoading = false
}) => {
  const [activeLine, setActiveLine] = useState<any | null>(null);
  const basicDetailsPanelRef = useRef<DynamicPanelRef>(null);
  const otherDetailsPanelRef = useRef<DynamicPanelRef>(null);
  const { toast } = useToast();
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  // Local state to manage lineItems and headerData (can be updated after refresh)
  const [localLineItems, setLocalLineItems] = useState<any[]>(lineItems);
  const [localHeaderData, setLocalHeaderData] = useState<any>(headerData);
  
  // Update local state when props change
  useEffect(() => {
    setLocalLineItems(lineItems);
    setLocalHeaderData(headerData);
  }, [lineItems, headerData]);

  // Expansion State
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isBasicDetailsExpanded, setIsBasicDetailsExpanded] = useState(true);
  const [isOtherDetailsExpanded, setIsOtherDetailsExpanded] = useState(true);

  const isAllExpanded = isSummaryExpanded && isBasicDetailsExpanded && isOtherDetailsExpanded;

  const handleToggleExpandAll = () => {
    const newState = !isAllExpanded;
    setIsSummaryExpanded(newState);
    setIsBasicDetailsExpanded(newState);
    setIsOtherDetailsExpanded(newState);
  };

  // Mapping function: Convert activeLine data to BasicDetails form fields
  const mapActiveLineToBasicDetails = (line: any): Record<string, any> => {
    if (!line) return {};

    const basicDetails = line.BasicDetails || {};

    console.log("=== Mapping BasicDetails ===");
    console.log("line object:", line);
    console.log("basicDetails object:", basicDetails);
    console.log("line object keys:", Object.keys(line));

    // Helper function to get Quantity field (checking multiple possible field names)
    const getQuantityField = () => {
      const quantity = basicDetails.Quantity || basicDetails.QTY || line.Quantity || line.QTY || '';
      const quantityUOM = basicDetails.QuantityUOM || basicDetails.UOM || line.QuantityUOM || line.UOM || 'TON';

      console.log("Quantity - quantity:", quantity, "quantityUOM:", quantityUOM);

      if (quantity) {
        if (typeof quantity === 'string' && quantity.includes('-')) {
          // If it's a combined string like "10-TON", split it
          return splitInputDropdownValue(quantity);
        } else {
          // Return as object with dropdown and input
          return {
            input: quantity || '',
            dropdown: quantityUOM
          };
        }
      }
      return { input: '', dropdown: 'TON' };
    };



    // Helper function to get Rate field (checking multiple possible field names)
    const getRateField = () => {
      const rate = basicDetails.Rate || line.Rate || '';
      const rateCurrency = basicDetails.RateCurrency || basicDetails.BillingCurrency || line.RateCurrency || line.BillingCurrency || 'EUR';

      console.log("Rate - rate:", rate, "rateCurrency:", rateCurrency);

      if (rate) {
        if (typeof rate === 'string' && rate.includes('-')) {
          // If it's a combined string like "100-EUR", split it
          return splitInputDropdownValue(rate);
        } else {
          // Return as object with dropdown and input
          return {
            input: rate || '',
            dropdown: rateCurrency || ''
          };
        }
      }
      return { input: '', dropdown: '' };
    };

    // Helper function to get AcceptedValue field (checking multiple possible field names)
    const getAcceptedValueField = () => {
      const acceptedValue = basicDetails.AcceptedValue || line.AcceptedValue || '';
      const acceptedValueCurrency = basicDetails.AcceptedValueCurrency || basicDetails.BillingCurrency || line.AcceptedValueCurrency || line.BillingCurrency || 'EUR';

      console.log("AcceptedValue - acceptedValue:", acceptedValue, "acceptedValueCurrency:", acceptedValueCurrency);

      if (acceptedValue) {
        if (typeof acceptedValue === 'string' && acceptedValue.includes('-')) {
          // If it's a combined string like "1000-EUR", split it
          return splitInputDropdownValue(acceptedValue);
        } else {
          // Return as object with dropdown and input
          return {
            input: acceptedValue || '',
            dropdown: acceptedValueCurrency || ''
          };
        }
      }
      return { input: '', dropdown: '' };
    };

    // Helper function to get UserAssigned field (checking multiple possible field names)
    const getUserAssignedField = () => {
      const userAssigned = basicDetails.UserAssigned ||
        basicDetails.UserAssignedID ||
        line.UserAssigned ||
        line.UserAssignedID ||
        '';

      console.log("UserAssigned - value:", userAssigned);

      return userAssigned;
    };

    // Helper function to get Remarks field (checking multiple possible field names)
    const getRemarksField = () => {
      const remarks = basicDetails.Remarks ||
        basicDetails.Remark ||
        line.Remarks ||
        line.Remark ||
        '';

      console.log("Remarks - value:", remarks);

      return remarks;
    };

    // Helper function to get RemarksForUserAssigned field (checking multiple possible field names)
    const getRemarksForUserAssignedField = () => {
      const remarksForUserAssigned = basicDetails.RemarksForUserAssigned ||
        basicDetails.RemarkForAssignedUser ||
        line.RemarksForUserAssigned ||
        line.RemarkForAssignedUser ||
        '';

      console.log("RemarksForUserAssigned - value:", remarksForUserAssigned);

      return remarksForUserAssigned;
    };

    const mappedData = {
      quantity: getQuantityField(),
      rate: getRateField(),
      acceptedValue: getAcceptedValueField(),
      userAssigned: getUserAssignedField(),
      remarks: getRemarksField(),
      remarksForUserAssigned: getRemarksForUserAssignedField(),
    };

    console.log("=== Final Mapped BasicDetails Data ===", mappedData);

    return mappedData;
  };

  // Mapping function: Convert activeLine data to OtherDetails form fields
  const mapActiveLineToOtherDetails = (line: any): Record<string, any> => {
    if (!line) return {};

    const otherDetails = line.OtherDetails || {};

    console.log("=== Mapping OtherDetails ===");
    console.log("otherDetails object:", otherDetails);
    console.log("line object keys:", Object.keys(line));

    // Helper function to get QC field value (checking multiple possible field names)
    const getQCField = (qcNumber: number) => {
      const qcField = `QCUserDefined${qcNumber}`;
      const qcValueField = `QCUserDefined${qcNumber}Value`;
      const qcShortField = `QC${qcNumber}`;
      const qcValueShortField = `QCValue${qcNumber}`;

      // Check in OtherDetails first, then on line object
      const qcValue = otherDetails[qcField] || otherDetails[qcShortField] || line[qcField] || line[qcShortField] || '';
      const qcInputValue = otherDetails[qcValueField] || otherDetails[qcValueShortField] || line[qcValueField] || line[qcValueShortField] || '';

      console.log(`QC${qcNumber} - qcValue:`, qcValue, "qcInputValue:", qcInputValue);

      if (qcValue || qcInputValue) {
        if (typeof qcValue === 'string' && qcValue.includes('-')) {
          // If it's a combined string like "QC-Value", split it
          return splitInputDropdownValue(qcValue);
        } else {
          // Return as object with dropdown and input
          return {
            input: qcInputValue || '',
            dropdown: qcValue || ''
          };
        }
      }
      return { input: '', dropdown: 'QC' };
    };

    // Helper function to get Remarks field (checking multiple possible field names)
    const getRemarksField = (remarkNumber: number) => {
      const remarksField = `Remarks${remarkNumber}`;
      const remarkField = `Remark${remarkNumber}`;

      const value = otherDetails[remarksField] ||
        otherDetails[remarkField] ||
        line[remarksField] ||
        line[remarkField] ||
        '';

      console.log(`Remarks${remarkNumber} - value:`, value);

      return value;
    };

    const mappedData = {
      billToID: otherDetails.BillToID || line.BillToID || '',
      customerSupplierRefNo: otherDetails.CustomerSupplierRefNo || line.CustomerSupplierRefNo || '',
      financialYear: otherDetails.FinancialYear || line.FinancialYear || '',
      secondaryRefNo: otherDetails.SecondaryRefNo || line.SecondaryRefNo || '',
      qcUserdefined1: getQCField(1),
      qcUserdefined2: getQCField(2),
      qcUserdefined3: getQCField(3),
      remarks1: getRemarksField(1),
      remarks2: getRemarksField(2),
      remarks3: getRemarksField(3),
    };

    console.log("=== Final Mapped OtherDetails Data ===", mappedData);

    return mappedData;
  };

  // Mapping function: Convert form data back to API payload format for line item
  const mapFormDataToLineItem = (basicDetailsFormData: any, otherDetailsFormData: any, originalLine: any): any => {
    // Start with the original line item to preserve all existing fields
    const updatedLineItem: any = { ...originalLine };

    // Map BasicDetails form fields to line item format
    if (basicDetailsFormData.quantity) {
      if (typeof basicDetailsFormData.quantity === 'object' && basicDetailsFormData.quantity.input !== undefined) {
        updatedLineItem.QTY = basicDetailsFormData.quantity.input ? parseFloat(basicDetailsFormData.quantity.input) : null;
        updatedLineItem.UOM = basicDetailsFormData.quantity.dropdown || null;
      } else {
        updatedLineItem.QTY = basicDetailsFormData.quantity ? parseFloat(basicDetailsFormData.quantity) : null;
      }
    }

    if (basicDetailsFormData.rate) {
      if (typeof basicDetailsFormData.rate === 'object' && basicDetailsFormData.rate.input !== undefined) {
        updatedLineItem.Rate = basicDetailsFormData.rate.input ? parseFloat(basicDetailsFormData.rate.input) : null;
        updatedLineItem.BillingCurrency = basicDetailsFormData.rate.dropdown || null;
      } else {
        updatedLineItem.Rate = basicDetailsFormData.rate ? parseFloat(basicDetailsFormData.rate) : null;
      }
    }

    if (basicDetailsFormData.acceptedValue) {
      if (typeof basicDetailsFormData.acceptedValue === 'object' && basicDetailsFormData.acceptedValue.input !== undefined) {
        const acceptedValueNum = parseFloat(basicDetailsFormData.acceptedValue.input);
        updatedLineItem.AcceptedValue = !isNaN(acceptedValueNum)
          ? acceptedValueNum.toFixed(8)
          : null;
        // BillingCurrency might be set from rate, so only set if not already set
        if (!updatedLineItem.BillingCurrency) {
          updatedLineItem.BillingCurrency = basicDetailsFormData.acceptedValue.dropdown || null;
        }
      } else {
        const acceptedValueNum = parseFloat(basicDetailsFormData.acceptedValue);
        updatedLineItem.AcceptedValue = !isNaN(acceptedValueNum)
          ? acceptedValueNum.toFixed(8)
          : null;
      }
    }

    // Calculate BasicCharge = QTY * Rate
    if (updatedLineItem.QTY !== null && updatedLineItem.QTY !== undefined &&
      updatedLineItem.Rate !== null && updatedLineItem.Rate !== undefined) {
      updatedLineItem.BasicCharge = updatedLineItem.QTY * updatedLineItem.Rate;
    }

    // Map user assigned and remarks
    if (basicDetailsFormData.userAssigned !== undefined && basicDetailsFormData.userAssigned !== '') {
      updatedLineItem.UserAssigned = basicDetailsFormData.userAssigned;
    }

    if (basicDetailsFormData.remarks !== undefined && basicDetailsFormData.remarks !== '') {
      updatedLineItem.Remark = basicDetailsFormData.remarks;
    }

    if (basicDetailsFormData.remarksForUserAssigned !== undefined && basicDetailsFormData.remarksForUserAssigned !== '') {
      updatedLineItem.RemarkForAssignedUser = basicDetailsFormData.remarksForUserAssigned;
    }

    // Map OtherDetails form fields to line item format
    if (otherDetailsFormData.billToID !== undefined && otherDetailsFormData.billToID !== '') {
      updatedLineItem.BillToID = otherDetailsFormData.billToID;
    }

    if (otherDetailsFormData.customerSupplierRefNo !== undefined && otherDetailsFormData.customerSupplierRefNo !== '') {
      updatedLineItem.CustomerSupplierRefNo = otherDetailsFormData.customerSupplierRefNo;
    }

    if (otherDetailsFormData.financialYear !== undefined && otherDetailsFormData.financialYear !== '') {
      updatedLineItem.FinancialYear = otherDetailsFormData.financialYear;
    }

    if (otherDetailsFormData.secondaryRefNo !== undefined && otherDetailsFormData.secondaryRefNo !== '') {
      updatedLineItem.SecondaryRefNo = otherDetailsFormData.secondaryRefNo;
    }

    // Map QC fields (QC1, QCValue1, etc.)
    if (otherDetailsFormData.qcUserdefined1 !== undefined) {
      if (typeof otherDetailsFormData.qcUserdefined1 === 'object' && otherDetailsFormData.qcUserdefined1.input !== undefined) {
        updatedLineItem.QC1 = otherDetailsFormData.qcUserdefined1.dropdown || null;
        updatedLineItem.QCValue1 = otherDetailsFormData.qcUserdefined1.input || null;
      } else if (otherDetailsFormData.qcUserdefined1) {
        updatedLineItem.QC1 = otherDetailsFormData.qcUserdefined1;
      }
    }

    if (otherDetailsFormData.qcUserdefined2 !== undefined) {
      if (typeof otherDetailsFormData.qcUserdefined2 === 'object' && otherDetailsFormData.qcUserdefined2.input !== undefined) {
        updatedLineItem.QC2 = otherDetailsFormData.qcUserdefined2.dropdown || null;
        updatedLineItem.QCValue2 = otherDetailsFormData.qcUserdefined2.input || null;
      } else if (otherDetailsFormData.qcUserdefined2) {
        updatedLineItem.QC2 = otherDetailsFormData.qcUserdefined2;
      }
    }

    if (otherDetailsFormData.qcUserdefined3 !== undefined) {
      if (typeof otherDetailsFormData.qcUserdefined3 === 'object' && otherDetailsFormData.qcUserdefined3.input !== undefined) {
        updatedLineItem.QC3 = otherDetailsFormData.qcUserdefined3.dropdown || null;
        updatedLineItem.QCValue3 = otherDetailsFormData.qcUserdefined3.input || null;
      } else if (otherDetailsFormData.qcUserdefined3) {
        updatedLineItem.QC3 = otherDetailsFormData.qcUserdefined3;
      }
    }

    // Map Remarks fields
    if (otherDetailsFormData.remarks1 !== undefined && otherDetailsFormData.remarks1 !== '') {
      updatedLineItem.Remark1 = otherDetailsFormData.remarks1;
    }

    if (otherDetailsFormData.remarks2 !== undefined && otherDetailsFormData.remarks2 !== '') {
      updatedLineItem.Remark2 = otherDetailsFormData.remarks2;
    }

    if (otherDetailsFormData.remarks3 !== undefined && otherDetailsFormData.remarks3 !== '') {
      updatedLineItem.Remark3 = otherDetailsFormData.remarks3;
    }

    // Ensure ProposedValue matches AcceptedValue if not explicitly set, formatted as string
    if (updatedLineItem.AcceptedValue && (!updatedLineItem.ProposedValue || updatedLineItem.ProposedValue === originalLine.ProposedValue)) {
      updatedLineItem.ProposedValue = updatedLineItem.AcceptedValue;
    }

    // Set ModeFlag to Update for the modified line item
    updatedLineItem.ModeFlag = "Update";

    return updatedLineItem;
  };

  useEffect(() => {
    if (localLineItems.length > 0 && !activeLine) {
      setActiveLine(localLineItems[0]);
    }
    console.log("line items 1 ----", localLineItems);
    console.log("line items 2 ----", activeLine);
    console.log("line items 4 ----", localHeaderData);
  }, [localLineItems]);

  // Memoize initial data for form panels
  const basicDetailsInitialData = useMemo(() =>
    mapActiveLineToBasicDetails(activeLine),
    [activeLine]
  );

  const otherDetailsInitialData = useMemo(() =>
    mapActiveLineToOtherDetails(activeLine),
    [activeLine]
  );

  // Update form data when activeLine changes
  useEffect(() => {
    if (activeLine) {
      console.log("=== ActiveLine Data ===", activeLine);
      console.log("=== ActiveLine.BasicDetails ===", activeLine.BasicDetails);
      console.log("=== ActiveLine.OtherDetails ===", activeLine.OtherDetails);

      const basicDetailsData = mapActiveLineToBasicDetails(activeLine);
      const otherDetailsData = mapActiveLineToOtherDetails(activeLine);

      console.log("=== Mapped BasicDetails data ===", basicDetailsData);
      console.log("=== Mapped OtherDetails data ===", otherDetailsData);

      // Set form values when refs are available
      // Use a small delay to ensure refs are mounted
      const timer = setTimeout(() => {
        if (basicDetailsPanelRef.current) {
          console.log("Setting BasicDetails form values...");
          basicDetailsPanelRef.current.setFormValues(basicDetailsData);
        } else {
          console.warn("basicDetailsPanelRef.current is not available");
        }

        if (otherDetailsPanelRef.current) {
          console.log("Setting OtherDetails form values...");
          otherDetailsPanelRef.current.setFormValues(otherDetailsData);
        } else {
          console.warn("otherDetailsPanelRef.current is not available");
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [activeLine]);

  const splitIdName = (value: any) => {
    if (!value || typeof value !== "string") {
        return { id: "", name: "" };
    }

    if (value.includes("||")) {
        const [id, name] = value.split("||").map(v => v.trim());
        return { id, name };
    }

    return { id: value.trim(), name: "" };
  };

  const handleLineSelect = (line: any) => {
    setActiveLine(line);
    console.log("active line number ----", line);
  };

  const handleLineDelete = (lineToDelete: any) => {
    // TODO: Implement actual delete logic, potentially updating parent component
    console.log("Deleting line:", lineToDelete);
    setActiveLine(lineToDelete);
    setIsCancelModalOpen(true);
  };

  const handleCancel = async (reasonCode: string, reasonDescription: string) => {
    console.log("activeLine", activeLine);

    console.log("mk", reasonCode);
    console.log("mk", reasonDescription);

    const payload = {
      Header: {
        "DraftBillNo": localHeaderData?.DraftBillNo,
        "ReasonCode": splitIdName(reasonCode).id,
        "ReasonforComments": reasonDescription,
      },
      ItemDetails: [{
        ...activeLine,
        ModeFlag: "Checked",
      }]
    };
    console.log(JSON.stringify(payload, null, 2))
    try {
      const response = await draftBillService.cancelDraftBillByID(payload);

      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const resourceStatus = (response as any)?.data?.IsSuccess;
      
      if (resourceStatus) {
        console.log("cancelled successfully");
        
        // Refresh the data by calling getDraftBillByID API
        try {
          const refreshResponse = await draftBillService.getDraftBillByID({
            searchCriteria: { DraftBillNo: localHeaderData?.DraftBillNo }
          });

          const refreshParsedResponse = JSON.parse(refreshResponse?.data?.ResponseData || "{}");
          const refreshResourceStatus = (refreshResponse as any)?.data?.IsSuccess;

          if (refreshResourceStatus) {
            // Update local state with refreshed data
            const refreshedItemDetails = refreshParsedResponse?.ItemDetails || [];
            const refreshedHeader = refreshParsedResponse?.Header || null;
            
            setLocalLineItems(refreshedItemDetails);
            setLocalHeaderData(refreshedHeader);
            
            // Update activeLine if it still exists, otherwise select first line
            if (refreshedItemDetails.length > 0) {
              const updatedLine = refreshedItemDetails.find((line: any) => line.DBLineNo === activeLine?.DBLineNo);
              if (updatedLine) {
                setActiveLine(updatedLine);
              } else {
                setActiveLine(refreshedItemDetails[0]);
              }
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing data after cancel:", refreshError);
          // Still show success toast even if refresh fails
        }
        
        toast({
          title: "✅ Draft Bill Cancelled Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been cancelled.",
          variant: "default",
        });
        setIsCancelModalOpen(false);
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Cancel Failed",
          description: (response as any)?.data?.Message || "Failed to cancel changes.",
          variant: "destructive",
        });
      }
      // Optionally, handle success or display a message
    } catch (error) {
      console.error("Error canceling Draft:", error);
      // Optionally, handle error or display an error message
    }
    setIsCancelModalOpen(false);
  };

  // Helper function to clean payload - convert empty strings to null
  const cleanPayloadValue = (value: any): any => {
    if (value === '' || value === undefined) {
      return null;
    }
    return value;
  };

  // Helper function to clean an object - convert all empty strings to null
  const cleanPayloadObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value === '' || value === undefined) {
        cleaned[key] = null;
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(item => cleanPayloadObject(item));
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanPayloadObject(value);
      } else {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const handleSave = async () => {
    if (!activeLine || !localHeaderData) {
      console.warn("No active line or header data selected");
      return;
    }

    // Get form data from both panels
    const basicDetailsFormData = basicDetailsPanelRef.current?.getFormValues() || {};
    const otherDetailsFormData = otherDetailsPanelRef.current?.getFormValues() || {};

    console.log("BasicDetails Form Data:", basicDetailsFormData);
    console.log("OtherDetails Form Data:", otherDetailsFormData);

    // Map form data to line item format
    const updatedLineItem = mapFormDataToLineItem(basicDetailsFormData, otherDetailsFormData, activeLine);

    console.log("Updated Line Item:", updatedLineItem);

    // Update the localLineItems array with the updated activeLine
    // Set ModeFlag to "Update" for the modified line, "NoChange" for others
    const updatedItemDetails = localLineItems.map((line: any) => {
      if (line.DBLineNo === activeLine.DBLineNo) {
        return updatedLineItem;
      } else {
        // Keep other line items unchanged but ensure ModeFlag is "NoChange"
        return {
          ...line,
          ModeFlag: line.ModeFlag || "NoChange"
        };
      }
    });

    // Create the final payload structure matching the API format
    const payload = {
      Header: cleanPayloadObject({
        DraftBillNo: localHeaderData.DraftBillNo || null,
        DraftBillDate: localHeaderData.DraftBillDate || null,
        DBStatus: localHeaderData.DBStatus || null,
        DBStatusDescription: localHeaderData.DBStatusDescription || null,
        FromLocation: localHeaderData.FromLocation || null,
        FromLocationDescription: localHeaderData.FromLocationDescription || null,
        ToLocation: localHeaderData.ToLocation || null,
        ToLocationDescription: localHeaderData.ToLocationDescription || null,
        WBS: localHeaderData.WBS || null,
        DBTotalValue: localHeaderData.DBTotalValue || null,
        BusinessPartnerID: localHeaderData.BusinessPartnerID || null,
        BusinessPartnerName: localHeaderData.BusinessPartnerName || null,
        BusinessPartnerType: localHeaderData.BusinessPartnerType || null,
        ContractID: localHeaderData.ContractID || null,
        ContractDescription: localHeaderData.ContractDescription || null,
        ContractType: localHeaderData.ContractType || null,
        DraftbillValidationDate: localHeaderData.DraftbillValidationDate || null,
        InvoiceNo: localHeaderData.InvoiceNo || null,
        InvoiceDate: localHeaderData.InvoiceDate || null,
        InvoiceStatus: localHeaderData.InvoiceStatus || null,
        TransferInvoiceNo: localHeaderData.TransferInvoiceNo || null,
        LatestJournalVoucher: localHeaderData.LatestJournalVoucher || null,
        GLAccount: localHeaderData.GLAccount || null,
        DBAcceptedValue: localHeaderData.DBAcceptedValue || null,
        DraftBillStage: localHeaderData.DraftBillStage || null,
        WorkFlowStatus: localHeaderData.WorkFlowStatus || null,
        CustomerGroup: localHeaderData.CustomerGroup || null,
        SupplierGroup: localHeaderData.SupplierGroup || null,
        Cluster: localHeaderData.Cluster || null,
        Attribute1: localHeaderData.Attribute1 || null
      }),
      ReverseJournalVoucher: [
        {
          JournalVoucherNo: null
        }
      ],
      ItemDetails: updatedItemDetails.map((item: any) => cleanPayloadObject(item))
    };

    console.log("Final Payload:", payload);
    console.log("Final Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await draftBillService.saveDraftBillByID(payload);

      console.log("Draft Bill By ID API response:", response);

      const parsedResponse = JSON.parse(response?.data?.ResponseData || "{}");
      const resourceStatus = (response as any)?.data?.IsSuccess;

      console.log("parsedResponse ====", parsedResponse);

      if (resourceStatus) {
        console.log("Draft Bill By ID fetched successfully");
        toast({
          title: "✅ Draft Bill Saved Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
        // Set the draft bill data in state
        onClose();
      } else {
        // throw new Error("Failed to fetch draft bill details");
        toast({
          title: "⚠️ Draft Bill Save Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching draft bill:", error);
    }

    // TODO: Call API to save the payload
    // onSave(payload);
    // return payload;
  };

  // const handleFormChange = (key: string, value: any) => {
  //   setCurrentLineFormData((prev: any) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  // };

  const [qcList1, setqcList1] = useState<any>();
  const [qcList2, setqcList2] = useState<any>();
  const [qcList3, setqcList3] = useState<any>();

  useEffect(() => {
    const loadQcMasters = async () => {
      try {
        const [res1, res2, res3]: any = await Promise.all([
          quickOrderService.getMasterCommonData({
            messageType: "Draft Bill QC1 Init",
          }),
          quickOrderService.getMasterCommonData({
            messageType: "Draft Bill QC2 Init",
          }),
          quickOrderService.getMasterCommonData({
            messageType: "Draft Bill QC3 Init",
          }),
        ]);
        console.log("res1?.data?.ResponseData", JSON.parse(res1?.data?.ResponseData))
        setqcList1(JSON.parse(res1?.data?.ResponseData || "[]"));
        setqcList2(JSON.parse(res2?.data?.ResponseData || "[]"));
        setqcList3(JSON.parse(res3?.data?.ResponseData || "[]"));
      } catch (err) {
        console.error("QC API failed", err);
      }
    };
    loadQcMasters();
  }, []);
  const getQcOptions = (list: any[]) =>
    list
      ?.filter((qc) => qc.id)
      .map((qc) => ({
        label: `${qc.id} || ${qc.name}`,
        value: qc.id,
        name: qc.name
      })) || [];


  useEffect(() => {
    console.log(localHeaderData, "headerData123")
    console.log(localHeaderData?.DBAcceptedValue, "headerData123")
  }, [localHeaderData])
  const OtherDetailsPanelConfig: PanelConfig = {
    billToID: {
      id: "billToID",
      label: "Bill To ID",
      fieldType: "lazyselect", // Assuming it's a searchable dropdown
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Bill To ID",
      fetchOptions: fetchMaster('Bill to ID Init'), // Placeholder
    },
    customerSupplierRefNo: {
      id: "customerSupplierRefNo",
      label: "Customer/Supplier Ref No.",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Customer Ref. No.",
    },
    financialYear: {
      id: "financialYear",
      label: "Financial Year",
      fieldType: "lazyselect", // Assuming it's a dropdown
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster('Financial Year Init'),
    },
    secondaryRefNo: {
      id: "secondaryRefNo",
      label: "Secondary Ref. No.",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Train001",
    },
    qcUserdefined1: {
      id: "qcUserdefined1",
      label: "QC Userdefined 1",
      fieldType: "inputdropdown",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter Value",
      options: getQcOptions(qcList1),
    },
    qcUserdefined2: {
      id: "qcUserdefined2",
      label: "QC Userdefined 2",
      fieldType: "inputdropdown",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "Enter Value",
      options: getQcOptions(qcList2),
    },
    qcUserdefined3: {
      id: "qcUserdefined3",
      label: "QC Userdefined 3",
      fieldType: "inputdropdown",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter Value",
      options: getQcOptions(qcList3),
    },
    remarks1: {
      id: "remarks1",
      label: "Remarks 1",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "Enter Remarks",
    },
    remarks2: {
      id: "remarks2",
      label: "Remarks 2",
      fieldType: "textarea",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: "half",
      placeholder: "Enter Remarks",
    },
    remarks3: {
      id: "remarks3",
      label: "Remarks 3",
      fieldType: "textarea",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: "half",
      placeholder: "Enter Remarks",
    },
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <section
          className="absolute inset-y-0 right-0 pl-10 max-w-full flex"
          style={{ width: "100%" }}
        >
          <div className="w-screen max-w-full">
            <div className="h-full flex flex-col bg-gray-100 shadow-xl">
              {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                  <div className="text-lg font-semibold text-blue-700">Loading Draft Bill Details...</div>
                  <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <div className="flex h-16 items-center bg-white justify-between border-b border-gray-200 px-6">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">Draft Bill Details</h2>
                    <div className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">{localHeaderData?.DraftBillNo || ''}</div>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">BR Released</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex">
                  {/* Left Section */}
                  <div className="w-1/4 draftBillScrollBar bg-white">
                    {/* Part 1: Static Display Section */}
                    <div className="p-3 m-4 bg-gray-100 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{localHeaderData?.DraftBillNo}</h3>
                        <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md">{localHeaderData?.DBStatusDescription}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{localHeaderData?.DraftBillDate ? new Date(localHeaderData.DraftBillDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '12-Mar-2025'}</p>
                      <div className="grid grid-cols-2 gap-y-2 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Value</p>
                          <p className="text-base font-medium text-purple-600">€ {localHeaderData?.DBTotalValue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Accepted SSSSValue</p>
                          <p className="text-base font-medium text-green-600">€ {localHeaderData?.DBAcceptedValue}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-700">
                          <UserPlus className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{localHeaderData?.BusinessPartnerName} - {localHeaderData?.BusinessPartnerID}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <FileText className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{localHeaderData?.InvoiceNo} <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">{localHeaderData?.InvoiceStatus}</span></span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <FileText className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {localLineItems[0]?.ReferenceInformation}
                            <div className="relative group inline-block">
                              <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
                              <div className="absolute -right-120 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                  {"Reference Doc. ID"}
                                </div>
                                <div className="px-4 py-3">
                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                    <div className="">{"Reference Doc. ID"}</div>
                                  </div>
                                  <div className="font-semibold text-gray-700">
                                    <div>{localLineItems[0]?.ReferenceInformation}</div>

                                  </div>


                                </div>
                              </div>
                              <div className="absolute -right-120 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                  {"Reference Doc. ID"}
                                </div>
                                <div className="px-4 py-3">
                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                    <div className="">{"Reference Doc. ID"}</div>
                                  </div>
                                  <div className="font-semibold text-gray-700">
                                    <div>{localLineItems[0]?.ReferenceInformation}</div>

                                  </div>


                                </div>

                                <div className="px-4 py-3">
                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                    <div className="">{"Reference Doc. Type"}</div>
                                  </div>
                                  <div className="font-semibold text-gray-700">
                                    <div>{localLineItems[0]?.RefDocIDTypeDescription}</div>

                                  </div>


                                </div>

                                <div className="px-4 py-3">
                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                    <div className="">{"Reference Doc. Date"}</div>
                                  </div>
                                  <div className="font-semibold text-gray-700">
                                    <div>{localLineItems[0]?.RefDocDate}</div>

                                  </div>


                                </div>
                              </div>
                            </div>
                          </span>
                          <FileText className="w-4 h-4 ml-3 text-gray-400" />
                          <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">Multiple
                            <div className="relative group inline-block">
                              <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
                              <div className="absolute -right-20 hidden top-5 z-30 group-hover:block min-w-[175px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                  {"Contract Details"}
                                </div>
                                <div className="px-4 py-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="font-semibold text-gray-700">{localHeaderData?.ContractID}</div>
                                    <div className="font-semibold text-gray-700">{localHeaderData?.ContractType}</div>

                                  </div>


                                  <div className="text-[11px] text-gray-400 ">Internal Order</div>
                                  <div className="text-xs text-gray-400">
                                    stage{" Order"}
                                  </div>
                                </div>
                              </div>
                            </div>

                          </span>
                        </div>

                        {/* <div className="flex items-start text-sm text-gray-700 mt-4">
                          <UserPlus className="w-4 h-4 mr-2 text-gray-400" />
                        
                        </div> */}
                      </div>
                    </div>

                    {/* Part 2: Line Number (Leg Details) Section with scrollbar */}
                    <div className="flex-1 p-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Tariff Details <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">{localLineItems.length}</span></h3>
                      <div className="space-y-4">
                        {localLineItems.map((line, index) => (
                          <div
                            key={index}
                            className={`p-4 border rounded-md cursor-pointer ${activeLine?.DBLineNo === line.DBLineNo ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200"}`}
                            onClick={() => handleLineSelect(line)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-semibold">Line No:{line.DBLineNo}</span>
                              <div className="flex items-center space-x-2">
                                {line.DBLineStatus === "AP" && (
                                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Approved</span>
                                )}
                                {line.DBLineStatus === "OPN" && (
                                  <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">Open</span>
                                )}
                                {line.DBLineStatus === "RR" && (
                                  <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">Rerun Triggered</span>
                                )}
                                {line.DBLineStatus === "CN" && (
                                  <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Cancelled</span>
                                )}
                                {/* {line.DBLineStatus === "" && (
                                  <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">"qw"</span>
                                )} */}
                                <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleLineDelete(line); }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-700 border-b border-gray-200 pb-2 mb-3">
                              <span>{line.TariffDescription}</span>

                              <div className="relative group inline-block">
                                <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />

                                <div className="absolute -right-[0px] hidden top-5 z-[9999] group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                  <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                    Traff Details
                                  </div>

                                  <div className="px-4 py-3">
                                    <div className="text-[11px] text-gray-400 mb-2">
                                      Traff ID and Description
                                    </div>

                                    <div className="font-semibold text-gray-700">
                                      {line?.TariffIDType} - {line?.TariffDescription}
                                    </div>
                                  </div>
                                  <div className="px-4 py-3">
                                    <div className="text-[11px] text-gray-400 mb-2">
                                      Traff Type
                                    </div>

                                    <div className="font-semibold text-gray-700">
                                      {line?.TariffIDType}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-6 text-xs">
                              <div>
                                Proposed:
                                <div className="text-purple-600">
                                  € {parseFloat(line.ProposedValue).toLocaleString('en-US', {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3,
                                  })}
                                </div>
                              </div>

                              <div>
                                Accepted:
                                <div className="text-green-600">
                                  € {line.AcceptedValue}
                                </div>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Collapsible Panels with scrollbar */}
                  <div className="w-3/4 draftBillScrollBar p-6 space-y-6">
                    {/* Header - Title & expand button */}
                    <div className="flex items-center justify-between pb-2">
                      <h3 className="text-xl font-semibold text-gray-900">Tariff Details</h3>
                      <button
                        className={`rounded-lg p-2 cursor-pointer ${isAllExpanded
                          ? "bg-blue-600 border border-blue-600 hover:bg-blue-700"
                          : "bg-white border border-gray-300 hover:bg-gray-100"
                          }`}
                        aria-label="Expand/Collapse All"
                        title="Expand/Collapse All"
                        onClick={handleToggleExpandAll}
                      >
                        <Expand className={`w-4 h-4 ${isAllExpanded ? "text-white" : "text-gray-700"}`} />
                      </button>
                    </div>

                    {/* Panel 1: Summary Panel */}
                    <div className="p-4 border rounded-md bg-white shadow-sm">
                      <div
                        className={`flex items-center justify-between cursor-pointer ${isSummaryExpanded ? "mb-4 border-b border-gray-200 pb-3" : ""}`}
                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Bookmark className="w-5 h-5 text-orange-500" /> Summary
                        </h3>
                        {isSummaryExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {isSummaryExpanded && (
                        <>
                          <div className="grid grid-cols-4 gap-x-6 gap-y-4 text-sm">
                            <div>
                              <p className="text-gray-500">Tariff ID</p>
                              <p className="font-medium text-gray-900">{activeLine?.TariffID || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Triggering Doc.</p>
                              <p className="font-medium text-gray-900">{activeLine?.TriggerDocID || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Basic Charge</p>
                              <p className="font-medium text-gray-900">€ {activeLine?.BasicCharge}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Triggering Date</p>
                              <p className="font-medium text-gray-900">{activeLine?.TriggeringDocDate || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Minimum/Maximum Charge</p>
                              <p className="font-medium text-gray-900">€ {activeLine?.MinimumCharge || '0.00'} / € {activeLine?.MaximumCharge || '0.00'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Reference Doc. No.</p>
                              <p className="font-medium text-gray-900">{activeLine?.ReferenceInformation || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Reference Doc. Type</p>
                              <p className="font-medium text-gray-900">{activeLine?.RefDocIDType || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Agent</p>
                              <p className="font-medium text-gray-900">{activeLine?.Agent || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Equipment</p>
                              <p className="font-medium text-gray-900">{activeLine?.EquipmentDescription || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Invoice No.</p>
                              <p className="font-medium text-gray-900">{activeLine?.InvoiceNo || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Invoice Status</p>
                              <p className="font-medium text-gray-900">{activeLine?.InvoiceStatus || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Invoice Date</p>
                              <p className="font-medium text-gray-900">{activeLine?.InvoiceDate || '--'}</p>
                            </div>
                          </div>
                          <hr className="my-4" />
                          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-4 flex items-center gap-2">
                            Reason Details
                          </h3>
                          <div className="grid grid-cols-4 gap-x-6 gap-y-4 text-sm">
                            <div>
                              <p className="text-gray-500">Reason for Amendment.</p>
                              <p className="font-medium text-gray-900">{activeLine?.ReasonForAmendment || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Reason for Cancellation</p>
                              <p className="font-medium text-gray-900">{activeLine?.ReasonForCancellation || '--'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Remarks</p>
                              <p className="font-medium text-gray-900">{activeLine?.Remark || '--'}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Panel 2: Basic Details Panel */}
                    <div className="shadow-sm">
                      {/* <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" /> Basic Details
                      </h3> */}
                      <div>
                        <DynamicPanel
                          ref={basicDetailsPanelRef}
                          panelId="basic-details"
                          panelTitle="Basic Details"
                          panelConfig={BasicDetailsPanelConfig}
                          initialData={basicDetailsInitialData}
                          panelIcon={<FileText className="w-5 h-5 text-cyan-500" />}
                          showHeader={false} // Hide panel header as it's part of the parent div
                          collapsible={true}
                          isExpanded={isBasicDetailsExpanded}
                          onOpenChange={setIsBasicDetailsExpanded}
                        />
                      </div>
                    </div>

                    {/* Panel 3: Other Details Panel */}
                    <div className="shadow-sm">
                      {/* <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-orange-500" /> Other Details
                      </h3> */}
                      <div>
                        <DynamicPanel
                          ref={otherDetailsPanelRef}
                          panelId="other-details"
                          panelTitle="Other Details"
                          panelConfig={OtherDetailsPanelConfig}
                          initialData={otherDetailsInitialData}
                          panelIcon={<Info className="w-5 h-5 text-orange-500" />}
                          showHeader={false} // Hide panel header as it's part of the parent div
                          collapsible={true}
                          isExpanded={isOtherDetailsExpanded}
                          onOpenChange={setIsOtherDetailsExpanded}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 justify-between px-6 py-2 space-x-2 bg-gray-50 border-t border-gray-200">
                <div className="">
                  {/* <Button type="button" onClick={() => setIsAuditTrailOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white h-8 py-1">
                    Audit Trail
                  </Button> */}
                  <Button title="Audit Trail" onClick={() => setIsAuditTrailOpen(true)} className="bg-white border border-gray-300 h-8 px-2 py-2 text-[13px] rounded-lg hover:bg-gray-100 cursor-pointer">
                    <FileSearchIcon className="w-8 h-8 text-gray-500" />
                  </Button>
                  <Button title="Workflow" className="ml-3 bg-white border border-gray-300 h-8 px-2 py-2 text-[13px] rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Workflow className="w-8 h-8 text-gray-500" />
                  </Button>
                </div>
                <div className="">
                  <Button type="submit" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white h-8 py-1">
                    Save
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Audit Trail Side Drawer */}
      <DraftBillAuditTrail
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        auditDraftBillObj={localHeaderData?.DraftBillNo}
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleCancel}
      />
    </>
  );
};

export default DraftBillDetailsSideDraw;
