import React, { useState, useEffect, useRef } from 'react';
import {
  X, Search, Calendar, Clock, Bookmark, Banknote, Wrench, ArrowLeft,
  FileText, BookmarkCheck,
  Plus,
  ChevronDown,
  List,
  LayoutGrid,
  MoreVertical,
  Package,
  AlertTriangle,
  Camera,
  MapPin,
  Link as LinkIcon,
  HousePlug, Box, BaggageClaim, Truck,
  CloudUpload, EyeOff, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DynamicPanel, type DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { Card } from '@/components/ui/card';
import { BillingDetailsPanel } from './BillingDetails';
import { toast } from 'sonner';
import PlanActIcon from './../../assets/images/planAct.png';
import { SideDrawer } from '../Common/SideDrawer';
import { PlanAndActualDetails } from './PlanAndActualDetails';
import { VerticalStepper } from "../Common/VerticalStepper";
import { ConfigurableButtonConfig } from '@/components/ui/configurable-button';
import { useNavigate } from 'react-router-dom';
import { DropdownButton } from '@/components/ui/dropdown-button';
import PlanAndActuals from './PlanAndActuals';
import BulkUpload from '@/components/QuickOrderNew/BulkUpload';
import jsonStore from '@/stores/jsonStore';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import Attachments from './OrderForm/Attachments';
import CardDetails, { CardDetailsItem } from '../Common/Card-View-Details';
import { SimpleDropDown } from "../Common/SimpleDropDown";
import { json } from 'stream/consumers';
// import { combineInputDropdownValue } from '@/utils/inputDropdown';

interface ResourceGroupDetailsFormProps {
  isEditQuickOrder?: boolean
}

// const ResourceGroupDetailsForm = ({ open, onClose }: ResourceGroupDetailsFormProps) => {
export const ResourceGroupDetailsForm = ({ isEditQuickOrder }: ResourceGroupDetailsFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlanActualsOpen, setIsPlanActualsOpen] = useState(false);
  const [isPlanActualsVisible, setIsPlanActualsVisible] = useState(false);
  const TariffList = [
    "TAR000750 - Tariff Pending",
    "TAR000751 - Tariff Completed",
    "TAR000752 - Tariff Overdue",
  ];
  const PlaceList = [
    "Bangalore",
    "New Delhi",
    "Gujarat",
    "Surat",
    "Mumbai",
  ];
  const handleProceedToNext = () => {
    setCurrentStep(2);
  };

  const handleFirstStep = () => {
    setCurrentStep(1);
    // Clear the flag so user can re-add plan/actuals
    localStorage.removeItem('planActualsSaved');
    setIsPlanActualsVisible(false);
  };

  const handleSecondStep = () => {
    setCurrentStep(2);
  };

  const bulkUploadFiles = () => {

  };

  const addPlanActuals = () => {

  };

  // Panel refs for getting form values
  const basicDetailsRef = useRef<DynamicPanelRef>(null);
  const operationalDetailsRef = useRef<DynamicPanelRef>(null);
  const billingDetailsRef = useRef<DynamicPanelRef>(null);

  const onSaveDetails = () => {
    const formValues = {
      basicDetails: basicDetailsRef.current?.getFormValues() || {},
      operationalDetails: operationalDetailsRef.current?.getFormValues() || {},
      billingDetails: billingDetailsRef.current?.getFormValues() || {}
    };
    if (isEditQuickOrder) {

    } else {
      setBasicDetailsData(formValues.basicDetails);
      setOperationalDetailsData(formValues.operationalDetails);
      setBillingDetailsData(formValues.billingDetails);
      jsonStore.setResourceJsonData({
         ...jsonStore.getResourceJsonData(),
        "ModeFlag": "Insert",
        "ResourceStatus": "Save",
      })
      jsonStore.setResourceBasicDetails({
        ...jsonStore.getResourceJsonData().BasicDetails,
        ...formValues.basicDetails
      });
      jsonStore.setResourceOperationalDetails({
        ...jsonStore.getResourceJsonData().OperationalDetails,
        ...formValues.operationalDetails
      });
      jsonStore.setResourceBillingDetails({
        ...jsonStore.getResourceJsonData().BillingDetails,
        ...formValues.billingDetails
      });
      const fullResourceJson = jsonStore.getResourceJsonData();
      console.log("FULL RESOURCE JSON :: ", fullResourceJson);
      jsonStore.pushResourceGroup(fullResourceJson);
      console.log("FULL JSON :: ", jsonStore.getQuickOrder());

    }



  }



  // Utility to normalize keys from store to config field IDs
  function normalizeBasicDetails(data) {
    return {
      Resource: data.Resource,
      ResourceType: data.ResourceType,
      ServiceType: data.ServiceType,
      SubSericeType: data.SubSericeType, // fix typo if needed
    };
  }

  function normalizeOperationalDetails(data) {
    if (data)
      return {
        OperationalLocation: data.OperationalLocation,
        DepartPoint: data.DepartPoint,
        ArrivalPoint: data.ArrivalPoint,
        FromDate: (data.FromDate ? parseDDMMYYYY(data.FromDate) : ""),
        FromTime: data.FromTime,
        ToDate: (data.ToDate ? parseDDMMYYYY(data.ToDate) : ""),
        ToTime: data.ToTime,
        Remarks: data.Remarks,
      };
  }
  const parseDDMMYYYY = (dateStr) => {
    // Expects dateStr in 'DD/MM/YYYY'
    const [day, month, year] = dateStr.split('/').map(Number);
    // JS Date: months are 0-based
    return new Date(year, month - 1, day);
  }

  function normalizeBillingDetails(data) {
    // This function normalizes billing details data so it can be used as initial values for billingDetailsForm.
    // It ensures the form fields are pre-filled with the correct values from the store.
    if (!data || typeof data !== 'object') return {};
    return {
      ContractPrice: data.ContractPrice ?? '',
      NetAmount: data.NetAmount ?? '',
      BillingType: data.BillingType ?? '',
      UnitPrice: data.UnitPrice ?? '',
      BillingQty: data.BillingQty ?? '',
      Tariff: data.Tariff ?? '',
      TariffType: data.TariffType ?? '',
      Remarks: data.Remarks ?? '',
    };
  }

  const getInitialBasicDetails = () =>
    isEditQuickOrder
      ? normalizeBasicDetails(jsonStore.getBasicDetails() || {})
      : {};

  const getInitialOperationalDetails = () =>
    isEditQuickOrder
      ? normalizeOperationalDetails(jsonStore.getOperationalDetails() || {})
      : {};

  const getInitialBillingDetails = () =>
    isEditQuickOrder
      ? normalizeBillingDetails(jsonStore.getBillingDetails() || {})
      : {};

  const [basicDetailsData, setBasicDetailsData] = useState(getInitialBasicDetails);
  const [operationalDetailsData, setOperationalDetailsData] = useState(getInitialOperationalDetails);
  const [billingDetailsData, setBillingDetailsData] = useState(getInitialBillingDetails);

  // Panel titles state
  const [basicDetailsTitle, setBasicDetailsTitle] = useState('Basic Details');
  const [operationalDetailsTitle, setOperationalDetailsTitle] = useState('Operational Details');
  const [billingDetailsTitle, setBillingDetailsTitle] = useState('Billing Details');

  // Panel visibility state
  const [basicDetailsVisible, setBasicDetailsVisible] = useState(true);
  const [operationalDetailsVisible, setOperationalDetailsVisible] = useState(true);
  const [billingDetailsVisible, setBillingDetailsVisible] = useState(true);

  // Basic Details Panel Configuration
  const basicDetailsConfig: PanelConfig = {
    Resource: {
      id: 'Resource',
      label: 'Resource',
      fieldType: 'select',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: 'Vehicle', value: 'Vehicle' },
        { label: 'Equipment', value: 'Equipment' },
        { label: 'Material', value: 'Material' },
        { label: 'Other', value: 'Other' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    ResourceType: {
      id: 'ResourceType',
      label: 'Resource Type',
      fieldType: 'select',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      options: [
        { label: 'Truck 4.2', value: 'Truck 4.2' },
        { label: 'Truck 4.5', value: 'Truck 4.5' },
        { label: 'Truck 5.2', value: 'truck-5.2' },
      ]
    },
    ServiceType: {
      id: 'ServiceType',
      label: 'Service Type',
      fieldType: 'select',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      options: [
        { label: 'Block Train Conventional', value: 'Block Train Conventional' },
        { label: 'Block Train Convention', value: 'Block Train Convention' },
      ]
    },
    SubSericeType: {
      id: 'SubSericeType',
      label: 'Sub-Service',
      fieldType: 'select',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      options: [
        { label: 'Repair', value: 'Repair' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Other', value: 'Other' }
      ],
      // events: {
      //   onBlur: (event) => {
      //     console.log('Description blur event:', event);
      //   }
      // }
    }
  };

  // Operational Details Panel Configuration
  const operationalDetailsConfig: PanelConfig = {
    OperationalLocation: {
      id: 'OperationalLocation',
      label: 'Operational Location',
      fieldType: 'search',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      placeholder: 'Search operational location...',
      searchData: PlaceList,
    },
    DepartPoint: {
      id: 'DepartPoint',
      label: 'Departure Point',
      fieldType: 'select',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: '10-000471', value: '10-000471' },
        { label: '10-000481', value: '10-000481' },
        { label: '10-000491', value: '10-000491' }
      ]
    },
    ArrivalPoint: {
      id: 'ArrivalPoint',
      label: 'Arrival Point',
      fieldType: 'select',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      options: [
        { label: '10-000720', value: '10-000720' },
        { label: '10-000721', value: '10-000721' },
        { label: '10-000722', value: '10-000722' }
      ]
    },
    FromDate: {
      id: 'FromDate',
      label: 'From Date',
      fieldType: 'date',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4
    },
    FromTime: {
      id: 'FromTime',
      label: 'From Time',
      fieldType: 'time',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5
    },
    ToDate: {
      id: 'ToDate',
      label: 'To Date',
      fieldType: 'date',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6
    },
    ToTime: {
      id: 'ToTime',
      label: 'To Time',
      fieldType: 'time',
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7
    },
    Remarks: {
      id: 'Remarks',
      label: 'Remarks',
      fieldType: 'text',
      width: 'two-thirds',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8
    },
  };

  // Billing Details Panel Configuration
  const billingDetailsConfig: PanelConfig = {
    ContractPrice: {
      id: 'ContractPrice',
      label: 'Contract Price',
      fieldType: 'card',
      value: '€ 1200.00',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'half',
      color: '#10b981', // Emerald green background
      fieldColour: '#047857' // Dark emerald text
    },
    NetAmount: {
      id: 'NetAmount',
      label: 'Net Amount',
      fieldType: 'card',
      value: '€ 5580.00',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'half',
      color: '#8b5cf6', // Purple background
      fieldColour: '#6d28d9' // Dark purple text
    },
    BillingType: {
      id: 'BillingType',
      label: 'Billing Type',
      fieldType: 'select',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 3,
      width: 'full',
      options: [
        { label: 'Wagon', value: 'Wagon' },
        { label: 'Container', value: 'Container' },
        { label: 'Block', value: 'Block' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    UnitPrice: {
      id: 'UnitPrice',
      label: 'Unit Price',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      options: [
        { label: '€', value: '€' },
        { label: '$', value: '$' },
        { label: '£', value: '£' }
      ],
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    BillingQty: {
      id: 'BillingQty',
      label: 'Billing Qty.',
      fieldType: 'text',
      value: '4',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'half',
    },
    Tariff: {
      id: 'Tariff',
      label: 'Tariff',
      fieldType: 'search',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      placeholder: 'TAR000750 ',
      width: 'full',
      searchData: TariffList, // <-- This is the local array for suggestions
    },
    TariffType: {
      id: 'TariffType',
      label: 'Tariff Type',
      fieldType: 'text',
      value: 'Rate Per Block Train',
      mandatory: false,
      visible: true,
      editable: false,
      order: 7,
      width: 'full',
    },
    Remarks: {
      id: 'Remarks',
      label: 'Remarks',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      placeholder: 'Enter Remarks',
      width: 'full',
    }
  };

  // Remove: const [billingData, setBillingData] = useState(jsonStore.getBillingDetails() || {})

  const [view, setView] = useState<"grid" | "list">("grid");

  // Mock functions for user config management
  const getUserPanelConfig = (userId: string, panelId: string): PanelSettings | null => {
    const stored = localStorage.getItem(`panel-config-${userId}-${panelId}`);
    return stored ? JSON.parse(stored) : null;
  };

  const saveUserPanelConfig = (userId: string, panelId: string, settings: PanelSettings): void => {
    localStorage.setItem(`panel-config-${userId}-${panelId}`, JSON.stringify(settings));
    console.log(`Saved config for panel ${panelId}:`, settings);
  };
  useEffect(() => {
    if (isEditQuickOrder) {
      setBasicDetailsData(normalizeBasicDetails(jsonStore.getBasicDetails() || {}));
      setOperationalDetailsData(normalizeOperationalDetails(jsonStore.getOperationalDetails() || {}));
      setBillingDetailsData(normalizeBillingDetails(jsonStore.getBillingDetails() || {}));
    } else {
      setBasicDetailsData({});
      setOperationalDetailsData({});
      setBillingDetailsData({});
    }
    const saved = localStorage.getItem('planActualsSaved');
    setIsPlanActualsVisible(saved === 'true');

  }, [isEditQuickOrder]);
  const steps = [
    {
      label: "Resource Group Creation",
      subLabel: " - ",
      count: 1,
      completed: true,
    },
    {
      label: "Plan and Actuals",
      subLabel: "Total Items : 0",
      count: 2,
      completed: false,
    },
  ];

  const setCurrentStepIndex = () => {
    setCurrentStep(1);
  };

  const navigate = useNavigate();
  // Configurable button for Create Order (with dropdown)
  const configurableButtons: ConfigurableButtonConfig[] = [
    {
      label: "Add New",
      tooltipTitle: "Add New",
      showDropdown: true,
      onClick: () => {
        setIsPlanActualsOpen(true);
      },
      dropdownItems: [
        {
          label: "Add New",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            setIsPlanActualsOpen(true);
          }
        },
        {
          label: "Bulk Upload",
          icon: <CloudUpload className="h-4 w-4" />,
          onClick: () => {
            setMoreInfoOpen(true);
          }
        }
      ]
    }
  ];

  const [isMoreInfoOpen, setMoreInfoOpen] = useState(false);
  const [isAttachmentsOpen, setAttachmentsOpen] = useState(false);
  const [isGroupLevelModalOpen, setGroupLevelModalOpen] = useState(false);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };


  // Panel widths state - updated for 12-column system
  const [basicDetailsWidth, setBasicDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(12);
  const [operationalDetailsWidth, setOperationalDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(6);
  const [billingDetailsWidth, setBillingDetailsWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(6);

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

  const cardData: CardDetailsItem[] = [
    {
      id: "R01",
      title: "R01 - Wagon Rentals",
      subtitle: "Vehicle",
      wagons: "10 Wagons",
      price: "€ 45595.00",
      trainType: "Block Train Conventional",
      repairType: "Repair",
      date: "12-Mar-2025 to 12-Mar-2025",
      rateType: "Rate Per Unit-Buy Sell",
      location: "Frankfurt Station A - Frankfurt Station B",
      draftBill: "DB/000234",
      status: "Approved",
    },
    {
      id: "R02",
      title: "R02 - Wagon Rentals",
      subtitle: "Vehicle",
      wagons: "10 Wagons",
      price: "€ 45595.00",
      trainType: "Block Train Conventional",
      repairType: "Repair",
      date: "12-Mar-2025 to 12-Mar-2025",
      rateType: "Rate Per Unit-Buy Sell",
      location: "Frankfurt Station A - Frankfurt Station B",
      draftBill: "DB/000234",
      status: "Failed",
    }
  ];

  const resourceGroups = [
    {
      id: 1,
      name: "QO/00001/2025",
      seqNo: 1, // Optional
      default: "Y", // Optional
      description: "R01 - Wagon Rentals", // Optional
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    // Handle input change logic here
    console.log(`Field: ${field}, Value: ${value}`);
  };

  return (
    <div className="">
      <div className="flex h-full">
        {/* Left Side - Stepper and Main Content */}
        <div className="flex-1 flex">
          {/* Vertical Stepper */}
          <VerticalStepper
            steps={steps}
            activeStep={currentStep}
            onStepClick={handleStepClick}
          />
          {/*<div className="w-64 p-6 border-r min-h-[500px]">
            <div className="">
              <div className="flex items-start space-x-3 cursor-pointer" onClick={handleFirstStep}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                  1
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-900'}`}>
                    Resource Group Creation
                  </h3>
                  <p className={`text-xs ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>-</p>
                </div>
              </div>
              <div className="h-8 w-px bg-blue-600 mt-2 ml-4"></div>
              <div className="flex items-start space-x-3 cursor-pointer mt-2" onClick={handleSecondStep}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  2
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                    Plan and Actuals
                  </h3>
                  <p className={`text-xs ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Total Items: 0</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Main Content */}
          <div className="flex-1 bg-gray-50 px-6 py-4 w-4/5 h-full content-scroll">
            <div className="flex items-center justify-between mb-4">
              {currentStep === 1 && (
                <>
                  <h2 className="text-lg font-semibold">Resource Group Creation</h2>
                  <div className="flex items-center gap-4">
                    <span onClick={() => setGroupLevelModalOpen(true)} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100">
                      <BookmarkCheck className="w-5 h-5 text-gray-500 cursor-pointer" />
                    </span>
                    <span onClick={() => setAttachmentsOpen(true)} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100">
                      <FileText className="w-5 h-5 text-gray-500 cursor-pointer" />
                    </span>
                  </div>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <h2 className="text-lg font-semibold">Plan and Actuals</h2>
                  {isPlanActualsVisible &&
                    (<div className="flex items-center gap-2">
                      {/* Create Order Button with Dropdown */}
                      <DropdownButton config={configurableButtons[0]} />
                      <button className={`p-2 rounded ${view === "grid" ? "bg-blue-50" : ""}`} onClick={() => setView("grid")}> <LayoutGrid className={`w-5 h-5 ${view === "grid" ? "text-blue-600" : "text-gray-400"}`} /> </button>
                      <button className={`p-2 rounded ${view === "list" ? "bg-blue-50" : ""}`} onClick={() => setView("list")}> <List className={`w-5 h-5 ${view === "list" ? "text-blue-600" : "text-gray-400"}`} /> </button>
                    </div>
                    )}
                </>
              )}

            </div>

            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Basic Details Section */}
                {/* <div className="grid grid-cols-12 gap-6"> */}
                <div className="flex gap-6">
                  <div className='w-3/5'>
                    {(() => {
                      let currentTabIndex = 1;
                      const panels = [];

                      // Panel 1: Basic Details
                      if (basicDetailsVisible) {
                        const basicDetailsVisibleCount = Object.values(basicDetailsConfig).filter(config => config.visible).length;
                        panels.push(
                          <DynamicPanel
                            ref={basicDetailsRef}
                            key="basic-details"
                            panelId="basic-details"
                            panelOrder={1}
                            panelIcon={<Wrench className="w-5 h-5 text-lime-500" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={basicDetailsTitle}
                            panelConfig={basicDetailsConfig}
                            formName="basicDetailsForm"
                            initialData={basicDetailsData}
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
                            ref={operationalDetailsRef}
                            key="operational-details"
                            panelId="operational-details"
                            panelOrder={2}
                            panelIcon={<Bookmark className="w-5 h-5 text-blue-500" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={operationalDetailsTitle}
                            panelConfig={operationalDetailsConfig}
                            formName="operationalDetailsForm"
                            initialData={operationalDetailsData}
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
                      return panels;
                    })()}
                  </div>
                  <div className='w-2/5 mb-8'>
                    {(() => {
                      let currentTabIndex = 1;
                      const panels = [];

                      // Panel 3: Billing Details
                      if (billingDetailsVisible) {
                        panels.push(
                          <DynamicPanel
                            ref={billingDetailsRef}
                            key="billing-details"
                            panelId="billing-details"
                            panelOrder={3}
                            panelIcon={<Banknote className="w-5 h-5 text-orange-500" />}
                            startingTabIndex={currentTabIndex}
                            panelTitle={billingDetailsTitle}
                            panelConfig={billingDetailsConfig}
                            formName="billingDetailsForm"
                            initialData={billingDetailsData}
                            onTitleChange={setBillingDetailsTitle}
                            onWidthChange={setBillingDetailsWidth}
                            getUserPanelConfig={getUserPanelConfig}
                            saveUserPanelConfig={saveUserPanelConfig}
                            userId="current-user"
                            panelWidth={billingDetailsWidth}
                            panelSubTitle={billingDetailsTitle}
                          />
                        );
                      }

                      return panels;
                    })()}
                  </div>
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
                {/* {(basicDetailsVisible || operationalDetailsVisible || billingDetailsVisible) && (
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
                  )} */}
              </div>
            )}

            {currentStep === 2 && (
              <>
                {!isPlanActualsVisible && (
                  <div className="rounded-lg px-8 py-10 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <img src={PlanActIcon} alt='Add' className="w-20 h-20" />
                    </div>
                    <p className="text-gray-500 text-center mb-6 text-sm">
                      There are no items of plan and actuals available. Please click 'Add' instead.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setMoreInfoOpen(true)} className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50">
                        Bulk Upload
                      </Button>
                      <Button onClick={() => setIsPlanActualsOpen(true)} className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700">
                        Add Plan or Actuals
                      </Button>
                    </div>
                  </div>
                )}
                {isPlanActualsVisible && (
                  <div className="">
                    <PlanAndActuals view={view} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="mt-2 w-full z-50 bg-white border-t border-gray-300 flex justify-end space-x-3 absolute bottom-0 px-6">
        {currentStep === 1 && (
          <Button variant="outline" onClick={handleProceedToNext} className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50">
            Proceed to Next
          </Button>
        )}
        {currentStep === 2 && (
          <Button variant="outline" onClick={handleFirstStep} className="h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50">
            Back to Resource Group
          </Button>
        )}
        <Button onClick={onSaveDetails} className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700">
          Save Details
        </Button>
      </div>

      {/* SideDrawer component */}
      <SideDrawer isOpen={isPlanActualsOpen} onClose={() => setIsPlanActualsOpen(false)} width='85%' title="Plan and Actual Details" isBack={false}>
        <div>
          {/* <PlanAndActualDetails onCloseDrawer={() => setIsPlanActualsOpen(false)}></PlanAndActualDetails> */}
          <PlanAndActualDetails onCloseDrawer={() => setIsPlanActualsOpen(false)} isEditQuickOrder={isEditQuickOrder}></PlanAndActualDetails>

        </div>
      </SideDrawer>

      {/* Bulk upload component */}
      <SideDrawer isOpen={isMoreInfoOpen} onClose={() => setMoreInfoOpen(false)} width="50%" title="Add Files" isBack={false}>
        <div className="">
          <div className="mt-0 text-sm text-gray-600"><BulkUpload /></div>
        </div>
      </SideDrawer>

      <SideDrawer isOpen={isAttachmentsOpen} onClose={() => setAttachmentsOpen(false)} width="80%" title="Attachments" isBack={false} badgeContent="QO/00001/2025" isBadgeRequired={true}>
        <div className="">
          <div className="mt-0 text-sm text-gray-600"><Attachments /></div>
        </div>
      </SideDrawer>

      <SideDrawer isOpen={isGroupLevelModalOpen} onClose={() => setGroupLevelModalOpen(false)} width="80%" title="Group Level Details" isBack={false}>
        <div className="mt-3 px-4">
          <div className="w-80 mb-3">
            <SimpleDropDown
              list={resourceGroups}
              value={resourceGroups[0].description}
              onValueChange={(value) =>
                handleInputChange("resourceGroup", value)
              }
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Resource Group Details
              {/* <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">3</span> */}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  name='grid-search-input'
                  placeholder="Search"
                  className="border border-gray-300 rounded text-sm placeholder-gray-400 px-2 py-1 pl-3 w-64 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ width: 200 }}
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              </div>
              <Button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 bg-gray-50 text-gray-600 p-0 border border-gray-300">
                <Filter className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
          <div className="mt-4 mb-6">
            <CardDetails data={cardData} isEditQuickOrder={isEditQuickOrder} />
          </div>
        </div>
      </SideDrawer>

    </div>
  );
};

export default ResourceGroupDetailsForm;