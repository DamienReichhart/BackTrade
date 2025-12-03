import { type ReactNode } from "react";
import { Input } from "../../../../../../../../components/Input";
import { Select } from "../../../../../../../../components/Select";
import { Toggle } from "../../../../../../../../components/Toggle";
import type {
    IndicatorConfig,
    IndicatorDefinition,
    IndicatorFieldDefinition,
    IndicatorConfigBase,
} from "../../../../toolkit";
import styles from "./IndicatorForm.module.css";

interface IndicatorFormProps {
    indicator: IndicatorConfig;
    definition: IndicatorDefinition<IndicatorConfig>;
    onChange: (changes: Partial<IndicatorConfig>) => void;
}

/**
 * Dynamic form for configuring indicator parameters
 */
export function IndicatorForm({
    indicator,
    definition,
    onChange,
}: IndicatorFormProps) {
    const renderField = (field: IndicatorFieldDefinition) => {
        const value = indicator[field.key as keyof IndicatorConfig];
        let content: ReactNode = null;

        if (field.input === "number") {
            content = (
                <>
                    <Input
                        label={field.label}
                        type="number"
                        value={String(value ?? "")}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onChange={(event) =>
                            handleFieldChange(
                                field.key,
                                Number(event.target.value)
                            )
                        }
                    />
                    {field.helperText && (
                        <p className={styles.helper}>{field.helperText}</p>
                    )}
                </>
            );
            return (
                <div key={field.key} className={styles.field}>
                    {content}
                </div>
            );
        }

        if (field.input === "select") {
            const options =
                field.options?.map((option) => ({
                    label: option.label,
                    value: option.value,
                })) ?? [];

            content = (
                <>
                    <label className={styles.label}>{field.label}</label>
                    <Select
                        value={String(value ?? "")}
                        options={options}
                        onChange={(optionValue) =>
                            handleFieldChange(field.key, optionValue)
                        }
                    />
                </>
            );
            return (
                <div key={field.key} className={styles.field}>
                    {content}
                </div>
            );
        }

        if (field.input === "color") {
            content = (
                <>
                    <label className={styles.label}>{field.label}</label>
                    <input
                        type="color"
                        value={String(value ?? "#ffffff")}
                        onChange={(event) =>
                            handleFieldChange(field.key, event.target.value)
                        }
                        className={styles.colorInput}
                    />
                </>
            );
            return (
                <div key={field.key} className={styles.field}>
                    {content}
                </div>
            );
        }

        if (field.input === "switch") {
            content = (
                <Toggle
                    label={field.label}
                    checked={Boolean(value)}
                    onChange={(checked) =>
                        handleFieldChange(field.key, checked)
                    }
                />
            );
            return (
                <div key={field.key} className={styles.field}>
                    {content}
                </div>
            );
        }

        return null;
    };

    const handleFieldChange = (key: string, value: unknown) => {
        onChange({ [key]: value } as Partial<IndicatorConfig>);
    };

    return (
        <div className={styles.form}>
            <div className={styles.header}>
                <p className={styles.type}>{definition.shortLabel}</p>
                <h3 className={styles.title}>{definition.title}</h3>
                <p className={styles.description}>{definition.description}</p>
            </div>
            <div className={styles.nameField}>
                <Input
                    label="Display name"
                    value={indicator.name}
                    onChange={(event) =>
                        handleFieldChange("name", event.target.value)
                    }
                />
            </div>
            <div className={styles.grid}>
                {definition.fields.map((field) =>
                    renderField(
                        field as IndicatorFieldDefinition<IndicatorConfigBase>
                    )
                )}
            </div>
        </div>
    );
}
