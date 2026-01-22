import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, ArrowLeft, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ResourceSearchDrawer } from './ResourceSearchDrawer';
import { tripPlanningService } from '@/api/services/tripPlanningService';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { quickOrderService } from '@/api/services/quickOrderService';
import { InputDropdown, InputDropdownValue } from '@/components/ui/input-dropdown';
import { tripService } from "@/api/services/tripService";
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { manageTripStore } from '@/stores/mangeTripStore';

interface FormData {
  carrier: string;
  supplier: string;
  supplierRef: string;
  carrierStatus: string;
  scheduleNo: string;
  trainNo: string;
  pathNo: string;
  legDetails: string;
  departurePoint: string;
  arrivalPoint: string;
  service: string;
  subService: string;
  infrastructureManager: string;
  reason: string;
  remarks: string;
  resourceCategory: string;
  resource: string;
  QCCode: string;
  QCCodeValue: string;
}

interface Resource {
  id: string;
  type: 'Schedule' | 'Agent' | 'Handler';
  name: string;
  formData: FormData;
}

const initialFormData: FormData = {
  carrier: '',
  supplier: '',
  supplierRef: '',
  carrierStatus: '',
  scheduleNo: '',
  trainNo: '',
  pathNo: '',
  legDetails: '',
  departurePoint: '',
  arrivalPoint: '',
  service: '',
  subService: '',
  infrastructureManager: '',
  reason: '',
  remarks: '',
  resourceCategory: '',
  resource: '',
  QCCode: '',
  QCCodeValue: '',
};

// Helper function to map API response to Resource format
const mapApiResourceToResource = (apiResource: any): Resource => {
  let resourceType: 'Schedule' | 'Supplier' | 'Agent' | 'Handler' | 'Driver' | 'Vehicle' = 'Schedule';
  if (apiResource.ResourceType === 'Scheduler') {
    resourceType = 'Schedule';
  } else if (apiResource.ResourceType === 'Supplier') {
    resourceType = 'Supplier';
  } else if (apiResource.ResourceType === 'Agent') {
    resourceType = 'Agent';
  } else if (apiResource.ResourceType === 'Driver') {
    resourceType = 'Driver';
  } else if (apiResource.ResourceType === 'Vehicle') {
    resourceType = 'Vehicle';
  } else if (apiResource.ResourceType === 'Handler') {
    resourceType = 'Handler';
  }
  console.log("apiResource ====", apiResource);
  // Format carrier (Executive Agent)
  const carrierValue = apiResource.ExecutiveAgentID || '';
  const carrierLabel = apiResource.ExecutiveAgentDescription || apiResource.AgencyName || '';
  const carrier = carrierValue && carrierLabel ? `${carrierValue} || ${carrierLabel}` : carrierValue || carrierLabel || '';

  // Format service
  const serviceValue = apiResource.Service || '';
  const serviceLabel = apiResource.ServiceDescription || '';
  const service = serviceValue && serviceLabel ? `${serviceValue} || ${serviceLabel}` : serviceValue || serviceLabel || '';

  // Format subService
  const subServiceValue = apiResource.SubService || '';
  const subServiceLabel = apiResource.SubServiceDescription || '';
  const subService = subServiceValue && subServiceLabel ? `${subServiceValue} || ${subServiceLabel}` : subServiceValue || subServiceLabel || '';

  // Format legDetails (using || separator like other dropdown fields)
  // Use LegFrom as ID and combine LegFrom - LegTo as description
  // const legDetailsValue = apiResource.LegFrom || apiResource.LegID || apiResource.LegSequence || '';
  // const legDetailsLabel = apiResource.LegFrom && apiResource.LegTo 
  //   ? `${apiResource.LegFrom} - ${apiResource.LegTo}` 
  //   : apiResource.LegTo || apiResource.LegName || '';
  // const legDetails = legDetailsValue && legDetailsLabel 
  //   ? `${legDetailsValue} || ${legDetailsLabel}` 
  //   : legDetailsValue || legDetailsLabel || '';

  // Format departurePoint (using || separator like service/subservice)
  const departurePointValue = apiResource.DeparturePoint || '';
  const departurePointLabel = apiResource.DeparturePointDescription || '';
  const departurePoint = departurePointValue && departurePointLabel 
    ? `${departurePointValue} || ${departurePointLabel}` 
    : departurePointValue || departurePointLabel || '';

  // Format arrivalPoint (using || separator like service/subservice)
  const arrivalPointValue = apiResource.ArrivalPoint || '';
  const arrivalPointLabel = apiResource.ArrivalPointDescription || '';
  const arrivalPoint = arrivalPointValue && arrivalPointLabel 
    ? `${arrivalPointValue} || ${arrivalPointLabel}` 
    : arrivalPointValue || arrivalPointLabel || '';

  // Format infrastructureManager
  const infrastructureManagerValue = apiResource.InfrastructureManagerID || '';
  const infrastructureManagerLabel = apiResource.InfrastructureManagerName || '';
  const infrastructureManager = infrastructureManagerValue && infrastructureManagerLabel 
    ? `${infrastructureManagerValue} || ${infrastructureManagerLabel}` 
    : infrastructureManagerValue || infrastructureManagerLabel || '';

  return {
    id: apiResource.ResourceID || '',
    type: resourceType,
    name: apiResource.ResourceID || '',
    formData: {
      resourceCategory: resourceType,
      resource: apiResource.ResourceID || '',
      carrier: carrier,
      supplier: apiResource.AgencyName || '',
      supplierRef: apiResource.SupplierRefNo || apiResource.VendorReferenceNo || '',
      carrierStatus: apiResource.CarrierStatus || '',
      scheduleNo: apiResource.ResourceID || '',
      trainNo: apiResource.TrainNo || apiResource.LicensePlateNo || '',
      pathNo: apiResource.PathNo || '',
      legDetails: apiResource.LegDetails || '',
      departurePoint: departurePoint,
      arrivalPoint: arrivalPoint,
      service: service,
      subService: subService,
      infrastructureManager: infrastructureManager,
      reason: apiResource.ReasonforSupplierChanges || '',
      remarks: apiResource.Remarks || '',
      QCCode: '', // Not in API response, will be handled separately
      QCCodeValue: '', // Not in API response, will be handled separately
    },
    // Store original API data for reference
    apiData: apiResource
  } as Resource & { apiData?: any };
};

