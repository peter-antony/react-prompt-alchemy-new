// 📁 constants/customerOrderSearchCriteria.ts

export interface AdditionalFilter {
  Name: string;
  Value: string;
}

export interface tripRouteSearch {
  CustomerOrderNo: string;
  FromOrderDate: string;
  ToOrderDate: string;
  Contract: string;
  Departure: string;
  Arrival: string;
  Customer: string;
  CustomerRefNo: string;
  CustomerName: string;
  CustomerOrderStatus: string;
  ExecutionPlanID: string;
  TripPlanID: string;
  TripPlanStatus: string;
  // AdditionalFilter: AdditionalFilter[];
}

export const tripRouteSearchCriteria: tripRouteSearch = {
  // CustomerOrderNo: "",
  // FromOrderDate: "",
  // ToOrderDate: "",
  // Contract: "",
  // Departure: "",
  // Arrival: "",
  // Customer: "",
  // CustomerRefNo: "",
  // CustomerName: "",
  // CustomerOrderStatus: "",
  // ExecutionPlanID: "",
  // TripPlanID: "",
  // TripPlanStatus: "",
  // AdditionalFilter: [
  //   { Name: "", Value: "" },
  //   { Name: "", Value: "" },
  // ],
  CustomerOrderNo: null,
  // FromOrderDate: "",
  // ToOrderDate: "",
  FromOrderDate: "",
  ToOrderDate: "",
  Contract: null,
  Departure: null,
  Arrival: null,
  Customer: null,
  CustomerRefNo: null,
  CustomerName: null,
  CustomerOrderStatus: null,
  ExecutionPlanID: null,
  TripPlanID: null,
  TripPlanStatus: null
  // AdditionalFilter: [
  //   {
  //     Name: "ServiceType",
  //     Value: "",
  //   },
  //   {
  //     Name: "SubServiceType",
  //     Value: "",
  //   },
  // ],
};
