import { Suspense, type ComponentType, type ReactElement } from "react";
import { AuthenticatedLayout } from "../components";
import { RouteFallback } from "../components/RouteFallback";

/**
 * Wrap a lazily-loaded page component in a Suspense boundary so its chunk can
 * load on demand without blocking initial render.
 */
export function withSuspense(Component: ComponentType): ReactElement {
    return (
        <Suspense fallback={<RouteFallback />}>
            <Component />
        </Suspense>
    );
}

/**
 * Same as {@link withSuspense} but wrapped in the authenticated layout, so the
 * sidebar chrome renders immediately while the page content streams in.
 */
export function withLayout(Component: ComponentType): ReactElement {
    return (
        <AuthenticatedLayout>
            <Suspense fallback={<RouteFallback />}>
                <Component />
            </Suspense>
        </AuthenticatedLayout>
    );
}
