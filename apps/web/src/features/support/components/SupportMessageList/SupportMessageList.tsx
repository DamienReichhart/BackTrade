import type { SupportMessage } from "@backtrade/types";
import { SupportMessageItem } from "../SupportMessageItem";
import styles from "./SupportMessageList.module.css";

interface SupportMessageListProps {
  messages: SupportMessage[];
  currentUserId: number;
}

/**
 * Support message list component
 *
 * Displays a list of messages in a support request conversation
 */
export function SupportMessageList({
  messages,
  currentUserId,
}: SupportMessageListProps) {
  // Sort messages by creation date (oldest first)
  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <div className={styles.list}>
      {sortedMessages.map((message) => (
        <SupportMessageItem
          key={message.id}
          message={message}
          isOwnMessage={message.sender_id === currentUserId}
        />
      ))}
    </div>
  );
}
