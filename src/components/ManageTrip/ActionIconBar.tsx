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

export const ActionIconBar = () => {
  const [moreInfo, setMoreInfo] = useState(false);
  const { openDrawer } = useDrawerStore();
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
    </div>

  );
};