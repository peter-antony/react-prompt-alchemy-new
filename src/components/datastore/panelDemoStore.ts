import { create } from 'zustand';

interface PanelState {
  // Data for each panel
  basicDetailsData: Record<string, any>;
  operationalDetailsData: Record<string, any>;
  billingDetailsData: Record<string, any>;

  // Panel titles
  basicDetailsTitle: string;
  operationalDetailsTitle: string;
  billingDetailsTitle: string;

  // Panel widths
  basicDetailsWidth: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  operationalDetailsWidth: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  billingDetailsWidth: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

  // Panel visibility
  basicDetailsVisible: boolean;
  operationalDetailsVisible: boolean;
  billingDetailsVisible: boolean;

  // Actions
  setBasicDetailsData: (data: Record<string, any>) => void;
  setOperationalDetailsData: (data: Record<string, any>) => void;
  setBillingDetailsData: (data: Record<string, any>) => void;

  setBasicDetailsTitle: (title: string) => void;
  setOperationalDetailsTitle: (title: string) => void;
  setBillingDetailsTitle: (title: string) => void;

  setBasicDetailsWidth: (width: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12) => void;
  setOperationalDetailsWidth: (width: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12) => void;
  setBillingDetailsWidth: (width: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12) => void;

  setBasicDetailsVisible: (visible: boolean) => void;
  setOperationalDetailsVisible: (visible: boolean) => void;
  setBillingDetailsVisible: (visible: boolean) => void;

  setPanelVisibility: (panelId: string, visible: boolean) => void;
  updateFormValues: (basicDetails: Record<string, any>, operationalDetails: Record<string, any>, billingDetails: Record<string, any>) => void;

  reset: () => void;
}

const initialState = {
  basicDetailsData: {},
  operationalDetailsData: {},
  billingDetailsData: {},
  basicDetailsTitle: 'Basic Details',
  operationalDetailsTitle: 'Operational Details',
  billingDetailsTitle: 'Billing Details',
  basicDetailsWidth: 12 as const,
  operationalDetailsWidth: 6 as const,
  billingDetailsWidth: 6 as const,
  basicDetailsVisible: true,
  operationalDetailsVisible: true,
  billingDetailsVisible: true,
};

export const usePanelDemoStore = create<PanelState>((set) => ({
  ...initialState,

  setBasicDetailsData: (data) => set({ basicDetailsData: data }),
  setOperationalDetailsData: (data) => set({ operationalDetailsData: data }),
  setBillingDetailsData: (data) => set({ billingDetailsData: data }),

  setBasicDetailsTitle: (title) => set({ basicDetailsTitle: title }),
  setOperationalDetailsTitle: (title) => set({ operationalDetailsTitle: title }),
  setBillingDetailsTitle: (title) => set({ billingDetailsTitle: title }),

  setBasicDetailsWidth: (width) => set({ basicDetailsWidth: width }),
  setOperationalDetailsWidth: (width) => set({ operationalDetailsWidth: width }),
  setBillingDetailsWidth: (width) => set({ billingDetailsWidth: width }),

  setBasicDetailsVisible: (visible) => set({ basicDetailsVisible: visible }),
  setOperationalDetailsVisible: (visible) => set({ operationalDetailsVisible: visible }),
  setBillingDetailsVisible: (visible) => set({ billingDetailsVisible: visible }),

  setPanelVisibility: (panelId, visible) => {
    switch (panelId) {
      case 'basic-details':
        set({ basicDetailsVisible: visible });
        break;
      case 'operational-details':
        set({ operationalDetailsVisible: visible });
        break;
      case 'billing-details':
        set({ billingDetailsVisible: visible });
        break;
    }
  },

  updateFormValues: (basicDetails, operationalDetails, billingDetails) => {
    set({
      basicDetailsData: basicDetails,
      operationalDetailsData: operationalDetails,
      billingDetailsData: billingDetails,
    });
  },

  reset: () => set(initialState),
}));
