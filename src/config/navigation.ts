import {
  ClipboardList,
  Clock,
  FileBarChart,
  History,
  LayoutDashboard,
  Monitor,
  Package,
  ScrollText,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import { permissions } from "@/config/permissions";
import { normalizePathname } from "@/lib/auth-paths";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  anyPermission?: string[];
};

export type NavGroup = {
  id: string;
  label?: string;
  items: NavItem[];
};

/**
 * Authenticated navigation. Items without `permission` remain visible to every signed-in user.
 */
export const appNavigation: NavGroup[] = [
  {
    id: "workspace",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Reports",
        href: "/reports",
        icon: FileBarChart,
        anyPermission: [
          permissions.reports,
          permissions.reportsMonthly,
          permissions.reportsProfit,
          permissions.reportsTax,
          permissions.inventory,
          permissions.purchases,
          permissions.expenses,
        ],
      },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      {
        title: "Products",
        href: "/products",
        icon: Package,
        permission: permissions.products,
      },
      {
        title: "Categories",
        href: "/categories",
        icon: Tags,
        permission: permissions.categories,
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: Warehouse,
        permission: permissions.inventory,
      },
      {
        title: "Stock history",
        href: "/inventory/movements",
        icon: History,
        permission: permissions.inventory,
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      {
        title: "POS",
        href: "/pos",
        icon: ShoppingCart,
        permission: permissions.pos,
      },
      {
        title: "POS Machine",
        href: "/pos/machine",
        icon: Monitor,
        permission: permissions.pos,
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
        permission: permissions.customers,
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Wallet,
        permission: permissions.expenses,
      },
    ],
  },
  {
    id: "purchasing",
    label: "Purchasing",
    items: [
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: Truck,
        permission: permissions.suppliers,
      },
      {
        title: "Purchases",
        href: "/purchases",
        icon: ClipboardList,
        permission: permissions.purchases,
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        title: "Administration",
        href: "/admin",
        icon: Shield,
        anyPermission: [
          permissions.usersManage,
          permissions.rolesManage,
          permissions.activityLogs,
        ],
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: UserCog,
        permission: permissions.usersManage,
      },
      {
        title: "Roles",
        href: "/admin/roles",
        icon: ShieldCheck,
        permission: permissions.rolesManage,
      },
      {
        title: "Activity logs",
        href: "/admin/activity",
        icon: ScrollText,
        permission: permissions.activityLogs,
      },
      {
        title: "Attendance",
        href: "/admin/attendance",
        icon: Clock,
        permission: permissions.usersManage,
      },
    ],
  },
];

export function getNavItemForPath(pathname: string): NavItem | undefined {
  const path = normalizePathname(pathname);
  const items = appNavigation.flatMap((group) => group.items);
  let best: NavItem | undefined;
  let bestLength = -1;

  for (const item of items) {
    const href = normalizePathname(item.href);
    const matches = path === href || (href !== "/" && path.startsWith(`${href}/`));
    if (matches && href.length > bestLength) {
      best = item;
      bestLength = href.length;
    }
  }

  return best;
}

export function filterNavigation(
  groups: NavGroup[],
  context?: {
    permissions: string[];
    role?: string | null;
  },
): NavGroup[] {
  if (!context) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.anyPermission?.length) {
          return hasAnyPermission(item.anyPermission, context.permissions, context.role);
        }
        return !item.permission || hasPermission(item.permission, context.permissions, context.role);
      }),
    }))
    .filter((group) => group.items.length > 0);
}
