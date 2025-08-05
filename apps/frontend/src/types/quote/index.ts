export interface Quote {
  pk_quote_id: number;
  customer: {
    id: number;
    name: string;
    owner: string;
  };
  quote_number: string;
  quote_date: string;
  expiration_data: string;
  status: string;
  subtotal: number;
  tax_total: number;
  currency: string;
  terms: string;
  tags: string[];
}

export interface QuoteForm {
  /* Customer Selection */
  customerId: number | string;
  customerName?: string;

  /* Quote Details */
  quoteNumber: string;
  quoteDate: string;
  expirationDate: string;
  status: string;

  /* Customer Information */
  billingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  customerNotes: string;

  /* Quote Items */
  items: QuoteItemForm[];

  /* Totals */
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  currency: string;

  /* Additional Info */
  notes: string;
  terms: string;
  tags: string[];
}

export interface QuoteItemForm {
  id?: string;
  productId: number | string;
  category: string;
  itemNumber: string;
  description: string;
  logo?:
    | string
    | {
        file: File;
        url: string;
        name: string;
        type: string;
      };
  yarn: string;
  packaging: string;
  trims: string;
  addresses: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateQuotePayload {
  customerID: number;
  statusID: number;
  quoteNumber: string;
  quoteDate: string;
  expirationDate: string;
  subtotal: number;
  taxTotal: number;
  currency: string;
  notes: string;
  terms: string;
  tags: string;
}

export interface QuotesResponse {
  items: Quote[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
