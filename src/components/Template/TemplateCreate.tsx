import React, { useState, useRef } from 'react';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { quickOrderService } from '@/api/services/quickOrderService';
import { FileText } from 'lucide-react';

const TemplateCreate = () => {
  const generalDetailsRef = useRef<DynamicPanelRef>(null);
  const headerTemplateRef = useRef<DynamicPanelRef>(null); // New Ref
  const paymentInstructionRef = useRef<DynamicPanelRef>(null); // New Ref
  const placeAndDateRef = useRef<DynamicPanelRef>(null); // New Ref

  const [generalDetailsData, setGeneralDetailsData] = useState<Record<string, any>>({});
  const [headerTemplateData, setHeaderTemplateData] = useState<Record<string, any>>({}); // New State
  const [paymentInstructionData, setPaymentInstructionData] = useState<Record<string, any>>({}); // New State
  const [placeAndDateData, setPlaceAndDateData] = useState<Record<string, any>>({}); // New State
  const [activeTab, setActiveTab] = useState('general');

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

  const handleAddConsignorConsignee = () => {
    console.log('Add Consignor/Consignee clicked');
    // Add your logic here
  };

  const handleGeneralDataChange = (updatedData: Record<string, any>) => {
    setGeneralDetailsData(updatedData);
  };

  const handleHeaderTemplateDataChange = (updatedData: Record<string, any>) => {
    setHeaderTemplateData(updatedData);
  };

  const handlePaymentInstructionDataChange = (updatedData: Record<string, any>) => {
    setPaymentInstructionData(updatedData);
  };

  const handlePlaceAndDateDataChange = (updatedData: Record<string, any>) => {
    setPlaceAndDateData(updatedData);
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
              onDataChange={handleHeaderTemplateDataChange}
              panelWidth="full"
              collapsible={true} // Added collapsible prop
              showHeader={false} // Hide header to match screenshot
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                        onDataChange={handleGeneralDataChange}
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
                      onDataChange={handlePaymentInstructionDataChange}
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
                      onDataChange={handlePlaceAndDateDataChange}
                      panelWidth="full"
                      collapsible={true} // Added collapsible prop
                    />                    
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="declarations" className="mt-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Declarations</h2>
                  <p className="text-gray-500">Declarations content will be added here.</p>
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
    </div>
  );
};

export default TemplateCreate;

