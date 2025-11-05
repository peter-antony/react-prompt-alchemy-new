import { create } from 'zustand';
import { tripService } from '@/api/services/tripService';

// Types focused on Header and LegDetails since only these are functionally needed now

export interface CustomerInfo {
  CustomerID: string | null;
  CustomerName: string | null;
}

export interface ReasonBlock {
  CancellationRequestedDateTime?: string | null;
  CancellationReasonCode?: string | null;
  CancellationReasonCodeDescription?: string | null;
  CancellationRemarks?: string | null;
  ShortCloseRequestedDateTime?: string | null;
  ShortCloseReasonCode?: string | null;
  ShortCloseReasonCodeDescription?: string | null;
  ShortCloseRemarks?: string | null;
  AmendmentRequestedDateTime?: string | null;
  AmendmentReasonCode?: string | null;
  AmendmentReasonCodeDescription?: string | null;
  AmendmentRemarks?: string | null;
}

export interface PreviousTripRef { PrevTripNo: string; PrevTripOU: string | number; }
export interface NextTripRef { NextTripNo: string; NextTripOU: string | number; }

export interface VendorPerformanceFeedback {
  VendorID: string | null;
  VendorDescription: string | null;
  Feedback: string | null;
  Rating: number | null;
  ReasonCode: string | null;
  ReasonCodeDescription: string | null;
  Remarks: string | null;
  ModeFlag: string | null;
}

export interface TripHeader {
  TripNo: string;
  TripOU: number;
  TripStatus: string;
  TripStatusDescription: string;
  Customer: CustomerInfo;
  TransportSupplier: string | null;
  TransportSupplierDescription: string | null;
  SupplierRefNo: string | null;
  TripType: string | null;
  DeparturePoint: string | null;
  DeparturePointDescription: string | null;
  ArrivalPoint: string | null;
  ArrivalPointDescription: string | null;
  ForwardTripID: string | null;
  ReturnTripID: string | null;
  IsRoundTrip: string | null;
  IsOneWay: string | null;
  CO2Emisions: string | number | null;
  CO2EmisionsUOM: string | null;
  LoadType: string | null;
  BillingValueWithCurrency: number | null;
  UpdatedBillingValue: number | null;
  BillingStatus: string | null;
  QuickCode1: string | null;
  QuickCode2: string | null;
  QuickCode3: string | null;
  QuickCodeValue1: string | null;
  QuickCodeValue2: string | null;
  QuickCodeValue3: string | null;
  Remarks1: string | null;
  Remarks2: string | null;
  Remarks3: string | null;
  PreviousTrip: PreviousTripRef[] | null;
  NextTrip: NextTripRef[] | null;
  TransportMode: string | null;
  ServiceType: string | null;
  ServiceTypeDescription: string | null;
  SubServiceType: string | null;
  SubServiceTypeDescription: string | null;
  TrainNo: string | null;
  Cluster: string | null;
  ClusterDescription: string | null;
  Remarks: string | null;
  TripOdometerStart: string | null;
  TripOdometerEnd: string | null;
  TotalOdometer: string | null;
  OdometerUOM: string | null;
  PlanStartDate: string | null;
  PlanStartTime: string | null;
  PlanEndDate: string | null;
  PlanEndTime: string | null;
  ModeFlag: string | null;
  Cancellation?: ReasonBlock | null;
  ShortClose?: ReasonBlock | null;
  Amendment?: ReasonBlock | null;
  VendorPerformaneFeedback?: VendorPerformanceFeedback | null;
}

export interface ActivityDetail {
  SeqNo: number;
  Activity: string;
  ActivityDescription: string | null;
  CustomerID: string | null;
  CustomerName: string | null;
  ConsignmentInformation: string | null;
  CustomerOrder: string | null;
  PlannedDate: string | null;
  PlannedTime: string | null;
  RevisedDate: string | null;
  RevisedTime: string | null;
  ActualDate: string | null;
  ActualTime: string | null;
  DelayedIn: string | null;
  QuickCode1: string | null;
  QuickCode2: string | null;
  QuickCode3: string | null;
  QuickCodeValue1: string | null;
  QuickCodeValue2: string | null;
  QuickCodeValue3: string | null;
  Remarks1: string | null;
  Remarks2: string | null;
  Remarks3: string | null;
  EventProfile: string | null;
  ReasonForChanges: string | null;
  DelayedReason: string | null;
  LastIdentifiedLocation: string | null;
  LastIdentifiedLocationDescription: string | null;
  LastIdentifiedDate: string | null;
  LastIdentifiedTime: string | null;
  AmendmentNo: string | null;
  ModeFlag: string | null;
  ContactDetails: unknown | null;
}

