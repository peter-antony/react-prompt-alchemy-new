export type ModeFlag = "Insert" | "Update" | "Delete" | "NoChange";
// Basic Customer
export interface CustomerItem {
  CustomerID: string;
  CustomerName: string;
}

export interface Cancellation {
  CancellationRequestedDateTime?: string;
  CancellationReasonCode?: string;
  CancellationReasonCodeDescription?: string;
  CancellationRemarks?: string;
}

export interface ShortClose {
  ShortCloseRequestedDateTime?: string;
  ShortCloseReasonCode?: string;
  ShortCloseReasonCodeDescription?: string;
  ShortCloseRemarks?: string;
}

export interface Amendment {
  AmendmentRequestedDateTime?: string;
  AmendmentReasonCode?: string;
  AmendmentReasonCodeDescription?: string;
  AmendmentRemarks?: string;
}

export interface VendorPerformanceFeedback {
  VendorID?: string;
  VendorDescription?: string;
  Feedback?: string;
  Rating?: number;
  ReasonCode?: string;
  Remarks?: string;
  ModeFlag?: string;
}

export interface PreviousNextTrip {
  TripNo?: string;
  TripOU?: string | number;
}

export interface Header {
  TripNo?: string;
  TripOU?: number | string;
  TripStatus?: string;
  TripStatusDescription?: string;
  Customer?: CustomerItem[];
  TransportSupplier?: string;
  TransportSupplierDescription?: string;
  SupplierRefNo?: string;
  TripType?: string;
  DeparturePoint?: string;
  DeparturePointDescription?: string;
  ArrivalPoint?: string;
  ArrivalPointDescription?: string;
  ForwardTripID?: string;
  ReturnTripID?: string;
  IsRoundTrip?: string;
  IsOneWay?: string;
  CO2Emisions?: string;
  CO2EmisionsUOM?: string;
  LoadType?: string;
  BillingValueWithCurrency?: string;
  UpdatedBillingValue?: string;
  BillingStatus?: string;
  QuickCode1?: string;
  QuickCode2?: string;
  QuickCode3?: string;
  QuickCodeValue1?: string;
  QuickCodeValue2?: string;
  QuickCodeValue3?: string;
  Remarks1?: string;
  Remarks2?: string;
  Remarks3?: string;
  PreviousTrip?: PreviousNextTrip[];
  NextTrip?: PreviousNextTrip[];
  TransportMode?: string;
  ServiceType?: string;
  ServiceTypeDescription?: string;
  SubServiceType?: string;
  SubServiceTypeDescription?: string;
  TrainNo?: string;
  Cluster?: string;
  ClusterDescription?: string;
  Remarks?: string;
  TripOdometerStart?: string;
  TripOdometerEnd?: string;
  TotalOdometer?: string;
  OdometerUOM?: string;
  ModeFlag?: string;
  Cancellation?: Cancellation;
  ShortClose?: ShortClose;
  Amendment?: Amendment;
  VendorPerformaneFeedback?: VendorPerformanceFeedback;
}

// 🔹 PathConstraints
export interface PathConstraints {
  PlanedLength: string;
  ActualLength: string;
  BalanceLength: string;
  LengthUOM: string;
  PlannedWeight: string;
  ActualWeight: string;
  BalanceWeight: string;
  WeightUOM: string;
  PlannedQuantity: string;
  ActualQuantity: string;
  QuantityUOM: string;
  ModeFlag: ModeFlag;
}

// 🔹 LinkedTransactions
export interface LinkedTransactionClaims {
  ClaimsID: string;
  ClaimsStatus: string;
  ClaimsDate: string;
  ClaimsFor: string;
  CustomerIDVendorID: string;
  CustomerDescriptionVendorDescription: string;
}
export interface LinkedTransactionQuickOrder {
  QuickOrderNo: string;
  QuickOrderStatus: string;
  ResourcesGroupID: string;
  AmountWithCurrency: string;
  FromDate: string;
  ToDate: string;
}
export interface LinkedTransactionTripPlan {
  TripID: string;
  TripStatus: string;
  TripDate: string;
  TransportSupplier: string;
}

export interface LinkedTransactions {
  Claims: LinkedTransactionClaims[];
  QuickOrder: LinkedTransactionQuickOrder[];
  TripPlan: LinkedTransactionTripPlan[];
}

// 🔹 Incident
export interface Incident {
  IncidentId: string;
  IncidentStatus: string;
  CreatedDate: string;
  IncidentDate: string;
  IncidentTime: string;
  IncidentType: string;
  PlaceOfIncident: string;
  ShortDescription: string;
  DetailedDescription: string;
  MaintenanceDescription: string;
  ClaimNumber: string;
  ModeFlag: ModeFlag;
}

// 🔹 Supplier Billing
export interface SupplierBillingDetails {
  SupplierID: string;
  SupplierDescription: string;
  SupplierRefNo: string;
  ModeFlag: ModeFlag;
}

// 🔹 Track & Trace
export interface TrackAndTrace {
  TripExecutionID: string;
  Event: string;
  Latitude: number;
  Longitude: number;
  Remarks: string;
  ModeFlag: ModeFlag;
}

// 🔹 LegDetails
export interface LegActivityContact {
  ContactPerson: string;
  ContactNo: string;
  EmailID: string;
  Remarks: string;
  ModeFlag: ModeFlag;
}
export interface LegActivity {
  CustomerID: string;
  CustomerName: string;
  Activity: string;
  ContactDetails: LegActivityContact;
  ModeFlag: ModeFlag;
}
export interface LegDetail {
  LegSequence: string;
  LegBehaviour: string;
  FromShipPoint: string;
  ToShipPoint: string;
  ModeFlag: ModeFlag;
  Activities: LegActivity[];
}

// 🔹 Root
export interface TripData {
  Header?: Header;
  PathConstraints?: PathConstraints;
  LinkedTransactions?: LinkedTransactions;
  Incident?: Incident[];
  SupplierBillingDetails?: SupplierBillingDetails[];
  TrackAndTrace?: TrackAndTrace[];
  LegDetails?: LegDetail[];
}