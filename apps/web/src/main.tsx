import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Self-hosted brand fonts (font-display: swap built in, no third-party request)
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";
import "@fontsource/azeret-mono/400.css";
import "@fontsource/azeret-mono/500.css";
import "@fontsource/azeret-mono/600.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthInitializer } from "./components/AuthInitializer";
import { ToastContainer } from "./components/Toast";
import { router } from "./routes";
import "./main.css";

/**
 * Create a QueryClient instance for React Query
 * This manages the cache and handles all query/mutation operations
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Default options for all queries
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            // Default options for all mutations
            retry: 0,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthInitializer>
                    <RouterProvider router={router} />
                </AuthInitializer>
                <ToastContainer />
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>
);