// Helper function to map Resource format back to API payload
const mapResourceToApiPayload = (resource: Resource & { apiData?: any }): any => {
  const formData = resource.formData;
  
  // Split dropdown values
  const splitDropdownValue = (value: string | undefined) => {
    if (!value) return { value: '', label: '' };
    if (typeof value === 'string' && value.includes('||')) {
      const parts = value.split('||');
      return {
        value: parts[0]?.trim() || '',
        label: parts[1]?.trim() || ''
      };
    }
    return { value: value, label: value };
  };

  const carrierData = splitDropdownValue(formData.carrier);
  const serviceData = splitDropdownValue(formData.service);
  const subServiceData = splitDropdownValue(formData.subService);
  const carrierStatusData = splitDropdownValue(formData.carrierStatus);
  const legDetailsParts = splitDropdownValue(formData.legDetails);
  // const legDetailsParts = formData.legDetails ? formData.legDetails.split(' - ') : ['', ''];
  const departurePointData = splitDropdownValue(formData.departurePoint);
  const arrivalPointData = splitDropdownValue(formData.arrivalPoint);
  const infrastructureManagerData = splitDropdownValue(formData.infrastructureManager);
  const reasonData = splitDropdownValue(formData.reason);

  // Map ResourceType
  let resourceType = 'Supplier';
  if (formData.resourceCategory === 'Schedule') {
    resourceType = 'Scheduler';
  } else if (formData.resourceCategory === 'Agent' || formData.resourceCategory === 'Supplier') {
    resourceType = 'Supplier';
  } else if (formData.resourceCategory === 'Handler') {
    resourceType = 'Handler';
  } else if (formData.resourceCategory === 'Driver') {
    resourceType = 'Driver';
  } else if (formData.resourceCategory === 'Vehicle') {
    resourceType = 'Vehicle';
  }
  console.log("formData ===", formData);
  // Build API payload
  const payload: any = {
    ResourceID: formData.resource || resource.apiData?.ResourceID || '',
    ResourceType: resourceType,
    Service: serviceData.value || null,
    ServiceDescription: serviceData.label || null,
    SubService: subServiceData.value || null,
    SubServiceDescription: subServiceData.label || null,
    EffectiveFromDate: resource.apiData?.EffectiveFromDate || null,
    EffectiveToDate: resource.apiData?.EffectiveToDate || null,
    ExecutiveAgentID: carrierData.value || null,
    AgencyID: resource.apiData?.AgencyID || null,
    AgencyName: formData.supplier || resource.apiData?.AgencyName || null,
    OwnershipType: resource.apiData?.OwnershipType || null,
    LicensePlateNo: formData.trainNo || resource.apiData?.LicensePlateNo || null,
    VendorReferenceNo: formData.supplierRef || resource.apiData?.VendorReferenceNo || null,
    ExecutiveAgentDescription: carrierData.label || resource.apiData?.ExecutiveAgentDescription || null,
    PathNo: formData.pathNo || resource.apiData?.PathNo || null,
    ExecutionCarrier: formData.carrier ? carrierData.value : resource.apiData?.ExecutionCarrier || null,
    CarrierStatus: carrierStatusData.value || resource.apiData?.CarrierStatus || null,
    InfrastructureManagerID: infrastructureManagerData.value || null,
    InfrastructureManagerName: infrastructureManagerData.label || null,
    TrainNo: formData.trainNo || resource.apiData?.TrainNo || null,
    LegDetails: legDetailsParts.value || null,
    // LegTo: legDetailsParts.label || null,
    SupplierRefNo: formData.supplierRef || resource.apiData?.SupplierRefNo || null,
    DeparturePoint: departurePointData.value || null,
    DeparturePointDescription: departurePointData.label || null,
    ArrivalPoint: arrivalPointData.value || null,
    ArrivalPointDescription: arrivalPointData.label || null,
    ReasonforSupplierChanges: reasonData.value || null,
    Remarks: formData.remarks || null,
    Modeflag: resource.apiData?.Modeflag || 'NoChange'
  };
  console.log("form payload ====", payload);
  return payload;
};

