import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Map, 
  FileText, 
  Calculator, 
  Truck, 
  Printer 
} from 'lucide-react';

export const ActionIconBar = () => {
  return (
    <div className="flex items-center justify-between border-t pt-4 mt-6">
      <Button variant="ghost" size="sm" className="flex-col h-auto p-2">
        <MapPin className="h-4 w-4 mb-1" />
        <span className="text-xs">Location</span>
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto p-2">
        <Map className="h-4 w-4 mb-1" />
        <span className="text-xs">Map</span>
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto p-2">
        <FileText className="h-4 w-4 mb-1" />
        <span className="text-xs">Documents</span>
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto p-2">
        <Calculator className="h-4 w-4 mb-1" />
        <span className="text-xs">Calculate</span>
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto p-2">
        <Truck className="h-4 w-4 mb-1" />
        <span className="text-xs">Vehicle</span>
      </Button>
      <Button variant="ghost" size="sm" className="flex-col h-auto p-2">
        <Printer className="h-4 w-4 mb-1" />
        <span className="text-xs">Print</span>
      </Button>
    </div>
  );
};