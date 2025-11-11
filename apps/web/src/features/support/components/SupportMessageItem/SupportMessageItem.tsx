import type { SupportMessage } from "@backtrade/types";
import { formatDate } from "../../../../utils";
import styles from "./SupportMessageItem.module.css";

interface SupportMessageItemProps {
  message: SupportMessage;
  isOwnMessage: boolean;
}

/**
 * Support message item component
 *
 * Displays a single message in the conversation
 */
export function SupportMessageItem({
  message,
  isOwnMessage,
}: SupportMessageItemProps) {
  return (
    <div
      className={`${styles.message} ${
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      }`}
    >
      <div className={styles.header}>
        <span className={styles.sender}>
          {isOwnMessage ? "You" : `User #${message.sender_id}`}
        </span>
        <span className={styles.timestamp}>
          {formatDate(message.created_at)}
        </span>
      </div>
      <div className={styles.content}>{message.content}</div>
      {message.updated_at !== message.created_at && (
        <div className={styles.footer}>
          <span className={styles.edited}>Edited</span>
        </div>
      )}
    </div>
  );
}
