import { create } from 'zustand';

export interface DemoData {
  // Basic Details
  tripPlanNo?: string;
  customer?: string;
  customerName?: string;
  contractType?: string;
  description?: string;
  priority?: string;
  category?: string;
  
  // Operational Details
  plannedStartDate?: string;
  plannedStartTime?: string;
  plannedEndDate?: string;
  plannedEndTime?: string;
  departurePoint?: string;
  arrivalPoint?: string;
  distance?: string;
  trainType?: string;
  
  // Billing Details
  totalAmount?: string;
  taxAmount?: string;
  discountAmount?: string;
  billingStatus?: string;
  paymentTerms?: string;
  invoiceDate?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  mandatoryFieldsEmpty: string[];
}

interface DemoState {
  demoData: DemoData;
  loading: boolean;
  error: string | null;
  validationResults: Record<string, ValidationResult>;
  activeTab: string;
  
  // Panel visibility
  basicDetailsVisible: boolean;
  operationalDetailsVisible: boolean;
  billingDetailsVisible: boolean;
  
  // Actions
  updateField: (field: keyof DemoData, value: any) => void;
  updateMultipleFields: (updates: Partial<DemoData>) => void;
  setValidationResults: (results: Record<string, ValidationResult>) => void;
  setActiveTab: (tabId: string) => void;
  setPanelVisibility: (panelId: string, visible: boolean) => void;
  loadDemoData: (id?: string) => Promise<void>;
  saveDemoData: () => Promise<void>;
  reset: () => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  demoData: {
    tripPlanNo: 'TRIP00000001',
  },
  loading: false,
  error: null,
  validationResults: {},
  activeTab: 'template',
  basicDetailsVisible: true,
  operationalDetailsVisible: true,
  billingDetailsVisible: false,

  updateField: (field, value) => {
    set((state) => ({
      demoData: { ...state.demoData, [field]: value }
    }));
  },

  updateMultipleFields: (updates) => {
    set((state) => ({
      demoData: { ...state.demoData, ...updates }
    }));
  },

  setValidationResults: (results) => {
    set({ validationResults: results });
  },

  setActiveTab: (tabId) => {
    set({ activeTab: tabId });
    
    // Update panel visibility based on active tab
    switch (tabId) {
      case 'template':
        set({
          basicDetailsVisible: true,
          operationalDetailsVisible: true,
          billingDetailsVisible: false,
        });
        break;
      case 'cim-report':
        set({
          basicDetailsVisible: true,
          operationalDetailsVisible: false,
          billingDetailsVisible: true,
        });
        break;
      case 'general':
        set({
          basicDetailsVisible: true,
          operationalDetailsVisible: true,
          billingDetailsVisible: true,
        });
        break;
      case 'declarations':
        set({
          basicDetailsVisible: false,
          operationalDetailsVisible: true,
          billingDetailsVisible: true,
        });
        break;
      case 'route':
        set({
          basicDetailsVisible: false,
          operationalDetailsVisible: true,
          billingDetailsVisible: false,
        });
        break;
      case 'wagon-info':
        set({
          basicDetailsVisible: true,
          operationalDetailsVisible: false,
          billingDetailsVisible: false,
        });
        break;
      default:
        set({
          basicDetailsVisible: true,
          operationalDetailsVisible: true,
          billingDetailsVisible: true,
        });
    }
  },

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

  loadDemoData: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage if available
      const stored = localStorage.getItem(`demo-data-${id || 'default'}`);
      if (stored) {
        set({ demoData: JSON.parse(stored), loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load demo data', loading: false });
    }
  },

  saveDemoData: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { demoData } = get();
      // Save to localStorage
      localStorage.setItem('demo-data-default', JSON.stringify(demoData));
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to save demo data', loading: false });
    }
  },

  reset: () => {
    set({
      demoData: { tripPlanNo: 'TRIP00000001' },
      loading: false,
      error: null,
      validationResults: {},
      activeTab: 'template',
      basicDetailsVisible: true,
      operationalDetailsVisible: true,
      billingDetailsVisible: false,
    });
  }
}));
