// stores/workOrderStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  workOrderService,
  WorkOrderSelectionPayload,
  WorkOrderDetail,
} from "@/api/services/workOrderService";
import { workerData } from "worker_threads";
import { toast } from '@/hooks/use-toast';

interface WorkOrderState {
  workOrder: WorkOrderDetail | null;
  loading: boolean;
  error: string | null;
  apiMessage: string | null;
  isSuccess: boolean;
  searchWorkOrder: (workOrderNo: string | null) => Promise<void>;
  updateHeader: (key: string, value: any) => void;
  updateHeaderBulk: (payload: WorkOrderDetail) => void;
  saveWorkOrder: () => Promise<{ success: boolean; message: string; workorderNo?: string }>;

  resetWorkOrderForm: () => Promise<void>;
  resetStatus: () => void;

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
     searchWorkOrder: async (workOrderNo) => {
  set({ loading: true, error: null, apiMessage: null, isSuccess: false });

  const result = await workOrderService.searchWorkOrder(workOrderNo);
  {console.log(result , "result")}
  set({
    workOrder: result.data,
    loading: false,
    apiMessage: result.message,
    isSuccess: result.isSuccess,
  });
},


     updateHeaderBulk: (payload) =>{
      console.log("123",payload.Header?.Hazardous),
      console.log(payload),
  set((state) => ({
    workOrder: state.workOrder
      ? {
          ...state.workOrder,
          Header: {
            ...state.workOrder.Header,
            ...payload.Header,
            Hazardous:
              payload.Header?.Hazardous == true
                ? '1'
                : '0',
          },
          WorkorderSchedule: {
            ...state.workOrder.WorkorderSchedule,
            ...payload.WorkorderSchedule,
          },
          OperationDetails: payload.OperationDetails,
        }
      : null,
  }))},



      // saveWorkOrder: async () => {
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

      //     // save success
      //     const success = result?.IsSuccess ?? true;
      //     const message = result?.Message ?? "Save Completed";

      //     set({
      //       apiMessage: message,
      //       isSuccess: success,
      //       loading: false,
      //     });
       
      //     if (success) {
      //       // 1️⃣ RESET STORE
      //       set({ workOrder: null });

      //       // 2️⃣ CALL GET / SEARCH AGAIN (REFRESH)
      //       const refreshPayload = {
      //         context: {
      //           MessageID: "12345",
      //           MessageType: "WorkOrder-Save",
      //           OUID: 4,
      //           Role: "ramcorole",
      //           UserID: "ramcouser",
      //         },
      //         SearchCriteria: {
      //           WorkOrderNo: workOrder.Header.WorkorderNo,
      //           AdditionalFilter: [],
      //         },
      //       };

      //       // await state.searchWorkOrder(refreshPayload);
      //     }
      //   } catch (err: any) {
      //     console.error("WorkOrder save failed:", err);
      //     set({
      //       loading: false,
      //       error: err?.message ?? "Save failed",
      //       isSuccess: false,
      //     });
      //   }
      // },


saveWorkOrder: async () => {
  set({ loading: true, error: null, apiMessage: null });

  const workOrder = useWorkOrderStore.getState().workOrder;
  try {
    const result = await workOrderService.saveWorkOrder(workOrder);
    console.log("result ===========", result);
    // 🔥 Correct handling of backend validation
    const success = result && result.IsSuccess === true; 
    const message = result?.Message ?? "Unknown response";

    const parsedResponse = JSON.parse(result?.data.ResponseData || "{}");
    const resourceStatus = (result as any)?.data?.IsSuccess;
    console.log("parsedResponse ===", parsedResponse);
    
    // Extract workorderNo from the response
    const workorderNo = parsedResponse?.Header?.WorkorderNo || null;
    console.log("workorderNo=======", workorderNo);
    if (resourceStatus) {
      toast({
        title: "✅ Work Order Created Successfully",
        description: (result as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
        variant: "default",
      });
    } else {
      console.log("error as any ===", (result as any)?.data?.Message);
      toast({
        title: "⚠️ Save Failed",
        description: (result as any)?.data?.Message || "Failed to save changes.",
        variant: "destructive",
      });

    }

    set({
      apiMessage: message,
      isSuccess: success,
      loading: false,
    });

    if (success) {
      set({ workOrder: null });
    }

    return { success, message, workorderNo: workorderNo || undefined };
  } catch (err: any) {
    const message = err?.message ?? "Save failed";
    set({
      loading: false,
      error: message,
      isSuccess: false,
    });

    return { success: false, message };
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

     resetStatus: () =>
  set({
    loading: false,
    error: null,
    apiMessage: null,
    isSuccess: null,
  }),

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
