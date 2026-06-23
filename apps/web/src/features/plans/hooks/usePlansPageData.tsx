import { useMemo } from "react";
import type { BillingOverviewResponse, Invoice } from "@backtrade/types";
import {
    useBillingOverview,
    useInvoices,
} from "../../../api/hooks/requests/stripe";

/**
 * Aggregate the data the plan management page needs, exposing each query's
 * loading/error state independently so sections can render and fail in
 * isolation.
 */
export function usePlansPageData(): {
    overview: BillingOverviewResponse | null;
    invoices: Invoice[];
    isOverviewLoading: boolean;
    overviewError: Error | null;
    isInvoicesLoading: boolean;
    invoicesError: Error | null;
} {
    const {
        data: overview,
        isLoading: isOverviewLoading,
        error: overviewError,
    } = useBillingOverview();
    const {
        data: invoicesData,
        isLoading: isInvoicesLoading,
        error: invoicesError,
    } = useInvoices();

    const invoices = useMemo(() => invoicesData ?? [], [invoicesData]);

    return {
        overview: overview ?? null,
        invoices,
        isOverviewLoading,
        overviewError: overviewError as Error | null,
        isInvoicesLoading,
        invoicesError: invoicesError as Error | null,
    };
}
