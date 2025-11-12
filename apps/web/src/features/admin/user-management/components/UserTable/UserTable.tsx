import type { PublicUser } from "@backtrade/types";
import type { SortField, SortOrder } from "../../../hooks";
import { Button } from "../../../../../components/Button";
import { formatDate } from "@backtrade/utils";
import { getSortIndicator } from "./utils/table";
import {
  getRoleBadgeClassName,
  getStatusBadgeClassName,
  getStatusLabel,
} from "./utils/formatting";
import styles from "./UserTable.module.css";

/**
 * User Table component props
 */
interface UserTableProps {
  /**
   * List of users to display
   */
  users: PublicUser[];

  /**
   * Whether data is loading
   */
  isLoading?: boolean;

  /**
   * Error object if request failed
   */
  error?: Error | null;

  /**
   * Current sort field
   */
  sortField: SortField;

  /**
   * Current sort order
   */
  sortOrder: SortOrder;

  /**
   * Callback when sort field is clicked
   */
  onSort: (field: SortField) => void;

  /**
   * Callback when edit button is clicked
   */
  onEdit: (user: PublicUser) => void;

  /**
   * Callback when view button is clicked
   */
  onView: (user: PublicUser) => void;

  /**
   * Callback when delete button is clicked
   */
  onDelete: (user: PublicUser) => void;

  /**
   * Callback when ban/unban button is clicked
   */
  onBanToggle: (user: PublicUser) => void;
}

/**
 * User Table component
 *
 * Displays users in a sortable table with actions
 */
export function UserTable({
  users,
  isLoading = false,
  error = null,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onView,
  onDelete,
  onBanToggle,
}: UserTableProps) {
  return (
    <div className={styles.card}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("id")}
              >
                ID {getSortIndicator("id", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("email")}
              >
                Email {getSortIndicator("email", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("role")}
              >
                Role {getSortIndicator("role", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("is_banned")}
              >
                Status {getSortIndicator("is_banned", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("created_at")}
              >
                Created {getSortIndicator("created_at", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("updated_at")}
              >
                Updated {getSortIndicator("updated_at", sortField, sortOrder)}
              </th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className={styles.empty} colSpan={7}>
                  Loading users...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className={styles.error} colSpan={7}>
                  Error loading users: {error.message}
                </td>
              </tr>
            )}
            {!isLoading && !error && users.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={7}>
                  No users found
                </td>
              </tr>
            )}
            {!isLoading &&
              !error &&
              users.map((user) => (
                <tr key={user.id} className={styles.row}>
                  <td>{user.id}</td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>
                    <span
                      className={`${styles.roleBadge} ${
                        styles[getRoleBadgeClassName(user.role)]
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        styles[getStatusBadgeClassName(user.is_banned)]
                      }
                    >
                      {getStatusLabel(user.is_banned)}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(user.created_at)}
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(user.updated_at)}
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onView(user)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={user.is_banned ? "primary" : "outline"}
                        size="small"
                        onClick={() => onBanToggle(user)}
                      >
                        {user.is_banned ? "Unban" : "Ban"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onDelete(user)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
