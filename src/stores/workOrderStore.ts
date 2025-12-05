// stores/workOrderStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  workOrderService,
  WorkOrderSelectionPayload,
  WorkOrderDetail,
} from "@/api/services/workOrderService";
import { workerData } from "worker_threads";

interface WorkOrderState {
  workOrder: WorkOrderDetail | null;
  loading: boolean;
  error: string | null;
  apiMessage: string | null;
  isSuccess: boolean;
  searchWorkOrder: (payload: WorkOrderSelectionPayload) => Promise<void>;
  updateHeader: (key: string, value: any) => void;
  updateHeaderBulk: (payload: WorkOrderDetail) => void;
  saveWorkOrder: () => Promise<void>;  
  resetWorkOrderForm: () => Promise<void>;
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

      updateHeaderBulk: (payload) =>
  set((state) => ({
    workOrder: state.workOrder
      ? {
          ...state.workOrder,
          Header: {
            ...state.workOrder.Header,
            ...payload.Header,
          },
          WorkorderSchedule: {
            ...state.workOrder.WorkorderSchedule,
            ...payload.WorkorderSchedule,
          },
          OperationDetails: payload.OperationDetails,
        }
      : null,
  })),


      saveWorkOrder: async () => {
        set({ loading: true, error: null, apiMessage: null });

        const state = useWorkOrderStore.getState();
        const workOrder = state.workOrder;

        if (!workOrder) {
          set({ loading: false, error: "No Work Order found to save" });
          return;
        }

        const payload = {
          context: {
            UserID: "ramcouser",
            Role: "ramcorole",
            OUID: 4,
            MessageID: "12345",
            MessageType: "WorkOrder-Save",
          },
          RequestPayload: workOrder,
        };

        try {
          const result = await workOrderService.saveWorkOrder(payload);

          // save success
          const success = result?.IsSuccess ?? true;
          const message = result?.Message ?? "Save Completed";

          set({
            apiMessage: message,
            isSuccess: success,
            loading: false,
          });
       
          if (success) {
            // 1️⃣ RESET STORE
            set({ workOrder: null });

            // 2️⃣ CALL GET / SEARCH AGAIN (REFRESH)
            const refreshPayload = {
              context: {
                MessageID: "12345",
                MessageType: "WorkOrder-Save",
                OUID: 4,
                Role: "ramcorole",
                UserID: "ramcouser",
              },
              SearchCriteria: {
                WorkOrderNo: workOrder.Header.WorkorderNo,
                AdditionalFilter: [],
              },
            };

            await state.searchWorkOrder(refreshPayload);
          }
        } catch (err: any) {
          console.error("WorkOrder save failed:", err);
          set({
            loading: false,
            error: err?.message ?? "Save failed",
            isSuccess: false,
          });
        }
      },


       resetWorkOrderForm: () =>
  set(state => ({
    workOrder: state.workOrder
      ? {
          ...state.workOrder,
          Header: {},
          WorkorderSchedule: {},
          OperationDetails: [],
        }
      : null,
  })),

      //     saveWorkOrder: async () => {
      //   set({ loading: true, error: null, apiMessage: null });

      //   const state = useWorkOrderStore.getState();
      //   const workOrder = state.workOrder;

      //   if (!workOrder) {
      //     set({ loading: false, error: "No Work Order found to save" });
      //     return;
      //   }

      //   const payload = {
      //     context: {
      //       UserID: "ramcouser",
      //       Role: "ramcorole",
      //       OUID: 4,
      //       MessageID: "12345",
      //       MessageType: "WorkOrder-Save",
      //     },
      //     RequestPayload: workOrder,
      //   };

      //   try {
      //     const result = await workOrderService.saveWorkOrder(payload);

      //     set({
      //       loading: false,
      //       apiMessage: result?.Message ?? "Save Completed",
      //       isSuccess: result?.IsSuccess ?? true,
      //     });
      //   } catch (err: any) {
      //     console.error("WorkOrder save failed:", err);
      //     set({
      //       loading: false,
      //       error: err?.message ?? "Save failed",
      //       isSuccess: false,
      //     });
      //   }
      // },

      // updateHeaderField: (field, value) =>
      //   set((state) => ({
      //     workOrder: {
      //       ...state.workOrder!,
      //       Header: {
      //         ...state.workOrder!.Header,
      //         [field]: value,
      //         ModeFlag: "Update",
      //       },
      //     },
      //   })),
      updateHeader: (key: string, value: any) =>
        set((state) => {
          const updated = state.workOrder
            ? {
                ...state.workOrder,
                Header: {
                  ...state.workOrder.Header,
                  [key]: value,
                  ModeFlag: "Update",
                },
              }
            : state.workOrder;

          console.log("   updated Header:", updated?.Header);
          console.log("change", useWorkOrderStore.getState().workOrder);

          return { workOrder: updated };
        }),
    }),

    

    { name: "WorkOrderStore", trace: true }
  )
);
