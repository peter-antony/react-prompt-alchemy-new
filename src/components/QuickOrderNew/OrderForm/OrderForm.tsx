import React, { useRef, useState } from 'react';
import { CalendarIcon, Search, CircleArrowOutUpRight, Paperclip, BookX, Link, Copy, CircleX, CheckCircle, AlertCircle, X } from 'lucide-react'; import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SimpleDropDown } from '../../Common/SimpleDropDown';
import { SideDrawer } from '../../Common/SideDrawer';
import { MoreInfo } from './MoreInfo';
import Attachments from './Attachments';
import AmendmentHistory from './AmendmentHistory';
import LinkedOrders from './LinkedOrders';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import jsonStore from '@/stores/jsonStore';
import { useEffect } from 'react';
import Toast from '../../Common/Toast';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { quickOrderService } from '@/api/services/quickOrderService';

interface OrderFormProps {
  onSaveDraft: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  isEditQuickOrder?: boolean;
  onScroll?: boolean;
}

const OrderForm = ({ onSaveDraft, onConfirm, onCancel, isEditQuickOrder, onScroll }: OrderFormProps) => {
  const [OrderType, setOrderType] = useState('buy');
  const [OrderDate, setOrderDate] = useState<Date>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showOrderNoSuggestions, setShowOrderNoSuggestions] = useState(false);
  const [showCustomerRefSuggestions, setShowCustomerRefSuggestions] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [errorToastOpen, setErrorToastOpen] = useState(false);
  const [quickOrder, setQuickOrder] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedQC, setSelectedQC] = useState("QC");
  const [qcDropdown, setQcDropdown] = useState('QC');
  const [qcInput, setQcInput] = useState('');

  //Contracts Array
  const [contracts, setContracts] = useState<any[]>([]);
  //  = [
  //   {
  //     "id": 1,
  //     "name": "DB Cargo",
  //     "seqNo": 1,   // Optional
  //     "default": "Y",   // Optional
  //     "description": "db-cargo" // Optional
  //   },
  //   {
  //     "id": 2,
  //     "name": "Rail Freight",
  //     "seqNo": 2,
  //     "default": "N",
  //     "description": "rail-freight"
  //   },
  //   {
  //     "id": 3,
  //     "name": "Express Logistics",
  //     "seqNo": 3,
  //     "default": "N",
  //     "description": "express-logistics"
  //   }

  // ]
  //Customers Array
  const [customers, setCustomers] = useState<any[]>([]);
  //  = [
  //   {
  //     "id": 1,
  //     "name": "C0012",
  //     "seqNo": 1,   // Optional
  //     "default": "Y",   // Optional
  //     "description": "DB-Cargo" // Optional
  //   },
  //   {
  //     "id": 2,
  //     "name": "C0013",
  //     "seqNo": 2,
  //     "default": "N",
  //     "description": "Global-Logistics"
  //   },
  //   {
  //     "id": 3,
  //     "name": "C0014",
  //     "seqNo": 3,
  //     "default": "N",
  //     "description": "Freight-Solutions"
  //   },
  //   {
  //     "id": 4,
  //     "name": "C0015",
  //     "seqNo": 3,
  //     "default": "N",
  //     "description": "Logistic-solutions"
  //   }

  // ]
  //QC List Array
  const [clusters, setClusters] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const QCList = [
    {
      "id": 1,
      "name": "QC",
      "seqNo": 1,   // Optional
      "default": "Y",   // Optional
      "description": "qc" // Optional
    },
    {
      "id": 2,
      "name": "Quality",
      "seqNo": 2,
      "default": "N",
      "description": "quality"
    },
    {
      "id": 3,
      "name": "Control",
      "seqNo": 3,
      "default": "N",
      "description": "control"
    }

  ]

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageTypes = [
    "Cluster Init",
    "Contract Init",
    "Customer Init",
    "Supplier Init",
  ];
  const [selectedType, setSelectedType] = useState(messageTypes[0]);
  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
    
    const quickOrder = jsonStore.getQuickOrder();
    if (isEditQuickOrder && quickOrder && Object.keys(quickOrder).length > 0) {
      setOrderType(quickOrder.OrderType || 'buy');
      setFormData(normalizeOrderFormDetails(quickOrder));
      setmoreInfoData(normalizeMoreInfoDetails(quickOrder)); // <-- This sets moreInfoData with store value
    } else if (!isEditQuickOrder) {
      setOrderType('buy');
      setFormData(normalizeOrderFormDetails({}));
      setmoreInfoData(normalizeMoreInfoDetails({}));
    }
  }, [isEditQuickOrder, loading, contracts, customers, clusters, vendors]);
  //API Call for dropdown data
  const fetchData = async (messageType) => {
    setLoading(false);
    setError(null);
    try {
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType });
      setApiData(data);
      console.log("load inside try", data);
      if (messageType == "Contract Init") {
        setContracts(JSON.parse(data?.data?.ResponseData));
        console.log("Contracts data:===", data.data.ResponseData);
      }
      if (messageType == "Customer Init") {
        setCustomers(JSON.parse(data?.data?.ResponseData));
        // setCustomers(apiData.data.ResponseData);
      }
      if (messageType == "Cluster Init") {
        setClusters(JSON.parse(data?.data?.ResponseData));
        // setClusters(apiData.data.ResponseData);
      }
      if (messageType == "Supplier Init") {
        setVendors(JSON.parse(data?.data?.ResponseData));
      }
    } catch (err) {
      setError(`Error fetching API data for ${messageType}`);
      // setApiData(data);
    } 
    finally {
      setLoading(true);
    }
  };
  // Iterate through all messageTypes
  const fetchAll = async () => {
    setLoading(false);
    for (const type of messageTypes) {
      await fetchData(type);
    }
  };
  // Local array of order IDs for suggestions
  const orderIds = [
    'IO/0000000042',
    'IO/0000000043',
    'IO/0000000044',
    'IO/0000000045',
    'IO/0000000046',
    'IO/0000000047',
    'IO/0000000048',
    'IO/0000000049',
    'IO/0000000050'
  ];
  // Local array of customer ref IDs for suggestions
  const customerRefIds = [
    'CR234567890',
    'CR344678910',
    'CR344678920',
    'CR345678930',
    'CR345678940',
  ];
  const [isMoreInfoOpen, setMoreInfoOpen] = useState(false);
  const [isBack, setIsBack] = useState(true);
  const [isAttachmentsOpen, setAttachmentsOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isLinkedOrdersOpen, setLinkedOrdersOpen] = useState(false);
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);

  const [OrderFormTitle, setOrderFormTitle] = useState('Order Details');
  const getInitialOrderDetails = () =>
    isEditQuickOrder
      ? normalizeOrderFormDetails(jsonStore.getQuickOrder() || {})
      : {};
  //ORDER DETAILS FORM
  const initialOrderFormDetails = normalizeOrderFormDetails(getInitialOrderDetails());
  const [formData, setFormData] = useState(initialOrderFormDetails);

  const getOrderFormDetailsConfig = (OrderType: string): PanelConfig => ({
    // const OrderFormDetailsConfig: PanelConfig = {

    OrderType: {
      id: 'OrderType',
      label: '',
      fieldType: 'radio',
      width: 'full',
      value: OrderType || 'buy',
      options: [
        { label: 'Buy Order', value: 'buy' },
        { label: 'Sell Order', value: 'sell' }
      ],
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      events: {
        onChange: (val: string) => {
          setOrderType(val), // To update state on change
            getOrderFormDetailsConfig(OrderType);
        }

      }
    },
    QuickOrderDate: {
      id: 'QuickOrderDate',
      label: 'Quick Order Date',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
    },
    Contract: {
      id: 'Contract',
      label: 'Contract',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      options: contracts.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id + " || " + c.name })),
    },
    Customer: {
      id: 'Customer',
      label: 'Customer',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: true,
      visible: OrderType === 'sell',
      editable: true,
      order: 4,
      options: customers.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id + " || " + c.name })),
    },
    Vendor: {
      id: 'Vendor',
      label: 'Vendor',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: true,
      visible: OrderType === 'buy',
      editable: true,
      order: 4,
      options: vendors.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id + " || " + c.name })),
    },
    Cluster: {
      id: 'Cluster',
      label: 'Cluster',
      fieldType: 'select',
      width: 'half',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 5,
      options: clusters.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id + " || " + c.name })),
    },
    CustomerQuickOrderNo: {
      id: 'CustomerQuickOrderNo',
      label: 'Customer Internal Order No.',
      fieldType: 'search',
      width: 'full',
      value: '',
      mandatory: false,
      visible: OrderType === 'buy',
      editable: true,
      order: 6,
      placeholder: 'IO/0000000042',
      searchData: orderIds, // <-- This is the local array for suggestions
    },
    Customer_Supplier_RefNo: {
      id: 'Customer_Supplier_RefNo',
      label: 'Customer/ Supplier Ref. No.',
      fieldType: 'search',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      placeholder: 'CR0000001',
      searchData: customerRefIds, // <-- This is the local array for suggestions
    },
    QCUserDefined1: {
      id: 'QCUserDefined1',
      label: 'QC Userdefined 1',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '', // <-- Set default dropdown value here
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      options: [
        { label: 'QC', value: 'QC' },
        { label: 'QA', value: 'QA' },
        { label: 'Test', value: 'Test' }
      ]
    },
    Remark1: {
      id: 'Remark1',
      label: 'Remarks 1',
      fieldType: 'text',
      width: 'full',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      placeholder: 'Enter Remarks'
    },
    Summary: {
      id: 'Summary',
      label: 'Summary',
      fieldType: 'textarea',
      width: 'full',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      placeholder: 'Enter Summary'
    },
  });
  // Utility to normalize keys from store to config field IDs
  function normalizeOrderFormDetails(data) {
    return {
      OrderType: data.OrderType,
      QuickOrderDate: data.QuickOrderDate,
      Contract: data.Contract,
      Customer: data.Customer,
      Vendor: data.Vendor,
      Cluster: data.Cluster,
      CustomerQuickOrderNo: data.CustomerQuickOrderNo,
      Customer_Supplier_RefNo: data.Customer_Supplier_RefNo,
      QCUserDefined1: data.QCUserDefined1,
      Remark1: data.Remark1,
      Summary: data.Summary
    };

  }

  const orderDetailsRef = useRef<DynamicPanelRef>(null);
  const onSaveDetails = () => {
    const formValues = {
      QuickOrder: orderDetailsRef.current?.getFormValues() || {},
      // operationalDetails: moreInfoDetailsRef.current?.getFormValues() || {},
    };
    setFormData(formValues.QuickOrder);

    jsonStore.setQuickOrder({
      ...jsonStore.getJsonData().quickOrder,
      ...formValues.QuickOrder
    });

    const fullJson = jsonStore.getJsonData();
    console.log("FULL JSON :: ", fullJson);

  }
  // Mock functions for user config management
  const getUserPanelConfig = (userId: string, panelId: string): PanelSettings | null => {
    const stored = localStorage.getItem(`panel-config-${userId}-${panelId}`);
    return stored ? JSON.parse(stored) : null;
  };

  const saveUserPanelConfig = (userId: string, panelId: string, settings: PanelSettings): void => {
    localStorage.setItem(`panel-config-${userId}-${panelId}`, JSON.stringify(settings));
    console.log(`Saved config for panel ${panelId}:`, settings);
  };

  const parseDDMMYYYY = (dateStr) => {
    // Expects dateStr in 'DD/MM/YYYY'
    const [day, month, year] = dateStr.split('/').map(Number);
    // JS Date: months are 0-based
    return new Date(year, month - 1, day);
  }

  //MORE INFO DETAILS
  const moreInfoPanelConfig: PanelConfig = {
    PrimaryDocTypeandNo: {
      id: 'PrimaryDocType',
      label: 'Primary Doc Type and No.',
      fieldType: 'inputdropdown',
      width: 'full',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 1,
      options: [
        { label: 'IO-Hire/Rent', value: 'IO-Hire/Rent' },
        { label: 'IO-Buy/Rent', value: 'IO-Buy/Rent' },
      ]
    },
    SecondaryDocTypeandNo: {
      id: 'SecondaryDocType',
      label: 'Secondary Doc Type and No.',
      fieldType: 'inputdropdown',
      width: 'full',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: 'IO-Hire/Rent', value: 'IO-Hire/Rent' },
        { label: 'IO-Buy/Rent', value: 'IO-Buy/Rent' },
      ]
    },
    PrimaryDocDate: {
      id: 'PrimaryDocDate',
      label: 'Primary Doc Date',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
    },
    SecondaryDocDate: {
      id: 'SecondaryDocDate',
      label: 'Secondary Doc Date',
      fieldType: 'date',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
    },
    WBS: {
      id: 'WBS',
      label: 'WBS',
      fieldType: 'text',
      width: 'full',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 5,
      placeholder: ''
    },
    QCUserdefined2: {
      id: 'QCUserdefined2',
      label: 'QC Userdefined 2',
      fieldType: 'inputdropdown',
      width: 'half',
      value: { dropdown: 'QC', input: '' },
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      options: [
        { label: 'QC', value: 'QC' },
        { label: 'QA', value: 'QA' },
      ]
    },
    QCUserdefined3: {
      id: 'QCUserdefined3',
      label: 'QC Userdefined 3',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      options: [
        { label: 'QC', value: 'QC' },
        { label: 'QA', value: 'QA' },
      ]
    },
    Remarks2: {
      id: 'Remarks2',
      label: 'Remarks 2',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: false,
      order: 8,
      width: 'full',
    },
    Remarks3: {
      id: 'Remarks3',
      label: 'Remarks 3',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      placeholder: 'Enter Remarks',
      width: 'full',
    }
  };
  const [moreInfoTitle, setmoreInfoTitle] = useState('More Info');
  const initialMoreInfoDetails = normalizeMoreInfoDetails(jsonStore.getQuickOrder() || {});
  const [moreInfoData, setmoreInfoData] = useState(initialMoreInfoDetails);
  // Utility to normalize MoreInfo details from store to config field IDs
  function normalizeMoreInfoDetails(data) {
    return {
      PrimaryDocTypeandNo: data.PrimaryDocTypeandNo,
      SecondaryDocTypeandNo: data.SecondaryDocTypeandNo,
      PrimaryDocDate: data.PrimaryDocDate,
      SecondaryDocDate: data.SecondaryDocDate,
      WBS: data.WBS,
      QCUserdefined2: data.QCUserdefined2,
      QCUserdefined3: data.QCUserdefined3,
      Remarks2: data.Remarks2,
      Remarks3: data.Remarks3
    };
  }
  const moreInfoDetailsRef = useRef<DynamicPanelRef>(null);
  const onSave = () => {
    const formValues = {
      moreInfo: moreInfoDetailsRef.current?.getFormValues() || {},
    };
    setFormData(formValues.moreInfo);
    jsonStore.setQuickOrder({
      ...jsonStore.getJsonData().quickOrder,
      ...formValues.moreInfo
    });

    const fullJson = jsonStore.getJsonData();
    console.log("FULL JSON :: ", fullJson);
    setToastOpen(true);
  }
  const handleMoreInfoDataChange = (updatedData: any) => {
    console.log("Updated form data:", updatedData.OrderType);
  };
  const copyDetails = () => {

  }
  return (
    <div className='bg-white rounded-lg border border-gray-200'>
      <div className={`${onScroll ? 'orderFormScroll' : ''}`}>

        {/* <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        Order Details
        {isEditQuickOrder && quickOrder && (
          <>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">
              {quickOrder.QuickUniqueID || "QO/00001/2025"}
            </span>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-200">
              {quickOrder.Status || "Confirmed"}
            </span>
          </>
        )}
      </h2> */}
        {loading ?
          <DynamicPanel
            ref={orderDetailsRef}
            key={OrderType} // <-- This will force remount on orderType change
            panelId={OrderType}
            panelTitle="Order Details"
            panelConfig={getOrderFormDetailsConfig(OrderType)}
            initialData={formData}
            onTitleChange={setOrderFormTitle}
            getUserPanelConfig={getUserPanelConfig}
            saveUserPanelConfig={saveUserPanelConfig}
            userId="current-user"
            className="my-custom-orderform-panel"
          /> : ''
        }
      </div>



      {/* Form Actions */}
      <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200">
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={() => setMoreInfoOpen(true)}>
          <CircleArrowOutUpRight className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={() => setAttachmentsOpen(true)}>
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={(e) => onSaveDetails()}>
          <BookX className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={() => setLinkedOrdersOpen(true)}>
          <Link className="w-5 h-5 text-gray-600" />
        </button>
        {
          isEditQuickOrder ?
            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={() => setCopyModalOpen(true)}>
              <Copy className="w-5 h-5 text-gray-600" />
            </button> : ' '
        }
      </div>

      <SideDrawer isOpen={isMoreInfoOpen} onClose={() => setMoreInfoOpen(false)} width="35%" title="More Info" isBack={false} onScrollPanel={true}>
        <div className="">
          <div className="mt-0 text-sm text-gray-600">
            <DynamicPanel
              ref={moreInfoDetailsRef}
              key="More-Info"
              panelId="More-Info"
              panelOrder={1}
              panelTitle={moreInfoTitle}
              panelConfig={moreInfoPanelConfig}
              initialData={moreInfoData}
              formName="moreInfoForm"
              onTitleChange={setmoreInfoTitle}
              getUserPanelConfig={getUserPanelConfig}
              saveUserPanelConfig={saveUserPanelConfig}
              userId="current-user"
            />
            {/* <MoreInfo /> */}
          </div>
          <div className="flex bg-white justify-end w-full px-4 border-t border-gray-300">
            <button type="button" className="bg-blue-600 mt-2 text-white text-sm px-6 py-2 rounded font-medium" onClick={onSave}>
              Save Details
            </button>
          </div>
        </div>
      </SideDrawer>
      <SideDrawer isOpen={isAttachmentsOpen} onClose={() => setAttachmentsOpen(false)} width="80%" title="Attachments" isBack={false} badgeContent="QO/00001/2025" onScrollPanel={true} isBadgeRequired={true}>
        <div className="">
          <div className="mt-0 text-sm text-gray-600"><Attachments isEditQuickOrder={isEditQuickOrder} isResourceGroupAttchment={false} /></div>
        </div>
      </SideDrawer>
      <SideDrawer isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} width="40%" title="Amendment History" isBack={false} badgeContent="QO/00001/2025" onScrollPanel={true} isBadgeRequired={true}>
        <div className="">
          <div className="mt-0 text-sm text-gray-600"><AmendmentHistory /></div>
        </div>
      </SideDrawer>
      <SideDrawer isOpen={isLinkedOrdersOpen} onClose={() => setLinkedOrdersOpen(false)} width="80%" title="Linked Orders" onScrollPanel={true} isBack={false} >
        <div className="">
          <div className="mt-0 text-sm text-gray-600"><LinkedOrders /></div>
        </div>
      </SideDrawer>

      {/* Copy Modal */}
      <Dialog open={isCopyModalOpen} onOpenChange={setCopyModalOpen}>
        <DialogContent className="max-w-sm w-full p-0 rounded-xl text-xs">
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 p-2 rounded-full"><Copy className="w-5 h-5 text-blue-500" /></span>
                <span className="font-semibold text-lg">Copy</span>
              </div>
              {/* <CircleX  onClick={() => setCopyModalOpen(false)} className="text-gray-400 hover:text-gray-600" /> */}

            </div>
            {/* Resource Group */}
            <div className="px-6 py-4">
              <div className="text-sm font-medium mb-2">Resource Group</div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-blue-200">R01 - Wagon Rentals <span className="ml-1 cursor-pointer">×</span></span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-blue-200">R02 - ... <span className="ml-1 cursor-pointer">×</span></span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-gray-200">+1</span>
              </div>
            </div>
            {/* Copy Details Button */}
            <div className="px-6 pb-6">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition" onClick={(e) => copyDetails()}>Copy Details</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toast
        message="Order No:QO/00001/2025 has been saved successfully."
        isError={false}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
      <Toast
        message="Error in saving Order details."
        isError={true}
        open={errorToastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default OrderForm;
