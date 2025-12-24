import React, { useState, useRef, useEffect ,useCallback} from "react";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserPlus, ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { quickOrderService } from "@/api/services/quickOrderService";
import { FileText } from "lucide-react";
import { CimCuvService } from "@/api/services/CimCuvService"; // Import CimCuvService
import { useSearchParams } from "react-router-dom";
import { SmartGridWithGrouping } from "../SmartGrid";
import { SmartGridPlus } from "../SmartGrid";
import { GridColumnConfig } from "../SmartGrid";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CancelConfirmationModal from "./CancelConfirmationModal";
import ConsignorConsigneeSideDraw from "./ConsignorConsigneeSideDraw";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import AmendReportModal from "./AmendReportModal";
import DraftBillDetailsSideDraw from "./DraftBillDetailsSideDraw";

const ReportCreate = () => {
  const draftBillData = {
    "Header": {
        "DraftBillNo": "DB/00000939",
        "DraftBillDate": "2021-09-01T00:00:00",
        "DBStatus": "AP",
        "DBStatusDescription": "Approved",
        "FromLocation": "27-706709",
        "FromLocationDescription": "Assa ( 27-706709- )",
        "ToLocation": "NRSP00007",
        "ToLocationDescription": "Charleston",
        "WBS": "DE17KAZ109",
        "DBTotalValue": 104995,
        "BusinessPartnerID": "10026536",
        "BusinessPartnerName": "KAZPHOSPHATE LLC test",
        "BusinessPartnerType": "Customer",
        "ContractID": "CON000000104",
        "ContractDescription": "YP_Kazphosphate",
        "ContractType": "Sell",
        "DraftbillValidationDate": "2021-09-19T21:11:18.563",
        "InvoiceNo": null,
        "InvoiceDate": null,
        "InvoiceStatus": null,
        "TransferInvoiceNo": null,
        "LatestJournalVoucher": null,
        "GLAccount": null,
        "DBAcceptedValue": 104995,
        "DraftBillStage": "Trip Initiated (Loading completed/BR Released for execution)",
        "WorkFlowStatus": "As per workflow",
        "CustomerGroup": null,
        "SupplierGroup": null,
        "Cluster": null,
        "Attribute1": null
    },
    "ReverseJournalVoucher": [
        {
            "JournalVoucherNo": null
        }
    ],
    "ItemDetails": [
        {
            "DBLineNo": 1,
            "BillToID": "10026536",
            "RefDocIDType": "DD",
            "RefDocIDTypeDescription": "Dispatch Document",
            "RefDocDate": "2021-09-01T00:00:00",
            "ReferenceInformation": "RR/2021/00001953",
            "EquipmentType": null,
            "EquipmentID": null,
            "EquipmentDescription": null,
            "AcceptedValue": "95450.00000000",
            "BillingCurrency": "EUR  ",
            "TriggerDocType": "Trip Log",
            "TriggerDocID": "TP/2021/00001512",
            "TariffID": "YP_KAZ1",
            "TariffIDType": "Rate Per Rail Container",
            "TariffDescription": "YP_KAZ1",
            "InvoiceNo": null,
            "InvoiceDate": null,
            "InvoiceStatus": null,
            "TransferInvoiceNo": null,
            "LatestJournalVoucher": "JV_DE01034",
            "Attribute1": null,
            "Remark1": null,
            "Remark2": null,
            "Remark3": null,
            "QC1": null,
            "QCValue1": null,
            "QC2": null,
            "QCValue2": null,
            "QC3": null,
            "QCValue3": null,
            "SecondaryRefNo": null,
            "RemarkForAssignedUser": null,
            "ProposedValue": "95450.00000000",
            "TriggeringDocDate": "2021-06-07T11:06:32.307",
            "FinancialYear": null,
            "UserAssigned": null,
            "Remark": null,
            "ReasonForAmendment": null,
            "ReasonForCancellation": null,
            "QTY": 10,
            "UOM": null,
            "Rate": 9545,
            "BasicCharge": 95450,
            "MinimumCharge": null,
            "MaximumCharge": null,
            "CustomerSupplierRefNo": "QE17KAZ109",
            "DD1": null,
            "DD2": null,
            "DBLineStatus": "AP",
            "CustomerOrderNo": null,
            "ModeFlag": "NoChange"
        },
        {
            "DBLineNo": 2,
            "BillToID": "10026536",
            "RefDocIDType": "DD",
            "RefDocIDTypeDescription": "Dispatch Document",
            "RefDocDate": "2021-09-01T00:00:00",
            "ReferenceInformation": "RR/2021/00002223",
            "EquipmentType": null,
            "EquipmentID": null,
            "EquipmentDescription": null,
            "AcceptedValue": "9545.00000000",
            "BillingCurrency": "EUR  ",
            "TriggerDocType": "Trip Log",
            "TriggerDocID": "TP/2021/00001853",
            "TariffID": "YP_KAZ1",
            "TariffIDType": "Rate Per Rail Container",
            "TariffDescription": "YP_KAZ1",
            "InvoiceNo": null,
            "InvoiceDate": null,
            "InvoiceStatus": null,
            "TransferInvoiceNo": null,
            "LatestJournalVoucher": null,
            "Attribute1": null,
            "Remark1": null,
            "Remark2": null,
            "Remark3": null,
            "QC1": null,
            "QCValue1": null,
            "QC2": null,
            "QCValue2": null,
            "QC3": null,
            "QCValue3": null,
            "SecondaryRefNo": null,
            "RemarkForAssignedUser": null,
            "ProposedValue": "9545.00000000",
            "TriggeringDocDate": "2021-07-28T10:34:00.643",
            "FinancialYear": null,
            "UserAssigned": null,
            "Remark": null,
            "ReasonForAmendment": null,
            "ReasonForCancellation": null,
            "QTY": 1,
            "UOM": null,
            "Rate": 9545,
            "BasicCharge": 9545,
            "MinimumCharge": null,
            "MaximumCharge": null,
            "CustomerSupplierRefNo": "QE17KAZ109",
            "DD1": null,
            "DD2": null,
            "DBLineStatus": "AP",
            "CustomerOrderNo": null,
            "ModeFlag": "NoChange"
        }
    ]
};
  const generalDetailsRef = useRef<DynamicPanelRef>(null);
  const WagonDetailsRef = useRef<DynamicPanelRef>(null);
  const RouteDetailsRef = useRef<DynamicPanelRef>(null);
  const RouteEndorsementDetailsRef = useRef<DynamicPanelRef>(null);
  const headerTemplateRef = useRef<DynamicPanelRef>(null); // New Ref
  const paymentInstructionRef = useRef<DynamicPanelRef>(null); // New Ref
  const placeAndDateRef = useRef<DynamicPanelRef>(null); // New Ref
  const consignorDeclarationsRef = useRef<DynamicPanelRef>(null); // New Ref for Consignor's Declarations
  const valueDeliveryCashRef = useRef<DynamicPanelRef>(null); // New Ref for Value and Delivery Details
  const codingBoxesRef = useRef<DynamicPanelRef>(null); // New Ref for Coding Boxes
  const examinationDetailsRef = useRef<DynamicPanelRef>(null); // New Ref for Examination and Other Details
  const sectionARef = useRef<DynamicPanelRef>(null); // New Ref for Section A
  const sectionBRef = useRef<DynamicPanelRef>(null); // New Ref for Section B
  const sectionCRef = useRef<DynamicPanelRef>(null); // New Ref for Section C


  const navigate = useNavigate();
  const { toast } = useToast();

  const [generalDetailsData, setGeneralDetailsData] = useState<
    Record<string, any>
  >({});
  const [headerTemplateData, setHeaderTemplateData] = useState<
    Record<string, any>
  >({}); // New State
  const [paymentInstructionData, setPaymentInstructionData] = useState<
    Record<string, any>
  >({}); // New State
  const [placeAndDateData, setPlaceAndDateData] = useState<Record<string, any>>(
    {}
  ); // New State
  const [consignorDeclarationsData, setConsignorDeclarationsData] = useState<
    Record<string, any>
  >({}); // New State for Consignor's Declarations
  const [valueDeliveryCashData, setValueDeliveryCashData] = useState<
    Record<string, any>
  >({}); // New State for Value and Delivery Details
  const [codingBoxesData, setCodingBoxesData] = useState<Record<string, any>>(
    {}
  ); // New State for Coding Boxes
  const [examinationDetailsData, setExaminationDetailsData] = useState<
    Record<string, any>
  >({}); // New State for Examination and Other Details
  const [sectionAData, setSectionAData] = useState<Record<string, any>>({}); // New State for Section A
  const [sectionBData, setSectionBData] = useState<Record<string, any>>({}); // New State for Section B
  const [sectionCData, setSectionCData] = useState<Record<string, any>>({}); // New State for Section C
  const [apiResponse, setApiResponse] = useState<any>(null); // New state for API response
  const [initialApiResponse, setInitialApiResponse] = useState<any>(null); // To store original API response
  const [activeTab, setActiveTab] = useState("general");
  const [searchParams, setSearchParams] = useSearchParams(); // Import useSearchParams
  const workOrderNo = searchParams.get("id");
  const [thuQtyUomList, setThuQtyUomList] = useState<any[]>([]);
  const [currencyUomList, setCurrencyUomList] = useState<any[]>([]);
  const [otherCarriers, setOtherCarriers] = useState<any[]>([]);
  const [routeCodeCDetails, setRouteCodeCDetails] = useState<any[]>([]);
  const [wagonGritDetails, setWagonGritDetails] = useState<any[]>([]);
  const [cimCuvNo , setCimCuvNo] =   useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);
  const [
    isConsignorConsigneeSideDrawOpen,
    setIsConsignorConsigneeSideDrawOpen,
  ] = useState(false);
  const [
    isDraftBillDetailsSideDrawOpen,
    setIsDraftBillDetailsSideDraw,
  ] = useState(false);
  const [consignorConsigneeData, setConsignorConsigneeData] =
    useState<any>(null);

  const [templateNumber, setTemplateNumber] = useState<string>(workOrderNo); // or initial number as string
 
  // const handleTemplateNumberCallback = (value: string) => {
  //   console.log('templateNumberValue', value);
  //   setTemplateNumber(value);           // keep it in parent state
  // };

  const handleTemplateNumberCallback = (value: string) => {
  console.log("Template number changed:", value);
  setCimCuvNo(value)

  const trimmedValue = value?.trim();

  // 1️⃣ Update local state (if you still need it)
  setTemplateNumber(trimmedValue);
  console.log("trimmedValue",trimmedValue )

  // 2️⃣ (Optional) Update store – only if you are using one
  // useTemplateStore.getState().updateHeader('TemplateId',   trimmedValue);

  // 3️⃣ Update URL → triggers useEffect → API auto call
  if (trimmedValue) {
    setSearchParams({ id: cimCuvNo });
  }
};


  const buttonCancel =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm";
  /**
   * fetchMaster helper for lazy select dropdowns
   */
  const fetchMaster = (
    messageType: string,
    extraParams?: Record<string, any>
  ) => {
    return async ({
      searchTerm,
      offset,
      limit,
    }: {
      searchTerm: string;
      offset: number;
      limit: number;
    }) => {
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

  // ✅ Add row – Other Carriers
  const handleAddOtherCarrierRow = (newRow: any) => {
    setOtherCarriers((prev) => [
      ...prev,
      {
        ...newRow,
        ModeFlag: "Insert",
      },
    ]);
  };

  // ✅ Edit row – Other Carriers
  const handleEditOtherCarrierRow = (updatedRow: any, rowIndex: number) => {
    setOtherCarriers((prev) => {
      const copy = [...prev];

      copy[rowIndex] = {
        ...copy[rowIndex],
        ...updatedRow,
        ModeFlag: copy[rowIndex]?.ModeFlag === "Insert" ? "Insert" : "Update",
      };

      return copy;
    });
  };
  // ✅ Add Wagon row
  // const handleAddWagonRow = (newRow: any) => {
  //   setWagonGritDetails((prev) => [
  //     ...prev,
  //     {
  //       ...newRow,
  //       ModeFlag: "Insert",
  //     },
  //   ]);
  // };

  const EMPTY_WAGON_ROW = {
  WagonNo: "",

  No_of_Axle: null,
  NHM: null,

  Mass_Weight: null,
  Mass_Weight_UOM: null,

  Tare_Weight: null,
  Tare_Weight_UOM: null,

  Brut_Weight: null,
  Brut_Weight_UOM: null,

  Gross_Weight: null,
  Gross_weight_UOM: null,

  Net_Weight_Commodity_Qty: null,
  Net_Weight_Commodity_Qty_UOM: null,

  Wagon_Length: null,
  Wagon_Length_UOM: null,

  Container_Tare_Weight: null,
  Container_Tare_Weight_UOM: null,

  Container_Tare_Weight_2: null,
  Container_tare_weight_2_UOM: null,

  Container_load_weight: null,
  Container_Load_Weight_UOM: null,
  Container_load_type: null,

  Total_Mass: null,
  Total_Mass_UOM: null,

  Total_Brutt: null,
  Total_Brutt_UOM: null,

  Total_Tare: null,
  Total_Tare_UOM: null,

  Short_Description_of_Goods: null,
  Specificity: null,
  UTI_Type: null,

  Long_x_larg_x_haut: null,
  Long_x_larg_x_haut_UOM: null,

  Brand_and_No: null,
  Remittance_Slip_Number: null,
  Customs_Document: null,

  UN_Code: null,
  Load_Type: null,
  Packing_Group: null,
  Label: null,
  Special_Provision: null,
  Hazard_ID_Number: null,

  Environmentally_Hazardous: "No",

  Last_Loaded_Commodity: null,
  Container_No: null,
  Container_Type: null,

  From_Country: null,
  To_Country: null,
  Commodity_Description: null,

  UN_Desc_English: null,
  UN_Desc_French: null,
  UN_Desc_German: null,
  UN_Desc_Other_Language: null,

  UN_Desc_English_Check: 0,
  UN_Desc_French_Check: 0,
  UN_Desc_German_Check: 0,
  UN_Desc_Other_Language_Check: 0,

  RID: 0,
  ModeFlag: "Insert",
};


  const handleAddWagonRow = (newRow: any) => {
  setWagonGritDetails(prev => [
    ...prev,
    {
      ...EMPTY_WAGON_ROW,  // 👈 ALL fields present
      ...newRow,           // 👈 override edited fields
      ModeFlag: "Insert",
    },
  ]);
};


  // ✅ Edit Wagon row
  // const handleEditWagonRow = (updatedRow: any, rowIndex: number) => {
  //   setWagonGritDetails((prev) => {
  //     const copy = [...prev];

  //     copy[rowIndex] = {
  //       ...copy[rowIndex],
  //       ...updatedRow,
  //       ModeFlag: copy[rowIndex]?.ModeFlag === "Insert" ? "Insert" : "Update",
  //     };

  //     return copy;
  //   });
  // };

  const handleEditWagonRow = (updatedRow: any, rowIndex: number) => {
  setWagonGritDetails(prev => {
    const copy = [...prev];

    copy[rowIndex] = {
      ...EMPTY_WAGON_ROW,
      ...copy[rowIndex],   // existing values
      ...updatedRow,       // changed values
      ModeFlag:
        copy[rowIndex]?.ModeFlag === "Insert"
          ? "Insert"
          : "Update",
    };

    return copy;
  });
};


  // ✅ STEP 2: Handle Add Row from SmartGrid
  const handleAddRouteRow = (newRow: any) => {
    const rowWithDefaults = {
      ...newRow,
      ModeFlag: "Insert", // 🔴 IMPORTANT
    };

    setRouteCodeCDetails((prev) => [...prev, rowWithDefaults]);
  };
  // ✅ STEP 3: Handle Edit Row from SmartGrid
  const handleEditRouteRow = (updatedRow: any, rowIndex: number) => {
    setRouteCodeCDetails((prev) => {
      const updated = [...prev];

      updated[rowIndex] = {
        ...updated[rowIndex],
        ...updatedRow,
        ModeFlag:
          updated[rowIndex]?.ModeFlag === "Insert"
            ? "Insert" // keep Insert if new
            : "Update", // existing row edited
      };

      return updated;
    });
  };

  useEffect(() => {
    console.log("SETTING OTHER CARRIERS", routeCodeCDetails);
  }, [routeCodeCDetails]);

  // Simulate API response for demonstration
 useEffect(() => {
  const id = cimCuvNo ?? (workOrderNo || null);
  if (!id) return;

  fetchTemplateData(id);
}, [cimCuvNo, workOrderNo]);


  useEffect(() => {
    const loadUomMasters = async () => {
      try {
        const [thuRes, currencyRes]: any = await Promise.all([
          quickOrderService.getMasterCommonData({
            messageType: "THU QTY UOM Init",
          }),
          quickOrderService.getMasterCommonData({
            messageType: "Currency Init",
          }),
        ]);
        console.log(JSON.parse(thuRes?.data?.ResponseData || "[]"), "123");
        setThuQtyUomList(JSON.parse(thuRes?.data?.ResponseData || "[]"));
        setCurrencyUomList(JSON.parse(currencyRes?.data?.ResponseData || "[]"));
      } catch (err) {
        console.error("UOM master API failed", err);
      }
    };

    loadUomMasters();
  }, []);

  const getUomOptions = (list: any[]) =>
    list
      .filter((item) => item.id && item.name) // remove empty row
      .map((item) => ({
        label: item.name,
        value: item.id,
      }));

  const buildWeightWithUom = (
    value?: { input?: string; dropdown?: string } | null
  ): string | null => {
    if (!value?.input || !value?.dropdown) return null;
    return `${value.input} ${value.dropdown}`;
  };

  // Function to fetch template data from API
  const fetchTemplateData = async (templateId: string) => {
    console.log("Fetching template data for template ID:", templateId);
    try {
      const response = await CimCuvService.getReportDataByID(templateId);
      console.log("response.data1", response);
      const responseData = JSON.parse((response as any).data?.ResponseData);
      console.log("response.data1", responseData);
      setApiResponse(responseData);
      setInitialApiResponse(responseData); // Store the initial response
    } catch (error) {
      console.error("Error fetching template data:", error);
      setApiResponse(null);
      setInitialApiResponse(null);
    }
  };

  // Function to fetch template data from API
  const getTemplateDataByID = async (templateId: string) => {
    console.log("Fetching template data for template ID:", templateId);
    try {
      const response = await CimCuvService.getTemplateDataByID(templateId);
      console.log("response.data1", response);
      const fullResponseData = JSON.parse((response as any).data?.ResponseData);
      console.log("response.data1", fullResponseData);
      
      // Destructure to exclude the Header object, or explicitly set other parts
      const { Header, ...restOfResponseData } = fullResponseData;

      // Set apiResponse and initialApiResponse with data excluding the Header
      setApiResponse(restOfResponseData);
      setInitialApiResponse(restOfResponseData); // Store the initial response without Header
    } catch (error) {
      console.error("Error fetching template data:", error);
      setApiResponse(null);
      setInitialApiResponse(null);
    }
  };

  // Function to fetch template data from API
  const getReportDataChangeByID = async (templateId: string) => {
    console.log("Fetching template data for template ID:", templateId);
    try {
      const response = await CimCuvService.getReportDataByID(templateId);
      console.log("response.data1", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
          console.log("Report data changed successfully");
          const fullResponseData = JSON.parse((response as any)?.data?.ResponseData);
          console.log("res", fullResponseData?.Header?.CIMCUVNo);
          setCimCuvNo( fullResponseData?.Header?.CIMCUVNo)
          setSearchParams({ id: fullResponseData?.Header?.CIMCUVNo });
        // toast({
        //   title: "✅ Template Saved Successfully",
        //   description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
        //   variant: "default",
        // });
        // Destructure to exclude the Header object, or explicitly set other parts
        const { Header, ...restOfResponseData } = fullResponseData;

        // Set apiResponse and initialApiResponse with data excluding the Header
        setApiResponse(restOfResponseData);
        setInitialApiResponse(restOfResponseData); // Store the initial response without Header
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Get Failed",
          description: (response as any)?.data?.Message || "Failed to get data.",
          variant: "destructive",
        });

      }
      
    } catch (error) {
      console.error("Error fetching template data:", error);
      setApiResponse(null);
      setInitialApiResponse(null);
    }
  };

   const fetchSectionsList = useCallback(
      fetchMaster("Location Init"),
      []
    );
  
    // Fetch countries (first level) - using fetchMaster
    const fetchNameRoute = useCallback(
      fetchMaster("Supplier Init"),
      []
    );
  // ✅ STEP 1: Columns for Other Carriers grid
  // ✅ STEP 1: Columns for Other Carriers grid (SmartGrid format)
   const otherCarriersColumns: GridColumnConfig[] = [
    {
      key: "Name",
      label: "Name",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      fetchOptions: fetchNameRoute,
    },
    {
      key: "Section1",
      label: "Section 1",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      fetchOptions: fetchSectionsList,
    },
    {
      key: "Section2",
      label: "Section 2",
      type: "LazySelect",
      sortable: true,
      filterable: true,
      editable: true,
      fetchOptions: fetchSectionsList,
    },
    {
      key: "Status",
      label: "Status",
      type: "Text",
      editable: true,
      
      statusMap: {
        Active: "badge-green rounded-2xl",
        Pending: "badge-yellow rounded-2xl",
        Completed: "badge-green rounded-2xl",
        Cancelled: "badge-red rounded-2xl",
        "In-progress": "badge-orange rounded-2xl",
        
      },
      
    },
    {
      key: "Action",
      label: "Action",
      type: "Text",
      editable: true,
    }
  ];

  const routeCodeCDetailsColumns: GridColumnConfig[] = [
    {
      key: "RouteID",
      label: "RouteID",
      type: "Text",
      editable: true,
    },
    {
      key: "LegSequence",
      label: "Leg Sequence",
      type: "Text",
      editable: true,
    },
    {
      key: "LegID",
      label: "LegID",
      type: "Text",
      editable: true,
    },
    {
      key: "FromLocationID",
      label: "From Location ID",
      type: "Text",
      editable: true,
    },
    {
      key: "FromLocationDesc",
      label: "From Location Desc",
      type: "Text",
      editable: true,
    },
    {
      key: "ToLocationID",
      label: "To Location ID",
      type: "Text",
      editable: true,
    },
    {
      key: "ToLocationDesc",
      label: "To Location Desc",
      type: "Text",
      editable: true,
    },
    {
      key: "AdhocLeg",
      label: "Adhoc Leg",
      type: "Text",
      editable: true,
    },
    {
      key: "ViaPoint",
      label: "Via Point",
      type: "Text",
      editable: true,
    },
  ];

   const wagonGritDetailsColumns: GridColumnConfig[] = [
      { key: "WagonNo", label: "Wagon No", type: "Text", editable: true },
      { key: "Short_Description_of_Goods", label: "Goods Description", type: "Text", editable: true},
      { key: "RID", label: "RID", type: "Text", editable: true },
      { key: "Gross_Weight", label: "Gross Weight", type: "Text", editable: true },
      { key: "Tare_Weight", label: "Tare Weight", type: "Text", editable: true },
      { key: "Net_Weight_", label: "Net Weight", type: "Text", editable: true },
      { key: "No_of_Axle", label: "No of Axle", type: "Text", editable: true },
      { key: "NHM", label: "NHM", type: "Text", editable: true },
      { key: "Mass_Weight", label: "Mass Weight", type: "Text", editable: true },
      { key: "Brut_Weight", label: "Brut Weight", type: "Text", editable: true },
      { key: "Specificity", label: "Specificity", type: "Text", editable: true },
      { key: "UTI_Type", label: "UTI Type", type: "Text", editable: true },
      { key: "Long_x_larg_x_haut", label: "Length x Width x Height", type: "Text", editable: true },
      { key: "Brand_and_No", label: "Brand and No", type: "Text", editable: true },
      { key: "Remittance_Slip_Number", label: "Remittance Slip No", type: "Text", editable: true },
      { key: "Customs_Document", label: "Customs Document", type: "Text", editable: true },
      { key: "UN_Code", label: "UN Code", type: "Text", editable: true },
      { key: "Load_Type", label: "Load Type", type: "Text", editable: true },
      { key: "Packing_Group", label: "Packing Group", type: "Text", editable: true },
      { key: "Label", label: "Label", type: "Text", editable: true },
      
      
      // { key: "Mass_Weight_UOM", label: "Mass Weight UOM", type: "Text", editable: true },
      // { key: "Tare_Weight_UOM", label: "Tare Weight UOM", type: "Text", editable: true },
      // { key: "Brut_Weight_UOM", label: "Brut Weight UOM", type: "Text", editable: true },
      // { key: "Long_x_larg_x_haut_UOM", label: "LWH UOM", type: "Text", editable: true },
      // { key: "Container_Tare_Weight_UOM", label: "Container Tare Weight UOM", type: "Text", editable: true },
      // { key: "Total_Mass_UOM", label: "Total Mass UOM", type: "Text", editable: true },
      // { key: "Total_Brutt_UOM", label: "Total Brutt UOM", type: "Text", editable: true },
      // { key: "Total_Tare_UOM", label: "Total Tare UOM", type: "Text", editable: true },
  
  
      { key: "Special_Provision", label: "Special Provision", type: "Text", editable: true },
      { key: "Hazard_ID_Number", label: "Hazard ID", type: "Text", editable: true },
      { key: "Environmentally_Hazardous", label: "Environmentally Hazardous", type: "Text", editable: true },
      { key: "Last_Loaded_Commodity", label: "Last Loaded Commodity", type: "Text", editable: true },
      { key: "Container_No", label: "Container No", type: "Text", editable: true },
      { key: "Container_Type", label: "Container Type", type: "Text", editable: true },
      { key: "Container_Tare_Weight", label: "Container Tare Weight", type: "Text", editable: true },
      { key: "From_Country", label: "From Country", type: "Text", editable: true },
      { key: "To_Country", label: "To Country", type: "Text", editable: true },
      { key: "Commodity_Description", label: "Commodity Description", type: "Text", editable: true },
      { key: "Total_Mass", label: "Total Mass", type: "Text", editable: true },
      { key: "Total_Brutt", label: "Total Brutt", type: "Text", editable: true },
      { key: "Total_Tare", label: "Total Tare", type: "Text", editable: true },
  
      { key: "Container_load_weight", label: "Container Load Weight", type: "Text", editable: true },
      // { key: "Container_Load_Weight_UOM", label: "Container Load Weight UOM", type: "Text", editable: true },
      { key: "Container_load_type", label: "Container Load Type", type: "Text", editable: true },
  
      { key: "Container_Tare_Weight_2", label: "Container Tare Weight 2", type: "Text", editable: true },
      // { key: "Container_tare_weight_2_UOM", label: "Container Tare Weight 2 UOM", type: "Text", editable: true },
  
      { key: "UN_Desc_English", label: "UN Desc English", type: "Text", editable: true },
      { key: "UN_Desc_French", label: "UN Desc French", type: "Text", editable: true },
      { key: "UN_Desc_German", label: "UN Desc German", type: "Text", editable: true },
      { key: "UN_Desc_Other_Language", label: "UN Desc Other Language", type: "Text", editable: true },
  
      { key: "UN_Desc_English_Check", label: "UN English Check", type: "Text", editable: true },
      { key: "UN_Desc_French_Check", label: "UN French Check", type: "Text", editable: true },
      { key: "UN_Desc_German_Check", label: "UN German Check", type: "Text", editable: true },
      { key: "UN_Desc_Other_Language_Check", label: "UN Other Language Check", type: "Text", editable: true },
      { key: "Net_Weight_Commodity_Qty", label: "Net Weight Commodity Qty", type: "Text", editable: true },
  
      // { key: "Net_Weight_Commodity_Qty_UOM", label: "Net Weight Commodity Qty UOM", type: "Text", editable: true },
  
      // { key: "Gross_weight_UOM", label: "Gross Weight UOM", type: "Text", editable: true },
  
      { key: "Wagon_Length", label: "Wagon Length", type: "Text", editable: true },
      { key: "Total_Length", label: "Total Length", type: "Text", editable: true },
      // { key: "Wagon_Length_UOM", label: "Wagon Length UOM", type: "Text", editable: true },
  
      // { key: "ModeFlag", label: "Mode Flag", type: "Text", editable: false },
    ];

  // General Details Panel Config
 const generalDetailsConfig: PanelConfig = {
     consignor: {
       id: 'consignor',
       label: 'Consignor [1]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 1,
       width: 'four',
       placeholder: 'Enter Consignor',
       fetchOptions: fetchMaster('Consignor Init'),
       hideSearch: false,
       disableLazyLoading: false,
       
     },
     consignorDescription: {
       id: 'consignorDescription',
       label: '',
       fieldType: 'text',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 2,
       width: 'four',
       placeholder: 'Enter Consignor',
       labelFlag: false,
        maxLength: 255,
     },
     customerCodeConsignor: {
       id: 'customerCodeConsignor',
       label: 'Customer Code for the Consignor [2]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 3,
       width: 'four',
       placeholder: 'Enter Customer Code',
       fetchOptions: fetchMaster('Consignor CustomerCode2 Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     customerCodePrePaid: {
       id: 'customerCodePrePaid',
       label: 'Customer Code for Payer of Pre-Paid Charges [3]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 4,
       width: 'four',
       placeholder: 'Enter Customer Code for the Pay...',
       fetchOptions: fetchMaster('Customercode for payer pre-paid charges_3 Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     consignee: {
       id: 'consignee',
       label: 'Consignee [4]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 5,
       width: 'four',
       placeholder: 'Enter Consignee',
       fetchOptions: fetchMaster('Consignee Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     consigneeDescription: {
       id: 'consigneeDescription',
       label: '',
       fieldType: 'text',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 6,
       width: 'four',
       placeholder: 'Enter Consignee',
       labelFlag: false,
        maxLength: 255,
     },
     customerCodeConsignee: {
       id: 'customerCodeConsignee',
       label: 'Customer Code for Consignee [5]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 7,
       width: 'four',
       placeholder: 'Enter Customer Code for Consign...',
       fetchOptions: fetchMaster('Customer code for consignee [5] Init'),
       hideSearch: false,
       disableLazyLoading: false,
 
     },
     customerCodeNonPrePaid: {
       id: 'customerCodeNonPrePaid',
       label: 'Customer Code for Payer of Non Pre-Paid Charges [6]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 8,
       width: 'four',
       placeholder: 'Enter Customer Code for the Pay...',
       fetchOptions: fetchMaster('Customercode for payer Nonpre-paid charges_6 Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     consignorReference: {
       id: 'consignorReference',
       label: "Consignor's Reference [8]",
       fieldType: 'lazyselect',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 9,
       width: 'four',
       placeholder: "Enter Consignor's Reference",
       fetchOptions: fetchMaster('Consignors Reference8 Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     consignorReferenceDescription: {
       id: 'consignorReferenceDescription',
       label: '',
       fieldType: 'text',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 10,
       width: 'four',
       placeholder: "Enter Consignor's Reference",
       labelFlag: false,
        maxLength: 40,
     },
     deliveryPoint: {
       id: 'deliveryPoint',
       label: 'Delivery Point [10]/[4]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 11,
       width: 'four',
       placeholder: 'Enter Delivery Point',
       fetchOptions: fetchMaster('Location Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     deliveryPointDescription: {
       id: 'deliveryPointDescription',
       label: '',
       fieldType: 'text',
       value: '',
       mandatory: false,
       visible: true,
       editable: true,
       order: 12,
       width: 'four',
       placeholder: 'Enter Delivery Point',
       labelFlag: false,
         maxLength: 40,
     },
     codeDeliveryPoint: {
       id: 'codeDeliveryPoint',
       label: 'Code for the Delivery Point [11]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 13,
       width: 'four',
       placeholder: 'Enter Code for the Delivery Point',
       fetchOptions: fetchMaster('Location Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     codeStationServing: {
       id: 'codeStationServing',
       label: 'Code for the Station Serving the Delivery Point [12]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 14,
       width: 'four',
       placeholder: 'Enter Code for the Station Serving...',
       fetchOptions: fetchMaster('Location Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     customerAgreementTariff: {
       id: 'customerAgreementTariff',
       label: 'No. of the Customer Agreement/Tariff [14]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 15,
       width: 'four',
       placeholder: 'Select No. of the Customer Agree...',
       fetchOptions: fetchMaster('Contract Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     acceptanceDate: {
       id: 'acceptanceDate',
       label: 'Acceptance Date [16]/[2]',
       fieldType: 'date',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 16,
       width: 'four',
       placeholder: 'Select Acceptance Date',
       dateFormat: 'dd/MM/yyyy',
     },
     acceptanceFrom: {
       id: 'acceptanceFrom',
       label: 'Acceptance From [16]/[3]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 17,
       width: 'four',
       placeholder: 'Select Acceptance From',
       fetchOptions: fetchMaster('Location Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
     codeAcceptancePoint: {
       id: 'codeAcceptancePoint',
       label: 'Code for the Acceptance Point [17]',
       fieldType: 'lazyselect',
       value: '',
       mandatory: true,
       visible: true,
       editable: true,
       order: 18,
       width: 'four',
       placeholder: 'Enter Code for the Acceptance Point',
       fetchOptions: fetchMaster('Location Init'),
       hideSearch: false,
       disableLazyLoading: false,
     },
   };

  // New Header Template Panel Config
  const headerTemplateConfig: PanelConfig = {
    templateId: {
      id: "templateId",
      label: "Template ID/Description",
      fieldType: "lazyselect",
      value: "",
      mandatory: true,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster("TemplateID Description Init"),
      hideSearch: false,
      disableLazyLoading: false,
      events: {
          onChange: (value: any) => {
            console.log("change the ID ===", value?.value);
            const tempID = splitIdName(value?.value).id;
            console.log("change the ID ===", tempID);
            getTemplateDataByID(tempID);
          },
      },
    },
    templateType: {
      id: "templateType",
      label: "",
      fieldType: "radio",
      value: "CIM",
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      options: [
        { label: "CIM", value: "CIM" },
        { label: "CUV", value: "CUV" },
      ],
      labelFlag: false, // Hide the label as per screenshot
    },
    dispatchDocNo: {
      id: "dispatchDocNo",
      label: "Dispatch Doc. No./CO No.",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster("Dispatch DocumentNumber Init"),
      hideSearch: false,
      disableLazyLoading: false,
      events: {
        onChange: (value: any) => {
          console.log("change the ID ===", value);
          const tempID = splitIdName(value.value).id;
          console.log("change the ID ===", tempID);
          getReportDataChangeByID(tempID);
          console.log("para" , workOrderNo)
        },
      },
    },
    dispatchDocNoDescription: {
      id: "dispatchDocNoDescription",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four", // Assuming it takes half width next to dispatchDocNo
      placeholder: "",
      labelFlag: false,
    },
    unCode: {
      id: "unCode",
      label: "UN Code",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster("UN Code Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    tripPlanId: {
      id: "tripPlanId",
      label: "Trip Plan ID",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster("TripPlanID Description Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    wagon: {
      id: "wagon",
      label: "Wagon",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster("Wagon id Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    lveNo: {
      id: "lveNo",
      label: "LVE No.",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "",
    },
    customerID: {
      id: "customerID",
      label: "Customer ID/Description",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster("Customer Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    customerIDDescription: {
      id: "customerIDDescription",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: "four",
      placeholder: "",
      labelFlag: false,
    },
    contractID: {
      id: "contractID",
      label: "Contract ID/Description",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 11,
      width: "four",
      placeholder: "",
      fetchOptions: fetchMaster("Contract Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
  };

  // New Payment Instruction Panel Config
  const paymentInstructionConfig: PanelConfig = {
    paymentInstruction1: {
      id: "paymentInstruction1",
      label: "Payment Instruction",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Payment Instruction",
      fetchOptions: fetchMaster("Payment Instruction_20 Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    paymentInstruction2: {
      id: "paymentInstruction2",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Payment Instruction",
      labelFlag: false,
      maxLength: 40,
    },
    paymentInstruction3: {
      id: "paymentInstruction3",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "Enter Payment Instruction",
      labelFlag: false,
            maxLength: 40,

    },
    carriageChargePaid: {
      id: "carriageChargePaid",
      label: "Carriage Charge Paid",
      fieldType: "checkbox",
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "six",
    },
    incoTerms: {
      id: "incoTerms",
      label: "Inco Terms",
      fieldType: "checkbox",
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "six",
    },
  };

  // New Place and Date Made Out Panel Config
  const placeAndDateConfig: PanelConfig = {
    place: {
      id: "place",
      label: "Place",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "one-third",
      placeholder: "Enter Place",
      fetchOptions: fetchMaster("Location Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    dateMadeOut: {
      id: "dateMadeOut",
      label: "Select Date",
      fieldType: "date",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "six",
      placeholder: "Select Date",
      dateFormat: "dd/MM/yyyy",
    },
  };

  // Consignor's Declarations Panel Config
  const consignorDeclarationsConfig: PanelConfig = {
    consignorDeclarations: {
      id: "consignorDeclarations",
      label: "Consignor's Declarations [7]",
      fieldType: "textarea",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Consignor's Declarations",
      maxLength: 500,
    },
    documentsAttached: {
      id: "documentsAttached",
      label: "Documents Attached [9]",
      fieldType: "textarea",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Documents Attached",
      maxLength: 500,
    },
    commercialSpecifications: {
      id: "commercialSpecifications",
      label: "Commercial Specifications [13]",
      fieldType: "textarea",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "Enter Commercial Specifications",
      maxLength: 500,
    },
    informationForConsignee: {
      id: "informationForConsignee",
      label: "Information for the Consignee [15]",
      fieldType: "textarea",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Information for the Consignee",
      maxLength: 255,
    },
  };

  // Declaration of Value, Interest in Delivery, Cash on Delivery Panel Config
   const valueDeliveryCashConfig: PanelConfig = {
      declarationOfValue: {
        id: 'declarationOfValue',
        label: 'Declaration of Value [26]',
        fieldType: 'inputdropdown',
    value: {
      input: '',
      dropdown: '',
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 1,
    width: 'four',
    placeholder: 'Declaration of Value',
    options: getUomOptions(currencyUomList), 
      },
      
      interestInDelivery: {
        id: 'interestInDelivery',
        label: 'Interest in Delivery [27]',
        fieldType: 'inputdropdown',
    value: {
      input: '',
      dropdown: '',
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 2,
    width: 'four',
    placeholder: 'Interest in Delivery',
    options: getUomOptions(currencyUomList), 
      },
     cashOnDelivery: {
    id: 'cashOnDelivery',
    label: 'Cash on Delivery [28]',
    fieldType: 'inputdropdown',
    value: {
      input: '',
      dropdown: '',
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 3,
    width: 'four',
    placeholder: 'Enter Cash on Delivery',
    options: getUomOptions(currencyUomList), 
  },
  
    };

  // Coding Boxes Panel Config
  const codingBoxesConfig: PanelConfig = {
    codingBox1: {
      id: "codingBox1",
      label: "Coding Box 1 [40]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Coding Box 1",
      maxLength: 500,
    },
    codingBox2: {
      id: "codingBox2",
      label: "Coding Box 2 [41]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Coding Box 2",
            maxLength: 500,

    },
    codingBox3: {
      id: "codingBox3",
      label: "Coding Box 3 [42]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "Enter Coding Box 3",
            maxLength: 500,

    },
    codingBox4: {
      id: "codingBox4",
      label: "Coding Box 4 [43]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Coding Box 4",
            maxLength: 500,

    },
    codingBox5: {
      id: "codingBox5",
      label: "Coding Box 5 [44]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter Coding Box 5",
            maxLength: 500,

    },
    codingBox6: {
      id: "codingBox6",
      label: "Coding Box 6 [45]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "Enter Coding Box 6",
            maxLength: 500,

    },
    codingBox7: {
      id: "codingBox7",
      label: "Coding Box 7 [46]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter Coding Box 7",
            maxLength: 500,

    },
    codingBox8: {
      id: "codingBox8",
      label: "Coding Box 8 [47]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "Enter Coding Box 8",
            maxLength: 500,

    },
  };

  // Examination and Other Details Panel Config
  const examinationDetailsConfig: PanelConfig = {
    examination: {
      id: "examination",
      label: "Examination [48]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Examination",
      maxLength: 500,
    },
    prepaymentCoding: {
      id: "prepaymentCoding",
      label: "Prepayment Coding [49]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Prepayment Coding",
      maxLength: 500,
    },
    chargesNote: {
      id: "chargesNote",
      label: "Charges Note [52]",
      fieldType: "checkbox",
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
    },
    cashOnDeliveryReceipt: {
      id: "cashOnDeliveryReceipt",
      label: "Cash on Delivery Receipt [53]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Cash on Delivery Receipt",
      maxLength: 500,
    },
    formalReport: {
      id: "formalReport",
      label: "Formal Report [54]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter Formal Report",
      maxLength: 500,
    },
    extensionOfTransitPeriod: {
      id: "extensionOfTransitPeriod",
      label: "Extension of Transit Period [55]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "Enter Extension of Transit Period",
      maxLength: 500,
    },
    dateOfArrival: {
      id: "dateOfArrival",
      label: "Date of Arrival [59]",
      fieldType: "date",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter Date of Arrival",
      dateFormat: "dd/MM/yyyy",
    },
    madeAvailable: {
      id: "madeAvailable",
      label: "Made Available [60]",
      fieldType: "date",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "Enter Made Available",
      dateFormat: "dd/MM/yyyy",
    },
    acknowledgementOfReceipt: {
      id: "acknowledgementOfReceipt",
      label: "Acknowledgement of Receipt [61]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: "half",
      placeholder: "Enter Acknowledgement of Receipt",
    },
  };

  // Section A Panel Config
  const sectionAConfig: PanelConfig = {
    codeForChargingSections: {
      id: "codeForChargingSections",
      label: "Code for the Charging Sections [70]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Code for the Charging Sections",
      maxLength: 500,
    },
    routeCode: {
      id: "routeCode",
      label: "Route Code [71]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Route Code",
      maxLength: 500,
    },
    nhmCode: {
      id: "nhmCode",
      label: "NHM Code [72]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "Enter NHM Code",
    },
    currency: {
      id: "currency",
      label: "Currency [73]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Currency",
    },
    chargedMassWeight: {
      id: "chargedMassWeight",
      label: "Charged Mass Weight [74]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter Charged Mass Weight",
    },
    customerAgreementOrTariffApplied: {
      id: "customerAgreementOrTariffApplied",
      label: "Customer Agreement or Tariff Applied [75]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "Enter Customer Agreement or Tariff Applied",
    },
    kmZone: {
      id: "kmZone",
      label: "KM/Zone [76]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter KM/Zone",
    },
    supplementsFeesDeductions: {
      id: "supplementsFeesDeductions",
      label: "Supplements, Fees, Deductions [77]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "Enter Supplements, Fees, Deductions",
      maxLength: 500,
    },
    unitPrice: {
      id: "unitPrice",
      label: "Unit Price [78]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: "four",
      placeholder: "Enter Unit Price",
    },
    charges: {
      id: "charges",
      label: "Charges [79]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: "four",
      placeholder: "Enter Charges",
    },
  };

  // Section B Panel Config
  const sectionBConfig: PanelConfig = {
    codeForChargingSectionsB: {
      id: "codeForChargingSectionsB",
      label: "Code for the Charging Sections [70]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Code for the Charging Sections",
    },
    routeCodeB: {
      id: "routeCodeB",
      label: "Route Code [71]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Route Code",
    },
    nhmCodeB: {
      id: "nhmCodeB",
      label: "NHM Code [72]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "Enter NHM Code",
    },
    currencyB: {
      id: "currencyB",
      label: "Currency [73]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Currency",
    },
    chargedMassWeightB: {
      id: "chargedMassWeightB",
      label: "Charged Mass Weight [74]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter Charged Mass Weight",
    },
    customerAgreementOrTariffAppliedB: {
      id: "customerAgreementOrTariffAppliedB",
      label: "Customer Agreement or Tariff Applied [75]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "Enter Customer Agreement or Tariff Applied",
    },
    kmZoneB: {
      id: "kmZoneB",
      label: "KM/Zone [76]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter KM/Zone",
    },
    supplementsFeesDeductionsB: {
      id: "supplementsFeesDeductionsB",
      label: "Supplements, Fees, Deductions [77]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "Enter Supplements, Fees, Deductions",
    },
    unitPriceB: {
      id: "unitPriceB",
      label: "Unit Price [78]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: "four",
      placeholder: "Enter Unit Price",
    },
    chargesB: {
      id: "chargesB",
      label: "Charges [79]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: "four",
      placeholder: "Enter Charges",
    },
  };

  // Section C Panel Config
  const sectionCConfig: PanelConfig = {
    codeForChargingSectionsC: {
      id: "codeForChargingSectionsC",
      label: "Code for the Charging Sections [70]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter Code for the Charging Sections",
    },
    routeCodeC: {
      id: "routeCodeC",
      label: "Route Code [71]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter Route Code",
    },
    nhmCodeC: {
      id: "nhmCodeC",
      label: "NHM Code [72]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "Enter NHM Code",
    },
    currencyC: {
      id: "currencyC",
      label: "Currency [73]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Currency",
    },
    chargedMassWeightC: {
      id: "chargedMassWeightC",
      label: "Charged Mass Weight [74]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter Charged Mass Weight",
    },
    customerAgreementOrTariffAppliedC: {
      id: "customerAgreementOrTariffAppliedC",
      label: "Customer Agreement or Tariff Applied [75]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "Enter Customer Agreement or Tariff Applied",
    },
    kmZoneC: {
      id: "kmZoneC",
      label: "KM/Zone [76]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter KM/Zone",
    },
    supplementsFeesDeductionsC: {
      id: "supplementsFeesDeductionsC",
      label: "Supplements, Fees, Deductions [77]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "Enter Supplements, Fees, Deductions",
    },
    unitPriceC: {
      id: "unitPriceC",
      label: "Unit Price [78]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: "four",
      placeholder: "Enter Unit Price",
    },
    chargesC: {
      id: "chargesC",
      label: "Charges [79]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: "four",
      placeholder: "Enter Charges",
    },
  };

  //wagon details panel config
  const wagonDetailsConfig: PanelConfig = {
    train: {
      id: "train",
      label: "train [1]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "four",
      placeholder: "Enter train",
    },
    itinerary: {
      id: "itinerary",
      label: "itinerary [5]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "four",
      placeholder: "Enter itinerary",
      labelFlag: true,
      maxLength: 500,
    },
    dataOfDispatch: {
      id: "dataOfDispatch",
      label: "Date of Dispatch [7]",
      fieldType: "date",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "four",
      placeholder: "Enter Date of Dispatch",
      hideSearch: false,
      disableLazyLoading: false,
    },
    Page: {
      id: "Page",
      label: "Page [9]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Customer Code for the Pay...",
      hideSearch: false,
      maxLength: 255,
    },
    toBeClearedAt: {
      id: "toBeClearedAt",
      label: "To Be Cleared At",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter To Be Cleared At",
      hideSearch: false,
      maxLength: 255,
    },
    fixedNetTrain: {
      id: "fixedNetTrain",
      label: "Fixed Net Train [13]",
      fieldType: "inputdropdown",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      placeholder: "Enter Fixed Net Train [13]",
    },
    number: {
      id: "number",
      label: "No./Number [14]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter number",
    },
    LoadingConfiguration: {
      id: "LoadingConfiguration",
      label: "Loading Configuration [16]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: "four",
      placeholder: "Enter Customer Code for the Pay...",
      maxLength: 255,
    },
    wagonNumber: {
      id: "wagonNumber",
      label: "Wagon No. [18]/[15]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: "four",
      placeholder: "Enter wagon number",
      maxLength: 1000,
    },
    DescriptionoftheGoods: {
      id: "DescriptionoftheGoods",
      label: "Description of the Goods [21]/[17]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: "four",
      placeholder: "Enter Description of the Goods",
      maxLength: 4000,
    },
    ExceptionalConsignment: {
      id: "ExceptionalConsignment",
      label: "Exceptional Consignment [22]",
      fieldType: "checkbox",
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 11,
      width: "four",
    },
    RID: {
      id: "RID",
      label: "RID [23]/[28]",
      fieldType: "checkbox",
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 12,
      width: "four",
    },
    UTICODE: {
      id: "UTICODE",
      label: "UTI Code (Intermodal Transport Unit) [23]",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 13,
      width: "four",
      placeholder: "Enter Place",
      fetchOptions: fetchMaster("UTI Code 23 Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    LengthWidthHeight: {
      id: "LengthWidthHeight",
      label: "Length x Width x Height [24]",
      fieldType: "inputdropdown",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 14,
      width: "four",
      placeholder: "Enter Tare Weight",
    },
    MarkandNumber: {
      id: "MarkandNumber",
      label: "Mark and Number [25]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 15,
      width: "four",
      placeholder: "Enter Mark and Number",
      maxLength: 500,
    },
    DeliveryNoteNumber: {
      id: "DeliveryNoteNumber",
      label: "Delivery Note Number [26]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 16,
      width: "four",
      placeholder: "Enter Delivery Note Number ",
      maxLength: 500,
    },
    NHMCode: {
      id: "NHMCode",
      label: "NHM Code [24]/[18]",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 17,
      width: "four",
      placeholder: "Enter NHM Code",
      fetchOptions: fetchMaster("NHM Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    GrossWeight: {
      id: "GrossWeight",
      label: "Gross Weight [26]/[19]",
      fieldType: "inputdropdown",
      value: {
        dropdown: "",
        input: "",
      },
      mandatory: false,
      visible: true,
      editable: true,
      order: 18,
      width: "four",
      placeholder: "Enter Gross Weight",
      options: getUomOptions(thuQtyUomList),
    },

    TareWeight: {
      id: "TareWeight",
      label: "Tare Weight [25]/[20]",
      fieldType: "inputdropdown",
      value: {
        dropdown: "",
        input: "",
      },
      mandatory: false,
      visible: true,
      editable: true,
      order: 19,
      width: "four",
      placeholder: "Enter Tare Weight",
      options: getUomOptions(thuQtyUomList),
    },

    NetWeight: {
      id: "NetWeight",
      label: "Net Weight [25]/[20]",
      fieldType: "inputdropdown",
      value: {
        dropdown: "",
        input: "",
      },
      mandatory: false,
      visible: true,
      editable: true,
      order: 20,
      width: "four",
      placeholder: "Enter Net Weight",
      options: getUomOptions(thuQtyUomList),
    },

    TotalBrutto: {
      id: "TotalBrutto",
      label: "Total Brutto",
      fieldType: "inputdropdown",
      value: {
        dropdown: "",
        input: "",
      },
      mandatory: false,
      visible: true,
      editable: true,
      order: 21,
      width: "four",
      placeholder: "Total Brutto",
      options: getUomOptions(currencyUomList),
    },

    TotalNetto: {
      id: "TotalNetto",
      label: "Total Netto",
      fieldType: "inputdropdown",
      value: {
        dropdown: "",
        input: "",
      },
      mandatory: false,
      visible: true,
      editable: true,
      order: 22,
      width: "four",
      placeholder: "Total Netto",
      options: getUomOptions(currencyUomList),
    },

    TotalGross: {
      id: "TotalGross",
      label: "Total Gross",
      fieldType: "inputdropdown",
      value: {
        dropdown: "",
        input: "",
      },
      mandatory: false,
      visible: true,
      editable: true,
      order: 23,
      width: "four",
      placeholder: "Total Gross",
      options: getUomOptions(currencyUomList),
    },
  };

  //router details panel config
  const routeDetailsConfig: PanelConfig = {
    ConsignmentNumber: {
      id: "ConsignmentNumber",
      label: "Consignment Number",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "third",
      placeholder: "Enter Consignment Number",
      maxLength: 255,
    },
    Country: {
      id: "Country",
      label: "Country",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "third",
      placeholder: "Enter Country",
      labelFlag: true,
      fetchOptions: fetchMaster("Country Init"),
      hideSearch: false,
      disableLazyLoading: false,
      
    },
    COuntryValue: {
      id: "COuntryValue",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "third",
      placeholder: "Enter Country",
      hideSearch: false,
      disableLazyLoading: false,
      maxLength: 255,
    },
    Station: {
      id: "Station",
      label: "Station",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "two-thirds",
      placeholder: "Enter Station",
      hideSearch: false,
      fetchOptions: fetchMaster("Location Init"),
      disableLazyLoading: false,
    },
    StationValue: {
      id: "StationValue",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "third",
      placeholder: "Enter Station Value",
      labelFlag: false,
      maxLength: 255,
    },
    UndertakingEnterprise: {
      id: "UndertakingEnterprise",
      label: "Undertaking Enterprise",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "two-thirds",
      placeholder: "Undertaking Enterprise",
      hideSearch: false,
      fetchOptions: fetchMaster("Contractual carrier_58_a Init"),
      disableLazyLoading: false,
    },
    UndertakingEnterpriseValue: {
      id: "UndertakingEnterpriseValue",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "third",
      placeholder: "Enter Undertaking Enterprise Value",
      labelFlag: false,
      maxLength: 255,
    },
  };

  const routeDetailsCustomsEndorsementConfig: PanelConfig = {
    CustomsEndorsements_99: {
      id: "CustomsEndorsements_99",
      label: "Customs Endorsements [99]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: "third",
      placeholder: "Enter Customs Endorsements",
      maxLength: 500,
    },
    Route_50: {
      id: "Route_50",
      label: "Route [50]",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: "third",
      placeholder: "Enter Route",
      labelFlag: true,
      fetchOptions: fetchMaster("Route ID Init"),
      hideSearch: false,
      disableLazyLoading: false,
    },
    CustomsProcedures: {
      id: "CustomsProcedures",
      label: "CustomsProcedures [51]/[27]",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: "third",
      placeholder: "Enter Customs Procedures",
      hideSearch: false,
      disableLazyLoading: false,
      maxLength: 500,
    },
    ContractualCarrier: {
      id: "ContractualCarrier",
      label: "ContractualCarrier [58 a]",
      fieldType: "lazyselect",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: "four",
      placeholder: "Enter Contractual Carrier",
      hideSearch: false,
      fetchOptions: fetchMaster("Contractual carrier_58_a Init"),
      disableLazyLoading: false,
    },
    EnterContractual: {
      id: "EnterContractual",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: "four",
      placeholder: "Enter Contractual Carrier",
      labelFlag: false,
      maxLength: 255,
    },
    TransitProcedure: {
      id: "UndertakingEnterprise",
      label: "Simplified Transit Procedure For Rail [56 b]",
      fieldType: "checkbox",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: "four",
      maxLength: 500,
    },
    EnterTransitProcedure: {
      id: "TransitProcedure",
      label: "",
      fieldType: "text",
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: "four",
      placeholder: "Enter Simplified Transit Procedure For Rail",
      labelFlag: false,
    },
  };

  const handleAddConsignorConsignee = () => {
    console.log("Add Consignor/Consignee clicked");
    // Add your logic here
  };

  const normalizeValue = (v: any) => {
    if (v === "" || v === undefined) return null;
    if (typeof v === "boolean") return v ? 1 : 0;
    return v;
  };

  const normalizeObject = (obj: any) =>
    JSON.parse(
      JSON.stringify(obj, (_k, v) => {
        if (typeof v === "string" && v.includes("T00:00:00")) {
          return v.split("T")[0];
        }
        return normalizeValue(v);
      })
    );

  const resolveModeFlag = (
    current: any,
    initial: any,
    workOrderNo?: string
  ): "Insert" | "Update" | "NoChange" => {
    if (!workOrderNo) return "Insert";
    return deepEqual(normalizeObject(current), normalizeObject(initial))
      ? "NoChange"
      : "Update";
  };

  const toIntOrNull = (v: any) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isInteger(n) ? n : null;
  };

  // Deep equality check utility
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 == obj2) return true;
    if (
      typeof obj1 !== "object" ||
      obj1 === null ||
      typeof obj2 !== "object" ||
      obj2 === null
    )
      return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  };
const effectiveCimCuvNo: string | null =
  cimCuvNo ?? (workOrderNo || null);
  // Mapping functions
  const mapFormToHeaderPayload = (formData: Record<string, any>) => ({
    DocType: formData.templateType,
    CIMCUVNo: effectiveCimCuvNo,
    CustomerOrderNo: formData.customerOrderNo || null,
    DispatchDocNo: splitIdName(formData.dispatchDocNo).id || apiResponse?.Header?.DispatchDocNo || null,
    UNCode: splitIdName(formData.unCode).id || null,
    TripPlanID: splitIdName(formData.tripPlanId).id || null,
    Status: formData.status || "Confirmed",
    Template:
      splitIdName(formData.templateId).id ||
      apiResponse?.Header?.Template ||
      null,
    Wagon: splitIdName(formData.wagon).id || null,
    LVENo: formData.lveNo || null,
    CustomerID:splitIdName(formData.customerID).id|| null,
    ContractID: splitIdName(formData.contractID).id || null,
    CustomerDescription: null,

    ContractIDDescription: null,
  });

  const splitIdName = (value: any) => {
    if (!value || typeof value !== "string") {
      return { id: "", name: "" };
    }

    if (value.includes("||")) {
      const [id, name] = value.split("||").map((v) => v.trim());
      return { id, name };
    }

    return { id: value.trim(), name: "" };
  };

  const mapFormToGeneralDetailsPayload = (formData: Record<string, any>) => {
    const consignor = splitIdName(formData.consignor);
    const consignee = splitIdName(formData.consignee);

    const custConsignor = splitIdName(formData.customerCodeConsignor);
    const custPrePaid = splitIdName(formData.customerCodePrePaid);

    const custConsignee = splitIdName(formData.customerCodeConsignee);
    const custNonPrePaid = splitIdName(formData.customerCodeNonPrePaid);
    const consignorRef = splitIdName(formData.consignorReference);

    const deliveryPoint = splitIdName(formData.deliveryPoint);
    const codeDeliveryPoint = splitIdName(formData.codeDeliveryPoint);
    const stationServing = splitIdName(formData.codeStationServing);
    const acceptancePoint = splitIdName(formData.codeAcceptancePoint);
    const NumberOfCustomerAgreementOrTariff = splitIdName(
      formData.customerAgreementTariff
    );
    const acceptance = splitIdName(formData.acceptanceFrom);

    return {
      // Consignor
      Consignor_1_value1: consignor.id,
      ConsignorName_value2: consignor.name,

      // Customer Code for Consignor
      CustomerCodeForConsignor_2: custConsignor.id,
      CustomerCodeForConsignor_value2: custConsignor.name,

      // Pre-paid payer
      CustomerCodeForPayerOfPrePaidCharges_3: custPrePaid.id,
      CustomerCodeForPayerOfPrePaidCharges_value3: custPrePaid.name,

      // Consignee
      Consignee_4_value1: consignee.id,
      ConsigneeName_4_value2: consignee.name,

      // Customer Code for Consignee
      CustomerCodeForConsignee_5: custConsignee.id,
      CustomerCodeForConsignee_value5: custConsignee.name,

      // Non-prepaid payer
      CustomerCodeForPayerOfNonPrePaidCharges_6: custNonPrePaid.id,
      CustomerCodeForPayerOfNonPrePaidCharges_value6: custNonPrePaid.name,

      // Consignor Reference

      ConsignorsReference_8_value1: consignorRef.id,
      ConsignorsReference_8_value2: consignorRef.name,

      // Delivery Point
      DeliveryPoint_10_4_value1: deliveryPoint.id,
      DeliveryPoint_10_4_value2: deliveryPoint.name,

      // Code for Delivery Point
      CodeForDeliveryPoint_11_value1: codeDeliveryPoint.id,
      CodeForDeliveryPoint_11_value2: codeDeliveryPoint.name,

      // Station Serving
      CodeForStationServingDeliveryPoint_12_value1: stationServing.id,
      CodeForStationServingDeliveryPoint_12_value2: stationServing.name,

      // Agreement/Tariff
      NumberOfCustomerAgreementOrTariff_14:
        NumberOfCustomerAgreementOrTariff.id || "",

      // Acceptance Date / From
      AcceptanceDate_16_2: formData.acceptanceDate || "",
      AcceptanceFrom_16_3: acceptance.id || "",

      // Acceptance Point
      CodeForAcceptancePoint_17: acceptancePoint.id,
      CodeForAcceptancePoint_17_1: acceptancePoint.name,

      // Other fields
      WagonNo_18: null,
      DeliveryStationName: stationServing.name || "",
      DeliveryCountryName: formData.deliveryCountryName || "",
      NameForAcceptancePoint_16: acceptance.id || "",
      NameForAcceptancePoint_16_1: acceptance.name || "",
    };
  };

  const mapFormToPaymentInstructionPayload = (
    paymentFormData: Record<string, any>,
    placeAndDateFormData: Record<string, any>
  ) => ({
    PaymentInstructionDescriptionvalue1:
      paymentFormData.paymentInstruction1 || null,
    PaymentInstructionDescriptionvalue2:
      paymentFormData.paymentInstruction2 || null,
    CarriageChargePaid: paymentFormData.carriageChargePaid ? 1 : 0,
    IncoTerms: paymentFormData.incoTerms ? 1 : 0, // Assuming IncoTerms is from placeAndDateFormData
    Incotermsvalue: "Fleet On Board", // This might need to be dynamic if there's a form field for it
    PlaceAndDateMadeOut_29_value1: placeAndDateFormData.place || null,
    PlaceAndDateMadeOut_29_value2: placeAndDateFormData.dateMadeOut || null,
  });

  const mapFormToConsignorDeclarationsPayload = (
    formData: Record<string, any>
  ) => ({
    ConsignorsDeclarations_7: formData.consignorDeclarations || null,
    DocumentsAttached_9: formData.documentsAttached || null,
    CommercialSpecifications_13: formData.commercialSpecifications || null,
    InformationForTheConsignee_15: formData.informationForConsignee || null,
  });

  const mapFormToValueDeliveryCashPayload = (formData: Record<string, any>) => {
    const declarationOfValue = splitIdName(formData.declarationOfValue);
    const interestInDelivery = splitIdName(formData.interestInDelivery);

    // cash on delivery may be inputdropdown → handle carefully
    const cashOnDelivery =
      typeof formData.cashOnDelivery === "string"
        ? splitIdName(formData.cashOnDelivery)
        : { id: formData.cashOnDelivery, name: "" };

    return {
      // Declaration of Value [26]

        DeclarationOfValue_26: formData?.declarationOfValue?.input || null,
       Currency_26: formData?.declarationOfValue?.dropdown || null,

        // Interest in Delivery [27] , 
        InterestInDelivery_27: formData?.interestInDelivery?.input || null,
        Currency_27: formData?.interestInDelivery?.dropdown || null,

        // Cash on Delivery [28]
        CashOnDelivery_28: formData?.cashOnDelivery?.input || null,
        Currency_28: formData?.cashOnDelivery?.dropdown || null,

      // DeclarationOfValue_26: "CAD",
      // Currency_26: "454.00000000",

      // InterestInDelivery_27: "454.00000000",
      // Currency_27: "454.00000000",

      // CashOnDelivery_28: "CHF",
      // Currency_28: "6333.00000000"
    };
  };

  const mapFormToCodingBoxesPayload = (formData: Record<string, any>) => ({
    CodingBox1_40: formData.codingBox1 || null,
    CodingBox2_41: formData.codingBox2 || null,
    CodingBox3_42: formData.codingBox3 || null,
    CodingBox4_43: formData.codingBox4 || null,
    CodingBox5_44: formData.codingBox5 || null,
    CodingBox6_45: formData.codingBox6 || null,
    CodingBox7_46: formData.codingBox7 || null,
    CodingBox8_47: formData.codingBox8 || null,
    //123
  });

  const mapFormToExaminationDetailsPayload = (
    formData: Record<string, any>
  ) => ({
    Examination_48: formData.examination || null,
    PrepaymentCoding_49: formData.prepaymentCoding || null,
    ChargesNote_52: formData.chargesNote ? 1 : 0,
    CashOnDeliveryReceipt_53: formData.cashOnDeliveryReceipt || null,
    FormalReport_54: formData.formalReport || null,
    ExtensionOfTransitPeriod_55: formData.extensionOfTransitPeriod || null,
    DateOfArrival_59: formData.dateOfArrival || null,
    MadeAvailable_60: formData.madeAvailable || null,
    AcknowledgementOfReceipt_61: formData.acknowledgementOfReceipt || null,
  });

  const mapFormToSectionAPayload = (formData: Record<string, any>) => ({
    CodeForChargingSections_70: formData.codeForChargingSections || null,
    RouteCode_71: formData.routeCode || null,
    NHMCode_72: formData.nhmCode || null,
    Currency_73: formData.currency || null,
    ChargedMassWeight_74: formData.chargedMassWeight || null,
    CustomerAgreementOrTariffApplied_75:
      formData.customerAgreementOrTariffApplied || null,
    KMZone_76: formData.kmZone || null,
    SupplementsFeesDeductions_77: formData.supplementsFeesDeductions || null,
    UnitPrice_78: formData.unitPrice || null,
    Charges_79: formData.charges || null,
  });

  const mapFormToSectionBPayload = (formData: Record<string, any>) => ({
    CodeForChargingSections_70: formData.codeForChargingSectionsB,
    RouteCode_71: formData.routeCodeB || null,
    NHMCode_72: formData.nhmCodeB || null,
    Currency_73: formData.currencyB || null,
    ChargedMassWeight_74: formData.chargedMassWeightB || null,
    CustomerAgreementOrTariffApplied_75:
      formData.customerAgreementOrTariffAppliedB || null,
    KMZone_76: formData.kmZoneB || null,
    SupplementsFeesDeductions_77: formData.supplementsFeesDeductionsB || null,
    UnitPrice_78: formData.unitPriceB || null,
    Charges_79: formData.chargesB || null,
  });

  const mapFormToSectionCPayload = (formData: Record<string, any>) => ({
    CodeForChargingSections_70: formData.codeForChargingSectionsC || null,
    RouteCode_71: formData.routeCodeC || null,
    NHMCode_72: formData.nhmCodeC || null,
    Currency_73: formData.currencyC || null,
    ChargedMassWeight_74: formData.chargedMassWeightC || null,
    CustomerAgreementOrTariffApplied_75:
      formData.customerAgreementOrTariffAppliedC || null,
    KMZone_76: formData.kmZoneC || null,
    SupplementsFeesDeductions_77: formData.supplementsFeesDeductionsC || null,
    UnitPrice_78: formData.unitPriceC || null,
    Charges_79: formData.chargesC || null,
  });

  const mapFormToRoutePayload = (formData: Record<string, any>) => {
    const country = splitIdName(formData.Country);
    const station = splitIdName(formData.Station);
    const enterprise = splitIdName(formData.UndertakingEnterprise);

    return {
      ConsignmentNo_62_6: formData.ConsignmentNumber || "",

      // Country
      Countryvalue1: country.id,
      // Countryvalue2: country.name,
      Countryvalue2: formData.COuntryValue || "",

      // Station
      Stationvalue1: station.id,
      // Stationvalue2: station.name,
      Stationvalue2: formData.StationValue || "",

      // Undertaking Enterprise
      UndertakingEnterprisesvalue1: enterprise.id,
      UndertakingEnterprisesvalue2: formData.UndertakingEnterprisesvalue2,
      UndertakingEnterpriseValueText: formData.UndertakingEnterpriseValue || "",
    };
  };

  const mapFormToRouteEndorsementPayload = (formData: Record<string, any>) => {
    const contractualCarrier = splitIdName(formData.ContractualCarrier);
    const RouteValue = splitIdName(formData.Route_50);

    return {
      CustomsEndorsements_99: formData.CustomsEndorsements_99 || null,
      Route_50: RouteValue?.id || "",
      CustomsProcedure_51_27_value1: formData.CustomsProcedures || null,
      CustomsProcedure_51_27_value2: formData.CustomsProcedures || null,
      ContractualCarrier_58a_value1: contractualCarrier.id || null,
      ContractualCarrier_58a_value2: contractualCarrier.name || null,
      EnterContractualCarrier_58a: formData.EnterContractual || null,
      SimplifiedTransitProcedureForRail_58b_value1: formData.TransitProcedure
        ? "1"
        : "0",
      SimplifiedTransitProcedureForRail_58b_value2:
        formData.EnterTransitProcedure || null,
    };
  };
  //for grid
//   const mapRouteCodeCDetailsPayload = (rows: any[]) => {
//     return rows
//       .filter((row) => row.RouteID || row.LegID)
//       .map((row) => ({
//         RouteID: row.RouteID ?? "",
//        LegSequence: row.LegSequence !== null && row.LegSequence !== undefined
//   ? Number(row.LegSequence)
//   : null,

//         LegID: row.LegID ?? "",
//         FromLocationID: row.FromLocationID ?? "",
//         FromLocationDesc: row.FromLocationDesc ?? "",
//         ToLocationID: row.ToLocationID ?? "",
//         ToLocationDesc: row.ToLocationDesc ?? "",
//         AdhocLeg: row.AdhocLeg ?? "",
//         ViaPoint: row.ViaPoint ?? "",
//         ModeFlag: row.ModeFlag,
//       }));
//   };

    const mapRouteCodeCDetailsPayload = (rows: any[]) =>
        rows.map(r => ({
        RouteID:
            r.RouteID === "" || r.RouteID === undefined
            ? null
            : Number(r.RouteID),
    
        LegSequence:
            r.LegSequence === "" || r.LegSequence === undefined
            ? null
            : Number(r.LegSequence),
    
        LegID:
            r.LegID === "" || r.LegID === undefined
            ? null
            : Number(r.LegID),
    
        FromLocationID: r.FromLocationID || null,
        FromLocationDesc: r.FromLocationDesc || "",
    
        ToLocationID: r.ToLocationID || null,
        ToLocationDesc: r.ToLocationDesc || "",
    
        AdhocLeg: r.AdhocLeg ? 1 : 0,
    
        ViaPoint: r.ViaPoint || "",
    
        ModeFlag: r.ModeFlag || "Insert",
    }));

  const mapOtherCarriersPayload = (rows: any[]) =>
    rows.map((row) => ({
      Name: row.Name ?? "",
      Section1: row.Section1 ?? "",
      Section2: row.Section2 ?? "",
      Status: row.Status ?? "",
      ModeFlag: row.ModeFlag,
    }));

  const toNumberOrNull = (v: any) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  const toBit = (v: any) => (v ? 1 : 0);

  const mapFormToWagonInfoDetails = (
    formData: any,
    modeFlag: "Insert" | "Update" | "NoChange"
  ) => {
    const gross = splitValueUom(
      formData.GrossWeight
        ? `${formData.GrossWeight.input} ${formData.GrossWeight.dropdown}`
        : null
    );

    const tare = splitValueUom(
      formData.TareWeight
        ? `${formData.TareWeight.input} ${formData.TareWeight.dropdown}`
        : null
    );

    const net = splitValueUom(
      formData.NetWeight
        ? `${formData.NetWeight.input} ${formData.NetWeight.dropdown}`
        : null
    );

    return {
      Train_1: formData.train || null,
      Itinerary_5: formData.itinerary || null,
      Date_of_Dispatch_7: formData.dataOfDispatch || null,
      Page_9: formData.Page || null,
      To_be_cleared_at_12: formData.toBeClearedAt || null,

      Fixed_Net_Weight_Train_13: toNumberOrNull(formData.fixedNetTrain?.input),

      No_Number_14: toNumberOrNull(formData.number),

      Loading_Configuration_16: formData.LoadingConfiguration || null,
      WagonNo_18_15: formData.wagonNumber || null,
      Description_of_the_goods_21_17: formData.DescriptionoftheGoods || null,

      Exceptional_Consignment_22: toBit(formData.ExceptionalConsignment),
      RID_23_28: toBit(formData.RID),

      NHM_Code_24_18: toNumberOrNull(splitIdName(formData.NHMCode).id),

      Mark_and_Number_25: formData.MarkandNumber || null,
      Delivery_Note_Number_26: formData.DeliveryNoteNumber || null,

      GrossWeight_25_19: formData.GrossWeight?.input || 0,
      GrossWeight_25_19_UOM: formData.GrossWeight?.dropdown || null,
 
      TareWeight_25_20: formData.TareWeight?.input || 0,
      TareWeight_25_20_UOM: formData.TareWeight?.dropdown || null,
 
      NetWeight_25_21: formData.NetWeight?.input || 0,
      NetWeight_25_21_UOM: formData.NetWeight?.dropdown || null,
 
      Total_Brutto: formData.TotalBrutto?.input || 0,
      Total_Netto: formData.TotalNetto?.input || 0,
      Total_Gross: formData.TotalGross?.input || 0,
     
      Total_Brutto_UOM: formData.TotalBrutto?.dropdown || null,
      Total_Netto_UOM: formData.TotalNetto?.dropdown || null,
      Total_Gross_UOM: formData.TotalGross?.dropdown || null,
 

      ModeFlag: modeFlag,
    };
  };

  const mapWagonGridPayload = (rows: any[]) =>
    rows.map((row) => {
      const mass = splitValueUom(row.TotalMass);
      const brut = splitValueUom(row.TotalBrut);
      const tare = splitValueUom(row.TotalTare);

      return {
        WagonNo: row.WagonNo || "",
        RID: row.RID ? "1" : "0",

        Mass_Weight: row.MassWeight || null,
        Mass_Weight_UOM: null,

        Total_Mass: Number(mass.val) || 0,
        Total_Mass_UOM: mass.uom,

        Total_Brutt: Number(brut.val) || 0,
        Total_Brutt_UOM: brut.uom,

        Total_Tare: Number(tare.val) || 0,
        Total_Tare_UOM: tare.uom,

        Wagon_Length: row.WagonLength || null,
        Wagon_Length_UOM: null,

        Short_Description_of_Goods: row.Short_Description_of_Goods || null,

        ModeFlag: row.ModeFlag || "NoChange",
      };
    });

  const initialSnapshotRef = useRef<any>(null);

  /** Normalize values to avoid false Update */
  const normalize = (obj: any) =>
    JSON.parse(
      JSON.stringify(obj, (_k, v) => (v === "" || v === undefined ? null : v))
    );

  const [isFormInitialized, setIsFormInitialized] = useState(false);
  // Effect to set form values when API response is received
  useEffect(() => {
    if (apiResponse && !isFormInitialized) {
      if (headerTemplateRef.current && apiResponse.Header) {
        // Map API response to headerTemplate form fields
        headerTemplateRef.current.setFormValues({
          templateId: apiResponse.Header.Template,
          templateType: apiResponse.Header.DocType,
          dispatchDocNo: apiResponse.Header.DispatchDocNo,
          dispatchDocNoDescription: apiResponse.Header.DispatchDocNoDescription,
          unCode: apiResponse.Header.UNCode,

          tripPlanId:
            apiResponse?.Header?.TripPlanID &&
            apiResponse?.Header?.TripPlanDescription
              ? `${apiResponse.Header.TripPlanID} || ${apiResponse.Header.TripPlanDescription}`
              : "",

          wagon: apiResponse.Header.Wagon,
          lveNo: apiResponse.Header.LVENo,
          customerID: apiResponse.Header.CustomerID,
          customerIDDescription: apiResponse.Header.CustomerDescription,
          contractID:
            apiResponse?.Header?.ContractID &&
            apiResponse?.Header?.ContractIDDescription
              ? `${apiResponse.Header.ContractID} || ${apiResponse.Header.ContractIDDescription}`
              : "",
        });
      }
      if (generalDetailsRef.current && apiResponse.General?.Details) {
        const apiDetails = apiResponse.General.Details;
        const transformedDetails = {
          consignor: apiDetails.Consignor_1_value1, // Assuming this is the main consignor value
          consignorDescription: apiDetails.ConsignorName_value2, // Assuming this is the description
          customerCodeConsignor: apiDetails.CustomerCodeForConsignor_2,
          customerCodePrePaid:
            apiDetails.CustomerCodeForPayerOfPrePaidCharges_3,
          consignee: apiDetails.Consignee_4_value1,
          consigneeDescription: apiDetails.ConsigneeName_4_value2,
          customerCodeConsignee: apiDetails.CustomerCodeForConsignee_5,
          customerCodeNonPrePaid:
            apiDetails.CustomerCodeForPayerOfNonPrePaidCharges_6,
          consignorReference: apiDetails.ConsignorsReference_8_value1,
          consignorReferenceDescription:
            apiDetails.ConsignorsReference_8_value2,
          deliveryPoint: apiDetails.DeliveryPoint_10_4_value1,
          deliveryPointDescription: apiDetails.DeliveryPoint_10_4_value2,
          codeDeliveryPoint: apiDetails.CodeForDeliveryPoint_11_value1,
          codeStationServing:
            apiDetails.CodeForStationServingDeliveryPoint_12_value1,
          customerAgreementTariff:
            apiDetails.NumberOfCustomerAgreementOrTariff_14,
          acceptanceDate: apiDetails.AcceptanceDate_16_2, // Assuming it's already in YYYY-MM-DD or compatible format
          acceptanceFrom: apiDetails.AcceptanceFrom_16_3,
          codeAcceptancePoint: apiDetails.CodeForAcceptancePoint_17,
        };
        generalDetailsRef.current.setFormValues(transformedDetails);
      }
      if (
        paymentInstructionRef.current &&
        apiResponse.General?.PaymentInstruction
      ) {
        // Map API response to paymentInstruction form fields
        paymentInstructionRef.current.setFormValues({
          paymentInstruction1:
            apiResponse.General.PaymentInstruction
              .PaymentInstructionDescriptionvalue1,
          paymentInstruction2:
            apiResponse.General.PaymentInstruction
              .PaymentInstructionDescriptionvalue2,
          carriageChargePaid:
            apiResponse.General.PaymentInstruction.CarriageChargePaid === 1, // Convert to boolean
          incoTerms: apiResponse.General.PaymentInstruction.IncoTerms === "1", // Convert to boolean
        });
      }
      if (placeAndDateRef.current && apiResponse.General?.PaymentInstruction) {
        // Map API response to placeAndDate form fields
        placeAndDateRef.current.setFormValues({
          place:
            apiResponse.General.PaymentInstruction
              .PlaceAndDateMadeOut_29_value1,
          dateMadeOut:
            apiResponse.General.PaymentInstruction
              .PlaceAndDateMadeOut_29_value2,
        });
      }

      if (consignorDeclarationsRef.current && apiResponse.Declarations) {
        consignorDeclarationsRef.current.setFormValues({
          consignorDeclarations:
            apiResponse.Declarations.ConsignorsDeclarations_7,
          documentsAttached: apiResponse.Declarations.DocumentsAttached_9,
          commercialSpecifications:
            apiResponse.Declarations.CommercialSpecifications_13,
          informationForConsignee:
            apiResponse.Declarations.InformationForTheConsignee_15,
        });
      }

    if (valueDeliveryCashRef.current && apiResponse?.Declarations) {
  const decl = apiResponse.Declarations;

  valueDeliveryCashRef.current.setFormValues({
    declarationOfValue: {
      input:
        decl.DeclarationOfValue_26 != null
          ? String(decl.DeclarationOfValue_26)
          : "",
      dropdown: decl.Currency_26 != null ? decl.Currency_26 : "",
    },

    interestInDelivery: {
      input:
        decl.InterestInDelivery_27 != null
          ? String(decl.InterestInDelivery_27)
          : "",
      dropdown: decl.Currency_27 != null ? decl.Currency_27 : "",
    },

    // ✅ backend changed → CashOnDelivery_28 drives dropdown
    cashOnDelivery: {
      input:
        decl.CashOnDelivery_28 != null
          ? String(decl.CashOnDelivery_28)
          : "",
      dropdown:
        decl.CashOnDelivery_28 != null
          ? String(decl.CashOnDelivery_28)
          : "",
    },
  });
}


      if (codingBoxesRef.current && apiResponse.Declarations) {
        codingBoxesRef.current.setFormValues({
          codingBox1: apiResponse.Declarations.CodingBox1_40,
          codingBox2: apiResponse.Declarations.CodingBox2_41,
          codingBox3: apiResponse.Declarations.CodingBox3_42,
          codingBox4: apiResponse.Declarations.CodingBox4_43,
          codingBox5: apiResponse.Declarations.CodingBox5_44,
          codingBox6: apiResponse.Declarations.CodingBox6_45,
          codingBox7: apiResponse.Declarations.CodingBox7_46,
          codingBox8: apiResponse.Declarations.CodingBox8_47,
        });
      }

      if (examinationDetailsRef.current && apiResponse.Declarations) {
        examinationDetailsRef.current.setFormValues({
          examination: apiResponse.Declarations.Examination_48,
          prepaymentCoding: apiResponse.Declarations.PrepaymentCoding_49,
          chargesNote: apiResponse.Declarations.ChargesNote_52 === "1",
          cashOnDeliveryReceipt:
            apiResponse.Declarations.CashOnDeliveryReceipt_53,
          formalReport: apiResponse.Declarations.FormalReport_54,
          extensionOfTransitPeriod:
            apiResponse.Declarations.ExtensionOfTransitPeriod_55,
          dateOfArrival: apiResponse.Declarations.DateOfArrival_59,
          madeAvailable: apiResponse.Declarations.MadeAvailable_60,
          acknowledgementOfReceipt:
            apiResponse.Declarations.AcknowledgementOfReceipt_61,
        });
      }

      if (sectionARef.current && apiResponse.Declarations?.SectionA) {
        sectionARef.current.setFormValues({
          codeForChargingSections:
            apiResponse.Declarations.SectionA.CodeForChargingSections_70,
          routeCode: apiResponse.Declarations.SectionA.RouteCode_71,
          nhmCode: apiResponse.Declarations.SectionA.NHMCode_72,
          currency: apiResponse.Declarations.SectionA.Currency_73,
          chargedMassWeight:
            apiResponse.Declarations.SectionA.ChargedMassWeight_74,
          customerAgreementOrTariffApplied:
            apiResponse.Declarations.SectionA
              .CustomerAgreementOrTariffApplied_75,
          kmZone: apiResponse.Declarations.SectionA.KMZone_76,
          supplementsFeesDeductions:
            apiResponse.Declarations.SectionA.SupplementsFeesDeductions_77,
          unitPrice: apiResponse.Declarations.SectionA.UnitPrice_78,
          charges: apiResponse.Declarations.SectionA.Charges_79,
        });
      }

      if (sectionBRef.current && apiResponse.Declarations?.SectionB) {
        sectionBRef.current.setFormValues({
          codeForChargingSectionsB:
            apiResponse.Declarations.SectionB.CodeForChargingSections_70,
          routeCodeB: apiResponse.Declarations.SectionB.RouteCode_71,
          nhmCodeB: apiResponse.Declarations.SectionB.NHMCode_72,
          currencyB: apiResponse.Declarations.SectionB.Currency_73,
          chargedMassWeightB:
            apiResponse.Declarations.SectionB.ChargedMassWeight_74,
          customerAgreementOrTariffAppliedB:
            apiResponse.Declarations.SectionB
              .CustomerAgreementOrTariffApplied_75,
          kmZoneB: apiResponse.Declarations.SectionB.KMZone_76,
          supplementsFeesDeductionsB:
            apiResponse.Declarations.SectionB.SupplementsFeesDeductions_77,
          unitPriceB: apiResponse.Declarations.SectionB.UnitPrice_78,
          chargesB: apiResponse.Declarations.SectionB.Charges_79,
        });
      }

      if (sectionCRef.current && apiResponse.Declarations?.SectionC) {
        sectionCRef.current.setFormValues({
          codeForChargingSectionsC:
            apiResponse.Declarations.SectionC.CodeForChargingSections_70,
          routeCodeC: apiResponse.Declarations.SectionC.RouteCode_71,
          nhmCodeC: apiResponse.Declarations.SectionC.NHMCode_72,
          currencyC: apiResponse.Declarations.SectionC.Currency_73,
          chargedMassWeightC:
            apiResponse.Declarations.SectionC.ChargedMassWeight_74,
          customerAgreementOrTariffAppliedC:
            apiResponse.Declarations.SectionC
              .CustomerAgreementOrTariffApplied_75,
          kmZoneC: apiResponse.Declarations.SectionC.KMZone_76,
          supplementsFeesDeductionsC:
            apiResponse.Declarations.SectionC.SupplementsFeesDeductions_77,
          unitPriceC: apiResponse.Declarations.SectionC.UnitPrice_78,
          chargesC: apiResponse.Declarations.SectionC.Charges_79,
        });
      }

      if (RouteEndorsementDetailsRef.current && apiResponse?.RouteDetails) {
        console.log("SETTING ROUTE VALUES NOW");
        const apiRoute = apiResponse.ConsignmentDetails;

        const country =
          apiRoute.Countryvalue1 && apiRoute.Countryvalue2
            ? `${apiRoute.Countryvalue1} || ${apiRoute.Countryvalue2}`
            : apiRoute.Countryvalue1 || "";

        const station =
          apiRoute.Stationvalue1 && apiRoute.Stationvalue2
            ? `${apiRoute.Stationvalue1} || ${apiRoute.Stationvalue2}`
            : apiRoute.Stationvalue1 || "";

        const enterprise =
          apiRoute.UndertakingEnterprisesvalue1 &&
          apiRoute.UndertakingEnterprisesvalue2
            ? `${apiRoute.UndertakingEnterprisesvalue1} || ${apiRoute.UndertakingEnterprisesvalue2}`
            : apiRoute.UndertakingEnterprisesvalue1 || "";

        RouteDetailsRef.current.setFormValues({
          ConsignmentNumber: apiRoute.ConsignmentNo_62_6 || "",
          Country: country,
          COuntryValue: apiRoute.Countryvalue2 || "",
          Station: station,
          StationValue: apiRoute.Stationvalue2 || "",
          UndertakingEnterprise: enterprise,
          UndertakingEnterpriseValue:
            apiRoute.UndertakingEnterprisesvalue2 || "",
        });
      }
      if (RouteEndorsementDetailsRef.current && apiResponse?.RouteDetails) {
        console.log("SETTING ROUTE VALUES NOW");
        const apiRoute = apiResponse.RouteDetails;

        const CustomsProcedure =
          apiRoute.CustomsProcedure_51_27_value1 &&
          apiRoute.CustomsProcedure_51_27_value2
            ? `${apiRoute.CustomsProcedure_51_27_value1} || ${apiRoute.CustomsProcedure_51_27_value2}`
            : apiRoute.CustomsProcedure_51_27_value1 || "";

        const ContractualCarrier =
          apiRoute.ContractualCarrier_58a_value1 &&
          apiRoute.ContractualCarrier_58a_value2
            ? `${apiRoute.ContractualCarrier_58a_value1} || ${apiRoute.ContractualCarrier_58a_value2}`
            : apiRoute.ContractualCarrier_58a_value1 || "";

        RouteEndorsementDetailsRef.current.setFormValues({
          CustomsEndorsements_99: apiRoute.ConsignmentNo_62_6 || "",
          Route_50: apiRoute.Route_50 || "",
          CustomsProcedures: apiRoute.CustomsProcedure_51_27_value1,
          ContractualCarrier: ContractualCarrier,
          EnterContractual: apiRoute.ContractualCarrier_58a_value1 || "",
          TransitProcedure:
            apiRoute.SimplifiedTransitProcedureForRail_58b_value1,
          EnterTransitProcedure:
            apiRoute.SimplifiedTransitProcedureForRail_58b_value2 || "",
        });
      }

      if (apiResponse?.RouteDetails?.OtherCarriers_57) {
        setOtherCarriers(
          apiResponse.RouteDetails.OtherCarriers_57.map((c: any) => ({
            Section1: c.Section1 || "",
            Section2: c.Section2 || "",
            Status: c.Status || "",
          }))
        );
      }
      if (apiResponse?.RouteDetails?.Route) {
        setRouteCodeCDetails(
          apiResponse.RouteDetails.Route.map((c: any) => ({
            RouteID: c.RouteID || "",
            LegSequence: c.LegSequence || "",
            LegID: c.LegID || "",
            FromLocationID: c.FromLocationID || "",
            FromLocationDesc: c.FromLocationDesc || "",
            ToLocationID: c.ToLocationID || "",
            ToLocationDesc: c.ToLocationDesc || "",
            AdhocLeg: c.AdhocLeg || "",
            ViaPoint: c.ViaPoint || "",
          }))
        );
      }

      if (WagonDetailsRef.current && apiResponse?.WagonInfodetails) {
        const wagon = apiResponse.WagonInfodetails;

        WagonDetailsRef.current.setFormValues({
          train: wagon.Train_1 ?? "",
          itinerary: wagon.Itinerary_5 ?? "",
          dataOfDispatch: wagon.Date_of_Dispatch_7 ?? "",
          Page: wagon.Page_9 ?? "",
          toBeClearedAt: wagon.To_be_cleared_at_12 ?? "",

          fixedNetTrain: {
            input: wagon.Fixed_Net_Weight_Train_13 ?? "",
          },

          number: wagon.No_Number_14 ?? 1,
          LoadingConfiguration: wagon.Loading_Configuration_16 ?? "",

          wagonNumber: wagon.WagonNo_18_15 ?? "",
          DescriptionoftheGoods: wagon.Description_of_the_goods_21_17 ?? "",

          ExceptionalConsignment: wagon.Exceptional_Consignment_22 === "1",
          RID: wagon.RID_23_28 === "1",
          MarkandNumber: wagon.Mark_and_Number_25 ?? "",
          DeliveryNoteNumber: wagon.Delivery_Note_Number_26 ?? "",
          UTICODE: wagon.UTI_Code_23 ?? "",

          NHMCode: wagon.NHM_Code_24_18 ? String(wagon.NHM_Code_24_18) : "",

          GrossWeight: wagon.GrossWeight_25_19
            ? {
                input: String(wagon.GrossWeight_25_19),
                dropdown: wagon.GrossWeight_25_19_UOM,
              }
            : null,

          TareWeight: wagon.TareWeight_25_20
            ? {
                input: String(wagon.TareWeight_25_20),
                dropdown: wagon.TareWeight_25_20_UOM,
              }
            : null,

          NetWeight: wagon.NetWeight_25_21
            ? {
                input: String(wagon.NetWeight_25_21),
                dropdown: wagon.NetWeight_25_21_UOM,
              }
            : null,
        });
      }

      if (apiResponse?.WagonLineDetails) {
        setWagonGritDetails(
          apiResponse.WagonLineDetails.map((row: any) => ({
            ...row,
            // ensure ModeFlag exists for grid editing
            ModeFlag: row.ModeFlag || "NoChange",
          }))
        );
      }

      if (apiResponse && !initialSnapshotRef.current) {
        initialSnapshotRef.current = {
          header: headerTemplateRef.current?.getFormValues(),
          general: generalDetailsRef.current?.getFormValues(),
          payment: paymentInstructionRef.current?.getFormValues(),
          placeAndDate: placeAndDateRef.current?.getFormValues(),
          declarations: consignorDeclarationsRef.current?.getFormValues(),
          valueDelivery: valueDeliveryCashRef.current?.getFormValues(),
          codingBoxes: codingBoxesRef.current?.getFormValues(),
          examination: examinationDetailsRef.current?.getFormValues(),
          sectionA: sectionARef.current?.getFormValues(),
          sectionB: sectionBRef.current?.getFormValues(),
          sectionC: sectionCRef.current?.getFormValues(),
          route: RouteDetailsRef.current?.getFormValues(),
          routeEndorsement: RouteEndorsementDetailsRef.current?.getFormValues(),
          wagon: WagonDetailsRef.current?.getFormValues(), // ✅ SINGLE FORM
        };
        console.log("SNAPSHOT CAPTURED", initialSnapshotRef.current);
      }
    }

    console.log("API RESPONSE SETTING FORM VALUES", apiResponse);
  }, [apiResponse]);


  const splitValueUom = (value?: string | null) => {
    if (!value) return { val: null, uom: null };

    const parts = value.split(" ");
    return {
      val: parts[0] ?? null,
      uom: parts[1] ?? null,
    };
  };
//   const sanitizedWagonLineDetails = wagonGritDetails.map((row) => ({
//     ...row,

//     // --- NUMERIC FIELDS ---
//     No_of_Axle: toNumberOrNull(row.No_of_Axle),
//     NHM: toNumberOrNull(row.NHM),
//     Mass_Weight: toNumberOrNull(row.Mass_Weight),
//     Tare_Weight: toNumberOrNull(row.Tare_Weight),
//     Brut_Weight: toNumberOrNull(row.Brut_Weight),

//     Total_Mass: toNumberOrNull(row.Total_Mass),
//     Total_Brutt: toNumberOrNull(row.Total_Brutt),
//     Total_Tare: toNumberOrNull(row.Total_Tare),

//     Container_Tare_Weight: toNumberOrNull(row.Container_Tare_Weight),
//     Container_Tare_Weight_2: toNumberOrNull(row.Container_Tare_Weight_2),
//     Container_load_weight: toNumberOrNull(row.Container_load_weight),

//     Net_Weight_Commodity_Qty: toNumberOrNull(row.Net_Weight_Commodity_Qty),
//     Gross_Weight: toNumberOrNull(row.Gross_Weight),
//     Wagon_Length: toNumberOrNull(row.Wagon_Length),

//     // --- BIT / BOOLEAN FIELDS ---
//     Environmentally_Hazardous: toBit(row.Environmentally_Hazardous),
//     UN_Desc_English_Check: toBit(row.UN_Desc_English_Check),
//     UN_Desc_French_Check: toBit(row.UN_Desc_French_Check),
//     UN_Desc_German_Check: toBit(row.UN_Desc_German_Check),
//     UN_Desc_Other_Language_Check: toBit(row.UN_Desc_Other_Language_Check),

//     RID: toBit(row.RID),

//     ModeFlag: row.ModeFlag || "Update",
//   }));

const sanitizeWagonLineDetails = (wagonGritDetails: any[]) =>
  wagonGritDetails
    .map(row => ({
      // =========================
      // Identity
      // =========================
      WagonNo: row.WagonNo?.trim() || "",

      // =========================
      // Axle / Codes
      // =========================
      No_of_Axle:toNumberOrNull(row.No_of_Axle) ,
      NHM: toNumberOrNull(row.NHM),

      // =========================
      // Weights + UOM
      // =========================
      Mass_Weight: toNumberOrNull(row.Mass_Weight),
      Mass_Weight_UOM: row.Mass_Weight_UOM || null,

      Tare_Weight: toNumberOrNull(row.Tare_Weight),
      Tare_Weight_UOM: row.Tare_Weight_UOM || null,

      Brut_Weight: toNumberOrNull(row.Brut_Weight),
      Brut_Weight_UOM: row.Brut_Weight_UOM || null,

      Gross_Weight: toNumberOrNull(row.Gross_Weight),
      Gross_weight_UOM: row.Gross_weight_UOM || null,

      Net_Weight_Commodity_Qty: toNumberOrNull(row.Net_Weight_Commodity_Qty),
      Net_Weight_Commodity_Qty_UOM:
        row.Net_Weight_Commodity_Qty_UOM || null,

      Wagon_Length: toNumberOrNull(row.Wagon_Length),
      Wagon_Length_UOM: row.Wagon_Length_UOM || null,

      // =========================
      // Container weights
      // =========================
      Container_Tare_Weight: toNumberOrNull(row.Container_Tare_Weight),
      Container_Tare_Weight_UOM:
        row.Container_Tare_Weight_UOM || null,

      Container_Tare_Weight_2: toNumberOrNull(row.Container_Tare_Weight_2),
      Container_tare_weight_2_UOM:
        row.Container_tare_weight_2_UOM || null,

      Container_load_weight: toNumberOrNull(row.Container_load_weight),
      Container_Load_Weight_UOM:
        row.Container_Load_Weight_UOM || null,

      // =========================
      // Totals
      // =========================
      Total_Mass: toNumberOrNull(row.Total_Mass),
      Total_Mass_UOM: row.Total_Mass_UOM || null,

      Total_Brutt: toNumberOrNull(row.Total_Brutt),
      Total_Brutt_UOM: row.Total_Brutt_UOM || null,

      Total_Tare: toNumberOrNull(row.Total_Tare),
      Total_Tare_UOM: row.Total_Tare_UOM || null,

      // =========================
      // Text / Descriptive fields
      // =========================
      Short_Description_of_Goods:
        row.Short_Description_of_Goods || null,

      Specificity: row.Specificity || null,
      UTI_Type: row.UTI_Type || null,

      Long_x_larg_x_haut: row.Long_x_larg_x_haut || null,
      Long_x_larg_x_haut_UOM:
        row.Long_x_larg_x_haut_UOM || null,

      Brand_and_No: row.Brand_and_No || null,
      Remittance_Slip_Number:
        row.Remittance_Slip_Number || null,

      Customs_Document: row.Customs_Document || null,
      UN_Code: row.UN_Code || null,
      Load_Type: row.Load_Type || null,
      Packing_Group: row.Packing_Group || null,
      Label: row.Label || null,
      Special_Provision: row.Special_Provision || null,
      Hazard_ID_Number: row.Hazard_ID_Number || null,

      // =========================
      // Environment / Hazard
      // =========================
      Environmentally_Hazardous:
        row.Environmentally_Hazardous === "Yes" ? "Yes" : "No",

      Last_Loaded_Commodity:
        row.Last_Loaded_Commodity || null,

      // =========================
      // Container / Country
      // =========================
      Container_No: row.Container_No || null,
      Container_Type: row.Container_Type || null,

      From_Country: row.From_Country || null,
      To_Country: row.To_Country || null,

      Commodity_Description:
        row.Commodity_Description || null,

      Container_load_type:
        row.Container_load_type || null,

      // =========================
      // UN Descriptions
      // =========================
      UN_Desc_English: row.UN_Desc_English || null,
      UN_Desc_French: row.UN_Desc_French || null,
      UN_Desc_German: row.UN_Desc_German || null,
      UN_Desc_Other_Language:
        row.UN_Desc_Other_Language || null,

      UN_Desc_English_Check:
        toBit(row.UN_Desc_English_Check),
      UN_Desc_French_Check:
        toBit(row.UN_Desc_French_Check),
      UN_Desc_German_Check:
        toBit(row.UN_Desc_German_Check),
      UN_Desc_Other_Language_Check:
        toBit(row.UN_Desc_Other_Language_Check),

      // =========================
      // Flags
      // =========================
      RID: toBit(row.RID),

      ModeFlag: row.ModeFlag || "NoChange",
    }))
    // ❗ remove empty rows
    .filter(row =>
      row.WagonNo &&
      (
        row.Gross_Weight !== null ||
        row.Net_Weight_Commodity_Qty !== null ||
        row.Mass_Weight !== null
      )
    );


      // const sanitizeWagonLineDetails = (wagonGritDetails: any[]) =>
      // wagonGritDetails
      //   .map(row => ({
      //     WagonNo: row.WagonNo || "",
    
      //     No_of_Axle: toNumberOrNull(row.No_of_Axle),
      //     NHM: toNumberOrNull(row.NHM),
    
      //     Mass_Weight: toNumberOrNull(row.Mass_Weight),
      //     Mass_Weight_UOM: row.Mass_Weight_UOM || null,
    
      //     Tare_Weight: toNumberOrNull(row.Tare_Weight),
      //     Tare_Weight_UOM: row.Tare_Weight_UOM || null,
    
      //     Brut_Weight: toNumberOrNull(row.Brut_Weight),
      //     Brut_Weight_UOM: row.Brut_Weight_UOM || null,
    
      //     Gross_Weight: toNumberOrNull(row.Gross_Weight),
      //     Gross_weight_UOM: row.Gross_weight_UOM || null,
    
      //     Net_Weight_Commodity_Qty: toNumberOrNull(row.Net_Weight_Commodity_Qty),
      //     Net_Weight_Commodity_Qty_UOM: row.Net_Weight_Commodity_Qty_UOM || null,
    
      //     Wagon_Length: toNumberOrNull(row.Wagon_Length),
      //     Wagon_Length_UOM: row.Wagon_Length_UOM || null,
    
      //     Container_Tare_Weight: toNumberOrNull(row.Container_Tare_Weight),
      //     Container_Tare_Weight_2: toNumberOrNull(row.Container_Tare_Weight_2),
      //     Container_load_weight: toNumberOrNull(row.Container_load_weight),
    
      //     Total_Mass: toNumberOrNull(row.Total_Mass),
      //     Total_Brutt: toNumberOrNull(row.Total_Brutt),
      //     Total_Tare: toNumberOrNull(row.Total_Tare),
    
      //     Environmentally_Hazardous:
      //       row.Environmentally_Hazardous === "Yes" ? "Yes" : "No",
    
      //     UN_Desc_English_Check: toBit(row.UN_Desc_English_Check),
      //     UN_Desc_French_Check: toBit(row.UN_Desc_French_Check),
      //     UN_Desc_German_Check: toBit(row.UN_Desc_German_Check),
      //     UN_Desc_Other_Language_Check: toBit(row.UN_Desc_Other_Language_Check),
    
      //     RID: toBit(row.RID),
    
      //     ModeFlag: row.ModeFlag || "NoChange",
      //   }))
      //   // ❗ remove empty rows so API does not fail
      //   .filter(row =>
      //     row.WagonNo ||
      //     row.NHM ||
      //     row.No_of_Axle ||
      //     row.Gross_Weight ||
      //     row.Net_Weight_Commodity_Qty
      //   );

  const handleSaveReport = async () => {
    if (workOrderNo && !initialSnapshotRef.current) return;

    const headerFV = headerTemplateRef.current.getFormValues();
    const generalFV = generalDetailsRef.current.getFormValues();
    const paymentFV = paymentInstructionRef.current.getFormValues();
    const placeDateFV = placeAndDateRef.current.getFormValues();
    const consignorFV = consignorDeclarationsRef.current.getFormValues();
    const valueDeliveryFV = valueDeliveryCashRef.current.getFormValues();
    const codingFV = codingBoxesRef.current.getFormValues();
    const examFV = examinationDetailsRef.current.getFormValues();
    const secAFV = sectionARef.current.getFormValues();
    const secBFV = sectionBRef.current.getFormValues();
    const secCFV = sectionCRef.current.getFormValues();
    const routeFV = RouteDetailsRef.current.getFormValues();
    const routeEndFV = RouteEndorsementDetailsRef.current.getFormValues();
    const wagonFormData = WagonDetailsRef.current.getFormValues();

    const wagonInfoModeFlag = resolveModeFlag(
      wagonFormData,
      initialSnapshotRef.current?.WagonInfodetails,
      workOrderNo
    );

    const sanitizedWagonLines = wagonGritDetails.map((row) => ({
      ...row,
      No_of_Axle: toNumberOrNull(row.No_of_Axle),
      NHM: toNumberOrNull(row.NHM),
      Mass_Weight: toNumberOrNull(row.Mass_Weight),
      Tare_Weight: toNumberOrNull(row.Tare_Weight),
      Brut_Weight: toNumberOrNull(row.Brut_Weight),
      Total_Mass: toNumberOrNull(row.Total_Mass),
      Total_Brutt: toNumberOrNull(row.Total_Brutt),
      Total_Tare: toNumberOrNull(row.Total_Tare),
      RID: toBit(row.RID),
    }));

    const payload = {
      Header: {
        ...mapFormToHeaderPayload(headerFV),
        ModeFlag: resolveModeFlag(
          headerFV,
          initialSnapshotRef.current?.header,
          workOrderNo
        ),
      },

      General: {
        Details: {
          ...mapFormToGeneralDetailsPayload(generalFV),
          ModeFlag: resolveModeFlag(
            generalFV,
            initialSnapshotRef.current?.general,
            workOrderNo
          ),
        },

        PaymentInstruction: {
          ...mapFormToPaymentInstructionPayload(paymentFV, placeDateFV),
          ModeFlag: resolveModeFlag(
            paymentFV,
            initialSnapshotRef.current?.payment,
            workOrderNo
          ),
        },
      },

      Declarations: {
        ...mapFormToConsignorDeclarationsPayload(consignorFV),
        ...mapFormToValueDeliveryCashPayload(valueDeliveryFV),
        ...mapFormToCodingBoxesPayload(codingFV),
        ...mapFormToExaminationDetailsPayload(examFV),
        ModeFlag: resolveModeFlag(
          {
            ...consignorFV,
            ...valueDeliveryFV,
            ...codingFV,
            ...examFV,
          },
          initialSnapshotRef.current?.declarations,
          workOrderNo
        ),

        SectionA: {
          ...mapFormToSectionAPayload(secAFV),
          ModeFlag: resolveModeFlag(
            secAFV,
            initialSnapshotRef.current?.sectionA,
            workOrderNo
          ),
        },

        SectionB: {
          ...mapFormToSectionBPayload(secBFV),
          ModeFlag: resolveModeFlag(
            secBFV,
            initialSnapshotRef.current?.sectionB,
            workOrderNo
          ),
        },

        SectionC: {
          ...mapFormToSectionCPayload(secCFV),
          ModeFlag: resolveModeFlag(
            secCFV,
            initialSnapshotRef.current?.sectionC,
            workOrderNo
          ),
        },
      },

      RouteDetails: {
        ...mapFormToRouteEndorsementPayload(routeEndFV),
        ModeFlag: resolveModeFlag(
          routeEndFV,
          initialSnapshotRef.current?.routeEndorsement,
          workOrderNo
        ),
        //loading grid data
          Route: mapRouteCodeCDetailsPayload(routeCodeCDetails),
          OtherCarriers_57: mapOtherCarriersPayload(otherCarriers),
      },

      ConsignmentDetails: {
        ...mapFormToRoutePayload(routeFV),
        ModeFlag: resolveModeFlag(
          routeFV,
          initialSnapshotRef.current?.route,
          workOrderNo
        ),
      },

      WagonInfodetails: mapFormToWagonInfoDetails(
        wagonFormData,
        wagonInfoModeFlag
      ),

      WagonLineDetails: sanitizeWagonLineDetails(wagonGritDetails),
    };

    console.log("pYLOAD", JSON.stringify(payload, null, 2));
    try {
      console.log(" Sending payload to save template...");
      const response = await CimCuvService.saveCimCuvReport(payload);
      console.log("✅ SAVE TEMPLATE RESPONSE", response);
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      // const data = parsedResponse;
      const resourceStatus = (response as any)?.data?.IsSuccess;
      console.log("parsedResponse ====", parsedResponse);
      if (resourceStatus) {
        console.log("Template saved successfully");
        toast({
          title: "✅ Template Saved Successfully",
          description:
            (response as any)?.data?.ResponseData?.Message ||
            "Your changes have been saved.",
          variant: "default",
        });

        if (!workOrderNo) {
          setSearchParams({ id: parsedResponse?.Header?.TemplateID });
          fetchTemplateData(parsedResponse?.Header?.TemplateID);
        } else {
          fetchTemplateData(workOrderNo);
        }
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Save Failed",
          description:
            (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ SAVE TEMPLATE FAILED", error);
      toast({
        title: "⚠️ Save Failed",
        description:
          "An error occurred while saving the template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (workOrderNo && !initialSnapshotRef.current) return;

    const headerFV = headerTemplateRef.current.getFormValues();
    const generalFV = generalDetailsRef.current.getFormValues();
    const paymentFV = paymentInstructionRef.current.getFormValues();
    const placeDateFV = placeAndDateRef.current.getFormValues();
    const consignorFV = consignorDeclarationsRef.current.getFormValues();
    const valueDeliveryFV = valueDeliveryCashRef.current.getFormValues();
    const codingFV = codingBoxesRef.current.getFormValues();
    const examFV = examinationDetailsRef.current.getFormValues();
    const secAFV = sectionARef.current.getFormValues();
    const secBFV = sectionBRef.current.getFormValues();
    const secCFV = sectionCRef.current.getFormValues();
    const routeFV = RouteDetailsRef.current.getFormValues();
    const routeEndFV = RouteEndorsementDetailsRef.current.getFormValues();
    const wagonFormData = WagonDetailsRef.current.getFormValues();

    const wagonInfoModeFlag = resolveModeFlag(
      wagonFormData,
      initialSnapshotRef.current?.WagonInfodetails,
      workOrderNo
    );

    const sanitizedWagonLines = wagonGritDetails.map((row) => ({
      ...row,
      No_of_Axle: toNumberOrNull(row.No_of_Axle),
      NHM: toNumberOrNull(row.NHM),
      Mass_Weight: toNumberOrNull(row.Mass_Weight),
      Tare_Weight: toNumberOrNull(row.Tare_Weight),
      Brut_Weight: toNumberOrNull(row.Brut_Weight),
      Total_Mass: toNumberOrNull(row.Total_Mass),
      Total_Brutt: toNumberOrNull(row.Total_Brutt),
      Total_Tare: toNumberOrNull(row.Total_Tare),
      RID: toBit(row.RID),
    }));

    const payload = {
      Header: {
        ...mapFormToHeaderPayload(headerFV),
        ModeFlag: resolveModeFlag(
          headerFV,
          initialSnapshotRef.current?.header,
          workOrderNo
        ),
      },

      General: {
        Details: {
          ...mapFormToGeneralDetailsPayload(generalFV),
          ModeFlag: resolveModeFlag(
            generalFV,
            initialSnapshotRef.current?.general,
            workOrderNo
          ),
        },

        PaymentInstruction: {
          ...mapFormToPaymentInstructionPayload(paymentFV, placeDateFV),
          ModeFlag: resolveModeFlag(
            paymentFV,
            initialSnapshotRef.current?.payment,
            workOrderNo
          ),
        },
      },

      Declarations: {
        ...mapFormToConsignorDeclarationsPayload(consignorFV),
        ...mapFormToValueDeliveryCashPayload(valueDeliveryFV),
        ...mapFormToCodingBoxesPayload(codingFV),
        ...mapFormToExaminationDetailsPayload(examFV),
        ModeFlag: resolveModeFlag(
          {
            ...consignorFV,
            ...valueDeliveryFV,
            ...codingFV,
            ...examFV,
          },
          initialSnapshotRef.current?.declarations,
          workOrderNo
        ),

        SectionA: {
          ...mapFormToSectionAPayload(secAFV),
          ModeFlag: resolveModeFlag(
            secAFV,
            initialSnapshotRef.current?.sectionA,
            workOrderNo
          ),
        },

        SectionB: {
          ...mapFormToSectionBPayload(secBFV),
          ModeFlag: resolveModeFlag(
            secBFV,
            initialSnapshotRef.current?.sectionB,
            workOrderNo
          ),
        },

        SectionC: {
          ...mapFormToSectionCPayload(secCFV),
          ModeFlag: resolveModeFlag(
            secCFV,
            initialSnapshotRef.current?.sectionC,
            workOrderNo
          ),
        },
      },

      RouteDetails: {
        ...mapFormToRouteEndorsementPayload(routeEndFV),
        ModeFlag: resolveModeFlag(
          routeEndFV,
          initialSnapshotRef.current?.routeEndorsement,
          workOrderNo
        ),
        //loading grid data
          Route: mapRouteCodeCDetailsPayload(routeCodeCDetails),
          OtherCarriers_57: mapOtherCarriersPayload(otherCarriers),
      },

      ConsignmentDetails: {
        ...mapFormToRoutePayload(routeFV),
        ModeFlag: resolveModeFlag(
          routeFV,
          initialSnapshotRef.current?.route,
          workOrderNo
        ),
      },

      WagonInfodetails: mapFormToWagonInfoDetails(
        wagonFormData,
        wagonInfoModeFlag
      ),

      WagonLineDetails: sanitizeWagonLineDetails(wagonGritDetails),
    };

    console.log("pYLOAD", JSON.stringify(payload, null, 2));
    try {
      console.log(" Sending payload to save template...");
      const response = await CimCuvService.updateCimCuvReport(payload);
      console.log("✅ SAVE TEMPLATE RESPONSE", response);
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      // const data = parsedResponse;
      const resourceStatus = (response as any)?.data?.IsSuccess;
      console.log("parsedResponse ====", parsedResponse);
      if (resourceStatus) {
        console.log("Template updated successfully");
        toast({
          title: "✅ Template Updated Successfully",
          description:
            (response as any)?.data?.ResponseData?.Message ||
            "Your changes have been saved.",
          variant: "default",
        });

        if (!workOrderNo) {
          setSearchParams({ id: parsedResponse?.Header?.TemplateID });
          fetchTemplateData(parsedResponse?.Header?.TemplateID);
        } else {
          fetchTemplateData(workOrderNo);
        }
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Update Failed",
          description:
            (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ UPDATE TEMPLATE FAILED", error);
      toast({
        title: "⚠️ Update Failed",
        description:
          "An error occurred while updating the template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmReport = async () => {
    if (workOrderNo && !initialSnapshotRef.current) return;

    const headerFV = headerTemplateRef.current.getFormValues();
    const generalFV = generalDetailsRef.current.getFormValues();
    const paymentFV = paymentInstructionRef.current.getFormValues();
    const placeDateFV = placeAndDateRef.current.getFormValues();
    const consignorFV = consignorDeclarationsRef.current.getFormValues();
    const valueDeliveryFV = valueDeliveryCashRef.current.getFormValues();
    const codingFV = codingBoxesRef.current.getFormValues();
    const examFV = examinationDetailsRef.current.getFormValues();
    const secAFV = sectionARef.current.getFormValues();
    const secBFV = sectionBRef.current.getFormValues();
    const secCFV = sectionCRef.current.getFormValues();
    const routeFV = RouteDetailsRef.current.getFormValues();
    const routeEndFV = RouteEndorsementDetailsRef.current.getFormValues();
    const wagonFormData = WagonDetailsRef.current.getFormValues();

    const wagonInfoModeFlag = resolveModeFlag(
      wagonFormData,
      initialSnapshotRef.current?.WagonInfodetails,
      workOrderNo
    );

    const sanitizedWagonLines = wagonGritDetails.map((row) => ({
      ...row,
      No_of_Axle: toNumberOrNull(row.No_of_Axle),
      NHM: toNumberOrNull(row.NHM),
      Mass_Weight: toNumberOrNull(row.Mass_Weight),
      Tare_Weight: toNumberOrNull(row.Tare_Weight),
      Brut_Weight: toNumberOrNull(row.Brut_Weight),
      Total_Mass: toNumberOrNull(row.Total_Mass),
      Total_Brutt: toNumberOrNull(row.Total_Brutt),
      Total_Tare: toNumberOrNull(row.Total_Tare),
      RID: toBit(row.RID),
    }));

    const payload = {
      Header: {
        ...mapFormToHeaderPayload(headerFV),
        ModeFlag: resolveModeFlag(
          headerFV,
          initialSnapshotRef.current?.header,
          workOrderNo
        ),
      },

      General: {
        Details: {
          ...mapFormToGeneralDetailsPayload(generalFV),
          ModeFlag: resolveModeFlag(
            generalFV,
            initialSnapshotRef.current?.general,
            workOrderNo
          ),
        },

        PaymentInstruction: {
          ...mapFormToPaymentInstructionPayload(paymentFV, placeDateFV),
          ModeFlag: resolveModeFlag(
            paymentFV,
            initialSnapshotRef.current?.payment,
            workOrderNo
          ),
        },
      },

      Declarations: {
        ...mapFormToConsignorDeclarationsPayload(consignorFV),
        ...mapFormToValueDeliveryCashPayload(valueDeliveryFV),
        ...mapFormToCodingBoxesPayload(codingFV),
        ...mapFormToExaminationDetailsPayload(examFV),
        ModeFlag: resolveModeFlag(
          {
            ...consignorFV,
            ...valueDeliveryFV,
            ...codingFV,
            ...examFV,
          },
          initialSnapshotRef.current?.declarations,
          workOrderNo
        ),

        SectionA: {
          ...mapFormToSectionAPayload(secAFV),
          ModeFlag: resolveModeFlag(
            secAFV,
            initialSnapshotRef.current?.sectionA,
            workOrderNo
          ),
        },

        SectionB: {
          ...mapFormToSectionBPayload(secBFV),
          ModeFlag: resolveModeFlag(
            secBFV,
            initialSnapshotRef.current?.sectionB,
            workOrderNo
          ),
        },

        SectionC: {
          ...mapFormToSectionCPayload(secCFV),
          ModeFlag: resolveModeFlag(
            secCFV,
            initialSnapshotRef.current?.sectionC,
            workOrderNo
          ),
        },
      },

      RouteDetails: {
        ...mapFormToRouteEndorsementPayload(routeEndFV),
        ModeFlag: resolveModeFlag(
          routeEndFV,
          initialSnapshotRef.current?.routeEndorsement,
          workOrderNo
        ),
        //loading grid data
          Route: mapRouteCodeCDetailsPayload(routeCodeCDetails),
          OtherCarriers_57: mapOtherCarriersPayload(otherCarriers),
      },

      ConsignmentDetails: {
        ...mapFormToRoutePayload(routeFV),
        ModeFlag: resolveModeFlag(
          routeFV,
          initialSnapshotRef.current?.route,
          workOrderNo
        ),
      },

      WagonInfodetails: mapFormToWagonInfoDetails(
        wagonFormData,
        wagonInfoModeFlag
      ),

      WagonLineDetails: sanitizeWagonLineDetails(wagonGritDetails),
    };

    console.log("pYLOAD", JSON.stringify(payload, null, 2));
    try {
      console.log(" Sending payload to confirm report...");
      const response = await CimCuvService.confirmCimCuvReport(payload);
      console.log("✅ CONFIRM TEMPLATE RESPONSE", response);
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      // const data = parsedResponse;
      const resourceStatus = (response as any)?.data?.IsSuccess;
      console.log("parsedResponse ====", parsedResponse);
      if (resourceStatus) {
        console.log("Report confirmed successfully");
        toast({
          title: "✅ Report Confirmed Successfully",
          description:
            (response as any)?.data?.ResponseData?.Message ||
            "Your changes have been saved.",
          variant: "default",
        });

        if (!workOrderNo) {
          setSearchParams({ id: parsedResponse?.Header?.TemplateID });
          fetchTemplateData(parsedResponse?.Header?.TemplateID);
        } else {
          fetchTemplateData(workOrderNo);
        }
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Confirm Failed",
          description:
            (response as any)?.data?.Message || "Failed to confirm changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ CONFIRM TEMPLATE FAILED", error);
      toast({
        title: "⚠️ Confirm Failed",
        description:
          "An error occurred while confirming the template. Please try again.",
        variant: "destructive",
      });
    }
  };

//   const handleAmendReport = async () => {
//     if (workOrderNo && !initialSnapshotRef.current) return;

//     const headerFV = headerTemplateRef.current.getFormValues();
//     const generalFV = generalDetailsRef.current.getFormValues();
//     const paymentFV = paymentInstructionRef.current.getFormValues();
//     const placeDateFV = placeAndDateRef.current.getFormValues();
//     const consignorFV = consignorDeclarationsRef.current.getFormValues();
//     const valueDeliveryFV = valueDeliveryCashRef.current.getFormValues();
//     const codingFV = codingBoxesRef.current.getFormValues();
//     const examFV = examinationDetailsRef.current.getFormValues();
//     const secAFV = sectionARef.current.getFormValues();
//     const secBFV = sectionBRef.current.getFormValues();
//     const secCFV = sectionCRef.current.getFormValues();
//     const routeFV = RouteDetailsRef.current.getFormValues();
//     const routeEndFV = RouteEndorsementDetailsRef.current.getFormValues();
//     const wagonFormData = WagonDetailsRef.current.getFormValues();

//     const wagonInfoModeFlag = resolveModeFlag(
//       wagonFormData,
//       initialSnapshotRef.current?.WagonInfodetails,
//       workOrderNo
//     );

//     const sanitizedWagonLines = wagonGritDetails.map((row) => ({
//       ...row,
//       No_of_Axle: toNumberOrNull(row.No_of_Axle),
//       NHM: toNumberOrNull(row.NHM),
//       Mass_Weight: toNumberOrNull(row.Mass_Weight),
//       Tare_Weight: toNumberOrNull(row.Tare_Weight),
//       Brut_Weight: toNumberOrNull(row.Brut_Weight),
//       Total_Mass: toNumberOrNull(row.Total_Mass),
//       Total_Brutt: toNumberOrNull(row.Total_Brutt),
//       Total_Tare: toNumberOrNull(row.Total_Tare),
//       RID: toBit(row.RID),
//     }));

//     const payload = {
//       Header: {
//         ...mapFormToHeaderPayload(headerFV),
//         ModeFlag: resolveModeFlag(
//           headerFV,
//           initialSnapshotRef.current?.header,
//           workOrderNo
//         ),
//       },

//       General: {
//         Details: {
//           ...mapFormToGeneralDetailsPayload(generalFV),
//           ModeFlag: resolveModeFlag(
//             generalFV,
//             initialSnapshotRef.current?.general,
//             workOrderNo
//           ),
//         },

//         PaymentInstruction: {
//           ...mapFormToPaymentInstructionPayload(paymentFV, placeDateFV),
//           ModeFlag: resolveModeFlag(
//             paymentFV,
//             initialSnapshotRef.current?.payment,
//             workOrderNo
//           ),
//         },
//       },

//       Declarations: {
//         ...mapFormToConsignorDeclarationsPayload(consignorFV),
//         ...mapFormToValueDeliveryCashPayload(valueDeliveryFV),
//         ...mapFormToCodingBoxesPayload(codingFV),
//         ...mapFormToExaminationDetailsPayload(examFV),
//         ModeFlag: resolveModeFlag(
//           {
//             ...consignorFV,
//             ...valueDeliveryFV,
//             ...codingFV,
//             ...examFV,
//           },
//           initialSnapshotRef.current?.declarations,
//           workOrderNo
//         ),

//         SectionA: {
//           ...mapFormToSectionAPayload(secAFV),
//           ModeFlag: resolveModeFlag(
//             secAFV,
//             initialSnapshotRef.current?.sectionA,
//             workOrderNo
//           ),
//         },

//         SectionB: {
//           ...mapFormToSectionBPayload(secBFV),
//           ModeFlag: resolveModeFlag(
//             secBFV,
//             initialSnapshotRef.current?.sectionB,
//             workOrderNo
//           ),
//         },

//         SectionC: {
//           ...mapFormToSectionCPayload(secCFV),
//           ModeFlag: resolveModeFlag(
//             secCFV,
//             initialSnapshotRef.current?.sectionC,
//             workOrderNo
//           ),
//         },
//       },

//       RouteDetails: {
//         ...mapFormToRouteEndorsementPayload(routeEndFV),
//         ModeFlag: resolveModeFlag(
//           routeEndFV,
//           initialSnapshotRef.current?.routeEndorsement,
//           workOrderNo
//         ),
//         //loading grid data
//           Route: mapRouteCodeCDetailsPayload(routeCodeCDetails),
//           OtherCarriers_57: mapOtherCarriersPayload(otherCarriers),
//       },

//       ConsignmentDetails: {
//         ...mapFormToRoutePayload(routeFV),
//         ModeFlag: resolveModeFlag(
//           routeFV,
//           initialSnapshotRef.current?.route,
//           workOrderNo
//         ),
//       },

//       WagonInfodetails: mapFormToWagonInfoDetails(
//         wagonFormData,
//         wagonInfoModeFlag
//       ),

//       WagonLineDetails: sanitizeWagonLineDetails(wagonGritDetails),
//     };

//     console.log("pYLOAD", JSON.stringify(payload, null, 2));
//     try {
//       console.log(" Sending payload to save template...");
//       const response = await CimCuvService.amendCimCuvReport(payload);
//       console.log("✅ SAVE TEMPLATE RESPONSE", response);
//       const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
//       // const data = parsedResponse;
//       const resourceStatus = (response as any)?.data?.IsSuccess;
//       console.log("parsedResponse ====", parsedResponse);
//       if (resourceStatus) {
//         console.log("Template saved successfully");
//         toast({
//           title: "✅ Template Saved Successfully",
//           description:
//             (response as any)?.data?.ResponseData?.Message ||
//             "Your changes have been saved.",
//           variant: "default",
//         });

//         if (!workOrderNo) {
//           setSearchParams({ id: parsedResponse?.Header?.TemplateID });
//           fetchTemplateData(parsedResponse?.Header?.TemplateID);
//         } else {
//           fetchTemplateData(workOrderNo);
//         }
//       } else {
//         console.log("error as any ===", (response as any)?.data?.Message);
//         toast({
//           title: "⚠️ Save Failed",
//           description:
//             (response as any)?.data?.Message || "Failed to save changes.",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       console.error("❌ SAVE TEMPLATE FAILED", error);
//       toast({
//         title: "⚠️ Save Failed",
//         description:
//           "An error occurred while saving the template. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

  const handleConsignorConsigneeSave = async (data: any) => {
    console.log("Consignor/Consignee data saved:", data);
    console.log("Consignor/Consignee data saved:", apiResponse);
    console.log("Consignor/Consignee data saved:", initialApiResponse);
    setConsignorConsigneeData(data);

    // Determine ModeFlag for Consignor and Consignee
    // console.log("entryModeFlag ===", apiResponse?.Header?.TemplateID);
    // const entryModeFlag =
    //   apiResponse?.Header?.TemplateID === null ||
    //   apiResponse?.Header?.TemplateID === undefined
    //     ? "Insert"
    //     : "Update";
    // console.log("entryModeFlag ===", entryModeFlag);
    // Construct Header Payload
    const headerFV = headerTemplateRef.current?.getFormValues();
    const headerPayload = {
      TemplateID:
        apiResponse?.Header?.TemplateID || headerFV?.templateId || null,
      Description:
        apiResponse?.Header?.Description ||
        headerFV?.templateDescription ||
        null,
      DocType: apiResponse?.Header?.DocType || headerFV?.templateType || null,
      ModeFlag: "NoChange", // As per requirement, header ModeFlag is NoChange here
    };

    const consigneePayload = {
      ConsigneeID: data.consigneeId || null,
      ConsigneeDescription: data.consigneeName || null,
      AddressLine1: data.addressLine1 || null,
      AddressLine2: data.addressLine2 || null,
      SubHurb: data.suburb || null,
      Pincode: data.pincode || null,
      Zone: data.zone || null,
      SubZone: data.subZone || null,
      City: data.city || null,
      State: data.state || null,
      Country: data.country || null,
      Region: data.region || null,
      ContactPerson: data.contactPerson || null,
      PhoneNo: data.phoneNumber || null,
      EmailID: data.emailId || null,
      ModeFlag: "Insert",
    };

    const consignorPayload = {
      ConsignorID: data.consignorId || null,
      ConsignorDescription: data.consignorName || null,
      AddressLine1: data.addressLine1 || null,
      AddressLine2: data.addressLine2 || null,
      SubHurb: data.suburb || null,
      Pincode: data.pincode || null,
      Zone: data.zone || null,
      SubZone: data.subZone || null,
      City: data.city || null,
      State: data.state || null,
      Country: data.country || null,
      Region: data.region || null,
      ContactPerson: data.contactPerson || null,
      PhoneNo: data.phoneNumber || null,
      EmailID: data.emailId || null,
      ModeFlag: "Insert",
    };

    const finalPayload = {
      Header: headerPayload,
      Consignee: consigneePayload,
      Consignor: consignorPayload,
    };

    console.log(
      "✅ FINAL CONSIGNOR/CONSIGNEE PAYLOAD",
      JSON.stringify(finalPayload, null, 2)
    );

    try {
        const response = await CimCuvService.saveReportConsignorConsignee(finalPayload);
        console.log("Consignor/Consignee save response:", response);
        const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
        // const data = parsedResponse;
        const resourceStatus = (response as any)?.data?.IsSuccess;
        console.log("parsedResponse ====", parsedResponse);
        if (resourceStatus) {
          if (parsedResponse?.Consignor?.ConsignorID && parsedResponse?.Consignor?.ConsignorDescription) {
            generalDetailsRef.current?.setFormValues({
                consignor: parsedResponse.Consignor.ConsignorID,
                consignorDescription: parsedResponse.Consignor.ConsignorDescription,
            });
          }
          if (parsedResponse?.Consignee?.ConsigneeID && parsedResponse?.Consignee?.ConsigneeDescription) {
              generalDetailsRef.current?.setFormValues({
                  consignee: parsedResponse.Consignee.ConsigneeID,
                  consigneeDescription: parsedResponse.Consignee.ConsigneeDescription,
              });
          }
          console.log("Consignor/Consignee saved successfully");
          toast({
            title: "✅ Consignor/Consignee Saved Successfully",
            description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
            variant: "default",
          });
          setIsConsignorConsigneeSideDrawOpen(false);
        } else {
          console.log("error as any ===", (response as any)?.data?.Message);
          toast({
            title: "⚠️ Consignor/Consignee Save Failed",
            description: (response as any)?.data?.Message || "Failed to save changes.",
            variant: "destructive",
          });
  
        }
        // Optionally, handle success or display a message
      } catch (error) {
        console.error("Error saving Consignor/Consignee data:", error);
        // Optionally, handle error or display an error message
      }
  };

  const handleConfirmCancel = async (
    reasonCode: string,
    reasonDescription: string
  ) => {
    console.log("Cancel confirmed with:", { reasonCode, reasonDescription });
    console.log("Cancel confirmed with:", apiResponse);
    try {
      const payload = {
        Header: {
            ...apiResponse?.Header,
            ReasonCode: splitIdName(reasonCode).id,
            ReasonDescription: reasonDescription,
            ModeFlag: "Update",
        //   "TemplateID": apiResponse?.Header?.TemplateID,
        //   "Description": apiResponse?.Header?.Description,
        //   "DocType": apiResponse?.Header?.DocType,
        //   "ReasonCode": reasonCode,
        //   "ReasonDescription": reasonDescription,
        //   "ModeFlag": "NoChange"
        }
      };
      console.log("payload ===", payload);
      const response = await CimCuvService.cancelCimCuvReport(payload);
      console.log("Cancel API response:", response);
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const resourceStatus = (response as any)?.data?.IsSuccess;
      console.log("parsedResponse ====", parsedResponse);
      if (resourceStatus) {
        console.log("Template cancelled successfully");
        toast({
          title: "✅ Template Cancelled Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been cancelled.",
          variant: "default",
        });
        setIsCancelModalOpen(false);
        fetchTemplateData(parsedResponse?.CIMCUVNo);
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
      console.error("Error canceling template/report:", error);
      // Optionally, handle error or display an error message
    }
    // setIsCancelModalOpen(false);
  };

  const handleSaveDraftBillDetails = (payload: { updatedLineItems: any[] }) => {
    console.log("Draft Bill Details Saved:", payload);
    // Update the apiResponse with the new lineItems
    setApiResponse((prev: any) => ({ ...prev, LineItems: payload.updatedLineItems }));
    setIsDraftBillDetailsSideDraw(false);
  };

  const handleConfirmAmend = async (
    reasonCode: string,
    reasonDescription: string
  ) => {
    console.log("Cancel confirmed with:", { reasonCode, reasonDescription });
    console.log("Cancel confirmed with:", apiResponse);
    try {
      const payload = {
        Header: {
            ...apiResponse?.Header,
            ReasonCode: splitIdName(reasonCode).id,
            ReasonDescription: reasonDescription,
            ModeFlag: "Update",
        //   "TemplateID": apiResponse?.Header?.TemplateID,
        //   "Description": apiResponse?.Header?.Description,
        //   "DocType": apiResponse?.Header?.DocType,
        //   "ReasonCode": reasonCode,
        //   "ReasonDescription": reasonDescription,
        //   "ModeFlag": "NoChange"
        }
      };
      console.log("payload ===", payload);
      const response = await CimCuvService.amendCimCuvReport(payload);
      console.log("Cancel API response:", response);
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const resourceStatus = (response as any)?.data?.IsSuccess;
      console.log("parsedResponse ====", parsedResponse);
      if (resourceStatus) {
        console.log("Report amended successfully");
        toast({
          title: "✅ Report Amended Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been amended.",
          variant: "default",
        });
        setIsAmendModalOpen(false);
        fetchTemplateData(parsedResponse?.CIMCUVNo);
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Amend Failed",
          description: (response as any)?.data?.Message || "Failed to amend changes.",
          variant: "destructive",
        });
      }
      // Optionally, handle success or display a message
    } catch (error) {
      console.error("Error canceling template/report:", error);
      // Optionally, handle error or display an error message
    }
    // setIsCancelModalOpen(false);
  };

  return (
    <>
      <div className="main-content-h bg-gray-100">
        <div className="mt-6">
          <div className="">
            {/* <DynamicPanel
              ref={headerTemplateRef} // New Panel
              panelId="header-template"
              panelOrder={0} // Render before general details
              panelTitle="Template"
              panelConfig={headerTemplateConfig} // New Config
              formName="headerTemplateForm"
              initialData={headerTemplateData}
              // onDataChange={handleHeaderTemplateDataChange}
              panelWidth="full"
              collapsible={true} // Added collapsible prop
              showHeader={false} // Hide header to match screenshot
            /> */}
            <DynamicPanel
              ref={headerTemplateRef} // New Panel
              panelId="header-template"
              panelOrder={0} // Render before general details
              panelTitle="Template"
              panelSubTitle="Templated"
              templateNumber={cimCuvNo}
              panelConfig={headerTemplateConfig} // New Config
              formName="headerTemplateForm"
              initialData={headerTemplateData}
              reportStatus={apiResponse?.Header?.Status || ''}
              templateNumberCallback={handleTemplateNumberCallback}
              // onDataChange={handleHeaderTemplateDataChange}
              panelWidth="full"
              // collapsible={true} // Added collapsible prop
              // showHeader={false} // Hide header to match screenshot
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mb-12"
          >
            <TabsList className="grid w-2/6 grid-cols-4 bg-gray-100 border border-gray-200 rounded-md p-0">
              <TabsTrigger
                value="general"
                className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === "general"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="declarations"
                className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === "declarations"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Declarations
              </TabsTrigger>
              <TabsTrigger
                value="route"
                className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === "route"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Route
              </TabsTrigger>
              <TabsTrigger
                value="wagon-info"
                className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === "wagon-info"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Wagon Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6" forceMount>
              <div className="">
                <div className="">
                  <div className="">
                    {/* 32 */}
                    <DynamicPanel
                      ref={generalDetailsRef}
                      panelId="general-details"
                      panelOrder={1}
                      panelTitle="General Details"
                      panelIcon={<FileText className="w-5 h-5 text-blue-500" />}
                      panelConfig={generalDetailsConfig}
                      formName="generalDetailsForm"
                      //  initialData={undefined}
                      initialData={generalDetailsData}
                      // onDataChange={handleGeneralDataChange}
                      panelWidth="full"
                      collapsible={true} // Added collapsible prop
                    />
                    <div
                      className="flex justify-start mb-6 bg-white py-3 px-4 border-t border-gray-200"
                      style={{ marginTop: "-25px" }}
                    >
                      <Button
                        onClick={() =>
                          setIsConsignorConsigneeSideDrawOpen(true)
                        }
                        className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Consignor/Consignee
                      </Button>
                    </div>
                  </div>

                  {/* New Payment Instruction Panel */}
                  <DynamicPanel
                    ref={paymentInstructionRef}
                    panelId="payment-instruction"
                    panelOrder={2}
                    panelTitle="Payment Instruction [20]"
                    panelConfig={paymentInstructionConfig}
                    formName="paymentInstructionForm"
                    initialData={paymentInstructionData}
                    // onDataChange={handlePaymentInstructionDataChange}
                    panelWidth="full"
                    collapsible={true} // Added collapsible prop
                  />

                  {/* New Place and Date Made Out Panel */}
                  <DynamicPanel
                    ref={placeAndDateRef}
                    panelId="place-and-date"
                    panelOrder={3}
                    panelTitle="Place and Date Made Out [29]"
                    panelConfig={placeAndDateConfig}
                    formName="placeAndDateForm"
                    initialData={placeAndDateData}
                    // onDataChange={handlePlaceAndDateDataChange}
                    panelWidth="full"
                    collapsible={true} // Added collapsible prop
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="declarations" className="mt-6" forceMount>
              <div className="">
                <DynamicPanel
                  ref={consignorDeclarationsRef}
                  panelId="consignor-declarations"
                  panelOrder={1}
                  panelTitle="Declarations and Information"
                  panelConfig={consignorDeclarationsConfig}
                  formName="consignorDeclarationsForm"
                  initialData={consignorDeclarationsData}
                  panelWidth="full"
                  collapsible={true}
                />
                <DynamicPanel
                  ref={valueDeliveryCashRef}
                  panelId="value-delivery-cash"
                  panelOrder={2}
                  panelTitle="Value and Delivery Details"
                  panelConfig={valueDeliveryCashConfig}
                  formName="valueDeliveryCashForm"
                  initialData={valueDeliveryCashData}
                  panelWidth="full"
                  collapsible={true}
                />
                <DynamicPanel
                  ref={codingBoxesRef}
                  panelId="coding-boxes"
                  panelOrder={3}
                  panelTitle="Coding Boxes"
                  panelConfig={codingBoxesConfig}
                  formName="codingBoxesForm"
                  initialData={codingBoxesData}
                  panelWidth="full"
                  collapsible={true}
                />
                <DynamicPanel
                  ref={examinationDetailsRef}
                  panelId="examination-details"
                  panelOrder={4}
                  panelTitle="Examination and Other Details"
                  panelConfig={examinationDetailsConfig}
                  formName="examinationDetailsForm"
                  initialData={examinationDetailsData}
                  panelWidth="full"
                  collapsible={true}
                />
                <DynamicPanel
                  ref={sectionARef}
                  panelId="section-a"
                  panelOrder={5}
                  panelTitle="Section A"
                  panelConfig={sectionAConfig}
                  formName="sectionAForm"
                  initialData={sectionAData}
                  panelWidth="full"
                  collapsible={true}
                />
                <DynamicPanel
                  ref={sectionBRef}
                  panelId="section-b"
                  panelOrder={6}
                  panelTitle="Section B"
                  panelConfig={sectionBConfig}
                  formName="sectionBForm"
                  initialData={sectionBData}
                  panelWidth="full"
                  collapsible={true}
                />
                <DynamicPanel
                  ref={sectionCRef}
                  panelId="section-c"
                  panelOrder={7}
                  panelTitle="Section C"
                  panelConfig={sectionCConfig}
                  formName="sectionCForm"
                  initialData={sectionCData}
                  panelWidth="full"
                  collapsible={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="route" className="mt-6" forceMount>
              {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6">Route</h2>
                    <p className="text-gray-500">Route content will be added here.</p>
                </div> */}
              <div>
                {/* wagon123 */}
                <DynamicPanel
                  ref={RouteEndorsementDetailsRef}
                  panelId="RouteConsignmentDetails"
                  panelOrder={1}
                  panelTitle="Route Details"
                  panelIcon={<FileText className="w-5 h-5 text-blue-500" />}
                  panelConfig={routeDetailsCustomsEndorsementConfig}
                  formName="generalDetailsForm"
                  //  initialData={undefined}
                  //  initialData={generalDetailsData}
                  // onDataChange={handleGeneralDataChange}
                  panelWidth="full"
                  collapsible={true} // Added collapsible prop
                />
              </div>
              {/* //table */}
              <div>
                <SmartGridPlus
                  columns={otherCarriersColumns}
                  data={otherCarriers}
                  hideToolbar={true}
                  hideCheckboxToggle={true}
                  onAddRow={handleAddOtherCarrierRow}
                  onEditRow={handleEditOtherCarrierRow}
                />
              </div>

              <div>
                {/* RouteConsignmentDetailsRef */}
                <DynamicPanel
                  ref={RouteDetailsRef}
                  panelId="RouteDetails"
                  panelOrder={1}
                  panelTitle="Consignment Number [62]/[6]"
                  panelIcon={<FileText className="w-5 h-5 text-blue-500" />}
                  panelConfig={routeDetailsConfig}
                  formName="generalDetailsForm"
                  //  initialData={undefined}
                  initialData={generalDetailsData}
                  // onDataChange={handleGeneralDataChange}
                  panelWidth="full"
                  collapsible={true} // Added collapsible prop
                />
              </div>

              <div>
                <SmartGridPlus
                  data={routeCodeCDetails}
                  columns={routeCodeCDetailsColumns}
                  onAddRow={handleAddRouteRow}
                  onEditRow={handleEditRouteRow}
                  hideRightToolbar={true}
                  hideAdvancedFilter={true}
                  hideCheckboxToggle={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="wagon-info" className="mt-6" forceMount>
              <div>
                <div>
                  {/* wagon123 */}
                  <DynamicPanel
                    ref={WagonDetailsRef}
                    panelId="WagonInfoDetails"
                    panelOrder={1}
                    panelTitle="Wagon Info Details"
                    panelIcon={<FileText className="w-5 h-5 text-blue-500" />}
                    panelConfig={wagonDetailsConfig}
                    formName="generalDetailsForm"
                    //  initialData={undefined}
                    initialData={generalDetailsData}
                    // onDataChange={handleGeneralDataChange}
                    panelWidth="full"
                    collapsible={true} // Added collapsible prop
                  />
                </div>

                <div>
                  <SmartGridPlus
                    data={wagonGritDetails}
                    columns={wagonGritDetailsColumns}
                    onAddRow={handleAddWagonRow} // ✅ VERY IMPORTANT
                    onEditRow={handleEditWagonRow}
                    hideRightToolbar={true}
                    hideAdvancedFilter={true}
                    hideCheckboxToggle={false}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Fixed Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
          <div className="flex items-center gap-4"></div>
          <div className="flex items-center gap-4">
            {/* <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm"
              onClick={() => setIsDraftBillDetailsSideDraw(true)}
            >
              open draft bill
            </button> */}
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="inline-flex items-center justify-center whitespace-nowrap bg-white text-blue-600 border border-blue-600 hover:bg-blue-100 font-semibold transition-colors rounded-sm h-8 px-3 text-[13px] relative"
                >
                  Save
                  <span className="ml-2 pl-2 border-l border-blue-600 h-[28px] flex items-center">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSaveReport}>
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUpdateTemplate}>
                  Update Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {apiResponse?.Header?.Status === "Fresh" && (
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm" onClick={handleConfirmReport} > 
                    Confirm 
                </button>
            )}
            {apiResponse?.Header?.Status === "Confirmed" && (
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm" onClick={() => setIsAmendModalOpen(true)} >
                    Amend
                </button>
            )}
          </div>
        </div>
      </div>

      <ConsignorConsigneeSideDraw
        isOpen={isConsignorConsigneeSideDrawOpen}
        width="40%"
        onSave={handleConsignorConsigneeSave}
        onClose={() => setIsConsignorConsigneeSideDrawOpen(false)}
        initialConsignorData={apiResponse?.General?.Details?.Consignor}
        initialConsigneeData={apiResponse?.General?.Details?.Consignee}
      />
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
      />
      <AmendReportModal
        isOpen={isAmendModalOpen}
        onClose={() => setIsAmendModalOpen(false)}
        onConfirmAmend={handleConfirmAmend}
      />

      <DraftBillDetailsSideDraw
        isOpen={isDraftBillDetailsSideDrawOpen}
        onClose={() => setIsDraftBillDetailsSideDraw(false)}
        lineItems={draftBillData.ItemDetails}
        onSave={handleSaveDraftBillDetails}
        headerData={draftBillData.Header}
      />
    </>
  );
};

export default ReportCreate;
