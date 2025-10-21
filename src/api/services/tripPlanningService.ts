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
      // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
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
}