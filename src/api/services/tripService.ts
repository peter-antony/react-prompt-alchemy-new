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

export const tripService = {
  // Get trips with filtering, sorting, and pagination
  getTrips: async (params?: any): Promise<PaginatedResponse<Trip>> => {
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "trip_log_hub_search_sp",
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
      API_ENDPOINTS.TRIPS.LIST,
      requestBody
    );
    return response.data;
  },

  bulkCancelTrip: async (params: any) => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "Trip Log Bulk Cancel",
      },
      MessageContents: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.BULK_CANCEL}`,
      requestBody
    );
    return response.data;
  },

  // Get single trip
  getTripById: async (params?: any): Promise<ApiResponse<Trip>> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "TripLog GetTripID",
      },
      SearchCriteria: {
        TripID: params?.id,
      },
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        TotalRecords: 200,
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

  // save trip service call
  saveTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "TripLog SaveTrip",
      },
      RequestPayload: params,
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        TotalRecords: 200,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.SAVE_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // confirm trip service call
  confirmTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "TripLog ConfirmTrip",
      },
      RequestPayload: params,
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        TotalRecords: 200,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.CONFIRM_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // cancel trip service call
  cancelTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "TripLog CancelTrip",
      },
      SearchCriteria: {},
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        TotalRecords: 200,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.CANCEL_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // amend trip service call
  amendTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "TripLog AmendTrip",
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
      `${API_ENDPOINTS.TRIPS.AMEND_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // Get single trip
  getTrip: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TRIPS.LIST}/${id}`);
    return response.data;
  },

  // Update trip
  updateTrip: async (
    id: string,
    data: TripUpdateInput
  ): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.put(API_ENDPOINTS.TRIPS.UPDATE(id), data);
    return response.data;
  },

  // Create new trip
  createTrip: async (data: TripCreateInput): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS.CREATE, data);
    return response.data;
  },

  getVASTrip: async (tripId: string): Promise<any> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "GetVASFromTrip",
      },
      SearchCriteria: {
        TripID: tripId,
      },
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
      `${API_ENDPOINTS.TRIPS.GET_VAS}`,
      requestBody
    );
    return response.data;
  },

  saveVASTrip: async (HeaderInfo: any, vasList: any): Promise<any> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "TripLog SaveVas",
      },
      Header: HeaderInfo,
      VAS: vasList
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
      `${API_ENDPOINTS.TRIPS.SAVE_VAS}`,
      requestBody
    );
    return response.data;
  },

  getPathConstraints: async (tripId: string): Promise<any> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "GetPathConstraints",
      },
      SearchCriteria: {
        RefDocNo: tripId,
        RefDocType: "TripLog",
      },
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
      `${API_ENDPOINTS.QUICK_ORDERS.COMBO}`,
      requestBody
    );
    return response.data;
  },

  savePathConstraints: async (tripId: string, trainParams): Promise<any> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "SavePathConstraints",
      },
      RequestPayload: {
        Header: {
          RefDocNo: tripId,
          RefDocType: "TripLog",
        },
        PathConstraints: trainParams,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.QUICK_ORDERS.COMBO}`,
      requestBody
    );
    return response.data;
  },

  getCommonCombo: async (params): Promise<any> => {
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: params?.messageType,
      },
      AdditionalFilter: [],
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.QUICK_ORDERS.COMBO}`,
      requestBody
    );
    return response.data;
  },
};
