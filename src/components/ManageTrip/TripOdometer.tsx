import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { manageTripStore } from "@/stores/mangeTripStore";
import { tripService } from "@/api/services/tripService";
import { useToast } from "@/hooks/use-toast";

const TripOdometer = () => {
  const { tripData } = manageTripStore();
  const OdometerData = tripData?.Header || {};

  // Handle null values
  const odometerUOM = OdometerData.OdometerUOM ?? "-";
  const initialStart = OdometerData.TripOdometerStart ?? "-";
  const initialEnd = OdometerData.TripOdometerEnd ?? "-";
  const initialTotal = OdometerData.TotalOdometer ?? "-";

  const [odometerStart, setOdometerStart] = useState(initialStart);
  const [odometerEnd, setOdometerEnd] = useState(initialEnd);
  const [totalTripRun, setTotalTripRun] = useState(initialTotal);
  // const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Helper: remove UOM or symbols from value for calculation
  const parseValue = (value: string) => {
    const num = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(num) ? null : num;
  };

  // Calculate total trip run when start/end change
  useEffect(() => {
    const start = parseValue(odometerStart);
    const end = parseValue(odometerEnd);

    if (start !== null && end !== null) {
      const total = (end - start).toFixed(2);
      setTotalTripRun(`${total} ${odometerUOM}`);
    } else {
      setTotalTripRun("-");
    }
  }, [odometerStart, odometerEnd, odometerUOM]);

  const formatNumericString = (value: string) => {
    const parsed = parseValue(value);
    return parsed === null ? null : parsed.toFixed(2);
  };

  const handleSave = async () => {
    if (!tripData || !tripData.Header) {
      toast({ title: "Save Failed", description: "Missing trip header data.", variant: "destructive" });
      return;
    }

    const formattedStart = formatNumericString(odometerStart);
    const formattedEnd = formatNumericString(odometerEnd);

    const updatedTripData = {
      ...tripData,
      Header: {
        ...tripData.Header,
        TripOdometerStart: formattedStart,
        TripOdometerEnd: formattedEnd,
        // Do not set TotalOdometer; API will calculate it
        ModeFlag: "Update",
      },
    };

    try {
      // setSaving(true);
      const response = await tripService.saveTrip(updatedTripData);
      const isSuccess = (response as any)?.data?.IsSuccess;

      if (isSuccess) {
        // Optimistically update store
        manageTripStore.getState().setTrip?.(updatedTripData as any);
        toast({ title: "Saved Successfully", description: "Odometer details updated." });
      } else {
        const message = (response as any)?.data?.Message || "Failed to save odometer details.";
        toast({ title: "Save Failed", description: message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Save Failed", description: err?.message || "Unexpected error.", variant: "destructive" });
    } finally {
      // setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-sm p-6 relative">
      {/* <h2 className="text-lg font-semibold mb-6">Odometer</h2> */}

      {/* Inputs */}
      <div className="flex flex-col space-y-6 pb-24">
        {/* Odometer Start */}
        <div className="flex flex-col">
          <Label className="text-sm font-medium mb-2 text-gray-700">
            Odometer Start
          </Label>
          <Input
            placeholder="Enter Odometer Start"
            value={odometerStart || "-"}
            onChange={(e) => setOdometerStart(e.target.value)}
          />
        </div>

        {/* Odometer End */}
        <div className="flex flex-col">
          <Label className="text-sm font-medium mb-2 text-gray-700">
            Odometer End
          </Label>
          <Input
            placeholder="Enter Odometer End"
            value={odometerEnd || "-"}
            onChange={(e) => setOdometerEnd(e.target.value)}
          />
        </div>

        {/* Total Trip Run */}
        <div className="flex flex-col">
          <Label className="text-sm font-medium mb-2 text-gray-700">
            Total Trip Run
          </Label>
          <Input
            placeholder="Enter Total Trip Run"
            value={totalTripRun || "-"}
            readOnly
          />
        </div>
      </div>

      {/* Fixed Footer Save Button */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 flex justify-end">
        <Button
          onClick={handleSave}
          // disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          {/* {saving ? "Saving..." : "Save Details"} */}
          Save Details
        </Button>
      </div>
    </div>
  );
};

export default TripOdometer;
