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

export const tripPlanningService = {

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

  // Get trips with filtering, sorting, and pagination
    getCOs: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      const userContext = getUserContext();
      // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "GetCustomerOrders-CreateTripPlan",
        },
        SearchCriteria: params?.searchCriteria,
      });
      const requestBody = {
        RequestData: requestPayload,
      };
      const response = await apiClient.post(
        API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
        requestBody
      );
      return response.data;
    },

    getEquipmentList: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "GetEquipments-CreateTripPlan",
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
        API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
        requestBody
      );
      return response.data;
    },

    getAgentsList: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "GetAgents-CreateTripPlan",
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
        API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
        requestBody
      );
      return response.data;
    },

    getDriversList: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "GetDrivers-CreateTripPlan",
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
        API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
        requestBody
      );
      return response.data;
    },

    getHandlersList: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "GetHandlers-CreateTripPlan",
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
        API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
        requestBody
      );
      return response.data;
    },

    getVehicleList: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "GetVehicle-CreateTripPlan",
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
        API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
        requestBody
      );
      return response.data;
    },

    getSchedulesList: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "GetSchedules-CreateTripPlan",
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
        API_ENDPOINTS.TRIPS.CREATE_TRIP_CO,
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

    createMultipleCOTripPlan: async (params?: any): Promise<ApiResponse<Trip>> => {
      console.log("params ", params);
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "Create Trip - For Bulk COs",
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

    confirmTripPlanning: async (params?: any): Promise<ApiResponse<Trip>> => {
      console.log("params ", params);
      const userContext = getUserContext();
      // Remove messageType from RequestPayload
      const { messageType, ...requestPayloadData } = params || {};
      
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: messageType,
        },
        RequestPayload: requestPayloadData,
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

    getTripDataByID: async (params?: any): Promise<ApiResponse<Trip>> => {
      console.log("params ", params);
      const userContext = getUserContext();
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
          MessageID: "12345",
          MessageType: "TripLog GetTripID",
        },
        SearchCriteria: {
          TripID: params,
        },
      });
      const requestBody = {
        RequestData: requestPayload,
      };
      const response = await apiClient.post(
        `${API_ENDPOINTS.TRIPS.GET_TRIP}`,
        requestBody
      );
      return response.data;
    },
}