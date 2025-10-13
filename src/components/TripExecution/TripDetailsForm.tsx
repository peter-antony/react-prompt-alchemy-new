import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trip } from "@/api/types";

interface TripDetailsFormProps {
  tripData?: Trip | null;
  onFieldChange?: (field: keyof Trip, value: any) => void;
}

export const TripDetailsForm = ({ tripData, onFieldChange }: TripDetailsFormProps) => {
  return (
    <div className="space-y-6">
      {/* Trip Information Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Customer ID</span>
            <div className="font-medium">{tripData?.customerId || "-"}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Rail Info</span>
            <div className="font-medium">{tripData?.railInfo || "-"}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Amount</span>
            <div className="font-medium">{tripData?.amount ? `€ ${tripData.amount.toFixed(2)}` : "-"}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Mode</span>
            <div className="font-medium">{tripData?.mode || "-"}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">From</span>
            <div className="font-medium">{tripData?.fromLocation || "-"}</div>
          </div>
          <div>
            <span className="text-muted-foreground">To</span>
            <div className="font-medium">{tripData?.toLocation || "-"}</div>
          </div>
        </div>
      </div>

      {/* Trip Type Radio */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Trip Type</Label>
        <RadioGroup
          value={tripData?.tripType || "one-way"}
          onValueChange={(value) => onFieldChange?.("tripType", value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one-way" id="one-way" />
            <Label htmlFor="one-way" className="text-sm font-normal cursor-pointer">
              One Way
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="round-trip" id="round-trip" />
            <Label htmlFor="round-trip" className="text-sm font-normal cursor-pointer">
              Round Trip
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="train-no" className="text-sm font-medium">
              Train No.
            </Label>
            <Input
              id="train-no"
              placeholder="Enter Train No."
              className="h-9"
              value={tripData?.trainNo || ""}
              onChange={(e) => onFieldChange?.("trainNo", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cluster" className="text-sm font-medium">
              Cluster
            </Label>
            <Select value={tripData?.cluster || ""} onValueChange={(value) => onFieldChange?.("cluster", value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select Cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10000406">10000406</SelectItem>
                <SelectItem value="10000407">10000407</SelectItem>
                <SelectItem value="10000408">10000408</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier-ref" className="text-sm font-medium">
            Supplier Ref. No.
          </Label>
          <Input
            id="supplier-ref"
            placeholder="Enter Supplier Ref. No."
            className="h-9"
            value={tripData?.supplierRefNo || ""}
            onChange={(e) => onFieldChange?.("supplierRefNo", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qc-userdefined" className="text-sm font-medium">
            QC Userdefined 1
          </Label>
          <Input
            id="qc-userdefined"
            placeholder="Enter Value"
            className="h-9"
            value={tripData?.qcUserdefined1 || ""}
            onChange={(e) => onFieldChange?.("qcUserdefined1", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks" className="text-sm font-medium">
            Remarks 1
          </Label>
          <Textarea
            id="remarks"
            placeholder="Enter Remarks"
            className="min-h-[80px] resize-none"
            value={tripData?.remarks1 || ""}
            onChange={(e) => onFieldChange?.("remarks1", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
