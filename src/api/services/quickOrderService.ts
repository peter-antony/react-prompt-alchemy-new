import { apiClient } from "../client";
import { API_ENDPOINTS, getUserContext } from "../config";
import { ApiResponse, PaginatedResponse, QueryParams } from "../types";

// Quick Order interface
export interface QuickOrder {
  QuickUniqueID: number;
  QuickOrderNo: string;
  QuickOrderDate: string;
  Status: string;
  CustomerOrVendor: string;
  Customer_Supplier_RefNo: string;
  Contract: string;
  OrderType: string;
  TotalNet: number;
}

export interface QuickOrderCreateInput {
  QuickOrderDate: string;
  Status: string;
  CustomerOrVendor: string;
  Customer_Supplier_RefNo: string;
  Contract: string;
  OrderType: string;
  TotalNet: number;
}

export interface QuickOrderUpdateInput extends Partial<QuickOrderCreateInput> { }

export const quickOrderService = {

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

  // Get quick orders with filtering, sorting, and pagination
  getQuickOrders: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    // Prepare the request body in the required format
    // const requestBody = {
    //   context: {
    //     MessageID: "12345",
    //     MessageType: "Quick Order Hub Search",
    //     UserID: "ramcouser",
    //     OUID: 4,
    //     Role: "ramcorole",
    //   },
    //   AdditionalFilter: params?.filters
    //     ? Object.entries(params.filters).map(([key, value]) => ({
    //         FilterName: key,
    //         FilterValue: String(value),
    //       }))
    //     : [],
    // };
    const userContext = getUserContext();
    console.log("userContext =====", userContext);
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Hub Search",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: params?.filters || [],
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.LIST,
      requestBody
    );
    return response.data;
  },

  // Get master common data
  getMasterCommonData: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        // searchTerm: params?.searchTerm || '',
        // offset: params?.offset,
        // limit: params?.limit,
      },
      SearchCriteria: {
        id: params?.searchTerm || '',
        name: params?.searchTerm || '',
      },
      // AdditionalFilter: [],
      AdditionalFilter: params?.messageType === "Contract Init" ? [
        {
          FilterName: "ContractType",
          FilterValue: params?.OrderType,
        },
        {
          FilterName: "ContractID",
          FilterValue: params?.ContractId
        }
      ] : params?.messageType === "Equipment ID Init" ? [
        {
          FilterName: "EquipmentType",
          FilterValue: params?.EquipmentType,
        }
      ] : params?.messageType === "ResourceType Init" ? [
        {
          FilterName: "Resource",
          FilterValue: params?.ResourceId,
        }
      ] : params?.messageType === "Trip Log Incident ID Init" ? [
        {
          FilterName: "TripID",
          FilterValue: params?.TripID,
        }
      ] : params?.messageType === "Incident Causer Name Init" ? [
        {
          FilterName: "IncidentCausedBy",
          FilterValue: (params?.IncidentCausedBy || '').split('||')[0]?.trim()
        },
        {
          FilterName: "tripplanid",
          FilterValue: params?.IncidentTripId,
        }
      ] : params?.messageType === "Trip status Init" ? [
        {
          FilterName: "ScreenName",
          FilterValue: params?.ScreenName,
        },
      ] :params?.messageType === "Attachment File Category Init" ? [
        // {
        //   FilterName: "ScreenName",
        //   FilterValue: params?.ScreenName,
        // },
      ]:
        [],
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

  // Get master common data
  getMasterLegResourceData: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        "LegID": params?.searchTerm || '',
      },
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

  getPersonalization: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "GetPersonalization",
      },
      SearchCriteria: {
        LevelType: params?.LevelType || "User",
        LevelKey: params?.LevelKey || "ramcouser",
        ScreenName: params?.ScreenName || "",
        ComponentName: params?.ComponentName || "",
      },
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.PERSONALIZATION,
      requestBody
    );
    return response.data;
  },

  savePersonalization: async (
    params?: any
  ): Promise<ApiResponse<any>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "SavePersonalization",
      },
      RequestPayload: {
        PersonalizationResult: [
          {
            PersonalizationID: params?.PersonalizationID || 0,
            LevelType: params?.LevelType || "User",
            LevelKey: params?.LevelKey || "ramcouser",
            ScreenName: params?.ScreenName || "",
            ComponentName: params?.ComponentName || "",
            JsonData: params?.JsonData || {},
            IsActive: params?.IsActive || "1",
            CreatedBy: params?.CreatedBy || "admin",
            CreatedOn: params?.CreatedOn || new Date().toISOString(),
            ModifiedBy: params?.ModifiedBy || "ramcouser",
            ModifiedOn: new Date().toISOString(),
            ModeFlag: params?.ModeFlag || "Update"
          }
        ]
      }
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.PERSONALIZATION_SAVE,
      requestBody
    );
    return response.data;
  },

  getMasterCommonDataForIncidnts: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        id: params?.searchTerm || '',
        name: params?.searchTerm || '',
      },
      AdditionalFilter: params?.messageType === "Equipment ID Init" ? [
        {
          FilterName: "EquipmentType",
          FilterValue: params?.EquipmentType,
        },
        {
          FilterName: "ScreenName",
          FilterValue: "Triplog"
        },
        {
          FilterName: "TripId",
          FilterValue: params?.IncidentTripId,
        }
      ] : [],
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
  // Get master common data
  getCommonComboData: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: [
        {
          FilterName: "ContractType",
          FilterValue: params?.type,
        },

        {
          FilterName: "ContractID",
          FilterValue: params?.contractId,
        },
      ],
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
  // Get master common data
  getProductComboData: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        "ProductID": params?.productId,
        "ProductDescription": "",
        "UNCode": "",
        "UNDescription": "",
        "DGClass": "",
        "DGClassDescription": "",
        "NHMCode": "",
        "NHMDescription": "",
        "ClassOfStores": "",
        "ClassOfStoresDescription": "",
        "Hazardous": "",
        "HazardousDescription": ""
      }
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
  // Get quick order by ID
  getQuickOrder: async (id: string): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Get",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: [
        {
          FilterName: "QuickUniqueID",
          FilterValue: id,
        },
      ],
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.QUICKORDER_GET,
      requestBody
    );
    return response.data;
  },

  // Create new quick order
  createQuickOrder: async (
    data: QuickOrderCreateInput
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const requestBody = {
      RequestData: {
        context: {
          MessageID: "121215",
          MessageType: "n",
          UserID: "ramcouser",
          OUID: userContext.ouId,
          Role: userContext.roleName,
        },
        RequestHeader: {
          RefDocNo: "TRIP01",
          RefDocType: "Trip",
          ResourceType: "Equipment",
          PlanningProfile: "EP01",
          AdditionalFilter: [
            {
              FilterName: "FromDate",
              FilterValue: "2025-01-01",
            },
            {
              FilterName: "ToDate",
              FilterValue: "2025-12-12",
            },
            {
              FilterName: "EquipmentType",
              FilterValue: "",
            },
            {
              FilterName: "EquipmentStatus",
              FilterValue: "",
            },
            {
              FilterName: "EquipmentContract",
              FilterValue: "",
            },
            {
              FilterName: "ContractAgent",
              FilterValue: "",
            },
            {
              FilterName: "EquipmentGroup",
              FilterValue: "",
            },
            {
              FilterName: "EquipmentOwner",
              FilterValue: "",
            },
          ],
        },
      },
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.CREATE,
      requestBody
    );
    return response.data;
  },

  // Update quick order
  updateQuickOrder: async (
    id: string,
    data: QuickOrderUpdateInput
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Update",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      QuickUniqueID: id,
      data: data,
    };

    const response = await apiClient.put(
      API_ENDPOINTS.QUICK_ORDERS.UPDATE(id),
      requestBody
    );
    return response.data;
  },

  // Delete quick order
  deleteQuickOrder: async (id: string): Promise<ApiResponse<void>> => {
    const userContext = getUserContext();
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Delete",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: [
        {
          FilterName: "QuickUniqueID",
          FilterValue: id,
        },
      ],
    };

    const response = await apiClient.delete(
      API_ENDPOINTS.QUICK_ORDERS.DELETE(id),
      { data: requestBody }
    );
    return response.data;
  },

  // Approve quick order
  screenFetchQuickOrder: async (
    fetchId: any
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Get",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: [
        {
          FilterName: "QuickUniqueID",
          FilterValue: fetchId,
        },
      ],
    });

    const requestBody = {
      RequestData: requestPayload,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.SCREEN_FETCH,
      requestBody
    );
    return response.data;
  },

  // Update quick order
  updateQuickOrderResource: async (
    // id: string,
    data: QuickOrderUpdateInput
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Update",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      MessageContents: [{
        UniqueID: "123455",
        QuickOrder: data,
      }]
    });
    const requestBody = {
      // context: {
      //   MessageID: "12345",
      //   MessageType: "Quick Order Update",
      //   UserID: "ramcouser",
      //   OUID: 4,
      //   Role: "ramcorole",
      // },
      // MessageContents: {
      //   UniqueID: "",
      //   QuickOrder: data
      // }
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.ORDERFORM,
      requestBody
    );
    return response.data;
  },

  // Update quick order
  UpdateStatusQuickOrderResource: async (
    // id: string,
    data: QuickOrderUpdateInput, messageType
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    console.log("messageType ", messageType);
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: messageType.messageType,
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      MessageContents: [{
        UniqueID: "123455",
        QuickOrder: data,
      }]
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.ORDERFORM,
      requestBody
    );
    return response.data;
  },

  // Update quick order
  updateAttachmentQuickOrderResource: async (
    data: FormData | QuickOrderUpdateInput
    // data: JSON | QuickOrderUpdateInput
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    // Here we are getting the file uploaded details and want to send the data to API headers
    console.log("Upload Doc---", data);
    // console.log("Upload Doc---", headers);

    let requestBody: any;
    let headers: any = {};

    // Check if data is FormData (file upload) or regular object
    if (data instanceof FormData) {
      // For file uploads, send FormData directly
      requestBody = data;
      // Set appropriate headers for file upload
      // headers = {
      //   'Content-Type': 'multipart/form-data',
      // };
      headers = {
        "accept": "text/plain",
        "Is_JSON_Format": "true",
        "Content-Type": "multipart/form-data",
      };
    } else {

      // For regular data, wrap in RequestData
      // requestBody = {
      //   RequestData: data,
      // };
      requestBody = { data }

    }

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.UPLOADFILES,
      requestBody,
      { headers }
    );
    // return response.data, headers;
    return response.data;
  },
  // Update quick order
  downloadAttachmentQuickOrder: async (
    downloaddata: any
    // data: JSON | QuickOrderUpdateInput
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    // Here we are getting the file uploaded details and want to send the data to API headers
    console.log("Download Doc---", downloaddata);
    // console.log("Upload Doc---", headers);

    let requestBody: any;
    let headers: any = {};

    // Check if data is FormData (file upload) or regular object
    // if (data instanceof FormData) {
    let body: any = JSON.stringify(downloaddata);
    headers = {
      "accept": "text/plain",
      "Is_JSON_Format": "true",
      "Content-Type": "application/json",
      "Accept": "application/json",
      "context-lang-id": "1",
      "context-ou-id": userContext.ouId,
      "context-role-name": userContext.roleName,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.DOWNLOADFILE,
      body,
      { headers }
    );
    // return response.data, headers;
    return response.data;
  },
  // updateAttachmentQuickOrderResource: async (
  //   // data: FormData | QuickOrderUpdateInput
  //   data: JSON | QuickOrderUpdateInput
  // ): Promise<ApiResponse<QuickOrder>> => {
  //   const userContext = getUserContext();
  //   console.log("Upload Doc---", data);

  //   let requestBody: any;
  //   let headers: any = {};

  //   // if (data instanceof) {
  //     requestBody = data;
  //     headers = {
  //       'Content-Type': 'application/json',
  //     // };
  //   // } else {
  //   //   // For regular data, wrap in RequestData
  //   //   requestBody = {
  //   //     RequestData: data,
  //   //   };
  //   }

  //   const response = await apiClient.post(
  //     API_ENDPOINTS.QUICK_ORDERS.UPLOADFILES,
  //     requestBody,
  //     { headers }
  //   );
  //   // return response.data, headers;
  //   return response.data;
  // },

  // Update quick order
  updateQuickOrderAttachment: async (
    // id: string,
    data: QuickOrderUpdateInput
  ): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Update",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      MessageContents: [{
        UniqueID: "123455",
        QuickOrder: data,
      }]
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.ORDERFORM,
      requestBody
    );
    return response.data;
  },

  // Get master common data
  getLinkedOrdersData: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params2 ---", params);
    const userContext = getUserContext();
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "QuickOrder-Show Linked Order",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        // QuickOrderNo: "291-SELL",
        // OrderType: "SELL",
        QuickOrderNo: params?.OrderNo || "",
        OrderType: params?.OrderType || "",
        AdditionalFilter: [
          {
            FilterName: "EXTRA",
            FilterValue: ""
          }
        ],
      },
      Pagination: {
        PageNumber: 1,
        PageSize: 100,
      },
    });
    const requestBody = {
      RequestData: stringifyData,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.LINKEDORDERS_GET,
      requestBody
    );
    return response.data;
  },

  // Get dynamic search criteria data
  getDynamicSearchData: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    const userContext = getUserContext();
    console.log("dynamic params ---", params);
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: params?.searchCriteria || {},
      AdditionalFilter: params?.messageType === "Contract Init" ? [
        {
          FilterName: "ContractType",
          FilterValue: params?.OrderType,
        },
        {
          FilterName: "ContractID",
          FilterValue: params?.ContractId
        }
      ] : params?.messageType === "Equipment ID Init" ? [
        {
          FilterName: "EquipmentType",
          FilterValue: params?.EquipmentType,
        }
      ] : params?.messageType === "ResourceType Init" ? [
        {
          FilterName: "Resource",
          FilterValue: params?.ResourceId,
        }
      ] : params?.additionalFilter || [],
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

  // Get quick order with Number change
  getQuickOrderWithNoChange: async (QuickOrderNo: string): Promise<ApiResponse<QuickOrder>> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Get",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      AdditionalFilter: [
        {
          FilterName: "QuickOrderNo",
          FilterValue: QuickOrderNo,
        },
      ],
    });
    const requestBody = {
      RequestData: requestPayload,
    };
    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.QUICKORDER_GET,
      requestBody
    );
    return response.data;
  },

  fetOperationFromTypeOfAction: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        TypeOfAction: params?.TypeOfAction || "",
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

  fetServiceModeDetails: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "WorkOrder-GetServiceMode",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        TypeOfAction: params?.TypeOfAction || "",
        OperationType: params?.OperationType || "",
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

  fetCUUCode: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params1 ---", params);
    const userContext = getUserContext();
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
      },
      SearchCriteria: {
        "CUUCode": "",
      },
      AdditionalFilter: []
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
};
