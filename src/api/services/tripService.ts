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
        UserID: "ramcouser",
        Role: "ramcorole",
        OUID: 4,
        MessageID: "12345",
        MessageType: "trip_log_hub_search_sp",
      },
      SearchCriteria: {
        TripId: "",
        CustomerID: "1005",
        CustomerOrderNumber: "",
        ServiceType: "",
        SubServiceType: "",
        // PlannedExecutionDateFrom: "2025/06/05",
        // PlannedExecutionDateTo: "2025/08/06",
        TripStatus: "Confirmed",
        TrainID: "",
        CustomerRefNo: "",
        RoundTrip: "",
        TripType: "",
        CustomerDescription: "",
        Departurepoint: "",
        ArrivalPoint: "",
        Supplier: "",
        SupplierContract: "",
        CustomerContract: "",
        PathNo: "",
        IncidentStatus: "",
        TransportMode: "",
        ReturnTripId: "",
        CancellationReason: "",
        WorkshopStatus: "",
        VendorFeedback: "",
        VendorFeedbackReason: "",
        WagonGroup: "",
        ContainerGroup: "",
        Via: "",
        CustomerSenderRefNo: "",
        DocumentType: "",
        VehicleID: "",
        DriverID: "",
        CarrierID: "",
        VehicleRegNo: "",
        EquipmentRegNo: "",
        VoyageFlightTrainNo: "",
        VesselFlightTrainName: "",
        THUSerialNo: "",
        RefDocType: "",
        ToLocation: "",
        Cluster: "",
        WBS: "",
        Contract: "",
        WagonID: "",
        AgentID: "",
        ScheduleID: "",
        UserID: "",
        ExecutiveCarrierID: "",
        PassNo: "",
        ContainerID: "",
        TripBillingStatus: "",
        Document: "",
        BRSenderRefNo: "",
        IncidentID: "",
        MobileRefIncidentID: "",
        RefDocNo: "",
        LoadType: "",
      },
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