export interface LegDetailNew {
  LegSequence: string | number;
  LegBehaviour: string | null;
  LegBehaviourDescription: string | null;
  DeparturePoint: string | null;
  DeparturePointDescription: string | null;
  ArrivalPoint: string | null;
  ArrivalPointDescription: string | null;
  LegStartOdometer: string | number | null;
  LegEndOdometer: string | number | null;
  PlanStartDate: string | null;
  PlanStartTime: string | null;
  PlanEndDate: string | null;
  PlanEndTime: string | null;
  ModeFlag: string | null;
  Activities: ActivityDetail[] | null;
  AdditionalActivities?: unknown;
  Consignment?: unknown[] | null;
}

export interface CustomerOrderEntry {
  CustomerOrderNo: string;
  CustomerOrderStatus: string | null;
  TransportMode: string | null;
  ExecutionPlanID: string | null;
  CustomerID: string | null;
  CustomerName: string | null;
  DeparturePoint: string | null;
  DeparturePointDescription: string | null;
  ArrivalPoint: string | null;
  ArrivalPointDescription: string | null;
  DepartureDate: string | null;
  ArrivalDate: string | null;
  LegBehaviour: string | null;
  LegBehaviourDescription: string | null;
  LegID: string | null;
  DepartureLegFrom: string | null;
  DepartureLegTo: string | null;
  PickupDateTime: string | null;
  DeliveryDateTime: string | null;
  PlannedFromDateTime: string | null;
  PlannedToDateTime: string | null;
  Consignor: string | null;
  Consignee: string | null;
  ServiceType: string | null;
  ServiceTypeDescription: string | null;
  SubServiceType: string | null;
  SubServiceTypeDescription: string | null;
  LoadType: string | null;
  CustomerDocuments: string | null;
  ModeFlag: string | null;
}

export interface TripLegAndEventsData {
  Header: TripHeader;
  LegDetails: LegDetailNew[];
  CustomerOrders: CustomerOrderEntry[] | null;
  LinkedTransactions?: unknown;
  ResourceDetails?: unknown;
}

interface TripLegAndEventsStoreState {
  data: TripLegAndEventsData | null;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoadedTripId?: string | null;
  // Load/clear
  setFromJson: (payload: Partial<TripLegAndEventsData> | null) => void;
  clear: () => void;
  loadFromApi: (params: { tripId: string }) => Promise<void>;
  // Header updates
  updateHeaderField: (field: keyof TripHeader, value: TripHeader[keyof TripHeader]) => void;
  // Leg updates
  addLeg: (initial?: Partial<LegDetailNew>) => void;
  removeLeg: (legIndex: number) => void;
  updateLegField: (legIndex: number, field: keyof LegDetailNew, value: LegDetailNew[keyof LegDetailNew]) => void;
  // Activities within a leg
  addActivity: (legIndex: number, initial?: Partial<ActivityDetail>) => void;
  updateActivityField: (
    legIndex: number,
    activityIndex: number,
    field: keyof ActivityDetail,
    value: ActivityDetail[keyof ActivityDetail]
  ) => void;
  removeActivity: (legIndex: number, activityIndex: number) => void;
  // Get fresh data for saving
  saveTripData: () => TripLegAndEventsData | null;
}

function normalizeArrayOrNull<T>(arr: unknown, mapFn?: (v: any, idx: number) => T): T[] {
  const source = Array.isArray(arr) ? arr : [];
  return mapFn ? source.map(mapFn) : (source as T[]);
}

