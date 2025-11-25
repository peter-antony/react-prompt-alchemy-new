import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { workOrderService } from "@/api/services/workOrderService";
import { WorkOrderItem, WorkOrderSearchPayload } from "@/types/WorkOrderManagementTypes";

interface WorkOrderState {
  list: WorkOrderItem[];
  loading: boolean;
  error: string | null;
  message: string | null;
  searchWorkOrders: (payload: WorkOrderSearchPayload) => Promise<void>;
}

interface WorkOrderFormState {
  form: Record<string, any>;
  setField: (field: string, value: any) => void;
  resetForm: () => void;
  setFormObject: (data: Record<string, any>) => void;
}

export const useWorkOrderStore = create<WorkOrderState>()(
  devtools(
    (set) => ({
      list: [],
      loading: false,
      error: null,
      message: null,

      searchWorkOrders: async (payload) => {
        set({ loading: true, message: null, error: null });

        try {
          const data = await workOrderService.searchWorkOrders(payload);

          set({
            list: data,
            loading: false,
            message: "Work orders loaded successfully",
          });
        } catch (err: any) {
          set({
            error: err.message,
            loading: false,
            message: "Failed to load work orders",
          });
        }
      },
    }),
    { name: "WorkOrderStore", trace: true }
  )
);

export const useWorkOrderFormStore = create<WorkOrderFormState>()(
  devtools(
    (set) => ({
      form: {},

      setField: (field, value) =>
        set((state) => ({
          form: { ...state.form, [field]: value },
        })),

      setFormObject: (data) => set({ form: data }),

      resetForm: () => set({ form: {} }),
    }),
    { name: "WorkOrderFormStore" }
  )
);
