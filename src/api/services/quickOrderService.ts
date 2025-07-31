import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse, QueryParams } from '../types';

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
  getQuickOrders: async (params?: QueryParams): Promise<PaginatedResponse<QuickOrder>> => {
    // Prepare the request body in the required format
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Hub Search",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole"
      },
      AdditionalFilter: params?.filters ? Object.entries(params.filters).map(([key, value]) => ({
        FilterName: key,
        FilterValue: String(value)
      })) : []
    };

    const response = await apiClient.post(API_ENDPOINTS.QUICK_ORDERS.LIST, requestBody);
    return response.data;
  },

  // Get single quick order
  getQuickOrder: async (id: string): Promise<ApiResponse<QuickOrder>> => {
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Get",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole"
      },
      AdditionalFilter: [
        {
          FilterName: "QuickUniqueID",
          FilterValue: id
        }
      ]
    };

    const response = await apiClient.post(`${API_ENDPOINTS.QUICK_ORDERS.LIST}/get`, requestBody);
    return response.data;
  },

  // Create new quick order
  createQuickOrder: async (data: QuickOrderCreateInput): Promise<ApiResponse<QuickOrder>> => {
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Create",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole"
      },
      data: data
    };

    const response = await apiClient.post(API_ENDPOINTS.QUICK_ORDERS.CREATE, requestBody);
    return response.data;
  },

  // Update quick order
  updateQuickOrder: async (id: string, data: QuickOrderUpdateInput): Promise<ApiResponse<QuickOrder>> => {
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Update",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole"
      },
      QuickUniqueID: id,
      data: data
    };

    const response = await apiClient.put(API_ENDPOINTS.QUICK_ORDERS.UPDATE(id), requestBody);
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
        Role: "ramcorole"
      },
      AdditionalFilter: [
        {
          FilterName: "QuickUniqueID",
          FilterValue: id
        }
      ]
    };

    const response = await apiClient.delete(API_ENDPOINTS.QUICK_ORDERS.DELETE(id), { data: requestBody });
    return response.data;
  },

  // Approve quick order
  approveQuickOrder: async (id: string): Promise<ApiResponse<QuickOrder>> => {
    const requestBody = {
      context: {
        MessageID: "12345",
        MessageType: "Quick Order Approve",
        UserID: "ramcouser",
        OUID: 4,
        Role: "ramcorole"
      },
      AdditionalFilter: [
        {
          FilterName: "QuickUniqueID",
          FilterValue: id
        }
      ]
    };

    const response = await apiClient.post(API_ENDPOINTS.QUICK_ORDERS.APPROVE(id), requestBody);
    return response.data;
  },
}; 