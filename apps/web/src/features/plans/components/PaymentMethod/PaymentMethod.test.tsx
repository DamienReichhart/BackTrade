import { render, screen, fireEvent } from "../../../../test-utils";
import { PaymentMethod } from "./PaymentMethod";

it("renders the card brand and last4", () => {
    render(
        <PaymentMethod
            paymentMethod={{
                brand: "visa",
                last4: "4242",
                expMonth: 12,
                expYear: 2030,
            }}
            onManage={jest.fn()}
            disabled={false}
        />
    );
    expect(screen.getByText(/visa/i)).toBeInTheDocument();
    expect(screen.getByText(/4242/)).toBeInTheDocument();
});

it("renders an empty state with no card", () => {
    render(
        <PaymentMethod
            paymentMethod={null}
            onManage={jest.fn()}
            disabled={false}
        />
    );
    expect(screen.getByText(/no payment method/i)).toBeInTheDocument();
});

it("calls onManage when the button is clicked", () => {
    const onManage = jest.fn();
    render(
        <PaymentMethod
            paymentMethod={null}
            onManage={onManage}
            disabled={false}
        />
    );
    fireEvent.click(screen.getByRole("button", { name: /payment method/i }));
    expect(onManage).toHaveBeenCalled();
});
