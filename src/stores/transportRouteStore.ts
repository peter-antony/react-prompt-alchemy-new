import { create } from 'zustand';
import { tripService, quickOrderService } from '@/api/services';

interface TripInfo {
  TripID: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  DepartureActualDate: string;
  ArrivalActualDate: string;
  LoadType: string;
  TripStatus: string;
  DraftBillNo: string | null;
  DraftBillStatus: string | null;
  DraftBillWarning: string | null;
  SupplierID: string;
  SupplierDescription: string;
}

interface LegDetail {
  LegSequence: number;
  LegID: string;
  LegUniqueId: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  TransportMode: string;
  LegStatus: string | null;
  LegStatusDescription: string | null;
  TransitTime: number | null;
  TransitTimeUOM: string | null;
  TripInfo: TripInfo[] | null;
  ModeFlag: string;
  // ReasonForUpdate: string | null;
  QCCode1: string | null;
  QCCode1Value: string | null;
  Remarks: string | null;
}

interface TransportRoute {
  CustomerOrderNo?: string;
  ExecutionPlanID: string;
  CustomerOrderID: string;
  CustomerID: string;
  CustomerName: string;
  Service: string;
  ServiceDescription: string;
  SubService: string;
  SubServiceDescription: string;
  CODeparture: string;
  CODepartureDescription: string;
  COArrival: string;
  COArrivalDescription: string;
  RouteID: string;
  RouteDescription: string;
  Status: string;
  StatusDescription: string;
  LegDetails: LegDetail[];
  ReasonForUpdate: string;
}

interface TransportRouteStore {
  routes: TransportRoute[];
  selectedOrder: TransportRoute | null;
  selectedRoute: TransportRoute | null;
  isDrawerOpen: boolean;
  isRouteDrawerOpen: boolean;
  highlightedIndexes: number[];
  isLoading: boolean;
  isRouteLoading: boolean;
  error: string | null;
  handleCustomerOrderClick: (order: TransportRoute) => void;
  openRouteDrawer: (route: TransportRoute) => Promise<void>;
  closeDrawer: () => void;
  closeRouteDrawer: () => void;
  highlightRowIndexes: (indexes: number[]) => void;
  addLegPanel: () => void;
  removeLegPanel: (index: number) => void;
  updateLegData: (index: number, field: string, value: any) => void;
  saveRouteDetails: () => Promise<void>;
  fetchDepartures: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
  fetchArrivals: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
}


