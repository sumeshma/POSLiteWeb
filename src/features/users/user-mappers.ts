import { emptyToNull } from "@/lib/empty";
import type { UserShift } from "@/types/auth";
import type { CreateUserRequest, ShopUser, UpdateUserRequest } from "@/types/user";
import type { UserFormValues } from "./user-schema";

export function toUserShift(values: UserFormValues): UserShift {
  return {
    shiftEnabled: values.shiftEnabled,
    shiftStartTime: emptyToNull(values.shiftStartTime),
    shiftEndTime: emptyToNull(values.shiftEndTime),
    workingDays: emptyToNull(values.workingDays),
    graceBeforeLoginMinutes: Number(values.graceBeforeLoginMinutes) || 0,
    graceAfterShiftMinutes: Number(values.graceAfterShiftMinutes) || 0,
    allowLoginOutsideShift: values.allowLoginOutsideShift,
  };
}

export function toCreateUserRequest(values: UserFormValues): CreateUserRequest {
  return {
    username: values.username.trim(),
    email: emptyToNull(values.email),
    password: values.password,
    firstName: emptyToNull(values.firstName),
    lastName: emptyToNull(values.lastName),
    role: emptyToNull(values.role),
    phoneNumber: emptyToNull(values.phoneNumber),
    appRoleId: emptyToNull(values.appRoleId),
    shift: toUserShift(values),
    permissions: values.permissions,
  };
}

export function toUpdateUserRequest(
  values: UserFormValues,
  extras?: { newPassword?: string },
): UpdateUserRequest {
  const body: UpdateUserRequest = {
    email: emptyToNull(values.email),
    firstName: emptyToNull(values.firstName),
    lastName: emptyToNull(values.lastName),
    role: emptyToNull(values.role),
    isActive: values.isActive,
    phoneNumber: emptyToNull(values.phoneNumber),
    appRoleId: emptyToNull(values.appRoleId),
    shift: toUserShift(values),
    permissions: values.permissions,
  };

  if (extras?.newPassword) {
    body.newPassword = extras.newPassword;
  }

  return body;
}

export function fromShopUser(user: ShopUser): UserFormValues {
  return {
    username: user.username ?? "",
    email: user.email ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phoneNumber: user.phoneNumber ?? "",
    password: "",
    confirmPassword: "",
    role: user.role ?? "Employee",
    appRoleId: user.appRoleId ?? "",
    isActive: user.isActive,
    permissions: user.permissions ?? [],
    shiftEnabled: user.shift?.shiftEnabled ?? false,
    shiftStartTime: user.shift?.shiftStartTime ?? "",
    shiftEndTime: user.shift?.shiftEndTime ?? "",
    workingDays: user.shift?.workingDays ?? "",
    graceBeforeLoginMinutes: String(user.shift?.graceBeforeLoginMinutes ?? 0),
    graceAfterShiftMinutes: String(user.shift?.graceAfterShiftMinutes ?? 0),
    allowLoginOutsideShift: user.shift?.allowLoginOutsideShift ?? false,
  };
}

export function toUpdateUserRequestFromShopUser(
  user: ShopUser,
  extras?: { isActive?: boolean; newPassword?: string },
): UpdateUserRequest {
  const body: UpdateUserRequest = {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: extras?.isActive ?? user.isActive,
    phoneNumber: user.phoneNumber,
    appRoleId: user.appRoleId,
    shift: user.shift,
    permissions: user.permissions,
  };

  if (extras?.newPassword) {
    body.newPassword = extras.newPassword;
  }

  return body;
}
