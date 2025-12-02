import { ErrorPage } from "../ErrorPage";

/**
 * Banned user error page component
 *
 * Displayed when a user attempts to login but their account has been banned
 */
export function BannedError() {
    return (
        <ErrorPage
            statusCode={401}
            title="Account Banned"
            description="Your account has been banned and you cannot access this service."
            details="If you believe this is an error, please contact support for assistance."
            primaryActionText="Go Home"
            showStatusCode={false}
        />
    );
}
