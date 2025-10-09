import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { TripExecutionLanding } from '@/components/ManageTrip/TripExecutionLanding';
import { useFooterStore } from '@/stores/footerStore';
import { useToast } from '@/hooks/use-toast';
import { manageTripStore } from '@/stores/mangeTripStore';
import { useSearchParams } from "react-router-dom";

const ManageTripExecution = () => {
  const { loading, tripData, fetchTrip, saveTrip } = manageTripStore();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [searchParams] = useSearchParams();
  const isEditTrip = !!searchParams.get("id");
  const tripUniqueID = searchParams.get("id");
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(true);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Fetch trip data on first render if editing
  useEffect(() => {
    if (isEditTrip && tripUniqueID) {
      fetchTrip(tripUniqueID)
        .catch((err) => toast({ title: "Error fetching trip", description: String(err), variant: "destructive" }));
    }
  }, [isEditTrip, tripUniqueID, fetchTrip, toast]);


  useEffect(() => {
    // fetchAll();
    //  Fetch the full trip details
    // initializeJsonStore();

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
    { label: 'Transport Execution Management', href: '/trip-hub', active: false }, // Updated breadcrumb
    { label: 'Transport Execution', active: true } // Updated breadcrumb
  ];

  // Handlers
  const tripSaveDraftHandler = useCallback(async () => {
    try {
      await saveTrip();
      toast({ title: "Draft saved successfully", variant: "default" });
    } catch (err) {
      toast({ title: "Error saving draft", description: String(err), variant: "destructive" });
    }
  }, [saveTrip, toast]);

  const tripConfirmHandler = useCallback(async () => {
    try {
      await saveTrip(); // You can add confirm-specific API logic here
      toast({ title: "Trip confirmed successfully", variant: "default" });
    } catch (err) {
      toast({ title: "Error confirming trip", description: String(err), variant: "destructive" });
    }
  }, [saveTrip, toast]);

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
                tripData={tripData} // Pass dataset to child/>
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ManageTripExecution;
