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
      "Vendor": "011909",
      "Contract": "CON000000116",
      "Customer": "",
      "Cluster": "",
       "Currency": "EUR  ",
      "CustomerQuickOrderNo": "",
      "Customer_Supplier_RefNo": "",
      "QCUserDefined1": "",
      "Remark1": "",
      "Summary": "",
      "WBS": "DE17BAS843",
      "QCUserDefined2": "",
      "QCUserDefined3": "",
      "Remarks2": "",
      "Remarks3": "",
      "Status": "Fresh",
      // "Status": "Save/Confirm/UnderAmend",
      "ModeFlag": "Insert/Update/Delete/NoChange",
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
  "ModeFlag": "Insert/Update/Delete/NoChange",
  "ResourceStatus": "Save/Confirm/UnderAmend",
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
    "ContractPrice": 1200,
    "NetAmount": 300,
    "BillingType": "Wagon",
    "BillingQty": "",
    "UnitPrice": 250,
    "DraftBillStatus": null,
    "Tariff": "YP_BUY60_IO",
    "TariffTypeDescription": null,
    "TariffIDDescription": null,
    "TariffType": "Additional Labour Charges",
    "BillingRemarks": "",
    "InternalOrderNo": "INO/2021/00000350"
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
  "PlanLineUniqueID": "WG0",
  "PlanSeqNo": "",
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