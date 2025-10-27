import React, { useState, useEffect } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { EyeOff } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import NewCreateQuickOrder, { NewQuickOrderHandle } from '@/components/QuickOrderNew/NewQuickOrder';
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useFooterStore } from '@/stores/footerStore';
import { quickOrderService } from '@/api/services/quickOrderService';
import jsonStore from '@/stores/jsonStore';
import { initializeJsonStore } from './JsonCreater';
import { useToast } from '@/hooks/use-toast';
import CommonPopup from '@/components/Common/CommonPopup';
import { NotebookPen} from 'lucide-react';
import { json } from 'stream/consumers';

const CreateQuickOrder = () => {
  const { setFooter, resetFooter } = useFooterStore();
  const [searchParams] = useSearchParams();
  const isEditQuickOrder = !!searchParams.get("id");
  const quickOrderUniqueID=searchParams.get("id");

  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showAmendButton, setShowAmendButton] = useState(false);
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(true);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [customerOrderNoList, setCustomerOrderNoList] = useState<any[]>([]);
  const [fetchedQuickOrderData, setFetchedQuickOrderData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const messageTypes = [
    // "Quick Order Billing Type Init",
    "Quick Order Amend Reason Code Init",
  ];

  const newQuickOrderRef = React.useRef<NewQuickOrderHandle>(null);

  useEffect(() => {
    fetchAll();
    //  Fetch the full quick order details
    initializeJsonStore();
    const oldQuickOrder = jsonStore.getQuickOrder();
    console.log("inside createQuickOrder useEffect()")
    console.log("INITIALIZING CREATE : ", isEditQuickOrder)
    setLoading(false);
      quickOrderService.getQuickOrder(quickOrderUniqueID).then((fetchRes: any) => {
        let parsedData = JSON.parse(fetchRes?.data?.ResponseData);
        console.log("screenFetchQuickOrder byId result:", JSON.parse(fetchRes?.data?.ResponseData));
        console.log("Parsed result:", parsedData?.ResponseResult);
        if(parsedData?.ResponseResult != undefined){
          jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
          setFetchedQuickOrderData((parsedData?.ResponseResult)[0]);
          console.log("fetchedQuickOrderData ===", fetchedQuickOrderData);
          jsonStore.setQuickOrder(fetchedQuickOrderData);
          const fullJson2 = jsonStore.getJsonData();
          // const storedConfirmStatus = localStorage.getItem('confirmOrder');
          const storedConfirmStatus = jsonStore.getQuickOrder().Status;
          console.log("storedConfirmStatus ===", storedConfirmStatus);
          if (storedConfirmStatus === 'Confirmed') {
            setShowAmendButton(true);
          }
          console.log("FULL JSON 4444:: ", fullJson2);
          if (fullJson2.ResponseResult?.quickOrder?.ResourceGroup?.length != 0) {
            console.log("true ---");
            console.log("document.querySelector TRUE= ",document.querySelector('[data-lov-id="src\components\AppFooter.tsx:82:8"]'))
            setIsConfirmButtonDisabled(false);
            setIsSaveButtonDisabled(false);
          } else {
            console.log("else ---");
            console.log("document.querySelector FALSE= ",document.querySelector('[data-lov-id="src\components\AppFooter.tsx:82:8"]'))

            setIsConfirmButtonDisabled(true);
            setIsSaveButtonDisabled(true);
          }
          setLoading(true);

        }

      })

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
          disabled: isSaveButtonDisabled,
          type: 'Button' as const,
          onClick: () => {
            // console.log("Cancel clicked");
            quickOrderCancelhandler();
            // quickOrderCancelhandler();
          },
        },
        {
          label: "Save",
          type: "Button" as const,
          disabled: isSaveButtonDisabled,
          onClick: () => {
            console.log("Save Draft clicked");
            quickOrderSaveDraftHandler();
          },
        },
        ...(!showAmendButton ? [
        {
          label: "Confirm",
          type: "Button" as const,
          disabled: isConfirmButtonDisabled, //isConfirmButtonDisabled,
          onClick: () => {
            console.log("Confirm clicked XXXX");
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
  }, [showAmendButton, isConfirmButtonDisabled, isSaveButtonDisabled]);
  const fetchQuickOrder= ()=>{
    const id= jsonStore.getQuickUniqueID();
    quickOrderService.getQuickOrder(id).then((fetchRes: any) => {
      let parsedData = JSON.parse(fetchRes?.data?.ResponseData);
      console.log("screenFetchQuickOrder byId result:", JSON.parse(fetchRes?.data?.ResponseData));
      console.log("Parsed result:", parsedData?.ResponseResult);
      if(parsedData?.ResponseResult != undefined){
        // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        setFetchedQuickOrderData((parsedData?.ResponseResult)[0]);
        console.log("fetchedQuickOrderData ===", fetchedQuickOrderData);
        // jsonStore.setQuickOrder(fetchedQuickOrderData);
        const fullJson2 = jsonStore.getJsonData();
        // const storedConfirmStatus = localStorage.getItem('confirmOrder');
        const storedConfirmStatus = jsonStore.getQuickOrder().Status;
        console.log("storedConfirmStatus ===", storedConfirmStatus);
        // if (storedConfirmStatus === 'Confirmed') {
        //   setShowAmendButton(true);
        // }
        console.log("FULL JSON %^%^%%%:: ", fullJson2);
        if (fullJson2.ResponseResult?.quickOrder?.ResourceGroup?.length != 0) {
          console.log("true ---222");
          // setIsConfirmButtonDisabled(false);
          // setIsSaveButtonDisabled(false);
          confirmHandleAlternate();
        } else {
          console.log("else ---22");
          // setIsConfirmButtonDisabled(true);
          // setIsSaveButtonDisabled(true);
        }
        setLoading(true);

      }

    })
  }
  const confirmHandleAlternate= async()=>{
    const fullJson = jsonStore.getQuickOrder();
    const messageType = "Quick Order Confirm";
    console.log("fullJson ^^^ ",fullJson)
    console.log("fetchedQuickOrderData ^^^ ",fetchedQuickOrderData)
    const res: any = await quickOrderService.UpdateStatusQuickOrderResource(fullJson, {messageType: messageType});
    console.log("updateQuickOrderResource result:", res);
    // localStorage.setItem("confirmOrder", 'true');
    //  Get OrderNumber from response
    const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
    console.log("OrderNumber:", OrderNumber);
    const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
    const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
    if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
      toast({
        title: "✅ Form submitted successfully",
        description: "Your changes have been saved.",
        variant: "default", // or "success" if you have custom variant
      });
      // setCurrentStep(2);
      setShowAmendButton(true);
      
      // Fetch updated QuickOrder details and update the form
      try {
        const updatedQuickOrderRes = await quickOrderService.getQuickOrder(OrderNumber);
        console.log("Updated QuickOrder response:", updatedQuickOrderRes);
        let updatedParsedData = JSON.parse((updatedQuickOrderRes as any)?.data?.ResponseData);
        console.log("Updated QuickOrder data:", updatedParsedData);
        
        // Update the jsonStore with fresh data
        jsonStore.setQuickOrder((updatedParsedData?.ResponseResult)[0]);
        
        // Update the fetchedQuickOrderData state to trigger re-render
        setFetchedQuickOrderData((updatedParsedData?.ResponseResult)[0]);
        
        // Trigger a refresh of the OrderForm component
        setRefreshTrigger(prev => prev + 1);
        
        console.log("QuickOrder details updated successfully");
      } catch (error) {
        console.error("Error fetching updated QuickOrder details:", error);
      }
    }else{
      toast({
        title: "⚠️ Submission failed",
        description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
        // description: JSON.parse(res?.data?.ResponseData)[0].Error_msg,
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
  }
  //API Call for dropdown data
    const fetchData = async (messageType) => {
      setError(null);
      setLoading(false);
      try {
        const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType });
        setApiData(data);
        console.log("API Data:", data);
        if (messageType == "Quick Order Amend Reason Code Init") {
          setReasonCodeTypeList(JSON.parse(data?.data?.ResponseData));
        }
      } catch (err) {
        setError(`Error fetching API data for ${messageType}`);
        // setApiData(data);
      } finally {
        setLoading(true);
      }
    };
    // Iterate through all messageTypes
    const fetchAll = async () => {
      setLoading(false);
      for (const type of messageTypes) {
        setSelectedType(type);
        await fetchData(type);
      }
    };

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
    // Pull current OrderForm values via forwarded ref
    const orderFormValues = newQuickOrderRef.current?.getOrderValues() || {};
    console.log('OrderForm current values:', orderFormValues);
    console.log("setFetchedQuickOrderData ---", fetchedQuickOrderData);
    const truncateAtPipe = (val: any) => {
      if (typeof val === 'string' && val.includes('||')) {
        return val.split('||')[0].trim();
      }
      return val;
    };
    jsonStore.setQuickOrder({
      ...jsonStore.getJsonData().quickOrder,
      ...orderFormValues,
      "ModeFlag": "Update",
      "Contract": truncateAtPipe(orderFormValues?.Contract),
      "Cluster": truncateAtPipe(orderFormValues?.Cluster),
      "Customer": truncateAtPipe(orderFormValues?.Customer),
      "Vendor": truncateAtPipe(orderFormValues?.Vendor),
      "QCUserDefined1": orderFormValues?.QCUserDefined1?.dropdown,
      "QCUserDefined1Value": orderFormValues?.QCUserDefined1?.input,
      "QCUserDefined2": orderFormValues?.QCUserDefined2?.dropdown,
      "QCUserDefined2Value": orderFormValues?.QCUserDefined2?.input,
      "QCUserDefined3": orderFormValues?.QCUserDefined3?.dropdown,
      "QCUserDefined3Value": orderFormValues?.QCUserDefined3?.input,
    });

    const fullJson = jsonStore.getQuickOrder();
    // Remove 'contractDesc' property if it exists in the quick order JSON
    if ('ContractDesc' in fullJson) {
      delete fullJson.ContractDesc;
      jsonStore.setQuickOrder(fullJson);
    }
    console.log("Handler FULL JSON ---", jsonStore.getQuickOrder());
    // const fullJson = jsonStore.getQuickOrder();
    // const messageType = "Quick Order Cancel";
    try {
      //  Update resource
      const res: any = await quickOrderService.updateQuickOrderResource(fullJson);
      console.log("updateQuickOrderResource result:", res);

      //  Get OrderNumber from response
      const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
      console.log("OrderNumber:", OrderNumber);
      const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
      const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
      if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
        toast({
          title: "✅ Form submitted successfully",
          description: "Your changes have been saved.",
          variant: "default", // or "success" if you have custom variant
        });
      }else{
        toast({
          title: "⚠️ Submission failed",
          // description: JSON.parse(res?.data?.Message),
          description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
          // description: JSON.parse(res?.data?.ResponseData)[0].Error_msg,
          variant: "destructive", // or "success" if you have custom variant
        });
      }

    } catch (err) {
      console.log("CATCH :: ", err);
      setError(`Error fetching API data for resource group`);
      toast({
        title: "⚠️ Submission failed",
        description: JSON.parse(err?.data?.Message),
        variant: "destructive", // or "error"
      });
    }
    finally {
      
    }
  }
  
  const quickOrderConfirmHandler = async () => {
    console.log("quickOrderConfirmhandler ---", jsonStore.getQuickOrder());
    jsonStore.setQuickOrder({
      ...jsonStore.getJsonData().quickOrder,
      // "QuickOrderNo": jsonStore.getQuickUniqueID()
    });
    const fullJson = jsonStore.getQuickOrder();
    const messageType = "Quick Order Confirm";
    try {
      //  Update resource
      if(fetchedQuickOrderData==null){
        fetchQuickOrder();
      }else{
        const res: any = await quickOrderService.UpdateStatusQuickOrderResource(fetchedQuickOrderData, {messageType: messageType});
        console.log("updateQuickOrderResource result:", res);
        // localStorage.setItem("confirmOrder", 'true');
        //  Get OrderNumber from response
        const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
        console.log("OrderNumber:", OrderNumber);
        const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
        const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
        if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
          toast({
            title: "✅ Form submitted successfully",
            description: "Your changes have been saved.",
            variant: "default", // or "success" if you have custom variant
          });
          // setCurrentStep(2);
          setShowAmendButton(true);
          
          // Fetch updated QuickOrder details and update the form
          try {
            const updatedQuickOrderRes = await quickOrderService.getQuickOrder(OrderNumber);
            console.log("Updated QuickOrder response:", updatedQuickOrderRes);
            let updatedParsedData = JSON.parse((updatedQuickOrderRes as any)?.data?.ResponseData);
            console.log("Updated QuickOrder data:", updatedParsedData);
            
            // Update the jsonStore with fresh data
            jsonStore.setQuickOrder((updatedParsedData?.ResponseResult)[0]);
            
            // Update the fetchedQuickOrderData state to trigger re-render
            setFetchedQuickOrderData((updatedParsedData?.ResponseResult)[0]);
            
            // Trigger a refresh of the OrderForm component
            setRefreshTrigger(prev => prev + 1);
            
            console.log("QuickOrder details updated successfully");
          } catch (error) {
            console.error("Error fetching updated QuickOrder details:", error);
          }
        }else{
          toast({
            title: "⚠️ Submission failed",
            description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
            // description: JSON.parse(res?.data?.ResponseData)[0].Error_msg,
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
      }
    

    } catch (err) {
      console.log("CATCH :: ", err);
      setError(`Error fetching API data for resource group`);
      toast({
        title: "⚠️ Submission failed",
        description: JSON.parse(err?.data?.Message),
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
  const [reasonCodeTypeList, setReasonCodeTypeList] = useState<any[]>([]);
  const [fields, setFields] = useState([]);
  const quickOrderAmendHandler = () => {
    // Access selected row data for Confirm action
    // const selectedRowData = Array.from(selectedRows).map(idx => gridState.gridData[idx]);
    console.log('amendmend data rows:', reasonCodeTypeList);
    setFields([
      {
        type: "select",
        label: "Reason Code",
        name: "reasonCode",
        placeholder: "Select Reason Code",
        // options: [
        //   { value: "Reason AB", label: "Reason AB" },
        //   { value: "Reason B", label: "Reason B" },
        // ],
        value: "",
        options: reasonCodeTypeList?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
        // events: {
        //   onChange: (value, event) => {
        //     console.log('contractType changed:', value);
        //   }
        // }
      },
      {
        type: "text",
        label: "Reason Code Desc.",
        name: "reasonDesc",
        placeholder: "Enter Reason Code Description",
        value: "",
      },
    ]);
    setPopupAmendFlag('Amend');
    setPopupOpen(true);
    setPopupTitle('Amend');
    setPopupButtonName('Amend');
    setPopupBGColor('bg-blue-600');
    setPopupTextColor('text-blue-600');
    setPopupTitleBgColor('bg-blue-100');
  };

  const quickOrderCancelhandler = () => {
    console.log('amendmend data rows:', reasonCodeTypeList);
    setFields([
      {
        type: "select",
        label: "Reason Code",
        name: "reasonCode",
        placeholder: "Select Reason Code",
        // options: [
        //   { value: "Reason AB", label: "Reason AB" },
        //   { value: "Reason B", label: "Reason B" },
        // ],
        value: "",
        options: reasonCodeTypeList?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
        // events: {
        //   onChange: (value, event) => {
        //     console.log('contractType changed:', value);
        //   }
        // }
      },
      {
        type: "text",
        label: "Reason Code Desc.",
        name: "reasonDesc",
        placeholder: "Enter Reason Code Description",
        value: "",
      },
    ]);
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
    console.log("Amend old:", jsonStore.getQuickOrder());
    console.log("Amend json:", fetchedQuickOrderData);
    jsonStore.setQuickOrder(fetchedQuickOrderData);
    console.log("Amend json:", jsonStore.getQuickOrder());
    let messageType = "";
    if(popupAmendFlag == "Amend"){
      messageType = "Quick Order Amend"; // Or appropriate message type
      jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        // "QuickOrderNo": jsonStore.getQuickUniqueID(),
        "AmendReasonCode": fields[0].value,
        "AmendReasonDescription": fields[1].value,
        "ModeFlag": "Update" // Set ModeFlag to "Amend"
      });
    }else{
      messageType = "Quick Order Cancel"; // Or appropriate message type
      jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        // "QuickOrderNo": jsonStore.getQuickUniqueID(),
        "CanceReasonCode": fields[0].value,
        "CanceReasonDescription": fields[1].value,
        "ModeFlag": "Update" // Set ModeFlag to "Amend"
      });
    }
    const fullJson = jsonStore.getQuickOrder();
    console.log("fullJson === amend", fullJson);
    try {
      // Call your API to submit the amended data
      const res: any = await quickOrderService.UpdateStatusQuickOrderResource(fullJson, { messageType: messageType });
      console.log("Amend API result:", res);

      const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
      const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
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
          description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log("CATCH AMEND :: ", err);
      setError(`Error submitting amend data`);
      toast({
        title: "⚠️ Submission failed",
        description: err.response.data.description,
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
          {loading ?
            <NewCreateQuickOrder ref={newQuickOrderRef} isEditQuickOrder={isEditQuickOrder} onOrderCreated={() => setIsSaveButtonDisabled(false)} onConfirm={quickOrderConfirmHandler} key={refreshTrigger} />
            : ''
          }
          </div>

        </div>
      </div>

      {loading ?
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
        /> : ''
      }


    </AppLayout>
  );
};

export default CreateQuickOrder;
