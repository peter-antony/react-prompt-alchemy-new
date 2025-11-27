// api/services/workOrderService.ts
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/config";

// ---- Types for selection payload ----
export interface WorkOrderSelectionPayload {
  context: {
    MessageID: string;
    MessageType: string;
    OUID: number;
    Role: string;
    UserID: string;
  };
  SearchCriteria: {
    WorkOrderNo: string;
    AdditionalFilter: {
      FilterName: string;
      FilterValue: string;
    }[];
  };
}

// ---- Types for parsed work order JSON ----
export interface WorkOrderDetail {
  Header: Record<string, any>;
  WorkorderSchedule: Record<string, any>;
  OperationDetails: any[];
}

// ---- Service return type ----
export interface WorkOrderSelectionResult {
  data: WorkOrderDetail | null;
  message: string;
  isSuccess: boolean;
}

export const workOrderService = {
  // This calls /workorder/hubselection and parses ResponseData into JSON
  searchWorkOrder: async (
    payload: WorkOrderSelectionPayload
  ): Promise<WorkOrderSelectionResult> => {
    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.LIST,
      requestBody
    );

    const raw = response.data;

    // Handle both shapes:
    // 1) { ResponseData, Message, IsSuccess }
    // 2) { data: { ResponseData, Message, IsSuccess }, message? }
    const responseDataString: string | undefined =
      raw?.ResponseData ?? raw?.data?.ResponseData;

    const message: string =
      raw?.Message ?? raw?.data?.Message ?? raw?.message ?? "";

    const isSuccess: boolean =
      raw?.IsSuccess ?? raw?.data?.IsSuccess ?? false;

    let parsed: WorkOrderDetail | null = null;

    if (responseDataString && typeof responseDataString === "string") {
      try {
        parsed = JSON.parse(responseDataString) as WorkOrderDetail;
      } catch (err) {
        console.error("Failed to parse WorkOrder ResponseData:", err);
        parsed = null;
      }
    }

    return {
      data: parsed,
      message,
      isSuccess,
    };
  },
};
