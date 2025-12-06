import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { Shuffle, Plus } from "lucide-react";
import type { PanelConfig } from "@/types/dynamicPanel";
import { MapPinned } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { quickOrderService } from "@/api/services";
// import { SideDrawer } from "@/components/ui/side-drawer";
import { SideDrawer } from "@/components/Common/SideDrawer";
import WorkOrderOperationDetails from "./WorkOrderOperationDetails";
import { useWorkOrderStore } from "@/stores/workOrderStore";
import { SmartGridPlus } from "../SmartGrid/SmartGridPlus";
import { GridColumnConfig } from "@/types/smartgrid";
import BillingDetails from "./BillingDetails";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams for URL search parameters
import CodeInformationDrawer from "./CodeInformationDrawer";
import { useNavigate } from 'react-router-dom';

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
    const { toast } = useToast();
  const formRef = useRef<DynamicPanelRef>(null);
  const [searchParams, setSearchParams] = useSearchParams(); // Import useSearchParams
  const workOrderNo = searchParams.get("id"); // Get the work order number from the URL
  // const navigate = useNavigate();
  const [workOrderData, setWorkOrderData] = useState<Record<string, any>>({});
  const [orderType, setOrderType] = useState<"Wagon" | "Container">("Wagon");
  const [wagonMoreDetails, setWagonMoreDetails] = useState(false);
  const [showOperstionDetails, setShowOperationDetails] = useState(false);
  const [qcList1, setqcList1] = useState<any>();
  const [qcList2, setqcList2] = useState<any>();
  const [qcList3, setqcList3] = useState<any>();
  const [showMoreDetails, setShowMoreDetails] = useState(false); // State to toggle more details fields
  const [selectedOperation, setSelectedOperation] = useState<any>(null); // Track selected operation row
  const [isWorkShop, setIsWorkShop] = useState<number | null>(null); // Track IsWorkShop value (1 or 0)
  const [showBillingDetails, setShowBillingDetails] = useState(false); // State for billing details drawer
  const locationDetailsRef = useRef<DynamicPanelRef>(null);
  const scheduleDetailsRef = useRef<DynamicPanelRef>(null);
  const workOrderPanelRef = useRef<DynamicPanelRef>(null);
  const { workOrder,isSuccess,error,apiMessage, searchWorkOrder, loading,saveWorkOrder,resetWorkOrderForm,resetStatus } = useWorkOrderStore();
  const [showCodeInformation, setShowCodeInformation] = useState(false); // State for Code Information drawer
  const [selectedCode, setSelectedCode] = useState<any>(null); // Track selected code row
  // const [changeSearchParams, setSearchParams] = useSearchParams(); // Import useSearchParams
  const [equipmentType, setEquipmentType] = useState(workOrder?.Header?.EquipmentType || "Wagon");

  const isWorkShopLabel = useMemo(() => {
    if (isWorkShop === 1) return "Workshop";
    if (isWorkShop === 0) return "Mobile";
    return "";
  }, [isWorkShop]);

 const [uiHeader, setUiHeader] = useState<any>({});
  const [uiLocation, setUiLocation] =useState<any>({});
 const [uiSchedule, setUiSchedule] = useState<any>({});
 const [selectedProduct, setSelectedProduct] = useState<string>("");



  const debounce = (fn: (...args: any[]) => void, delay = 300) => {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

 const handleGetFormValues = async () => {
  const headerUI = workOrderPanelRef.current?.getFormValues() || {};
  const locationUI = locationDetailsRef.current?.getFormValues?.() || {};
  const scheduleUI = scheduleDetailsRef.current?.getFormValues?.() || {};

   setUiHeader(headerUI);
  setUiLocation(locationUI);
  setUiSchedule(scheduleUI);

  const headerBackend = formatHeaderForBackend(headerUI);
  const locationBackend = formatLocationForBackend(locationUI);
  const scheduleBackend = formatScheduleForBackend(scheduleUI, workOrderNo);

  const finalPayload = {
    Header: headerBackend,
    WorkorderSchedule: { ...locationBackend, ...scheduleBackend },
    OperationDetails: useWorkOrderStore.getState().workOrder?.OperationDetails || [],
  };

  const store = useWorkOrderStore.getState().workOrder;

  if (!store) {
    useWorkOrderStore.setState({ workOrder: finalPayload }); // ⭐ Create workOrder first
  } else {
    useWorkOrderStore.getState().updateHeaderBulk(finalPayload); // ⭐ Then merge
  }

  /*setTimeout(() => {
    console.log("store after update:", useWorkOrderStore.getState().workOrder);
  }, 50);*/
  console.log("mk",workOrder);
  console.log("<<>>",workOrder.Header?.Hazardous);
  if(workOrder.Header?.Hazardous){
    workOrder.Header.Hazardous = workOrder.Header.Hazardous ? "1" : "0";
  }
  else{
    workOrder.Header.Hazardous = "0";
  }
  
  
  console.log("Payload",workOrder)
  
  // Save work order and handle response
  // const result = await
    setTimeout(() => {
     saveWorkOrder(); 
  }, 500);
  
  // If save is successful and we have a workorderNo, update URL and refresh
  // console.log("result=======", result);
  // console.log("result=======", result.workorderNo);
  // if (result.workorderNo) {
  //   console.log("if=====");
  //   setSearchParams({ id: result.workorderNo });
  //   // The useEffect will automatically trigger when workOrderNo changes
  //   // No need for manual refresh as the useEffect handles data fetching
  // }
  // console.log()
  // saveWorkOrder();
  setUiHeader({});
    setUiLocation({});
    setUiSchedule({});
  console.log(locationUI)

};

useEffect(()=>{
 setUiHeader({});
},[])



//  const handleGetFormValues = async () => {
//   const headerUI = workOrderPanelRef.current?.getFormValues() || {};
//   const locationUI = locationDetailsRef.current?.getFormValues?.() || {};
//   const scheduleUI = scheduleDetailsRef.current?.getFormValues?.() || {};

//   const headerBackend = formatHeaderForBackend(headerUI);
//   const locationBackend = formatLocationForBackend(locationUI);
//   const scheduleBackend = formatScheduleForBackend(scheduleUI, workOrderNo);

//   const finalPayload = {
//     Header: headerBackend,
//     WorkorderSchedule: { ...locationBackend, ...scheduleBackend },
//     OperationDetails: useWorkOrderStore.getState().workOrder?.OperationDetails || [],
//   };

//   useWorkOrderStore.getState().updateHeaderBulk(finalPayload);
//   console.clear()
//   console.log("finalPayload",finalPayload)
//   console.log("store after update:", useWorkOrderStore.getState().workOrder);
//   saveWorkOrder();
// };


  // const handleGetFormValues = () => {
  //   const uiValues = workOrderPanelRef.current?.getFormValues() || {};
  //   const backendValues = formatForBackend(uiValues);
  //   useWorkOrderStore.getState().updateHeaderBulk(backendValues);
  //   saveWorkOrder();
  // };

  const formatHeaderForBackend = (values) => {
    const formatted = { ...values };

    if (formatted.LoadType) {
      formatted.LoadType = {
        IsLoaded: formatted.LoadType === "1" ? 1 : 0,
        IsEmpty: formatted.LoadType === "0" ? 1 : 0,
      };
    }

    const applySplit = (field, idKey, descKey) => {
      if (
        typeof formatted[field] === "string" &&
        formatted[field].includes(" || ")
      ) {
        const [id, desc] = formatted[field].split(" || ").map((v) => v.trim());
        formatted[idKey] = id;
        formatted[descKey] = desc;
      }
    };

    applySplit("WagonCondainterID", "EquipmentID", "EquipmentDescription");
    applySplit(
      "SuplierContract",
      "SupplierContractID",
      "SupplierContractDescription"
    );
    applySplit(
      "CustomerContract",
      "CustomerContractID",
      "CustomerContractDescription"
    );
    applySplit("ClusterMarket", "Cluster", "ClusterDescription");
    applySplit("product", "ProductID", "ProductDescription");
    applySplit("UNCODE", "UNCodeID", "UNCodeDescription");
    applySplit("PlaceOfEvent", "PlaceOfEventID", "PlaceOfEventIDDescription");

    if (formatted.QCUserDefined1) {
      formatted.QC1Code = formatted.QCUserDefined1.dropdown || "";
      formatted.QC1Value = formatted.QCUserDefined1.input || "";
    }
    if (formatted.QCUserDefined2) {
      formatted.QC2Code = formatted.QCUserDefined2.dropdown || "";
      formatted.QC2Value = formatted.QCUserDefined2.input || "";
    }
    if (formatted.QCUserDefined3) {
      formatted.QC3Code = formatted.QCUserDefined3.dropdown || "";
      formatted.QC3Value = formatted.QCUserDefined3.input || "";
    }

    if (!workOrderNo) {
    formatted.ModeFlag = "Insert";  
  } else {
    formatted.ModeFlag =
      values.ModeFlag === "NoChange" ? "Update" : values.ModeFlag || "Update";
  }

    return formatted;
  };

  const formatScheduleForBackend = (values, workOrderNo) => {
  let formatted = { ...values };

  if (!workOrderNo) {
    // Create mode
    formatted.ModeFlag = "NoChange";
  } else {
    // Edit mode
    formatted.ModeFlag =
      values.ModeFlag === "NoChange"
        ? "NoChange"
        : values.ModeFlag || "Update";
  }

  return formatted;
};


  const formatLocationForBackend = (values) => {
    const formatted = { ...values };

    const applySplit = (field) => {
      if (formatted[field]?.includes(" || ")) {
        const [id, desc] = formatted[field].split(" || ").map((v) => v.trim());
        formatted[field + "ID"] = id;
        formatted[field + "Description"] = desc;
      }
    };

    [
      "Origin",
      "OutBoundDestination",
      "RUForward",
      "ReturnDest",
      "RUReturn",
      "PlaceOfOperation",
      "Provider",
    ].forEach(applySplit);

     if (!workOrderNo) {
    // Create mode
    formatted.ModeFlag = "Insert";
  } else {
    // Edit mode
    formatted.ModeFlag =
      values.ModeFlag === "NoChange" ? "Update" : values.ModeFlag || "Update";
  }

    return formatted;
  };

  //actionSlice from store
  const updateHeader = useWorkOrderStore((state) => state.updateHeader);
  
useEffect(() => {
  // when API data arrives, hydrate dynamic panel
  if (workOrder && workOrderPanelRef.current) {
    workOrderPanelRef.current.setFormValues(workOrder.Header);
  }
}, [workOrderPanelRef]);


useEffect(()=>{
if(isSuccess){
  searchWorkOrder(workOrderNo)
}
},[saveWorkOrder])

  useEffect(() => {
    // Fetch work order data when workOrderNo changes
    if (!workOrderNo) {
    resetWorkOrderForm();
    setUiHeader("");
    return;                
  } 
  if(workOrderNo){
     searchWorkOrder(workOrderNo);  
  }
  
  }, [workOrderNo]);

   useEffect(() => {
    // Fetch work order data when workOrderNo changes
    if (!workOrderNo) {
    resetWorkOrderForm();
    setUiHeader("");
    return;                
  } 
  if(workOrderNo){
     searchWorkOrder(workOrderNo);  
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
    // additionalFilter?: { FilterName: string; FilterValue: string }[]
    extraParams?: Record<string, any>
  ) => {
    return async ({ searchTerm, offset, limit }) => {
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
    //123
  const workOrderPanelConfig = (currentOrderType: string): PanelConfig => ({
    EquipmentType: {
      id: "EquipmentType",
      label: "EquipmentType",
      fieldType: "radio",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
      value:workOrderNo ?  workOrder?.Header?.EquipmentType  : "Wagon",
      
      options: [
        { label: "Wagon", value: "Wagon" },
        { label: "Container", value: "Container" },
      ],
      order: 1,
     events: {
    onChange: (value) => {
      setEquipmentType(value);   
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
value:
  workOrderNo
    ? `${workOrder?.Header?.EquipmentID} || ${workOrder?.Header?.EquipmentDescription}`
    : uiHeader?.WagonCondainterID || "",

      order: 2,
      fetchOptions:
    equipmentType === "Wagon"
      ? fetchMaster("Wagon id Init")
      : fetchMaster("Container id Init"),
    },

    SuplierContract: {
      id: "SuplierContract",
      label: "Supplier Contract No",
      fieldType: "lazyselect",
      width: "half",
      mandatory: true,
      visible: true,
      editable: true,
value:
  workOrder?.Header?.SupplierContractID &&
  workOrder?.Header?.SupplierContractDescription
    ? `${workOrder.Header.SupplierContractID} || ${workOrder.Header.SupplierContractDescription}`
    : uiHeader?.SuplierContract || "",


      order: 3,
      fetchOptions: fetchMaster("Contract Init", { OrderType: "Buy" }),
      // events: {
      //   onChange: (val) => {
      //     const updateHeader = useWorkOrderStore.getState().updateHeader;

      //     const [id, desc] = val.value.split(" || ").map((v) => v.trim());

      //     updateHeader("SupplierContractID", id);
      //     updateHeader("SupplierContractDescription", desc);
      //   },
      //   // onChange: (val) => {
      //   //   const updateHeader = useWorkOrderStore.getState().updateHeader;

      //   //   // If user-selected value contains " || ", extract ID + Description
      //   //   if (val?.value?.includes(" || ")) {
      //   //     const [id, desc] = val.value.split(" || ").map((v) => v.trim());
      //   //     updateHeader("SupplierContractID", id);
      //   //     updateHeader("SupplierContractDescription", desc);

      //   //     // Keep full label in UI so next change doesn't break
      //   //     updateHeader("product", `${id} || ${desc}`);
      //   //   } else {
      //   //     // If value contains only ID
      //   //     updateHeader("SuplierContract", val.value);
      //   //   }
      //   // },
      // },
    },

    CustomerContract: {
      id: "CustomerContract",
      label: "Customer Contract No./Business Case",
      fieldType: "lazyselect",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
value:
  workOrderNo
    ? `${workOrder?.Header?.CustomerContractID} || ${workOrder?.Header?.CustomerContractDescription}`
    : uiHeader?.CustomerContract || "",
      order: 4,
      fetchOptions: fetchMaster("Contract Init", { OrderType: "Sell" }),
      // events: {
      //   onChange: (val) => {
      //     const updateHeader = useWorkOrderStore.getState().updateHeader;

      //     const [id, desc] = val.value.split(" || ").map((v) => v.trim());

      //     updateHeader("CustomerContractID", id);
      //     updateHeader("CustomerContractDescription", desc);
      //   },
      // },
    },

    AppointmentDate: {
      id: "AppointmentDate",
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
    },

    ClusterMarket: {
      id: "ClusterMarket",
      label: "Cluster/Market",
      fieldType: "lazyselect",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
value:
  workOrderNo
    ? `${workOrder?.Header?.Cluster} || ${workOrder?.Header?.ClusterDescription}`
    : uiHeader?.ClusterMarket || "",

      order: 7,
      fetchOptions: fetchMaster("Cluster Init"),
      // events: {
      //   onChange: (val) => {
      //     const updateHeader = useWorkOrderStore.getState().updateHeader;

      //     const [id, desc] = val.value.split(" || ").map((v) => v.trim());

      //     updateHeader("Cluster", id);
      //     updateHeader("ClusterDescription", desc);
      //   },
      // },
    },

    product: {
      id: "product",
      label: "Product",
      fieldType: "lazyselect",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
value:
  workOrderNo
    ? `${workOrder?.Header?.ProductID} || ${workOrder?.Header?.ProductDescription}`
    : uiHeader?.product || "",

      order: 8,
      fetchOptions: fetchMaster("Product ID Init"),
       events: {
    onChange: (value) => {
      console.log("Product changed:", value);

      const [id] = (value?.value || "").split(" || ");
      setSelectedProduct(id || "");

      setUiHeader(prev => ({ ...prev, UNCODE: "" }));
    }
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
value:
  workOrder?.Header?.UNCodeID && workOrder?.Header?.UNCodeDescription
    ? `${workOrder.Header.UNCodeID} || ${workOrder.Header.UNCodeDescription}`
    : uiHeader?.UNCODE || "",

  order: 9,
  fetchOptions: fetchMaster("UN Code Init", { productId: selectedProduct }),
},
    LoadType: {
      id: "LoadType",
      label: "Load Type",
      fieldType: "radio",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrder?.Header?.LoadType?.IsLoaded == "1" ? "1" : "0",
      options: [
        { label: "Loaded", value: "1" },
        { label: "Empty", value: "0" },
      ],
      order: 10,
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
    },

    PlaceOfEvent: {
      id: "PlaceOfEvent",
      label: "Place Of Event",
      fieldType: "lazyselect",
      width: "half",
      mandatory: false,
      visible: true,
      editable: true,
value:
  workOrderNo
    ? `${workOrder?.Header?.PlaceOfEventID} || ${workOrder?.Header?.PlaceOfEventIDDescription}`
    : uiHeader?.PlaceOfEvent || "",

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
      width: "half",
      mandatory: true,
      visible: true,
      editable: true,
      value:
        workOrder?.Header?.BillingHeaderDetails?.IsAcceptedByForwardis === "1",
      order: 15,
    },

    ReInvoiceCost: {
      id: "ReInvoiceCost",
      label: "Re-Invoice Cost",
      fieldType: "switch",
      width: "half",
      mandatory: true,
      visible: true,
      editable: true,
      value: workOrder?.Header?.BillingHeaderDetails?.IsReinvoiceCost === "1",
      order: 16,
    },

    InvoiceTo: {
      id: "InvoiceTo",
      label: "Stakeholder",
      fieldType: "lazyselect",
      width: "full",
      mandatory: false,
      visible: true,
      editable: true,
      value: workOrderNo ? workOrder?.Header?.BillingHeaderDetails?.InvoiceTo : " ",
      order: 17,
      fetchOptions: fetchMaster("Work Order Invoice to Init"),
      onChange: (newValue) => {
},

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
    },

    Remarks1: {
      id: "Remarks1",
      label: "Remarks 1",
      fieldType: "text",
      width: "half",
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      value: workOrder?.Header?.Remarks1,
      order: 27,
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
  const closeOperationDetails = () => {
    setShowOperationDetails(false);
    console.log("clicked,showOperstionDetails", showOperstionDetails);
  };
  // Dynamic locationPanelConfig based on IsWorkShop value
  // If IsWorkShop === 1: Show (Origin, OutboardDest, RUForward, ReturnDest, RUReturn)
  // If IsWorkShop === 0: Show (PlaceOfOperation, Provider, ExpectedDate, ActualDate, Comments)
  const locationPanelConfig: PanelConfig = useMemo(() => {
    const isWorkshop = isWorkShop === 1;

    return {
      // Fields for IsWorkShop === 1 (Workshop mode)
      Origin: {
        id: "Origin",
        label: "Origin",
        fieldType: "lazyselect",
        width: "six",
value: (workOrder?.WorkorderSchedule?.OriginID && workOrder?.WorkorderSchedule?.OriginDescription)
  ? `${workOrder.WorkorderSchedule.OriginID} || ${workOrder.WorkorderSchedule.OriginDescription}`
  : "",
        mandatory: false,
        visible: isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 1 and operation is selected
        editable: true,
        order: 1,
        fetchOptions: fetchMaster("Location Init"),
      },
      OutBoundDestination: {
        id: "OutBoundDestination",
        label: "Outboard Destination",
        fieldType: "lazyselect",
        width: "six",
value: (workOrder?.WorkorderSchedule?.OutBoundDestinationID && workOrder?.WorkorderSchedule?.OutBoundDestinationDescription)
  ? `${workOrder.WorkorderSchedule.OutBoundDestinationID} || ${workOrder.WorkorderSchedule.OutBoundDestinationDescription}`
  : "",

        mandatory: false,
        visible: isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 1 and operation is selected
        editable: true,
        order: 2,
        fetchOptions: fetchMaster("Location Init"),
      },
      RUForward: {
        id: "RUForward",
        label: "RU Forward",
        fieldType: "lazyselect",
        width: "six",
value: (workOrder?.WorkorderSchedule?.RUForwardID && workOrder?.WorkorderSchedule?.RUForwardDescription)
  ? `${workOrder.WorkorderSchedule.RUForwardID} || ${workOrder.WorkorderSchedule.RUForwardDescription}`
  : "",

        visible: isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 1 and operation is selected
        mandatory: false,
        editable: true,
        order: 3,
        fetchOptions: fetchMaster("Supplier Init"),
      },
      ReturnDest: {
        id: "ReturnDest",
        label: "Return Destination",
        fieldType: "lazyselect",
        width: "six",
value: (workOrder?.WorkorderSchedule?.ReturnDestID && workOrder?.WorkorderSchedule?.ReturnDestDescription)
  ? `${workOrder.WorkorderSchedule.ReturnDestID} || ${workOrder.WorkorderSchedule.ReturnDestDescription}`
  : "",

        visible: isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 1 and operation is selected
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
value: (workOrder?.WorkorderSchedule?.RUReturnID && workOrder?.WorkorderSchedule?.RUReturnDescription)
  ? `${workOrder.WorkorderSchedule.RUReturnID} || ${workOrder.WorkorderSchedule.RUReturnDescription}`
  : "",

        visible: isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 1 and operation is selected
        mandatory: false,
        editable: true,
        order: 5,
        fetchOptions: fetchMaster("Supplier Init"),
      },
      // Fields for IsWorkShop === 0 (Mobile mode)
      PlaceOfOperation: {
        id: "PlaceOfOperation",
        label: "PlaceOfOperation",
        fieldType: "lazyselect",
        width: "four",
        value: `${workOrder?.WorkorderSchedule?.PlaceOfOperationID} || ${workOrder?.WorkorderSchedule?.PlaceOfOperationDescription}`,

        mandatory: false,
        visible: !isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 0 and operation is selected
        editable: true,
        order: 1,
        fetchOptions: fetchMaster("Location Init"),
      },
      Provider: {
        id: "Provider",
        label: "Provider",
        fieldType: "lazyselect",
        width: "four",
        value: `${workOrder?.WorkorderSchedule?.Provider} || ${workOrder?.WorkorderSchedule?.ProviderDescription}`,

        mandatory: false,
        visible: !isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 0 and operation is selected
        editable: true,
        order: 2,
        fetchOptions: fetchMaster("Location Init"),
      },
      MobileExpectedDate: {
        id: "ExpectedDate",
        label: "Expected Date",
        fieldType: "date",
        width: "four",
        value: workOrder?.WorkorderSchedule?.MobileExpectedDate,
        visible: !isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 0 and operation is selected
        mandatory: false,
        editable: true,
        order: 3,
      },
      MobileActualDate: {
        id: "MobileActualDate",
        label: "Actual Date",
        fieldType: "date",
        width: "four",
        value: workOrder?.WorkorderSchedule?.MobileActualDate,
        visible: !isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 0 and operation is selected
        mandatory: false,
        editable: true,
        order: 4,
      },
      Comments: {
        id: "Comments",
        label: "Comments",
        fieldType: "text",
        width: "half",
        value: workOrder?.WorkorderSchedule?.Comments,
        visible: !isWorkshop && selectedOperation !== null, // Only visible when IsWorkShop === 0 and operation is selected
        mandatory: false,
        editable: true,
        order: 5,
      },
    };
  }, [isWorkShop, selectedOperation, workOrder?.WorkorderSchedule]);

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
    ArrivalDate: {
      id: "ArrivalDate",
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
          ...state.workOrder?.Header,
          ...updatedHeader,
          ModeFlag: "Update",
        },
      },
    }));
  }, 1000);

  const buttonClass = `inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm`;
  const buttonCancel =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm";
  // Fetch cities - always returns Workshop and Mobile (not dependent on state)
  const fetchWorkshopMobile = useCallback(async ({ searchTerm, offset, limit, rowData }: { searchTerm: string; offset: number; limit: number; rowData?: any }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log("Fetching cities (Workshop/Mobile):", rowData);

    // Always return Workshop and Mobile as options
    const staticOptions = [
      { id: "Workshop", name: "Workshop" },
      { id: "Mobile", name: "Mobile" }
    ];

    // Filter based on search term if provided
    const filtered = staticOptions.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Return in the same format as fetchMaster in WorkOrderForm.tsx
    return filtered.map((item: any) => {
      const id = item.id ?? "";
      const name = item.name ?? "";
      return {
        label: `${id}`,
        value: `${id}`,
      };
    });
  }, []);
  
  // fetch shipment type
  const fetchShipmentType = useCallback(async ({ searchTerm, offset, limit, rowData }: { searchTerm: string; offset: number; limit: number; rowData?: any }) => {
    // Check if Mobile mode is enabled - check both IsMobile and IsWorkShop
    // IsMobile = 1 means Mobile, IsWorkShop = "Mobile" or 0 also means Mobile
    const isMobile = rowData?.IsMobile;
    const isWorkShop = rowData?.IsWorkShop;
    
    // Check if Mobile mode is enabled
    const isMobileMode = 
      isMobile === 1 || isMobile === "1" || // IsMobile explicitly set to 1
      isWorkShop === "Mobile" || isWorkShop === 0 || isWorkShop === "0"; // IsWorkShop indicates Mobile
    
    if (isMobileMode) {
      console.log("Mobile mode is enabled, returning empty Shipment Type options");
      return [];
    }
    
    // Extract typeOfAction and operationType from piped format "id || name"
    const typeOfAction = rowData?.TypeOfAction || rowData.TypeOfActionDescription?.split('||')[0].trim() || "";
    const operationType = rowData?.Operation || rowData.OperationDescription?.split('||')[0].trim() || "";
    console.log("Fetching Shipment Type for:", typeOfAction, "Operation:", operationType, "Row data:", rowData);
    // Use fetchMaster with TypeOfAction and OperationType filter
    const fetchShipment = fetchMasterShipmentType({
      messageType: "WorkOrder-GetServiceMode", 
      TypeOfAction: typeOfAction,
      OperationType: operationType
    });
    return fetchShipment({ searchTerm, offset, limit });
  }, []);
  
  const fetchMasterOperations = (
    {TypeOfAction, messageType}: {TypeOfAction: string, messageType: string}
  ) => {
    return async ({ searchTerm, offset, limit }) => {
      try {
        const response = await quickOrderService.fetOperationFromTypeOfAction({
          TypeOfAction: TypeOfAction || "",
          messageType: messageType || "",
        });

        const rr: any = response?.data;
        const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

        return arr
        .filter((item: any) => item.id)  // filter out items with no id
        .map((item: any) => {
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

  const fetchMasterServiceMode = (
    {TypeOfAction, messageType, OperationType}: {TypeOfAction: string, messageType: string, OperationType: string}
  ) => {
    return async ({ searchTerm, offset, limit }) => {
      try {
        const response = await quickOrderService.fetServiceModeDetails({
          TypeOfAction: TypeOfAction || "",
          messageType: messageType || "",
          OperationType: OperationType || "",
        });
        console.log('Actual response for Service Mode:', response);
        const rr: any = response?.data;
        
        // Check if response is successful
        if (!rr || !rr.IsSuccess || !rr.ResponseData) {
          return [];
        }

        // Parse the ResponseData JSON string
        const responseData = JSON.parse(rr.ResponseData);
        const serviceMode = responseData?.ServiceMode;

        // If ServiceMode is empty, undefined, or null, return empty array
        if (!serviceMode || serviceMode.trim() === "") {
          return [];
        }

        // Map ServiceMode value to options
        const serviceModeLower = serviceMode.trim().toLowerCase();
        let options: string[] = [];

        if (serviceModeLower === "both") {
          options = ["Workshop", "Mobile"];
        } else if (serviceModeLower === "workshop") {
          options = ["Workshop"];
        } else if (serviceModeLower === "mobile") {
          options = ["Mobile"];
        } else {
          // Unknown value, return empty array
          return [];
        }

        // Return formatted options
        return options.map((option) => ({
          label: option,
          value: option,
        }));
      } catch (err) {
        console.error('Error fetching Service Mode:', err);
        return [];
      }
    };
  };

  const fetchMasterShipmentType = (
    {TypeOfAction, messageType, OperationType}: {TypeOfAction: string, messageType: string, OperationType: string}
  ) => {
    return async ({ searchTerm, offset, limit }) => {
      try {
        const response = await quickOrderService.fetServiceModeDetails({
          TypeOfAction: TypeOfAction || "",
          messageType: messageType || "",
          OperationType: OperationType || "",
        });
        console.log('Actual response for Shipment Type:', response);
        const rr: any = response?.data;
        
        // Check if response is successful
        if (!rr || !rr.IsSuccess || !rr.ResponseData) {
          return [];
        }

        // Parse the ResponseData JSON string
        const responseData = JSON.parse(rr.ResponseData);
        const typeOfShipment = responseData?.TypeOfShipment;

        // If TypeOfShipment is empty, undefined, or null, return empty array
        if (!typeOfShipment || typeOfShipment.trim() === "") {
          return [];
        }

        // Map TypeOfShipment value to options
        const shipmentTypeLower = typeOfShipment.trim().toLowerCase();
        let options: string[] = [];

        if (shipmentTypeLower === "forward/return" || shipmentTypeLower === "forward\\/return") {
          options = ["Forward/Return"];
        } else if (shipmentTypeLower === "one-way" || shipmentTypeLower === "one way" || shipmentTypeLower === "oneway") {
          options = ["One-Way"];
        } else {
          // Unknown value, return empty array
          return [];
        }

        // Return formatted options
        return options.map((option) => ({
          label: option,
          value: option,
        }));
      } catch (err) {
        console.error('Error fetching Shipment Type:', err);
        return [];
      }
    };
  };

  // Operational details fetch masters
  const fetchMasterOperationDetails = (
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

        return arr
        .filter((item: any) => item.id)
        .map((item: any) => {
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

  // fetch CUU Code masters
  const fetchMasterCUUCode = (
    messageType: string
  ) => {
    return async ({ searchTerm, offset, limit }) => {
      try {
        const response = await quickOrderService.fetCUUCode({
          messageType,
          searchTerm: searchTerm || "",
          offset,
          limit,
          AdditionalFilter: [], // <-- FIXED HERE
        });

        const rr: any = response?.data;
        const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

        return arr
        .filter((item: any) => item.CUUCode)
        .map((item: any) => {
          const id = item.CUUCode ?? "";
          const name = item.name ?? "";
          return {
            label: `${id}`,
            value: `${id}`,
          };
        });
      } catch (err) {
        return [];
      }
    };
  };

  // Fetch countries (first level) - using fetchMaster
  const fetchTypeOfAction = useCallback(
    fetchMasterOperationDetails("WO Type of Action Init"),
    []
  );
  
  // Fetch states based on selected country (second level) - using fetchMaster
  const fetchOperations = useCallback(async ({ searchTerm, offset, limit, rowData }: { searchTerm: string; offset: number; limit: number; rowData?: any }) => {
    // Extract countryId from piped format "id || name"
    const countryId = rowData?.TypeOfAction || rowData.TypeOfActionDescription?.split('||')[0].trim() || "";
    console.log("Fetching states for country:", countryId, "Row data:", rowData);
    // Use fetchMaster with TypeOfAction filter
    const fetchOperations = fetchMasterOperations({messageType: "WO Type of Action Onselect Init", TypeOfAction: countryId });
    return fetchOperations({ searchTerm, offset, limit });
  }, []);

  // fetch service mode
  const fetchServiceMode = useCallback(async ({ searchTerm, offset, limit, rowData }: { searchTerm: string; offset: number; limit: number; rowData?: any }) => {
    // Extract countryId from piped format "id || name"
    const typeOfAction = rowData?.TypeOfAction || rowData.TypeOfActionDescription?.split('||')[0].trim() || "";
    const operationType = rowData?.Operation || rowData.OperationDescription?.split('||')[0].trim() || "";
    console.log("Fetching states for country:", typeOfAction, "Row data:", rowData);
    // Use fetchMaster with TypeOfAction filter
    const fetchOperations = fetchMasterServiceMode({
      messageType: "WorkOrder-GetServiceMode", 
      TypeOfAction: typeOfAction,
      OperationType: operationType
    });
    return fetchOperations({ searchTerm, offset, limit });
  }, []);

  // Columns for OperationDetails grid
  const operationDetailsColumns: GridColumnConfig[] = [
    {
      key: "OrderID",
      label: "Operation No.",
      type: "Link",
      sortable: true,
      filterable: true,
      editable: false,
      width: 100,
    },
    {
      key: "OperationStatus",
      label: "Status",
      type: "Badge",
      sortable: true,
      filterable: true,
      editable: false,
      width: 150,
      statusMap: {
        Active: "badge-green rounded-2xl",
        Pending: "badge-yellow rounded-2xl",
        Completed: "badge-green rounded-2xl",
        Cancelled: "badge-red rounded-2xl",
        "In-progress": "badge-orange rounded-2xl",
      },
    },
    {
      key: "TypeOfActionDescription",
      label: "Type of Action",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      width: 180,
      fetchOptions: fetchTypeOfAction,
      dependentFields: ["OperationDescription", "IsWorkShop", "IsForwardReturn"],
      onChange: (newValue, rowData) => {
        // `newValue` is whatever the editor emits (string, object, etc.)
        // Return the final value you want stored in the row.
        const rawValue = typeof newValue === 'string'
          ? newValue.trim()
          : newValue?.value?.trim();

        // Check if it contains "||"
        if (rawValue && rawValue.includes('||')) {
          const [id, name] = rawValue.split('||').map(v => v.trim());

          // Update rowData fields
          rowData.TypeOfAction = id;
          rowData.TypeOfActionDescription = name;

          console.log("Updated Row:", rowData);

          // Return combined string or whatever you want
          // return `${id} || ${name}`;
        }
      },
    },
    {
      key: "OperationDescription",
      label: "Operation",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      width: 180,
      fetchOptions: fetchOperations,
      dependentFields: ["IsWorkShop", "IsForwardReturn"], // Clear IsWorkShop when state changes
      onChange: (newValue, rowData) => {
        console.log("Operation changed:", newValue, "Row data:", rowData);
        const rawValue = typeof newValue === 'string'
          ? newValue.trim()
          : newValue?.value?.trim();

        // Check if it contains "||"
        if (rawValue && rawValue.includes('||')) {
          const [id, name] = rawValue.split('||').map(v => v.trim());

          // Update rowData fields
          rowData.Operation = id;
          rowData.OperationDescription = name;

          console.log("Updated Row:", rowData);

          // Return combined string or whatever you want
          // return `${id} || ${name}`;
        }
      },
    },
    {
      key: "IsWorkShop",
      label: "Service Mode",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      width: 150,
      // options: ["Workshop", "Mobile"],
      fetchOptions: fetchServiceMode,
      onChange: (value, rowData) => {
        console.log("IsWorkShop changed:", value, "Row data:", rowData);
        // Automatically set IsMobile as opposite of IsWorkShop
        const isWorkShopValue = transformIsWorkShopForSave(value);
        rowData.IsWorkShop = isWorkShopValue;
        rowData.IsMobile = isWorkShopValue === 1 ? 0 : 1;
        console.log("Updated IsWorkShop:", isWorkShopValue, "IsMobile:", rowData.IsMobile);
      },
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: "IsForwardReturn",
      label: "Shipment Type",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      width: 180,
      // options: ["Forward/Return", "One-Way"],
      fetchOptions: fetchShipmentType,
      onChange: (value, rowData) => {
        console.log("IsForwardReturn changed:", value, "Row data:", rowData);
        // Automatically set IsOneWay as opposite of IsForwardReturn
        const isForwardReturnValue = transformIsForwardReturnForSave(value);
        
        if (isForwardReturnValue === 1) {
          // Forward/Return selected
          rowData.IsForwardReturn = 1;
          rowData.IsOneWay = 0;
        } else if (isForwardReturnValue === 0) {
          // One-Way selected
          rowData.IsForwardReturn = 0;
          rowData.IsOneWay = 1;
        } else {
          // Neither selected
          rowData.IsForwardReturn = "";
          rowData.IsOneWay = "";
        }
        console.log("Updated IsForwardReturn:", rowData.IsForwardReturn, "IsOneWay:", rowData.IsOneWay);
      },
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: "CodeInformation",
      label: "CUU Codes",
      type: "MultiselectLazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      width: 150,
      fetchOptions: fetchMasterCUUCode("Code CUU"),
      onChange: (value, rowData) => {
        // Ensure value is an array (MultiselectLazySelect returns array)
        const codeArray = Array.isArray(value) ? value : (value ? [value] : []);
        // Update rowData with the array of selected codes
        rowData.CodeInformation = codeArray;
        console.log("CodeInformation changed:", codeArray, "Row data:", rowData);
      },
    },
    {
      key: "QC1Code",
      label: "QC1 Code",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      width: 150,
      fetchOptions: fetchMasterOperationDetails("Operation details QC1 Init"),
      onChange: (value, rowData) => {
        // Extract only the ID from piped format "id || name"
        if (typeof value === 'string' && value.includes(' || ')) {
          const id = value.split(' || ')[0].trim();
          console.log("QC1Code changed - extracted ID:", id, "from:", value);
          return id; // Return only the ID to be stored
        }
        return value; // Return as-is if not in piped format
      },
      hideSearch: true,
      disableLazyLoading: true
    },
    {
      key: "QC1Value",
      label: "QC1 Value",
      type: "Text",
      sortable: true,
      filterable: true,
      editable: true,
      width: 150,
    },
    {
      key: "Remarks",
      label: "Remarks",
      type: "Text",
      sortable: false,
      filterable: true,
      editable: true,
      width: 200,
      subRow: true,
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

  // Transform IsWorkShop value to display string
  const transformIsWorkShopForDisplay = (value: any): string => {
    if (value === undefined || value === null) return "Workshop";
    if (typeof value === 'object' && value.IsWorkShop !== undefined) {
      return value.IsWorkShop === 1 || value.IsWorkShop === "1" ? "Workshop" : "Mobile";
    }
    if (value === 1 || value === "1") return "Workshop";
    if (value === 0 || value === "0") return "Mobile";
    return typeof value === 'string' ? value : "Workshop";
  };

  // Transform IsWorkShop display value to store format (final numeric flag on the row)
  const transformIsWorkShopForSave = (value: string | any): number => {
    // If already an object like { IsWorkShop: 1 }, normalize to 1/0
    if (typeof value === 'object' && value !== null && value.IsWorkShop !== undefined) {
      return value.IsWorkShop === 1 || value.IsWorkShop === "1" ? 1 : 0;
    }

    // If it's a display string or primitive, map to 1/0 (always return number)
    if (value === "Workshop" || value === 1 || value === "1") return 1;
    if (value === "Mobile" || value === 0 || value === "0") return 0;

    // Fallback: default to 0 if value is undefined/null/empty
    return 0;
  };

  // Transform IsForwardReturn value to display string
  const transformIsForwardReturnForDisplay = (value: any): string => {
    if (value === undefined || value === null) return "Forward/Return";
    if (typeof value === 'object' && value.IsForwardReturn !== undefined) {
      return value.IsForwardReturn === 1 || value.IsForwardReturn === "1" ? "Forward/Return" : "One-Way";
    }
    if (value === 1 || value === "1") return "Forward/Return";
    if (value === 0 || value === "0") return "One-Way";
    return typeof value === 'string' ? value : "Forward/Return";
  };

  // Transform IsForwardReturn display value to store format (final numeric flag on the row)
  // Returns: 1 if Forward/Return, 0 if One-Way, "" if not selected
  const transformIsForwardReturnForSave = (value: string | any): number | string => {
    // Handle empty/null/undefined values - return empty string if not selected
    if (value === undefined || value === null || value === "" || (typeof value === 'string' && value.trim() === "")) {
      return "";
    }
    
    if (typeof value === 'object' && value !== null && value.IsForwardReturn !== undefined) {
      const forwardReturnValue = value.IsForwardReturn;
      if (forwardReturnValue === 1 || forwardReturnValue === "1") return 1;
      if (forwardReturnValue === 0 || forwardReturnValue === "0") return 0;
      return "";
    }
    
    if (value === "Forward/Return" || value === 1 || value === "1") return 1;
    if (value === "One-Way" || value === 0 || value === "0") return 0;
    
    // If value doesn't match any known pattern, return empty string
    return "";
  };

  // Transform CodeInformation for display (extract CodeNoCUU values as array of strings)
  const transformCodeInformationForDisplay = (codeInformation: any): string[] => {
    if (!codeInformation || !Array.isArray(codeInformation)) {
      return [];
    }
    return codeInformation
      .map((code: any) => {
        // Handle both object format {CodeNoCUU: value} and direct string values
        if (typeof code === 'object' && code !== null) {
          return code.CodeNoCUU || code.codeNoCUU || code.value || code;
        }
        return code;
      })
      .filter((code: any) => code !== null && code !== undefined && code !== '');
  };

  // Transform CodeInformation for save (convert array of strings to array of {CodeNoCUU: value})
  const transformCodeInformationForSave = (codeInformation: any): any[] => {
    if (!codeInformation) {
      return [];
    }
    
    // If already in correct format [{CodeNoCUU: value}], return as is
    if (Array.isArray(codeInformation) && codeInformation.length > 0) {
      const firstItem = codeInformation[0];
      if (typeof firstItem === 'object' && firstItem !== null && (firstItem.CodeNoCUU !== undefined || firstItem.codeNoCUU !== undefined)) {
        return codeInformation;
      }
    }
    
    // Convert array of strings to array of objects
    if (Array.isArray(codeInformation)) {
      return codeInformation
        .filter((code: any) => code !== null && code !== undefined && code !== '')
        .map((code: any) => {
          // If already an object with CodeNoCUU, return as is
          if (typeof code === 'object' && code !== null && code.CodeNoCUU) {
            return { CodeNoCUU: code.CodeNoCUU };
          }
          // If it's a string, wrap it in object
          return { CodeNoCUU: String(code) };
        });
    }
    
    return [];
  };

  // Transform OperationDetails data for display (convert IsWorkShop & IsForwardReturn values to strings)
  // Filter out rows marked for deletion (ModeFlag: "Delete") so they don't appear in the grid
  const transformDataForDisplay = (data: any[]) => {
    return data
      .filter(row => row?.ModeFlag !== 'Delete') // Filter out deleted rows for display
      .map(row => ({
        ...row,
        IsWorkShop: transformIsWorkShopForDisplay(row.IsWorkShop),
        IsForwardReturn: transformIsForwardReturnForDisplay(row.IsForwardReturn),
        CodeInformation: transformCodeInformationForDisplay(row.CodeInformation)
      }));
  };

  // Extract ID from piped format (format: "id || name")
  const extractIdFromPipedFormat = (value: any): string => {
    if (!value) return "";
    if (typeof value === 'string' && value.includes(' || ')) {
      return value.split(' || ')[0].trim();
    }
    return value;
  };

  // Split piped data for TypeOfActionDescription and OperationDescription
  const splitPipedData = (row: any) => {
    const result = { ...row };

    // Handle TypeOfActionDescription
    if (result.TypeOfActionDescription && typeof result.TypeOfActionDescription === 'string' && result.TypeOfActionDescription.includes(' || ')) {
      const [id, name] = result.TypeOfActionDescription.split(' || ').map((v: string) => v.trim());
      result.TypeOfAction = id;
      result.TypeOfActionDescription = name;
    } else if (result.TypeOfActionDescription && !result.TypeOfAction) {
      // If TypeOfActionDescription exists but TypeOfAction doesn't, keep description as is
      // TypeOfAction might already be set separately
    }

    // Handle OperationDescription
    if (result.OperationDescription && typeof result.OperationDescription === 'string' && result.OperationDescription.includes(' || ')) {
      const [id, name] = result.OperationDescription.split(' || ').map((v: string) => v.trim());
      result.Operation = id;
      result.OperationDescription = name;
    } else if (result.OperationDescription && !result.Operation) {
      // If OperationDescription exists but Operation doesn't, keep description as is
      // Operation might already be set separately
    }

    return result;
  };

  const handleAddRow = async (newRow: any) => {
    console.log("Adding new operation detail:", newRow);
    // Split piped data for TypeOfActionDescription and OperationDescription
    const rowWithSplitData = splitPipedData(newRow);
    
    // Convert IsWorkShop & IsForwardReturn values back to store format
    // Extract ID from QC1Code if it's in piped format
    // Transform CodeInformation to {CodeNoCUU: value} format
    const isWorkShopValue = transformIsWorkShopForSave(rowWithSplitData.IsWorkShop);
    
    // Create transformed row, explicitly setting IsMobile to override any existing value
    const { IsMobile: _, IsOneWay: __, ...rowWithoutMobileAndOneWay } = rowWithSplitData; // Remove existing IsMobile and IsOneWay if present
    
    // Handle IsForwardReturn and IsOneWay (mutually exclusive)
    const isForwardReturnValue = transformIsForwardReturnForSave(rowWithSplitData.IsForwardReturn);
    let isForwardReturn: number | string = "";
    let isOneWay: number | string = "";
    
    if (isForwardReturnValue === 1) {
      // Forward/Return selected
      isForwardReturn = 1;
      isOneWay = 0;
    } else if (isForwardReturnValue === 0) {
      // One-Way selected
      isForwardReturn = 0;
      isOneWay = 1;
    } else {
      // Neither selected
      isForwardReturn = "";
      isOneWay = "";
    }
    
    const transformedRow = {
      ...rowWithoutMobileAndOneWay,
      IsWorkShop: isWorkShopValue,
      // Set IsMobile as opposite of IsWorkShop: if IsWorkShop = 1, then IsMobile = 0, and vice versa
      IsMobile: isWorkShopValue === 1 ? 0 : 1,
      IsForwardReturn: isForwardReturn,
      IsOneWay: isOneWay,
      QC1Code: extractIdFromPipedFormat(rowWithSplitData.QC1Code),
      CodeInformation: transformCodeInformationForSave(rowWithSplitData.CodeInformation),
      ModeFlag: "Insert",
    };

    // Update store with new operation detail
    const currentOperationDetails = workOrder?.OperationDetails || [];
    const updatedOperationDetails = [...currentOperationDetails, transformedRow];

    useWorkOrderStore.setState((state) => {
      const updatedWorkOrder = {
        ...state.workOrder!,
        OperationDetails: updatedOperationDetails,
      };

      console.log('🔁 WorkOrder Store after Add Row:', updatedWorkOrder);

      return { workOrder: updatedWorkOrder };
    });
  };

  const handleEditRow = async (editedRow: any, rowIndex: number) => {
    console.log("Editing operation detail:", editedRow, "at index:", rowIndex);
    // Split piped data for TypeOfActionDescription and OperationDescription
    const rowWithSplitData = splitPipedData(editedRow);
    
    // Convert IsWorkShop & IsForwardReturn values back to store format
    // Extract ID from QC1Code if it's in piped format
    // Transform CodeInformation to {CodeNoCUU: value} format
    
    // Get the original row to check OrderID
    const currentOperationDetails = workOrder?.OperationDetails || [];
    const originalRow = currentOperationDetails[rowIndex];
    
    // Determine ModeFlag: If OrderID is empty/null/undefined, it's a new row (Insert), otherwise Update
    const orderID = editedRow?.OrderID || originalRow?.OrderID || "";
    const modeFlag = (!orderID || orderID.trim() === "") ? "Insert" : "Update";
    
    // Convert IsWorkShop value and set IsMobile as opposite
    const isWorkShopValue = transformIsWorkShopForSave(rowWithSplitData.IsWorkShop);
    
    // Create transformed row, explicitly setting IsMobile to override any existing value
    const { IsMobile: _, IsOneWay: __, ...rowWithoutMobileAndOneWay } = rowWithSplitData; // Remove existing IsMobile and IsOneWay if present
    
    // Handle IsForwardReturn and IsOneWay (mutually exclusive)
    const isForwardReturnValue = transformIsForwardReturnForSave(rowWithSplitData.IsForwardReturn);
    let isForwardReturn: number | string = "";
    let isOneWay: number | string = "";
    
    if (isForwardReturnValue === 1) {
      // Forward/Return selected
      isForwardReturn = 1;
      isOneWay = 0;
    } else if (isForwardReturnValue === 0) {
      // One-Way selected
      isForwardReturn = 0;
      isOneWay = 1;
    } else {
      // Neither selected
      isForwardReturn = "";
      isOneWay = "";
    }
    
    const transformedRow = {
      ...rowWithoutMobileAndOneWay,
      IsWorkShop: isWorkShopValue,
      // Set IsMobile as opposite of IsWorkShop: if IsWorkShop = 1, then IsMobile = 0, and vice versa
      IsMobile: isWorkShopValue === 1 ? 0 : 1,
      IsForwardReturn: isForwardReturn,
      IsOneWay: isOneWay,
      QC1Code: extractIdFromPipedFormat(rowWithSplitData.QC1Code),
      CodeInformation: transformCodeInformationForSave(rowWithSplitData.CodeInformation),
      ModeFlag: modeFlag,
    };

    // Update store with edited operation detail
    const updatedOperationDetails = [...currentOperationDetails];
    updatedOperationDetails[rowIndex] = transformedRow;

    useWorkOrderStore.setState((state) => {
      const updatedWorkOrder = {
        ...state.workOrder!,
        OperationDetails: updatedOperationDetails,
      };

      console.log('✏️ WorkOrder Store after Edit Row:', updatedWorkOrder);

      return { workOrder: updatedWorkOrder };
    });
  };

  const handleDeleteRow = async (row: any, rowIndex: number) => {
    console.log("Deleting operation detail:", row, "at index:", rowIndex);
    
    try {
      const currentOperationDetails = workOrder?.OperationDetails || [];
      
      // The rowIndex is from the filtered/displayed data, not the store data
      // We need to map the displayed index back to the store index
      // Build a mapping: store indices that are visible (not deleted)
      const visibleStoreIndices: number[] = [];
      currentOperationDetails.forEach((dataRow, storeIndex) => {
        if (dataRow?.ModeFlag !== 'Delete') {
          visibleStoreIndices.push(storeIndex);
        }
      });
      
      // Get the store index corresponding to the displayed row index
      if (rowIndex < 0 || rowIndex >= visibleStoreIndices.length) {
        console.warn("Invalid row index for deletion:", rowIndex);
        return;
      }
      
      const targetStoreIndex = visibleStoreIndices[rowIndex];
      const rowToDelete = currentOperationDetails[targetStoreIndex];
      
      if (!rowToDelete) {
        console.warn("Row not found at store index:", targetStoreIndex);
        return;
      }
      
      // Verify this is the correct row by comparing OrderID if available
      // or by checking it's not already deleted
      if (rowToDelete?.ModeFlag === 'Delete') {
        console.warn("Row is already marked for deletion:", rowToDelete);
        return;
      }
      
      // For additional safety, verify with OrderID if the row has one
      if (row?.OrderID && row.OrderID.trim() !== "" && rowToDelete?.OrderID) {
        if (row.OrderID !== rowToDelete.OrderID) {
          console.warn("Row OrderID mismatch. Expected:", row.OrderID, "Found:", rowToDelete.OrderID);
          // Still proceed, but log warning
        }
      }
      
      // Determine if this is a newly added row (ModeFlag: "Insert" or no OrderID) or existing row
      const isNewRow = rowToDelete.ModeFlag === 'Insert' || 
                       !rowToDelete.OrderID || 
                       rowToDelete.OrderID.trim() === "";
      
      let updatedOperationDetails;
      
      if (isNewRow) {
        // Newly added row - remove it completely (it doesn't exist in backend yet)
        updatedOperationDetails = currentOperationDetails.filter((_, index) => index !== targetStoreIndex);
        console.log("✅ New row removed completely:", rowToDelete);
      } else {
        // Existing row - mark as deleted but keep in array (will be sent to backend with ModeFlag: "Delete")
        updatedOperationDetails = [...currentOperationDetails];
        updatedOperationDetails[targetStoreIndex] = {
          ...rowToDelete,
          ModeFlag: 'Delete',
        };
        console.log("✅ Existing row marked for deletion:", rowToDelete);
      }
      
      // Update store
      useWorkOrderStore.setState((state) => ({
        workOrder: {
          ...state.workOrder!,
          OperationDetails: updatedOperationDetails,
        },
      }));
      
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  // Default row values - IsWorkShop stored as display string (converted on save)
  const defaultRowValues = {
    OrderID: "",
    TypeOfAction: "",
    TypeOfActionDescription: "",
    Operation: "",
    OperationDescription: "",
    OperationStatus: "",
    // CodeNo: "",
    IsWorkShop: "",
    IsForwardReturn: "",
    CodeInformation: [],
    QC1Code: "",
    QC1Value: "",
    Remarks: "",
    ModeFlag: "Insert",
  };

  const validationRules = {
    requiredFields: ["TypeOfActionDescription", "OperationDescription", "IsWorkShop"],
    // requiredFields: [],
    maxLength: {
      OrderID: 50,
      TypeOfActionDescription: 100,
      Operation: 100,
      Remarks: 500,
    },
    customValidationFn: (values: Record<string, any>) => {
      const errors: Record<string, string> = {};

      // if (values.QC1Value && isNaN(Number(values.QC1Value))) {
      //   errors.QC1Value = "QC1 Value must be a number";
      // }

      return errors;
    },
  };

  return (
    <>
      {loading ? (
        <>
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
            <div className="text-lg font-semibold text-gray-700">Loading data...</div>
          </div>
        </>
      ) : (
        <>
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
                          ref={workOrderPanelRef}
                          panelId="WorkOrder"
                          panelTitle="Work Order Details"
                          panelConfig={workOrderPanelConfig(orderType)}
                          initialData={workOrder?.Header}
                          panelSubTitle="Work Order Details"
                          workOrderNo={workOrder?.Header?.WorkorderNo || workOrderNo || ''}
                          workOrderStatus={workOrder?.Header?.Status || ''}
                          workOrderNoCallback={(value) => {
                            // Update workOrderNo in the store
                            console.log("===============", value);
                            useWorkOrderStore.getState().updateHeader('WorkorderNo', value);
                            
                            // Update URL with new ID and trigger page refresh
                            if (value && value.trim() !== '') {
                              setSearchParams({ id: value.trim() });
                              // The useEffect will automatically trigger when workOrderNo changes
                              // No need for manual refresh as the useEffect handles data fetching
                            }
                          }}
                          
                        />
                      </div>

                      {/* Buttons Row */}
                      <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200"></div>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="lg:col-span-1 w-4/6">
                    <div className="bg-white rounded-lg border border-gray-200 mb-6 px-4 py-6">
                      <SmartGridPlus
                      columns={operationDetailsColumns}
                      data={transformDataForDisplay(workOrder?.OperationDetails || [])}
                      recordCount={transformDataForDisplay(workOrder?.OperationDetails || []).length}
                      gridTitle="Operation Details"
                      inlineRowAddition={true}
                      inlineRowEditing={true}
                      onAddRow={handleAddRow}
                      onEditRow={handleEditRow}
                      onDeleteRow={handleDeleteRow}
                      defaultRowValues={defaultRowValues}
                      validationRules={validationRules}
                      addRowButtonLabel="Add Operation"
                      addRowButtonPosition="top-right"
                      paginationMode="pagination"
                      showDefaultConfigurableButton={false}
                      onInfoClick={(rowData, rowIndex) => {
                        console.log("Info clicked:", rowData, "at index:", rowIndex);
                        setSelectedCode(rowData);
                        setShowCodeInformation(true);
                      }}
                      onLinkClick={(rowData, columnKey, rowIndex) => {
                        // Transform rowData with IsWorkShop and IsForwardReturn converted to display strings
                        const transformedRowData = {
                          ...rowData,
                          IsWorkShop: transformIsWorkShopForSave(rowData.IsWorkShop),
                          IsForwardReturn: transformIsForwardReturnForSave(rowData.IsForwardReturn),
                        };
                        console.log("Link clicked:", transformedRowData);
                        console.log("Column key:", columnKey);
                        console.log("Row index:", rowIndex);
                        
                        // Extract IsWorkShop value (1 or 0) and set state
                        const isWorkShopValue = transformedRowData.IsWorkShop;
                        const numericIsWorkShop = isWorkShopValue === 1 || isWorkShopValue === "1" ? 1 : 
                                                  isWorkShopValue === 0 || isWorkShopValue === "0" ? 0 : null;
                        
                        // Update state to control field visibility
                        setSelectedOperation(transformedRowData);
                        setIsWorkShop(numericIsWorkShop);
                        console.log("Selected operation IsWorkShop value:", numericIsWorkShop);
                      }}
                    />
                    </div>
                    <div className="rounded-lg pb-4 px-1 flex flex-col h-full">
                      {/* Only show Location Details panel when an operation is selected */}
                      {selectedOperation !== null && (
                        <>
                          <div className="bg-white mb-6 rounded-lg">
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
                              badgeValue={isWorkShopLabel}
                            />
                            {/* Location Details Action Buttons - Only show when operation is selected */}
                            {isWorkShop === 1 && (
                              <div
                                className="flex border-b border-l border-r border-gray-200 p-2 rounded-md"
                                style={{ marginTop: "-1.5rem" }}
                              >
                                {/* Create Forward Trip Button */}
                                <button
                                  onClick={() => {
                                    console.log("Create Forward Trip clicked");
                                    // Add your click handler here
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-7 h-7 text-gray-600 border border-gray-300 rounded-md p-1" />
                                  <span>Create Forward Trip</span>
                                </button>

                                {/* Forward Trip Execution Button */}
                                <button
                                  onClick={() => {
                                    console.log(
                                      "Forward Trip Execution clicked"
                                    );
                                    // Add your click handler here
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  <Shuffle className="w-7 h-7 text-gray-600 border border-gray-300 rounded-md p-1" />
                                  <span>
                                    Forward Trip Execution - TRIP0000234
                                  </span>
                                </button>

                                {/* Create Return Trip Button */}
                                <button
                                  onClick={() => {
                                    console.log("Create Return Trip clicked");
                                    // Add your click handler here
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-7 h-7 text-gray-600 border border-gray-300 rounded-md p-1" />
                                  <span>Create Return Trip</span>
                                </button>

                                {/* Return Trip Execution Button */}
                                <button
                                  onClick={() => {
                                    console.log(
                                      "Return Trip Execution clicked"
                                    );
                                    // Add your click handler here
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  <Shuffle className="w-7 h-7 text-gray-600 border border-gray-300 rounded-md p-1" />
                                  <span>
                                    Return Trip Execution - TRIP0000235
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>

                          {isWorkShop === 1 && (
                            <div className="bg-white mb-6 rounded-lg">
                              <div className="">
                                <DynamicPanel
                                  ref={scheduleDetailsRef}
                                  panelId="scheduleDetails"
                                  panelTitle="Schedule Details"
                                  panelIcon={
                                    <MapPinned className="w-5 h-5 text-blue-500" />
                                  }
                                  panelConfig={SchedulePanelConfig}
                                  collapsible={true}
                                  badgeValue={isWorkShopLabel}
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
                                              : state.workOrder
                                                  .WorkorderSchedule?.ModeFlag,
                                        },
                                      },
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
                  <div className="flex items-center gap-4"></div>
                  <div className="flex items-center gap-4">
                    {/* {selectedOperation !== null && (
                      <>
                        <button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm"
                          onClick={handleGetFormValues}
                        >
                          Save Details
                        </button>
                      </>
                    )}
                    {selectedOperation === null && (
                      <> */}
                        <button className={buttonCancel}>Cancel</button>
                        <button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm"
                          onClick={handleGetFormValues}
                        >
                          Save
                        </button>
                        {/* <button className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">
                      Amend
                    </button> */}
                      {/* </>
                    )} */}
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
              <BillingDetails
                workOrderNumber={workOrder?.Header?.WorkorderNo}
              />
            </SideDrawer>

            <WorkOrderOperationDetails
              onClose={closeOperationDetails}
              value={showOperstionDetails}
            />

            {/* Code Information Drawer */}
            <CodeInformationDrawer
              isOpen={showCodeInformation}
              onClose={() => setShowCodeInformation(false)}
              operationCode={selectedCode?.OrderID ? `${selectedCode.OrderID}` : "Operation"}
              // selectedCode={selectedCode?.CodeNo}
              onCodeSelect={(code) => {
                console.log("Code selected:", code);
                // Handle code selection if needed
              }}
            />
          </AppLayout>
        </>
      )}
    </>
  );
});

export default WorkOrderForm;
