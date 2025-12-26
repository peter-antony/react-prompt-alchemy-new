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
};
