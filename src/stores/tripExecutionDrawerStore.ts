import { create } from 'zustand';

export interface Activity {
  id: string;
  category: string;
  subCategory: string;
  plannedDate: string;
  plannedTime: string;
  actualDate?: string;
  actualTime?: string;
  location: string;
  status: 'pending' | 'completed' | 'in-progress';
  remarks?: string;
}

export interface Consignment {
  id: string;
  consignmentNo: string;
  packages: number;
  weight: number;
  volume: number;
  commodity: string;
  status: string;
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
}

const generateMockData = (legNumber: number, from: string, to: string) => {
  const activities: Activity[] = [
    {
      id: `act-${legNumber}-1`,
      category: 'Loading',
      subCategory: 'Container Loading',
      plannedDate: '2024-03-15',
      plannedTime: '09:00',
      location: from,
      status: 'pending' as const,
    },
    {
      id: `act-${legNumber}-2`,
      category: 'Unloading',
      subCategory: 'Container Unloading',
      plannedDate: '2024-03-15',
      plannedTime: '14:00',
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

export const useTripExecutionDrawerStore = create<TripExecutionDrawerStore>((set, get) => ({
  legs: [
    {
      id: 'leg-1',
      from: 'Mumbai Port',
      to: 'Delhi ICD',
      distance: '1,420 km',
      duration: '2 days',
      hasInfo: true,
      ...generateMockData(1, 'Mumbai Port', 'Delhi ICD'),
    },
    {
      id: 'leg-2',
      from: 'Delhi ICD',
      to: 'Ludhiana Warehouse',
      distance: '320 km',
      duration: '8 hours',
      ...generateMockData(2, 'Delhi ICD', 'Ludhiana Warehouse'),
    },
    {
      id: 'leg-3',
      from: 'Ludhiana Warehouse',
      to: 'Chandigarh DC',
      distance: '120 km',
      duration: '3 hours',
      hasInfo: true,
      ...generateMockData(3, 'Ludhiana Warehouse', 'Chandigarh DC'),
    },
  ],
  selectedLegId: 'leg-1',

  addLeg: (from, to, viaLocation, plannedDate, plannedTime) => {
    const legs = get().legs;
    const newLegNumber = legs.length + 1;
    const newLegId = `leg-${newLegNumber}`;
    
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
}));
