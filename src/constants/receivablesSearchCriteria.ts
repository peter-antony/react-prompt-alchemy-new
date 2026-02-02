export interface SearchCriteria {
  DocumentNumber: string | null;
  DocumentType: string | null;
  WBSNumber: string | null;
  DocumentsFromDate: string | null;
  DocumentsToDate: string | null;
  PurchaseOrderNumber: string | null;
  ClaimNumber: string | null;
  DraftBillNumber: string | null;
  CustomerOrderNo: string | null;
  CustomerName: string | null;
  CustomerID: string | null;
  CustomerRefDocNo: string | null;
  CreditNoteCategory: string | null;
  TotalAmountExcVATFromRange: number | null;
  TotalAmountExcVATToRange: number | null;
  TransferInvoiceNumber: string | null;
  TransferInvoiceFromDate: string | null;
  TransferInvoiceToDate: string | null;
  AuthorizationFromDate: string | null;
  AuthorizationToDate: string | null;
  PaymentFromDate: string | null;
  PaymentToDate: string | null;
  RefDocID: string | null;
  Currency: string | null;
  User: string | null;
  AssignedUser: string | null;
  FinancialYear: string | null;
  ContractDescription: string | null;
  ContractID: string | null;
  QC1: string | null;
  QCValue1: string | null;
  QC2: string | null;
  QCValue2: string | null;
  QC3: string | null;
  QCValue3: string | null;
  Remark1: string | null;
  Remark2: string | null;
  Remark3: string | null;
  SecondaryRefNo: string | null;
  Save: boolean | null;
  Clear: boolean | null;
  Status: string[];
  DueFromDate: string | null;
  DueToDate: string | null;
}

export const ReceivablesSearchCriteria: SearchCriteria = {
  DocumentNumber: null,
  DocumentType: 'Receivables Invoice',
  WBSNumber: null,
  DocumentsFromDate: '2024-01-01',
  DocumentsToDate: '2026-01-31',
  PurchaseOrderNumber: null,
  ClaimNumber: null,
  DraftBillNumber: null,
  CustomerOrderNo: null,
  CustomerName: null,
  CustomerID: null,
  CustomerRefDocNo: null,
  CreditNoteCategory: null,
  TotalAmountExcVATFromRange: null,
  TotalAmountExcVATToRange: null,
  TransferInvoiceNumber: null,
  TransferInvoiceFromDate: null,
  TransferInvoiceToDate: null,
  AuthorizationFromDate: null,
  AuthorizationToDate: null,
  PaymentFromDate: null,
  PaymentToDate: null,
  RefDocID: null,
  Currency: null,
  User: null,
  AssignedUser: null,
  FinancialYear: null,
  ContractDescription: null,
  ContractID: null,
  QC1: null,
  QCValue1: null,
  QC2: null,
  QCValue2: null,
  QC3: null,
  QCValue3: null,
  Remark1: null,
  Remark2: null,
  Remark3: null,
  SecondaryRefNo: null,
  Save: null,
  Clear: null,
  Status: ['ALL'],
  DueFromDate: null,
  DueToDate: null
};