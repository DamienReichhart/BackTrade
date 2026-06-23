import { render, screen } from "../../../../test-utils";
import { InvoiceList } from "./InvoiceList";
import type { Invoice } from "@backtrade/types";

const invoices: Invoice[] = [
    {
        id: "in_1",
        number: "BT-001",
        date: "2026-06-14T00:00:00.000Z",
        amount: 19,
        currency: "eur",
        status: "paid",
        hostedUrl: "https://pay/in_1",
        pdfUrl: "https://pdf/in_1",
    },
];

it("renders an invoice row with a PDF link", () => {
    render(<InvoiceList invoices={invoices} />);
    expect(screen.getByText(/BT-001/)).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /pdf/i });
    expect(link).toHaveAttribute("href", "https://pdf/in_1");
});

it("renders an empty state with no invoices", () => {
    render(<InvoiceList invoices={[]} />);
    expect(screen.getByText(/no invoices yet/i)).toBeInTheDocument();
});
