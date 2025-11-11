import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUsers,
  useDeleteUser,
  useBanUser,
  useUnbanUser,
} from "../../../api/requests/users";
import type { PublicUser, Role, SearchQueryUser } from "@backtrade/types";
import { useModal } from "../../../hooks/useModal";
import { UserTable } from "./components/UserTable";
import { UserEditModal } from "./components/UserEditModal";
import { UserDetailsModal } from "./components/UserDetailsModal";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import styles from "./UserManagement.module.css";

type SortField =
  | "id"
  | "email"
  | "role"
  | "is_banned"
  | "created_at"
  | "updated_at";
type SortOrder = "asc" | "desc";

/**
 * User Management page component
 *
 * Admin page for managing users with search, filtering, sorting, and CRUD operations
 */
export function UserManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [bannedFilter, setBannedFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const {
    isOpen: isEditOpen,
    selectedItem: selectedUserForEdit,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal<PublicUser>();

  const {
    isOpen: isDetailsOpen,
    selectedItem: selectedUserForDetails,
    openModal: openDetailsModal,
    closeModal: closeDetailsModal,
  } = useModal<PublicUser>();

  const {
    isOpen: isDeleteOpen,
    selectedItem: selectedUserForDelete,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal<PublicUser>();

  const {
    isOpen: isBanOpen,
    selectedItem: selectedUserForBan,
    openModal: openBanModal,
    closeModal: closeBanModal,
  } = useModal<PublicUser>();

  // Build search query with filters
  const query: SearchQueryUser = useMemo(() => {
    const searchParams: SearchQueryUser = {
      page,
      limit,
      sort: sortField,
      order: sortOrder,
    };

    if (searchQuery.trim()) {
      searchParams.q = searchQuery.trim();
    }

    // Add role filter if not "all"
    if (roleFilter !== "all") {
      searchParams.role = roleFilter as Role;
    }

    // Add status filter if not "all"
    if (bannedFilter !== "all") {
      searchParams.is_banned = bannedFilter === "banned";
    }

    return searchParams;
  }, [
    searchQuery,
    roleFilter,
    bannedFilter,
    page,
    limit,
    sortField,
    sortOrder,
  ]);

  const {
    data: usersData,
    isLoading,
    error,
    execute: refetchUsers,
  } = useUsers(query);
  const users: PublicUser[] = Array.isArray(usersData) ? usersData : [];

  const deleteUserMutation = useDeleteUser(
    selectedUserForDelete?.id.toString() ?? "",
  );
  const banUserMutation = useBanUser(selectedUserForBan?.id.toString() ?? "");
  const unbanUserMutation = useUnbanUser(
    selectedUserForBan?.id.toString() ?? "",
  );

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  /**
   * Handle role filter change
   */
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  /**
   * Handle banned filter change
   */
  const handleBannedFilterChange = (value: string) => {
    setBannedFilter(value);
    setPage(1);
  };

  /**
   * Handle sort field change
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  /**
   * Handle edit user
   */
  const handleEdit = (user: PublicUser) => {
    openEditModal(user);
  };

  /**
   * Handle view user details
   */
  const handleView = (user: PublicUser) => {
    openDetailsModal(user);
  };

  /**
   * Handle delete user
   */
  const handleDelete = (user: PublicUser) => {
    openDeleteModal(user);
  };

  /**
   * Handle ban/unban user
   */
  const handleBanToggle = (user: PublicUser) => {
    openBanModal(user);
  };

  /**
   * Confirm delete user
   */
  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;

    try {
      await deleteUserMutation.execute();
      closeDeleteModal();
      await refetchUsers();
    } catch {
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Confirm ban/unban user
   */
  const handleConfirmBanToggle = async () => {
    if (!selectedUserForBan) return;

    try {
      if (selectedUserForBan.is_banned) {
        await unbanUserMutation.execute();
      } else {
        await banUserMutation.execute();
      }
      closeBanModal();
      await refetchUsers();
    } catch {
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Handle user update success
   */
  const handleUpdateSuccess = async () => {
    closeEditModal();
    await refetchUsers();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>User Management</h1>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/admin")}
          >
            Back to Admin
          </Button>
        </div>
        <p className={styles.subtitle}>
          Manage users, roles, and account status
        </p>
      </header>

      {/* Filters and Search */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <Input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterContainer}>
          <Select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            options={[
              { value: "all", label: "All Roles" },
              { value: "ANONYMOUS", label: "Anonymous" },
              { value: "USER", label: "User" },
              { value: "ADMIN", label: "Admin" },
            ]}
            placeholder="All Roles"
          />
          <Select
            value={bannedFilter}
            onChange={handleBannedFilterChange}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "banned", label: "Banned" },
            ]}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        error={error}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBanToggle={handleBanToggle}
      />

      {/* Pagination */}
      <div className={styles.pagination}>
        <Button
          variant="outline"
          size="small"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </Button>
        <span className={styles.pageInfo}>Page {page}</span>
        <Button
          variant="outline"
          size="small"
          onClick={() => setPage((p) => p + 1)}
          disabled={users.length < limit || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Edit Modal */}
      {selectedUserForEdit && (
        <UserEditModal
          user={selectedUserForEdit}
          isOpen={isEditOpen}
          onClose={closeEditModal}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Details Modal */}
      {selectedUserForDetails && (
        <UserDetailsModal
          user={selectedUserForDetails}
          isOpen={isDetailsOpen}
          onClose={closeDetailsModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUserForDelete?.email}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="primary"
        cancelVariant="outline"
        isLoading={deleteUserMutation.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />

      {/* Ban/Unban Confirmation Modal */}
      <ConfirmModal
        isOpen={isBanOpen}
        title={selectedUserForBan?.is_banned ? "Unban User" : "Ban User"}
        message={`Are you sure you want to ${selectedUserForBan?.is_banned ? "unban" : "ban"} user "${selectedUserForBan?.email}"?`}
        confirmLabel={selectedUserForBan?.is_banned ? "Unban" : "Ban"}
        cancelLabel="Cancel"
        confirmVariant={selectedUserForBan?.is_banned ? "primary" : "primary"}
        cancelVariant="outline"
        isLoading={banUserMutation.isLoading || unbanUserMutation.isLoading}
        onConfirm={handleConfirmBanToggle}
        onCancel={closeBanModal}
      />
    </div>
  );
}
