/** Verified against Swagger AttendanceResponseDto. */
export type AttendanceRecord = {
  id: string;
  userId: string;
  employeeName: string | null;
  username: string | null;
  loginTime: string;
  logoutTime: string | null;
  workedHours: number | null;
  loginDevice: string | null;
  logoutReason: string | null;
  isAutoLogout: boolean;
  isOutsideShiftLogin: boolean;
};

export type AttendanceFilters = {
  from?: string;
  to?: string;
  userId?: string;
};

/** Verified against Swagger LoggedInEmployeeDto. */
export type LoggedInEmployee = {
  userId: string;
  employeeName: string | null;
  username: string | null;
  roleName: string | null;
  loginTime: string;
  loginDevice: string | null;
};

/** Verified against Swagger EmployeeActivityDto. */
export type EmployeeActivity = {
  userId: string;
  employeeName: string | null;
  lastLogin: string | null;
  lastLogout: string | null;
  billsCreated: number;
  totalSales: number;
  roleName: string | null;
};

/** Verified against Swagger EmployeeDashboardSummaryDto. */
export type EmployeeDashboard = {
  currentlyLoggedIn: LoggedInEmployee[] | null;
  recentActivity: EmployeeActivity[] | null;
};