export const useTransportRouteStore = create<TransportRouteStore>((set, get) => ({
  routes: [],
  selectedOrder: null,
  selectedRoute: null,
  isDrawerOpen: false,
  isRouteDrawerOpen: false,
  highlightedIndexes: [],
  isLoading: false,
  isRouteLoading: false,
  error: null,


  handleCustomerOrderClick: (order: TransportRoute) => {
    set({ selectedOrder: order, isDrawerOpen: true });
  },

  openRouteDrawer: async (route: TransportRoute) => {
    try {
      set({ isRouteLoading: true, error: null });
      
      console.log('Opening route drawer for:', route);
      console.log('CustomerOrderID to fetch:', route.CustomerOrderNo);
      
      // Fetch detailed route data using the CustomerOrderNo
      const apiParams = { CONumber: route.CustomerOrderNo };
      console.log('API params:', apiParams);
      
      const response: any = await tripService.getCOSelection(apiParams);
      
      if (response?.data?.ResponseData) {
        const parsedResponse = JSON.parse(response.data.ResponseData);
        console.log('API Response for CO Selection:', parsedResponse);
        console.log('Is array?', Array.isArray(parsedResponse));
        console.log('Array length:', Array.isArray(parsedResponse) ? parsedResponse.length : 'Not an array');
        
        // Handle array response - get the first object
        const responseData = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
        console.log('Response data (first object):', responseData);
        console.log('LegDetails from API:', responseData?.LegDetails);
        
        // Ensure LegDetails is an array and has proper structure
        const legDetails = Array.isArray(responseData?.LegDetails) 
          ? responseData.LegDetails.map((leg: any, index: number) => ({
              LegSequence: leg.LegSequence || index + 1,
              LegID: leg.LegID || '',
              LegUniqueId: leg.LegUniqueId || `${Date.now()}`,
              Departure: leg.Departure || '',
              DepartureDescription: leg.DepartureDescription || '',
              Arrival: leg.Arrival || '',
              ArrivalDescription: leg.ArrivalDescription || '',
              LegBehaviour: leg.LegBehaviour || 'Pick',
              LegBehaviourDescription: leg.LegBehaviourDescription || 'Pick',
              TransportMode: leg.TransportMode || 'Rail',
              LegStatus: leg.LegStatus || null,
              LegStatusDescription: leg.LegStatusDescription || null,
              TransitTime: leg.TransitTime || null,
              TransitTimeUOM: leg.TransitTimeUOM || null,
              TripInfo: leg.TripInfo || null,
              ModeFlag: leg.ModeFlag || 'Nochange',
              ReasonForUpdate: leg.ReasonForUpdate || null,
              QCCode1: leg.QCCode1 || null,
              QCCode1Value: leg.QCCode1Value || null,
              Remarks: leg.Remarks || null
            }))
          : [];
        
        // Transform API response to match our TransportRoute interface
        const apiRoute: TransportRoute = {
          ExecutionPlanID: responseData?.ExecutionPlanID || route.ExecutionPlanID,
          CustomerOrderID: responseData?.CustomerOrderID || route.CustomerOrderID,
          CustomerID: responseData?.CustomerID || route.CustomerID,
          CustomerName: responseData?.CustomerName || route.CustomerName,
          Service: responseData?.Service || route.Service,
          ServiceDescription: responseData?.ServiceDescription || route.ServiceDescription,
          SubService: responseData?.SubService || route.SubService,
          SubServiceDescription: responseData?.SubServiceDescription || route.SubServiceDescription,
          CODeparture: responseData?.CODeparture || route.CODeparture,
          CODepartureDescription: responseData?.CODepartureDescription || route.CODepartureDescription,
          COArrival: responseData?.COArrival || route.COArrival,
          COArrivalDescription: responseData?.COArrivalDescription || route.COArrivalDescription,
          RouteID: responseData?.RouteID || route.RouteID,
          RouteDescription: responseData?.RouteDescription || route.RouteDescription,
          Status: responseData?.Status || route.Status,
          StatusDescription: responseData?.StatusDescription || route.StatusDescription,
          LegDetails: legDetails,
          ReasonForUpdate: responseData?.ReasonForUpdate || route.ReasonForUpdate || ""
        };
        
        set({ 
          selectedRoute: apiRoute, 
          isRouteDrawerOpen: true,
          isRouteLoading: false 
        });
      } else {
        // Fallback to original route data if API doesn't return expected structure
        set({ 
          selectedRoute: route, 
          isRouteDrawerOpen: true,
          isRouteLoading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
      set({ 
        error: 'Failed to load route details. Please try again.',
        isRouteLoading: false,
        selectedRoute: route, // Fallback to original data
        isRouteDrawerOpen: true
      });
    }
  },


  closeDrawer: () => {
    set({ isDrawerOpen: false, selectedOrder: null });
  },

  closeRouteDrawer: () => {
    set({ isRouteDrawerOpen: false, selectedRoute: null, isRouteLoading: false, error: null });
  },

  highlightRowIndexes: (indexes: number[]) => {
    set({ highlightedIndexes: indexes });
  },

  addLegPanel: () => {
    const { selectedRoute } = get();
    if (!selectedRoute) return;

    const newLeg: LegDetail = {
      LegSequence: (selectedRoute.LegDetails?.length || 0) + 1,
      LegID: '',
      LegUniqueId: null,
      Departure: '',
      DepartureDescription: '',
      Arrival: '',
      ArrivalDescription: '',
      LegBehaviour: '',
      LegBehaviourDescription: '',
      TransportMode: '',
      LegStatus: null,
      LegStatusDescription: null,
      TransitTime: null,
      TransitTimeUOM: null,
      TripInfo: null,
      ModeFlag: 'Insert',
      // ReasonForUpdate: null,
      QCCode1: null,
      QCCode1Value: null,
      Remarks: null
    };

    set({
      selectedRoute: {
        ...selectedRoute,
        LegDetails: [...selectedRoute.LegDetails, newLeg]
      }
    });
  },

  removeLegPanel: (index: number) => {
    const { selectedRoute } = get();
    if (!selectedRoute) return;

    const updatedLegs = selectedRoute.LegDetails.filter((_, i) => i !== index);
    set({
      selectedRoute: {
        ...selectedRoute,
        LegDetails: updatedLegs
      }
    });
  },

  updateLegData: (index: number, field: string, value: any) => {
    console.log(`📝 updateLegData called: index=${index}, field=${field}, value=`, value);
    const { selectedRoute } = get();
    if (!selectedRoute) {
      console.log('❌ No selectedRoute found in store');
      return;
    }

    console.log('✅ selectedRoute found, updating leg data...');
    const updatedLegs = [...selectedRoute.LegDetails];
    updatedLegs[index] = {
      ...updatedLegs[index],
      [field]: value
    };

    set({
      selectedRoute: {
        ...selectedRoute,
        LegDetails: updatedLegs
      }
    });
    console.log('✅ updated leg info--------', get().selectedRoute);
  },

  saveRouteDetails: async () => {
    const { selectedRoute } = get();
    if (!selectedRoute) return;

    // Simulate API call
    console.log('Saving route details:', selectedRoute);
    
    // Update the route in the routes array
    const { routes } = get();
    const updatedRoutes = routes.map(route => 
      route.ExecutionPlanID === selectedRoute.ExecutionPlanID ? selectedRoute : route
    );

    set({ routes: updatedRoutes });
  },

  fetchDepartures: async ({ searchTerm, offset, limit }) => {
    try {
      // Call the API using the same service pattern as TripPlanning component
      const response = await quickOrderService.getMasterCommonData({
        messageType: 'Departure Init',
        searchTerm: searchTerm || '',
        offset,
        limit,
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
      
      // Fallback to empty array if API call fails
      return [];
    } catch (error) {
      console.error('Error fetching departures:', error);
      // Return empty array on error
      return [];
    }
  },

  fetchArrivals: async ({ searchTerm, offset, limit }) => {
    try {
      // Call the API using the same service pattern as TripPlanning component
      const response = await quickOrderService.getMasterCommonData({
        messageType: 'Arrival Init',
        searchTerm: searchTerm || '',
        offset,
        limit,
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
      
      // Fallback to empty array if API call fails
      return [];
    } catch (error) {
      console.error('Error fetching departures:', error);
      // Return empty array on error
      return [];
    }
  }
}));