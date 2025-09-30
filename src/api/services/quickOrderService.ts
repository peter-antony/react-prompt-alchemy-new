import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
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

export interface QuickOrderUpdateInput extends Partial<QuickOrderCreateInput> {}

export const quickOrderService = {
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
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Hub Search",
        UserID: "ramcouser",
        OUID: "4",
        Role: "ramcorole",
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
    const stringifyData: any = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: "4",
        Role: "ramcorole",
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
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: params?.messageType || "",
        UserID: "ramcouser",
        OUID: "4",
        Role: "ramcorole",
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
  // Get quick order by ID
  getQuickOrder: async (id: string): Promise<ApiResponse<QuickOrder>> => {
    const requestPayload = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Get",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole",
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
    const requestBody = {
      RequestData: {
        context: {
          MessageID: "121215",
          MessageType: "n",
          UserID: "ramcouser",
          OUID: "4",
          Role: "ramcorole",
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
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Update",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole",
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
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Delete",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole",
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
    const requestPayload = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Get",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole",
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
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Update",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole",
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
    console.log("messageType ", messageType);
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: messageType.messageType,
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole",
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
    // id: string,
    // data: QuickOrderUpdateInput, headers
    data: QuickOrderUpdateInput
  ): Promise<ApiResponse<QuickOrder>> => {
    // Here we are getting the file uploaded details and want to send the data to API headers
    console.log("Upload Doc---", data);
    // console.log("Upload Doc---", headers);

    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Update",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole",
      },
      MessageContents: [{
        UniqueID: "123455",
        QuickOrder: data,
      }]
    });

    const requestBody = {
      RequestData: stringifyData,
      // headers: {
      //   "Content-Type": headers.headers.X_Attachment_Type,          // e.g. application/pdf
      //   "X-File-Name": headers.headers.X_Attachment_Name,           // custom header with file name
      //   // "X-File-Category": "BR Amendment",  // your extra metadata
      //   // Authorization: `Bearer ${localStorage.getItem("token")}`
      // },
    };

    // Pass the headers to the API call by returning them along with the requestBody
    // The actual usage of headers will be in the apiClient.post call outside this selection
    // return { requestBody, headers };

    const response = await apiClient.post(
      API_ENDPOINTS.QUICK_ORDERS.ORDERFORM,
      requestBody
    );
    // return response.data, headers;
    return response.data;
  },

  // Get master common data
  getLinkedOrdersData: async (
    params?: any
  ): Promise<PaginatedResponse<QuickOrder>> => {
    console.log("params2 ---", params);
    const stringifyData = JSON.stringify({
      context: {
        MessageID: "12345",
        MessageType: "QuickOrder-Show Linked Order",
        UserID: "ramcouser",
        OUID: "4",
        Role: "ramcorole",
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
};
