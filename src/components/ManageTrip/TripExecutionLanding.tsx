import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel'; // No longer needed directly here
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
import { TripForm } from './TripForm'; // Updated import for TripFormRef
import { TripNavButtons } from './TripNavButtons';

interface NewCreateTripProps {
  isEditTrip?: boolean;
  tripData?: any;
}

export const TripExecutionLanding = ({ isEditTrip, tripData }: NewCreateTripProps) => {
  const { fetchTrip, updateHeaderField } = manageTripStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messageTypes = [
    "Trip Log QC1 Combo Init",
    "Trip Log QC2 Combo Init",
    "Trip Log QC3 Combo Init",
  ];
  // Removed formData, tripType, qcList1, qcList2, qcList3 states
  const tripExecutionRef = useRef<any>(null); // Updated ref type

  // utils/formMappers.ts - Moved to TripForm.tsx
  // function buildTripExecutionFormData(tripData: any) {
  //   const header = tripData?.Header || {};
  //   return {
  //     IsRoundTrip: header.IsRoundTrip ?? "0",
  //     TrainNo: header.TrainNo ?? "",
  //     Cluster: header.Cluster ?? "",
  //     ForwardTripID: header.ForwardTripID ?? "",
  //     ReturnTripID: header.ReturnTripID ?? "",
  //     SupplierRefNo: header.SupplierRefNo ?? "",
  //     QCUserDefined1: (() => {
  //       if (header.QCUserDefined1 && typeof header.QCUserDefined1 === "object") {
  //         return {
  //           input: header.QCUserDefined1.input ?? header.QCUserDefined1Value ?? "",
  //           dropdown: header.QCUserDefined1.dropdown ?? header.QCUserDefined1Value ?? ""
  //         };
  //       }
  //       return {
  //         input: header.QuickCodeValue1 ?? "",
  //         dropdown: header.QuickCode1 ?? ""
  //       };
  //     })(),
  //     Remarks1: header.Remarks1 ?? "",
  //   };
  // };

  // Map IsRoundTrip -> TripType - Moved to TripForm.tsx
  // useEffect(() => {
  //   if (tripData?.Header) {
  //     const roundTripValue = tripData.Header.IsRoundTrip;
  //     console.log('API IsRoundTrip value:', roundTripValue, 'Type:', typeof roundTripValue);
  //     setTripType(roundTripValue === "1" || roundTripValue === 1 ? "1" : "0");
  //   }
  // }, [tripData?.Header?.IsRoundTrip]);

  // Populate formData - Moved to TripForm.tsx
  // useEffect(() => {
  //   if (tripData) {
  //     const mapped = buildTripExecutionFormData(tripData);
  //     console.log('Mapped Form Data:', mapped);
  //     setFormData(mapped);
  //   }
  //   setLoading(true); // Always set loading to true to show the form
  // }, [tripData]);

  // Debug log for tripType changes - Removed
  // useEffect(() => {
  //   // console.log('tripType changed to:', tripType);
  //   // console.log('ForwardTripID visible:', tripType === "1");
  //   // console.log('ReturnTripID visible:', tripType === "1");
  //   // console.log('Panel config will be:', getTripExecutionConfig(tripType));
  // }, [tripType]);

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
      // setApiData(data); // This line was removed as per the edit hint
      console.log("load inside try", data);
      if (messageType == "Quick Order Header Quick Code1 Init") {
        // setqcList1(JSON.parse(data?.data?.ResponseData) || []); // This line was removed as per the edit hint
        // console.log('Quick Order Header Quick Code1 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Quick Order Header Quick Code2 Init") {
        // setqcList2(JSON.parse(data?.data?.ResponseData) || []); // This line was removed as per the edit hint
        // console.log('Quick Order Header Quick Code2 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Quick Order Header Quick Code3 Init") {
        // setqcList3(JSON.parse(data?.data?.ResponseData) || []); // This line was removed as per the edit hint
        // console.log('Quick Order Header Quick Code3 Init', JSON.parse(data?.data?.ResponseData));
      }
    } catch (err) {
      setError(`Error fetching API data for ${messageType}`);
      // setApiData(data); // This line was removed as per the edit hint
    }
    finally {
      setLoading(true);
    }
  };

  // Trip Execution form configuration for editable fields only
  // Moved to TripForm.tsx
  // const getTripExecutionConfig = (tripType: string): PanelConfig => {
  //   console.log('Recalculating panel config with tripType:', tripType);
  //   return {
  //     IsRoundTrip: {
  //       id: 'IsRoundTrip',
  //       label: '',
  //       fieldType: 'radio',
  //       value: tripType || "0",
  //       mandatory: false,
  //       visible: true,
  //       editable: true,
  //       order: 1,
  //       options: [
  //         { label: 'One Way', value: '0' },
  //         { label: 'Round Trip', value: '1' }
  //       ],
  //       events: {
  //         onChange: (val: string) => {
  //           console.log('Radio onChange triggered with value:', val);
  //           console.log('Current tripType before update:', tripType);
  //           setTripType(val); // To update state on change
  //           console.log('setTripType called with:', val);
  //           if (val === "1") {
  //             updateHeaderField("IsRoundTrip", "1", "Update");
  //             updateHeaderField("IsOneWay", "0", "Update");
  //           } else {
  //             updateHeaderField("IsRoundTrip", "0", "Update");
  //             updateHeaderField("IsOneWay", "1", "Update");
  //           }
  //         }
  //       }
  //     },
  //     TrainNo: {
  //       id: 'TrainNo',
  //       label: 'Train No.',
  //       fieldType: 'text',
  //       width: 'half',
  //       value: tripData?.Header?.TrainNo || "",
  //       mandatory: true,
  //       visible: true,
  //       editable: true,
  //       order: 2,
  //       maxLength: 40,
  //       placeholder: 'Enter Train No.',
  //     },
  //     Cluster: {
  //       id: 'Cluster',
  //       label: 'Cluster',
  //       fieldType: 'lazyselect',
  //       width: 'half',
  //       value: tripData?.Header?.Cluster || "",
  //       mandatory: false,
  //       visible: true,
  //       editable: true,
  //       order: 3,
  //       hideSearch: true,
  //       disableLazyLoading: false,
  //       fetchOptions: async ({ searchTerm, offset, limit }) => {
  //         const response = await quickOrderService.getMasterCommonData({
  //           messageType: "Cluster Init",
  //           searchTerm: searchTerm || '',
  //           offset,
  //           limit,
  //         });
  //         const rr: any = response.data
  //         return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
  //           ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
  //             ? {
  //               label: `${item.id} || ${item.name}`,
  //               value: `${item.id} || ${item.name}`,
  //             }
  //             : {})
  //         }));
  //       },
  //     },
  //     ForwardTripID: {
  //       id: 'ForwardTripID',
  //       label: 'Forward Trip Plan ID',
  //       fieldType: 'text',
  //       width: 'half',
  //       value: tripData?.Header?.ForwardTripID || "",
  //       mandatory: false,
  //       visible: tripType === "1",
  //       editable: true,
  //       order: 4,
  //       maxLength: 40,
  //       placeholder: 'Enter Forward Trip ID'
  //     },
  //     ReturnTripID: {
  //       id: 'ReturnTripID',
  //       label: 'Return Trip Plan ID',
  //       fieldType: 'text',
  //       width: 'half',
  //       value: tripData?.Header?.ReturnTripID || "",
  //       mandatory: false,
  //       visible: tripType === "1",
  //       editable: true,
  //       order: 4,
  //       maxLength: 40,
  //       placeholder: 'Enter Return Trip ID'
  //     },
  //     SupplierRefNo: {
  //       id: 'SupplierRefNo',
  //       label: 'Supplier Ref. No.',
  //       fieldType: 'text',
  //       width: 'full',
  //       value: tripData?.Header?.SupplierRefNo || "",
  //       mandatory: false,
  //       visible: true,
  //       editable: true,
  //       order: 4,
  //       maxLength: 40,
  //       placeholder: 'Enter Supplier Ref. No.'
  //     },
  //     QCUserDefined1: {
  //       id: 'QCUserDefined1',
  //       label: 'QC Userdefined 1',
  //       fieldType: 'inputdropdown',
  //       width: 'full',
  //       value: formData.QCUserDefined1 || {}, // Now correctly uses formData or an empty object
  //       mandatory: false,
  //       visible: true,
  //       editable: true,
  //       order: 5,
  //       maxLength: 255,
  //       options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
  //     },
  //     Remarks1: {
  //       id: 'Remarks1',
  //       label: 'Remarks 1',
  //       fieldType: 'text',
  //       width: 'full',
  //       value: tripData?.Header?.Remarks1 || '',
  //       mandatory: false,
  //       visible: true,
  //       editable: true,
  //       order: 6,
  //       placeholder: 'Enter Remarks',
  //       maxLength: 500,
  //     }
  //   };
  // };

  const handleDataChange = (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, val]) => {
      updateHeaderField(key as any, val, "Update");
    });
    console.log('tripData', tripData);
  };

  const layoutConfig = useMemo<LayoutConfig>(() => ({
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
        width: '540px',
        collapsible: true,
        collapsed: false,
        minWidth: '0',
        title: 'TRIP00000001',
        content: (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4 space-y-3 scroller-left-panel">
              <TripStatusBadge />
              <TripDetailsForm />
              {/* Move to TripForm.tsx */}
              {/* {(() => {
                 const config = getTripExecutionConfig(tripType);
                 console.log('About to render DynamicPanel with tripType:', tripType);
                 console.log('ForwardTripID config:', config.ForwardTripID);
                 console.log('ReturnTripID config:', config.ReturnTripID);
                 return ( */}
              <TripForm
                // tripData={tripData} // Now managed internally by TripForm
                tripExecutionRef={tripExecutionRef}
              />
              <TripNavButtons
                previousTrips={tripData?.Header?.PreviousTrip}
                nextTrips={tripData?.Header?.NextTrip}
              />
              {/* //    );
                 //  })()} */}
            </div>
            <ActionIconBar />
          </div>
        )
      },
      center: {
        id: 'center',
        visible: true,
        width: 'calc(100% - 540px)',
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
  }), []); // Removed formData from dependencies

  const handleConfigChange = (newConfig: LayoutConfig) => {
    // Auto-adjust center width when left panel collapses/expands
    if (newConfig.sections.left.collapsed) {
      newConfig.sections.center.width = '100%';
    } else {
      newConfig.sections.center.width = 'calc(100% - 380px)';
    }

    // Note: Since layoutConfig is now useMemo, we can't directly set it
    // The layout changes will be handled by the FlexGridLayout component
    // Save to localStorage
    // localStorage.setItem('createTripExecutionPage', JSON.stringify(newConfig));
  };

  // Note: localStorage loading removed since layoutConfig is now useMemo
  // The layout will use the default configuration

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

