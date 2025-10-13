import { create } from 'zustand';

type DrawerType = 'resources' | 'vas' | 'incidents' | 'customer-orders' | 'supplier-billing' | 'trip-execution-create' | null;

interface DrawerStore {
  drawerType: DrawerType;
  isOpen: boolean;
  openDrawer: (type: DrawerType) => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<DrawerStore>((set) => ({
  drawerType: null,
  isOpen: false,
  openDrawer: (type) => set({ drawerType: type, isOpen: true }),
  closeDrawer: () => set({ isOpen: false, drawerType: null }),
}));
