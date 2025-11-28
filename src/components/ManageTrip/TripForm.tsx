import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { manageTripStore } from '@/stores/mangeTripStore';
import { quickOrderService } from '@/api/services/quickOrderService';
import { useToast } from '@/hooks/use-toast';

interface TripFormProps {
  // Optional QC lists to avoid duplicate API calls
  qcList1?: any[];
  qcList2?: any[];
  qcList3?: any[];
  co2List?: any[];
}

export interface TripFormRef {
  getFormData: () => Record<string, any>;
  syncFormDataToStore: () => Record<string, any>;
}

export const TripForm = React.forwardRef<TripFormRef, TripFormProps>((props, ref) => {
  // Create internal ref for DynamicPanel
  const tripExecutionRef = useRef<DynamicPanelRef>(null);
  const { tripData, fetchTrip, updateHeaderField } = manageTripStore();
  const [tripType, setTripType] = useState(tripData?.Header?.IsRoundTrip);
  const { toast } = useToast();

  // State for Panel Personalization
  const [panelPersonalizationModeFlag, setPanelPersonalizationModeFlag] = useState<'Insert' | 'Update'>('Insert');

  // Use props if provided, otherwise use local state
  const [localQcList1, setLocalQcList1] = useState<any>();
  const [localQcList2, setLocalQcList2] = useState<any>();
  const [localQcList3, setLocalQcList3] = useState<any>();
  const [localCo2List, setLocalCo2List] = useState<any>();

  // Use props if available, otherwise use local state
  const qcList1 = props.qcList1 || localQcList1;
  const qcList2 = props.qcList2 || localQcList2;
  const qcList3 = props.qcList3 || localQcList3;
  const co2List = props.co2List || localCo2List;

  // Removed formData state as DynamicPanel is not fully controlled by TripForm's local state
  // const [formData, setFormData] = useState<Record<string, any>>(() => buildTripExecutionFormData(tripData));

  // utils/formMappers.ts - Moved from TripExecutionLanding.tsx

  const formatFieldWithName = (id: string | undefined, name: string | undefined) => {
    if (id) {
      if (name && name.trim() !== '') {
        return id + ' || ' + name;
      } else {
        return id + ' || --';
      }
    }
    return '';
  }

  // Trip Execution form configuration for editable fields only
  // Using uncontrolled approach - DynamicPanel manages its own state
  const tripExecutionPanelConfig: PanelConfig = useMemo(() => {
    return {
      IsRoundTrip: {
        id: 'IsRoundTrip',
        label: '',
        fieldType: 'radio',
        value: tripType,
        mandatory: false,
        visible: true,
        editable: true,
        order: 1,
        options: [
          { label: 'One Way', value: '0' },
          { label: 'Round Trip', value: '1' }
        ],
        events: {
          onChange: (val: string) => {
            setTripType(val); // Update local tripType state
            if (val === "1") {
              updateHeaderField("IsRoundTrip", "1", "Update");
              updateHeaderField("IsOneWay", "0", "Update");
            } else {
              updateHeaderField("IsRoundTrip", "0", "Update");
              updateHeaderField("IsOneWay", "1", "Update");
            }
          }
        }
      },
      TrainNo: {
        id: 'TrainNo',
        label: 'Train No.',
        fieldType: 'text',
        width: 'half',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 2,
        maxLength: 40,
        placeholder: 'Enter Train No.',
        // Removed onBlur events - using uncontrolled approach
        // Data will be synced on save/submit instead of on every field change
      },
      Cluster: {
        id: 'Cluster',
        label: 'Cluster',
        fieldType: 'lazyselect',
        width: 'half',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 3,
        hideSearch: false,
        disableLazyLoading: false,
        fetchOptions: async ({ searchTerm, offset, limit }) => {
          const response = await quickOrderService.getMasterCommonData({
            messageType: "Cluster Init",
            searchTerm: searchTerm || '',
            offset,
            limit,
          });
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
        // Removed onChange events - using uncontrolled approach
        // Data will be synced on save/submit instead of on every field change
      },
      ForwardTripID: {
        id: 'ForwardTripID',
        label: 'Forward Trip Plan ID',
        fieldType: 'text',
        width: 'half',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: String(tripType) === "1", // Ensure comparison is always with string "1"
        editable: true,
        order: 4,
        maxLength: 40,
        placeholder: 'Enter Forward Trip ID',
        // Removed onBlur events - using uncontrolled approach
      },
      ReturnTripID: {
        id: 'ReturnTripID',
        label: 'Return Trip Plan ID',
        fieldType: 'text',
        width: 'half',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: String(tripType) === "1", // Ensure comparison is always with string "1"
        editable: true,
        order: 5,
        maxLength: 40,
        placeholder: 'Enter Return Trip ID',
        // Removed onBlur events - using uncontrolled approach
      },
      // CO2Emisions: {
      //   id: 'CO2Emisions',
      //   label: 'CO2 Emisions',
      //   fieldType: 'text',
      //   width: 'full',
      //   value: tripData?.Header?.CO2Emisions || "", // Bind directly to tripData.Header
      //   mandatory: false,
      //   visible: true,
      //   editable: true,
      //   order: 4,
      //   maxLength: 40,
      //   placeholder: 'Enter CO2 Emisions',
      //   events: {
      //     onBlur: (event: React.FocusEvent) => {
      //       const val = event.target as HTMLInputElement;
      //       console.log('CO2Emisions change: ', val.value);
      //       updateHeaderField("CO2Emisions", val.value, "Update");
      //     }
      //   }
      // },
      CO2Emisions: {
        id: 'CO2Emisions',
        label: 'CO₂ Emissions',
        fieldType: 'inputdropdown',
        width: 'full',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
        maxLength: 255,
        options: co2List?.filter((u: any) => u.id).map((u: any) => ({ label: u.name, value: u.id })),
        // Removed onChange events - using uncontrolled approach
      },


      // CO2EmisionsUOM: {
      //   id: 'CO2EmisionsUOM',
      //   label: 'CO2 Emisions UOM',
      //   fieldType: 'text',
      //   width: 'full',
      //   value: tripData?.Header?.CO2EmisionsUOM || "", // Bind directly to tripData.Header
      //   mandatory: false,
      //   visible: true,
      //   editable: true,
      //   order: 4,
      //   maxLength: 40,
      //   placeholder: 'Enter CO2 Emisions UOM',
      //   events: {
      //     onBlur: (event: React.FocusEvent) => {
      //       const val = event.target as HTMLInputElement;
      //       console.log('CO2EmisionsUOM change: ', val.value);
      //       updateHeaderField("CO2EmisionsUOM", val.value, "Update");
      //     }
      //   }
      // },
      SupplierRefNo: {
        id: 'SupplierRefNo',
        label: 'Supplier Ref. No.',
        fieldType: 'text',
        width: 'full',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 7,
        maxLength: 40,
        placeholder: 'Enter Supplier Ref. No.',
        // Removed onBlur events - using uncontrolled approach
      },
      QCUserDefined1: {
        id: 'QCUserDefined1',
        label: 'QC Userdefined 1',
        fieldType: 'inputdropdown',
        width: 'full',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 8,
        maxLength: 255,
        options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
        // Removed onChange events - using uncontrolled approach
      },
      ServiceType: {
        id: 'ServiceType',
        label: 'Service',
        fieldType: 'lazyselect',
        width: 'half',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 9,
        hideSearch: true,
        disableLazyLoading: false,
        fetchOptions: async ({ searchTerm, offset, limit }) => {
          const response = await quickOrderService.getMasterCommonData({
            messageType: "Service type Init",
            searchTerm: searchTerm || '',
            offset,
            limit,
          });
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
        // Removed onChange events - using uncontrolled approach
      },
      SubServiceType: {
        id: 'SubServiceType',
        label: 'Sub Service',
        fieldType: 'lazyselect',
        width: 'half',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 10,
        hideSearch: true,
        disableLazyLoading: false,
        fetchOptions: async ({ searchTerm, offset, limit }) => {
          const response = await quickOrderService.getMasterCommonData({
            messageType: "Sub Service type Init",
            searchTerm: searchTerm || '',
            offset,
            limit,
          });
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
        // Removed onChange events - using uncontrolled approach
      },
      LoadType: {
        id: 'LoadType',
        label: 'Load Type',
        fieldType: 'lazyselect',
        width: 'full',
        value: "", // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 11,
        hideSearch: true,
        disableLazyLoading: false,
        fetchOptions: async ({ searchTerm, offset, limit }) => {
          const response = await quickOrderService.getMasterCommonData({
            messageType: "Load type Init",
            searchTerm: searchTerm || '',
            offset,
            limit,
          });
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
        // Removed onChange events - using uncontrolled approach
      },
      QCUserDefined2: {
        id: 'QCUserDefined2',
        label: 'QC Userdefined 2',
        fieldType: 'inputdropdown',
        width: 'full',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 12,
        maxLength: 255,
        options: qcList2?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
        // Removed onChange events - using uncontrolled approach
      },
      QCUserDefined3: {
        id: 'QCUserDefined3',
        label: 'QC Userdefined 3',
        fieldType: 'inputdropdown',
        width: 'full',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 13,
        maxLength: 255,
        options: qcList3?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
        // Removed onChange events - using uncontrolled approach
      },
      Remarks1: {
        id: 'Remarks1',
        label: 'Remarks 1',
        fieldType: 'text',
        width: 'full',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 14,
        placeholder: 'Enter Remarks',
        maxLength: 500,
        // Removed onBlur events - using uncontrolled approach
      },
      Remarks2: {
        id: 'Remarks2',
        label: 'Remarks 2',
        fieldType: 'text',
        width: 'full',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 15,
        placeholder: 'Enter Remarks',
        maxLength: 500,
        // Removed onBlur events - using uncontrolled approach
      },
      Remarks3: {
        id: 'Remarks3',
        label: 'Remarks 3',
        fieldType: 'text',
        width: 'full',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 16,
        placeholder: 'Enter Remarks',
        maxLength: 500,
        // Removed onBlur events - using uncontrolled approach
      },
    }; // Dependencies for useMemo - removed tripData to prevent re-renders on every field change
  }, [tripType, updateHeaderField, qcList1, qcList2, qcList3, co2List]);

  // Create initial data for DynamicPanel - populate with actual data
  const initialFormData = useMemo(() => {
    if (!tripData?.Header) {
      return {
        IsRoundTrip: "0",
        TrainNo: '',
        Cluster: '',
        ForwardTripID: '',
        ReturnTripID: '',
        CO2Emisions: { input: "", dropdown: "" },
        SupplierRefNo: '',
        QCUserDefined1: { input: "", dropdown: "" },
        ServiceType: '',
        SubServiceType: '',
        LoadType: '',
        QCUserDefined2: { input: "", dropdown: "" },
        QCUserDefined3: { input: "", dropdown: "" },
        Remarks1: '',
        Remarks2: '',
        Remarks3: '',
      };
    }

    return {
      IsRoundTrip: tripData.Header.IsRoundTrip || "0",
      TrainNo: tripData.Header.TrainNo || '',
      Cluster: formatFieldWithName(tripData.Header.Cluster, tripData.Header.ClusterDescription),
      ForwardTripID: tripData.Header.ForwardTripID || '',
      ReturnTripID: tripData.Header.ReturnTripID || '',
      CO2Emisions: (() => {
        const emissionValue = tripData.Header.CO2Emisions;
        const emissionUOM = tripData.Header.CO2EmisionsUOM;
        // API returns simple string values, convert to inputdropdown format
        return { input: emissionValue ?? "", dropdown: emissionUOM ?? "" };
      })(),
      SupplierRefNo: tripData.Header.SupplierRefNo || '',
      QCUserDefined1: (() => {
        const qcId = tripData.Header.QuickCode1;
        const qcValue = tripData.Header.QuickCodeValue1;
        return { input: qcValue ?? "", dropdown: qcId ?? "" };
      })(),
      ServiceType: formatFieldWithName(tripData.Header.ServiceType, tripData.Header.ServiceTypeDescription),
      SubServiceType: formatFieldWithName(tripData.Header.SubServiceType, tripData.Header.SubServiceTypeDescription),
      LoadType: formatFieldWithName(tripData.Header.LoadType, (tripData.Header as any).LoadTypeDescription),
      QCUserDefined2: (() => {
        const qcId = tripData.Header.QuickCode2;
        const qcValue = tripData.Header.QuickCodeValue2;
        return { input: qcValue ?? "", dropdown: qcId ?? "" };
      })(),
      QCUserDefined3: (() => {
        const qcId = tripData.Header.QuickCode3;
        const qcValue = tripData.Header.QuickCodeValue3;
        return { input: qcValue ?? "", dropdown: qcId ?? "" };
      })(),
      Remarks1: tripData.Header.Remarks1 || '',
      Remarks2: tripData.Header.Remarks2 || '',
      Remarks3: tripData.Header.Remarks3 || '',
    };
  }, [tripData?.Header]); // Include tripData.Header dependency

  // Fetch panel personalization on component mount
    useEffect(() => {
      const fetchPanelPersonalization = async () => {
        try {
          const personalizationResponse: any = await quickOrderService.getPersonalization({
            LevelType: 'User',
            LevelKey: 'ramcouser',
            ScreenName: 'TripExecution',
            ComponentName: 'panel-config-current-user-trip-execution-trip-details'
          });
  
          console.log('TripDetails Panel Personalization Response:', personalizationResponse);
  
          // Parse and set personalization data to localStorage
          if (personalizationResponse?.data?.ResponseData) {
            const parsedPersonalization = JSON.parse(personalizationResponse.data.ResponseData);
  
            if (parsedPersonalization?.PersonalizationResult && parsedPersonalization.PersonalizationResult.length > 0) {
              const personalizationData = parsedPersonalization.PersonalizationResult[0];
  
              // Set the JsonData to localStorage
              if (personalizationData.JsonData) {
                const jsonData = personalizationData.JsonData;
                localStorage.setItem('panel-config-current-user-trip-execution-trip-details', JSON.stringify(jsonData));
                console.log('TripDetails Panel Personalization data set to localStorage:', jsonData);
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

  // Debug logging
  useEffect(() => {
    console.log('TripForm: tripData.Header changed:', tripData?.Header);
    console.log('TripForm: initialFormData:', initialFormData);

    // Debug QC fields and CO2Emisions specifically
    if (tripData?.Header) {
      console.log('TripForm: QC Fields Debug:');
      console.log('QuickCode1:', tripData.Header.QuickCode1, 'QuickCodeValue1:', tripData.Header.QuickCodeValue1);
      console.log('QuickCode2:', tripData.Header.QuickCode2, 'QuickCodeValue2:', tripData.Header.QuickCodeValue2);
      console.log('QuickCode3:', tripData.Header.QuickCode3, 'QuickCodeValue3:', tripData.Header.QuickCodeValue3);

      console.log('TripForm: CO2Emisions Debug:');
      console.log('CO2Emisions:', tripData.Header.CO2Emisions, 'CO2EmisionsUOM:', tripData.Header.CO2EmisionsUOM);
      console.log('CO2Emisions processed:', { input: tripData.Header.CO2Emisions ?? "", dropdown: tripData.Header.CO2EmisionsUOM ?? "" });
    }
  }, [tripData?.Header, initialFormData]);

  // Function to get form data from DynamicPanel ref (for save operation)
  const getFormData = () => {
    if (!tripExecutionRef.current) {
      console.warn('TripForm: tripExecutionRef is not available');
      return {};
    }

    try {
      // Get form data from DynamicPanel ref
      const formData = tripExecutionRef.current.getFormValues();
      console.log('TripForm: Retrieved form data:', formData);
      return formData || {};
    } catch (error) {
      console.error('TripForm: Error getting form data:', error);
      return {};
    }
  };

  // Function to sync form data to store (call this on save/submit)
  const syncFormDataToStore = (formData: Record<string, any>) => {
    console.log('Syncing form data to store:', formData);

    // Sync each field to the store
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'IsRoundTrip') {
        updateHeaderField("IsRoundTrip", value, "Update");
        updateHeaderField("IsOneWay", value === "1" ? "0" : "1", "Update");
      } else if (key === 'Cluster' && typeof value === 'string') {
        const [clusterId, clusterDesc] = value.split('||').map((s) => s.trim());
        updateHeaderField("Cluster", clusterId, "Update");
        updateHeaderField("ClusterDescription", clusterDesc, "Update");
      } else if (key === 'CO2Emisions' && typeof value === 'object') {
        const { input, dropdown } = value;
        updateHeaderField("CO2Emisions", input ? input : null, "Update");
        updateHeaderField("CO2EmisionsUOM", dropdown, "Update");
      } else if (key === 'QCUserDefined1' && typeof value === 'object') {
        const { input, dropdown } = value;
        updateHeaderField("QuickCodeValue1", input, "Update");
        updateHeaderField("QuickCode1", dropdown, "Update");
      } else if (key === 'QCUserDefined2' && typeof value === 'object') {
        const { input, dropdown } = value;
        updateHeaderField("QuickCodeValue2", input, "Update");
        updateHeaderField("QuickCode2", dropdown, "Update");
      } else if (key === 'QCUserDefined3' && typeof value === 'object') {
        const { input, dropdown } = value;
        updateHeaderField("QuickCodeValue3", input, "Update");
        updateHeaderField("QuickCode3", dropdown, "Update");
      } else if (key === 'ServiceType' && typeof value === 'string') {
        const [serviceTypeId, serviceTypeDesc] = value.split('||').map((s) => s.trim());
        updateHeaderField("ServiceType", serviceTypeId, "Update");
        updateHeaderField("ServiceTypeDescription", serviceTypeDesc, "Update");
      } else if (key === 'SubServiceType' && typeof value === 'string') {
        const [subServiceTypeId, subServiceTypeDesc] = value.split('||').map((s) => s.trim());
        updateHeaderField("SubServiceType", subServiceTypeId, "Update");
        updateHeaderField("SubServiceTypeDescription", subServiceTypeDesc, "Update");
      } else if (key === 'LoadType' && typeof value === 'string') {
        const [loadTypeId, loadTypeDesc] = value.split('||').map((s) => s.trim());
        updateHeaderField("LoadType", loadTypeId, "Update");
        updateHeaderField("LoadTypeDescription" as any, loadTypeDesc, "Update");
      } else {
        // For simple text fields
        updateHeaderField(key as any, value, "Update");
      }
    });
  };

  // Expose functions to parent component for save operation
  React.useImperativeHandle(ref, () => ({
    getFormData,
    syncFormDataToStore: () => {
      const formData = getFormData();
      syncFormDataToStore(formData);
      return formData;
    }
  }));

  // Map IsRoundTrip -> TripType when tripData changes
  useEffect(() => {
    if (tripData?.Header) {
      const roundTripValue = String(tripData.Header.IsRoundTrip);
      setTripType(roundTripValue === "1" ? "1" : "0");
    }
  }, [tripData?.Header?.IsRoundTrip]);

  // Removed useEffect for formData population and prevTripDataRef as formData state is removed
  // const prevTripDataRef = useRef<any>(null);
  // useEffect(() => {
  //   if (tripData && JSON.stringify(tripData) !== JSON.stringify(prevTripDataRef.current)) {
  //     const mapped = buildTripExecutionFormData(tripData);
  //     setFormData(mapped);
  //   }
  //   prevTripDataRef.current = tripData;
  // }, [tripData]);

  // Removed handleDataChange as onDataChange on DynamicPanel is not used
  // const handleDataChange = (data: Record<string, any>) => {
  //   Object.entries(data).forEach(([key, val]) => {
  //     updateHeaderField(key as any, val, "Update"); // Update store
  //   });
  //   setFormData(prev => ({ ...prev, ...data })); // No longer needed with uncontrolled approach
  // };

  // Only fetch QC data if not provided as props (to avoid duplication)
  useEffect(() => {
    // Only fetch if props are not provided
    if (props.qcList1 && props.qcList2 && props.qcList3 && props.co2List) {
      console.log('TripForm: Using QC lists from props, skipping API calls');
      return;
    }

    const fetchQcData = async (messageType: string, setQcList: React.Dispatch<React.SetStateAction<any>>) => {
      try {
        const data: any = await quickOrderService.getMasterCommonData({ messageType });
        const parsedData = JSON.parse(data?.data?.ResponseData) || [];
        console.log(`TripForm: Fetched ${messageType} data:`, parsedData);
        setQcList(parsedData);
      } catch (error) {
        console.error(`TripForm: Error fetching ${messageType}`, error);
      }
    };

    // Only fetch missing data
    if (!props.qcList1) fetchQcData("Trip Log QC1 Combo Init", setLocalQcList1);
    if (!props.qcList2) fetchQcData("Trip Log QC2 Combo Init", setLocalQcList2);
    if (!props.qcList3) fetchQcData("Trip Log QC3 Combo Init", setLocalQcList3);
    if (!props.co2List) fetchQcData("Container Qty UOM Init", setLocalCo2List);
  }, [props.qcList1, props.qcList2, props.qcList3, props.co2List]); // Depend on props

  // Debug QC lists
  useEffect(() => {
    console.log('TripForm: QC Lists Debug:');
    console.log('qcList1:', qcList1);
    console.log('qcList2:', qcList2);
    console.log('qcList3:', qcList3);
    console.log('co2List:', co2List);
  }, [qcList1, qcList2, qcList3, co2List]);

  const getUserPanelConfig = (userId: string, panelId: string): PanelSettings | null => {
      const stored = localStorage.getItem(`panel-config-current-user-trip-execution-trip-details`);
      console.log(`Retrieved config for panel trip-details:`, stored);
      return stored ? JSON.parse(stored) : null;
    };

    const saveUserPanelConfig = async (userId: string, panelId: string, settings: PanelSettings): Promise<void> => {
        try {
          // Save to localStorage first
          localStorage.setItem(`panel-config-current-user-trip-execution-trip-details`, JSON.stringify(settings));
          console.log(`Saved config for panel trip-details:`, settings);
          console.log('====DYNAMIC PANEL SAVE CLICKED====');
    
          // Prepare the data to save to the API
          const preferencesToSave = settings;
    
          console.log('Saving TripDetails Panel preferences:', preferencesToSave);
          console.log('Panel Personalization ModeFlag:', panelPersonalizationModeFlag);
    
          const response = await quickOrderService.savePersonalization({
            LevelType: 'User',
            LevelKey: 'ramcouser',
            ScreenName: 'TripExecution',
            ComponentName: 'panel-config-current-user-trip-execution-trip-details',
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

  return (
    <>
      <DynamicPanel
        key={`${tripType}-${qcList1?.length || 0}-${qcList2?.length || 0}-${qcList3?.length || 0}-${tripData?.Header?.TrainNo || 'empty'}`}  // include tripData to force re-render when data changes
        ref={tripExecutionRef}
        panelId="trip-execution-panel"
        panelTitle="Trip Details"
        panelConfig={tripExecutionPanelConfig} // Use the memoized config
        initialData={initialFormData} // Provide initial values for uncontrolled form
        getUserPanelConfig={getUserPanelConfig}
        saveUserPanelConfig={saveUserPanelConfig}
      // Removed onDataChange to prevent re-renders
      // Form data will be accessed via ref on save/submit
      />
      {/* Debug JSON View */}
      {/* <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <h3 className="font-medium mb-2">TripForm Data (tripData.Header)</h3>
        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
          {JSON.stringify(tripData?.Header, null, 2)} // Display tripData.Header
        </pre>
      </div> */}
    </>
  );
});

TripForm.displayName = 'TripForm';
