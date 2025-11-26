import { apiClient } from "@/api/client";
import { API_CONFIG,API_ENDPOINTS,getUserContext } from "@/api/config";

export const workOrderService = {
  searchWorkOrders: async (params?: any): Promise<any> => {
    const userContext = getUserContext();

    // Build the final payload in STRING format
    const requestPayload = JSON.stringify({
     
    "context": {
        "UserID": "ramcouser",
        "Role": "ramcorole",
        "OUID": 4,
        "MessageID": "12345",
        "MessageType": "Work Order Hub Search"
    },
    "SearchCriteria": {
        "WorkOrderNo": "WO12345",
        "WagonContainerID": "WGN5678",
        "WagonOwnerName": "ABC Logistics",
        "SupplierCode": "Supp",
        "SupplierName": "XYZ Supplies Pvt Ltd",
        "SupplierContractNo": "SUP9012",
        "ClusterMarket": "SouthZone",
        "CustomerContractNo": "CUST1122",
        "WorkOrderStatus": "InProgress",
        "WorkOrderFromDate": "2025-08-01",
        "WorkOrderToDate": "2025-08-25",
        "TypeOfAction": "Repair",
        "Operation": "Loading",
        "OperationStatus": "Ongoing",
        "EquipmentCategory": "HeavyMachinery",
        "PlaceOfOperation": "Chennai Port",
        "InvoiceReference": "INV556677",
        "ReInvoicingCostTo": "FinanceDept",
        "AddtionalFilter": [
            {
                "FilterName": "RefDoc2",
                "FilterValue": "23232"
            }
        ]
    },
    "Pagination": {
        "PageNumber": 1,
        "PageSize": 10
    }
,
    });

    // Wrap inside RequestData object (your exact pattern)
    const requestBody = {
      RequestData: requestPayload,
    };

    // API call
    const response = await apiClient.post(
    //   API_ENDPOINTS.WORK_ORDER.SEARCH, 
    `http://192.168.2.92/v1/common/combo` ,
      requestBody
    );

   
    try {
      const parsed = JSON.parse(response.data);
      return parsed;
    } catch (err) {
      console.error("❌ Failed to parse Work Order response:", err);
      return response.data; // fallback
    }
  },

  // Work Order Hub Search API, fetching grid data
  getWorkOrdersForHub: async (params?: any): Promise<any> => {
    const userContext = getUserContext();
    const requestPayload = JSON.stringify({
      context: {
        UserID: "ramcouser",
        OUID: userContext.ouId,
        Role: userContext.roleName,
        MessageID: "12345",
        MessageType: "Work order Hub Search",
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
      API_ENDPOINTS.WORK_ORDER.LIST,
      requestBody
    );
    return response.data;
  },
};
