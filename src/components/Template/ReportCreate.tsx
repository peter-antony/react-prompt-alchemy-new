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
import ConsignorConsigneeSideDraw from './ConsignorConsigneeSideDraw';
import { useSearchParams } from "react-router-dom"; 

const ReportCreate = () => {
    const [searchParams, setSearchParams] = useSearchParams(); // Import useSearchParams
    const workOrderNo = searchParams.get("id");
    const generalDetailsRef = useRef<DynamicPanelRef>(null);
    const WagonDetailsRef = useRef<DynamicPanelRef>(null);
    const RouteDetailsRef = useRef<DynamicPanelRef>(null);
    const RouteEndorsementDetailsRef = useRef<DynamicPanelRef>(null);
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
    const [thuQtyUomList, setThuQtyUomList] = useState<any[]>([]);
    const [currencyUomList, setCurrencyUomList] = useState<any[]>([]);
    const [isConsignorConsigneeSideDrawOpen, setIsConsignorConsigneeSideDrawOpen] = useState(false);
    const [consignorConsigneeData, setConsignorConsigneeData] = useState<any>(null);

    const initialSnapshotRef = useRef<any>(null);

    /** Normalize values to avoid false Update */
    const normalize = (obj: any) =>
    JSON.parse(
        JSON.stringify(obj, (_k, v) =>
        v === "" || v === undefined ? null : v
        )
    );

    const deepEqual = (obj1: any, obj2: any): boolean => {
        if (obj1 == obj2) return true;
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

    const resolveModeFlag = (
        current: any,
        initial: any,
        workOrderNo?: string
    ): "Insert" | "Update" | "NoChange" => {
        if (!workOrderNo) return "Insert";
        return deepEqual(
            normalize(current),
            normalize(initial)
        )
            ? "NoChange"
            : "Update";
    };

    const mapFormToHeaderPayload = (formData: Record<string, any>) => ({
        TemplateID: formData.templateId,
        Description: formData.templateDescription,
        DocType: formData.templateType,
        DispatchDocumentNo_value1: formData.dispatchDocNo,
        DispatchDocumentNo_value2: formData.dispatchDocNoDescription,
        UNDGCode: formData.unCode,
        TripPlanID: formData.tripPlanId,
        Wagon: formData.wagon,
        LVENo: formData.lveNo,
        CustomerCodeID_value1: formData.customerID,
        CustomerCodeID_value2: formData.customerIDDescription,
        ContractID: formData.contractID,
    });

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

    const getUomOptions = (list: any[]) =>
        list
            .filter(item => item.id && item.name) // remove empty row
            .map(item => ({
                label: item.name,
                value: item.id,
            }));


    const buildWeightWithUom = (
        value?: { input?: string; dropdown?: string } | null
    ): string | null => {
        if (!value?.input || !value?.dropdown) return null;
        return `${value.input} ${value.dropdown}`;
    };

    const splitIdName = (value: any) => {
      if (!value || typeof value !== "string") {
        return { id: "", name: "" };
      }

      if (value.includes("||")) {
        const [id, name] = value.split("||").map(v => v.trim());
        return { id, name };
      }

      return { id: value.trim(), name: "" };
    };

    const mapFormToGeneralDetailsPayload = (formData: Record<string, any>) => {
      const consignor = splitIdName(formData.consignor);
      const consignee = splitIdName(formData.consignee);

      const custConsignor = splitIdName(formData.customerCodeConsignor);
      const custPrePaid = splitIdName(formData.customerCodePrePaid);

      const custConsignee = splitIdName(formData.customerCodeConsignee);
      const custNonPrePaid = splitIdName(formData.customerCodeNonPrePaid);
      const consignorRef = splitIdName(formData.consignorReference);

      const deliveryPoint = splitIdName(formData.deliveryPoint);
      const codeDeliveryPoint = splitIdName(formData.codeDeliveryPoint);
      const stationServing = splitIdName(formData.codeStationServing);
      const acceptancePoint = splitIdName(formData.codeAcceptancePoint);

      return {
        // Consignor
        Consignor_1_value1: consignor.id,
        ConsignorName_value2: consignor.name,

        // Customer Code for Consignor
        CustomerCodeForConsignor_2: custConsignor.id,
        CustomerCodeForConsignor_value2: custConsignor.name,

        // Pre-paid payer
        CustomerCodeForPayerOfPrePaidCharges_3: custPrePaid.id,
        CustomerCodeForPayerOfPrePaidCharges_value3: custPrePaid.name,

        // Consignee
        Consignee_4_value1: consignee.id,
        ConsigneeName_4_value2: consignee.name,

        // Customer Code for Consignee
        CustomerCodeForConsignee_5: custConsignee.id,
        CustomerCodeForConsignee_value5: custConsignee.name,

        // Non-prepaid payer
        CustomerCodeForPayerOfNonPrePaidCharges_6: custNonPrePaid.id,
        CustomerCodeForPayerOfNonPrePaidCharges_value6: custNonPrePaid.name,

        // Consignor Reference

    ConsignorsReference_8_value1: consignorRef.id,
    ConsignorsReference_8_value2: consignorRef.name,
        // Delivery Point
        DeliveryPoint_10_4_value1: deliveryPoint.id,
        DeliveryPoint_10_4_value2: deliveryPoint.name,

        // Code for Delivery Point
        CodeForDeliveryPoint_11_value1: codeDeliveryPoint.id,
        CodeForDeliveryPoint_11_value2: codeDeliveryPoint.name,

        // Code for Station Serving Delivery Point
        CodeForStationServingDeliveryPoint_12_value1: stationServing.id,
        CodeForStationServingDeliveryPoint_12_value2: stationServing.name,

        // Customer Agreement/Tariff No.
        NumberOfCustomerAgreementOrTariff_14: formData.customerAgreementTariff || null,

        // Acceptance Date
        AcceptanceDate_16_2: formData.acceptanceDate || null,

        // Acceptance From
        AcceptanceFrom_16_3: formData.acceptanceFrom || null,

        // Code for Acceptance Point
        CodeForAcceptancePoint_17: acceptancePoint.id || null,
        CodeForAcceptancePoint_17_1: acceptancePoint.name || null,
        
      };
    };

    const mapFormToPaymentInstructionPayload = (paymentFormData: Record<string, any>,placeAndDateFormData: Record<string, any>) => ({
      PaymentInstructionDescription_20_value1: paymentFormData.paymentInstruction1 || null,
      PaymentInstructionDescription_20_value2: paymentFormData.paymentInstruction2 || null,
      PaymentInstructionDescription_20_value3: paymentFormData.paymentInstruction3 || null,
      CarriageChargePaid_20: paymentFormData.carriageChargePaid ? 1 : 0,
      IncoTerms_20: paymentFormData.incoTerms ? "1" : "0", 
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
      DeclarationOfValue_26_value1: formData.declarationOfValue || null,
      InterestInDelivery_27_value1: formData.interestInDelivery || null,
      CashOnDelivery_28_value1: formData.cashOnDelivery?.input || null,
      CashOnDelivery_28_value2: formData.cashOnDelivery?.dropdown || null,
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

    const mapFormToRoutePayload = (formData: Record<string, any>) => {
      const country = splitIdName(formData.Country);
      const station = splitIdName(formData.Station);
      const enterprise = splitIdName(formData.UndertakingEnterprise);

      return {
        ConsignmentNo_62_6: formData.ConsignmentNumber || "",

        // Country
        Country_62_1_value1: country.id,
        Country_62_1_value2: country.name,
        CountryValueText: formData.COuntryValue || "",

        // Station
        Station_62_3_value1: station.id,
        Station_62_3_value2: station.name,
        StationValueText: formData.StationValue || "",

        // Undertaking Enterprise
        UndertakingEnterprises_62_5_value1: enterprise.id,
        UndertakingEnterprises_62_5_value2: enterprise.name,
        UndertakingEnterpriseValueText: formData.UndertakingEnterpriseValue || "",
      };
    };

    const mapFormToRouteEndorsementPayload = (formData: Record<string, any>) => {
      const contractualCarrier = splitIdName(formData.ContractualCarrier);

      return {
        CustomsEndorsements_99: formData.CustomsEndorsements_99 || null,
        Route_50: formData.Route_50 || null,
        CustomsProcedure_51_27_value1: formData.CustomsProcedures || null,
        CustomsProcedure_51_27_value2: formData.CustomsProcedures || null,
        ContractualCarrier_58a_value1: contractualCarrier.id || null,
        ContractualCarrier_58a_value2: contractualCarrier.name || null,
        EnterContractualCarrier_58a: formData.EnterContractual || null,
        SimplifiedTransitProcedureForRail_58b_value1:
          formData.TransitProcedure ? "1" : "0",
        SimplifiedTransitProcedureForRail_58b_value2:
          formData.EnterTransitProcedure || null,
      };
    };

    const mapFormToWagonPayload = (formData: Record<string, any>) => {
      const train = splitIdName(formData.train);
      const uti = splitIdName(formData.UTICODE);
      const nhm = splitIdName(formData.NHMCode);

      return {
        WagonNo: formData.wagonNumber || "",
        GoodsDescription: formData.DescriptionoftheGoods || "",

        Exceptional_Consignment_22: formData.ExceptionalConsignment ? 1 : 0,
        RID: formData.RID ? 1 : 0,

        UTIType: uti.id || "",
        NHMCode: nhm.id || "",

        LengthxWidthxheight_24: buildWeightWithUom(formData.LengthWidthHeight),
        Mark_and_Number_25: formData.MarkandNumber || "",
        Delivery_Note_Number_26: formData.DeliveryNoteNumber || "",
        Gross_Weight_25_19: buildWeightWithUom(formData.GrossWeight),
        Tare_Weight_25_20: buildWeightWithUom(formData.TareWeight),
        Net_Weight_25_21: buildWeightWithUom(formData.NetWeight),

        TotalMass: buildWeightWithUom(formData.TotalNetto),
        TotalBrut: buildWeightWithUom(formData.TotalBrutto),
        TotalTare: buildWeightWithUom(formData.TotalGross),

        Train_1: train.id || "",
        Itinerary_5: formData.itinerary || "",
        Page_9: formData.Page || "",
        Date_of_Dispatch_7: formData.dataOfDispatch || "",
        To_be_cleared_at_12: formData.toBeClearedAt || "",

        Fixed_Net_Weight_Train_13: buildWeightWithUom(formData.fixedNetTrain),
        NoNumber_14: Number(formData.number) || 0,
        Loading_Configuration_16: formData.LoadingConfiguration || "",

        // OPTIONAL API FIELDS (set to null if not in form)
        DangerGoods: null,
        MassWeight: null,
        BrutWeight: null,

        WagonLength: null,
        // ModeFlag: "Update"
      };
    };

    // New Header Template Panel Config
    const headerTemplateConfig: PanelConfig = {
      templateId: {
        id: 'templateId',
        label: 'Template ID/Description',
        fieldType: 'lazyselect',
        value: '',
        mandatory: true,
        visible: true,
        editable: true,
        order: 1,
        width: 'four',
        placeholder: 'CIM SEO Army Saarb | CUV SEO Grabowno Saar...',
        fetchOptions: fetchMaster('Template ID/Description Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      templateType: {
        id: 'templateType',
        label: '',
        fieldType: 'radio',
        value: 'CIM',
        mandatory: true,
        visible: true,
        editable: true,
        order: 2,
        width: 'four',
        options: [
          { label: 'CIM', value: 'CIM' },
          { label: 'CUV', value: 'CUV' },
        ],
        labelFlag: false, // Hide the label as per screenshot
      },
      dispatchDocNo: {
        id: 'dispatchDocNo',
        label: 'Dispatch Doc. No./CO No.',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 3,
        width: 'four',
        placeholder: 'Enter Dispatch Doc. No./CO No.',
        fetchOptions: fetchMaster('Dispatch Doc No Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      dispatchDocNoDescription: {
        id: 'dispatchDocNoDescription',
        label: '',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 4,
        width: 'four', // Assuming it takes half width next to dispatchDocNo
        placeholder: 'Description',
        labelFlag: false,
      },
      unCode: {
        id: 'unCode',
        label: 'UN Code',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        width: 'four',
        placeholder: 'Enter UN Code',
        fetchOptions: fetchMaster('UN Code Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      tripPlanId: {
        id: 'tripPlanId',
        label: 'Trip Plan ID',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
        width: 'four',
        placeholder: 'Enter Trip Plan ID',
        fetchOptions: fetchMaster('Trip Plan ID Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      wagon: {
        id: 'wagon',
        label: 'Wagon',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 7,
        width: 'four',
        placeholder: 'Enter Wagon',
        fetchOptions: fetchMaster('Wagon Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      lveNo: {
        id: 'lveNo',
        label: 'LVE No.',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 8,
        width: 'four',
        placeholder: 'Enter LVE No.',
      },
      customerID: {
        id: 'customerID',
        label: 'Customer ID/Description',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 9,
        width: 'four',
        placeholder: 'Enter ID/Descript...',
        fetchOptions: fetchMaster('Customer ID Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      customerIDDescription: {
        id: 'customerIDDescription',
        label: '',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 10,
        width: 'four',
        placeholder: 'Enter ID/Description',
        labelFlag: false,
      },
      contractID: {
        id: 'contractID',
        label: 'Contract ID/Description',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 11,
        width: 'four',
        placeholder: 'Enter Contract ID/Description',
        fetchOptions: fetchMaster('Contract ID Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
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
        fetchOptions: fetchMaster('Consignor CustomerCode2 Init'),
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
        fetchOptions: fetchMaster('Customercode for payer pre-paid charges_3 Init'),
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
        fetchOptions: fetchMaster('Consignee4 Init'),
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
        fetchOptions: fetchMaster('Consignee CustomerCode5 Init'),
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
        fetchOptions: fetchMaster('Customercode for payer Nonpre-paid charges_6 Init'),
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
        fetchOptions: fetchMaster('Consignors Reference8 Init'),
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
        fetchOptions: fetchMaster('Location Init'),
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
        fetchOptions: fetchMaster('Location Init'),
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
        fetchOptions: fetchMaster('Location Init'),
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
        fetchOptions: fetchMaster('Contract Init'),
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
        fetchOptions: fetchMaster('Location Init'),
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
        fetchOptions: fetchMaster('Location Init'),
        hideSearch: false,
        disableLazyLoading: false,
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
        fetchOptions: fetchMaster('Payment Instruction_20 Init'),
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
        fetchOptions: fetchMaster('Place_29 Init'),
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
        fetchOptions: fetchMaster('Currency Init'),
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
        fetchOptions: fetchMaster('Interest in delivery [27]'),
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
        fetchOptions: fetchMaster('Currency Init'),
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
      codeForChargingSectionsB: {
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
      routeCodeB: {
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
      nhmCodeB: {
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
      currencyB: {
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
      chargedMassWeightB: {
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
      customerAgreementOrTariffAppliedB: {
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
      kmZoneB: {
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
      supplementsFeesDeductionsB: {
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
      unitPriceB: {
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
      chargesB: {
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
      codeForChargingSectionsC: {
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
      routeCodeC: {
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
      nhmCodeC: {
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
      currencyC: {
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
      chargedMassWeightC: {
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
      customerAgreementOrTariffAppliedC: {
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
      kmZoneC: {
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
      supplementsFeesDeductionsC: {
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
      unitPriceC: {
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
      chargesC: {
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


    //wagon details panel config
    const wagonDetailsConfig: PanelConfig = {
      train: {
        id: 'train',
        label: 'train [1]',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 1,
        width: 'four',
        placeholder: 'Enter train',
      },
      itinerary: {
        id: 'itinerary',
        label: 'itinerary [5]',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 2,
        width: 'four',
        placeholder: 'Enter itinerary',
        labelFlag: true,
      },
      dataOfDispatch: {
        id: 'dataOfDispatch',
        label: 'Date of Dispatch [7]',
        fieldType: 'date',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 3,
        width: 'four',
        placeholder: 'Enter Date of Dispatch',
        hideSearch: false,
        disableLazyLoading: false,
      },
      Page: {
        id: 'Page',
        label: 'Page [9]',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 4,
        width: 'four',
        placeholder: 'Enter Customer Code for the Pay...',
        hideSearch: false,
      },
      toBeClearedAt: {
        id: 'toBeClearedAt',
        label: 'To Be Cleared At',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        width: 'four',
        placeholder: 'Enter To Be Cleared At',
        hideSearch: false,
      },
      fixedNetTrain: {
        id: 'fixedNetTrain',
        label: 'Fixed Net Train [13]',
        fieldType: 'inputdropdown',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
        width: 'four',
        placeholder: 'Enter Fixed Net Train [13]',
      },
      number: {
        id: 'number',
        label: 'No./Number [14]',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 7,
        width: 'four',
        placeholder: 'Enter number',
      },
      LoadingConfiguration: {
        id: 'LoadingConfiguration',
        label: 'Loading Configuration [16]',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 8,
        width: 'four',
        placeholder: 'Enter Customer Code for the Pay...',
      },
      wagonNumber: {
        id: 'wagonNumber',
        label: "Wagon No. [18]/[15]",
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 9,
        width: 'four',
        placeholder: 'Enter wagon number',

      },
       DescriptionoftheGoods: {
        id: 'DescriptionoftheGoods',
        label: "Description of the Goods [21]/[17]",
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 10,
        width: 'four',
        placeholder: 'Enter Description of the Goods',
      },
       ExceptionalConsignment: {
        id: 'incoTerms',
        label: 'Exceptional Consignment [22]',
        fieldType: 'checkbox',
        value: false,
        mandatory: false,
        visible: true,
        editable: true,
        order: 11,
        width: 'four',
      },
       RID: {
        id: 'RID',
        label: 'RID [23]/[28]',
        fieldType: 'checkbox',
        value: false,
        mandatory: false,
        visible: true,
        editable: true,
        order: 12,
        width: 'four',
      },
        UTICODE: {
        id: 'UTICODE',
        label: 'UTI Code (Intermodal Transport Unit) [23]',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 13,
        width: 'four',
        placeholder: 'Enter Place',
        fetchOptions: fetchMaster('UTI Code 23 Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      LengthWidthHeight: {
        id: 'LengthWidthHeight',
        label: "Length x Width x Height [24]",
        fieldType: 'inputdropdown',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 14,
        width: 'four',
        placeholder: 'Enter Tare Weight',
      },
      MarkandNumber: {
        id: 'MarkandNumber',
        label: "Mark and Number [25]",
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 15,
        width: 'four',
        placeholder: 'Enter Mark and Number',
      },
       DeliveryNoteNumber: {
        id: 'DeliveryNoteNumber',
        label: "Delivery Note Number [26]",
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 16,
        width: 'four',
        placeholder: 'Enter Delivery Note Number ',
      },
       NHMCode: {
        id: 'NHMCode',
        label: 'NHM Code [24]/[18]',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 17,
        width: 'four',
        placeholder: 'Enter NHM Code',
        fetchOptions: fetchMaster('NHM Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
       GrossWeight: {
    id: "GrossWeight",
    label: "Gross Weight [26]/[19]",
    fieldType: "inputdropdown",
    value: {
      dropdown: "",
      input: "",
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 18,
    width: "four",
    placeholder: "Enter Gross Weight",
    options: getUomOptions(thuQtyUomList),
  },

      TareWeight: {
    id: "TareWeight",
    label: "Tare Weight [25]/[20]",
    fieldType: "inputdropdown",
    value: {
      dropdown: "",
      input: "",
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 19,
    width: "four",
    placeholder: "Enter Tare Weight",
    options: getUomOptions(thuQtyUomList),
  },

      NetWeight: {
    id: "NetWeight",
    label: "Net Weight [25]/[20]",
    fieldType: "inputdropdown",
    value: {
      dropdown: "",
      input: "",
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 20,
    width: "four",
    placeholder: "Enter Net Weight",
    options: getUomOptions(thuQtyUomList),
  },

    TotalBrutto: {
    id: "TotalBrutto",
    label: "Total Brutto",
    fieldType: "inputdropdown",
    value: {
      dropdown: "",
      input: "",
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 21,
    width: "four",
    placeholder: "Total Brutto",
    options: getUomOptions(currencyUomList),
  },

      TotalNetto: {
    id: "TotalNetto",
    label: "Total Netto",
    fieldType: "inputdropdown",
    value: {
      dropdown: "",
      input: "",
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 22,
    width: "four",
    placeholder: "Total Netto",
    options: getUomOptions(currencyUomList),
  },

       TotalGross: {
    id: "TotalGross",
    label: "Total Gross",
    fieldType: "inputdropdown",
    value: {
      dropdown: "",
      input: "",
    },
    mandatory: false,
    visible: true,
    editable: true,
    order: 23,
    width: "four",
    placeholder: "Total Gross",
    options: getUomOptions(currencyUomList),
  },

    };

    //router details panel config
    const routeDetailsConfig: PanelConfig = {
      ConsignmentNumber: {
        id: 'ConsignmentNumber',
        label: 'Consignment Number',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 1,
        width: 'third',
        placeholder: 'Enter Consignment Number',
       
      },
      Country: {
        id: 'Country',
        label: 'Country',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 2,
        width: 'third',
        placeholder: 'Enter Country',
        labelFlag: true,
        fetchOptions: fetchMaster('Country Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      COuntryValue: {
        id: 'COuntryValue',
        label: "",
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 3,
        width: 'third',
        placeholder: 'Enter Country',
        hideSearch: false,
        disableLazyLoading: false,
      },
      Station: {
        id: 'Station',
        label: 'Station',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 4,
        width: 'two-thirds',
        placeholder: 'Enter Station',
        hideSearch: false,
           fetchOptions: fetchMaster('Location Init'),
        disableLazyLoading: false,
      },
      StationValue: {
        id: 'StationValue',
        label: '',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 4,
        width: 'third',
        placeholder: 'Enter Station Value',
        labelFlag: false,
      },
      UndertakingEnterprise: {
        id: 'UndertakingEnterprise',
        label: 'Undertaking Enterprise',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        width: 'two-thirds',
        placeholder: 'Undertaking Enterprise',
        hideSearch: false,
           fetchOptions: fetchMaster(' Contractual carrier_58_a Init'),
        disableLazyLoading: false,
      },
      UndertakingEnterpriseValue: {
        id: 'UndertakingEnterpriseValue',
        label: '',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
        width: 'third',
        placeholder: 'Enter Undertaking Enterprise Value',
        labelFlag: false,
      },
    };

    const routeDetailsCustomsEndorsementConfig: PanelConfig = {
      CustomsEndorsements_99: {
        id: 'CustomsEndorsements_99',
        label: 'Customs Endorsements [99]',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 1,
        width: 'third',
        placeholder: 'Enter Customs Endorsements',
       
      },
      Route_50: {
        id: 'Route_50',
        label: 'Route [50]',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 2,
        width: 'third',
        placeholder: 'Enter Route',
        labelFlag: true,
        fetchOptions: fetchMaster('Route ID Init'),
        hideSearch: false,
        disableLazyLoading: false,
      },
      CustomsProcedures: {
        id: 'CustomsProcedures',
        label: "CustomsProcedures [51]/[27]",
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 3,
        width: 'third',
        placeholder: 'Enter Customs Procedures',
        hideSearch: false,
        disableLazyLoading: false,
      },
      ContractualCarrier: {
        id: 'ContractualCarrier',
        label: 'ContractualCarrier [58 a]',
        fieldType: 'lazyselect',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 4,
        width: 'four',
        placeholder: 'Enter Contractual Carrier',
        hideSearch: false,
           fetchOptions: fetchMaster('Contractual carrier_58_a Init'),
        disableLazyLoading: false,
      },
      EnterContractual: {
        id: 'EnterContractual',
        label: '',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        width: 'four',
        placeholder: 'Enter Contractual Carrier',
        labelFlag: false,
      },
      TransitProcedure: {
        id: 'UndertakingEnterprise',
        label: 'Simplified Transit Procedure For Rail [56 b]',
        fieldType: 'checkbox',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
        width: 'four',
       
      },
      EnterTransitProcedure: {
        id: 'TransitProcedure',
        label: '',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 7,
        width: 'four',
        placeholder: 'Enter Simplified Transit Procedure For Rail',
        labelFlag: false,
      },
    };
    
    useEffect(() => {
        console.log("Report Create Page");
        fetchReportData(workOrderNo);
    }, []);

    useEffect(() => {
        const loadUomMasters = async () => {
            try {
                const [thuRes, currencyRes]: any = await Promise.all([
                    quickOrderService.getMasterCommonData({
                        messageType: "THU QTY UOM Init",
                    }),
                    quickOrderService.getMasterCommonData({
                        messageType: "Currency Init",
                    }),
                ]);
                console.log(JSON.parse(thuRes?.data?.ResponseData || "[]") , "123")
                setThuQtyUomList(JSON.parse(thuRes?.data?.ResponseData || "[]"));
                setCurrencyUomList(JSON.parse(currencyRes?.data?.ResponseData || "[]"));
            } catch (err) {
                console.error("UOM master API failed", err);
            }
        };

        loadUomMasters();
    }, []);

    // Function to fetch template data from API
    const fetchReportData = async (reportNo: string) => {
        console.log("Fetching report data for report No:", reportNo);
        try {
            const response = await CimCuvService.getReportDataByID(reportNo);
            console.log("response.data1", response);
            const responseData = JSON.parse((response as any).data?.ResponseData);
            console.log("response.data1", responseData);
        setApiResponse(responseData);
        setInitialApiResponse(responseData); // Store the initial response
      
        if (headerTemplateRef.current && responseData.Header) {
            const apiHeader = responseData.Header;
            headerTemplateRef.current.setFormValues({
                templateId: apiHeader.TemplateID,
                templateDescription: apiHeader.Description, // Assuming this is the description for template ID
                templateType: apiHeader.DocType,
                dispatchDocNo: apiHeader.DispatchDocumentNo_value1,
                dispatchDocNoDescription: apiHeader.DispatchDocumentNo_value2,
                unCode: apiHeader.UNDGCode,
                tripPlanId: apiHeader.TripPlanID,
                wagon: apiHeader.Wagon,
                lveNo: apiHeader.LVENo,
                customerID: apiHeader.CustomerCodeID_value1,
                customerIDDescription: apiHeader.CustomerCodeID_value2,
                contractID: apiHeader.ContractID,
            });
        }
    
        if (generalDetailsRef.current && responseData.General?.Details) {
            const apiDetails = responseData.General.Details;
            const transformedDetails = {
              consignor: apiDetails.Consignor_1_value1, 
              consignorDescription: apiDetails.ConsignorName_1_value2, 
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
              acceptanceDate: apiDetails.AcceptanceDate_16_2, 
              acceptanceFrom: apiDetails.AcceptanceFrom_16_3,
              codeAcceptancePoint: apiDetails.CodeForAcceptancePoint_17,
            };
            generalDetailsRef.current.setFormValues(transformedDetails);
          }
          if (paymentInstructionRef.current && responseData.General?.PaymentInstruction) {
            paymentInstructionRef.current.setFormValues({
              paymentInstruction1: responseData.General.PaymentInstruction.PaymentInstructionDescription_20_value1,
              paymentInstruction2: responseData.General.PaymentInstruction.PaymentInstructionDescription_20_value2,
              paymentInstruction3: responseData.General.PaymentInstruction.PaymentInstructionDescription_20_value3,
              carriageChargePaid: responseData.General.PaymentInstruction.CarriageChargePaid_20 === 1, 
              incoTerms: responseData.General.PaymentInstruction.IncoTerms_20 === "1", 
            });
          }
          if (placeAndDateRef.current && responseData.General?.PaymentInstruction) {
            placeAndDateRef.current.setFormValues({
              place: responseData.General.PaymentInstruction.PlaceAndDateMadeOut_29_value1,
              dateMadeOut: responseData.General.PaymentInstruction.PlaceAndDateMadeOut_29_value2,
            });
          }
    
          if (consignorDeclarationsRef.current && responseData.Declarations) {
            consignorDeclarationsRef.current.setFormValues({
              consignorDeclarations: responseData.Declarations.ConsignorsDeclarations_7,
              documentsAttached: responseData.Declarations.DocumentsAttached_9,
              commercialSpecifications: responseData.Declarations.CommercialSpecifications_13,
              informationForConsignee: responseData.Declarations.InformationForTheConsignee_15,
            });
          }
    
          if (valueDeliveryCashRef.current && responseData.Declarations) {
            valueDeliveryCashRef.current.setFormValues({
              declarationOfValue: responseData.Declarations.DeclarationOfValue_26_value1,
              interestInDelivery: responseData.Declarations.InterestInDelivery_27_value1,
              cashOnDelivery: {
                input: responseData.Declarations.CashOnDelivery_28_value1,
                dropdown: responseData.Declarations.CashOnDelivery_28_value2,
              },
            });
          }
    
          if (codingBoxesRef.current && responseData.Declarations) {
            codingBoxesRef.current.setFormValues({
              codingBox1: responseData.Declarations.CodingBox_1_40,
              codingBox2: responseData.Declarations.CodingBox_2_41,
              codingBox3: responseData.Declarations.CodingBox_3_42,
              codingBox4: responseData.Declarations.CodingBox_4_43,
              codingBox5: responseData.Declarations.CodingBox_5_44,
              codingBox6: responseData.Declarations.CodingBox_6_45,
              codingBox7: responseData.Declarations.CodingBox_7_46,
              codingBox8: responseData.Declarations.CodingBox_8_47,
            });
          }
    
          if (examinationDetailsRef.current && responseData.Declarations) {
            examinationDetailsRef.current.setFormValues({
              examination: responseData.Declarations.Examination_48,
              prepaymentCoding: responseData.Declarations.PrepaymentCoding_49,
              chargesNote: responseData.Declarations.ChargesNote_52 === 1,
              cashOnDeliveryReceipt: responseData.Declarations.CashOnDeliveryReceipt_53,
              formalReport: responseData.Declarations.FormalReport_54,
              extensionOfTransitPeriod: responseData.Declarations.ExtensionOfTransitPeriod_55,
              dateOfArrival: responseData.Declarations.DateOfArrival_59,
              madeAvailable: responseData.Declarations.MadeAvailable_60,
              acknowledgementOfReceipt: responseData.Declarations.AcknowledgementOfReceipt_61,
            });
          }
    
          if (sectionARef.current && responseData.Declarations?.SectionA) {
            sectionARef.current.setFormValues({
              codeForChargingSections: responseData.Declarations.SectionA.CodeForChargingSections_70,
              routeCode: responseData.Declarations.SectionA.RouteCode_71,
              nhmCode: responseData.Declarations.SectionA.NHMCode_72,
              currency: responseData.Declarations.SectionA.Currency_73,
              chargedMassWeight: responseData.Declarations.SectionA.ChargedMassWeight_74,
              customerAgreementOrTariffApplied: responseData.Declarations.SectionA.CustomerAgreementOrTariffApplied_75,
              kmZone: responseData.Declarations.SectionA.KMZone_76,
              supplementsFeesDeductions: responseData.Declarations.SectionA.SupplementsFeesDeductions_77,
              unitPrice: responseData.Declarations.SectionA.UnitPrice_78,
              charges: responseData.Declarations.SectionA.Charges_79,
            });
          }
    
          if (sectionBRef.current && responseData.Declarations?.SectionB) {
            sectionBRef.current.setFormValues({
              codeForChargingSectionsB: responseData.Declarations.SectionB.CodeForChargingSections_70,
              routeCodeB: responseData.Declarations.SectionB.RouteCode_71,
              nhmCodeB: responseData.Declarations.SectionB.NHMCode_72,
              currencyB: responseData.Declarations.SectionB.Currency_73,
              chargedMassWeightB: responseData.Declarations.SectionB.ChargedMassWeight_74,
              customerAgreementOrTariffAppliedB: responseData.Declarations.SectionB.CustomerAgreementOrTariffApplied_75,
              kmZoneB: responseData.Declarations.SectionB.KMZone_76,
              supplementsFeesDeductionsB: responseData.Declarations.SectionB.SupplementsFeesDeductions_77,
              unitPriceB: responseData.Declarations.SectionB.UnitPrice_78,
              chargesB: responseData.Declarations.SectionB.Charges_79,
            });
          }
    
          if (sectionCRef.current && responseData.Declarations?.SectionC) {
            sectionCRef.current.setFormValues({
              codeForChargingSectionsC: responseData.Declarations.SectionC.CodeForChargingSections_70,
              routeCodeC: responseData.Declarations.SectionC.RouteCode_71,
              nhmCodeC: responseData.Declarations.SectionC.NHMCode_72,
              currencyC: responseData.Declarations.SectionC.Currency_73,
              chargedMassWeightC: responseData.Declarations.SectionC.ChargedMassWeight_74,
              customerAgreementOrTariffAppliedC: responseData.Declarations.SectionC.CustomerAgreementOrTariffApplied_75,
              kmZoneC: responseData.Declarations.SectionC.KMZone_76,
              supplementsFeesDeductionsC: responseData.Declarations.SectionC.SupplementsFeesDeductions_77,
              unitPriceC: responseData.Declarations.SectionC.UnitPrice_78,
              chargesC: responseData.Declarations.SectionC.Charges_79,
            });
          }
    
          
    if (RouteDetailsRef.current && responseData?.ConsignmentDetails) {
      console.log("SETTING ROUTE VALUES NOW");
      const apiRoute = responseData.ConsignmentDetails;
    
      const country =
        apiRoute.Country_62_1_value1 && apiRoute.Country_62_1_value2
          ? `${apiRoute.Country_62_1_value1} || ${apiRoute.Country_62_1_value2}`
          : apiRoute.Country_62_1_value1 || "";
    
      const station =
        apiRoute.Station_62_3_value1 && apiRoute.Station_62_3_value2
          ? `${apiRoute.Station_62_3_value1} || ${apiRoute.Station_62_3_value2}`
          : apiRoute.Station_62_3_value1 || "";
    
      const enterprise =
        apiRoute.UndertakingEnterprises_62_5_value1 &&
        apiRoute.UndertakingEnterprises_62_5_value2
          ? `${apiRoute.UndertakingEnterprises_62_5_value1} || ${apiRoute.UndertakingEnterprises_62_5_value2}`
          : apiRoute.UndertakingEnterprises_62_5_value1 || "";
    
      RouteDetailsRef.current.setFormValues({
        ConsignmentNumber: apiRoute.ConsignmentNo_62_6 || "",
        Country: country,
        COuntryValue: apiRoute.Country_62_1_value2 || "",
        Station: station,
        StationValue: apiRoute.Station_62_3_value2 || "",
        UndertakingEnterprise: enterprise,
        UndertakingEnterpriseValue: apiRoute.UndertakingEnterprises_62_5_value2 || "",
      });
    }
         if (RouteEndorsementDetailsRef.current && responseData?.RouteDetails) {
      console.log("SETTING ROUTE ENDORSEMENT VALUES NOW");
      const apiRoute = responseData.RouteDetails;
    
     
    
      const CustomsProcedure =
        apiRoute.CustomsProcedure_51_27_value1 && apiRoute.CustomsProcedure_51_27_value2
          ? `${apiRoute.CustomsProcedure_51_27_value1} || ${apiRoute.CustomsProcedure_51_27_value2}`
          : apiRoute.CustomsProcedure_51_27_value1 || "";
    
      const ContractualCarrier =
        apiRoute.ContractualCarrier_58a_value1 &&
        apiRoute.ContractualCarrier_58a_value2
          ? `${apiRoute.ContractualCarrier_58a_value1} || ${apiRoute.ContractualCarrier_58a_value2}`
          : apiRoute.ContractualCarrier_58a_value1 || "";
    
      RouteEndorsementDetailsRef.current.setFormValues({
        CustomsEndorsements_99: apiRoute.CustomsEndorsements_99 || "",
        Route_50: apiRoute.Route_50 || "",
        CustomsProcedures: CustomsProcedure,
        ContractualCarrier: ContractualCarrier,
        EnterContractual: apiRoute.ContractualCarrier_58a_value2 || "",
        TransitProcedure: apiRoute.SimplifiedTransitProcedureForRail_58b_value1 ,
        EnterTransitProcedure: apiRoute.SimplifiedTransitProcedureForRail_58b_value2 || "",
      });
    }
    
    
    if (WagonDetailsRef.current && responseData?.WagonDetails) {
      console.log("SETTING WAGON VALUES NOW");
    
      const wagon = responseData.WagonDetails[0]; // first wagon
    
      WagonDetailsRef.current.setFormValues({
        // --- BASIC DETAILS ---
        train: wagon.Train_1 || "",
        itinerary: wagon.Itinerary_5 || "",
        dataOfDispatch: wagon.Date_of_Dispatch_7 || "",
        Page: wagon.Page_9 || "",
        toBeClearedAt: wagon.To_be_cleared_at_12 || "",
    
        // --- DROPDOWN ---
        fixedNetTrain: {
          input: String(wagon.Fixed_Net_Weight_Train_13).split(" ")[0] || "",
          dropdown: String(wagon.Fixed_Net_Weight_Train_13).split(" ")[1] || "",
        },
    
        number: wagon.NoNumber_14 ?? "",
        LoadingConfiguration: wagon.Loading_Configuration_16 || "",
    
        // --- WAGON INFO ---
        wagonNumber: wagon.WagonNo || "",
        DescriptionoftheGoods: wagon.GoodsDescription || "",
    
        // --- CHECKBOXES ---
        ExceptionalConsignment:
          wagon.Exceptional_Consignment_22 === 1 ||
          wagon.Exceptional_Consignment_22 === "Yes",
    
        RID:
          wagon.RID === 1 ||
          wagon.RID === "Yes",
    
        // --- LAZY SELECTS ---
        UTICODE: wagon.UTIType || "",
        NHMCode: wagon.NHMCode
          ? String(wagon.NHMCode)
          : "",
    
        // --- DIMENSIONS ---
        LengthWidthHeight: {
          input: String(wagon.LengthxWidthxheight_24).split(" ")[0] || "",
          dropdown: String(wagon.LengthxWidthxheight_24).split(" ")[1] || "",
        },
    
        MarkandNumber: wagon.Mark_and_Number_25 || "",
        DeliveryNoteNumber: wagon.Delivery_Note_Number_26 || "",
    
        // --- WEIGHTS ---
        GrossWeight: {
          input: String(wagon.Gross_Weight_25_19).split(" ")[0] || "",
          dropdown: String(wagon.Gross_Weight_25_19).split(" ")[1] || "",
        },
        TareWeight: {
          input: String(wagon.Tare_Weight_25_20).split(" ")[0] || "",
          dropdown: String(wagon.Tare_Weight_25_20).split(" ")[1] || "",
        },
        NetWeight: {
          input: String(wagon.Net_Weight_25_21).split(" ")[0] || "",
          dropdown: String(wagon.Net_Weight_25_21).split(" ")[1] || "",
        },
    
        // --- TOTALS ---
        TotalBrutto: {
          input: String(wagon.TotalBrut).split(" ")[0] || "",
          dropdown: String(wagon.TotalBrut).split(" ")[1] || "",
        },
        TotalNetto: {
          input: String(wagon.TotalMass).split(" ")[0] || "",
          dropdown: String(wagon.TotalMass).split(" ")[1] || "",
        },
        TotalGross: {
          input: String(wagon.TotalTare).split(" ")[0] || "",
          dropdown: String(wagon.TotalTare).split(" ")[1] || "",
        },
      });
    }
    

        if (responseData && !initialSnapshotRef.current) {
            initialSnapshotRef.current = {
                header: headerTemplateRef.current?.getFormValues(),
                general: generalDetailsRef.current?.getFormValues(),
                payment: paymentInstructionRef.current?.getFormValues(),
                placeAndDate: placeAndDateRef.current?.getFormValues(),
                declarations: consignorDeclarationsRef.current?.getFormValues(),
                valueDelivery: valueDeliveryCashRef.current?.getFormValues(),
                codingBoxes: codingBoxesRef.current?.getFormValues(),
                examination: examinationDetailsRef.current?.getFormValues(),
                sectionA: sectionARef.current?.getFormValues(),
                sectionB: sectionBRef.current?.getFormValues(),
                sectionC: sectionCRef.current?.getFormValues(),
                route: RouteDetailsRef.current?.getFormValues(),
                routeEndorsement: RouteEndorsementDetailsRef.current?.getFormValues(),
                wagon: WagonDetailsRef.current?.getFormValues(), // ✅ SINGLE FORM
            };
            console.log("SNAPSHOT CAPTURED", initialSnapshotRef.current);
        }
        } catch (error) {
            console.error("Error fetching template data:", error);
            setApiResponse(null);
            setInitialApiResponse(null);
        }
    };

    const handleConsignorConsigneeSave = async (data: any) => {
        console.log("Consignor/Consignee data saved:", data);
        setConsignorConsigneeData(data);
        try {
            const response = await CimCuvService.saveConsignorConsignee(data);
            console.log("Consignor/Consignee save response:", response);
            // Optionally, handle success or display a message
        } catch (error) {
            console.error("Error saving Consignor/Consignee data:", error);
            // Optionally, handle error or display an error message
        }
    };

    const handleSaveReport = () => {
        if (!initialSnapshotRef.current) return;

        const headerFV = headerTemplateRef.current?.getFormValues();
        const generalFV = generalDetailsRef.current?.getFormValues();
        const paymentFV = paymentInstructionRef.current?.getFormValues();
        const placeDateFV = placeAndDateRef.current?.getFormValues();
        const consignorFV = consignorDeclarationsRef.current?.getFormValues();
        const valueDeliveryFV = valueDeliveryCashRef.current?.getFormValues();
        const codingFV = codingBoxesRef.current?.getFormValues();
        const examFV = examinationDetailsRef.current?.getFormValues();
        const secAFV = sectionARef.current?.getFormValues();
        const secBFV = sectionBRef.current?.getFormValues();
        const secCFV = sectionCRef.current?.getFormValues();
        const routeFV = RouteDetailsRef.current?.getFormValues();
        const routeEndFV = RouteEndorsementDetailsRef.current?.getFormValues();
        const wagonFV = WagonDetailsRef.current?.getFormValues();

        const payload = {
            Header: {
                ...mapFormToHeaderPayload(headerFV),
                ModeFlag: resolveModeFlag(
                    headerFV,
                    initialSnapshotRef.current.header,
                    workOrderNo
                ),
            },
            General: {
                Details: {
                  ...mapFormToGeneralDetailsPayload(generalFV),
                  ModeFlag: resolveModeFlag(
                    generalFV,
                    initialSnapshotRef.current.general,
                    workOrderNo
                  ),
                },
          
                PaymentInstruction: {
                  ...mapFormToPaymentInstructionPayload(paymentFV, placeDateFV),
                  ModeFlag: resolveModeFlag(
                    paymentFV,
                    initialSnapshotRef.current.payment,
                    workOrderNo
                  ),
                },
                PlaceAndDateMadeOut: {
                  PlaceAndDateMadeOut_29_value1: placeDateFV?.place || null,
                  PlaceAndDateMadeOut_29_value2: placeDateFV?.dateMadeOut || null,
                  ModeFlag: resolveModeFlag(
                    placeDateFV,
                    initialSnapshotRef.current.placeAndDate,
                    workOrderNo
                  ),
                },
              },
          
              Declarations: {
                ...mapFormToConsignorDeclarationsPayload(consignorFV),
                ...mapFormToValueDeliveryCashPayload(valueDeliveryFV),
                ...mapFormToCodingBoxesPayload(codingFV),
                ...mapFormToExaminationDetailsPayload(examFV),
          
                SectionA: {
                  ...mapFormToSectionAPayload(secAFV),
                  ModeFlag: resolveModeFlag(
                    secAFV,
                    initialSnapshotRef.current.sectionA,
                    workOrderNo
                  ),
                },
          
                SectionB: {
                  ...mapFormToSectionBPayload(secBFV),
                  ModeFlag: resolveModeFlag(
                    secBFV,
                    initialSnapshotRef.current.sectionB,
                    workOrderNo
                  ),
                },
          
                SectionC: {
                  ...mapFormToSectionCPayload(secCFV),
                  ModeFlag: resolveModeFlag(
                    secCFV,
                    initialSnapshotRef.current.sectionC,
                    workOrderNo
                  ),
                },
              },
          
              RouteDetails: {
                ...mapFormToRouteEndorsementPayload(routeEndFV),
                ModeFlag: resolveModeFlag(
                  routeEndFV,
                  initialSnapshotRef.current.routeEndorsement,
                  workOrderNo
                ),
              },
          
              ConsignmentDetails: {
                ...mapFormToRoutePayload(routeFV),
                ModeFlag: resolveModeFlag(
                  routeFV,
                  initialSnapshotRef.current.route,
                  workOrderNo
                ),
              },
          
              WagonDetails: [
                {
                  ...mapFormToWagonPayload(wagonFV),
                  ModeFlag: resolveModeFlag(
                    wagonFV,
                    initialSnapshotRef.current.wagon,
                    workOrderNo
                  ),
                },
              ],
        };

        console.log("✅ FINAL PAYLOAD", JSON.stringify(payload, null, 2));
        // Here you would call your API service to save the report
        // CimCuvService.saveReport(payload);
    };

    return (
        <>
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
                            panelWidth="full"
                            collapsible={true} // Added collapsible prop
                            showHeader={false} // Hide header to match screenshot
                        />
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-12">
                <TabsList className="grid w-2/6 grid-cols-4 bg-gray-100 border border-gray-200 rounded-md p-0">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="declarations">Declarations</TabsTrigger>
                    <TabsTrigger value="route">Route</TabsTrigger>
                    <TabsTrigger value="wagon-info">Wagon Info</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6" forceMount>
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
                            panelWidth="full"
                            collapsible={true}
                        />
                        <div className="flex justify-start mb-6 bg-white py-3 px-4 border-t border-gray-200" style={{marginTop: '-25px'}}>
                            <Button
                                onClick={() => setIsConsignorConsigneeSideDrawOpen(true)}
                                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Consignor/Consignee
                            </Button>
                        </div>
                        </div>
                        <DynamicPanel
                        ref={paymentInstructionRef}
                        panelId="payment-instruction"
                        panelOrder={2}
                        panelTitle="Payment Instruction [20]"
                        panelConfig={paymentInstructionConfig}
                        formName="paymentInstructionForm"
                        initialData={paymentInstructionData}
                        panelWidth="full"
                        collapsible={true}
                        />
                        <DynamicPanel
                        ref={placeAndDateRef}
                        panelId="place-and-date"
                        panelOrder={3}
                        panelTitle="Place and Date Made Out [29]"
                        panelConfig={placeAndDateConfig}
                        formName="placeAndDateForm"
                        initialData={placeAndDateData}
                        panelWidth="full"
                        collapsible={true}
                        />
                    </div>
                    </div>
                </TabsContent>

                <TabsContent value="declarations" className="mt-6" forceMount>
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

                <TabsContent value="route" className="mt-6" forceMount>
                    <div className="">
                    <DynamicPanel
                        ref={RouteDetailsRef}
                        panelId="route-details"
                        panelOrder={1}
                        panelTitle="Route Details"
                        panelConfig={routeDetailsConfig}
                        formName="routeDetailsForm"
                        initialData={undefined}
                        panelWidth="full"
                        collapsible={true}
                    />
                    <DynamicPanel
                        ref={RouteEndorsementDetailsRef}
                        panelId="route-endorsement-details"
                        panelOrder={2}
                        panelTitle="Customs Endorsements and Route Details"
                        panelConfig={routeDetailsCustomsEndorsementConfig}
                        formName="routeEndorsementDetailsForm"
                        initialData={undefined}
                        panelWidth="full"
                        collapsible={true}
                    />
                    </div>
                </TabsContent>

                <TabsContent value="wagon-info" className="mt-6" forceMount>
                    <div className="">
                    <DynamicPanel
                        ref={WagonDetailsRef}
                        panelId="wagon-details"
                        panelOrder={1}
                        panelTitle="Wagon Details"
                        panelConfig={wagonDetailsConfig}
                        formName="wagonDetailsForm"
                        initialData={undefined}
                        panelWidth="full"
                        collapsible={true}
                    />
                    </div>
                </TabsContent>
                </Tabs>
                {/* Fixed Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-border fixed bottom-0 right-0 left-[60px] bg-white px-6 py-3">
                    <div className="flex items-center gap-4"></div>
                    <div className="flex items-center gap-4">
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-red-300 hover:text-red-600 hover:bg-red-100 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm">Cancel</button>
                        <button
                            className="inline-flex items-center justify-center gap-2 whitespace-nowra bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm"
                            onClick={handleSaveReport}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
            <ConsignorConsigneeSideDraw
                isOpen={isConsignorConsigneeSideDrawOpen}
                 width="40%"
                onSave={handleConsignorConsigneeSave}
                onClose={() => setIsConsignorConsigneeSideDrawOpen(false)}
            />
        </>
    );
};

export default ReportCreate;