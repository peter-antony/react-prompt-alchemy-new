import React, { useState, useEffect } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { EyeOff } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import NewCreateQuickOrder from '@/components/QuickOrderNew/NewQuickOrder';
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useFooterStore } from '@/stores/footerStore';
import { quickOrderService } from '@/api/services/quickOrderService';
import jsonStore from '@/stores/jsonStore';
import { initializeJsonStore } from './JsonCreater';
import { useToast } from '@/hooks/use-toast';
import CommonPopup from '@/components/Common/CommonPopup';
import { NotebookPen} from 'lucide-react';

const CreateQuickOrder = () => {
  const { setFooter, resetFooter } = useFooterStore();
  const [searchParams] = useSearchParams();
  const isEditQuickOrder = !!searchParams.get("id");
  const quickOrderUniqueID=searchParams.get("id");
  //here to store the id  

  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showAmendButton, setShowAmendButton] = useState(false);
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(true);

  useEffect(() => {
    //  Fetch the full quick order details
    initializeJsonStore();
    const oldQuickOrder = jsonStore.getQuickOrder();

    console.log("INITIALIZING CREATE : ", oldQuickOrder)
      quickOrderService.getQuickOrder(quickOrderUniqueID).then((fetchRes: any) => {
        let parsedData = JSON.parse(fetchRes?.data?.ResponseData);
        console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
        console.log("Parsed result:", parsedData?.ResponseResult);
        if(parsedData?.ResponseResult != undefined){
          jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
          const fullJson2 = jsonStore.getJsonData();
          console.log("FULL JSON 4444:: ", fullJson2);
          if (fullJson2.ResponseResult?.quickOrder?.ResourceGroup?.length != 0) {
            console.log("true ---");
            setIsConfirmButtonDisabled(false);
          } else {
            console.log("else ---");
            setIsConfirmButtonDisabled(true);
          }
        }

      })
    
      const storedConfirmStatus = localStorage.getItem('confirmOrder');
      if (storedConfirmStatus === 'true') {
        setShowAmendButton(true);
      }

    setFooter({
      visible: true,
      pageName: 'Create_Quick_Order',
      // leftButtons: [
      //   {
      //     label: "CIM/CUV Report",
      //     onClick: () => console.log("CIM/CUV Report"),
      //     type: "Icon",
      //     iconName: 'BookText'
      //   },
      // ],
      rightButtons: [
        {
          label: "Cancel",
          disabled: false,
          type: 'Button' as const,
          onClick: () => {
            // console.log("Cancel clicked");
            quickOrderCancelhandler();
            // quickOrderCancelhandler();
          },
        },
        {
          label: "Save Draft",
          type: "Button" as const,
          disabled: false,
          onClick: () => {
            console.log("Save Draft clicked");
            quickOrderSaveDraftHandler();
          },
        },
        ...(!showAmendButton ? [
        {
          label: "Confirm",
          type: "Button" as const,
          disabled: isConfirmButtonDisabled,
          onClick: () => {
            console.log("Confirm clicked");
            quickOrderConfirmHandler();
          },
        }
        ] : [
        {
          label: "Amend",
          type: "Button" as const,
          disabled: false,
          onClick: () => {
            console.log("Amend clicked");
            quickOrderAmendHandler();
          },
        }
        ]),
      ],
    });
    return () => resetFooter();
  }, [showAmendButton, isConfirmButtonDisabled]);

  //BreadCrumb data
  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard', active: false },
    { label: 'Quick Order Management', href: '/quick-order', active: false },
    { label: 'Create Quick Order', active: true }
  ];

  // const quickOrderCancelhandler = async () => {
  //   console.log("quickOrderCancelhandler ---", jsonStore.getQuickOrder());
  //   jsonStore.setQuickOrder({
  //     ...jsonStore.getJsonData().quickOrder,
  //     "QuickOrderNo": jsonStore.getQuickUniqueID()
  //   });
  //   const fullJson = jsonStore.getQuickOrder();
  //   const messageType = "Quick Order Cancel";
  //   try {
  //     //  Update resource
  //     const res: any = await quickOrderService.UpdateStatusQuickOrderResource(fullJson, {messageType: messageType});
  //     console.log("updateQuickOrderResource result:", res);

  //     //  Get OrderNumber from response
  //     const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
  //     console.log("OrderNumber:", OrderNumber);

  //     //  Fetch the full quick order details
  //     quickOrderService.getQuickOrder(OrderNumber).then((fetchRes: any) => {
  //       console.log("fetchRes:: ", fetchRes);
  //       let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
  //       console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
  //       jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
  //     })

  //   } catch (err) {
  //     console.log("CATCH :: ", err);
  //     setError(`Error fetching API data for resource group`);
  //     toast({
  //       title: "⚠️ Submission failed",
  //       description: "Something went wrong while saving. Please try again.",
  //       variant: "destructive", // or "error"
  //     });
  //   }
  //   finally {
  //     toast({
  //       title: "✅ Form submitted successfully",
  //       description: "Your changes have been saved.",
  //       variant: "default", // or "success" if you have custom variant
  //     });
  //   }
  // }

  const quickOrderSaveDraftHandler = async () => {
    console.log("quickOrderCancelhandler ---", jsonStore.getQuickOrder());
    const fullJson = jsonStore.getQuickOrder();
    // const messageType = "Quick Order Cancel";
    try {
      //  Update resource
      const res: any = await quickOrderService.updateQuickOrderResource(fullJson);
      console.log("updateQuickOrderResource result:", res);

      //  Get OrderNumber from response
      const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
      console.log("OrderNumber:", OrderNumber);

    } catch (err) {
      console.log("CATCH :: ", err);
      setError(`Error fetching API data for resource group`);
      toast({
        title: "⚠️ Submission failed",
        description: "Something went wrong while saving. Please try again.",
        variant: "destructive", // or "error"
      });
    }
    finally {
      toast({
        title: "✅ Form submitted successfully",
        description: "Your changes have been saved.",
        variant: "default", // or "success" if you have custom variant
      });
    }
  }
  
  const quickOrderConfirmHandler = async () => {
    console.log("quickOrderCancelhandler ---", jsonStore.getQuickOrder());
    jsonStore.setQuickOrder({
      ...jsonStore.getJsonData().quickOrder,
      "QuickOrderNo": jsonStore.getQuickUniqueID()
    });
    const fullJson = jsonStore.getQuickOrder();
    const messageType = "Quick Order Confirm";
    try {
      //  Update resource
      const res: any = await quickOrderService.UpdateStatusQuickOrderResource(fullJson, {messageType: messageType});
      console.log("updateQuickOrderResource result:", res);
      localStorage.setItem("confirmOrder", 'true');
      //  Get OrderNumber from response
      const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
      console.log("OrderNumber:", OrderNumber);
      const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
      if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
        toast({
          title: "✅ Form submitted successfully",
          description: "Your changes have been saved.",
          variant: "default", // or "success" if you have custom variant
        });
        // setCurrentStep(2);
        setShowAmendButton(true);
      }else{
        toast({
          title: "⚠️ Submission failed",
          description: JSON.parse(res?.data?.data?.ResponseData)[0].Error_msg,
          variant: "destructive", // or "success" if you have custom variant
        });
      }

      //  Fetch the full quick order details
      quickOrderService.getQuickOrder(OrderNumber).then((fetchRes: any) => {
        console.log("fetchRes:: ", fetchRes);
        let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
        console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
        jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
      })

    } catch (err) {
      console.log("CATCH :: ", err);
      setError(`Error fetching API data for resource group`);
      toast({
        title: "⚠️ Submission failed",
        description: "Something went wrong while saving. Please try again.",
        variant: "destructive", // or "error"
      });
    }
  }

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupButtonName, setPopupButtonName] = useState('');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  const [popupAmendFlag, setPopupAmendFlag] = useState('');
  const [fields, setFields] = useState([
    {
      type: "select",
      label: "Reason Code",
      name: "reasonCode",
      placeholder: "Select Reason Code",
      options: [
        { value: "Reason A", label: "Reason A" },
        { value: "Reason B", label: "Reason B" },
      ],
      value: "",
    },
    {
      type: "text",
      label: "Reason Code Desc.",
      name: "reasonDesc",
      placeholder: "Enter Reason Code Description",
      value: "",
    },
  ]);
  const quickOrderAmendHandler = () => {
    // Access selected row data for Confirm action
    // const selectedRowData = Array.from(selectedRows).map(idx => gridState.gridData[idx]);
    // console.log('Confirm selected rows:', selectedRowData);
    setPopupAmendFlag('Amend');
    setPopupOpen(true);
    setPopupTitle('Amend');
    setPopupButtonName('Amend');
    setPopupBGColor('bg-blue-600');
    setPopupTextColor('text-blue-600');
    setPopupTitleBgColor('bg-blue-100');
  };

  const quickOrderCancelhandler = () => {
    setPopupAmendFlag('Cancel');
    setPopupOpen(true);
    setPopupTitle('Cancel Bill');
    setPopupButtonName('Cancel');
    setPopupBGColor('bg-red-600');
    setPopupTextColor('text-red-500');
    setPopupTitleBgColor('bg-red-50');
  };

  const handleFieldChange = (name, value) => {
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const submitAmendData = async (fields: any) => {
    console.log("Amend Fields:", fields[0].value);
    console.log("Amend Fields:", fields[1].value);
    if(popupAmendFlag == "Amend"){
      jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        "QuickOrderNo": jsonStore.getQuickUniqueID(),
        "AmendReasonCode": fields[0].value,
        "AmendReasonDescription": fields[1].value,
        "ModeFlag": "Update" // Set ModeFlag to "Amend"
      });
    }else{
      jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        "QuickOrderNo": jsonStore.getQuickUniqueID(),
        "CanceReasonCode": fields[0].value,
        "CanceReasonDescription": fields[1].value,
        "ModeFlag": "Update" // Set ModeFlag to "Amend"
      });
    }
    const fullJson = jsonStore.getQuickOrder();
    const messageType = "Quick Order Amend"; // Or appropriate message type
    console.log("fullJson === amend", fullJson);
    try {
      // Call your API to submit the amended data
      const res: any = await quickOrderService.UpdateStatusQuickOrderResource(fullJson, { messageType: messageType });
      console.log("Amend API result:", res);

      const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;

      if (resourceStatus === "Success" || resourceStatus === "SUCCESS") {
        toast({
          title: "✅ submitted successfully",
          description: "Your changes have been saved.",
          variant: "default",
        });
        setPopupOpen(false); // Close the popup on success
      } else {
        toast({
          title: "⚠️ submission failed",
          description: JSON.parse(res?.data?.data?.ResponseData)[0].Error_msg,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log("CATCH AMEND :: ", err);
      setError(`Error submitting amend data`);
      toast({
        title: "⚠️ Submission failed",
        description: "Something went wrong while submitting amendments. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <AppLayout>
      <div className="main-content-h bg-gray-100">
        <div className="p-4 px-6 ">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="">
            <NewCreateQuickOrder isEditQuickOrder={isEditQuickOrder} />
          </div>

        </div>
      </div>

      <CommonPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        titleColor={popupTextColor}
        titleBGColor={popupTitleBgColor}
        icon={<NotebookPen className="w-4 h-4" />}
        fields={fields as any}
        onFieldChange={handleFieldChange}
        onSubmit={submitAmendData}
        submitLabel={popupButtonName}
        submitColor={popupBGColor}
      />

    </AppLayout>
  );
};

export default CreateQuickOrder;
