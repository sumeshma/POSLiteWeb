export type Category = {
  id: string;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  defaultShowOnPos: boolean;
  productCount: number;
  childCount: number;
  level: number;
  isParentItemCategory: boolean;
  isSellable: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateCategoryRequest = {
  parentCategoryId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  defaultShowOnPos: boolean;
};

export type UpdateCategoryRequest = CreateCategoryRequest & {
  isActive: boolean;
};

export type CategoryListFilters = {
  search?: string;
};
