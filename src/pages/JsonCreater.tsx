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
              "AttachItemID": "",
              "AttachmentType": "PDF",
              "FileCategory": "",
              "AttachName": "File.PDF",
              "AttachUniqueName": "",
              "AttachRelPath": "",
              "ModeFlag": "Insert/Update/Delete/NoChange"
            }
          ]
        }
      }
    }
  }

  const Resource_Group_JSON = 
    {
      "ResourceUniqueID": "",
      "ModeFlag": "Insert/Update/Delete/NoChange",
      "ResourceStatus": "Save/Confirm/UnderAmend",
      "BasicDetails": {
        "Resource": "Vehicle",
        "ResourceType": "Truck 4.2",
        "ServiceType": "Block",
        "SubSericeType": "Repair"
      },
      "OperationalDetails": {
        "OperationalLocation": "",
        "DepartPoint": "",
        "ArrivalPoint": "",
        "FromDate": "",
        "FromTime": "",
        "ToDate": "",
        "ToTime": "",
        "Remarks": ""
      },
      "BillingDetails": {
        "DraftBillNo": "",
        "ContractPrice": "",
        "NetAmount": "",
        "BillingType": "",
        "UnitPrice": "",
        "BillingQty": "",
        "Tariff": "",
        "TariffType": "",
        "Remarks": "",
        "InteralOrder": ""
      },
      "MoreRefDocs": [
        
      ],
      "Attachments": {
        "TotalAttachment": "2",
        "AttachItems": [
          {
            "AttachItemID": "",
            "AttachmentType": "PDF",
            "FileCategory": "",
            "AttachName": "File.PDF",
            "AttachUniqueName": "",
            "AttachRelPath": "",
            "ModeFlag": "Insert/Update/Delete/NoChange"
          }
        ]
      },
      "PlanDetails": [
        
      ],
      "ActualDetails": [
       
      ]
    };
;

const JsonCreater: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {

    jsonStore.setJsonData(QUICK_ORDER_JSON);
    console.log("JSON data set CREATER:", jsonStore.getQuickOrder());
    jsonStore.setResourceJsonData(Resource_Group_JSON);
    console.log("RESOURCE data set CREATER:", jsonStore.getResourceJsonData());

    navigate('/quick-order');
  }, [navigate]);
  return null;
};

export default JsonCreater; 