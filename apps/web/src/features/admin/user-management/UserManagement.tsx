import { useUserManagement } from "../hooks";
import { UserTable } from "./components/UserTable";
import { UserEditModal } from "./components/UserEditModal";
import { UserDetailsModal } from "./components/UserDetailsModal";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "./utils";
import styles from "./UserManagement.module.css";

/**
 * User Management page component
 *
 * Admin page for managing users with search, filtering, sorting, and CRUD operations
 */
export function UserManagement() {
  const {
    // State
    searchQuery,
    roleFilter,
    bannedFilter,
    sortField,
    sortOrder,
    page,
    limit,
    users,
    isLoading,
    error,

    // Modal state
    isEditOpen,
    selectedUserForEdit,
    isDetailsOpen,
    selectedUserForDetails,
    isDeleteOpen,
    selectedUserForDelete,

    // Mutations
    deleteUserMutation,

    // Handlers
    handleSearchChange,
    handleRoleFilterChange,
    handleBannedFilterChange,
    handleSort,
    handleEdit,
    handleView,
    handleDelete,
    handleConfirmDelete,
    handleUpdateSuccess,
    handleBackToAdmin,

    // Modal handlers
    closeEditModal,
    closeDetailsModal,
    closeDeleteModal,

    // Pagination
    setPage,
  } = useUserManagement();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>User Management</h1>
          <Button variant="outline" onClick={handleBackToAdmin}>
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
            options={ROLE_FILTER_OPTIONS}
            placeholder="All Roles"
          />
          <Select
            value={bannedFilter}
            onChange={handleBannedFilterChange}
            options={STATUS_FILTER_OPTIONS}
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
    </div>
  );
}
