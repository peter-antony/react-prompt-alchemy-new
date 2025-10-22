import { apiClient } from "../client";
import { API_CONFIG, API_ENDPOINTS } from "../config";
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  Trip,
  TripCreateInput,
  TripUpdateInput,
} from "../types";

export const tripPlanningService = {
  // Get trips with filtering, sorting, and pagination
    getCOs: async (params?: any): Promise<PaginatedResponse<Trip>> => {
      // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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

    createTripPlan: async (params?: any): Promise<ApiResponse<Trip>> => {
      console.log("params ", params);
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
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
      const requestPayload = JSON.stringify({
        context: {
          UserID: "ramcouser",
          Role: "ramcorole",
          OUID: 4,
          MessageID: "12345",
          MessageType: "Manage Trip Plan - Confirm Trip",
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
}