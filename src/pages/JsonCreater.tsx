import { useEffect } from 'react';
import jsonStore from '@/stores/jsonStore';
import { useNavigate } from 'react-router-dom';

const QUICK_ORDER_BASIC_JSON = {
  "ResponseResult": {
    "QuickOrder": {
      "QuickUniqueID": "",
      "OrderType": "BUY",
      "QuickOrderNo": "",
      "QuickOrderDate": "",
      "Vendor": "",
      "Contract": "",
      "Customer": "",
      "Cluster": "",
      "Currency": "EUR  ",
      "CustomerQuickOrderNo": "",
      "Customer_Supplier_RefNo": "",
      "QCUserDefined1": "",
      "QCUserDefined1Value": "",
      "Remark1": "",
      "Summary": "",
      "WBS": "",
      "QCUserDefined2": "",
      "QCUserDefined2Value": "",
      "QCUserDefined3": "",
      "QCUserDefined3Value": "",
      "Remarks2": "",
      "Remarks3": "",
      "Status": "",
      // "Status": "Save/Confirm/UnderAmend",
      "ModeFlag": "Insert",
      "ResourceGroup": [

      ],
      "AmendmentHistory": [
        {
          "AmendmentNo": 1,
          "username": "ramcouser",
          "updTime": "2024-01-01",
          "reasoncode": "Customer request"
        }
      ],
      "Attachments": {
        "TotalAttachment": "0",
        "AttachItems": [
        ]
      }
    }
  }
}

const Resource_Group_BASIC_JSON = {
  "ResourceUniqueID": -1,
  "ModeFlag": "Insert",
  "ResourceStatus": "Fresh",
  "BasicDetails": {
    "Resource": "",
    "ResourceDescription": "",
    "ResourceType": "",
    "ResourceTypeDescription": "",
    "ServiceType": "",
    "ServiceTypeDescription": "",
    "SubServiceType": "",
    "SubServiceTypeDescription": ""
  },
  "OperationalDetails": {
    "OperationalLocation": "",
    "OperationalLocationDesc": "",
    "DepartPoint": "",
    "DepartPointDescription": "",
    "ArrivalPoint": "",
    "ArrivalPointDescription": "",
    "FromDate": "",
    "FromTime": "",
    "ToDate": "",
    "ToTime": "",
    "Remarks": ""
  },
  "BillingDetails": {
    "DraftBillNo": "",
    "ContractPrice": null,
    "NetAmount": '',
    "BillingType": "",
    "BillingQty": '',
    "UnitPrice": '',
    "DraftBillStatus": null,
    "Tariff": null,
    "TariffIDDescription": null,
    "TariffType": "",
    "TariffTypeDescription": null,
    "BillingRemarks": "",
    "InternalOrderNo": null
  },
  "MoreRefDocs": {
    "PrimaryDocType": null,
    "PrimaryDocNo": null,
    "PrimaryDocDate": null,
    "SecondaryDocType": null,
    "SecondaryDocNo": null,
    "SecondaryDocDate": null,
    "AddtionalMoreRefDocs": []
  },
  "Attachments": {
    "TotalAttachment": "0",
    "AttachItems": [
    ]
  },
  "PlanDetails": [

  ],
  "ActualDetails": [

  ]
};

const QUICK_ORDER_JSON = {
  "ResponseResult": {
    "QuickOrder": {
      "QuickUniqueID": "",
      "OrderType": "BUY",
      "QuickOrderNo": "",
      "QuickOrderDate": "",
      "Vendor": "",
      "Contract": "",
      "Customer": "",
      "Cluster": "",
      "Currency": "EUR  ",
      "CustomerQuickOrderNo": "",
      "Customer_Supplier_RefNo": "",
      "QCUserDefined1": "",
      "QCUserDefined1Value": "",
      "Remark1": "",
      "Summary": "",
      "WBS": "",
      "QCUserDefined2": "",
      "QCUserDefined2Value": "",
      "QCUserDefined3": "",
      "QCUserDefined3Value": "",
      "Remarks2": "",
      "Remarks3": "",
      "Status": "",
      // "Status": "Save/Confirm/UnderAmend",
      "ModeFlag": "Insert",
      "ResourceGroup": [

      ],
      "AmendmentHistory": [
        {
          "AmendmentNo": 1,
          "username": "ramcouser",
          "updTime": "2024-01-01",
          "reasoncode": "Customer request"
        }
      ],
      "Attachments": {
        "TotalAttachment": "0",
        "AttachItems": [
        ]
      }
    }
  }
}

