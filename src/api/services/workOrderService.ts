// api/services/workOrderService.ts
import { apiClient } from "@/api/client";
import { API_ENDPOINTS, getUserContext } from "@/api/config";

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
  getUserContext: () => {
    try {
      const selectedContext = localStorage.getItem('selectedUserContext');
      
      if (selectedContext) {
        const parsedContext = JSON.parse(selectedContext);      
        return {
          ouId: parsedContext.ouId || 4,
          roleName: parsedContext.roleName || "RAMCOROLE",
          ouDescription: parsedContext.ouDescription || "",
          userInfo: parsedContext
        };
      }
    } catch (error) {
      console.error('Error retrieving user context from localStorage:', error);
    }
    
    // Default values if nothing is stored
    const defaultContext = {
      ouId: 4, 
      roleName: "RAMCOROLE",
      ouDescription: "Default OU"
    };
    
    return defaultContext;
  },

  // This calls /workorder/hubselection and parses ResponseData into JSON
  searchWorkOrder: async (
    payload: WorkOrderSelectionPayload
  ): Promise<WorkOrderSelectionResult> => {
    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.SELECTION,
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
  
  // Work Order Hub Search API, fetching grid data
  getWorkOrdersForHub: async (params?: any): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Work order Hub Search",
      },
      SearchCriteria: params?.searchCriteria,
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.SELECTION,
      requestBody
    );
    return response.data;
  },
};
