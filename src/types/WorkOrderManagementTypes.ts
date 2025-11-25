
// payload interface
export interface WorkOrderSearchPayload {
  context: {
    UserID: string;
    Role: string;
    OUID: number;
    MessageID: string;
    MessageType: string;
  };
  SearchCriteria: {
    WorkOrderNo: string;
    WagonContainerID: string;
    WagonOwnerName: string;
    SupplierCode: string;
    SupplierName: string;
    SupplierContractNo: string;
    ClusterMarket: string;
    CustomerContractNo: string;
    WorkOrderStatus: string;
    WorkOrderFromDate: string;
    WorkOrderToDate: string;
    TypeOfAction: string;
    Operation: string;
    OperationStatus: string;
    EquipmentCategory: string;
    PlaceOfOperation: string;
    InvoiceReference: string;
    ReInvoicingCostTo: string;
    AddtionalFilter: {
      FilterName: string;
      FilterValue: string;
    }[];
  };
  Pagination: {
    PageNumber: number;
    PageSize: number;
  };
}

// response interface
export interface WorkOrderItem {
  WorkOrderNumber: string;
  WagonOrContainerID: string;
  WorkOrderStatus: string;
  WagonOwnerName: string;
  SupplierName: string;
  SupplierContractNumber: string;
  MarketOrCluster: string;
  CustomerContractNumber: string;
  CustomerContractDescription: string;
  CustomerSupportOrInsideSales: string;
  WorkOrderFrom: string;
  WorkOrderTo: string;
  OperationNumber: string;
  TypeOfAction: string;
  Operation: string;
  OperationStatus: string;
  LastMaintenance: string;
  NextMaintenance: string;
  AppointmentDateWorkshop: string;
  OwnerType: string;
  LeasingType: string;
  InvoiceReference: string;
  ReinvoicingCostTo: string;
  EquipmentCategory: string;
  PlaceOfOperation: string;
  CreationDate: string;
  ModificationDate: string;
}
