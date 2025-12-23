import { useState, useEffect } from "react";
import { X, Trash2, FileText, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {DynamicPanel} from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel";

interface DraftBillDetailsSideDrawProps {
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  initialConsignorData?: any;
  initialConsigneeData?: any;
  lineItems: any[]; // Array of line items from the API response
  onSave: (payload: any) => void;
  headerData: any; // Header data for the Static Display and Summary panels
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
    width: "full",
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
    width: "full",
    placeholder: "Please check rate for this DB",
  },
};

const DraftBillDetailsSideDraw: React.FC<DraftBillDetailsSideDrawProps> = ({
  isOpen,
  width,
  onClose,
  lineItems,
  onSave,
  headerData,
  initialConsignorData, 
  initialConsigneeData
}) => {
  const [activeLine, setActiveLine] = useState<any | null>(null);
  const [currentLineFormData, setCurrentLineFormData] = useState<any>({});

  useEffect(() => {
    if (lineItems.length > 0 && !activeLine) {
      setActiveLine(lineItems[0]);
      setCurrentLineFormData(lineItems[0]?.BasicDetails || {});
    }
  }, [lineItems, activeLine]);

  useEffect(() => {
    if (activeLine) {
      setCurrentLineFormData(activeLine.BasicDetails || {});
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

  const handleSave = () => {
    // Create a payload that includes the updated currentLineFormData for the activeLine
    const updatedLineItems = lineItems.map((line: any) =>
      line.LineNo === activeLine.LineNo
        ? { ...line, BasicDetails: currentLineFormData }
        : line
    );
    onSave({ updatedLineItems });
  };

  const handleFormChange = (key: string, value: any) => {
    setCurrentLineFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

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
            <div className="flex-1 overflow-hidden">
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
                <h2 className="text-lg font-semibold text-gray-900">Draft Bill Details</h2>
                <div className="flex items-center space-x-3">
                  <div className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">{headerData?.DB_ID || 'DB_D25_0001'}</div>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">BR Released</div>
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
                <div className="w-1/4 flex flex-col overflow-y-auto">
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
                        <span>{headerData?.ReferenceInformation || 'IO_D25_003'} <Info className="w-4 h-4 inline-block ml-1 text-gray-400" /> <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">Multiple</span> <Info className="w-4 h-4 inline-block ml-1 text-gray-400" /></span>
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
                <div className="w-2/3 overflow-y-auto p-6 space-y-6">
                  {/* Panel 1: Summary Panel */}
                  <div className="p-6 border rounded-md bg-white shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-500" /> Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div>
                        <p className="text-gray-500">Tariff ID</p>
                        <p className="font-medium text-gray-900">{headerData?.TariffID || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Triggering Doc.</p>
                        <p className="font-medium text-gray-900">{headerData?.TriggeringDoc || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Basic Charge</p>
                        <p className="font-medium text-gray-900">€ {headerData?.BasicCharge || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Triggering Date</p>
                        <p className="font-medium text-gray-900">{headerData?.TriggeringDate || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Minimum/Maximum Charge</p>
                        <p className="font-medium text-gray-900">€ {headerData?.MinimumCharge || '0.00'} / € {headerData?.MaximumCharge || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reference Doc. No.</p>
                        <p className="font-medium text-gray-900">{headerData?.ReferenceDocNo || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reference Doc. Type</p>
                        <p className="font-medium text-gray-900">{headerData?.ReferenceDocType || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Agent</p>
                        <p className="font-medium text-gray-900">{headerData?.Agent || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Equipment</p>
                        <p className="font-medium text-gray-900">{headerData?.Equipment || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Invoice No.</p>
                        <p className="font-medium text-gray-900">{headerData?.InvoiceNo || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Invoice Status</p>
                        <p className="font-medium text-gray-900">{headerData?.InvoiceStatus || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Invoice Date</p>
                        <p className="font-medium text-gray-900">{headerData?.InvoiceDate || '--'}</p>
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mt-6 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-500" /> Reason Details
                    </h3>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
                      <div>
                        <p className="text-gray-500">Reason for Amendment.</p>
                        <p className="font-medium text-gray-900">{headerData?.ReasonForAmendment || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reason for Cancellation</p>
                        <p className="font-medium text-gray-900">{headerData?.ReasonForCancellation || '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Remarks</p>
                        <p className="font-medium text-gray-900">{headerData?.SummaryRemarks || '--'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Panel 2: Basic Details Panel */}
                  <div className="p-6 border rounded-md bg-white shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-500" /> Basic Details
                    </h3>
                    <div>
                      <DynamicPanel
                        panelId="basic-details"
                        panelTitle="Basic Details"
                        panelConfig={BasicDetailsPanelConfig}
                        initialData={currentLineFormData}
                        onDataChange={setCurrentLineFormData}
                        showHeader={false} // Hide panel header as it's part of the parent div
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 justify-end px-6 py-4 space-x-2 bg-gray-50 border-t border-gray-200">
              <Button type="submit" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
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
