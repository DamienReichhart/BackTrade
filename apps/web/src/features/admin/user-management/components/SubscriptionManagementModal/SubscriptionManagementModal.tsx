import type { PublicUser } from "@backtrade/types";
import { Button } from "../../../../../components/Button";
import { ConfirmModal } from "../../../../../components/ConfirmModal";
import { useSubscriptionManagementModal } from "./hooks";
import { CreateSubscriptionSection, SubscriptionListView } from "./components";
import styles from "./SubscriptionManagementModal.module.css";

/**
 * Subscription Management Modal component props
 */
interface SubscriptionManagementModalProps {
  /**
   * User to manage subscriptions for
   */
  user: PublicUser;

  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;
}

/**
 * Subscription Management Modal component
 *
 * Full CRUD interface for managing user subscriptions
 */
export function SubscriptionManagementModal({
  user,
  isOpen,
  onClose,
}: SubscriptionManagementModalProps) {
  const {
    // Data
    subscriptions,
    isLoading,

    // Create form state
    isCreating,
    createForm,
    setCreateForm,

    // Edit form state
    editingSubscriptionId,
    editForm,
    setEditForm,

    // Delete state
    subscriptionToDelete,

    // Mutations
    createSubscriptionMutation,
    updateSubscriptionMutation,
    deleteSubscriptionMutation,

    // Helpers
    getPlanById,
    planOptions,

    // Handlers
    handleStartCreate,
    handleCancelCreate,
    handleCreate,
    handleStartEdit,
    handleCancelEdit,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useSubscriptionManagementModal(user, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose}>
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscriptions-title"
        >
          <div className={styles.header}>
            <h2 id="subscriptions-title" className={styles.title}>
              Manage Subscriptions - {user.email}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div className={styles.content}>
            <CreateSubscriptionSection
              isCreating={isCreating}
              createForm={createForm}
              onFormChange={setCreateForm}
              planOptions={planOptions}
              isLoading={createSubscriptionMutation.isLoading}
              onStartCreate={handleStartCreate}
              onCancelCreate={handleCancelCreate}
              onSubmit={handleCreate}
            />

            <SubscriptionListView
              subscriptions={subscriptions}
              isLoading={isLoading}
              editingSubscriptionId={editingSubscriptionId}
              editForm={editForm}
              onEditFormChange={setEditForm}
              isUpdating={updateSubscriptionMutation.isLoading}
              getPlanById={getPlanById}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSave={handleUpdate}
              onDelete={handleDelete}
            />
          </div>

          <div className={styles.footer}>
            <Button variant="outline" size="medium" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!subscriptionToDelete}
        title="Delete Subscription"
        message={`Are you sure you want to delete subscription #${subscriptionToDelete?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="primary"
        cancelVariant="outline"
        isLoading={deleteSubscriptionMutation.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
