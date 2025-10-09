import React, { useState, useEffect, useMemo } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { ChevronDown, Euro, EyeOff, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import { LayoutConfig } from '@/components/FlexGridLayout/types';
import FlexGridLayout from '../FlexGridLayout/FlexGridLayout';
import { TripStatusBadge } from './TripStatusBadge';
import { TripDetailsForm } from './TripDetailsForm';
import { ActionIconBar } from './ActionIconBar';
import { EnhancedSmartGrid } from './EnhancedSmartGrid';
import { SummaryCardsGrid } from './SummaryCardsGrid';
import { manageTripStore } from '@/stores/mangeTripStore';
import { quickOrderService } from '@/api/services/quickOrderService';

interface NewCreateTripProps {
  isEditTrip?: boolean;
  tripData?: any;
}

export const TripExecutionLanding = ({ isEditTrip }: NewCreateTripProps) => {
  const { tripData, fetchTrip, updateHeaderField } = manageTripStore();
  const [tripType, setTripType] = useState("1");
  const [qcList1, setqcList1] = useState<any>();
  const [qcList2, setqcList2] = useState<any>();
  const [qcList3, setqcList3] = useState<any>();
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageTypes = [
    "Trip Log QC1 Combo Init",
    "Trip Log QC2 Combo Init",
    "Trip Log QC3 Combo Init",
  ];

  // Map IsRoundTrip -> TripType
  useEffect(() => {
    if (tripData?.Header) {
      setTripType(tripData.Header.IsRoundTrip);
    }
  }, [tripData?.Header?.IsRoundTrip]);

  useEffect(() => {
    fetchAll();
  }, []);

  // during Mount call the necessery apis
  const fetchAll = async () => {
    setLoading(false);
    for (const type of messageTypes) {
      await fetchData(type);
    }
  };

  const fetchData = async (messageType) => {
    setLoading(false);
    setError(null);
    console.log("Loading API data Type");
    try {
      // setContracts([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      // setCustomers([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      // setClusters([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      // setVendors([{"id":"","name":"","seqNo":1,"default":"Y","description":""},{"id":"20 F Container","name":"20FT Container","seqNo":2,"default":"N","description":""}]);
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType });
      setApiData(data);
      console.log("load inside try", data);
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

  // Trip Execution form configuration for editable fields only
  const tripExecutionPanelConfig: PanelConfig = useMemo(() => {
    return {
      IsRoundTrip: {
        id: 'IsRoundTrip',
        label: '',
        fieldType: 'radio',
        value: tripData?.Header?.IsRoundTrip,
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
            setTripType(val); // To update state on change
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
        value: tripData?.Header?.TrainNo || "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 2,
        maxLength: 40,
        placeholder: 'Enter Train No.'
      },
      Cluster: {
        id: 'Cluster',
        label: 'Cluster',
        fieldType: 'lazyselect',
        width: 'half',
        value: tripData?.Header?.Cluster || "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 3,
        hideSearch: true,
        disableLazyLoading: false,
        fetchOptions: async ({ searchTerm, offset, limit }) => {
          const response = await quickOrderService.getMasterCommonData({
            messageType: "Cluster Init",
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
      ForwardTripID: {
        id: 'ForwardTripID',
        label: 'Forward Trip Plan ID',
        fieldType: 'text',
        width: 'half',
        value: tripData?.Header?.ForwardTripID || "",
        mandatory: false,
        visible: tripType === "1",
        editable: true,
        order: 4,
        maxLength: 40,
        placeholder: 'Enter Forward Trip ID'
      },
      ReturnTripID: {
        id: 'ReturnTripID',
        label: 'Return Trip Plan ID',
        fieldType: 'text',
        width: 'half',
        value: tripData?.Header?.ReturnTripID || "",
        mandatory: false,
        visible: tripType === "1",
        editable: true,
        order: 4,
        maxLength: 40,
        placeholder: 'Enter Return Trip ID'
      },
      SupplierRefNo: {
        id: 'SupplierRefNo',
        label: 'Supplier Ref. No.',
        fieldType: 'text',
        width: 'full',
        value: tripData?.Header?.SupplierRefNo || "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 4,
        maxLength: 40,
        placeholder: 'Enter Supplier Ref. No.'
      },
      QCUserDefined1: {
        id: 'QCUserDefined1',
        label: 'QC Userdefined 1',
        fieldType: 'inputdropdown',
        width: 'full',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        maxLength: 255,
        options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      },
      Remarks1: {
        id: 'Remarks1',
        label: 'Remarks 1',
        fieldType: 'text',
        width: 'full',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
        placeholder: 'Enter Remarks',
        maxLength: 500,
      }
    }
  }, [tripData, tripType, qcList1, updateHeaderField]);

  const handleDataChange = (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, val]) => {
      updateHeaderField(key as any, val, "Update");
    });
    console.log('tripData', tripData);
  };

  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    sections: {
      top: {
        id: 'top',
        visible: false,
        height: '0px',
        collapsible: false,
        collapsed: true
      },
      left: {
        id: 'left',
        visible: true,
        width: '420px',
        collapsible: true,
        collapsed: false,
        minWidth: '0',
        title: 'TRIP00000001',
        content: (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4 space-y-0 scroller-left-panel">
              <TripStatusBadge />
              <TripDetailsForm />
              <DynamicPanel
                key={tripType}
                panelId="trip-execution-panel"
                panelTitle="Trip Details"
                panelConfig={tripExecutionPanelConfig}
                initialData={tripData?.Header}
                onDataChange={handleDataChange}
              />
            </div>
            <ActionIconBar />
          </div>
        )
      },
      center: {
        id: 'center',
        visible: true,
        width: 'calc(100% - 420px)',
        collapsible: false,
        title: '',
        content: (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-6 space-y-6 overflow-auto">
              <EnhancedSmartGrid />
              <div>
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <SummaryCardsGrid />
              </div>
            </div>
          </div>
        )
      },
      right: {
        id: 'right',
        visible: false,
        width: '0px',
        collapsible: true,
        collapsed: true,
        minWidth: '0'
      },
      bottom: {
        id: 'bottom',
        visible: false,
        height: 'auto',
        collapsible: false,
        title: '',
        content: ''
      }
    }
  });

  const handleConfigChange = (newConfig: LayoutConfig) => {
    // Auto-adjust center width when left panel collapses/expands
    if (newConfig.sections.left.collapsed) {
      newConfig.sections.center.width = '100%';
    } else {
      newConfig.sections.center.width = 'calc(100% - 380px)';
    }

    setLayoutConfig(newConfig);
    // Save to localStorage
    // localStorage.setItem('createTripExecutionPage', JSON.stringify(newConfig));
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('createTripExecutionPage');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        setLayoutConfig(parsedConfig);
      } catch (error) {
        console.warn('Error loading layout config from localStorage:', error);
      }
    }
  }, []);

  return (
    <div className="h-screen bg-muted/10">
      <FlexGridLayout
        config={layoutConfig}
        onConfigChange={handleConfigChange}
        className="h-full"
      />
    </div>
  );
};

