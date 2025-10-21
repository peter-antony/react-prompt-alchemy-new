export interface SearchCriteria {
  PlanningProfileID: string;
  Location: string;
  PlanDate: string;
  CustomerOrderProfileID: string;
  CustomerID: string;
  ContractID: string;
  DepartureDate: string;
  ArrivalDate: string;
  CustomerOrderID: string;
  LegID: string;
  TransportMode: string;
  COStatus: string;
  Service: string;
  SubService: string;
  CustomerOrderFromCreationDate: string;
  CustomerOrderToCreationDate: string;
  CustomerOrderDateFrom: string;
  CustomerTOrderDateTo: string;
  CustomerRefNo: string;
  Cluster: string;
  LoadType: string;
  ShuntedOutEquipment: string;
  IsShuntedOutWagons: string;
  IsShowForwardCustomerOrders: string;
  IsShowReturnCustomerOrders: string;
}

// Default object you can import and reuse anywhere
export const tripCOSearchCriteria: SearchCriteria = {
  PlanningProfileID: "",
  Location: "",
  PlanDate: "",
  CustomerOrderProfileID: "",
  CustomerID: "",
  ContractID: "",
  DepartureDate: "",
  ArrivalDate: "",
  CustomerOrderID: "",
  LegID: "",
  TransportMode: "",
  COStatus: "",
  Service: "",
  SubService: "",
  CustomerOrderFromCreationDate: "",
  CustomerOrderToCreationDate: "",
  CustomerOrderDateFrom: "",
  CustomerTOrderDateTo: "",
  CustomerRefNo: "",
  Cluster: "",
  LoadType: "",
  ShuntedOutEquipment: "",
  IsShuntedOutWagons: "",
  IsShowForwardCustomerOrders: "",
  IsShowReturnCustomerOrders: ""
};