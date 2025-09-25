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
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <span className="font-semibold text-gray-800 text-lg" style={{ fontSize: "15px" }}>
                  {item.username} 
                </span>
                <div className='relative group'>
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                  <div className="absolute left-0 top-4 z-30 hidden group-hover:block min-w-[100px] max-w-xs bg-gray-900 text-white rounded-md shadow-xl border border-gray-200 text-xs">
                    <div className="px-3 py-2">
                      <div className="font-semibold mb-1">{item.username} </div>
                      <div className="text-[11px] font-medium">
                        {item.reasoncode}
                      </div>
                    </div>
                  </div>
                </div>
            </div>
              {/* <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-800 text-lg" style={{ fontSize: "15px" }}>
                  {item.username}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Info className="w-4 h-4 text-gray-400 cursor-pointer" /></span>
                  </TooltipTrigger>
                </Tooltip>
              </div> */}
              <div className="text-sm text-gray-500 ">
                {/* Format updTime from "2025-09-25T15:39:33.427" to "25/09/2025 03:39PM" */}
                {item.updTime && (() => {
                  const date = new Date(item.updTime);
                  if (isNaN(date.getTime())) return null;
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  let hours = date.getHours();
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12;
                  hours = hours ? hours : 12; // the hour '0' should be '12'
                  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
                  return `${day}/${month}/${year}  ${formattedTime}`;
                })()}
                <span className="ml-2"></span>
              </div>
              <div className="text-sm text-gray-500 ">
                {item.reasoncode}
              </div>
            </div>
          </div>
        ))}
        </TooltipProvider>
      </div>
    </div>
  );
} 