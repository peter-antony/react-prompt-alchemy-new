export interface ITemplateCriteria {
  Type: string | null;
  TemplateID: string | null;
  TemplateDescription: string | null;
  ConsignorID: string | null;
  ConsignorDescription: string | null;
  ConsigneeID: string | null;
  ConsigneeDescription: string | null;
  CustomerID: string | null;
  CustomerDescription: string | null;
  ContractID: string | null;
  ContractDescription: string | null;
  UNCode: string | null;
  UNCodeDescription: string | null;
  RouteID: string | null;
  RouteDescription: string | null;
  Departure: string | null;
  DepartureDescription: string | null;
  Arrival: string | null;
  ArrivalDescription: string | null;
  LoadType: string | null;
  Status: string | null;
  SupplierID: string | null;
  SupplierIDDescription: string | null;
}

export interface IReportCriteria {
  Type: null;
  CIMCUVID: string | null;
  CIMCUVIDDescription: null;
  ConsignorID: null;
  ConsignorDescription: null;
  ConsigneeID: null;
  ConsigneeDescription: null;
  CustomerID: null;
  CustomerDescription: null;
  ContractID: null;
  ContractDescription: null;
  UNCode: null;
  UNCodeDescription: null;
  RouteID: null;
  RouteDescription: null;
  Departure: null;
  DepartureDescription: null;
  Arrival: null;
  ArrivalDescription: null;
  LoadType: null;
  Status: null;
  SupplierID: null;
  SupplierIDDescription: null;
}

export const CimTemplateSearchCriteria: ITemplateCriteria = {
  Type: null,
  TemplateID: null,
  TemplateDescription: null,
  ConsignorID: null,
  ConsignorDescription: null,
  ConsigneeID: null,
  ConsigneeDescription: null,
  CustomerID: null,
  CustomerDescription: null,
  ContractID: null,
  ContractDescription: null,
  UNCode: null,
  UNCodeDescription: null,
  RouteID: null,
  RouteDescription: null,
  Departure: null,
  DepartureDescription: null,
  Arrival: null,
  ArrivalDescription: null,
  LoadType: null,
  Status: null,
  SupplierID: null,
  SupplierIDDescription: null,
};

export const CimReportSearchCriteria: IReportCriteria = {
  Type: null,
  CIMCUVID: null,
  CIMCUVIDDescription: null,
  ConsignorID: null,
  ConsignorDescription: null,
  ConsigneeID: null,
  ConsigneeDescription: null,
  CustomerID: null,
  CustomerDescription: null,
  ContractID: null,
  ContractDescription: null,
  UNCode: null,
  UNCodeDescription: null,
  RouteID: null,
  RouteDescription: null,
  Departure: null,
  DepartureDescription: null,
  Arrival: null,
  ArrivalDescription: null,
  LoadType: null,
  Status: null,
  SupplierID: null,
  SupplierIDDescription: null,
};
