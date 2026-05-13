export interface SalesInvoice {
  id: string;
  docType: string;
  docCode: string;
  docDate: string;
  invoiceTo: string;
  referenceNo: string | null;
  currencyRate: number;
  description: string;
  eInvoiceStatus: string | null;
  eInvoiceControl: number;
  uin: string | null;
  consolidatedId: string;
  consolidatedDocCode: string | null;
  consolidatedUIN: string | null;
  consolidatedStatus: string | null;
  isCancelled: boolean;
  netTotalAmount: number;
  netTotalAmountLocal: number;
  outstandingAmount: number;
  outstandingAmountLocal: number;
  customerId: number;
  currencyCode: string;
  customerCode: string;
  customerName: string;
  customerName2: string | null;
  billingAddress: string;
  phoneNo: string | null;
}

export interface SalesInvoiceListResponse {
  data: SalesInvoice[];
  totalCount: number;
  skip: number;
  top: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  totalCount?: number;
}
