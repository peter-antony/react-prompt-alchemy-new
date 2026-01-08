import { apiClient } from "@/api/client";
import { API_ENDPOINTS, getUserContext } from "@/api/config";
import { ApiResponse } from "../types";

export const draftBillService = {
    // Draft Bill Hub Search API, fetching grid data
    getDraftBillsForHub: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Hub Search"
            },
            SearchCriteria: params?.searchCriteria,
            Pagination: {
                PageNumber: params?.pagination?.pageNumber || 1,
                PageSize: params?.pagination?.pageSize || 10
            }
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.SEARCH,
            requestBody
        );
        return response.data;
    },

    // Draft Bill Hub Search API, fetching grid data
    getDraftBillByID: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Get"
            },
            SearchCriteria: params?.searchCriteria,
            Pagination: {
                PageNumber: params?.pagination?.pageNumber || 1,
                PageSize: params?.pagination?.pageSize || 10
            }
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.DRAFT_GET,
            requestBody
        );
        return response.data;
    },

    // Draft Bill Hub Search API, fetching grid data
    saveDraftBillByID: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Save"
            },
            RequestPayload: params,
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.SAVE_DRAFT,
            requestBody
        );
        return response.data;
    },


    cancelDraftBillByID: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Cancel"
            },
            RequestPayload: params,
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.CANCEL_DRAFT,
            requestBody
        );
        return response.data;
    },

      amendDraftBillByID: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Amend"
            },
            RequestPayload: params,
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.AMEND_DRAFT,
            requestBody
        );
        return response.data;
    },

     approveDraftBillByID: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Approve"
            },
            RequestPayload: params,
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.APPROVE_DRAFT,
            requestBody
        );
        return response.data;
    },

    generateInvoiceBill: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Generate Invoice"
            },
            RequestPayload: params,
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.GENERATE_INVOICE,
            requestBody
        );
        return response.data;
    },

      revertDraftBillByID: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Revert"
            },
            RequestPayload: params,
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.REVERT_DRAFT,
            requestBody
        );
        return response.data;
    },

    reRuntDraftBillByID: async (params?: any): Promise<any> => {
        const userContext = getUserContext();

        const requestPayload = JSON.stringify({
            context: {
                UserID: "RAMCOUSER", // Fixed as per requirements
                OUID: userContext.ouId,
                Role: userContext.roleName,
                MessageID: "12345",
                MessageType: "DraftBill-Rerun"
            },
            RequestPayload: params,
        });

        const requestBody = {
            RequestData: requestPayload,
        };

        const response = await apiClient.post(
            API_ENDPOINTS.DRAFT_BILL.RERUN_DRAFT,
            requestBody
        );
        return response.data;
    },
};
