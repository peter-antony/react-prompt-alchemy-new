import { apiClient } from "../client";
import { API_ENDPOINTS, getUserContext, getNebulaUserID } from "../config";
import { ApiResponse, PaginatedResponse } from "../types";

// Receivables Authorization interfaces
export interface ReceivablesAuthRecord {
  [key: string]: unknown;
}

export interface ReceivablesAuthHubSearchParams {
  filters?: Array<{ FilterName: string; FilterValue: string }>;
  Pagination?: { PageNumber?: number; PageSize?: number };
  SearchCriteria?: Record<string, unknown>;
}

export const receivablesAuthService = {
  getUserContext: () => {
    try {
      const selectedContext = localStorage.getItem("selectedUserContext");

      if (selectedContext) {
        const parsedContext = JSON.parse(selectedContext);
        return {
          ouId: parsedContext.ouId || 4,
          roleName: parsedContext.roleName || "RAMCOROLE",
          ouDescription: parsedContext.ouDescription || "",
          userInfo: parsedContext,
        };
      }
    } catch (error) {
      console.error(
        "Error retrieving user context from localStorage:",
        error
      );
    }

    const defaultContext = {
      ouId: 4,
      roleName: "RAMCOROLE",
      ouDescription: "Default OU",
    };

    return defaultContext;
  },

  // Hub search – list/search receivables authorization records
  hubSearch: async (
    params?: ReceivablesAuthHubSearchParams
  ): Promise<PaginatedResponse<ReceivablesAuthRecord>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Receivables Auth Hub Search",
        UserID: getNebulaUserID(),
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: params?.filters || [],
      Pagination: params?.Pagination || { PageNumber: 1, PageSize: 25 },
      SearchCriteria: params?.SearchCriteria || {},
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.RECEIVABLES_AUTH.HUB_SEARCH,
      requestBody
    );
    return response.data;
  },

  // Get single receivables authorization record by id/key
  getData: async (params?: {
    id?: string;
    [key: string]: unknown;
  }): Promise<ApiResponse<ReceivablesAuthRecord>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Receivables Auth Get",
        UserID: getNebulaUserID(),
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: params?.id
        ? [{ FilterName: "ID", FilterValue: params.id }]
        : [],
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.RECEIVABLES_AUTH.GET_DATA,
      requestBody
    );
    return response.data;
  },

  // Get invoice data for Receivables Authorization (MessageType: "Receivable Invoice -Get Invoice")
  getInvoiceData: async (params?: { invoiceNo?: string }): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Receivable Invoice -Get Invoice",
        UserID: getNebulaUserID(),
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        InvoiceNo: params?.invoiceNo ?? "",
      },
    };
    const requestBody = {
      RequestData: JSON.stringify(payload),
    };
    const response = await apiClient.post(
      API_ENDPOINTS.RECEIVABLES_AUTH.GET_DATA,
      requestBody
    );
    return response.data;
  },

  // Get master common data
  getMasterCommonData: async (
    params?: any
  ): Promise<PaginatedResponse<ReceivablesAuthRecord>> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: getNebulaUserID(),
        OUID: userContext.ouId,
        Role: userContext.roleName,
        // searchTerm: params?.searchTerm || '',
        // offset: params?.offset,
        // limit: params?.limit,
      },
      SearchCriteria: params?.SearchCriteria || {
        id: params?.searchTerm || '',
        name: params?.searchTerm || '',
      },
      // AdditionalFilter: [],
      AdditionalFilter: params?.messageType === "Contract Init" ? [
        {
          FilterName: "ContractType",
          FilterValue: params?.OrderType,
        },
        {
          FilterName: "ContractID",
          FilterValue: params?.ContractId
        }
      ] : params?.messageType === "Equipment ID Init" ? [
        {
          FilterName: "EquipmentType",
          FilterValue: params?.EquipmentType,
        }
      ] : params?.messageType === "ResourceType Init" ? [
        {
          FilterName: "Resource",
          FilterValue: params?.ResourceId,
        }
      ] : params?.messageType === "Trip Log Incident ID Init" ? [
        {
          FilterName: "TripID",
          FilterValue: params?.TripID,
        }
      ] : params?.messageType === "Incident Causer Name Init" ? [
        {
          FilterName: "IncidentCausedBy",
          FilterValue: (params?.IncidentCausedBy || '').split('||')[0]?.trim()
        },
        {
          FilterName: "tripplanid",
          FilterValue: params?.IncidentTripId,
        }
      ] : params?.messageType === "Trip status Init" ? [
        {
          FilterName: "ScreenName",
          FilterValue: params?.ScreenName,
        },
      ] :params?.messageType === "Attachment File Category Init" ? [
        // {
        //   FilterName: "ScreenName",
        //   FilterValue: params?.ScreenName,
        // },
      ]: params?.messageType === "UN Code Init" ? [
        {
          FilterName: "ProductId",
          FilterValue: params?.selectedProductId || '',
        }      
      ]:
        [],
      Pagination: {
        PageNumber: params?.offset,
        PageSize: params?.limit,
      },
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.COMBO,
      requestBody
    );
    return response.data;
  },
};
