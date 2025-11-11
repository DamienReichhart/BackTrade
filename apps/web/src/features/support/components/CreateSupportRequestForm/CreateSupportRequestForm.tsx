import { useState } from "react";
import {
  useCreateSupportRequest,
  useCreateSupportMessage,
} from "../../../../api/requests/support";
import { Button, Input } from "../../../../components";
import styles from "./CreateSupportRequestForm.module.css";

interface CreateSupportRequestFormProps {
  requesterId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Create support request form component
 *
 * Form for creating a new support request
 */
export function CreateSupportRequestForm({
  requesterId,
  onSuccess,
  onCancel,
}: CreateSupportRequestFormProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { execute: createRequest, isLoading: isCreatingRequest } =
    useCreateSupportRequest();
  const { execute: createMessage, isLoading: isCreatingMessage } =
    useCreateSupportMessage();

  const isPending = isCreatingRequest || isCreatingMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    try {
      // Create the support request first
      const newRequest = await createRequest({
        requester_id: requesterId,
        support_status: "OPEN",
      });

      // After creating the request, create the first message with subject and description
      const messageContent = `Subject: ${subject.trim()}\n\n${description.trim()}`;
      await createMessage({
        sender_id: requesterId,
        support_request_id: newRequest.id,
        content: messageContent,
      });

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create support request",
      );
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Create Support Request</h2>
        <p className={styles.description}>
          Fill out the form below to create a new support request. Our team will
          get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <Input
            label="Subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            required
            disabled={isPending}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide detailed information about your issue..."
            className={styles.textarea}
            rows={8}
            required
            disabled={isPending}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
