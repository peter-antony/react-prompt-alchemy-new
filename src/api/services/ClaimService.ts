import { apiClient } from "../client";
import { API_CONFIG, API_ENDPOINTS, getUserContext } from "../config";

export const ClaimService = {
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
}