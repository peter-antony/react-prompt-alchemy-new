import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Map,
  FileText,
  Calculator,
  Truck,
  Printer,
  MessageSquareText,
  CircleArrowOutUpRight,
  AlarmClockPlus,
  FileUp,
  Link,
  TramFront,
  Paperclip,
  AlertTriangle,
  X
} from 'lucide-react';
import Attachments from './Attachments';
import { MoreInfoPanel } from './MoreInfo';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { useDrawerStore } from '@/stores/drawerStore';
import { useTransportRouteStore as useTripLevelRouteStore } from '@/stores/tripLevelRouteStore';
import { TripLevelUpdateDrawer } from '../drawer/TripLevelUpdateDrawer';
import { manageTripStore } from '@/stores/mangeTripStore';
import { TripTrackTrace } from '../drawer/tripTrackTrace';
import TripOdometer from './TripOdometer';
import TripVendorFeedback from './TripVendorFeedback';
import { useTrainParametersAlertStore } from '@/stores/trainParametersAlertStore';
import { Alert, AlertDescription } from '../ui/alert';
import { tripService } from "@/api/services";


const TripRouteIcon = () => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.58171 3.16504H8.9437C11.4831 3.16504 12.7528 3.16504 13.2347 3.62111C13.6514 4.01535 13.836 4.59611 13.7235 5.15855C13.5934 5.80922 12.5568 6.54242 10.4836 8.00881L7.09647 10.4046C5.02329 11.871 3.9867 12.6042 3.85657 13.2549C3.74409 13.8173 3.92872 14.3981 4.34534 14.7923C4.82732 15.2484 6.097 15.2484 8.63637 15.2484H9.41504M5.66504 3.16504C5.66504 4.54575 4.54575 5.66504 3.16504 5.66504C1.78433 5.66504 0.665039 4.54575 0.665039 3.16504C0.665039 1.78433 1.78433 0.665039 3.16504 0.665039C4.54575 0.665039 5.66504 1.78433 5.66504 3.16504ZM17.3317 14.8317C17.3317 16.2124 16.2124 17.3317 14.8317 17.3317C13.451 17.3317 12.3317 16.2124 12.3317 14.8317C12.3317 13.451 13.451 12.3317 14.8317 12.3317C16.2124 12.3317 17.3317 13.451 17.3317 14.8317Z" stroke="#475467" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const ActionIconBar = () => {
  const [moreInfo, setMoreInfo] = useState(false);
  const [isAttachmentsOpen, setAttachmentsOpen] = useState(false);
  const [trackTraceOpen, setTrackTraceOpen] = useState(false);
  const [isOdometerOpen, setOdometerOpen] = useState(false);
  const [isVendorFeedbackOpen, setVendorFeedbackOpen] = useState(false);
  const [hasAttachments, setHasAttachments] = useState(false);
  const { tripData } = manageTripStore();
  const { openDrawer } = useDrawerStore();
  const { hasAlert, colorClass } = useTrainParametersAlertStore();
  const { setAlert, clearAlert } = useTrainParametersAlertStore();
  const { routes,
      selectedOrder,
      selectedRoute,
      selectedTrip,
      isDrawerOpen,
      isRouteDrawerOpen,
      isTripDrawerOpen,
      highlightedIndexes,
      fetchRoutes,
      handleCustomerOrderClick,
      openRouteDrawer,
      openTripDrawer,
      closeDrawer,
      closeRouteDrawer,
      closeTripDrawer,
      highlightRowIndexes,
      addLegPanel,
      removeLegPanel,
      updateLegData,
      addExecutionLeg,
      removeExecutionLeg,
      updateExecutionLeg,
      saveRouteDetails,
      saveTripDetails,
      fetchDepartures,
      fetchArrivals } = useTripLevelRouteStore();

    const tripId: any = tripData?.Header?.TripNo;

    // Always show alert by default; only manual close clears the dot
      useEffect(() => {
        // setShowAlert(true);
        setAlert(false, 'bg-amber-600');
      }, []);
      useEffect(() => {
        if (!tripId) return;
    
        const fetchData = async () => {
          try {
            const response = await tripService.getPathConstraints(tripId);
            const constraint = JSON.parse(response?.data?.ResponseData || '{}');
            const constraints = constraint?.PathConstraints;
            if (constraints) {
              console.log("constraints",constraints);
              if(parseFloat(constraints.BalanceLength)<0 || parseFloat(constraints.BalanceWeight)<0 || parseFloat(constraints.BalanceQuantity)<0){
                setAlert(true, 'bg-amber-600');
              }
              else{
                setAlert(false, 'bg-amber-600');
              }
              // // 🧩 Bind Length
              // setLengthData({
              //   planned: constraints.PlannedLength?.toString() || "",
              //   actual: constraints.ActualLength?.toString() || "",
              //   balance: constraints.BalanceLength?.toString() || "",
              //   unit: constraints.LengthUOM || "",
              // });
    
              // // 🧩 Bind Weight
              // setWeightData({
              //   planned: constraints.PlannedWeight?.toString() || "",
              //   actual: constraints.ActualWeight?.toString() || "",
              //   balance: constraints.BalanceWeight?.toString() || "",
              //   unit: constraints.WeightUOM || "",
              // });
    
              // // 🧩 Bind Quantity
              // setQuantityData({
              //   planned: constraints.PlannedQuantity?.toString() || "",
              //   actual: constraints.ActualQuantity?.toString() || "",
              //   balance: constraints.BalanceQuantity?.toString() || "",
              //   unit: constraints.QuantityUOM || "",
              // });
            }
          } catch (error) {
            console.error("Error loading PathConstraints:", error);
          }
        };
    
        fetchData();
      }, [tripId]);

  const checkAttachments = async () => {
    if (!tripId) return;
    try {
      const response = await tripService.getAttachments(tripId);
      const res: any = response.data;
      const parsedData = JSON.parse(res?.ResponseData) || [];
      if (parsedData?.AttachItems?.length > 0) {
        setHasAttachments(true);
      } else {
        setHasAttachments(false);
      }
    } catch (error) {
      console.error("Error checking attachments:", error);
    }
  };

  useEffect(() => {
    checkAttachments();
  }, [tripId]);

    // Alert dot is controlled manually from the drawer; default is active

  return (
    <div className="flex items-center justify-center border-t pt-4 mt-6 gap-3">
      {/* <Button onClick={() => setMoreInfo(true)} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <CircleArrowOutUpRight size={16} strokeWidth={1.5} />
        <span className="text-xs">Location</span>
      </Button> */}
      <Button title='Vendor Performance Feedback' onClick={() => setVendorFeedbackOpen(true)} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <MessageSquareText size={16} strokeWidth={1.5} />
        {/* <span className="text-xs">Map</span> */}
      </Button>
      <Button title='Odometer' onClick={() => setOdometerOpen(true)} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <MapPin size={16} strokeWidth={1.5} />
        {/* <span className="text-xs">Documents</span> */}
      </Button>
      <Button title='Track and Trace' onClick={() => setTrackTraceOpen(true)} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <AlarmClockPlus size={16} strokeWidth={1.5} />
        {/* <span className="text-xs">Calculate</span> */}
      </Button>
      <Button title='Attachments' onClick={() => setAttachmentsOpen(true)} variant="ghost" size="sm" className="relative flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        {hasAttachments && (
          <span
            className={`absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-green-600 ring-2 ring-white shadow-sm`}
          />
        )}
        <Paperclip size={16} strokeWidth={1.5} />
        {/* <span className="text-xs">Vehicle</span> */}
      </Button>
      {/* <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" title='Attachments' onClick={() => setAttachmentsOpen(true)}>
              <Paperclip className="w-5 h-5 text-gray-600" />
      </button> */}
      <Button title='Linked Transactions' onClick={() => openDrawer('linked-transactions')} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <Link size={16} strokeWidth={1.5} />
        {/* <span className="text-xs">Print</span> */}
      </Button>
      
      <Button
        title="Train Parameters"
        onClick={() => openDrawer('train-parameters')}
        variant="ghost"
        size="sm"
        className="relative flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]"
      >
        {/* Alert dot */}
        {hasAlert && (
          <span
            className={`absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full ${colorClass} ring-2 ring-white shadow-sm`}
          />
        )}

        <TramFront size={16} strokeWidth={1.5} />
      </Button>
      {hasAlert && (
        <Alert className=" px-4 py-2 bg-amber-50 border-amber-200" style={{ position: 'fixed', top: '65px', right: '25px', width: '50%' }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <AlertDescription className="text-amber-800 flex-1">
                Kindly note that the Actual &lt;weight/length/wagon quantity&gt; is higher than the planned.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // setShowAlert(false);
                  clearAlert();
                }}
                className="h-5 w-5 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-amber-600" />
              </Button>
            </div>
          </Alert>
      )}

      <Button title='Transport Route Update' onClick={() => openTripDrawer(tripId)} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <TripRouteIcon  />
        {/* <span className="text-xs">Print</span> */}
      </Button>

      <SideDrawer
        isOpen={moreInfo}
        onClose={() => setMoreInfo(false)}
        width="40%"
        title="More Info"
        isBack={false}
        contentBgColor='#f8f9fc'
        onScrollPanel={true}>
        <div className="h-full overflow-auto">
          {/* <div className="mb-6"> */}
          <MoreInfoPanel data={''} />
        </div>
      </SideDrawer>
      <SideDrawer isOpen={isAttachmentsOpen} onClose={() => setAttachmentsOpen(false)} width="80%" title="Attachments" isBack={false} badgeContent={tripId} onScrollPanel={true} isBadgeRequired={true}>
            <div className="">
              <div className="mt-0 text-sm text-gray-600"><Attachments isTripLogAttachments={true} /></div>
            </div>
      </SideDrawer>
      <SideDrawer isOpen={trackTraceOpen} onClose={() => setTrackTraceOpen(false)} width="100%" title="Trace and Trace" isBack={false} onScrollPanel={true} isBadgeRequired={true}>
            <div className="">
              <div className="mt-0 text-sm text-gray-600">
                {/* <Attachments isTripLogAttachments={true} /> */}
                <TripTrackTrace tripId={tripId} />
              </div>
            </div>
      </SideDrawer>

      <SideDrawer isOpen={isOdometerOpen} onClose={() => setOdometerOpen(false)} width="40%" title="Odometer" isBack={false} badgeContent={tripId} onScrollPanel={true} isBadgeRequired={true}>
            <div className="">
              <div className="mt-0 text-sm text-gray-600"><TripOdometer /></div>
            </div>
      </SideDrawer>

      <SideDrawer isOpen={isVendorFeedbackOpen} onClose={() => setVendorFeedbackOpen(false)} width="40%" title="Vendor Performance Feedback" isBack={false} badgeContent={tripId} onScrollPanel={true} isBadgeRequired={true}>
            <div className="">
              <div className="mt-0 text-sm text-gray-600"><TripVendorFeedback /></div>
            </div>
      </SideDrawer>


      {/* Trip Level Update Drawer */}
            <SideDrawer
              isOpen={isTripDrawerOpen}
              onClose={closeTripDrawer}
              title="Trip Level Update"
              width="100%"
               isBack={false}
              // showFooter={false}
            >
              {selectedTrip && (
                <TripLevelUpdateDrawer 
                  tripData={selectedTrip}
                  onAddExecutionLeg={addExecutionLeg}
                  onRemoveExecutionLeg={removeExecutionLeg}
                  onUpdateExecutionLeg={updateExecutionLeg}
                  onSave={saveTripDetails}
                  fetchDepartures={fetchDepartures}
                  fetchArrivals={fetchArrivals}
                />
              )}
            </SideDrawer>

    </div>

  );
};