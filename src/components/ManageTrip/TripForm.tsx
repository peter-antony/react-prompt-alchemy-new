import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { manageTripStore } from '@/stores/mangeTripStore';
import { quickOrderService } from '@/api/services/quickOrderService';

interface TripFormProps {
  tripExecutionRef: React.RefObject<DynamicPanelRef>;
}

export const TripForm: React.FC<TripFormProps> = ({
  tripExecutionRef,
}) => {
  const { tripData, fetchTrip, updateHeaderField } = manageTripStore();
  const [tripType, setTripType] = useState(tripData?.Header?.IsRoundTrip);
  const [qcList1, setqcList1] = useState<any>();
  const [qcList2, setqcList2] = useState<any>();
  const [qcList3, setqcList3] = useState<any>();
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
        value: tripData?.Header?.TrainNo || "", // Bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 2,
        maxLength: 40,
        placeholder: 'Enter Train No.',
        events: {
          onBlur: (event: React.FocusEvent) => {
            const val = event.target as HTMLInputElement;
            console.log('train no change: ', val.value);
            updateHeaderField("TrainNo", val.value, "Update");
          },
        }
      },
      Cluster: {
        id: 'Cluster',
        label: 'Cluster',
        fieldType: 'lazyselect',
        width: 'half',
        value: formatFieldWithName(tripData?.Header?.Cluster, tripData?.Header?.ClusterDescription), // Bind directly to tripData.Header
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
          onChange: (val: string) => {
            console.log('Cluster no change: ', val);
            updateHeaderField("Cluster", val, "Update");
          }
        }
      },
      ForwardTripID: {
        id: 'ForwardTripID',
        label: 'Forward Trip Plan ID',
        fieldType: 'text',
        width: 'half',
        value: tripData?.Header?.ForwardTripID || "", // Bind directly to tripData.Header
        mandatory: false,
        visible: String(tripType) === "1", // Ensure comparison is always with string "1"
        editable: true,
        order: 4,
        maxLength: 40,
        placeholder: 'Enter Forward Trip ID',
        events: {
          onBlur: (event: React.FocusEvent) => {
            const val = event.target as HTMLInputElement;
            console.log('ForwardTripID change: ', val.value);
            updateHeaderField("ForwardTripID", val.value, "Update");
          }
        }
      },
      ReturnTripID: {
        id: 'ReturnTripID',
        label: 'Return Trip Plan ID',
        fieldType: 'text',
        width: 'half',
        value: tripData?.Header?.ReturnTripID || "", // Bind directly to tripData.Header
        mandatory: false,
        visible: String(tripType) === "1", // Ensure comparison is always with string "1"
        editable: true,
        order: 4,
        maxLength: 40,
        placeholder: 'Enter Return Trip ID',
        events: {
          onBlur: (event: React.FocusEvent) => {
            const val = event.target as HTMLInputElement;
            console.log('ReturnTripID change: ', val.value);
            updateHeaderField("ReturnTripID", val.value, "Update");
          }
        }
      },
      SupplierRefNo: {
        id: 'SupplierRefNo',
        label: 'Supplier Ref. No.',
        fieldType: 'text',
        width: 'full',
        value: tripData?.Header?.SupplierRefNo || "", // Bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 4,
        maxLength: 40,
        placeholder: 'Enter Supplier Ref. No.',
        events: {
          onBlur: (event: React.FocusEvent) => {
            const val = event.target as HTMLInputElement;
            console.log('SupplierRefNo change: ', val.value);
            updateHeaderField("SupplierRefNo", val.value, "Update");
          }
        }
      },
      QCUserDefined1: {
        id: 'QCUserDefined1',
        label: 'QC Userdefined 1',
        fieldType: 'inputdropdown',
        width: 'full',
        value: (() => {
          const header = tripData?.Header as any;
          const qc = header?.QCUserDefined1;
          const qcValue = header?.QuickCodeValue1;
          if (qc && typeof qc === "object") {
            return { input: qc.input ?? qcValue ?? "", dropdown: qc.dropdown ?? qc ?? "" };
          }
          return { input: qcValue ?? "", dropdown: qc ?? "" };
        })(), // Revert to original logic, bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        maxLength: 255,
        options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      },
      ServiceType: {
        id: 'ServiceType',
        label: 'Service',
        fieldType: 'lazyselect',
        width: 'half',
        value: tripData?.Header?.ServiceType || "", // Bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
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
        events: {
          onChange: (val: string) => {
            console.log('ServiceType no change: ', val);
            updateHeaderField("ServiceType", val, "Update");
          }
        }
      },
      SubServiceType: {
        id: 'SubServiceType',
        label: 'Sub Service',
        fieldType: 'lazyselect',
        width: 'half',
        value: tripData?.Header?.SubServiceType || "", // Bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 7,
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
        events: {
          onChange: (val: string) => {
            console.log('SubServiceType no change: ', val);
            updateHeaderField("SubServiceType", val, "Update");
          }
        }
      },
      LoadType: {
        id: 'LoadType',
        label: 'Load Type',
        fieldType: 'lazyselect',
        width: 'full',
        value: tripData?.Header?.LoadType || "", // Bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 7,
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
        events: {
          onChange: (val: string) => {
            console.log('Load type Init no change: ', val);
            updateHeaderField("LoadType", val, "Update");
          }
        }
      },
      QCUserDefined2: {
        id: 'QCUserDefined2',
        label: 'QC Userdefined 2',
        fieldType: 'inputdropdown',
        width: 'full',
        value: (() => {
          const header = tripData?.Header as any;
          const qc = header?.QCUserDefined2;
          const qcValue = header?.QuickCodeValue2;
          if (qc && typeof qc === "object") {
            return { input: qc.input ?? qcValue ?? "", dropdown: qc.dropdown ?? qc ?? "" };
          }
          return { input: qcValue ?? "", dropdown: qc ?? "" };
        })(), // Revert to original logic, bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 8,
        maxLength: 255,
        options: qcList2?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      },
      QCUserDefined3: {
        id: 'QCUserDefined3',
        label: 'QC Userdefined 3',
        fieldType: 'inputdropdown',
        width: 'full',
        value: (() => {
          const header = tripData?.Header as any;
          const qc = header?.QCUserDefined3;
          const qcValue = header?.QuickCodeValue3;
          if (qc && typeof qc === "object") {
            return { input: qc.input ?? qcValue ?? "", dropdown: qc.dropdown ?? qc ?? "" };
          }
          return { input: qcValue ?? "", dropdown: qc ?? "" };
        })(), // Revert to original logic, bind directly to tripData.Header
        mandatory: false,
        visible: true,
        editable: true,
        order: 9,
        maxLength: 255,
        options: qcList3?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      },
      Remarks1: {
        id: 'Remarks1',
        label: 'Remarks 1',
        fieldType: 'text',
        width: 'full',
        value: tripData?.Header?.Remarks1 || '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 10,
        placeholder: 'Enter Remarks',
        maxLength: 500,
      },
      Remarks2: {
        id: 'Remarks2',
        label: 'Remarks 2',
        fieldType: 'text',
        width: 'full',
        value: tripData?.Header?.Remarks2 || '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 11,
        placeholder: 'Enter Remarks',
        maxLength: 500,
      },
      Remarks3: {
        id: 'Remarks3',
        label: 'Remarks 3',
        fieldType: 'text',
        width: 'full',
        value: tripData?.Header?.Remarks3 || '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 12,
        placeholder: 'Enter Remarks',
        maxLength: 500,
      },
    }; // Dependencies for useMemo (removed formData, added tripData for values)
  }, [tripType, tripData, updateHeaderField]);

  // Map IsRoundTrip -> TripType - Moved from TripExecutionLanding.tsx
  useEffect(() => {
    if (tripData?.Header) {
      const roundTripValue = String(tripData.Header.IsRoundTrip); // Explicitly cast to string
      setTripType(roundTripValue === "1" ? "1" : "0"); // Simplify comparison as it's now always a string
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

  // New useEffect to fetch qcList1, qcList2, qcList3 (if needed, otherwise remove)
  // Assuming qcLists are fetched internally by TripForm if not passed
  useEffect(() => {
    const fetchQcData = async (messageType: string, setQcList: React.Dispatch<React.SetStateAction<any>>) => {
      try {
        const data: any = await quickOrderService.getMasterCommonData({ messageType });
        const parsedData = JSON.parse(data?.data?.ResponseData) || [];
        setQcList(parsedData);
      } catch (error) {
        console.error(`TripForm: Error fetching ${messageType}`, error);
      }
    };

    fetchQcData("Trip Log QC1 Combo Init", setqcList1);
    fetchQcData("Trip Log QC2 Combo Init", setqcList2);
    fetchQcData("Trip Log QC3 Combo Init", setqcList3);
  }, []); // Only run once on mount

  return (
    <>
      <DynamicPanel
        key={tripType} // Revert to tripType for controlled remounts on type change
        ref={tripExecutionRef}
        panelId="trip-execution-panel"
        panelTitle="Trip Details"
        panelConfig={tripExecutionPanelConfig} // Use the memoized config
      // initialData={formData} // Removed initialData prop
      // onDataChange={handleDataChange} // Confirming it's commented out as per user
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
};
