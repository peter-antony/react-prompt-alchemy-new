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
  MoreVertical, Trash2, Copy, ChevronDown
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
import { quickOrderService } from "@/api/services/quickOrderService";
import { useToast } from '@/hooks/use-toast';
interface PlanAndActualsDetailsProps {
  isEditQuickOrder?: boolean;
  resourceId?: string;
  PlanInfo?: any,
  onCloseDrawer(),
  onApiSuccess?: (bool: any) => boolean | void;
}
export const PlanAndActualDetails = ({ onCloseDrawer, isEditQuickOrder, resourceId, onApiSuccess, PlanInfo }: PlanAndActualsDetailsProps) => {
  let currentStep = 1;
  
  // Function to generate random number between 100 and 2000
  const generateRandomId = () => {
    return Math.floor(Math.random() * (2000 - 10 + 1)) + 100;
  };
  const [planType, setPlanType] = useState("plan");
  const [isOpen, setIsOpen] = useState(false);
  const [wagonDetailsVisible, setWagonDetailsVisible] = useState(true);
  const [operationalDetailsVisible, setOperationalDetailsVisible] =
    useState(true);
  const [billingDetailsVisible, setBillingDetailsVisible] = useState(true);

  // Expansion State for Dynamic Panels
  const [isWagonExpanded, setIsWagonExpanded] = useState(true);
  const [isContainerExpanded, setIsContainerExpanded] = useState(true);
  const [isProductExpanded, setIsProductExpanded] = useState(true);
  const [isTHUExpanded, setIsTHUExpanded] = useState(true);
  const [isJourneyExpanded, setIsJourneyExpanded] = useState(true);
  const [isOtherExpanded, setIsOtherExpanded] = useState(true);

  const isAllExpanded = isWagonExpanded && isContainerExpanded && isProductExpanded && isTHUExpanded && isJourneyExpanded && isOtherExpanded;

  const handleToggleExpandAll = () => {
    const newState = !isAllExpanded;
    setIsWagonExpanded(newState);
    setIsContainerExpanded(newState);
    setIsProductExpanded(newState);
    setIsTHUExpanded(newState);
    setIsJourneyExpanded(newState);
    setIsOtherExpanded(newState);
  };

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
  const { toast } = useToast();

  const handleSavePlanActuals = async () => {
    // Helper function to truncate at pipe symbol
    const truncateAtPipe = (value: string | null | undefined) => {
      if (typeof value === "string" && value.includes("||")) {
        return value.split("||")[0].trim();
      }
      return value;
    };

    // Helper to recursively truncate all dropdown fields in an object
    const truncateDropdowns = (obj: any) => {
      if (!obj || typeof obj !== "object") return obj;
      const newObj: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const val = obj[key];
        // If value is an object with a dropdown property, truncate it
        if (val && typeof val === "object" && "dropdown" in val) {
          newObj[key] = {
            ...val,
            dropdown: truncateAtPipe(val.dropdown)
          };
          // If input property exists, keep as is
          if ("input" in val) {
            newObj[key].input = val.input;
          }
        } else if (typeof val === "string") {
          // If value is a string, truncate if it has a pipe
          newObj[key] = truncateAtPipe(val);
        } else if (typeof val === "object" && val !== null) {
          // Recursively process nested objects
          newObj[key] = truncateDropdowns(val);
        } else {
          newObj[key] = val;
        }
      }
      return newObj;
    };

    // We'll create a helper that, if a string contains "||", returns an object with both parts.
    const splitAtPipe = (value: string | null | undefined) => {
      if (typeof value === "string" && value.includes("||")) {
        const [first, ...rest] = value.split("||");
        return {
          value: first.trim(),
          label: rest.join("||").trim()
        };
      }
      return value;
    };

    // Helper to recursively process all dropdown fields in an object, splitting at "||"
    const splitDropdowns = (obj: any) => {
      if (!obj || typeof obj !== "object") return obj;
      const newObj: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const val = obj[key];
        // If value is an object with a dropdown property, split it
        if (val && typeof val === "object" && "dropdown" in val) {
          newObj[key] = {
            ...val,
            dropdown: splitAtPipe(val.dropdown)
          };
          // If input property exists, keep as is
          if ("input" in val) {
            newObj[key].input = val.input;
          }
        } else if (typeof val === "string") {
          // If value is a string, split if it has a pipe
          newObj[key] = splitAtPipe(val);
        } else if (typeof val === "object" && val !== null) {
          // Recursively process nested objects
          newObj[key] = splitDropdowns(val);
        } else {
          newObj[key] = val;
        }
      }
      console.log("splitDropdowns ===", newObj);
      return newObj;
    };

    const formValues = {
      wagonNewDetails: splitDropdowns(wagonDetailsRef.current?.getFormValues() || {}),
      containerDetails: splitDropdowns(containerDetailsRef.current?.getFormValues() || {}),
      productDetails: splitDropdowns(productDetailsRef.current?.getFormValues() || {}),
      thuDetails: splitDropdowns(thuDetailsRef.current?.getFormValues() || {}),
      journeyDetails: splitDropdowns(journeyDetailsRef.current?.getFormValues() || {}),
      otherDetails: truncateDropdowns(otherDetailsRef.current?.getFormValues() || {}),
    };
    
    if (planType === "plan") {
      // Add additional data to formValues.wagonNewDetails
      console.log("formValues before ====", formValues.wagonNewDetails);
      formValues.wagonNewDetails = {
        ...formValues.wagonNewDetails,
        "WagonType": formValues.wagonNewDetails?.WagonType?.value || "",
        "WagonTypeDescription": formValues.wagonNewDetails?.WagonType?.label || "",
        "WagonID": formValues.wagonNewDetails?.WagonID?.value || "",
        "WagonIDDescription": formValues.wagonNewDetails?.WagonID?.label || "",
        "WagonQuantityUOM": formValues.wagonNewDetails?.WagonQuantity?.dropdown || "",
        "WagonQuantity": formValues.wagonNewDetails?.WagonQuantity?.input || null,
        "WagonTareWeightUOM": formValues.wagonNewDetails?.WagonTareWeight?.dropdown || "",
        "WagonTareWeight": formValues.wagonNewDetails?.WagonTareWeight?.input || null,
        "WagonGrossWeightUOM": formValues.wagonNewDetails?.WagonGrossWeight?.dropdown || "",
        "WagonGrossWeight": formValues.wagonNewDetails?.WagonGrossWeight?.input || null,
        "WagonLengthUOM": formValues.wagonNewDetails?.WagonLength?.dropdown || "",
        "WagonLength": formValues.wagonNewDetails?.WagonLength?.input || null,
        // Add more fields as needed
      };
      formValues.containerDetails = {
        ...formValues.containerDetails,
        "ContainerID": formValues.containerDetails?.ContainerID?.value || "",
        "ContainerIDDescription": formValues.containerDetails?.ContainerID?.label || "",
        "ContainerType": formValues.containerDetails?.ContainerType?.value || "",
        "ContainerTypeDescription": formValues.containerDetails?.ContainerType?.label || "",
        "ContainerQuantityUOM": formValues.containerDetails?.ContainerQuantity?.dropdown || "",
        "ContainerQuantity": formValues.containerDetails?.ContainerQuantity?.input || null,
        "ContainerTareWeightUOM": formValues.containerDetails?.ContainerTareWeight?.dropdown || "",
        "ContainerTareWeight": formValues.containerDetails?.ContainerTareWeight?.input || null,
        "ContainerLoadWeightUOM": formValues.containerDetails?.ContainerLoadWeight?.dropdown || "",
        "ContainerLoadWeight": formValues.containerDetails?.ContainerLoadWeight?.input || null,
        // Add more fields as needed
      };
      formValues.productDetails = {
        ...formValues.productDetails,
        
        "ContainHazardousGoods": formValues.productDetails?.ContainHazardousGoods?.value || "",
        "NHM": formValues.productDetails?.NHM?.value || "",
        "NHMDescription": formValues.productDetails?.NHM?.label || "",
        "ProductID": formValues.productDetails?.ProductID?.value || "",
        "ProductIDDescription": formValues.productDetails?.ProductID?.label || "",
        // "ClassofStores": formValues.productDetails?.ClassofStores?.value || "",
        // "ClassofStoresDescription": formValues.productDetails?.ClassofStores?.label || "",
        "UNCode": formValues.productDetails?.UNCode?.value || "",
        "UNCodeDescription": formValues.productDetails?.UNCode?.label || "",
        "DGClass": formValues.productDetails?.DGClass?.value || "",
        "DGClassDescription": formValues.productDetails?.DGClass?.label || "",
        "ContainerTareWeightUOM": formValues.productDetails?.ContainerTareWeight?.dropdown || "",
        "ContainerTareWeight": formValues.productDetails?.ContainerTareWeight?.input || null,
        "ProductQuantityUOM": formValues.productDetails?.ProductQuantity?.dropdown || "",
        "ProductQuantity": formValues.productDetails?.ProductQuantity?.input || null,
        // Add more fields as needed
      };
      formValues.thuDetails = {
        ...formValues.thuDetails,
        "THUID": formValues.thuDetails?.THUID?.value || "",
        "THUIDDescription": formValues.thuDetails?.THUID?.label || "",
        "THUQuantityUOM": formValues.thuDetails?.THUQuantity?.dropdown || "",
        "THUQuantity": formValues.thuDetails?.THUQuantity?.input || null,
        "THUWeightUOM": formValues.thuDetails?.THUWeight?.dropdown || "",
        "THUWeight": formValues.thuDetails?.THUWeight?.input || null,
        // Add more fields as needed
      };
      formValues.journeyDetails = {
        ...formValues.journeyDetails,
        "Departure": formValues.journeyDetails?.Departure?.value || "",
        "DepartureDescription": formValues.journeyDetails?.Departure?.label || "",
        "Arrival": formValues.journeyDetails?.Arrival?.value || "",
        "ArrivalDescription": formValues.journeyDetails?.Arrival?.label || "",
        "ActivityLocation": formValues.journeyDetails?.ActivityLocation?.value || "",
        "ActivityLocationDescription": formValues.journeyDetails?.ActivityLocation?.label || "",
        "Activity": formValues.journeyDetails?.Activity?.value || "",
        "ActivityDescription": formValues.journeyDetails?.Activity?.label || "",
      },
      formValues.otherDetails = {
        ...formValues.otherDetails,
        "QCUserDefined1": formValues.otherDetails?.QCUserDefined1?.dropdown || "",
        "QCUserDefined1Value": formValues.otherDetails?.QCUserDefined1?.input || "",
        "QCUserDefined2": formValues.otherDetails?.QCUserDefined2?.dropdown || "",
        "QCUserDefined2Value": formValues.otherDetails?.QCUserDefined2?.input || "",
        "QCUserDefined3": formValues.otherDetails?.QCUserDefined3?.dropdown || "",
        "QCUserDefined3Value": formValues.otherDetails?.QCUserDefined3?.input || "",
        // Add more fields as needed
      };
      console.log("formValues after ====", formValues.productDetails);
      // Prepare the updated PlanDetails by merging new form values with existing ones
      console.log("RESOURCE ID : ",resourceId)
      console.log("isEditQuickOrder: ",isEditQuickOrder)
      console.log("selectedPlan: ",selectedPlan);
      let  currentPlanDetails;
      if(selectedPlan)
        currentPlanDetails = jsonStore.getPlanDetailsByResourceAndPlanLineID(resourceId,selectedPlan);
      else
        currentPlanDetails = jsonStore.getPlanDetailsJson() || {};

      console.log("currentPlanDetails: ",currentPlanDetails)

      let setPlanId:any;
      if(isEditQuickOrder && resourceId && selectedPlan){
        console.log("Plan EXIST")
        setPlanId=selectedPlan;
      }else{
        console.log("Plan NOT EXIST")

        setPlanId=-1;
      }
      console.log("setPlanId =====", setPlanId);
      const updatedPlanDetails = {
        // ...currentPlanDetails,
        "PlanLineUniqueID": setPlanId,
        "ModeFlag": selectedPlan?"Update": "Insert",
        WagonDetails: { ...currentPlanDetails.WagonDetails, ...formValues.wagonNewDetails },
        ContainerDetails: { ...currentPlanDetails.ContainerDetails, ...formValues.containerDetails },
        ProductDetails: { ...currentPlanDetails.ProductDetails, ...formValues.productDetails },
        THUDetails: { ...currentPlanDetails.THUDetails, ...formValues.thuDetails },
        JourneyAndSchedulingDetails: { ...currentPlanDetails.JourneyAndSchedulingDetails, ...formValues.journeyDetails },
        OtherDetails: { ...currentPlanDetails.OtherDetails, ...formValues.otherDetails },
      };
      // Set the updated ActualDetails in jsonStore
      // jsonStore.setPlanDetailsJson(updatedPlanDetails);
      console.log("updatedPlanDetails: ", updatedPlanDetails)
      if(setPlanId==-1)
        jsonStore.pushPlanDetailsToResourceGroup(resourceId, updatedPlanDetails)
      else
        jsonStore.updatePlanDetailsByResourceAndPlanLineID(resourceId,setPlanId,updatedPlanDetails);
      jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        "ModeFlag": "Update",
        "Status": "Fresh",
        // "QuickOrderNo": jsonStore.getQuickUniqueID()
      });
      const fullJson = jsonStore.getQuickOrder();
      console.log("FULL JSON AFTER PLAN UPDATE ----", fullJson);
      try {
        const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
        console.log(" try", data);
        //  Get OrderNumber from response
        const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
        console.log("OrderNumber:", resourceGroupID);
        const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
        const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
        if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
          toast({
            title: "✅ Form submitted successfully",
            description: "Your changes have been saved.",
            variant: "default", // or "success" if you have custom variant
          });
          // setCurrentStep(2);
          // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
          const fullJson2 = jsonStore.getJsonData();
          console.log("PLAN SAVE SAVE --- FULL JSON 55:: ", fullJson2);
          onApiSuccess(true);
          onCloseDrawer();
        }
        else {
          console.log("before ---", jsonStore.getQuickOrder());
          const quickOrder = jsonStore.getQuickOrder();
          let resourceGroups = Array.isArray(quickOrder.ResourceGroup) ? quickOrder.ResourceGroup : [];
          // Find the resource group for this resourceId
          const updatedResourceGroups = resourceGroups.map((rg: any) => {
            if (rg.ResourceUniqueID === resourceId) {
              // Remove PlanDetails with PlanLineUniqueID: -1
              const planDetailsArr = Array.isArray(rg.PlanDetails) ? rg.PlanDetails : [];
              return {
                ...rg,
                PlanDetails: planDetailsArr.filter((plan: any) => plan.PlanLineUniqueID !== -1)
              };
            }
            return rg;
          });
          console.log("updatedResourceGroups ", updatedResourceGroups);
          jsonStore.setQuickOrder({
            ...quickOrder,
            ResourceGroup: updatedResourceGroups
          });
          console.log("updatedResourceGroups ", jsonStore.getQuickOrder());
          const fullJsonElse = jsonStore.getQuickOrder();
          console.log("Else error123 :: ", fullJsonElse);
          toast({
            title: "⚠️ Submission failed",
            description: isSuccessStatus ? JSON.parse(data?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
            variant: "destructive", // or "success" if you have custom variant
          });
        }

        //  Fetch the full quick order details
        quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
          let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
          console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
          console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
          // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
          jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
          
        })

      } catch (err) {
        console.log(" catch", err);
        toast({
          title: "⚠️ Submission failed",
          description: JSON.parse(err?.data?.Message),
          variant: "destructive", // or "error"
        });
        onApiSuccess(false);
        // setError(`Error fetching API data for Update ResourceGroup`);
      }
      console.log("Updated Plan Details in FULL JSON:", jsonStore.getJsonData());
    } else {
      console.log("Actuals else ===");
      // Get the current ActualDetails from jsonStore
      const currentActualDetails = jsonStore.getActualDetails() || {};
      console.log("currentActualDetails: ",currentActualDetails)
      // if(selectedPlan)
      //   currentActualDetails = jsonStore.getPlanDetailsByResourceAndPlanLineID(resourceId,selectedPlan);
      // else
      // currentActualDetails = jsonStore.getPlanDetailsJson() || {};
      formValues.wagonNewDetails = {
        ...formValues.wagonNewDetails,
        "WagonType": formValues.wagonNewDetails?.WagonType?.value || "",
        "WagonTypeDescription": formValues.wagonNewDetails?.WagonType?.label || "",
        "WagonID": formValues.wagonNewDetails?.WagonID?.value || "",
        "WagonIDDescription": formValues.wagonNewDetails?.WagonID?.label || "",
        "WagonQuantityUOM": formValues.wagonNewDetails?.WagonQuantity?.dropdown || "",
        "WagonQuantity": formValues.wagonNewDetails?.WagonQuantity?.input || null,
        "WagonTareWeightUOM": formValues.wagonNewDetails?.WagonTareWeight?.dropdown || "",
        "WagonTareWeight": formValues.wagonNewDetails?.WagonTareWeight?.input || null,
        "WagonGrossWeightUOM": formValues.wagonNewDetails?.WagonGrossWeight?.dropdown || "",
        "WagonGrossWeight": formValues.wagonNewDetails?.WagonGrossWeight?.input || null,
        "WagonLengthUOM": formValues.wagonNewDetails?.WagonLength?.dropdown || "",
        "WagonLength": formValues.wagonNewDetails?.WagonLength?.input || null,
        // Add more fields as needed
      };
      formValues.containerDetails = {
        ...formValues.containerDetails,
        "ContainerID": formValues.containerDetails?.ContainerID?.value || "",
        "ContainerIDDescription": formValues.containerDetails?.ContainerID?.label || "",
        "ContainerType": formValues.containerDetails?.ContainerType?.value || "",
        "ContainerTypeDescription": formValues.containerDetails?.ContainerType?.label || "",
        "ContainerQuantityUOM": formValues.containerDetails?.ContainerQuantity?.dropdown || "",
        "ContainerQuantity": formValues.containerDetails?.ContainerQuantity?.input || null,
        "ContainerTareWeightUOM": formValues.containerDetails?.ContainerTareWeight?.dropdown || "",
        "ContainerTareWeight": formValues.containerDetails?.ContainerTareWeight?.input || null,
        "ContainerLoadWeightUOM": formValues.containerDetails?.ContainerLoadWeight?.dropdown || "",
        "ContainerLoadWeight": formValues.containerDetails?.ContainerLoadWeight?.input || null,
        // Add more fields as needed
      };
      formValues.productDetails = {
        ...formValues.productDetails,
        "ContainHazardousGoods": formValues.productDetails?.ContainHazardousGoods?.value || "",
        "NHM": formValues.productDetails?.NHM?.value || "",
        "NHMDescription": formValues.productDetails?.NHM?.label || "",
        "ProductID": formValues.productDetails?.ProductID?.value || "",
        "ProductIDDescription": formValues.productDetails?.ProductID?.label || "",
        // "ClassofStores": formValues.productDetails?.ClassofStores?.value || "",
        // "ClassofStoresDescription": formValues.productDetails?.ClassofStores?.label || "",
        "UNCode": formValues.productDetails?.UNCode?.value || "",
        "UNCodeDescription": formValues.productDetails?.UNCode?.label || "",
        "DGClass": formValues.productDetails?.DGClass?.value || "",
        "DGClassDescription": formValues.productDetails?.DGClass?.label || "",
        "ContainerTareWeightUOM": formValues.productDetails?.ContainerTareWeight?.dropdown || "",
        "ContainerTareWeight": formValues.productDetails?.ContainerTareWeight?.input || null,
        "ProductQuantityUOM": formValues.productDetails?.ProductQuantity?.dropdown || "",
        "ProductQuantity": formValues.productDetails?.ProductQuantity?.input || null,
        // Add more fields as needed
      };
      formValues.thuDetails = {
        ...formValues.thuDetails,
        "THUID": formValues.thuDetails?.THUID?.value || "",
        "THUIDDescription": formValues.thuDetails?.THUID?.label || "",
        "THUQuantityUOM": formValues.thuDetails?.THUQuantity?.dropdown || "",
        "THUQuantity": formValues.thuDetails?.THUQuantity?.input || null,
        "THUWeightUOM": formValues.thuDetails?.THUWeight?.dropdown || "",
        "THUWeight": formValues.thuDetails?.THUWeight?.input || null,
        // Add more fields as needed
      };
      formValues.journeyDetails = {
        ...formValues.journeyDetails,
        "Departure": formValues.journeyDetails?.Departure?.value || "",
        "DepartureDescription": formValues.journeyDetails?.Departure?.label || "",
        "Arrival": formValues.journeyDetails?.Arrival?.value || "",
        "ArrivalDescription": formValues.journeyDetails?.Arrival?.label || "",
        "ActivityLocation": formValues.journeyDetails?.ActivityLocation?.value || "",
        "ActivityLocationDescription": formValues.journeyDetails?.ActivityLocation?.label || "",
        "Activity": formValues.journeyDetails?.Activity?.value || "",
        "ActivityDescription": formValues.journeyDetails?.Activity?.label || "",
      },
      formValues.otherDetails = {
        ...formValues.otherDetails,
        "QCUserDefined1": formValues.otherDetails?.QCUserDefined1?.dropdown || "",
        "QCUserDefined1Value": formValues.otherDetails?.QCUserDefined1?.input || "",
        "QCUserDefined2": formValues.otherDetails?.QCUserDefined2?.dropdown || "",
        "QCUserDefined2Value": formValues.otherDetails?.QCUserDefined2?.input || "",
        "QCUserDefined3": formValues.otherDetails?.QCUserDefined3?.dropdown || "",
        "QCUserDefined3Value": formValues.otherDetails?.QCUserDefined3?.input || "",
        // Add more fields as needed
      };
      console.log("RESOURCE ID : ",resourceId)
      console.log("isEditQuickOrder: ",isEditQuickOrder)
      console.log("selectedPlan: ",selectedPlan);
      console.log("planType: ",planType);
      let  currentActualDetail;
      if(selectedPlan && planType=='actual' && isEditQuickOrder && resourceId && selectedPlan){
        console.log("Inside ** selectedPlan && planType=='Actual'")
        currentActualDetail = jsonStore.getActualDetailsByResourceAndActualLineID(resourceId,selectedPlan);
      }
      else if(selectedPlan && planType=='plan' && isEditQuickOrder && resourceId && selectedPlan){
        console.log("Inside ** selectedPlan && planType=='Plan'")

        currentActualDetail = jsonStore.getPlanDetailsByResourceAndPlanLineID(resourceId,selectedPlan);
      }
      else if(!selectedPlan){
        console.log("Inside ** !selectedPlan")

        currentActualDetail = jsonStore.getPlanDetailsJson() || {};
      }
        // currentActualDetail = jsonStore.getActualDetails() || {};

      console.log("currentActualDetail: ",currentActualDetail)

      let setActualId:any;
      if(isEditQuickOrder && resourceId && selectedPlan){
        console.log("Actual EXIST")
        setActualId=selectedPlan;
      }else{
        console.log("Actual NOT EXIST")

        setActualId=-1;
      }
      // Prepare the updated ActualDetails by merging new form values with existing ones
      const updatedActualDetails = {
        ... currentActualDetail,
        // "ActualLineUniqueID": "A0" + ((parseInt(localStorage.getItem('actualCount')) + 1)),
        "ActualLineUniqueID": setActualId,
        "ModeFlag": selectedPlan?"Update": "Insert",

        WagonDetails: { ...currentActualDetail.WagonDetails, ...formValues.wagonNewDetails },
        ContainerDetails: { ...currentActualDetail.ContainerDetails, ...formValues.containerDetails },
        ProductDetails: { ...currentActualDetail.ProductDetails, ...formValues.productDetails },
        THUDetails: { ...currentActualDetail.THUDetails, ...formValues.thuDetails },
        JourneyAndSchedulingDetails: { ...currentActualDetail.JourneyAndSchedulingDetails, ...formValues.journeyDetails },
        OtherDetails: { ...currentActualDetail.OtherDetails, ...formValues.otherDetails },
      };
      // localStorage.setItem('actualCount', (parseInt(localStorage.getItem('actualCount'))+1).toString());
      // Set the updated ActualDetails in jsonStore
      console.log("RESOURCE ID : ",resourceId)
      console.log("Updated Actual Details:", updatedActualDetails);
      // jsonStore.setActualDetailsJson(updatedActualDetails);
      // jsonStore.pushActualDetailsToResourceGroup(resourceId, updatedActualDetails);
      if(setActualId==-1)
        jsonStore.pushActualDetailsToResourceGroup(resourceId, updatedActualDetails)
      else
        jsonStore.updateActualDetailsByResourceAndPlanLineID(resourceId,setActualId,updatedActualDetails);
      jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        "ModeFlag": "Update",
        "Status": "Fresh",
        // "QuickOrderNo": jsonStore.getQuickUniqueID()
      });
      const fullJson = jsonStore.getQuickOrder();
      console.log("FULL JSON AFTER ACTUAL UPDATE ----", fullJson);
      try {
        const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
        console.log(" try", data);
        //  Get OrderNumber from response
        const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
        console.log("OrderNumber:", resourceGroupID);
        const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
        const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
        if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
          toast({
            title: "✅ Form submitted successfully",
            description: "Your changes have been saved.",
            variant: "default", // or "success" if you have custom variant
          });
          // setCurrentStep(2);
          // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
          const fullJson2 = jsonStore.getJsonData();
          console.log("PLAN SAVE SAVE --- FULL JSON 55:: ", fullJson2);
          onApiSuccess(true);
          onCloseDrawer();
        }
        else{
          console.log("before ---", jsonStore.getQuickOrder());
          const quickOrder = jsonStore.getQuickOrder();
          let resourceGroups = Array.isArray(quickOrder.ResourceGroup) ? quickOrder.ResourceGroup : [];
          // Find the resource group for this resourceId
          const updatedResourceGroups = resourceGroups.map((rg: any) => {
            if (rg.ResourceUniqueID === resourceId) {
              // Remove PlanDetails with PlanLineUniqueID: -1
              const planDetailsArr = Array.isArray(rg.ActualDetails) ? rg.ActualDetails : [];
              return {
                ...rg,
                ActualDetails: planDetailsArr.filter((plan: any) => plan.ActualLineUniqueID !== -1)
              };
            }
            return rg;
          });
          console.log("updatedResourceGroups ", updatedResourceGroups);
          jsonStore.setQuickOrder({
            ...quickOrder,
            ResourceGroup: updatedResourceGroups
          });
          console.log("updatedResourceGroups ", jsonStore.getQuickOrder());
          const fullJsonElse = jsonStore.getQuickOrder();
          toast({
            title: "⚠️ Submission failed",
            description: isSuccessStatus ? JSON.parse(data?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
            variant: "destructive", // or "success" if you have custom variant
          });
        }

        //  Fetch the full quick order details
        quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
          let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
          console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
          console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
          // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
          jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
          
        })

      } catch (err) {
        console.log(" catch", err);
        toast({
          title: "⚠️ Submission failed",
          description: JSON.parse(err?.data?.Message),
          variant: "destructive", // or "error"
        });
        onApiSuccess(false);
        // setError(`Error fetching API data for Update ResourceGroup`);
      }
      console.log("Updated Plan Details in FULL JSON:", jsonStore.getJsonData());
      // console.log("Updated Actual Details in FULL JSON:", jsonStore.getJsonData());
    }
    
  };
  const savePlanDetails = async () => {
       // Helper function to truncate at pipe symbol
       const truncateAtPipe = (value: string | null | undefined) => {
        if (typeof value === "string" && value.includes("||")) {
          return value.split("||")[0].trim();
        }
        return value;
      };
  
      // Helper to recursively truncate all dropdown fields in an object
      const truncateDropdowns = (obj: any) => {
        if (!obj || typeof obj !== "object") return obj;
        const newObj: any = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (!obj.hasOwnProperty(key)) continue;
          const val = obj[key];
          // If value is an object with a dropdown property, truncate it
          if (val && typeof val === "object" && "dropdown" in val) {
            newObj[key] = {
              ...val,
              dropdown: truncateAtPipe(val.dropdown)
            };
            // If input property exists, keep as is
            if ("input" in val) {
              newObj[key].input = val.input;
            }
          } else if (typeof val === "string") {
            // If value is a string, truncate if it has a pipe
            newObj[key] = truncateAtPipe(val);
          } else if (typeof val === "object" && val !== null) {
            // Recursively process nested objects
            newObj[key] = truncateDropdowns(val);
          } else {
            newObj[key] = val;
          }
        }
        return newObj;
      };
  
      // We'll create a helper that, if a string contains "||", returns an object with both parts.
      const splitAtPipe = (value: string | null | undefined) => {
        if (typeof value === "string" && value.includes("||")) {
          const [first, ...rest] = value.split("||");
          return {
            value: first.trim(),
            label: rest.join("||").trim()
          };
        }
        return value;
      };
  
      // Helper to recursively process all dropdown fields in an object, splitting at "||"
      const splitDropdowns = (obj: any) => {
        if (!obj || typeof obj !== "object") return obj;
        const newObj: any = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (!obj.hasOwnProperty(key)) continue;
          const val = obj[key];
          // If value is an object with a dropdown property, split it
          if (val && typeof val === "object" && "dropdown" in val) {
            newObj[key] = {
              ...val,
              dropdown: splitAtPipe(val.dropdown)
            };
            // If input property exists, keep as is
            if ("input" in val) {
              newObj[key].input = val.input;
            }
          } else if (typeof val === "string") {
            // If value is a string, split if it has a pipe
            newObj[key] = splitAtPipe(val);
          } else if (typeof val === "object" && val !== null) {
            // Recursively process nested objects
            newObj[key] = splitDropdowns(val);
          } else {
            newObj[key] = val;
          }
        }
        console.log("splitDropdowns ===", newObj);
        return newObj;
      };
  
      const formValues = {
        wagonNewDetails: splitDropdowns(wagonDetailsRef.current?.getFormValues() || {}),
        containerDetails: splitDropdowns(containerDetailsRef.current?.getFormValues() || {}),
        productDetails: splitDropdowns(productDetailsRef.current?.getFormValues() || {}),
        thuDetails: splitDropdowns(thuDetailsRef.current?.getFormValues() || {}),
        journeyDetails: splitDropdowns(journeyDetailsRef.current?.getFormValues() || {}),
        otherDetails: truncateDropdowns(otherDetailsRef.current?.getFormValues() || {}),
      };
      
      // if (planType === "plan") {
        // Add additional data to formValues.wagonNewDetails
        console.log("formValues before ====", formValues.wagonNewDetails);
        formValues.wagonNewDetails = {
          ...formValues.wagonNewDetails,
          "WagonType": formValues.wagonNewDetails?.WagonType?.value || "",
          "WagonTypeDescription": formValues.wagonNewDetails?.WagonType?.label || "",
          "WagonID": formValues.wagonNewDetails?.WagonID?.value || "",
          "WagonIDDescription": formValues.wagonNewDetails?.WagonID?.label || "",
          "WagonQuantityUOM": formValues.wagonNewDetails?.WagonQuantity?.dropdown || "",
          "WagonQuantity": formValues.wagonNewDetails?.WagonQuantity?.input || null,
          "WagonTareWeightUOM": formValues.wagonNewDetails?.WagonTareWeight?.dropdown || "",
          "WagonTareWeight": formValues.wagonNewDetails?.WagonTareWeight?.input || null,
          "WagonGrossWeightUOM": formValues.wagonNewDetails?.WagonGrossWeight?.dropdown || "",
          "WagonGrossWeight": formValues.wagonNewDetails?.WagonGrossWeight?.input || null,
          "WagonLengthUOM": formValues.wagonNewDetails?.WagonLength?.dropdown || "",
          "WagonLength": formValues.wagonNewDetails?.WagonLength?.input || null,
          // Add more fields as needed
        };
        formValues.containerDetails = {
          ...formValues.containerDetails,
          "ContainerID": formValues.containerDetails?.ContainerID?.value || "",
          "ContainerIDDescription": formValues.containerDetails?.ContainerID?.label || "",
          "ContainerType": formValues.containerDetails?.ContainerType?.value || "",
          "ContainerTypeDescription": formValues.containerDetails?.ContainerType?.label || "",
          "ContainerQuantityUOM": formValues.containerDetails?.ContainerQuantity?.dropdown || "",
          "ContainerQuantity": formValues.containerDetails?.ContainerQuantity?.input || null,
          "ContainerTareWeightUOM": formValues.containerDetails?.ContainerTareWeight?.dropdown || "",
          "ContainerTareWeight": formValues.containerDetails?.ContainerTareWeight?.input || null,
          "ContainerLoadWeightUOM": formValues.containerDetails?.ContainerLoadWeight?.dropdown || "",
          "ContainerLoadWeight": formValues.containerDetails?.ContainerLoadWeight?.input || null,
          // Add more fields as needed
        };
        formValues.productDetails = {
          ...formValues.productDetails,
          "ContainHazardousGoods": formValues.productDetails?.ContainHazardousGoods?.value || "",
          "NHM": formValues.productDetails?.NHM?.value || "",
          "NHMDescription": formValues.productDetails?.NHM?.label || "",
          "ProductID": formValues.productDetails?.ProductID?.value || "",
          "ProductIDDescription": formValues.productDetails?.ProductID?.label || "",
          // "ClassofStores": formValues.productDetails?.ClassofStores?.value || "",
          // "ClassofStoresDescription": formValues.productDetails?.ClassofStores?.label || "",
          "UNCode": formValues.productDetails?.UNCode?.value || "",
          "UNCodeDescription": formValues.productDetails?.UNCode?.label || "",
          "DGClass": formValues.productDetails?.DGClass?.value || "",
          "DGClassDescription": formValues.productDetails?.DGClass?.label || "",
          "ContainerTareWeightUOM": formValues.productDetails?.ContainerTareWeight?.dropdown || "",
          "ContainerTareWeight": formValues.productDetails?.ContainerTareWeight?.input || null,
          "ProductQuantityUOM": formValues.productDetails?.ProductQuantity?.dropdown || "",
          "ProductQuantity": formValues.productDetails?.ProductQuantity?.input || null,
          // Add more fields as needed
        };
        formValues.thuDetails = {
          ...formValues.thuDetails,
          "THUID": formValues.thuDetails?.THUID?.value || "",
          "THUIDDescription": formValues.thuDetails?.THUID?.label || "",
          "THUQuantityUOM": formValues.thuDetails?.THUQuantity?.dropdown || "",
          "THUQuantity": formValues.thuDetails?.THUQuantity?.input || null,
          "THUWeightUOM": formValues.thuDetails?.THUWeight?.dropdown || "",
          "THUWeight": formValues.thuDetails?.THUWeight?.input || null,
          // Add more fields as needed
        };
        formValues.journeyDetails = {
          ...formValues.journeyDetails,
          "Departure": formValues.journeyDetails?.Departure?.value || "",
          "DepartureDescription": formValues.journeyDetails?.Departure?.label || "",
          "Arrival": formValues.journeyDetails?.Arrival?.value || "",
          "ArrivalDescription": formValues.journeyDetails?.Arrival?.label || "",
          "ActivityLocation": formValues.journeyDetails?.ActivityLocation?.value || "",
          "ActivityLocationDescription": formValues.journeyDetails?.ActivityLocation?.label || "",
          "Activity": formValues.journeyDetails?.Activity?.value || "",
          "ActivityDescription": formValues.journeyDetails?.Activity?.label || "",
        },
        formValues.otherDetails = {
          ...formValues.otherDetails,
          "QCUserDefined1": formValues.otherDetails?.QCUserDefined1?.dropdown || "",
          "QCUserDefined1Value": formValues.otherDetails?.QCUserDefined1?.input || "",
          "QCUserDefined2": formValues.otherDetails?.QCUserDefined2?.dropdown || "",
          "QCUserDefined2Value": formValues.otherDetails?.QCUserDefined2?.input || "",
          "QCUserDefined3": formValues.otherDetails?.QCUserDefined3?.dropdown || "",
          "QCUserDefined3Value": formValues.otherDetails?.QCUserDefined3?.input || "",
          // Add more fields as needed
        };
        console.log("INSIDE -- SAVE PLAN")
        console.log("SAVE PLAN formValues after ====", formValues.productDetails);
        // Prepare the updated PlanDetails by merging new form values with existing ones
        console.log(" SAVE PLAN RESOURCE ID : ",resourceId)
        console.log(" SAVE PLAN isEditQuickOrder: ",isEditQuickOrder)
        console.log("SAVE PLAN selectedPlan: ",selectedPlan);
        let  currentPlanDetails;
        if(selectedPlan)
          currentPlanDetails = jsonStore.getPlanDetailsByResourceAndPlanLineID(resourceId,selectedPlan);
        else
          currentPlanDetails = jsonStore.getPlanDetailsJson() || {};
  
        console.log("SAVE PLAN currentPlanDetails: ",currentPlanDetails)
  
        let setPlanId:any;
        // if(isEditQuickOrder && resourceId && selectedPlan){
        //   console.log("Plan EXIST")
        //   setPlanId=selectedPlan;
        // }else{
        //   console.log("Plan NOT EXIST")
  
          setPlanId=-1;
        // }
        console.log("SAVE PLAN setPlanId =====", setPlanId);
        const updatedPlanDetails = {
          // ...currentPlanDetails,
          "PlanLineUniqueID": setPlanId,
          "ModeFlag": "Insert",
          WagonDetails: { ...currentPlanDetails.WagonDetails, ...formValues.wagonNewDetails },
          ContainerDetails: { ...currentPlanDetails.ContainerDetails, ...formValues.containerDetails },
          ProductDetails: { ...currentPlanDetails.ProductDetails, ...formValues.productDetails },
          THUDetails: { ...currentPlanDetails.THUDetails, ...formValues.thuDetails },
          JourneyAndSchedulingDetails: { ...currentPlanDetails.JourneyAndSchedulingDetails, ...formValues.journeyDetails },
          OtherDetails: { ...currentPlanDetails.OtherDetails, ...formValues.otherDetails },
        };
        // Set the updated ActualDetails in jsonStore
        // jsonStore.setPlanDetailsJson(updatedPlanDetails);
        console.log(" SAVE PLAN updatedPlanDetails: ", updatedPlanDetails)
        console.log("SAVE PLAN setPlanId: ", setPlanId)
        if(setPlanId==-1){
          console.log("SAVE PLAN Only if its new plan with id=-1")
          jsonStore.pushPlanDetailsToResourceGroup(resourceId, updatedPlanDetails)
          // jsonStore.setQuickOrder({
          //   ...jsonStore.getJsonData().quickOrder,
          //   "ModeFlag": "Update",
          //   "Status": "Fresh",
          //   // "QuickOrderNo": jsonStore.getQuickUniqueID()
          // });
          // const fullJson = jsonStore.getQuickOrder();
          // console.log("SAVE PLAN FULL JSON AFTER PLAN UPDATE ----", fullJson);
          // try {
          //   const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
          //   console.log(" try", data);
          //   //  Get OrderNumber from response
          //   const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
          //   console.log("SAVE PLAN OrderNumber:", resourceGroupID);
          //   const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
          //   const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
          //   if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
          //     toast({
          //       title: "✅ Form submitted successfully",
          //       description: "Your changes have been saved.",
          //       variant: "default", // or "success" if you have custom variant
          //     });
          //     // setCurrentStep(2);
          //     // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
          //     const fullJson2 = jsonStore.getJsonData();
          //     console.log("PLAN SAVE SAVE --- FULL JSON 55:: ", fullJson2);
          //     onApiSuccess(true);
          //     onCloseDrawer();
          //   }
          //   else {
          //     console.log("before ---", jsonStore.getQuickOrder());
          //     const quickOrder = jsonStore.getQuickOrder();
          //     let resourceGroups = Array.isArray(quickOrder.ResourceGroup) ? quickOrder.ResourceGroup : [];
          //     // Find the resource group for this resourceId
          //     const updatedResourceGroups = resourceGroups.map((rg: any) => {
          //       if (rg.ResourceUniqueID === resourceId) {
          //         // Remove PlanDetails with PlanLineUniqueID: -1
          //         const planDetailsArr = Array.isArray(rg.PlanDetails) ? rg.PlanDetails : [];
          //         return {
          //           ...rg,
          //           PlanDetails: planDetailsArr.filter((plan: any) => plan.PlanLineUniqueID !== -1)
          //         };
          //       }
          //       return rg;
          //     });
          //     console.log("updatedResourceGroups ", updatedResourceGroups);
          //     jsonStore.setQuickOrder({
          //       ...quickOrder,
          //       ResourceGroup: updatedResourceGroups
          //     });
          //     console.log("updatedResourceGroups ", jsonStore.getQuickOrder());
          //     const fullJsonElse = jsonStore.getQuickOrder();
          //     console.log("Else error123 :: ", fullJsonElse);
          //     toast({
          //       title: "⚠️ Submission failed",
          //       description: isSuccessStatus ? JSON.parse(data?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
          //       variant: "destructive", // or "success" if you have custom variant
          //     });
          //   }
    
          //   //  Fetch the full quick order details
          //   quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
          //     let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
          //     console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
          //     console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
          //     // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
          //     jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
              
          //   })
    
          // } catch (err) {
          //   console.log(" catch", err);
          //   toast({
          //     title: "⚠️ Submission failed",
          //     description: JSON.parse(err?.data?.Message),
          //     variant: "destructive", // or "error"
          //   });
          //   onApiSuccess(false);
          //   // setError(`Error fetching API data for Update ResourceGroup`);
          // }
        }
        console.log("Updated Plan Details in FULL JSON:", jsonStore.getJsonData());
      // }
  }
  const handleConvertPlanActuals = async () => {

    console.log("Convert Plan to Actuals");
    // Get the current ActualDetails from jsonStore
    const currentActualDetails = jsonStore.getActualDetails() || {};
    console.log("currentActualDetails: ",currentActualDetails)
    // We'll create a helper that, if a string contains "||", returns an object with both parts.
    const splitAtPipe = (value: string | null | undefined) => {
      if (typeof value === "string" && value.includes("||")) {
        const [first, ...rest] = value.split("||");
        return {
          value: first.trim(),
          label: rest.join("||").trim()
        };
      }
      return value;
    };

    // Helper to recursively process all dropdown fields in an object, splitting at "||"
    const splitDropdowns = (obj: any) => {
      if (!obj || typeof obj !== "object") return obj;
      const newObj: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const val = obj[key];
        // If value is an object with a dropdown property, split it
        if (val && typeof val === "object" && "dropdown" in val) {
          newObj[key] = {
            ...val,
            dropdown: splitAtPipe(val.dropdown)
          };
          // If input property exists, keep as is
          if ("input" in val) {
            newObj[key].input = val.input;
          }
        } else if (typeof val === "string") {
          // If value is a string, split if it has a pipe
          newObj[key] = splitAtPipe(val);
        } else if (typeof val === "object" && val !== null) {
          // Recursively process nested objects
          newObj[key] = splitDropdowns(val);
        } else {
          newObj[key] = val;
        }
      }
      console.log("splitDropdowns ===", newObj);
      return newObj;
    };

    const formValues = {
      wagonNewDetails: splitDropdowns(wagonDetailsRef.current?.getFormValues() || {}),
      containerDetails: splitDropdowns(containerDetailsRef.current?.getFormValues() || {}),
      productDetails: splitDropdowns(productDetailsRef.current?.getFormValues() || {}),
      thuDetails: splitDropdowns(thuDetailsRef.current?.getFormValues() || {}),
      journeyDetails: splitDropdowns(journeyDetailsRef.current?.getFormValues() || {}),
      otherDetails: splitDropdowns(otherDetailsRef.current?.getFormValues() || {}),
    };

    formValues.wagonNewDetails = {
      ...formValues.wagonNewDetails,
      "WagonType": formValues.wagonNewDetails?.WagonType?.value || "",
      "WagonTypeDescription": formValues.wagonNewDetails?.WagonType?.label || "",
      "WagonID": formValues.wagonNewDetails?.WagonID?.value || "",
      "WagonIDDescription": formValues.wagonNewDetails?.WagonID?.label || "",
      "WagonQuantityUOM": formValues.wagonNewDetails?.WagonQuantity?.dropdown || "",
      "WagonQuantity": formValues.wagonNewDetails?.WagonQuantity?.input || null,
      "WagonTareWeightUOM": formValues.wagonNewDetails?.WagonTareWeight?.dropdown || "",
      "WagonTareWeight": formValues.wagonNewDetails?.WagonTareWeight?.input || null,
      "WagonGrossWeightUOM": formValues.wagonNewDetails?.WagonGrossWeight?.dropdown || "",
      "WagonGrossWeight": formValues.wagonNewDetails?.WagonGrossWeight?.input || null,
      "WagonLengthUOM": formValues.wagonNewDetails?.WagonLength?.dropdown || "",
      "WagonLength": formValues.wagonNewDetails?.WagonLength?.input || null,
      // Add more fields as needed
    };
    formValues.containerDetails = {
      ...formValues.containerDetails,
      "ContainerID": formValues.containerDetails?.ContainerID?.value || "",
      "ContainerIDDescription": formValues.containerDetails?.ContainerID?.label || "",
      "ContainerType": formValues.containerDetails?.ContainerType?.value || "",
      "ContainerTypeDescription": formValues.containerDetails?.ContainerType?.label || "",
      "ContainerQuantityUOM": formValues.containerDetails?.ContainerQuantity?.dropdown || "",
      "ContainerQuantity": formValues.containerDetails?.ContainerQuantity?.input || null,
      "ContainerTareWeightUOM": formValues.containerDetails?.ContainerTareWeight?.dropdown || "",
      "ContainerTareWeight": formValues.containerDetails?.ContainerTareWeight?.input || null,
      "ContainerLoadWeightUOM": formValues.containerDetails?.ContainerLoadWeight?.dropdown || "",
      "ContainerLoadWeight": formValues.containerDetails?.ContainerLoadWeight?.input || null,
      // Add more fields as needed
    };
    formValues.productDetails = {
      ...formValues.productDetails,
      "ContainHazardousGoods": formValues.productDetails?.ContainHazardousGoods?.value || "",
      "NHM": formValues.productDetails?.NHM?.value || "",
      "NHMDescription": formValues.productDetails?.NHM?.label || "",
      "ProductID": formValues.productDetails?.ProductID?.value || "",
      "ProductIDDescription": formValues.productDetails?.ProductID?.label || "",
      // "ClassofStores": formValues.productDetails?.ClassofStores?.value || "",
      // "ClassofStoresDescription": formValues.productDetails?.ClassofStores?.label || "",
      "UNCode": formValues.productDetails?.UNCode?.value || "",
      "UNCodeDescription": formValues.productDetails?.UNCode?.label || "",
      "DGClass": formValues.productDetails?.DGClass?.value || "",
      "DGClassDescription": formValues.productDetails?.DGClass?.label || "",
      "ContainerTareWeightUOM": formValues.productDetails?.ContainerTareWeight?.dropdown || "",
      "ContainerTareWeight": formValues.productDetails?.ContainerTareWeight?.input || null,
      "ProductQuantityUOM": formValues.productDetails?.ProductQuantity?.dropdown || "",
      "ProductQuantity": formValues.productDetails?.ProductQuantity?.input || null,
      // Add more fields as needed
    };
    formValues.thuDetails = {
      ...formValues.thuDetails,
      "THUID": formValues.thuDetails?.THUID?.value || "",
      "THUIDDescription": formValues.thuDetails?.THUID?.label || "",
      "THUQuantityUOM": formValues.thuDetails?.THUQuantity?.dropdown || "",
      "THUQuantity": formValues.thuDetails?.THUQuantity?.input || null,
      "THUWeightUOM": formValues.thuDetails?.THUWeight?.dropdown || "",
      "THUWeight": formValues.thuDetails?.THUWeight?.input || null,
      // Add more fields as needed
    };
    formValues.journeyDetails = {
      ...formValues.journeyDetails,
      "Departure": formValues.journeyDetails?.Departure?.value || "",
      "DepartureDescription": formValues.journeyDetails?.Departure?.label || "",
      "Arrival": formValues.journeyDetails?.Arrival?.value || "",
      "ArrivalDescription": formValues.journeyDetails?.Arrival?.label || "",
      "ActivityLocation": formValues.journeyDetails?.ActivityLocation?.value || "",
      "ActivityLocationDescription": formValues.journeyDetails?.ActivityLocation?.label || "",
      "Activity": formValues.journeyDetails?.Activity?.value || "",
      "ActivityDescription": formValues.journeyDetails?.Activity?.label || "",
    },
    formValues.otherDetails = {
      ...formValues.otherDetails,
      "QCUserDefined1": formValues.otherDetails?.QCUserDefined1?.dropdown || "",
      "QCUserDefined1Value": formValues.otherDetails?.QCUserDefined1?.input || "",
      "QCUserDefined2": formValues.otherDetails?.QCUserDefined2?.dropdown || "",
      "QCUserDefined2Value": formValues.otherDetails?.QCUserDefined2?.input || "",
      "QCUserDefined3": formValues.otherDetails?.QCUserDefined3?.dropdown || "",
      "QCUserDefined3Value": formValues.otherDetails?.QCUserDefined3?.input || "",
      // Add more fields as needed
    };
    console.log("RESOURCE ID : ",resourceId)
    console.log("isEditQuickOrder: ",isEditQuickOrder)
    console.log("selectedPlan: ",selectedPlan);
    console.log("planType: ",planType);
    let  currentActualDetail;
    if(selectedPlan && planType=='actual' && isEditQuickOrder && resourceId && selectedPlan){
      console.log("Inside ** selectedPlan && planType=='Actual'")
      currentActualDetail = jsonStore.getActualDetailsByResourceAndActualLineID(resourceId,selectedPlan);
    }
    else if(selectedPlan && planType=='plan' && isEditQuickOrder && resourceId && selectedPlan){
      console.log("Inside ** selectedPlan && planType=='Plan'")

      currentActualDetail = jsonStore.getPlanDetailsByResourceAndPlanLineID(resourceId,selectedPlan);
    }
    else if(!selectedPlan){
      console.log("Inside ** !selectedPlan")

      currentActualDetail = jsonStore.getPlanDetailsJson() || {};
    }
      // currentActualDetail = jsonStore.getActualDetails() || {};

    console.log("currentActualDetail: before",currentActualDetail)

    let setActualId:any;
    if(isEditQuickOrder && resourceId && selectedPlan){
      console.log("Actual EXIST")
      setActualId=selectedPlan;
    }else{
      console.log("Actual NOT EXIST")

      setActualId=-1;
      savePlanDetails()
    }

    if (currentActualDetail && typeof currentActualDetail === "object") {
      if (currentActualDetail.PlanLineUniqueID === -1) {
        console.log("=============== if");

        delete currentActualDetail.PlanLineUniqueID;
        delete currentActualDetail.PlanSeqNo;
        currentActualDetail.ActualLineUniqueID = -1;
        currentActualDetail.ActualSeqNo = "";
      }else{
        console.log("=============== else");
        // Duplicate the object, convert PlanLineUniqueID -> ActualLineUniqueID, and push to ActualDetails
        const duplicatedActual: any = { ...currentActualDetail };
        if ("PlanLineUniqueID" in duplicatedActual) {
          duplicatedActual.ActualLineUniqueID = duplicatedActual.PlanLineUniqueID;
          delete duplicatedActual.PlanLineUniqueID;
          delete duplicatedActual.PlanSeqNo;
          duplicatedActual.ActualLineUniqueID = -1;
          duplicatedActual.ActualSeqNo = "";
          duplicatedActual.ModeFlag = "Insert";
        }
        jsonStore.pushActualDetailsToResourceGroup(resourceId, duplicatedActual);
        console.log("Duplicated ActualDetails pushed:", duplicatedActual);
        currentActualDetail.duplicatedActual;
        // return;
      }
    }

    console.log("currentActualDetail: after",currentActualDetail)

    // Prepare the updated ActualDetails by merging new form values with existing ones
    const updatedActualDetails = {
      ... currentActualDetail,
      // "ActualLineUniqueID": "A0" + ((parseInt(localStorage.getItem('actualCount')) + 1)),
      // "ActualLineUniqueID": setActualId,
      "ModeFlag": "Insert",

      WagonDetails: { ...currentActualDetail.WagonDetails, ...formValues.wagonNewDetails },
      ContainerDetails: { ...currentActualDetail.ContainerDetails, ...formValues.containerDetails },
      ProductDetails: { ...currentActualDetail.ProductDetails, ...formValues.productDetails },
      THUDetails: { ...currentActualDetail.THUDetails, ...formValues.thuDetails },
      JourneyAndSchedulingDetails: { ...currentActualDetail.JourneyAndSchedulingDetails, ...formValues.journeyDetails },
      OtherDetails: { ...currentActualDetail.OtherDetails, ...formValues.otherDetails },
    };
    // localStorage.setItem('actualCount', (parseInt(localStorage.getItem('actualCount'))+1).toString());
    // Set the updated ActualDetails in jsonStore
    console.log("RESOURCE ID : ",resourceId)
    console.log("Updated Actual Details:", updatedActualDetails);
    // jsonStore.setActualDetailsJson(updatedActualDetails);
    // jsonStore.pushActualDetailsToResourceGroup(resourceId, updatedActualDetails);
    if(setActualId==-1)
      jsonStore.pushActualDetailsToResourceGroup(resourceId, updatedActualDetails)
    else
      jsonStore.updateActualDetailsByResourceAndPlanLineID(resourceId,setActualId,updatedActualDetails);
    jsonStore.setQuickOrder({
      ...jsonStore.getJsonData().quickOrder,
      "ModeFlag": "Update",
      "Status": "Fresh",
      // "QuickOrderNo": jsonStore.getQuickUniqueID()
    });
    const fullJson = jsonStore.getQuickOrder();
    console.log("FULL JSON AFTER ACTUAL UPDATE ----", fullJson);
    try {
      const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
      console.log(" try", data);
      //  Get OrderNumber from response
      const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
      console.log("OrderNumber:", resourceGroupID);
      const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
      const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
      if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
        toast({
          title: "✅ Form submitted successfully",
          description: "Your changes have been saved.",
          variant: "default", // or "success" if you have custom variant
        });
        // setCurrentStep(2);
        // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        const fullJson2 = jsonStore.getJsonData();
        console.log("PLAN SAVE SAVE --- FULL JSON 55:: ", fullJson2);
        onApiSuccess(true);
        onCloseDrawer();
      }
      else{
        console.log("before ---", jsonStore.getQuickOrder());
        const quickOrder = jsonStore.getQuickOrder();
        let resourceGroups = Array.isArray(quickOrder.ResourceGroup) ? quickOrder.ResourceGroup : [];
        // Find the resource group for this resourceId
        const updatedResourceGroups = resourceGroups.map((rg: any) => {
          if (rg.ResourceUniqueID === resourceId) {
            // Remove PlanDetails with PlanLineUniqueID: -1
            const planDetailsArr = Array.isArray(rg.ActualDetails) ? rg.ActualDetails : [];
            return {
              ...rg,
              ActualDetails: planDetailsArr.filter((plan: any) => plan.ActualLineUniqueID !== -1)
            };
          }
          return rg;
        });
        console.log("updatedResourceGroups ", updatedResourceGroups);
        jsonStore.setQuickOrder({
          ...quickOrder,
          ResourceGroup: updatedResourceGroups
        });
        console.log("updatedResourceGroups ", jsonStore.getQuickOrder());
        const fullJsonElse = jsonStore.getQuickOrder();
        toast({
          title: "⚠️ Submission failed",
          description: isSuccessStatus ? JSON.parse(data?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
          variant: "destructive", // or "success" if you have custom variant
        });
      }

      //  Fetch the full quick order details
      quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
        let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
        console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
        console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
        // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
        jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        
      })

    } catch (err) {
      console.log(" catch", err);
      toast({
        title: "⚠️ Submission failed",
        description: JSON.parse(err?.data?.Message),
        variant: "destructive", // or "error"
      });
      onApiSuccess(false);
      // setError(`Error fetching API data for Update ResourceGroup`);
    }
    // savePlanDetails();
    // console.log("Updated Plan Details in FULL JSON:", jsonStore.getJsonData());
    // console.log("Updated Actual Details in FULL JSON:", jsonStore.getJsonData());
    
  };


  const [billingData, setBillingData] = useState({
    billingDetail: "DB00023/42",
    contractPrice: '',
    netAmount: 0,
    billingType: "Wagon",
    unitPrice: 1395.0,
    billingQty: 4,
    tariff: "TAR000750 - Tariff Description",
    tariffType: "Rate Per Block Train",
    remarks: "",
  });

  const messageTypes = [
    "Quick Order Header Quick Code1 Init",
    "Quick Order Header Quick Code2 Init",
    "Quick Order Header Quick Code3 Init",
    "Weight UOM Init",
    "Wagon Length UOM Init",
    "Wagon Qty UOM Init",
    "Container Qty UOM Init",
    "Product Qty UOM Init",
    "THU Qty UOM Init",
  ];
  const [qcList1, setqcList1] = useState<any>([]);
  const [qcList2, setqcList2] = useState<any>([]);
  const [qcList3, setqcList3] = useState<any>([]);
  const [weightList, setWeightList] = useState<any>([]);
  const [wagonQty, setWagonQty] = useState<any>([]);
  const [weightLength, setWeightLength] = useState<any>([]);
  const [containerQty, setContainerQty] = useState<any>([]);
  const [productQty, setProductQty] = useState<any>([]);
  const [thuQty, setThuQty] = useState<any>([]);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceGroupArray, setResourceGroupArray] = useState<any>([]);
  const [defaultResourceId, setDefaultResourceId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // State for Panel Personalization Mode Flags
const [wagonDetailsPanelPersonalizationModeFlag, setWagonDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
const [containerDetailsPanelPersonalizationModeFlag, setContainerDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
const [productDetailsPanelPersonalizationModeFlag, setProductDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
const [thuDetailsPanelPersonalizationModeFlag, setThuDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
const [journeyDetailsPanelPersonalizationModeFlag, setJourneyDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
const [otherDetailsPanelPersonalizationModeFlag, setOtherDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
const [bulkUpdatePanelPersonalizationModeFlag, setBulkUpdatePanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');

// Fetch Wagon Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'PlanAndActualDetailsDrawer',
        ComponentName: 'panel-config-current-user-wagon-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-wagon-details', JSON.stringify(personalizationData.JsonData));
          }
          setWagonDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setWagonDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setWagonDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load wagon details panel personalization:', error);
      setWagonDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch Container Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'PlanAndActualDetailsDrawer',
        ComponentName: 'panel-config-current-user-container-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-container-details', JSON.stringify(personalizationData.JsonData));
          }
          setContainerDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setContainerDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setContainerDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load container details panel personalization:', error);
      setContainerDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch Product Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'PlanAndActualDetailsDrawer',
        ComponentName: 'panel-config-current-user-product-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-product-details', JSON.stringify(personalizationData.JsonData));
          }
          setProductDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setProductDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setProductDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load product details panel personalization:', error);
      setProductDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch THU Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'PlanAndActualDetailsDrawer',
        ComponentName: 'panel-config-current-user-thu-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-thu-details', JSON.stringify(personalizationData.JsonData));
          }
          setThuDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setThuDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setThuDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load thu details panel personalization:', error);
      setThuDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch Journey Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'PlanAndActualDetailsDrawer',
        ComponentName: 'panel-config-current-user-journey-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-journey-details', JSON.stringify(personalizationData.JsonData));
          }
          setJourneyDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setJourneyDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setJourneyDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load journey details panel personalization:', error);
      setJourneyDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch Other Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'PlanAndActualDetailsDrawer',
        ComponentName: 'panel-config-current-user-other-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-other-details', JSON.stringify(personalizationData.JsonData));
          }
          setOtherDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setOtherDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setOtherDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load other details panel personalization:', error);
      setOtherDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch Bulk Update panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'PlanAndActualDetailsDrawer',
        ComponentName: 'panel-config-current-user-bulk-update'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-bulk-update', JSON.stringify(personalizationData.JsonData));
          }
          setBulkUpdatePanelPersonalizationModeFlag('Update');
        } else {
          setBulkUpdatePanelPersonalizationModeFlag('Insert');
        }
      } else {
        setBulkUpdatePanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load bulk-update panel personalization:', error);
      setBulkUpdatePanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

  // Iterate through all messageTypes
  const fetchAll = async () => {
    setLoading(false);
    for (const type of messageTypes) {
      await fetchData(type);
    }
  };

  useEffect(() => {
    fetchAll();

  }, []);

  //API Call for dropdown data
  const fetchData = async (messageType) => {
    console.log("fetch data");
    setLoading(false);
    setError(null);
    try {
      console.log("fetch try");
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType});
      setApiData(data);
      console.log("load inside try", data);
      if (messageType == "Quick Order Header Quick Code1 Init") {
        setqcList1(JSON.parse(data?.data?.ResponseData) || []);
        console.log('Quick Order Header Quick Code1 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Quick Order Header Quick Code2 Init") {
        setqcList2(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "Quick Order Header Quick Code3 Init") {
        setqcList3(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "Weight UOM Init") {
        setWeightList(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "Wagon Qty UOM Init") {
        setWagonQty(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "Wagon Length UOM Init") {
        setWeightLength(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "Container Qty UOM Init") {
        setContainerQty(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "Product Qty UOM Init") {
        setProductQty(JSON.parse(data?.data?.ResponseData) || []);
      }
      if (messageType == "THU Qty UOM Init") {
        setThuQty(JSON.parse(data?.data?.ResponseData) || []);
      }
    } catch (err) {
      setError(`Error fetching API data for ${messageType}`);
      // setApiData(data);
    }
    finally {
      setLoading(true);
    }
  };
  

  // Basic Details Panel Configuration
  const wagonDetailsConfig: PanelConfig = {
    WagonType: {
      id: "WagonType",
      label: "Wagon Type",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      hideSearch: false,
      disableLazyLoading: false,
      // placeholder: "Select Type",
      // options: [{ label: "Other", value: "other" }],
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Wagon type Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    WagonID: {
      id: "WagonID",
      label: "Wagon ID",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      hideSearch: false,
      disableLazyLoading: false,
      // placeholder: "Enter ID",
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Wagon id Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
            events: {
        onChange: (selected, event:any) => {
          console.log('Customer changed:', selected);
          console.log('WAGON ID  event:', event.target?.value);
          if(event.target?.value!=undefined){
            wagonDetailsRef.current.setFormValues({
              WagonQuantity:{ dropdown: 'TON', input: 1 }
            })
          }else{
            wagonDetailsRef.current.setFormValues({
              WagonQuantity:{ dropdown: '', input: '' }
            })
          }
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    WagonQuantity: {
      id: "WagonQuantity",
      label: "Wagon Quantity",
      fieldType: "inputdropdown",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      inputType: 'number',
      maxLength: 20,
      options: wagonQty?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    WagonTareWeight: {
      id: "WagonTareWeight",
      label: "Wagon Tare Weight",
      fieldType: "inputdropdown",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      inputType: 'number',
      maxLength: 20,
      options: weightList?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      inputType: 'number',
      maxLength: 20,
      options: weightList?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      value: '',
      inputType: 'number',
      maxLength: 20,
      options: weightLength?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      inputType: 'number',
      maxLength: 50
    },
  };

  // Container Details Panel Configuration
  const containerDetailsConfig: PanelConfig = {
    ContainerType: {
      id: "ContainerType",
      label: "Container Type",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Container Type Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
            events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    ContainerID: {
      id: "ContainerID",
      label: "Container",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Container ID Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
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
      inputType: 'number',
      maxLength: 20,
      options: containerQty?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      inputType: 'number',
      maxLength: 20,
      options: weightList?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      maxLength: 20,
      options: weightList?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
  };
  // Product Details Panel Configuration
  const productDetailsConfig: PanelConfig = {
    ContainHazardousGoods:{
      id: "ContainHazardousGoods",
      label: "Hazardous Goods",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Hazardous Goods Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
           events: {
        onChange: (selected, event) => {
          console.log('Hazardous Goods changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Hazardous Goods dropdown clicked:', { event, value });
        }
      }
    },
    NHM: {
      id: "NHM",
      label: "NHM",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "NHM Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
           events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    ProductID: {
      id: "ProductID",
      label: "Product",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Product ID Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
      events: {
        onChange: (selected, event) => {
          console.log('Product changed:', selected);
          setComboDropdown(selected)
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    ProductQuantity: {
      id: "ProductQuantity",
      label: "Product Quantity",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      value: "",
      inputType: 'number',
      maxLength: 20,
      // options: productQty?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      options: productQty
        ?.filter((qc: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.id === qc.id)
        )
        .map((qc: any) => ({
          label: qc.name,
          value: qc.id
        }))
    },
    ContainerTareWeight: {
      id: "ContainerTareWeight",
      label: "Container Tare Weight",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      value: "",
      inputType: 'number',
      maxLength: 20,
      options: weightList?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    UNCode: {
      id: "UNCode",
      label: "UN Code",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "UN Code Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
    },
    DGClass: {
      id: "DGClass",
      label: "DG Class",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      hideSearch: false,
      disableLazyLoading: true,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "DG Class Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
    },
  };
  const setComboDropdown = async (productId: any) => {
    console.log("PRODUCT ID VALUE", productId);
    // If contractId.value contains '||', truncate everything after '||'
    let productIdValue = productId.value;
    if (typeof productIdValue === 'string' && productIdValue.includes('||')) {
      productIdValue = productIdValue.split('||')[0].trim();
    }
    console.log("AFTER SPLIT -VALUE", productIdValue);

    // setLoading(false);
    setError(null);
    // setApiStatus('loading');
    try {
      const data: any = await quickOrderService.getProductComboData({ messageType: "ProductID On Select", productId: productIdValue });
      const parsedResponse = JSON.parse(data.data.ResponseData);
      console.log("PRODUCT COMBO DROPDOWN DATA", parsedResponse);
      const productDetails=parsedResponse.ResponsePayload[0];
      productDetailsRef.current.setFormValues({
        // ...item.ProductDetails,
        ContainHazardousGoods: formatFieldWithName(productDetails.Hazardous, productDetails.HazardousDescription),
        NHM: formatFieldWithName(productDetails.NHMCode, productDetails.NHMDescription),
        ProductID: formatFieldWithName(productDetails.ProductID, productDetails.ProductDescription),
        UNCode: formatFieldWithName(productDetails.UNCode, productDetails.UNDescription),
        DGClass: formatFieldWithName(productDetails.DGClass, productDetails.DGClassDescription),
        // ProductQuantity: ProductQuantityInputDropdown,
      });
      setProductDetailsData(prev => ({ ...prev }));

      // // Set ContractTariff array in jsonStore for global access
      // if (parsedResponse && parsedResponse.ContractTariff) {
      //   jsonStore.setContractTariffList(parsedResponse.ContractTariff);
      // }
      // console.log("ORDERTYPE :", jsonStore.getContractTariffList());
      // // setContracts(JSON.parse(data?.data?.ResponseData));
      // const parsedData: any = JSON.parse(data?.data?.ResponseData);
      // const contract: any = parsedData;
      // console.log("CONTRACT DATA:: ", contract);
      // if (contract) {
      //   orderDetailsRef.current.setFormValues({
      //     Contract: (contract.ContractID ? contract.ContractID : '') + ' || ' + (contract.ContractDesc ? contract.ContractDesc : ''),
      //     ContractDescription: contract.ContractDesc,
      //     Vendor: (contract.VendorID ? contract.VendorID : '') + ' || ' + (contract.VendorName ? contract.VendorName : ''),
      //     Customer: (contract.CustomerID ? contract.CustomerID : '') + ' || ' + (contract.CustomerName ? contract.CustomerName : ''),
      //     VendorName: contract.VendorName,
      //     Cluster:
      //       (contract.ClusterLocation ? contract.ClusterLocation : '') +
      //       (contract.ClusterLocationDesc ? ' || ' + contract.ClusterLocationDesc : ''),
      //     ClusterLocationDesc: contract.ClusterLocationDesc,
      //     WBS: contract.WBS,
      //     Currency: contract.Currency,
      //   });

      //   setOrderType(OrderType)
      //   // const formatted = formatDateToYYYYMMDD("2023-08-31T00:00:00"); // "2023-08-31"
      //   // setQuickOrderDate(formatDateToYYYYMMDD(contract.ValidFrom) )
      //   console.log("contract.Currency = ",contract.Currency)
      //   jsonStore.setQuickOrderFields({ OrderType: OrderType, Contract: contract.ContractID, ContractDescription: contract.ContractDesc, Customer: contract.CustomerID, Vendor: contract.VendorID, VendorName: contract.VendorName, Cluster: contract.ClusterLocation, ClusterLocationDesc: contract.ClusterLocationDesc, WBS: contract.WBS, Currency: contract.Currency });
      //   jsonStore.setResourceGroupFields({ OperationalLocation: contract.Location });
      //   const additionalInfo = contract.ContractTariff;
      //   jsonStore.setResourceType({ Resource: additionalInfo[0].Resource, ResourceDescription: additionalInfo[0].ResourceDescription, ResourceType: additionalInfo[0].ResourceType, ResourceTypeDescription: additionalInfo[0].ResourceTypeDescription })
      //   jsonStore.setTariffFields({
      //     tariff: additionalInfo[0].TariffID,
      //     tariffDescription: additionalInfo[0].TariffDescription,
      //     // tariff: (additionalInfo[0].TariffID ? additionalInfo[0].TariffID : '') + (additionalInfo[0].TariffDescription ? ' || ' + additionalInfo[0].TariffDescription : ''),
      //     // tariff: additionalInfo[0].TariffID && additionalInfo[0].TariffDescription
      //     //     ? `${additionalInfo[0].TariffID} || ${additionalInfo[0].TariffDescription}`
      //     //     : (additionalInfo[0].TariffID || additionalInfo[0].TariffDescription || ""),
      //     contractPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : 0,
      //     unitPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : '',
      //     // netAmount: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
      //     tariffType: additionalInfo[0].TariffType ? additionalInfo[0].TariffType : "",
      //     tariffTypeDescription: additionalInfo[0].TariffTypeDescription ? additionalInfo[0].TariffTypeDescription : "",
      //     // billToID: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
      //     // draftBillNo: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
      //   });
      //   // jsonStore.setTariffDateFields({
      //   //   fromDate: additionalInfo[0].ContractTariffValidFrom
      //   //     ? additionalInfo[0].ContractTariffValidFrom.split("T")[0]
      //   //     : "",
      //   //   toDate: additionalInfo[0].ContractTariffValidTo
      //   //     ? additionalInfo[0].ContractTariffValidTo.split("T")[0]
      //   //     : "",
      //   //   // fromDate: formatDate(additionalInfo[0].ContractTariffValidFrom ? additionalInfo[0].ContractTariffValidFrom : ""),
      //   //   // toDate: formatDate(additionalInfo[0].ContractTariffValidTo ? additionalInfo[0].ContractTariffValidTo : ""),
      //   //   // fromDate: additionalInfo[0].ContractTariffValidFrom ? additionalInfo[0].ContractTariffValidFrom : "",
      //   //   // toDate: additionalInfo[0].ContractTariffValidTo ? additionalInfo[0].ContractTariffValidTo : "",
      //   // });
      //   // Set ValidFrom and ValidTo in jsonStore using a new set method


      //   console.log("AFTER DATA BINDING - RESOURCEGROUP  : ", jsonStore.getResourceJsonData())
      //   console.log("AFTER DATA BINDING - QUICKORDER  : ", jsonStore.getQuickOrder())
      //   setFormData(normalizeOrderFormDetails({ OrderType: OrderType, Contract: contract.ContractID, ContractDescription: contract.ContractDesc, Customer: contract.CustomerID, CustomerName: contract.CustomerName, Vendor: contract.VendorID, VendorName: contract.VendorName, Cluster: contract.ClusterLocation, ClusterLocationDesc: contract.ClusterLocationDesc, WBS: contract.WBS }));
      // }
    } catch (err) {
      setError(`Error fetching API data for${err}`);
      console.log("ERROR IN COMBO DROPDOWN:: ", err);
    }
    finally {
    }
  };
  // THU Details Panel Configuration
  const thuDetailsConfig: PanelConfig = {
    THUID: {
      id: "THUID",
      label: "THU ID",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "THU Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    THUSerialNo: {
      id: "THUSerialNo",
      label: "THU Serial No.",
      fieldType: "text",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      maxLength: 40,
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
      inputType: 'number',
      maxLength: 20,
      options: thuQty?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    THUWeight: {
      id: "THUWeight",
      label: "THU Weight",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      value: "",
      inputType: 'number',
      maxLength: 20,
      options: weightList?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
  };
  // journey & scheduling Details Panel Configuration
  const journeyDetailsConfig: PanelConfig = {
    Departure: {
      id: "Departure",
      label: "Departure",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Departure Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
    },
    Arrival: {
      id: "Arrival",
      label: "Arrival",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Arrival Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
    },
    ActivityLocation: {
      id: "ActivityLocation",
      label: "Activity Location",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Location Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    Activity: {
      id: "Activity",
      label: "Activity",
      fieldType: "lazyselect",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      hideSearch: true,
      disableLazyLoading: true,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Activity Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      },
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
      // placeholder: "DD-MM-YYYY",
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
      // placeholder: "DD-MM-YYYY",
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
      maxLength: 18,
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
      options: [
        { label: "Loaded", value: "Loaded" },
        { label: "Empty", value: "Empty" },
      ]
    },
  };
  // other Details Panel Configuration
  const otherDetailsConfig: PanelConfig = {
    FromDate: {
      id: "FromDate",
      label: "From Date",
      fieldType: "date",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      // options: [{ label: "Departure", value: "Departure" }],
    },
    FromTime: {
      id: "FromTime",
      label: "From Time",
      fieldType: "time",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
    },
    ToDate: {
      id: "ToDate",
      label: "To Date",
      fieldType: "date",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
    },
    ToTime: {
      id: "ToTime",
      label: "To Time",
      fieldType: "time",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
    },
    QCUserDefined1: {
      id: "QCUserDefined1",
      label: "QC Userdefined 1",
      fieldType: "inputdropdown",
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      maxLength: 255,
      // options: [
      //   { label: 'Quick order User defined 1 - 1', value: 'Quick order User defined 1 - 1' },
      //   { label: 'Quick order User defined 1 - 2', value: 'Quick order User defined 1 - 2' },
      // ]
      options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      maxLength: 255,
      value: { dropdown: '', input: '' },
      options: qcList2?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    QCUserDefined3: {
      id: "QCUserDefined3",
      label: "QC Userdefined 3",
      fieldType: "inputdropdown",
      width: 'third',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      maxLength: 255,
      value: { dropdown: '', input: '' },
      options: qcList3?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      maxLength: 500,
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
      maxLength: 500,
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
      maxLength: 500,
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

  const [mappedPlanActualItems, setMappedPlanActualItems] = useState<any[]>([]);
  // Replace the static mappedPlanActualItems array with the merged array from jsonStore
  useEffect(() => {
    setMappedPlanActualItems([
      ...jsonStore.getAllPlanDetailsByResourceUniqueID(resourceId),
      ...jsonStore.getAllActualDetailsByResourceUniqueID(resourceId)
    ]);
  }, [resourceId]);

  function formatFieldWithName(id, name) {
    if (id) {
      if (name && name.trim() !== '') {
        return id + ' || ' + name;
      } else {
        return id + ' || --';
      }
    }
    return '';
  }

  // Normalization functions for each config
  function normalizeWagonDetails(data) {
    console.log("data ", data.WagonType);
    if (!data || typeof data !== 'object') return {};
    return {
      WagonType: formatFieldWithName(data.WagonType, data.WagonTypeDescription),
      WagonID: formatFieldWithName(data.WagonID, data.WagonIDDescription),
      WagonQuantity: data.WagonQuantity || { dropdown: '', input: '' },
      WagonTareWeight: data.WagonTareWeight || { dropdown: '', input: '' },
      WagonGrossWeight: data.WagonGrossWeight || { dropdown: '', input: '' },
      WagonLength: data.WagonLength || { dropdown: '', input: '' },
      WagonSequence: data.WagonSequence || '',
    };
  }
  function normalizeContainerDetails(data) {
    return {
      ContainerType: formatFieldWithName(data.ContainerType, data.ContainerTypeDescription),
      ContainerID: formatFieldWithName(data.ContainerID, data.ContainerIDDescription),
      ContainerQuantity: data.ContainerQuantity || { dropdown: '', input: '' },
      ContainerTareWeight: data.ContainerTareWeight || { dropdown: '', input: '' },
      ContainerLoadWeight: data.ContainerLoadWeight || { dropdown: '', input: '' },
    };
  }
  function normalizeProductDetails(data) {
    return {
      ContainHazardousGoods: formatFieldWithName(data.Hazardous, data.HazardousDescription),
      NHM: formatFieldWithName(data.NHM, data.NHMDescription),
      ProductID: formatFieldWithName(data.ProductID, data.ProductIDDescription),
      ProductQuantity: data.ProductQuantity || { dropdown: '', input: '' },
      ContainerTareWeight: data.ContainerTareWeight || { dropdown: '', input: '' },
      UNCode: formatFieldWithName(data.UNCode, data.UNCodeDescription),
      DGClass: formatFieldWithName(data.DGClass, data.DGClassDescription),
    };
  }
  function normalizeTHUDetails(data) {
    return {
      THUID: formatFieldWithName(data.THUID, data.THUIDDescription),
      THUSerialNo: data.THUSerialNo || '',
      THUQuantity: data.THUQuantity || { dropdown: '', input: '' },
      THUWeight: data.THUWeight || { dropdown: '', input: '' },
    };
  }
  function normalizeJourneyDetails(data) {
    return {
      Departure: formatFieldWithName(data.Departure, data.DepartureDescription),
      Arrival: formatFieldWithName(data.Arrival, data.ArrivalDescription),
      ActivityLocation: formatFieldWithName(data.ActivityLocation, data.ActivityLocationDescription),
      Activity: formatFieldWithName(data.Activity, data.ActivityDescription),
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
  const [isEditPlan, setIsEditPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState();
  const [resourceGroupStatus, setResourceGroupStatus] = useState("Fresh");

  // Sync state with jsonStore on isEditQuickOrder change
  useEffect(() => {
    setDefaultResourceId(resourceId);
    setResourceGroupStatus(jsonStore.getResourceStatusByUniqueID(resourceId));

    console.log('wagonDetailsData load : ', wagonDetailsData);
    console.log('RESOURCE ID : ', resourceId, defaultResourceId);
    const planDetails = jsonStore.getPlanDetails() || {};
    // alert("R id - " + resourceId)
    console.log("PlanInfo :: ", PlanInfo);
    if(PlanInfo?.resourceId) {
      setDefaultResourceId(PlanInfo?.resourceId);
    }
    console.log("PLAN DETAILS :: ", jsonStore.getQuickOrder());
    // let resourceGroupArray = [];
    const quickOrderData = jsonStore.getQuickOrder() || {};
    const resourceGroupArray = Array.isArray(quickOrderData.ResourceGroup) ? quickOrderData.ResourceGroup : [];
    // You can now use resourceGroupArray for dropdown binding as needed
    console.log("RESOURCE GROUP ARRAY FOR DROPDOWN :: ", resourceGroupArray);
    setResourceGroupArray(resourceGroupArray);

    console.log("PLAN DETAILS :: ", planDetails);
    // if (isEditQuickOrder) {
    //   setWagonDetailsData(normalizeWagonDetails(planDetails.WagonDetails || {}));
    //   setContainerDetailsData(normalizeContainerDetails(planDetails.ContainerDetails || {}));
    //   setProductDetailsData(normalizeProductDetails(planDetails.ProductDetails || {}));
    //   setTHUDetailsData(normalizeTHUDetails(planDetails.THUDetails || {}));
    //   setJourneyDetailsData(normalizeJourneyDetails(planDetails.JourneyAndSchedulingDetails || {}));
    //   setOtherDetailsData(normalizeOtherDetails(planDetails.OtherDetails || {}));
    // } else {
    //   setWagonDetailsData({});
    //   setContainerDetailsData({});
    //   setProductDetailsData({});
    //   setTHUDetailsData({});
    //   setJourneyDetailsData({});
    //   setOtherDetailsData({});
    // }
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
      width: 'half',
    }
  };

  const onDefaultDetailsSave = () => {

  }

  const onResourceValueChange = async (value: string) => {
    console.log('Value is: ', value);
    setDefaultResourceId(value);
    setMappedPlanActualItems([
      ...jsonStore.getAllPlanDetailsByResourceUniqueID(value),
      ...jsonStore.getAllActualDetailsByResourceUniqueID(value)
    ]);
    console.log('mapped data: ',jsonStore.getJsonData(), mappedPlanActualItems);
  };

  const getSelectedPlanActualItem = (item: any) => {
    setLoading(false);
    console.log("getSelectedPlanActualItem --", item);
    console.log("getSelectedPlanActualItem --", jsonStore.getPlanDetails());

    if (item) {
      setIsEditPlan(true);
      setSelectedPlan(
        item.PlanLineUniqueID
          ? item.PlanLineUniqueID
          : item.ActualLineUniqueID
            ? item.ActualLineUniqueID
            : undefined
      );
      if(item.PlanLineUniqueID){
        setPlanType('plan');
      }else{
        setPlanType('actual');
      }
      // Set the raw data to state (if you still need it)
      setWagonDetailsData(item.WagonDetails);
      setContainerDetailsData(item.ContainerDetails);
      setProductDetailsData(item.ProductDetails);
      setTHUDetailsData(item.THUDetails);
      setJourneyDetailsData(item.JourneyAndSchedulingDetails);
      setOtherDetailsData(item.OtherDetails);
      console.log("ProductDetails set : ", item.ProductDetails);
      // Bind the values to the form fields using refs to DynamicPanel
      if (wagonDetailsRef && wagonDetailsRef.current && "setFormValues" in wagonDetailsRef.current && typeof wagonDetailsRef.current.setFormValues === "function") {
        console.log("wagon");
        wagonDetailsRef.current.setFormValues(item.WagonDetails || {});
        // Map WagonQuantity and WagonQuantityUOM to the inputdropdown field structure expected by DynamicPanel
        if (item.WagonDetails && wagonDetailsConfig && wagonDetailsConfig.WagonQuantity && wagonDetailsConfig.WagonQuantity.fieldType === "inputdropdown") {
          const wagonQuantityInputDropdown = {
            input: item.WagonDetails.WagonQuantity ?? "",
            dropdown: item.WagonDetails.WagonQuantityUOM ?? ""
          };
          const wagonGrossWeightInputDropdown = {
            input: item.WagonDetails.WagonGrossWeight ?? "",
            dropdown: item.WagonDetails.WagonGrossWeightUOM ?? ""
          };
          const wagonLengthInputDropdown = {
            input: item.WagonDetails.WagonLength ?? "",
            dropdown: item.WagonDetails.WagonLengthUOM ?? ""
          };
          const wagonTareWeightInputDropdown = {
            input: item.WagonDetails.WagonTareWeight ?? "",
            dropdown: item.WagonDetails.WagonTareWeightUOM ?? ""
          };
          wagonDetailsRef.current.setFormValues({
            ...item.WagonDetails,
            WagonType: formatFieldWithName(item.WagonDetails.WagonType, item.WagonDetails.WagonTypeDescription),
            WagonID: formatFieldWithName(item.WagonDetails.WagonID, item.WagonDetails.WagonIDDescription),
            WagonQuantity: wagonQuantityInputDropdown,
            WagonGrossWeight: wagonGrossWeightInputDropdown,
            WagonLength: wagonLengthInputDropdown,
            WagonTareWeight: wagonTareWeightInputDropdown,
          });
        } else {
          wagonDetailsRef.current.setFormValues(item.WagonDetails || {});
        }
      }
      if (containerDetailsRef && containerDetailsRef.current && "setFormValues" in containerDetailsRef.current && typeof containerDetailsRef.current.setFormValues === "function") {
        console.log("container");
        containerDetailsRef.current.setFormValues(item.ContainerDetails || {});
        // Map WagonQuantity and WagonQuantityUOM to the inputdropdown field structure expected by DynamicPanel
        if (item.ContainerDetails && containerDetailsConfig && containerDetailsConfig.ContainerQuantity && containerDetailsConfig.ContainerQuantity.fieldType === "inputdropdown") {
          const ContainerQuantityInputDropdown = {
            input: item.ContainerDetails.ContainerQuantity ?? "",
            dropdown: item.ContainerDetails.ContainerQuantityUOM ?? ""
          };
          const ContainerTareWeightInputDropdown = {
            input: item.ContainerDetails.ContainerTareWeight ?? "",
            dropdown: item.ContainerDetails.ContainerTareWeightUOM ?? ""
          };
          const ContainerLoadWeightInputDropdown = {
            input: item.ContainerDetails.ContainerLoadWeight ?? "",
            dropdown: item.ContainerDetails.ContainerLoadWeightUOM ?? ""
          };
          containerDetailsRef.current.setFormValues({
            ...item.ContainerDetails,
            ContainerType: formatFieldWithName(item.ContainerDetails.ContainerType, item.ContainerDetails.ContainerTypeDescription),
            ContainerID: formatFieldWithName(item.ContainerDetails.ContainerID, item.ContainerDetails.ContainerIDDescription),
            ContainerQuantity: ContainerQuantityInputDropdown,
            ContainerTareWeight: ContainerTareWeightInputDropdown,
            ContainerLoadWeight: ContainerLoadWeightInputDropdown,
          });
        } else {
          containerDetailsRef.current.setFormValues(item.ContainerDetails || {});
        }
      }
      if (productDetailsRef && productDetailsRef.current && "setFormValues" in productDetailsRef.current && typeof productDetailsRef.current.setFormValues === "function") {
        productDetailsRef.current.setFormValues(item.ProductDetails || {});
        if (item.ProductDetails && productDetailsConfig && productDetailsConfig.ProductQuantity && productDetailsConfig.ProductQuantity.fieldType === "inputdropdown") {
          const ProductQuantityInputDropdown = {
            input: item.ProductDetails.ProductQuantity ?? "",
            dropdown: item.ProductDetails.ProductQuantityUOM ?? ""
          };
          productDetailsRef.current.setFormValues({
            ...item.ProductDetails,
            ContainHazardousGoods: formatFieldWithName(item.ProductDetails.ContainHazardousGoods, item.ProductDetails.ContainHazardousGoods),
            NHM: formatFieldWithName(item.ProductDetails.NHM, item.ProductDetails.NHMDescription),
            ProductID: formatFieldWithName(item.ProductDetails.ProductID, item.ProductDetails.ProductIDDescription),
            UNCode: formatFieldWithName(item.ProductDetails.UNCode, item.ProductDetails.UNCodeDescription),
            DGClass: formatFieldWithName(item.ProductDetails.DGClass, item.ProductDetails.DGClassDescription),
            ProductQuantity: ProductQuantityInputDropdown,
          });
        } else {
          productDetailsRef.current.setFormValues(item.ProductDetails || {});
        }
      }
      if (thuDetailsRef && thuDetailsRef.current && "setFormValues" in thuDetailsRef.current && typeof thuDetailsRef.current.setFormValues === "function") {
        thuDetailsRef.current.setFormValues(item.THUDetails || {});
        if (item.THUDetails && thuDetailsConfig && thuDetailsConfig.THUQuantity && thuDetailsConfig.THUQuantity.fieldType === "inputdropdown") {
          const THUQuantityInputDropdown = {
            input: item.THUDetails.THUQuantity ?? "",
            dropdown: item.THUDetails.THUQuantityUOM ?? ""
          };
          const THUWeightInputDropdown = {
            input: item.THUDetails.THUWeight ?? "",
            dropdown: item.THUDetails.THUWeightUOM ?? ""
          };
          thuDetailsRef.current.setFormValues({
            ...item.THUDetails,
            THUID: formatFieldWithName(item.THUDetails.THUID, item.THUDetails.THUIDDescription),
            THUQuantity: THUQuantityInputDropdown,
            THUWeight: THUWeightInputDropdown
          });
        } else {
          thuDetailsRef.current.setFormValues(item.THUDetails || {});
        }
      }
      if (journeyDetailsRef && journeyDetailsRef.current && "setFormValues" in journeyDetailsRef.current && typeof journeyDetailsRef.current.setFormValues === "function") {
        journeyDetailsRef.current.setFormValues(item.JourneyAndSchedulingDetails || {});
        journeyDetailsRef.current.setFormValues({
          ...item.JourneyAndSchedulingDetails,
          Departure: formatFieldWithName(item.JourneyAndSchedulingDetails.Departure, item.JourneyAndSchedulingDetails.DepartureDescription),
          Arrival: formatFieldWithName(item.JourneyAndSchedulingDetails.Arrival, item.JourneyAndSchedulingDetails.ArrivalDescription),
          ActivityLocation: formatFieldWithName(item.JourneyAndSchedulingDetails.ActivityLocation, item.JourneyAndSchedulingDetails.ActivityLocationDescription),
          Activity: formatFieldWithName(item.JourneyAndSchedulingDetails.Activity, item.JourneyAndSchedulingDetails.ActivityDescription),
        });
      }
      if (otherDetailsRef && otherDetailsRef.current && "setFormValues" in otherDetailsRef.current && typeof otherDetailsRef.current.setFormValues === "function") {
        otherDetailsRef.current.setFormValues(item.OtherDetails || {});
        if (item.OtherDetails && otherDetailsConfig && otherDetailsConfig.QCUserDefined1 && otherDetailsConfig.QCUserDefined1.fieldType === "inputdropdown") {
          console.log("item.OtherDetails.QCUserDefined1 ", item.OtherDetails.QCUserDefined1);
          const QCUserDefined1InputDropdown = {
            input: item.OtherDetails.QCUserDefined1Value ?? "",
            dropdown: item.OtherDetails.QCUserDefined1 ?? ""
          };
          const QCUserDefined2InputDropdown = {
            input: item.OtherDetails.QCUserDefined2Value ?? "",
            dropdown: item.OtherDetails.QCUserDefined2 ?? ""
          };
          const QCUserDefined3InputDropdown = {
            input: item.OtherDetails.QCUserDefined3Value ?? "",
            dropdown: item.OtherDetails.QCUserDefined3 ?? ""
          };
          otherDetailsRef.current.setFormValues({
            ...item.OtherDetails,
            QCUserDefined1: QCUserDefined1InputDropdown,
            QCUserDefined2: QCUserDefined2InputDropdown,
            QCUserDefined3: QCUserDefined3InputDropdown,
          });
        } else {
          otherDetailsRef.current.setFormValues(item.OtherDetails || {});
        }
      }
      // setLoading(true);
    }
    // Force update the DynamicPanel forms by triggering a re-render
    // forceUpdate does not exist on DynamicPanelRef, so trigger a re-render by updating a dummy state
    setWagonDetailsData(prev => ({ ...prev }));
    setContainerDetailsData(prev => ({ ...prev }));
    setProductDetailsData(prev => ({ ...prev }));
    setTHUDetailsData(prev => ({ ...prev }));
    setJourneyDetailsData(prev => ({ ...prev }));
    setOtherDetailsData(prev => ({ ...prev }));

    console.log("wagonDetailsData ====", wagonDetailsData);
    setSelectedItemId(item.PlanLineUniqueID || item.ActualLineUniqueID);
    setLoading(true);
  }
  const  addPlanActualItem= () => {
     // Helper to build blank values based on panel config
     const makeBlankValues = (config) => {
       const blank = {};
       Object.entries(config || {}).forEach(([fieldId, cfg]: any) => {
         if (!cfg || cfg.visible === false) return;
         if (cfg.fieldType === 'inputdropdown') {
           blank[fieldId] = { dropdown: '', input: '' };
         } else {
           blank[fieldId] = '';
         }
       });
       return blank;
     };

     // Reset each DynamicPanel via ref with blank values
     try { wagonDetailsRef.current?.setFormValues(makeBlankValues(wagonDetailsConfig)); } catch {}
     try { containerDetailsRef.current?.setFormValues(makeBlankValues(containerDetailsConfig)); } catch {}
     try { productDetailsRef.current?.setFormValues(makeBlankValues(productDetailsConfig)); } catch {}
     try { thuDetailsRef.current?.setFormValues(makeBlankValues(thuDetailsConfig)); } catch {}
     try { journeyDetailsRef.current?.setFormValues(makeBlankValues(journeyDetailsConfig)); } catch {}
     try { otherDetailsRef.current?.setFormValues(makeBlankValues(otherDetailsConfig)); } catch {}

     // Also clear any local raw state mirrors
     setWagonDetailsData({});
     setContainerDetailsData({});
     setProductDetailsData({});
     setTHUDetailsData({});
     setJourneyDetailsData({});
     setOtherDetailsData({});
     setSelectedItemId(undefined);
     setSelectedPlan(undefined);
  }

  const getUserPanelConfig_wagonDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-wagon-details`);
  console.log(`Retrieved config for panel wagon-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_containerDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-container-details`);
  console.log(`Retrieved config for panel container-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_productDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-product-details`);
  console.log(`Retrieved config for panel product-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_thuDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-thu-details`);
  console.log(`Retrieved config for panel thu-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_journeyDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-journey-details`);
  console.log(`Retrieved config for panel journey-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_otherDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-other-details`);
  console.log(`Retrieved config for panel other-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};


const getUserPanelConfig_bulkUpdate = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-bulk-update`);
  console.log(`Retrieved config for panel bulk-update:`, stored);
  return stored ? JSON.parse(stored) : null;
};

const saveUserPanelConfig_wagonDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-wagon-details`, JSON.stringify(settings));
    console.log(`Saved config for panel wagon-details:`, settings);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'PlanAndActualDetailsDrawer',
      ComponentName: 'panel-config-current-user-wagon-details',
      JsonData: settings,
      ModeFlag: wagonDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && wagonDetailsPanelPersonalizationModeFlag === 'Insert') {
        setWagonDetailsPanelPersonalizationModeFlag('Update');
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
    toast({
      title: "Error",
      description: "Failed to save panel preferences",
      variant: "destructive",
    });
  }
};

const saveUserPanelConfig_containerDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-container-details`, JSON.stringify(settings));
    console.log(`Saved config for panel container-details:`, settings);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'PlanAndActualDetailsDrawer',
      ComponentName: 'panel-config-current-user-container-details',
      JsonData: settings,
      ModeFlag: containerDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && containerDetailsPanelPersonalizationModeFlag === 'Insert') {
        setContainerDetailsPanelPersonalizationModeFlag('Update');
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
    toast({
      title: "Error",
      description: "Failed to save panel preferences",
      variant: "destructive",
    });
  }
};

const saveUserPanelConfig_productDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-product-details`, JSON.stringify(settings));
    console.log(`Saved config for panel product-details:`, settings);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'PlanAndActualDetailsDrawer',
      ComponentName: 'panel-config-current-user-product-details',
      JsonData: settings,
      ModeFlag: productDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && productDetailsPanelPersonalizationModeFlag === 'Insert') {
        setProductDetailsPanelPersonalizationModeFlag('Update');
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
    toast({
      title: "Error",
      description: "Failed to save panel preferences",
      variant: "destructive",
    });
  }
};

const saveUserPanelConfig_thuDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-thu-details`, JSON.stringify(settings));
    console.log(`Saved config for panel thu-details:`, settings);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'PlanAndActualDetailsDrawer',
      ComponentName: 'panel-config-current-user-thu-details',
      JsonData: settings,
      ModeFlag: thuDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && thuDetailsPanelPersonalizationModeFlag === 'Insert') {
        setThuDetailsPanelPersonalizationModeFlag('Update');
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
    toast({
      title: "Error",
      description: "Failed to save panel preferences",
      variant: "destructive",
    });
  }
};

const saveUserPanelConfig_journeyDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-journey-details`, JSON.stringify(settings));
    console.log(`Saved config for panel journey-details:`, settings);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'PlanAndActualDetailsDrawer',
      ComponentName: 'panel-config-current-user-journey-details',
      JsonData: settings,
      ModeFlag: journeyDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && journeyDetailsPanelPersonalizationModeFlag === 'Insert') {
        setJourneyDetailsPanelPersonalizationModeFlag('Update');
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
    toast({
      title: "Error",
      description: "Failed to save panel preferences",
      variant: "destructive",
    });
  }
};

const saveUserPanelConfig_otherDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-other-details`, JSON.stringify(settings));
    console.log(`Saved config for panel other-details:`, settings);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'PlanAndActualDetailsDrawer',
      ComponentName: 'panel-config-current-user-other-details',
      JsonData: settings,
      ModeFlag: otherDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && otherDetailsPanelPersonalizationModeFlag === 'Insert') {
        setOtherDetailsPanelPersonalizationModeFlag('Update');
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
    toast({
      title: "Error",
      description: "Failed to save panel preferences",
      variant: "destructive",
    });
  }
};

const saveUserPanelConfig_bulkUpdate = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-bulk-update`, JSON.stringify(settings));
    console.log(`Saved config for panel other-details:`, settings);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'PlanAndActualDetailsDrawer',
      ComponentName: 'panel-config-current-user-bulk-update',
      JsonData: settings,
      ModeFlag: bulkUpdatePanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && bulkUpdatePanelPersonalizationModeFlag === 'Insert') {
        setBulkUpdatePanelPersonalizationModeFlag('Update');
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
    toast({
      title: "Error",
      description: "Failed to save panel preferences",
      variant: "destructive",
    });
  }
};

  return (
    <>
      <div className="flex flex-col h-screen">
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
                  <div className="relative flex border border-gray-300 rounded-md overflow-hidden bg-white text-sm">
                    {/* <select
                      className="w-full px-3 py-2 bg-white text-gray-700 focus:outline-none appearance-none pr-8"
                    >
                      <option>Select Item</option>
                      {resourceGroupArray.map((item: any) => (
                          <option key={item.ResourceUniqueID} value={item.ResourceUniqueID}>{item.ResourceUniqueID}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </span> */}

                    <Select
                      value={defaultResourceId}
                      onValueChange={onResourceValueChange}
                    >
                      <SelectTrigger className="w-full h-10 px-3 py-2 text-gray-700 focus:outline-none appearance-none">
                        <SelectValue placeholder="Select Items" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        {/* <SelectItem value="" className="text-xs">Select Items</SelectItem> */}
                        {resourceGroupArray?.map((item: any, index: number) => (
                          <SelectItem key={item.ResourceUniqueID || index} value={item.ResourceUniqueID} className="text-xs">
                            {`${item?.BillingDetails.InternalOrderNo} || ${item?.ResourceStatus}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <SimpleDropDown
                    list={resourceGroups}
                    value={resourceGroups[0].description}
                    onValueChange={(value) =>
                      handleInputChange("resourceGroup", value)
                    }
                  /> */}
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
                <button className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100" onClick={() => addPlanActualItem()}>
                  <Plus className="w-5 h-5 text-gray-500 cursor-pointer" />
                </button>
              </div>
            </div>
            {/* <div className="flex flex-col gap-4">
              <Input type="text" placeholder="--" value={'--'} readOnly />
            </div> */}
            {/* // ...in your JSX: */}
            <div className="flex flex-col gap-4 planActualLeftScroll">

              {isEditQuickOrder && mappedPlanActualItems.map((item, index) => (
                <div
                  key={'plan-' + index}
                  className={`flex flex-col border rounded-lg p-3 bg-white shadow-sm relative cursor-pointer ${selectedItemId === (item.PlanLineUniqueID || item.ActualLineUniqueID) ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                  onClick={() => getSelectedPlanActualItem(item)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {/* <div className="font-medium text-sm">{(item?.PlanLineUniqueID || item?.ActualLineUniqueID)}  - {item.WagonDetails.WagonID}</div> */}
                      <div className="font-medium text-sm">{index + 1}  - {item.WagonDetails.WagonID}</div>
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
                          setOpenMenuId(openMenuId === (item.PlanLineUniqueID || item.ActualLineUniqueID) ? (item.PlanLineUniqueID || item.ActualLineUniqueID) : (item.PlanLineUniqueID || item.ActualLineUniqueID))
                        }
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {/* Dropdown menu */}
                      {openMenuId === (item.PlanLineUniqueID || item.ActualLineUniqueID) && (
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
                <button
                  className={`rounded-lg p-2 cursor-pointer ${isAllExpanded
                    ? "bg-blue-600 border border-blue-600 hover:bg-blue-700"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                    } h-9 w-9 flex items-center justify-center`}
                  aria-label="Expand/Collapse All"
                  title="Expand/Collapse All"
                  onClick={handleToggleExpandAll}
                >
                  <Expand className={`w-4 h-4 ${isAllExpanded ? "text-white" : "text-gray-700"}`} />
                </button>
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
                      if (wagonDetailsVisible && loading) {
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
                            getUserPanelConfig={getUserPanelConfig_wagonDetails}
                            saveUserPanelConfig={saveUserPanelConfig_wagonDetails}
                            userId="current-user"
                          // panelWidth={basicDetailsWidth}
                            collapsible={true}
                            isExpanded={isWagonExpanded}
                            onOpenChange={setIsWagonExpanded}
                          />
                        );
                        currentTabIndex += wagonDetailsVisibleCount;
                      }

                      if (containerDetailsConfig && loading) {
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
                            getUserPanelConfig={getUserPanelConfig_containerDetails}
                            saveUserPanelConfig={saveUserPanelConfig_containerDetails}
                            userId="current-user"
                            collapsible={true}
                            isExpanded={isContainerExpanded}
                            onOpenChange={setIsContainerExpanded}
                          />
                        );
                        currentTabIndex += containerDetailsVisibleCount;
                      }

                      if (productDetailsConfig && loading) {
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
                            getUserPanelConfig={getUserPanelConfig_productDetails}
                            saveUserPanelConfig={saveUserPanelConfig_productDetails}
                            userId="current-user"
                            collapsible={true}
                            isExpanded={isProductExpanded}
                            onOpenChange={setIsProductExpanded}
                          />
                        );
                        currentTabIndex += productDetailsVisibleCount;
                      }

                      if (thuDetailsConfig && loading) {
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
                            getUserPanelConfig={getUserPanelConfig_thuDetails}
                            saveUserPanelConfig={saveUserPanelConfig_thuDetails}
                            userId="current-user"
                            collapsible={true}
                            isExpanded={isTHUExpanded}
                            onOpenChange={setIsTHUExpanded}
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
                            getUserPanelConfig={getUserPanelConfig_journeyDetails}
                            saveUserPanelConfig={saveUserPanelConfig_journeyDetails}
                            userId="current-user"
                            collapsible={true}
                            isExpanded={isJourneyExpanded}
                            onOpenChange={setIsJourneyExpanded}
                          />
                        );
                        currentTabIndex += journeyDetailsVisibleCount;
                      }

                      if (otherDetailsConfig && loading) {
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
                            getUserPanelConfig={getUserPanelConfig_otherDetails}
                            saveUserPanelConfig={saveUserPanelConfig_otherDetails}
                            userId="current-user"
                            collapsible={true}
                            isExpanded={isOtherExpanded}
                            onOpenChange={setIsOtherExpanded}
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
              disabled={resourceGroupStatus == "Approved"}
              variant="outline"
              onClick={handleConvertPlanActuals}
              className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Convert Plan to Actuals
            </Button>
          )}
          {/* )} */}
          <Button
            disabled={resourceGroupStatus == "Approved"}
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
              getUserPanelConfig={getUserPanelConfig_bulkUpdate}
              saveUserPanelConfig={saveUserPanelConfig_bulkUpdate}
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
