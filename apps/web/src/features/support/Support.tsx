import { useState } from "react";
import { useAuthStore } from "../../context/AuthContext";
import { useSupportRequests } from "../../api/requests/support";
import { Button } from "../../components";
import { LoadingState, ErrorState } from "../dashboard/components";
import { SupportRequestList } from "./components/SupportRequestList";
import { CreateSupportRequestForm } from "./components/CreateSupportRequestForm";
import styles from "./Support.module.css";

/**
 * Support page component
 *
 * Main page for managing support requests - view all requests and create new ones
 */
export function Support() {
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch support requests
  const {
    data: requestsData,
    isLoading,
    error,
    execute: refetchRequests,
  } = useSupportRequests();

  const requests = requestsData ?? [];

  // Handle successful request creation
  const handleRequestCreated = () => {
    setShowCreateForm(false);
    refetchRequests();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.container}>
        <ErrorState error={error as Error} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Support</h1>
        {!showCreateForm && (
          <Button
            variant="primary"
            size="medium"
            onClick={() => setShowCreateForm(true)}
          >
            Create Request
          </Button>
        )}
      </header>

      {/* Content */}
      <div className={styles.content}>
        {showCreateForm ? (
          <CreateSupportRequestForm
            requesterId={user?.id ?? 0}
            onSuccess={handleRequestCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h2 className={styles.emptyTitle}>No support requests</h2>
            <p className={styles.emptyMessage}>
              You haven't created any support requests yet. Create one to get
              help from our team.
            </p>
            <Button
              variant="primary"
              size="medium"
              onClick={() => setShowCreateForm(true)}
            >
              Create Request
            </Button>
          </div>
        ) : (
          <SupportRequestList requests={requests} />
        )}
      </div>
    </div>
  );
}
