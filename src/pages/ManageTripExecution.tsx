import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { TripExecutionLanding } from '@/components/ManageTrip/TripExecutionLanding';
import { TripFormRef } from '@/components/ManageTrip/TripForm';
import { useFooterStore } from '@/stores/footerStore';
import { useToast } from '@/hooks/use-toast';
import { manageTripStore } from '@/stores/mangeTripStore';
import { useSearchParams } from "react-router-dom";
import { SideDrawer } from '../components/SideDrawer';
import { useDrawerStore } from '@/stores/drawerStore';
import { ResourcesDrawerScreen } from '@/components/drawer/ResourcesDrawerScreen';
import { VASDrawerScreen } from '@/components/drawer/VASDrawerScreen';
import { IncidentsDrawerScreen } from '@/components/drawer/IncidentsDrawerScreen';
import { CustomerOrdersDrawerScreen } from '@/components/drawer/CustomerOrdersDrawerScreen';
import { SupplierBillingDrawerScreen } from '@/components/drawer/SupplierBillingDrawerScreen';
import { TripExecutionCreateDrawerScreen } from '@/components/drawer/TripExecutionCreateDrawerScreen';
import { TrainParametersDrawerScreen } from '@/components/drawer/TrainParametersDrawerScreen';
import { LinkedTransactionsDrawerScreen } from '@/components/drawer/LinkedTransactionsDrawerScreen';
import { tripService } from '@/api/services/tripService';
import { NotebookPen, Search, Clock, Ban } from "lucide-react";
import { TripAmendModal } from '@/components/ManageTrip/TripAmendModal';
import TripPlanActionModal from '@/components/ManageTrip/TripPlanActionModal';
import { TripLevelUpdateDrawer } from '@/components/drawer/TripLevelUpdateDrawer';
import { getUserContext } from '../api/config';