function createEmptyHeader(): TripHeader {
  return {
    TripNo: '',
    TripOU: 0,
    TripStatus: '',
    TripStatusDescription: '',
    Customer: { CustomerID: null, CustomerName: null },
    TransportSupplier: null,
    TransportSupplierDescription: null,
    SupplierRefNo: null,
    TripType: null,
    DeparturePoint: null,
    DeparturePointDescription: null,
    ArrivalPoint: null,
    ArrivalPointDescription: null,
    ForwardTripID: null,
    ReturnTripID: null,
    IsRoundTrip: null,
    IsOneWay: null,
    CO2Emisions: null,
    CO2EmisionsUOM: null,
    LoadType: null,
    BillingValueWithCurrency: null,
    UpdatedBillingValue: null,
    BillingStatus: null,
    QuickCode1: null,
    QuickCode2: null,
    QuickCode3: null,
    QuickCodeValue1: null,
    QuickCodeValue2: null,
    QuickCodeValue3: null,
    Remarks1: null,
    Remarks2: null,
    Remarks3: null,
    PreviousTrip: null,
    NextTrip: null,
    TransportMode: null,
    ServiceType: null,
    ServiceTypeDescription: null,
    SubServiceType: null,
    SubServiceTypeDescription: null,
    TrainNo: null,
    Cluster: null,
    ClusterDescription: null,
    Remarks: null,
    TripOdometerStart: null,
    TripOdometerEnd: null,
    TotalOdometer: null,
    OdometerUOM: null,
    PlanStartDate: null,
    PlanStartTime: null,
    PlanEndDate: null,
    PlanEndTime: null,
    ModeFlag: null,
    Cancellation: null,
    ShortClose: null,
    Amendment: null,
    VendorPerformaneFeedback: null
  };
}

function createEmptyLeg(legSequence: number): LegDetailNew {
  return {
    LegSequence: String(legSequence),
    LegBehaviour: null,
    LegBehaviourDescription: null,
    DeparturePoint: null,
    DeparturePointDescription: null,
    ArrivalPoint: null,
    ArrivalPointDescription: null,
    LegStartOdometer: null,
    LegEndOdometer: null,
    PlanStartDate: null,
    PlanStartTime: null,
    PlanEndDate: null,
    PlanEndTime: null,
    ModeFlag: null,
    Activities: [],
    AdditionalActivities: undefined,
    Consignment: null
  };
}

function createEmptyActivity(seqNo: number): ActivityDetail {
  return {
    SeqNo: seqNo,
    Activity: '',
    ActivityDescription: null,
    CustomerID: null,
    CustomerName: null,
    ConsignmentInformation: null,
    CustomerOrder: null,
    PlannedDate: null,
    PlannedTime: null,
    RevisedDate: null,
    RevisedTime: null,
    ActualDate: null,
    ActualTime: null,
    DelayedIn: null,
    QuickCode1: null,
    QuickCode2: null,
    QuickCode3: null,
    QuickCodeValue1: null,
    QuickCodeValue2: null,
    QuickCodeValue3: null,
    Remarks1: null,
    Remarks2: null,
    Remarks3: null,
    EventProfile: null,
    ReasonForChanges: null,
    DelayedReason: null,
    LastIdentifiedLocation: null,
    LastIdentifiedLocationDescription: null,
    LastIdentifiedDate: null,
    LastIdentifiedTime: null,
    AmendmentNo: null,
    ModeFlag: null,
    ContactDetails: null
  };
}

