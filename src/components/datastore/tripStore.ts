import { create } from 'zustand';
import { tripService } from '@/api/services/tripService';
import { Trip } from '@/api/types';

interface TripState {
  tripList: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTrips: (params?: any) => Promise<void>;
  loadTripById: (id: string) => Promise<void>;
  saveTrip: (tripData: Partial<Trip>, id?: string) => Promise<void>;
  updateField: (field: keyof Trip, value: any) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  tripList: [],
  selectedTrip: null,
  loading: false,
  error: null,

  loadTrips: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await tripService.getTrips(params);
      set({ tripList: response.data, loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load trips', loading: false });
    }
  },

  loadTripById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await tripService.getTrip(id);
      set({ selectedTrip: response.data, loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load trip', loading: false });
    }
  },

  saveTrip: async (tripData: Partial<Trip>, id?: string) => {
    set({ loading: true, error: null });
    try {
      const response = id 
        ? await tripService.updateTrip(id, tripData)
        : await tripService.createTrip(tripData as any);
      
      set({ selectedTrip: response.data, loading: false });
      
      // Refresh trip list if needed
      if (get().tripList.length > 0) {
        get().loadTrips();
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to save trip', loading: false });
    }
  },

  updateField: (field: keyof Trip, value: any) => {
    set((state) => ({
      selectedTrip: state.selectedTrip 
        ? { ...state.selectedTrip, [field]: value }
        : null
    }));
  },

  reset: () => {
    set({ tripList: [], selectedTrip: null, loading: false, error: null });
  }
}));
