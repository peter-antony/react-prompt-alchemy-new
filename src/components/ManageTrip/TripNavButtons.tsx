import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface TripNavButtonsProps {
  previousTrips?: { PrevTripNo: string; PrevTripOU?: string }[];
  nextTrips?: { NextTripNo: string; NextTripOU?: string }[];
}

export const TripNavButtons = ({ previousTrips = [], nextTrips = [] }: TripNavButtonsProps) => {
  return (
    <div className="flex justify-between gap-3">
      {/* 🔹 Previous Trip Button with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span>↩</span>
              Previous Trip
              <span className="text-blue-600 font-semibold">
                ({previousTrips?.length})
              </span>
            </button>
          </TooltipTrigger>
          {previousTrips?.length > 0 && (
            <TooltipContent
              side="top"
              className="p-3 bg-white border border-gray-200 rounded-lg shadow-md min-w-[180px]"
            >
              <ul className="space-y-1">
                {previousTrips?.map((trip, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-800 font-medium last:border-none border-gray-100 pb-2"
                  >
                    {trip?.PrevTripNo && (
                      <a className="text-[13px] ml-1 text-blue-600 hover:underline">
                        <Link to={`/manage-trip?id=${trip?.PrevTripNo}`}>
                          {trip?.PrevTripNo}
                        </Link>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* 🔹 Next Trip Button with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span>↪</span>
              Next Trip
              <span className="text-blue-600 font-semibold">
                ({nextTrips?.length})
              </span>
            </button>
          </TooltipTrigger>
          {nextTrips?.length > 0 && (
            <TooltipContent
              side="top"
              className="p-3 bg-white border border-gray-200 rounded-lg shadow-md min-w-[180px]"
            >
              {/* <div className="text-xs font-semibold text-gray-600 mb-2">
                Next Trip IDs
              </div> */}
              <ul className="space-y-1">
                {nextTrips?.map((trip, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-800 font-medium last:border-none border-gray-100 pb-2"
                  >
                    {/* {trip.TripNo}{" "} */}
                    {trip?.NextTripNo && (
                      <a className="text-[13px] ml-1 text-blue-600 hover:underline">
                        <Link to={`/manage-trip?id=${trip?.NextTripNo}`}>
                          {trip?.NextTripNo}
                        </Link>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};