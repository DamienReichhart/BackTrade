import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../context/AuthContext";
import {
  useSupportRequest,
  useSupportMessages,
  useCloseSupportRequest,
} from "../../../../api/requests/support";
import { Button, ConfirmModal } from "../../../../components";
import { LoadingState, ErrorState } from "../../../dashboard/components";
import { SupportMessageList } from "../SupportMessageList";
import { SupportMessageForm } from "../SupportMessageForm";
import { formatDate } from "../../../../utils";
import styles from "./SupportRequestDetail.module.css";

/**
 * Support request detail page component
 *
 * Displays a support request with all its messages and allows adding new messages
 */
export function SupportRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Fetch support request
  const {
    data: request,
    isLoading: isLoadingRequest,
    error: requestError,
    execute: refetchRequest,
  } = useSupportRequest(id ?? "");

  // Fetch messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    execute: refetchMessages,
  } = useSupportMessages(id ?? "");

  const { execute: closeRequest, isLoading: isClosing } =
    useCloseSupportRequest(id ?? "");

  const messages = messagesData ?? [];

  // Handle close request confirmation
  const handleCloseRequestClick = () => {
    setShowCloseModal(true);
  };

  // Handle close request confirmation
  const handleConfirmClose = async () => {
    try {
      await closeRequest();
      setShowCloseModal(false);
      refetchRequest();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to close request:", err);
      // Keep modal open on error so user can try again
    }
  };

  // Handle cancel close
  const handleCancelClose = () => {
    setShowCloseModal(false);
  };

  // Handle message created
  const handleMessageCreated = () => {
    refetchMessages();
  };

  // Show loading state
  if (isLoadingRequest) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  // Show error state
  if (requestError || !request) {
    return (
      <div className={styles.container}>
        <ErrorState
          error={(requestError as Error) || new Error("Request not found")}
        />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return styles.statusOpen;
      case "PENDING_APPROVAL":
        return styles.statusPending;
      case "CLOSED":
        return styles.statusClosed;
      default:
        return "";
    }
  };

  const canAddMessages = request.support_status === "OPEN";
  const canCloseRequest =
    request.support_status === "OPEN" && user?.id === request.requester_id;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="ghost"
            size="medium"
            onClick={() => navigate("/dashboard/support")}
          >
            ← Back
          </Button>
          <div>
            <h1 className={styles.title}>Support Request #{request.id}</h1>
            <div className={styles.meta}>
              <span
                className={`${styles.status} ${getStatusColor(request.support_status)}`}
              >
                {request.support_status.replace("_", " ")}
              </span>
              <span className={styles.date}>
                Created {formatDate(request.created_at)}
              </span>
              {request.updated_at !== request.created_at && (
                <span className={styles.date}>
                  Updated {formatDate(request.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>
        {canCloseRequest && (
          <Button
            variant="outline"
            size="medium"
            onClick={handleCloseRequestClick}
            disabled={isClosing}
          >
            Close Request
          </Button>
        )}
      </header>

      {/* Close Confirmation Modal */}
      <ConfirmModal
        isOpen={showCloseModal}
        title="Close Support Request"
        message="Are you sure you want to close this support request? You won't be able to add new messages once it's closed."
        confirmLabel="Close Request"
        cancelLabel="Cancel"
        confirmVariant="primary"
        cancelVariant="outline"
        isLoading={isClosing}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Messages Section */}
        <section className={styles.messagesSection}>
          <h2 className={styles.sectionTitle}>Messages ({messages.length})</h2>
          {isLoadingMessages ? (
            <LoadingState />
          ) : messagesError ? (
            <ErrorState error={messagesError as Error} />
          ) : messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <p>No messages yet. Start the conversation below.</p>
            </div>
          ) : (
            <SupportMessageList
              messages={messages}
              currentUserId={user?.id ?? 0}
            />
          )}
        </section>

        {/* Message Form Section */}
        {canAddMessages && (
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Add Message</h2>
            <SupportMessageForm
              supportRequestId={request.id}
              senderId={user?.id ?? 0}
              onSuccess={handleMessageCreated}
            />
          </section>
        )}

        {!canAddMessages && (
          <div className={styles.closedNotice}>
            <p>This request is closed. You cannot add new messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
