import React, { useState, useRef } from "react";
import {
  X,
  Search,
  Calendar,
  Clock,
  Bookmark,
  Banknote,
  Wrench,
  BookmarkCheck,
  FileText,
  Expand,
  Bus,
  Container,
  Package,
  BaggageClaim,
  CalendarCheck,
  Info,
  Plus,
  WandSparkles,
  MoreVertical, Trash2, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DynamicPanel, type DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig, PanelSettings } from "@/types/dynamicPanel";
import { BillingDetailsPanel } from "./BillingDetails";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { SimpleDropDown } from "../Common/SimpleDropDown";
import { SideDrawer } from "../Common/SideDrawer";
import { BulkUpdatePlanActuals } from "./BulkUpdatePlanActuals";
import jsonStore from '@/stores/jsonStore';
import { useEffect } from 'react';
interface PlanAndActualsDetailsProps {
  isEditQuickOrder?: boolean;
  resourceId?: string;
  PlanInfo?: {},
  onCloseDrawer()
}
export const PlanAndActualDetails = ({ onCloseDrawer, isEditQuickOrder, resourceId }: PlanAndActualsDetailsProps) => {
  let currentStep = 1;
  const [planType, setPlanType] = useState("plan");
  const [isOpen, setIsOpen] = useState(false);
  const [wagonDetailsVisible, setWagonDetailsVisible] = useState(true);
  const [operationalDetailsVisible, setOperationalDetailsVisible] =
    useState(true);
  const [billingDetailsVisible, setBillingDetailsVisible] = useState(true);

  const [wagonDetailsTitle, setWagonDetailsTitle] = useState("Wagon Details");
  const [containerDetailsTitle, setContainerDetailsTitle] =
    useState("Container Details");
  const [productDetailsTitle, setProductDetailsTitle] =
    useState("Product Details");
  const [thuDetailsTitle, setTHUDetailsTitle] = useState("THU Details");
  const [journeyDetailsTitle, setJourneyDetailsTitle] = useState(
    "Journey and Scheduling Details"
  );
  const [otherDetailsTitle, setOtherDetailsTitle] = useState("Other Details");
  const [operationalDetailsTitle, setOperationalDetailsTitle] = useState(
    "Operational Details"
  );
  const [billingDetailsTitle, setBillingDetailsTitle] =
    useState("Billing Details");
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const PlaceList = [
    "Bangalore",
    "New Delhi",
    "Gujarat",
    "Surat",
    "Mumbai",
  ];
  // Mock functions for user config management
  const getUserPanelConfig = (
    userId: string,
    panelId: string
  ): PanelSettings | null => {
    const stored = localStorage.getItem(`panel-config-${userId}-${panelId}`);
    return stored ? JSON.parse(stored) : null;
  };

  const saveUserPanelConfig = (
    userId: string,
    panelId: string,
    settings: PanelSettings
  ): void => {
    localStorage.setItem(
      `panel-config-${userId}-${panelId}`,
      JSON.stringify(settings)
    );
    console.log(`Saved config for panel ${panelId}:`, settings);
  };

  const wagonDetailsRef = useRef<DynamicPanelRef>(null);
  const containerDetailsRef = useRef<DynamicPanelRef>(null);
  const productDetailsRef = useRef<DynamicPanelRef>(null);
  const thuDetailsRef = useRef<DynamicPanelRef>(null);
  const journeyDetailsRef = useRef<DynamicPanelRef>(null);
  const otherDetailsRef = useRef<DynamicPanelRef>(null);

  const handleSavePlanActuals = () => {
    const formValues = {
      wagonNewDetails: wagonDetailsRef.current?.getFormValues() || {},
      containerDetails: containerDetailsRef.current?.getFormValues() || {},
      productDetails: productDetailsRef.current?.getFormValues() || {},
      thuDetails: thuDetailsRef.current?.getFormValues() || {},
      journeyDetails: journeyDetailsRef.current?.getFormValues() || {},
      otherDetails: otherDetailsRef.current?.getFormValues() || {},
    };
    if (planType === "plan") {
      // Get the current PlanDetails from jsonStore
      const currentPlanDetails = jsonStore.getPlanDetailsJson() || {};

      // Prepare the updated PlanDetails by merging new form values with existing ones
      const updatedPlanDetails = {
        ...currentPlanDetails,
        "PlanLineUniqueID": "P0" + ((parseInt(localStorage.getItem('planCount')) + 1)),
        "ModeFlag": "Insert",
        WagonDetails: { ...currentPlanDetails.WagonDetails, ...formValues.wagonNewDetails },
        ContainerDetails: { ...currentPlanDetails.ContainerDetails, ...formValues.containerDetails },
        ProductDetails: { ...currentPlanDetails.ProductDetails, ...formValues.productDetails },
        THUDetails: { ...currentPlanDetails.THUDetails, ...formValues.thuDetails },
        JourneyAndSchedulingDetails: { ...currentPlanDetails.JourneyAndSchedulingDetails, ...formValues.journeyDetails },
        OtherDetails: { ...currentPlanDetails.OtherDetails, ...formValues.otherDetails },
      };
      localStorage.setItem('planCount', (parseInt(localStorage.getItem('planCount'))+1).toString());
      // Set the updated ActualDetails in jsonStore
      jsonStore.setPlanDetailsJson(updatedPlanDetails);
      jsonStore.pushPlanDetailsToResourceGroup(resourceId, updatedPlanDetails)
      console.log("Updated Plan Details in FULL JSON:", jsonStore.getJsonData());
    } else {
      // Get the current ActualDetails from jsonStore
      const currentActualDetails = jsonStore.getActualDetails() || {};

      // Prepare the updated ActualDetails by merging new form values with existing ones
      const updatedActualDetails = {
        ...currentActualDetails,
        "ActualLineUniqueID": "A0" + ((parseInt(localStorage.getItem('actualCount')) + 1)),
        "ModeFlag": "Insert",

        WagonDetails: { ...currentActualDetails.WagonDetails, ...formValues.wagonNewDetails },
        ContainerDetails: { ...currentActualDetails.ContainerDetails, ...formValues.containerDetails },
        ProductDetails: { ...currentActualDetails.ProductDetails, ...formValues.productDetails },
        THUDetails: { ...currentActualDetails.THUDetails, ...formValues.thuDetails },
        JourneyAndSchedulingDetails: { ...currentActualDetails.JourneyAndSchedulingDetails, ...formValues.journeyDetails },
        OtherDetails: { ...currentActualDetails.OtherDetails, ...formValues.otherDetails },
      };
      localStorage.setItem('actualCount', (parseInt(localStorage.getItem('actualCount'))+1).toString());
      // Set the updated ActualDetails in jsonStore
      jsonStore.setActualDetailsJson(updatedActualDetails);
      jsonStore.pushActualDetailsToResourceGroup(resourceId, updatedActualDetails)
      console.log("Updated Actual Details in FULL JSON:", jsonStore.getJsonData());
    }
    const fullJson = jsonStore.getJsonData();
    console.log("FULL Plan&Actual JSON :: ", fullJson);
  };

  const [billingData, setBillingData] = useState({
    billingDetail: "DB00023/42",
    contractPrice: 1200.0,
    netAmount: 5580.0,
    billingType: "Wagon",
    unitPrice: 1395.0,
    billingQty: 4,
    tariff: "TAR000750 - Tariff Description",
    tariffType: "Rate Per Block Train",
    remarks: "",
  });

  // Basic Details Panel Configuration
  const wagonDetailsConfig: PanelConfig = {
    WagonType: {
      id: "WagonType",
      label: "Wagon Type",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select Type",
      order: 1,
      options: [{ label: "Other", value: "other" }],
    },
    WagonID: {
      id: "WagonID",
      label: "Wagon ID",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Enter ID",
      order: 2,
    },
    wagonQWagonQuantityuantity: {
      id: "WagonQuantity",
      label: "Wagon Quantity",
      fieldType: "inputdropdown",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      options: [
        { label: "EA", value: "EA" },
        { label: "EU", value: "EU" },
      ],
    },
    WagonTareWeight: {
      id: "WagonTareWeight",
      label: "Wagon Tare Weight",
      fieldType: "inputdropdown",
      width: 'third',
      placeholder: "Enter value",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      options: [
        { label: "TON", value: "TON" },
        { label: "KG", value: "KG" },
        { label: "ST", value: "ST" },
      ]
    },
    WagonGrossWeight: {
      id: "WagonGrossWeight",
      label: "Wagon Gross Weight",
      fieldType: 'inputdropdown',
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      value: "",
      options: [
        { label: "TON", value: "TON" },
        { label: "KG", value: "KG" },
        { label: "ST", value: "ST" },
      ]
    },
    WagonLength: {
      id: "WagonLength",
      label: "Wagon Length",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      value: { dropdown: 'Meter', input: '25' },
      options: [
        { label: "M", value: "Meter" },
        { label: "Feet", value: "Feet" },
      ]
    },
    WagonSequence: {
      id: "WagonSequence",
      label: "Wagon Sequence",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      placeholder: "Enter Wagon Sequence",
    },
  };

  // Container Details Panel Configuration
  const containerDetailsConfig: PanelConfig = {
    ContainerType: {
      id: "ContainerType",
      label: "Container Type",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select Type",
      order: 1,
      options: [{ label: "Other", value: "other" }],
    },
    ContainerID: {
      id: "ContainerID",
      label: "Container ID",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Enter ID",
      order: 2,
    },
    ContainerQuantity: {
      id: "ContainerQuantity",
      label: "Container Quantity",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      value: "",
      options: [
        { label: "EA", value: "EA" },
        { label: "EU", value: "EU" },
      ],
    },
    ContainerTareWeight: {
      id: "ContainerTareWeight",
      label: "Container Tare Weight",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      value: "",
      options: [
        { label: "TON", value: "TON" },
        { label: "KG", value: "KG" },
        { label: "ST", value: "ST" },
      ]
    },
    ContainerLoadWeight: {
      id: "ContainerLoadWeight",
      label: "Container Load Weight",
      fieldType: "inputdropdown",
      width: 'third',
      value: "",
      inputType: "number",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      options: [
        { label: "TON", value: "TON" },
        { label: "KG", value: "KG" },
        { label: "ST", value: "ST" },
      ]
    },
  };
  // Product Details Panel Configuration
  const productDetailsConfig: PanelConfig = {
    NHM: {
      id: "NHM",
      label: "NHM",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select NHM",
      order: 1,
      options: [{ label: "NHM", value: "NHM" }],
    },
    ProductID: {
      id: "ProductID",
      label: "Product ID",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Wheat Muslin",
      order: 2,
    },
    ProductQuantity: {
      id: "ProductQuantity",
      label: "Product Quantity",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      value: "",
      options: [
        { label: "EA", value: "EA" },
        { label: "EU", value: "EU" },
      ],
    },
    ClassofStores: {
      id: "ClassofStores",
      label: "Container Tare Weight",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      placeholder: "Select Class of Stores",
      options: [
        { label: "Truck 4.2", value: "truck-4.2" },
        { label: "Truck 4.5", value: "truck-4.5" },
        { label: "Truck 5.2", value: "truck-5.2" },
      ],
    },
    UNCode: {
      id: "UNCode",
      label: "UN Code",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      placeholder: "Select UN Code",
      options: [
        { label: "Block Train Convention", value: "Block Train Convention" },
      ],
    },
    DGClass: {
      id: "DGClass",
      label: "DG Class",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      placeholder: "Select Class",
      options: [
        { label: "Block Train Convention", value: "Block Train Convention" },
      ],
    },
  };
  // THU Details Panel Configuration
  const thuDetailsConfig: PanelConfig = {
    THUID: {
      id: "THUID",
      label: "THU ID",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select THU ID",
      order: 1,
      options: [{ label: "THU", value: "THU" }],
    },
    THUSerialNo: {
      id: "THUSerialNo",
      label: "THU Serial No.",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select THU Serial No.",
      order: 2,
    },
    THUQuantity: {
      id: "THUQuantity",
      label: "THU Quantity",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      value: "",
      options: [
        { label: "EA", value: "EA" },
        { label: "EU", value: "EU" },
      ],
    },
    THUWeight: {
      id: "THUWeight",
      label: "THU Weight",
      fieldType: "inputdropdown",
      width: 'third',
      inputType: "number",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      placeholder: "Enter THU Weight",
      value: "",
      options: [
        { label: "TON", value: "TON" },
        { label: "KG", value: "KG" },
        { label: "ST", value: "ST" },
      ]
    },
  };
  // journey & scheduling Details Panel Configuration
  const journeyDetailsConfig: PanelConfig = {
    Departure: {
      id: "Departure",
      label: "Departure",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select THU ID",
      order: 1,
      options: [{ label: "Departure", value: "Departure" }],
    },
    Arrival: {
      id: "Arrival",
      label: "Arrival",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select THU Serial No.",
      order: 2,
      options: [{ label: "Arrival", value: "Arrival" }],
    },
    ActivityLocation: {
      id: "ActivityLocation",
      label: "Activity Location",
      fieldType: "search",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      placeholder: "Search Location",
      searchData: PlaceList
    },
    Activity: {
      id: "Activity",
      label: "Activity",
      fieldType: "select",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      placeholder: "Select Activity",
      options: [{ label: "Loading", value: "Loading" }],
    },
    PlannedDateTime: {
      id: "PlannedDateTime",
      label: "Planned Date and Time",
      fieldType: "date",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      placeholder: "10-Mar-2025",
    },
    RevPlannedDateTime: {
      id: "RevPlannedDateTime",
      label: "Rev. Planned Date and Time",
      fieldType: "date",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      placeholder: "10-Mar-2025",
    },
    TrainNo: {
      id: "TrainNo",
      label: "Train No.",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      placeholder: "Enter Train No.",
    },
    LoadType: {
      id: "LoadType",
      label: "Load Type",
      fieldType: "radio",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
    },
  };
  // other Details Panel Configuration
  const otherDetailsConfig: PanelConfig = {
    FromDate: {
      id: "FromDate",
      label: "From Date",
      fieldType: "date",
      width: 'third',
      value: "12-Mar-2025",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select From Date",
      order: 1,
      options: [{ label: "Departure", value: "Departure" }],
    },
    FromTime: {
      id: "FromTime",
      label: "From Time",
      fieldType: "time",
      width: 'third',
      value: "08:00:00",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select From Time",
      order: 2,
    },
    ToDate: {
      id: "ToDate",
      label: "To Date",
      fieldType: "date",
      width: 'third',
      value: "12-Mar-2025",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      placeholder: "Select To Date",
    },
    ToTime: {
      id: "ToTime",
      label: "To Time",
      fieldType: "time",
      width: 'third',
      value: "08:00:00",
      mandatory: false,
      visible: true,
      editable: true,
      placeholder: "Select To Time",
      order: 4,
    },
    QCUserDefined1: {
      id: "QCUserDefined1",
      label: "QC Userdefined 1",
      fieldType: "inputdropdown",
      width: 'third',
      value: { dropdown: '', input: '' },
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      placeholder: "Select QC",

      options: [
        { label: 'QC', value: 'QC' },
        { label: 'QA', value: 'QA' },
        { label: 'Test', value: 'Test' }
      ]
    },
    QCUserDefined2: {
      id: "QCUserDefined2",
      label: "QC Userdefined 2",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      placeholder: "Select QC",
      value: { dropdown: '', input: '' },
      options: [
        { label: 'QC', value: 'QC' },
        { label: 'QA', value: 'QA' },
        { label: 'Test', value: 'Test' }
      ]
    },
    QCUserDefined3: {
      id: "QCUserDefined3",
      label: "QC Userdefined 3",
      fieldType: "inputdropdown",
      width: 'third',
      inputType: "number",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      placeholder: "Select QC",
      value: { dropdown: '', input: '' },
      options: [
        { label: 'QC', value: 'QC' },
        { label: 'QA', value: 'QA' },
        { label: 'Test', value: 'Test' }
      ]
    },
    Remarks1: {
      id: "Remarks1",
      label: "Remarks 1",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      placeholder: "Enter Remarks",
    },
    Remarks2: {
      id: "Remarks2",
      label: "Remarks 2",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      placeholder: "Enter Remarks",
    },
    Remarks3: {
      id: "Remarks3",
      label: "Remarks 3",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      placeholder: "Enter Remarks",
    },
  };

  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  const resourceGroups = [
    {
      id: 1,
      name: "R01 - Wagon Rentals",
      seqNo: 1, // Optional
      default: "Y", // Optional
      description: "R01 - Wagon Rentals", // Optional
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    // Handle input change logic here
    console.log(`Field: ${field}, Value: ${value}`);
  };

  // Replace the static mappedPlanActualItems array with the merged array from jsonStore
  const mappedPlanActualItems = [
    ...jsonStore.getAllPlanDetailsByResourceUniqueID(resourceId),
    ...jsonStore.getAllActualDetailsByResourceUniqueID(resourceId)
  ];

  // Normalization functions for each config
  function normalizeWagonDetails(data) {
    return {
      WagonType: data.WagonType || '',
      WagonID: data.WagonID || '',
      WagonQuantity: data.WagonQuantity || { dropdown: '', input: '' },
      WagonTareWeight: data.WagonTareWeight || { dropdown: '', input: '' },
      WagonGrossWeight: data.WagonGrossWeight || { dropdown: '', input: '' },
      WagonLength: data.WagonLength || { dropdown: '', input: '' },
      WagonSequence: data.WagonSequence || '',
    };
  }
  function normalizeContainerDetails(data) {
    return {
      ContainerType: data.ContainerType || '',
      ContainerID: data.ContainerID || '',
      ContainerQuantity: data.ContainerQuantity || { dropdown: '', input: '' },
      ContainerTareWeight: data.ContainerTareWeight || { dropdown: '', input: '' },
      ContainerLoadWeight: data.ContainerLoadWeight || { dropdown: '', input: '' },
    };
  }
  function normalizeProductDetails(data) {
    return {
      NHM: data.NHM || '',
      ProductID: data.ProductID || '',
      ProductQuantity: data.ProductQuantity || { dropdown: '', input: '' },
      ClassofStores: data.ClassofStores || '',
      UNCode: data.UNCode || '',
      DGClass: data.DGClass || '',
    };
  }
  function normalizeTHUDetails(data) {
    return {
      THUID: data.THUID || '',
      THUSerialNo: data.THUSerialNo || '',
      THUQuantity: data.THUQuantity || { dropdown: '', input: '' },
      THUWeight: data.THUWeight || { dropdown: '', input: '' },
    };
  }
  function normalizeJourneyDetails(data) {
    return {
      Departure: data.Departure || '',
      Arrival: data.Arrival || '',
      ActivityLocation: data.ActivityLocation || '',
      Activity: data.Activity || '',
      PlannedDateTime: data.PlannedDateTime || '',
      RevPlannedDateTime: data.RevPlannedDateTime || '',
      TrainNo: data.TrainNo || '',
      LoadType: data.LoadType || '',
    };
  }
  function normalizeOtherDetails(data) {
    return {
      FromDate: data.FromDate || '',
      FromTime: data.FromTime || '',
      ToDate: data.ToDate || '',
      ToTime: data.ToTime || '',
      QCUserDefined1: data.QCUserDefined1 || { dropdown: '', input: '' },
      QCUserDefined2: data.QCUserDefined2 || { dropdown: '', input: '' },
      QCUserDefined3: data.QCUserDefined3 || { dropdown: '', input: '' },
      Remarks1: data.Remarks1 || '',
      Remarks2: data.Remarks2 || '',
      Remarks3: data.Remarks3 || '',
    };
  }

  // Initial state setup
  const getInitialWagonDetails = () =>
    isEditQuickOrder ? normalizeWagonDetails(jsonStore.getPlanDetails()?.WagonDetails || {}) : {};
  const getInitialContainerDetails = () =>
    isEditQuickOrder ? normalizeContainerDetails(jsonStore.getPlanDetails()?.ContainerDetails || {}) : {};
  const getInitialProductDetails = () =>
    isEditQuickOrder ? normalizeProductDetails(jsonStore.getPlanDetails()?.ProductDetails || {}) : {};
  const getInitialTHUDetails = () =>
    isEditQuickOrder ? normalizeTHUDetails(jsonStore.getPlanDetails()?.THUDetails || {}) : {};
  const getInitialJourneyDetails = () =>
    isEditQuickOrder ? normalizeJourneyDetails(jsonStore.getPlanDetails()?.JourneyAndSchedulingDetails || {}) : {};
  const getInitialOtherDetails = () =>
    isEditQuickOrder ? normalizeOtherDetails(jsonStore.getPlanDetails()?.OtherDetails || {}) : {};

  const [wagonDetailsData, setWagonDetailsData] = useState(getInitialWagonDetails);
  const [containerDetailsData, setContainerDetailsData] = useState(getInitialContainerDetails);
  const [productDetailsData, setProductDetailsData] = useState(getInitialProductDetails);
  const [thuDetailsData, setTHUDetailsData] = useState(getInitialTHUDetails);
  const [journeyDetailsData, setJourneyDetailsData] = useState(getInitialJourneyDetails);
  const [otherDetailsData, setOtherDetailsData] = useState(getInitialOtherDetails);

  // Sync state with jsonStore on isEditQuickOrder change
  useEffect(() => {
    const planDetails = jsonStore.getPlanDetails() || {};
    // alert("R id - " + resourceId)
    console.log("PLAN DETAILS :: ", planDetails)
    if (isEditQuickOrder) {
      setWagonDetailsData(normalizeWagonDetails(planDetails.WagonDetails || {}));
      setContainerDetailsData(normalizeContainerDetails(planDetails.ContainerDetails || {}));
      setProductDetailsData(normalizeProductDetails(planDetails.ProductDetails || {}));
      setTHUDetailsData(normalizeTHUDetails(planDetails.THUDetails || {}));
      setJourneyDetailsData(normalizeJourneyDetails(planDetails.JourneyAndSchedulingDetails || {}));
      setOtherDetailsData(normalizeOtherDetails(planDetails.OtherDetails || {}));
    } else {
      setWagonDetailsData({});
      setContainerDetailsData({});
      setProductDetailsData({});
      setTHUDetailsData({});
      setJourneyDetailsData({});
      setOtherDetailsData({});
    }
  }, [isEditQuickOrder]);

  // Update jsonStore on saveUserPanelConfig
  const handleSaveUserPanelConfig = (userId, panelId, settings) => {
    saveUserPanelConfig(userId, panelId, settings);
  };

  const [bulkUpdateTitle, setbulkUpdateTitle] = useState('Bulk Update');
  const [bulkUpdateData, setbulkUpdateData] = useState();
  const billingDetailsRef = useRef<DynamicPanelRef>(null);
  const bulkUpdatePanelConfig: PanelConfig = {
    PlannedDateTime: {
      id: 'PlannedDateTime',
      label: 'Planned Date and Time',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
    },
    RevisedPlannedDateTime: {
      id: 'RevisedPlannedDateTime',
      label: 'Revised Planned Date and Time',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
    },
    ActualDateTime: {
      id: 'ActualDateTime',
      label: 'Actual Date and Time',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
    },
    Activity: {
      id: 'Activity',
      label: 'Activity',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      options: [
        { label: 'Loading', value: 'Loading' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    ActivityLocation: {
      id: 'ActivityLocation',
      label: 'Activity Location',
      fieldType: 'search',
      width: 'full',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      placeholder: 'Search location...'
    },
    WagonGroup: {
      id: 'WagonGroup',
      label: 'Wagon Group',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      options: [
        { label: 'Group 1', value: 'Group 1' },
        { label: 'Group 2', value: 'Group 2' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    ContainerGroup: {
      id: 'ContainerGroup',
      label: 'Container Group',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      options: [
        { label: 'Container 1', value: 'Container 1' },
        { label: 'Container 2', value: 'Container 2' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    Product: {
      id: 'Product',
      label: 'Product',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      options: [
        { label: 'Product 1', value: 'Product 1' },
        { label: 'Product 2', value: 'Product 2' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    ProductWeight: {
      id: 'ProductWeight',
      label: 'Product Weight',
      fieldType: 'inputdropdown',
      width: 'half',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      options: [
        { label: 'TON', value: 'TON' },
        { label: 'KG', value: 'KG' },
        { label: 'LBS', value: 'LBS' },
      ]
    },
    Wagon: {
      id: 'Wagon',
      label: 'Wagon',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      placeholder: 'Enter Wagon',
      width: 'half',
    },
    Container: {
      id: 'Container',
      label: 'Container',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      placeholder: 'Enter Wagon',
      width: 'half',
    }
  };

  const onDefaultDetailsSave = () => {

  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Left Side - Stepper and Main Content */}
        <div className="flex-1 flex">
          {/* Vertical Stepper */}
          <div className="w-80 px-6 py-4 border-r min-h-[500px]">
            <div className="">
              <div className="flex flex-col items-start cursor-pointer gap-2">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium`}>Resource Group</h3>
                </div>
                <div className="w-full">
                  <SimpleDropDown
                    list={resourceGroups}
                    value={resourceGroups[0].description}
                    onValueChange={(value) =>
                      handleInputChange("resourceGroup", value)
                    }
                  />
                </div>
              </div>
              {/* <div className="h-8 w-px bg-blue-600 mt-2 ml-4"></div> */}
            </div>
            <div className="mt-6 mb-6">
              <hr />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Item</h2>
              <div className="flex items-center gap-4">
                <button
                  className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100"
                  onClick={() => setIsBulkUpdateOpen(true)}
                >
                  <WandSparkles className="w-5 h-5 text-gray-500" />
                </button>
                <button className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100">
                  <Plus className="w-5 h-5 text-gray-500 cursor-pointer" />
                </button>
              </div>
            </div>
            {/* <div className="flex flex-col gap-4">
              <Input type="text" placeholder="--" value={'--'} readOnly />
            </div> */}
            {/* // ...in your JSX: */}
            <div className="flex flex-col gap-4">

              {isEditQuickOrder && mappedPlanActualItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col border rounded-lg p-3 bg-white shadow-sm relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">{item.WagonDetails.WagonID}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {item.WagonDetails.WagonType}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full text-sm">
                        {/* {item.currency} {item.price.toFixed(2)} */}
                        {item.WagonDetails.WagonQuantity}
                      </span>
                      <button
                        className="p-1 rounded hover:bg-gray-100 relative"
                        onClick={() =>
                          setOpenMenuId(openMenuId === item.PlanLineUniqueID ? null : item.PlanLineUniqueID)
                        }
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {/* Dropdown menu */}
                      {openMenuId === item.id && (
                        <div className="absolute right-2 top-10 z-10 bg-white border rounded shadow-md w-40">
                          <button
                            className="flex gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            onClick={() => {
                              setOpenMenuId(null);
                              // alert(`Copy ${item.id}`);
                            }}
                          ><Copy size={16} />
                            Copy
                          </button>
                          <button
                            className="flex gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                            onClick={() => {
                              setOpenMenuId(null);
                              // alert(`Delete ${item.id}`);
                            }}
                          ><Trash2 size={16} color={'red'} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Input type="text" placeholder="--" value={"--"} readOnly />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-gray-50 px-6 py-4 h-full content-scroll">
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: "1.5rem" }}
            >
              {currentStep === 1 && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold">
                    What would you like to enter details?
                  </h2>
                  <div>
                    <RadioGroup
                      value={planType}
                      onValueChange={setPlanType}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plan" id="plan" />
                        <Label htmlFor="plan" className="cursor-pointer">
                          Plan Details
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="actual" id="actual" />
                        <Label htmlFor="actual" className="cursor-pointer">
                          Actual Details
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <span className="bg-blue-600 rounded-lg p-3 hover:bg-blue-700 cursor-pointer">
                  <Expand className="w-4 h-4 text-white" />
                </span>
              </div>
            </div>
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Basic Details Section */}
                {/* <div className="grid grid-cols-12 gap-6"> */}
                <div className="flex gap-6 mb-6">
                  <div className="w-full">
                    {(() => {
                      let currentTabIndex = 1;
                      const panels = [];
                      if (wagonDetailsVisible) {
                        const wagonDetailsVisibleCount = Object.values(wagonDetailsVisible).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={wagonDetailsRef}
                            key="wagon-details"
                            panelId="wagon-details"
                            panelOrder={1}
                            panelIcon={<Bus className="w-5 h-5 text-green-600" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={wagonDetailsTitle}
                            panelConfig={wagonDetailsConfig}
                            formName="wagonDetailsForm"
                            initialData={wagonDetailsData}
                            onTitleChange={setWagonDetailsTitle}
                            // onWidthChange={setBasicDetailsWidth}
                            getUserPanelConfig={getUserPanelConfig}
                            saveUserPanelConfig={handleSaveUserPanelConfig}
                            userId="current-user"
                          // panelWidth={basicDetailsWidth}
                          />
                        );
                        currentTabIndex += wagonDetailsVisibleCount;
                      }

                      if (containerDetailsConfig) {
                        const containerDetailsVisibleCount = Object.values(containerDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={containerDetailsRef}
                            key="container-details"
                            panelId="container-details"
                            panelOrder={2}
                            panelTitle={containerDetailsTitle}
                            panelIcon={<Container className="w-5 h-5 text-purple-600" />}
                            panelConfig={containerDetailsConfig}
                            startingTabIndex={currentTabIndex}
                            initialData={containerDetailsData}
                            formName="containerDetailsForm"
                            onTitleChange={setContainerDetailsTitle}
                            getUserPanelConfig={getUserPanelConfig}
                            saveUserPanelConfig={handleSaveUserPanelConfig}
                            userId="current-user"
                          />
                        );
                        currentTabIndex += containerDetailsVisibleCount;
                      }

                      if (productDetailsConfig) {
                        const productDetailsVisibleCount = Object.values(productDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={productDetailsRef}
                            key="product-details"
                            panelId="product-details"
                            panelOrder={3}
                            panelTitle={productDetailsTitle}
                            panelIcon={<Package className="w-5 h-5 text-red-600" />}
                            panelConfig={productDetailsConfig}
                            startingTabIndex={currentTabIndex}
                            initialData={productDetailsData}
                            formName="productDetailsForm"
                            onTitleChange={setProductDetailsTitle}
                            getUserPanelConfig={getUserPanelConfig}
                            saveUserPanelConfig={handleSaveUserPanelConfig}
                            userId="current-user"
                          />
                        );
                        currentTabIndex += productDetailsVisibleCount;
                      }

                      if (thuDetailsConfig) {
                        const thuDetailsVisibleCount = Object.values(thuDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={thuDetailsRef}
                            key="thu-details"
                            panelId="thu-details"
                            panelOrder={4}
                            panelTitle={thuDetailsTitle}
                            panelIcon={<BaggageClaim className="w-5 h-5 text-green-500" />}
                            panelConfig={thuDetailsConfig}
                            startingTabIndex={currentTabIndex}
                            initialData={thuDetailsData}
                            formName="thuDetailsForm"
                            onTitleChange={setTHUDetailsTitle}
                            getUserPanelConfig={getUserPanelConfig}
                            saveUserPanelConfig={handleSaveUserPanelConfig}
                            userId="current-user"
                          />
                        );
                        currentTabIndex += thuDetailsVisibleCount;
                      }

                      if (journeyDetailsConfig) {
                        const journeyDetailsVisibleCount = Object.values(journeyDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={journeyDetailsRef}
                            key="journey-details"
                            panelId="journey-details"
                            panelOrder={5}
                            panelTitle="Journey and Scheduling Details"
                            panelIcon={<CalendarCheck className="w-5 h-5" style={{ color: "#00BCD4" }} />}
                            panelConfig={journeyDetailsConfig}
                            startingTabIndex={currentTabIndex}
                            initialData={journeyDetailsData}
                            formName="journeyDetailsForm"
                            onTitleChange={setJourneyDetailsTitle}
                            getUserPanelConfig={getUserPanelConfig}
                            saveUserPanelConfig={handleSaveUserPanelConfig}
                            userId="current-user"
                          />
                        );
                        currentTabIndex += journeyDetailsVisibleCount;
                      }

                      if (otherDetailsConfig) {
                        const otherDetailsVisibleCount = Object.values(otherDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={otherDetailsRef}
                            key="other-details"
                            panelId="other-details"
                            panelOrder={6}
                            panelTitle="Other Details"
                            panelIcon={<Info className="w-5 h-5" style={{ color: "brown" }} />}
                            panelConfig={otherDetailsConfig}
                            initialData={otherDetailsData}
                            startingTabIndex={currentTabIndex}
                            formName="otherDetailsForm"
                            onTitleChange={setOtherDetailsTitle}
                            getUserPanelConfig={getUserPanelConfig}
                            saveUserPanelConfig={handleSaveUserPanelConfig}
                            userId="current-user"
                          />
                        );
                        currentTabIndex += otherDetailsVisibleCount;
                      }


                      return panels;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="mt-2 w-full bg-white border-t flex justify-end space-x-3 absolute bottom-0 px-8">
          {/* {currentStep === 1 && ( */}
          {planType === "plan" && (
            <Button
              variant="outline"
              className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Convert Plan to Actuals
            </Button>
          )}
          {/* )} */}
          <Button
            className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700"
            onClick={handleSavePlanActuals}
          >
            Save {planType == "plan" ? "Plan" : "Actual"} Details
          </Button>
        </div>
      </div>
      {/* SideDrawer component */}
      <SideDrawer
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        width="40%"
        title="Bulk Update"
        isBack={false}
        onScrollPanel={true}
      >
        <div className="">
          <div className="mt-0 text-sm text-gray-600">
            <DynamicPanel
              ref={billingDetailsRef}
              key="Bulk-Update"
              panelId="Bulk-Update"
              panelOrder={1}
              panelTitle={bulkUpdateTitle}
              panelConfig={bulkUpdatePanelConfig}
              initialData={bulkUpdateData}
              formName="bulkUpdateForm"
              onTitleChange={setbulkUpdateTitle}
              getUserPanelConfig={getUserPanelConfig}
              saveUserPanelConfig={saveUserPanelConfig}
              userId="current-user"
              onScrollPanel={true}
            />
            {/* <Bulk-Update /> */}
          </div>
          <div className="flex bg-white justify-end w-full px-4 border-t border-gray-300">
            <button type="button" className="bg-blue-600 mt-2 text-white text-sm px-6 py-2 rounded font-medium" onClick={onDefaultDetailsSave}>
              Default Details
            </button>
          </div>
        </div>
      </SideDrawer>
    </>
  );
};
