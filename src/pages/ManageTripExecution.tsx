import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import { TripExecutionLanding } from '@/components/ManageTrip/TripExecutionLanding';
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

const ManageTripExecution = () => {
  const { loading, tripData, fetchTrip, saveTrip, confirmTrip } = manageTripStore();
  const { config, setFooter, resetFooter } = useFooterStore();
  const [searchParams] = useSearchParams();
  const isEditTrip = !!searchParams.get("id");
  const tripUniqueID = searchParams.get("id");
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { isOpen, drawerType, closeDrawer } = useDrawerStore();

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
            console.log('Cancel clicked', tripData);
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
  }, [tripData, saveTrip, setFooter, resetFooter]); // Add tripData and saveTrip to dependencies

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
      let result: any = await saveTrip();
      if (result?.data?.IsSuccess) {
        // ✅ Show success message
        toast({
          title: "Trip saved successfully",
          description: result?.data?.Message ?? "Trip saved successfully.",
          variant: "default",
        });

        // ✅ Re-fetch the trip data fresh from server
        if (tripData?.Header?.TripNo) {
          await fetchTrip(tripData.Header.TripNo);
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
          onBack={drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' ? closeDrawer : undefined}
          title={drawerType === 'resources' ? 'Resources' : drawerType === 'vas' ? 'VAS' : drawerType === 'incidents' ? 'Incident' : drawerType === 'customer-orders' ? 'Customer Order' : drawerType === 'supplier-billing' ? 'Supplier Billing' : drawerType === 'trip-execution-create' ? 'Activities & Consignment' : drawerType === 'linked-transactions' ? 'Linked Transactions' : drawerType === 'train-parameters' ? 'Train Parameters' : ''}
          titleBadge={drawerType === 'vas' || drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'trip-execution-create' ? tripUniqueID || 'TRIP0000000001' : undefined}
          slideDirection="right"
          width={drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'trip-execution-create' || drawerType === 'linked-transactions' || drawerType === 'train-parameters' ? '100%' : '75%'}
          smoothness="smooth"
          showBackButton={drawerType === 'incidents' || drawerType === 'customer-orders' || drawerType === 'supplier-billing' || drawerType === 'trip-execution-create'}
          showCloseButton={true}
        >
          {drawerType === 'resources' && <ResourcesDrawerScreen onClose={closeDrawer} />}
          {drawerType === 'vas' && <VASDrawerScreen />}
          {drawerType === 'incidents' && <IncidentsDrawerScreen onClose={closeDrawer} />}
          {drawerType === 'customer-orders' && <CustomerOrdersDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'supplier-billing' && <SupplierBillingDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'trip-execution-create' && <TripExecutionCreateDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'linked-transactions' && <LinkedTransactionsDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
          {drawerType === 'train-parameters' && <TrainParametersDrawerScreen onClose={closeDrawer} tripId={tripUniqueID || undefined} />}
        </SideDrawer>

      </div>
    </AppLayout>
  );
};

export default ManageTripExecution;
