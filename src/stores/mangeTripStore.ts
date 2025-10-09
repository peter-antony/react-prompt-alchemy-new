import { create } from "zustand";
import {
  Header,
  Incident,
  LegDetail,
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
  addIncident?: (incident: Incident) => void;
  updateIncident?: (incidentId: string, updates: Partial<Incident>) => void;
  removeIncident?: (incidentId: string) => void;

  // API actions
  fetchTrip: (tripId: string) => Promise<void>;
  saveTrip?: () => void;
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
  updateHeaderField: (key, value, modeFlag = "Update") => {
    const current = get().tripData;
    if (!current) return;
    const updatedHeader = {
      ...current.Header,
      [key]: value,
      ModeFlag: modeFlag,
    };
    set({ tripData: { ...current, Header: updatedHeader } });
    console.log('------tripData: ', get().tripData);
  },
}));
