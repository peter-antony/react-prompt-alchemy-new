import React, { useState, useEffect } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { EyeOff } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { TripExecutionLanding } from '@/components/TripNew/TripExecutionLanding'; // Assuming a new component for Trip creation
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useFooterStore } from '@/stores/footerStore';
import { tripService } from '@/api/services/tripService'; // Assuming a new service for Trip
import jsonStore from '@/stores/jsonStore';
import { initializeJsonStore } from './JsonCreater';
import { useToast } from '@/hooks/use-toast';
import CommonPopup from '@/components/Common/CommonPopup';
import { NotebookPen } from 'lucide-react';

const CreateTrip = () => {
  const { config, setFooter, resetFooter } = useFooterStore();
  const [searchParams] = useSearchParams();
  const isEditTrip = !!searchParams.get("id");
  const tripUniqueID = searchParams.get("id");
  //here to store the id  
  console.log("Trip Unique ID:", tripUniqueID);

  useEffect(() => {
    if (isEditTrip && tripUniqueID) {
      const fetchTripDetails = async () => {
        try {
          const response: any = await tripService.getTripById({ id: tripUniqueID });
          console.log("Raw API Response:", response);

          // Step 1: check if the data exists
          if (response?.data?.ResponseData) {
            let parsedData;

            try {
              // Step 2: parse the stringified JSON
              parsedData = JSON.parse(response.data.ResponseData);
              console.log("Parsed Trip Data:", parsedData);

              // Step 3: if valid, set it into Zustand store
              // useTripStore.getState().setTripData(parsedData);
              // useTripStore.getState().setMode("edit");
            } catch (err) {
              console.error("Failed to parse trip response:", err);
            }
          } else {
            console.warn("No ResponseData found in API response");
          }
        } catch (error) {
          console.error("Error fetching trip:", error);
        }
      };

      fetchTripDetails();
    }
  }, [isEditTrip, tripUniqueID]);

  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showAmendButton, setShowAmendButton] = useState(false);
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [customerOrderNoList, setCustomerOrderNoList] = useState<any[]>([]);

  const messageTypes = [
    // "Trip Billing Type Init",
    "Trip Amend Reason Code Init",
  ];

  useEffect(() => {
    fetchAll();
    //  Fetch the full trip details
    initializeJsonStore();

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
      ],
      rightButtons: [
        {
          label: "Cancel",
          disabled: false,
          type: 'Button' as const,
          onClick: () => {
            // tripCancelhandler();
          },
        },
        {
          label: "Save Draft",
          type: "Button" as const,
          disabled: false,
          onClick: () => {
            console.log("Save Draft clicked");
            tripSaveDraftHandler();
          },
        },
        {
          label: "Confirm Trip",
          type: "Button" as const,
          disabled: isConfirmButtonDisabled,
          onClick: () => {
            console.log("Confirm clicked");
            tripConfirmHandler();
          },
        }
      ],
    });
    return () => resetFooter();
  }, []);

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
  const fetchAll = async () => {
    setLoading(false);
    for (const type of messageTypes) {
      setSelectedType(type);
      // await fetchData(type);
    }
  };

  //BreadCrumb data
  const breadcrumbItems = [
    { label: 'Home', href: '/', active: false },
    { label: 'Transport Execution Management', href: '/trip-hub', active: false }, // Updated breadcrumb
    { label: 'Transport Execution', active: true } // Updated breadcrumb
  ];

  const tripSaveDraftHandler = async () => {
    console.log("tripSaveDraftHandler ---"); // Using getTrip

  }

  const tripConfirmHandler = async () => {
    console.log("tripConfirmHandler ---"); // Using getTrip

  }

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupButtonName, setPopupButtonName] = useState('');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  const [popupAmendFlag, setPopupAmendFlag] = useState('');
  const [reasonCodeTypeList, setReasonCodeTypeList] = useState<any[]>([]);
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

  const handleFieldChange = (name, value) => {
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const submitAmendData = () => { }

  return (
    <AppLayout>
      <div className="min-h-screen main-bg">
        <div className="container-fluid mx-auto p-4 px-6 space-y-6">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className={`rounded-lg mt-4 ${config.visible ? 'pb-4' : ''}`}>
            <TripExecutionLanding isEditTrip={isEditTrip} /> {/* Using TripExecutionLanding component */}
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

export default CreateTrip;
