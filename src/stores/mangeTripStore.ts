import { create } from "zustand";
import {
  Header,
  Incident,
  LegDetail,
  LegActivity,
  ModeFlag,
  TripData,
} from "@/types/manageTripTypes";
import { tripService } from "@/api/services/tripService";

interface TripState {
  tripData: TripData | null;
  loading: boolean;
  error: string | null;

  // CRUD actions
  setTrip?: (data: TripData) => void;
  updateHeader?: (updates: Partial<Header>, modeFlag?: ModeFlag) => void;
  updateHeaderField: (
    key: keyof Header,
    value: any,
    modeFlag?: ModeFlag
  ) => void;
  addLeg?: (leg: LegDetail) => void;
  updateLeg?: (legId: string, updates: Partial<LegDetail>) => void;
  removeLeg?: (legId: string) => void;
  updateActivity?: (legIndex: number, activityIndex: number, updates: Partial<LegActivity>) => void;
  addIncident?: (incident: Incident) => void;
  updateIncident?: (incidentId: string, updates: Partial<Incident>) => void;
  removeIncident?: (incidentId: string) => void;

  // API actions
  fetchTrip: (tripId: string) => Promise<void>;
  saveTrip?: () => void;
  confirmTrip?: () => void;

  // Getters
  getLegDetails: () => LegDetail[];
}

export const manageTripStore = create<TripState>((set, get) => ({
  tripData: null,
  loading: false,
  error: null,

  setTrip: (trip: any) => {
    set({ tripData: trip });
  },

  fetchTrip: async (tripNo: string) => {
    set({ loading: true, error: null });
    try {
      // call your API service - adapt to your service's signature
      const res: any = await tripService.getTripById({ id: tripNo });
      // your API returns ResponseData JSON string — parse carefully
      const parsed = res?.data?.ResponseData
        ? JSON.parse(res.data.ResponseData)
        : res?.data || [];
      // parsed structure expected to be full TripResponse
      set({ tripData: parsed, loading: false, error: null });
    } catch (err: any) {
      console.error("fetchTrip failed", err);
      set({ error: err?.message ?? "Fetch failed", loading: false });
    }
  },
  updateHeaderField: (key, value, action) =>
    set((state) => ({
      tripData: {
        ...(state.tripData || { Header: {} }), // Ensure tripData exists, provide default Header
        Header: {
          ...(state.tripData?.Header || {}), // Ensure Header exists
          [key]: value, // Update the specific field immutably
          ModeFlag: action,
        },
      },
    })),

  // Get LegDetails list
  getLegDetails: () => {
    const state = get();
    return state.tripData?.LegDetails || [];
  },

  // Update Activity based on LegDetails index and Activity index
  updateActivity: (legIndex: number, activityIndex: number, updates: Partial<LegActivity>) => {
    set((state) => {
      if (!state.tripData?.LegDetails) {
        console.warn("No LegDetails found in tripData");
        return state;
      }

      const legDetails = [...state.tripData.LegDetails];
      
      // Validate legIndex
      if (legIndex < 0 || legIndex >= legDetails.length) {
        console.warn(`Invalid legIndex: ${legIndex}. LegDetails length: ${legDetails.length}`);
        return state;
      }

      const leg = { ...legDetails[legIndex] };
      
      // Ensure Activities array exists
      if (!leg.Activities) {
        leg.Activities = [];
      }

      // Validate activityIndex
      if (activityIndex < 0 || activityIndex >= leg.Activities.length) {
        console.warn(`Invalid activityIndex: ${activityIndex}. Activities length: ${leg.Activities.length}`);
        return state;
      }

      // Update the specific activity
      const activities = [...leg.Activities];
      activities[activityIndex] = {
        ...activities[activityIndex],
        ...updates,
        ModeFlag: "Update" as ModeFlag, // Set ModeFlag to Update if not specified
      };

      leg.Activities = activities;
      legDetails[legIndex] = leg;

      return {
        tripData: {
          ...state.tripData,
          LegDetails: legDetails,
        },
      };
    });
  },

  // save trip action
  saveTrip: async () => {
    const state = get();
    if (!state.tripData) {
      console.error("No trip data to save");
      return;
    }
    const response = await tripService.saveTrip(state.tripData);
    console.log("Trip saved response:", response);
    return response;
  },

  // Confirm trip action
  confirmTrip: async () => {
    const state = get();
    if (!state.tripData) {
      console.error("No trip data to confirm");
      return;
    }
    const response = await tripService.confirmTrip(state.tripData);
    console.log("Trip confirm response:", response);
    return response;
  },
}));
