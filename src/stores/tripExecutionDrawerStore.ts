import { create } from 'zustand';
import { manageTripStore } from '@/stores/mangeTripStore';

export interface Activity {
  id: string;
  category: string;
  subCategory: string;
  PlannedDate: string;
  PlannedTime: string;
  actualDate?: string;
  actualTime?: string;
  location: string;
  status: 'pending' | 'completed' | 'in-progress';
  remarks?: string;
  CustomerName?: string;
  CustomerID?: string;
  SeqNo?: number,
  Activity?: string,
  ActivityDescription?: string,
  ConsignmentInformation?: string,
  CustomerOrder?: string,
  RevisedDate?: string,
  RevisedTime?: string,
  ActualDate?: string,
  ActualTime?: string,
  DelayedIn?: string,
  QuickCode1?: string,
  QuickCode2?: string,
  QuickCode3?: string,
  QuickCodeValue1?: string,
  QuickCodeValue2?: string,
  QuickCodeValue3?: string,
  Remarks1?: string,
  Remarks2?: string,
  Remarks3?: string,
  EventProfile?: string,
  ReasonForChanges?: string,
  DelayedReason?: string,
  LastIdentifiedLocation?: string,
  LastIdentifiedDate?: string,
  LastIdentifiedTime?: string,
  AmendmentNo?: string,

}

export interface Consignment {
  id: string;
  consignmentNo: string;
  packages: number;
  weight: number;
  volume: number;
  commodity: string;
  status: string;
  Planned?: any[];
  Actual?: any[];
}

export interface Transshipment {
  id: string;
  fromVehicle: string;
  toVehicle: string;
  location: string;
  plannedDate: string;
  plannedTime: string;
  status: string;
}

export interface Leg {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  hasInfo?: boolean;
  activities: Activity[];
  consignments: Consignment[];
  transshipments: Transshipment[];
  LegSequence?: string;
}

interface TripExecutionDrawerStore {
  legs: Leg[];
  selectedLegId: string | null;
  addLeg: (from: string, to: string, viaLocation: string, plannedDate: string, plannedTime: string) => void;
  removeLeg: (legId: string) => void;
  selectLeg: (legId: string) => void;
  getSelectedLeg: () => Leg | null;
  updateActivity: (legId: string, activity: Activity) => void;
  updateConsignment: (legId: string, consignment: Consignment) => void;
  updateTransshipment: (legId: string, transshipment: Transshipment) => void;
  loadLegsFromAPI: () => void;
  getLegsFromAPI: () => Leg[];
  getConsignments: (selectedLegId: any) => Consignment[];
}

const generateMockData = (legNumber: number, from: string, to: string) => {
  const activities: Activity[] = [
    {
      id: `act-${legNumber}-1`,
      category: 'Loading',
      subCategory: 'Container Loading',
      PlannedDate: '2024-03-15',
      PlannedTime: '09:00',
      location: from,
      status: 'pending' as const,
    },
    {
      id: `act-${legNumber}-2`,
      category: 'Unloading',
      subCategory: 'Container Unloading',
      PlannedDate: '2024-03-15',
      PlannedTime: '14:00',
      location: to,
      status: 'pending' as const,
    },
  ];

  const consignments: Consignment[] = [
    {
      id: `cons-${legNumber}-1`,
      consignmentNo: `CN${legNumber}001`,
      packages: 10 + legNumber,
      weight: 500 + (legNumber * 100),
      volume: 50 + (legNumber * 10),
      commodity: 'General Cargo',
      status: 'Loaded',
    },
  ];

  const transshipments: Transshipment[] = [
    {
      id: `trans-${legNumber}-1`,
      fromVehicle: `TRK-00${legNumber}`,
      toVehicle: `TRK-00${legNumber + 1}`,
      location: to,
      plannedDate: '2024-03-15',
      plannedTime: '15:00',
      status: 'Planned',
    },
  ];

  return { activities, consignments, transshipments };
};

// Function to transform API leg details to store format
const transformApiLegToStoreFormat = (apiLeg: any, index: number): Leg => {
  return {
    id: apiLeg.LegSequence || `leg-${index + 1}`,
    from: apiLeg.DeparturePoint || '',
    to: apiLeg.ArrivalPoint || '',
    distance: '-- km', // You can calculate this or get from API
    duration: '-- hours', // You can calculate this or get from API
    hasInfo: true,
    activities: apiLeg.Activities || [],
    consignments: apiLeg.Consignment || [],
    transshipments: [] // Transshipments might not be in API, so empty for now
  };
};

