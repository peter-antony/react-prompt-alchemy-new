// stores/workOrderStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  workOrderService,
  WorkOrderSelectionPayload,
  WorkOrderDetail,
} from "@/api/services/workOrderService";

interface WorkOrderState {
  workOrder: WorkOrderDetail | null;
  loading: boolean;
  error: string | null;
  apiMessage: string | null;
  isSuccess: boolean;
  searchWorkOrder: (payload: WorkOrderSelectionPayload) => Promise<void>;
  updateHeaderField: (field: string, value: any) => void;
  updateBillingField: (field: string, value: any) => void;
}

export const useWorkOrderStore = create<WorkOrderState>()(
  devtools(
    (set) => ({
      workOrder: null,
      loading: false,
      error: null,
      apiMessage: null,
      isSuccess: false,

      /** 🔍 Fetch Work Order */
      searchWorkOrder: async (payload) => {
        set({ loading: true, error: null, apiMessage: null, isSuccess: false });

        try {
          const result = await workOrderService.searchWorkOrder(payload);

          set({
            workOrder: result.data,
            loading: false,
            apiMessage: result.message,
            isSuccess: result.isSuccess,
          });
        } catch (err: any) {
          console.error("WorkOrder search failed:", err);
          set({
            loading: false,
            error: err?.message ?? "Failed to load Work Order",
            apiMessage: null,
            isSuccess: false,
          });
        }
      },
      updateHeaderField: (field, value) =>
        set((state) => ({
          workOrder: {
            ...state.workOrder!,
            Header: {
              ...state.workOrder!.Header,
              [field]: value,
              ModeFlag: "Update",
            },
          },
        })),

      updateBillingField: (field, value) =>
        set((state) => ({
          workOrder: {
            ...state.workOrder!,
            Header: {
              ...state.workOrder!.Header,
              BillingHeaderDetails: {
                ...state.workOrder!.Header.BillingHeaderDetails,
                [field]: value,
              },
              ModeFlag: "Update",
            },
          },
        })),
    }),
    { name: "WorkOrderStore", trace: true }
  )
);
