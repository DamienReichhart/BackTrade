import "@testing-library/jest-dom";
import React, { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    queryClient?: QueryClient;
}

/**
 * Render a component wrapped in the providers it needs in production.
 */
export function renderWithProviders(
    ui: ReactElement,
    {
        queryClient = createTestQueryClient(),
        ...options
    }: CustomRenderOptions = {}
) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>{children}</MemoryRouter>
            </QueryClientProvider>
        );
    }
    return {
        ...render(ui, { wrapper: Wrapper, ...options }),
        queryClient,
    };
}

export * from "@testing-library/react";
export { renderWithProviders as render };
