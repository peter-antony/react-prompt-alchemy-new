import { create } from 'zustand';

type DrawerType = 'resources' | 'vas' | 'vas-trip' | 'incidents' | 'customer-orders' | 'supplier-billing' | 'trip-execution-create' | 'linked-transactions' | 'train-parameters' | 'transport-route' | 'leg-and-events' | null;

interface DrawerStore {
  drawerType: DrawerType;
  isOpen: boolean;
  drawerData: any; // Data to pass to drawer
  openDrawer: (type: DrawerType, data?: any) => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<DrawerStore>((set) => ({
  drawerType: null,
  isOpen: false,
  drawerData: null,
  openDrawer: (type, data) => set({ drawerType: type, isOpen: true, drawerData: data || null }),
  closeDrawer: () => set({ isOpen: false, drawerType: null, drawerData: null }),
}));
