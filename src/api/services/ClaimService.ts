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

  saveClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Save",
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
      API_ENDPOINTS.CLAIMS.SAVE,
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

  rejectClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Reject",
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
      API_ENDPOINTS.CLAIMS.REJECT,
      requestBody
    );
    return response.data;
  },

  processedAmendClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Processed Amend",
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
      API_ENDPOINTS.CLAIMS.AMEND,
      requestBody
    );
    return response.data;
  },

  approveClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Approve",
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
      API_ENDPOINTS.CLAIMS.APPROVE,
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

  processClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Process",
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
      API_ENDPOINTS.CLAIMS.PROCESS,
      requestBody
    );
    return response.data;
  },

  generateNoteClaim: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Generate Note",
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
      API_ENDPOINTS.CLAIMS.GENERATE_NOTE,
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
      API_ENDPOINTS.CLAIMS.AUDIT_TRAIL,
      requestBody
    );
    return response.data;
  },

  viewWorkFlowReport: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "View Workflow Report",
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
      API_ENDPOINTS.CLAIMS.WORKFLOW_REPORT,
      requestBody
    );
    return response.data;
  },

  claimHubSmartEdit: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-SmartEdit",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
      },
      RequestPayload: {
        Header: {
          ClaimNo: params?.ClaimNo,
          Reference: {
            ClaimantRefNo: params?.ClaimantRefNo,
            SecondaryRefNo: params?.SecondaryRefNo,
            ModeFlag: "Update"
          }
        }
      }
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CLAIMS.SMARTEDIT,
      requestBody
    );
    return response.data;
  },

  getClaimData: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Get",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
      },
      SearchCriteria: {
        ClaimNo: params?.claimNo
      }
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CLAIMS.GET,
      requestBody
    );
    return response.data;
  },

  getLinkedIOClaims: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "Claim-Get Linked Orders",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
      },
      SearchCriteria: {
        ClaimNo: params?.claimNo
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
  },

  claimFindingsSave: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        UserID: "ramcouser",
        MessageType: "Claim-findingssave"
      },
      RequestPayload: params.requestPayload,
    };

    const requestBody = {
      RequestData: JSON.stringify(payload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CLAIMS.FINDINGS_SAVE,
      requestBody
    );
    return response.data;
  },
};
