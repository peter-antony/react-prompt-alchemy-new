import React, { useState, useRef, useEffect } from 'react';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { quickOrderService } from '@/api/services/quickOrderService';
import { FileText } from 'lucide-react';
import { CimCuvService } from '@/api/services/CimCuvService'; // Import CimCuvService

const TemplateCreate = () => {
  const generalDetailsRef = useRef<DynamicPanelRef>(null);
  const headerTemplateRef = useRef<DynamicPanelRef>(null); // New Ref
  const paymentInstructionRef = useRef<DynamicPanelRef>(null); // New Ref
  const placeAndDateRef = useRef<DynamicPanelRef>(null); // New Ref
  const consignorDeclarationsRef = useRef<DynamicPanelRef>(null); // New Ref for Consignor's Declarations
  const valueDeliveryCashRef = useRef<DynamicPanelRef>(null); // New Ref for Value and Delivery Details
  const codingBoxesRef = useRef<DynamicPanelRef>(null); // New Ref for Coding Boxes
  const examinationDetailsRef = useRef<DynamicPanelRef>(null); // New Ref for Examination and Other Details
  const sectionARef = useRef<DynamicPanelRef>(null); // New Ref for Section A
  const sectionBRef = useRef<DynamicPanelRef>(null); // New Ref for Section B
  const sectionCRef = useRef<DynamicPanelRef>(null); // New Ref for Section C

  const [generalDetailsData, setGeneralDetailsData] = useState<Record<string, any>>({});
  const [headerTemplateData, setHeaderTemplateData] = useState<Record<string, any>>({}); // New State
  const [paymentInstructionData, setPaymentInstructionData] = useState<Record<string, any>>({}); // New State
  const [placeAndDateData, setPlaceAndDateData] = useState<Record<string, any>>({}); // New State
  const [consignorDeclarationsData, setConsignorDeclarationsData] = useState<Record<string, any>>({}); // New State for Consignor's Declarations
  const [valueDeliveryCashData, setValueDeliveryCashData] = useState<Record<string, any>>({}); // New State for Value and Delivery Details
  const [codingBoxesData, setCodingBoxesData] = useState<Record<string, any>>({}); // New State for Coding Boxes
  const [examinationDetailsData, setExaminationDetailsData] = useState<Record<string, any>>({}); // New State for Examination and Other Details
  const [sectionAData, setSectionAData] = useState<Record<string, any>>({}); // New State for Section A
  const [sectionBData, setSectionBData] = useState<Record<string, any>>({}); // New State for Section B
  const [sectionCData, setSectionCData] = useState<Record<string, any>>({}); // New State for Section C
  const [apiResponse, setApiResponse] = useState<any>(null); // New state for API response
  const [initialApiResponse, setInitialApiResponse] = useState<any>(null); // To store original API response
  const [activeTab, setActiveTab] = useState('general');

  const buttonCancel =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm";
  /**
   * fetchMaster helper for lazy select dropdowns
   */
  const fetchMaster = (
    messageType: string,
    extraParams?: Record<string, any>
  ) => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType,
          searchTerm: searchTerm || "",
          offset,
          limit,
          ...(extraParams || {}),
        });

        const rr: any = response?.data;
        const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

        return arr.map((item: any) => {
          const id = item.id ?? item.ID ?? item.value ?? "";
          const name = item.name ?? item.Name ?? item.label ?? "";
          return {
            label: `${id} || ${name}`,
            value: `${id} || ${name}`,
          };
        });
      } catch (err) {
        console.error(`Error fetching ${messageType}:`, err);
        return [];
      }
    };
  };

  // Simulate API response for demonstration
  useEffect(() => {
    // Call the API to fetch template data
    fetchTemplateData("tewt24"); // Replace with actual template ID or a dynamic value
  }, []); // Removed activeTab from the dependency array

  // Function to fetch template data from API
  const fetchTemplateData = async (templateId: string) => {
    console.log("Fetching template data for template ID:", templateId);
    try {
      const response = await CimCuvService.getTemplateDataByID(templateId);
      console.log("response.data", response);
      const responseData = JSON.parse(response.data.ResponseData);
      console.log("response.data", responseData);
      setApiResponse(responseData);
      setInitialApiResponse(responseData); // Store the initial response
    } catch (error) {
      console.error("Error fetching template data:", error);
      setApiResponse(null);
      setInitialApiResponse(null);
    }
  };

  // General Details Panel Config
  const generalDetailsConfig: PanelConfig = {
    consignor: {
      id: 'consignor',
      label: 'Consignor [1]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Consignor',
      fetchOptions: fetchMaster('Consignor Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    consignorDescription: {
      id: 'consignorDescription',
      label: '',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Consignor',
      labelFlag: false,
    },
    customerCodeConsignor: {
      id: 'customerCodeConsignor',
      label: 'Customer Code for the Consignor [2]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter Customer Code',
      fetchOptions: fetchMaster('Customer Code Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    customerCodePrePaid: {
      id: 'customerCodePrePaid',
      label: 'Customer Code for Payer of Pre-Paid Charges [3]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'four',
      placeholder: 'Enter Customer Code for the Pay...',
      fetchOptions: fetchMaster('Customer Code Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    consignee: {
      id: 'consignee',
      label: 'Consignee [4]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'four',
      placeholder: 'Enter Consignee',
      fetchOptions: fetchMaster('Consignee Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    consigneeDescription: {
      id: 'consigneeDescription',
      label: '',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'four',
      placeholder: 'Enter Consignee',
      labelFlag: false,
    },
    customerCodeConsignee: {
      id: 'customerCodeConsignee',
      label: 'Customer Code for Consignee [5]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: 'four',
      placeholder: 'Enter Customer Code for Consign...',
      fetchOptions: fetchMaster('Customer Code Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    customerCodeNonPrePaid: {
      id: 'customerCodeNonPrePaid',
      label: 'Customer Code for Payer of Non Pre-Paid Charges [6]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'four',
      placeholder: 'Enter Customer Code for the Pay...',
      fetchOptions: fetchMaster('Customer Code Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    consignorReference: {
      id: 'consignorReference',
      label: "Consignor's Reference [8]",
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: 'four',
      placeholder: "Enter Consignor's Reference",
      fetchOptions: fetchMaster('Consignor Reference Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    consignorReferenceDescription: {
      id: 'consignorReferenceDescription',
      label: '',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: 'four',
      placeholder: "Enter Consignor's Reference",
      labelFlag: false,
    },
    deliveryPoint: {
      id: 'deliveryPoint',
      label: 'Delivery Point [10]/[4]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 11,
      width: 'four',
      placeholder: 'Enter Delivery Point',
      fetchOptions: fetchMaster('Delivery Point Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    deliveryPointDescription: {
      id: 'deliveryPointDescription',
      label: '',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 12,
      width: 'four',
      placeholder: 'Enter Delivery Point',
      labelFlag: false,
    },
    codeDeliveryPoint: {
      id: 'codeDeliveryPoint',
      label: 'Code for the Delivery Point [11]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 13,
      width: 'four',
      placeholder: 'Enter Code for the Delivery Point',
      fetchOptions: fetchMaster('Location Code Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    codeStationServing: {
      id: 'codeStationServing',
      label: 'Code for the Station Serving the Delivery Point [12]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 14,
      width: 'four',
      placeholder: 'Enter Code for the Station Serving...',
      fetchOptions: fetchMaster('Station Code Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    customerAgreementTariff: {
      id: 'customerAgreementTariff',
      label: 'No. of the Customer Agreement/Tariff [14]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 15,
      width: 'four',
      placeholder: 'Select No. of the Customer Agree...',
      fetchOptions: fetchMaster('Customer Agreement Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    acceptanceDate: {
      id: 'acceptanceDate',
      label: 'Acceptance Date [16]/[2]',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 16,
      width: 'four',
      placeholder: 'Select Acceptance Date',
      dateFormat: 'dd/MM/yyyy',
    },
    acceptanceFrom: {
      id: 'acceptanceFrom',
      label: 'Acceptance From [16]/[3]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 17,
      width: 'four',
      placeholder: 'Select Acceptance From',
      fetchOptions: fetchMaster('Acceptance From Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    codeAcceptancePoint: {
      id: 'codeAcceptancePoint',
      label: 'Code for the Acceptance Point [17]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 18,
      width: 'four',
      placeholder: 'Enter Code for the Acceptance Point',
      fetchOptions: fetchMaster('Acceptance Point Code Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
  };

  // New Header Template Panel Config
  const headerTemplateConfig: PanelConfig = {
    templateId: {
      id: 'templateId',
      label: 'Template ID',
      fieldType: 'text',
      value: '',
      mandatory: true,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Template ID',
    },
    templateDescription: {
      id: 'templateDescription',
      label: 'Template Description',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'half',
      placeholder: 'Enter Template Description',
    },
    templateType: {
      id: 'templateType',
      label: '',
      fieldType: 'radio',
      value: 'CIM',
      mandatory: true,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      options: [
        { label: 'CIM', value: 'CIM' },
        { label: 'CUV', value: 'CUV' },
      ],
      labelFlag: false, // Hide the label as per screenshot
    },
  };

  // New Payment Instruction Panel Config
  const paymentInstructionConfig: PanelConfig = {
    paymentInstruction1: {
      id: 'paymentInstruction1',
      label: 'Payment Instruction',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Payment Instruction',
      fetchOptions: fetchMaster('Payment Instruction Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    paymentInstruction2: {
      id: 'paymentInstruction2',
      label: '',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Payment Instruction',
      labelFlag: false,
    },
    paymentInstruction3: {
      id: 'paymentInstruction3',
      label: '',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter Payment Instruction',
      labelFlag: false,
    },
    carriageChargePaid: {
      id: 'carriageChargePaid',
      label: 'Carriage Charge Paid',
      fieldType: 'checkbox',
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'six',
    },
    incoTerms: {
      id: 'incoTerms',
      label: 'Inco Terms',
      fieldType: 'checkbox',
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'six',
    },
  };

  // New Place and Date Made Out Panel Config
  const placeAndDateConfig: PanelConfig = {
    place: {
      id: 'place',
      label: 'Place',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'one-third',
      placeholder: 'Enter Place',
      fetchOptions: fetchMaster('Place Init'),
      hideSearch: false,
      disableLazyLoading: false,
    },
    dateMadeOut: {
      id: 'dateMadeOut',
      label: 'Select Date',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'six',
      placeholder: 'Select Date',
      dateFormat: 'dd/MM/yyyy',
    },
  };

  // Consignor's Declarations Panel Config
  const consignorDeclarationsConfig: PanelConfig = {
    consignorDeclarations: {
      id: 'consignorDeclarations',
      label: "Consignor's Declarations [7]",
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: "Enter Consignor's Declarations",
    },
    documentsAttached: {
      id: 'documentsAttached',
      label: 'Documents Attached [9]',
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Documents Attached',
    },
    commercialSpecifications: {
      id: 'commercialSpecifications',
      label: 'Commercial Specifications [13]',
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter Commercial Specifications',
    },
    informationForConsignee: {
      id: 'informationForConsignee',
      label: 'Information for the Consignee [15]',
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'four',
      placeholder: 'Enter Information for the Consignee',
    },
  };

  // Declaration of Value, Interest in Delivery, Cash on Delivery Panel Config
  const valueDeliveryCashConfig: PanelConfig = {
    declarationOfValue: {
      id: 'declarationOfValue',
      label: 'Declaration of Value [26]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Declaration of Value',
      fetchOptions: fetchMaster('Declaration of Value Init'),
    },
    interestInDelivery: {
      id: 'interestInDelivery',
      label: 'Interest in Delivery [27]',
      fieldType: 'lazyselect',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Interest in Delivery',
      fetchOptions: fetchMaster('Interest in Delivery Init'),
    },
    cashOnDelivery: {
      id: 'cashOnDelivery',
      label: 'Cash on Delivery [28]',
      fieldType: 'inputdropdown',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter Cash on Delivery',
    },
  };

  // Coding Boxes Panel Config
  const codingBoxesConfig: PanelConfig = {
    codingBox1: {
      id: 'codingBox1',
      label: 'Coding Box 1 [40]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Coding Box 1',
    },
    codingBox2: {
      id: 'codingBox2',
      label: 'Coding Box 2 [41]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Coding Box 2',
    },
    codingBox3: {
      id: 'codingBox3',
      label: 'Coding Box 3 [42]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter Coding Box 3',
    },
    codingBox4: {
      id: 'codingBox4',
      label: 'Coding Box 4 [43]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'four',
      placeholder: 'Enter Coding Box 4',
    },
    codingBox5: {
      id: 'codingBox5',
      label: 'Coding Box 5 [44]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'four',
      placeholder: 'Enter Coding Box 5',
    },
    codingBox6: {
      id: 'codingBox6',
      label: 'Coding Box 6 [45]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'four',
      placeholder: 'Enter Coding Box 6',
    },
    codingBox7: {
      id: 'codingBox7',
      label: 'Coding Box 7 [46]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: 'four',
      placeholder: 'Enter Coding Box 7',
    },
    codingBox8: {
      id: 'codingBox8',
      label: 'Coding Box 8 [47]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'four',
      placeholder: 'Enter Coding Box 8',
    },
  };

  // Examination and Other Details Panel Config
  const examinationDetailsConfig: PanelConfig = {
    examination: {
      id: 'examination',
      label: 'Examination [48]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Examination',
    },
    prepaymentCoding: {
      id: 'prepaymentCoding',
      label: 'Prepayment Coding [49]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Prepayment Coding',
    },
    chargesNote: {
      id: 'chargesNote',
      label: 'Charges Note [52]',
      fieldType: 'checkbox',
      value: false,
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
    },
    cashOnDeliveryReceipt: {
      id: 'cashOnDeliveryReceipt',
      label: 'Cash on Delivery Receipt [53]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'four',
      placeholder: 'Enter Cash on Delivery Receipt',
    },
    formalReport: {
      id: 'formalReport',
      label: 'Formal Report [54]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'four',
      placeholder: 'Enter Formal Report',
    },
    extensionOfTransitPeriod: {
      id: 'extensionOfTransitPeriod',
      label: 'Extension of Transit Period [55]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'four',
      placeholder: 'Enter Extension of Transit Period',
    },
    dateOfArrival: {
      id: 'dateOfArrival',
      label: 'Date of Arrival [59]',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: 'four',
      placeholder: 'Enter Date of Arrival',
      dateFormat: 'dd/MM/yyyy',
    },
    madeAvailable: {
      id: 'madeAvailable',
      label: 'Made Available [60]',
      fieldType: 'date',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'four',
      placeholder: 'Enter Made Available',
      dateFormat: 'dd/MM/yyyy',
    },
    acknowledgementOfReceipt: {
      id: 'acknowledgementOfReceipt',
      label: 'Acknowledgement of Receipt [61]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: 'half',
      placeholder: 'Enter Acknowledgement of Receipt',
    },
  };

  // Section A Panel Config
  const sectionAConfig: PanelConfig = {
    codeForChargingSections: {
      id: 'codeForChargingSections',
      label: 'Code for the Charging Sections [70]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Code for the Charging Sections',
    },
    routeCode: {
      id: 'routeCode',
      label: 'Route Code [71]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Route Code',
    },
    nhmCode: {
      id: 'nhmCode',
      label: 'NHM Code [72]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter NHM Code',
    },
    currency: {
      id: 'currency',
      label: 'Currency [73]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'four',
      placeholder: 'Enter Currency',
    },
    chargedMassWeight: {
      id: 'chargedMassWeight',
      label: 'Charged Mass Weight [74]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'four',
      placeholder: 'Enter Charged Mass Weight',
    },
    customerAgreementOrTariffApplied: {
      id: 'customerAgreementOrTariffApplied',
      label: 'Customer Agreement or Tariff Applied [75]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'four',
      placeholder: 'Enter Customer Agreement or Tariff Applied',
    },
    kmZone: {
      id: 'kmZone',
      label: 'KM/Zone [76]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: 'four',
      placeholder: 'Enter KM/Zone',
    },
    supplementsFeesDeductions: {
      id: 'supplementsFeesDeductions',
      label: 'Supplements, Fees, Deductions [77]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'four',
      placeholder: 'Enter Supplements, Fees, Deductions',
    },
    unitPrice: {
      id: 'unitPrice',
      label: 'Unit Price [78]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: 'four',
      placeholder: 'Enter Unit Price',
    },
    charges: {
      id: 'charges',
      label: 'Charges [79]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: 'four',
      placeholder: 'Enter Charges',
    },
  };

  // Section B Panel Config
  const sectionBConfig: PanelConfig = {
    codeForChargingSections: {
      id: 'codeForChargingSectionsB',
      label: 'Code for the Charging Sections [70]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Code for the Charging Sections',
    },
    routeCode: {
      id: 'routeCodeB',
      label: 'Route Code [71]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Route Code',
    },
    nhmCode: {
      id: 'nhmCodeB',
      label: 'NHM Code [72]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter NHM Code',
    },
    currency: {
      id: 'currencyB',
      label: 'Currency [73]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'four',
      placeholder: 'Enter Currency',
    },
    chargedMassWeight: {
      id: 'chargedMassWeightB',
      label: 'Charged Mass Weight [74]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'four',
      placeholder: 'Enter Charged Mass Weight',
    },
    customerAgreementOrTariffApplied: {
      id: 'customerAgreementOrTariffAppliedB',
      label: 'Customer Agreement or Tariff Applied [75]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'four',
      placeholder: 'Enter Customer Agreement or Tariff Applied',
    },
    kmZone: {
      id: 'kmZoneB',
      label: 'KM/Zone [76]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: 'four',
      placeholder: 'Enter KM/Zone',
    },
    supplementsFeesDeductions: {
      id: 'supplementsFeesDeductionsB',
      label: 'Supplements, Fees, Deductions [77]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'four',
      placeholder: 'Enter Supplements, Fees, Deductions',
    },
    unitPrice: {
      id: 'unitPriceB',
      label: 'Unit Price [78]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: 'four',
      placeholder: 'Enter Unit Price',
    },
    charges: {
      id: 'chargesB',
      label: 'Charges [79]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: 'four',
      placeholder: 'Enter Charges',
    },
  };

  // Section C Panel Config
  const sectionCConfig: PanelConfig = {
    codeForChargingSections: {
      id: 'codeForChargingSectionsC',
      label: 'Code for the Charging Sections [70]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'four',
      placeholder: 'Enter Code for the Charging Sections',
    },
    routeCode: {
      id: 'routeCodeC',
      label: 'Route Code [71]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      placeholder: 'Enter Route Code',
    },
    nhmCode: {
      id: 'nhmCodeC',
      label: 'NHM Code [72]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      width: 'four',
      placeholder: 'Enter NHM Code',
    },
    currency: {
      id: 'currencyC',
      label: 'Currency [73]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      width: 'four',
      placeholder: 'Enter Currency',
    },
    chargedMassWeight: {
      id: 'chargedMassWeightC',
      label: 'Charged Mass Weight [74]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'four',
      placeholder: 'Enter Charged Mass Weight',
    },
    customerAgreementOrTariffApplied: {
      id: 'customerAgreementOrTariffAppliedC',
      label: 'Customer Agreement or Tariff Applied [75]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      width: 'four',
      placeholder: 'Enter Customer Agreement or Tariff Applied',
    },
    kmZone: {
      id: 'kmZoneC',
      label: 'KM/Zone [76]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
      width: 'four',
      placeholder: 'Enter KM/Zone',
    },
    supplementsFeesDeductions: {
      id: 'supplementsFeesDeductionsC',
      label: 'Supplements, Fees, Deductions [77]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      width: 'four',
      placeholder: 'Enter Supplements, Fees, Deductions',
    },
    unitPrice: {
      id: 'unitPriceC',
      label: 'Unit Price [78]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
      width: 'four',
      placeholder: 'Enter Unit Price',
    },
    charges: {
      id: 'chargesC',
      label: 'Charges [79]',
      fieldType: 'text',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      width: 'four',
      placeholder: 'Enter Charges',
    },
  };

  const handleAddConsignorConsignee = () => {
    console.log('Add Consignor/Consignee clicked');
    // Add your logic here
  };

  // Deep equality check utility
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  };

  // Mapping functions
  const mapFormToHeaderPayload = (formData: Record<string, any>) => ({
    TemplateID: formData.templateId,
    Description: formData.templateDescription,
    DocType: formData.templateType,
  });

  const mapFormToGeneralDetailsPayload = (formData: Record<string, any>) => ({
    Consignor_1_value1: formData.consignor || null,
    ConsignorName_value2: formData.consignorDescription || null,
    CustomerCodeForConsignor_2: formData.customerCodeConsignor || null,
    CustomerCodeForConsignor_value2: formData.customerCodeConsignor || null, // Assuming same as above for now
    CustomerCodeForPayerOfPrePaidCharges_3: formData.customerCodePrePaid || null,
    CustomerCodeForPayerOfPrePaidCharges_value3: formData.customerCodePrePaid || null, // Assuming same as above for now
    Consignee_4_value1: formData.consignee || null,
    ConsigneeName_4_value2: formData.consigneeDescription || null,
    CustomerCodeForConsignee_5: formData.customerCodeConsignee || null,
    CustomerCodeForConsignee_value5: formData.customerCodeConsignee || null, // Assuming same as above for now
    CustomerCodeForPayerOfNonPrePaidCharges_6: formData.customerCodeNonPrePaid || null,
    CustomerCodeForPayerOfNonPrePaidCharges_value6: formData.customerCodeNonPrePaid || null, // Assuming same as above for now
    ConsignorsReference_8_value1: formData.consignorReference || null,
    ConsignorsReference_8_value2: formData.consignorReferenceDescription || null,
    DeliveryPoint_10_4_value1: formData.deliveryPoint || null,
    DeliveryPoint_10_4_value2: formData.deliveryPointDescription || null,
    CodeForDeliveryPoint_11_value1: formData.codeDeliveryPoint || null,
    CodeForDeliveryPoint_11_value2: formData.codeDeliveryPoint || null, // Assuming same as above for now
    CodeForStationServingDeliveryPoint_12_value1: formData.codeStationServing || null,
    CodeForStationServingDeliveryPoint_12_value2: formData.codeStationServing || null, // Assuming same as above for now
    NumberOfCustomerAgreementOrTariff_14: formData.customerAgreementTariff || null,
    AcceptanceDate_16_2: formData.acceptanceDate || null,
    AcceptanceFrom_16_3: formData.acceptanceFrom || null,
    CodeForAcceptancePoint_17: formData.codeAcceptancePoint || null,
    CodeForAcceptancePoint_17_1: formData.codeAcceptancePoint || null, // Assuming same as above for now
    WagonNo_18: null, // This field is null in the API response, keep as null
    DeliveryStationName: formData.codeStationServing || null, // Assuming this maps from codeStationServing
    DeliveryCountryName: formData.deliveryCountryName || null, // Need to confirm where this comes from or if it's new
    NameForAcceptancePoint_16: formData.acceptanceFrom || null, // This mapping is a bit ambiguous, re-check if needed
    NameForAcceptancePoint_16_1: formData.acceptanceFrom || null, // This mapping is a bit ambiguous, re-check if needed
  });

  const mapFormToPaymentInstructionPayload = (paymentFormData: Record<string, any>,placeAndDateFormData: Record<string, any>) => ({
    PaymentInstructionDescriptionvalue1: paymentFormData.paymentInstruction1 || null,
    PaymentInstructionDescriptionvalue2: paymentFormData.paymentInstruction2 || null,
    CarriageChargePaid: paymentFormData.carriageChargePaid ? 1 : 0,
    IncoTerms: placeAndDateFormData.incoTerms ? "1" : "0", // Assuming IncoTerms is from placeAndDateFormData
    Incotermsvalue: "Fleet On Board", // This might need to be dynamic if there's a form field for it
    PlaceAndDateMadeOut_29_value1: placeAndDateFormData.place || null,
    PlaceAndDateMadeOut_29_value2: placeAndDateFormData.dateMadeOut || null,
  });

  const mapFormToConsignorDeclarationsPayload = (formData: Record<string, any>) => ({
    ConsignorsDeclarations_7: formData.consignorDeclarations || null,
    DocumentsAttached_9: formData.documentsAttached || null,
    CommercialSpecifications_13: formData.commercialSpecifications || null,
    InformationForTheConsignee_15: formData.informationForConsignee || null,
  });

  const mapFormToValueDeliveryCashPayload = (formData: Record<string, any>) => ({
    DeclarationOfValue_26: formData.declarationOfValue || null,
    InterestInDelivery_27: formData.interestInDelivery || null,
    CashOnDelivery_28: formData.cashOnDelivery || null,
  });

  const mapFormToCodingBoxesPayload = (formData: Record<string, any>) => ({
    CodingBox_1_40: formData.codingBox1 || null,
    CodingBox_2_41: formData.codingBox2 || null,
    CodingBox_3_42: formData.codingBox3 || null,
    CodingBox_4_43: formData.codingBox4 || null,
    CodingBox_5_44: formData.codingBox5 || null,
    CodingBox_6_45: formData.codingBox6 || null,
    CodingBox_7_46: formData.codingBox7 || null,
    CodingBox_8_47: formData.codingBox8 || null,
  });

  const mapFormToExaminationDetailsPayload = (formData: Record<string, any>) => ({
    Examination_48: formData.examination || null,
    PrepaymentCoding_49: formData.prepaymentCoding || null,
    ChargesNote_52: formData.chargesNote ? 1 : 0,
    CashOnDeliveryReceipt_53: formData.cashOnDeliveryReceipt || null,
    FormalReport_54: formData.formalReport || null,
    ExtensionOfTransitPeriod_55: formData.extensionOfTransitPeriod || null,
    DateOfArrival_59: formData.dateOfArrival || null,
    MadeAvailable_60: formData.madeAvailable || null,
    AcknowledgementOfReceipt_61: formData.acknowledgementOfReceipt || null,
  });

  const mapFormToSectionAPayload = (formData: Record<string, any>) => ({
    CodeForChargingSections_70: formData.codeForChargingSections || null,
    RouteCode_71: formData.routeCode || null,
    NHMCode_72: formData.nhmCode || null,
    Currency_73: formData.currency || null,
    ChargedMassWeight_74: formData.chargedMassWeight || null,
    CustomerAgreementOrTariffApplied_75: formData.customerAgreementOrTariffApplied || null,
    KMZone_76: formData.kmZone || null,
    SupplementsFeesDeductions_77: formData.supplementsFeesDeductions || null,
    UnitPrice_78: formData.unitPrice || null,
    Charges_79: formData.charges || null,
  });

  const mapFormToSectionBPayload = (formData: Record<string, any>) => ({
    CodeForChargingSections_70: formData.codeForChargingSectionsB || null,
    RouteCode_71: formData.routeCodeB || null,
    NHMCode_72: formData.nhmCodeB || null,
    Currency_73: formData.currencyB || null,
    ChargedMassWeight_74: formData.chargedMassWeightB || null,
    CustomerAgreementOrTariffApplied_75: formData.customerAgreementOrTariffAppliedB || null,
    KMZone_76: formData.kmZoneB || null,
    SupplementsFeesDeductions_77: formData.supplementsFeesDeductionsB || null,
    UnitPrice_78: formData.unitPriceB || null,
    Charges_79: formData.chargesB || null,
  });

  const mapFormToSectionCPayload = (formData: Record<string, any>) => ({
    CodeForChargingSections_70: formData.codeForChargingSectionsC || null,
    RouteCode_71: formData.routeCodeC || null,
    NHMCode_72: formData.nhmCodeC || null,
    Currency_73: formData.currencyC || null,
    ChargedMassWeight_74: formData.chargedMassWeightC || null,
    CustomerAgreementOrTariffApplied_75: formData.customerAgreementOrTariffAppliedC || null,
    KMZone_76: formData.kmZoneC || null,
    SupplementsFeesDeductions_77: formData.supplementsFeesDeductionsC || null,
    UnitPrice_78: formData.unitPriceC || null,
    Charges_79: formData.chargesC || null,
  });

  // Effect to set form values when API response is received
  useEffect(() => {
    if (apiResponse) {
      if (headerTemplateRef.current && apiResponse.Header) {
        // Map API response to headerTemplate form fields
        headerTemplateRef.current.setFormValues({
          templateId: apiResponse.Header.TemplateID,
          templateDescription: apiResponse.Header.Description,
          templateType: apiResponse.Header.DocType,
        });
      }
      if (generalDetailsRef.current && apiResponse.General?.Details) {
        const apiDetails = apiResponse.General.Details;
        const transformedDetails = {
          consignor: apiDetails.Consignor_1_value1, // Assuming this is the main consignor value
          consignorDescription: apiDetails.ConsignorName_value2, // Assuming this is the description
          customerCodeConsignor: apiDetails.CustomerCodeForConsignor_2,
          customerCodePrePaid: apiDetails.CustomerCodeForPayerOfPrePaidCharges_3,
          consignee: apiDetails.Consignee_4_value1,
          consigneeDescription: apiDetails.ConsigneeName_4_value2,
          customerCodeConsignee: apiDetails.CustomerCodeForConsignee_5,
          customerCodeNonPrePaid: apiDetails.CustomerCodeForPayerOfNonPrePaidCharges_6,
          consignorReference: apiDetails.ConsignorsReference_8_value1,
          consignorReferenceDescription: apiDetails.ConsignorsReference_8_value2,
          deliveryPoint: apiDetails.DeliveryPoint_10_4_value1,
          deliveryPointDescription: apiDetails.DeliveryPoint_10_4_value2,
          codeDeliveryPoint: apiDetails.CodeForDeliveryPoint_11_value1,
          codeStationServing: apiDetails.CodeForStationServingDeliveryPoint_12_value1,
          customerAgreementTariff: apiDetails.NumberOfCustomerAgreementOrTariff_14,
          acceptanceDate: apiDetails.AcceptanceDate_16_2, // Assuming it's already in YYYY-MM-DD or compatible format
          acceptanceFrom: apiDetails.AcceptanceFrom_16_3,
          codeAcceptancePoint: apiDetails.CodeForAcceptancePoint_17,
        };
        generalDetailsRef.current.setFormValues(transformedDetails);
      }
      if (paymentInstructionRef.current && apiResponse.General?.PaymentInstruction) {
        // Map API response to paymentInstruction form fields
        paymentInstructionRef.current.setFormValues({
          paymentInstruction1: apiResponse.General.PaymentInstruction.PaymentInstructionDescriptionvalue1,
          paymentInstruction2: apiResponse.General.PaymentInstruction.PaymentInstructionDescriptionvalue2,
          carriageChargePaid: apiResponse.General.PaymentInstruction.CarriageChargePaid === 1, // Convert to boolean
          incoTerms: apiResponse.General.PaymentInstruction.IncoTerms === "1", // Convert to boolean
        });
      }
      if (placeAndDateRef.current && apiResponse.General?.PaymentInstruction) {
        // Map API response to placeAndDate form fields
        placeAndDateRef.current.setFormValues({
          place: apiResponse.General.PaymentInstruction.PlaceAndDateMadeOut_29_value1,
          dateMadeOut: apiResponse.General.PaymentInstruction.PlaceAndDateMadeOut_29_value2,
        });
      }

      if (consignorDeclarationsRef.current && apiResponse.Declarations) {
        consignorDeclarationsRef.current.setFormValues({
          consignorDeclarations: apiResponse.Declarations.ConsignorsDeclarations_7,
          documentsAttached: apiResponse.Declarations.DocumentsAttached_9,
          commercialSpecifications: apiResponse.Declarations.CommercialSpecifications_13,
          informationForConsignee: apiResponse.Declarations.InformationForTheConsignee_15,
        });
      }

      if (valueDeliveryCashRef.current && apiResponse.Declarations) {
        valueDeliveryCashRef.current.setFormValues({
          declarationOfValue: apiResponse.Declarations.DeclarationOfValue_26,
          interestInDelivery: apiResponse.Declarations.InterestInDelivery_27,
          cashOnDelivery: apiResponse.Declarations.CashOnDelivery_28,
        });
      }

      if (codingBoxesRef.current && apiResponse.Declarations) {
        codingBoxesRef.current.setFormValues({
          codingBox1: apiResponse.Declarations.CodingBox_1_40,
          codingBox2: apiResponse.Declarations.CodingBox_2_41,
          codingBox3: apiResponse.Declarations.CodingBox_3_42,
          codingBox4: apiResponse.Declarations.CodingBox_4_43,
          codingBox5: apiResponse.Declarations.CodingBox_5_44,
          codingBox6: apiResponse.Declarations.CodingBox_6_45,
          codingBox7: apiResponse.Declarations.CodingBox_7_46,
          codingBox8: apiResponse.Declarations.CodingBox_8_47,
        });
      }

      if (examinationDetailsRef.current && apiResponse.Declarations) {
        examinationDetailsRef.current.setFormValues({
          examination: apiResponse.Declarations.Examination_48,
          prepaymentCoding: apiResponse.Declarations.PrepaymentCoding_49,
          chargesNote: apiResponse.Declarations.ChargesNote_52 === 1,
          cashOnDeliveryReceipt: apiResponse.Declarations.CashOnDeliveryReceipt_53,
          formalReport: apiResponse.Declarations.FormalReport_54,
          extensionOfTransitPeriod: apiResponse.Declarations.ExtensionOfTransitPeriod_55,
          dateOfArrival: apiResponse.Declarations.DateOfArrival_59,
          madeAvailable: apiResponse.Declarations.MadeAvailable_60,
          acknowledgementOfReceipt: apiResponse.Declarations.AcknowledgementOfReceipt_61,
        });
      }

      if (sectionARef.current && apiResponse.Declarations?.SectionA) {
        sectionARef.current.setFormValues({
          codeForChargingSections: apiResponse.Declarations.SectionA.CodeForChargingSections_70,
          routeCode: apiResponse.Declarations.SectionA.RouteCode_71,
          nhmCode: apiResponse.Declarations.SectionA.NHMCode_72,
          currency: apiResponse.Declarations.SectionA.Currency_73,
          chargedMassWeight: apiResponse.Declarations.SectionA.ChargedMassWeight_74,
          customerAgreementOrTariffApplied: apiResponse.Declarations.SectionA.CustomerAgreementOrTariffApplied_75,
          kmZone: apiResponse.Declarations.SectionA.KMZone_76,
          supplementsFeesDeductions: apiResponse.Declarations.SectionA.SupplementsFeesDeductions_77,
          unitPrice: apiResponse.Declarations.SectionA.UnitPrice_78,
          charges: apiResponse.Declarations.SectionA.Charges_79,
        });
      }

      if (sectionBRef.current && apiResponse.Declarations?.SectionB) {
        sectionBRef.current.setFormValues({
          codeForChargingSectionsB: apiResponse.Declarations.SectionB.CodeForChargingSections_70,
          routeCodeB: apiResponse.Declarations.SectionB.RouteCode_71,
          nhmCodeB: apiResponse.Declarations.SectionB.NHMCode_72,
          currencyB: apiResponse.Declarations.SectionB.Currency_73,
          chargedMassWeightB: apiResponse.Declarations.SectionB.ChargedMassWeight_74,
          customerAgreementOrTariffAppliedB: apiResponse.Declarations.SectionB.CustomerAgreementOrTariffApplied_75,
          kmZoneB: apiResponse.Declarations.SectionB.KMZone_76,
          supplementsFeesDeductionsB: apiResponse.Declarations.SectionB.SupplementsFeesDeductions_77,
          unitPriceB: apiResponse.Declarations.SectionB.UnitPrice_78,
          chargesB: apiResponse.Declarations.SectionB.Charges_79,
        });
      }

      if (sectionCRef.current && apiResponse.Declarations?.SectionC) {
        sectionCRef.current.setFormValues({
          codeForChargingSectionsC: apiResponse.Declarations.SectionC.CodeForChargingSections_70,
          routeCodeC: apiResponse.Declarations.SectionC.RouteCode_71,
          nhmCodeC: apiResponse.Declarations.SectionC.NHMCode_72,
          currencyC: apiResponse.Declarations.SectionC.Currency_73,
          chargedMassWeightC: apiResponse.Declarations.SectionC.ChargedMassWeight_74,
          customerAgreementOrTariffAppliedC: apiResponse.Declarations.SectionC.CustomerAgreementOrTariffApplied_75,
          kmZoneC: apiResponse.Declarations.SectionC.KMZone_76,
          supplementsFeesDeductionsC: apiResponse.Declarations.SectionC.SupplementsFeesDeductions_77,
          unitPriceC: apiResponse.Declarations.SectionC.UnitPrice_78,
          chargesC: apiResponse.Declarations.SectionC.Charges_79,
        });
      }
    }
  }, []);

  // Handle save template
  const handleSaveTemplate = () => {
    console.log('Save template clicked');
    if (!initialApiResponse) {
      console.error("Initial API response not loaded yet.");
      return;
    }

    const currentHeaderValues = headerTemplateRef.current?.getFormValues();
    const currentGeneralDetailsValues = generalDetailsRef.current?.getFormValues();
    const currentPaymentInstructionValues = paymentInstructionRef.current?.getFormValues();
    const currentPlaceAndDateValues = placeAndDateRef.current?.getFormValues();
    const currentConsignorDeclarationsValues = consignorDeclarationsRef.current?.getFormValues();
    const currentValueDeliveryCashValues = valueDeliveryCashRef.current?.getFormValues();
    const currentCodingBoxesValues = codingBoxesRef.current?.getFormValues();
    const currentExaminationDetailsValues = examinationDetailsRef.current?.getFormValues();
    const currentSectionAValues = sectionARef.current?.getFormValues();
    const currentSectionBValues = sectionBRef.current?.getFormValues();
    const currentSectionCValues = sectionCRef.current?.getFormValues();

    // Transform current form values to match API payload structure
    const newHeader = mapFormToHeaderPayload(currentHeaderValues);
    const newGeneralDetails = mapFormToGeneralDetailsPayload(currentGeneralDetailsValues);
    const newPaymentInstruction = mapFormToPaymentInstructionPayload(
      currentPaymentInstructionValues,
      currentPlaceAndDateValues
    );
    const newConsignorDeclarations = mapFormToConsignorDeclarationsPayload(currentConsignorDeclarationsValues);
    const newValueDeliveryCash = mapFormToValueDeliveryCashPayload(currentValueDeliveryCashValues);
    const newCodingBoxes = mapFormToCodingBoxesPayload(currentCodingBoxesValues);
    const newExaminationDetails = mapFormToExaminationDetailsPayload(currentExaminationDetailsValues);
    const newSectionA = mapFormToSectionAPayload(currentSectionAValues);
    const newSectionB = mapFormToSectionBPayload(currentSectionBValues);
    const newSectionC = mapFormToSectionCPayload(currentSectionCValues);

    // Debugging logs
    console.log("--- Debugging deepEqual ---");
    console.log("newHeader:", newHeader);
    console.log("initialApiResponse.Header:", initialApiResponse.Header);
    console.log("deepEqual(newHeader, initialApiResponse.Header):", deepEqual(newHeader, initialApiResponse.Header));

    console.log("newGeneralDetails:", newGeneralDetails);
    console.log("initialApiResponse.General.Details:", initialApiResponse.General.Details);
    console.log("deepEqual(newGeneralDetails, initialApiResponse.General.Details):", deepEqual(newGeneralDetails, initialApiResponse.General.Details));

    console.log("newPaymentInstruction:", newPaymentInstruction);
    console.log("initialApiResponse.General.PaymentInstruction:", initialApiResponse.General.PaymentInstruction);
    console.log("deepEqual(newPaymentInstruction, initialApiResponse.General.PaymentInstruction):", deepEqual(newPaymentInstruction, initialApiResponse.General.PaymentInstruction));

    console.log("newConsignorDeclarations:", newConsignorDeclarations);
    console.log("initialApiResponse.Declarations:", initialApiResponse.Declarations);
    console.log("deepEqual(newConsignorDeclarations, initialApiResponse.Declarations):", deepEqual(newConsignorDeclarations, initialApiResponse.Declarations));

    console.log("newValueDeliveryCash:", newValueDeliveryCash);
    console.log("initialApiResponse.Declarations:", initialApiResponse.Declarations);
    console.log("deepEqual(newValueDeliveryCash, initialApiResponse.Declarations):", deepEqual(newValueDeliveryCash, initialApiResponse.Declarations));

    console.log("newCodingBoxes:", newCodingBoxes);
    console.log("initialApiResponse.Declarations:", initialApiResponse.Declarations);
    console.log("deepEqual(newCodingBoxes, initialApiResponse.Declarations):", deepEqual(newCodingBoxes, initialApiResponse.Declarations));

    console.log("newExaminationDetails:", newExaminationDetails);
    console.log("initialApiResponse.Declarations?.Examination:", initialApiResponse.Declarations?.Examination);
    console.log("deepEqual(newExaminationDetails, initialApiResponse.Declarations?.Examination):", deepEqual(newExaminationDetails, initialApiResponse.Declarations?.Examination));

    console.log("newSectionA:", newSectionA);
    console.log("initialApiResponse.Declarations?.SectionA:", initialApiResponse.Declarations?.SectionA);
    console.log("deepEqual(newSectionA, initialApiResponse.Declarations?.SectionA):", deepEqual(newSectionA, initialApiResponse.Declarations?.SectionA));

    console.log("newSectionB:", newSectionB);
    console.log("initialApiResponse.Declarations?.SectionB:", initialApiResponse.Declarations?.SectionB);
    console.log("deepEqual(newSectionB, initialApiResponse.Declarations?.SectionB):", deepEqual(newSectionB, initialApiResponse.Declarations?.SectionB));

    console.log("newSectionC:", newSectionC);
    console.log("initialApiResponse.Declarations?.SectionC:", initialApiResponse.Declarations?.SectionC);
    console.log("deepEqual(newSectionC, initialApiResponse.Declarations?.SectionC):", deepEqual(newSectionC, initialApiResponse.Declarations?.SectionC));
    console.log("---------------------------");

    // Determine ModeFlag for each section
    const headerModeFlag = deepEqual(newHeader, initialApiResponse.Header) ? "NoChange" : "Update";
    const generalDetailsModeFlag = deepEqual(newGeneralDetails, initialApiResponse.General.Details) ? "NoChange" : "Update";
    const paymentInstructionModeFlag = deepEqual(newPaymentInstruction, initialApiResponse.General.PaymentInstruction) ? "NoChange" : "Update";
    const consignorDeclarationsModeFlag = deepEqual(newConsignorDeclarations, initialApiResponse.Declarations) ? "NoChange" : "Update";
    const valueDeliveryCashModeFlag = deepEqual(newValueDeliveryCash, initialApiResponse.Declarations) ? "NoChange" : "Update";
    const codingBoxesModeFlag = deepEqual(newCodingBoxes, initialApiResponse.Declarations) ? "NoChange" : "Update";
    const examinationDetailsModeFlag = deepEqual(newExaminationDetails, initialApiResponse.Declarations?.Examination) ? "NoChange" : "Update";
    const sectionAModeFlag = deepEqual(newSectionA, initialApiResponse.Declarations?.SectionA) ? "NoChange" : "Update";
    const sectionBModeFlag = deepEqual(newSectionB, initialApiResponse.Declarations?.SectionB) ? "NoChange" : "Update";
    const sectionCModeFlag = deepEqual(newSectionC, initialApiResponse.Declarations?.SectionC) ? "NoChange" : "Update";

    const finalPayload = {
      Header: {
        ...newHeader,
        ModeFlag: headerModeFlag,
      },
      General: {
        Details: {
          ...newGeneralDetails,
          ModeFlag: generalDetailsModeFlag,
        },
        PaymentInstruction: {
          ...newPaymentInstruction,
          ModeFlag: paymentInstructionModeFlag,
        },
        Declarations: { // Adding Declarations section
          ...newConsignorDeclarations,
          ...newValueDeliveryCash,
          ...newCodingBoxes,
          ...newExaminationDetails,
          SectionA: newSectionA,
          SectionB: newSectionB,
          SectionC: newSectionC,
          ModeFlag: (
            consignorDeclarationsModeFlag === "Update" ||
            valueDeliveryCashModeFlag === "Update" ||
            codingBoxesModeFlag === "Update" ||
            examinationDetailsModeFlag === "Update" ||
            sectionAModeFlag === "Update" ||
            sectionBModeFlag === "Update" ||
            sectionCModeFlag === "Update"
          ) ? "Update" : "NoChange",
        },
      },
    };

    console.log("Final Payload to API:", JSON.stringify(finalPayload, null, 2));
    // Here you would call your API service, e.g.:
    // quickOrderService.saveTemplate(finalPayload);

  };

  return (
    <div className="main-content-h bg-gray-100">
        <div className="mt-6">
          <div className=''>
            <DynamicPanel
              ref={headerTemplateRef} // New Panel
              panelId="header-template"
              panelOrder={0} // Render before general details
              panelTitle="Template"
              panelConfig={headerTemplateConfig} // New Config
              formName="headerTemplateForm"
              initialData={headerTemplateData}
              // onDataChange={handleHeaderTemplateDataChange}
              panelWidth="full"
              collapsible={true} // Added collapsible prop
              showHeader={false} // Hide header to match screenshot
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-12">
            <TabsList className="grid w-2/6 grid-cols-4 bg-gray-100 border border-gray-200 rounded-md p-0">
              <TabsTrigger
                  value="general"
                  className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === 'general'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                  General
              </TabsTrigger>
              <TabsTrigger
                  value="declarations"
                  className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === 'declarations'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                  Declarations
              </TabsTrigger>
              <TabsTrigger
                  value="route"
                  className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === 'route'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                  Route
              </TabsTrigger>
              <TabsTrigger
                  value="wagon-info"
                  className={`px-4 py-2 text-sm font-medium transition-all rounded-sm ${
                  activeTab === 'wagon-info'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                  Wagon Info
              </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <div className=''>
                  <div className="">
                    <div className=''>
                      <DynamicPanel
                        ref={generalDetailsRef}
                        panelId="general-details"
                        panelOrder={1}
                        panelTitle="General Details"
                        panelIcon={<FileText className="w-5 h-5 text-blue-500" />}
                        panelConfig={generalDetailsConfig}
                        formName="generalDetailsForm"
                        initialData={generalDetailsData}
                        // onDataChange={handleGeneralDataChange}
                        panelWidth="full"
                        collapsible={true} // Added collapsible prop
                      />
                      <div className="flex justify-start mb-6 bg-white py-3 px-4 border-t border-gray-200" style={{marginTop: '-25px'}}>
                        <Button
                            onClick={handleAddConsignorConsignee}
                            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Consignor/Consignee
                        </Button>
                      </div>
                    </div>

                    {/* New Payment Instruction Panel */}
                    <DynamicPanel
                      ref={paymentInstructionRef}
                      panelId="payment-instruction"
                      panelOrder={2}
                      panelTitle="Payment Instruction [20]"
                      panelConfig={paymentInstructionConfig}
                      formName="paymentInstructionForm"
                      initialData={paymentInstructionData}
                      // onDataChange={handlePaymentInstructionDataChange}
                      panelWidth="full"
                      collapsible={true} // Added collapsible prop
                    />

                    {/* New Place and Date Made Out Panel */}
                    <DynamicPanel
                      ref={placeAndDateRef}
                      panelId="place-and-date"
                      panelOrder={3}
                      panelTitle="Place and Date Made Out [29]"
                      panelConfig={placeAndDateConfig}
                      formName="placeAndDateForm"
                      initialData={placeAndDateData}
                      // onDataChange={handlePlaceAndDateDataChange}
                      panelWidth="full"
                      collapsible={true} // Added collapsible prop
                    />                    
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="declarations" className="mt-6">
                <div className="">
                  <DynamicPanel
                    ref={consignorDeclarationsRef}
                    panelId="consignor-declarations"
                    panelOrder={1}
                    panelTitle="Declarations and Information"
                    panelConfig={consignorDeclarationsConfig}
                    formName="consignorDeclarationsForm"
                    initialData={consignorDeclarationsData}
                    panelWidth="full"
                    collapsible={true}
                  />
                  <DynamicPanel
                    ref={valueDeliveryCashRef}
                    panelId="value-delivery-cash"
                    panelOrder={2}
                    panelTitle="Value and Delivery Details"
                    panelConfig={valueDeliveryCashConfig}
                    formName="valueDeliveryCashForm"
                    initialData={valueDeliveryCashData}
                    panelWidth="full"
                    collapsible={true}
                  />
                  <DynamicPanel
                    ref={codingBoxesRef}
                    panelId="coding-boxes"
                    panelOrder={3}
                    panelTitle="Coding Boxes"
                    panelConfig={codingBoxesConfig}
                    formName="codingBoxesForm"
                    initialData={codingBoxesData}
                    panelWidth="full"
                    collapsible={true}
                  />
                  <DynamicPanel
                    ref={examinationDetailsRef}
                    panelId="examination-details"
                    panelOrder={4}
                    panelTitle="Examination and Other Details"
                    panelConfig={examinationDetailsConfig}
                    formName="examinationDetailsForm"
                    initialData={examinationDetailsData}
                    panelWidth="full"
                    collapsible={true}
                  />
                  <DynamicPanel
                    ref={sectionARef}
                    panelId="section-a"
                    panelOrder={5}
                    panelTitle="Section A"
                    panelConfig={sectionAConfig}
                    formName="sectionAForm"
                    initialData={sectionAData}
                    panelWidth="full"
                    collapsible={true}
                  />
                  <DynamicPanel
                    ref={sectionBRef}
                    panelId="section-b"
                    panelOrder={6}
                    panelTitle="Section B"
                    panelConfig={sectionBConfig}
                    formName="sectionBForm"
                    initialData={sectionBData}
                    panelWidth="full"
                    collapsible={true}
                  />
                  <DynamicPanel
                    ref={sectionCRef}
                    panelId="section-c"
                    panelOrder={7}
                    panelTitle="Section C"
                    panelConfig={sectionCConfig}
                    formName="sectionCForm"
                    initialData={sectionCData}
                    panelWidth="full"
                    collapsible={true}
                  />
              </div>
              </TabsContent>

              <TabsContent value="route" className="mt-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Route</h2>
                  <p className="text-gray-500">Route content will be added here.</p>
              </div>
              </TabsContent>

              <TabsContent value="wagon-info" className="mt-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Wagon Info</h2>
                  <p className="text-gray-500">Wagon Info content will be added here.</p>
              </div>
              </TabsContent>
        </Tabs>
        </div>

        {/* Fixed Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
        <div className="flex items-center gap-4"></div>
          <div className="flex items-center gap-4">
            <button className={buttonCancel}>Cancel</button>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm"
              onClick={handleSaveTemplate}
            >
              Save
            </button>
          </div>
        </div>
    </div>
  );
};

export default TemplateCreate;

