import { apiClient } from "../client";
import { API_CONFIG, API_ENDPOINTS, getUserContext } from "../config";

export const ClaimService = {
  // Get master common data
  getMasterCommonData: async (params?: any): Promise<any> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName
      },
      SearchCriteria: params?.SearchCriteria || {
        Type: params?.messageType === 'Claims Type OnSelect' ? params?.selectedClaimType : "",
        CounterParty: params?.messageType === 'Claims Counter Party OnSelect' ? params?.selectedClaimCounterParty : "",
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

  getClaimsHubSearch: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Hub Search",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
      },
      SearchCriteria: params?.searchCriteria,
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CLAIMS.HUBSEARCH,
      requestBody
    );
    return response.data;
  },

  cancelClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Cancel",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
      },
      RequestPayload: params,
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CLAIMS.CANCEL,
      requestBody
    );
    return response.data;
  },

  shortCloseClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-ShortClose",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
      },
      RequestPayload: params,
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CLAIMS.SHORTCLOSE,
      requestBody
    );
    return response.data;
  },

  viewAuditTrail: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "View Audit Trail",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
      },
      SearchCriteria: {
        RefDocType: params?.RefDocType,
        RefDocNo: params?.RefDocNo
      }
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CLAIMS.COMBO,
      requestBody
    );
    return response.data;
  }
}
