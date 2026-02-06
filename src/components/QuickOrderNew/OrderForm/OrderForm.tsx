import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { CalendarIcon, Search, CircleArrowOutUpRight, Plus, Paperclip, BookX, Link, Copy, CircleX, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import jsonStore from '@/stores/jsonStore';
import { useEffect } from 'react';
import Toast from '../../Common/Toast';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { quickOrderService } from '@/api/services/quickOrderService';
import AddIcon from '../../../assets/images/addIcon.png';
import ResourceGroupDetailsForm from '../ResourceGroupDetails';
import CardDetails, { CardDetailsItem } from '../../Common/Card-View-Details';
import { initializeJsonStore } from '../../../pages/JsonCreater';
import { useToast } from '@/hooks/use-toast';

export type OrderFormHandle = {
  getOrderValues: () => any;
  doValidation: () => {
    isValid: boolean;
    errors: Record<string, string>;
    mandatoryFieldsEmpty: string[];
  };
 };


interface OrderFormProps {
  onSaveDraft: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  isEditQuickOrder?: boolean;
  onScroll?: boolean;
  onOrderCreated?: () => void;
  quickOrderNoCallback?: (value: string) => void;
}

const OrderForm = forwardRef<OrderFormHandle, OrderFormProps>(({  
  onConfirm,onSaveDraft, onCancel, isEditQuickOrder, 
  onScroll, onOrderCreated, quickOrderNoCallback }: OrderFormProps, ref) => {
  const navigate = useNavigate();
  const [OrderType, setOrderType] = useState('BUY');
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
  const [items, setItems] = useState<any[]>([]);

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
  const [qcList1, setqcList1] = useState<any>();
  const [qcList2, setqcList2] = useState<any>();
  const [qcList3, setqcList3] = useState<any>();
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
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [panelPersonalizationModeFlag, setPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');
  // utils/fetchOptionsHelper.ts
  const makeLazyFetcher = (messageType: string) => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      const response: any = await quickOrderService.getMasterCommonData({
        messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      try {
        return JSON.parse(response?.data?.ResponseData || '[]');
      } catch (err) {
        console.error(`Failed to parse ResponseData for ${messageType}:`, err);
        return [];
      }
    };
  };
  const messageTypes = [
    "Cluster Init",
    "Contract Init",
    "Customer Init",
    "Supplier Init",
    "Quick Order Header Quick Code1 Init",
    "Quick Order Header Quick Code2 Init",
    "Quick Order Header Quick Code3 Init",
  ];
  const [selectedType, setSelectedType] = useState(messageTypes[0]);

  // Fetch panel personalization on component mount
  useEffect(() => {
    const fetchPanelPersonalization = async () => {
      try {
        const personalizationResponse: any = await quickOrderService.getPersonalization({
          LevelType: 'User',
          // LevelKey: 'ramcouser',
          ScreenName: 'CreateQuickOrder_OrderDetailsForm',
          ComponentName: 'panel-config-current-user-order-details'
        });

        console.log('OrderForm Panel Personalization Response:', personalizationResponse);

        // Parse and set personalization data to localStorage
        if (personalizationResponse?.data?.ResponseData) {
          const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);

          if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
            const personalizationData = parsedPersonalization.PersonalizationResult[0];

            // Set the JsonData to localStorage
            if (personalizationData.JsonData) {
              const jsonData = personalizationData.JsonData;
              localStorage.setItem('panel-config-current-user-order-details', JSON.stringify(jsonData));
              console.log('OrderForm Panel Personalization data set to localStorage:', jsonData);
            }
            // If we have data, next save should be an Update
            setPanelPersonalizationModeFlag('Update');
          } else {
            // If result is empty array or no result, next save should be Insert
            console.log('No existing panel personalization found, setting mode to Insert');
            setPanelPersonalizationModeFlag('Insert');
          }
        } else {
          // If ResponseData is empty/null, next save should be Insert
          console.log('Empty panel personalization response, setting mode to Insert');
          setPanelPersonalizationModeFlag('Insert');
        }
      } catch (error) {
        console.error('Failed to load panel personalization:', error);
        setPanelPersonalizationModeFlag('Insert');
      }
    };

    fetchPanelPersonalization();
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);


  //API Call for dropdown data
  const fetchData = async (messageType) => {
    setLoading(false);
    setError(null);
    console.log("Loading API data Type", OrderType);
    try {
      // setContracts([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      // setCustomers([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      // setClusters([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      // setVendors([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType, OrderType: OrderType });
      setApiData(data);
      console.log("load inside try", data);
      if (messageType == "Contract Init") {
        setContracts(JSON.parse(data?.data?.ResponseData));
        // console.log("Contracts data:===", data.data.ResponseData);
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
      if (messageType == "Quick Order Header Quick Code1 Init") {
        setqcList1(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code1 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Quick Order Header Quick Code2 Init") {
        setqcList2(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code2 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Quick Order Header Quick Code3 Init") {
        setqcList3(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code3 Init', JSON.parse(data?.data?.ResponseData));
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
    setApiStatus('loading');
    for (const type of messageTypes) {
      await fetchData(type);
    }
    setApiStatus('success');
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
  // const [isResourceGroupOpen, setResourceGroupOpen] = useState(false);
  const [isMoreInfoOpen, setMoreInfoOpen] = useState(false);
  const [isBack, setIsBack] = useState(true);
  const [isAttachmentsOpen, setAttachmentsOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isLinkedOrdersOpen, setLinkedOrdersOpen] = useState(false);
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const [quickOrderDate, setQuickOrderDate] = useState();
  const [OrderFormTitle, setOrderFormTitle] = useState('Order Details');
  const getInitialOrderDetails = () =>
    isEditQuickOrder
      ? normalizeOrderFormDetails(jsonStore.getQuickOrder() || {})
      : {};
  //ORDER DETAILS FORM
  const initialOrderFormDetails = normalizeOrderFormDetails(getInitialOrderDetails());
  const [formData, setFormData] = useState(initialOrderFormDetails);
  // const [originalData, setOriginalData] = useState<any>(null);
  const getOrderFormDetailsConfig = (OrderType: string): PanelConfig => ({
    // const OrderFormDetailsConfig: PanelConfig = {

    OrderType: {
      id: 'OrderType',
      label: '',
      fieldType: 'radio',
      width: 'full',
      value: OrderType || 'BUY',
      options: [
        { label: 'Buy Order', value: 'BUY' },
        { label: 'Sell Order', value: 'SELL' }
      ],
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      events: {
        onChange: (val: string) => {
          setOrderType(val), // To update state on change
            getOrderFormDetailsConfig(OrderType);
          // When OrderType changes, clear the Contract field (set to empty)
          orderDetailsRef.current.setFormValues({
            Contract: "",
          });
        }

      }
    },
    QuickOrderDate: {
      id: 'QuickOrderDate',
      label: 'Quick Order Date',
      fieldType: 'date',
      width: 'half',
      value: isEditQuickOrder ? '' : new Date().toISOString().split("T")[0], // if Edit - api data, else current date
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
    },
    Contract: {
      id: 'Contract',
      label: 'Contract',
      fieldType: 'lazyselect',
      width: 'half',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 3,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Contract Init",
          OrderType: OrderType,
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
              // value: item.id
            }
            : {})
        }));
      },
      events: {
        onChange: (val: string) => {
          setComboDropdown(val) // To update state on change
          // getOrderFormDetailsConfig(OrderType);
        }

      }
    },

    Customer: {
      id: 'Customer',
      label: 'Customer',
      fieldType: 'lazyselect',
      width: 'half',
      value: '',
      mandatory: true,
      visible: OrderType === 'SELL',
      editable: true,
      order: 4,
      hideSearch: false,
      disableLazyLoading: false,
      // options: customers.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Customer Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
          console.log('Event:', event);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    Vendor: {
      id: 'Vendor',
      label: 'Supplier',
      fieldType: 'lazyselect',
      width: 'half',
      value: '',
      mandatory: true,
      visible: OrderType === 'BUY',
      editable: true,
      order: 4,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Supplier Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    Cluster: {
      id: 'Cluster',
      label: 'Cluster',
      fieldType: 'lazyselect',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      hideSearch: true,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Cluster Init",
          OrderType: OrderType,
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
    },
    CustomerQuickOrderNo: {
      id: 'CustomerQuickOrderNo',
      label: 'Customer Quick Order No.',
      fieldType: 'text',
      width: 'full',
      value: '',
      mandatory: false,
      visible: OrderType === 'BUY',
      editable: true,
      order: 6,
      maxLength: 18,
      // hideSearch: true,
      // disableLazyLoading: false,
      // fetchOptions: async ({ searchTerm, offset, limit }) => {
      //   const response = await quickOrderService.getMasterCommonData({
      //     messageType: "Customer Order status Init",
      //     OrderType: OrderType,
      //     searchTerm: searchTerm || '',
      //     offset,
      //     limit,
      //   });
      //   // response.data is already an array, so just return it directly
      //   const rr: any = response.data
      //   return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
      //     ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
      //       ? {
      //           label: `${item.id} || ${item.name}`,
      //           value: item.id
      //         }
      //       : {})
      //   }));
      // },
      placeholder: '',
      // searchData: orderIds, // <-- This is the local array for suggestions
    },
    Customer_Supplier_RefNo: {
      id: 'Customer_Supplier_RefNo',
      label: 'Customer/ Supplier Ref. No.',
      fieldType: 'text',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      placeholder: '',
      maxLength: 40,
      // searchData: customerRefIds, // <-- This is the local array for suggestions
    },
    QCUserDefined1: {
      id: 'QCUserDefined1',
      label: 'QC Userdefined 1',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '', // <-- Set default dropdown value here
      // value: { dropdown: qcList1[0]?.id || '', input: '' }, // <-- Set default dropdown value here
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      maxLength: 255,
      options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      placeholder: '',
      maxLength: 500,
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
      placeholder: '',
      maxLength: 500,
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
      order: 11,
      placeholder: '',
      maxLength: 40
    },
    QCUserDefined2: {
      id: 'QCUserDefined2',
      label: 'QC Userdefined 2',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 12,
      maxLength: 255,
      options: qcList2?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      // options: [
      //   { label: 'QC', value: 'QC' },
      //   { label: 'QA', value: 'QA' },
      // ]
    },
    QCUserDefined3: {
      id: 'QCUserDefined3',
      label: 'QC Userdefined 3',
      fieldType: 'inputdropdown',
      width: 'half',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 13,
      maxLength: 255,
      options: qcList3?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
    },
    Remarks2: {
      id: 'Remarks2',
      label: 'Remarks 2',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 14,
      placeholder: '',
      width: 'full',
      maxLength: 500,
    },
    Remarks3: {
      id: 'Remarks3',
      label: 'Remarks 3',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 15,
      placeholder: '',
      width: 'full',
      maxLength: 500,
    }
  });
  //convert date time object to date value to bind in datepicker
  function formatDateToYYYYMMDD(dateString) {
    if (!dateString) return '';
    // Handles both Date objects and string input
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';
    date.setDate(date.getDate() + 10);
    return date.toISOString().slice(0, 10);
  }
  //setting Combo Dropdown with selected Contract
  const setComboDropdown = async (contractId: any) => {
    console.log("VALUE", contractId);
    // If contractId.value contains '||', truncate everything after '||'
    let contractIdValue = contractId.value;
    if (typeof contractIdValue === 'string' && contractIdValue.includes('||')) {
      contractIdValue = contractIdValue.split('||')[0].trim();
    }
    console.log("VALUE", contractIdValue);

    // setLoading(false);
    setError(null);
    // setApiStatus('loading');
    try {
      const data: any = await quickOrderService.getCommonComboData({ messageType: "ContractID Selection", contractId: contractIdValue, type: OrderType });
      const parsedResponse = JSON.parse(data.data.ResponseData);
      console.log("COMBO DROPDOWN DATA", parsedResponse);
      // Set ContractTariff array in jsonStore for global access
      if (parsedResponse && parsedResponse.ContractTariff) {
        jsonStore.setContractTariffList(parsedResponse.ContractTariff);
      }
      console.log("ORDERTYPE :", jsonStore.getContractTariffList());
      // setContracts(JSON.parse(data?.data?.ResponseData));
      const parsedData: any = JSON.parse(data?.data?.ResponseData);
      const contract: any = parsedData;
      console.log("CONTRACT DATA:: ", contract);
      if (contract) {
        orderDetailsRef.current.setFormValues({
          Contract: (contract.ContractID ? contract.ContractID : '') + ' || ' + (contract.ContractDesc ? contract.ContractDesc : ''),
          ContractDescription: contract.ContractDesc,
          Vendor: (contract.VendorID ? contract.VendorID : '') + ' || ' + (contract.VendorName ? contract.VendorName : ''),
          Customer: (contract.CustomerID ? contract.CustomerID : '') + ' || ' + (contract.CustomerName ? contract.CustomerName : ''),
          VendorName: contract.VendorName,
          Cluster:
            (contract.ClusterLocation ? contract.ClusterLocation : '') +
            (contract.ClusterLocationDesc ? ' || ' + contract.ClusterLocationDesc : ''),
          ClusterLocationDesc: contract.ClusterLocationDesc,
          WBS: contract.WBS,
          Currency: contract.Currency,
        });

        setOrderType(OrderType)
        // const formatted = formatDateToYYYYMMDD("2023-08-31T00:00:00"); // "2023-08-31"
        // setQuickOrderDate(formatDateToYYYYMMDD(contract.ValidFrom) )
        console.log("contract.Currency = ",contract.Currency)
        jsonStore.setQuickOrderFields({ OrderType: OrderType, Contract: contract.ContractID, ContractDescription: contract.ContractDesc, Customer: contract.CustomerID, Vendor: contract.VendorID, VendorName: contract.VendorName, Cluster: contract.ClusterLocation, ClusterLocationDesc: contract.ClusterLocationDesc, WBS: contract.WBS, Currency: contract.Currency });
        jsonStore.setResourceGroupFields({ OperationalLocation: contract.Location });
        const additionalInfo = contract.ContractTariff;
        jsonStore.setResourceType({ Resource: additionalInfo[0].Resource, ResourceDescription: additionalInfo[0].ResourceDescription, ResourceType: additionalInfo[0].ResourceType, ResourceTypeDescription: additionalInfo[0].ResourceTypeDescription })
        jsonStore.setTariffFields({
          tariff: additionalInfo[0].TariffID,
          tariffDescription: additionalInfo[0].TariffDescription,
          // tariff: (additionalInfo[0].TariffID ? additionalInfo[0].TariffID : '') + (additionalInfo[0].TariffDescription ? ' || ' + additionalInfo[0].TariffDescription : ''),
          // tariff: additionalInfo[0].TariffID && additionalInfo[0].TariffDescription
          //     ? `${additionalInfo[0].TariffID} || ${additionalInfo[0].TariffDescription}`
          //     : (additionalInfo[0].TariffID || additionalInfo[0].TariffDescription || ""),
          contractPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : 0,
          unitPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : '',
          // netAmount: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
          tariffType: additionalInfo[0].TariffType ? additionalInfo[0].TariffType : "",
          tariffTypeDescription: additionalInfo[0].TariffTypeDescription ? additionalInfo[0].TariffTypeDescription : "",
          // billToID: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
          // draftBillNo: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
        });
        // jsonStore.setTariffDateFields({
        //   fromDate: additionalInfo[0].ContractTariffValidFrom
        //     ? additionalInfo[0].ContractTariffValidFrom.split("T")[0]
        //     : "",
        //   toDate: additionalInfo[0].ContractTariffValidTo
        //     ? additionalInfo[0].ContractTariffValidTo.split("T")[0]
        //     : "",
        //   // fromDate: formatDate(additionalInfo[0].ContractTariffValidFrom ? additionalInfo[0].ContractTariffValidFrom : ""),
        //   // toDate: formatDate(additionalInfo[0].ContractTariffValidTo ? additionalInfo[0].ContractTariffValidTo : ""),
        //   // fromDate: additionalInfo[0].ContractTariffValidFrom ? additionalInfo[0].ContractTariffValidFrom : "",
        //   // toDate: additionalInfo[0].ContractTariffValidTo ? additionalInfo[0].ContractTariffValidTo : "",
        // });
        // Set ValidFrom and ValidTo in jsonStore using a new set method


        console.log("AFTER DATA BINDING - RESOURCEGROUP  : ", jsonStore.getResourceJsonData())
        console.log("AFTER DATA BINDING - QUICKORDER  : ", jsonStore.getQuickOrder())
        setFormData(normalizeOrderFormDetails({ OrderType: OrderType, Contract: contract.ContractID, ContractDescription: contract.ContractDesc, Customer: contract.CustomerID, CustomerName: contract.CustomerName, Vendor: contract.VendorID, VendorName: contract.VendorName, Cluster: contract.ClusterLocation, ClusterLocationDesc: contract.ClusterLocationDesc, WBS: contract.WBS }));
      }
    } catch (err) {
      setError(`Error fetching API data for${err}`);
      console.log("ERROR IN COMBO DROPDOWN:: ", err);
      // jsonStore.setQuickOrderFields({ ContractID: "CON000000116", Customer: "C001", Vendor: "V001", Cluster: "CL01", WBS: "WBS123" });
      // setFormData(normalizeOrderFormDetails({ Customer: "C001", Vendor: "011909", Cluster: "CL01", WBS: "DE17BAS843" }))

      // setApiData(data);
      // setApiStatus('error');
    }
    finally {
      // setLoading(true);
      // if (apiStatus === 'loading') setApiStatus('success');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Utility to normalize keys from store to config field IDs
  function normalizeOrderFormDetails(data) {
    console.log("normalizeOrderFormDetails", data);
    // Generic helper to format a field with its name, fallback to '--' if name is empty/null
    function formatFieldWithName(id, name) {
      if (id) {
        if (name && name.trim() !== '') {
          return id + ' || ' + name;
        } else {
          return id + ' || --';
        }
      }
      return '';
    }

    return {
      OrderType: data.OrderType ? data.OrderType : '',
      QuickOrderDate: data.QuickOrderDate ? data.QuickOrderDate : '',
      // Contract: (data.Contract ? data.Contract : (data.ContractID ? data.ContractID : '')) + 
      //   ((data.Contract || data.ContractID) && data.ContractDescription ? ' || ' + data.ContractDescription : ''),
      Contract: formatFieldWithName(data.Contract, data.ContractDescription),
      Customer: formatFieldWithName(data.Customer, data.CustomerName),
      Vendor: formatFieldWithName(data.Vendor, data.VendorName),
      Cluster: formatFieldWithName(data.Cluster, data.ClusterLocationDesc),
      // Cluster: (data.Cluster ? data.Cluster : '') + (data.VendorName ? ' || ' + data.VendorName : ''),
      CustomerQuickOrderNo: data.CustomerQuickOrderNo ? data.CustomerQuickOrderNo : '',
      Customer_Supplier_RefNo: data.Customer_Supplier_RefNo ? data.Customer_Supplier_RefNo : '',
      Remark1: data.Remark1 ? data.Remark1 : '',
      Summary: data.Summary ? data.Summary : '',
      WBS: data.WBS ? data.WBS : '',
      QCUserDefined1: (() => {
        if (data.QCUserDefined1 && typeof data.QCUserDefined1 === "object") {
          return {
            input: data.QCUserDefined1.input ?? data.QCUserDefined1Value ?? "",
            dropdown: data.QCUserDefined1.dropdown ?? data.QCUserDefined1 ?? ""
          };
        }
        return {
          input: data.QCUserDefined1Value ?? "",
          dropdown: data.QCUserDefined1 ?? ""
        };
      })(),
      QCUserDefined2: (() => {
        if (data.QCUserDefined2 && typeof data.QCUserDefined2 === "object") {
          return {
            input: data.QCUserDefined2.input ?? data.QCUserDefined2Value ?? "",
            dropdown: data.QCUserDefined2.dropdown ?? data.QCUserDefined2 ?? ""
          };
        }
        return {
          input: data.QCUserDefined2Value ?? "",
          dropdown: data.QCUserDefined2 ?? ""
        };
      })(),
      QCUserDefined3: (() => {
        if (data.QCUserDefined3 && typeof data.QCUserDefined3 === "object") {
          return {
            input: data.QCUserDefined3.input ?? data.QCUserDefined3Value ?? "",
            dropdown: data.QCUserDefined3.dropdown ?? data.QCUserDefined3 ?? ""
          };
        }
        return {
          input: data.QCUserDefined3Value ?? "",
          dropdown: data.QCUserDefined3 ?? ""
        };
      })(),
      // QCUserDefined1: data.QCUserDefined1,
      // QCUserDefined2: data.QCUserDefined2,
      // QCUserDefined3: data.QCUserDefined3,
      // QCUserDefined1Value: data.QCUserDefined1Value,
      // QCUserDefined2Value: data.QCUserDefined2Value,
      // QCUserDefined3Value: data.QCUserDefined3Value,
      Remarks2: data.Remarks2 ? data.Remarks2 : '',
      Remarks3: data.Remarks3 ? data.Remarks3 : ''
    };

  }

  const orderDetailsRef = useRef<DynamicPanelRef>(null);

  useImperativeHandle(ref, () => ({
    getOrderValues: () => orderDetailsRef.current?.getFormValues() || {},
    doValidation: () => {
    return (
      orderDetailsRef.current?.doValidation() || {
        isValid: true,
        errors: {},
        mandatoryFieldsEmpty: [],
      }
    );
  },
  }));
  // const onSaveDetails = () => {
  //   const formValues = {
  //     QuickOrder: orderDetailsRef.current?.getFormValues() || {},
  //     // operationalDetails: moreInfoDetailsRef.current?.getFormValues() || {},
  //   };
  //   setFormData(formValues.QuickOrder);

  //   jsonStore.setQuickOrder({
  //     ...jsonStore.getJsonData().quickOrder,
  //     ...formValues.QuickOrder
  //   });

  //   const fullJson = jsonStore.getJsonData();
  //   console.log("FULL JSON :: ", fullJson);

  // }
  // Mock functions for user config management
  const getUserPanelConfig = (userId: string, panelId: string): PanelSettings | null => {
    const stored = localStorage.getItem(`panel-config-current-user-order-details`);
    console.log(`Retrieved config for panel order-details:`, stored);
    return stored ? JSON.parse(stored) : null;
  };

  const saveUserPanelConfig = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
    try {
      // Save to localStorage first
      localStorage.setItem(`panel-config-current-user-order-details`, JSON.stringify(settings));
      console.log(`Saved config for panel order-details:`, settings);
      console.log('====DYNAMIC PANEL SAVE CLICKED====');

      // Prepare the data to save to the API
      const preferencesToSave = settings;

      console.log('Saving OrderForm Panel preferences:', preferencesToSave);
      console.log('Panel Personalization ModeFlag:', panelPersonalizationModeFlag);

      const response = await quickOrderService.savePersonalization({
        LevelType: 'User',
        // LevelKey: 'ramcouser',
        ScreenName: 'CreateQuickOrder_OrderDetailsForm',
        ComponentName: 'panel-config-current-user-order-details',
        JsonData: preferencesToSave,
        IsActive: "1",
        ModeFlag: panelPersonalizationModeFlag
      });

      const apiData = response?.data;

      if (apiData) {
        const isSuccess = apiData?.IsSuccess;

        toast({
          title: isSuccess ? "✅ Panel Preferences Saved Successfully" : "⚠️ Error Saving Panel Preferences",
          description: apiData?.Message,
          variant: isSuccess ? "default" : "destructive",
        });

        // If save was successful and we were in Insert mode, switch to Update mode for future saves
        if (isSuccess && panelPersonalizationModeFlag === 'Insert') {
          setPanelPersonalizationModeFlag('Update');
        }
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Failed to save panel preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save panel preferences",
        variant: "destructive",
      });
    }
  };

  const parseDDMMYYYY = (dateStr) => {
    // Expects dateStr in 'DD/MM/YYYY'
    const [day, month, year] = dateStr.split('/').map(Number);
    // JS Date: months are 0-based
    return new Date(year, month - 1, day);
  }


  const [moreInfoTitle, setmoreInfoTitle] = useState('More Info');
  const initialMoreInfoDetails = normalizeMoreInfoDetails(jsonStore.getQuickOrder() || {});
  const [moreInfoData, setmoreInfoData] = useState(initialMoreInfoDetails);
  const [orderNo, setOrderNo] = useState('');
  // Utility to normalize MoreInfo details from store to config field IDs
  function normalizeMoreInfoDetails(data) {
    return {
      PrimaryDocTypeandNo: data.PrimaryDocTypeandNo,
      SecondaryDocTypeandNo: data.SecondaryDocTypeandNo,
      PrimaryDocDate: data.PrimaryDocDate,
      SecondaryDocDate: data.SecondaryDocDate,
      // WBS: data.WBS,
      // QCUserdefined2: data.QCUserdefined2,
      // QCUserdefined3: data.QCUserdefined3,
      // Remarks2: data.Remarks2,
      // Remarks3: data.Remarks3
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

  const [resourceGroupData, setResourceGroupData] = useState<any[]>([]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<any>(null);
  const [isResourceData, setIsResourceData] = useState(false);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [ResourceCount, setResourceCount] = useState(0);
  const [isResourceGroupOpen, setResourceGroupOpen] = useState(false);
  const [isResourceClosed, setIsResourceClosed] = useState(false);
  useEffect(() => {
    console.log("Inside USEEFFECT(1) ORDERFORM- ", isBack)
    const resourceGroups = jsonStore.getAllResourceGroups();
    setItems(resourceGroups || []);
    setResourceData(resourceGroups)
    console.log("resourceGroups = ", resourceGroups)
  }, [isResourceGroupOpen, isBack, isEditQuickOrder])
  useEffect(() => {
    console.log("INSIDE ORDER-FORM- USE Effect(2) ", jsonStore.getQuickOrder());
    const quickOrder = jsonStore.getQuickOrder();
    if (isEditQuickOrder && quickOrder && Object.keys(quickOrder).length > 0) {
      setOrderType(quickOrder.OrderType || 'BUY');
      setFormData(normalizeOrderFormDetails(quickOrder));
      // setOriginalData(quickOrder);
      setmoreInfoData(normalizeMoreInfoDetails(quickOrder)); // <-- This sets moreInfoData with store value
      setResourceCount(quickOrder.ResourceGroup?.length);
      const resourceGroups = jsonStore.getAllResourceGroups();
      console.log("+++111 GROUPS::::: ", resourceGroups);
      // setOrderType('BUY');
      // setFormData(normalizeOrderFormDetails(quickOrder));
      if (resourceGroups.length > 0) {
        // setIsResourceData(true);
        setResourceData(resourceGroups);
      }

    } else if (!isEditQuickOrder) {
      initializeJsonStore();
      const quickOrder = jsonStore.getQuickOrder();
      // setOrderType('BUY');
      setFormData(normalizeOrderFormDetails(quickOrder));
      setmoreInfoData(normalizeMoreInfoDetails(quickOrder));
      setResourceCount(quickOrder.ResourceGroup?.length);

    }
  }, [loading]);
  useEffect(() => {
    const resourceGroups = jsonStore.getAllResourceGroups();
    console.log("+++111 2GROUPS::::: ", resourceGroups);
    if (resourceGroups.length > 0) {
      setIsResourceData(true);
      setResourceData(resourceGroups);
    }
    if (isEditQuickOrder) {
      // setTimeout(() => {
      // openResourceGroupGetID();
      // }, 3000)
    }
  }, [isResourceData, isResourceGroupOpen]);
  
  // This effect ensures Resource Group Details remain visible after confirm button click
  useEffect(() => {
    const checkAndUpdateResourceData = () => {
      const resourceGroups = jsonStore.getAllResourceGroups();
      if (resourceGroups && resourceGroups.length > 0) {
        setIsResourceData(true);
        setResourceCount(resourceGroups.length);
        setResourceData(resourceGroups);
      }
    };
    
    // Run immediately and set up an interval to check periodically
    checkAndUpdateResourceData();
    const intervalId = setInterval(checkAndUpdateResourceData, 500);
    // alert("intervalId "+intervalId)
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const closeResource = () => {
    console.log("ON CLOSE calledd")
    setResourceGroupOpen(false);
    setIsBack(true);
    setIsResourceClosed(true);
    const resourceGroups = jsonStore.getAllResourceGroups();
    console.log("ORDER FORM--RESOURCE GROUPS::::: ", resourceGroups);
    const quickOrder = jsonStore.getQuickOrder();
    // setOrderType('BUY');
    // console.log("+++111 3GROUPS::::: ", resourceGroups);
    setFormData(normalizeOrderFormDetails(quickOrder));
    if (resourceGroups.length > 0) {
      setIsResourceData(true);
      setResourceCount(resourceGroups.length);
      setResourceData(resourceGroups);
      const buttons = document.querySelectorAll('footer div button');

      // Find the one whose text is "Confirm"
      const confirmButton = Array.from(buttons).find(
        (btn) => btn.textContent.trim() === 'Confirm'
      );
      const saveButton = Array.from(buttons).find(
        (btn) => btn.textContent.trim() === 'Save'
      );
      const cancelButton = Array.from(buttons).find(
        (btn) => btn.textContent.trim() === 'Cancel'
      );

      // Enable it and add click listener
      if (confirmButton && confirmButton instanceof HTMLButtonElement) {
        console.log("Inside confirmButton : ", confirmButton)
        confirmButton.disabled = false;
        
        
        // Add click event listener if not already added
        const handleConfirmClick = () => {
          console.log("Confirm button clicked from OrderForm");
          onConfirm();
        };
        
        confirmButton.addEventListener('click', handleConfirmClick);
      }
      if (saveButton && saveButton instanceof HTMLButtonElement) {
        console.log("Inside saveButton : ", saveButton)
        saveButton.disabled = false;
      
        // Add click event listener if not already added
        const handleSaveClick = () => {
          console.log("Save button clicked from OrderForm");
          onSaveDraft();
        };
        
        saveButton.addEventListener('click', handleSaveClick);
      }
        
        // Enable Cancel button and add handler

        if (cancelButton && cancelButton instanceof HTMLButtonElement) {
          cancelButton.disabled = false;
          const handleCancelClick = () => {
            console.log("Cancel button clicked from OrderForm");
            onCancel(); // <-- Call your parent-provided handler
          };
          cancelButton.addEventListener('click', handleCancelClick);
        }
      
    }
  }

  // Validation state
  const [validationResults, setValidationResults] = useState<Record<string, { isValid: boolean; errors: Record<string, string>; mandatoryFieldsEmpty: string[] }>>({});
  const { toast } = useToast();

  // Get form values from all panels
  const handleGetAllFormValues = () => {
    const allFormValues: Record<string, any> = {};

    if (orderDetailsRef.current) {
      allFormValues.basicDetails = orderDetailsRef.current.getFormValues();
    }
    console.log('All Form Values:', allFormValues);

    toast({
      title: "Form Values Retrieved",
      description: "Check the console for all form values.",
      variant: "default",
    });

    return allFormValues;
  };

  const openResourceGroup = async () => {
    const isValid = handleValidateAllPanels();
    if (isValid) {
      // const formValuesValidation = handleGetAllFormValues();
      console.log("formValuesValidation ===", orderDetailsRef.current?.getFormValues());
      const formValuesRaw = orderDetailsRef.current?.getFormValues() || {};

      // Helper function to truncate at '||'
      const truncateAtPipe = (val: any) => {
        if (typeof val === 'string' && val.includes('||')) {
          return val.split('||')[0].trim();
        }
        return val;
      };

      // List of fields to truncate
      const fieldsToTruncate = [
        "Contract",
        "Customer",
        "Vendor",
        "Cluster"
      ];

      // Create a new object with truncated values
      const formValues = {
        QuickOrder: {
          ...formValuesRaw,
          ...fieldsToTruncate.reduce((acc, key) => {
            if (formValuesRaw[key]) {
              acc[key] = truncateAtPipe(formValuesRaw[key]);
            }
            return acc;
          }, {} as Record<string, any>)
        },
        // operationalDetails: moreInfoDetailsRef.current?.getFormValues() || {},
      };

      console.log("FORM VALUES : ", formValues);
      setFormData(formValues.QuickOrder);
      console.log("FORM VALUES : ", formValues.QuickOrder);

      jsonStore.setQuickOrder({
        ...jsonStore.getJsonData().quickOrder,
        ...formValues.QuickOrder,
        "ModeFlag": "Insert",
        "Status": "Fresh",
        "QuickUniqueID": -1,
        "QuickOrderNo": "",
        "QCUserDefined1": formValues.QuickOrder?.QCUserDefined1?.dropdown,
        "QCUserDefined1Value": formValues.QuickOrder?.QCUserDefined1?.input,
        "QCUserDefined2": formValues.QuickOrder?.QCUserDefined2?.dropdown,
        "QCUserDefined2Value": formValues.QuickOrder?.QCUserDefined2?.input,
        "QCUserDefined3": formValues.QuickOrder?.QCUserDefined3?.dropdown,
        "QCUserDefined3Value": formValues.QuickOrder?.QCUserDefined3?.input,
        // "QuickOrderDate":quickOrderDate
      });

      const fullJson = jsonStore.getJsonData();
      console.log("FULL JSON :: ", fullJson);

      try {
        //  Update resource
        const res: any = await quickOrderService.updateQuickOrderResource(fullJson.ResponseResult.QuickOrder);
        console.log("updateQuickOrderResource result:", res);
        const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
        const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
        console.log("response ===", resourceStatus);
        //  Get OrderNumber from response

        const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
        console.log("OrderNumber:", OrderNumber);
        jsonStore.setQuickUniqueID(OrderNumber);
        setResourceGroupOpen(true);

        // //  Fetch the full quick order details
        //   quickOrderService.getQuickOrder(OrderNumber).then((fetchRes: any) => {
        //     console.log("fetchRes:: ", fetchRes);
        //     let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
        //     console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
        //     console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
        //     jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        //     const fullJson2 = jsonStore.getJsonData();
        //     console.log("FULL JSON 33:: ", fullJson2);
        //     setResourceCount(fullJson2.ResponseResult?.QuickOrder?.ResourceGroup?.length);
        //     console.log("RESOURCE COUNT:: ", fullJson2.ResponseResult?.QuickOrder?.ResourceGroup?.length);
        //   })
        //   //  Update your store or state with the fetched data
        //   if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
        //     toast({
        //       title: "✅ Form submitted successfully",
        //       description: "Your changes have been saved.",
        //       variant: "default", // or "success" if you have custom variant
        //     });
        //     onOrderCreated?.();
        //     setResourceGroupOpen(true);
        //   }else{
        //     // Remove the latest added resource group with ResourceUniqueID: -1 on API error
        //     let resourceGroups = jsonStore.getQuickOrder().ResourceGroup || [];
        //     // Filter out the resource with ResourceUniqueID: -1
        //     console.log("resourceGroups ---", resourceGroups);
        //     resourceGroups = resourceGroups.filter((rg: any) => rg.ResourceUniqueID !== -1);
        //     // Update the quick order in the store
        //     jsonStore.setQuickOrder({
        //       ...jsonStore.getQuickOrder(),
        //       ResourceGroup: resourceGroups
        //     });
        //     const fullJsonElse = jsonStore.getQuickOrder();
        //     console.log("Else error :: ", fullJsonElse);
        //     // console.log("---------------", JSON.parse(res?.data));
        //     toast({
        //       title: "⚠️ Submission failed",
        //       // description: JSON.parse(res?.data?.Message),
        //       description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
        //       // description: JSON.parse(res?.data?.ResponseData)[0].Error_msg,
        //       variant: "destructive", // or "success" if you have custom variant
        //     });
        //   }

      } catch (err) {
        console.log("CATCH :: ", err);
        setError(`Error fetching API data for resource group`);
        toast({
          title: "⚠️ Submission failed",
          description: JSON.parse(err?.data?.Message),
          // description: err.response.data.description,
          variant: "destructive", // or "error"
        });
      }
      finally {
        // toast({
        //   title: "✅ Form submitted successfully",
        //   description: "Your changes have been saved.",
        //   variant: "default", // or "success" if you have custom variant
        // });

      }
    } else {
      toast({
        title: "⚠️ Required fields missing",
        description: `Please enter required fields`,
        variant: "destructive",
      });
    }
  }

  const handleValidateAllPanels = () => {
    const results: Record<string, { isValid: boolean; errors: Record<string, string>; mandatoryFieldsEmpty: string[] }> = {};
    let overallValid = true;
    let totalErrors = 0;

    // Validate Basic Details
    if (orderDetailsRef.current) {
      const orderFormValidation = orderDetailsRef.current.doValidation();
      results['Order Details'] = orderFormValidation;
      if (!orderFormValidation.isValid) {
        overallValid = false;
        totalErrors += Object.keys(orderFormValidation.errors).length;
      }
    }
    console.log("validation data");
    setValidationResults(results);

    // Show toast notification
    // if (overallValid) {
    //   toast({
    //     title: "Validation Successful",
    //     description: "All mandatory fields are filled and valid.",
    //     variant: "default",
    //   });
    // } else {
    //   toast({
    //     title: "Validation Failed",
    //     description: `${totalErrors} validation error(s) found. Please check the highlighted fields.`,
    //     variant: "destructive",
    //   });
    // }

    return overallValid;
  };

  // function markUpdatedObjects(original: any, updated: any): any {
  //   if (!original || !updated) return updated;

  //   console.log("original: ", original);
  //   console.log("updated: ", updated);
  //   // Clone updated object so we don’t mutate state directly
  //   const result = JSON.parse(JSON.stringify(updated));

  //   if (Array.isArray(original) && Array.isArray(updated)) {
  //     return updated.map((item, index) => {
  //       return markUpdatedObjects(original[index], item);
  //     });
  //   }

  //   if (typeof original === "object" && typeof updated === "object") {
  //     // Check if ResourceGroup (or similar object with ModeFlag)
  //     if (updated.ResourceUniqueID && updated.ModeFlag) {
  //       const isChanged = JSON.stringify(original) !== JSON.stringify(updated);
  //       result.ModeFlag = isChanged ? "Update" : "NoChange";
  //     }

  //     // Recursively check children
  //     Object.keys(updated).forEach((key) => {
  //       if (typeof updated[key] === "object") {
  //         result[key] = markUpdatedObjects(original[key], updated[key]);
  //       }
  //     });
  //   }
  //   console.log("result ", result);
  //   return result;
  // }

  const openResourceGroupGetID = async () => {
    // setLoading(false);
    console.log("OrderType ---", OrderType);
    console.log("contractId ---", jsonStore.getQuickOrder());
    try {
      const data: any = await quickOrderService.getCommonComboData({ messageType: "ContractID Selection", contractId: jsonStore.getQuickOrder().Contract, type: OrderType });
      console.log("COMBO DROPDOWN DATA", data);
      console.log("ORDERTYPE :", OrderType);
      // setContracts(JSON.parse(data?.data?.ResponseData));
      let parsedData: any = {};
      let contract: any = {};
      if (data?.data?.ResponseData) {
        parsedData = JSON.parse(data?.data?.ResponseData);
        contract = parsedData;
        // Set ContractTariff array in jsonStore for global access
        if (parsedData && parsedData.ContractTariff) {
          jsonStore.setContractTariffList(parsedData.ContractTariff);
        }

        console.log("CONTRACT DATA:: ", contract);
        if (contract) {
          setOrderType(OrderType)
          // const formatted = formatDateToYYYYMMDD("2023-08-31T00:00:00"); // "2023-08-31"
          // setQuickOrderDate(formatDateToYYYYMMDD(contract.ValidFrom) )
          jsonStore.setQuickOrderFields({ OrderType: OrderType, Contract: contract.ContractID, ContractDescription: contract.ContractDesc, Customer: contract.CustomerID, Vendor: contract.VendorID, VendorName: contract.VendorName, Cluster: contract.ClusterLocation, ClusterLocationDesc: contract.ClusterLocationDesc, WBS: contract.WBS, Currency: contract.Currency });
          jsonStore.setResourceGroupFields({ OperationalLocation: contract.Location });
          const additionalInfo = contract.ContractTariff;
          jsonStore.setResourceType({ Resource: additionalInfo[0].Resource, ResourceDescription: additionalInfo[0].ResourceDescription, ResourceType: additionalInfo[0].ResourceType, ResourceTypeDescription: additionalInfo[0].ResourceTypeDescription })
          jsonStore.setTariffFields({
            tariff: additionalInfo[0].TariffID,
            tariffDescription: additionalInfo[0].TariffDescription,
            // For dropdown binding as "id || description"
            // tariff: additionalInfo[0].TariffID && additionalInfo[0].TariffDescription
            //   ? `${additionalInfo[0].TariffID} || ${additionalInfo[0].TariffDescription}`
            //   : (additionalInfo[0].TariffID || additionalInfo[0].TariffDescription || ""),
            contractPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
            unitPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
            // netAmount: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
            tariffType: additionalInfo[0].TariffType ? additionalInfo[0].TariffType : "",
            tariffTypeDescription: additionalInfo[0].TariffTypeDescription ? additionalInfo[0].TariffTypeDescription : "",
            // billToID: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
            // draftBillNo: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
          });
          // jsonStore.setTariffDateFields({
          //   fromDate: additionalInfo[0].ContractTariffValidFrom
          //     ? additionalInfo[0].ContractTariffValidFrom.split("T")[0]
          //     : "",
          //   toDate: additionalInfo[0].ContractTariffValidTo
          //     ? additionalInfo[0].ContractTariffValidTo.split("T")[0]
          //     : "",
          // });
          // Set ValidFrom and ValidTo in jsonStore using a new set method

          console.log("AFTER DATA BINDING - RESOURCEGROUP  : ", jsonStore.getResourceJsonData())
          console.log("AFTER DATA BINDING - QUICKORDER  : ", jsonStore.getQuickOrder())

        }
      }
      const quickOrderData = jsonStore.getQuickOrder();
      console.log("quickOrderData +++ :", quickOrderData);
      jsonStore.setQuickOrderFields({
        OrderType: quickOrderData.OrderType ?? "",
        Contract: quickOrderData.ContractID ?? "",
        ContractDescription: quickOrderData.ContractDesc ?? "",
        Customer: quickOrderData.CustomerID ?? quickOrderData.Customer ?? "",
        Vendor: quickOrderData.VendorID ?? quickOrderData.Vendor ?? "",
        VendorName: quickOrderData.VendorName ?? quickOrderData.VendorName ?? "",
        Cluster: quickOrderData.ClusterLocation ?? quickOrderData.Cluster ?? "",
        ClusterLocationDesc: quickOrderData.ClusterLocationDesc ?? quickOrderData.ClusterLocationDesc ?? "",
        WBS: quickOrderData.WBS ?? "",
        Currency: quickOrderData.Currency ?? "",
        QuickOrderDate: quickOrderData.QuickOrderDate ? formatDateToYYYYMMDD(quickOrderData.QuickOrderDate) : "",
        Summary: quickOrderData.Summary ?? "",
        Remark1: quickOrderData.Remark1 ?? "",
        Remarks2: quickOrderData.Remarks2 ?? "",
        Remarks3: quickOrderData.Remarks3 ?? "",

        QCUserDefined1: (() => {
          if (quickOrderData.QCUserDefined1 && typeof quickOrderData.QCUserDefined1 === "object") {
            return {
              input: quickOrderData.QCUserDefined1.input ?? quickOrderData.QCUserDefined1Value ?? "",
              dropdown: quickOrderData.QCUserDefined1.dropdown ?? quickOrderData.QCUserDefined1 ?? ""
            };
          }
          return {
            input: quickOrderData.QCUserDefined1Value ?? "",
            dropdown: quickOrderData.QCUserDefined1 ?? ""
          };
        })(),
        QCUserDefined2: (() => {
          if (quickOrderData.QCUserDefined2 && typeof quickOrderData.QCUserDefined2 === "object") {
            return {
              input: quickOrderData.QCUserDefined2.input ?? quickOrderData.QCUserDefined2Value ?? "",
              dropdown: quickOrderData.QCUserDefined2.dropdown ?? quickOrderData.QCUserDefined2 ?? ""
            };
          }
          return {
            input: quickOrderData.QCUserDefined2Value ?? "",
            dropdown: quickOrderData.QCUserDefined2 ?? ""
          };
        })(),
        QCUserDefined3: (() => {
          if (quickOrderData.QCUserDefined3 && typeof quickOrderData.QCUserDefined3 === "object") {
            return {
              input: quickOrderData.QCUserDefined3.input ?? quickOrderData.QCUserDefined3Value ?? "",
              dropdown: quickOrderData.QCUserDefined3.dropdown ?? quickOrderData.QCUserDefined3 ?? ""
            };
          }
          return {
            input: quickOrderData.QCUserDefined3Value ?? "",
            dropdown: quickOrderData.QCUserDefined3 ?? ""
          };
        })(),

      });

      // Update formData state instead of using orderDetailsRef.setFormValues
      // This ensures the form is properly controlled by the state
      console.log("Updating formData state with API data", quickOrderData);
      setFormData(normalizeOrderFormDetails(quickOrderData));

      setLoading(true);
    } catch (err) {
      setError(`Error fetching API data for${err}`);
      console.log("ERROR IN COMBO DROPDOWN:: ", err);
      // jsonStore.setQuickOrderFields({ ContractID: "CON000000116", Customer: "C001", Vendor: "V001", Cluster: "CL01", WBS: "WBS123" });
      setFormData(normalizeOrderFormDetails({ Customer: "C001", Vendor: "011909", Cluster: "CL01", WBS: "DE17BAS843" }))

      // setApiData(data);
    }
    finally {
      // setLoading(true);
    }
  }

  const openUpdateResourceGroup = async () => {
    const currentStatus = jsonStore.getQuickOrder()?.Status;
    if (currentStatus === 'Confirmed') {
      toast({
        title: "Cannot add resource group",
        description: "Cannot add more resource group after confirmation.",
        variant: "destructive",
      });
      return;
    }
    openResourceGroupGetID();
    setTimeout(() => {
      setResourceGroupOpen(true);
    }, 500);
    // const isValid = handleValidateAllPanels();
    // // if (isValid) {
    //   const formValuesRaw = orderDetailsRef.current?.getFormValues() || {};

    //   // Helper function to truncate at '||'
    //   const truncateAtPipe = (val: any) => {
    //     if (typeof val === 'string' && val.includes('||')) {
    //       return val.split('||')[0].trim();
    //     }
    //     return val;
    //   };

    //   // List of fields to truncate
    //   const fieldsToTruncate = [
    //     "Contract",
    //     "Customer",
    //     "Vendor",
    //     "Cluster"
    //   ];

    //   // Create a new object with truncated values
    //   const formValues = {
    //     QuickOrder: {
    //       ...formValuesRaw,
    //       ...fieldsToTruncate.reduce((acc, key) => {
    //         if (formValuesRaw[key]) {
    //           acc[key] = truncateAtPipe(formValuesRaw[key]);
    //         }
    //         return acc;
    //       }, {} as Record<string, any>)
    //     },
    //     // operationalDetails: moreInfoDetailsRef.current?.getFormValues() || {},
    //   };

    //   console.log("FORM VALUES : ",formValues)
    //   setFormData(formValues.QuickOrder);
    //   console.log("FORM VALUES : ",formValues.QuickOrder);

    //   jsonStore.setQuickOrder({
    //     ...jsonStore.getJsonData().quickOrder,
    //     ...formValues.QuickOrder,
    //     "ModeFlag": "Update",
    //     // "QuickOrderNo": jsonStore.getQuickUniqueID(),
    //     // "Status": "Fresh",
    //     // "QuickUniqueID": -1,
    //     // "QuickOrderNo": "",
    //     "QCUserDefined1": formValues.QuickOrder?.QCUserDefined1?.dropdown,
    //     "QCUserDefined1Value": formValues.QuickOrder?.QCUserDefined1?.input,
    //     "QCUserDefined2": formValues.QuickOrder?.QCUserDefined2?.dropdown,
    //     "QCUserDefined2Value": formValues.QuickOrder?.QCUserDefined2?.input,
    //     "QCUserDefined3": formValues.QuickOrder?.QCUserDefined3?.dropdown,
    //     "QCUserDefined3Value": formValues.QuickOrder?.QCUserDefined3?.input,
    //     // "QuickOrderDate":quickOrderDate
    //   });

    //   const fullJson = jsonStore.getJsonData();
    //   console.log("FULL JSON :: ", fullJson);
    // try {
    //   //  Update resource
    //   const res: any = await quickOrderService.updateQuickOrderResource(fullJson.ResponseResult.QuickOrder);
    //   console.log("updateQuickOrderResource result:", res);
    //   const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
    //   const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
    //   if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
    //     toast({
    //       title: "✅ Form submitted successfully",
    //       description: "Your changes have been saved.",
    //       variant: "default", // or "success" if you have custom variant
    //     });
    //     setResourceGroupOpen(true);
    //   }else{
    //     toast({
    //       title: "⚠️ Submission failed",
    //       description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
    //       variant: "destructive", // or "success" if you have custom variant
    //     });
    //   }

    //   //  Get OrderNumber from response
    //   const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
    //   console.log("OrderNumber:", OrderNumber);

    //   //  Fetch the full quick order details
    //   quickOrderService.getQuickOrder(OrderNumber).then((fetchRes: any) => {
    //     console.log("fetchRes:: ", fetchRes);
    //     let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
    //     console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
    //     console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
    //     jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
    //     const fullJson2 = jsonStore.getJsonData();
    //     console.log("FULL JSON 33:: ", fullJson2);
    //     setResourceCount(fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
    //     console.log("RESOURCE COUNT:: ", fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
    //   })
    //   //  Update your store or state with the fetched data

    // } catch (err) {
    //   console.log("CATCH :: ", err);
    //   setError(`Error fetching API data for resource group`);
    //   toast({
    //     title: "⚠️ Submission failed",
    //     description: JSON.parse(err?.data?.Message),
    //     variant: "destructive", // or "error"
    //   });
    // }
    // finally {
    //   // toast({
    //   //   title: "✅ Form submitted successfully",
    //   //   description: "Your changes have been saved.",
    //   //   variant: "default", // or "success" if you have custom variant
    //   // });
    //   // openResourceGroupGetID();

    // }
    // } else {
    //   toast({
    //     title: "⚠️ Required fields missing",
    //     description: `Please enter required fields`,
    //     variant: "destructive",
    //   });
    // }
  }

  // const onBadgeChange = async (fieldId: string, newValue: string) => {
  //   console.log(`onBadgeChange in OrderForm - Field: ${fieldId}, Value: ${newValue}`);
  //   // Implement logic to update state/store based on fieldId and newValue
  //   // if (fieldId === "Order Details") { // Assuming "Order Details" is the panelId for the QuickOrderNo badge
  //   //   // Here you would update the QuickOrderNo in your formData or jsonStore
  //   //   // For example:
  //   //   jsonStore.setQuickOrder({ QuickOrderNo: newValue });
  //   //   setFormData(prev => ({ ...prev, QuickOrderNo: newValue }));
  //   // }
  //   //  Fetch the full quick order details
  //   quickOrderService.getQuickOrder(newValue).then((fetchRes: any) => {
  //     console.log("fetchRes:: ", fetchRes);
  //     let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
  //     console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
  //     console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
  //     jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
  //     const fullJson2 = jsonStore.getJsonData();
  //     console.log("FULL JSON 33:: ", fullJson2);
  //     setResourceCount(fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
  //     console.log("RESOURCE COUNT:: ", fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
  //   })
  //   console.log("onBadgeChange ===");
  //   // You might also want to trigger a save or update other parts of the form
  // }

  const loadResourceGroupData = async () => {
    const resourceGroups = jsonStore.getAllResourceGroups();
    console.log("loadResourceGroupData GROUPS::::: ", resourceGroups);
    const quickOrder = jsonStore.getQuickOrder();
    console.log("loadResourceGroupData ::::: ", quickOrder);
  }

  // Handle delete resource group from CardDetails
  const handleDeleteResourceGroup = async (item: any) => {
    console.log("Delete resource group data received in OrderForm:", item);

    // Set the resource to delete and open confirmation modal
    setResourceToDelete(item);
    setDeleteModalOpen(true);
  }

  // Confirm delete resource group
  const confirmDeleteResourceGroup = async () => {
    if (!resourceToDelete) return;

    const item = resourceToDelete;
    // Here you can implement the actual deletion logic
    // For example, call an API to delete the resource group
    console.log("Proceeding with deletion for ResourceUniqueID:", item.ResourceUniqueID);
    console.log("json data====", jsonStore.getQuickOrder());
    // Remove the resource group with item.ResourceUniqueID from the QuickOrder in jsonStore
    // const quickOrder = jsonStore.getQuickOrder();
    // if (quickOrder && Array.isArray(quickOrder.ResourceGroup)) {
    //   const updatedResourceGroups = quickOrder.ResourceGroup.filter(
    //     (rg: any) => rg.ResourceUniqueID !== item.ResourceUniqueID
    //   );
    //   // Update the QuickOrder in the store
    //   jsonStore.setQuickOrder({
    //     ...quickOrder,
    //     ModeFlag: "NoChange",
    //     ResourceGroup: updatedResourceGroups,
    //   });
    //   setResourceData(updatedResourceGroups);
    //   setResourceCount(updatedResourceGroups.length);
    // } 

    // Remove the resource group with item.ResourceUniqueID from the QuickOrder in jsonStore
    const quickOrder = jsonStore.getQuickOrder();
    if (quickOrder && Array.isArray(quickOrder.ResourceGroup)) {
      const updatedResourceGroups = quickOrder.ResourceGroup.map(
        (rg: any) => {
          if (rg.ResourceUniqueID === item.ResourceUniqueID) {
            // Instead of removing, set ModeFlag and ResourceStatus
            return {
              ...rg,
              ModeFlag: "Update",
              ResourceStatus: "Cancelled"
            };
          }
          return rg;
        }
      );
      // Update the QuickOrder in the store
      jsonStore.setQuickOrder({
        ...quickOrder,
        ResourceGroup: updatedResourceGroups,
      });
      setResourceData(updatedResourceGroups);
      setResourceCount(updatedResourceGroups.length);
    }

    console.log("json data after====", jsonStore.getQuickOrder());
    const fullJson = jsonStore.getQuickOrder();
    console.log("fullJson ===", fullJson);
    try {
      setApiStatus('loading');
      //  Update resource
      const res: any = await quickOrderService.updateQuickOrderResource(fullJson);
      console.log("updateQuickOrderResource result:", res);
      const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
      const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
      console.log("response ===", resourceStatus);
      //  Get OrderNumber from response
      const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
      console.log("OrderNumber:", OrderNumber);

      //  Fetch the full quick order details
      quickOrderService.getQuickOrder(OrderNumber).then((fetchRes: any) => {
        console.log("fetchRes:: ", fetchRes);
        let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
        console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
        console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
        jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        const fullJson2 = jsonStore.getJsonData();
        console.log("FULL JSON 33:: ", fullJson2);
        setResourceCount(fullJson2.ResponseResult?.QuickOrder?.ResourceGroup?.length);
        console.log("RESOURCE COUNT:: ", fullJson2.ResponseResult?.QuickOrder?.ResourceGroup?.length);
        console.log("OrderForm: data Copy changed", jsonStore.getAllResourceGroups());
        const resourceGroups = jsonStore.getAllResourceGroups();
        setResourceData(resourceGroups || []);
        setApiStatus('success');
      })
      //  Update your store or state with the fetched data
      if (resourceStatus === "Success" || resourceStatus === "SUCCESS") {
        toast({
          title: "✅ Form submitted successfully",
          description: "Your changes have been saved.",
          variant: "default", // or "success" if you have custom variant
        });
        onOrderCreated?.();
        // setResourceGroupOpen(true);
      } else {
        toast({
          title: "⚠️ Submission failed",
          // description: JSON.parse(res?.data?.Message),
          description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
          // description: JSON.parse(res?.data?.ResponseData)[0].Error_msg,
          variant: "destructive", // or "success" if you have custom variant
        });
      }

    } catch (err) {
      console.log("CATCH :: ", err);
      setError(`Error fetching API data for resource group`);
      toast({
        title: "⚠️ Submission failed",
        description: JSON.parse(err?.data?.Message),
        // description: err.response.data.description,
        variant: "destructive", // or "error"
      });
      setApiStatus('error');
    }
    finally {
    }

    // Close modal and reset state
    setDeleteModalOpen(false);
    setResourceToDelete(null);
  }

  // Cancel delete resource group
  const cancelDeleteResourceGroup = () => {
    setDeleteModalOpen(false);
    setResourceToDelete(null);
  }

  const handleCopyResourceGroup = async (item: any) => {
    console.log("handleCopyResourceGroup", item);

    const quickOrder = jsonStore.getQuickOrder();
    const resourceGroups = Array.isArray(quickOrder?.ResourceGroup) ? quickOrder.ResourceGroup : [];

    // Deep clone to avoid accidental reference sharing
    const cloned: any = JSON.parse(JSON.stringify(item));

    // Reset identifiers and flags for a fresh insert
    cloned.ResourceUniqueID = -1;
    cloned.ModeFlag = "Insert";
    cloned.ResourceStatus = "Fresh"
    // Set BillingDetails fields to null
    cloned.BillingDetails = {
      ...cloned.BillingDetails,
      DraftBillNo: null,
      DraftBillStatusCode: null,
      DraftBillStatus: null,
      InvoiceNo: null,
      InvoiceStatusCode: null,
      InvoiceStatus: null,
      InternalOrderNo: null,
    };

    // Set MoreRefDocs fields to null
    cloned.MoreRefDocs = {
      PrimaryDocType: null,
      PrimaryDocNo: null,
      PrimaryDocDate: null,
      SecondaryDocType: null,
      SecondaryDocNo: null,
      SecondaryDocDate: null,
      AddtionalMoreRefDocs: null
    };

    cloned.Attachments = null;

    // Optional: clear child identifiers if present to avoid collisions
    if (Array.isArray(cloned.PlanDetails)) {
      cloned.PlanDetails = cloned.PlanDetails.map((p: any) => ({ ...p, PlanLineUniqueID: -1, ModeFlag: "Insert" }));
    }
    if (Array.isArray(cloned.ActualDetails)) {
      cloned.ActualDetails = cloned.ActualDetails.map((a: any) => ({ ...a, ActualLineUniqueID: -1, ModeFlag: "Insert" }));
    }

    // Push cloned resource group
    const updatedResourceGroups = [...resourceGroups, cloned];

    jsonStore.setQuickOrder({
      ...quickOrder,
      // ModeFlag: "Update",
      AmendNo: 0,
      AmendReasonCode: null,
      AmendReasonDescription: null,
      AmendmentHistory: null,
      Attachments: null,
      ResourceGroup: updatedResourceGroups,
    });

    setResourceData(updatedResourceGroups);
    setResourceCount(updatedResourceGroups.length);
    console.log("full json----", jsonStore.getQuickOrder());
    const fullJson = jsonStore.getQuickOrder();

    try {
      //  Update resource
      const res: any = await quickOrderService.updateQuickOrderResource(fullJson);
      console.log("updateQuickOrderResource result:", res);
      const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
      const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
      console.log("response ===", resourceStatus);
      //  Get OrderNumber from response
      const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
      console.log("OrderNumber:", OrderNumber);

      //  Fetch the full quick order details
      quickOrderService.getQuickOrder(OrderNumber).then((fetchRes: any) => {
        console.log("fetchRes:: ", fetchRes);
        let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
        console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
        console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
        jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        const fullJson2 = jsonStore.getJsonData();
        console.log("FULL JSON 33:: ", fullJson2);
        setResourceCount(fullJson2.ResponseResult?.QuickOrder?.ResourceGroup?.length);
        console.log("RESOURCE COUNT:: ", fullJson2.ResponseResult?.QuickOrder?.ResourceGroup?.length);
        console.log("OrderForm: data Copy changed", jsonStore.getAllResourceGroups());
        const resourceGroups = jsonStore.getAllResourceGroups();
        setResourceData(resourceGroups || []);
      })
      //  Update your store or state with the fetched data
      if (resourceStatus === "Success" || resourceStatus === "SUCCESS") {
        toast({
          title: "✅ Form submitted successfully",
          description: "Your changes have been saved.",
          variant: "default", // or "success" if you have custom variant
        });
        onOrderCreated?.();
        // setResourceGroupOpen(true);
      } else {
        toast({
          title: "⚠️ Submission failed",
          // description: JSON.parse(res?.data?.Message),
          description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
          // description: JSON.parse(res?.data?.ResponseData)[0].Error_msg,
          variant: "destructive", // or "success" if you have custom variant
        });
      }

    } catch (err) {
      console.log("CATCH :: ", err);
      setError(`Error fetching API data for resource group`);
      toast({
        title: "⚠️ Submission failed",
        description: JSON.parse(err?.data?.Message),
        // description: err.response.data.description,
        variant: "destructive", // or "error"
      });
    }
    finally {
    }

  }

  const copyQuickOrderDetails = async () => {
    const quickOrderData = jsonStore.getQuickOrder();
    console.log("copyQuickOrderDetails - Original data:", quickOrderData);

    // Deep clone the data to avoid mutations
    console.log("SELECTED RG =",resourceGroupData)
    const clonedData = JSON.parse(JSON.stringify(quickOrderData));
    console.log(" clonedData.ResourceGroup = ", clonedData.ResourceGroup)
    // Update QuickOrder level fields
    clonedData.QuickUniqueID = -1;
    clonedData.ModeFlag = "Insert";
    clonedData.QuickOrderNo = null;
    clonedData.AmendmentHistory = null;
    clonedData.Attachments = null;
    clonedData.AmendNo = 0;
    clonedData.AmendReasonCode = null;
    clonedData.AmendReasonDescription = null;
    clonedData.CanceReasonCode = null;
    clonedData.CanceReasonDescription = null;
    clonedData.Status = "Fresh";

    // Update ResourceGroup fields
    // if (Array.isArray(clonedData.ResourceGroup)) { // while copying, unselected resourceGroup also getting copied
    if (Array.isArray(resourceGroupData)) {
      clonedData.ResourceGroup = resourceGroupData.map((resource: any) => {
        // Update ResourceGroup level fields
        resource.ResourceUniqueID = -1;
        resource.ModeFlag = "Insert";
        resource.Attachments = null;
        resource.ResourceStatus = "Fresh";
        // Update BillingDetails
        resource.BillingDetails = {
          ...resource.BillingDetails,
          DraftBillNo: null,
          DraftBillStatusCode: null,
          DraftBillStatus: null,
          InvoiceNo: null,
          InvoiceStatusCode: null,
          InvoiceStatus: null,
          IsDraftBillFailed: null,
          DraftBillFailedReason: null,
          InternalOrderNo: null
        };

        // Update MoreRefDocs
        resource.MoreRefDocs = {
          PrimaryDocType: null,
          PrimaryDocNo: null,
          PrimaryDocDate: null,
          SecondaryDocType: null,
          SecondaryDocNo: null,
          SecondaryDocDate: null,
          AddtionalMoreRefDocs: null
        };

        // Update PlanDetails
        if (Array.isArray(resource.PlanDetails)) {
          resource.PlanDetails = resource.PlanDetails.map((plan: any) => ({
            ...plan,
            PlanLineUniqueID: -1,
            ModeFlag: "Insert"
          }));
        }

        // Update ActualDetails
        if (Array.isArray(resource.ActualDetails)) {
          resource.ActualDetails = resource.ActualDetails.map((actual: any) => ({
            ...actual,
            ActualLineUniqueID: -1,
            ModeFlag: "Insert"
          }));
        }

        return resource;
      });
    }

    console.log("copyQuickOrderDetails - Updated data:", clonedData);

    // Update the store with modified data
    jsonStore.setQuickOrder(clonedData);
    console.log("Updated data:", jsonStore.getQuickOrder());
    const fullJson = jsonStore.getQuickOrder();

    // setApiStatus('loading');
    const res: any = await quickOrderService.updateQuickOrderResource(fullJson);
    console.log("updateQuickOrderResource result:", res);
    const resourceStatus = JSON.parse(res?.data?.ResponseData)[0].Status;
    const isSuccessStatus = JSON.parse(res?.data?.IsSuccess);
    console.log("response ===", resourceStatus);
    const OrderNumber = JSON.parse(res?.data?.ResponseData)[0].QuickUniqueID;
    console.log("OrderNumber:", OrderNumber);
    jsonStore.setQuickUniqueID(OrderNumber);

    if (resourceStatus === "Success" || resourceStatus === "SUCCESS") {
      toast({
        title: "✅ Form submitted successfully",
        description: "Your changes have been saved.",
        variant: "default", // or "success" if you have custom variant
      });
      //  Fetch the full quick order details
      quickOrderService.getQuickOrder(OrderNumber).then((fetchRes: any) => {
        let parsedData: any = JSON.parse(fetchRes?.data?.ResponseData);
        console.log("screenFetchQuickOrder result:", JSON.parse(fetchRes?.data?.ResponseData));
        console.log("Parsed result:", (parsedData?.ResponseResult)[0]);
        // jsonStore.pushResourceGroup((parsedData?.ResponseResult)[0]);
        jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        // jsonStore.setQuickOrder((parsedData?.ResponseResult)[0]);
        const parsedResource = parsedData?.ResponseResult[0].ResourceGroup;
        console.log("parsedREsponse:", parsedData?.ResponseResult[0].ResourceGroup);
        console.log("parsedResource:", parsedResource);
        const index = (parsedResource.length) - 1;
        // setResourceUniqueId(parsedResource[index].ResourceUniqueID);

        const fullJson2 = jsonStore.getJsonData();
        console.log("RESOURCE SAVE --- FULL JSON 33:: ", fullJson2);
        // setApiStatus('success');
      })
      setCopyModalOpen(false);
    } else {
      toast({
        title: "⚠️ Submission failed",
        description: isSuccessStatus ? JSON.parse(res?.data?.ResponseData)[0].Error_msg : JSON.parse(res?.data?.Message),
        variant: "destructive", // or "success" if you have custom variant
      });
    }

  }

  const openCopyModal = () => {
    const quickOrderData = jsonStore.getQuickOrder();
    console.log("openCopyModal", quickOrderData);

    // Extract ResourceGroup data
    const resourceGroups = Array.isArray(quickOrderData?.ResourceGroup) ? quickOrderData.ResourceGroup : [];
    setResourceGroupData(resourceGroups);
    setCopyModalOpen(true);
  }

  const [showTooltip, setShowTooltip] = useState(false);

  const quickOrderAttachments = jsonStore.getQuickOrder()?.Attachments;
  const totalAttachmentCount = Array.isArray(quickOrderAttachments) && quickOrderAttachments.length > 0
    ? Number(quickOrderAttachments[0]?.TotalAttachment ?? quickOrderAttachments[0]?.totalAttachment ?? 0)
    : 0;
  const hasAttachments = totalAttachmentCount > 0;
  console.log("totalAttachmentCount", totalAttachmentCount);
  console.log("hasAttachments", hasAttachments);
  return (
    <>
      <div className="lg:col-span-1 w-2/6">
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
                panelSubTitle="Order Details"
                className="my-custom-orderform-panel"
                quickOrderNoCallback={quickOrderNoCallback}
                // onBadgeChange={onBadgeChange}
                validationErrors={validationResults['Order Details']?.errors || {}}
              /> : ''
            }
          </div>

          {/* Form Actions */}
          <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200">
            {/* <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={() => setMoreInfoOpen(true)}>
              <CircleArrowOutUpRight className="w-5 h-5 text-gray-600" />
            </button> */}
            <button className="relative p-2 rounded-lg border border-gray-200 hover:bg-gray-100" title='Attachments' onClick={() => setAttachmentsOpen(true)}>
              <Paperclip className="w-5 h-5 text-gray-600" />
              {hasAttachments && (
                <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-green-600 ring-2 ring-white shadow-sm" aria-hidden />
              )}
            </button>
            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" title="Amendment History" onClick={(e) => setHistoryOpen(true)}>
              <BookX className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" title="Linked Orders" onClick={() => setLinkedOrdersOpen(true)}>
              <Link className="w-5 h-5 text-gray-600" />
            </button>
            {
              isEditQuickOrder ?
                <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" title="Copy" onClick={() => openCopyModal()}>
                  <Copy className="w-5 h-5 text-gray-600" />
                </button> : ' '
            }
          </div>

          {/* <SideDrawer isOpen={isMoreInfoOpen} onClose={() => setResourceGroupOpen(false)} width="35%" title="More Info" isBack={false} onScrollPanel={true}>
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
              </div>
              <div className="flex bg-white justify-end w-full px-4 border-t border-gray-300">
                <button type="button" className="bg-blue-600 mt-2 text-white text-sm px-6 py-2 rounded font-medium" onClick={onSave}>
                  Save Details
                </button>
              </div>
            </div>
          </SideDrawer> */}
          <SideDrawer isOpen={isAttachmentsOpen} onClose={() => setAttachmentsOpen(false)} width="80%" title="Attachments" isBack={false} badgeContent="QO/00001/2025" onScrollPanel={true} isBadgeRequired={true}>
            <div className="">
              <div className="mt-0 text-sm text-gray-600"><Attachments isEditQuickOrder={isEditQuickOrder} isResourceGroupAttchment={false} /></div>
            </div>
          </SideDrawer>
          <SideDrawer
            isOpen={isHistoryOpen}
            onClose={() => setHistoryOpen(false)}
            width="40%"
            title="Amendment History"
            isBack={false}
            badgeContent={jsonStore.getQuickOrderNo?.() || ""}
            onScrollPanel={true}
            isBadgeRequired={true}
          >
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
              <DialogTitle className="sr-only">Copy Resource Groups</DialogTitle>
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 p-2 rounded-full"><Copy className="w-5 h-5 text-blue-500" /></span>
                    <span className="font-semibold text-lg">Copy</span>
                  </div>
                  <button
                    onClick={() => setCopyModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg> */}
                  </button>
                </div>
                {/* Resource Group */}
                <div className="px-6 py-4">
                  <div className="text-sm font-medium mb-2">Resource Group</div>
                  <div className="flex flex-wrap gap-2">
                    {resourceGroupData.map((resource, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-blue-200"
                      >
                        {resource.BillingDetails?.InternalOrderNo || `R${String(index + 1).padStart(2, '0')}`} - {resource.BasicDetails?.ResourceDescription || 'No Description'}
                        <span
                          className="ml-1 cursor-pointer hover:text-red-600"
                          onClick={() => {
                            const updatedData = resourceGroupData.filter((_, i) => i !== index);
                            console.log("clicked Cross..",updatedData)
                            setResourceGroupData(updatedData);
                          }}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                    {resourceGroupData.length === 0 && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-gray-200">
                        No Resource Groups
                      </span>
                    )}
                  </div>
                </div>
                {/* Copy Details Button */}
                <div className="px-6 pb-6">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition" onClick={() => copyQuickOrderDetails()}>Copy Details</button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent className="max-w-sm w-full p-0 rounded-xl text-xs">
              <DialogTitle className="sr-only">Cancel Resource Group Confirmation</DialogTitle>
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 p-2 rounded-full">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </span>
                    <span className="font-semibold text-lg">Cancel Resource Group</span>
                  </div>
                  {/* <button 
                    onClick={() => setDeleteModalOpen(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button> */}
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Are you sure you want to cancel this resource group?
                  </div>
                  {resourceToDelete && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <div className="text-sm font-medium text-gray-900">
                        {resourceToDelete.BillingDetails?.InternalOrderNo || 'No Order Number'} - {resourceToDelete.BasicDetails?.ResourceDescription || 'No Description'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 px-6 pb-6">
                  {/* <button 
                    onClick={cancelDeleteResourceGroup}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button> */}
                  <button
                    onClick={confirmDeleteResourceGroup}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
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
      </div>

      {/* Loading overlay matching QuickOrderManagement */}
      {apiStatus === 'loading' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
          <div className="text-lg font-semibold text-blue-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
        </div>
      )}

      <div className="lg:col-span-1 w-4/6">
        {(!isEditQuickOrder && !isResourceData && !isResourceClosed) ?
          <div className="rounded-lg p-8 flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {/* <Plus className="w-10 h-10 text-blue-500" /> */}
              <img src={AddIcon} alt='Add' className="w-20 h-20" />
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              No Resource Group Have been Added
            </h3>

            <p className="text-gray-500 text-center mb-6 text-sm">
              Click the "add" button to create a new resource group.
            </p>

            <Button onClick={openResourceGroup} className="bg-blue-600 hover:bg-blue-700">
              {/* <Plus className="w-4 h-4 mr-2" /> */}
              Add
            </Button>
          </div>
          :
          <div className="">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Resource Group Details
                <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">{ResourceCount}</span>
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
                <Button onClick={openUpdateResourceGroup} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 bg-gray-100 text-gray-600 p-0 border border-gray-300">
                  <Plus className="w-4 h-4" />
                </Button>
                

                {/* Create Quick Order Button */}
                <div className="relative inline-block">
                  <button
                    onClick={() => {
                      // Dynamically get the base path from the current URL
                      const { pathname } = window.location;
                      // Find the base path 
                      const basePathMatch = pathname.match(/^\/[^/]+/);
                      const basePath = basePathMatch ? basePathMatch[0] : "";
                      window.location.href = `${basePath}/create-quick-order`;
                    }}
                    className="border border-blue-500 text-blue-500 text-sm font-medium hover:bg-blue-50 h-9 rounded flex items-center transition-colors duration-200 gap-2 px-3"

                    type='button'
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Plus className="h-4 w-4" />
                    Quick Order
                  </button>

                  {/* Tooltip */}
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-50 whitespace-nowrap">
                      Create Quick Order
                      {/* Tooltip arrow */}
                      <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 top-full left-1/2 -translate-x-1/2 -mt-1" />
                    </div>
                  )}
                </div>

              </div>
            </div>
            {Array.isArray(resourceData) && resourceData.length > 0 && (
              <div className="mt-4">
                <CardDetails data={resourceData} isEditQuickOrder={isEditQuickOrder} onDeleteResourceGroup={handleDeleteResourceGroup} onCopyResourceGroup={handleCopyResourceGroup} />
              </div>
            )}
          </div>
        }

        <SideDrawer isOpen={isResourceGroupOpen} onClose={() => closeResource()} width="100%" title="Resource Group Details" isBack={isBack}>
          <div className="text-sm text-gray-600">
            <ResourceGroupDetailsForm
              isEditQuickOrder={isEditQuickOrder}
              onSaveSuccess={closeResource} // <-- Pass the close function
            />
          </div>
        </SideDrawer>
      </div>
    </>
  );
});

export default OrderForm;
