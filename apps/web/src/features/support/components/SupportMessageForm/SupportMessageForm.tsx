import { useState } from "react";
import { useCreateSupportMessage } from "../../../../api/requests/support";
import { Button } from "../../../../components";
import styles from "./SupportMessageForm.module.css";

interface SupportMessageFormProps {
  supportRequestId: number;
  senderId: number;
  onSuccess: () => void;
}

/**
 * Support message form component
 *
 * Form for adding a new message to a support request
 */
export function SupportMessageForm({
  supportRequestId,
  senderId,
  onSuccess,
}: SupportMessageFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { execute: createMessage, isLoading: isPending } =
    useCreateSupportMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Message content is required");
      return;
    }

    try {
      await createMessage({
        sender_id: senderId,
        support_request_id: supportRequestId,
        content: content.trim(),
      });
      setContent("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>
            Your Message
          </label>
          <textarea
            id="message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message here..."
            className={styles.textarea}
            rows={6}
            required
            disabled={isPending}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={isPending ? true : !content.trim()}
          >
            {isPending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </form>
    </div>
  );
}
