import type { PublicUser } from "@backtrade/types";
import type { SortField, SortOrder } from "../../../hooks";
import { Button } from "../../../../../components/Button";
import { formatDate } from "@backtrade/utils";
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
  /**
   * Get sort indicator for column header
   */
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

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
                ID {getSortIndicator("id")}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("email")}
              >
                Email {getSortIndicator("email")}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("role")}
              >
                Role {getSortIndicator("role")}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("is_banned")}
              >
                Status {getSortIndicator("is_banned")}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("created_at")}
              >
                Created {getSortIndicator("created_at")}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("updated_at")}
              >
                Updated {getSortIndicator("updated_at")}
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
                        user.role === "ADMIN"
                          ? styles.roleAdmin
                          : user.role === "USER"
                            ? styles.roleUser
                            : styles.roleAnonymous
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.is_banned ? (
                      <span className={styles.bannedBadge}>Banned</span>
                    ) : (
                      <span className={styles.activeBadge}>Active</span>
                    )}
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
