import React, { useState, useEffect } from 'react';
import { FlexGridLayout } from '@/components/FlexGridLayout';
import { LayoutConfig } from '@/components/FlexGridLayout/types';
import { 
  TripStatusBadge, 
  TripDetailsForm, 
  ActionIconBar, 
  SummaryCardsGrid, 
  EnhancedSmartGrid, 
  TripFooterActions 
} from '@/components/TripExecution';
import { useTripStore } from '@/components/datastore/tripStore';
import { toast } from 'sonner';

const CreateTripExecutionPage = () => {
  const { selectedTrip, loading, error, saveTrip, updateField, reset } = useTripStore();
  
  // Initialize with empty trip on mount
  useEffect(() => {
    // Initialize a new trip with default values
    updateField('id', 'TRIP_NEW');
    updateField('status', 'draft');
    // updateField('customerId', 'CUS0009173');
    // updateField('railInfo', 'Railtrax NV - 46798333');
    // updateField('amount', 45595.00);
    // updateField('mode', 'Rail');
    // updateField('fromLocation', '53-202705, Voila');
    // updateField('toLocation', '53-21925-3, Curtici');
    // updateField('tripType', 'one-way');
    
    return () => {
      reset();
    };
  }, [updateField, reset]);

  // Handle save draft
  const handleSaveDraft = async () => {
    if (selectedTrip) {
      await saveTrip(selectedTrip);
      toast.success('Trip saved as draft');
    }
  };

  // Handle confirm trip
  const handleConfirmTrip = async () => {
    if (selectedTrip) {
      await saveTrip({ ...selectedTrip, status: 'approved' });
      toast.success('Trip created and confirmed successfully');
    }
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    sections: {
      top: {
        id: 'top',
        visible: false,
        height: '0px',
        collapsible: false,
        collapsed: true
      },
      left: {
        id: 'left',
        visible: true,
        width: '380px',
        collapsible: true,
        collapsed: false,
        minWidth: '0',
        title: selectedTrip?.id || 'New Trip',
        content: (
          <div className="h-full flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-0">
                  <TripStatusBadge status={selectedTrip?.status} />
                  <TripDetailsForm 
                    tripData={selectedTrip} 
                    onFieldChange={updateField}
                  />
                </div>
                <ActionIconBar />
              </>
            )}
          </div>
        )
      },
      center: {
        id: 'center',
        visible: true,
        width: 'calc(100% - 380px)',
        collapsible: false,
        title: '',
        content: (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-6 space-y-6 overflow-auto">
              <EnhancedSmartGrid />
              <div>
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <SummaryCardsGrid />
              </div>
            </div>
          </div>
        )
      },
      right: {
        id: 'right',
        visible: false,
        width: '0px',
        collapsible: true,
        collapsed: true,
        minWidth: '0'
      },
      bottom: {
        id: 'bottom',
        visible: true,
        height: 'auto',
        collapsible: false,
        title: '',
        content: (
          <TripFooterActions 
            onSaveDraft={handleSaveDraft}
            onConfirmTrip={handleConfirmTrip}
            loading={loading}
          />
        )
      }
    }
  });

  const handleConfigChange = (newConfig: LayoutConfig) => {
    // Auto-adjust center width when left panel collapses/expands
    if (newConfig.sections.left.collapsed) {
      newConfig.sections.center.width = '100%';
    } else {
      newConfig.sections.center.width = 'calc(100% - 380px)';
    }
    
    setLayoutConfig(newConfig);
    // Save to localStorage
    localStorage.setItem('createTripExecutionPage', JSON.stringify(newConfig));
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('createTripExecutionPage');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        setLayoutConfig(parsedConfig);
      } catch (error) {
        console.warn('Error loading layout config from localStorage:', error);
      }
    }
  }, []);

  return (
    <div className="h-screen bg-muted/10">
      <FlexGridLayout
        config={layoutConfig}
        onConfigChange={handleConfigChange}
        className="h-full"
      />
    </div>
  );
};

export default CreateTripExecutionPage;