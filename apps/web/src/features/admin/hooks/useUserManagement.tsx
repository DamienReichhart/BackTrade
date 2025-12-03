import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, useDeleteUser } from "../../../api/hooks/requests/users";
import type { PublicUser, Role, SearchQueryUser } from "@backtrade/types";
import { useModal } from "../../../hooks/useModal";

export type SortField =
    | "id"
    | "email"
    | "role"
    | "is_banned"
    | "created_at"
    | "updated_at";
export type SortOrder = "asc" | "desc";

/**
 * Hook for managing user management page state and logic
 */
export function useUserManagement() {
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
        isOpen: isSubscriptionsOpen,
        selectedItem: selectedUserForSubscriptions,
        openModal: openSubscriptionsModal,
        closeModal: closeSubscriptionsModal,
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
        selectedUserForDelete?.id.toString() ?? ""
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
     * Handle manage subscriptions
     */
    const handleManageSubscriptions = (user: PublicUser) => {
        openSubscriptionsModal(user);
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
     * Handle user update success
     */
    const handleUpdateSuccess = async () => {
        closeEditModal();
        await refetchUsers();
    };

    /**
     * Navigate back to admin choices
     */
    const handleBackToAdmin = () => {
        navigate("/dashboard/admin");
    };

    return {
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
        isSubscriptionsOpen,
        selectedUserForSubscriptions,

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
        handleManageSubscriptions,
        handleConfirmDelete,
        handleUpdateSuccess,
        handleBackToAdmin,

        // Modal handlers
        closeEditModal,
        closeDetailsModal,
        closeDeleteModal,
        closeSubscriptionsModal,

        // Pagination
        setPage,
    };
}
