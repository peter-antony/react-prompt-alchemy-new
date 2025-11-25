import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import type { PanelConfig } from "@/types/dynamicPanel";
import { Button } from "@/components/ui/button";
import { Plus, Search, Copy, BookX, Link, Paperclip } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { quickOrderService } from "@/api/services";
import { useWorkOrderFormStore } from "@/stores/workOrderStore";
// import { SideDrawer } from "@/components/ui/side-drawer";
import { SideDrawer } from "@/components/Common/SideDrawer";
import { InputDropdown } from "@/components/ui/input-dropdown";
import WorkOrderOperationDetails from "./WorkOrderOperationDetails";

/** ---------------------------------------------------
 * Exposed handle type
 * ---------------------------------------------------*/
export type WorkOrderFormHandle = {
  getWorkOrderValues: () => any;
};
/** ---------------------------------------------------
 * Component
 * ---------------------------------------------------*/
const WorkOrderForm = forwardRef<WorkOrderFormHandle>((props, ref) => {
  const formRef = useRef<DynamicPanelRef>(null);

  const [workOrderData, setWorkOrderData] = useState<Record<string, any>>({});
  const [resourceGroups, setResourceGroups] = useState<any[]>([]);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [orderType, setOrderType] = useState<"Wagon" | "Container">("Wagon");
  const [wagonMoreDetails, setWagonMoreDetails] = useState(false);
  const [showOperstionDetails, setShowOperationDetails] = useState(false);
  const [qcList1, setqcList1] = useState<any>();
  const [qcList2, setqcList2] = useState<any>();
  const [qcList3, setqcList3] = useState<any>();
  const [showMoreDetails, setShowMoreDetails] = useState(false); // State to toggle more details fields

  const saveToZustand = () => {
    const values = formRef.current?.getFormValues();
    console.log("FORM VALUES:", values);

    useWorkOrderFormStore.getState().setFormObject(values);

    alert("Form saved to Zustand!");
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard", active: false },
    {
      label: "Work Order Management",
      href: "/work-order-hub",
      active: false,
    },
    { label: "Work Order", active: true },
  ];

  /**
   * fetchMaster helper
   */
  const fetchMaster = (
    messageType: string,
    additionalFilter?: { FilterName: string; FilterValue: string }[]
  ) => {
    return async ({ searchTerm, offset, limit }) => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType,
          searchTerm: searchTerm || "",
          offset,
          limit,
          AdditionalFilter: additionalFilter || [], // <-- FIXED HERE
        });

        const rr: any = response?.data;
        const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

        return arr.map((item: any) => {
          const id = item.id ?? "";
          const name = item.name ?? "";
          return {
            label: `${id} || ${name}`,
            value: `${id} || ${name}`,
          };
        });
      } catch (err) {
        return [];
      }
    };
  };
  /**
   * PanelConfig factory — depends on currentOrderType
   */
  const workOrderPanelConfig = (currentOrderType: string): PanelConfig => ({
    WorkOrderType: {
      id: "WorkOrderType",
      label: "",
      fieldType: "radio",
      width: "full",
      value: currentOrderType,
      options: [
        { label: "Wagon", value: "Wagon" },
        { label: "Container", value: "Container" },
      ],
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      events: {
        onChange: (val: string) => {
          if (val === "Wagon" || val === "Container") {
            setOrderType(val as "Wagon" | "Container");
          }
        },
      },
    },
    WagonCondainterID: {
      id: "WagonCondainterID",
      label: "Wagon/Container ID",
      fieldType: "lazyselect",
      width: "half",
      value: "awd",
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
      // dynamic message based on orderType
      fetchOptions:
        currentOrderType === "Wagon"
          ? fetchMaster("Wagon id Init")
          : fetchMaster("Container id Init"),
    },

    SuplierContract: {
      id: "SuplierContract",
      label: "Supplier Contract No",
      fieldType: "lazyselect",
      width: "half",
      value: "",
      mandatory: true,
      visible: true,
      editable: true,
      order: 3,
      fetchOptions: fetchMaster("Contract Init", [
        { FilterName: "ContractType", FilterValue: "Buy" },
      ]),
    },

    CustomerContract: {
      id: "CustomerContract",
      label: "Customer Contract No./Business Case",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      width: "full",
      order: 4,
      fetchOptions: fetchMaster("Contract Init", [
        { FilterName: "ContractType", FilterValue: "Sell" },
      ]),
    },

    AppoinmentDate: {
      id: "AppoinmentDate",
      label: "Appointment Date",
      fieldType: "date",
      width: "half",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
    },

    ClusterMarket: {
      id: "ClusterMarket",
      label: "Cluster/Market",
      fieldType: "lazyselect",
      width: "half",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      fetchOptions: fetchMaster("Cluster Init"),
    },

    product: {
      id: "product",
      label: "Product",
      fieldType: "lazyselect",
      width: "half",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      fetchOptions: fetchMaster("Product ID Init"),
    },

    UNCODE: {
      id: "UNCODE",
      label: "UN Code",
      fieldType: "lazyselect",
      width: "half",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      fetchOptions: fetchMaster("UN Code Init"),
    },

    LoadType: {
      id: "LoadType",
      label: "Load Type",
      fieldType: "radio",
      width: "half",
      value: "BUY",
      options: [
        { label: "Loaded", value: "BUY" },
        { label: "Empty", value: "SELL" },
      ],
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
    },
    Hazardous: {
      id: "Hazardous",
      label: "Hazardous",
      fieldType: "switch",
      width: "half",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 11,
    },

    EventDate: {
      id: "EventDate",
      label: "Event Date",
      fieldType: "date",
      width: "half",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 12,
    },

    PlaceOfEvent: {
      id: "PlaceOfEvent",
      label: "Place Of Event",
      fieldType: "lazyselect",
      width: "half",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 13,
      fetchOptions: fetchMaster("Location Init"),
    },
    BillingDetailsTitle: {
      id: "BillingDetailsTitle",
      label: "Billing Details",
      fieldType: "header",
      width: "full",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 14,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z" stroke="#475467" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 6H11M5 9H9" stroke="#475467" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      events: {
        onClick: (event, value) => {
          console.log("Billing Details icon clicked", event, value);
          
        },
      },
    },
    AcceptedByForwardis: {
      id: "AcceptedByForwardis",
      label: "Accepted By Forwardis",
      fieldType: "switch",
      width: "full",
      value: "",
      mandatory: true,
      visible: true,
      editable: true,
      order: 15,
    },
    ReInvoiceCost: {
      id: "ReInvoiceCost",
      label: "Re-Invoice Cost",
      fieldType: "switch",
      width: "full",
      value: "",
      mandatory: true,
      visible: true,
      editable: true,
      order: 16,
    },
    InvoiceTo: {
      id: "InvoiceTo",
      label: "Invoice To",
      fieldType: "lazyselect",
      width: "full",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 17,
      fetchOptions: fetchMaster("Cluster Init"),
    },

    FinacialComments: {
      id: "FinacialComments",
      label: "Financial Comments",
      fieldType: "textarea",
      width: "full",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 18,
    },
    MoreDetails: {
      id: "MoreDetails",
      label: "More Details",
      fieldType: "header",
      width: "full",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 19,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z" stroke="#475467" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 6H11M5 9H9" stroke="#475467" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      events: {
        onClick: (event, value) => {
          console.log("Billing Details icon clicked", event, value);
          // Toggle visibility of more details fields
          setShowMoreDetails(prev => !prev);
        },
      },
    },
    EndDate: {
      id: "EndDate",
      label: "End Date",
      fieldType: "text",
      width: "half",
      value: "",
      mandatory: false,
      visible: true, 
      editable: false,
      order: 20,
    },
    User: {
      id: "User",
      label: "User",
      fieldType: "text",
      width: "half",
      value: "",
      mandatory: false,
      visible: true, 
      editable: false,
      order: 21,
    },
    NextRevision: {
      id: "NextRevision",
      label: "Next Revision",
      fieldType: "text",
      width: "half",
      value: "",
      mandatory: false,
      visible: true, 
      editable: false,
      order: 22,
    },
    PlaceOfRevision: {
      id: "PlaceOfRevision",
      label: "Place Of Revision",
      fieldType: "text",
      width: "half",
      value: "",
      mandatory: false,
      visible: true, 
      editable: false,
      order: 23,
    },
    QCUserDefined1: {
      id: 'QCUserDefined1',
      label: 'QC Userdefined 1',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '', // <-- Set default dropdown value here
      // value: { dropdown: qcList1[0]?.id || '', input: '' }, // <-- Set default dropdown value here
      mandatory: false,
      visible: showMoreDetails, // Controlled by showMoreDetails state
      editable: true,
      order: 24,
      maxLength: 255,
      options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    QCUserDefined2: {
      id: 'QCUserDefined2',
      label: 'QC Userdefined 2',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '', // <-- Set default dropdown value here
      // value: { dropdown: qcList1[0]?.id || '', input: '' }, // <-- Set default dropdown value here
      mandatory: false,
      visible: showMoreDetails, // Controlled by showMoreDetails state
      editable: true,
      order: 25,
      maxLength: 255,
      options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    QCUserDefined3: {
      id: 'QCUserDefined3',
      label: 'QC Userdefined 3',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '', // <-- Set default dropdown value here
      // value: { dropdown: qcList1[0]?.id || '', input: '' }, // <-- Set default dropdown value here
      mandatory: false,
      visible: showMoreDetails, // Controlled by showMoreDetails state
      editable: true,
      order: 26,
      maxLength: 255,
      options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    Remarks1: {
      id: "Remarks1",
      label: "Remarks 1",
      fieldType: "text",
      width: "half",
      value: "",
      mandatory: false,
      visible: showMoreDetails, // Controlled by showMoreDetails state
      editable: true,
      order: 27,
    },
    Remarks2: {
      id: "Remarks2",
      label: "Remarks 2",
      fieldType: "text",
      width: "half",
      value: "",
      mandatory: false,
      visible: showMoreDetails, // Controlled by showMoreDetails state
      editable: true,
      order: 28,
    },
    Remarks3: {
      id: "Remarks3",
      label: "Remarks 3",
      fieldType: "text",
      width: "half",
      value: "",
      mandatory: false,
      visible: showMoreDetails, // Controlled by showMoreDetails state
      editable: true,
      order: 29,
    },
  });

  useImperativeHandle(ref, () => ({
    getWorkOrderValues: () => formRef.current?.getFormValues() || {},
  }));

  //All button functions and modals will be here
  const openWagonMoreDEtails = () => {
    setWagonMoreDetails(true);
  };
  const closeWagonMoreDEtails = () => {
    setWagonMoreDetails(false);
  };
  //slider
  const openOperationDetails = () => {
    setShowOperationDetails(true);
    console.log("clicked,showOperstionDetails", showOperstionDetails);
  };
  const closeOperationDetails = () => {
    setShowOperationDetails(false);
    console.log("clicked,showOperstionDetails", showOperstionDetails);
  };

  return (
    <AppLayout>
      <div className="main-content-h bg-gray-100">
        <div className="p-4 px-6 ">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="flex gap-4">
            {/* LEFT SECTION */}
            <div className="lg:col-span-1 w-2/6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="orderFormScroll p-4">
                  <DynamicPanel
                    ref={formRef}
                    panelId="WorkOrder"
                    panelTitle="Work Order Details"
                    // pass current orderType so config is reactive
                    panelConfig={workOrderPanelConfig(orderType)}
                    initialData={workOrderData}
                    panelSubTitle="Work Order Info"
                    className="my-custom-workorder-panel"
                  />
                </div>

                {/* Buttons Row */}
                <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200">
                  
                </div>
              </div>
            </div>
            <Button
              className=" mt-3 bg-blue-600 text-white"
              onClick={saveToZustand}
            >
              Save Work Order
            </Button>

            {/* RIGHT SECTION */}
            <div className="lg:col-span-1 w-4/6">
              {/* If NO resource groups */}
              {resourceGroups.length === 0 ? (
                <div className="rounded-lg p-8 flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-10 h-10 text-blue-500" />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    No Resource Group Added
                  </h3>

                  <p className="text-gray-500 text-center mb-6 text-sm">
                    Click the "Add" button to create a resource group.
                  </p>

                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={openOperationDetails}
                  >
                    Add
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      Resource Group Details
                      <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {resourceGroups.length}
                      </span>
                    </h2>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          placeholder="Search"
                          className="border border-gray-300 rounded text-sm px-3 py-1 w-48 h-9"
                        />
                        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                      </div>

                     
                    </div>
                  </div>
                </div>
              )}
            </div>
          
          </div>
        </div>
      </div>
      <SideDrawer
        isOpen={wagonMoreDetails}
        onClose={closeWagonMoreDEtails}
        title="irjgihgie"
        width="30%"
        isBack={false}
      >
        {/* Fix applied here */}
        <div className="flex flex-col h-full">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="border-b p-6 bg-[#F8F9FC] text-sm">
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                {[
                  ["Creation Date", "15-Mar-2025 10:00:00 AM"],
                  ["Created By", "William Joe"],
                  ["Modification Date", "15-Mar-2025 10:00:00 AM"],
                  ["Modified By", "Andrewson"],
                  ["End Date", "15-Sep-2025"],
                  ["User", "A. Mussy"],
                  ["Next Revision", "15-Mar-2027"],
                  ["Place of Revision", "LEU (RO)"],
                ].map(([label, value], i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F8F9FC]">
              {[1, 2, 3].map((n) => (
                <div key={n} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QC Userdefined {n}
                  </label>

                  <div className="flex items-center">
                    <div className="relative w-16">
                      <select className="appearance-none w-full border border-gray-300 rounded-md px-3 py-[10px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>QC</option>
                        <option>Value 1</option>
                        <option>Value 2</option>
                      </select>
                      <svg
                        className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter Value"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-[10px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}

              {[1, 2, 3].map((n) => (
                <div key={n} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks {n}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Remarks"
                    className="w-full border border-gray-300 rounded-md px-3 py-[10px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fixed footer */}
          <div className="bg-white border-t border-gray-300 p-3 flex justify-end gap-3 mb-16">
            <button className="px-4 border border-gray-300 rounded-md hover:bg-gray-100">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      </SideDrawer>

      <WorkOrderOperationDetails 
  onClose={closeOperationDetails} 
  value={showOperstionDetails} 
/>

    </AppLayout>
  );
});

export default WorkOrderForm;
