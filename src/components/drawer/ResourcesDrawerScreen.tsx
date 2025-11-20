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
  QCUserDefined: string;
  QCUserDefinedValue: string;
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
  QCUserDefined: '',
  QCUserDefinedValue: '',
};

const initialResources: Resource[] = [
  { 
    id: 'SCH32030023', 
    type: 'Schedule', 
    name: 'SCH32030023',
    formData: {
      resourceCategory: 'Schedule',
      resource: 'SCH32030023',
      carrier: 'ABC Executive Agent',
      supplier: 'ABC Supplier',
      supplierRef: 'REF001',
      carrierStatus: 'Inprogress',
      scheduleNo: 'SCH32030023',
      trainNo: 'TR001',
      pathNo: 'P001',
      legDetails: '01 - Voila to Curtici',
      departurePoint: 'S3-202705, Voila',
      arrivalPoint: 'S3-21925-3, Curtici',
      service: 'service1',
      subService: 'sub1',
      infrastructureManager: 'IM001',
      reason: 'reason1',
      remarks: 'Schedule resource details',
      QCUserDefined: 'QC1',
      QCUserDefinedValue: 'QC1 value',
    }
  },
  { 
    id: 'DB Cargo', 
    type: 'Agent', 
    name: 'DB Cargo',
    formData: {
      resourceCategory: 'Agent',
      resource: 'SCH002',
      carrier: 'DB Cargo Agent',
      supplier: 'DB Supplier',
      supplierRef: 'REF002',
      carrierStatus: 'Completed',
      scheduleNo: 'SCH002',
      trainNo: 'TR002',
      pathNo: 'P002',
      legDetails: '01 - Voila to Curtici',
      departurePoint: 'S3-202705, Voila',
      arrivalPoint: 'S3-21925-3, Curtici',
      service: 'service2',
      subService: 'sub2',
      infrastructureManager: 'IM002',
      reason: 'reason2',
      remarks: 'Agent resource details',
      QCUserDefined: 'QC2',
      QCUserDefinedValue: 'QC2 value',
    }
  },
  { 
    id: '14388 (RAM)', 
    type: 'Handler', 
    name: '14388 (RAM)',
    formData: {
      resourceCategory: 'Handler',
      resource: 'HAND001',
      carrier: 'RAM Executive Agent',
      supplier: 'RAM Supplier',
      supplierRef: 'REF003',
      carrierStatus: 'Pending',
      scheduleNo: 'SCH003',
      trainNo: 'TR003',
      pathNo: 'P003',
      legDetails: '01 - Voila to Curtici',
      departurePoint: 'S3-202705, Voila',
      arrivalPoint: 'S3-21925-3, Curtici',
      service: 'service1',
      subService: 'sub1',
      infrastructureManager: 'IM003',
      reason: 'reason1',
      remarks: 'Handler resource details',
      QCUserDefined: 'QC3',
      QCUserDefinedValue: 'QC3 value',
    }
  },
];