const Plan_Details_BASIC_JSON = {
  "PlanLineUniqueID": -1,
  "PlanSeqNo": "",
  "ModeFlag": "Insert/Update/Delete/NoChange",
  "WagonDetails": {
    "WagonType": "",
    "WagonID": "",
    "WagonQuantity": 0,
    "WagonQuantityUOM": "",
    "WagonTareWeight": 0,
    "WagonTareWeightUOM": "",
    "WagonGrossWeight": 0,
    "WagonGrossWeightUOM": "",
    "WagonLength": 0,
    "WagonLengthUOM": "",
    "WagonSequence": ""
  },
  "ContainerDetails": {
    "ContainerType": "",
    "ContainerID": "",
    "ContainerQuantity": 0,
    "ContainerQuantityUOM": "",
    "ContainerTareWeight": 0,
    "ContainerTareWeightUOM": "",
    "ContainerLoadWeight": 0,
    "ContainerLoadWeightUOM": ""
  },
  "ProductDetails": {
    "ContainHazardousGoods": "",
    "NHM": "",
    "ProductID": "",
    "ProductQuantity": 0,
    "ProductQuantityUOM": "",
    "ContainerTareWeight": "",
    "UNCode": "",
    "DGClass": ""
  },
  "THUDetails": {
    "THUID": "",
    "THUSerialNo": "",
    "THUQuantity": 0,
    "THUQuantityUOM": "",
    "THUWeight": 0,
    "THUWeightUOM": ""
  },
  "JourneyAndSchedulingDetails": {
    "Departure": "",
    "Arrival": "",
    "ActivityLocation": "",
    "Activity": "",
    "PlannedDateTime": "",
    "RevPlannedDateTime": "",
    "TrainNo": "",
  },
  "OtherDetails": {
    "FromDate": "",
    "FromTime": "12:00:00",
    "ToDate": "",
    "ToTime": "12:00:00",
    "QCUserDefined1": "",
    "QCUserDefined1Value": "",
    "QCUserDefined2": "",
    "QCUserDefined2Value": "",
    "QCUserDefined3": "",
    "QCUserDefined3Value": "",
    "Remarks1": "",
    "Remarks2": "",
    "Remarks3": ""
  }

};

const Resource_Group_JSON = {
  "ResourceUniqueID": -1,
  "ModeFlag": "Insert",
  "ResourceStatus": "Fresh",
  "BasicDetails": {
    "Resource": "",
    "ResourceDescription": "",
    "ResourceType": "",
    "ResourceTypeDescription": "",
    "ServiceType": "",
    "ServiceTypeDescription": "",
    "SubServiceType": "",
    "SubServiceTypeDescription": ""
  },
  "OperationalDetails": {
    "OperationalLocation": "",
    "OperationalLocationDesc": "",
    "DepartPoint": "",
    "DepartPointDescription": "",
    "ArrivalPoint": "",
    "ArrivalPointDescription": "",
    "FromDate": "",
    "FromTime": "",
    "ToDate": "",
    "ToTime": "",
    "Remarks": ""
  },
  "BillingDetails": {
    "DraftBillNo": "",
    "ContractPrice": null,
    "NetAmount": '',
    "BillingType": "",
    "BillingQty": '',
    "UnitPrice": '',
    "DraftBillStatus": null,
    "Tariff": null,
    "TariffIDDescription": null,
    "TariffType": "",
    "TariffTypeDescription": null,
    "BillingRemarks": "",
    "InternalOrderNo": null
  },
  "MoreRefDocs": {
    "PrimaryDocType": null,
    "PrimaryDocNo": null,
    "PrimaryDocDate": null,
    "SecondaryDocType": null,
    "SecondaryDocNo": null,
    "SecondaryDocDate": null,
    "AddtionalMoreRefDocs": []
  },
  "Attachments": {
    "TotalAttachment": "0",
    "AttachItems": [
    ]
  },
  "PlanDetails": [

  ],
  "ActualDetails": [

  ]
};

