import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
  
  const [lengthData, setLengthData] = useState<ParameterData>({
    planned: '50',
    actual: '60',
    balance: '-10',
    unit: 'M',
  });

  const [weightData, setWeightData] = useState<ParameterData>({
    planned: '300',
    actual: '250',
    balance: '50',
    unit: 'TON',
  });

  const [quantityData, setQuantityData] = useState<ParameterData>({
    planned: '28',
    actual: '28',
    balance: '0',
    unit: 'No',
  });

  const handleSave = () => {
    console.log('Saving train parameters:', {
      length: lengthData,
      weight: weightData,
      quantity: quantityData,
    });
    // Add save logic here
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={data.planned}
            onChange={(e) => setData({ ...data, planned: e.target.value })}
            className="flex-1"
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={data.actual}
            onChange={(e) => setData({ ...data, actual: e.target.value })}
            className="flex-1"
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={data.balance}
            onChange={(e) => setData({ ...data, balance: e.target.value })}
            className={cn(
              "flex-1",
              parseFloat(data.balance) < 0 && "text-red-600"
            )}
            disabled
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alert Message */}
        {showAlert && (
          <Alert className="bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <AlertDescription className="text-amber-800 flex-1">
                Kindly take note that the Actual &lt;weight/length/wagon quantity&gt; is higher than the planned.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAlert(false)}
                className="h-5 w-5 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-amber-600" />
              </Button>
            </div>
          </Alert>
        )}

        {/* Length Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Length Details</h3>
          {renderParameterRow('Length', lengthData, setLengthData, ['M', 'FT', 'KM'])}
        </div>

        {/* Weight Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Weight Details</h3>
          {renderParameterRow('Weight', weightData, setWeightData, ['TON', 'KG', 'LBS'])}
        </div>

        {/* Wagon Quantity Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Wagon Quantity Details</h3>
          {renderParameterRow('Quantity', quantityData, setQuantityData, ['No'])}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};