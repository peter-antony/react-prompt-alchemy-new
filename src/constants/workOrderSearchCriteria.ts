export interface AdditionalFilter {
  FilterName: string;
  FilterValue: string;
}

export interface SearchCriteria {
  WorkorderNo?: string;
  WorkOrderFrom?: string;
  WorkOrderTo?: string;
  WagonContainerID?: string;
  WagonOwnerName?: string;
  SupplierCode?: string;
  SupplierName?: string;
  SupplierContractNo?: string;
  ClusterMarket?: string;
  CustomerContractNo?: string;
  Status?: string;
  TypeOfAction?: string;
  Operation?: string;
  OperationStatus?: string;
  EquipmentCategory?: string;
  PlaceOfOperation?: string;
  InvoiceReference?: string;
  ReInvoicingCostTo?: string;
  EquipmentType?: string;
  EquipmentID?: string;
  EquipmentDescription?: string;
  SupplierID?: string;
  SupplierDescription?: string;
  SupplierContractID?: string;
  SupplierContractDescription?: string;
  Cluster?: string;
  ClusterDescription?: string;
  CustomerContractID?: string;
  CustomerContractDescription?: string;
  CustomerSupportID?: string;
  CustomerSupportIDDescription?: string;
  PlaceOfOperationID?: string;
  PlaceOfOperationDescription?: string;
}

export const workOrderSearchCriteria: SearchCriteria = {
  WorkorderNo: "",
  Status: "",
  WorkOrderFrom: "",
  WorkOrderTo: "",
  EquipmentType: "",
  EquipmentID: "",
  EquipmentDescription: "",
  SupplierID: "",
  SupplierDescription: "",
  SupplierContractID: "",
  SupplierContractDescription: "",
  Cluster: "",
  ClusterDescription: "",
  CustomerContractID: "",
  CustomerContractDescription: "",
  CustomerSupportID: "",
  CustomerSupportIDDescription: "",
  TypeOfAction: "",
  Operation: "",
  OperationStatus: "",
  EquipmentCategory: "",
  PlaceOfOperationID: "",
  PlaceOfOperationDescription: "",
  InvoiceReference: "",
  ReInvoicingCostTo: "",
  WagonOwnerName: "",
};
