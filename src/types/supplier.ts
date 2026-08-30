export type Supplier = {
  id: string;
  name: string | null;
  contactPerson: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateSupplierRequest = {
  name: string;
  contactPerson: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
};

export type UpdateSupplierRequest = CreateSupplierRequest & {
  isActive: boolean;
};

export type SupplierListFilters = {
  search?: string;
  isActive?: boolean;
};
