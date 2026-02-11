import { create } from 'zustand';
import { tripService } from '@/api/services/tripService';
import { quickOrderService } from '@/api/services/quickOrderService';
import { manageTripStore } from '@/stores/mangeTripStore';

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
  TripInfo: TripInfo[] | null;
  ModeFlag: string;
  ReasonForUpdate: string | null;
  QCCode1: string | null;
  QCCode1Value: string | null;
  Remarks: string | null;
}

interface TransportRoute {
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
  LegDetails: LegDetail[];
  ReasonForUpdate: string;
}

interface NextPlan {
  TripID: string;
  TripStatus: string;
}

interface CustomerOrderDetail {
  CustomerOrderNo: string;
  ExecutionLegID: string;
  ExecutionLegSeqNo: number;
  ExecutionPlanID: string;
  ExecutionLegBehaviour: string;
  ExecutionLegBehaviourDescription: string;
  DeparturePoint: string;
  DeparturePointDescription: string;
  ArrivalPoint: string;
  ArrivalPointDescription: string;
  NextPlan: NextPlan[];
}

interface ExecutionLegDetail {
  LegSequence: number;
  LegID: string;
  LegIDDescription: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  ReasonForUpdate: string | null;
  Remarks: string | null;
  QuickCode1: string | null;
  QuickCodeValue1: string | null;
  ModeFlag: string;
  WarningMsg: string | null;
  CustomerOrderDetails: Array<{
    CustomerOrderNo: string;
    LegUniqueId: string;
  }>;
}

interface TripLegDetail {
  LegSeqNo: number;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  LegID: string;
  LegIDDescription: string;
  DeparturePoint: string;
  DeparturePointDescription: string;
  DepartureDateTime: string;
  ArrivalPoint: string;
  ArrivalPointDescription: string;
  ArrivalDateTime: string;
  TransportMode: string | null;
  SupplierID: string;
  SupplierDescription: string;
  CustomerOrderDetails: CustomerOrderDetail[];
  ExecutionLegDetails: ExecutionLegDetail[];
}

interface TripData {
  Header: {
    TripID: string;
    TripOU: number;
    TripStatus: string;
    TripStatusDescription: string;
  };
  LegDetails: TripLegDetail[];
  WarnningDetails: {
    HeaderWarningMsg: string | null;
  };
}

interface TransportRouteStore {
  routes: TransportRoute[];
  selectedOrder: TransportRoute | null;
  selectedRoute: TransportRoute | null;
  selectedTrip: TripData | null;
  isDrawerOpen: boolean;
  isRouteDrawerOpen: boolean;
  isTripDrawerOpen: boolean;
  highlightedIndexes: number[];
  fetchRoutes: () => void;
  handleCustomerOrderClick: (order: TransportRoute) => void;
  openRouteDrawer: (route: TransportRoute) => Promise<void>;
  openTripDrawer: (tripId: string) => Promise<void>;
  closeDrawer: () => void;
  closeRouteDrawer: () => void;
  closeTripDrawer: () => void;
  highlightRowIndexes: (indexes: number[]) => void;
  addLegPanel: () => void;
  removeLegPanel: (index: number) => void;
  updateLegData: (index: number, field: string, value: any) => void;
  addExecutionLeg: (legIndex: number) => void;
  removeExecutionLeg: (legIndex: number, execLegIndex: number) => void;
  updateExecutionLeg: (legIndex: number, execLegIndex: number, field: string, value: any) => void;
  saveRouteDetails: () => Promise<void>;
  saveTripDetails: () => Promise<void>;
  fetchDepartures: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
  fetchArrivals: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
}

// mockRoutes removed (was used for demo). Please use API-driven data.
// mockTripData removed (was used for demo). Please use API-driven data.

