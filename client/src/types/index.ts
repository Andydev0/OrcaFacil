export type NavItem = {
  title: string;
  href: string;
  icon: string;
  isActive?: boolean;
};

export interface Client {
  id: number;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'service';
  createdAt: Date;
}

export interface QuoteItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  description?: string;
  subtotal: number;
}

export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'analyzing';

export interface TaxSettings {
  iss: number;
  pis: number;
  cofins: number;
  others?: string;
}

export interface Quote {
  id: number;
  title: string;
  clientId: number;
  client?: Client;
  createdAt: Date;
  validUntil: Date;
  status: QuoteStatus;
  total: number;
  notes?: string;
  paymentMethod?: string;
  paymentTerms?: string;
  customPayment?: string;
  deliveryTime?: string;
  includeTaxes: boolean;
  taxDetails?: TaxSettings;
  items: QuoteItem[];
}

export interface CompanySettings {
  id: number;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  defaultTaxSettings?: TaxSettings;
  currency: string;
  createdAt: Date;
}

export interface DashboardStats {
  activeQuotes: number;
  monthlyTotal: number;
  conversionRate: number;
  activeClients: number;
  recentQuotes: Quote[];
  topProducts: {
    name: string;
    count: number;
    percentage: number;
  }[];
  topClients: {
    id: number;
    name: string;
    type: string;
    total: number;
    conversionRate: number;
  }[];
}
