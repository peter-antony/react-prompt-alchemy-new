import { create } from 'zustand';

interface TrainParametersAlertStore {
  hasAlert: boolean;
  colorClass: string; // tailwind class for dot color
  setAlert: (hasAlert: boolean, colorClass?: string) => void;
  clearAlert: () => void;
}

export const useTrainParametersAlertStore = create<TrainParametersAlertStore>((set) => ({
  hasAlert: true,
  colorClass: 'bg-amber-600',
  setAlert: (hasAlert, colorClass) =>
    set((state) => ({ hasAlert, colorClass: colorClass ?? state.colorClass })),
  clearAlert: () => set({ hasAlert: false }),
}));