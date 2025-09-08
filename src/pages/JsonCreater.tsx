import { useEffect } from 'react';
import jsonStore from '@/stores/jsonStore';
import { useNavigate } from 'react-router-dom';

const QUICK_ORDER_JSON = {
  "ResponseResult": {
    "QuickOrder": {
      "QuickUniqueID": "",
      "OrderType": "BUY",
      "QuickOrderNo": "",
      "QuickOrderDate": "2022-06-16T00:00:00",
      "Vendor": "",
      "Contract": "",
      "Customer": "",
      "Cluster": "",
      "Currency": "EUR  ",
      "CustomerQuickOrderNo": "",
      "Customer_Supplier_RefNo": "",
      "QCUserDefined1": "",
      "Remark1": "",
      "Summary": "",
      "WBS": "",
      "QCUserDefined2": "",
      "QCUserDefined3": "",
      "Remarks2": "",
      "Remarks3": "",
      "Status": "Fresh",
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

const Resource_Group_JSON = {
  "ResourceUniqueID": -1,
  "ModeFlag": "Insert",
  "ResourceStatus": "Fresh",
  "BasicDetails": {
    "Resource": "Equipment",
    "ResourceType": "20FT Container",
    "ServiceType": "SINGLE CONTAINER TRANSPORT",
    "SubSericeType": ""
  },
  "OperationalDetails": {
    "OperationalLocation": "FWDS_GMBH",
    "OperationalLocationDesc": "Forwardis GMBH",
    "DepartPoint": "value",
    "ArrivalPoint": "value",
    "FromDate": "2022-01-03",
    "FromTime": "20:00:00",
    "ToDate": "2022-01-10",
    "ToTime": "23:12:00",
    "Remarks": ""
  },
  "BillingDetails": {
    "DraftBillNo": "",
    "ContractPrice": null,
    "NetAmount": 0,
    "BillingType": "Wagon",
    "BillingQty": "",
    "UnitPrice": 250,
    "DraftBillStatus": null,
    "Tariff": null,
    "TariffTypeDescription": null,
    "TariffIDDescription": null,
    "TariffType": "",
    "BillingRemarks": "",
    "InternalOrderNo": null
  },
  "MoreRefDocs": [

  ],
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
    "WagonType": "value",
    "WagonID": "value",
    "WagonQuantity": 2,
    "WagonQuantityUOM": null,
    "WagonTareWeight": 233.4,
    "WagonTareWeightUOM": null,
    "WagonGrossWeight": 233.4,
    "WagonGrossWeightUOM": null,
    "WagonLength": "12",
    "WagonLengthUOM": null,
    "WagonSequence": 1
  },
  "ContainerDetails": {
    "ContainerType": "value",
    "ContainerID": "value",
    "ContainerQuantity": 2,
    "ContainerQuantityUOM": null,
    "ContainerTareWeight": 3.444,
    "ContainerTareWeightUOM": null,
    "ContainerLoadWeight": 455.55,
    "ContainerLoadWeightUOM": null
  },
  "ProductDetails": {
    "ContainHazardousGoods": "value",
    "NHM": "value",
    "ProductID": "value",
    "ProductQuantity": 10,
    "ProductQuantityUOM": null,
    "ClassofStores": "value",
    "UNCode": "value",
    "DGClass": "value"
  },
  "THUDetails": {
    "THUID": "value",
    "THUSerialNo": "value",
    "THUQuantity": 12,
    "THUQuantityUOM": null,
    "THUWeight": 333.3,
    "THUWeightUOM": null
  },
  "JourneyAndSchedulingDetails": {
    "Departure": "value",
    "Arrival": "value",
    "ActivityLocation": "value",
    "Activity": "value",
    "PlannedDateTime": "2020-01-03T00:00:00",
    "RevPlannedDateTime": "2023-04-02T00:00:00",
    "TrainNo": "value",
  },
  "OtherDetails": {
    "FromDate": "2020-01-03",
    "FromTime": "12:00:00",
    "ToDate": "2020-01-03",
    "ToTime": "12:00:00",
    "QCUserDefined1": "value",
    "QCUserDefined2": "value",
    "QCUserDefined3": "value",
    "Remarks1": "value",
    "Remarks2": "value",
    "Remarks3": "value"
  }

};

const Actual_Details_JSON = {
  "ActualLineUniqueID": "",
  "ActualSeqNo": "",
  "ModeFlag": "Insert/Update/Delete/NoChange",
  "WagonDetails": {
    "WagonType": "",
    "WagonID": "",
    "WagonQuantity": "",
    "WagonTareWeight": "",
    "WagonGrossWeight": "",
    "WagonLength": "",
    "WagonSequence": ""
  },
  "ContainerDetails": {
    "ContainerType": "",
    "ContainerID": "",
    "ContainerQuantity": "",
    "ContainerTareWeight": "",
    "ContainerLoadWeight": ""
  },
  "ProductDetails": {
    "ContainHazardousGoods": "",
    "NHM": "",
    "ProductID": "",
    "ProductQuantity": "",
    "ClassofStores": "",
    "UNCode": "",
    "DGClass": ""
  },
  "THUDetails": {
    "THUID": "",
    "THUSerialNo": "",
    "THUQuantity": "",
    "THUWeight": ""
  },
  "JourneyAndSchedulingDetails": {
    "Departure": "",
    "Arrival": "",
    "ActivityLocation": "",
    "Activity": "",
    "PlannedDateTime": "",
    "RevPlannedDateTime": "",
    "TrainNo": "",
    "LoadType": ""
  },
  "OtherDetails": {
    "FromDate": "",
    "FromTime": "",
    "ToDate": "",
    "ToTime": "",
    "QCUserDefined1": "",
    "QCUserDefined2": "",
    "QCUserDefined3": "",
    "Remarks1": "",
    "Remarks2": "",
    "Remarks3": ""
  }

};

export function initializeJsonStore() {
  localStorage.setItem('resouceCount', '0');
  localStorage.setItem('planCount', '0');
  localStorage.setItem('actualCount', '0');
  jsonStore.setJsonData(QUICK_ORDER_JSON);
  jsonStore.setResourceJsonData(Resource_Group_JSON);
  jsonStore.setPlanDetailsJson(Plan_Details_JSON);
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