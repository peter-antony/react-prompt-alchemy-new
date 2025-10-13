import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Printer, FileDown } from 'lucide-react';

interface TripFooterActionsProps {
  onSaveDraft?: () => void;
  onConfirmTrip?: () => void;
  loading?: boolean;
}

export const TripFooterActions = ({ onSaveDraft, onConfirmTrip, loading }: TripFooterActionsProps) => (
  <div className="flex items-center justify-between p-4 bg-background border-t">
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <FileDown className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
    
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" className="h-8">
        Cancel
      </Button>
      
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 rounded-r-none border-r-0"
          onClick={onSaveDraft}
          disabled={loading}
        >
          Save Draft
        </Button>
        <Button variant="outline" size="sm" className="h-8 rounded-l-none px-2" disabled={loading}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        size="sm" 
        className="h-8 bg-status-success hover:bg-status-success/90 text-white"
        onClick={onConfirmTrip}
        disabled={loading}
      >
        Confirm Trip
      </Button>
    </div>
  </div>
);