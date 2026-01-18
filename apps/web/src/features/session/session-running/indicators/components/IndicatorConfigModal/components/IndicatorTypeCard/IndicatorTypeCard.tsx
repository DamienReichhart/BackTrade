import { Button } from "../../../../../../../../components/Button";
import type {
    IndicatorDefinition,
    IndicatorConfigBase,
} from "../../../../toolkit";
import styles from "./IndicatorTypeCard.module.css";

interface IndicatorTypeCardProps {
    definition: IndicatorDefinition<IndicatorConfigBase>;
    onAdd: () => void;
}

/**
 * Card describing an available indicator type
 */
export function IndicatorTypeCard({
    definition,
    onAdd,
}: IndicatorTypeCardProps) {
    return (
        <div className={styles.card}>
            <div>
                <p className={styles.title}>{definition.title}</p>
                <p className={styles.description}>{definition.description}</p>
                <span className={styles.badge}>{definition.group}</span>
            </div>
            <Button variant="secondary" size="small" onClick={onAdd}>
                Add
            </Button>
        </div>
    );
}
