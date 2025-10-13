import { useCallback, useMemo, useRef } from 'react';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { useTripExecutionStore } from '@/stores/tripExecutionStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const TripExecutionCreate = () => {
  const {
    tripData,
    setBasicDetails,
    setOperationalDetails,
    setBillingDetails,
    resetTrip,
  } = useTripExecutionStore();

  const basicDetailsRef = useRef<DynamicPanelRef>(null);
  const operationalDetailsRef = useRef<DynamicPanelRef>(null);
  const billingDetailsRef = useRef<DynamicPanelRef>(null);

  // Stable callbacks
  const handleBasicDetailsDataChange = useCallback((data: any) => {
    setBasicDetails(data);
  }, [setBasicDetails]);

  const handleOperationalDetailsDataChange = useCallback((data: any) => {
    setOperationalDetails(data);
  }, [setOperationalDetails]);

  const handleBillingDetailsDataChange = useCallback((data: any) => {
    setBillingDetails(data);
  }, [setBillingDetails]);

  // Memoize options
  const customerOptions = useMemo(() => [
    { label: 'DB Cargo', value: 'db-cargo' },
    { label: 'Rail Logistics', value: 'rail-logistics' },
    { label: 'Euro Transport', value: 'euro-transport' },
    { label: 'Nordic Rail', value: 'nordic-rail' },
  ], []);

  const contractTypeOptions = useMemo(() => [
    { label: 'Fixed Price', value: 'fixed-price' },
    { label: 'Time & Material', value: 'time-material' },
    { label: 'Cost Plus', value: 'cost-plus' },
  ], []);

  const currencyOptions = useMemo(() => [
    { label: '€', value: 'EUR' },
    { label: '$', value: 'USD' },
    { label: '£', value: 'GBP' },
  ], []);

  const priorityOptions = useMemo(() => [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ], []);

  const trainTypeOptions = useMemo(() => [
    { label: 'Freight', value: 'freight' },
    { label: 'Express', value: 'express' },
    { label: 'Standard', value: 'standard' },
  ], []);

  const billingStatusOptions = useMemo(() => [
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Paid', value: 'paid' },
  ], []);

  const paymentTermsOptions = useMemo(() => [
    { label: 'Net 30', value: 'net-30' },
    { label: 'Net 60', value: 'net-60' },
    { label: 'Net 90', value: 'net-90' },
    { label: 'Immediate', value: 'immediate' },
  ], []);

  const searchData = useMemo(() => [
    'Berlin Hauptbahnhof',
    'Munich Central Station',
    'Hamburg Hbf',
    'Frankfurt Main Station',
    'Cologne Station',
  ], []);

  // Panel configurations
  const basicDetailsConfig: PanelConfig = useMemo(() => ({
    tripPlanNo: {
      id: 'tripPlanNo',
      label: 'Trip Plan No',
      fieldType: 'text',
      value: 'TRIP00000001',
      mandatory: true,
      visible: true,
      editable: false,
      order: 1,
      width: 'half',
      placeholder: 'Auto-generated',
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
      width: 'half',
      options: customerOptions,
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
      width: 'half',
      options: contractTypeOptions,
    },
    unitPrice: {
      id: 'unitPrice',
      label: 'Unit Price',
      fieldType: 'inputdropdown',
      value: { dropdown: 'EUR', input: '' },
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'half',
      options: currencyOptions,
      inputType: 'currency',
    },
    description: {
      id: 'description',
      label: 'Description',
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'full',
      placeholder: 'Enter trip description...',
    },
    priority: {
      id: 'priority',
      label: 'Priority',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'half',
      options: priorityOptions,
    },
  }), [customerOptions, contractTypeOptions, currencyOptions, priorityOptions]);

  const operationalDetailsConfig: PanelConfig = useMemo(() => ({
    plannedStartDate: {
      id: 'plannedStartDate',
      label: 'Planned Start Date',
      fieldType: 'date',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 7,
      width: 'half',
    },
    plannedStartTime: {
      id: 'plannedStartTime',
      label: 'Planned Start Time',
      fieldType: 'time',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 8,
      width: 'half',
    },
    plannedEndDate: {
      id: 'plannedEndDate',
      label: 'Planned End Date',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: 'half',
    },
    plannedEndTime: {
      id: 'plannedEndTime',
      label: 'Planned End Time',
      fieldType: 'time',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: 'half',
    },
    departurePoint: {
      id: 'departurePoint',
      label: 'Departure Point',
      fieldType: 'search',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 11,
      width: 'half',
      placeholder: 'Search departure location...',
      searchData: searchData,
    },
    arrivalPoint: {
      id: 'arrivalPoint',
      label: 'Arrival Point',
      fieldType: 'search',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 12,
      width: 'half',
      placeholder: 'Search arrival location...',
      searchData: searchData,
    },
    distance: {
      id: 'distance',
      label: 'Distance (km)',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 13,
      width: 'half',
      placeholder: 'Enter distance',
    },
    trainType: {
      id: 'trainType',
      label: 'Train Type',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 14,
      width: 'half',
      options: trainTypeOptions,
    },
  }), [searchData, trainTypeOptions]);

  const billingDetailsConfig: PanelConfig = useMemo(() => ({
    totalAmount: {
      id: 'totalAmount',
      label: 'Total Amount',
      fieldType: 'currency',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 15,
      width: 'half',
      placeholder: '0.00',
    },
    taxAmount: {
      id: 'taxAmount',
      label: 'Tax Amount',
      fieldType: 'currency',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 16,
      width: 'half',
      placeholder: '0.00',
    },
    discountAmount: {
      id: 'discountAmount',
      label: 'Discount Amount',
      fieldType: 'currency',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 17,
      width: 'half',
      placeholder: '0.00',
    },
    billingStatus: {
      id: 'billingStatus',
      label: 'Billing Status',
      fieldType: 'select',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 18,
      width: 'half',
      options: billingStatusOptions,
    },
    paymentTerms: {
      id: 'paymentTerms',
      label: 'Payment Terms',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 19,
      width: 'half',
      options: paymentTermsOptions,
    },
    invoiceDate: {
      id: 'invoiceDate',
      label: 'Invoice Date',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 20,
      width: 'half',
    },
  }), [billingStatusOptions, paymentTermsOptions]);

  // Mock functions for user config management
  const getUserPanelConfigCallback = useCallback((userId: string, panelId: string): PanelSettings | null => {
    const stored = localStorage.getItem(`trip-execution-${userId}-${panelId}`);
    return stored ? JSON.parse(stored) : null;
  }, []);

  const saveUserPanelConfigCallback = useCallback((userId: string, panelId: string, settings: PanelSettings): void => {
    localStorage.setItem(`trip-execution-${userId}-${panelId}`, JSON.stringify(settings));
  }, []);

  const handleSaveTrip = () => {
    const allValid = [
      basicDetailsRef.current?.doValidation(),
      operationalDetailsRef.current?.doValidation(),
      billingDetailsRef.current?.doValidation(),
    ].every(Boolean);

    if (allValid) {
      console.log('Trip Data:', tripData);
      toast.success('Trip saved successfully!');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleReset = () => {
    resetTrip();
    toast.info('Trip data has been reset');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Trip Execution</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Trip Execution</h1>
        <p className="text-muted-foreground">
          Enter trip execution details for planning and billing
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSaveTrip} className="gap-2">
          <Save className="h-4 w-4" />
          Save Trip
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Details Panel */}
        <div className="lg:col-span-2">
          <DynamicPanel
            ref={basicDetailsRef}
            panelId="basic-details"
            panelTitle="Basic Details"
            panelConfig={basicDetailsConfig}
            initialData={tripData.basicDetails}
            onDataChange={handleBasicDetailsDataChange}
            getUserPanelConfig={getUserPanelConfigCallback}
            saveUserPanelConfig={saveUserPanelConfigCallback}
            userId="user-001"
            collapsible={true}
            panelWidth="full"
          />
        </div>

        {/* Operational Details Panel */}
        <div>
          <DynamicPanel
            ref={operationalDetailsRef}
            panelId="operational-details"
            panelTitle="Operational Details"
            panelConfig={operationalDetailsConfig}
            initialData={tripData.operationalDetails}
            onDataChange={handleOperationalDetailsDataChange}
            getUserPanelConfig={getUserPanelConfigCallback}
            saveUserPanelConfig={saveUserPanelConfigCallback}
            userId="user-001"
            collapsible={true}
            panelWidth="full"
          />
        </div>

        {/* Billing Details Panel */}
        <div>
          <DynamicPanel
            ref={billingDetailsRef}
            panelId="billing-details"
            panelTitle="Billing Details"
            panelConfig={billingDetailsConfig}
            initialData={tripData.billingDetails}
            onDataChange={handleBillingDetailsDataChange}
            getUserPanelConfig={getUserPanelConfigCallback}
            saveUserPanelConfig={saveUserPanelConfigCallback}
            userId="user-001"
            collapsible={true}
            panelWidth="full"
          />
        </div>
      </div>

      {/* Current Form Data Display */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Form Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Basic Details</h3>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
              {JSON.stringify(tripData.basicDetails, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Operational Details</h3>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
              {JSON.stringify(tripData.operationalDetails, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Billing Details</h3>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
              {JSON.stringify(tripData.billingDetails, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TripExecutionCreate;