export const useTransportRouteStore = create<TransportRouteStore>((set, get) => ({
  routes: [],
  selectedOrder: null,
  selectedRoute: null,
  selectedTrip: null,
  isDrawerOpen: false,
  isRouteDrawerOpen: false,
  isTripDrawerOpen: false,
  highlightedIndexes: [],

  fetchRoutes: () => {
    // No mock data; initialize empty routes. Replace with real API call if needed.
    set({ routes: [] });
  },

  handleCustomerOrderClick: (order: TransportRoute) => {
    set({ selectedOrder: order, isDrawerOpen: true });
  },

  openRouteDrawer: async (route: TransportRoute) => {
    // Simulate API call - in real scenario, fetch from backend
    set({ selectedRoute: route, isRouteDrawerOpen: true });
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false, selectedOrder: null });
  },

  closeRouteDrawer: () => {
    set({ isRouteDrawerOpen: false, selectedRoute: null });
  },

  openTripDrawer: async (tripId: string) => {
    try {
      // Fetch trip data from API using getplantriplevelupdate
      const response: any = await tripService.getplantriplevelupdate({ TripId: tripId });
      
      if (response?.data?.ResponseData) {
        const parsedResponse = JSON.parse(response.data.ResponseData);
        
        // Handle array response - get the first object
        const tripData = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
        
        // Ensure LegDetails is an array
        const formattedTripData: TripData = {
          Header: tripData?.Header || { TripID: '', TripOU: 0, TripStatus: '', TripStatusDescription: '' },
          LegDetails: Array.isArray(tripData?.LegDetails) 
            ? tripData.LegDetails.map((leg: any) => ({
                ...leg,
                ExecutionLegDetails: Array.isArray(leg.ExecutionLegDetails) ? leg.ExecutionLegDetails : [],
                CustomerOrderDetails: Array.isArray(leg.CustomerOrderDetails) ? leg.CustomerOrderDetails : []
              }))
            : [],
          WarnningDetails: tripData?.WarnningDetails || { HeaderWarningMsg: null }
        };
        
        set({ 
          selectedTrip: formattedTripData, 
          isTripDrawerOpen: true 
        });
      } else {
        // Fallback to empty structure if API doesn't return expected structure
        set({ 
          selectedTrip: { Header: { TripID: '', TripOU: 0, TripStatus: '', TripStatusDescription: '' }, LegDetails: [], WarnningDetails: { HeaderWarningMsg: null } }, 
          isTripDrawerOpen: true 
        });
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      // Fallback to empty structure on error
      set({ 
        selectedTrip: { Header: { TripID: '', TripOU: 0, TripStatus: '', TripStatusDescription: '' }, LegDetails: [], WarnningDetails: { HeaderWarningMsg: null } }, 
        isTripDrawerOpen: true 
      });
    }
  },

  closeTripDrawer: () => {
    set({ isTripDrawerOpen: false, selectedTrip: null });
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
      LegBehaviour: 'Pick',
      LegBehaviourDescription: 'Pick',
      TransportMode: 'Rail',
      LegStatus: null,
      TripInfo: null,
      ModeFlag: 'Nochange',
      ReasonForUpdate: null,
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
    const { selectedRoute } = get();
    if (!selectedRoute) return;

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

  addExecutionLeg: (legIndex: number) => {
    const { selectedTrip } = get();
    if (!selectedTrip) return;

    const newExecLeg: ExecutionLegDetail = {
      LegSequence: (selectedTrip.LegDetails[legIndex].ExecutionLegDetails?.length || 0) + 1,
      LegID: '',
      LegIDDescription: '',
      Departure: '',
      DepartureDescription: '',
      Arrival: '',
      ArrivalDescription: '',
      LegBehaviour: 'Pick',
      LegBehaviourDescription: 'Pick',
      ReasonForUpdate: null,
      Remarks: null,
      QuickCode1: null,
      QuickCodeValue1: null,
      ModeFlag: 'NoChange',
      WarningMsg: null,
      CustomerOrderDetails: []
    };

    const updatedLegDetails = [...selectedTrip.LegDetails];
    updatedLegDetails[legIndex] = {
      ...updatedLegDetails[legIndex],
      ExecutionLegDetails: [...updatedLegDetails[legIndex].ExecutionLegDetails, newExecLeg]
    };

    set({
      selectedTrip: {
        ...selectedTrip,
        LegDetails: updatedLegDetails
      }
    });
  },

  removeExecutionLeg: (legIndex: number, execLegIndex: number) => {
    const { selectedTrip } = get();
    if (!selectedTrip) return;

    const updatedLegDetails = [...selectedTrip.LegDetails];
    updatedLegDetails[legIndex] = {
      ...updatedLegDetails[legIndex],
      ExecutionLegDetails: updatedLegDetails[legIndex].ExecutionLegDetails.filter((_, i) => i !== execLegIndex)
    };

    set({
      selectedTrip: {
        ...selectedTrip,
        LegDetails: updatedLegDetails
      }
    });
  },

  updateExecutionLeg: (legIndex: number, execLegIndex: number, field: string, value: any) => {
    const { selectedTrip } = get();
    if (!selectedTrip) return;

    const updatedLegDetails = [...selectedTrip.LegDetails];
    const updatedExecLegs = [...updatedLegDetails[legIndex].ExecutionLegDetails];
    updatedExecLegs[execLegIndex] = {
      ...updatedExecLegs[execLegIndex],
      [field]: value
    };

    updatedLegDetails[legIndex] = {
      ...updatedLegDetails[legIndex],
      ExecutionLegDetails: updatedExecLegs
    };

    set({
      selectedTrip: {
        ...selectedTrip,
        LegDetails: updatedLegDetails
      }
    });
  },

  saveTripDetails: async () => {
    const { selectedTrip, openTripDrawer } = get();
    if (!selectedTrip) return;

    // Get the trip ID from the selected trip
    const tripId = selectedTrip.Header.TripID;

    // Refresh the drawer data by calling openTripDrawer
    if (tripId) {
      await openTripDrawer(tripId);

      // Also refresh the manageTripStore data
      const { fetchTrip } = manageTripStore.getState();
      if (fetchTrip) {
        await fetchTrip(tripId);
      }
    }
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