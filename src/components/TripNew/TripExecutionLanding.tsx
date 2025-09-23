import React, { useState, useEffect } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { ChevronDown, Euro, EyeOff, MapPin, User } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
// import TripOrderForm from '@/components/TripNew/TripOrderForm/TripOrderForm'; // Assuming a new component for Trip Order Form
// import NewResourceGroup from '@/components/TripNew/NewResourceGroup'; // Assuming a new component for Trip Resource Group
import { toast } from 'sonner';
import jsonStore from '@/stores/jsonStore';
import { GridColumnConfig } from '@/types/smartgrid';
import { Button } from '@/components/ui/button';
import { LayoutConfig } from '@/components/FlexGridLayout/types';
import { SmartGrid } from '../SmartGrid/SmartGrid';
import FlexGridLayout from '../FlexGridLayout/FlexGridLayout';
import { TripStatusBadge } from './TripStatusBadge';
import { TripDetailsForm } from './TripDetailsForm';
import { ActionIconBar } from './ActionIconBar';
import { EnhancedSmartGrid } from './EnhancedSmartGrid';
import { SummaryCardsGrid } from './SummaryCardsGrid';

interface NewCreateTripProps {
  isEditTrip?: boolean;
}

// Trip Execution form configuration for editable fields only
const tripExecutionPanelConfig: PanelConfig = {
  'trip-type': {
    id: 'trip-type',
    label: '',
    fieldType: 'radio',
    value: 'One Way',
    mandatory: false,
    visible: true,
    editable: true,
    order: 1,
    options: [
      { label: 'One Way', value: 'One Way' },
      { label: 'Round Trip', value: 'Round Trip' }
    ],
    events: {
      onChange: (val: string) => {
        console.log('Trip type changed to:', val);
        // setOrderType(val), // To update state on change
        //   getOrderFormDetailsConfig(OrderType);
      }

    }
  },
  'train-no': {
    id: 'train-no',
    label: 'Train No.',
    fieldType: 'text',
    value: '',
    mandatory: false,
    visible: true,
    editable: true,
    order: 2,
    placeholder: 'Enter Train No.'
  },
  'cluster': {
    id: 'cluster',
    label: 'Cluster',
    fieldType: 'select',
    value: '10000406',
    mandatory: false,
    visible: true,
    editable: true,
    order: 3,
    options: [
      { label: '10000406', value: '10000406' },
      { label: '10000407', value: '10000407' },
      { label: '10000408', value: '10000408' }
    ]
  },
  'supplier-ref-no': {
    id: 'supplier-ref-no',
    label: 'Supplier Ref. No.',
    fieldType: 'text',
    value: '',
    mandatory: false,
    visible: true,
    editable: true,
    order: 4,
    placeholder: 'Enter Supplier Ref. No.'
  },
  'oc-userdefined-1': {
    id: 'oc-userdefined-1',
    label: 'OC Userdefined 1',
    fieldType: 'select',
    value: 'GC',
    mandatory: false,
    visible: true,
    editable: true,
    order: 5,
    options: [
      { label: 'GC', value: 'GC' },
      { label: 'FC', value: 'FC' },
      { label: 'LC', value: 'LC' }
    ]
  },
  'remarks-1': {
    id: 'remarks-1',
    label: 'Remarks 1',
    fieldType: 'textarea',
    value: '',
    mandatory: false,
    visible: true,
    editable: true,
    order: 6,
    placeholder: 'Enter Remarks'
  }
};

export const TripExecutionLanding = ({ isEditTrip }: NewCreateTripProps) => {
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
        width: '420px',
        collapsible: true,
        collapsed: false,
        minWidth: '0',
        title: 'TRIP00000001',
        content: (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4 space-y-0 scroller-left-panel">
              <TripStatusBadge />
              <TripDetailsForm />
              <DynamicPanel
                panelId="trip-execution-panel"
                panelTitle="Trip Details"
                panelConfig={tripExecutionPanelConfig}
                initialData={{
                  'trip-type': 'One Way',
                  'cluster': '10000406',
                  'oc-userdefined-1': 'GC'
                }}
                onDataChange={(data) => console.log('Trip execution data changed:', data)}
              />
            </div>
            <ActionIconBar />
          </div>
        )
      },
      center: {
        id: 'center',
        visible: true,
        width: 'calc(100% - 420px)',
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
        visible: false,
        height: 'auto',
        collapsible: false,
        title: '',
        content: ''
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
    // localStorage.setItem('createTripExecutionPage', JSON.stringify(newConfig));
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

