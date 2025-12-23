export interface CustomerDto {
  id: string;
  customerCode: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  taxNumber?: string;
  creditLimit: number;
  currentBalance: number;
  lastPurchaseDate?: string;
  totalPurchaseAmount: number;
  totalPurchases: number;
  notes?: string;
  createdAt: string;
}

export interface CreateCustomerDto {
  customerCode: string;
  fullName: string;
  email?: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  taxNumber?: string;
  creditLimit?: number;
  notes?: string;
}

export interface UpdateCustomerDto {
  fullName?: string;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  creditLimit?: number;
  notes?: string;
}

export interface CustomerListDto {
  customers: CustomerDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}