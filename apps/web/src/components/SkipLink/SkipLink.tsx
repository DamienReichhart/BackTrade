import { type ReactNode } from "react";
import styles from "./SkipLink.module.css";

interface SkipLinkProps {
    /**
     * Id of the element to jump to.
     * @default "main-content"
     */
    targetId?: string;
    children?: ReactNode;
}

/**
 * SkipLink
 *
 * A keyboard-only "skip to main content" link. Visually hidden until focused,
 * letting keyboard and screen-reader users bypass repeated navigation. The
 * target element should have a matching id and `tabindex={-1}`.
 */
export function SkipLink({
    targetId = "main-content",
    children = "Skip to main content",
}: SkipLinkProps) {
    return (
        <a href={`#${targetId}`} className={styles.skipLink}>
            {children}
        </a>
    );
}
