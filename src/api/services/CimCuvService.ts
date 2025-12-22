import { apiClient } from "../client";
import { API_CONFIG, API_ENDPOINTS, getUserContext } from "../config";
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  Trip,
  TripCreateInput,
  TripUpdateInput,
} from "../types";

export const CimCuvService = {
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
      console.error("Error retrieving user context from localStorage:", error);
    }

    // Default values if nothing is stored
    const defaultContext = {
      ouId: 4,
      roleName: "RAMCOROLE",
      ouDescription: "Default OU",
    };

    return defaultContext;
  },

  getCimCuvTemplateHub: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "CIM CUV Template Hub Search",
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
      API_ENDPOINTS.CIM_CUV.TEMPLATE_HUB,
      requestBody
    );
    return response.data;
  },

  getCimCuvReportHub: async (params: any): Promise<any> => {
    const userContext = getUserContext();
    const payload = {
      context: {
        MessageID: "12345",
        MessageType: "CIM CUV Report Hub Search",
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
      API_ENDPOINTS.CIM_CUV.REPORT_HUB,
      requestBody
    );
    return response.data;
  },

  createTripPlan: async (params?: any): Promise<ApiResponse<Trip>> => {
    console.log("params ", params);
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Create Trip-Separate Trip For Each CO",
      },
      RequestPayload: params,
      // Pagination: {
      //   PageNumber: 1,
      //   PageSize: 10,
      //   TotalRecords: 200,
      // },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.CREATE_TRIP_CO}`,
      requestBody
    );
    return response.data;
  },

  saveCimCuvTemplate: async (payload: any): Promise<any> => {
    const userContext = getUserContext();

    const requestPayload = {
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Template-Save",
      },
      RequestPayload: payload,
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CIM_CUV.SAVE_TEMPLATE,
      requestBody
    );

    return response.data;
  },

  saveCimCuvReport: async (payload: any): Promise<any> => {
    const userContext = getUserContext();

    const requestPayload = {
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Report-Save",
      },
      RequestPayload: payload,
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CIM_CUV.SAVE_REPORT,
      requestBody
    );

    return response.data;
  },

  updateCimCuvReport: async (payload: any): Promise<any> => {
    const userContext = getUserContext();

    const requestPayload = {
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Update Template",
      },
      RequestPayload: payload,
    };

    const requestBody = {
      RequestData: JSON.stringify(requestPayload),
    };

    const response = await apiClient.post(
      API_ENDPOINTS.CIM_CUV.UPDATE_TEMPLATE,
      requestBody
    );

    return response.data;
  },

  getTemplateDataByID: async (params?: any): Promise<ApiResponse<Trip>> => {
    console.log("params ", params);
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Template -Get Template ID",
      },
      SearchCriteria: {
        CIMCUVTemplateID: params,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.CIM_CUV.GET_TEMPLATE}`,
      requestBody
    );
    return response.data;
  },

  getReportDataByID: async (params?: any): Promise<ApiResponse<Trip>> => {
    console.log("params ", params);
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Report-Get Report No",
      },
      SearchCriteria: {
        CIMCUVReportNo: params,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.CIM_CUV.GET_REPORT}`,
      requestBody
    );
    return response.data;
  },

  saveConsignorConsignee: async (params?: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Template-ConsSave", // Placeholder message type
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    // Assuming a generic API endpoint for now, user might need to define a specific one
    const response = await apiClient.post(
      `${API_ENDPOINTS.CIM_CUV.ADD_TEMP_CONSIGNOR_CONSIGNEE}`,
      requestBody
    );
    return response.data;
  },

  cancelCimCuvTemplate: async (params?: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Template-Cancel",
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.CIM_CUV.CANCEL_CIMCUV}`,
      requestBody
    );
    return response.data;
  },

  saveReportConsignorConsignee: async (params?: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Report-ConsSave", // Placeholder message type
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    // Assuming a generic API endpoint for now, user might need to define a specific one
    const response = await apiClient.post(
      `${API_ENDPOINTS.CIM_CUV.ADD_REP_CONSIGNOR_CONSIGNEE}`,
      requestBody
    );
    return response.data;
  },

  cancelCimCuvReport: async (params?: any): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "CIM CUV Report-Cancel",
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.CIM_CUV.CANCEL_CIMCUV_REPORT}`,
      requestBody
    );
    return response.data;
  },
};