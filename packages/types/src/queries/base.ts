/**
 * Base Query Types
 *
 * Utility types for creating query types compatible with Prisma
 * while maintaining simplicity and type safety.
 */

/**
 * Filter operators for scalar fields
 */
export type ScalarFilter<T> = T extends number
    ? {
          equals?: T;
          in?: T[];
          notIn?: T[];
          lt?: T;
          lte?: T;
          gt?: T;
          gte?: T;
      }
    : T extends Date
      ? {
            equals?: T;
            in?: T[];
            notIn?: T[];
            lt?: T;
            lte?: T;
            gt?: T;
            gte?: T;
        }
      : T extends string
        ? {
              equals?: T;
              in?: T[];
              notIn?: T[];
              contains?: string;
              startsWith?: string;
              endsWith?: string;
              mode?: "default" | "insensitive";
              // Support date comparisons for ISO datetime strings
              lt?: T | string;
              lte?: T | string;
              gt?: T | string;
              gte?: T | string;
          }
        : T extends boolean
          ? {
                equals?: T;
            }
          : {
                equals?: T;
                in?: T[];
                notIn?: T[];
            };

/**
 * WhereInput type - supports filtering on entity fields
 */
export type WhereInput<T> = {
    [K in keyof T]?: T[K] extends object | null | undefined
        ? never
        : ScalarFilter<T[K]>;
} & {
    AND?: WhereInput<T> | WhereInput<T>[];
    OR?: WhereInput<T>[];
    NOT?: WhereInput<T> | WhereInput<T>[];
};

/**
 * OrderBy type - supports sorting by entity fields
 */
export type OrderBy<T> = {
    [K in keyof T]?: "asc" | "desc";
};

/**
 * CreateInput type - excludes auto-generated fields (id, created_at, updated_at)
 * Makes all fields optional to match Prisma's behavior
 */
export type CreateInput<T> = Partial<
    Omit<T, "id" | "created_at" | "updated_at">
>;

/**
 * UpdateInput type - all fields optional
 */
export type UpdateInput<T> = Partial<
    Omit<T, "id" | "created_at" | "updated_at">
>;
