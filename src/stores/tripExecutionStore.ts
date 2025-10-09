import { create } from "zustand";

interface TripData {
  tripFormDetails: Record<string, any>;
  operationalDetails: Record<string, any>;
  billingDetails: Record<string, any>;
}

interface TripExecutionStore {
  tripStoreData: TripData;
  setTripFormDetails: (data: Record<string, any>) => void;
  setOperationalDetails: (data: Record<string, any>) => void;
  setBillingDetails: (data: Record<string, any>) => void;
  setSectionData: (section: keyof TripData, field: string, value: any) => void;
  getSectionData: (section: keyof TripData) => Record<string, any>;
  resetTrip: () => void;
}

const initialState: TripData = {
  tripFormDetails: {},
  operationalDetails: {},
  billingDetails: {},
};

export const useTripExecutionStore = create<TripExecutionStore>((set, get) => ({
  tripStoreData: initialState,

  setTripFormDetails: (data) =>
    set((state) => ({
      tripStoreData: {
        ...state.tripStoreData,
        tripFormDetails: data,
      },
    })),

  setOperationalDetails: (data) =>
    set((state) => ({
      tripStoreData: {
        ...state.tripStoreData,
        operationalDetails: data,
      },
    })),

  setBillingDetails: (data) =>
    set((state) => ({
      tripStoreData: {
        ...state.tripStoreData,
        billingDetails: data,
      },
    })),

  setSectionData: (section, field, value) =>
    set((state) => ({
      tripStoreData: {
        ...state.tripStoreData,
        [section]: {
          ...state.tripStoreData[section],
          [field]: value,
        },
      },
    })),

  getSectionData: (section) => get().tripStoreData[section],

  resetTrip: () => set({ tripStoreData: initialState }),
}));