export const ResourcesDrawerScreen = ({ onClose }: { onClose?: () => void }) => {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isResourceSearchDrawerOpen, setIsResourceSearchDrawerOpen] = useState(false);
  const [currentResourceType, setCurrentResourceType] = useState<'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule'>('Supplier');
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const [tripInformation, setTripInformation] = useState<any>({});
  const [tripResourceDetailsData, setTripResourceDetailsData] = useState<any>({});
  const bindQC = (): InputDropdownValue => ({
    dropdown: formData?.QCUserDefined ?? "",
    input: formData?.QCUserDefinedValue ?? "", // use `input`, not `value`
  });
  const [QCUserDefined, setQCUserDefined] = useState<InputDropdownValue>(bindQC());
  const [QC, setQC] = useState<any>([]);

  // Auto-select first resource on mount
  useEffect(() => {
    if (resources.length > 0) {
      const firstResource = resources[0];
      setSelectedResource(firstResource);
      setFormData(firstResource.formData);
    }
  }, []);

  // Fetch QC data for InputDropdown
  useEffect(() => {
    const fetchQCData = async () => {
      try {
        const response: any = await quickOrderService.getMasterCommonData({
          messageType: "QCUserDefined Init",
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
    // Update QCUserDefined state when resource is selected
    setQCUserDefined({
      dropdown: resource.formData?.QCUserDefined ?? "",
      input: resource.formData?.QCUserDefinedValue ?? "",
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

  const handleSave = () => {
    console.log("formData ==== before save (changed data from forms):", formData);
    console.log("selectedResource ====", selectedResource);
    console.log("resources array ====", resources);
    
    // Determine ModeFlag based on selectedResource
    const modeFlag = selectedResource ? "Update" : "Insert";
    // Split dropdown values
    const carrierData = splitDropdownValue(formData.carrier);
    const carrierStatusData = splitDropdownValue(formData.carrierStatus);
    const legDetailsData = splitDropdownValue(formData.legDetails);
    const serviceData = splitDropdownValue(formData.service);
    const subServiceData = splitDropdownValue(formData.subService);
    
    const formPayload = {
      ...formData,
      carrier: carrierData.value || '',
      carrierStatus: carrierStatusData.value || '',
      legDetails: legDetailsData.value || '',
      service: serviceData.value || '',
      subService: subServiceData.value || '',
      ModeFlag: modeFlag
    }
    // Create payload by updating selectedResource with new formData and ModeFlag
    let payload: any;
    
    if (selectedResource) {
      // For update: Take selectedResource structure and update formData with current formData changes
      // Also add ModeFlag to the payload
      payload = {
        ...selectedResource,  // Keep id, type, name, and all existing properties
        formData: formPayload,  // Update formData with changed data from forms
        // ModeFlag: modeFlag   // Add ModeFlag
      };
    } else {
      // For insert: Create new resource structure with current formData
      payload = {
        id: `RES${Date.now()}`,
        type: formData.resourceCategory as 'Schedule' | 'Agent' | 'Handler' || 'Schedule',
        name: formData.resource || formData.scheduleNo || `Resource ${resources.length + 1}`,
        formData: formPayload,  // Use current formData
        // ModeFlag: modeFlag   // Add ModeFlag
      };
    }
    
    console.log("SelectedResource (original):", selectedResource);
    console.log("FormData (changed data from forms):", formData);
    console.log("Final payload (selectedResource + updated formData + ModeFlag):", payload);
    console.log("formPayload:", formPayload);
    
    // Update local state
    if (selectedResource) {
      // Update existing resource in resources array with new formData
      setResources(prev => 
        prev.map(r => 
          r.id === selectedResource.id 
            ? { ...r, formData: formPayload } 
            : r
        )
      );
    } else {
      // Create new resource
      const newResource: Resource = {
        id: `RES${Date.now()}`,
        type: formData.resourceCategory as 'Schedule' | 'Agent' | 'Handler' || 'Schedule',
        name: formData.resource || formData.scheduleNo || `Resource ${resources.length + 1}`,
        formData: formPayload,
      };
      setResources(prev => [...prev, newResource]);
      setSelectedResource(newResource);
      console.log("newResource ====", newResource);
    }
    
    // TODO: Call API with payload
    // Example: await tripPlanningService.saveResource(payload);
    
    console.log("Payload ready to send to API:", payload);
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setSelectedResource(null);
  };

  // Handle resource drawer open/close
  const handleOpenResourceDrawer = async (resourceType: 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule') => {
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
        case 'Equipment':
          response = await tripPlanningService.getEquipmentList({
            searchCriteria: finalSearchCriteria
          });
          break;
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
                          handleOpenResourceDrawer(resourceCategory as 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule');
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
                <Input className="h-10"
                  placeholder="Enter Supplier Ref. No."
                  value={formData.supplierRef}
                  onChange={(e) => setFormData({ ...formData, supplierRef: e.target.value })}
                />
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
                <Input className="h-10"
                  placeholder="Enter Infrastructure Manager Name"
                  value={formData.infrastructureManager}
                  onChange={(e) => setFormData({ ...formData, infrastructureManager: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Train No (License Plate No.)</Label>
                <Input className="h-10"
                  placeholder="Enter Train No."
                  value={formData.trainNo}
                  onChange={(e) => setFormData({ ...formData, trainNo: e.target.value })}
                />
              </div>
            </div>

            {/* Path No and Leg Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Path No.</Label>
                <Input className="h-10"
                  placeholder="Enter Path No."
                  value={formData.pathNo}
                  onChange={(e) => setFormData({ ...formData, pathNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Leg Details</Label>
                <DynamicLazySelect
                  fetchOptions={fetchLegDetails}
                  value={formData.legDetails}
                  onChange={(value) => setFormData({ ...formData, legDetails: value as string })}
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
                <div className="relative">
                  <Input className="h-10"
                    value={formData.departurePoint}
                    onChange={(e) => setFormData({ ...formData, departurePoint: e.target.value })}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Arrival Point</Label>
                <div className="relative">
                  <Input className="h-10"
                    value={formData.arrivalPoint}
                    onChange={(e) => setFormData({ ...formData, arrivalPoint: e.target.value })}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
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
                  value={QCUserDefined}
                  onChange={(value) => {
                    setQCUserDefined(value);
                    // Update formData with QC values
                    setFormData({
                      ...formData,
                      QCUserDefined: value.dropdown || '',
                      QCUserDefinedValue: value.input || '',
                    });
                  }}
                  options={QC}
                  placeholder="Enter Value"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input className="h-10"
                    placeholder="Enter Reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
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
              />
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
        // selectedResourcesRq={EquipmentData}
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
