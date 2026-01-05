import { useState, useEffect, useRef, useMemo } from "react";
import { X, Trash2, FileText, UserPlus, Info, Bookmark, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {DynamicPanel, DynamicPanelRef} from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel";
import { splitInputDropdownValue, combineInputDropdownValue, InputDropdownValue } from "@/utils/inputDropdown";
import { draftBillService } from "@/api/services/DraftBillService";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    fetchOptions: () => Promise.resolve([]), // Placeholder, implement actual fetch options
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
    fetchOptions: () => Promise.resolve([]), // Placeholder
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
    fieldType: "select", // Assuming it's a dropdown
    value: "",
    mandatory: false,
    visible: true,
    editable: true,
    order: 3,
    width: "four",
    placeholder: "",
    options: [{ value: "2025", label: "2025" }], // Placeholder
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
    options: [{ value: "QC", label: "QC" }], // Placeholder
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
    options: [{ value: "QC", label: "QC" }], // Placeholder
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
    options: [{ value: "QC", label: "QC" }], // Placeholder
  },
  remarks1: {
    id: "remarks1",
    label: "Remarks 1",
    fieldType: "textarea",
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
            dropdown: quantityUOM || 'TON' 
          };
        }
      }
      return { input: '', dropdown: 'TON' };
    };

  //   useEffect(()=>{
  //  console.clear();
  //  console.log(headerData, "Accepted Value")
  //   },[])
    
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
            dropdown: rateCurrency || 'EUR' 
          };
        }
      }
      return { input: '', dropdown: 'EUR' };
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
            dropdown: acceptedValueCurrency || 'EUR' 
          };
        }
      }
      return { input: '', dropdown: 'EUR' };
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
            dropdown: qcValue || 'QC' 
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
    if (lineItems.length > 0 && !activeLine) {
      setActiveLine(lineItems[0]);
    }
    console.log("line items 1 ----", lineItems);
    console.log("line items 2 ----", activeLine);
    console.log("line items 4 ----", headerData);
  }, [lineItems]);

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

  const handleLineSelect = (line: any) => {
    setActiveLine(line);
    console.log("active line number ----", line);
  };

  const handleLineDelete = (lineToDelete: any) => {
    // TODO: Implement actual delete logic, potentially updating parent component
    console.log("Deleting line:", lineToDelete);
    // For now, just filter it out from the active list if it were local state
    // This will need to trigger an update to the parent component's lineItems state
    const updatedLineItems = lineItems.filter(line => line.LineNo !== lineToDelete.LineNo);
    // If the deleted line was the active one, select the first available line or null
    if (activeLine?.LineNo === lineToDelete.LineNo) {
      setActiveLine(updatedLineItems.length > 0 ? updatedLineItems[0] : null);
    }
    // onSave({ updatedLineItems }); // This will be handled by the parent component after API call
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
    if (!activeLine || !headerData) {
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

    // Update the lineItems array with the updated activeLine
    // Set ModeFlag to "Update" for the modified line, "NoChange" for others
    const updatedItemDetails = lineItems.map((line: any) => {
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
        DraftBillNo: headerData.DraftBillNo || null,
        DraftBillDate: headerData.DraftBillDate || null,
        DBStatus: headerData.DBStatus || null,
        DBStatusDescription: headerData.DBStatusDescription || null,
        FromLocation: headerData.FromLocation || null,
        FromLocationDescription: headerData.FromLocationDescription || null,
        ToLocation: headerData.ToLocation || null,
        ToLocationDescription: headerData.ToLocationDescription || null,
        WBS: headerData.WBS || null,
        DBTotalValue: headerData.DBTotalValue || null,
        BusinessPartnerID: headerData.BusinessPartnerID || null,
        BusinessPartnerName: headerData.BusinessPartnerName || null,
        BusinessPartnerType: headerData.BusinessPartnerType || null,
        ContractID: headerData.ContractID || null,
        ContractDescription: headerData.ContractDescription || null,
        ContractType: headerData.ContractType || null,
        DraftbillValidationDate: headerData.DraftbillValidationDate || null,
        InvoiceNo: headerData.InvoiceNo || null,
        InvoiceDate: headerData.InvoiceDate || null,
        InvoiceStatus: headerData.InvoiceStatus || null,
        TransferInvoiceNo: headerData.TransferInvoiceNo || null,
        LatestJournalVoucher: headerData.LatestJournalVoucher || null,
        GLAccount: headerData.GLAccount || null,
        DBAcceptedValue: headerData.DBAcceptedValue || null,
        DraftBillStage: headerData.DraftBillStage || null,
        WorkFlowStatus: headerData.WorkFlowStatus || null,
        CustomerGroup: headerData.CustomerGroup || null,
        SupplierGroup: headerData.SupplierGroup || null,
        Cluster: headerData.Cluster || null,
        Attribute1: headerData.Attribute1 || null
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
    onClose();
    // return payload;
  };

  // const handleFormChange = (key: string, value: any) => {
  //   setCurrentLineFormData((prev: any) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      <section
        className="absolute inset-y-0 right-0 pl-10 max-w-full flex"
        style={{ width: "100%" }}
      >
        <div className="w-screen max-w-full">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
                <div className="text-lg font-semibold text-blue-700">Loading Draft Bill Details...</div>
                <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Draft Bill Details</h2>
                  <div className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">{headerData?.DraftBillNo || ''}</div>
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
                <div className="w-1/4 draftBillScrollBar">
                  {/* Part 1: Static Display Section */}
                  <div className="p-3 m-4 bg-gray-100 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{headerData?.DraftBillNo || 'DB_D25_0001'}</h3>
                      <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md">Open</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{headerData?.DraftBillDate ? new Date(headerData.DraftBillDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '12-Mar-2025'}</p>
                    <div className="grid grid-cols-2 gap-y-2 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Value</p>
                        <p className="text-base font-medium text-purple-600">€ {headerData?.DBTotalValue?.toLocaleString('en-US') || '1,200.000'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Accepted Value</p>
                        <p className="text-base font-medium text-green-600">€ {headerData?.DBAcceptedValue?.toLocaleString('en-US') || '1,200.000'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <UserPlus className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{headerData?.BusinessPartnerName || 'Felbermayr Kran'} - {headerData?.BusinessPartnerID || '10029114'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{headerData?.InvoiceNo || 'INV00024324'} <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">Under Amendment</span></span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {headerData?.ReferenceInformation || 'IO_D25_003'}
                           <div className="relative group inline-block">
                                                          <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
                                                          <div className="absolute -right-120 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                                              <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                                                { "Reference Doc. ID"}
                                                              </div>
                                                              <div className="px-4 py-3">
                                                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                                                      <div className="">{"Reference Doc. ID"}</div>
                                                                  </div>
                                                                  <div className="font-semibold text-gray-700">
                                                                      <div>I0_D@%_003</div>
                                                                      
                                                                  </div>
                      
                                                                 
                                                              </div>
                                                          </div>
                                                          <div className="absolute -right-120 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                                              <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                                                { "Reference Doc. ID"}
                                                              </div>
                                                              <div className="px-4 py-3">
                                                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                                                      <div className="">{"Reference Doc. ID"}</div>
                                                                  </div>
                                                                  <div className="font-semibold text-gray-700">
                                                                      <div>I0_D@%_003</div>
                                                                      
                                                                  </div>
                      
                                                                 
                                                              </div>

                                                                <div className="px-4 py-3">
                                                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                                                      <div className="">{"Reference Doc. Type"}</div>
                                                                  </div>
                                                                  <div className="font-semibold text-gray-700">
                                                                      <div>I0_D@%_003</div>
                                                                      
                                                                  </div>
                      
                                                                 
                                                              </div>

                                                                <div className="px-4 py-3">
                                                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                                                      <div className="">{"Reference Doc. Date"}</div>
                                                                  </div>
                                                                  <div className="font-semibold text-gray-700">
                                                                      <div>I0_D@%_003</div>
                                                                      
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
                                                                { "Contract Details"}
                                                              </div>
                                                              <div className="px-4 py-3">
                                                                  <div className="flex justify-between items-center mb-2">
                                                                      <div className="font-semibold text-gray-700">{headerData?.ContractID}</div>
                                                                      <div className="font-semibold text-gray-700">{headerData?.ContractType}</div>

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
                      <div className="relative group inline-block">
                                                          <AlertCircle className="w-4 h-4 text-gray-600 cursor-pointer" />
                                                          <div className="absolute right-0 hidden top-5 z-30 group-hover:block min-w-[275px] max-w-xs bg-white rounded-md shadow-xl border border-gray-200 text-xs text-gray-700">
                                                              <div className="bg-gray-100 px-4 py-2 rounded-t-md font-semibold text-gray-800 border-b border-gray-200">
                                                                { "mmk"}
                                                              </div>
                                                              <div className="px-4 py-3">
                                                                  <div className="flex justify-between items-center mb-2">
                                                                      <div className="font-semibold text-gray-700">{"mmk"}</div>
                                                                  </div>
                                                                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                                                                      <div>Tariff ID</div>
                                                                      <div>Unit Price</div>
                                                                  </div>
                      
                                                                  <div className="text-[11px] text-gray-400 mb-1 pt-2 border-t border-gray-300">Tariff Description</div>
                                                                  <div className="text-xs text-gray-700 font-medium">
                                                                      {"mmk"}
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      </div>
                      <div className="flex items-start text-sm text-gray-700 mt-4">
                        <UserPlus className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Reason : Mismatch in consignee details between shipping manifest and bill.</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Line Number (Leg Details) Section with scrollbar */}
                  <div className="flex-1 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Tariff Details <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">{lineItems.length}</span></h3>
                    <div className="space-y-4">
                      {lineItems.map((line, index) => (
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
                              {line.DBLineStatus === "OC" && (
                                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">Open</span>
                              )}
                              {line.DBLineStatus === "CA" && (
                                <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Cancelled</span>
                              )}
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleLineDelete(line); }} />
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 mb-1">{line.TariffDescription}</p>
                          <div className="flex justify-between text-xs">
                            <div>Proposed: 
                              <div className="text-purple-600">€ {parseFloat(line.ProposedValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</div>
                            </div>
                            <div>Accepted: 
                              <div className="text-green-600">€ {parseFloat(line.AcceptedValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section: Collapsible Panels with scrollbar */}
                <div className="w-3/4 draftBillScrollBar p-6 space-y-6">
                  {/* Panel 1: Summary Panel */}
                  <div className="p-6 border rounded-md bg-white shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-orange-500" /> Summary
                    </h3>
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
                        <p className="font-medium text-gray-900">€ {activeLine?.BasicCharge || '0.00'}</p>
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
                  </div>

                  {/* Panel 2: Basic Details Panel */}
                  <div className="bg-white shadow-sm">
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
                      />
                    </div>
                  </div>

                  {/* Panel 3: Other Details Panel */}
                  <div className="bg-white shadow-sm">
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
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 justify-end px-6 py-2 space-x-2 bg-gray-50 border-t border-gray-200">
              <Button type="submit" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white h-8 py-1">
                Save
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DraftBillDetailsSideDraw;
