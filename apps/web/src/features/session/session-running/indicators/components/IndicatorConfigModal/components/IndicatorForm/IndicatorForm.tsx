import { useEffect } from "react";
import { useForm, Controller, type Path } from "react-hook-form";
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
 * Type for dynamic indicator form values.
 * Uses Record to allow any indicator-specific fields.
 */
type IndicatorFormValues = Record<string, unknown>;

/**
 * Dynamic form for configuring indicator parameters.
 * Uses a generic Record type since indicator configs are determined at runtime.
 */
export function IndicatorForm({
    indicator,
    definition,
    onChange,
}: IndicatorFormProps) {
    const { control, register, watch, reset } = useForm<IndicatorFormValues>({
        defaultValues: indicator as unknown as IndicatorFormValues,
        mode: "onChange",
    });

    // Reset form when indicator changes (selection changes)
    useEffect(() => {
        reset(indicator as unknown as IndicatorFormValues);
    }, [indicator, reset]);

    // Watch for changes and propagate to parent
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name) {
                onChange({
                    [name]: value[name],
                } as Partial<IndicatorConfig>);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, onChange]);

    const renderField = (field: IndicatorFieldDefinition) => {
        const fieldName = field.key as Path<IndicatorFormValues>;

        if (field.input === "number") {
            return (
                <div key={field.key} className={styles.field}>
                    <Controller
                        name={fieldName}
                        control={control}
                        render={({ field: { onChange, value, ...rest } }) => (
                            <>
                                <Input
                                    label={field.label}
                                    type="number"
                                    value={String(value ?? "")}
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    onChange={(e) =>
                                        onChange(Number(e.target.value))
                                    }
                                    {...rest}
                                />
                                {field.helperText && (
                                    <p className={styles.helper}>
                                        {field.helperText}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </div>
            );
        }

        if (field.input === "select") {
            const options =
                field.options?.map((option) => ({
                    label: option.label,
                    value: option.value,
                })) ?? [];

            return (
                <div key={field.key} className={styles.field}>
                    <label className={styles.label}>{field.label}</label>
                    <Controller
                        name={fieldName}
                        control={control}
                        render={({ field: { onChange, value, ...rest } }) => (
                            <Select
                                value={String(value ?? "")}
                                options={options}
                                onChange={onChange}
                                {...rest}
                            />
                        )}
                    />
                </div>
            );
        }

        if (field.input === "color") {
            return (
                <div key={field.key} className={styles.field}>
                    <label className={styles.label}>{field.label}</label>
                    <input
                        type="color"
                        className={styles.colorInput}
                        {...register(fieldName)}
                    />
                </div>
            );
        }

        if (field.input === "switch") {
            return (
                <div key={field.key} className={styles.field}>
                    <Controller
                        name={fieldName}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Toggle
                                label={field.label}
                                checked={Boolean(value)}
                                onChange={onChange}
                            />
                        )}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <form className={styles.form}>
            <div className={styles.header}>
                <p className={styles.type}>{definition.shortLabel}</p>
                <h3 className={styles.title}>{definition.title}</h3>
                <p className={styles.description}>{definition.description}</p>
            </div>
            <div className={styles.nameField}>
                <Input
                    label="Display name"
                    {...register("name" as Path<IndicatorFormValues>)}
                />
            </div>
            <div className={styles.grid}>
                {definition.fields.map((field) =>
                    renderField(
                        field as IndicatorFieldDefinition<IndicatorConfigBase>
                    )
                )}
            </div>
        </form>
    );
}
