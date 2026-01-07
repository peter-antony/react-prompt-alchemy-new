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

export const tripService = {

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
  getTrips: async (params?: any): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
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
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
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
        TripID: params?.id,
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
      `${API_ENDPOINTS.TRIPS.GET_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // save trip service call
  saveTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "TripLog SaveTrip",
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
      `${API_ENDPOINTS.TRIPS.SAVE_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // save trip service call
  addViaPoint: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Trip Add Via Point",
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.SAVE_VIA_POINT}`,
      requestBody
    );
    return response.data;
  },

  // confirm trip service call
  confirmTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "TripLog ConfirmTrip",
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
      `${API_ENDPOINTS.TRIPS.CONFIRM_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // cancel trip service call
  cancelTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "TripLog CancelTrip",
      },
      SearchCriteria: {},
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
      `${API_ENDPOINTS.TRIPS.CANCEL_TRIP}`,
      requestBody
    );
    return response.data;
  },

  // amend trip service call
  amendTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
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

  // amend trip service call
  cancelTripService: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "TripLog CancelTrip",
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
      `${API_ENDPOINTS.TRIPS.CANCEL_TRIP}`,
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
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
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
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "TripLog SaveVas",
      },
      Header: HeaderInfo,
      VAS: vasList,
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
  getIncidentTrip: async (tripId: string): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "GetIncidentsFromTrip",
      },
      SearchCriteria: {
        TripNo: tripId,
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
      `${API_ENDPOINTS.TRIPS.GET_INCIDENT}`,
      requestBody
    );
    return response.data;
  },
  saveIncidentTrip: async (
    HeaderInfo: any,
    incidentList: any
  ): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "SaveIncidentsFromTrip",
      },
      RequestPayload: {
        Header: HeaderInfo,
        Incident: incidentList,
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
      `${API_ENDPOINTS.TRIPS.SAVE_INCIDENT}`,
      requestBody
    );
    return response.data;
  },

  getPathConstraints: async (tripId: string): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "GetPathConstraints",
      },
      SearchCriteria: {
        RefDocNo: tripId,
        RefDocType: "Trip Log",
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
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "SavePathConstraints",
      },
      RequestPayload: {
        Header: {
          RefDocNo: tripId,
          RefDocType: "Trip Log",
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
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
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

  getTripRoutes: async (params?: any): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Manage Execution Plan Hub Search",
      },
      SearchCriteria: params?.searchCriteria,
      // Pagination: {
      //   PageNumber: 1,
      //   PageSize: 10,
      // },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.ROUTE_UPDATE,
      requestBody
    );
    return response.data;
  },

  getCOSelection: async (params?: any): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Manage Execution Plan CO Selection",
      },
      SearchCriteria: {
        CustomerOrderNo: params?.CONumber,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.CO_SELECTION,
      requestBody
    );
    return response.data;
  },

  updateCOSelection: async (params?: any): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Manage Execution Plan CO Updation",
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.UPDATE_SELECTION,
      requestBody
    );
    return response.data;
  },

  getplantriplevelupdate: async (
    params?: any
  ): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Manage Execution Plan-Trip Leg Level Selection",
      },
      SearchCriteria: {
        TripID: params?.TripId,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.TRIP_LEG_LEVEL_UPDATE,
      requestBody
    );
    return response.data;
  },

  saveManageExecutionUpdateTripLevel: async (
    params?: any
  ): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Manage Execution Plan-Trip Level Update ",
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.TRIP_LEG_LEVEL_UPDATE,
      requestBody
    );
    return response.data;
  },
  saveAttachments: async (params: any, tripUniqueID?: any): Promise<ApiResponse<Trip>> => {
    console.log("params = ",params)
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "Save Attachment",
      },
      RequestPayload:{
        "Attachments": {
            "ReferenceType": "TripLog",
            "ReferenceDocNo": tripUniqueID,
            "TotalAttachment": 10,
            "AttachItems":[params]
          },
      }
      // RequestPayload: params,
      // Pagination: {
      //   PageNumber: 1,
      //   PageSize: 10,
      //   TotalRecords: 200,
      // },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    console.log("SAVE ATTACHMENT % REQUEST BODY : ",requestBody)
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.SAVE_ATTACHMENT}`,
      requestBody
    );
    return response.data;
  },
  getAttachments: async ( tripUniqueID?: any): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "Get Attachment",
      },
      SearchCriteria: {
        "ReferenceType": "TripLog",
        "ReferenceDocNo": tripUniqueID,
        "ExtraRef1": "",
        "ExtraRef2": "",
        "ExtraRef3": "",
        "ExtraRef4": "",
        "AdditionalFilter": []
      },
      
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    console.log(" GET ATTACHMENT requestPayload ",requestPayload)
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.GET_ATTACHMENT,
      requestBody
    );
    return response.data;
  },

  // get attachments for transport route update
  getTransportRouteUpdateAttachments: async (customerOrderID: any): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "Get Attachment",
      },
      SearchCriteria: {
        "ReferenceType": "Transport Route Update",
        "ReferenceDocNo": customerOrderID,
        "ExtraRef1": "",
        "ExtraRef2": "",
        "ExtraRef3": "",
        "ExtraRef4": "",
        "AdditionalFilter": []
      },

    });
    const requestBody = {
      RequestData: requestPayload,
    };
    console.log(" GET TRANSPORT ROUTE UPDATE ATTACHMENT requestPayload ", requestPayload)
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.GET_ATTACHMENT,
      requestBody
    );
    return response.data;
  },

  // save attachments for transport route update
  saveTransportRouteUpdateAttachments: async (params: any, customerOrderID?: any): Promise<ApiResponse<Trip>> => {
    console.log("params = ", params)
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "Save Attachment",
      },
      RequestPayload: {
        "Attachments": {
          "ReferenceType": "Transport Route Update",
          "ReferenceDocNo": customerOrderID,
          "TotalAttachment": 10,
          "AttachItems": [params]
        },
      }
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    console.log("SAVE TRANSPORT ROUTE UPDATE ATTACHMENT % REQUEST BODY : ", requestBody)
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.SAVE_ATTACHMENT}`,
      requestBody
    );
    return response.data;
  },

  getPODLegAttachments: async (params: {
    TripNo: string;
    LegNumber: string | number;
    CustomerOrderNo: string;
    DispatchDocNo?: string;
  }): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "Get Attachment",
      },
      SearchCriteria: {
        ReferenceType: "Trip Log POD Leg wise",
        ReferenceDocNo: params?.TripNo,
        ExtraRef1: "",
        ExtraRef2: "",
        ExtraRef3: "",
        ExtraRef4: "",
        RefDocType1: "Legno",
        RefDocNo1: `${params?.LegNumber}`,
        RefDocType2: "DispatchDoc",
        RefDocNo2: params?.DispatchDocNo ?? "",
        RefDocType3: "CustomerOrderNo",
        RefDocNo3: params?.CustomerOrderNo,
        AdditionalFilter: [],
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.GET_ATTACHMENT,
      requestBody
    );
    return response.data;
  },

  savePODLegAttachments: async (params: {
    TripNo: string;
    LegNumber: string | number;
    CustomerOrderNo: string;
    DispatchDocNo?: string;
    WagonID?: string;
    AttachItems: any[];
  }): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        Role: userContext.roleName,
        OUID: userContext.ouId,
        MessageID: "12345",
        MessageType: "Save Attachment",
      },
      RequestPayload: {
        Attachments: {
          ReferenceType: "Trip Log POD Leg wise",
          ReferenceDocNo: params?.TripNo,
          TotalAttachment: params?.AttachItems?.length || 0,
          // Provide leg and document references to bind at server side
          RefDocType1: "Legno",
          RefDocNo1: `${params?.LegNumber}`,
          RefDocType2: "DispatchDoc",
          RefDocNo2: params?.DispatchDocNo ?? "",
          RefDocType3: "CustomerOrderNo",
          RefDocNo3: params?.CustomerOrderNo,
          RefDocType4: params?.WagonID ? "WagonID" : "",
          RefDocNo4: params?.WagonID ?? "",
          AttachItems: params?.AttachItems || [],
        },
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.SAVE_ATTACHMENT}`,
      requestBody
    );
    return response.data;
  },

  saveLegAndEventsTripLevel: async (
    params?: any
  ): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "SaveTripInManageTrip",
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.SAVE_MANGE_TRIP,
      requestBody
    );
    return response.data;
  },

  GetTrackAndTraceEvents: async (
    params?: any
  ): Promise<PaginatedResponse<Trip>> => {
    const userContext = getUserContext();
    // const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "GetTrackAndTraceFromTrip",
      },
      SearchCriteria: {
        TripNo: params?.tripId
      }
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.GET_INCIDENT,
      requestBody
    );
    return response.data;
  },

  getPODFromTrip: async (params: {
    TripNo: string;
    LegNumber: string | number;
    CustomerOrderNo: string;
    DispatchDocNo?: string;
  }): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "TripLogGetPOD",
      },
      SearchCriteria: {
        TripNo: params?.TripNo,
        LegNumber: `${params?.LegNumber}`,
        CustomerOrderNo: params?.CustomerOrderNo,
        DispatchDocNo: params?.DispatchDocNo ?? "",
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.TRIPS.GET_INCIDENT,
      requestBody
    );
    return response.data;
  },

  savePOD: async (params: {
    TripNo: string;
    LegNumber: string | number;
    CustomerOrderNo: string;
    DispatchDocNo?: string;
    WagonDetails: Array<{
      WagonType: string;
      WagonTypeDescription: string;
      WagonID: string;
      WagonQty: number;
      PODStatus: string;
      PODStatusDescription: string;
      ReasonCode: string;
      ReasonCodeDescription: string;
      Remarks: string;
      LineUniqueID: null;
      ModeFlag: string;
    }>;
    BulkUpdate?: {
      PODStatus: string;
      PODStatusDescription: string;
      ReasonCode: string;
      ReasonCodeDescription: string;
      Remarks: string;
    };
  }): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "TripLogSavePOD",
      },
      RequestPayload: {
        TripNo: params?.TripNo,
        LegNumber: `${params?.LegNumber}`,
        CustomerOrderNo: params?.CustomerOrderNo,
        DispatchDocNo: params?.DispatchDocNo ?? "",
        WagonDetails: params?.WagonDetails || [],
        BulkUpdate: params?.BulkUpdate || {
          PODStatus: "",
          PODStatusDescription: "",
          ReasonCode: "",
          ReasonCodeDescription: "",
          Remarks: "",
        },
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.SAVE_INCIDENT}`,
      requestBody
    );
    return response.data;
  },

  // Get Resource From Trip
  getResourceFromTrip: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "GetResourceFromTrip",
      },
      SearchCriteria: {
        TripID: params?.id,
      },
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.GET_RESOURCE}`,
      requestBody
    );
    return response.data;
  },

  // save Resource From Trip
  saveResource: async (params?: any): Promise<ApiResponse<Trip>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "UpdateResourceFromTrip",
      },
      RequestPayload: params,
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS.SAVE_RESOURCE}`,
      requestBody
    );
    return response.data;
  },

};
