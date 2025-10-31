import React, { useState } from 'react';
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
  TramFront
} from 'lucide-react';
import { MoreInfoPanel } from './MoreInfo';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { useDrawerStore } from '@/stores/drawerStore';
import { useTransportRouteStore as useTripLevelRouteStore } from '@/stores/tripLevelRouteStore';
import { TripLevelUpdateDrawer } from '../drawer/TripLevelUpdateDrawer';
import { manageTripStore } from '@/stores/mangeTripStore';


const TripRouteIcon = () => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.58171 3.16504H8.9437C11.4831 3.16504 12.7528 3.16504 13.2347 3.62111C13.6514 4.01535 13.836 4.59611 13.7235 5.15855C13.5934 5.80922 12.5568 6.54242 10.4836 8.00881L7.09647 10.4046C5.02329 11.871 3.9867 12.6042 3.85657 13.2549C3.74409 13.8173 3.92872 14.3981 4.34534 14.7923C4.82732 15.2484 6.097 15.2484 8.63637 15.2484H9.41504M5.66504 3.16504C5.66504 4.54575 4.54575 5.66504 3.16504 5.66504C1.78433 5.66504 0.665039 4.54575 0.665039 3.16504C0.665039 1.78433 1.78433 0.665039 3.16504 0.665039C4.54575 0.665039 5.66504 1.78433 5.66504 3.16504ZM17.3317 14.8317C17.3317 16.2124 16.2124 17.3317 14.8317 17.3317C13.451 17.3317 12.3317 16.2124 12.3317 14.8317C12.3317 13.451 13.451 12.3317 14.8317 12.3317C16.2124 12.3317 17.3317 13.451 17.3317 14.8317Z" stroke="#475467" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const ActionIconBar = () => {
  const [moreInfo, setMoreInfo] = useState(false);
  const { tripData } = manageTripStore();
  const { openDrawer } = useDrawerStore();
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

    

  return (
    <div className="flex items-center justify-center border-t pt-4 mt-6 gap-3">
      {/* <Button onClick={() => setMoreInfo(true)} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <CircleArrowOutUpRight size={16} strokeWidth={1.2} />
        <span className="text-xs">Location</span>
      </Button> */}
      <Button variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <MessageSquareText size={16} strokeWidth={1.2} />
        {/* <span className="text-xs">Map</span> */}
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <MapPin size={16} strokeWidth={1.2} />
        {/* <span className="text-xs">Documents</span> */}
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <AlarmClockPlus size={16} strokeWidth={1.2} />
        {/* <span className="text-xs">Calculate</span> */}
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <FileUp size={16} strokeWidth={1.2} />
        {/* <span className="text-xs">Vehicle</span> */}
      </Button>
      <Button onClick={() => openDrawer('linked-transactions')} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <Link size={16} strokeWidth={1.2} />
        {/* <span className="text-xs">Print</span> */}
      </Button>
      <Button onClick={() => openDrawer('train-parameters')} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
        <TramFront size={16} strokeWidth={1.2} />
        {/* <span className="text-xs">Print</span> */}
      </Button>
      <Button onClick={() => openTripDrawer(tripId)} variant="ghost" size="sm" className="flex-col h-auto rounded-lg p-2.5 border border-[#D0D5DD]">
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