const initialResources: Resource[] = [];

export const ResourcesDrawerScreen = ({ onClose }: { onClose?: () => void }) => {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isResourceSearchDrawerOpen, setIsResourceSearchDrawerOpen] = useState(false);
  const [currentResourceType, setCurrentResourceType] = useState<'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule'>('Supplier');
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const [tripInformation, setTripInformation] = useState<any>({});
  const [tripResourceDetailsData, setTripResourceDetailsData] = useState<any>({});
  const bindQC = (): InputDropdownValue => ({
    dropdown: formData?.QCCode ?? "",
    input: formData?.QCCodeValue ?? "", // use `input`, not `value`
  });
  const [QCCode, setQCCode] = useState<InputDropdownValue>(bindQC());
  const [QC, setQC] = useState<any>([]);
  const [isShowLoaderForResources, setIsShowLoaderForResources] = useState(false);

  const { toast } = useToast();
  const { tripData } = manageTripStore();
  const tripId: any = tripData?.Header?.TripNo;
  const [reasonError, setReasonError] = useState(false);

  
  // Auto-select first resource on mount
  useEffect(() => {
    // if (resources.length > 0) {
    //   const firstResource = resources[0];
    //   setSelectedResource(firstResource);
    //   setFormData(firstResource.formData);
    // }
    console.log('Trip ID:', tripId);
    fetchResourceFromTrip(tripId);

  }, [tripId]);

  const fetchResourceFromTrip = async (tripId: string) => {
    setIsShowLoaderForResources(true);
    try {
      const response: any = await tripService.getResourceFromTrip({ id: tripId });
      let parsedResponse: any = null;
      parsedResponse = JSON.parse(response.data.ResponseData);
      console.log('Parsed Response:', parsedResponse);
      console.log('Resources:', parsedResponse.Resources);
      
      // Check if Resources array exists in the response
      if (parsedResponse.Resources && Array.isArray(parsedResponse.Resources) && parsedResponse.Resources.length > 0) {
        // Map API resources to Resource format
        const mappedResources = parsedResponse.Resources.map((apiResource: any) => mapApiResourceToResource(apiResource));
        setResources(mappedResources);
        
        if (mappedResources.length > 0) {
          setSelectedResource(mappedResources[0]);
          setFormData(mappedResources[0].formData);
          // Update QCCode state
          setQCCode({
            dropdown: mappedResources[0].formData?.QCCode ?? "",
            input: mappedResources[0].formData?.QCCodeValue ?? "",
          });
        }
        setIsShowLoaderForResources(false);
      } else {
        setIsShowLoaderForResources(false);
        toast({
          title: "⚠️ Error",
          description: "No resource found for this trip",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
      setIsShowLoaderForResources(false);
    }
  };

  // Fetch QC data for InputDropdown
  useEffect(() => {
    const fetchQCData = async () => {
      try {
        const response: any = await quickOrderService.getMasterCommonData({
          messageType: "Resource QuickCode Init",
          searchTerm: '',
          offset: 0,
          limit: 1000,
        });

        const rr: any = response.data;
        const responseData = JSON.parse(rr.ResponseData || "[]");
        
        // Format data for InputDropdown (needs label and value)
        const formattedData = responseData
          .filter((qc: any) => qc.id && qc.name)
          .map((qc: any) => ({
            label: qc.name,
            value: qc.id,
          }));
        
        setQC(formattedData || []);
        console.log("QC data fetched:", formattedData);
      } catch (error) {
        console.error("Error fetching QC data:", error);
        setQC([]);
      }
    };

    fetchQCData();
  }, []);

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData(resource.formData);
    // Update QCCode state when resource is selected
    setQCCode({
      dropdown: resource.formData?.QCCode ?? "",
      input: resource.formData?.QCCodeValue ?? "",
    });
    console.log("resource ====", resource);
    console.log("resource.formData ====", resource.formData);
  };

  const handleAddNew = () => {
    setSelectedResource(null);
    setFormData(initialFormData);
  };

  // Helper function to split dropdown values (format: "id || name")
  const splitDropdownValue = (value: string | undefined) => {
    if (!value) return { value: '', label: '' };
    if (typeof value === 'string' && value.includes('||')) {
      const parts = value.split('||');
      return {
        value: parts[0]?.trim() || '',
        label: parts[1]?.trim() || ''
      };
    }
    return { value: value, label: value };
  };

  const handleSave = async() => {
    setReasonError(false);
let hasError = false;
    if (!formData.reason?.trim()) {
  setReasonError(true);
  hasError = true;
}

    console.log("formData ==== before save (changed data from forms):", formData.reason);
    console.log("selectedResource ====", selectedResource);
    console.log("resources array ====", resources);
    
    // Validate required field: reason
    if (!formData.reason || formData.reason.trim() === '') {
      toast({
        title: "⚠️ Required Field Missing",
        description: "Reason is a required field. Please enter a reason before saving.",
        variant: "destructive",
      });
      return; // Stop execution if validation fails
    }
    
    // Determine ModeFlag based on selectedResource
    // Use existing Modeflag if available, otherwise determine based on selectedResource
    let modeFlag = "Update";
    if (selectedResource) {
      // Check if resource has existing Modeflag from API
      const existingModeflag = (selectedResource as any).apiData?.Modeflag;
      if (existingModeflag && (existingModeflag.toUpperCase() === "Update" || existingModeflag.toUpperCase() === "Insert")) {
        modeFlag = existingModeflag.toUpperCase(); // Keep existing flag (UPDATE/INSERT)
      } else {
        modeFlag = "Update"; // Default to UPDATE for existing resources
      }
    } else {
      modeFlag = "Insert"; // New resource
    }
    
    // Create updated resource with new formData
    let updatedResource: Resource & { apiData?: any };
    
    if (selectedResource) {
      // For update: Update existing resource with new formData
      updatedResource = {
        ...selectedResource,
        formData: formData,
        apiData: (selectedResource as any).apiData || {}
      };
      // Update Modeflag in apiData
      if (updatedResource.apiData) {
        updatedResource.apiData.Modeflag = modeFlag;
      }
    } else {
      // For insert: Create new resource structure with current formData
      updatedResource = {
        id: formData.resource || `RES${Date.now()}`,
        type: formData.resourceCategory as 'Schedule' | 'Agent' | 'Handler' || 'Schedule',
        name: formData.resource || formData.scheduleNo || `Resource ${resources.length + 1}`,
        formData: formData,
        apiData: {
          Modeflag: modeFlag
        }
      };
    }
    
    // Update local state first
    let updatedResources: (Resource & { apiData?: any })[];
    if (selectedResource) {
      // Update existing resource in resources array
      updatedResources = resources.map(r => 
        r.id === selectedResource.id 
          ? updatedResource 
          : r
      );
      // setResources(updatedResources);
      setSelectedResource(updatedResource);
    } else {
      // Add new resource
      updatedResources = [...resources, updatedResource];
      // setResources(updatedResources);
      setSelectedResource(updatedResource);
      console.log("newResource ====", updatedResource);
    }
    
    // Get Header information from tripData
    const header = {
      TripNo: tripData?.Header?.TripNo || '',
      TripOU: tripData?.Header?.TripOU || 0,
      TripStatus: tripData?.Header?.TripStatus || '',
      TripStatusDescription: tripData?.Header?.TripStatusDescription || ''
    };
    
    // Map all resources to API payload format
    const resourcesPayload = updatedResources.map((resource) => {
      const apiResource = mapResourceToApiPayload(resource);
      
      // Use existing Modeflag if available, otherwise set based on whether it's the updated resource
      if (resource.id === updatedResource.id) {
        apiResource.Modeflag = modeFlag; // The resource being saved (UPDATE or INSERT)
      } else {
        // For other resources, keep their existing Modeflag or set to "NoChange"
        const existingModeflag = (resource as any).apiData?.Modeflag;
        if (existingModeflag && (existingModeflag.toUpperCase() === "Update" || existingModeflag.toUpperCase() === "Insert")) {
          apiResource.Modeflag = existingModeflag.toUpperCase(); // Preserve existing UPDATE/INSERT flag
        } else {
          apiResource.Modeflag = "NoChange"; // Default to NoChange for unmodified resources
        }
      }
      
      return apiResource;
    });
    
    // Create the full RequestPayload structure
    const requestPayload = {
      Header: header,
      Resources: resourcesPayload
    };
    
    console.log("SelectedResource (original):", selectedResource);
    console.log("FormData (changed data from forms):", formData);
    console.log("Updated Resource:", updatedResource);
    console.log("Full RequestPayload (ready to send):", requestPayload);
    
    try {
      const response: any = await tripService.saveResource(requestPayload);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      
      if (resourceStatus) {
        toast({
          title: "✅ Resource Saved Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });

        // Refresh trip data after successful save
        await fetchResourceFromTrip(tripId);
      } else {
        toast({
          title: "⚠️ Submission failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving resources:", error);
      toast({
        title: "⚠️ Error",
        description: "Failed to save resources",
        variant: "destructive",
      });
    }

  };

  const handleClear = () => {
    setFormData(initialFormData);
    setSelectedResource(null);
  };

  // Handle resource drawer open/close
  const handleOpenResourceDrawer = async (resourceType: 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule') => {
    console.log(`Opening ${resourceType.toLowerCase()} drawer`);
    setCurrentResourceType(resourceType);
    setIsLoadingResource(true); // Show loader
    setIsResourceSearchDrawerOpen(true);

    const finalSearchCriteria = {
      "PlanningProfileID": "General-GMBH",
      "Location": "10-00004",
      "PlanDate": "",
      "ResourceProfileID": "",
      "Service": "",
      "ServiceDescription": "",
      "SubServiceType": "",
      "SubServiceDescription": ""
    }

    try {
      let response: any;

      // Call appropriate API based on resource type
      switch (resourceType) {
        case 'Supplier':
          response = await tripPlanningService.getAgentsList({
            searchCriteria: finalSearchCriteria
          });
          break;
        case 'Driver':
          response = await tripPlanningService.getDriversList({
            searchCriteria: finalSearchCriteria
          });
          break;
        case 'Handler':
          response = await tripPlanningService.getHandlersList({
            searchCriteria: finalSearchCriteria
          });
          break;
        case 'Vehicle':
          response = await tripPlanningService.getVehicleList({
            searchCriteria: finalSearchCriteria
          });
          break;
        case 'Schedule':
          response = await tripPlanningService.getSchedulesList({
            searchCriteria: finalSearchCriteria
          });
          break;
        default:
          throw new Error(`Unknown resource type: ${resourceType}`);
      }

      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      console.log('Response:', JSON.parse(response?.data?.ResponseData));
      const resourceDetails = parsedResponse.ResourceDetails;
      console.log("resourceDetails data ====", resourceDetails);

      // Set data based on resource type
      switch (resourceType) {
        case 'Supplier':
          setResourceData(resourceDetails.Supplier || []);
          break;
        case 'Driver':
          setResourceData(resourceDetails.Drivers || []);
          break;
        case 'Handler':
          setResourceData(resourceDetails.Handlers || []);
          break;
        case 'Vehicle':
          setResourceData(resourceDetails.Vehicles || []);
          break;
        case 'Schedule':
          setResourceData(resourceDetails.Schedule || []);
          break;
      }

      console.log("data ==== after set", resourceDetails);
    }
    catch (error) {
      console.error('Server-side search failed:', error);
    }
    finally {
      setIsLoadingResource(false); // Hide loader
    }
  };

  const handleCloseResourceDrawer = () => {
    setIsResourceSearchDrawerOpen(false);
  };

  const handleAddResource = (resources: any[]) => {
    setSelectedResources(resources);
    console.log('Selected resources:', resources);
    
    // Update the Resource field in formData with the first selected resource
    if (resources && resources.length > 0) {
      const firstResource = resources[0];
      const resourceId = firstResource?.ResourceID || '';
      
      // Update formData with the selected resource ID
      setFormData(prev => ({
        ...prev,
        resource: resourceId
      }));
      
      console.log('Updated formData.resource with:', resourceId);
    }
  };

  // Generic fetch function for master common data using quickOrderService.getMasterCommonData
  const makeLazyFetcher = (messageType: string) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });
      
      const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      
      // Fallback to empty array if API call fails
      return [];
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      // Return empty array on error
      return [];
    }
  };

  const fetchCarrierOptions = makeLazyFetcher("Executive Carrier Init");
  const fetchCarrierStatus = makeLazyFetcher("Carrier Status Init");
  const fetchLegDetails = makeLazyFetcher("Leg ID Init");
  const fetchServiceOptions = makeLazyFetcher("Service type Init");
  const fetchSubServiceOptions = makeLazyFetcher("Sub Service type Init");
  const fetchQC = makeLazyFetcher("QCUserDefined Init");
  const fetchDeparturePoint = makeLazyFetcher("Departure Init");
  const fetchArrivalPoint = makeLazyFetcher("Arrival Init");
  const fetchInfrastructureManager = makeLazyFetcher("Supplier Init");
  const fetchReason = makeLazyFetcher("Reason for SupplierChanges Init");

  // Function to fetch location data when legDetails changes
  const fetchLocationData = async (legDetailsValue: string) => {
    if (!legDetailsValue || legDetailsValue.trim() === '') {
      return;
    }

    try {
      // Extract leg ID from legDetails
      // legDetails format might be "LegFrom - LegTo" or "LegID || LegName" or just "LegID"
      let legId = legDetailsValue.trim();
      
      // If format is "LegFrom - LegTo", extract LegFrom (first part)
      if (legDetailsValue.includes(' - ')) {
        legId = legDetailsValue.split(' - ')[0].trim();
      }
      // If format is "LegID || LegName", extract LegID (first part)
      else if (legDetailsValue.includes(' || ')) {
        legId = legDetailsValue.split(' || ')[0].trim();
      }

      // Call API with "LegID OnSelect" messageType
      const response: any = await quickOrderService.getMasterLegResourceData({
        messageType: "LegID OnSelect",
        searchTerm: legId,
        offset: 0,
        limit: 100,
        AdditionalFilter: [
          { FilterName: "LegID", FilterValue: legId }
        ]
      });

      const rr: any = response?.data;
      const parsedResponse = rr?.ResponseData ? JSON.parse(rr.ResponseData) : null;

      if (parsedResponse) {
        // Handle both array and object response formats
        const responseData = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
        console.log("responseData ====", responseData);
        if (responseData) {
          console.log("if ====", responseData);
          // Extract departurePoint and arrivalPoint from response
          // Handle various possible field names in the response
          const departurePointValue = responseData.ResponsePayload.DeparturePoint || '';
          const departurePointDescription = responseData.ResponsePayload.DeparturePointDescription || '';
          const departurePoint = departurePointValue && departurePointDescription 
            ? `${departurePointValue} || ${departurePointDescription}` 
            : departurePointValue || departurePointDescription || '';

          const arrivalPointValue = responseData.ResponsePayload.ArrivalPoint || '';
          const arrivalPointDescription = responseData.ResponsePayload.ArrivalPointDescription || '';
          const arrivalPoint = arrivalPointValue && arrivalPointDescription 
            ? `${arrivalPointValue} || ${arrivalPointDescription}` 
            : arrivalPointValue || arrivalPointDescription || '';

          console.log("departurePoint ====", departurePoint);
          console.log("arrivalPoint ====", arrivalPoint);
          // Update formData with the fetched values
          setFormData(prev => ({
            ...prev,
            departurePoint: departurePoint,
            arrivalPoint: arrivalPoint
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching location data for leg:', error);
      toast({
        title: "Error",
        description: "Failed to fetch location data for the selected leg",
        variant: "destructive",
      });
    }
  };
 
  // Max character length validation for text fields - will include special characters and whitespace
  const MAX_LENGTH_supplierRef = 100;
  const MAX_LENGTH_trainNo = 100;
  const MAX_LENGTH_pathNo = 100;
  const MAX_LENGTH_remarks = 500;
  
  return (
    <div className="flex flex-col h-full">
      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Resource List */}
        <div className="w-72 border-r border-border bg-muted/30 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">All Resources</h3>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {resources.map((resource) => (
              <Card
                key={resource.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedResource?.id === resource.id ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => handleResourceClick(resource)}
              >
                <CardContent className="p-3">
                  <div className="font-medium text-sm">{resource.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{resource.type}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Carrier and Supplier Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>Resource Category</Label>
                  <Select value={formData.resourceCategory} onValueChange={(value) => {
                    // Clear the resource field when category changes
                    setFormData({ ...formData, resourceCategory: value, resource: '' });
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Schedule">Schedule</SelectItem>
                      <SelectItem value="Supplier">Supplier</SelectItem>
                      <SelectItem value="Handler">Handler</SelectItem>
                      <SelectItem value="Driver">Driver</SelectItem>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resource</Label>
                  <div className="relative">
                    <Input className="h-10"
                      value={formData.resource}
                      onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                    />
                    <Search 
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
                      onClick={() => {
                        const resourceCategory = formData.resourceCategory;
                        if (resourceCategory) {
                          // Pass the selected resourceCategory value to handleOpenResourceDrawer
                          handleOpenResourceDrawer(resourceCategory as 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule');
                        }
                      }}
                    />
                  </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Carrier (Executive Agent)</Label>
                <DynamicLazySelect
                  fetchOptions={fetchCarrierOptions}
                  value={formData.carrier}
                  onChange={(value) => setFormData({ ...formData, carrier: value as string })}
                  placeholder="Select Carrier (Executive Agent)"
                  className="w-full"
                  hideSearch={true}
                  disableLazyLoading={true}
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <div className="relative">
                  <Input className="h-10"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Supplier Ref and Carrier Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Ref. No.</Label>
                <Input 
                  className={`h-10 ${formData.supplierRef && formData.supplierRef.length > MAX_LENGTH_supplierRef ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                  placeholder="Enter Supplier Ref. No."
                  value={formData.supplierRef}
                  onChange={(e) => setFormData({ ...formData, supplierRef: e.target.value })}
                />
                <p className='text-xs text-red-500'>
                  {formData.supplierRef && formData.supplierRef.length > MAX_LENGTH_supplierRef && `Maximum character limit is ${MAX_LENGTH_supplierRef}. [${formData.supplierRef.length}/${MAX_LENGTH_supplierRef}]`}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Carrier Status</Label>
                <DynamicLazySelect
                  fetchOptions={fetchCarrierStatus}
                  value={formData.carrierStatus}
                  onChange={(value) => setFormData({ ...formData, carrierStatus: value as string })}
                  placeholder="Select Carrier Status"
                  className="w-full"
                  hideSearch={true}
                  disableLazyLoading={true}
                />
              </div>
            </div>

            {/* Schedule No and Train No */}
            <div className="grid grid-cols-2 gap-4">
              {/* <div className="space-y-2">
                <Label>Schedule No.</Label>
                <div className="relative">
                  <Input className="h-10"
                    placeholder="Select Schedule No."
                    value={formData.scheduleNo}
                    onChange={(e) => setFormData({ ...formData, scheduleNo: e.target.value })}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div> */}
              <div className="space-y-2">
                <Label>Infrastructure Manager Name</Label>
                <DynamicLazySelect
                  fetchOptions={fetchInfrastructureManager}
                  value={formData.infrastructureManager}
                  onChange={(value) => setFormData({ ...formData, infrastructureManager: value as string })}
                  placeholder="Select Infrastructure Manager Name"
                  className="w-full"
                  hideSearch={false}
                  disableLazyLoading={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Train No (License Plate No.)</Label>
                <Input 
                  className={`h-10 ${formData.trainNo && formData.trainNo.length > MAX_LENGTH_trainNo ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                  placeholder="Enter Train No."
                  value={formData.trainNo}
                  onChange={(e) => setFormData({ ...formData, trainNo: e.target.value })}
                />
                <p className='text-xs text-red-500'>
                  {formData.trainNo && formData.trainNo.length > MAX_LENGTH_trainNo && `Maximum character limit is ${MAX_LENGTH_trainNo}. [${formData.trainNo.length}/${MAX_LENGTH_trainNo}]`}
                </p>
              </div>
            </div>

            {/* Path No and Leg Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Path No.</Label>
                <Input 
                  className={`h-10 ${formData.pathNo && formData.pathNo.length > MAX_LENGTH_pathNo ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                  placeholder="Enter Path No."
                  value={formData.pathNo}
                  onChange={(e) => setFormData({ ...formData, pathNo: e.target.value })}
                />
                <p className='text-xs text-red-500'>
                  {formData.pathNo && formData.pathNo.length > MAX_LENGTH_pathNo && `Maximum character limit is ${MAX_LENGTH_pathNo}. [${formData.pathNo.length}/${MAX_LENGTH_pathNo}]`}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Leg Details</Label>
                <DynamicLazySelect
                  fetchOptions={fetchLegDetails}
                  value={formData.legDetails}
                  onChange={async (value) => {
                    const legDetailsValue = value as string;
                    setFormData({ ...formData, legDetails: legDetailsValue });
                    // Call API to fetch location data when legDetails changes
                    await fetchLocationData(legDetailsValue);
                  }}
                  placeholder="Select Leg Details"
                  className="w-full"
                  hideSearch={false}
                  disableLazyLoading={false}
                />
              </div>
            </div>

            {/* Departure and Arrival Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departure Point</Label>
                <DynamicLazySelect
                  fetchOptions={fetchDeparturePoint}
                  value={formData.departurePoint}
                  onChange={(value) => setFormData({ ...formData, departurePoint: value as string })}
                  placeholder="Select Departure Point"
                  className="w-full"
                  hideSearch={false}
                  disableLazyLoading={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Arrival Point</Label>
                <DynamicLazySelect
                  fetchOptions={fetchArrivalPoint}
                  value={formData.arrivalPoint}
                  onChange={(value) => setFormData({ ...formData, arrivalPoint: value as string })}
                  placeholder="Select Arrival Point"
                  className="w-full"
                  hideSearch={false}
                  disableLazyLoading={false}
                />
              </div>
            </div>

            {/* Service and Sub Service */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service</Label>
                <DynamicLazySelect
                  fetchOptions={fetchServiceOptions}
                  value={formData.service}
                  onChange={(value) => setFormData({ ...formData, service: value as string })}
                  placeholder="Select Service"
                  className="w-full"
                  hideSearch={true}
                  disableLazyLoading={true}
                />
              </div>
              <div className="space-y-2">
                <Label>Sub Service</Label>
                <DynamicLazySelect
                  fetchOptions={fetchSubServiceOptions}
                  value={formData.subService}
                  onChange={(value) => setFormData({ ...formData, subService: value as string })}
                  placeholder="Select Sub Service"
                  className="w-full"
                  hideSearch={true}
                  disableLazyLoading={true}
                />
              </div>
            </div>

            {/* Infrastructure Manager and Reason */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quick Code</Label>
                <InputDropdown
                  value={QCCode}
                  onChange={(value) => {
                    setQCCode(value);
                    // Update formData with QC values
                    setFormData({
                      ...formData,
                      QCCode: value.dropdown || '',
                      QCCodeValue: value.input || '',
                    });
                  }}
                  options={QC}
                  placeholder="Enter Value"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason <span className="text-destructive">*</span></Label>
                <DynamicLazySelect
                  fetchOptions={fetchReason}
                  error={reasonError}
                  value={formData.reason}
                  onChange={(value) => setFormData({ ...formData, reason: value as string })}
                  placeholder="Select Reason"
                  className="w-full"
                  hideSearch={true}
                  disableLazyLoading={true}
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                placeholder="Enter remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                className={formData.remarks && formData.remarks.length > MAX_LENGTH_remarks ? 'border-red-600 focus-visible:ring-red-600' : ''}
              />
              <p className='text-xs text-red-500'>
                {formData.remarks && formData.remarks.length > MAX_LENGTH_remarks && `Maximum character limit is ${MAX_LENGTH_remarks}. [${formData.remarks.length}/${MAX_LENGTH_remarks}]`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={handleSave}>
          Save Resource
        </Button>
      </div>

      {/* Loading Overlay for Resources */}
      {isShowLoaderForResources && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
          <div className="text-lg font-semibold text-blue-700">Loading Resources...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching Resources data from server, please wait.</div>
        </div>
      )}

      {/* Resource Selection Drawer */}
      <ResourceSearchDrawer
        isOpen={isResourceSearchDrawerOpen}
        onClose={handleCloseResourceDrawer}
        onAddResource={handleAddResource}
		    tripInformation={tripInformation}
        onUpdateTripInformation={(updatedTripInformation) => {
          setTripInformation(updatedTripInformation);
          console.log('TripInformation updated from ResourceSelectionDrawer:', updatedTripInformation);
        }}
        selectedResourcesRq={(() => {
          // Return the appropriate selected resources based on current resource type
          switch (currentResourceType) {
            case 'Handler':
              return tripResourceDetailsData?.Handlers || [];
            case 'Vehicle':
              return tripResourceDetailsData?.Vehicle || [];
            case 'Driver':
              return tripResourceDetailsData?.Drivers || [];
            case 'Supplier':
              return tripResourceDetailsData?.Supplier || [];
            case 'Schedule':
              return tripResourceDetailsData?.Schedule || [];
            default:
              return [];
          }
        })()}
        resourceType={currentResourceType}
        resourceData={resourceData}
        isLoading={isLoadingResource}
      />
    </div>
  );
};