const Plan_Details_JSON = {
  "PlanLineUniqueID": -1,
  "PlanSeqNo": "",
  "ModeFlag": "Insert/Update/Delete/NoChange",
  "WagonDetails": {
    "WagonType": "",
    "WagonID": "",
    "WagonQuantity": 0,
    "WagonQuantityUOM": "",
    "WagonTareWeight": 0,
    "WagonTareWeightUOM": "",
    "WagonGrossWeight": 0,
    "WagonGrossWeightUOM": "",
    "WagonLength": 0,
    "WagonLengthUOM": "",
    "WagonSequence": ""
  },
  "ContainerDetails": {
    "ContainerType": "",
    "ContainerID": "",
    "ContainerQuantity": 0,
    "ContainerQuantityUOM": "",
    "ContainerTareWeight": 0,
    "ContainerTareWeightUOM": "",
    "ContainerLoadWeight": 0,
    "ContainerLoadWeightUOM": ""
  },
  "ProductDetails": {
    "ContainHazardousGoods": "",
    "NHM": "",
    "ProductID": "",
    "ProductQuantity": 0,
    "ProductQuantityUOM": "",
    "ContainerTareWeight": "",
    "UNCode": "",
    "DGClass": ""
  },
  "THUDetails": {
    "THUID": "",
    "THUSerialNo": "",
    "THUQuantity": 0,
    "THUQuantityUOM": "",
    "THUWeight": 0,
    "THUWeightUOM": ""
  },
  "JourneyAndSchedulingDetails": {
    "Departure": "",
    "Arrival": "",
    "ActivityLocation": "",
    "Activity": "",
    "PlannedDateTime": "",
    "RevPlannedDateTime": "",
    "TrainNo": "",
  },
  "OtherDetails": {
    "FromDate": "",
    "FromTime": "12:00:00",
    "ToDate": "",
    "ToTime": "12:00:00",
    "QCUserDefined1": "",
    "QCUserDefined1Value": "",
    "QCUserDefined2": "",
    "QCUserDefined2Value": "",
    "QCUserDefined3": "",
    "QCUserDefined3Value": "",
    "Remarks1": "",
    "Remarks2": "",
    "Remarks3": ""
  }

};

const Actual_Details_JSON = {
  "ActualLineUniqueID": "",
  "ActualSeqNo": "",
  "ModeFlag": "Insert/Update/Delete/NoChange",
  "WagonDetails": {
    "WagonType": "",
    "WagonID": "",
    "WagonQuantity": 0,
    "WagonQuantityUOM": null,
    "WagonTareWeight": 0,
    "WagonTareWeightUOM": null,
    "WagonGrossWeight": 0,
    "WagonGrossWeightUOM": null,
    "WagonLength": 0,
    "WagonLengthUOM": null,
    "WagonSequence": 0
  },
  "ContainerDetails": {
    "ContainerType": "",
    "ContainerID": "",
    "ContainerQuantity": 0,
    "ContainerQuantityUOM": null,
    "ContainerTareWeight": 0,
    "ContainerTareWeightUOM": null,
    "ContainerLoadWeight": 0,
    "ContainerLoadWeightUOM": null
  },
  "ProductDetails": {
    "ContainHazardousGoods": "",
    "NHM": "",
    "ProductID": "",
    "ProductQuantity": 0,
    "ProductQuantityUOM": null,
    "ContainerTareWeight": "",
    "UNCode": "",
    "DGClass": ""
  },
  "THUDetails": {
    "THUID": "",
    "THUSerialNo": "",
    "THUQuantity": 0,
    "THUQuantityUOM": null,
    "THUWeight": 0,
    "THUWeightUOM": null
  },
  "JourneyAndSchedulingDetails": {
    "Departure": "",
    "Arrival": "",
    "ActivityLocation": "",
    "Activity": "",
    "PlannedDateTime": "",
    "RevPlannedDateTime": "",
    "TrainNo": "",
  },
  "OtherDetails": {
    "FromDate": "",
    "FromTime": "12:00:00",
    "ToDate": "",
    "ToTime": "12:00:00",
    "QCUserDefined1": "",
    "QCUserDefined1Value": "",
    "QCUserDefined2": "",
    "QCUserDefined2Value": "",
    "QCUserDefined3": "",
    "QCUserDefined3Value": "",
    "Remarks1": "",
    "Remarks2": "",
    "Remarks3": ""
  }

};

export function initializeJsonStore() {
  localStorage.setItem('resouceCount', '0');
  localStorage.setItem('planCount', '0');
  localStorage.setItem('actualCount', '0');
  jsonStore.setJsonData(QUICK_ORDER_BASIC_JSON);
  jsonStore.setResourceJsonData(Resource_Group_BASIC_JSON);
  jsonStore.setPlanDetailsJson(Plan_Details_BASIC_JSON);
}

const JsonCreater: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    console.log("RESETTING JSON");
    localStorage.setItem('resouceCount', '0');
    localStorage.setItem('planCount', '0');
    localStorage.setItem('actualCount', '0');
    jsonStore.setJsonData(QUICK_ORDER_JSON);
    jsonStore.setResourceJsonData(Resource_Group_JSON);
    jsonStore.setPlanDetailsJson(Plan_Details_JSON);
    console.log("QUICK ORDER JSON AFTER RESET : ", jsonStore.getJsonData());
    // navigate('/create-quick-order');
    navigate('/quick-order');
  }, [navigate]);
  return null;
};

export default JsonCreater; 