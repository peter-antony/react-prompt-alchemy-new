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
  getTrips: async (params?: QueryParams): Promise<PaginatedResponse<Trip>> => {
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "trip_log_hub_search_sp",
        UserID: "ramcouser",
        OUID: "4",
        Role: "ramcorole",
      },
      SearchCriteria: {
        Tripid: "TP/2021/00024900",
        CustomerID: "1005",
        CustomerOrderNumber: "BR/2025/0171",
        Servicetype: "BLOCK TRAIN CONVENTIONAL",
        SubServicetype: "WITHOUT  EQUIPMENT / SOC",
        PlannedExecutionDateFrom: "2025/06/05",
        PlannedExecutionDateTo: "2025/08/06",
        Tripstatus: "Confirmed",
        TrainID: "",
        CustomerRefNo: "",
        RoundTrip: "",
        Triptype: "",
      },
      AdditionalFilter: [
        {
          FilterName: "DocumentType",
          FilterValue: "",
        },
        {
          FilterName: "VehicleID",
          FilterValue: "",
        },
        {
          FilterName: "DriverID",
          FilterValue: "",
        },
        {
          FilterName: "CarrierID",
          FilterValue: "",
        },
        {
          FilterName: "VehicleRegNo",
          FilterValue: "",
        },
        {
          FilterName: "EquipmentRegNo",
          FilterValue: "",
        },
        {
          FilterName: "VoyageFlightTrainNo",
          FilterValue: "",
        },
        {
          FilterName: "VesselFlightTrainName",
          FilterValue: "",
        },
        {
          FilterName: "THUSerialNo",
          FilterValue: "",
        },
        {
          FilterName: "RefDocType",
          FilterValue: "",
        },
        {
          FilterName: "FromLocation",
          FilterValue: "",
        },
        {
          FilterName: "ToLocation",
          FilterValue: "",
        },
        {
          FilterName: "Cluster",
          FilterValue: "",
        },
        {
          FilterName: "WBS",
          FilterValue: "",
        },
        {
          FilterName: "Contract",
          FilterValue: "",
        },
        {
          FilterName: "WagonID",
          FilterValue: "",
        },
        {
          FilterName: "AgentID",
          FilterValue: "",
        },
        {
          FilterName: "ScheduleID",
          FilterValue: "",
        },
        {
          FilterName: "UserID",
          FilterValue: "",
        },
        {
          FilterName: "ExecutiveCarrierID",
          FilterValue: "",
        },
        {
          FilterName: "PassNo",
          FilterValue: "",
        },
        {
          FilterName: "ContainerID",
          FilterValue: "",
        },
        {
          FilterName: "TripBillingStatus",
          FilterValue: "",
        },
        {
          FilterName: "Document",
          FilterValue: "",
        },
        {
          FilterName: "BRSenderRefNo",
          FilterValue: "",
        },
        {
          FilterName: "IncidentID",
          FilterValue: "",
        },
        {
          FilterName: "MobileRefIncidentID",
          FilterValue: "",
        },
        {
          FilterName: "RefDocNo",
          FilterValue: "",
        },
        {
          FilterName: "LoadType",
          FilterValue: "",
        },
      ],
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
      },
    });
    const requestBody = {
      "RequestData": requestPayload,
    };
    const response = await apiClient.post(API_ENDPOINTS.TRIPS.LIST,
      requestBody
    );
    return response.data;
  },

  // Get single trip
  getTrip: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TRIPS.LIST}/${id}`);
    return response.data;
  },

  // Create new trip
  createTrip: async (data: TripCreateInput): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS.CREATE, data);
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

  // Delete trip
  deleteTrip: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.TRIPS.DELETE(id));
    return response.data;
  },

  // Approve trip
  approveTrip: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS.APPROVE(id));
    return response.data;
  },
};
