export interface SalesInvoice {
  id: string;
  docCode: string;
  docDate: string;
  customerCode: string;
  customerName: string;
  totalAmount: number;
  totalTax: number;
  netTotal: number;
  currencyCode: string;
  salesPerson: string;
  reference: string;
  description: string;
  status: string;
  createdDate: string;
  modifiedDate: string;
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
