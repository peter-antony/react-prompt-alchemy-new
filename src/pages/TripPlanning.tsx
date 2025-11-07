import { useState, useEffect, useRef } from 'react';
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
import { OthersSelectionDrawer } from '@/components/OthersSelectionDrawer';
import {
  Search, Package, Settings, ExternalLink, Home, ChevronRight, CalendarIcon, MapPin,
  Building2, Users, Truck, Calendar as CalendarIcon2, Box,
  UserCog, Car, UserCircle, Plus, NotebookPen, Pencil,
  HelpCircle, InfoIcon, EllipsisVertical,
  CreditCard, Zap, FileUp, Route, TramFront,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tripPlanningService } from '@/api/services/tripPlanningService';
import { tripService } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { TripCOHubMultiple } from '@/components/TripPlanning/TripCOHubMultiple';
import TripPlanActionModal from "@/components/ManageTrip/TripPlanActionModal";
import { useTransportRouteStore as useTripLevelRouteStore } from '@/stores/tripLevelRouteStore';
import { SideDrawer } from '@/components/SideDrawer';
import { TripLevelUpdateDrawer } from '@/components/drawer/TripLevelUpdateDrawer';
import { TrainParametersDrawerScreen } from '@/components/drawer/TrainParametersDrawerScreen';
import { useDrawerStore } from '@/stores/drawerStore';
import { VASTripDrawerScreen } from '@/components/drawer/VASTripDrawerScreen';
import { BadgesList } from '@/components/ui/badges-list';
import { LegEventsDrawer } from '@/components/drawer/LegEventsDrawer';
import { manageTripStore } from '@/stores/mangeTripStore';

