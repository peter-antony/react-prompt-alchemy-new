import { useEffect } from 'react';
import jsonStore from '@/stores/jsonStore';
import { useNavigate } from 'react-router-dom';

const QUICK_ORDER_JSON = 
  {
    "ResponseResult": {
      "QuickOrder": {
        "QuickUniqueID": "QO/1000034/2025",
        "OrderType": "buy",
        "QuickOrderNo": "",
        "QuickOrderDate": "",
        "Vendor": "",
        "Contract": "",
        "Customer": "",
        "Cluster": "",
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
        "Status": "Confirmed",
        // "Status": "Save/Confirm/UnderAmend",
        "ModeFlag": "Insert/Update/Delete/NoChange",
        "ResourceGroup": [
          {
            "ResourceUniqueID": "1",
            "ModeFlag": "Insert/Update/Delete/NoChange",
            "ResourceStatus": "Save/Confirm/UnderAmend",
            "BasicDetails": {
              "Resource": "Resource1",
              "ResourceType": "BEr",
              "ServiceType": "bbdd",
              "SubSericeType": "sssss"
            },
            "OperationalDetails": {
              "OperationalLocation": "vfds",
              "DepartPoint": "asaddsa",
              "ArrivalPoint": "mnjnmn",
              "FromDate": "24/06/2024",
              "FromTime": "",
              "ToDate": "28/06/2024",
              "ToTime": "",
              "Remarks": "bvbbvbbv"
            },
            "BillingDetails": {
              "DraftBillNo": "DB00023/42",
              "ContractPrice": 1200.00,
              "NetAmount": 5580.00,
              "BillingType": "",
              "UnitPrice": "",
              "BillingQty": "",
              "Tariff": "",
              "TariffType": "",
              "Remarks": "",
              "InteralOrder": "1"
            },
            "MoreRefDocs": [
              {
                "DocCategory": "PrimaryRefDoc",
                "DocType": "Trip Log",
                "DocValue": "TRIP001",
                "DocDate": "2025-01-15 12:23",
                "DocRemarks": ""
              },
              {
                "DocCategory": "SecondaryRefDoc",
                "DocType": "BR",
                "DocValue": "BR001",
                "DocDate": "2025-01-12 12:23",
                "DocRemarks": ""
              },
              {
                "DocCategory": "Others",
                "DocType": "Dispatch Doc",
                "DocValue": "DIS0001",
                "DocDate": "2025-01-14 12:23",
                "DocRemarks": ""
              }
            ],
            "Attachments": {
              "TotalAttachment": "2",
              "AttachItems": [
                {
                  "AttachItemID": "value",
                  "AttachmentType": "PDF",
                  "FileCategory": "",
                  "AttachName": "File.PDF",
                  "AttachUniqueName": "value",
                  "AttachRelPath": "value",
                  "ModeFlag": "Insert/Update/Delete/NoChange"
                }
              ]
            },
            "PlanDetails": [

            ],
            "ActualDetails": [
              
            ]
          }
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
          "TotalAttachment": "2",
          "AttachItems": [
            {
              "AttachItemID": "value",
              "AttachmentType": "PDF",
              "FileCategory": "",
              "AttachName": "File.PDF",
              "AttachUniqueName": "value",
              "AttachRelPath": "value",
              "ModeFlag": "Insert/Update/Delete/NoChange"
            }
          ]
        }
      }
    }
  }

  // const Resource_Group_JSON = 
  //   {
  //     "ResourceUniqueID": "value",
  //     "ModeFlag": "Insert/Update/Delete/NoChange",
  //     "ResourceStatus": "Save/Confirm/UnderAmend",
  //     "BasicDetails": {
  //       "Resource": "Vehicle",
  //       "ResourceType": "Truck 4.2",
  //       "ServiceType": "Block",
  //       "SubSericeType": "Repair"
  //     },
  //     "OperationalDetails": {
  //       "OperationalLocation": "value",
  //       "DepartPoint": "value",
  //       "ArrivalPoint": "value",
  //       "FromDate": "value",
  //       "FromTime": "value",
  //       "ToDate": "value",
  //       "ToTime": "value",
  //       "Remarks": "value"
  //     },
  //     "BillingDetails": {
  //       "DraftBillNo": "value",
  //       "ContractPrice": "value",
  //       "NetAmount": "value",
  //       "BillingType": "value",
  //       "UnitPrice": "value",
  //       "BillingQty": "value",
  //       "Tariff": "value",
  //       "TariffType": "value",
  //       "Remarks": "value",
  //       "InteralOrder": ""
  //     },
  //     "MoreRefDocs": [
  //       {
  //         "DocCategory": "PrimaryRefDoc",
  //         "DocType": "Trip Log",
  //         "DocValue": "TRIP001",
  //         "DocDate": "2025-01-15 12:23",
  //         "DocRemarks": ""
  //       },
  //       {
  //         "DocCategory": "SecondaryRefDoc",
  //         "DocType": "BR",
  //         "DocValue": "BR001",
  //         "DocDate": "2025-01-12 12:23",
  //         "DocRemarks": ""
  //       },
  //       {
  //         "DocCategory": "Others",
  //         "DocType": "Dispatch Doc",
  //         "DocValue": "DIS0001",
  //         "DocDate": "2025-01-14 12:23",
  //         "DocRemarks": ""
  //       }
  //     ],
  //     "Attachments": {
  //       "TotalAttachment": "2",
  //       "AttachItems": [
  //         {
  //           "AttachItemID": "value",
  //           "AttachmentType": "PDF",
  //           "FileCategory": "",
  //           "AttachName": "File.PDF",
  //           "AttachUniqueName": "value",
  //           "AttachRelPath": "value",
  //           "ModeFlag": "Insert/Update/Delete/NoChange"
  //         }
  //       ]
  //     },
  //     "PlanDetails": [
  //       {
  //         "PlanLineUniqueID": "value",
  //         "PlanSeqNo": "value",
  //         "ModeFlag": "Insert/Update/Delete/NoChange",
  //         "WagonDetails": {
  //           "WagonType": "value",
  //           "WagonID": "value",
  //           "WagonQuantity": "value",
  //           "WagonTareWeight": "value",
  //           "WagonGrossWeight": "value",
  //           "WagonLength": "value",
  //           "WagonSequence": "value"
  //         },
  //         "ContainerDetails": {
  //           "ContainerType": "value",
  //           "ContainerID": "value",
  //           "ContainerQuantity": "value",
  //           "ContainerTareWeight": "value",
  //           "ContainerLoadWeight": "value"
  //         },
  //         "ProductDetails": {
  //           "ContainHazardousGoods": "value",
  //           "NHM": "value",
  //           "ProductID": "value",
  //           "ProductQuantity": "value",
  //           "ClassofStores": "value",
  //           "UNCode": "value",
  //           "DGClass": "value"
  //         },
  //         "THUDetails": {
  //           "THUID": "value",
  //           "THUSerialNo": "value",
  //           "THUQuantity": "value",
  //           "THUWeight": "value"
  //         },
  //         "JourneyAndSchedulingDetails": {
  //           "Departure": "value",
  //           "Arrival": "value",
  //           "ActivityLocation": "value",
  //           "Activity": "value",
  //           "PlannedDateTime": "value",
  //           "RevPlannedDateTime": "value",
  //           "TrainNo": "value",
  //           "LoadType": "value"
  //         },
  //         "OtherDetails": {
  //           "FromDate": "value",
  //           "FromTime": "value",
  //           "ToDate": "value",
  //           "ToTime": "value",
  //           "QCUserDefined1": "value",
  //           "QCUserDefined2": "value",
  //           "QCUserDefined3": "value",
  //           "Remarks1": "value",
  //           "Remarks2": "value",
  //           "Remarks3": "value"
  //         }
  //       }
  //     ],
  //     "ActualDetails": [
  //       {
  //         "ActualLineUniqueID": "value",
  //         "ActualSeqNo": "value",
  //         "ModeFlag": "Insert/Update/Delete/NoChange",
  //         "WagonDetails": {
  //           "WagonType": "value",
  //           "WagonID": "value",
  //           "WagonQuantity": "value",
  //           "WagonTareWeight": "value",
  //           "WagonGrossWeight": "value",
  //           "WagonLength": "value",
  //           "WagonSequence": "value"
  //         },
  //         "ContainerDetails": {
  //           "ContainerType": "value",
  //           "ContainerID": "value",
  //           "ContainerQuantity": "value",
  //           "ContainerTareWeight": "value",
  //           "ContainerLoadWeight": "value"
  //         },
  //         "ProductDetails": {
  //           "ContainHazardousGoods": "value",
  //           "NHM": "value",
  //           "ProductID": "value",
  //           "ProductQuantity": "value",
  //           "ClassofStores": "value",
  //           "UNCode": "value",
  //           "DGClass": "value"
  //         },
  //         "THUDetails": {
  //           "THUID": "value",
  //           "THUSerialNo": "value",
  //           "THUQuantity": "value",
  //           "THUWeight": "value"
  //         },
  //         "JourneyAndSchedulingDetails": {
  //           "Departure": "value",
  //           "Arrival": "value",
  //           "ActivityLocation": "value",
  //           "Activity": "value",
  //           "PlannedDateTime": "value",
  //           "RevPlannedDateTime": "value",
  //           "TrainNo": "value",
  //           "LoadType": "value"
  //         },
  //         "OtherDetails": {
  //           "FromDate": "value",
  //           "FromTime": "value",
  //           "ToDate": "value",
  //           "ToTime": "value",
  //           "QCUserDefined1": "value",
  //           "QCUserDefined2": "value",
  //           "QCUserDefined3": "value",
  //           "Remarks1": "value",
  //           "Remarks2": "value",
  //           "Remarks3": "value"
  //         }
  //       }
  //     ]
  //   };
;

const JsonCreater: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    jsonStore.setJsonData(QUICK_ORDER_JSON);
    navigate('/quick-order');
  }, [navigate]);
  return null;
};

export default JsonCreater; 