export const useTripExecutionDrawerStore = create<TripExecutionDrawerStore>((set, get) => ({
  legs: [],
  selectedLegId: null,

  addLeg: (from, to, viaLocation, plannedDate, plannedTime) => {
    const legs = get().legs;
    const newLegNumber = legs.length + 1;
    const newLegId = `${newLegNumber}`;
    
    const newLeg: Leg = {
      id: newLegId,
      from: from || viaLocation,
      to: to || viaLocation,
      distance: '-- km',
      duration: '-- hours',
      hasInfo: false,
      ...generateMockData(newLegNumber, from || viaLocation, to || viaLocation),
    };

    set({ legs: [...legs, newLeg], selectedLegId: newLegId });
  },

  removeLeg: (legId) => {
    const legs = get().legs.filter(leg => leg.id !== legId);
    const selectedLegId = get().selectedLegId;
    
    set({
      legs,
      selectedLegId: selectedLegId === legId ? (legs[0]?.id || null) : selectedLegId,
    });
  },

  selectLeg: (legId) => set({ selectedLegId: legId }),

  getSelectedLeg: () => {
    const { legs, selectedLegId } = get();
    return legs.find(leg => leg.id === selectedLegId) || null;
  },

  updateActivity: (legId, activity) => {
    set(state => ({
      legs: state.legs.map(leg => 
        leg.id === legId
          ? {
              ...leg,
              activities: leg.activities.some(a => a.id === activity.id)
                ? leg.activities.map(a => a.id === activity.id ? activity : a)
                : [...leg.activities, activity]
            }
          : leg
      ),
    }));
  },

  updateConsignment: (legId, consignment) => {
    set(state => ({
      legs: state.legs.map(leg =>
        leg.id === legId
          ? {
              ...leg,
              consignments: leg.consignments.some(c => c.id === consignment.id)
                ? leg.consignments.map(c => c.id === consignment.id ? consignment : c)
                : [...leg.consignments, consignment]
            }
          : leg
      ),
    }));
  },

  updateTransshipment: (legId, transshipment) => {
    set(state => ({
      legs: state.legs.map(leg =>
        leg.id === legId
          ? {
              ...leg,
              transshipments: leg.transshipments.some(t => t.id === transshipment.id)
                ? leg.transshipments.map(t => t.id === transshipment.id ? transshipment : t)
                : [...leg.transshipments, transshipment]
            }
          : leg
      ),
    }));
  },

  loadLegsFromAPI: () => {
    try {
      const apiLegDetails = manageTripStore.getState().getLegDetails();
      console.log("Loading legs from API:", apiLegDetails);
      
      if (apiLegDetails && apiLegDetails.length > 0) {
        const transformedLegs = apiLegDetails.map((apiLeg: any, index: number) => 
          transformApiLegToStoreFormat(apiLeg, index)
        );
        
        set({ 
          legs: transformedLegs,
          selectedLegId: transformedLegs.length > 0 ? transformedLegs[0].id : null
        });
      } else {
        set({ legs: [], selectedLegId: null });
      }
    } catch (error) {
      console.error("Error loading legs from API:", error);
      set({ legs: [], selectedLegId: null });
    }
  },

  getLegsFromAPI: () => {
    try {
      const apiLegDetails = manageTripStore.getState().getLegDetails();
      if (apiLegDetails && apiLegDetails.length > 0) {
        return apiLegDetails.map((apiLeg: any, index: number) => 
          transformApiLegToStoreFormat(apiLeg, index)
        );
      }
      return [];
    } catch (error) {
      console.error("Error getting legs from API:", error);
      return [];
    }
  },
  getConsignments: (selectedLegId: any) => {
    try {
      const consignments = get().legs.filter(leg => leg.id === selectedLegId);
      if (consignments && consignments.length > 0) {
        return consignments.flatMap((leg: any) => leg.consignments || []);
      }
      return [];
    } catch (error) {
      console.error("Error getting consignments from API:", error);
      return [];
    }
  },
}));
