import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  useEffect,
} from "react";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import type { PanelConfig } from "@/types/dynamicPanel";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Copy,
  BookX,
  Link,
  Paperclip,
  MapPinned,
} from "lucide-react";
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
  const locationDetailsRef = useRef<DynamicPanelRef>(null);
  const {
    workOrder,
    searchWorkOrder,
    loading,
    updateHeaderField,
    updateBillingField,
  } = useWorkOrderStore();

  useEffect(() => {
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Work Order Selection",
        OUID: 4,
        Role: "ramcorole",
        UserID: "ramcouser",
      },
      SearchCriteria: {
        WorkOrderNo: "RWO-000188",
        AdditionalFilter: [
          {
            FilterName: "ServiceType",
            FilterValue: "Standard",
          },
        ],
      },
    };

    searchWorkOrder(payload);
  }, [searchWorkOrder]);

  useEffect(() => {
    if (workOrder?.Header) {
      setWorkOrderData(workOrder.Header);
    }
  }, [workOrder]);

  useEffect(() => {
    if (workOrder) {
      console.clear();
      console.log(
        "📌 Final JSON from store:",
        workOrder?.Header?.SupplierContractDescription
      );
      console.log("📌 WorkorderSchedule:", workOrder);
    }
  }, [workOrder]);

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
      value: workOrder?.Header?.EquipmentType, // "Wagon" / "Container"
      options: [
        { label: "Wagon", value: "Wagon" },
        { label: "Container", value: "Container" },
      ],
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      events: {
        onChange: (val) => {
          setOrderType(val); // UI
          useWorkOrderStore.setState((state) => ({
            workOrder: {
              ...state.workOrder,
              Header: {
                ...state.workOrder.Header,
                WorkOrderType: val,
                EquipmentType: val, 
              },
            },
          }));
        },
      },
    },
    WagonCondainterID: {
      id: "WagonCondainterID",
      label: "Wagon/Container ID",
      fieldType: "lazyselect",
      width: "half",
      value: workOrder?.Header?.EquipmentID, // 🔥 correct bind
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
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
      value: workOrder?.Header?.SupplierContractDescription,
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
      width: "full",
      value: workOrder?.Header?.CustomerContractID,
      mandatory: false,
      visible: true,
      editable: true,
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
      value: workOrder?.Header?.AppointmentDate,
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
      value: workOrder?.Header?.Cluster,
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
      value: workOrder?.Header?.ProductID,
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
      value: workOrder?.Header?.UNCodeID,
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
      value: workOrder?.Header?.LoadType?.IsLoaded === "1" ? "BUY" : "SELL",
      options: [
        { label: "Loaded", value: "BUY" },
        { label: "Empty", value: "SELL" },
      ],
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      events: {
        onChange: (val) => {
          useWorkOrderStore.setState((state) => ({
            workOrder: {
              ...state.workOrder,
              Header: {
                ...state.workOrder.Header,
                LoadType: val,
                ModeFlag:
                  state.workOrder.Header.ModeFlag === "NoChange"
                    ? "Update"
                    : state.workOrder.Header.ModeFlag,
              },
            },
          }));
        },
      },
    },
    Hazardous: {
      id: "Hazardous",
      label: "Hazardous",
      fieldType: "switch",
      width: "half",
      value: workOrder?.Header?.Hazardous === "1",
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
      value: workOrder?.Header?.EventDate,
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
      value: workOrder?.Header?.PlaceOfEventID,
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
        },
      },
    },
    AcceptedByForwardis: {
      id: "AcceptedByForwardis",
      label: "Accepted By Forwardis",
      fieldType: "switch",
      width: "full",
      value:
        workOrder?.Header?.BillingHeaderDetails?.IsAcceptedByForwardis === "1",
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
      value: workOrder?.Header?.BillingHeaderDetails?.IsReinvoiceCost === "1",
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
      value: workOrder?.Header?.BillingHeaderDetails?.InvoiceTo,
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
      value: workOrder?.Header?.BillingHeaderDetails?.FinancialComments,
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
      value: {
        dropdown: workOrder?.Header?.QC1Code,
        input: workOrder?.Header?.QC1Value,
      },
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      order: 24,
    },

    QCUserDefined2: {
      id: "QCUserDefined2",
      label: "QC Userdefined 2",
      fieldType: "inputdropdown",
      width: "half",
      value: {
        dropdown: workOrder?.Header?.QC2Code,
        input: workOrder?.Header?.QC2Value,
      },
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      order: 25,
    },

    QCUserDefined3: {
      id: "QCUserDefined3",
      label: "QC Userdefined 3",
      fieldType: "inputdropdown",
      width: "half",
      value: {
        dropdown: workOrder?.Header?.QC3Code,
        input: workOrder?.Header?.QC3Value,
      },
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      order: 26,
    },

    Remarks1: {
      id: "Remarks1",
      label: "Remarks 1",
      fieldType: "text",
      width: "half",
      value: workOrder?.Header?.Remarks1,
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      order: 27,
    },

    Remarks2: {
      id: "Remarks2",
      label: "Remarks 2",
      fieldType: "text",
      width: "half",
      value: workOrder?.Header?.Remarks2,
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
      order: 28,
    },

    Remarks3: {
      id: "Remarks3",
      label: "Remarks 3",
      fieldType: "text",
      width: "half",
      value: workOrder?.Header?.Remarks3,
      mandatory: false,
      visible: showMoreDetails,
      editable: true,
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
  const openOperationDetails = () => {
    setShowOperationDetails(true);
    console.log("clicked,showOperstionDetails", showOperstionDetails);
  };
  const closeOperationDetails = () => {
    setShowOperationDetails(false);
    console.log("clicked,showOperstionDetails", showOperstionDetails);
  };

  const locationPanelConfig: PanelConfig = {
    Origin: {
      id: "Origin",
      label: "Origin",
      fieldType: "lazyselect",
      width: "six",
      value: "",
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
      value: "",
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
      value: "",
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
      value: "",
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
      value: "",
      visible: true,
      mandatory: false,
      editable: true,
      order: 5,
      fetchOptions: fetchMaster("Location Init"),
    },
  };

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
      reviews: [{ reviewer: "Mike R.", rating: 4, comment: "Very comfortable" }],
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
      reviews: [{ reviewer: "Sarah T.", rating: 5, comment: "Amazing camera quality" }],
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
                {/* LEFT SECTION */}
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
                          // Mapping for lazyselect values
                          if (updatedHeader.WagonCondainterID) {
                            const [id, desc] =
                              updatedHeader.WagonCondainterID.split(" || ");
                            updatedHeader.EquipmentID = id;
                            updatedHeader.EquipmentDescription = desc;
                          }

                          if (updatedHeader.SuplierContract) {
                            const [id, desc] =
                              updatedHeader.SuplierContract.split(" || ");
                            updatedHeader.SupplierContractID = id;
                            updatedHeader.SupplierContractDescription = desc;
                          }

                          if (updatedHeader.CustomerContract) {
                            const [id, desc] =
                              updatedHeader.CustomerContract.split(" || ");
                            updatedHeader.CustomerContractID = id;
                            updatedHeader.CustomerContractDescription = desc;
                          }

                          // Update store
                          useWorkOrderStore.setState((state) => ({
                            workOrder: {
                              ...state.workOrder,
                              Header: {
                                ...state.workOrder.Header,
                                ...updatedHeader,
                                ModeFlag: "Update", // 🔥 IMPORTANT
                              },
                            },
                          }));
                        }}
                      />
                    </div>
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        const payload = useWorkOrderStore.getState().workOrder;
                        console.log(
                          "🚀 FINAL PAYLOAD TO SAVE:",
                          JSON.stringify(payload, null, 2)
                        );
                        alert("Check console for payload!");
                      }}
                    >
                      Debug Payload
                    </button>

                    {/* Buttons Row */}
                    <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200"></div>
                  </div>
                </div>
                {/* <Button
              className=" mt-3 bg-blue-600 text-white"
              onClick={saveToZustand}
            >
              Save Work Order
            </Button> */}

                {/* RIGHT SECTION */}
                <div className="lg:col-span-1 w-4/6">
                  <div className="bg-white rounded-lg border border-gray-200 mb-6">
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
                        onDataChange={(data) => {
                          setWorkOrderData((prev) => ({
                            ...prev,
                            Location: data,
                          }));
                        }}
                      />
                    </div>
                    {/* <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
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
                </Button> */}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
                <div className="flex items-center gap-4"></div>
                <div className="flex items-center gap-4">
                  <button className={buttonCancel}>Cancel</button>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">
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
