import { apiClient } from "../client";
import { API_CONFIG, API_ENDPOINTS, getUserContext, getNebulaUserID } from "../config";

export const ReceivablesService = {
  // Get master common data
  getMasterCommonData: async (params?: any): Promise<any> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: getNebulaUserID(),
        OUID: userContext.ouId,
        Role: userContext.roleName
      },
      SearchCriteria: params?.SearchCriteria || {
        id: params?.searchTerm || "",
        name: params?.searchTerm || "",
      },
      // AdditionalFilter: [],
      AdditionalFilter: [],
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

  getReceivablesHubSearch: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Receive_Customer_Credit_Get_Hub",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: getNebulaUserID(),
      },
      SearchCriteria: params?.searchCriteria,
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.Receivables.RECEIVABLES_HUBSEARCH,
      requestBody
    );
    return response.data;
  },
};