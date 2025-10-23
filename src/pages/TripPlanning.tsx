import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, Package, Settings, ExternalLink, Home, ChevronRight, CalendarIcon, MapPin, Building2, Users, Truck, Calendar as CalendarIcon2, Box, UserCog, Car, UserCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SmartGrid } from '@/components/SmartGrid';
import type { GridColumnConfig } from '@/types/smartgrid';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { quickOrderService } from '@/api/services/quickOrderService';
import { ResourceSelectionDrawer } from '@/components/ResourceSelectionDrawer';
import { TripCOHub } from '@/components/TripPlanning/TripCOHub';
import { useNavigate } from 'react-router-dom';
import { tripPlanningService } from '@/api/services/tripPlanningService';
import { useToast } from '@/hooks/use-toast';
import { TripCOHubMultiple } from '@/components/TripPlanning/TripCOHubMultiple';

const TripPlanning = () => {
  const navigate = useNavigate();
  const [tripNo, setTripNo] = useState('');
  const [location, setLocation] = useState('');
  const [cluster, setCluster] = useState('');
  const [tripType, setTripType] = useState('Normal Trip');
  const [planDate, setPlanDate] = useState<Date>(new Date());
  const [requestSupplier, setRequestSupplier] = useState(false);
  const [customerOrderSearch, setCustomerOrderSearch] = useState('');
  const [referenceDocType, setReferenceDocType] = useState('');
  const [referenceDocNo, setReferenceDocNo] = useState('');
  const [transportMode, setTransportMode] = useState('rail');
  const [departureCode, setDepartureCode] = useState('234315');
  const [departureLocation, setDepartureLocation] = useState('Berlin Central Station');
  const [arrivalCode, setArrivalCode] = useState('52115');
  const [arrivalLocation, setArrivalLocation] = useState('Frankfurt Station');
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [consolidatedTrip, setConsolidatedTrip] = useState(false);
  // Generic resource drawer state
  const [isResourceDrawerOpen, setIsResourceDrawerOpen] = useState(false);
  const [currentResourceType, setCurrentResourceType] = useState<'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle'>('Equipment');
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [newCustomerData, setNewCustomerData] = useState<any[]>([]);
  const [selectedArrCOData, setSelectedArrCOData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isLoadingResource, setIsLoadingResource] = useState(false);

  const isWagonContainer = tripType === 'Wagon/Container Movement';
  const { toast } = useToast();

  // Debug useEffect to track selectedArrCOData changes
  useEffect(() => {
    console.log("🔍 selectedArrCOData changed:", selectedArrCOData);
    console.log("🔍 selectedArrCOData length:", selectedArrCOData?.length);
  }, [selectedArrCOData]);

  // Customer Orders Grid Configuration
  const customerOrdersColumns: GridColumnConfig[] = [
    { key: 'orderNo', label: 'Order No.', type: 'Text', width: 150, editable: false },
    { key: 'customerName', label: 'Customer Name', type: 'Text', width: 200, editable: false },
    { key: 'orderDate', label: 'Order Date', type: 'Date', width: 150, editable: false },
    { key: 'deliveryDate', label: 'Delivery Date', type: 'Date', width: 150, editable: false },
    { key: 'origin', label: 'Origin', type: 'Text', width: 180, editable: false },
    { key: 'destination', label: 'Destination', type: 'Text', width: 180, editable: false },
    { key: 'weight', label: 'Weight (kg)', type: 'Text', width: 120, editable: false },
    { key: 'volume', label: 'Volume (m³)', type: 'Text', width: 120, editable: false },
    { key: 'status', label: 'Status', type: 'Badge', width: 120, editable: false, statusMap: {
      'Confirmed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Transit': 'bg-blue-100 text-blue-800',
    }},
  ];

  const customerOrdersData = [
    {
      id: '1',
      orderNo: 'ORD-2023-001',
      customerName: 'Acme Corp',
      orderDate: '2023-10-01',
      deliveryDate: '2023-10-15',
      origin: 'Berlin Central Station',
      destination: 'Frankfurt Station',
      weight: 1500,
      volume: 12.5,
      status: 'Confirmed',
    },
    {
      id: '2',
      orderNo: 'ORD-2023-002',
      customerName: 'Global Logistics GmbH',
      orderDate: '2023-10-02',
      deliveryDate: '2023-10-16',
      origin: 'Hamburg Port',
      destination: 'Munich Hub',
      weight: 2300,
      volume: 18.2,
      status: 'Pending',
    },
    {
      id: '3',
      orderNo: 'ORD-2023-003',
      customerName: 'Express Shipping Ltd',
      orderDate: '2023-10-03',
      deliveryDate: '2023-10-14',
      origin: 'Cologne Station',
      destination: 'Stuttgart Center',
      weight: 890,
      volume: 7.8,
      status: 'In Transit',
    },
  ];

  // Handle Manage Trips button click
  const handleManageTripsClick = () => {
    navigate('/trip-hub?createTripPlan=true');
  };

  // Handle equipment selection

  // Handle resource drawer open/close
  const handleOpenResourceDrawer = async (resourceType: 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle') => {
    console.log(`Opening ${resourceType.toLowerCase()} drawer`);
    setCurrentResourceType(resourceType);
    setIsLoadingResource(true); // Show loader
    setIsResourceDrawerOpen(true);
    
    const finalSearchCriteria = {
      "PlanningProfileID": "General-GMBH",
      "Location": "10-00004",
      "PlanDate": "",
      "ResourceProfileID": "",
      "Service": "",
      "ServiceDescription":"",
      "SubServiceType": "",
      "SubServiceDescription":""
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
        default:
          throw new Error(`Unknown resource type: ${resourceType}`);
      }
      
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      console.log('Response:', JSON.parse(response?.data?.ResponseData));
      const resourceDetails = parsedResponse.ResourceDetails;
      console.log("data ====", resourceDetails);
      
      // Set data based on resource type
      switch (resourceType) {
        case 'Equipment':
          setResourceData(resourceDetails.Equipments || []);
          break;
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
    setIsResourceDrawerOpen(false);
  };

  const handleAddResource = (resources: any[]) => {
    setSelectedResources(resources);
    console.log('Selected resources:', resources);
    console.log('Selected customerOrderList:', customerOrderList);

    // Transform the new resources into the required ResourceDetails format
    const transformedResourceDetails = resources.map(resource => ({
      "ResourceID": resource.id || resource.ResourceID || resource.EquipmentID || resource.VendorID || resource.DriverCode || resource.HandlerID || resource.VehicleID,
      "ResourceType": resource.resourceType || resource.ResourceType || 
        (resource.EquipmentID ? 'Equipment' : 
         resource.VendorID ? 'Agent' : 
         resource.DriverCode ? 'Driver' : 
         resource.HandlerID ? 'Handler' : 
         resource.VehicleID ? 'Vehicle' : 'Unknown'),
      "Service": resource.Service || "",
      "ServiceDescription": resource.ServiceDescription || "",
      "SubService": resource.SubService || "",
      "SubServiceDescription": resource.SubServiceDescription || "",
      "EffectiveFromDate": format(planDate, "yyyy-MM-dd"),
      "EffectiveToDate": format(planDate, "yyyy-MM-dd"),
      "ModeFlag": "Insert"
    }));    
    
    // Create updated customer order list object with ResourceDetails
    const updatedCustomerList = {
      ...(typeof customerOrderList === 'object' && customerOrderList !== null ? customerOrderList : {}),
      "ResourceDetails": transformedResourceDetails,
      "ModeFlag": "Insert",
    };
    
    // Get existing customer order array or initialize empty array
    const existingCustomerOrderArray = selectedArrCOData || [];
    
    // Check if this customer order already exists in the array
    const existingIndex = existingCustomerOrderArray.findIndex(item => 
      item.CustomerOrderID === ((customerOrderList as any)?.CustomerOrderID || '')
    );
    
    let updatedCustomerOrderArray;
    if (existingIndex !== -1) {
      // Update existing customer order by merging resources
      updatedCustomerOrderArray = [...existingCustomerOrderArray];
      const existingCustomerOrder = updatedCustomerOrderArray[existingIndex];
      
      // Merge existing ResourceDetails with new ones
      const existingResourceDetails = existingCustomerOrder.ResourceDetails || [];
      const mergedResourceDetails = [...existingResourceDetails, ...transformedResourceDetails];
      
      // Update the existing customer order with merged resources
      updatedCustomerOrderArray[existingIndex] = {
        ...existingCustomerOrder,
        "ResourceDetails": mergedResourceDetails,
        "ModeFlag": "Insert"
      };
    } else {
      // Add new customer order to the array
      updatedCustomerOrderArray = [...existingCustomerOrderArray, updatedCustomerList];
    }
    
    // Update the customer order array state
    setSelectedArrCOData(updatedCustomerOrderArray);
    
    console.log("Updated selectedArrCOData:", selectedArrCOData);
    console.log("Updated customer order array:", updatedCustomerOrderArray);
    console.log("Total customer orders in array:", updatedCustomerOrderArray.length);
    
    // Show success toast
    toast({
      title: "✅ Resources Added",
      description: `Successfully added ${resources.length} resources to customer order. Total customer orders: ${updatedCustomerOrderArray.length}`,
      variant: "default",
    });
  };

  //BreadCrumb data
  const breadcrumbItems = [
    { label: 'Home', href: '/', active: false },
    { label: 'Transport Planning and Execution', href: '/trip-hub', active: false }, // Updated breadcrumb
    { label: 'Trip Planning', active: true } // Updated breadcrumb
  ];

  // Generic fetch function for master common data using quickOrderService.getMasterCommonData
  const fetchMasterData = (messageType: string) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
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

  // Specific fetch functions for different message types
  const fetchLocations = fetchMasterData("Location Init");
  const fetchCluster = fetchMasterData("Cluster Init");
  const fetchRefDocType = fetchMasterData("Ref Doc Type(Tug) Init");

  const fetchSupplier = fetchMasterData("Supplier Init");
  const fetchSchedule = fetchMasterData("Schedule ID Init");
  const [supplier, setSupplier] = useState<string | undefined>();
  const [schedule, setSchedule] = useState<string | undefined>();
  const [addResourcesFlag, setAddResourcesFlag] = useState<boolean>(false);
  const [customerOrderList, setcustomerOrderList] = useState<any>();
  const handleCustomerOrderSelect = (customerOrderList: any) => {
    console.log("✅ Received from child:", customerOrderList);
    
    // Remove Status and TripBillingStatus, and add ModeFlag to the customerOrderList object
    const { Status, TripBillingStatus, ...rest } = customerOrderList;
    const updatedCustomerOrderList = {
      ...rest,
      "ModeFlag": "Insert"
    };
    
    console.log("✅ Updated customerOrderList with ModeFlag (removed Status and TripBillingStatus):", updatedCustomerOrderList);
    
    setcustomerOrderList(updatedCustomerOrderList);
    setAddResourcesFlag(true);
  }

  const handleMultipleCustomerOrders = (selectedRows: any[]) => {
    console.log('Customer Orders selection changed:', selectedRows);
    console.log('Number of selected rows:', selectedRows.length);
    
    if (selectedRows.length === 0) {
      console.log('All selections cleared');
      // Handle empty selection case
      // For example: hide bulk actions, reset state, etc.
      return;
    }
    
    // Add ModeFlag to each selected row and remove Status and TripBillingStatus
    const updatedSelectedRows = selectedRows.map(row => {
      const { Status, TripBillingStatus, ...rest } = row;
      return {
        ...rest,
        "ModeFlag": "Insert"
      };
    });
    
    console.log('✅ Updated Customer Orders with ModeFlag:', updatedSelectedRows);
    setSelectedRows(updatedSelectedRows);
    
    // You can process the selected rows here
    // For example:
    // - Store them in state for further processing
    // - Send them to an API
    // - Update UI based on selection
    
    // Example: Extract CustomerOrderIDs
    const customerOrderIds = selectedRows.map(row => row.CustomerOrderID);
    console.log('Customer Order IDs:', customerOrderIds);
    
    // Example: Store in state (if needed)
    // setSelectedCustomerOrders(selectedRows);
  }

  const createBulkTripData = async () => {
    console.log("createBulkTripData", selectedRows);
    console.log("createBulkTripData", selectedResources);
    const splitAtPipe = (value: string | null | undefined) => {
      if (typeof value === "string" && value.includes("||")) {
        const [first, ...rest] = value.split("||");
        return first.trim(); // Return only the value part (before pipe)
      }
      return value;
    };

    const processedLocation = splitAtPipe(location);
    const processedCluster = splitAtPipe(cluster);

    const transformedResourceDetails = selectedResources.map(resource => ({
      "ResourceID": resource.id || resource.ResourceID || resource.EquipmentID || resource.VendorID || resource.DriverCode || resource.HandlerID || resource.VehicleID,
      "ResourceType": resource.resourceType || resource.ResourceType || 
        (resource.EquipmentID ? 'Equipment' : 
         resource.VendorID ? 'Agent' : 
         resource.DriverCode ? 'Driver' : 
         resource.HandlerID ? 'Handler' : 
         resource.VehicleID ? 'Vehicle' : 'Unknown'),
      "Service": resource.Service || "",
      "ServiceDescription": resource.ServiceDescription || "",
      "SubService": resource.SubService || "",
      "SubServiceDescription": resource.SubServiceDescription || "",
      "EffectiveFromDate": format(planDate, "yyyy-MM-dd"),
      "EffectiveToDate": format(planDate, "yyyy-MM-dd"),
      "ModeFlag": "Insert"
    }));

    const tripData = {
      "Header": {
        "TripType": tripType,
        "PlanningProfileID": "General-GMBH",
        "Location": processedLocation, // Now processedLocation is already just the code
        "Cluster": processedCluster,
        "PlanDate": format(planDate, "yyyy-MM-dd")
      },
      "CustomerOrders": selectedRows || [],
      "ResourceDetails": transformedResourceDetails || []
    }
    
    console.log("createSingleTripData", tripData);
    console.log("Updated customerOrderList with ResourceDetails:", selectedArrCOData);
    try {
      const response: any = await tripPlanningService.createMultipleCOTripPlan(tripData);
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      // const data = parsedResponse;
      const resourceStatus = (response as any)?.data?.IsSuccess;
      console.log("parsedResponse ====", parsedResponse);
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "✅ Trip Created Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Save Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating nested data:", error);
    }

  }

  const createSingleTripData = async () => {
    const splitAtPipe = (value: string | null | undefined) => {
      if (typeof value === "string" && value.includes("||")) {
        const [first, ...rest] = value.split("||");
        return first.trim(); // Return only the value part (before pipe)
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
    // Process location data using splitAtPipe to get the code value
    console.log("location ====", location);
    const processedLocation = splitAtPipe(location);
    const processedCluster = splitAtPipe(cluster);
    console.log("processedLocation ====", processedLocation);
    
    console.log("selectedArrCOData", selectedArrCOData);
    
    // Check if selectedArrCOData is empty and show warning
    // if (!selectedArrCOData || selectedArrCOData.length === 0) {
    //   console.warn("⚠️ selectedArrCOData is empty! Make sure to add resources first using the resource selection drawer.");
    //   toast({
    //     title: "⚠️ No Resources Selected",
    //     description: "Please select resources using the resource selection drawer before creating trip data.",
    //     variant: "destructive",
    //   });
    //   return; // Exit early if no data
    // }
    
    // Transform selectedResources into the required ResourceDetails format
    // const transformedResourceDetails = selectedResources.map(resource => ({
    //   "ResourceID": resource.id || resource.ResourceID || resource.EquipmentID || resource.VendorID || resource.DriverCode || resource.HandlerID || resource.VehicleID,
    //   "ResourceType": resource.resourceType || resource.ResourceType || 
    //     (resource.EquipmentID ? 'Equipment' : 
    //      resource.VendorID ? 'Agent' : 
    //      resource.DriverCode ? 'Driver' : 
    //      resource.HandlerID ? 'Handler' : 
    //      resource.VehicleID ? 'Vehicle' : 'Unknown'),
    //   "Service": resource.Service || "",
    //   "ServiceDescription": resource.ServiceDescription || "",
    //   "SubService": resource.SubService || "",
    //   "SubServiceDescription": resource.SubServiceDescription || "",
    //   "EffectiveFromDate": format(planDate, "yyyy-MM-dd"),
    //   "EffectiveToDate": format(planDate, "yyyy-MM-dd"),
    //   "ModeFlag": "Insert"
    // }));
    
    // Push selectedResources into customerOrderList object
    // const updatedcustomerOrderList = {
    //   ...(typeof customerOrderList === 'object' && customerOrderList !== null ? customerOrderList : {}),
    //   "ResourceDetails": transformedResourceDetails,
    //   "ModeFlag": "Insert",
    // };
    
    const tripData = {
      "Header": {
        "TripType": tripType,
        "PlanningProfileID": "General-GMBH",
        "Location": processedLocation, // Now processedLocation is already just the code
        "Cluster": processedCluster,
        "PlanDate": format(planDate, "yyyy-MM-dd")
      },
      "CustomerOrders": selectedArrCOData || []
    }
    
    console.log("createSingleTripData", tripData);
    console.log("Updated customerOrderList with ResourceDetails:", selectedArrCOData);
    try {
      const response: any = await tripPlanningService.createTripPlan(tripData);
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      // const data = parsedResponse;
      const resourceStatus = (response as any)?.data?.IsSuccess;
      console.log("parsedResponse ====", parsedResponse);
      if (resourceStatus) {
        console.log("Trip data updated in store");
        toast({
          title: "✅ Trip Created Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Save Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating nested data:", error);
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="px-6 py-6 main-bg">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          {/* Trip No. Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold">Trip No.</h1>
              <div className="flex items-center gap-2">
              <Button 
                  variant="outline" 
                  className="text-primary border-primary"
                  onClick={handleManageTripsClick}
                >
                  Manage Trips
                </Button>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative max-w-md">
              <Input 
                placeholder="Trip No."
                value={tripNo}
                onChange={(e) => setTripNo(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Planning Details Card */}
          <div className="bg-card border border-border rounded-lg px-6 pt-3 pb-6 mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium">Planning Details</h2>
                {/* <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  </div>
                  <span className="text-sm">{location}</span>
                </div> */}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                  Normal Trip
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  12-Mar-2025
                </Badge>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location <span className="text-red-500 ml-1">*</span></label>
                <DynamicLazySelect
                  fetchOptions={fetchLocations}
                  value={location}
                  onChange={(value) => setLocation(value as string)}
                  placeholder=""
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cluster</label>
                <DynamicLazySelect
                  fetchOptions={fetchCluster}
                  value={cluster}
                  onChange={(value) => setCluster(value as string)}
                  placeholder=""
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trip Type</label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal Trip">Normal Trip</SelectItem>
                    <SelectItem value="Wagon/Container Movement">Wagon/Container Movement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal relative",
                        !planDate && "text-muted-foreground"
                      )}
                    >
                      {planDate ? format(planDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                      <CalendarIcon className="mr-2 h-4 w-4 absolute right-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={planDate}
                      onSelect={(date) => date && setPlanDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {isWagonContainer && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Doc. Type</label>
                  <DynamicLazySelect
                    fetchOptions={fetchRefDocType}
                    value={referenceDocType}
                    onChange={(value) => setReferenceDocType(value as string)}
                    placeholder=""
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Doc. No.</label>
                  <div className="relative">
                    <Input 
                      placeholder="Enter Reference Doc. No."
                      value={referenceDocNo}
                      onChange={(e) => setReferenceDocNo(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport Mode</label>
                  <RadioGroup value={transportMode} onValueChange={setTransportMode} className="flex items-center gap-6 h-10">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rail" id="rail" />
                      <Label htmlFor="rail" className="cursor-pointer">Rail</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="road" id="road" />
                      <Label htmlFor="road" className="cursor-pointer">Road</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* <div className="flex items-center gap-2 mt-4">
              <Checkbox 
                id="request-supplier"
                checked={requestSupplier}
                onCheckedChange={(checked) => setRequestSupplier(checked as boolean)}
              />
              <label 
                htmlFor="request-supplier" 
                className="text-sm font-medium cursor-pointer"
              >
                Request Supplier
              </label>
            </div> */}
          </div>

          {/* Conditional Content Based on Trip Type */}
          {isWagonContainer ? (
            <div className="flex gap-6">
              {/* Address Details Section - Left */}
              <div className="flex-1 bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-medium">Address Details</h2>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Departure */}
                  <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm">Departure</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Departure *</label>
                      <div className="relative">
                        <Input 
                          value={`${departureCode} | ${departureLocation}`}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parts = value.split('|');
                            setDepartureCode(parts[0]?.trim() || '');
                            setDepartureLocation(parts[1]?.trim() || '');
                          }}
                          className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-white p-3 rounded border border-border">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">Berlin Central Station - Europaplatz 1, 10557</p>
                        <p className="text-muted-foreground">Berlin, Germany</p>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="space-y-4 bg-orange-50/50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm">Arrival</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Arrival *</label>
                      <div className="relative">
                        <Input 
                          value={`${arrivalCode} | ${arrivalLocation}`}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parts = value.split('|');
                            setArrivalCode(parts[0]?.trim() || '');
                            setArrivalLocation(parts[1]?.trim() || '');
                          }}
                          className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-white p-3 rounded border border-border">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">Hauptbahnhof, 60329 Frankfurt am Main,</p>
                        <p className="text-muted-foreground">Germany</p>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources Cards - Right */}
              <div className="w-80 space-y-3">
                {[
                  { title: 'Resources', subtitle: 'Selected Resources', icon: Users, color: 'bg-pink-100', iconColor: 'text-pink-600' },
                  { title: 'Supplier', icon: Truck, color: 'bg-cyan-100', iconColor: 'text-cyan-600' },
                  { title: 'Schedule', icon: CalendarIcon2, color: 'bg-lime-100', iconColor: 'text-lime-600' },
                  { title: 'Equipment', icon: Box, color: 'bg-red-100', iconColor: 'text-red-600' },
                  { title: 'Handler', icon: UserCog, color: 'bg-orange-100', iconColor: 'text-orange-600' },
                  { title: 'Vehicle', icon: Car, color: 'bg-amber-100', iconColor: 'text-amber-600' },
                  { title: 'Driver', icon: UserCircle, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
                ].map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <Card key={resource.title} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", resource.color)}>
                            <Icon className={cn("h-5 w-5", resource.iconColor)} />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{resource.title}</h3>
                            {resource.subtitle && (
                              <p className="text-xs text-muted-foreground">{resource.subtitle}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Customer Orders Section */
            <>
              {consolidatedTrip ? (
                /* Default View - Single Customer Orders Card */
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className='flex gap-6'>
                    <div className='w-3/4 flex-1 border border-border rounded-lg p-6'>
                      {/* Trip Planning Customer Order Hub */}
                      {/* <TripCOHub onCustomerOrderClick={handleCustomerOrderSelect}/> */}
                      <TripCOHubMultiple onCustomerOrderClick={handleMultipleCustomerOrders}/>
                      </div>
                    {/* Resources Cards - Right */}
                    <div className="w-1/4 space-y-3">
                     
                      {/* Resources - Right Panel */}
                      {/* <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                              <span className="p-3 rounded-xl bg-[#EBE9FE] mr-3">
                                <Truck className="h-5 w-5" />
                              </span>
                              <h2 className="text-lg font-semibold">Resources</h2>
                      </div>
                    </div>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Supplier</label>
                            <DynamicLazySelect
                              fetchOptions={fetchSupplier}
                              value={supplier}
                              onChange={(value) => setSupplier(value as string)}
                              placeholder=""
                        />
                      </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Schedule</label>
                            <DynamicLazySelect
                              fetchOptions={fetchSchedule}
                              value={schedule}
                              onChange={(value) => setSchedule(value as string)}
                              placeholder=""
                            />
                          </div>

                          <Button variant="outline" className="w-full text-emerald-600 border-emerald-300 hover:bg-emerald-50">
                            <Plus className="h-4 w-4 mr-2" />
                            More Resources
                      </Button>

                          <div className="border-t border-border pt-4 mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total Orders:</span>
                              <span className="font-semibold">12</span>
                    </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Assigned:</span>
                              <span className="font-semibold text-emerald-600">5</span>
                  </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Unassigned:</span>
                              <span className="font-semibold text-orange-600">7</span>
                            </div>
                          </div>
                        </div>
                      </div> */}

                      <div className="bg-card overflow-hidden">
                        <div className=''>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Supplier</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchSupplier}
                                value={supplier}
                                onChange={(value) => setSupplier(value as string)}
                                placeholder=""
                              />
                            </div>
                          </div>

                          <div className='mt-3'>
                            <div className="text-xs text-muted-foreground mb-1">Schedule</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchSchedule}
                                value={schedule}
                                onChange={(value) => setSchedule(value as string)}
                                placeholder=""
                              />
                            </div>
                          </div>
                        </div>
                        {[
                          { title: 'Resources', subtitle: 'Selected Resources', count: '', icon: Users, color: 'bg-pink-100', iconColor: 'text-pink-600' },
                          { title: 'Supplier', icon: Truck, color: 'bg-cyan-100', count: '', iconColor: 'text-cyan-600' },
                          { title: 'Schedule', icon: CalendarIcon2, color: 'bg-lime-100', count: '', iconColor: 'text-lime-600' },
                          { title: 'Equipment', icon: Box, color: 'bg-red-100', count: '', iconColor: 'text-red-600' },
                          { title: 'Handler', icon: UserCog, color: 'bg-orange-100', count: '', iconColor: 'text-orange-600' },
                          { title: 'Vehicle', icon: Car, color: 'bg-amber-100', count: '', iconColor: 'text-amber-600' },
                          { title: 'Driver', icon: UserCircle, color: 'bg-indigo-100', count: '', iconColor: 'text-indigo-600' },
                        ].map((resource) => {
                          const Icon = resource.icon;
                          return (
                            <Card key={resource.title} className="p-4 hover:shadow-md mb-3 transition-shadow cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", resource.color)}>
                                    <Icon className={cn("h-5 w-5", resource.iconColor)} />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-sm">{resource.title} 
                                      <span className="inline-flex items-center justify-center rounded-full text-xs badge-blue ml-3 font-medium">{resource.count}</span>
                                    </h3>
                                    {resource.subtitle && (
                                      <p className="text-xs text-muted-foreground">{resource.subtitle}</p>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    if (resource.title === 'Equipment') {
                                      handleOpenResourceDrawer('Equipment');
                                    } else if (resource.title === 'Supplier') {
                                      handleOpenResourceDrawer('Supplier');
                                    } else if (resource.title === 'Driver') {
                                      handleOpenResourceDrawer('Driver');
                                    } else if (resource.title === 'Handler') {
                                      handleOpenResourceDrawer('Handler');
                                    } else if (resource.title === 'Vehicle') {
                                      handleOpenResourceDrawer('Vehicle');
                                    }
                                  }}
                                  className={resource.title === 'Resources' ? 'hidden' : ''}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* Trip Creation Controls */}
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                    <div className="flex items-center gap-4">
                      <Switch 
                        id="consolidated-trip"
                        checked={consolidatedTrip}
                        onCheckedChange={setConsolidatedTrip}
                        className="data-[state=checked]:bg-orange-500"
                      />
                      <Label htmlFor="consolidated-trip" className="cursor-pointer text-foreground font-medium">
                        Create Single trip with Consolidated COs
                      </Label>
                      {/* <span className="text-sm text-muted-foreground">
                        {consolidatedTrip ? 'Switch off' : 'Switch on'}
                      </span> */}
                    </div>
                    <button onClick={createBulkTripData} className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">
                      Create Trip
                    </button>
                  </div>
                </div>
              ) : (
                /* Split View - Customer Orders & Resources */
                <div className="flex gap-4">
                  {/* Customer Orders - Left Panel */}
                  <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
                    {/* Header */}
                    {/* <div className="bg-blue-500 text-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Package className="h-5 w-5" />
                          </div>
                          <h2 className="text-lg font-semibold">Customer Orders</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-white/90">12 orders ready for planning</p>
                    </div> */}

                    {/* Content */}
                    <div className="p-4">
                      {/* Search */}
                      {/* <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search orders..."
                          value={customerOrderSearch}
                          onChange={(e) => setCustomerOrderSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div> */}

                      <div className='flex gap-6'>
                        {addResourcesFlag ? (
                          <>
                            <div className='w-3/4 flex-1 bg-card border border-border rounded-lg p-6'>
                              {/* <div className='flex items-center justify-between px-4 py-3 bg-blue-50 mb-2'>
                                <div className='text-sm text-blue-700'>
                                  <span className='ml-2 text-xs'>Selected Customer Order: (TP/2021/00024908)</span>
                                </div>
                              </div> */}
                              {/* Trip Planning Customer Order Hub */}
                              <TripCOHub onCustomerOrderClick={handleCustomerOrderSelect}/>
                            </div>
                            {/* Resources Cards - Right */}
                            <div className="w-1/4 space-y-3">
                              <div className=''>
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Supplier</div>
                                  <div className="text-sm font-medium">
                                    <DynamicLazySelect
                                      fetchOptions={fetchSupplier}
                                      value={supplier}
                                      onChange={(value) => setSupplier(value as string)}
                                      placeholder=""
                                    />
                                  </div>
                                </div>

                                <div className='mt-3'>
                                  <div className="text-xs text-muted-foreground mb-1">Schedule</div>
                                  <div className="text-sm font-medium">
                                    <DynamicLazySelect
                                      fetchOptions={fetchSchedule}
                                      value={schedule}
                                      onChange={(value) => setSchedule(value as string)}
                                      placeholder=""
                                    />
                                  </div>
                                </div>
                              </div>
                              {[
                                { title: 'Resources', subtitle: 'Selected Resources', count: '', icon: Users, color: 'bg-pink-100', iconColor: 'text-pink-600' },
                                { title: 'Supplier', icon: Truck, color: 'bg-cyan-100', count: '', iconColor: 'text-cyan-600' },
                                { title: 'Schedule', icon: CalendarIcon2, color: 'bg-lime-100', count: '', iconColor: 'text-lime-600' },
                                { title: 'Equipment', icon: Box, color: 'bg-red-100', count: '', iconColor: 'text-red-600' },
                                { title: 'Handler', icon: UserCog, color: 'bg-orange-100', count: '', iconColor: 'text-orange-600' },
                                { title: 'Vehicle', icon: Car, color: 'bg-amber-100', count: '', iconColor: 'text-amber-600' },
                                { title: 'Driver', icon: UserCircle, color: 'bg-indigo-100', count: '', iconColor: 'text-indigo-600' },
                              ].map((resource) => {
                                const Icon = resource.icon;
                                return (
                                  <Card key={resource.title} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", resource.color)}>
                                          <Icon className={cn("h-5 w-5", resource.iconColor)} />
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-sm">{resource.title} 
                                            <span className="inline-flex items-center justify-center rounded-full text-xs badge-blue ml-3 font-medium">{resource.count}</span>
                                          </h3>
                                          {resource.subtitle && (
                                            <p className="text-xs text-muted-foreground">{resource.subtitle}</p>
                                          )}
                                        </div>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                          if (resource.title === 'Equipment') {
                                            handleOpenResourceDrawer('Equipment');
                                          } else if (resource.title === 'Supplier') {
                                            handleOpenResourceDrawer('Supplier');
                                          } else if (resource.title === 'Driver') {
                                            handleOpenResourceDrawer('Driver');
                                          } else if (resource.title === 'Handler') {
                                            handleOpenResourceDrawer('Handler');
                                          } else if (resource.title === 'Vehicle') {
                                            handleOpenResourceDrawer('Vehicle');
                                          }
                                        }}
                                        className={resource.title === 'Resources' ? 'hidden' : ''}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className='flex-1 bg-card'>
                              {/* <div className='flex items-center justify-between px-4 py-3 bg-blue-50 mb-2'>
                                <div className='text-sm text-blue-700'>
                                  <span className='ml-2 text-xs'>Selected Customer Order: (TP/2021/00024908)</span>
                                </div>
                              </div> */}
                              {/* Trip Planning Customer Order Hub */}
                              <TripCOHub onCustomerOrderClick={handleCustomerOrderSelect}/>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Toggle */}
                      <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                        <div className="flex items-center gap-4">
                        <Switch 
                          id="consolidated-trip-inline"
                          checked={consolidatedTrip}
                          onCheckedChange={setConsolidatedTrip}
                          className="data-[state=checked]:bg-orange-500"
                        />
                        <Label htmlFor="consolidated-trip-inline" className="cursor-pointer text-sm font-medium">
                          Create single trip with consolidated orders
                        </Label>
                        </div>
                        <div className='flex items-center gap-4'>
                          {/* Debug Info */}
                          {/* <div className="text-xs text-gray-600">
                            Customer Orders: {selectedArrCOData?.length || 0}
                          </div> */}
                          <button onClick={createSingleTripData} className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">
                            Create Trip
                          </button>
                        </div>
                      </div>

                      {/* Grid */}
                      {/* <SmartGrid
                        columns={customerOrdersColumns}
                        data={customerOrdersData}
                        onUpdate={async (row) => {
                          console.log('Data changed:', row);
                        }}
                        selectedRows={selectedOrders}
                        onSelectionChange={(rows) => {
                          setSelectedOrders(rows);
                          console.log('Selection changed:', rows);
                        }}
                        paginationMode="pagination"
                      /> */}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      {/* Resource Selection Drawer */}
      <ResourceSelectionDrawer
        isOpen={isResourceDrawerOpen}
        onClose={handleCloseResourceDrawer}
        onAddResource={handleAddResource}
        resourceType={currentResourceType}
        resourceData={resourceData}
        isLoading={isLoadingResource}
      />

      {/* Loading Overlay */}
      {isLoadingResource && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
          <div className="text-lg font-semibold text-blue-700">Loading {currentResourceType}...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching {currentResourceType.toLowerCase()} data from server, please wait.</div>
        </div>
      )}
    </AppLayout>
  );
};

export default TripPlanning;
