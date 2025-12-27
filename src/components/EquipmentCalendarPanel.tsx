import React, { useCallback, useEffect, useState, useRef } from 'react';
import { SmartEquipmentCalendar } from '@/components/SmartEquipmentCalendar';
import {
  EquipmentItem,
  EquipmentCalendarEvent,
  ResourceCategoryResponse,
  transformResourceToEquipment,
  transformTripDataToEvents,
  DateRangeParams
} from '@/types/equipmentCalendar';
import { toast } from '@/hooks/use-toast';
import { tripPlanningService } from '@/api/services/tripPlanningService';
import { addDays, addMonths, subDays, subMonths, addWeeks, subWeeks, startOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface EquipmentCalendarPanelProps {
  initialView?: 'day' | 'week' | 'month';
  initialStartDate?: Date;
  initialShowHourView?: boolean;
  initialStatusFilter?: string;
  /** Initial selected equipment IDs (from list view or previous selection) */
  selectedEquipments?: string[];
  onViewChange?: (view: 'day' | 'week' | 'month') => void;
  onShowHourViewChange?: (v: boolean) => void;
  onStatusFilterChange?: (s: string) => void;
  onSelectionChange?: (ids: string[]) => void;
  onAddToTrip?: (ids: string[]) => void;
  onBarClick?: (event: EquipmentCalendarEvent) => void;
  onEquipmentClick?: (equipment: EquipmentItem) => void;
  enableDrag?: boolean;
  /** Entire trip object so we can read Header.TripNo for filtering */
  tripInformation?: any;
  /** Callback used by parent to register our applyFilter function */
  onRegisterApplyFilter?: (fn: (payload: any) => Promise<void> | void) => void;
  /** Callback to expose equipment objects from calendar for parent to use */
  onRegisterGetEquipments?: (fn: () => EquipmentItem[]) => void;
}

export const EquipmentCalendarPanel: React.FC<EquipmentCalendarPanelProps> = ({
  initialView = 'week',
  initialStartDate = new Date(),
  initialShowHourView = false,
  initialStatusFilter = 'all',
  selectedEquipments: initialSelectedEquipments = [],
  onViewChange,
  onShowHourViewChange,
  onStatusFilterChange,
  onSelectionChange,
  onAddToTrip,
  onBarClick,
  onEquipmentClick,
  enableDrag = false,
  tripInformation,
  onRegisterApplyFilter,
  onRegisterGetEquipments,
}) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>(initialView);
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [showHourView, setShowHourView] = useState<boolean>(initialShowHourView);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(initialSelectedEquipments);
  
  // Sync selectedEquipments when prop changes (e.g., when switching from list view with selections)
  useEffect(() => {
    if (initialSelectedEquipments && initialSelectedEquipments.length > 0) {
      console.log('EquipmentCalendarPanel: Syncing selectedEquipments from prop:', initialSelectedEquipments);
      setSelectedEquipments(initialSelectedEquipments);
    }
  }, [initialSelectedEquipments]);
  useEffect(() => {
    console.log('EquipmentCalendarPanel: initiated');
    return () => {
      console.log('EquipmentCalendarPanel: unmounted');
    };
  }, []);
  const [filterMode, setFilterMode] = useState<'client' | 'server'>('server');
  const [isLoading, setIsLoading] = useState(false);

  const [apiEquipments, setApiEquipments] = useState<EquipmentItem[]>([]);
  const [apiEvents, setApiEvents] = useState<EquipmentCalendarEvent[]>([]);
  // Keep track of last applied filter payload so we can reuse filters on view change
  // Using ref instead of state to avoid infinite loop in handleDateRangeChange
  const currentFilterPayloadRef = useRef<any | null>(null);
  // Track the last date range we applied from a filter (to prevent duplicate API calls)
  const lastFilterDateRangeRef = useRef<{ fromDate: string; toDate: string } | null>(null);

  // start with empty lists; always fetch real data from API on mount via applyFilter (default/empty payload)

  // Helper: get default from/to date range for a given view (day/week/month)
  const getDefaultDateRangeForView = (targetView: 'day' | 'week' | 'month') => {
    const today = new Date();

    if (targetView === 'day') {
      return { from: today, to: today };
    }

    if (targetView === 'week') {
      const from = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const to = addDays(from, 6); // Sunday
      return { from, to };
    }

    // month view
    const from = startOfMonth(today);
    const to = endOfMonth(today);
    return { from, to };
  };

  // Helper: extract ID or Name from piped data "ID || Name"
  const getPipedPart = (value: string | undefined, part: 'id' | 'name'): string => {
    if (!value) return '';
    const raw = String(value);
    const [idPart, namePart] = raw.split('||').map((s) => s?.trim());

    if (!namePart) {
      // Not actually piped data, just return the whole value
      return raw.trim();
    }

    return part === 'id' ? (idPart || '') : (namePart || '');
  };

  const applyFilter = useCallback(async (payload: any, isInitialLoad: boolean = false) => {
    console.log('EquipmentCalendarPanel: applying filter with payload', payload, 'isInitialLoad:', isInitialLoad);
    console.log('EquipmentCalendarPanel: currentFilterPayloadRef.current', currentFilterPayloadRef.current);
    
    // IMPORTANT: Always store filters from payload (even if empty) when payload is explicitly provided
    // This ensures that when filters are cleared and applied, empty values override old values
    // Check if payload has filter properties (even if they're empty strings)
    const hasFilterProperties = payload && (
      payload.hasOwnProperty('EquipmentType') || 
      payload.hasOwnProperty('EquipmentCode') || 
      payload.hasOwnProperty('EquipmentStatus') || 
      payload.hasOwnProperty('EquipmentGroup') || 
      payload.hasOwnProperty('EquipmentContract') || 
      payload.hasOwnProperty('ContractAgent') || 
      payload.hasOwnProperty('EquipmentOwner') || 
      payload.hasOwnProperty('EquipmentCategory')
    );
    
    if (hasFilterProperties) {
      // Payload has filter properties - store them immediately (even if empty) to override old values
      // This is especially important when filters are cleared - empty values should replace old values
      currentFilterPayloadRef.current = {
        EquipmentType: payload.EquipmentType !== undefined ? (payload.EquipmentType || '') : (currentFilterPayloadRef.current?.EquipmentType || ''),
        EquipmentCode: payload.EquipmentCode !== undefined ? (payload.EquipmentCode || '') : (currentFilterPayloadRef.current?.EquipmentCode || ''),
        EquipmentStatus: payload.EquipmentStatus !== undefined ? (payload.EquipmentStatus || '') : (currentFilterPayloadRef.current?.EquipmentStatus || ''),
        EquipmentGroup: payload.EquipmentGroup !== undefined ? (payload.EquipmentGroup || '') : (currentFilterPayloadRef.current?.EquipmentGroup || ''),
        EquipmentContract: payload.EquipmentContract !== undefined ? (payload.EquipmentContract || '') : (currentFilterPayloadRef.current?.EquipmentContract || ''),
        ContractAgent: payload.ContractAgent !== undefined ? (payload.ContractAgent || '') : (currentFilterPayloadRef.current?.ContractAgent || ''),
        EquipmentOwner: payload.EquipmentOwner !== undefined ? (payload.EquipmentOwner || '') : (currentFilterPayloadRef.current?.EquipmentOwner || ''),
        EquipmentCategory: payload.EquipmentCategory !== undefined ? (payload.EquipmentCategory || '') : (currentFilterPayloadRef.current?.EquipmentCategory || ''),
        FromDate: currentFilterPayloadRef.current?.FromDate || '', // Preserve existing dates if any
        ToDate: currentFilterPayloadRef.current?.ToDate || '',   // Preserve existing dates if any
      };
      console.log('EquipmentCalendarPanel: Stored filters immediately from payload (before processing):', currentFilterPayloadRef.current);
    }
    
    setIsLoading(true);
    try {
      // Map payload to API params
      // Priority: 1) Dates from payload (filters), 2) Dates from ref, 3) Calculate from view (don't store)
      let fromDate = '';
      let toDate = '';
      let datesFromPayload = false;
      let datesFromRef = false;

      // Check if dates are provided in payload (from filters)
      if (payload.FromDate && payload.FromDate.trim() !== '') {
        try {
          const fromDateObj = new Date(payload.FromDate);
          if (!isNaN(fromDateObj.getTime())) {
            fromDate = format(fromDateObj, 'yyyy-MM-dd');
            datesFromPayload = true;
            // Update calendar startDate to navigate to the filter date
            setStartDate(fromDateObj);
            console.log('EquipmentCalendarPanel: Updated startDate to filter FromDate:', fromDateObj);
          }
        } catch {
          console.warn('EquipmentCalendarPanel: Invalid FromDate in payload, using calculated date');
        }
      }
      if (payload.ToDate && payload.ToDate.trim() !== '') {
        try {
          const toDateObj = new Date(payload.ToDate);
          if (!isNaN(toDateObj.getTime())) {
            toDate = format(toDateObj, 'yyyy-MM-dd');
            datesFromPayload = true;
            // If FromDate is not provided but ToDate is, use ToDate as startDate
            if (!payload.FromDate || payload.FromDate.trim() === '') {
              setStartDate(toDateObj);
              console.log('EquipmentCalendarPanel: Updated startDate to filter ToDate (FromDate not provided):', toDateObj);
            }
          }
        } catch {
          console.warn('EquipmentCalendarPanel: Invalid ToDate in payload, using calculated date');
        }
      }
      
      // Store the date range we're applying from filter (to prevent duplicate API calls)
      if (datesFromPayload) {
        lastFilterDateRangeRef.current = {
          fromDate: fromDate,
          toDate: toDate,
        };
        console.log('EquipmentCalendarPanel: Stored filter date range to prevent duplicate calls:', lastFilterDateRangeRef.current);
      }

      // If dates not in payload, check ref (from previous date range change)
      if (!datesFromPayload && currentFilterPayloadRef.current?.FromDate && currentFilterPayloadRef.current?.ToDate) {
        fromDate = currentFilterPayloadRef.current.FromDate;
        toDate = currentFilterPayloadRef.current.ToDate;
        datesFromRef = true;
      }

      // If still no dates, calculate from view (but don't store in ref)
      if (!datesFromPayload && !datesFromRef) {
        const { from, to } = getDefaultDateRangeForView(view);
        fromDate = format(from, 'yyyy-MM-dd');
        toDate = format(to, 'yyyy-MM-dd');
      }

      const tripNo =
        (tripInformation as any)?.Header?.TripNo ||
        (tripInformation as any)?.Header?.TripID ||
        '';

      // Merge computed dates back into payload for API call
      const finalPayload = {
        ...payload,
        FromDate: fromDate,
        ToDate: toDate,
      };
      
      // Only store in ref if dates came from payload (filters) or from ref (date range change)
      // Don't store dates if they were calculated from view
      if (datesFromPayload) {
        // Dates from filters - store everything including dates
        currentFilterPayloadRef.current = finalPayload;
      } else if (datesFromRef) {
        // Dates from ref - update filters but keep existing dates
        // IMPORTANT: Check if payload has filter properties (even if empty) to override old values
        const hasFilterProperties = payload && (
          payload.hasOwnProperty('EquipmentType') || 
          payload.hasOwnProperty('EquipmentCode') || 
          payload.hasOwnProperty('EquipmentStatus') || 
          payload.hasOwnProperty('EquipmentGroup') || 
          payload.hasOwnProperty('EquipmentContract') || 
          payload.hasOwnProperty('ContractAgent') || 
          payload.hasOwnProperty('EquipmentOwner') || 
          payload.hasOwnProperty('EquipmentCategory')
        );
        
        if (hasFilterProperties) {
          // Payload has filter properties - use them (even if empty) to override old values
          // This ensures that when filters are cleared, empty values replace old values
          currentFilterPayloadRef.current = {
            EquipmentType: payload.EquipmentType !== undefined ? (payload.EquipmentType || '') : (currentFilterPayloadRef.current?.EquipmentType || ''),
            EquipmentCode: payload.EquipmentCode !== undefined ? (payload.EquipmentCode || '') : (currentFilterPayloadRef.current?.EquipmentCode || ''),
            EquipmentStatus: payload.EquipmentStatus !== undefined ? (payload.EquipmentStatus || '') : (currentFilterPayloadRef.current?.EquipmentStatus || ''),
            EquipmentGroup: payload.EquipmentGroup !== undefined ? (payload.EquipmentGroup || '') : (currentFilterPayloadRef.current?.EquipmentGroup || ''),
            EquipmentContract: payload.EquipmentContract !== undefined ? (payload.EquipmentContract || '') : (currentFilterPayloadRef.current?.EquipmentContract || ''),
            ContractAgent: payload.ContractAgent !== undefined ? (payload.ContractAgent || '') : (currentFilterPayloadRef.current?.ContractAgent || ''),
            EquipmentOwner: payload.EquipmentOwner !== undefined ? (payload.EquipmentOwner || '') : (currentFilterPayloadRef.current?.EquipmentOwner || ''),
            EquipmentCategory: payload.EquipmentCategory !== undefined ? (payload.EquipmentCategory || '') : (currentFilterPayloadRef.current?.EquipmentCategory || ''),
            FromDate: fromDate, // Keep dates from ref
            ToDate: toDate,     // Keep dates from ref
          };
        } else {
          // Keep existing filters, just update dates
          currentFilterPayloadRef.current = {
            ...currentFilterPayloadRef.current,
            FromDate: fromDate,
            ToDate: toDate,
          };
        }
      } else {
        // Dates calculated from view - store filters from payload
        // IMPORTANT: If payload has filter properties (even if empty), use them to override old values
        // This ensures that when filters are cleared, empty values replace old values
        const hasFilterProperties = payload && (
          payload.hasOwnProperty('EquipmentType') || 
          payload.hasOwnProperty('EquipmentCode') || 
          payload.hasOwnProperty('EquipmentStatus') || 
          payload.hasOwnProperty('EquipmentGroup') || 
          payload.hasOwnProperty('EquipmentContract') || 
          payload.hasOwnProperty('ContractAgent') || 
          payload.hasOwnProperty('EquipmentOwner') || 
          payload.hasOwnProperty('EquipmentCategory')
        );
        
        if (hasFilterProperties) {
          // Payload has filter properties - use them (even if empty) to override old values
          // This is important when filters are cleared - empty values should replace old values
          currentFilterPayloadRef.current = {
            EquipmentType: payload.EquipmentType !== undefined ? (payload.EquipmentType || '') : (currentFilterPayloadRef.current?.EquipmentType || ''),
            EquipmentCode: payload.EquipmentCode !== undefined ? (payload.EquipmentCode || '') : (currentFilterPayloadRef.current?.EquipmentCode || ''),
            EquipmentStatus: payload.EquipmentStatus !== undefined ? (payload.EquipmentStatus || '') : (currentFilterPayloadRef.current?.EquipmentStatus || ''),
            EquipmentGroup: payload.EquipmentGroup !== undefined ? (payload.EquipmentGroup || '') : (currentFilterPayloadRef.current?.EquipmentGroup || ''),
            EquipmentContract: payload.EquipmentContract !== undefined ? (payload.EquipmentContract || '') : (currentFilterPayloadRef.current?.EquipmentContract || ''),
            ContractAgent: payload.ContractAgent !== undefined ? (payload.ContractAgent || '') : (currentFilterPayloadRef.current?.ContractAgent || ''),
            EquipmentOwner: payload.EquipmentOwner !== undefined ? (payload.EquipmentOwner || '') : (currentFilterPayloadRef.current?.EquipmentOwner || ''),
            EquipmentCategory: payload.EquipmentCategory !== undefined ? (payload.EquipmentCategory || '') : (currentFilterPayloadRef.current?.EquipmentCategory || ''),
            FromDate: '', // Don't store calculated dates
            ToDate: '',   // Don't store calculated dates
          };
        } else {
          // Payload doesn't have filter properties - preserve existing filters
          const existingFilters = currentFilterPayloadRef.current || {};
          currentFilterPayloadRef.current = {
            EquipmentType: existingFilters.EquipmentType || '',
            EquipmentCode: existingFilters.EquipmentCode || '',
            EquipmentStatus: existingFilters.EquipmentStatus || '',
            EquipmentGroup: existingFilters.EquipmentGroup || '',
            EquipmentContract: existingFilters.EquipmentContract || '',
            ContractAgent: existingFilters.ContractAgent || '',
            EquipmentOwner: existingFilters.EquipmentOwner || '',
            EquipmentCategory: existingFilters.EquipmentCategory || '',
            FromDate: '', // Don't store calculated dates
            ToDate: '',   // Don't store calculated dates
          };
        }
      }
      
      console.log('EquipmentCalendarPanel: Stored filters in ref:', currentFilterPayloadRef.current);

      // Extract filter values - handle both piped format ("ID || Name") and plain values
      const equipmentTypeValue = finalPayload.EquipmentType || '';
      const equipmentCodeValue = finalPayload.EquipmentCode || '';
      const equipmentStatusValue = finalPayload.EquipmentStatus || '';
      const equipmentContractValue = finalPayload.EquipmentContract || '';
      const contractAgentValue = finalPayload.ContractAgent || '';
      const equipmentGroupValue = finalPayload.EquipmentGroup || '';
      const equipmentOwnerValue = finalPayload.EquipmentOwner || '';
      const equipmentCategoryValue = finalPayload.EquipmentCategory || '';

      console.log('EquipmentCalendarPanel: Filter values from finalPayload:', {
        EquipmentType: equipmentTypeValue,
        EquipmentStatus: equipmentStatusValue,
        EquipmentGroup: equipmentGroupValue,
        EquipmentContract: equipmentContractValue,
        ContractAgent: contractAgentValue,
        EquipmentOwner: equipmentOwnerValue,
        EquipmentCategory: equipmentCategoryValue,
      });

      const params = {
        TripNo: tripNo || null,
        RequestHeader: {
          AdditionalFilter: [
            { FilterName: 'FromDate', FilterValue: finalPayload.FromDate || '' },
            { FilterName: 'ToDate', FilterValue: finalPayload.ToDate || '' },
            { FilterName: 'EquipmentType', FilterValue: getPipedPart(equipmentTypeValue, 'id') },
            { FilterName: 'EquipmentCode', FilterValue: getPipedPart(equipmentCodeValue, 'id') },
            { FilterName: 'EquipmentStatus', FilterValue: getPipedPart(equipmentStatusValue, 'name') },
            { FilterName: 'EquipmentContract', FilterValue: getPipedPart(equipmentContractValue, 'id') },
            { FilterName: 'ContractAgent', FilterValue: getPipedPart(contractAgentValue, 'id') },
            { FilterName: 'EquipmentGroup', FilterValue: getPipedPart(equipmentGroupValue, 'id') },
            // For EquipmentOwner we expect piped data like \"OWNER01 || Some Owner Name\"; send only ID part
            { FilterName: 'EquipmentOwner', FilterValue: getPipedPart(equipmentOwnerValue, 'id') },
            { FilterName: 'EquipmentCategory', FilterValue: getPipedPart(equipmentCategoryValue, 'id') },
          ]
        }
      };

      console.log('EquipmentCalendarPanel: API params AdditionalFilter:', params.RequestHeader.AdditionalFilter);

      const response: any = await tripPlanningService.getEquipmentCalendarData(params as any);
      const responseDataString = response?.ResponseData || response?.data?.ResponseData;
      let parsed: ResourceCategoryResponse | null = null;
      try {
        parsed = responseDataString ? JSON.parse(responseDataString) : null;
      } catch (err) {
        console.warn('Failed to parse calendar response ResponseData', err);
      }

      if (parsed && Array.isArray(parsed.ResourceDetails) && parsed.ResourceDetails.length > 0) {
        const equipments = parsed.ResourceDetails.map(transformResourceToEquipment);
        const events = parsed.ResourceDetails.flatMap(transformTripDataToEvents);
        setApiEquipments(equipments);
        setApiEvents(events);
        // toast({ title: 'Filter applied', description: 'Equipment filter applied', variant: 'default' });
      } else {
        // Clear cached data when ResourceDetails is null, empty, or not an array
        console.log('EquipmentCalendarPanel: ResourceDetails is null/empty, clearing cached data');
        setApiEquipments([]);
        setApiEvents([]);
        // toast({ title: 'No results', description: 'No equipment returned for filter', variant: 'default' });
      }
    } catch (err) {
      console.error('Error applying equipment filter', err);
      // Clear cached data on error to prevent showing stale data
      setApiEquipments([]);
      setApiEvents([]);
      toast({ title: 'Error', description: 'Failed to apply filter', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [view, tripInformation]); // Memoize with dependencies: view and tripInformation

  // Track if initial load has been done to prevent duplicate API calls
  const hasInitializedRef = useRef<boolean>(false);
  // Note: ref is reset automatically when the component unmounts,
  // so no need for an explicit effect tied to a prop.

  // Initial load: Skip this - let SmartEquipmentCalendar's onDateRangeChange handle initial load
  // This prevents duplicate API calls (one from here, one from SmartEquipmentCalendar's useEffect)
  // The SmartEquipmentCalendar will call onDateRangeChange on mount, which will trigger handleDateRangeChange
  // and make the initial API call with proper date ranges

  // Expose filter apply function to parent (e.g., ResourceSelectionDrawer)
  // Only register once when component mounts or when applyFilter changes
  useEffect(() => {
    if (onRegisterApplyFilter) {
      onRegisterApplyFilter(applyFilter);
    }
  }, [onRegisterApplyFilter, applyFilter]); // Include applyFilter in deps since it's now memoized

  // Expose function to get equipment objects from calendar
  useEffect(() => {
    if (onRegisterGetEquipments) {
      onRegisterGetEquipments(() => apiEquipments);
    }
  }, [onRegisterGetEquipments, apiEquipments]);

  // When view (day/week/month) changes, just update the view state
  // The SmartEquipmentCalendar's useEffect will detect the view change and call handleDateRangeChange
  // which will then call applyFilter with the new date range and existing filters
  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setView(newView);
    onViewChange?.(newView);
    // Don't call applyFilter here - let handleDateRangeChange handle it to avoid double API calls
  };

  // Server-side filtering callback - when date range changes (e.g., navigation prev/next)
  const handleDateRangeChange = useCallback((params: DateRangeParams) => {
    console.log('EquipmentCalendarPanel: handleDateRangeChange called with params', params);
    console.log('EquipmentCalendarPanel: currentFilterPayloadRef.current before update', currentFilterPayloadRef.current);
    
    // Check if this date range matches the one we just applied from a filter
    // If so, skip the API call to prevent duplicate calls
    const paramsFromDate = format(params.startDate, 'yyyy-MM-dd');
    const paramsToDate = format(params.endDate, 'yyyy-MM-dd');
    
    if (lastFilterDateRangeRef.current) {
      const { fromDate, toDate } = lastFilterDateRangeRef.current;
      if (fromDate === paramsFromDate && toDate === paramsToDate) {
        console.log('EquipmentCalendarPanel: Skipping handleDateRangeChange - date range matches filter date range (already applied)');
        // Clear the ref so subsequent navigation changes will trigger API calls
        lastFilterDateRangeRef.current = null;
        return;
      }
    }
    
    // Determine if this is the initial load (first time handleDateRangeChange is called)
    const isInitialLoad = !hasInitializedRef.current;
    
    // Get current filter payload from ref (preserve all existing filters)
    // IMPORTANT: During initial load when switching views, filters might be stored in ref by applyFilter
    // Always use filters from ref if they exist, otherwise use empty filters
    // This ensures filters are always passed to API (even if empty)
    const basePayload = currentFilterPayloadRef.current ? {
      ...currentFilterPayloadRef.current,
      // Preserve all filter values from ref (including filters stored by applyFilter when switching views)
    } : {
      // Default empty filters - always pass these to API
      EquipmentType: '',
      EquipmentCode: '',
      EquipmentStatus: '',
      FromDate: '',
      ToDate: '',
      EquipmentGroup: '',
      EquipmentContract: '',
      ContractAgent: '',
      EquipmentOwner: '',
      EquipmentCategory: '',
    };

    // Update date range from params (always update dates, preserve filters)
    const updatedPayload = {
      ...basePayload,
      FromDate: format(params.startDate, 'yyyy-MM-dd'),
      ToDate: format(params.endDate, 'yyyy-MM-dd'),
    };

    console.log('EquipmentCalendarPanel: handleDateRangeChange - updatedPayload with filters:', updatedPayload);
    console.log('EquipmentCalendarPanel: handleDateRangeChange - isInitialLoad:', isInitialLoad);

    // Mark as initialized after first call
    if (isInitialLoad) {
      hasInitializedRef.current = true;
    }

    // Apply filter with new date range and existing filters (always pass filters, even if empty)
    // During initial load, this will use filters from ref if they were stored by applyFilter
    applyFilter(updatedPayload, isInitialLoad);
  }, [applyFilter]); // Include applyFilter in deps since it's memoized

  return (
    <div className="flex-1 overflow-hidden relative">
      {/* Top-level loading overlay - more visible than the one inside SmartEquipmentCalendar */}
      {isLoading && (
        // <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        //   <div className="flex flex-col items-center gap-3 bg-background px-6 py-4 rounded-lg shadow-xl border">
        //     <Loader2 className="h-8 w-8 animate-spin text-primary" />
        //     <span className="text-sm font-medium text-foreground">Loading equipment calendar data...</span>
        //   </div>
        // </div>
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
            <div className="text-lg font-semibold text-blue-700">Loading...</div>
            <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
          </div>
      )}
      <SmartEquipmentCalendar
        equipments={apiEquipments}
        events={apiEvents}
        view={view}
        startDate={startDate}
        showHourView={showHourView}
        statusFilter={statusFilter}
        selectedEquipments={selectedEquipments}
        onViewChange={handleViewChange}
        onShowHourViewChange={(v) => { setShowHourView(v); onShowHourViewChange?.(v); }}
        onStatusFilterChange={(s) => { setStatusFilter(s); onStatusFilterChange?.(s); }}
        onSelectionChange={(ids) => {
          console.log('EquipmentCalendarPanel: onSelectionChange ids =', ids);
          setSelectedEquipments(ids);
          try {
            const selectedDetails = apiEquipments.filter(eq => ids.includes(eq.id));
            console.log('EquipmentCalendarPanel: selected equipments =', selectedDetails);
            // Notify parent with both IDs and full equipment objects
            onSelectionChange?.(ids);
          } catch (err) {
            console.warn('EquipmentCalendarPanel: failed to compute selected equipments details', err);
            onSelectionChange?.(ids);
          }
        }}
        onAddToTrip={(ids) => { onAddToTrip?.(ids); }}
        onBarClick={(e) => { onBarClick?.(e); }}
        onEquipmentClick={(eq) => { onEquipmentClick?.(eq); }}
        enableDrag={enableDrag}
        filterMode={filterMode}
        onDateRangeChange={handleDateRangeChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EquipmentCalendarPanel;
