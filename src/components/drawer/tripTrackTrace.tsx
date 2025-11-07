import React, { useEffect, useMemo, useState } from 'react';
import { tripService } from '@/api/services/tripService';
import { SmartGridWithGrouping } from '@/components/SmartGrid';
import type { GridColumnConfig } from '@/types/smartgrid';
import { useSmartGridState } from '@/hooks/useSmartGridState';

type TrackTraceHeader = {
  TripExecutionID?: string;
  ResourcesID?: string;
  ResourcesDescription?: string;
  GPSRefNumber?: string;
  MobileGPSRefNumber?: string;
};

type TrackTraceRow = {
  DateTime?: string;
  Event?: string;
  Latitude?: string | number;
  Longitude?: string | number;
  GeoId?: string;
  GeoDescription?: string;
  VehicleSpeed?: string;
  DistanceTravelled?: string;
  ETADestination?: string;
  Location?: string;
  Remarks?: string;
};

interface TripTrackTraceProps {
  tripId: string;
}

const safeParse = (raw: any) => {
  if (!raw) return {} as any;
  try {
    return raw?.data?.ResponseData ? JSON.parse(raw.data.ResponseData) : (raw?.data || raw);
  } catch {
    return raw?.data || raw;
  }
};

export const TripTrackTrace: React.FC<TripTrackTraceProps> = ({ tripId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [header, setHeader] = useState<TrackTraceHeader | null>(null);
  const [rows, setRows] = useState<TrackTraceRow[]>([]);
  const gridState = useSmartGridState();
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const initialColumns: GridColumnConfig[] = useMemo(() => ([
    {
      key: 'DateAndTime',
      label: 'Date and Time',
      type: 'DateTimeRange',
      sortable: false,
      editable: false
    },
    {
      key: 'Event',
      label: 'Event',
      type: 'Text',
      sortable: false,
      editable: false
    },
    {
      key: 'LatLong',
      label: 'Latitude / Longitude',
      type: 'Text',
      sortable: false,
      editable: false
    },
    {
      key: 'Geo',
      label: 'Geo ID / Desc',
      type: 'Text',
      sortable: false,
      editable: false
    },
    { key: 'VehicleSpeed', 
      label: 'Vehicle Speed', 
      type: 'Text', 
      sortable: false, 
      editable: false 
    },
    { key: 'DistanceTravelled', 
      label: 'Distance Travelled', 
      type: 'Text', 
      sortable: false, 
      editable: false 
    },
    { key: 'ETAAtDestination', 
      label: 'ETA Destination', 
      type: 'Text', 
      sortable: false, 
      editable: false 
    },
    {
      key: 'GeoFenceName',
      label: 'Location',
      type: 'Text',
      sortable: false, 
      editable: false
    },
    {
      key: 'Remarks',
      label: 'Remarks',
      type: 'Text',
      sortable: false,
      editable: false
    },
  ]), []);

  useEffect(() => {
    fetchTripsAgain();
  }, []);

  const formatLatLong = (lat?: number | null, lon?: number | null) => {
    if (lat && lon) return `${lat} / ${lon}`;
    if (lat) return `${lat} / -`;
    if (lon) return `- / ${lon}`;
    return '';
  };

  const fetchTripsAgain = async () => {
    gridState.setColumns(initialColumns);
    gridState.setLoading(true);
    setApiStatus("loading");

    try {
      let tripIdParam = tripId || "TP/2021/00004171";
      // const ResultSearchCriteria = buildSearchCriteria(defaultsTo);
      const response: any = await tripService.GetTrackAndTraceEvents({ tripId: tripIdParam });
      const parsedResponse = JSON.parse(response?.data.ResponseData || "{}");
      const data = parsedResponse.TrackAndTrace;

      if (!data || !Array.isArray(data)) {
        gridState.setGridData([]);
        setApiStatus("error");
        return;
      }

      const processedData = data.map((row: any) => {
        const getStatusColorLocal = (status: string) => {
          const statusColors: Record<string, string> = {
            // Status column colors
            'Released': 'badge-fresh-green rounded-2xl',
            'Executed': 'badge-purple rounded-2xl',
            'Fresh': 'badge-blue rounded-2xl',
            'Cancelled': 'badge-red rounded-2xl',
            'Deleted': 'badge-red rounded-2xl',
            'Save': 'badge-green rounded-2xl',
            'Under Amendment': 'badge-orange rounded-2xl',
            'Confirmed': 'badge-green rounded-2xl',
            'Initiated': 'badge-blue rounded-2xl',
            'Under Execution': 'badge-purple rounded-2xl',
            // Trip Billing Status colors
            'Draft Bill Raised': 'badge-orange rounded-2xl',
            'Not Eligible': 'badge-red rounded-2xl',
            'Revenue leakage': 'badge-red rounded-2xl',
            'Invoice Created': 'badge-blue rounded-2xl',
            'Invoice Approved': 'badge-fresh-green rounded-2xl',
            'Draft': 'badge-blue rounded-2xl'
          };
          return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
        };
        return {
          ...row,
          Status: {
            value: row.Status,
            variant: getStatusColorLocal(row.Status),
          },
          TripBillingStatus: {
            value: row.TripBillingStatus,
            variant: getStatusColorLocal(row.TripBillingStatus),
          },
          LatLong: formatLatLong(row?.Latitude, row?.Longitude),
          Geo: formatLatLong(row?.GeoID, row?.GeoDescription),
        }
      });
      setHeader(processedData[0]);
      gridState.setGridData(processedData);
      setApiStatus("success");
    } catch (error) {
      console.error("Fetch trips failed:", error);
      gridState.setGridData([]);
      setApiStatus("error");
    } finally {
      gridState.setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="text-sm text-gray-600">Loading...</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-5 gap-4 border rounded-lg p-4 mb-6">
            <div className='grid gap-2'>
              <div className="text-xs text-gray-500">Trip Execution</div>
              <div className="text-sm font-medium">{header?.TripExecutionID || '-'}</div>
            </div>
            <div className='grid gap-2'>
              <div className="text-xs text-gray-500">Resources ID</div>
              <div className="text-sm font-medium">{header?.ResourcesID || '-'}</div>
            </div>
            <div className='grid gap-2'>
              <div className="text-xs text-gray-500">Description</div>
              <div className="text-sm font-medium">{header?.ResourcesDescription || '-'}</div>
            </div>
            <div className='grid gap-2'>
              <div className="text-xs text-gray-500">GPS Ref Num</div>
              <div className="text-sm font-medium">{header?.GPSRefNumber || '-'}</div>
            </div>
            <div className='grid gap-2'>
              <div className="text-xs text-gray-500">Mobile GPS Ref Num</div>
              <div className="text-sm font-medium">{header?.MobileGPSRefNumber || '-'}</div>
            </div>
          </div>

          <div className="text-base font-semibold mb-3">Trip Status</div>
          <div>
            <SmartGridWithGrouping
              columns={initialColumns}
              data={gridState.gridData}
              paginationMode="pagination"
              gridTitle="Trip Status"
              recordCount={gridState.gridData.length}
              showCreateButton={false}
              clientSideSearch={true}
              showSubHeaders={false}
              hideAdvancedFilter={true}
              hideCheckboxToggle={true}
              hideToolbar={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TripTrackTrace;