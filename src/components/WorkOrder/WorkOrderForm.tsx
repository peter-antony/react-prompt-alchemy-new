import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  useEffect,
} from "react";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { Paperclip, BookX, Link, Copy, Shuffle, Plus } from "lucide-react";
import { debounce } from "lodash";
import type { PanelConfig } from "@/types/dynamicPanel";
import { MapPinned } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { quickOrderService } from "@/api/services";
// import { SideDrawer } from "@/components/ui/side-drawer";
import { SideDrawer } from "@/components/Common/SideDrawer";
import { InputDropdown } from "@/components/ui/input-dropdown";
import WorkOrderOperationDetails from "./WorkOrderOperationDetails";
import { buildWorkOrderPayload } from "@/lib/utils";
import { useWorkOrderStore } from "@/stores/workOrderStore";
import { SmartGridPlus } from "../SmartGrid/SmartGridPlus";
import { GridColumnConfig } from "@/types/smartgrid";
import BillingDetails from "./BillingDetails";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams for URL search parameters

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
  const [searchParams] = useSearchParams(); // Import useSearchParams
  const workOrderNo = searchParams.get("id"); // Get the work order number from the URL

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
  const [showBillingDetails, setShowBillingDetails] = useState(false); // State for billing details drawer
  const locationDetailsRef = useRef<DynamicPanelRef>(null);
  const scheduleDetailsRef = useRef<DynamicPanelRef>(null);
  const { workOrder, searchWorkOrder, loading } = useWorkOrderStore();

  const updateHeader = useWorkOrderStore((state) => state.updateHeader);
  const saveWorkOrder = useWorkOrderStore.getState().saveWorkOrder;

  const handleSave = () => {
    saveWorkOrder();
  };
  useEffect(() => {
    // Fetch work order data when workOrderNo changes
    if (workOrderNo) {
      const payload = {
        context: {
          MessageID: "12345",
          MessageType: "Work Order Selection",
          OUID: 4,
          Role: "ramcorole",
          UserID: "ramcouser",
        },
        SearchCriteria: {
          WorkOrderNo: workOrderNo,
          AdditionalFilter: [
            {
              FilterName: "ServiceType",
              FilterValue: "Standard",
            },
          ],
        },
      };

      searchWorkOrder(payload);
    }
  }, [workOrderNo]);

  useEffect(() => {
    if (workOrder?.Header) {
      setWorkOrderData(workOrder.Header);
    }
  }, []);

  useEffect(() => {
    const loadQcMasters = async () => {
      try {
        const [res1, res2, res3]: any = await Promise.all([
          quickOrderService.getMasterCommonData({
            messageType: "Work Order QC1 Init",
          }),
          quickOrderService.getMasterCommonData({
            messageType: "Work Order QC2 Init",
          }),
          quickOrderService.getMasterCommonData({
            messageType: "Work Order QC3 Init",
          }),
        ]);
        setqcList1(JSON.parse(res1?.data?.ResponseData || "[]"));
        setqcList2(JSON.parse(res2?.data?.ResponseData || "[]"));
        setqcList3(JSON.parse(res3?.data?.ResponseData || "[]"));
      } catch (err) {
        console.error("QC API failed", err);
      }
    };
    loadQcMasters();
  }, []);

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
  const getQcOptions = (list: any[]) =>
    list?.filter((qc) => qc.id).map((qc) => ({ label: qc.id, value: qc.id })) ||
    [];
  const workOrderPanelConfig = (currentOrderType: string): PanelConfig => ({
    EquipmentType: {
      id: "EquipmentType",
      label: "EquipmentType",
      fieldType: "radio",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.EquipmentType,
      options: [
        { label: "Wagon", value: "Wagon" },
        { label: "Container", value: "Container" },
      ],
      order: 1,
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;
          updateHeader("EquipmentType", val);
          updateHeader("ModeFlag", "Update"); // ⚠️ correct key
          console.log("Work Order Type changed:", val);
        },
      },
    },

    WagonCondainterID: {
      id: "WagonCondainterID",
      label: "Wagon/Container ID",
      fieldType: "lazyselect",
      width: "half",
      mandatory: true,
      visible: true,
      editable: true,
      value: workOrder?.Header?.EquipmentID,
      order: 2,
      fetchOptions:
        currentOrderType === "Wagon"
          ? fetchMaster("Wagon id Init")
          : fetchMaster("Container id Init"),
      events: {
        onChange: (val) => {
          // const updateHeader = useWorkOrderStore.getState().updateHeader;
          // updateHeader("EquipmentType", val);
          // updateHeader("ModeFlag", "Update"); // ⚠️ correct key
          const updateHeader = useWorkOrderStore.getState().updateHeader;
          const [id, desc] = val.value.split(" || ").map((v) => v.trim());
          updateHeader("EquipmentID", id);
          updateHeader("EquipmentDescription", desc);
          console.log("Work Order Type changed:", val);
        },
      },
    },

    SuplierContract: {
      id: "SuplierContract",
      label: "Supplier Contract No",
      fieldType: "lazyselect",
      width: "half",
      mandatory: true,
      visible: true,
      editable: true,
      value: workOrder?.Header?.SupplierContractDescription,
      order: 3,
      fetchOptions: fetchMaster("Contract Init", [
        { FilterName: "ContractType", FilterValue: "Buy" },
      ]),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;

          const [id, desc] = val.value.split(" || ").map((v) => v.trim());

          updateHeader("SupplierContractID", id);
          updateHeader("SupplierContractDescription", desc);
        },
        // onChange: (val) => {
        //   const updateHeader = useWorkOrderStore.getState().updateHeader;

        //   // If user-selected value contains " || ", extract ID + Description
        //   if (val?.value?.includes(" || ")) {
        //     const [id, desc] = val.value.split(" || ").map((v) => v.trim());
        //     updateHeader("SupplierContractID", id);
        //     updateHeader("SupplierContractDescription", desc);

        //     // Keep full label in UI so next change doesn't break
        //     updateHeader("product", `${id} || ${desc}`);
        //   } else {
        //     // If value contains only ID
        //     updateHeader("SuplierContract", val.value);
        //   }
        // },
      },
    },

    CustomerContract: {
      id: "CustomerContract",
      label: "Customer Contract No./Business Case",
      fieldType: "lazyselect",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.CustomerContractID,
      order: 4,
      fetchOptions: fetchMaster("Contract Init", [
        { FilterName: "ContractType", FilterValue: "Sell" },
      ]),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;

          const [id, desc] = val.value.split(" || ").map((v) => v.trim());

          updateHeader("CustomerContractID", id);
          updateHeader("CustomerContractDescription", desc);
        },
      },
    },

    AppoinmentDate: {
      id: "AppoinmentDate",
      label: "Appointment Date",
      fieldType: "date",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.AppointmentDate
        ? workOrder.Header.AppointmentDate.slice(0, 10) // "YYYY-MM-DD"
        : "",
      order: 6,
      events: {
        onChange: (val) => {
          console.log("Event Date changed:", val);

          const updateHeader = useWorkOrderStore.getState().updateHeader;
          updateHeader("EventDate", val);

          setTimeout(() => {
            console.log(
              "Updated EventDate:",
              useWorkOrderStore.getState().workOrder?.Header?.EventDate
            );
          }, 0);
        },
      },
    },

    ClusterMarket: {
      id: "ClusterMarket",
      label: "Cluster/Market",
      fieldType: "lazyselect",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.Cluster,
      order: 7,
      fetchOptions: fetchMaster("Cluster Init"),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;

          const [id, desc] = val.value.split(" || ").map((v) => v.trim());

          updateHeader("Cluster", id);
          updateHeader("ClusterDescription", desc);
        },
      },
    },

    product: {
      id: "product",
      label: "Product",
      fieldType: "lazyselect",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.ProductID,
      order: 8,
      fetchOptions: fetchMaster("Product ID Init"),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;

          if (val?.value?.includes(" || ")) {
            const [id, desc] = val.value.split(" || ").map((v) => v.trim());
            updateHeader("ProductID", id);
            updateHeader("ProductDescription", desc);
            updateHeader("product", `${id} || ${desc}`);
          } else {
            updateHeader("ProductID", val.value);
          }
        },
      },
    },

    UNCODE: {
      id: "UNCODE",
      label: "UN Code",
      fieldType: "lazyselect",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.UNCodeID,
      order: 9,
      fetchOptions: fetchMaster("UN Code Init"),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;

          const [id, desc] = val.value.split(" || ").map((v) => v.trim());

          updateHeader("Cluster", id);
          updateHeader("ClusterDescription", desc);
        },
      },
    },

    LoadType: {
      id: "LoadType",
      label: "Load Type",
      fieldType: "radio",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.LoadType?.IsLoaded === "1" ? "1" : "0",
      options: [
        { label: "Loaded", value: "1" },
        { label: "Empty", value: "0" },
      ],
      order: 10,

      events: {
        onChange: (val) => {
          const loadTypeObj = {
            IsLoaded: val === "1" ? "1" : "0",
            IsEmpty: val === "0" ? "1" : "0",
          };

          console.log("📌 Final LoadType JSON:", {
            LoadType: loadTypeObj,
          });
          updateHeader("LoadType", loadTypeObj);
        },
      },
    },

    Hazardous: {
      id: "Hazardous",
      label: "Hazardous",
      fieldType: "switch",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.Hazardous === "1",
      order: 11,

      events: {
        onChange: (val) => {
          const hazardousValue = val ? "1" : "0";

          const updateHeader = useWorkOrderStore.getState().updateHeader;
          updateHeader("Hazardous", hazardousValue);
          updateHeader("ModeFlag", "Update");
        },
      },
    },

    EventDate: {
      id: "EventDate",
      label: "Event Date",
      fieldType: "date",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.EventDate,
      order: 12,
      events: {
        onChange: (val) => {
          console.log("Event Date changed:", val);

          const updateHeader = useWorkOrderStore.getState().updateHeader;
          updateHeader("EventDate", val);

          setTimeout(() => {
            console.log(
              "Updated EventDate:",
              useWorkOrderStore.getState().workOrder?.Header?.EventDate
            );
          }, 0);
        },
      },
    },

    PlaceOfEvent: {
      id: "PlaceOfEvent",
      label: "Place Of Event",
      fieldType: "lazyselect",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.PlaceOfEventID,
      order: 13,
      fetchOptions: fetchMaster("Location Init"),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;

          const [id, desc] = val.value.split(" || ").map((v) => v.trim());

          updateHeader("PlaceOfEventID", id);
          updateHeader("PlaceOfEventIDDescription", desc);
        },
      },
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z"
            stroke="#475467"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 6H11M5 9H9"
            stroke="#475467"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      events: {
        onClick: (event, value) => {
          console.log("Billing Details icon clicked", event, value);
          setShowBillingDetails(true);
        },
      },
    },

    /** Billing */
    AcceptedByForwardis: {
      id: "AcceptedByForwardis",
      label: "Accepted By Forwardis",
      fieldType: "switch",
      width: "full",
      mandatory: true,
      visible: true,
      editable: true,
      value:
        workOrder?.Header?.BillingHeaderDetails?.IsAcceptedByForwardis === "1",
      order: 15,
      // events: {
      //   onChange: (val) =>
      //     updateHeader("BillingHeaderDetails", {
      //       ...workOrder?.Header?.BillingHeaderDetails,
      //       IsAcceptedByForwardis: val ? "1" : "0",
      //       ModeFlag: "Update",
      //     }),
      // },
    },

    ReInvoiceCost: {
      id: "ReInvoiceCost",
      label: "Re-Invoice Cost",
      fieldType: "switch",
      width: "full",
      mandatory: true,
      visible: true,
      editable: true,
      value: workOrder?.Header?.BillingHeaderDetails?.IsReinvoiceCost === "1",
      order: 16,
      // events: {
      //   onChange: (val) =>
      //     updateHeader("BillingHeaderDetails", {
      //       ...workOrder?.Header?.BillingHeaderDetails,
      //       IsReinvoiceCost: val ? "1" : "0",
      //       ModeFlag: "Update",
      //     }),
      // },
    },

    InvoiceTo: {
      id: "InvoiceTo",
      label: "Invoice To",
      fieldType: "lazyselect",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.BillingHeaderDetails?.InvoiceTo,
      order: 17,
      fetchOptions: fetchMaster("Cluster Init"),
      // events: {
      //   onChange: (val) =>
      //     updateHeader("BillingHeaderDetails", {
      //       ...workOrder?.Header?.BillingHeaderDetails,
      //       InvoiceTo: val,
      //       ModeFlag: "Update",
      //     }),
      // },
    },

    FinacialComments: {
      id: "FinacialComments",
      label: "Financial Comments",
      fieldType: "textarea",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
      value: "",
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z"
            stroke="#475467"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 6H11M5 9H9"
            stroke="#475467"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      events: {
        onClick: (event, value) => {
          console.log("Billing Details icon clicked", event, value);
          // Toggle visibility of more details fields
          setShowMoreDetails((prev) => !prev);
        },
      },
    },
    EndDate: {
      id: "EndDate",
      label: "End Date",
      fieldType: "text",
      width: "half",
      value: workOrder?.Header?.EndDate,
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
      value: workOrder?.Header?.User,
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
      value: workOrder?.Header?.NextRevisionDate,
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
      value: workOrder?.Header?.PlaceOfRevisionDescription,
      mandatory: false,
      visible: true,
      editable: false,
      order: 23,
    },

    QCUserDefined1: {
      id: "QCUserDefined1",
      label: "QC Userdefined 1",
      fieldType: "inputdropdown",
      width: "half",
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      value: {
        dropdown: workOrder?.Header?.QC1Code || "",
        input: workOrder?.Header?.QC1Value || "",
      },
      order: 24,
      options: getQcOptions(qcList1),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;
          console.log("change", val);
          updateHeader("QC1Code", val?.dropdown || "");
          updateHeader("QC1Value", val?.input || "");
        },
      },
    },

    QCUserDefined2: {
      id: "QCUserDefined2",
      label: "QC Userdefined 2",
      fieldType: "inputdropdown",
      width: "half",
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      value: {
        dropdown: workOrder?.Header?.QC2Code || "",
        input: workOrder?.Header?.QC2Value || "",
      },
      order: 25,
      options: getQcOptions(qcList2),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;
          updateHeader("QC2Code", val?.dropdown || "");
          updateHeader("QC2Value", val?.input || "");
        },
      },
    },

    QCUserDefined3: {
      id: "QCUserDefined3",
      label: "QC Userdefined 3",
      fieldType: "inputdropdown",
      width: "half",
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      value: {
        dropdown: workOrder?.Header?.QC3Code || "",
        input: workOrder?.Header?.QC3Value || "",
      },
      order: 26,
      options: getQcOptions(qcList3),
      events: {
        onChange: (val) => {
          const updateHeader = useWorkOrderStore.getState().updateHeader;
          updateHeader("QC3Code", val?.dropdown || "");
          updateHeader("QC3Value", val?.input || "");
        },
      },
    },

    PlaceOfEvent2: {
      id: "PlaceOfEvent2",
      label: "PlaceOfEvent2",
      fieldType: "lazyselect",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.PlaceOfEventID,
      order: 26,
      fetchOptions: fetchMaster("Work Order QC1 Init"),
    },

    Remarks1: {
      id: "Remarks1",
      label: "Remarks 1",
      fieldType: "textarea",
      width: "half",
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      value: workOrder?.Header?.Remarks1,
      order: 27,
      events: {
        onChange: (val) => {
          console.log("val", val), updateHeader("Remarks1", val);
        },
      },
    },

    Remarks2: {
      id: "Remarks2",
      label: "Remarks 2",
      fieldType: "text",
      width: "half",
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      value: workOrder?.Header?.Remarks2,
      order: 28,
       events: {
        onChange: (val) => {
          console.log("val", val), updateHeader("Remarks2", val);
        },
      },
    },

    Remarks3: {
      id: "Remarks3",
      label: "Remarks 3",
      fieldType: "text",
      width: "half",
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      value: workOrder?.Header?.Remarks3,
      order: 29,
      // events: { onChange: (val) => updateHeader("Remarks3", val) },
    },
  });

  useImperativeHandle(ref, () => ({
    getWorkOrderValues: () => {
      const mainFormData = formRef.current?.getFormValues() || {};
      const locationData = locationDetailsRef.current?.getFormValues?.() || {};
      return {
        ...mainFormData,
        Location: locationData,
      };
    },
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
  //mobile
  const locationPanelConfig: PanelConfig = {
    Origin: {
      id: "Origin",
      label: "Origin",
      fieldType: "lazyselect",
      width: "six",
      value: workOrder?.WorkorderSchedule?.OriginID,
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      fetchOptions: fetchMaster("Location Init"),
    },
    OutboardDest: {
      id: "OutboardDest",
      label: "Outboard Destination",
      fieldType: "lazyselect",
      width: "six",
      value: workOrder?.WorkorderSchedule?.OutBoundDestinationID,
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      fetchOptions: fetchMaster("Location Init"),
    },
    RUForward: {
      id: "RUForward",
      label: "RU Forward",
      fieldType: "lazyselect",
      width: "six",
      value: workOrder?.WorkorderSchedule?.RUForwardID,
      visible: true,
      mandatory: false,
      editable: true,
      order: 3,
      fetchOptions: fetchMaster("Location Init"),
    },
    ReturnDest: {
      id: "ReturnDest",
      label: "Return Destination",
      fieldType: "lazyselect",
      width: "six",
      value: workOrder?.WorkorderSchedule?.ReturnDestinationID,
      visible: true,
      mandatory: false,
      editable: true,
      order: 4,
      fetchOptions: fetchMaster("Location Init"),
    },
    RUReturn: {
      id: "RUReturn",
      label: "RU Return",
      fieldType: "lazyselect",
      width: "six",
      value: workOrder?.WorkorderSchedule?.RUReturnID,
      visible: true,
      mandatory: false,
      editable: true,
      order: 5,
      fetchOptions: fetchMaster("Location Init"),
    },
  };

  const mobileLocationPanelConfig: PanelConfig = {
    PlaceOfOperation: {
      id: "PlaceOfOperation",
      label: "PlaceOfOperation",
      fieldType: "lazyselect",
      width: "four",
      value: workOrder?.WorkorderSchedule?.OriginID,
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      fetchOptions: fetchMaster("Location Init"),
    },
    Provider: {
      id: "Provider",
      label: "Provider",
      fieldType: "lazyselect",
      width: "four",
      value: workOrder?.WorkorderSchedule?.OutBoundDestinationID,
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      fetchOptions: fetchMaster("Location Init"),
    },
    ExpectedDate: {
      id: "ExpectedDate",
      label: "Expected Date",
      fieldType: "date",
      width: "four",
      value: workOrder?.WorkorderSchedule?.RUForwardID,
      visible: true,
      mandatory: false,
      editable: true,
      order: 3,
    },
    ActualDate: {
      id: "ActualDate",
      label: "Actual Date",
      fieldType: "date",
      width: "four",
      value: workOrder?.WorkorderSchedule?.ReturnDestinationID,
      visible: true,
      mandatory: false,
      editable: true,
      order: 4,
      fetchOptions: fetchMaster("Location Init"),
    },
    RUReturn: {
      id: "Comments",
      label: "Comments",
      fieldType: "text",
      width: "half",
      value: workOrder?.WorkorderSchedule?.RUReturnID,
      visible: true,
      mandatory: false,
      editable: true,
      order: 5,
    },
  };

  const SchedulePanelConfig: PanelConfig = {
    DepartureDate: {
      id: "DepartureDate",
      label: "DepartureDate",
      fieldType: "date",
      width: "six",
      value: workOrder?.WorkorderSchedule?.DepartureDate,
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
    },
    Arrivaldate: {
      id: "Arrivaldate",
      label: "Arrival date",
      fieldType: "date",
      width: "six",
      value: workOrder?.WorkorderSchedule?.ArrivalDate,
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
    },
    EntryDate: {
      id: "EntryDate",
      label: "Entry Date",
      fieldType: "date",
      width: "six",
      value: workOrder?.WorkorderSchedule?.EntryDate,
      visible: true,
      mandatory: false,
      editable: true,
      order: 3,
    },
    ScheduledExitDate: {
      id: "ScheduledExitDate",
      label: "Scheduled Exit Date",
      fieldType: "date",
      width: "six",
      value: workOrder?.WorkorderSchedule?.ScheduledExitDate,
      visible: true,
      mandatory: false,
      editable: true,
      order: 4,
    },
    ActualExitDate: {
      id: "ActualExitDate",
      label: "Actual Exit Date",
      fieldType: "date",
      width: "six",
      value: workOrder?.WorkorderSchedule?.ScheduledExitDate,
      visible: true,
      mandatory: false,
      editable: true,
      order: 5,
    },
    ReturnToOperationDate: {
      id: "ReturnToOperationDate",
      label: "Return To Operation Date",
      fieldType: "date",
      width: "half",
      value: workOrder?.WorkorderSchedule?.ScheduledExitDate,
      visible: true,
      mandatory: false,
      editable: true,
      order: 5,
    },
    Comments: {
      id: "Comments",
      label: "Comments",
      fieldType: "text",
      width: "half",
      value: workOrder?.WorkorderSchedule?.Comments,
      visible: true,
      mandatory: false,
      editable: true,
      order: 6,
    },
  };

  useImperativeHandle(ref, () => ({
    getWorkOrderValues: () => {
      const mainFormData = formRef.current?.getFormValues() || {};
      const locationData = locationDetailsRef.current?.getFormValues?.() || {};
      return {
        ...mainFormData,
        Location: locationData,
      };
    },
  }));

  const updateWorkOrderHeaderDebounced = debounce((updatedHeader) => {
    useWorkOrderStore.setState((state) => ({
      workOrder: {
        ...state.workOrder,
        Header: {
          ...state.workOrder.Header,
          ...updatedHeader,
          ModeFlag: "Update",
        },
      },
    }));
  }, 500);

  const buttonClass = `inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm`;
  const buttonCancel =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm";

  const columns: GridColumnConfig[] = [
    {
      key: "productName",
      label: "Product Name",
      type: "String",
      sortable: true,
      filterable: true,
      editable: true,
      width: 200,
    },
    {
      key: "quantity",
      label: "Quantity",
      type: "Integer",
      sortable: true,
      filterable: true,
      editable: true,
      width: 100,
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      type: "Integer",
      sortable: true,
      filterable: true,
      editable: true,
      width: 120,
    },
    {
      key: "category",
      label: "Category",
      type: "Select",
      sortable: true,
      filterable: true,
      editable: true,
      width: 120,
      options: ["Electronics", "Furniture", "Office Supplies", "Tools"],
    },
    {
      key: "status",
      label: "Status",
      type: "Badge",
      sortable: true,
      filterable: true,
      width: 100,
      statusMap: {
        Active: "green",
        "Low Stock": "orange",
        "Out of Stock": "red",
      },
    },
    {
      key: "dateAdded",
      label: "Date Added",
      type: "Date",
      sortable: true,
      filterable: true,
      editable: true,
      width: 120,
    },
    {
      key: "deliveryTime",
      label: "Delivery Time",
      type: "Time",
      sortable: true,
      filterable: true,
      editable: true,
      width: 130,
    },
    {
      key: "supplier",
      label: "Supplier",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      width: 150,
      fetchOptions: fetchMaster("Supplier Init"),
      // fetchOptions: async ({ searchTerm, offset, limit }) => {
      //   // Mock async data fetching - simulate API call
      //   await new Promise((resolve) => setTimeout(resolve, 300));
      //   const allSuppliers = [
      //     "TechCorp",
      //     "FurniCorp",
      //     "MobileTech",
      //     "OfficeMax",
      //     "ToolMasters",
      //     "ElectroHub",
      //     "SmartDevices",
      //     "HomeGoods",
      //   ];
      //   const filtered = allSuppliers.filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      //   return filtered.slice(offset, offset + limit).map((s) => ({ id: s, name: s }));
      // },
      onChange: (value, rowData) => {
        console.log("Supplier changed:", value, "Row data:", rowData);
      },
    },
    {
      key: "specifications",
      label: "Specifications",
      type: "MultiselectLazySelect",
      sortable: false,
      filterable: false,
      editable: true,
      width: 200,
      fetchOptions: fetchMaster("Location Init"),
      // fetchOptions: async ({ searchTerm, offset, limit }) => {
      //   // Mock async data fetching for specifications
      //   await new Promise((resolve) => setTimeout(resolve, 300));
      //   const allSpecs = [
      //     { id: "RAM-16GB", name: "RAM: 16GB DDR4" },
      //     { id: "RAM-32GB", name: "RAM: 32GB DDR4" },
      //     { id: "Storage-512GB", name: "Storage: 512GB SSD" },
      //     { id: "Storage-1TB", name: "Storage: 1TB SSD" },
      //     { id: "Processor-i7", name: "Processor: Intel i7" },
      //     { id: "Processor-i9", name: "Processor: Intel i9" },
      //     { id: "Screen-6.5", name: 'Screen: 6.5" OLED' },
      //     { id: "Screen-7", name: 'Screen: 7" AMOLED' },
      //     { id: "Camera-108MP", name: "Camera: 108MP Triple" },
      //     { id: "Camera-200MP", name: "Camera: 200MP Quad" },
      //     { id: "Battery-4500", name: "Battery: 4500mAh" },
      //     { id: "Battery-5000", name: "Battery: 5000mAh" },
      //     { id: "Material-Mesh", name: "Material: Mesh Back" },
      //     { id: "Material-Leather", name: "Material: Leather" },
      //     { id: "Height-Adj", name: "Height: Adjustable" },
      //     { id: "Wheels-Caster", name: "Wheels: Caster Wheels" },
      //   ];
      //   const filtered = allSpecs.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      //   return filtered.slice(offset, offset + limit);
      // },
      onChange: (value, rowData) => {
        console.log("Specifications changed:", value, "Row data:", rowData);
      },
    },
    {
      key: "reviews",
      label: "Reviews",
      type: "SubRow",
      sortable: false,
      filterable: false,
      width: 150,
      subRowColumns: [
        { key: "reviewer", label: "Reviewer", type: "Text", width: 80 },
        { key: "rating", label: "Rating", type: "Text", width: 60 },
        { key: "comment", label: "Comment", type: "Text", width: 150 },
      ],
    },
    // Subrow columns (collapsed by default)
    {
      key: "notes",
      label: "Notes",
      type: "Text",
      sortable: false,
      filterable: false,
      editable: true,
      width: 200,
      subRow: true,
    },
    {
      key: "internalCode",
      label: "Internal Code",
      type: "String",
      sortable: false,
      filterable: false,
      editable: true,
      width: 150,
      subRow: true,
    },
    {
      key: "warehouse",
      label: "Warehouse",
      type: "Select",
      sortable: false,
      filterable: false,
      editable: true,
      width: 150,
      subRow: true,
      options: ["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D"],
    },
    {
      key: "actions",
      label: "Actions",
      type: "Text",
      sortable: false,
      filterable: false,
      width: 120,
    },
  ];

  // Mock data for the demo
  const initialData = [
    {
      id: "1",
      productName: "Laptop Pro",
      quantity: null,
      unitPrice: 1299.99,
      category: "Electronics",
      status: "Active",
      dateAdded: "2024-01-15",
      deliveryTime: "14:30",
      supplier: "TechCorp",
      specifications: [
        { id: "RAM-16GB", name: "RAM: 16GB DDR4" },
        { id: "Storage-512GB", name: "Storage: 512GB SSD" },
        { id: "Processor-i7", name: "Processor: Intel i7" },
      ],
      reviews: [
        { reviewer: "John D.", rating: 5, comment: "Excellent performance" },
        { reviewer: "Jane S.", rating: 4, comment: "Great value for money" },
      ],
      notes: "Premium product with extended warranty",
      internalCode: "TECH-LAP-001",
      warehouse: "Warehouse A",
    },
    {
      id: "2",
      productName: "Office Chair",
      quantity: 12,
      unitPrice: 199.99,
      category: "Furniture",
      status: "Active",
      dateAdded: "2024-01-10",
      deliveryTime: "10:00",
      supplier: "FurniCorp",
      specifications: [
        { id: "Material-Mesh", name: "Material: Mesh Back" },
        { id: "Height-Adj", name: "Height: Adjustable" },
        { id: "Wheels-Caster", name: "Wheels: Caster Wheels" },
      ],
      reviews: [
        { reviewer: "Mike R.", rating: 4, comment: "Very comfortable" },
      ],
      notes: "Ergonomic design, suitable for long hours",
      internalCode: "FURN-CHR-002",
      warehouse: "Warehouse B",
    },
    {
      id: "3",
      productName: "Smartphone X",
      quantity: 8,
      unitPrice: 899.99,
      category: "Electronics",
      status: "Low Stock",
      dateAdded: "2024-01-08",
      deliveryTime: "16:45",
      supplier: "MobileTech",
      specifications: [
        { id: "Screen-6.5", name: 'Screen: 6.5" OLED' },
        { id: "Camera-108MP", name: "Camera: 108MP Triple" },
        { id: "Battery-4500", name: "Battery: 4500mAh" },
      ],
      reviews: [
        { reviewer: "Sarah T.", rating: 5, comment: "Amazing camera quality" },
      ],
      notes: "Latest model with 5G connectivity",
      internalCode: "MOB-PHN-003",
      warehouse: "Warehouse A",
    },
  ];

  const [data, setData] = useState(initialData);
  const handleAddRow = async (newRow: any) => {
    console.log("Adding new row:", newRow);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleEditRow = async (editedRow: any, rowIndex: number) => {
    console.log("Editing row:", editedRow, "at index:", rowIndex);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleDeleteRow = async (row: any, rowIndex: number) => {
    console.log("Deleting row:", row, "at index:", rowIndex);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const defaultRowValues = {
    productName: "",
    quantity: 0,
    unitPrice: 0,
    category: "Electronics",
    status: "Active",
    dateAdded: new Date().toISOString().split("T")[0],
    deliveryTime: "09:00",
    supplier: "",
    specifications: [],
    reviews: [{ reviewer: "", rating: 5, comment: "" }],
    notes: "",
    internalCode: "",
    warehouse: "Warehouse A",
  };

  const validationRules = {
    requiredFields: ["productName", "supplier"],
    maxLength: {
      productName: 50,
      supplier: 30,
    },
    customValidationFn: (values: Record<string, any>) => {
      const errors: Record<string, string> = {};

      if (values.quantity && values.quantity < 0) {
        errors.quantity = "Quantity must be positive";
      }

      if (values.unitPrice && values.unitPrice < 0) {
        errors.unitPrice = "Unit price must be positive";
      }

      return errors;
    },
  };

  return (
    <>
      {loading ? (
        <>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-b-2 border-gray-200"></div>
              <div className="text-sm text-gray-600">
                Loading equipment data...
              </div>
            </div>
          </div>
        </>
      ) : (
        <AppLayout>
          <div className="main-content-h bg-gray-100">
            <div className="p-4 px-6 ">
              <div className="hidden md:block">
                <Breadcrumb items={breadcrumbItems} />
              </div>

              <div className="flex gap-4">
                <div className="lg:col-span-1 w-2/6">
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="orderFormScroll p-4">
                      <DynamicPanel
                        ref={formRef}
                        panelId="WorkOrder"
                        panelTitle="Work Order Details"
                        panelConfig={workOrderPanelConfig(orderType)}
                        initialData={workOrder?.Header}
                        panelSubTitle="Work Order Info"
                        className="my-custom-workorder-panel"
                        onDataChange={(updatedHeader) => {
                          if (
                            "QCUserDefined1" in updatedHeader ||
                            "QCUserDefined2" in updatedHeader ||
                            "QCUserDefined3" in updatedHeader ||
                            "Remarks1" in updatedHeader ||
                            "Remarks2" in updatedHeader ||
                            "Remarks3" in updatedHeader
                          ) {
                            return;
                          }
                          const mapLazyHeader = (field, idKey, descKey) => {
                           

                            const value = updatedHeader[field];

                            if (!value) return;

                            // Only split when the value contains " || "
                            if (value.includes(" || ")) {
                              const [id, desc] = value
                                .split(" || ")
                                .map((v) => v.trim());
                              updatedHeader[idKey] = id;
                              updatedHeader[descKey] = desc;

                              // Keep full string in UI value so next time does not break
                              updatedHeader[field] = `${id} || ${desc}`;
                            }
                          };

                          /** Equipment */
                          if (
                            updatedHeader.WagonCondainterID?.includes(" || ")
                          ) {
                            const [id, desc] =
                              updatedHeader.WagonCondainterID.split(" || ").map(
                                (v) => v.trim()
                              );
                            updatedHeader.EquipmentID = id;
                            updatedHeader.EquipmentDescription = desc;
                            updatedHeader.WagonCondainterID = `${id} || ${desc}`;
                          }

                          /** Load Type */
                          if (updatedHeader.LoadType) {
                            const val = updatedHeader.LoadType;
                            updatedHeader.LoadType = {
                              IsLoaded: val === "1" ? 1 : 0,
                              IsEmpty: val === "0" ? 1 : 0,
                            };
                          }

                          /** Contract Mappings */
                          if (updatedHeader.SuplierContract?.includes(" || ")) {
                            const [id, desc] =
                              updatedHeader.SuplierContract.split(" || ").map(
                                (v) => v.trim()
                              );
                            updatedHeader.SupplierContractID = id;
                            updatedHeader.SupplierContractDescription = desc;
                            updatedHeader.SuplierContract = `${id} || ${desc}`;
                          }

                          if (
                            updatedHeader.CustomerContract?.includes(" || ")
                          ) {
                            const [id, desc] =
                              updatedHeader.CustomerContract.split(" || ").map(
                                (v) => v.trim()
                              );
                            updatedHeader.CustomerContractID = id;
                            updatedHeader.CustomerContractDescription = desc;
                            updatedHeader.CustomerContract = `${id} || ${desc}`;
                          }

                          /** Generic dropdowns */
                          mapLazyHeader(
                            "ClusterMarket",
                            "Cluster",
                            "ClusterDescription"
                          );
                          mapLazyHeader(
                            "product",
                            "ProductID",
                            "ProductDescription"
                          );
                          mapLazyHeader(
                            "UNCODE",
                            "UNCodeID",
                            "UNCodeDescription"
                          );
                          mapLazyHeader(
                            "PlaceOfEvent",
                            "PlaceOfEventID",
                            "PlaceOfEventIDDescription"
                          );

                          updateWorkOrderHeaderDebounced(updatedHeader);
                        }}
                      />
                    </div>

                    {/* Buttons Row */}
                    <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200"></div>
                  </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="lg:col-span-1 w-4/6">
                  <div className="bg-white rounded-lg border border-gray-200 mb-6 p-4">
                    <SmartGridPlus
                      columns={columns}
                      data={data}
                      gridTitle="Product Inventory"
                      inlineRowAddition={true}
                      inlineRowEditing={true}
                      onAddRow={handleAddRow}
                      onEditRow={handleEditRow}
                      onDeleteRow={handleDeleteRow}
                      defaultRowValues={defaultRowValues}
                      validationRules={validationRules}
                      addRowButtonLabel="Add Product"
                      addRowButtonPosition="top-left"
                      paginationMode="pagination"
                    />
                  </div>
                  <div className="rounded-lg pb-4 px-1 flex flex-col h-full">
                    <div className="">
                      <DynamicPanel
                        ref={locationDetailsRef}
                        panelId="LocationPanel"
                        panelTitle="Location Details"
                        panelIcon={
                          <MapPinned className="w-5 h-5 text-blue-500" />
                        }
                        panelConfig={locationPanelConfig}
                        collapsible={true}
                        initialData={workOrderData?.Location || {}}
                        onDataChange={(updatedSchedule) => {
                          // Send directly to store
                          useWorkOrderStore.setState((state) => ({
                            workOrder: {
                              ...state.workOrder,
                              WorkorderSchedule: {
                                ...state.workOrder.WorkorderSchedule,
                                ...updatedSchedule,
                                ModeFlag:
                                  state.workOrder.WorkorderSchedule
                                    ?.ModeFlag === "NoChange"
                                    ? "Update"
                                    : state.workOrder.WorkorderSchedule
                                        ?.ModeFlag,
                              },
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className="">
                      <DynamicPanel
                        ref={locationDetailsRef}
                        panelId="LocationPanel"
                        panelTitle="Location Details"
                        panelIcon={
                          <MapPinned className="w-5 h-5 text-blue-500" />
                        }
                        panelConfig={mobileLocationPanelConfig}
                        collapsible={true}
                        initialData={workOrderData?.Location || {}}
                        onDataChange={(updatedSchedule) => {
                          // Send directly to store
                          useWorkOrderStore.setState((state) => ({
                            workOrder: {
                              ...state.workOrder,
                              WorkorderSchedule: {
                                ...state.workOrder.WorkorderSchedule,
                                ...updatedSchedule,
                                ModeFlag:
                                  state.workOrder.WorkorderSchedule
                                    ?.ModeFlag === "NoChange"
                                    ? "Update"
                                    : state.workOrder.WorkorderSchedule
                                        ?.ModeFlag,
                              },
                            },
                          }));
                        }}
                      />
                      <div className="flex justify-start items-center gap-8 py-4 border-t border-gray-200 bg-white">
                        {/* Create Forward Trip */}
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
                          <Plus className="w-5 h-5 text-gray-600" />
                          <span>Create Forward Trip</span>
                        </button>

                        {/* Forward Trip Execution */}
                        <div className="flex items-center gap-2 text-blue-600 font-semibold cursor-pointer">
                          <Shuffle className="w-5 h-5" />
                          Forward Trip Execution – TRIP000234
                        </div>

                        {/* Create Return Trip */}
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
                          <Plus className="w-5 h-5 text-gray-600" />
                          <span>Create Return Trip</span>
                        </button>

                        {/* Return Trip Execution */}
                        <div className="flex items-center gap-2 text-blue-600 font-semibold cursor-pointer">
                          <Shuffle className="w-5 h-5" />
                          Return Trip Execution – TRIP000235
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-1 ">
                      <div className="bg-white rounded-lg border border-gray-200"></div>
                      <div className="rounded-lg pb-4 px-1 flex flex-col h-full">
                        <div className="">
                          <DynamicPanel
                            ref={scheduleDetailsRef}
                            panelId="scheduleDetails"
                            panelTitle="schedule Details"
                            panelIcon={
                              <MapPinned className="w-5 h-5 text-blue-500" />
                            }
                            panelConfig={SchedulePanelConfig}
                            collapsible={true}
                            initialData={workOrderData?.Location || {}}
                            onDataChange={(updatedSchedule) => {
                              useWorkOrderStore.setState((state) => ({
                                workOrder: {
                                  ...state.workOrder,
                                  WorkorderSchedule: {
                                    ...state.workOrder.WorkorderSchedule,
                                    ...updatedSchedule,
                                    ModeFlag:
                                      state.workOrder.WorkorderSchedule
                                        ?.ModeFlag === "NoChange"
                                        ? "Update"
                                        : state.workOrder.WorkorderSchedule
                                            ?.ModeFlag,
                                  },
                                },
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
                <div className="flex items-center gap-4"></div>
                <div className="flex items-center gap-4">
                  <button className={buttonCancel}>Cancel</button>
                  <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">
                    Amend
                  </button>
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

          {/* Billing Details SideDrawer */}
          <SideDrawer
            isOpen={showBillingDetails}
            onClose={() => setShowBillingDetails(false)}
            width="100%"
            title="Billing Details"
            isBack={true}
            badgeContent={workOrder?.Header?.WorkorderNo || "-"}
            isBadgeRequired={true}
          >
            <BillingDetails workOrderNumber={workOrder?.Header?.WorkorderNo} />
          </SideDrawer>

          <WorkOrderOperationDetails
            onClose={closeOperationDetails}
            value={showOperstionDetails}
          />
        </AppLayout>
      )}
    </>
  );
});

export default WorkOrderForm;
