import { InfoPanel } from "../../../components";

/**
 * Forgot password information panel component
 *
 * Displays branding, headline, description, and feature tags on the left side
 */
export function ForgotPasswordInfoPanel() {
    return (
        <InfoPanel
            label="Password Reset"
            headline="Reset your password securely"
            description="Enter your email address to receive a verification code. Use the code to set a new password and regain access to your account."
        />
    );
}
