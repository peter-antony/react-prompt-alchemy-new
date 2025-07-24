import React, { useState, useCallback } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { EyeOff } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DynamicPanelDemo = () => {
  const [basicDetailsData, setBasicDetailsData] = useState({});
  const [operationalDetailsData, setOperationalDetailsData] = useState({});
  const [billingDetailsData, setBillingDetailsData] = useState({});

  // Panel titles state
  const [basicDetailsTitle, setBasicDetailsTitle] = useState('Basic Details');
  const [operationalDetailsTitle, setOperationalDetailsTitle] = useState('Operational Details');
  const [billingDetailsTitle, setBillingDetailsTitle] = useState('Billing Details');

  // Memoized callbacks to prevent re-rendering and focus loss
  const handleBasicDetailsDataChange = useCallback((data: any) => {
    setBasicDetailsData(data);
  }, []);

  const handleOperationalDetailsDataChange = useCallback((data: any) => {
    setOperationalDetailsData(data);
  }, []);

  const handleBillingDetailsDataChange = useCallback((data: any) => {
    setBillingDetailsData(data);
  }, []);

  // Panel widths state - updated for 12-column system
  const [basicDetailsWidth, setBasicDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(12);
  const [operationalDetailsWidth, setOperationalDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(6);
  const [billingDetailsWidth, setBillingDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(6);

  // Panel visibility state
  const [basicDetailsVisible, setBasicDetailsVisible] = useState(true);
  const [operationalDetailsVisible, setOperationalDetailsVisible] = useState(true);
  const [billingDetailsVisible, setBillingDetailsVisible] = useState(true);

  // Basic Details Panel Configuration
  const basicDetailsConfig: PanelConfig = {
    tripPlanNo: {
      id: 'tripPlanNo',
      label: 'Trip Plan No',
      fieldType: 'text',
      value: 'TRIP00000001',
      mandatory: true,
      visible: true,
      editable: false,
      order: 1
    },
    customerName: {
      id: 'customerName',
      label: 'Customer Name',
      fieldType: 'select',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: 'DB Cargo', value: 'db-cargo' },
        { label: 'ABC Rail Goods', value: 'abc-rail' },
        { label: 'Wave Cargo', value: 'wave-cargo' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('Customer changed:', value);
          console.log('Event:', event);
        },
        onFocus: (event) => {
          console.log('Customer field focused');
        }
      }
    },
    contractType: {
      id: 'contractType',
      label: 'Contract Type',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      options: [
        { label: 'Fixed Price', value: 'fixed' },
        { label: 'Variable', value: 'variable' },
        { label: 'Cost Plus', value: 'cost-plus' }
      ]
    },
    description: {
      id: 'description',
      label: 'Description',
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      placeholder: 'Enter trip description...',
      events: {
        onKeyDown: (event) => {
          if (event.key === 'Enter' && event.ctrlKey) {
            console.log('Ctrl+Enter pressed in description');
          }
        },
        onBlur: (event) => {
          console.log('Description field blurred with value:', (event.target as HTMLTextAreaElement).value);
        }
      }
    },
    priority: {
      id: 'priority',
      label: 'Priority',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      options: [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
      ]
    }
  };

  // Operational Details Panel Configuration
  const operationalDetailsConfig: PanelConfig = {
    plannedStartDate: {
      id: 'plannedStartDate',
      label: 'Planned Start Date',
      fieldType: 'date',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 1
    },
    plannedStartTime: {
      id: 'plannedStartTime',
      label: 'Planned Start Time',
      fieldType: 'time',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 2
    },
    plannedEndDate: {
      id: 'plannedEndDate',
      label: 'Planned End Date',
      fieldType: 'date',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 3
    },
    plannedEndTime: {
      id: 'plannedEndTime',
      label: 'Planned End Time',
      fieldType: 'time',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 4
    },
    departurePoint: {
      id: 'departurePoint',
      label: 'Departure Point',
      fieldType: 'search',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 5,
      placeholder: 'Search departure location...',
      events: {
        onChange: (value, event) => {
          console.log('Searching for departure point:', value);
          // You could trigger an API call here to search for locations
        },
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            console.log('Enter pressed in departure search');
          }
        }
      }
    },
    arrivalPoint: {
      id: 'arrivalPoint',
      label: 'Arrival Point',
      fieldType: 'search',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 6,
      placeholder: 'Search arrival location...'
    },
    distance: {
      id: 'distance',
      label: 'Distance (km)',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7
    },
    trainType: {
      id: 'trainType',
      label: 'Train Type',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      options: [
        { label: 'Freight', value: 'freight' },
        { label: 'Passenger', value: 'passenger' },
        { label: 'Mixed', value: 'mixed' }
      ]
    }
  };

  // Billing Details Panel Configuration
  const billingDetailsConfig: PanelConfig = {
    totalAmount: {
      id: 'totalAmount',
      label: 'Total Amount',
      fieldType: 'currency',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 1,
      events: {
        onChange: (value, event) => {
          console.log('Total amount changed to:', value);
          // Auto-calculate other fields based on total amount
          if (value > 1000) {
            console.log('High value transaction detected');
          }
        },
        onFocus: (event) => {
          console.log('Total amount field focused');
        }
      }
    },
    taxAmount: {
      id: 'taxAmount',
      label: 'Tax Amount',
      fieldType: 'currency',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2
    },
    discountAmount: {
      id: 'discountAmount',
      label: 'Discount Amount',
      fieldType: 'currency',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3
    },
    billingStatus: {
      id: 'billingStatus',
      label: 'Billing Status',
      fieldType: 'select',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 4,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' }
      ]
    },
    paymentTerms: {
      id: 'paymentTerms',
      label: 'Payment Terms',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      options: [
        { label: 'Net 30', value: 'net-30' },
        { label: 'Net 60', value: 'net-60' },
        { label: 'Due on Receipt', value: 'due-on-receipt' }
      ]
    },
    invoiceDate: {
      id: 'invoiceDate',
      label: 'Invoice Date',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6
    }
  };

  // Mock functions for user config management
  const getUserPanelConfig = (userId: string, panelId: string): PanelSettings | null => {
    const stored = localStorage.getItem(`panel-config-${userId}-${panelId}`);
    return stored ? JSON.parse(stored) : null;
  };

  const saveUserPanelConfig = (userId: string, panelId: string, settings: PanelSettings): void => {
    localStorage.setItem(`panel-config-${userId}-${panelId}`, JSON.stringify(settings));
    console.log(`Saved config for panel ${panelId}:`, settings);
  };

  // Panel visibility management
  const panels = [
    { id: 'basic-details', title: basicDetailsTitle, visible: basicDetailsVisible },
    { id: 'operational-details', title: operationalDetailsTitle, visible: operationalDetailsVisible },
    { id: 'billing-details', title: billingDetailsTitle, visible: billingDetailsVisible }
  ];

  const handlePanelVisibilityChange = (panelId: string, visible: boolean) => {
    switch (panelId) {
      case 'basic-details':
        setBasicDetailsVisible(visible);
        break;
      case 'operational-details':
        setOperationalDetailsVisible(visible);
        break;
      case 'billing-details':
        setBillingDetailsVisible(visible);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-600">
                Dynamic Panel Demo
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title and Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dynamic Panel Configuration</h1>
            <p className="text-gray-600 mt-1">
              Configure field visibility, ordering, and labels for each panel
            </p>
          </div>
          <PanelVisibilityManager
            panels={panels}
            onVisibilityChange={handlePanelVisibilityChange}
          />
        </div>

        {/* Dynamic Panels in 12-column grid */}
        <div className="grid grid-cols-12 gap-6">
          {(() => {
            let currentTabIndex = 1;
            const panels = [];
            
            // Panel 1: Basic Details
            if (basicDetailsVisible) {
              const basicDetailsVisibleCount = Object.values(basicDetailsConfig).filter(config => config.visible).length;
              panels.push(
                <DynamicPanel
                  key="basic-details"
                  panelId="basic-details"
                  panelOrder={1}
                  startingTabIndex={currentTabIndex}
                  panelTitle={basicDetailsTitle}
                  panelConfig={basicDetailsConfig}
                  initialData={basicDetailsData}
                  onDataChange={handleBasicDetailsDataChange}
                  onTitleChange={setBasicDetailsTitle}
                  onWidthChange={setBasicDetailsWidth}
                  getUserPanelConfig={getUserPanelConfig}
                  saveUserPanelConfig={saveUserPanelConfig}
                  userId="current-user"
                  panelWidth={basicDetailsWidth}
                />
              );
              currentTabIndex += basicDetailsVisibleCount;
            }

            // Panel 2: Operational Details
            if (operationalDetailsVisible) {
              const operationalDetailsVisibleCount = Object.values(operationalDetailsConfig).filter(config => config.visible).length;
              panels.push(
                <DynamicPanel
                  key="operational-details"
                  panelId="operational-details"
                  panelOrder={2}
                  startingTabIndex={currentTabIndex}
                  panelTitle={operationalDetailsTitle}
                  panelConfig={operationalDetailsConfig}
                  initialData={operationalDetailsData}
                  onDataChange={handleOperationalDetailsDataChange}
                  onTitleChange={setOperationalDetailsTitle}
                  onWidthChange={setOperationalDetailsWidth}
                  getUserPanelConfig={getUserPanelConfig}
                  saveUserPanelConfig={saveUserPanelConfig}
                  userId="current-user"
                  panelWidth={operationalDetailsWidth}
                />
              );
              currentTabIndex += operationalDetailsVisibleCount;
            }

            // Panel 3: Billing Details
            if (billingDetailsVisible) {
              panels.push(
                <DynamicPanel
                  key="billing-details"
                  panelId="billing-details"
                  panelOrder={3}
                  startingTabIndex={currentTabIndex}
                  panelTitle={billingDetailsTitle}
                  panelConfig={billingDetailsConfig}
                  initialData={billingDetailsData}
                  onDataChange={handleBillingDetailsDataChange}
                  onTitleChange={setBillingDetailsTitle}
                  onWidthChange={setBillingDetailsWidth}
                  getUserPanelConfig={getUserPanelConfig}
                  saveUserPanelConfig={saveUserPanelConfig}
                  userId="current-user"
                  panelWidth={billingDetailsWidth}
                />
              );
            }

            return panels;
          })()}
        </div>

        {/* Show message when all panels are hidden */}
        {!basicDetailsVisible && !operationalDetailsVisible && !billingDetailsVisible && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <EyeOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">All panels are hidden</h3>
            <p className="text-gray-500 mb-4">Use the "Manage Panels" button above to show panels.</p>
          </div>
        )}

        {/* Debug Data Display */}
        {(basicDetailsVisible || operationalDetailsVisible || billingDetailsVisible) && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Current Form Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {basicDetailsVisible && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{basicDetailsTitle}</h4>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(basicDetailsData, null, 2)}
                  </pre>
                </div>
              )}
              {operationalDetailsVisible && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{operationalDetailsTitle}</h4>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(operationalDetailsData, null, 2)}
                  </pre>
                </div>
              )}
              {billingDetailsVisible && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{billingDetailsTitle}</h4>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(billingDetailsData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPanelDemo;
