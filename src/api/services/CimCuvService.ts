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
}