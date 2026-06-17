import { type CSSProperties } from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
    /** Shape of the placeholder. @default "rect" */
    variant?: "text" | "rect" | "circle";
    /** CSS width (number = px). */
    width?: string | number;
    /** CSS height (number = px). */
    height?: string | number;
    className?: string;
}

/**
 * Skeleton
 *
 * A shimmering placeholder for content that is loading. Decorative
 * (`aria-hidden`); wrap the loading region in an element with
 * `aria-busy="true"` so assistive tech knows content is pending.
 */
export function Skeleton({
    variant = "rect",
    width,
    height,
    className,
}: SkeletonProps) {
    const style: CSSProperties = { width, height };

    return (
        <span
            className={`${styles.skeleton} ${styles[variant]} ${className ?? ""}`}
            style={style}
            aria-hidden="true"
        />
    );
}
