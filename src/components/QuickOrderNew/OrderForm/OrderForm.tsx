import React, { useRef, useState } from 'react';
import { CalendarIcon, Search, CircleArrowOutUpRight, Plus, Paperclip, BookX, Link, Copy, CircleX, CheckCircle, AlertCircle, X } from 'lucide-react'; import { Button } from '@/components/ui/button';
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
import AddIcon from '../../../assets/images/addIcon.png';
import ResourceGroupDetailsForm from '../ResourceGroupDetails';
import CardDetails, { CardDetailsItem } from '../../Common/Card-View-Details';
import { initializeJsonStore } from '../../../pages/JsonCreater';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  onSaveDraft: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  isEditQuickOrder?: boolean;
  onScroll?: boolean;
}

const OrderForm = ({ onSaveDraft, onConfirm, onCancel, isEditQuickOrder, onScroll }: OrderFormProps) => {
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
  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {

    const quickOrder = jsonStore.getQuickOrder();
    if (isEditQuickOrder && quickOrder && Object.keys(quickOrder).length > 0) {
      setOrderType(quickOrder.OrderType || 'BUY');
      setFormData(normalizeOrderFormDetails(quickOrder));
      setmoreInfoData(normalizeMoreInfoDetails(quickOrder)); // <-- This sets moreInfoData with store value
      setResourceCount(quickOrder.ResourceGroup?.length);
      const resourceGroups = jsonStore.getAllResourceGroups();
      console.log("RESOURCE GROUPS::::: ", resourceGroups);
      // setOrderType('BUY');
      setFormData(normalizeOrderFormDetails(quickOrder));
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
      setResourceCount(quickOrder.ResourceGroup.length);

    }
  }, [isEditQuickOrder, loading, contracts, customers, clusters, vendors]);
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
  const [isResourceGroupOpen, setResourceGroupOpen] = useState(false);
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
        }

      }
    },
    QuickOrderDate: {
      id: 'QuickOrderDate',
      label: 'Quick Order Date',
      fieldType: 'date',
      width: 'half',
      value: new Date().toISOString().split("T")[0], // today's date
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
                value: item.id
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
                value: item.id
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
      label: 'Vendor',
      fieldType: 'lazyselect',
      width: 'half',
      value: '',
      mandatory: true,
      visible: OrderType === 'BUY',
      editable: true,
      order: 4,
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
                value: item.id
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
      mandatory: true,
      visible: true,
      editable: true,
      order: 5,
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
                value: item.id
              }
            : {})
        }));
      },
    },
    CustomerQuickOrderNo: {
      id: 'CustomerQuickOrderNo',
      label: 'Customer Order No.',
      fieldType: 'lazyselect',
      width: 'full',
      value: '',
      mandatory: false,
      visible: OrderType === 'BUY',
      editable: true,
      order: 6,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Customer Order status Init",
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
                value: item.id
              }
            : {})
        }));
      },
      // placeholder: 'IO/0000000042',
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
      placeholder: 'Enter Value',
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
      options: qcList1.filter((qc:any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      placeholder: ''
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
      options: qcList2.filter((qc:any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      options: qcList3.filter((qc:any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
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
      placeholder: 'Enter Remarks',
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
      order: 15,
      placeholder: 'Enter Remarks',
      width: 'full',
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

    setLoading(false);
    setError(null);
    try {
      const data: any = await quickOrderService.getCommonComboData({ messageType: "ContractID Selection", contractId: contractId.value, type: OrderType });
      console.log("COMBO DROPDOWN DATA", JSON.parse(data.data.ResponseData));
      console.log("ORDERTYPE :", OrderType);
      // setContracts(JSON.parse(data?.data?.ResponseData));
      const parsedData: any = JSON.parse(data?.data?.ResponseData);
      const contract: any = parsedData;
      console.log("CONTRACT DATA:: ", contract.VendorID);
      if (contract) {
        setOrderType(OrderType)
        // const formatted = formatDateToYYYYMMDD("2023-08-31T00:00:00"); // "2023-08-31"
        setQuickOrderDate(formatDateToYYYYMMDD(contract.ValidFrom) )
        jsonStore.setQuickOrderFields({ OrderType: OrderType, ContractID: contract.ContractID, Customer: contract.CustomerID, Vendor: contract.VendorID, Cluster: contract.ClusterLocation, WBS: contract.WBS, Currency: contract.Currency, QuickOrderDate: formatDateToYYYYMMDD(contract.ValidFrom) });
        jsonStore.setResourceGroupFields({ ServiceType: contract.ServiceType, OperationalLocation: contract.Location });
        const additionalInfo = contract.ContractTariff;
        jsonStore.setResourceType({ Resource: additionalInfo[0].Resource, ResourceType: additionalInfo[0].ResourceType })
        jsonStore.setTariffFields({
          tariff: additionalInfo[0].TariffID,
          contractPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
          unitPrice: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
          netAmount: additionalInfo[0].TariffRate ? additionalInfo[0].TariffRate : "",
          tariffType: additionalInfo[0].TariffType ? additionalInfo[0].TariffType : "",
          billToID: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
          // draftBillNo: additionalInfo[0].BillToID ? additionalInfo[0].BillToID : "",
        });
        jsonStore.setTariffDateFields({
          fromDate: additionalInfo[0].ContractTariffValidFrom
            ? additionalInfo[0].ContractTariffValidFrom.split("T")[0]
            : "",
          toDate: additionalInfo[0].ContractTariffValidTo
            ? additionalInfo[0].ContractTariffValidTo.split("T")[0]
            : "",
          // fromDate: formatDate(additionalInfo[0].ContractTariffValidFrom ? additionalInfo[0].ContractTariffValidFrom : ""),
          // toDate: formatDate(additionalInfo[0].ContractTariffValidTo ? additionalInfo[0].ContractTariffValidTo : ""),
          // fromDate: additionalInfo[0].ContractTariffValidFrom ? additionalInfo[0].ContractTariffValidFrom : "",
          // toDate: additionalInfo[0].ContractTariffValidTo ? additionalInfo[0].ContractTariffValidTo : "",
        });
        // Set ValidFrom and ValidTo in jsonStore using a new set method
        

        console.log("AFTER DATA BINDING - RESOURCEGROUP  : ", jsonStore.getResourceJsonData())
        console.log("AFTER DATA BINDING - QUICKORDER  : ", jsonStore.getQuickOrder())
        setFormData(normalizeOrderFormDetails({ OrderType: OrderType, ContractID: contract.ContractID, Customer: contract.CustomerID, Vendor: contract.VendorID, Cluster: contract.ClusterClusterLocation, WBS: contract.WBS }));
      }
    } catch (err) {
      setError(`Error fetching API data for${err}`);
      console.log("ERROR IN COMBO DROPDOWN:: ", err);
      jsonStore.setQuickOrderFields({ ContractID: "CON000000116", Customer: "C001", Vendor: "V001", Cluster: "CL01", WBS: "WBS123" });
      setFormData(normalizeOrderFormDetails({ Customer: "C001", Vendor: "011909", Cluster: "CL01", WBS: "DE17BAS843" }))

      // setApiData(data);
    }
    finally {
      setLoading(true);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Utility to normalize keys from store to config field IDs
  function normalizeOrderFormDetails(data) {
    return {
      OrderType: data.OrderType ? data.OrderType : '',
      QuickOrderDate: data.QuickOrderDate ? data.QuickOrderDate : '',
      Contract: data.Contract ? data.Contract : data.ContractID ? data.ContractID : '',
      Customer: data.Customer ? data.Customer : '',
      Vendor: data.Vendor ? data.Vendor : '',
      Cluster: data.Cluster ? data.Cluster : '',
      CustomerQuickOrderNo: data.CustomerQuickOrderNo ? data.CustomerQuickOrderNo : '',
      Customer_Supplier_RefNo: data.Customer_Supplier_RefNo ? data.Customer_Supplier_RefNo : '',
      QCUserDefined1: data.QCUserDefined1 ? data.QCUserDefined1 : '',
      Remark1: data.Remark1 ? data.Remark1 : '',
      Summary: data.Summary ? data.Summary : '',
      WBS: data.WBS ? data.WBS : '',
      QCUserDefined2: data.QCUserDefined2 ? data.QCUserDefined2 : '',
      QCUserDefined3: data.QCUserDefined3 ? data.QCUserDefined3 : '',
      QCUserDefined1Value: data.QCUserDefined1Value ? data.QCUserDefined1Value : '',
      QCUserDefined2Value: data.QCUserDefined2Value ? data.QCUserDefined2Value : '',
      QCUserDefined3Value: data.QCUserDefined3Value ? data.QCUserDefined3Value : '',
      Remarks2: data.Remarks2 ? data.Remarks2 : '',
      Remarks3: data.Remarks3 ? data.Remarks3 : ''
    };

  }

  const orderDetailsRef = useRef<DynamicPanelRef>(null);
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
  const copyDetails = () => {

  }

  const [isResourceData, setIsResourceData] = useState(false);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [ResourceCount, setResourceCount] = useState(0);
  useEffect(() => {
    const resourceGroups = jsonStore.getAllResourceGroups();
    if (resourceGroups.length > 0) {
      setIsResourceData(true);
      setResourceData(resourceGroups);
    }
    // if (isEditQuickOrder) {
    // }
  }, [isResourceData]);

  const closeResource = () => {
    setResourceGroupOpen(false);
    setIsBack(true);
    const resourceGroups = jsonStore.getAllResourceGroups();
    console.log("RESOURCE GROUPS::::: ", resourceGroups);
    const quickOrder = jsonStore.getQuickOrder();
    // setOrderType('BUY');
    setFormData(normalizeOrderFormDetails(quickOrder));
    if (resourceGroups.length > 0) {
      setIsResourceData(true);
      setResourceData(resourceGroups);
    }
  }

   // Validation state
  // const [validationResults, setValidationResults] = useState<Record<string, { isValid: boolean; errors: Record<string, string>; mandatoryFieldsEmpty: string[] }>>({});
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
      // console.log("formValuesValidation ===", formValuesValidation);
      const formValues = {
        QuickOrder: orderDetailsRef.current?.getFormValues() || {},
        // operationalDetails: moreInfoDetailsRef.current?.getFormValues() || {},
      };
      console.log("FORM VALUES : ",formValues)
      setFormData(formValues.QuickOrder);
      console.log("FORM VALUES : ",formValues.QuickOrder);
      
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
          setResourceCount(fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
          console.log("RESOURCE COUNT:: ", fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
        })
        //  Update your store or state with the fetched data

      } catch (err) {
        console.log("CATCH :: ", err);
        setError(`Error fetching API data for resource group`);
        toast({
          title: "⚠️ Submission failed",
          description: "Something went wrong while saving. Please try again.",
          variant: "destructive", // or "error"
        });
      }
      finally {
        toast({
          title: "✅ Form submitted successfully",
          description: "Your changes have been saved.",
          variant: "default", // or "success" if you have custom variant
        });
        setResourceGroupOpen(true);
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
      const basicValidation = orderDetailsRef.current.doValidation();
      results['basic-details'] = basicValidation;
      if (!basicValidation.isValid) {
        overallValid = false;
        totalErrors += Object.keys(basicValidation.errors).length;
      }
    }

    // setValidationResults(results);

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

  const openUpdateResourceGroup = async () => {
    // setResourceGroupOpen(true);
    const formValues = {
      QuickOrder: orderDetailsRef.current?.getFormValues() || {},
      // operationalDetails: moreInfoDetailsRef.current?.getFormValues() || {},
    };
    console.log("FORM VALUES : ",formValues)
    setFormData(formValues.QuickOrder);
    console.log("FORM VALUES : ",formValues.QuickOrder);
    
    jsonStore.setQuickOrder({
      ...jsonStore.getJsonData().quickOrder,
      ...formValues.QuickOrder,
      "ModeFlag": "Update",
      // "Status": "Fresh",
      // "QuickUniqueID": -1,
      // "QuickOrderNo": "",
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
        setResourceCount(fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
        console.log("RESOURCE COUNT:: ", fullJson2.ResponseResult.QuickOrder.ResourceGroup.length);
      })
      //  Update your store or state with the fetched data

    } catch (err) {
      console.log("CATCH :: ", err);
      setError(`Error fetching API data for resource group`);
      toast({
        title: "⚠️ Submission failed",
        description: "Something went wrong while saving. Please try again.",
        variant: "destructive", // or "error"
      });
    }
    finally {
      toast({
        title: "✅ Form submitted successfully",
        description: "Your changes have been saved.",
        variant: "default", // or "success" if you have custom variant
      });
      setResourceGroupOpen(true);
    }
  }
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
              /> : ''
            }
          </div>

          {/* Form Actions */}
          <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200">
            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100">
              <CircleArrowOutUpRight className="w-5 h-5 text-gray-600" />
            </button>
            {/* <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={() => setMoreInfoOpen(true)}>
              <CircleArrowOutUpRight className="w-5 h-5 text-gray-600" />
            </button> */}
            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={() => setAttachmentsOpen(true)}>
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100" onClick={(e) => setHistoryOpen(true)}>
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
      </div>

      <div className="lg:col-span-1 w-4/6">
        {(!isEditQuickOrder && !isResourceData) ?
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
              </div>
            </div>
            <div className="mt-4">
              <CardDetails data={resourceData} isEditQuickOrder={isEditQuickOrder} />
            </div>
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
};

export default OrderForm;
