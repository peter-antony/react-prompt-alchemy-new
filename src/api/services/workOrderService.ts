// api/services/workOrderService.ts
import { apiClient } from "@/api/client";
import { API_ENDPOINTS, getUserContext } from "@/api/config";
import { ApiResponse } from "../types";

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
  workOrderNo: string | null
): Promise<WorkOrderSelectionResult> => {

  if (!workOrderNo) {
    return { data: null, message: "", isSuccess: false };
  }

  const userContext = getUserContext();

  const payload = {
    context: {
      MessageID: "12345",
      MessageType: "Work Order Selection",
      OUID: userContext.ouId,
      Role: userContext.roleName,
      UserID: "ramcouser",
    },
    SearchCriteria: {
      WorkOrderNo: workOrderNo,
      AdditionalFilter: [
        {
          FilterName: "ServiceType",
          FilterValue: "Standard",
        },
      ],
    },
  };

  const requestBody = {
    RequestData: JSON.stringify(payload),
  };

  const response = await apiClient.post(
    API_ENDPOINTS.WORK_ORDER.SELECTION,
    requestBody
  );

  const raw = response.data;
  const responseDataString = raw?.ResponseData ?? raw?.data?.ResponseData;
  const message = raw?.Message ?? raw?.data?.Message ?? raw?.message ?? "";
  const isSuccess = raw?.IsSuccess ?? raw?.data?.IsSuccess ?? false;

  let parsed: WorkOrderDetail | null = null;
  if (responseDataString && typeof responseDataString === "string") {
    try {
      parsed = JSON.parse(responseDataString);
    } catch (err) {
      console.error("❌ Failed to parse WorkOrder ResponseData:", err);
    }
  }

  return {
    data: parsed,
    message,
    isSuccess,
  };
},


 saveWorkOrder: async (workOrder: any): Promise<any> => {
  const userContext = getUserContext();

  const payload = {
    context: {
      UserID: "ramcouser",
      Role: userContext.roleName,
      OUID: userContext.ouId,
      MessageID: "12345",
      MessageType: "WorkOrder-Save",
    },
    RequestPayload: workOrder,
  };

  const requestBody = {
    RequestData: JSON.stringify(payload),
  };

  const response = await apiClient.post(
    API_ENDPOINTS.WORK_ORDER.SAVE,
    requestBody
  );

  return response.data;
},

  // Save Work Order Billing Details
  saveWorkOrderBillingDetails: async (workOrder: any): Promise<any> => {
    const userContext = getUserContext();

    const payload = {
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "WorkOrder-Save Billing Details",
      },
      RequestPayload: workOrder,
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.SAVE_BILLING_DETAILS,
      requestBody
    );

    return response.data;
  },

  // Create Trip - Tug Operation Creation
  createTugOperation: async (payload: any): Promise<any> => {
    const userContext = getUserContext();

    const requestPayload = {
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "Create Trip - Tug Operation Creation",
      },
      RequestPayload: payload,
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
      requestBody
    );

    return response.data;
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
      API_ENDPOINTS.WORK_ORDER.LIST,
      requestBody
    );
    return response.data;
  },

  // Get billing details for work order
  getBillingDetails: async (
    workOrderNo: string
  ): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "WorkOrder-Get Billing Details"
      },
      SearchCriteria: {
        WorkOrderNo: workOrderNo
      }
    });

    const requestBody = {
      RequestData: requestPayload,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.GET_BILLING_DETAILS,
      requestBody
    );
    return response.data;
  },

  // Save Work Order Billing Details
saveBillingDetails: async (payload: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();

    const requestPayload = {
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "WorkOrder-Save Billing Details",
      },
      RequestPayload: payload,
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.SAVE_BILLING_DETAILS,
      requestBody
    );
    return response.data;
  },

  // Supplier billing confirm
  supplierBillingConfirm: async (payload: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = {
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "WorkOrder-Supplier Billing Confrim"
      },
      RequestPayload: payload
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.SUPPLIER_BILLING_CONFIRM,
      requestBody
    );
    return response.data;
  },

  // Supplier billing amend
  supplierBillingAmend: async (payload: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = {
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "WorkOrder-Supplier Billing Amend"
      },
      RequestPayload: payload
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.SUPPLIER_BILLING_AMEND,
      requestBody
    );
    return response.data;
  },

  // Customer billing confirm
  customerBillingConfirm: async (payload: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = {
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "WorkOrder-Customer Billing Confirm"
      },
      RequestPayload: payload
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.CUSTOMER_BILLING_CONFIRM,
      requestBody
    );
    return response.data;
  },

  // Customer billing amend
  customerBillingAmend: async (payload: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = {
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "WorkOrder-Customer Billing Amend"
      },
      RequestPayload: payload
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.CUSTOMER_BILLING_AMEND,
      requestBody
    );
    return response.data;
  },

  // Get Code CUU Details for work order
  getCodeCUUDetails: async (
  ): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Code CUU"
      },
      SearchCriteria: {
        CUUCode: ""
      }
    });

    const requestBody = {
      RequestData: requestPayload,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.COMBO,
      requestBody
    );
    return response.data;
  },

  // Get billing summary for work order
  getBillingSummary: async (
    workOrderNo: string
  ): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "WorkOrder-Get Billing Summary"
      },
      SearchCriteria: {
        WorkOrderNo: workOrderNo
      }
    });

    const requestBody = {
      RequestData: requestPayload,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.GET_BILLING_SUMMARY,
      requestBody
    );
    return response.data;
  },

  // Cancel Work Order
  cancelWorkOrder: async (payload: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = {
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "WorkOrder-Cancel"
      },
      RequestPayload: payload
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORK_ORDER.CANCEL, // Using SAVE endpoint as it's the update endpoint
      requestBody
    );
    return response.data;
  },
};
