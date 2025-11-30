/**
 * Configuration constants for user management feature
 */

/**
 * Role option for select dropdowns
 */
export interface RoleOption {
  value: string;
  label: string;
}

/**
 * Available role options for user management
 */
export const ROLE_OPTIONS: RoleOption[] = [
  { value: "ANONYMOUS", label: "Anonymous" },
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
];

/**
 * Role filter options (includes "all" option)
 */
export const ROLE_FILTER_OPTIONS: RoleOption[] = [
  { value: "all", label: "All Roles" },
  ...ROLE_OPTIONS,
];

/**
 * Status filter options
 */
export const STATUS_FILTER_OPTIONS: RoleOption[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];
