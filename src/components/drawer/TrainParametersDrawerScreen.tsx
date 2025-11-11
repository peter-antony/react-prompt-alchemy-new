import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { tripService } from "@/api/services";
import { useToast } from "@/hooks/use-toast";
import { useTrainParametersAlertStore } from "@/stores/trainParametersAlertStore";

interface TrainParametersDrawerScreenProps {
  onClose: () => void;
  tripId?: string;
}

interface ParameterData {
  planned: string;
  actual: string;
  balance: string;
  unit: string;
}

export const TrainParametersDrawerScreen: React.FC<TrainParametersDrawerScreenProps> = ({
  onClose,
  tripId,
}) => {
  const [showAlert, setShowAlert] = useState(true);
  const { toast } = useToast();
  const { setAlert, clearAlert } = useTrainParametersAlertStore();

  const [lengthData, setLengthData] = useState<ParameterData>({
    planned: "",
    actual: "",
    balance: "",
    unit: "",
  });

  const [weightData, setWeightData] = useState<ParameterData>({
    planned: "",
    actual: "",
    balance: "",
    unit: "",
  });

  const [quantityData, setQuantityData] = useState<ParameterData>({
    planned: "",
    actual: "",
    balance: "",
    unit: "",
  });

  // Unit dropdown state
  const [lengthUnits, setLengthUnits] = useState<string[]>([]);
  const [weightUnits, setWeightUnits] = useState<string[]>([]);
  const [quantityUnits, setQuantityUnits] = useState<string[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  // 🧩 Fetch all three APIs in parallel
  useEffect(() => {
    const fetchAllUnits = async () => {
      setLoadingUnits(true);
      try {
        const [lengthRes, weightRes, quantityRes] = await Promise.all([
          tripService.getCommonCombo({ messageType: "Wagon Length UOM Init" }),
          tripService.getCommonCombo({ messageType: "Weight UOM Init" }),
          tripService.getCommonCombo({ messageType: "THU UOM Init" }),
        ]);
        console.log('lengthRes', lengthRes)

        const parseData = (res: any) => {
          const parsed = JSON.parse(res?.data?.ResponseData || "[]");
          // Defensive check in case API returns single object instead of array
          return Array.isArray(parsed) ? parsed : [];
        };

        setLengthUnits(parseData(lengthRes));
        setWeightUnits(parseData(weightRes));
        setQuantityUnits(parseData(quantityRes));
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchAllUnits();
  }, []);

  // Helper to compare numeric strings safely
  const isGreater = (a: string, b: string) => {
    const an = parseFloat(a);
    const bn = parseFloat(b);
    if (isNaN(an) || isNaN(bn)) return false;
    return an > bn;
  };

  // Always show alert by default; only manual close clears the dot
  useEffect(() => {
    setShowAlert(true);
    setAlert(true, 'bg-amber-600');
  }, []);

  // 🔹 Fetch PathConstraints API on mount
  useEffect(() => {
    if (!tripId) return;

    const fetchData = async () => {
      try {
        const response = await tripService.getPathConstraints(tripId);
        const constraint = JSON.parse(response?.data?.ResponseData || '{}');
        const constraints = constraint?.PathConstraints;
        if (constraints) {
          // 🧩 Bind Length
          setLengthData({
            planned: constraints.PlannedLength?.toString() || "",
            actual: constraints.ActualLength?.toString() || "",
            balance: constraints.BalanceLength?.toString() || "",
            unit: constraints.LengthUOM || "",
          });

          // 🧩 Bind Weight
          setWeightData({
            planned: constraints.PlannedWeight?.toString() || "",
            actual: constraints.ActualWeight?.toString() || "",
            balance: constraints.BalanceWeight?.toString() || "",
            unit: constraints.WeightUOM || "",
          });

          // 🧩 Bind Quantity
          setQuantityData({
            planned: constraints.PlannedQuantity?.toString() || "",
            actual: constraints.ActualQuantity?.toString() || "",
            balance: constraints.BalanceQuantity?.toString() || "",
            unit: constraints.QuantityUOM || "",
          });
        }
      } catch (error) {
        console.error("Error loading PathConstraints:", error);
      }
    };

    fetchData();
  }, [tripId]);

  const handleSave = async () => {
    console.log("Saving train parameters:", {
      length: lengthData,
      weight: weightData,
      quantity: quantityData,
    });
    try {
      const response = await tripService.savePathConstraints(tripId, {
        "PlannedLength": parseFloat(lengthData.planned),
        "ActualLength": parseFloat(lengthData.actual),
        "BalanceLength": parseFloat(lengthData.balance),
        "LengthUOM": lengthData.unit,
        "PlannedWeight": parseFloat(weightData.planned),
        "ActualWeight": parseFloat(weightData.actual),
        "BalanceWeight": parseFloat(weightData.balance),
        "WeightUOM": weightData.unit,
        "PlannedQuantity": parseFloat(quantityData.planned),
        "ActualQuantity": parseFloat(quantityData.actual),
        "BalanceQuantity": parseFloat(quantityData.balance),
        "QuantityUOM": quantityData.unit,
        "AllowedLength": "0",
        "AllowedWeight": "0",
        "AllowedQuantity": "0"
      });

      const isSuccess = response?.data?.IsSuccess !== false;
      const message = response?.data?.Message || (isSuccess ? "Saved successfully" : "Save failed");

      toast({
        title: isSuccess ? "✅ Path Constraints Saved" : "❌ Save Failed",
        description: message,
        variant: isSuccess ? "default" : "destructive",
      });

      if (isSuccess) {
        // Optionally re-fetch latest constraints
        try {
          const reload = await tripService.getPathConstraints(tripId!);
          const constraint = JSON.parse(reload?.data?.ResponseData || '{}');
          const constraints = constraint?.PathConstraints;
          if (constraints) {
            setLengthData({
              planned: constraints.PlannedLength?.toString() || "",
              actual: constraints.ActualLength?.toString() || "",
              balance: constraints.BalanceLength?.toString() || "",
              unit: constraints.LengthUOM || "",
            });
            setWeightData({
              planned: constraints.PlannedWeight?.toString() || "",
              actual: constraints.ActualWeight?.toString() || "",
              balance: constraints.BalanceWeight?.toString() || "",
              unit: constraints.WeightUOM || "",
            });
            setQuantityData({
              planned: constraints.PlannedQuantity?.toString() || "",
              actual: constraints.ActualQuantity?.toString() || "",
              balance: constraints.BalanceQuantity?.toString() || "",
              unit: constraints.QuantityUOM || "",
            });
          }
        } catch (e) {
          console.error("Failed to reload PathConstraints after save", e);
        }
      }
    } catch (error: any) {
      console.error("Error saving PathConstraints:", error);
      toast({
        title: "❌ Save Failed",
        description: error?.data?.Message || error?.message || "Failed to save path constraints",
        variant: "destructive",
      });
    }
  };

  // Helper to ensure only numeric input is allowed
  const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const invalidChars = ["e", "E", "+", "-"];
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  };

  const calculateBalance = (planned: string, actual: string) => {
    const plannedNum = parseFloat(planned || "0");
    const actualNum = parseFloat(actual || "0");
    const balance = plannedNum - actualNum;
    return balance.toFixed(2); // keep 2 decimal places
  };

  const renderParameterRow = (
    label: string,
    data: ParameterData,
    setData: React.Dispatch<React.SetStateAction<ParameterData>>,
    unitOptions: string[]
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Planned */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Planned {label}</Label>
        <div className="flex gap-2">
          <Select
            value={data.unit}
            onValueChange={(value) => setData({ ...data, unit: value })}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit: any) => (
                <SelectItem key={unit.id} value={unit.name}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            inputMode="decimal"
            onKeyDown={handleNumericInput}
            value={data.planned}
            // onChange={(e) => setData({ ...data, planned: e.target.value })}
            onChange={(e) => {
              const planned = e.target.value;
              const balance = calculateBalance(planned, data.actual);
              setData({ ...data, planned, balance });
            }}
            className="flex-1 h-10"
          />
        </div>
      </div>

      {/* Actual */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Actual {label}</Label>
        <div className="flex gap-2">
          <Select
            value={data.unit}
            onValueChange={(value) => setData({ ...data, unit: value })}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit: any) => (
                <SelectItem key={unit.id} value={unit.name}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            onKeyDown={handleNumericInput}
            inputMode="decimal"
            value={data.actual}
            // onChange={(e) => setData({ ...data, actual: e.target.value })}
            onChange={(e) => {
              const actual = e.target.value;
              const balance = calculateBalance(data.planned, actual);
              setData({ ...data, actual, balance });
            }}
            className="flex-1 h-10"
          />
        </div>
      </div>

      {/* Balance */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Balance {label}</Label>
        <div className="flex gap-2">
          <Select
            value={data.unit}
            onValueChange={(value) => setData({ ...data, unit: value })}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit: any) => (
                <SelectItem key={unit.id} value={unit.name}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            inputMode="decimal"
            value={data.balance}
            disabled
            onChange={(e) => setData({ ...data, balance: e.target.value })}
            className={cn(
              "flex-1 h-10",
              parseFloat(data.balance) < 0 && "text-red-600"
            )}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ⚠️ Alert */}
        {showAlert && (
          <Alert className="bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <AlertDescription className="text-amber-800 flex-1">
                Kindly note that the Actual &lt;weight/length/wagon quantity&gt; is higher than the planned.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAlert(false);
                  clearAlert();
                }}
                className="h-5 w-5 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-amber-600" />
              </Button>
            </div>
          </Alert>
        )}

        {/* Length */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Length Details</h3>
          {renderParameterRow("Length", lengthData, setLengthData, lengthUnits)}
        </div>

        {/* Weight */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Weight Details</h3>
          {renderParameterRow("Weight", weightData, setWeightData, weightUnits)}
        </div>

        {/* Quantity */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Wagon Quantity Details</h3>
          {renderParameterRow("Quantity", quantityData, setQuantityData, quantityUnits)}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};