const ManageTripExecution = () => {
  const { loading, tripData, fetchTrip, saveTrip, confirmTrip, setTrip } = manageTripStore();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [searchParams] = useSearchParams();
  const isEditTrip = !!searchParams.get("id");
  const tripUniqueID = searchParams.get("id");
  
  // Ref to access TripForm data from main component
  const tripFormRef = useRef<TripFormRef>(null);
  
  // Function to get current form data without saving
  const getCurrentFormData = useCallback(() => {
    if (tripFormRef.current) {
      const formData = tripFormRef.current.getFormData();
      console.log('Current TripForm data:', formData);
      return formData;
    }
    console.warn('TripForm ref not available');
    return {};
  }, []);
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { isOpen, drawerType, closeDrawer, drawerData } = useDrawerStore();
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [popupOpen, setPopupOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('Amend');
  const [popupButtonName, setPopupButtonName] = useState('Amend');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  const [activeTab, setActiveTab] = useState("consignment");
  
  // Fields for Cancel modal (with date, reasonCode, remarks)
  const [cancelFields, setCancelFields] = useState([
    {
      type: "date",
      label: "Requested Date and Time",
      name: "date",
      placeholder: "Select Requested Date and Time",
      value: "",
      required: true,
      mappedName: 'Canceldatetime'
    },
    {
      type: "select",
      label: "Reason Code and Description",
      name: "ReasonCode",
      placeholder: "Enter Reason Code and Description",
      options: [],
      value: "",
      required: true,
      mappedName: 'ReasonCode'
    },
    {
      type: "text",
      label: "Remarks",
      name: "remarks",
      placeholder: "Enter Remarks",
      value: "",
      mappedName: 'Remarks'
    },
  ]);

  // Fields for Amend modal (only reasonCode and remarks, no date)
  const [amendFields, setAmendFields] = useState([
    {
      type: "select",
      label: "Reason Code and Description",
      name: "ReasonCode",
      placeholder: "Enter Reason Code and Description",
      options: [],
      value: "",
      required: true,
      mappedName: 'ReasonCode'
    },
    {
      type: "text",
      label: "Remarks",
      name: "remarks",
      placeholder: "Enter Remarks",
      value: "",
      mappedName: 'Remarks'
    },
  ]);
  // console.log('filtersForThisGrid: ', filtersForThisGrid);

  const handleCancelFieldChange = (name, value) => {
    console.log('Cancel field changed:', name, value);
    setCancelFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const handleAmendFieldChange = (name, value) => {
    console.log('Amend field changed:', name, value);
    setAmendFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  // Fetch trip data on first render if editing
  useEffect(() => {
    if (isEditTrip && tripUniqueID) {
      fetchTrip(tripUniqueID)
        .catch((err) => toast({ title: "Error fetching trip", description: String(err), variant: "destructive" }));
    }
  }, [isEditTrip, tripUniqueID, fetchTrip, toast]);

  //API Call for dropdown data
  // const fetchData = async (messageType) => {
  //   setError(null);
  //   setLoading(false);
  //   try {
  //     const data: any = await tripService.getMasterCommonData({ messageType: messageType }); // Using tripService.getMasterCommonData
  //     setApiData(data);
  //     console.log("API Data:", data);
  //     if (messageType == "Trip Billing Type Init") {
  //       setReasonCodeTypeList(JSON.parse(data?.data?.ResponseData));
  //     }
  //   } catch (err) {
  //     setError(`Error fetching API data for ${messageType}`);
  //     // setApiData(data);
  //   } finally {
  //     setLoading(true);
  //   }
  // };
  // Iterate through all messageTypes
  // const fetchAll = async () => {
  //   setLoading(false);
  //   for (const type of messageTypes) {
  //     setSelectedType(type);
  //     // await fetchData(type);
  //   }
  // };

  //BreadCrumb data
  const breadcrumbItems = [
    { label: 'Home', href: '/', active: false },
    { label: 'Transport Planning and Execution', href: '/trip-hub', active: false }, // Updated breadcrumb
    { label: 'Transport Execution', active: true } // Updated breadcrumb
  ];

  // Handlers
  const tripSaveDraftHandler = useCallback(async () => {
    try {
      // First, sync TripForm data to store before saving
      if (tripFormRef.current) {
        console.log('Syncing TripForm data before save...');
        const formData = tripFormRef.current.syncFormDataToStore();
        console.log('TripForm data synced:', formData);
      }
      
      // Debug current trip data before save
      console.log('Current tripData before save:', {
        TripNo: tripData?.Header?.TripNo,
        tripUniqueID: tripUniqueID,
        isEditTrip: isEditTrip
      });
      
      let result: any = await saveTrip();
      if (result?.data?.IsSuccess) {
        // ✅ Show success message
        toast({
          title: "Trip saved successfully",
          description: result?.data?.Message ?? "Trip saved successfully.",
          variant: "default",
        });

        // ✅ Re-fetch the trip data fresh from server
        let resp = JSON.parse(result?.data?.ResponseData);
        if (resp?.TripID) {
          await fetchTrip(resp?.TripID);
          console.log("🔄 Trip data refreshed after save.");
        }
      } else {
        // Backend returned logical failure
        toast({
          title: "Save failed",
          description:
            result?.data?.Message ||
            result?.message ||
            "Unknown error occurred while saving trip.",
          variant: "destructive",
        });
        console.warn("⚠️ Save failed:", result);
      }
    } catch (err) {
      toast({ title: "Error saving draft", description: String(err), variant: "destructive" });
    }
  }, [saveTrip, toast]);

  const tripConfirmHandler = useCallback(async () => {
    try {
      let result: any = await confirmTrip();
      if (result?.data?.IsSuccess) {
        // ✅ Show success message
        toast({
          title: "Trip confirmed successfully",
          description: result?.data?.Message ?? "Trip confirmed successfully.",
          variant: "default",
        });
        let res = result?.data?.ResponseData ? JSON.parse(result.data.ResponseData) : null;
        // ✅ Re-fetch the trip data fresh from server
        if (res?.TripID) {
          await fetchTrip(res.TripID);
          console.log("🔄 Trip data refreshed after confirm.");
        }
      } else {
        // Backend returned logical failure
        toast({
          title: "Confirm failed",
          description:
            result?.data?.Message ||
            result?.message ||
            "Unknown error occurred while confirming trip.",
          variant: "destructive",
        });
        console.warn("⚠️ Confirm failed:", result);
      }
    } catch (err) {
      toast({ title: "Error saving draft", description: String(err), variant: "destructive" });
    }
  }, [confirmTrip, toast, fetchTrip]);

  const tripAmendHandler = useCallback(async () => {
    setPopupOpen(true);
  }, [tripData, toast, fetchTrip]);

  const tripCancelHandler = useCallback(async () => {
    setCancelModalOpen(true);
  }, []);

  const handleTripsCancelSubmit = async (formFields: any) => {
    console.log('Cancel form fields received:', formFields);
    
    // Map form fields to API object
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for Cancel API:', mappedObj);
    
    // Handle ReasonCode splitting if it contains '||'
    let ReasonCodeValue = '';
    let ReasonCodeLabel = '';

    if (typeof mappedObj.ReasonCode === 'string' && mappedObj.ReasonCode.includes('||')) {
      // If ReasonCode is a string with '||', split it into value and label
      const [value, ...labelParts] = mappedObj.ReasonCode.split('||');
      ReasonCodeValue = value.trim();
      ReasonCodeLabel = labelParts.join('||').trim();
    } else if (typeof mappedObj.ReasonCode === 'string') {
      ReasonCodeValue = mappedObj.ReasonCode;
      ReasonCodeLabel = mappedObj.ReasonCode;
    }
    
    // Prepare trip data object for API
    let tripDataObj: any = { ...tripData };
    tripDataObj.Header.Cancellation.CancellationRequestedDateTime = mappedObj?.Canceldatetime;
    tripDataObj.Header.Cancellation.CancellationReasonCode = ReasonCodeValue;
    tripDataObj.Header.Cancellation.CancellationReasonCodeDescription = ReasonCodeLabel;
    tripDataObj.Header.Cancellation.CancellationRemarks = mappedObj?.Remarks;
    tripDataObj.Header.ModeFlag = "Update";
    console.log('Trip Data Object for Cancel API:', tripDataObj);
    
    try {
      setApiStatus('loading');
      console.log('Calling cancelTrip API...');
      
      // Wait for the API response
      const response: any = await tripService.cancelTripService(tripDataObj);
      
      console.log('Cancel Trip API Response:', response);
      console.log('Response data:', response?.data);
      console.log('IsSuccess:', response?.data?.IsSuccess);
      console.log('Message:', response?.data?.Message);
      console.log('ResponseData (raw):', response?.data?.ResponseData);
      
      setApiStatus('success');
      setCancelModalOpen(false);
      
      // Handle success/failure based on server response
      if (response?.data?.IsSuccess) {
        // Parse the ResponseData JSON string to get detailed trip cancellation info
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse ResponseData:', parseError);
        }
        
        // Use the message from ResponseData if available, otherwise use the main message
        const successMessage = responseData?.Message || response?.data?.Message || "Trip cancelled successfully.";
        const reasonCode = responseData?.ReasonCode || "";
        const templateId = responseData?.TemplateID || "";
        
        toast({
          title: "✅ Trip Cancelled",
          description: `${successMessage}${reasonCode ? ` (${reasonCode})` : ""}`,
          variant: "default",
        });
        
        console.log('Trip Cancellation Details:', {
          message: successMessage,
          reasonCode: reasonCode,
          templateId: templateId,
          status: responseData?.Status
        });
        let res = response?.data?.ResponseData ? JSON.parse(response?.data?.ResponseData) : null;
        // Optionally refresh trip data after successful cancellation
        if (res?.TripID) {
          await fetchTrip(res.TripID);
          console.log("🔄 Trip data refreshed after cancellation.");
        }
      } else {
        // Parse ResponseData for error details if available
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed Error ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse error ResponseData:', parseError);
        }
        
        const errorMessage = responseData?.Message || responseData?.Errormessage || response?.data?.Message || "Trip cancellation failed.";
        
        toast({
          title: "⚠️ Trip Cancellation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Cancel Trip API Error:', error);
      setApiStatus('error');
      
      // Handle different types of errors
      let errorMessage = "An unexpected error occurred while cancelling the trip.";
      
      if (error?.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error cancelling trip",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTripsAmendSubmit = async (formFields: any) => {
    console.log('Form fields received:', formFields);
    
    // Map form fields to API object
    let mappedObj: any = {}
    formFields.forEach(field => {
      const mappedName = field.mappedName;
      mappedObj[mappedName] = field.value;
    });
    console.log('Mapped Object for API:', mappedObj);
    
    // Handle ReasonCode splitting if it contains '||'
    let ReasonCodeValue = '';
    let ReasonCodeLabel = '';

    if (typeof mappedObj.ReasonCode === 'string' && mappedObj.ReasonCode.includes('||')) {
      // If ReasonCode is a string with '||', split it into value and label
      const [value, ...labelParts] = mappedObj.ReasonCode.split('||');
      ReasonCodeValue = value.trim();
      ReasonCodeLabel = labelParts.join('||').trim();
    } else if (typeof mappedObj.ReasonCode === 'string') {
      ReasonCodeValue = mappedObj.ReasonCode;
      ReasonCodeLabel = mappedObj.ReasonCode;
    }
    
    // Prepare trip data object for API
    let tripDataObj: any = { ...tripData };
    // Note: Amendment doesn't require date field, so we don't set AmendmentRequestedDateTime
    tripDataObj.Header.Amendment.AmendmentReasonCode = ReasonCodeValue;
    tripDataObj.Header.Amendment.AmendmentReasonCodeDescription = ReasonCodeLabel;
    tripDataObj.Header.Amendment.AmendmentRemarks = mappedObj?.Remarks;
    tripDataObj.Header.ModeFlag = "Update";
    console.log('Trip Data Object for API:', tripDataObj);
    
    try {
      setApiStatus('loading');
      console.log('Calling amendTrip API...');
      
      // Wait for the API response
      const response: any = await tripService.amendTrip(tripDataObj);
      
      console.log('Amend Trip API Response:', response);
      console.log('Response data:', response?.data);
      console.log('IsSuccess:', response?.data?.IsSuccess);
      console.log('Message:', response?.data?.Message);
      console.log('ResponseData (raw):', response?.data?.ResponseData);
      
      setApiStatus('success');
      setPopupOpen(false);
      
      // Handle success/failure based on server response
      if (response?.data?.IsSuccess) {
        // Parse the ResponseData JSON string to get detailed trip amendment info
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse ResponseData:', parseError);
        }
        
        // Use the message from ResponseData if available, otherwise use the main message
        const successMessage = responseData?.Message || response?.data?.Message || "Trip amended successfully.";
        const reasonCode = responseData?.ReasonCode || "";
        const templateId = responseData?.TemplateID || "";
        
        toast({
          title: "Trip amended successfully",
          description: `${successMessage}${reasonCode ? ` (${reasonCode})` : ""}`,
          variant: "default",
        });
        
        console.log('Trip Amendment Details:', {
          message: successMessage,
          reasonCode: reasonCode,
          templateId: templateId,
          status: responseData?.Status
        });
        let res = response?.data?.ResponseData ? JSON.parse(response?.data?.ResponseData) : null;
        // Optionally refresh trip data after successful amendment
        if (res?.TripID) {
          await fetchTrip(res.TripID);
          console.log("🔄 Trip data refreshed after amendment.");
        }
      } else {
        // Parse ResponseData for error details if available
        let responseData = null;
        try {
          responseData = JSON.parse(response?.data?.ResponseData);
          console.log('Parsed Error ResponseData:', responseData);
        } catch (parseError) {
          console.warn('Failed to parse error ResponseData:', parseError);
        }
        
        const errorMessage = responseData?.Message || responseData?.Errormessage || response?.data?.Message || "Trip amendment failed.";
        
        toast({
          title: "Trip amendment failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Amend Trip API Error:', error);
      setApiStatus('error');
      
      // Handle different types of errors
      let errorMessage = "An unexpected error occurred while amending the trip.";
      
      if (error?.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error amending trip",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  // Set footer with conditional button based on trip status
  useEffect(() => {
    // Check if trip status is "Completed" to determine button label and action
    const isTripCompleted = tripData?.Header?.TripStatus === "Executed";
    const confirmButtonLabel = isTripCompleted ? "Amend" : "Complete Trip";
    const confirmButtonHandler = isTripCompleted ? tripAmendHandler : tripConfirmHandler;

    setFooter({
      visible: true,
      pageName: 'Create_Trip',
      leftButtons: [
        {
          label: "Print Report",
          onClick: () => console.log("Print Report"),
          type: "Icon",
          iconName: 'Printer'
        },
        {
          label: "Dropdown Menu",
          onClick: () => console.log("Menu"),
          type: "Icon",
          iconName: 'BookText'
        },
        {
          label: "Wegan",
          onClick: () => {
            console.log("Wegan Report");
            navigatingToWeganReport(tripData?.Header?.TripNo);
          },
          type: "Icon",
          iconName: 'TramFront'
        },
      ],
      rightButtons: [
        {
          label: "Cancel",
          disabled: false,
          type: 'Button' as const,
          onClick: () => {
            tripCancelHandler();
          },
        },
        {
          label: "Save",
          type: "Button" as const,
          disabled: false,
          onClick: () => {
            console.log("Save clicked");
            tripSaveDraftHandler();
          },
        },
        {
          label: confirmButtonLabel,
          type: "Button" as const,
          disabled: isConfirmButtonDisabled,
          onClick: () => {
            console.log(`${confirmButtonLabel} clicked`);
            confirmButtonHandler();
          },
        }
      ],
    });
    return () => resetFooter();
  }, [tripData, setFooter, resetFooter, tripAmendHandler, tripConfirmHandler, tripSaveDraftHandler, isConfirmButtonDisabled, tripFormRef]);

  const navigatingToWeganReport = (tripNo: string) => {
    const userContext = getUserContext();
    const baseUrl = window.location.origin;
    console.log("baseUrl ====", baseUrl);
    const pagePath = "/app/rvw/integration/deep-link";
    const queryParams = "ouId=" + userContext.ouId + "&roleName=" + "wagonallocation" + "&activityName=tms_triplog&componentName=tms_execution&ilboCode=wagonallocationtotrip&exchangeData=txttextsearch%23%23oldvalue";
    const finalUrl = `${baseUrl}${pagePath}?${queryParams}`;
    console.log("finalUrl ----", finalUrl);
    window.open(finalUrl, "_blank");
  };

  return (
    <AppLayout>
      <div className="min-h-screen main-bg">
        <div className="container-fluid mx-auto p-4 px-6 space-y-6">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className={`rounded-lg mt-4 ${config.visible ? 'pb-4' : ''}`}>
            {!loading && (
              <TripExecutionLanding
                isEditTrip={isEditTrip}
                tripData={tripData} // Pass dataset to child
                tripFormRef={tripFormRef} // Pass ref to access TripForm
              />
            )}
            {/* Debug JSON View for tripData in ManageTripExecution */}
            {/* <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">ManageTripExecution Data (tripData.Header)</h3>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
                {JSON.stringify(tripData?.Header, null, 2)}
              </pre>
            </div> */}
          </div>
        </div>

        {/* Side Drawer */}
        <SideDrawer
          isOpen={isOpen}
          onClose={closeDrawer}
          onBack={drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'transport-route' ? closeDrawer : undefined}
          title={drawerType === 'resources' ? 'Resources' : drawerType === 'vas' ? 'VAS' : drawerType === 'incidents' ? 'Incident' : drawerType === 'customer-orders' ? 'Customer Order' : drawerType === 'supplier-billing' ? 'Supplier Billing' : drawerType === 'trip-execution-create' ? 'Events & Consignment' : drawerType === 'linked-transactions' ? 'Linked Transactions' : drawerType === 'train-parameters' ? 'Train Parameters' : drawerType === 'transport-route' ? 'Leg Details' : ''}
          titleBadge={drawerType === 'vas' || drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'trip-execution-create' ? tripUniqueID || 'TRIP0000000001' : undefined}
          slideDirection="right"
          width={drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'trip-execution-create' || drawerType === 'linked-transactions' || drawerType === 'train-parameters' || drawerType === 'transport-route' ? '100%' : '75%'}
          smoothness="smooth"
          showBackButton={drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'trip-execution-create' || drawerType === 'transport-route'}
          showCloseButton={true}
        >
          {drawerType === 'resources' && <ResourcesDrawerScreen onClose={closeDrawer} />}
          {drawerType === 'vas' && <VASDrawerScreen tripUniqueNo={tripUniqueID || undefined} />}
          {drawerType === 'incidents' && <IncidentsDrawerScreen onClose={closeDrawer} />}
          {drawerType === 'customer-orders' && <CustomerOrdersDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'supplier-billing' && <SupplierBillingDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'trip-execution-create' && (
            <TripExecutionCreateDrawerScreen 
              onClose={closeDrawer} 
              tripId={tripUniqueID || undefined} 
              selectedLegSequence={drawerData?.selectedLegSequence}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSaveSuccess={async () => {
                // Refresh trip data in parent component to update events & consignment table
                if (tripUniqueID) {
                  await fetchTrip(tripUniqueID);                 
                }              
              }}
            />
          )}
          {drawerType === 'linked-transactions' && <LinkedTransactionsDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'train-parameters' && <TrainParametersDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'transport-route' && <TripLevelUpdateDrawer  />}
        </SideDrawer>
 

        <TripAmendModal
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          title={popupTitle}
          // titleColor={popupTextColor}
          // titleBGColor={popupTitleBgColor}
          icon={<NotebookPen className="w-4 h-4" color="blue" strokeWidth={1.5} />}
          fields={amendFields as any}
          onFieldChange={handleAmendFieldChange}
          onSubmit={handleTripsAmendSubmit}
          submitLabel={popupButtonName}
        // submitColor={popupBGColor}
        />

        <TripPlanActionModal
          open={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Trip Plan"
          icon={<Ban className="w-4 h-4" />}
          fields={cancelFields as any}
          onFieldChange={handleCancelFieldChange}
          onSubmit={handleTripsCancelSubmit}
          submitLabel="Cancel Trip"
          actionType="cancel"
        />

      </div>
    </AppLayout>
  );
};

export default ManageTripExecution;
