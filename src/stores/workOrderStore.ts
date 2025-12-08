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


saveWorkOrder: async () => {
  set({ loading: true, error: null, apiMessage: null });

  const workOrder = useWorkOrderStore.getState().workOrder;
  try {
    // Call both APIs sequentially - first saveWorkOrder, then saveWorkOrderBillingDetails
     const billingPayload = {

    Header: {
      WorkorderNo: workOrder?.Header?.WorkorderNo,
      Status: workOrder?.Header?.Status,
      BillStatus: "Fresh",   // static required
      EquipmentType: workOrder?.Header?.EquipmentType,
      EquipmentID: workOrder?.Header?.EquipmentID,
      EquipmentDescription: workOrder?.Header?.EquipmentDescription,
      BillingHeaderDetails: {
        IsAcceptedByForwardis:
          workOrder?.Header?.BillingHeaderDetails?.IsAcceptedByForwardis == "1" ? 1 : 0,
        IsReinvoiceCost:
          workOrder?.Header?.BillingHeaderDetails?.IsReinvoiceCost == "1" ? 1 : 0,
        InvoiceTo: workOrder?.Header?.BillingHeaderDetails?.InvoiceTo,
        FinancialComments: workOrder?.Header?.BillingHeaderDetails?.FinancialComments,
        TotalNetAmount: 0,
        FullLeasingContract: 0,
        DryLeasingContract: 0,
        ModeFlag: workOrder?.Header?.BillingHeaderDetails?.ModeFlag
      }
    
  }
};
    const result = await workOrderService.saveWorkOrder(workOrder);
    console.log("result ===========", result);
   

    console.log("workorder123", billingPayload)
    
    // Call the billing details save API with the same payload
    const billingResult = await workOrderService.saveWorkOrderBillingDetails(billingPayload);
    console.log("billing result ===========", billingResult);
    
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
      
      // Call hubSelection API after successful save if workorderNo exists
      if (workorderNo) {
        // Get the searchWorkOrder function from the store
        const state = useWorkOrderStore.getState();
        // Call searchWorkOrder to fetch the updated work order data
        await state.searchWorkOrder(workorderNo);
      }
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