const TripPlanning = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract URL parameters
  const urlTripID = searchParams.get('tripId');
  const manageFlag = searchParams.get('manage');
  const { routes,
    selectedOrder,
    selectedRoute,
    selectedTrip,
    isDrawerOpen,
    isRouteDrawerOpen,
    isTripDrawerOpen,
    highlightedIndexes,
    fetchRoutes,
    handleCustomerOrderClick,
    openRouteDrawer,
    openTripDrawer,
    // closeDrawer,
    closeRouteDrawer,
    closeTripDrawer,
    highlightRowIndexes,
    addLegPanel,
    removeLegPanel,
    updateLegData,
    addExecutionLeg,
    removeExecutionLeg,
    updateExecutionLeg,
    saveRouteDetails,
    saveTripDetails,
    fetchDepartures,
    fetchArrivals } = useTripLevelRouteStore();
  const { isOpen, drawerType, closeDrawer, openDrawer } = useDrawerStore();
  const { tripData, setTrip } = manageTripStore();
  const [tripNo, setTripNo] = useState('');
  const [tripStatus, setTripStatus] = useState('');
  const [createTripBtn, setCreateTripBtn] = useState(true);
  const [showConfirmReleaseBtn, setShowConfirmReleaseBtn] = useState(false);
  const [location, setLocation] = useState('');
  const [cluster, setCluster] = useState('');
  const [tripType, setTripType] = useState('Normal');

  // Set default location based on OUID
  useEffect(() => {
    console.log("TRIP STORE  :", tripData)
    console.log("Inside TripPlanning- selected trip : ", selectedTrip)
    const getUserContext = () => {
      try {
        const selectedContext = localStorage.getItem('selectedUserContext');

        if (selectedContext) {
          const parsedContext = JSON.parse(selectedContext);
          return {
            ouId: parsedContext.ouId || 4,
            roleName: parsedContext.roleName || "RAMCOROLE"
          };
        }
      } catch (error) {
        console.error('Error retrieving user context from localStorage:', error);
      }

      // Default values if nothing is stored
      return {
        ouId: 4,
        roleName: "RAMCOROLE"
      };
    };

    const userContext = getUserContext();
    const ouId = userContext.ouId;

    // Set default location based on OUID
    if (ouId === 4) {
      setLocation('FWDS_GMBH || Forwardis GMBH');
    } else if (ouId === 2) {
      setLocation('FWDS_SAS || Forwardis SAS');
    }
  }, []);
  const [planDate, setPlanDate] = useState<Date | undefined>();
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
  const [currentResourceType, setCurrentResourceType] = useState<'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule'>('Equipment');
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [newCustomerData, setNewCustomerData] = useState<any[]>([]);
  const [selectedArrCOData, setSelectedArrCOData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const [tripCOHubReloadKey, setTripCOHubReloadKey] = useState(0);
  const [tripCOMulipleHubReloadKey, setTripCOMulipleHubReloadKey] = useState(0);
  const [tripCustomerOrdersData, setTripCustomerOrdersData] = useState<any[]>([]);
  const [tripResourceDetailsData, setTripResourceDetailsData] = useState<any>({});
  const [listPopoverOpen, setListPopoverOpen] = useState(false);
  const [EquipmentCount, setEquipmentCount] = useState(0);
  const [EquipmentData, setEquipmentData] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const isWagonContainer = tripType === 'Wagon/Container Movement';
  const [othersDrawerOpen, setOthersDrawerOpen] = useState(false);
  const [otherInfo, setOtherInfo] = useState(false);
  const [oldTripData, setOldTripData] = useState('');

  const { toast } = useToast();

  // Extract and set tripNo from URL parameters
  useEffect(() => {
    console.log("TripPlan useeffect")
    if (urlTripID) {
      getTripDataByID(urlTripID)
      setTripNo(urlTripID);
      setAddResourcesFlag(true);
      // setConsolidatedTrip(true);
      console.log("🔗 URL TripID extracted:", urlTripID);
    }
    if (manageFlag) {
      console.log("🔗 URL Manage flag extracted:", manageFlag);
    }
  }, [urlTripID, manageFlag]);
  const getTripDataByID = async (tripID: string) => {
    console.log("Inside getTripDataByID")
    const response: any = await tripPlanningService.getTripDataByID(tripID);
    console.log("response ===", JSON.parse(response?.data?.ResponseData || "{}"));
    const data = JSON.parse(response?.data?.ResponseData || "{}");
    const tripNoFromAPI = data?.Header?.TripNo;
    setOldTripData(data)
    console.log("data ===", data);
    let otherInfoData: any = {};

    if (data.Header?.SupplierRefNo != undefined && data.Header?.SupplierRefNo != null) {
      otherInfoData.SupplierRefNo = data.Header?.SupplierRefNo;
    }
    if (data.Header?.LoadType != undefined && data.Header?.LoadType != null) {
      otherInfoData.LoadType = data.Header?.LoadType;
    }
    if (data.Header?.IsRoundTrip == "1") {
      otherInfoData.IsRoundTrip = data.Header?.IsRoundTrip;
    }
    if (data.Header?.IsOneWay == "1") {
      otherInfoData.IsOneWay = data.Header?.IsOneWay;
    }
    if (data.Header?.PlanStartDate != undefined && data.Header?.PlanStartDate != null) {
      otherInfoData.PlanStartDate = data.Header?.PlanStartDate;
    }
    if (data.Header?.PlanStartTime != undefined && data.Header?.PlanStartTime != null) {
      otherInfoData.PlanStartTime = data.Header?.PlanStartTime;
    }
    if (data.Header?.PlanEndDate != undefined && data.Header?.PlanEndDate != null) {
      otherInfoData.PlanEndDate = data.Header?.PlanEndDate;
    }
    if (data.Header?.PlanEndTime != undefined && data.Header?.PlanEndTime != null) {
      otherInfoData.PlanEndTime = data.Header?.PlanEndTime;
    }
    if (data.Header?.Remarks != undefined && data.Header?.Remarks != null) {
      otherInfoData.Remarks = data.Header?.Remarks;
    }
    if (data.Header?.PassNoFromSchedule != undefined && data.Header?.PassNoFromSchedule != null) {
      otherInfoData.PassNoFromSchedule = data.Header?.PassNoFromSchedule;
    }
    if (data.Header?.QuickCode1 != undefined && data.Header?.QuickCode1 != null) {
      otherInfoData.QuickCode1 = data.Header?.QuickCode1;
    }
    if (data.Header?.QuickCodeValue1 != undefined && data.Header?.QuickCodeValue1 != null) {
      otherInfoData.QuickCodeValue1 = data.Header?.QuickCodeValue1;
    }
    otherInfoData
    setOtherInfo(otherInfoData);
    console.log("otherInfoData == ", otherInfoData)


    return { tripFromAPI: data };
    // return tripNoFromAPI;
  }
  useEffect(() => {
    // Do whatever you need with the UPDATED value here!
    console.log("Resource details data updated:", tripResourceDetailsData);
    // API calls, calculations, etc.
  }, [tripResourceDetailsData]);
  // Debug useEffect to track selectedArrCOData changes
  useEffect(() => {
    console.log("🔍 selectedArrCOData changed:", selectedArrCOData);
    console.log("🔍 selectedArrCOData length ^^^^:", selectedArrCOData);
    //for updating Equipment Count after add equipment
    // selectedArrCOData[0]?.ResourceDetails?.forEach((item) => {
    //   console.log("ItEM = ",item)
    //   if (item.ResourceType === "Equipment") {
    //     setEquipmentCount((prev) => prev + 1);
    //   }
    // });
  }, [selectedArrCOData]);

  // Ref to track the last fetched tripID to prevent duplicate API calls
  const lastFetchedTripIDRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  // Fetch trip data when urlTripID is available (only once per tripID)
  useEffect(() => {
    // Only fetch if urlTripID exists, is not empty, hasn't been fetched before, and not currently fetching
    if (!urlTripID || urlTripID.trim() === '') {
      return; // Don't call API if tripID is not available
    }

    // Check if this tripID has already been fetched or is currently being fetched
    if (lastFetchedTripIDRef.current === urlTripID || isFetchingRef.current) {
      console.log('⏭️ Skipping duplicate API call for TripID:', urlTripID);
      return;
    }

    const fetchTripData = async () => {
      // Mark as fetching to prevent concurrent calls
      isFetchingRef.current = true;
      lastFetchedTripIDRef.current = urlTripID;
      
      console.log('🔄 Fetching trip data for TripID:', urlTripID);
      
      try {
        const response: any = await tripService.getTripById({ id: urlTripID });
        
        // Parse the ResponseData
        const parsedResponse = response?.data?.ResponseData 
          ? JSON.parse(response.data.ResponseData)
          : response?.data || {};
        
        console.log('📋 Parsed trip response:', parsedResponse);
        
        // Extract CustomerOrders from the trip response
        const customerOrders = parsedResponse.CustomerOrders || [];

        const resourceDetails = parsedResponse.ResourceDetails || [];
        
        if (customerOrders && customerOrders.length > 0) {
          console.log('✅ CustomerOrders found:', customerOrders.length);
          // Store CustomerOrders data for TripCOHub
          setTripCustomerOrdersData(customerOrders);
          
          // Also update trip status if available
          if (parsedResponse.Header?.TripStatus) {
            setTripStatus(parsedResponse.Header.TripStatus);
          }
        } else {
          console.log('⚠️ No CustomerOrders found in trip response');
          setTripCustomerOrdersData([]);
        }

        if (resourceDetails) {
          console.log('✅ ResourceDetails found:', resourceDetails);
          console.log('✅ resourceDetails.Equipments found:', resourceDetails.Equipments);
          console.log('✅ resourceDetails.Supplier found:', resourceDetails.Supplier?.[0]?.VendorID);
          // Store ResourceDetails data for TripCOHub
          setTripResourceDetailsData(() => resourceDetails);
          setEquipmentData(resourceDetails.Equipments)
          setEquipmentCount(resourceDetails.Equipments?.length)
          if (resourceDetails.Supplier?.[0]) {
            setSupplier(resourceDetails.Supplier[0]?.VendorID +" || "+ resourceDetails.Supplier[0]?.VendorName);
          }
          // setSelectedSupplier(resourceDetails.Supplier[0]?.VendorID +" || "+ resourceDetails.Supplier[0]?.VendorName)     
          // setSelectedSchedule(resourceDetails.Schedule[0]?.VendorID +" || "+ resourceDetails.Supplier[0]?.VendorName)     
          console.log("tripResourceDetailsData ====", tripResourceDetailsData);
        } else {
          console.log('⚠️ No ResourceDetails found in trip response');
          setTripResourceDetailsData({});
        }
      } catch (error) {
        console.error('❌ Failed to fetch trip data:', error);
        setTripCustomerOrdersData([]);
        toast({
          title: "Error",
          description: "Failed to fetch trip data. Please try again.",
          variant: "destructive",
        });
        // Reset the ref on error so it can retry if needed
        lastFetchedTripIDRef.current = null;
      } finally {
        // Reset fetching flag
        isFetchingRef.current = false;
      }
    };

    fetchTripData();
  }, [urlTripID]); // Removed 'toast' from dependencies as it's stable

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
    {
      key: 'status', label: 'Status', type: 'Badge', width: 120, editable: false, statusMap: {
        'Confirmed': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In Transit': 'bg-blue-100 text-blue-800',
      }
    },
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

  // Handle Others selection

  // const handleOthersClick = () => {
  //   getTripDataByID(tripNo)
  //   console.log("Opening OtherDetails Drawer,",otherInfo);

  //   setOthersDrawerOpen(true);
  // };
  const handleOthersClick = async () => {
    try {
      const tripNoFromAPI = await getTripDataByID(tripNo);
      console.log("Trip No returned from API:", tripNoFromAPI);
      setOthersDrawerOpen(true);
    } catch (err) {
      console.error("Failed to load other info", err);
      // toast or show error
    } finally {
      // setIsLoading(false);
    }
  };
  const updateOtherInfo = async (data: any) => {
    console.log("Inside Update Other Details in TripPlanning page - ", data)
    console.log("Old TripDAta TripPlanning page - ", oldTripData)
    const updated = updateTripHeaderImmutable(oldTripData, data);
    console.log("AFTER UPDATE :",updated)
    tripService.saveLegAndEventsTripLevel(updated)
       toast({
        title: "Saved Successfully",
        description: `Other Details saved successfully`,
        
      });
  }
  // type TripData = any; // tighten this type if you have interfaces

  const updateTripHeaderImmutable = (oldTripData: any, data: any)=> {
    if (!oldTripData || !oldTripData.Header) {
      console.warn("Invalid oldTripData format — returning original");
      return oldTripData;
    }

    // Safe helpers
    const safeString = (v: any) => (v === null || v === undefined ? undefined : String(v));
    const firstBeforeDoublePipe = (v: any) => {
      if (v === null || v === undefined) return undefined;
      const s = String(v);
      return s.includes("||") ? s.split("||")[0].trim() : s;
    };

    // Build update object: only include fields when data provides a value (not undefined)
    const headerUpdates: Record<string, any> = {};

    // QC mapping
    if (data?.QCUserDefined) {
      if (data.QCUserDefined.dropdown !== undefined) {
        headerUpdates.QuickCode1 = safeString(data.QCUserDefined.dropdown);
      }
      if (data.QCUserDefined.input !== undefined) {
        headerUpdates.QuickCodeValue1 = safeString(data.QCUserDefined.input);
      }
    }

    // LoadType - only first part before ||
    if (data?.loadType !== undefined) {
      const lt = firstBeforeDoublePipe(data.loadType);
      headerUpdates.LoadType = lt === undefined ? null : lt;
    }

    // SupplierRefNo
    if (data?.supplierRefNo !== undefined) {
      headerUpdates.SupplierRefNo = data.supplierRefNo === null ? null : String(data.supplierRefNo);
    }

    // Modeflag override -> always set to "Update" if any relevant field is present
    // (you can change the condition; here we set Update only if any update exists)
    if (Object.keys(headerUpdates).length > 0) {
      headerUpdates.ModeFlag = "Update";
    }

    // Optional: update other top-level header fields if provided in data
    if (data?.tripNo !== undefined) headerUpdates.TripNo = safeString(data.tripNo);
    if (data?.tripStatus !== undefined) headerUpdates.TripStatus = safeString(data.tripStatus);
    if (data?.tripStartDate !== undefined) headerUpdates.PlanStartDate = safeString(data.tripStartDate);
    if (data?.tripStartTime !== undefined) headerUpdates.PlanStartTime = safeString(data.tripStartTime);
    if (data?.tripEndDate !== undefined) headerUpdates.PlanEndDate = safeString(data.tripEndDate);
    if (data?.tripEndTime !== undefined) headerUpdates.PlanEndTime = safeString(data.tripEndTime);
    if (data?.remark !== undefined) headerUpdates.Remarks = safeString(data.remark);
    if (data?.passNo !== undefined) headerUpdates.PassNoFromSchedule = safeString(data.passNo);
    
    if(data?.planType=="roundTrip" ){
      headerUpdates.IsRoundTrip = safeString('1');
      headerUpdates.IsOneWay = safeString('0');
    }
    if(data?.planType=="oneWay" ){
      headerUpdates.IsOneWay = safeString('1');
      headerUpdates.IsRoundTrip = safeString('0');
    }
    // Return a new object with only Header shallow-updated (preserves all other fields)
    const newTripData = {
      ...oldTripData,
      Header: {
        ...oldTripData.Header,
        ...headerUpdates,
      },
    };

    return newTripData;
  }

  // Handle resource drawer open/close
  const handleOpenResourceDrawer = async (resourceType: 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule') => {
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
    setIsResourceDrawerOpen(false);
  };

  const changeSupplier = (value: string) => {
    setSupplier(value);
    console.log("Supplier:", value);
    const splitAtPipe = (value: string | null | undefined) => {
      if (typeof value === "string" && value.includes("||")) {
        const [first, ...rest] = value.split("||");
        return first.trim(); // Return only the value part (before pipe)
      }
      return value;
    };
    const supplierID = splitAtPipe(value);
    handleAddResource([{
      "ResourceID": supplierID,
      "ResourceType": "Agent",
      "Service": "",
      "ServiceDescription": "",
      "SubService": "",
      "SubServiceDescription": "",
    }]);
  };

  const changeSchedule = (value: string) => {
    setSchedule(value);
    console.log("Schedule:", value);
    const splitAtPipe = (value: string | null | undefined) => {
      if (typeof value === "string" && value.includes("||")) {
        const [first, ...rest] = value.split("||");
        return first.trim(); // Return only the value part (before pipe)
      }
      return value;
    };
    const scheduleID = splitAtPipe(value);
    handleAddResource([{
      "ResourceID": scheduleID,
      "ResourceType": "Schedule",
      "Service": "",
      "ServiceDescription": "",
      "SubService": "",
      "SubServiceDescription": "",
    }]);
  };
  //400--
  const handleAddResource = (resources: any[]) => {
    setSelectedResources(resources);
    console.log('Selected resources:', resources);
    console.log('Selected customerOrderList:', customerOrderList);

    // Transform the new resources into the required ResourceDetails format
    const transformedResourceDetails = resources.map(resource => ({
      "ResourceID": resource.id || resource.ResourceID || resource.EquipmentID || resource.VendorID || resource.DriverCode || resource.HandlerID || resource.VehicleID || resource.SupplierID,
      "ResourceType": resource.resourceType || resource.ResourceType ||
        (resource.EquipmentID ? 'Equipment' :
          resource.VendorID ? 'Agent' :
            resource.DriverCode ? 'Driver' :
              resource.HandlerID ? 'Handler' :
                resource.VehicleID ? 'Vehicle' :
                  resource.SupplierID ? 'Schedule' : 'Unknown'),
      "Service": resource.Service || "",
      "ServiceDescription": resource.ServiceDescription || "",
      "SubService": resource.SubService || "",
      "SubServiceDescription": resource.SubServiceDescription || "",
      "EffectiveFromDate": "",
      "EffectiveToDate": "",
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

    // Get the current LegBehaviour from customerOrderList
    const currentLegBehaviour = (customerOrderList as any)?.LegBehaviour || '';
    console.log("Current LegBehaviour:", currentLegBehaviour);

    // Check if this customer order with same LegBehaviour already exists in the array
    const existingIndex = existingCustomerOrderArray.findIndex(item =>
      item.CustomerOrderID === ((customerOrderList as any)?.CustomerOrderID || '') &&
      item.LegBehaviour === currentLegBehaviour
    );

    console.log("Existing index for same CustomerOrderID + LegBehaviour:", existingIndex);

    let updatedCustomerOrderArray;
    if (existingIndex !== -1) {
      // Update existing customer order by merging resources
      updatedCustomerOrderArray = [...existingCustomerOrderArray];
      const existingCustomerOrder = updatedCustomerOrderArray[existingIndex];

      // Merge existing ResourceDetails with new ones
      const existingResourceDetails = existingCustomerOrder.ResourceDetails || [];
      console.log("transformedResourceDetails ===", transformedResourceDetails);
      console.log("existingResourceDetails ===", existingResourceDetails);

      // Check if any new resources are of type "Agent" or "Schedule"
      const hasNewAgent = transformedResourceDetails.some(resource => resource.ResourceType === "Agent");
      const hasNewSchedule = transformedResourceDetails.some(resource => resource.ResourceType === "Schedule");

      let mergedResourceDetails;
      if (hasNewAgent || hasNewSchedule) {
        // For Agent and Schedule, remove existing resources with same CustomerOrderID and LegBehaviour
        const filteredExistingResources = existingResourceDetails.filter(resource => {
          // Keep resources that are not Agent or Schedule
          if (resource.ResourceType !== "Agent" && resource.ResourceType !== "Schedule") {
            return true;
          }
          // For Agent and Schedule, check if they have different LegBehaviour
          // If LegBehaviour is different, keep the existing resource
          return resource.LegBehaviour !== currentLegBehaviour;
        });

        // Add LegBehaviour to the new resources
        const resourcesWithLegBehaviour = transformedResourceDetails.map(resource => ({
          ...resource,
          LegBehaviour: currentLegBehaviour
        }));

        mergedResourceDetails = [...filteredExistingResources, ...resourcesWithLegBehaviour];
        console.log("Agent/Schedule detected - filtered by LegBehaviour, mergedResourceDetails ===", mergedResourceDetails);
      } else {
        // Normal merge for other resource types (Equipment, Driver, Handler, Vehicle)
        // Check for duplicates before adding - don't add if ResourceID and ResourceType already exist
        const resourcesWithLegBehaviour = transformedResourceDetails
          .map(resource => ({
            ...resource,
            LegBehaviour: currentLegBehaviour
          }))
          .filter(newResource => {
            // Check if a resource with the same ResourceID and ResourceType already exists
            const isDuplicate = existingResourceDetails.some((existing: any) =>
              existing.ResourceID === newResource.ResourceID &&
              existing.ResourceType === newResource.ResourceType
            );
            if (isDuplicate) {
              console.log(`Skipping duplicate resource: ${newResource.ResourceType} - ${newResource.ResourceID}`);
            }
            return !isDuplicate; // Only include non-duplicates
          });

        mergedResourceDetails = [...existingResourceDetails, ...resourcesWithLegBehaviour];
        console.log("Other resource types - normal merge (duplicates filtered), mergedResourceDetails ===", mergedResourceDetails);
      }
      // Update the existing customer order with merged resources
      updatedCustomerOrderArray[existingIndex] = {
        ...existingCustomerOrder,
        "ResourceDetails": mergedResourceDetails,
        "ModeFlag": "Insert"
      };
    } else {
      // Add new customer order to the array (either completely new CustomerOrderID or same CustomerOrderID with different LegBehaviour)
      // Filter out duplicates within the new resources before adding
      const seenResources = new Set<string>();
      const uniqueResourceDetails = updatedCustomerList.ResourceDetails
        .map(resource => ({
          ...resource,
          LegBehaviour: currentLegBehaviour
        }))
        .filter(resource => {
          const uniqueKey = `${resource.ResourceType}_${resource.ResourceID}`;
          if (seenResources.has(uniqueKey)) {
            console.log(`Skipping duplicate resource in new entry: ${resource.ResourceType} - ${resource.ResourceID}`);
            return false;
          }
          seenResources.add(uniqueKey);
          return true;
        });

      const updatedCustomerListWithLegBehaviour = {
        ...updatedCustomerList,
        "LegBehaviour": currentLegBehaviour, // Add LegBehaviour to the customer order itself
        "ResourceDetails": uniqueResourceDetails
      };
      updatedCustomerOrderArray = [...existingCustomerOrderArray, updatedCustomerListWithLegBehaviour];
      console.log("Adding new customer order entry (different LegBehaviour or new CustomerOrderID)");
    }
    console.log("transformedResourceDetails ", transformedResourceDetails);

    // Group transformedResourceDetails by ResourceType and update tripResourceDetailsData
    const groupedResources = {
      Equipments: [] as any[],
      Handlers: [] as any[],
      Vehicle: [] as any[],
      Drivers: [] as any[]
    };

    // Collect all resources from selectedArrCOData (including merged ones)
    // Use a Set to track unique ResourceID + ResourceType combinations
    const uniqueResourceKeys = new Set<string>();
    const allResources: any[] = [];

    updatedCustomerOrderArray.forEach(co => {
      (co.ResourceDetails || []).forEach((resource: any) => {
        // Create a unique key combining ResourceID and ResourceType
        const uniqueKey = `${resource.ResourceType}_${resource.ResourceID}`;

        // Only add if this combination doesn't already exist
        if (!uniqueResourceKeys.has(uniqueKey)) {
          uniqueResourceKeys.add(uniqueKey);
          allResources.push({
            ResourceID: resource.ResourceID,
            ResourceType: resource.ResourceType
          });
        }
      });
    });

    // Group by ResourceType (now guaranteed to be unique)
    allResources.forEach((resource: any) => {
      if (resource.ResourceType === 'Equipment') {
        groupedResources.Equipments.push({ EquipmentID: resource.ResourceID });
      } else if (resource.ResourceType === 'Handler') {
        groupedResources.Handlers.push({ HandlerID: resource.ResourceID });
      } else if (resource.ResourceType === 'Vehicle') {
        groupedResources.Vehicle.push({ VehicleID: resource.ResourceID });
      } else if (resource.ResourceType === 'Driver') {
        groupedResources.Drivers.push({ DriverID: resource.ResourceID });
      }
    });

    // Update tripResourceDetailsData with grouped resources
    setTripResourceDetailsData((prev: any) => ({
      ...prev,
      Equipments: groupedResources.Equipments,
      Handlers: groupedResources.Handlers,
      Vehicle: groupedResources.Vehicle,
      Drivers: groupedResources.Drivers
    }));

    console.log("Grouped resources:", groupedResources);

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

  const handleCustomerOrderSelect = (customerOrderList: any, isSelected: boolean = true) => {
    console.log("✅ Received from child:", customerOrderList, "isSelected:", isSelected);
    setSupplier(null);
    setSchedule(null);
    if (customerOrderList) {
      setTripNo(customerOrderList?.TripID);
      setTripStatus(customerOrderList?.TripStatus);
    }
    if (!isSelected) {
      // Handle deselection - remove from selectedArrCOData using both id and legBehaviour
      console.log("customerOrderList ====", customerOrderList);
      if (customerOrderList && customerOrderList.CustomerOrderID && customerOrderList.LegBehaviour) {
        const { CustomerOrderID, LegBehaviour } = customerOrderList;
        setSelectedArrCOData(prev => {
          const updated = prev.filter(item => !(item.CustomerOrderID === CustomerOrderID && item.LegBehaviour === LegBehaviour));
          console.log("🗑️ Removed customer order from selectedArrCOData by id and legBehaviour:", CustomerOrderID, LegBehaviour);
          console.log("📊 Updated selectedArrCOData length:", updated.length);
          return updated;
        });
      } else {
        // Clear all selections (when customerOrderList is null or missing keys)
        setSelectedArrCOData([]);
        console.log("🗑️ Cleared all customer orders from selectedArrCOData");
      }

      // Clear the customer order list and hide resources flag
      console.log("setSelectedArrCOData remove ===", selectedArrCOData);
      setcustomerOrderList(null);
      setSupplier(null);
      setSchedule(null);
      // setAddResourcesFlag(false);
      return;
    }

    // Handle selection - add to selectedArrCOData
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

    if (location === undefined || location === null || location === "") {
      toast({
        title: "⚠️ Location is required",
        description: "Please select a location",
        variant: "destructive",
      });
      return;
    } else {
      const processedLocation = splitAtPipe(location);
      const processedCluster = splitAtPipe(cluster);

      const transformedResourceDetails = selectedResources.map(resource => ({
        "ResourceID": resource.id || resource.ResourceID || resource.EquipmentID || resource.VendorID || resource.DriverCode || resource.HandlerID || resource.VehicleID || resource.SupplierID,
        "ResourceType": resource.resourceType || resource.ResourceType ||
          (resource.EquipmentID ? 'Equipment' :
            resource.VendorID ? 'Agent' :
              resource.DriverCode ? 'Driver' :
                resource.HandlerID ? 'Handler' :
                  resource.VehicleID ? 'Vehicle' :
                    resource.SupplierID ? 'Schedule' : 'Unknown'),
        "Service": resource.Service || "",
        "ServiceDescription": resource.ServiceDescription || "",
        "SubService": resource.SubService || "",
        "SubServiceDescription": resource.SubServiceDescription || "",
        "EffectiveFromDate": "",
        "EffectiveToDate": "",
        "ModeFlag": "Insert"
      }));

      const tripData = {
        "Header": {
          "TripType": tripType,
          "PlanningProfileID": "General-GMBH",
          "Location": processedLocation, // Now processedLocation is already just the code
          "Cluster": processedCluster,
          "PlanDate": format(planDate ?? new Date(), "yyyy-MM-dd")
        },
        "CustomerOrders": selectedRows || [],
        "ResourceDetails": transformedResourceDetails || []
      }

      console.log("createBulkTripData", tripData);
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
          console.log("parsedResponse ====", parsedResponse?.Header?.TripNo);
          setTripNo(parsedResponse?.Header?.TripNo);
          setTripStatus(parsedResponse?.Header?.TripStatus);
          // Send newly created CustomerOrders to TripCOHubMultiple without forcing reload
          const customerOrders = parsedResponse.CustomerOrders || [];
          setTripCustomerOrdersData(customerOrders);
          console.log("➡️ Passing CustomerOrders to TripCOHubMultiple via state", customerOrders?.length);
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

    if (location === undefined || location === null || location === "") {
      toast({
        title: "⚠️ Location is required",
        description: "Please select a location",
        variant: "destructive",
      });
      return;
    } else {
      // Process location data using splitAtPipe to get the code value
      console.log("planDate ====", planDate);
      const processedLocation = splitAtPipe(location);
      const processedCluster = splitAtPipe(cluster);
      console.log("processedLocation ====", processedLocation);
      console.log("selectedArrCOData", selectedArrCOData);

      const tripData = {
        "Header": {
          "TripType": tripType,
          "PlanningProfileID": "General-GMBH",
          "Location": processedLocation, // Now processedLocation is already just the code
          "Cluster": processedCluster,
          "PlanDate": format(planDate ?? new Date(), "yyyy-MM-dd")
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

          // Extract CustomerOrders from response
          const customerOrders = parsedResponse.CustomerOrders || [];
          console.log("📋 CustomerOrders from API response:", customerOrders);

          // Store CustomerOrders data for TripCOHub
          setTripCustomerOrdersData(customerOrders);

          toast({
            title: "✅ Trip Created Successfully",
            description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
            variant: "default",
          });
          setCreateTripBtn(false);
          setTripNo(parsedResponse?.CustomerOrders?.[0]?.TripID);
          setTripStatus(parsedResponse?.CustomerOrders?.[0]?.TripStatus);
          setShowConfirmReleaseBtn(true);
          setcustomerOrderList(null);
          // Reload TripCOHub component
          setTripCOHubReloadKey(prev => prev + 1);
          console.log("🔄 TripCOHub component reloaded with CustomerOrders data");
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
  }

  useEffect(() => {
    console.log("showConfirmReleaseBtn ===", showConfirmReleaseBtn);
    console.log("customerOrderList ===", customerOrderList);
  }, [showConfirmReleaseBtn, customerOrderList]);

  const confirmTripPlanning = async () => {
    // console.log("confirmTripPlanning ===", selectedRowObjects);
    console.log("confirmTripPlanning ===", customerOrderList + tripNo);
    console.log("confirmTripPlanning ===", tripCustomerOrdersData);
    
    const messageType = "Manage Trip Plan - Confirm Trip";
    
    // Check if a single customer order is selected
    let tripIDsToProcess: string[] = [];
    
    if (customerOrderList && customerOrderList.TripID) {
      // Single selection: use only the selected TripID
      tripIDsToProcess = [customerOrderList.TripID];
      console.log("✅ Single customer order selected, using TripID:", customerOrderList.TripID);
    } else {
      // No selection: extract all unique TripIDs from tripCustomerOrdersData
      const allTripIDs = tripCustomerOrdersData
        .map((order: any) => order?.TripID)
        .filter((tripID: any) => tripID != null && tripID !== ''); // Filter out null/undefined/empty values
      
      // Get unique TripIDs using Set
      const uniqueTripIDs = Array.from(new Set(allTripIDs));
      
      // Get the count/length of unique TripIDs
      const uniqueTripIDsCount = uniqueTripIDs.length;
      
      console.log("All TripIDs from tripCustomerOrdersData:", allTripIDs);
      console.log("Unique TripIDs:", uniqueTripIDs);
      console.log("Count of unique TripIDs:", uniqueTripIDsCount);
      
      // If no unique TripIDs found, use fallback
      if (uniqueTripIDs.length === 0) {
        const fallbackTripID = urlTripID || tripNo;
        if (fallbackTripID) {
          tripIDsToProcess = [fallbackTripID];
        } else {
          toast({
            title: "⚠️ No Trip ID Found",
            description: "No Trip ID available to confirm.",
            variant: "destructive",
          });
          return;
        }
      } else {
        tripIDsToProcess = uniqueTripIDs;
      }
    }
    
    // Track success and failure counts
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Call confirm API for each TripID
    for (const tripID of tripIDsToProcess) {
      try {
        console.log(`🔄 Confirming Trip ID: ${tripID}`);
        
        let Header = {
          "TripNo": tripID,
          "Cancellation": null,
          "ShortClose": null,
          "Amendment": null
        };
        
        console.log("Payload for TripID:", tripID, Header);
        
        const response = await tripPlanningService.confirmTripPlanning({ Header, messageType });
        console.log("Response for TripID:", tripID, response);
        
        const resourceStatus = (response as any)?.data?.IsSuccess;
        
        if (resourceStatus) {
          console.log("response?.data?.ResponseData ===", JSON.parse((response as any)?.data?.ResponseData));
          const parsedResponse = JSON.parse((response as any)?.data?.ResponseData);
          const tripStatus = parsedResponse?.TripStatus;
          
          // Update trip status for this specific TripID in the grid data
          if (tripStatus && tripID) {
            setTripCustomerOrdersData(prev =>
              Array.isArray(prev)
                ? prev.map((row: any) =>
                    row?.TripID === tripID ? { ...row, TripStatus: tripStatus } : row
                  )
                : prev
            );
          }
          
          successCount++;
          console.log(`✅ Trip ${tripID} confirmed successfully`);
          toast({
            title: "✅ Trip Confirmed",
            description: parsedResponse?.Message,
            variant: "default",
          });
        } else {
          const errorMessage = (response as any)?.data?.Message || "Failed to confirm trip";
          errors.push(`${tripID}: ${errorMessage}`);
          failureCount++;
          console.log(`❌ Trip ${tripID} confirmation failed:`, errorMessage);
          toast({
            title: "⚠️ Trip Confirmation Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${tripID}: ${errorMessage}`);
        failureCount++;
        console.error(`❌ Error confirming trip ${tripID}:`, error);
        toast({
          title: "⚠️ Trip Confirmation Failed",
          description: error,
          variant: "destructive",
        });
      }
    }
    
    // Show summary toast based on results
    // if (successCount > 0 && failureCount === 0) {
    //   toast({
    //     title: "✅ All Trips Confirmed",
    //     description: `Successfully confirmed ${successCount} trip(s).`,
    //     variant: "default",
    //   });
    // } else if (successCount > 0 && failureCount > 0) {
    //   toast({
    //     title: "⚠️ Partial Success",
    //     description: `Confirmed ${successCount} trip(s), but ${failureCount} trip(s) failed. ${errors.join('; ')}`,
    //     variant: "destructive",
    //   });
    // } else {
    //   toast({
    //     title: "⚠️ Trip Confirmation Failed",
    //     description: `Failed to confirm all trips. ${errors.join('; ')}`,
    //     variant: "destructive",
    //   });
    // }
  }

  const releseTripPlanning = async () => {
    console.log("releaseTripPlanning ===", tripCustomerOrdersData);
    
    const messageType = "Manage Trip Plan - Release Trip";
    
    // Check if a single customer order is selected
    let tripIDsToProcess: string[] = [];
    
    if (customerOrderList && customerOrderList.TripID) {
      // Single selection: use only the selected TripID
      tripIDsToProcess = [customerOrderList.TripID];
      console.log("✅ Single customer order selected, using TripID:", customerOrderList.TripID);
    } else {
      // No selection: extract all unique TripIDs from tripCustomerOrdersData
      const allTripIDs = tripCustomerOrdersData
        .map((order: any) => order?.TripID)
        .filter((tripID: any) => tripID != null && tripID !== ''); // Filter out null/undefined/empty values
      
      // Get unique TripIDs using Set
      const uniqueTripIDs = Array.from(new Set(allTripIDs));
      
      // Get the count/length of unique TripIDs
      const uniqueTripIDsCount = uniqueTripIDs.length;
      
      console.log("All TripIDs from tripCustomerOrdersData:", allTripIDs);
      console.log("Unique TripIDs:", uniqueTripIDs);
      console.log("Count of unique TripIDs:", uniqueTripIDsCount);

      // If no unique TripIDs found, use fallback
      if (uniqueTripIDs.length === 0) {
        const fallbackTripID = urlTripID || tripNo;
        if (fallbackTripID) {
          tripIDsToProcess = [fallbackTripID];
        } else {
          toast({
            title: "⚠️ No Trip ID Found",
            description: "No Trip ID available to release.",
            variant: "destructive",
          });
          return;
        }
      } else {
        tripIDsToProcess = uniqueTripIDs;
      }
    }
    
    // Track success and failure counts
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Call release API for each TripID
    for (const tripID of tripIDsToProcess) {
      try {
        console.log(`🔄 release Trip ID: ${tripID}`);
        
        let Header = {
          "TripNo": tripID,
          "Cancellation": null,
          "ShortClose": null,
          "Amendment": null
        };
        
        console.log("Payload for TripID:", tripID, Header);
        
        const response = await tripPlanningService.confirmTripPlanning({ Header, messageType });
        console.log("Response for TripID:", tripID, response);
        
        const resourceStatus = (response as any)?.data?.IsSuccess;
        
        if (resourceStatus) {
          console.log("response?.data?.ResponseData ===", JSON.parse((response as any)?.data?.ResponseData));
          const parsedResponse = JSON.parse((response as any)?.data?.ResponseData);
          const tripStatus = parsedResponse?.TripStatus;
          
          // Update trip status for this specific TripID in the grid data
          if (tripStatus && tripID) {
            setTripCustomerOrdersData(prev =>
              Array.isArray(prev)
                ? prev.map((row: any) =>
                    row?.TripID === tripID ? { ...row, TripStatus: tripStatus } : row
                  )
                : prev
            );
          }
          
          successCount++;
          console.log(`✅ Trip ${tripID} released successfully`);
          toast({
            title: "✅ Trip Released",
            description: parsedResponse?.Message,
            variant: "default",
          });
        } else {
          const errorMessage = (response as any)?.data?.Message || "Failed to release trip";
          errors.push(`${tripID}: ${errorMessage}`);
          failureCount++;
          console.log(`❌ Trip ${tripID} release failed:`, errorMessage);
          toast({
            title: "⚠️ Trip Release Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${tripID}: ${errorMessage}`);
        failureCount++;
        console.error(`❌ Error release trip ${tripID}:`, error);
        toast({
          title: "⚠️ Trip Release Failed",
          description: error,
          variant: "destructive",
        });
      }
    }

    // Show summary toast based on results
    // if (successCount > 0 && failureCount === 0) {
    //   toast({
    //     title: "✅ All Trips Released",
    //     description: `Successfully released ${successCount} trip(s).`,
    //     variant: "default",
    //   });
    // } else if (successCount > 0 && failureCount > 0) {
    //   toast({
    //     title: "⚠️ Partial Success",
    //     description: `Released ${successCount} trip(s), but ${failureCount} trip(s) failed. ${errors.join('; ')}`,
    //     variant: "destructive",
    //   });
    // } else {
    //   toast({
    //     title: "⚠️ Trip Release Failed",
    //     description: `Failed to release all trips. ${errors.join('; ')}`,
    //     variant: "destructive",
    //   });
    // }

    // Use URL tripID if available, otherwise fallback to customerOrderList.TripID
    // const tripIDToUse = urlTripID || customerOrderList?.TripID || tripNo;

    // let Header = {
    //   "TripNo": tripIDToUse,
    //   "Cancellation": null,
    //   "ShortClose": null,
    //   "Amendment": null

    // }
    // console.log("Payload:", Header);
    // console.log("Using TripID:", tripIDToUse);

    // try {
    //   const response = await tripPlanningService.confirmTripPlanning({ Header, messageType });
    //   console.log("response ===", response);
    //   const resourceStatus = (response as any)?.data?.IsSuccess;
    //   if (resourceStatus) {
    //     console.log("response?.data?.ResponseData ===", JSON.parse((response as any)?.data?.ResponseData));
    //     const parsedResponse = JSON.parse((response as any)?.data?.ResponseData);
    //     const tripStatus = parsedResponse?.TripStatus;
    //     setTripStatus(tripStatus);
    //     // Optimistically update TripStatus in already loaded grid data (no full reload)
    //     if (tripStatus && tripIDToUse) {
    //       setTripCustomerOrdersData(prev =>
    //         Array.isArray(prev)
    //           ? prev.map((row: any) =>
    //             row?.TripID === tripIDToUse ? { ...row, TripStatus: tripStatus } : row
    //           )
    //           : prev
    //       );
    //     }
    //     toast({
    //       title: "✅ Trip Released",
    //       description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
    //       variant: "default",
    //     });
    //   } else {
    //     console.log("error as any ===", (response as any)?.data?.Message);
    //     toast({
    //       title: "⚠️ Trip Release Failed",
    //       description: (response as any)?.data?.Message || "Failed to save changes.",
    //       variant: "destructive",
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error confirming trip:", error);
    // }
  }

  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<'cancel' | 'amend'>('cancel');
  const [fields, setFields] = useState([]);
  const handleFieldChange = (name, value) => {
    console.log('Field changed:', name, value);
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };
  const openAmendPopup = () => {
    setFields([
      {
        type: "select",
        label: "Reason Code and Description",
        name: "ReasonCode",
        placeholder: "Enter Reason Code and Description",
        options: [],
        value: "",
        required: true,
        mappedName: 'ReasonCode'
      },
      {
        type: "text",
        label: "Remarks",
        name: "remarks",
        placeholder: "Enter Remarks",
        value: "",
        mappedName: 'Remarks'
      },
    ]);
    setCurrentActionType('amend');
    setAmendModalOpen(true);
  }
  const openCancelPopup = () => {
    setFields([
      {
        type: "date",
        label: "Requested Date and Time",
        name: "date",
        placeholder: "Select Requested Date and Time",
        value: "",
        required: true,
        mappedName: 'Canceldatetime'
      },
      {
        type: "select",
        label: "Reason Code and Description",
        name: "ReasonCode",
        placeholder: "Enter Reason Code and Description",
        options: [],
        value: "",
        required: true,
        mappedName: 'ReasonCode'
      },
      {
        type: "text",
        label: "Remarks",
        name: "remarks",
        placeholder: "Enter Remarks",
        value: "",
        mappedName: 'Remarks'
      },
    ]);
    setCurrentActionType('cancel');
    setCancelModalOpen(true);
  }

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

  const handleAmendTripPlanSubmit = async (formFields: any) => {
    console.log("Amend Trip Plan Submit:", formFields);
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for Amend API:', mappedObj);
    const messageType = "Manage Trip Plan - Amend Trip";
    // Use URL tripID if available, otherwise fallback to customerOrderList.TripID
    const tripIDToUse = urlTripID || customerOrderList?.TripID || tripNo;

    // Use splitDropdowns to correctly parse activityName value and label from the pipe-separated string
    let ReasonCodeValue = '';
    let ReasonCodeLabel = '';

    if (typeof mappedObj.ReasonCode === 'string' && mappedObj.ReasonCode.includes('||')) {
      // If activityName is a string with '||', split it into value and label
      const [value, ...labelParts] = mappedObj.ReasonCode.split('||');
      ReasonCodeValue = value.trim();
      ReasonCodeLabel = labelParts.join('||').trim();
    } else if (typeof mappedObj.ReasonCode === 'string') {
      ReasonCodeValue = mappedObj.ReasonCode;
      ReasonCodeLabel = mappedObj.ReasonCode;
    } else if (typeof mappedObj.ReasonCode === 'object' && mappedObj.ReasonCode !== null) {
      // In case it's already an object (from dropdown)
      const splitData = splitDropdowns(mappedObj.ReasonCode);
      ReasonCodeValue = splitData.ReasonCodeValue || '';
      ReasonCodeLabel = splitData.ReasonCodeLabel || '';
    }

    // Create payload for amend action
    const Header = {
      "TripNo": tripIDToUse,
      "Cancellation": null,
      "ShortClose": null,
      "Amendment": {
        "AmendmentRequestedDateTime": mappedObj.Canceldatetime || "",
        "AmendmentReasonCode": ReasonCodeValue || "",
        "AmendmentReasonCodeDescription": ReasonCodeLabel || "",
        "AmendmentRemarks": mappedObj.Remarks || ""
      }
    };
    console.log('Amend Payload:', Header);
    console.log("Using TripID for Amend:", tripIDToUse);
    try {
      const response = await tripPlanningService.confirmTripPlanning({ Header, messageType });
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        toast({
          title: "✅ Trip Amended",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
        console.log("response?.data?.ResponseData ===", JSON.parse((response as any)?.data?.ResponseData));
        const parsedResponse = JSON.parse((response as any)?.data?.ResponseData);
        const tripStatus = parsedResponse?.TripStatus;
        setTripStatus(tripStatus);
        if (tripStatus && tripIDToUse) {
          setTripCustomerOrdersData(prev =>
            Array.isArray(prev)
              ? prev.map((row: any) =>
                row?.TripID === tripIDToUse ? { ...row, TripStatus: tripStatus } : row
              )
              : prev
          );
        }
        setAmendModalOpen(false);
        console.log("Trip data updated in store", tripStatus);
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Trip Amendment Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    }
  };

  const handleCancelTripPlanning = async (formFields: any) => {
    console.log("Cancel Trip Plan Submit:", formFields);
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for Cancel API:', mappedObj);
    const messageType = "Manage Trip Plan - cancel Trip";
    // Use URL tripID if available, otherwise fallback to customerOrderList.TripID
    const tripIDToUse = urlTripID || customerOrderList?.TripID || tripNo;

    // Use splitDropdowns to correctly parse activityName value and label from the pipe-separated string
    let ReasonCodeValue = '';
    let ReasonCodeLabel = '';

    if (typeof mappedObj.ReasonCode === 'string' && mappedObj.ReasonCode.includes('||')) {
      // If activityName is a string with '||', split it into value and label
      const [value, ...labelParts] = mappedObj.ReasonCode.split('||');
      ReasonCodeValue = value.trim();
      ReasonCodeLabel = labelParts.join('||').trim();
    } else if (typeof mappedObj.ReasonCode === 'string') {
      ReasonCodeValue = mappedObj.ReasonCode;
      ReasonCodeLabel = mappedObj.ReasonCode;
    } else if (typeof mappedObj.ReasonCode === 'object' && mappedObj.ReasonCode !== null) {
      // In case it's already an object (from dropdown)
      const splitData = splitDropdowns(mappedObj.ReasonCode);
      ReasonCodeValue = splitData.ReasonCodeValue || '';
      ReasonCodeLabel = splitData.ReasonCodeLabel || '';
    }

    // Create payload for amend action
    const Header = {
      "TripNo": tripIDToUse,
      "Cancellation": {
        "CancellationRequestedDateTime": mappedObj.Canceldatetime || "",
        "CancellationReasonCode": ReasonCodeValue || "",
        "CancellationReasonCodeDescription": ReasonCodeLabel || "",
        "CancellationRemarks": mappedObj.Remarks || ""
      },
      "ShortClose": null,
      "Amendment": null,
    };
    console.log('Cancel Payload:', Header);
    console.log("Using TripID for Cancel:", tripIDToUse);
    try {
      const response = await tripPlanningService.confirmTripPlanning({ Header, messageType });
      console.log("response ===", response);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      if (resourceStatus) {
        toast({
          title: "✅ Trip Cancelled",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
        console.log("response?.data?.ResponseData ===", JSON.parse((response as any)?.data?.ResponseData));
        const parsedResponse = JSON.parse((response as any)?.data?.ResponseData);
        const tripStatus = parsedResponse?.TripStatus;
        setTripStatus(tripStatus);
        if (tripStatus && tripIDToUse) {
          setTripCustomerOrdersData(prev =>
            Array.isArray(prev)
              ? prev.map((row: any) =>
                row?.TripID === tripIDToUse ? { ...row, TripStatus: tripStatus } : row
              )
              : prev
          );
        }
        setCancelModalOpen(false);
        console.log("Trip data updated in store", tripStatus);
      } else {
        console.log("error as any ===", (response as any)?.data?.Message);
        toast({
          title: "⚠️ Trip Cancellation Failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming trip:", error);
    }
  };

  // Use URL tripID if available, otherwise fallback to customerOrderList.TripID
  const tripIDToUse = urlTripID || customerOrderList?.TripID || tripNo;
  const isDisabled = !tripIDToUse;
  const buttonClass = `inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm ${isDisabled ? "bg-white text-blue-600 border border-blue-600 disabled:pointer-events-none disabled:opacity-50 cursor-not-allowed hover:bg-white hover:text-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"
    }`;
  const buttonCancel = "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm";

  const handleRemoveEquipment = (index: number) => {
    const equipmentToRemove = tripResourceDetailsData?.Equipments?.[index];
    if (equipmentToRemove) {
      // Remove from tripResourceDetailsData
      const updatedEquipments = [...(tripResourceDetailsData?.Equipments || [])];
      updatedEquipments.splice(index, 1);
      setTripResourceDetailsData({ ...tripResourceDetailsData, Equipments: updatedEquipments });

      // Also remove from selectedArrCOData
      const resourceID = equipmentToRemove.EquipmentID;
      setSelectedArrCOData(prev => prev.map(co => ({
        ...co,
        ResourceDetails: (co.ResourceDetails || []).filter((r: any) =>
          !(r.ResourceType === 'Equipment' && r.ResourceID === resourceID)
        )
      })));
      console.log("handleRemoveEquipment ===", index, resourceID);
    }
  };

  const handleRemoveHandler = (index: number) => {
    const handlerToRemove = tripResourceDetailsData?.Handlers?.[index];
    if (handlerToRemove) {
      // Remove from tripResourceDetailsData
      const updatedHandlers = [...(tripResourceDetailsData?.Handlers || [])];
      updatedHandlers.splice(index, 1);
      setTripResourceDetailsData({ ...tripResourceDetailsData, Handlers: updatedHandlers });

      // Also remove from selectedArrCOData
      const resourceID = handlerToRemove.HandlerID;
      setSelectedArrCOData(prev => prev.map(co => ({
        ...co,
        ResourceDetails: (co.ResourceDetails || []).filter((r: any) =>
          !(r.ResourceType === 'Handler' && r.ResourceID === resourceID)
        )
      })));
      console.log("handleRemoveHandler ===", index, resourceID);
    }
  };

  const handleRemoveVehicle = (index: number) => {
    const vehicleToRemove = tripResourceDetailsData?.Vehicle?.[index];
    if (vehicleToRemove) {
      // Remove from tripResourceDetailsData
      const updatedVehicles = [...(tripResourceDetailsData?.Vehicle || [])];
      updatedVehicles.splice(index, 1);
      setTripResourceDetailsData({ ...tripResourceDetailsData, Vehicle: updatedVehicles });

      // Also remove from selectedArrCOData
      const resourceID = vehicleToRemove.VehicleID;
      setSelectedArrCOData(prev => prev.map(co => ({
        ...co,
        ResourceDetails: (co.ResourceDetails || []).filter((r: any) =>
          !(r.ResourceType === 'Vehicle' && r.ResourceID === resourceID)
        )
      })));
      console.log("handleRemoveVehicle ===", index, resourceID);
    }
  };

  const handleRemoveDriver = (index: number) => {
    const driverToRemove = tripResourceDetailsData?.Drivers?.[index];
    if (driverToRemove) {
      // Remove from tripResourceDetailsData
      const updatedDrivers = [...(tripResourceDetailsData?.Drivers || [])];
      updatedDrivers.splice(index, 1);
      setTripResourceDetailsData({ ...tripResourceDetailsData, Drivers: updatedDrivers });

      // Also remove from selectedArrCOData
      const resourceID = driverToRemove.DriverID;
      setSelectedArrCOData(prev => prev.map(co => ({
        ...co,
        ResourceDetails: (co.ResourceDetails || []).filter((r: any) =>
          !(r.ResourceType === 'Driver' && r.ResourceID === resourceID)
        )
      })));
      console.log("handleRemoveDriver ===", index, resourceID);
    }
  };

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
              <div className='flex items-center gap-2'>
                <h1 className="text-2xl font-semibold">Trip No.</h1>
                <div className="relative max-w-md">
                  <Input
                    placeholder="Trip No."
                    value={tripNo}
                    onChange={(e) => setTripNo(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {tripStatus && (
                  <span className="inline-flex items-center justify-center rounded-full text-xs badge-blue ml-3 font-medium">
                    {tripStatus}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border border-blue-500 text-blue-500 hover:bg-blue-50 h-9 rounded flex items-center transition-colors duration-200 gap-2 px-3"
                  onClick={() => {
                    // Dynamically get the base path from the current URL
                    const { pathname } = window.location;
                    // Find the base path 
                    const basePathMatch = pathname.match(/^\/[^/]+/);
                    const basePath = basePathMatch ? basePathMatch[0] : "";
                    window.location.href = `${basePath}/trip-planning`;
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Trip
                </Button>
                <Button
                  variant="outline"
                  className="border border-blue-500 text-blue-500 hover:bg-blue-50 h-9 rounded flex items-center transition-colors duration-200 gap-2 px-3"
                  onClick={handleManageTripsClick}
                >
                  Manage Trips
                </Button>
                {/* <Button variant="ghost" size="icon" className='border rounded-lg'>
                  <ExternalLink className="h-4 w-4" />
                </Button> */}
                {/* <Button variant="ghost" size="icon" className='border rounded-lg listOfOptions border-input'>
                  <EllipsisVertical className="h-4 w-4" />
                </Button> */}
                <Popover open={listPopoverOpen} onOpenChange={setListPopoverOpen}>
                  <PopoverTrigger asChild>
                    {urlTripID &&
                      (<Button
                        variant="ghost"
                        size="icon"
                        aria-label="More options"
                        onClick={() => console.log('listPopoverOpen ==', listPopoverOpen)}
                        className="listOfOptions inline-flex items-center justify-center text-foreground border border-border hover:bg-muted transition-colors rounded-sm">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>)
                    }
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="end" className="p-2 w-full">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => {
                        console.log('VAS');
                        openDrawer('vas-trip');
                        setListPopoverOpen(false);
                      }} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm text-left">
                        <Settings className="h-4 w-4" />
                        <span>VAS</span>
                      </button>
                      <button onClick={() => {
                        console.log('Supplier Billing');
                        openDrawer('train-parameters');
                        setListPopoverOpen(false);
                      }} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm text-left">
                        <TramFront className="h-4 w-4" />
                        <span>Train Parameters</span>
                      </button>
                      <button onClick={() => {
                        console.log('Leg and Events');
                        openDrawer('leg-and-events');
                        // setIsLegEventsDrawerOpen(true);
                        setListPopoverOpen(false);
                      }} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm text-left">
                        <Zap className="h-4 w-4" />
                        <span>Leg and Events</span>
                      </button>
                      <button onClick={() => {
                        console.log('Leg and Events');
                        openTripDrawer(urlTripID);
                        setListPopoverOpen(false);
                      }} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm text-left">
                        <Route className="h-4 w-4" />
                        <span>Transport Route Update</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
                  {tripType}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {planDate ? format(planDate, "dd-MMM-yyyy") : ''}
                </Badge>
                <Button variant="ghost" size="icon">
                  <ChevronDown className="h-4 w-4" />
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
                    <SelectItem value="Normal">Normal</SelectItem>
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
                      {planDate && (
                        <span
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-destructive"
                          onClick={e => {
                            e.stopPropagation();
                            setPlanDate(undefined);
                          }}
                          aria-label="Clear date"
                          title="Clear date"
                        >
                          &#10005;
                        </span>
                      )}
                      <CalendarIcon className="mr-2 h-4 w-4 absolute right-8" />
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
                  { title: 'Equipment', icon: Box, color: 'bg-red-100', count: (EquipmentCount != 0) ? EquipmentCount : '', iconColor: 'text-red-600' },
                  { title: 'Handler', icon: UserCog, color: 'bg-orange-100', count: (tripResourceDetailsData?.Handlers?.length != 0) ? tripResourceDetailsData?.Handlers?.length : '', iconColor: 'text-orange-600' },
                  { title: 'Vehicle', icon: Car, color: 'bg-amber-100', count: (tripResourceDetailsData?.Vehicle?.length != 0) ? tripResourceDetailsData?.Vehicle?.length : '', iconColor: 'text-amber-600' },
                  { title: 'Driver', icon: UserCircle, color: 'bg-indigo-100', count: (tripResourceDetailsData?.Drivers?.length != 0) ? tripResourceDetailsData?.Drivers?.length : '', iconColor: 'text-indigo-600' },
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
                <div className="bg-card border border-border rounded-lg p-4 mb-[60px]">
                  <div className='flex gap-6'>
                    <div className='w-3/4 flex-1 border border-border rounded-lg p-6'>
                      {/* Trip Planning Customer Order Hub */}
                      <TripCOHubMultiple data={tripCustomerOrdersData} onCustomerOrderClick={handleMultipleCustomerOrders} />
                    </div>
                    {/* Resources Cards - Right */}
                    <div className="w-1/4 space-y-3">
                      <div className="bg-card overflow-hidden">
                        <div className=''>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Supplier</div>
                            <div className='flex items-center gap-2'>
                              <div className="text-sm font-medium w-full">
                                <DynamicLazySelect
                                  fetchOptions={fetchSupplier}
                                  value={supplier}
                                  onChange={(value) => changeSupplier(value as string)}
                                  placeholder=""
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleOpenResourceDrawer('Supplier');
                                }}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className='mt-3 mb-3'>
                            <div className="text-xs text-muted-foreground mb-1">Schedule</div>
                            <div className='flex items-center gap-2'>
                              <div className="text-sm font-medium w-full">
                                <DynamicLazySelect
                                  fetchOptions={fetchSchedule}
                                  value={schedule}
                                  onChange={(value) => changeSchedule(value as string)}
                                  placeholder=""
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleOpenResourceDrawer('Schedule');
                                }}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {[
                          { title: 'Others', subtitle: '', count: '', icon: Users, color: 'bg-pink-100', iconColor: 'text-pink-600' },
                          // { title: 'Supplier', icon: Truck, color: 'bg-cyan-100', count: '', iconColor: 'text-cyan-600' },
                          // { title: 'Schedule', icon: CalendarIcon2, color: 'bg-lime-100', count: '', iconColor: 'text-lime-600' },
                          { title: 'Equipment', icon: Box, color: 'bg-red-100', count: (EquipmentCount != 0) ? EquipmentCount : '', iconColor: 'text-red-600' },
                          { title: 'Handler', icon: UserCog, color: 'bg-cyan-100', count: (tripResourceDetailsData?.Handlers?.length != 0) ? tripResourceDetailsData?.Handlers?.length : '', iconColor: 'text-cyan-600' },
                          { title: 'Vehicle', icon: Car, color: 'bg-amber-100', count: (tripResourceDetailsData?.Vehicle?.length != 0) ? tripResourceDetailsData?.Vehicle?.length : '', iconColor: 'text-amber-600' },
                          { title: 'Driver', icon: UserCircle, color: 'bg-indigo-100', count: (tripResourceDetailsData?.Drivers?.length != 0) ? tripResourceDetailsData?.Drivers?.length : '', iconColor: 'text-indigo-600' },

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
                                    {resource.title == 'Equipment' && (
                                      <BadgesList
                                        items={tripResourceDetailsData?.Equipments}
                                        onRemove={handleRemoveEquipment}
                                        badgeVariant="secondary"
                                        idField="EquipmentID"
                                      />
                                    )}
                                    {resource.title == 'Handler' && (
                                      <BadgesList
                                        items={tripResourceDetailsData?.Handlers}
                                        onRemove={handleRemoveHandler}
                                        badgeVariant="secondary"
                                        idField="HandlerID"
                                      />
                                    )}
                                    {resource.title == 'Vehicle' && (
                                      <BadgesList
                                        items={tripResourceDetailsData?.Vehicle}
                                        onRemove={handleRemoveVehicle}
                                        badgeVariant="secondary"
                                        idField="VehicleID"
                                      />
                                    )}
                                    {resource.title == 'Driver' && (
                                      <BadgesList
                                        items={tripResourceDetailsData?.Drivers}
                                        onRemove={handleRemoveDriver}
                                        badgeVariant="secondary"
                                        idField="DriverID"
                                      />
                                    )}
                                    {resource.subtitle && (
                                      <p className="text-xs text-muted-foreground">{resource.subtitle}</p>
                                    )}
                                  </div>
                                </div>
                                {resource.title === 'Others' ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      handleOthersClick()
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (resource.title === 'Equipment') {
                                        handleOpenResourceDrawer('Equipment');
                                      } else if (resource.title === 'Supplier') {
                                        handleOpenResourceDrawer('Supplier');
                                      } else if (resource.title === 'Schedule') {
                                        handleOpenResourceDrawer('Schedule');
                                      } else if (resource.title === 'Driver') {
                                        handleOpenResourceDrawer('Driver');
                                      } else if (resource.title === 'Handler') {
                                        handleOpenResourceDrawer('Handler');
                                      } else if (resource.title === 'Vehicle') {
                                        handleOpenResourceDrawer('Vehicle');
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* Trip Creation Controls */}
                  <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
                    <div className="flex items-center gap-4">
                      <Switch
                        id="consolidated-trip"
                        checked={consolidatedTrip}
                        onCheckedChange={setConsolidatedTrip}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor="consolidated-trip" className="cursor-pointer text-foreground font-medium">
                        Create Single trip with Consolidated COs
                      </Label>
                      {/* <span className="text-sm text-muted-foreground">
                        {consolidatedTrip ? 'Switch off' : 'Switch on'}
                      </span> */}
                    </div>
                    <div className='flex items-center gap-4'>
                      <button onClick={openCancelPopup} disabled={!tripNo} className={buttonCancel}>
                        Cancel
                      </button>
                      {!tripNo &&
                        <button onClick={createBulkTripData} className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">
                          Create Trip
                        </button>
                      }
                      <button onClick={confirmTripPlanning} disabled={!tripNo} className={buttonClass}>
                        Confirm
                      </button>
                      <button onClick={releseTripPlanning} disabled={!tripNo} className={buttonClass}>
                        Release
                      </button>
                      {tripNo &&
                        (<button onClick={openAmendPopup} className={buttonClass}>
                          Amend
                        </button>)
                      }
                    </div>
                  </div>
                </div>
              ) : (
                /* Split View - Customer Orders & Resources */
                <div className="flex gap-4 mb-[60px]">
                  {/* Customer Orders - Left Panel */}
                  <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">

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

                      <div className={`${addResourcesFlag ? 'flex' : ''} gap-6`}>
                        {addResourcesFlag ? (
                          <>
                            <div className='w-3/4 flex-1 bg-card border border-border rounded-lg p-6'>
                              {/* Trip Planning Customer Order Hub */}
                              <TripCOHub
                                key={tripCOHubReloadKey}
                                onCustomerOrderClick={handleCustomerOrderSelect}
                                tripID={urlTripID}
                                manageFlag={manageFlag}
                                customerOrdersData={tripCustomerOrdersData}
                              />
                            </div>
                            {/* Resources Cards - Right */}
                            <div className="w-1/4 space-y-3">
                              <div className=''>
                                <div className='flex items-center justify-between px-4 py-3 bg-blue-50 mb-2'>
                                  <div className='text-sm text-blue-700'>
                                    <span className='text-xs'>Selected Customer Order: {customerOrderList?.CustomerOrderID} - {customerOrderList?.LegBehaviour}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Supplier</div>
                                  <div className='flex items-center gap-2'>
                                    <div className="text-sm font-medium w-full">
                                      <DynamicLazySelect
                                        fetchOptions={fetchSupplier}
                                        value={supplier}
                                        onChange={(value) => changeSupplier(value as string)}
                                        placeholder=""
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        handleOpenResourceDrawer('Supplier');
                                      }}
                                    >
                                      <Search className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className='mt-3'>
                                  <div className="text-xs text-muted-foreground mb-1">Schedule</div>
                                  <div className='flex items-center gap-2'>
                                    <div className="text-sm font-medium w-full">
                                      <DynamicLazySelect
                                        fetchOptions={fetchSchedule}
                                        value={schedule}
                                        onChange={(value) => changeSchedule(value as string)}
                                        placeholder=""
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        handleOpenResourceDrawer('Schedule');
                                      }}
                                    >
                                      <Search className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {[
                                { title: 'Others', subtitle: '', count: '', icon: Users, color: 'bg-pink-100', iconColor: 'text-pink-600' },
                                // { title: 'Supplier', icon: Truck, color: 'bg-cyan-100', count: '', iconColor: 'text-cyan-600' },
                                // { title: 'Schedule', icon: CalendarIcon2, color: 'bg-lime-100', count: '', iconColor: 'text-lime-600' },
                                { title: 'Equipment', icon: Box, color: 'bg-red-100', count: (tripResourceDetailsData?.Equipments?.length != 0) ? tripResourceDetailsData?.Equipments?.length : '', iconColor: 'text-red-600' },
                                { title: 'Handler', icon: UserCog, color: 'bg-cyan-100', count: (tripResourceDetailsData?.Handlers?.length != 0) ? tripResourceDetailsData?.Handlers?.length : '', iconColor: 'text-cyan-600' },
                                { title: 'Vehicle', icon: Car, color: 'bg-amber-100', count: (tripResourceDetailsData?.Vehicle?.length != 0) ? tripResourceDetailsData?.Vehicle?.length : '', iconColor: 'text-amber-600' },
                                { title: 'Driver', icon: UserCircle, color: 'bg-indigo-100', count: (tripResourceDetailsData?.Drivers?.length != 0) ? tripResourceDetailsData?.Drivers?.length : '', iconColor: 'text-indigo-600' },

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
                                            <span className="inline-flex items-center justify-center rounded-full text-xs badge-blue ml-3 font-medium">{resource?.count}</span>
                                          </h3>
                                          {resource.title == 'Equipment' && (
                                            <BadgesList
                                              items={tripResourceDetailsData?.Equipments}
                                              onRemove={handleRemoveEquipment}
                                              badgeVariant="secondary"
                                              idField="EquipmentID"
                                            />
                                          )}
                                          {resource.title == 'Handler' && (
                                            <BadgesList
                                              items={tripResourceDetailsData?.Handlers}
                                              onRemove={handleRemoveHandler}
                                              badgeVariant="secondary"
                                              idField="HandlerID"
                                            />
                                          )}
                                          {resource.title == 'Vehicle' && (
                                            <BadgesList
                                              items={tripResourceDetailsData?.Vehicle}
                                              onRemove={handleRemoveVehicle}
                                              badgeVariant="secondary"
                                              idField="VehicleID"
                                            />
                                          )}
                                          {resource.title == 'Driver' && (
                                            <BadgesList
                                              items={tripResourceDetailsData?.Drivers}
                                              onRemove={handleRemoveDriver}
                                              badgeVariant="secondary"
                                              idField="DriverID"
                                            />
                                          )}
                                          {resource.subtitle && (
                                            <p className="text-xs text-muted-foreground">{resource.subtitle}</p>
                                          )}
                                        </div>
                                      </div>
                                      {resource.title === 'Others' ? (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            handleOthersClick();
                                          }}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            if (resource.title === 'Equipment') {
                                              handleOpenResourceDrawer('Equipment');
                                            } else if (resource.title === 'Supplier') {
                                              handleOpenResourceDrawer('Supplier');
                                            } else if (resource.title === 'Schedule') {
                                              handleOpenResourceDrawer('Schedule');
                                            } else if (resource.title === 'Driver') {
                                              handleOpenResourceDrawer('Driver');
                                            } else if (resource.title === 'Handler') {
                                              handleOpenResourceDrawer('Handler');
                                            } else if (resource.title === 'Vehicle') {
                                              handleOpenResourceDrawer('Vehicle');
                                            }
                                          }}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      )}
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
                              <TripCOHub
                                key={tripCOHubReloadKey}
                                onCustomerOrderClick={handleCustomerOrderSelect}
                                tripID={urlTripID}
                                manageFlag={manageFlag}
                                customerOrdersData={tripCustomerOrdersData}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Toggle */}
                      <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
                        <div className="flex items-center gap-4">
                          <Switch
                            id="consolidated-trip-inline"
                            checked={consolidatedTrip}
                            onCheckedChange={setConsolidatedTrip}
                            className="data-[state=checked]:bg-Blue-600"
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
                          <button onClick={openCancelPopup} disabled={!tripNo} className={buttonCancel}>
                            Cancel
                          </button>
                          {!tripNo &&
                            <button onClick={createSingleTripData} className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">
                              Create Trip
                            </button>
                          }
                          {/* { showConfirmReleaseBtn && customerOrderList != null && ( */}
                          <button onClick={confirmTripPlanning} disabled={isDisabled} className={buttonClass}>
                            Confirm
                          </button>
                          {/* )}
                          { showConfirmReleaseBtn && customerOrderList != null && ( */}
                          <button onClick={releseTripPlanning} disabled={isDisabled} className={buttonClass}>
                            Release
                          </button>
                          {/* )} */}
                          {tripNo &&

                            (<button onClick={openAmendPopup} className={buttonClass}>
                              Amend
                            </button>)
                          }
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
        selectedResourcesRq={EquipmentData}
        resourceType={currentResourceType}
        resourceData={resourceData}
        isLoading={isLoadingResource}
      />
      { /* Others Selection Drawer */}
      {otherInfo ?
        <OthersSelectionDrawer
          tripNo={tripNo}
          tripStatus={tripStatus}
          otherInfoData={otherInfo}
          isOpen={othersDrawerOpen}
          resourceType='Others'
          onClose={() => setOthersDrawerOpen(false)}
          onSubmit={(data) => {
            // handle/save data from drawer here
            setOthersDrawerOpen(false);
            console.log("Drawer form data:", data);
            updateOtherInfo(data);
          }}
        /> : ''
      }
      {/* Loading Overlay */}
      {isLoadingResource && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
          <div className="text-lg font-semibold text-blue-700">Loading {currentResourceType}...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching {currentResourceType.toLowerCase()} data from server, please wait.</div>
        </div>
      )}

      <TripPlanActionModal
        open={amendModalOpen}
        onClose={() => setAmendModalOpen(false)}
        title="Amend Trip Plan"
        icon={<NotebookPen className="w-4 h-4" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={handleAmendTripPlanSubmit}
        submitLabel="Amend Trip"
        actionType="amend"
      />

      <TripPlanActionModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Trip Plan"
        icon={<NotebookPen className="w-4 h-4" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={handleCancelTripPlanning}
        submitLabel="Cancel Trip"
        actionType="cancel"
      />

      {/* Trip Level Update Drawer */}
      <SideDrawer
        isOpen={isTripDrawerOpen}
        onClose={closeTripDrawer}
        title="Trip Level Update"
        width="100%"
        showFooter={false}
      >
        {selectedTrip && (
          <TripLevelUpdateDrawer
            tripData={selectedTrip}
            onAddExecutionLeg={addExecutionLeg}
            onRemoveExecutionLeg={removeExecutionLeg}
            onUpdateExecutionLeg={updateExecutionLeg}
            onSave={saveTripDetails}
            fetchDepartures={fetchDepartures}
            fetchArrivals={fetchArrivals}
          />
        )}
      </SideDrawer>
      {/* Side Drawer */}
      <SideDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        onBack={drawerType === 'transport-route' ? closeDrawer : undefined}
        title={drawerType === 'resources' ? 'Resources' : drawerType === 'vas-trip' ? 'VAS' : drawerType === 'incidents' ? 'Incident' : drawerType === 'customer-orders' ? 'Customer Order' : drawerType === 'supplier-billing' ? 'Supplier Billing' : drawerType === 'trip-execution-create' ? 'Events & Consignment' : drawerType === 'linked-transactions' ? 'Linked Transactions' : drawerType === 'train-parameters' ? 'Train Parameters' : drawerType === 'transport-route' ? 'Leg Details' : drawerType === 'leg-and-events' ? 'Leg and Events' : ''}
        titleBadge={drawerType === 'vas' || drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'trip-execution-create' || drawerType === 'leg-and-events' ? urlTripID || 'TRIP0000000001' : undefined}
        slideDirection="right"
        width={drawerType === 'train-parameters' || drawerType === 'leg-and-events' ? '100%' : '75%'}
        smoothness="smooth"
        showBackButton={drawerType === 'transport-route' || drawerType === 'leg-and-events'}
        showCloseButton={true}
      >
        {drawerType === 'vas-trip' && <VASTripDrawerScreen tripUniqueNo={urlTripID || undefined} />}
        {drawerType === 'train-parameters' && <TrainParametersDrawerScreen onClose={closeDrawer} tripId={urlTripID || undefined} />}
        {drawerType === 'leg-and-events' && <LegEventsDrawer tripId={urlTripID || undefined} />}
      </SideDrawer>
    </AppLayout>
  );
};

export default TripPlanning;
