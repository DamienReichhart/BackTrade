import { useInstrumentManagement } from "./hooks/useInstrumentManagement";
import { InstrumentTable } from "./components/InstrumentTable";
import { InstrumentModal } from "./components/InstrumentModal";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useDeleteInstrument } from "../../../api/hooks/requests/instruments";
import styles from "./InstrumentManagement.module.css";

export function InstrumentManagement() {
    const {
        instruments,
        isLoading,
        error,
        searchQuery,
        handleSearchChange,
        isCreateOpen,
        handleCreate,
        closeCreateModal,
        isEditOpen,
        selectedInstrumentForEdit,
        handleEdit,
        closeEditModal,
        isDeleteOpen,
        selectedInstrumentForDelete,
        handleDelete,
        closeDeleteModal,
        handleBackToAdmin,
        handleSuccess,
    } = useInstrumentManagement();

    // Delete mutation
    const deleteMutation = useDeleteInstrument(
        selectedInstrumentForDelete?.id?.toString() ?? "0"
    );

    const onConfirmDelete = async () => {
        if (selectedInstrumentForDelete) {
            try {
                await deleteMutation.execute();
                handleSuccess();
            } catch {
                // Error is handled by the mutation hook
            }
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <h1 className={styles.title}>Instrument Management</h1>
                    <Button variant="outline" onClick={handleBackToAdmin}>
                        Back to Admin
                    </Button>
                </div>
                <p className={styles.subtitle}>
                    Manage trading instruments, symbols, and settings
                </p>
            </header>

            {/* Actions and Search */}
            <div className={styles.filters}>
                <div className={styles.searchContainer}>
                    <Input
                        type="text"
                        placeholder="Search by symbol or name..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.actionsContainer}>
                    <Button variant="primary" onClick={handleCreate}>
                        Add Instrument
                    </Button>
                </div>
            </div>

            {/* Table */}
            <InstrumentTable
                instruments={instruments}
                isLoading={isLoading}
                error={error}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Create/Edit Modal */}
            <InstrumentModal
                instrument={isEditOpen ? selectedInstrumentForEdit : null}
                isOpen={isCreateOpen || isEditOpen}
                onClose={isEditOpen ? closeEditModal : closeCreateModal}
                onSuccess={handleSuccess}
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                title="Delete Instrument"
                message={`Are you sure you want to delete instrument "${selectedInstrumentForDelete?.symbol}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmVariant="primary"
                cancelVariant="outline"
                isLoading={deleteMutation.isLoading}
                onConfirm={onConfirmDelete}
                onCancel={closeDeleteModal}
            />
        </div>
    );
}
