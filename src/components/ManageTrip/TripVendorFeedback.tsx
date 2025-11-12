import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { manageTripStore } from "@/stores/mangeTripStore";
import { DynamicLazySelect } from "../DynamicPanel/DynamicLazySelect";

import { useToast } from "@/hooks/use-toast";
import { quickOrderService, tripService } from "@/api/services";
import { tripPlanningService } from "@/api/services/tripPlanningService";

const TripVendorFeedback = () => {
    const { tripData } = manageTripStore();
    const VendorFeedbackData = tripData?.Header?.VendorPerformaneFeedback || {};

    console.log("VendorFeedbackData", VendorFeedbackData);

    const { toast } = useToast();

    // Extract vendor info
    const vendorCode = VendorFeedbackData.VendorID;
    const vendorName = VendorFeedbackData.VendorDescription;

    // Initialize with backend values
    const [rating, setRating] = useState(VendorFeedbackData.Rating);
    const [feedback, setFeedback] = useState(VendorFeedbackData.Feedback);
    const [reasonCode, setReasonCode] = useState(VendorFeedbackData.ReasonCode || "");
    const [remarks, setRemarks] = useState(VendorFeedbackData.Remarks || "");
    const defaultReasonForUpdate = VendorFeedbackData?.ReasonCode
        ? [VendorFeedbackData.ReasonCode, VendorFeedbackData.ReasonCodeDescription].filter(Boolean).join(" || ")
        : undefined;
    const [reasonForUpdate, setReasonForUpdate] = useState<string | undefined>(defaultReasonForUpdate);
    const [saving, setSaving] = useState(false);

    const ratingLabels = ["Very Poor", "Poor", "OK", "Good", "Excellent"];

    // 🔄 Load vendor feedback from API when drawer opens (component mounts)
    const tripId = tripData?.Header?.TripNo || (tripData as any)?.Header?.TripID;
    useEffect(() => {
        if (!tripId) return;

        const loadVendorFeedback = async () => {
            try {
                const response = await tripPlanningService.getTripDataByID(tripId);
                const raw: any = response as any;
                const payload = raw?.data ?? raw;
                const parsed = payload?.ResponseData
                    ? JSON.parse(payload.ResponseData)
                    : payload;

                const data = Array.isArray(parsed) ? parsed[0] : parsed;
                if (!data) return;

                // Update global trip store with latest data
                manageTripStore.getState().setTrip?.(data);

                // Bind vendor feedback fields to local state
                const vf = data?.Header?.VendorPerformaneFeedback || {};
                setRating(vf?.Rating);
                setFeedback(vf?.Feedback);
                setReasonCode(vf?.ReasonCode || "");
                setRemarks(vf?.Remarks || "");
                const preSelectedReason = vf?.ReasonCode
                    ? [vf.ReasonCode, vf.ReasonCodeDescription].filter(Boolean).join(" || ")
                    : undefined;
                setReasonForUpdate(preSelectedReason);
            } catch (error) {
                console.error("Error loading vendor feedback:", error);
            }
        };

        loadVendorFeedback();
    }, [tripId]);

    // ⭐ When user clicks a star
    const handleRatingClick = (value: number) => {
        setRating(value);
        setFeedback(ratingLabels[value - 1]);
    };

    // 📜 Fetch options for "Reason Code"
    const fetchVendorFeedbackReasonOptions = async ({
        searchTerm,
        offset,
        limit,
    }: {
        searchTerm: string;
        offset: number;
        limit: number;
    }) => {
        try {
            const response = await quickOrderService.getMasterCommonData({
                messageType: "Vendor Feedback Reason Init",
                searchTerm: searchTerm || "",
                offset,
                limit,
            });

            const rr: any = response.data;
            const parsedData = JSON.parse(rr.ResponseData) || [];

            return parsedData
                .filter((item: any) => item.id && item.name)
                .map((item: any) => ({
                    label: `${item.id} || ${item.name}`,
                    value: `${item.id} || ${item.name}`,
                }));
        } catch (error) {
            console.error("Error fetching service type options:", error);
            return [];
        }
    };


    // Save feedback data
    const handleSave = async () => {
        if (!tripData || !tripData.Header) {
            toast({
                title: "Save Failed",
                description: "Missing trip header data.",
                variant: "destructive",
            });
            return;
        }

        // Extract ReasonCode and Description (split by "||")
        const selectedReason = reasonForUpdate || reasonCode || "";
        const [reasonCodeValue, reasonDescValue] = selectedReason
            ? selectedReason.split("||").map((s) => s.trim())
            : ["", ""];

        const payload = {
            VendorID: vendorCode,
            VendorDescription: vendorName,
            Rating: rating,
            Feedback: feedback,
            ReasonCode: reasonCodeValue || "",
            ReasonCodeDescription: reasonDescValue || "",
            Remarks: remarks,
            ModeFlag: "Update",
        };

        const updatedTripData = {
            ...tripData,
            Header: {
                ...tripData.Header,
                VendorPerformaneFeedback: payload,
            },
        };

        try {
            setSaving(true);
            const response = await tripService.saveTrip(updatedTripData);
            const isSuccess = (response as any)?.data?.IsSuccess;

            if (isSuccess) {
                manageTripStore.getState().setTrip?.(updatedTripData as any);
                toast({
                    title: "Saved Successfully",
                    description: "Vendor feedback details updated.",
                });
            } else {
                const message =
                    (response as any)?.data?.Message ||
                    "Failed to save vendor feedback details.";
                toast({
                    title: "Save Failed",
                    description: message,
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            toast({
                title: "Save Failed",
                description: err?.message || "Unexpected error.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-sm p-6 relative">
            <div className="flex flex-col space-y-6 pb-24">
                {/* Vendor Info */}
                <div className="flex flex-col">
                    <Label className="text-sm font-medium mb-1 text-gray-700">Vendor</Label>
                    <div className="text-gray-800 text-sm font-medium">
                        {vendorCode || "-"} - {vendorName || "-"}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="flex flex-col">
                    <Label className="text-sm font-medium mb-2 text-gray-700">Feedback</Label>
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={22}
                                onClick={() => handleRatingClick(star)}
                                className={`cursor-pointer ${star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                    }`}
                            />
                        ))}
                        <span className="text-sm text-gray-700">
                            {feedback || ratingLabels[rating - 1] || ""}
                        </span>
                    </div>
                </div>

                {/* Reason Code */}
                <div className="flex flex-col">
                    <Label className="text-sm font-medium mb-2 text-gray-700">Reason Code</Label>
                    <DynamicLazySelect
                        fetchOptions={fetchVendorFeedbackReasonOptions}
                        value={reasonForUpdate}
                        onChange={(value) => setReasonForUpdate(value as string)}
                        placeholder="Select Reason"
                    />
                </div>

                {/* Remarks */}
                <div className="flex flex-col">
                    <Label className="text-sm font-medium mb-2 text-gray-700">Remarks</Label>
                    <Textarea
                        placeholder="Enter remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                    />
                </div>
            </div>

            {/* Sticky Save Button */}
            <div className="sticky bottom-0 left-0 right-0 bg-white px-6 py-4 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                    {/* {saving ? "Saving..." : "Save Details"} */}
                    Save Details
                </Button>
            </div>
        </div>
    );
};

export default TripVendorFeedback;
