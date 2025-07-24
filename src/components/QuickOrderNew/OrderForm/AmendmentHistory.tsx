import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

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
  return (
    <div className="bg-[#f8fafd] min-h-screen flex flex-col items-start px-8 py-6">
      <div className="relative w-full">
        <TooltipProvider>
        {timelineData.map((item, idx) => (
          <div key={item.number} className="flex items-start last:mb-0">
            {/* Timeline line */}
            <div className="flex flex-col items-center mr-4 mt-1">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {item.number}
              </div>
              {idx !== timelineData.length - 1 && (
                <div className="w-px flex-1 bg-blue-100" style={{ minHeight: "60px" }} />
              )}
            </div>
            {/* Content */}
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-800 text-lg" style={{ fontSize: "15px" }}>
                  {item.user}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Info className="w-4 h-4 text-gray-400 cursor-pointer" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow text-left whitespace-pre-line">
                    {item.info.startsWith('Created By') || item.info.startsWith('Updated By') ? (
                      <div>
                        <span className="block text-xs font-semibold">
                          {item.info.split(' ')[0]} {item.info.split(' ')[1]}
                        </span>
                        <span className="block text-[11px] font-normal">
                          {item.info.replace(/^Created By |^Updated By /, '')}
                        </span>
                      </div>
                    ) : (
                      item.info
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-gray-500 ">
                {item.date} <span className="ml-2">{item.time}</span>
              </div>
              <div className="text-sm text-gray-400 ">
                {item.status}
              </div>
            </div>
          </div>
        ))}
        </TooltipProvider>
      </div>
    </div>
  );
} 