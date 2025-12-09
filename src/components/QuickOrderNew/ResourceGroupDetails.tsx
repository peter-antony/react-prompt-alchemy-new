import React, { useState, useEffect, useRef } from 'react';
import {
  X, Search, Calendar, Clock, Bookmark, Banknote, Wrench, ArrowLeft,
  FileText, BookmarkCheck,
  Plus,
  ChevronDown,
  List,
  LayoutGrid,
  MoreVertical,
  Package,
  AlertTriangle,
  Camera,
  MapPin,
  Link as LinkIcon,
  HousePlug, Box, BaggageClaim, Truck,
  CloudUpload, EyeOff, Filter, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DynamicPanel, type DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { Card } from '@/components/ui/card';
import { BillingDetailsPanel } from './BillingDetails';
import { toast } from 'sonner';
import PlanActIcon from './../../assets/images/planAct.png';
import { SideDrawer } from '../Common/SideDrawer';
import { PlanAndActualDetails } from './PlanAndActualDetails';
import { VerticalStepper } from "../Common/VerticalStepper";
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { useNavigate } from 'react-router-dom';
import { DropdownButton } from '@/components/ui/dropdown-button';
import PlanAndActuals from './PlanAndActuals';
import BulkUpload from '@/components/QuickOrderNew/BulkUpload';
import jsonStore from '@/stores/jsonStore';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import Attachments from './OrderForm/Attachments';
import CardDetails, { CardDetailsItem } from '../Common/Card-View-Details';
import { SimpleDropDown } from "../Common/SimpleDropDown";
import { json } from 'stream/consumers';
import { quickOrderService } from '@/api/services/quickOrderService';
// import { combineInputDropdownValue } from '@/utils/inputDropdown';
import { useToast } from '@/hooks/use-toast';
import { convertCommaToDot, convertDotToComma } from '@/utils/formatter';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResourceGroupDetailsFormProps {
  isEditQuickOrder?: boolean,
  resourceId?: string;
  onSaveSuccess?: () => void; // <-- Add this
  onResourceCreated?: () => void;
  initialStep?: number; // <-- Add this to set initial step
}

// const ResourceGroupDetailsForm = ({ open, onClose }: ResourceGroupDetailsFormProps) => {
export const ResourceGroupDetailsForm = ({ isEditQuickOrder, resourceId, onSaveSuccess, onResourceCreated, initialStep = 1 }: ResourceGroupDetailsFormProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPlanActualsOpen, setIsPlanActualsOpen] = useState(false);
  const [isPlanActualsVisible, setIsPlanActualsVisible] = useState(false);
  const [resourceUniqueId, setResourceUniqueId] = useState(resourceId);
  const [TariffList, setTariffList] = useState([]);
  const { toast } = useToast();
  const [validationResults, setValidationResults] = useState<Record<string, { isValid: boolean; errors: Record<string, string>; mandatoryFieldsEmpty: string[] }>>({});
  
  // Handle initialStep prop changes - only run when initialStep changes from external source
  useEffect(() => {
    if (initialStep && initialStep !== currentStep) {
      console.log('Setting currentStep from initialStep:', initialStep);
      setCurrentStep(initialStep);
    }
  }, [initialStep]);
  const PlaceList = [
    "Bangalore",
    "New Delhi",
    "Gujarat",
    "Surat",
    "Mumbai",
  ];

  const handleProceedToNext = async () => {
      if(resourceGroupStatus!="Approved"){
        const isValid = handleValidateAllPanels();
        if (isValid) {
          // Helper function to truncate at pipe symbol
          const truncateAtPipe = (value: string | null | undefined) => {
            if (typeof value === "string" && value.includes("||")) {
              return value.split("||")[0].trim();
            }
            return value;
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
    
            // convert NetAmount from comma to dot format for backend
            if (newObj.NetAmount !== undefined) {
              newObj.NetAmount = convertCommaToDot(newObj.NetAmount);
            }
    
            console.log("splitDropdowns ===", newObj);
            return newObj;
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
          const formValues = {
            basicDetails: splitDropdowns(basicDetailsRef.current?.getFormValues() || {}),
            operationalDetails: splitDropdowns(operationalDetailsRef.current?.getFormValues() || {}),
            moreInfoDetailsRef: truncateDropdowns(moreInfoDetailsRef.current?.getFormValues() || {}),
            billingDetails: splitDropdowns(billingDetailsRef.current?.getFormValues() || {})
          };
          console.log("resourceId edit next :: ", resourceId);
          if (isEditQuickOrder && resourceId) {
            // setCurrentStep(2);
            formValues.basicDetails = {
              ...formValues.basicDetails,
              "Resource": formValues.basicDetails?.Resource?.value || '',
              "ResourceDescription": formValues.basicDetails?.Resource?.label || '',
              "ResourceType": formValues.basicDetails?.ResourceType?.value || '',
              "ResourceTypeDescription": formValues.basicDetails?.ResourceType?.label || '',
              "ServiceType": formValues.basicDetails?.ServiceType?.value || '',
              "ServiceTypeDescription": formValues.basicDetails?.ServiceType?.label || '',
              "SubServiceType": formValues.basicDetails?.SubServiceType?.value || '',
              "SubServiceTypeDescription": formValues.basicDetails?.SubServiceType?.label || '',
            }
    
            formValues.operationalDetails = {
              ...formValues.operationalDetails,
              "OperationalLocation": formValues.operationalDetails?.OperationalLocation?.value || '',
              "OperationalLocationDesc": formValues.operationalDetails?.OperationalLocation?.label || '',
              "DepartPoint": formValues.operationalDetails?.DepartPoint?.value || '',
              "DepartPointDescription": formValues.operationalDetails?.DepartPoint?.label || '',
              "ArrivalPoint": formValues.operationalDetails?.ArrivalPoint?.value || '',
              "ArrivalPointDescription": formValues.operationalDetails?.ArrivalPoint?.label || '',
            }
    
            formValues.billingDetails = {
              ...formValues.billingDetails,
              "Tariff": formValues.billingDetails?.Tariff?.value || '',
              "TariffIDDescription": formValues.billingDetails?.Tariff?.label || '',
              "TariffType": formValues.billingDetails?.TariffType?.value || '',
              "TariffTypeDescription": formValues.billingDetails?.TariffType?.label || '',
            }
            
            jsonStore.updateResourceGroupDetailsByUniqueID(resourceId, formValues.basicDetails, formValues.operationalDetails, formValues.billingDetails);
            // toast.success("Resource Group Updated Successfully");
            // const fullResourceJson = jsonStore.getJsonData();
            // console.log("AFTER UPDATE FULL RESOURCE JSON :: ", fullResourceJson);
    
            jsonStore.setQuickOrder({
              ...jsonStore.getJsonData().quickOrder,
              // "ModeFlag": "Update",
              // "QuickOrderNo": jsonStore.getQuickUniqueID()
            });
            jsonStore.setResourceJsonData({
              ...jsonStore.getResourceJsonData(),
              "ModeFlag": "Update",
              // "ResourceStatus": "Fresh",
              // "ResourceUniqueID": -1,
            })
    
            /* ------------ compare the json data for changing the modeFlag for submitting ------------- */
            // Get previous data for comparison
            const prevResourceJson = jsonStore.getResourceJsonData();
            // Prepare new data objects
            const newBasicDetails = { ...prevResourceJson.BasicDetails, ...formValues.basicDetails };
            const newOperationalDetails = { ...prevResourceJson.OperationalDetails, ...formValues.operationalDetails };
            const newBillingDetails = { ...prevResourceJson.BillingDetails, ...formValues.billingDetails };
            const newMoreInfoDetails = { ...prevResourceJson.MoreRefDocs, ...formValues.moreInfoDetailsRef };
    
            // Helper function to do a shallow compare of two objects
            const isDifferent = (a, b) => {
              if (!a || !b) return true;
              const aKeys = Object.keys(a);
              const bKeys = Object.keys(b);
              if (aKeys.length !== bKeys.length) return true;
              for (let key of aKeys) {
                if (a[key] !== b[key]) return true;
              }
              return false;
            };
    
            // Determine if any section has changed
            const basicChanged = isDifferent(prevResourceJson.BasicDetails, newBasicDetails);
            const operationalChanged = isDifferent(prevResourceJson.OperationalDetails, newOperationalDetails);
            const billingChanged = isDifferent(prevResourceJson.BillingDetails, newBillingDetails);
            const moreInfoChanged = isDifferent(prevResourceJson.MoreRefDocs, newMoreInfoDetails);
    
            // If any section changed, set ModeFlag to "Update" in the resource group
            let updatedResourceJson = {
              ...prevResourceJson,
              BasicDetails: newBasicDetails,
              OperationalDetails: newOperationalDetails,
              BillingDetails: newBillingDetails,
              MoreRefDocs: newMoreInfoDetails
            };
    
            if (basicChanged || operationalChanged || billingChanged || moreInfoChanged) {
              console.log("if data difference");
              // Update ModeFlag only for the selected resource group object by resourceId
              let resourceGroupsArr = Array.isArray(jsonStore.getQuickOrder().ResourceGroup)
                ? [...jsonStore.getQuickOrder().ResourceGroup]
                : [];
              const selectedResourceId = resourceId;
              resourceGroupsArr = resourceGroupsArr.map((rg: any) => {
                if (rg.ResourceUniqueID === selectedResourceId) {
                  return { ...rg, ModeFlag: "Update" };
                }
                return rg;
              });
              // Also update the ResourceGroup array in the main quick order object
              console.log("resourceGroupsArr", resourceGroupsArr);
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroupsArr
              });
            }
    
            // Update the store with the new data
            jsonStore.setResourceBasicDetails(newBasicDetails);
            jsonStore.setResourceOperationalDetails(newOperationalDetails);
            jsonStore.setResourceBillingDetails(newBillingDetails);
            jsonStore.setResourceMoreInfoDetails(newMoreInfoDetails);
    
            // Also update the ModeFlag in the resource group json in the store
            /* -------- compare the json data for changing the modeFlag for submitting ------------- */
    
            const fullJson = jsonStore.getQuickOrder();
            console.log("proceed to next :: ", fullJson);
            try {
              const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
              console.log(" try", data);
              //  Get OrderNumber from response
              const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
              const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
              const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
              console.log("OrderNumber:", resourceGroupID);
              if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
                toast({
                  title: "✅ Form submitted successfully",
                  description: "Your changes have been saved.",
                  variant: "default", // or "success" if you have custom variant
                });
                setCurrentStep(2);
                // setCurrentStep(2);
              }else{
                // Remove the latest added resource group with ResourceUniqueID: -1 on API error
                  let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
                  // Filter out the resource with ResourceUniqueID: -1
                  console.log("resourceGroups ---", resourceGroups);
                  resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
                  // Update the quick order in the store
                  jsonStore.setQuickOrder({
                    ...jsonStore.getQuickOrder(),
                    ResourceGroup: resourceGroups
                  });
                  const fullJsonElse = jsonStore.getQuickOrder();
                  console.log("Else error :: ", fullJsonElse);
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
                console.log("Parsed result: handle Proceed if", (parsedData?.ResponseResult)[0]);
                // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
                jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const parsedResource=parsedData?.ResponseResult[0].ResourceGroup;
                console.log("parsedREsponse:",parsedData?.ResponseResult[0].ResourceGroup);
                console.log("parsedResource:",parsedResource);
                const index=(parsedResource.length) -1;
    
                setResourceUniqueId(parsedResource[index].ResourceUniqueID);
    
                const fullJson2 = jsonStore.getJsonData();
                
                console.log("RESOURCE SAVE --- FULL JSON 33:: ", fullJson2);
              })
    
            } catch (err) {
              console.log(" catch", err);
              setError(`Error fetching API data for Update ResourceGroup`);
              // Remove the latest added resource group with ResourceUniqueID: -1 on API error
                let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
                // Filter out the resource with ResourceUniqueID: -1
                console.log("resourceGroups ---", resourceGroups);
                resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
                // Update the quick order in the store
                jsonStore.setQuickOrder({
                  ...jsonStore.getQuickOrder(),
                  ResourceGroup: resourceGroups
                });
              toast({
                title: "⚠️ Submission failed",
                description: JSON.parse(err?.data?.Message),
                variant: "destructive", // or "error"
              });
            }
          } 
          else if (isEditQuickOrder && resourceId == undefined || resourceId == "") {
            setBasicDetailsData(formValues.basicDetails);
            setOperationalDetailsData(formValues.operationalDetails);
            setBillingDetailsData(formValues.billingDetails);
            
            localStorage.setItem('resouceCount', (parseInt(localStorage.getItem('resouceCount')) + 1).toString());
            jsonStore.setResourceBasicDetails({
              ...jsonStore.getResourceJsonData().BasicDetails,
              ...formValues.basicDetails,
              "Resource": formValues.basicDetails?.Resource?.value || '',
              "ResourceDescription": formValues.basicDetails?.Resource?.label || '',
              "ResourceType": formValues.basicDetails?.ResourceType?.value || '',
              "ResourceTypeDescription": formValues.basicDetails?.ResourceType?.label || '',
              "ServiceType": formValues.basicDetails?.ServiceType?.value || '',
              "ServiceTypeDescription": formValues.basicDetails?.ServiceType?.label || '',
              "SubServiceType": formValues.basicDetails?.SubServiceType?.value || '',
              "SubServiceTypeDescription": formValues.basicDetails?.SubServiceType?.label || '',
            });
            jsonStore.setResourceOperationalDetails({
              ...jsonStore.getResourceJsonData().OperationalDetails,
              ...formValues.operationalDetails,
              "OperationalLocation": formValues.operationalDetails?.OperationalLocation?.value || '',
              "OperationalLocationDesc": formValues.operationalDetails?.OperationalLocation?.label || '',
              "DepartPoint": formValues.operationalDetails?.DepartPoint?.value || '',
              "DepartPointDescription": formValues.operationalDetails?.DepartPoint?.label || '',
              "ArrivalPoint": formValues.operationalDetails?.ArrivalPoint?.value || '',
              "ArrivalPointDescription": formValues.operationalDetails?.ArrivalPoint?.label || '',
            });
            jsonStore.setResourceBillingDetails({
              ...jsonStore.getResourceJsonData().BillingDetails,
              ...formValues.billingDetails,
              "Tariff": formValues.billingDetails?.Tariff?.value || '',
              "TariffIDDescription": formValues.billingDetails?.Tariff?.label || '',
              "TariffType": formValues.billingDetails?.TariffType?.value || '',
              "TariffTypeDescription": formValues.billingDetails?.TariffType?.label || '',
            });
    
            // Ensure BillingDetails numeric fields are numbers, not strings
            // const billingDetails = {
            //   ...jsonStore.getResourceJsonData().BillingDetails,
            //   ...formValues.billingDetails
            // };
            // Convert fields to numbers if they exist and are not already numbers
            // if (billingDetails.UnitPrice !== undefined) {
            //   billingDetails.UnitPrice = Number(billingDetails.UnitPrice);
            // }
            // if (billingDetails.NetAmount !== undefined) {
            //   billingDetails.NetAmount = Number(billingDetails.NetAmount);
            // }
            // if (billingDetails.BillingQty !== undefined) {
            //   billingDetails.BillingQty = Number(billingDetails.BillingQty);
            // }
    
            // jsonStore.setResourceBillingDetails(billingDetails);
    
            jsonStore.setQuickOrder({
              ...jsonStore.getJsonData().quickOrder,
              // "QuickOrderNo": jsonStore.getQuickUniqueID()
            });
            jsonStore.setResourceJsonData({
              ...jsonStore.getResourceJsonData(),
              "ModeFlag": "Insert",
              "ResourceStatus": "Fresh",
              "ResourceUniqueID": "-1",
              // "QuickOrderNo": jsonStore.getQuickUniqueID()
              // "ResourceUniqueID": "R0" + ((parseInt(localStorage.getItem('resouceCount')) + 1))
            })
            const fullResourceJson = jsonStore.getResourceJsonData();
            console.log("FULL RESOURCE JSON :: ", fullResourceJson);
            jsonStore.pushResourceGroup(fullResourceJson);
            setResourceUniqueId(fullResourceJson.ResourceUniqueID);
    
            const fullJson = jsonStore.getQuickOrder();
            console.log(" BEFORE API FULL  JSON :: ", fullJson);
            try {
              const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
              console.log(" try", data);
              //  Get OrderNumber from response
              const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
              const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
              const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
              console.log("OrderNumber:", resourceGroupID);
              if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
                toast({
                  title: "✅ Form submitted successfully",
                  description: "Your changes have been saved.",
                  variant: "default", // or "success" if you have custom variant
                });
                setCurrentStep(2);
              }else{
                // Remove the latest added resource group with ResourceUniqueID: -1 on API error
                let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
                // Filter out the resource with ResourceUniqueID: -1
                console.log("resourceGroups ---", resourceGroups);
                resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
                // Update the quick order in the store
                jsonStore.setQuickOrder({
                  ...jsonStore.getQuickOrder(),
                  ResourceGroup: resourceGroups
                });
                const fullJsonElse = jsonStore.getQuickOrder();
                console.log("Else error :: ", fullJsonElse);
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
                console.log("Parsed result:  handle Proceed else", (parsedData?.ResponseResult)?.[0]);
                // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
                jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const parsedResource=parsedData?.ResponseResult?.[0].ResourceGroup;
                console.log("parsedREsponse:",parsedData?.ResponseResult?.[0].ResourceGroup);
                console.log("parsedResource:",parsedResource);
                const index=(parsedResource.length) -1;
    
                setResourceUniqueId(parsedResource[index].ResourceUniqueID);
    
                const fullJson2 = jsonStore.getJsonData();
                // setCurrentStep(2);
                console.log("RESOURCE SAVE --- FULL JSON 33:: ", fullJson2);
              })
    
            } catch (err) {
              console.log(" catch", err);
              setError(`Error fetching API data for Update ResourceGroup`);
              // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
              toast({
                title: "⚠️ Submission failed",
                description: JSON.parse(err?.data?.Message),
                variant: "destructive", // or "error"
              });
            }
          } 
          else {
            setBasicDetailsData(formValues.basicDetails);
            setOperationalDetailsData(formValues.operationalDetails);
            setBillingDetailsData(formValues.billingDetails);
    
            // localStorage.setItem('resouceCount', (parseInt(localStorage.getItem('resouceCount')) + 1).toString());
            // setResourceUniqueId("R0" + localStorage.getItem('resouceCount'));
            jsonStore.setResourceBasicDetails({
              ...jsonStore.getResourceJsonData().BasicDetails,
              ...formValues.basicDetails,
              "Resource": formValues.basicDetails?.Resource?.value || '',
              "ResourceDescription": formValues.basicDetails?.Resource?.label || '',
              "ResourceType": formValues.basicDetails?.ResourceType?.value || '',
              "ResourceTypeDescription": formValues.basicDetails?.ResourceType?.label || '',
              "ServiceType": formValues.basicDetails?.ServiceType?.value || '',
              "ServiceTypeDescription": formValues.basicDetails?.ServiceType?.label || '',
              "SubServiceType": formValues.basicDetails?.SubServiceType?.value || '',
              "SubServiceTypeDescription": formValues.basicDetails?.SubServiceType?.label || '',
            });
            jsonStore.setResourceOperationalDetails({
              ...jsonStore.getResourceJsonData().OperationalDetails,
              ...formValues.operationalDetails,
              "OperationalLocation": formValues.operationalDetails?.OperationalLocation?.value || '',
              "OperationalLocationDesc": formValues.operationalDetails?.OperationalLocation?.label || '',
              "DepartPoint": formValues.operationalDetails?.DepartPoint?.value || '',
              "DepartPointDescription": formValues.operationalDetails?.DepartPoint?.label || '',
              "ArrivalPoint": formValues.operationalDetails?.ArrivalPoint?.value || '',
              "ArrivalPointDescription": formValues.operationalDetails?.ArrivalPoint?.label || '',
            });
            jsonStore.setResourceBillingDetails({
              ...jsonStore.getResourceJsonData().BillingDetails,
              ...formValues.billingDetails,
              "Tariff": formValues.billingDetails?.Tariff?.value || '',
              "TariffIDDescription": formValues.billingDetails?.Tariff?.label || '',
              "TariffType": formValues.billingDetails?.TariffType?.value || '',
              "TariffTypeDescription": formValues.billingDetails?.TariffType?.label || '',
            });
            jsonStore.setQuickOrder({
              ...jsonStore.getJsonData().quickOrder,
              "ModeFlag": "Update",
              // "QuickOrderNo": jsonStore.getQuickUniqueID()
            });
            jsonStore.setResourceJsonData({
              ...jsonStore.getResourceJsonData(),
              "ModeFlag": "Insert",
              "ResourceStatus": "Fresh",
              "ResourceUniqueID": -1,
              // "ResourceUniqueID": "R0" + ((parseInt(localStorage.getItem('resouceCount')) + 1))
            })
            const fullResourceJson = jsonStore.getResourceJsonData();
            jsonStore.pushResourceGroup(fullResourceJson);
            const fullJson = jsonStore.getQuickOrder();
            console.log(" BEFORE API FULL  JSON :: ", fullJson);
            try {
              const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
              console.log(" try", data);
              //  Get OrderNumber from response
              const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
              const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
              const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
              console.log("OrderNumber:", resourceGroupID);
              if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
                toast({
                  title: "✅ Form submitted successfully",
                  description: "Your changes have been saved.",
                  variant: "default", // or "success" if you have custom variant
                });
                setCurrentStep(2);
              }else{
                // Remove the latest added resource group with ResourceUniqueID: -1 on API error
                let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
                // Filter out the resource with ResourceUniqueID: -1
                console.log("resourceGroups ---", resourceGroups);
                resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
                // Update the quick order in the store
                jsonStore.setQuickOrder({
                  ...jsonStore.getQuickOrder(),
                  ResourceGroup: resourceGroups
                });
                const fullJsonElse = jsonStore.getQuickOrder();
                console.log("Else error :: ", fullJsonElse);
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
                console.log("Parsed result:  handle Proceed22:", (parsedData?.ResponseResult)?.[0]);
                // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
                jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const parsedResource=parsedData?.ResponseResult?.[0].ResourceGroup;
                console.log("parsedREsponse:",parsedData?.ResponseResult?.[0].ResourceGroup);
                console.log("parsedResource:",parsedResource);
                const index=(parsedResource.length) -1;
    
                setResourceUniqueId(parsedResource[index].ResourceUniqueID);
    
                const fullJson2 = jsonStore.getJsonData();
                // setCurrentStep(2);
                console.log("RESOURCE SAVE --- FULL JSON 33:: ", fullJson2);
              })
    
            } catch (err) {
              console.log(" catch", err);
              setError(`Error fetching API data for Update ResourceGroup`);
              // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
              toast({
                title: "⚠️ Submission failed",
                description: JSON.parse(err?.data?.Message),
                variant: "destructive", // or "error"
              });
            }
            // finally {
            //   if (onSaveSuccess) onSaveSuccess();
            // }
    
          }
        } else {
          toast({
            title: "⚠️ Required fields missing",
            description: `Please enter required fields`,
            variant: "destructive",
          });
        }
      }
    // onSaveDetails();
  };

  const handleFirstStep = () => {
    setCurrentStep(1);
    // Clear the flag so user can re-add plan/actuals
    localStorage.removeItem('planActualsSaved');
    setIsPlanActualsVisible(false);
  };

  const handleSecondStep = () => {
    setCurrentStep(2);
  };

  const bulkUploadFiles = () => {

  };

  const addPlanActuals = () => {

  };

  // Panel refs for getting form values
  const basicDetailsRef = useRef<DynamicPanelRef>(null);
  const operationalDetailsRef = useRef<DynamicPanelRef>(null);
  const moreInfoDetailsRef = useRef<DynamicPanelRef>(null);
  const billingDetailsRef = useRef<DynamicPanelRef>(null);

  const onSaveResourceGroupDetails = async () => {
    if(resourceGroupStatus!="Approved"){

      console.log("isEditQuickOrder", isEditQuickOrder);
      const isValid = handleValidateAllPanels();
      if (isValid) {
        // Helper function to truncate at pipe symbol
        const truncateAtPipe = (value: string | null | undefined) => {
          if (typeof value === "string" && value.includes("||")) {
            return value.split("||")[0].trim();
          }
          return value;
        };
        // Instead of truncating at the "||" symbol, we want to preserve both values.
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

          // convert NetAmount from comma to dot format for backend
          if (newObj.NetAmount !== undefined) {
            newObj.NetAmount = convertCommaToDot(newObj.NetAmount);
          }

          console.log("splitDropdowns ===", newObj);
          return newObj;
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
          console.log("newObj ---", newObj);
          return newObj;
        };

        console.log("getForm ---", basicDetailsRef.current?.getFormValues());
        console.log("getForm ---", operationalDetailsRef.current?.getFormValues());
        const formValues = {
          basicDetails: splitDropdowns(basicDetailsRef.current?.getFormValues() || {}),
          operationalDetails: splitDropdowns(operationalDetailsRef.current?.getFormValues() || {}),
          moreInfoDetailsRef: truncateDropdowns(moreInfoDetailsRef.current?.getFormValues() || {}),
          billingDetails: splitDropdowns(billingDetailsRef.current?.getFormValues() || {})
        };
        console.log("resourceId Before API Call:", resourceId);
        if (isEditQuickOrder && resourceId) {
          console.log("if", formValues.moreInfoDetailsRef);
          formValues.moreInfoDetailsRef = {
            ...formValues.moreInfoDetailsRef,
            "PrimaryDocType": formValues.moreInfoDetailsRef?.PrimaryDocType?.dropdown || null,
            "PrimaryDocNo": formValues.moreInfoDetailsRef?.PrimaryDocType?.input || null,
            "SecondaryDocType": formValues.moreInfoDetailsRef?.SecondaryDocType?.dropdown || null,
            "SecondaryDocNo": formValues.moreInfoDetailsRef?.SecondaryDocType?.input || null,
            "PrimaryDocDate": formValues.moreInfoDetailsRef?.PrimaryDocDate || null,
            "SecondaryDocDate": formValues.moreInfoDetailsRef?.SecondaryDocDate || null,
            "SendersRefNo": formValues.moreInfoDetailsRef?.SendersRefNo || null,
            "CustomerRefNo": formValues.moreInfoDetailsRef?.CustomerRefNo || null,
            "VendorRefNo": formValues.moreInfoDetailsRef?.VendorRefNo || null,
            "PONo": formValues.moreInfoDetailsRef?.PONo || null,

            // Add more fields as needed
          };

          formValues.basicDetails = {
            ...formValues.basicDetails,
            "Resource": formValues.basicDetails?.Resource?.value || '',
            "ResourceDescription": formValues.basicDetails?.Resource?.label || '',
            "ResourceType": formValues.basicDetails?.ResourceType?.value || '',
            "ResourceTypeDescription": formValues.basicDetails?.ResourceType?.label || '',
            "ServiceType": formValues.basicDetails?.ServiceType?.value || '',
            "ServiceTypeDescription": formValues.basicDetails?.ServiceType?.label || '',
            "SubServiceType": formValues.basicDetails?.SubServiceType?.value || '',
            "SubServiceTypeDescription": formValues.basicDetails?.SubServiceType?.label || '',
          }

          formValues.operationalDetails = {
            ...formValues.operationalDetails,
            "OperationalLocation": formValues.operationalDetails?.OperationalLocation?.value || '',
            "OperationalLocationDesc": formValues.operationalDetails?.OperationalLocation?.label || '',
            "DepartPoint": formValues.operationalDetails?.DepartPoint?.value || '',
            "DepartPointDescription": formValues.operationalDetails?.DepartPoint?.label || '',
            "ArrivalPoint": formValues.operationalDetails?.ArrivalPoint?.value || '',
            "ArrivalPointDescription": formValues.operationalDetails?.ArrivalPoint?.label || '',
          }
          
          formValues.billingDetails = {
            ...formValues.billingDetails,
            "Tariff": formValues.billingDetails?.Tariff?.value || '',
            "TariffIDDescription": formValues.billingDetails?.Tariff?.label || '',
            "TariffType": formValues.billingDetails?.TariffType?.value || '',
            "TariffTypeDescription": formValues.billingDetails?.TariffType?.label || '',
          }

          setBasicDetailsData(formValues.basicDetails);
          setOperationalDetailsData(formValues.operationalDetails);
          setBillingDetailsData(formValues.billingDetails);
          setMoreInfoDetailsData(formValues.moreInfoDetailsRef);

          // const originalData = jsonStore.getOriginalQuickOrder();
          // console.log("Original JSON :: ", originalData);
          // const updatedPayload = markUpdatedObjects(originalData, fullJson);
          console.log("updatedPayload ====", formValues.basicDetails)
          console.log("updatedPayload ====", formValues.operationalDetails)

          jsonStore.updateResourceGroupDetailsByUniqueID(resourceId, formValues.basicDetails, formValues.operationalDetails, formValues.billingDetails);

          // Compare old and new data to determine if any changes were made, and set ModeFlag accordingly

          localStorage.setItem('resouceCount', (parseInt(localStorage.getItem('resouceCount')) + 1).toString());

          // toast.success("Resource Group Updated Successfully");
          jsonStore.setQuickOrder({
            ...jsonStore.getJsonData().quickOrder,
            // "ModeFlag": "Update",
            // "QuickOrderNo": jsonStore.getQuickUniqueID()
          });
          console.log("111111111111", jsonStore.getQuickOrder());
          jsonStore.setResourceJsonData({
            ...jsonStore.getResourceJsonData(),
            "ModeFlag": "Update",
            // "ResourceStatus": "Fresh",
            // "ResourceUniqueID": -1,
            // "ResourceUniqueID": "R0" + ((parseInt(localStorage.getItem('resouceCount')) + 1))
          })

          /* ------------ compare the json data for changing the modeFlag for submitting ------------- */
          // Get previous data for comparison
          const prevResourceJson = jsonStore.getResourceJsonData();
          // Prepare new data objects
          const newBasicDetails = { ...prevResourceJson.BasicDetails, ...formValues.basicDetails };
          const newOperationalDetails = { ...prevResourceJson.OperationalDetails, ...formValues.operationalDetails };
          const newBillingDetails = { ...prevResourceJson.BillingDetails, ...formValues.billingDetails };
          const newMoreInfoDetails = { ...prevResourceJson.MoreRefDocs, ...formValues.moreInfoDetailsRef };

          // Helper function to do a shallow compare of two objects
          const isDifferent = (a, b) => {
            if (!a || !b) return true;
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return true;
            for (let key of aKeys) {
              if (a[key] !== b[key]) return true;
            }
            return false;
          };

          // Determine if any section has changed
          const basicChanged = isDifferent(prevResourceJson.BasicDetails, newBasicDetails);
          const operationalChanged = isDifferent(prevResourceJson.OperationalDetails, newOperationalDetails);
          const billingChanged = isDifferent(prevResourceJson.BillingDetails, newBillingDetails);
          const moreInfoChanged = isDifferent(prevResourceJson.MoreRefDocs, newMoreInfoDetails);

          // If any section changed, set ModeFlag to "Update" in the resource group
          let updatedResourceJson = {
            ...prevResourceJson,
            BasicDetails: newBasicDetails,
            OperationalDetails: newOperationalDetails,
            BillingDetails: newBillingDetails,
            MoreRefDocs: newMoreInfoDetails
          };

          if (basicChanged || operationalChanged || billingChanged || moreInfoChanged) {
            console.log("if data difference");
            // Update ModeFlag only for the selected resource group object by resourceId
            let resourceGroupsArr = Array.isArray(jsonStore.getQuickOrder().ResourceGroup)
              ? [...jsonStore.getQuickOrder().ResourceGroup]
              : [];
            const selectedResourceId = resourceId;
            resourceGroupsArr = resourceGroupsArr.map((rg: any) => {
              if (rg.ResourceUniqueID === selectedResourceId) {
                return { ...rg, ModeFlag: "Update" };
              }
              return rg;
            });
            // Also update the ResourceGroup array in the main quick order object
            console.log("resourceGroupsArr", resourceGroupsArr);
            jsonStore.setQuickOrder({
              ...jsonStore.getQuickOrder(),
              ResourceGroup: resourceGroupsArr
            });
          }
          console.log("22222222222", jsonStore.getQuickOrder());
          console.log("newMoreInfoDetails", newMoreInfoDetails);
          let fullResourceJson = newMoreInfoDetails;
          if (fullResourceJson) {
            const {
              Resource,
              ResourceType,
              ServiceType,
              SubServiceType,
              SubSericeType,
              ...restMoreRefDocs
            } = fullResourceJson;
            fullResourceJson = restMoreRefDocs;
          }
          // const fullResourceJson = jsonStore.getResourceJsonData();
          console.log("fullResourceJson:: ", fullResourceJson);
          // Update the store with the new data
          jsonStore.setResourceBasicDetails(newBasicDetails);
          jsonStore.setResourceOperationalDetails(newOperationalDetails);
          jsonStore.setResourceBillingDetails(newBillingDetails);
          jsonStore.setResourceMoreInfoDetails(newMoreInfoDetails);
          // Update the MoreRefDocs field for the selected resource group in the quick order
          let quickOrder = jsonStore.getQuickOrder();
          let resourceGroupsArr = Array.isArray(quickOrder.ResourceGroup)
            ? [...quickOrder.ResourceGroup]
            : [];
          resourceGroupsArr = resourceGroupsArr.map((rg: any) => {
            if (rg.ResourceUniqueID === resourceId) {
              return { ...rg, MoreRefDocs: fullResourceJson };
            }
            return rg;
          });
          jsonStore.setQuickOrder({
            ...quickOrder,
            ResourceGroup: resourceGroupsArr
          });
          console.log("33333333333333", jsonStore.getQuickOrder());
          jsonStore.setResourceJsonData({
            ...jsonStore.getResourceJsonData(),
            MoreRefDocs: newMoreInfoDetails
          })
          
          // Also update the ModeFlag in the resource group json in the store
          /* -------- compare the json data for changing the modeFlag for submitting ------------- */

          const fullJson = jsonStore.getQuickOrder();
          console.log("BEFORE API FULL  JSON :: ", fullJson);
          try {
            const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
            console.log(" try", data);
            //  Get OrderNumber from response
            const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
            const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
            const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
            console.log("OrderNumber:", resourceGroupID);
            console.log("response ===", resourceStatus);
            if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
              toast({
                title: "✅ Form submitted successfully",
                description: "Your changes have been saved.",
                variant: "default", // or "success" if you have custom variant
              });
              //  Fetch the full quick order details
              quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
                let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
                console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
                console.log("Parsed result: save RG", (parsedData?.ResponseResult)[0]);
                // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
                jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const parsedResource=parsedData?.ResponseResult[0].ResourceGroup;
                console.log("parsedREsponse:",parsedData?.ResponseResult[0].ResourceGroup);
                console.log("parsedResource:",parsedResource);
                const index=(parsedResource.length) -1;
                setResourceUniqueId(parsedResource[index].ResourceUniqueID);
                
                // setResourceUniqueId(parsedResource[index].ResourceUniqueID);
                // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const fullJson2 = jsonStore.getJsonData();
                console.log("RESOURCE SAVE --- FULL JSON 33:: ", fullJson2);
                // Dispatch custom event to refresh footer data
                window.dispatchEvent(new CustomEvent('refreshFooterData'));
                onSaveSuccess();
              })
              // onSaveSuccess();
              // onResourceCreated?.();
            }else{
              // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
              const fullJsonElse = jsonStore.getQuickOrder();
              console.log("Else error :: ", fullJsonElse);
              toast({
                title: "⚠️ Submission failed",
                description: isSuccessStatus ? JSON.parse(data?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
                variant: "destructive", // or "success" if you have custom variant
              });
            }
            
          } catch (err) {
            console.log(" catch", err);
            setError(`Error fetching API data for Update ResourceGroup`);
            // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
            toast({
              title: "⚠️ Submission failed",
              description: JSON.parse(err?.data?.Message),
              variant: "destructive", // or "error"
            });
          }

        } else if (isEditQuickOrder && resourceId == undefined || resourceId == "") {
          formValues.moreInfoDetailsRef = {
            ...formValues.moreInfoDetailsRef,
            "PrimaryDocType": formValues.moreInfoDetailsRef?.PrimaryDocType?.dropdown || null,
            "PrimaryDocNo": formValues.moreInfoDetailsRef?.PrimaryDocType?.input || null,
            "SecondaryDocType": formValues.moreInfoDetailsRef?.SecondaryDocType?.dropdown || null,
            "SecondaryDocNo": formValues.moreInfoDetailsRef?.SecondaryDocType?.input || null,
            "PrimaryDocDate": formValues.moreInfoDetailsRef?.PrimaryDocDate || null,
            "SecondaryDocDate": formValues.moreInfoDetailsRef?.SecondaryDocDate || null,
            "SendersRefNo": formValues.moreInfoDetailsRef?.SendersRefNo || null,
            "CustomerRefNo": formValues.moreInfoDetailsRef?.CustomerRefNo || null,
            "VendorRefNo": formValues.moreInfoDetailsRef?.VendorRefNo || null,
            "PONo": formValues.moreInfoDetailsRef?.PONo || null,
            // Add more fields as needed
          };
          console.log("formValues :: ", formValues.basicDetails);
          console.log("formValues :: ", formValues.operationalDetails);
          setBasicDetailsData(formValues.basicDetails);
          setOperationalDetailsData(formValues.operationalDetails);
          setBillingDetailsData(formValues.billingDetails);
          setMoreInfoDetailsData(formValues.moreInfoDetailsRef);
          jsonStore.setQuickOrder({
            ...jsonStore.getJsonData().quickOrder,
            // "ModeFlag": "Update",
            // "QuickOrderNo": jsonStore.getQuickUniqueID()
          });
          // jsonStore.setResourceJsonData({
          //   ...jsonStore.getResourceJsonData(),
          //   "ModeFlag": "Insert",
          //   "ResourceStatus": "Fresh",
          //   "ResourceUniqueID": "-1",
          //   // "ResourceUniqueID": "R0" + ((parseInt(localStorage.getItem('resouceCount')) + 1))
          // })
          localStorage.setItem('resouceCount', (parseInt(localStorage.getItem('resouceCount')) + 1).toString());
          jsonStore.setResourceBasicDetails({
            ...jsonStore.getResourceJsonData().BasicDetails,
            ...formValues.basicDetails,
            "Resource": formValues.basicDetails?.Resource?.value || '',
            "ResourceDescription": formValues.basicDetails?.Resource?.label || '',
            "ResourceType": formValues.basicDetails?.ResourceType?.value || '',
            "ResourceTypeDescription": formValues.basicDetails?.ResourceType?.label || '',
            "ServiceType": formValues.basicDetails?.ServiceType?.value || '',
            "ServiceTypeDescription": formValues.basicDetails?.ServiceType?.label || '',
            "SubServiceType": formValues.basicDetails?.SubServiceType?.value || '',
            "SubServiceTypeDescription": formValues.basicDetails?.SubServiceType?.label || '',
          });
          jsonStore.setResourceOperationalDetails({
            ...jsonStore.getResourceJsonData().OperationalDetails,
            ...formValues.operationalDetails,
            "OperationalLocation": formValues.operationalDetails?.OperationalLocation?.value || '',
            "OperationalLocationDesc": formValues.operationalDetails?.OperationalLocation?.label || '',
            "DepartPoint": formValues.operationalDetails?.DepartPoint?.value || '',
            "DepartPointDescription": formValues.operationalDetails?.DepartPoint?.label || '',
            "ArrivalPoint": formValues.operationalDetails?.ArrivalPoint?.value || '',
            "ArrivalPointDescription": formValues.operationalDetails?.ArrivalPoint?.label || '',
          });
          console.log("]]]]]]]]]]]", formValues.billingDetails);
          jsonStore.setResourceBillingDetails({
            ...jsonStore.getResourceJsonData().BillingDetails,
            ...formValues.billingDetails,
            "Tariff": formValues.billingDetails?.Tariff?.value || '',
            "TariffIDDescription": formValues.billingDetails?.Tariff?.label || '',
            "TariffType": formValues.billingDetails?.TariffType?.value || '',
            "TariffTypeDescription": formValues.billingDetails?.TariffType?.label || '',
          });
          console.log("]]]]]]]]]]]", formValues.billingDetails);
          jsonStore.setResourceMoreInfoDetails({
            ...jsonStore.getResourceJsonData().MoreRefDocs,
            ...formValues.moreInfoDetailsRef
          })
          jsonStore.setResourceJsonData({
            ...jsonStore.getResourceJsonData(),
            "ModeFlag": "Insert",
            "ResourceStatus": "Fresh",
            // "ResourceUniqueID": "R0" + ((parseInt(localStorage.getItem('resouceCount')) + 1))
          })
          // Remove unwanted fields from MoreRefDocs before pushing to ResourceGroup
          let fullResourceJson = { ...jsonStore.getResourceJsonData() };
          if (fullResourceJson.MoreRefDocs) {
            const {
              Resource,
              ResourceType,
              ServiceType,
              SubServiceType,
              SubSericeType,
              ...restMoreRefDocs
            } = fullResourceJson.MoreRefDocs;
            fullResourceJson.MoreRefDocs = restMoreRefDocs;
          }
          // const fullResourceJson = jsonStore.getResourceJsonData();
          console.log("fullResourceJson:: ", fullResourceJson);
          jsonStore.pushResourceGroup(fullResourceJson);
          // const fullResourceJson = jsonStore.getResourceJsonData();
          // console.log("FULL RESOURCE JSON :: ", fullResourceJson);
          // jsonStore.pushResourceGroup(fullResourceJson);
          setResourceUniqueId(fullResourceJson.ResourceUniqueID);
          const fullJson = jsonStore.getQuickOrder();
          console.log("From Edit to add :: ", fullJson);

          try {
            const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
            console.log(" try", data);
            //  Get OrderNumber from response
            const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
            const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
            const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
            console.log("OrderNumber:", resourceGroupID);
            console.log("response ===", resourceStatus);
            if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
              toast({
                title: "✅ Form submitted successfully",
                description: "Your changes have been saved.",
                variant: "default", // or "success" if you have custom variant
              });
              //  Fetch the full quick order details
              quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
                let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
                console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
                console.log("Parsed result: save RG 2", (parsedData?.ResponseResult)[0]);
                // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
                jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const parsedResource=parsedData?.ResponseResult[0].ResourceGroup;
                console.log("parsedREsponse:",parsedData?.ResponseResult[0].ResourceGroup);
                console.log("parsedResource:",parsedResource);
                const index=(parsedResource.length) -1;
                setResourceUniqueId(parsedResource[index].ResourceUniqueID);

                // setResourceUniqueId(parsedResource[index].ResourceUniqueID);
                // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const fullJson2 = jsonStore.getJsonData();
                
                console.log("RESOURCE SAVE --- FULL JSON 33:: ", fullJson2);
                onSaveSuccess();
                onResourceCreated?.();
              })
            }else{
              // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
              const fullJsonElse = jsonStore.getQuickOrder();
              console.log("Else error :: ", fullJsonElse);
              toast({
                title: "⚠️ Submission failed",
                description: isSuccessStatus ? JSON.parse(data?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
                variant: "destructive", // or "success" if you have custom variant
              });
            }
            
          } catch (err) {
            console.log(" catch", err);
            setError(`Error fetching API data for Update ResourceGroup`);
            // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
            toast({
              title: "⚠️ Submission failed",
              description: JSON.parse(err?.data?.Message),
              variant: "destructive", // or "error"
            });
          }

        } else {
          formValues.moreInfoDetailsRef = {
            ...formValues.moreInfoDetailsRef,
            "PrimaryDocType": formValues.moreInfoDetailsRef?.PrimaryDocType?.dropdown || null,
            "PrimaryDocNo": formValues.moreInfoDetailsRef?.PrimaryDocType?.input || null,
            "SecondaryDocType": formValues.moreInfoDetailsRef?.SecondaryDocType?.dropdown || null,
            "SecondaryDocNo": formValues.moreInfoDetailsRef?.SecondaryDocType?.input || null,
            "PrimaryDocDate": formValues.moreInfoDetailsRef?.PrimaryDocDate || null,
            "SecondaryDocDate": formValues.moreInfoDetailsRef?.SecondaryDocDate || null,
            "SendersRefNo": formValues.moreInfoDetailsRef?.SendersRefNo || null,
            "CustomerRefNo": formValues.moreInfoDetailsRef?.CustomerRefNo || null,
            "VendorRefNo": formValues.moreInfoDetailsRef?.VendorRefNo || null,
            "PONo": formValues.moreInfoDetailsRef?.PONo || null,
            // Add more fields as needed
          };
          console.log("formValues :: ", formValues.basicDetails);
          console.log("formValues :: ", formValues.operationalDetails);

          setBasicDetailsData(formValues.basicDetails);
          setOperationalDetailsData(formValues.operationalDetails);
          setBillingDetailsData(formValues.billingDetails);
          setMoreInfoDetailsData(formValues.moreInfoDetailsRef);
          // localStorage.setItem('resouceCount', (parseInt(localStorage.getItem('resouceCount')) + 1).toString());
          // setResourceUniqueId("R0" + localStorage.getItem('resouceCount'));
          jsonStore.setResourceBasicDetails({
            ...jsonStore.getResourceJsonData().BasicDetails,
            ...formValues.basicDetails,
            "Resource": formValues.basicDetails?.Resource?.value || '',
            "ResourceDescription": formValues.basicDetails?.Resource?.label || '',
            "ResourceType": formValues.basicDetails?.ResourceType?.value || '',
            "ResourceTypeDescription": formValues.basicDetails?.ResourceType?.label || '',
            "ServiceType": formValues.basicDetails?.ServiceType?.value || '',
            "ServiceTypeDescription": formValues.basicDetails?.ServiceType?.label || '',
            "SubServiceType": formValues.basicDetails?.SubServiceType?.value || '',
            "SubServiceTypeDescription": formValues.basicDetails?.SubServiceType?.label || '',
            // "ResourceType": "20FT Container",
          });
          jsonStore.setResourceOperationalDetails({
            ...jsonStore.getResourceJsonData().OperationalDetails,
            ...formValues.operationalDetails,
            "OperationalLocation": formValues.operationalDetails?.OperationalLocation?.value || '',
            "OperationalLocationDesc": formValues.operationalDetails?.OperationalLocation?.label || '',
            "DepartPoint": formValues.operationalDetails?.DepartPoint?.value || '',
            "DepartPointDescription": formValues.operationalDetails?.DepartPoint?.label || '',
            "ArrivalPoint": formValues.operationalDetails?.ArrivalPoint?.value || '',
            "ArrivalPointDescription": formValues.operationalDetails?.ArrivalPoint?.label || '',
          });
          jsonStore.setResourceBillingDetails({
            ...jsonStore.getResourceJsonData().BillingDetails,
            ...formValues.billingDetails,
            "Tariff": formValues.billingDetails?.Tariff?.value || '',
            "TariffIDDescription": formValues.billingDetails?.Tariff?.label || '',
            "TariffType": formValues.billingDetails?.TariffType?.value || '',
            "TariffTypeDescription": formValues.billingDetails?.TariffType?.label || '',
          });
          jsonStore.setResourceMoreInfoDetails({
            ...jsonStore.getResourceJsonData().MoreRefDocs,
            ...formValues.moreInfoDetailsRef
          })
          jsonStore.setQuickOrder({
            ...jsonStore.getJsonData().quickOrder,
            // "ModeFlag": "Update",
            // "QuickOrderNo": jsonStore.getQuickUniqueID()
          });
          jsonStore.setResourceJsonData({
            ...jsonStore.getResourceJsonData(),
            "ModeFlag": "Insert",
            "ResourceStatus": "Fresh",
            "ResourceUniqueID": -1,
            // "ResourceUniqueID": "R0" + ((parseInt(localStorage.getItem('resouceCount')) + 1))
          })
          // Remove unwanted fields from MoreRefDocs before pushing to ResourceGroup
          let fullResourceJson = { ...jsonStore.getResourceJsonData() };
          if (fullResourceJson.MoreRefDocs) {
            const {
              Resource,
              ResourceType,
              ServiceType,
              SubServiceType,
              SubSericeType,
              ...restMoreRefDocs
            } = fullResourceJson.MoreRefDocs;
            fullResourceJson.MoreRefDocs = restMoreRefDocs;
          }
          // const fullResourceJson = jsonStore.getResourceJsonData();
          console.log("fullResourceJson:: ", fullResourceJson);
          jsonStore.pushResourceGroup(fullResourceJson);
          // const fullResourceJson = jsonStore.getResourceJsonData();
          // jsonStore.pushResourceGroup(fullResourceJson);
          const fullJson = jsonStore.getQuickOrder();
          console.log(" BEFORE API FULL  JSON :: ", fullJson);
          try {
            const data: any = await quickOrderService.updateQuickOrderResource(fullJson);
            console.log(" try", data);
            //  Get OrderNumber from response
            const resourceGroupID = JSON.parse(data?.data?.ResponseData)[0].QuickUniqueID;
            const resourceStatus = JSON.parse(data?.data?.ResponseData)[0].Status;
            const isSuccessStatus = JSON.parse(data?.data?.IsSuccess);
            console.log("OrderNumber:", resourceGroupID);
            console.log("response ===", resourceStatus);
            if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
              toast({
                title: "✅ Form submitted successfully",
                description: "Your changes have been saved.",
                variant: "default", // or "success" if you have custom variant
              });
              //  Fetch the full quick order details
              quickOrderService.getQuickOrder(resourceGroupID).then((fetchRes: any) => {
                let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
                console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
                console.log("Parsed result: save RG 3", (parsedData?.ResponseResult)[0]);
                // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
                jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const parsedResource=parsedData?.ResponseResult[0].ResourceGroup;
                console.log("parsedREsponse:",parsedData?.ResponseResult[0].ResourceGroup);
                console.log("parsedResource:",parsedResource);
                const index=(parsedResource.length) -1;
                setResourceUniqueId(parsedResource[index].ResourceUniqueID);

                // setResourceUniqueId(parsedResource[index].ResourceUniqueID);
                // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
                const fullJson2 = jsonStore.getJsonData();
                
                console.log("RESOURCE SAVE --- FULL JSON 33:: ", fullJson2);
                onSaveSuccess();
                onResourceCreated?.();              
              })
            }else{
              // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
              const fullJsonElse = jsonStore.getQuickOrder();
              console.log("Else error :: ", fullJsonElse);
              toast({
                title: "⚠️ Submission failed",
                description: isSuccessStatus ? JSON.parse(data?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
                // description: data?.Message,
                variant: "destructive", // or "success" if you have custom variant
              });
            }

          } catch (err) {
            console.log(" catch", err);
            setError(`Error fetching API data for Update ResourceGroup`);
            // Remove the latest added resource group with ResourceUniqueID: -1 on API error
              let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
              // Filter out the resource with ResourceUniqueID: -1
              console.log("resourceGroups ---", resourceGroups);
              resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
              // Update the quick order in the store
              jsonStore.setQuickOrder({
                ...jsonStore.getQuickOrder(),
                ResourceGroup: resourceGroups
              });
            toast({
              title: "⚠️ Submission failed",
              description: JSON.parse(err?.data?.Message),
              variant: "destructive", // or "error"
            });
          }

          finally {
            // if (onSaveSuccess) onSaveSuccess();
          }

        }
      } else {
        toast({
          title: "⚠️ Required fields missing",
          description: `Please enter required fields`,
          variant: "destructive",
        });
      }
    }
    // if (currentStep == 1) {
    //   //Closing ResourceGroupDetails Modal
    // }

  }

  const onSavePlanActualsGridDetails = async () => {
    console.log("onSavePlanActualsGridDetails");
    onSaveSuccess();
  }

  function markUpdatedObjects(original: any, updated: any): any {
    if (!original || !updated) return updated;

    const result = updated;

    if (Array.isArray(original) && Array.isArray(updated)) {
      return updated.map((item, index) => markUpdatedObjects(original[index], item));
    }

    if (isObject(original) && isObject(updated)) {
      // ✅ For objects with ModeFlag
      if (updated.ResourceUniqueID && "ModeFlag" in updated) {
        const changed = hasChanges({ ...original, ModeFlag: undefined }, { ...updated, ModeFlag: undefined });
        result.ModeFlag = changed ? "Update" : "NoChange";
      }

      // ✅ Recursively check children
      Object.keys(updated).forEach((key) => {
        if (isObject(updated[key]) || Array.isArray(updated[key])) {
          result[key] = markUpdatedObjects(original[key], updated[key]);
        }
      });
    }
    console.log("result ===", result);
    return result;
  }

  function isObject(val: any) {
    return val && typeof val === "object" && !Array.isArray(val);
  }

  function hasChanges(original: any, updated: any): boolean {
    if (original === updated) return false;
    if (typeof original !== typeof updated) return true;

    if (isObject(original) && isObject(updated)) {
      return Object.keys({ ...original, ...updated }).some((key) =>
        hasChanges(original[key], updated[key])
      );
    }

    return original !== updated;
  }

  const handleValidateAllPanels = () => {
    const results: Record<string, { isValid: boolean; errors: Record<string, string>; mandatoryFieldsEmpty: string[] }> = {};
    let overallValid = true;
    let totalErrors = 0;

    // Validate Basic Details
    if (basicDetailsVisible && basicDetailsRef.current) {
      const basicValidation = basicDetailsRef.current.doValidation();
      results['basic-details'] = basicValidation;
      if (!basicValidation.isValid) {
        overallValid = false;
        totalErrors += Object.keys(basicValidation.errors).length;
      }
    }

    // Validate Operational Details
    if (operationalDetailsVisible && operationalDetailsRef.current) {
      const operationalValidation = operationalDetailsRef.current.doValidation();
      results['operational-details'] = operationalValidation;
      if (!operationalValidation.isValid) {
        overallValid = false;
        totalErrors += Object.keys(operationalValidation.errors).length;
      }
    }

    // Validate Billing Details
    if (billingDetailsVisible && billingDetailsRef.current) {
      const billingValidation = billingDetailsRef.current.doValidation();
      results['billing-details'] = billingValidation;
      if (!billingValidation.isValid) {
        overallValid = false;
        totalErrors += Object.keys(billingValidation.errors).length;
      }
    }

    setValidationResults(results);

    // Show toast notification
    // if (overallValid) {
    //   toast({
    //     title: "Validation Successful",
    //     description: "All mandatory fields are filled and valid.",
    //     variant: "default",
    //   });
    // } else {
    //   toast({
    //     title: "Validation Failed",
    //     description: `${totalErrors} validation error(s) found. Please check the highlighted fields.`,
    //     variant: "destructive",
    //   });
    // }

    return overallValid;
  };

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

  // Utility to normalize keys from store to config field IDs
  function normalizeBasicDetails(data) {
    // Generic helper to format a field with its name, fallback to '--' if name is empty/null
    return {
      Resource: formatFieldWithName(data.Resource, data.ResourceDescription),
      ResourceType: formatFieldWithName(data.ResourceType, data.ResourceTypeDescription),
      ServiceType: formatFieldWithName(data.ServiceType, data.ServiceTypeDescription),
      SubServiceType: formatFieldWithName(data.SubServiceType, data.SubServiceTypeDescription),
      // Resource: (data.Resource ? data.Resource : '') + (data.ResourceDescription ? ' || ' + data.ResourceDescription : ''),
      // ResourceType: (data.ResourceType ? data.ResourceType : '') + (data.ResourceTypeDescription ? ' || ' + data.ResourceTypeDescription : ''),
      // ServiceType: (data.ServiceType ? data.ServiceType : '') + (data.ServiceTypeDescription ? ' || ' + data.ServiceTypeDescription : ''),
      // SubServiceType: (data.SubServiceType ? data.SubServiceType : '') + (data.SubServiceTypeDescription ? ' || ' + data.SubServiceTypeDescription : ''),
      // Resource: data.Resource,
      // ResourceType: data.ResourceType,
      // ServiceType: data.ServiceType,
      // SubServiceType: data.SubServiceType, // fix typo if needed
    };
  }

  function normalizeOperationalDetails(data) {
    console.log("data .... operational", data);
    // Generic helper to format a field with its name, fallback to '--' if name is empty/null
    if (data)
      return {
        // OperationalLocation: data.OperationalLocation,
        OperationalLocation: formatFieldWithName(data.OperationalLocation, data.OperationalLocationDesc),
        DepartPoint: formatFieldWithName(data.DepartPoint, data.DepartPointDescription),
        ArrivalPoint: formatFieldWithName(data.ArrivalPoint, data.ArrivalPointDescription),
        // DepartPoint: data.DepartPoint,
        // ArrivalPoint: data.ArrivalPoint,
        FromDate: "",
        FromTime: data.FromTime,
        ToDate: "",
        ToTime: data.ToTime,
        Remarks: data.Remarks,
      };
  }

  function normalizeMoreInfoDetails(data) {
    console.log("data normalizeMoreInfoDetails ====", data);
    if (data)
      return {
      PrimaryDocType: data.PrimaryDocType,
      PrimaryDocNo: data.PrimaryDocNo,
      PrimaryDocDate: data.PrimaryDocDate,
      SecondaryDocType: data.SecondaryDocType,
      SecondaryDocNo: data.SecondaryDocNo,
      SecondaryDocDate: data.SecondaryDocDate,
      SendersRefNo: data.SendersRefNo,
      CustomerRefNo: data.CustomerRefNo,
      VendorRefNo: data.VendorRefNo,
      PONo: data.PONo,
      // PrimaryDocTypeValue:data.PrimaryDocTypeValue,
      // SecondaryDocType:data.SecondaryDocType,
      // SecondaryDocTypeValue:data.SecondaryDocTypeValue,
      // PrimaryDocDate:data.PrimaryDocDate,
      // SecondaryDocDate:data.SecondaryDocDate
      };
  }

  const parseDDMMYYYY = (dateStr) => {
    // Expects dateStr in 'DD/MM/YYYY'
    const [day, month, year] = dateStr.split('/').map(Number);
    // JS Date: months are 0-based
    return new Date(year, month - 1, day);
  }

  function normalizeBillingDetails(data) {
    console.log("data ....", data);
    // Generic helper to format a field with its name, fallback to '--' if name is empty/nul
    // This function normalizes billing details data so it can be used as initial values for billingDetailsForm.
    // It ensures the form fields are pre-filled with the correct values from the store.
    if (!data || typeof data !== 'object') return {};
    return {
      ContractPrice: data.ContractPrice ?? 0,
      NetAmount: convertDotToComma(data.NetAmount ?? 0), // convert dot to comma for display
      BillingType: data.BillingType ?? '',
      UnitPrice: data.UnitPrice ?? 0,
      BillingQty: data.BillingQty ?? '',
      // Tariff: data.Tariff ?? '',
      Tariff: formatFieldWithName(data.Tariff, data.TariffIDDescription),
      TariffType: formatFieldWithName(data.TariffType, data.TariffTypeDescription),
      BillingRemarks: data.BillingRemarks ?? '',
    };
  }

  const getInitialBasicDetails = () =>
    isEditQuickOrder
      ? normalizeBasicDetails(jsonStore.getBasicDetailsByResourceUniqueID(resourceId) || {})
      : {};

  const getInitialOperationalDetails = () =>
    isEditQuickOrder
      ? normalizeOperationalDetails(jsonStore.getOperationalDetailsByResourceUniqueID(resourceId) || {})
      : {};

  const getInitialMoreInfoDetails = () =>
    isEditQuickOrder
      ? normalizeMoreInfoDetails(jsonStore.getMoreInfoDetailsByResourceUniqueID(resourceId) || {})
      : {};

  const getInitialBillingDetails = () =>
    isEditQuickOrder
      ? normalizeBillingDetails(jsonStore.getBillingDetailsByResourceUniqueID(resourceId) || {})
      : {};

  const [basicDetailsData, setBasicDetailsData] = useState(getInitialBasicDetails);
  const [operationalDetailsData, setOperationalDetailsData] = useState(getInitialOperationalDetails);
  const [moreInfoDetailsData, setMoreInfoDetailsData] = useState(getInitialMoreInfoDetails);
  const [billingDetailsData, setBillingDetailsData] = useState(getInitialBillingDetails);

  // Panel titles state
  const [basicDetailsTitle, setBasicDetailsTitle] = useState('Basic Details');
  const [operationalDetailsTitle, setOperationalDetailsTitle] = useState('Operational Details');
  const [moreInfoTitle, setmoreInfoTitle] = useState('More Info');
  const [billingDetailsTitle, setBillingDetailsTitle] = useState('Billing Details');

  // Panel visibility state
  const [basicDetailsVisible, setBasicDetailsVisible] = useState(true);
  const [operationalDetailsVisible, setOperationalDetailsVisible] = useState(true);
  const [moreInfoVisible, setMoreInfoVisible] = useState(true);
  const [billingDetailsVisible, setBillingDetailsVisible] = useState(true);
  const [resourceList, setResourceList] = useState<any[]>([]);
  const [resourceTypeList, setResourceTypeList] = useState<any[]>([]);
  const [serviceTypeList, setServiceTypeList] = useState<any[]>([]);
  const [subServiceTypeList, setSubServiceTypeList] = useState<any[]>([]);
  const [departList, setDepartList] = useState<any[]>([]);
  const [arrivalList, setArrivalList] = useState<any[]>([]);
  const [billingTypeList, setBillingTypeList] = useState<any[]>([]);
  const [primaryRefDocType, setPrimaryRefDocType] = useState<any[]>([]);
  const [secondaryRefDocType, setSecondaryRefDocType] = useState<any[]>([]);
  const [locationList, setLocationList] = useState<any[]>([]);


  // Remove: const [billingData, setBillingData] = useState(jsonStore.getBillingDetails() || {})

  const [view, setView] = useState("list");

  // State for Panel Personalization Mode Flags
  const [basicDetailsPanelPersonalizationModeFlag, setBasicDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
  const [operationalDetailsPanelPersonalizationModeFlag, setOperationalDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
  const [moreInfoPanelPersonalizationModeFlag, setMoreInfoPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
  const [billingDetailsPanelPersonalizationModeFlag, setBillingDetailsPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');

  // Fetch Basic Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ResourceGroupDetailsDrawer',
        ComponentName: 'panel-config-current-user-basic-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-basic-details', JSON.stringify(personalizationData.JsonData));
          }
          setBasicDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setBasicDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setBasicDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load basic details panel personalization:', error);
      setBasicDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch Operational Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ResourceGroupDetailsDrawer',
        ComponentName: 'panel-config-current-user-operational-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-operational-details', JSON.stringify(personalizationData.JsonData));
          }
          setOperationalDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setOperationalDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setOperationalDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load operational details panel personalization:', error);
      setOperationalDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch More Info panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ResourceGroupDetailsDrawer',
        ComponentName: 'panel-config-current-user-more-info'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-more-info', JSON.stringify(personalizationData.JsonData));
          }
          setMoreInfoPanelPersonalizationModeFlag('Update');
        } else {
          setMoreInfoPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setMoreInfoPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load more info panel personalization:', error);
      setMoreInfoPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

// Fetch Billing Details panel personalization
useEffect(() => {
  const fetchPanelPersonalization = async () => {
    try {
      const personalizationResponse: any = await quickOrderService.getPersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'ResourceGroupDetailsDrawer',
        ComponentName: 'panel-config-current-user-billing-details'
      });
      if (personalizationResponse?.data?.ResponseData) {
        const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
        if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
          const personalizationData = parsedPersonalization.PersonalizationResult[0];
          if (personalizationData.JsonData) {
            localStorage.setItem('panel-config-current-user-billing-details', JSON.stringify(personalizationData.JsonData));
          }
          setBillingDetailsPanelPersonalizationModeFlag('Update');
        } else {
          setBillingDetailsPanelPersonalizationModeFlag('Insert');
        }
      } else {
        setBillingDetailsPanelPersonalizationModeFlag('Insert');
      }
    } catch (error) {
      console.error('Failed to load billing details panel personalization:', error);
      setBillingDetailsPanelPersonalizationModeFlag('Insert');
    }
  };
  fetchPanelPersonalization();
}, []);

  // Mock functions for user config management
  const getUserPanelConfig = (userId: string, panelId: string): PanelSettings | null => {
    const stored = localStorage.getItem(`panel-config-${userId}-${panelId}`);
    return stored ? JSON.parse(stored) : null;
  };

  const getUserPanelConfig_basicDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-basic-details`);
  console.log(`Retrieved config for panel basic-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_operationalDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-operational-details`);
  console.log(`Retrieved config for panel operational-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_moreInfo = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-more-info`);
  console.log(`Retrieved config for panel more-info:`, stored);
  return stored ? JSON.parse(stored) : null;
};
const getUserPanelConfig_billingDetails = (userId: string, panelId: string): PanelSettings | null => {
  const stored = localStorage.getItem(`panel-config-current-user-billing-details`);
  console.log(`Retrieved config for panel billing-details:`, stored);
  return stored ? JSON.parse(stored) : null;
};

  const saveUserPanelConfig = (userId: string, panelId: string, settings: PanelSettings): void => {
    localStorage.setItem(`panel-config-${userId}-${panelId}`, JSON.stringify(settings));
    console.log(`Saved config for panel ${panelId}:`, settings);
  };

  const saveUserPanelConfig_basicDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-basic-details`, JSON.stringify(settings));
    console.log(`Saved config for panel basic-details:`, settings);
    const preferencesToSave = settings;
    console.log('Saving BasicDetails Panel preferences:', preferencesToSave);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'ResourceGroupDetailsDrawer',
      ComponentName: 'panel-config-current-user-basic-details',
      JsonData: preferencesToSave,
      ModeFlag: basicDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && basicDetailsPanelPersonalizationModeFlag === 'Insert') {
        setBasicDetailsPanelPersonalizationModeFlag('Update');
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

const saveUserPanelConfig_operationalDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-operational-details`, JSON.stringify(settings));
    console.log(`Saved config for panel operational-details:`, settings);
    const preferencesToSave = settings;
    console.log('Saving operationalDetails Panel preferences:', preferencesToSave);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'ResourceGroupDetailsDrawer',
      ComponentName: 'panel-config-current-user-operational-details',
      JsonData: preferencesToSave,
      ModeFlag: operationalDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && operationalDetailsPanelPersonalizationModeFlag === 'Insert') {
        setOperationalDetailsPanelPersonalizationModeFlag('Update');
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

const saveUserPanelConfig_moreInfo = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-more-info`, JSON.stringify(settings));
    console.log(`Saved config for panel more-info:`, settings);
    const preferencesToSave = settings;
    console.log('Saving MoreInfo Panel preferences:', preferencesToSave);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'ResourceGroupDetailsDrawer',
      ComponentName: 'panel-config-current-user-more-info',
      JsonData: preferencesToSave,
      ModeFlag: moreInfoPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && moreInfoPanelPersonalizationModeFlag === 'Insert') {
        setMoreInfoPanelPersonalizationModeFlag('Update');
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

const saveUserPanelConfig_billingDetails = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
  try {
    localStorage.setItem(`panel-config-current-user-billing-details`, JSON.stringify(settings));
    console.log(`Saved config for panel billing-details:`, settings);
    const preferencesToSave = settings;
    console.log('Saving billingDetails Panel preferences:', preferencesToSave);
    const response: any = await quickOrderService.savePersonalization({
      LevelType: 'User',
      // LevelKey: 'ramcouser',
      ScreenName: 'ResourceGroupDetailsDrawer',
      ComponentName: 'panel-config-current-user-billing-details',
      JsonData: preferencesToSave,
      ModeFlag: billingDetailsPanelPersonalizationModeFlag
    });
    const apiData = response?.data;
    if (apiData) {
      const isSuccess = JSON.parse(response.data.IsSuccess);
      toast({
        title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
        description: apiData?.Message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess && billingDetailsPanelPersonalizationModeFlag === 'Insert') {
        setBillingDetailsPanelPersonalizationModeFlag('Update');
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

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [resourceGroupStatus, setResourceGroupStatus] = useState("Fresh");
  const [currency, setCurrency] = useState("EUR");
  const messageTypes = [
    // "Quick Order Resource Combo Init",
    // "ResourceType Init",
    // "Service type Init",
    // "Sub Service type Init",
    "Quick Order Billing Type Init",
    "ResourceGroup PrimaryRefDocType",
    "ResourceGroup SecondaryRefDocType",
    // "Arrival Init",
    // "Departure Init",
    // "Location Init",
  ];
  useEffect(() => {
    fetchAll();

  }, []);
  useEffect(() => {
    setLoading(false);
    console.log("load data=== ", jsonStore.getQuickUniqueID());
    console.log("load % data getQuickOrder=== ", jsonStore.getQuickOrder().Currency);
    setCurrency(jsonStore.getQuickOrder().Currency)
    const cur=jsonStore.getQuickOrder().Currency;
    console.log("jsonStore.getResourceGroupBasicDetails() == ", jsonStore.getResourceGroupBasicDetails())

    console.log("load isEditQuickOrder ", isEditQuickOrder);
    quickOrderService.getQuickOrder(jsonStore.getQuickUniqueID()).then((fetchRes: any) => {
      console.log("fetchRes:: ", fetchRes);
      let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
      console.log("screenFetchQuickOrder result USE EFFECts:", JSON.parse(fetchRes?.data?.ResponseData));
      console.log("Parsed result: useeffect", (parsedData?.ResponseResult)[0]);
      console.log("Parsed id:", (parsedData?.ResponseResult)[0]);
      jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
      jsonStore.setQuickOrderFields({  Currency: cur });

      const fullJson2 = jsonStore.getJsonData();
      console.log("FULL JSON --RESOURCE GROUP 33:: ", fullJson2?.ResourceGroup);
    })
    console.log("load resourceId == ", resourceId)
    if (isEditQuickOrder && resourceId) {
      setResourceGroupStatus(jsonStore.getResourceStatusByUniqueID(resourceId));
      setBasicDetailsData(normalizeBasicDetails(jsonStore.getBasicDetailsByResourceUniqueID(resourceId) || {}));
      setOperationalDetailsData(normalizeOperationalDetails(jsonStore.getOperationalDetailsByResourceUniqueID(resourceId) || {}));
      // Get the raw MoreInfo details from the store
      const rawMoreInfo = jsonStore.getMoreInfoDetailsByResourceUniqueID(resourceId) || {};
      console.log("rawMoreInfo ====", rawMoreInfo);
      // Helper to normalize dropdown+input fields (inputDropdown) and date fields
      const normalizeMoreInfoDetailsWithInputDropdown = (data) => {
        return {
          PrimaryDocType: {
            dropdown: data.PrimaryDocType || "",
            input: data.PrimaryDocNo || ""
          },
          SecondaryDocType: {
            dropdown: data.SecondaryDocType || "",
            input: data.SecondaryDocNo || ""
          },
          PrimaryDocDate: data.PrimaryDocDate || "",
          SecondaryDocDate: data.SecondaryDocDate || "",
          SendersRefNo: data.SendersRefNo || "",
          CustomerRefNo: data.CustomerRefNo || "",
          VendorRefNo: data.VendorRefNo || "",
          PONo: data.PONo || "",
          // Add more fields as needed, following the same pattern
        };
      };
      console.log("rawMoreInfo ===", rawMoreInfo);
      setMoreInfoDetailsData(normalizeMoreInfoDetailsWithInputDropdown(rawMoreInfo));
      setBillingDetailsData(normalizeBillingDetails(jsonStore.getBillingDetailsByResourceUniqueID(resourceId) || {}));
      console.log("resourceId Edit == ", resourceId);
      jsonStore.setTariffDateFields({
        fromDate: jsonStore.getOperationalDetailsByResourceUniqueID(resourceId)?.FromDate
          ? jsonStore.getOperationalDetailsByResourceUniqueID(resourceId)?.FromDate.split("T")[0]
          : "",
        toDate: jsonStore.getOperationalDetailsByResourceUniqueID(resourceId)?.ToDate
          ? jsonStore.getOperationalDetailsByResourceUniqueID(resourceId)?.ToDate.split("T")[0]
          : "",
      });
      console.log("jsonStore.Edit == ", jsonStore.getBasicDetailsByResourceUniqueID(resourceId));
      setLoading(true);
    } 
    else {
      console.log("resourceId == ", resourceId)
      console.log("jsonStore.getResourceGroupBasicDetails() == ", jsonStore.getResourceGroupBasicDetails())
      console.log("jsonStore.GETBILLINGDETAILS() == ", jsonStore.getResourceGroupBillingDetails())
      setBasicDetailsData(normalizeBasicDetails(jsonStore.getResourceGroupBasicDetails() || {}));
      setOperationalDetailsData(normalizeOperationalDetails(jsonStore.getResourceGroupOperationalDetails() || {}));
      setMoreInfoDetailsData(normalizeMoreInfoDetails(jsonStore.getResourceGroupMoreRefDocs() || {}));
      setBillingDetailsData(normalizeBillingDetails(jsonStore.getResourceGroupBillingDetails() || {}));
      setLoading(true);
    }
    const planCount = jsonStore.getAllPlanDetailsByResourceUniqueID(resourceId);
    const actualCount = jsonStore.getAllActualDetailsByResourceUniqueID(resourceId);
    if (planCount.length > 0 || actualCount.length > 0) {
      setIsPlanActualsVisible(true);

    }
    const saved = localStorage.getItem('planActualsSaved');
    // setIsPlanActualsVisible(saved === 'true');

  }, [isEditQuickOrder]);
  //API Call for dropdown data
  const fetchData = async (messageType) => {
    setLoadingDropdown(false);
    setError(null);
    try {
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType });
      setApiData(data);
      console.log("API Data: RG ", data);
      // if (messageType == "Service type Init") {
      //   setServiceTypeList(JSON.parse(data?.data?.ResponseData));
      //   console.log("ServiceType data:", apiData.data.ResponseData);
      // }
      // if (messageType == "Sub Service type Init") {
      //   setSubServiceTypeList(JSON.parse(data?.data?.ResponseData));
      // }
      // if (messageType == "Arrival Init") {
      //   setArrivalList(JSON.parse(data?.data?.ResponseData));
      // }
      // if (messageType == "Departure Init") {
      //   setDepartList(JSON.parse(data?.data?.ResponseData));
      // }
      // if (messageType == "Quick Order Resource Combo Init") {
      //   setResourceList(JSON.parse(data?.data?.ResponseData));
      // }
      // if (messageType == "ResourceType Init") {
      //   setResourceTypeList(JSON.parse(data?.data?.ResponseData));
      // }
      // if (messageType == "Location Init") {
      //   setLocationList(JSON.parse(data?.data?.ResponseData));
      // }
      if (messageType == "Quick Order Billing Type Init") {
        setBillingTypeList(JSON.parse(data?.data?.ResponseData));
        // setBillingTypeList([]);
      }
      if (messageType == "ResourceGroup PrimaryRefDocType") {
        setPrimaryRefDocType(JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "ResourceGroup SecondaryRefDocType") {
        setSecondaryRefDocType(JSON.parse(data?.data?.ResponseData));
      }
    } catch (err) {
      setError(`Error fetching API data for ${messageType}`);
      // setApiData(data);
    } finally {
      setLoadingDropdown(true);
    }
  };
  // Iterate through all messageTypes
  const fetchAll = async () => {
    setLoadingDropdown(false);
    for (const type of messageTypes) {
      setSelectedType(type);
      await fetchData(type);
    }
  };

  
  const [resourceSelected, setResourceSelected] = useState(null);
  const [resourceSelectedID, setResourceSelectedID] = useState('');
  // Basic Details Panel Configuration
  useEffect(() => {
    // When resourceSelected changes, update dependent fields (e.g., ResourceType)
    localStorage.setItem('resourceId', '');
    if (resourceSelected) {
      console.log('selectedResource updated:', resourceSelected);

      // Example: If resourceSelected is a string like "id || name", extract the id
      let resourceId = resourceSelected;
      if (typeof resourceSelected === "string" && resourceSelected.includes("||")) {
        resourceId = resourceSelected.split("||")[0].trim();
      } else if (resourceSelected?.value) {
        // If using an object with value/label
        if (typeof resourceSelected.value === "string" && resourceSelected.value.includes("||")) {
          resourceId = resourceSelected.value.split("||")[0].trim();
        } else {
          resourceId = resourceSelected.value;
        }
      }
      setResourceSelectedID(resourceId);
      // Set resourceId to localStorage
      if (resourceId) {
        localStorage.setItem('resourceId', resourceId);
      }
      console.log("resourceId ....", resourceId);

      // Or, if you want to trigger a fetch for ResourceType options based on resourceId, do it here
      // fetchResourceTypeOptions(resourceId);

      // Make sure your ResourceType dropdown uses this value/state as needed
    }
  }, [resourceSelected]);

  const basicDetailsConfig: PanelConfig = {
    Resource: {
      id: 'Resource',
      label: 'Resource',
      fieldType: 'lazyselect',
      width: 'third',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 1,
      hideSearch: true,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Quick Order Resource Combo Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data;
        // Map the options as before
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
          setResourceSelected(selected);
          if (basicDetailsRef && basicDetailsRef.current && typeof basicDetailsRef.current.setFormValues === "function") {
            basicDetailsRef.current.setFormValues({
              ResourceType: "",
            });
          }
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    ResourceType: {
      id: 'ResourceType',
      label: 'Resource Type',
      fieldType: 'lazyselect',
      width: 'third',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
      hideSearch: true,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        // Use the latest selected value from the resource dropdown, not the possibly stale resourceSelectedID
        // 'selected' is expected to be passed by the lazyselect component on fetchOptions call
        // Fallback to resourceSelectedID if 'selected' is not provided (for backward compatibility)
        // const latestResourceId = selected || resourceSelectedID;
        const latestResourceId = localStorage.getItem('resourceId');
        console.log("ResourceType fetchOptions - latestResourceId:", localStorage.getItem('resourceId'));

        const response = await quickOrderService.getMasterCommonData({
          messageType: "ResourceType Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
          ResourceId: latestResourceId, // Pass the latest selected resource id to the API
        });

        const rr: any = response.data;
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
      // options: resourceTypeList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
    },
    ServiceType: {
      id: 'ServiceType',
      label: 'Service Type',
      fieldType: 'lazyselect',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      hideSearch: true,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Service type Init",
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
      // options: serviceTypeList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
    },
    SubServiceType: {
      id: 'SubServiceType',
      label: 'Sub-Service',
      fieldType: 'lazyselect',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      hideSearch: true,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Sub Service type Init",
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
      // options: subServiceTypeList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      // events: {
      //   onBlur: (event) => {
      //     console.log('Description blur event:', event);
      //   }
      // }
    }
  };

  // Operational Details Panel Configuration
  const operationalDetailsConfig: PanelConfig = {
    OperationalLocation: {
      id: 'OperationalLocation',
      label: 'Operational Location',
      fieldType: 'lazyselect',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
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
    // OperationalLocation: {
    //   id: 'OperationalLocation',
    //   label: 'Operational Location',
    //   fieldType: 'search',
    //   width: 'third',
    //   value: '',
    //   mandatory: false,
    //   visible: true,
    //   editable: true,
    //   order: 1,
    //   placeholder: 'Search operational location...',
    //   searchData: locationList.map(c => `${c.id}`),
    // },
    DepartPoint: {
      id: 'DepartPoint',
      label: 'Departure Point',
      fieldType: 'lazyselect',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      hideSearch: false,
      disableLazyLoading: false,
      // options: departList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
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
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    ArrivalPoint: {
      id: 'ArrivalPoint',
      label: 'Arrival Point',
      fieldType: 'lazyselect',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      hideSearch: false,
      disableLazyLoading: false,
      // options: arrivalList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
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
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    FromDate: {
      id: 'FromDate',
      label: 'From Date',
      fieldType: 'date',
      width: 'third',
      // Bind the value from the response (resourceJsonData.operationalDetails.FromDate if available)
      value: jsonStore.getResourceGroupOperationalDetails()?.FromDate || '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 4
    },
    FromTime: {
      id: 'FromTime',
      label: 'From Time',
      fieldType: 'time',
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 5
    },
    ToDate: {
      id: 'ToDate',
      label: 'To Date',
      fieldType: 'date',
      width: 'third',
      // Bind the value from the response (resourceJsonData.operationalDetails.FromDate if available)
      value: jsonStore.getResourceGroupOperationalDetails()?.ToDate || '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 6
    },
    ToTime: {
      id: 'ToTime',
      label: 'To Time',
      fieldType: 'time',
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7
    },
    Remarks: {
      id: 'Remarks',
      label: 'Remarks',
      fieldType: 'text',
      width: 'two-thirds',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      maxLength: 255,
    },
  };
  
  // Billing Details Panel Configuration
  const billingDetailsConfig: PanelConfig = {
    ContractPrice: {
      id: 'ContractPrice',
      label: 'Contract Price',
      fieldType: 'card',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'half',
      color: '#10b981', // Emerald green background
      fieldColour: '#047857' // Dark emerald text
    },
    NetAmount: {
      id: 'NetAmount',
      label: 'Net Amount',
      fieldType: 'card',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'half',
      color: '#8b5cf6', // Purple background
      fieldColour: '#6d28d9' // Dark purple text
    },
    BillingType: {
      id: 'BillingType',
      label: 'Billing Type',
      fieldType: 'select',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 3,
      width: 'full',
      options: billingTypeList?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    UnitPrice: {
      id: 'UnitPrice',
      label: 'Unit Price',
      fieldType: 'text',
      width: 'half',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 4,
      inputType: 'number',
      maxLength: 28
    },
    BillingQty: {
      id: 'BillingQty',
      label: 'Billing Qty.',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'half',
      maxLength: 28,
      inputType: 'number',
    },
    Tariff: {
      id: 'Tariff',
      label: 'Tariff',
      fieldType: 'lazyselect',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 6,
      width: 'full',
      hideSearch: true,
      disableLazyLoading: true,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        console.log("load tariff data ----", jsonStore.getContractTariffList());
        const rr: any = jsonStore.getContractTariffList();
        return (rr || []).map((item: any) => ({
          ...(item.TariffID !== undefined && item.TariffID !== '' && item.TariffDescription !== undefined && item.TariffDescription !== ''
            ? {
              label: `${item.TariffID} || ${item.TariffDescription}`,
              value: `${item.TariffID} || ${item.TariffDescription}`,
              // value: item.TariffID
            }
            : {})
        }));
      },
      events: {
        onChange: (selected, event) => {
          // When the Tariff dropdown changes, update the TariffType field in the same form
          const selectedTariffIdRaw = selected?.value;
          console.log('Tariff id (raw):', selectedTariffIdRaw);
          // Split the selectedTariffId at '||' and trim spaces
          const selectedTariffId = selectedTariffIdRaw ? selectedTariffIdRaw.split('||')[0].trim() : '';
          console.log('Tariff id (split):', selectedTariffId);
          const contractTariffList = jsonStore.getContractTariffList() || [];
          const matchedTariff = contractTariffList.find((item: any) => item.TariffID === selectedTariffId);
          console.log('Tariff changed:', selected);
          console.log('Matched Tariff Object:', matchedTariff);
          // When the Tariff changes, update the ContractPrice and NetAmount fields in the billingDetails form
          if (matchedTariff && billingDetailsRef && billingDetailsRef.current && typeof billingDetailsRef.current.setFormValues === "function") {
            const tariffRate = matchedTariff.TariffRate ? matchedTariff.TariffRate : 0;
            billingDetailsRef.current.setFormValues({
              ContractPrice: tariffRate,
              UnitPrice: tariffRate,
              TariffType: matchedTariff.TariffType + ' || ' + matchedTariff.TariffTypeDescription
            });
          }
          const tariffCurrency = matchedTariff.ValueCurrency?.trim() || 'EUR';
          jsonStore.setQuickOrderFields({ Currency: tariffCurrency });
          console.log('✅ Currency updated based on tariff:', tariffCurrency);
          if (matchedTariff && basicDetailsRef && basicDetailsRef.current && typeof basicDetailsRef.current.setFormValues === "function") {
            basicDetailsRef.current.setFormValues({
              Resource: matchedTariff.Resource + ' || ' + matchedTariff.ResourceDescription,
              ResourceType: matchedTariff.ResourceType + ' || ' + matchedTariff.ResourceTypeDescription,
            });
          }
          // Optionally update resource type and other fields in the store if needed
          if (matchedTariff) {
            jsonStore.setResourceType({ Resource: matchedTariff.Resource, ResourceType: matchedTariff.ResourceType });
            jsonStore.setTariffFields({
              contractPrice: matchedTariff.TariffRate ? matchedTariff.TariffRate : 0,
              unitPrice: matchedTariff.TariffRate ? matchedTariff.TariffRate : "",
              netAmount: matchedTariff.TariffRate ? matchedTariff.TariffRate : "",
              tariffType: matchedTariff.TariffTypeDescription ? matchedTariff.TariffTypeDescription : "",
            });
          }
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
      // searchData: TariffList, // <-- This is the local array for suggestions
    },
    TariffType: {
      id: 'TariffType',
      label: 'Tariff Type',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: false,
      order: 7,
      width: 'full',
    },
    BillingRemarks: {
      id: 'BillingRemarks',
      label: 'Remarks',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'full',
      maxLength: 255
    }
  };

  // const [formData, setFormData] = useState(jsonStore.getResourceGroupBillingDetails());

  //MORE INFO DETAILS
  const moreInfoPanelConfig: PanelConfig = {
    PrimaryDocType: {
      id: 'PrimaryDocType',
      label: 'Primary Doc Type and No.',
      fieldType: 'inputdropdown',
      width: 'full',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      maxLength: 18,
      options: primaryRefDocType?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      // options: [
      //   { label: 'IO-Hire/Rent', value: 'IO-Hire/Rent' },
      //   { label: 'IO-Buy/Rent', value: 'IO-Buy/Rent' },
      // ]
    },
    SecondaryDocType: {
      id: 'SecondaryDocType',
      label: 'Secondary Doc Type and No.',
      fieldType: 'inputdropdown',
      width: 'full',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      maxLength: 18,
      options: secondaryRefDocType?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    PrimaryDocDate: {
      id: 'PrimaryDocDate',
      label: 'Primary Doc Date',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
    },
    SecondaryDocDate: {
      id: 'SecondaryDocDate',
      label: 'Secondary Doc Date',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
    },
    SendersRefNo: {
      id: 'SendersRefNo',
      label: 'Senders Ref No',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'half',
      maxLength: 255
    },
    CustomerRefNo: {
      id: 'CustomerRefNo',
      label: 'Customer Ref No',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'half',
      maxLength: 255
    },
    VendorRefNo: {
      id: 'VendorRefNo',
      label: 'Vendor Ref No',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: 'half',
      maxLength: 255
    },
    PONo: {
      id: 'PONo',
      label: 'PO No',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'half',
      maxLength: 255
    }
  };

  const steps = [
    {
      label: "Resource Group Creation",
      subLabel: " - ",
      count: 1,
      completed: true,
    },
    {
      label: "Plan and Actuals",
      // subLabel: "Total Items : 0",
      count: 2,
      completed: false,
    },
  ];
  const setCurrentStepIndex = () => {
    setCurrentStep(1);
  };

  const navigate = useNavigate();
  // Configurable button for Create Order (with dropdown)
  const configurableButtons: ConfigurableButtonConfig[] = [
    {
      label: "Add New",
      tooltipTitle: "Add New",
      showDropdown: true,
      onClick: () => {
        setIsPlanActualsOpen(true);
      },
      dropdownItems: [
        {
          label: "Add New",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            setIsPlanActualsOpen(true);
          }
        },
        {
          label: "Bulk Upload",
          icon: <CloudUpload className="h-4 w-4" />,
          onClick: () => {
            setMoreInfoOpen(true);
          }
        }
      ]
    }
  ];

  const [isMoreInfoOpen, setMoreInfoOpen] = useState(false);
  const [isAttachmentsOpen, setAttachmentsOpen] = useState(false);
  const [isGroupLevelModalOpen, setGroupLevelModalOpen] = useState(false);

  const handleStepClick = (step: number) => {
    console.log('handleStepClick called with step:', step, 'currentStep:', currentStep);
    setCurrentStep(step);
  };


  // Panel widths state - updated for 12-column system
  const [basicDetailsWidth, setBasicDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(12);
  const [operationalDetailsWidth, setOperationalDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(6);
  const [billingDetailsWidth, setBillingDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(6);

  // Panel visibility management
  const panels = [
    { id: 'basic-details', title: basicDetailsTitle, visible: basicDetailsVisible },
    { id: 'operational-details', title: operationalDetailsTitle, visible: operationalDetailsVisible },
    { id: 'more-info', title: moreInfoTitle, visible: moreInfoVisible },
    { id: 'billing-details', title: billingDetailsTitle, visible: billingDetailsVisible }
  ];

  const handlePanelVisibilityChange = (panelId: string, visible: boolean) => {
    switch (panelId) {
      case 'basic-details':
        setBasicDetailsVisible(visible);
        break;
      case 'operational-details':
        setOperationalDetailsVisible(visible);
        break;
      case 'more-info':
        setMoreInfoVisible(visible);
        break;
      case 'billing-details':
        setBillingDetailsVisible(visible);
        break;
    }
  };
  const [resourceData, setResourceData] = useState<any[]>([]); // <-- resourceData state
  useEffect(() => {
    console.log("load 123 resourceId == ", resourceId);
    if (isEditQuickOrder) {
      const resourceGroups = jsonStore.getAllResourceGroups();
      setResourceData(resourceGroups);
      console.log("Resource Groups Data:", resourceGroups);
    } else {
      const resourceGroups = jsonStore.getAllResourceGroups();
      setResourceData(resourceGroups);
    }
  }, [isEditQuickOrder]);

  // const cardData: CardDetailsItem[] = [
  //   {
  //     id: "R01",
  //     title: "R01 - Wagon Rentals",
  //     subtitle: "Vehicle",
  //     wagons: "10 Wagons",
  //     price: "€ 45595.00",
  //     trainType: "Block Train Conventional",
  //     repairType: "Repair",
  //     date: "12-Mar-2025 to 12-Mar-2025",
  //     rateType: "Rate Per Unit-Buy Sell",
  //     location: "Frankfurt Station A - Frankfurt Station B",
  //     draftBill: "DB/000234",
  //     status: "Approved",
  //   },
  //   {
  //     id: "R02",
  //     title: "R02 - Wagon Rentals",
  //     subtitle: "Vehicle",
  //     wagons: "10 Wagons",
  //     price: "€ 45595.00",
  //     trainType: "Block Train Conventional",
  //     repairType: "Repair",
  //     date: "12-Mar-2025 to 12-Mar-2025",
  //     rateType: "Rate Per Unit-Buy Sell",
  //     location: "Frankfurt Station A - Frankfurt Station B",
  //     draftBill: "DB/000234",
  //     status: "Failed",
  //   }
  // ];

  const resourceGroups = [
    {
      id: 1,
      name: "QO/00001/2025",
      seqNo: 1, // Optional
      default: "Y", // Optional
      description: "R01 - Wagon Rentals", // Optional
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    // Handle input change logic here
    console.log(`Field: ${field}, Value: ${value}`);
  };

   const [planDataSets, setPlanDataSets] = useState<any[]>([]); // <-- planDataSets state
  const [planDataVersion, setPlanDataVersion] = useState(0); // <-- version for forcing PlanAndActuals update

  const handlePlanActualsDataFetch = (status: boolean) => {
    console.log('Plan created and show grid data:', status);
    setIsPlanActualsVisible(status);
    if (status) {
      // Always force a new array reference to trigger grid re-render
      const resourceGroups = jsonStore.getAllResourceGroups();
      setResourceData(resourceGroups ? [...resourceGroups] : []);
      setPlanDataSets(resourceGroups ? [...resourceGroups] : []);
      setPlanDataVersion(v => v + 1); // increment version to force update
      setResourceUniqueId(resourceId);
      console.log("Resource Groups Data (reloaded):", resourceGroups);
    }
  }

  return (
    <div className="">
      <div className="flex h-full">
        {/* Left Side - Stepper and Main Content */}
        <div className="flex-1 flex">
          {/* Vertical Stepper */}
          <VerticalStepper
            steps={steps}
            activeStep={currentStep}
            onStepClick={handleStepClick}
          />
          {/*<div className="w-64 p-6 border-r min-h-[500px]">
            <div className="">
              <div className="flex items-start space-x-3 cursor-pointer" onClick={handleFirstStep}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                  1
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-900'}`}>
                    Resource Group Creation
                  </h3>
                  <p className={`text-xs ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>-</p>
                </div>
              </div>
              <div className="h-8 w-px bg-blue-600 mt-2 ml-4"></div>
              <div className="flex items-start space-x-3 cursor-pointer mt-2" onClick={handleSecondStep}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  2
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                    Plan and Actuals
                  </h3>
                  <p className={`text-xs ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Total Items: 0</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Main Content */}
          <div className="flex-1 bg-gray-50 px-6 py-4 w-4/5 h-full content-scroll">
            <div className="flex items-center justify-between mb-4">
              {currentStep === 1 && (
                <>
                  <h2 className="text-lg font-semibold">Resource Group Creation</h2>
                  <div className="flex items-center gap-4">
                    {/* <span onClick={() => setGroupLevelModalOpen(true)} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100">
                      <BookmarkCheck className="w-5 h-5 text-gray-500 cursor-pointer" />
                    </span> */}
                    <span onClick={() => setAttachmentsOpen(true)} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100">
                      <FileText className="w-5 h-5 text-gray-500 cursor-pointer" />
                    </span>
                  </div>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <h2 className="text-lg font-semibold">Plan and Actuals</h2>
                  {isPlanActualsVisible &&
                    (<div className="flex items-center gap-2">
                      {/* Create Order Button with Dropdown */}
                      <DropdownButton config={configurableButtons[0]} />
                      {/* <button className={`p-2 rounded ${view === "grid" ? "bg-blue-50" : ""}`} onClick={() => setView("grid")}> <LayoutGrid className={`w-5 h-5 ${view === "grid" ? "text-blue-600" : "text-gray-400"}`} /> </button> */}
                      {/* <button className={`p-2 rounded ${view === "list" ? "bg-blue-50" : ""}`} onClick={() => setView("list")}> <List className={`w-5 h-5 ${view === "list" ? "text-blue-600" : "text-gray-400"}`} /> </button> */}
                    </div>
                    )}
                </>
              )}

            </div>

            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Basic Details Section */}

                {/* Validation Results */}
                {/* {Object.keys(validationResults).length > 0 && (
                  <div className="space-y-3">
                    {Object.entries(validationResults).map(([panelId, result]) => (
                      <Alert key={panelId} variant={result.isValid ? "default" : "destructive"}>
                        {result.isValid ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {panelId === 'basic-details' && basicDetailsTitle}
                              {panelId === 'operational-details' && operationalDetailsTitle}
                              {panelId === 'billing-details' && billingDetailsTitle}
                            </span>
                            <span className={`text-sm ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
                              {result.isValid ? 'Valid' : `${Object.keys(result.errors).length} error(s)`}
                            </span>
                          </div>
                          {!result.isValid && result.mandatoryFieldsEmpty.length > 0 && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Missing mandatory fields:</span>
                              <ul className="list-disc list-inside ml-4 mt-1">
                                {result.mandatoryFieldsEmpty.map((field, index) => (
                                  <li key={index}>{field}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )} */}

                {/* <div className="grid grid-cols-12 gap-6"> */}
                <div className="flex gap-6">
                  <div className='w-3/5'>
                    {(() => {
                      let currentTabIndex = 1;
                      const panels = [];

                      // Panel 1: Basic Details
                      if (basicDetailsVisible && loading && loadingDropdown) {
                        const basicDetailsVisibleCount = Object.values(basicDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={basicDetailsRef}
                            key="basic-details"
                            panelId="basic-details"
                            panelOrder={1}
                            panelIcon={<Wrench className="w-5 h-5 text-lime-500" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={basicDetailsTitle}
                            panelConfig={basicDetailsConfig}
                            formName="basicDetailsForm"
                            initialData={basicDetailsData}
                            onTitleChange={setBasicDetailsTitle}
                            onWidthChange={setBasicDetailsWidth}
                            getUserPanelConfig={getUserPanelConfig_basicDetails}
                            saveUserPanelConfig={saveUserPanelConfig_basicDetails}
                            userId="current-user"
                            panelWidth={basicDetailsWidth}
                            validationErrors={validationResults['basic-details']?.errors || {}}
                          />
                        );
                        currentTabIndex += basicDetailsVisibleCount;
                      }

                      // Panel 2: Operational Details
                      if (operationalDetailsVisible && loading && loadingDropdown) {
                        const operationalDetailsVisibleCount = Object.values(operationalDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={operationalDetailsRef}
                            key="operational-details"
                            panelId="operational-details"
                            panelOrder={2}
                            panelIcon={<Bookmark className="w-5 h-5 text-blue-500" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={operationalDetailsTitle}
                            panelConfig={operationalDetailsConfig}
                            formName="operationalDetailsForm"
                            initialData={operationalDetailsData}
                            onTitleChange={setOperationalDetailsTitle}
                            onWidthChange={setOperationalDetailsWidth}
                            getUserPanelConfig={getUserPanelConfig_operationalDetails}
                            saveUserPanelConfig={saveUserPanelConfig_operationalDetails}
                            userId="current-user"
                            panelWidth={operationalDetailsWidth}
                            validationErrors={validationResults['operational-details']?.errors || {}}
                          />
                        );
                        currentTabIndex += operationalDetailsVisibleCount;
                      }

                      // Panel 4: More Info
                      if (moreInfoVisible && loading && loadingDropdown) {
                        const moreInfoVisibleCount = Object.values(moreInfoPanelConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={moreInfoDetailsRef}
                            key="more-info"
                            panelId="more-info"
                            panelOrder={4}
                            panelIcon={<Wrench className="w-5 h-5 text-lime-500" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={moreInfoTitle}
                            panelConfig={moreInfoPanelConfig}
                            formName="moreInfoDetailsForm"
                            initialData={moreInfoDetailsData}
                            onTitleChange={setmoreInfoTitle}
                            onWidthChange={setBasicDetailsWidth}
                            getUserPanelConfig={getUserPanelConfig_moreInfo}
                            saveUserPanelConfig={saveUserPanelConfig_moreInfo}
                            userId="current-user"
                            panelWidth={basicDetailsWidth}
                          />
                        );
                        currentTabIndex += moreInfoVisibleCount;
                      }
                      return panels;
                    })()}
                  </div>
                  <div className='w-2/5 mb-8'>
                    {(() => {
                      let currentTabIndex = 1;
                      const panels = [];

                      // Panel 3: Billing Details
                      if (billingDetailsVisible && loading && loadingDropdown) {
                        panels.push(
                          <DynamicPanel
                            ref={billingDetailsRef}
                            key="billing-details"
                            panelId="billing-details"
                            panelOrder={3}
                            panelIcon={<Banknote className="w-5 h-5 text-orange-500" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={billingDetailsTitle}
                            panelConfig={billingDetailsConfig}
                            formName="billingDetailsForm"
                            initialData={billingDetailsData}
                            onTitleChange={setBillingDetailsTitle}
                            onWidthChange={setBillingDetailsWidth}
                            getUserPanelConfig={getUserPanelConfig_billingDetails}
                            saveUserPanelConfig={saveUserPanelConfig_billingDetails}
                            userId="current-user"
                            panelWidth={billingDetailsWidth}
                            panelSubTitle={billingDetailsTitle}
                            validationErrors={validationResults['billing-details']?.errors || {}}
                          />
                        );
                      }

                      return panels;
                    })()}
                  </div>
                </div>

                {/* Show message when all panels are hidden */}
                {!basicDetailsVisible && !operationalDetailsVisible && !moreInfoVisible && !billingDetailsVisible && (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <EyeOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">All panels are hidden</h3>
                    <p className="text-gray-500 mb-4">Use the "Manage Panels" button above to show panels.</p>
                  </div>
                )}

                {/* Debug Data Display */}
                {/* {(basicDetailsVisible || operationalDetailsVisible || billingDetailsVisible) && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Current Form Data</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {basicDetailsVisible && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">{basicDetailsTitle}</h4>
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                              {JSON.stringify(basicDetailsData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {operationalDetailsVisible && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">{operationalDetailsTitle}</h4>
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                              {JSON.stringify(operationalDetailsData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {billingDetailsVisible && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">{billingDetailsTitle}</h4>
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                              {JSON.stringify(billingDetailsData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
              </div>
            )}

            {currentStep === 2 && (
              <>
                {!isPlanActualsVisible && (
                  <div className="rounded-lg px-8 py-10 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <img src={PlanActIcon} alt='Add' className="w-20 h-20" />
                    </div>
                    <p className="text-gray-500 text-center mb-6 text-sm">
                      There are no items of plan and actuals available. Please click 'Add' instead.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setMoreInfoOpen(true)} className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50">
                        Bulk Upload
                      </Button>
                      <Button onClick={() => setIsPlanActualsOpen(true)} className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700">
                        Add Plan or Actuals
                      </Button>
                    </div>
                  </div>
                )}
                  {isPlanActualsVisible && (
                  // <div className="">
                    <PlanAndActuals
                      key={planDataVersion}
                      view={view}
                      resouceId={resourceId}
                      isEditQuickOrder={isEditQuickOrder}
                      dataSet={planDataSets}
                    />
                  // </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="mt-2 w-full z-40 bg-white border-t border-gray-300 flex justify-end space-x-3 absolute bottom-0 px-6">
        {currentStep === 1 && (
          <>
            <Button variant="outline"  disabled={resourceGroupStatus == "Approved"} onClick={handleProceedToNext} className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50">
              Proceed to Next
            </Button>
            <Button  disabled={resourceGroupStatus == "Approved"} onClick={onSaveResourceGroupDetails} className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700">
              Save Details
            </Button>
          </>
        )}
        {currentStep === 2 && isPlanActualsOpen === false && (
          <>
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50">
              Back to Resource Group
            </Button>
            <Button onClick={onSavePlanActualsGridDetails} className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700">
              Save Details
            </Button>
          </>
        )}
        
      </div>

      {/* SideDrawer component */}
      <SideDrawer isOpen={isPlanActualsOpen} onClose={() => setIsPlanActualsOpen(false)} width='85%' title="Plan and Actual Details" isBack={false}>
        <div>
          {/* <PlanAndActualDetails onCloseDrawer={() => setIsPlanActualsOpen(false)}></PlanAndActualDetails> */}
          <PlanAndActualDetails onCloseDrawer={() => setIsPlanActualsOpen(false)} isEditQuickOrder={isEditQuickOrder} resourceId={resourceUniqueId} onApiSuccess={handlePlanActualsDataFetch}></PlanAndActualDetails>

        </div>
      </SideDrawer>

      {/* Bulk upload component */}
      <SideDrawer isOpen={isMoreInfoOpen} onClose={() => setMoreInfoOpen(false)} width="50%" title="Add Files" isBack={false}>
        <div className="">
          <div className="mt-0 text-sm text-gray-600"><BulkUpload /></div>
        </div>
      </SideDrawer>

      <SideDrawer isOpen={isAttachmentsOpen} onClose={() => setAttachmentsOpen(false)} width="80%" title="Attachments" isBack={false} onScrollPanel={true} badgeContent={jsonStore.getQuickOrderNo()} isBadgeRequired={true}>
        <div className="">
          <div className="mt-0 text-sm text-gray-600"><Attachments isEditQuickOrder={isEditQuickOrder} isResourceGroupAttchment={true} isResourceID={resourceId} /></div>
        </div>
      </SideDrawer>

      <SideDrawer isOpen={isGroupLevelModalOpen} onClose={() => setGroupLevelModalOpen(false)} width="80%" title="Group Level Details" isBack={false}>
        <div className="mt-3 px-4">
          <div className="w-80 mb-3">
            <SimpleDropDown
              list={resourceGroups}
              value={resourceGroups[0].description}
              onValueChange={(value) =>
                handleInputChange("resourceGroup", value)
              }
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Resource Group Details
              {/* <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">3</span> */}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  name='grid-search-input'
                  placeholder="Search"
                  className="border border-gray-300 rounded text-sm placeholder-gray-400 px-2 py-1 pl-3 w-64 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ width: 200 }}
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              </div>
              <Button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 bg-gray-50 text-gray-600 p-0 border border-gray-300">
                <Filter className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
          <div className="mt-4 mb-6">
            <CardDetails data={resourceData} isEditQuickOrder={isEditQuickOrder} />
          </div>
        </div>
      </SideDrawer>

    </div>
  );
};

export default ResourceGroupDetailsForm;