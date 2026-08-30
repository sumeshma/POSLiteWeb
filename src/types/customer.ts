export type Customer = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  loyaltyPoints: number;
  totalVisits: number;
  isActive: boolean;
  createdAt: string;
};

export type CreateCustomerRequest = {
  name: string;
  phone: string;
  email: string | null;
};

export type UpdateCustomerRequest = CreateCustomerRequest & {
  isActive: boolean;
};

export type CustomerListFilters = {
  search?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
};
