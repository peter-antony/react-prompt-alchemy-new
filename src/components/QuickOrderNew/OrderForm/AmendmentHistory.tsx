import React, { useState, useEffect } from 'react';
import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import jsonStore from '@/stores/jsonStore';

const timelineData = [
  {
    number: 3,
    user: "Testuser",
    date: "10/12/2024",
    time: "06:15 PM",
    status: "Customer Request",
    info: "Created By Test User"
  },
  {
    number: 2,
    user: "QAuser",
    date: "08/12/2024",
    time: "08:30 AM",
    status: "Damaged",
    info: "Updated By QA User"
  },
  {
    number: 1,
    user: "Ramcouser",
    date: "07/12/2024",
    time: "10:00 AM",
    status: "Customer Request",
    info: "Created By Ramco User"
  },
];

export default function AmendmentHistory() {

  const [amendmentHistory, setAmendmentHistroy] = useState<any[]>([]);
  useEffect(() => {
    const resourceGroups = jsonStore.getQuickOrder().AmendmentHistory;
    console.log("AmendmentHistory Data:", jsonStore.getQuickOrder().AmendmentHistory);
    setAmendmentHistroy(jsonStore.getQuickOrder().AmendmentHistory);
    console.log("AmendmentHistory Data:", resourceGroups);
  }, []);

  return (
    <div className="bg-[#f8fafd] min-h-screen flex flex-col items-start px-8 py-6">
      <div className="relative w-full">
        <TooltipProvider>
        {amendmentHistory.map((item, idx) => (
          <div key={item.AmendmentNo} className="flex items-start last:mb-0">
            {/* Timeline line */}
            <div className="flex flex-col items-center mr-4 mt-1">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {item.AmendmentNo}
              </div>
              {idx !== amendmentHistory.length - 1 && (
                <div className="w-px flex-1 bg-blue-100" style={{ minHeight: "60px" }} />
              )}
            </div>
            {/* Content */}
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-800 text-lg" style={{ fontSize: "15px" }}>
                  {item.username}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Info className="w-4 h-4 text-gray-400 cursor-pointer" /></span>
                  </TooltipTrigger>
                </Tooltip>
              </div>
              <div className="text-sm text-gray-500 ">
                {/* Split updTime by space and show only the date part */}
                {item.updTime && item.updTime.split(' ')[0]}
                <span className="ml-2"></span>
              </div>
            </div>
          </div>
        ))}
        </TooltipProvider>
      </div>
    </div>
  );
} 