export const useTripLegandEventsStore = create<TripLegAndEventsStoreState>((set, get) => ({
  data: null,
  isLoaded: false,
  isLoading: false,
  error: null,
  lastLoadedTripId: null,

  setFromJson: (payload) => {
    const header: TripHeader = {
      ...createEmptyHeader(),
      ...(payload?.Header || {})
    } as TripHeader;

    const legs: LegDetailNew[] = normalizeArrayOrNull<LegDetailNew>(payload?.LegDetails, (leg, idx) => ({
      ...createEmptyLeg(idx + 1),
      ...leg,
      Activities: normalizeArrayOrNull<ActivityDetail>(leg?.Activities, (a, aIdx) => ({
        ...createEmptyActivity(aIdx + 1),
        ...a
      }))
    }));

    const customerOrders: CustomerOrderEntry[] | null = normalizeArrayOrNull<CustomerOrderEntry>(
      (payload as any)?.CustomerOrders
    ).map((co) => ({ ...co })) || null;

    set({
      data: {
        Header: header,
        LegDetails: legs,
        CustomerOrders: customerOrders,
        LinkedTransactions: (payload as any)?.LinkedTransactions ?? null,
        ResourceDetails: (payload as any)?.ResourceDetails ?? null
      },
      isLoaded: true,
      isLoading: false,
      error: null
    });
  },

  clear: () => {
    set({ data: null, isLoaded: false, isLoading: false, error: null, lastLoadedTripId: null });
  },

  loadFromApi: async ({ tripId }) => {
    try {
      set({ isLoading: true, error: null });
      const response: any = await tripService.getTripById({ id: tripId });
      const raw = response?.data;
      let payload: any = null;
      if (raw?.ResponseData) {
        try {
          const parsed = JSON.parse(raw.ResponseData);
          payload = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {
          payload = raw.ResponseData;
        }
      } else if (raw) {
        payload = raw;
      }
      if (!payload) {
        set({ isLoading: false, isLoaded: false, error: 'Empty response', lastLoadedTripId: tripId });
        return;
      }
      get().setFromJson(payload);
      set({ lastLoadedTripId: tripId });
    } catch (e: any) {
      set({ isLoading: false, isLoaded: false, error: e?.message || 'Failed to load', lastLoadedTripId: tripId });
    }
  },

  updateHeaderField: (field, value) => {
    const current = get().data;
    if (!current) return;
    set({
      data: {
        ...current,
        Header: {
          ...current.Header,
          [field]: value as any,
          ModeFlag: 'Update' // Set ModeFlag to "Update" when any header field is updated
        }
      }
    });
  },

  addLeg: (initial) => {
    const current = get().data;
    if (!current) return;
    const nextSeq = (current.LegDetails?.length || 0) + 1;
    const newLeg: LegDetailNew = {
      ...createEmptyLeg(nextSeq),
      ...(initial || {})
    };
    set({
      data: {
        ...current,
        LegDetails: [...current.LegDetails, newLeg]
      }
    });
  },

  removeLeg: (legIndex) => {
    const current = get().data;
    if (!current) return;
    const updated = (current.LegDetails || []).filter((_, i) => i !== legIndex).map((l, i) => ({
      ...l,
      LegSequence: String(i + 1)
    }));
    set({
      data: {
        ...current,
        LegDetails: updated
      }
    });
  },

  updateLegField: (legIndex, field, value) => {
    const current = get().data;
    if (!current) return;
    const legs = [...current.LegDetails];
    legs[legIndex] = {
      ...legs[legIndex],
      [field]: value as any,
      ModeFlag: 'Update' // Set ModeFlag to "Update" when any leg field is updated
    };
    set({ 
      data: { 
        ...current, 
        LegDetails: legs,
        Header: {
          ...current.Header,
          ModeFlag: 'Update' // Also update Header ModeFlag when leg is modified
        }
      } 
    });
  },

  addActivity: (legIndex, initial) => {
    const current = get().data;
    if (!current) return;
    const legs = [...current.LegDetails];
    const activities = normalizeArrayOrNull<ActivityDetail>(legs[legIndex].Activities);
    const nextSeq = activities.length + 1;
    const newActivity: ActivityDetail = {
      ...createEmptyActivity(nextSeq),
      ...(initial || {})
    };
    legs[legIndex] = {
      ...legs[legIndex],
      Activities: [...activities, newActivity]
    };
    set({ data: { ...current, LegDetails: legs } });
  },

  updateActivityField: (legIndex, activityIndex, field, value) => {
    const current = get().data;
    if (!current) return;
    const legs = [...current.LegDetails];
    const activities = normalizeArrayOrNull<ActivityDetail>(legs[legIndex].Activities);
    activities[activityIndex] = {
      ...activities[activityIndex],
      [field]: value as any,
      ModeFlag: 'Update' // Set ModeFlag to "Update" when activity is updated
    };
    legs[legIndex] = {
      ...legs[legIndex],
      Activities: activities,
      ModeFlag: 'Update' // Set leg ModeFlag to "Update" when activity is modified
    };
    set({ 
      data: { 
        ...current, 
        LegDetails: legs,
        Header: {
          ...current.Header,
          ModeFlag: 'Update' // Also update Header ModeFlag when activity is modified
        }
      } 
    });
  },

  removeActivity: (legIndex, activityIndex) => {
    const current = get().data;
    if (!current) return;
    const legs = [...current.LegDetails];
    const activities = normalizeArrayOrNull<ActivityDetail>(legs[legIndex].Activities)
      .filter((_, i) => i !== activityIndex)
      .map((a, idx) => ({ ...a, SeqNo: idx + 1 }));
    legs[legIndex] = {
      ...legs[legIndex],
      Activities: activities
    };
    set({ data: { ...current, LegDetails: legs } });
  },

  saveTripData: () => {
    return get().data;
  }
}));


