import { type z } from 'zod';
import { useGet, usePost, usePut, useDelete } from './index';
import { type UseFetchOptions } from './useFetch';

/**
 * Endpoint configuration for type-safe API calls
 */
export interface EndpointConfig<TInput = unknown, TOutput = unknown> {
  /** Input schema for validation */
  inputSchema?: z.ZodType<TInput>;
  /** Output schema for validation */
  outputSchema?: z.ZodType<TOutput>;
}

/**
 * Creates a typed GET endpoint hook factory
 * 
 * @param config - Endpoint configuration with schemas
 * @returns Hook factory function
 */
export function createGetEndpoint<TOutput = unknown>(
  config: EndpointConfig<never, TOutput>,
) {
  return (
    url: string,
    options?: Omit<UseFetchOptions<never, TOutput>, 'method' | 'inputSchema' | 'outputSchema'>,
  ) => {
    return useGet<TOutput>(url, {
      ...options,
      outputSchema: config.outputSchema,
    });
  };
}

/**
 * Creates a typed POST endpoint hook factory
 * 
 * @param config - Endpoint configuration with schemas
 * @returns Hook factory function
 */
export function createPostEndpoint<TOutput = unknown, TInput = unknown>(
  config: EndpointConfig<TInput, TOutput>,
) {
  return (
    url: string,
    options?: Omit<UseFetchOptions<TInput, TOutput>, 'method' | 'inputSchema' | 'outputSchema'>,
  ) => {
    return usePost<TOutput, TInput>(url, {
      ...options,
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema,
    });
  };
}

/**
 * Creates a typed PUT endpoint hook factory
 * 
 * @param config - Endpoint configuration with schemas
 * @returns Hook factory function
 */
export function createPutEndpoint<TOutput = unknown, TInput = unknown>(
  config: EndpointConfig<TInput, TOutput>,
) {
  return (
    url: string,
    options?: Omit<UseFetchOptions<TInput, TOutput>, 'method' | 'inputSchema' | 'outputSchema'>,
  ) => {
    return usePut<TOutput, TInput>(url, {
      ...options,
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema,
    });
  };
}

/**
 * Creates a typed DELETE endpoint hook factory
 * 
 * @param config - Endpoint configuration with schemas
 * @returns Hook factory function
 */
export function createDeleteEndpoint<TOutput = unknown>(
  config: EndpointConfig<never, TOutput>,
) {
  return (
    url: string,
    options?: Omit<UseFetchOptions<never, TOutput>, 'method' | 'inputSchema' | 'outputSchema'>,
  ) => {
    return useDelete<TOutput>(url, {
      ...options,
      outputSchema: config.outputSchema,
    });
  };
}

/**
 * Creates a complete CRUD endpoint set with schemas defined once
 * 
 * @example
 * ```ts
 * const userEndpoints = createCrudEndpoints({
 *   list: { outputSchema: UserListResponseSchema },
 *   single: { outputSchema: UserSchema },
 *   create: { inputSchema: CreateUserRequestSchema, outputSchema: UserSchema },
 *   update: { inputSchema: UpdateUserRequestSchema, outputSchema: UserSchema },
 *   delete: { outputSchema: z.void() },
 * });
 * 
 * // Usage in components
 * const { data, isLoading } = userEndpoints.list('/users');
 * const { execute } = userEndpoints.create('/users');
 * ```
 */
export function createCrudEndpoints<
  TList = unknown,
  TSingle = unknown,
  TCreate = unknown,
  TCreateInput = unknown,
  TUpdate = unknown,
  TUpdateInput = unknown,
  TDelete = unknown,
>(config: {
  list?: EndpointConfig<never, TList>;
  single?: EndpointConfig<never, TSingle>;
  create?: EndpointConfig<TCreateInput, TCreate>;
  update?: EndpointConfig<TUpdateInput, TUpdate>;
  delete?: EndpointConfig<never, TDelete>;
}) {
  return {
    list: config.list ? createGetEndpoint(config.list) : undefined,
    single: config.single ? createGetEndpoint(config.single) : undefined,
    create: config.create ? createPostEndpoint(config.create) : undefined,
    update: config.update ? createPutEndpoint(config.update) : undefined,
    delete: config.delete ? createDeleteEndpoint(config.delete) : undefined,
  };
}

