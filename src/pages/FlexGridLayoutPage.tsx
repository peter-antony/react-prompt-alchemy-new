
import React, { useState } from 'react';
import { FlexGridLayout } from '@/components/FlexGridLayout';
import { DynamicPanel } from '@/components/DynamicPanel';
import { SmartGrid } from '@/components/SmartGrid';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { LayoutConfig } from '@/components/FlexGridLayout/types';
import { PanelConfig } from '@/types/dynamicPanel';
import { GridColumnConfig } from '@/types/smartgrid';

// Sample data for the components
const samplePanelConfig: PanelConfig = {
  'trip-name': {
    id: 'trip-name',
    label: 'Trip Name',
    fieldType: 'text',
    value: '',
    mandatory: true,
    visible: true,
    editable: true,
    order: 1,
    placeholder: 'Enter trip name'
  },
  'departure-date': {
    id: 'departure-date',
    label: 'Departure Date',
    fieldType: 'date',
    value: '',
    mandatory: true,
    visible: true,
    editable: true,
    order: 2
  },
  'destination': {
    id: 'destination',
    label: 'Destination',
    fieldType: 'select',
    value: '',
    mandatory: true,
    visible: true,
    editable: true,
    order: 3,
    options: [
      { label: 'New York', value: 'ny' },
      { label: 'Los Angeles', value: 'la' },
      { label: 'Chicago', value: 'chi' }
    ]
  },
  'budget': {
    id: 'budget',
    label: 'Budget',
    fieldType: 'currency',
    value: '',
    mandatory: false,
    visible: true,
    editable: true,
    order: 4,
    placeholder: '0.00'
  }
};

const sampleGridColumns: GridColumnConfig[] = [
  {
    key: 'id',
    label: 'Trip ID',
    type: 'Text',
    sortable: true,
    filterable: true
  },
  {
    key: 'name',
    label: 'Trip Name',
    type: 'Link',
    sortable: true,
    filterable: true,
    onClick: (rowData) => console.log('Trip clicked:', rowData)
  },
  {
    key: 'status',
    label: 'Status',
    type: 'Badge',
    statusMap: {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
  },
  {
    key: 'departure',
    label: 'Departure',
    type: 'Date',
    sortable: true
  },
  {
    key: 'destination',
    label: 'Destination',
    type: 'Text',
    filterable: true
  },
  {
    key: 'budget',
    label: 'Budget',
    type: 'Text',
    sortable: true
  }
];

const sampleGridData = [
  {
    id: 'TR001',
    name: 'Business Trip NYC',
    status: 'active',
    departure: '2024-01-15',
    destination: 'New York',
    budget: '$2,500'
  },
  {
    id: 'TR002',
    name: 'Conference LA',
    status: 'pending',
    departure: '2024-02-20',
    destination: 'Los Angeles',
    budget: '$1,800'
  },
  {
    id: 'TR003',
    name: 'Team Retreat',
    status: 'active',
    departure: '2024-01-30',
    destination: 'Chicago',
    budget: '$3,200'
  }
];

// Footer Actions Component
const FooterActions = () => (
  <div className="flex items-center justify-between p-4 bg-white border-t">
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        Cancel
      </Button>
    </div>
    
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Button variant="outline" size="sm" className="pr-8">
          Save Draft
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
        Confirm Trip
      </Button>
    </div>
  </div>
);

const FlexGridLayoutPage = () => {
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
        width: '350px',
        collapsible: true,
        collapsed: false,
        minWidth: '0',
        title: 'Trip Details',
        content: (
          <DynamicPanel
            panelId="trip-panel"
            panelTitle="Trip Information"
            panelConfig={samplePanelConfig}
            initialData={{}}
            onDataChange={(data) => console.log('Panel data changed:', data)}
          />
        )
      },
      center: {
        id: 'center',
        visible: true,
        width: 'calc(100% - 350px)',
        collapsible: false,
        title: 'Trip Management',
        content: (
          <div className="h-full">
            <SmartGrid
              columns={sampleGridColumns}
              data={sampleGridData}
              gridTitle="Trip Plans"
              recordCount={sampleGridData.length}
              showCreateButton={true}
              searchPlaceholder="Search trips..."
            />
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
        title: 'Actions',
        content: <FooterActions />
      }
    }
  });

  const handleConfigChange = (newConfig: LayoutConfig) => {
    // Auto-adjust center width when left panel collapses/expands
    if (newConfig.sections.left.collapsed) {
      newConfig.sections.center.width = '100%';
    } else {
      newConfig.sections.center.width = 'calc(100% - 350px)';
    }
    
    setLayoutConfig(newConfig);
    // Save to localStorage
    localStorage.setItem('flexGridLayoutPage', JSON.stringify(newConfig));
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('flexGridLayoutPage');
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
    <div className="h-screen bg-gray-50">
      <FlexGridLayout
        config={layoutConfig}
        onConfigChange={handleConfigChange}
        className="h-full"
      />
    </div>
  );
};

export default FlexGridLayoutPage;
