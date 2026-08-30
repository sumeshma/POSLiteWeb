/** Verified against Swagger ActivityLogResponseDto. */
export type ActivityLog = {
  id: string;
  userId: string | null;
  userName: string | null;
  actionType: string | null;
  module: string | null;
  entityId: string | null;
  description: string | null;
  oldValues: string | null;
  newValues: string | null;
  createdAt: string;
};

export type ActivityLogFilters = {
  search?: string;
  userId?: string;
  module?: string;
  actionType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};
