import { create } from 'zustand';
import { orderService } from '@/api/services/orderService';
import { Order } from '@/api/types';

interface OrderState {
  orderList: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadOrders: (params?: any) => Promise<void>;
  loadOrderById: (id: string) => Promise<void>;
  saveOrder: (orderData: Partial<Order>, id?: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateField: (field: keyof Order, value: any) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orderList: [],
  selectedOrder: null,
  loading: false,
  error: null,

  loadOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getOrders(params);
      set({ orderList: response.data, loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load orders', loading: false });
    }
  },

  loadOrderById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getOrder(id);
      set({ selectedOrder: response.data, loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load order', loading: false });
    }
  },

  saveOrder: async (orderData: Partial<Order>, id?: string) => {
    set({ loading: true, error: null });
    try {
      const response = id 
        ? await orderService.updateOrder(id, orderData)
        : await orderService.createOrder(orderData as any);
      
      set({ selectedOrder: response.data, loading: false });
      
      // Refresh order list if needed
      if (get().orderList.length > 0) {
        get().loadOrders();
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to save order', loading: false });
    }
  },

  deleteOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await orderService.deleteOrder(id);
      set({ 
        orderList: get().orderList.filter(order => order.id !== id),
        loading: false 
      });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to delete order', loading: false });
    }
  },

  updateField: (field: keyof Order, value: any) => {
    set((state) => ({
      selectedOrder: state.selectedOrder 
        ? { ...state.selectedOrder, [field]: value }
        : null
    }));
  },

  reset: () => {
    set({ orderList: [], selectedOrder: null, loading: false, error: null });
  }
}));
