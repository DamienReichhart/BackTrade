import { useMemo } from "react";
import type { BillingOverviewResponse, Invoice } from "@backtrade/types";
import {
    useBillingOverview,
    useInvoices,
} from "../../../api/hooks/requests/stripe";

/**
 * Aggregate the data the plan management page needs.
 */
export function usePlansPageData(): {
    overview: BillingOverviewResponse | null;
    invoices: Invoice[];
    isLoading: boolean;
    error: Error | null;
} {
    const {
        data: overview,
        isLoading: isLoadingOverview,
        error: overviewError,
    } = useBillingOverview();
    const {
        data: invoicesData,
        isLoading: isLoadingInvoices,
        error: invoicesError,
    } = useInvoices();

    const invoices = useMemo(() => invoicesData ?? [], [invoicesData]);

    return {
        overview: overview ?? null,
        invoices,
        isLoading: isLoadingOverview || isLoadingInvoices,
        error: (overviewError ?? invoicesError) as Error | null,
    };
}
