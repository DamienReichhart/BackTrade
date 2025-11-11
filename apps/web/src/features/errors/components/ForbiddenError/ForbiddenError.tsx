import { ErrorPage } from "../ErrorPage";

/**
 * 403 Forbidden error page component
 *
 * Displayed when the user doesn't have permission to access a resource
 */
export function ForbiddenError() {
  return (
    <ErrorPage
      statusCode={403}
      title="Access Forbidden"
      description="You don't have permission to access this resource."
      details="Please contact us if you believe this is an error."
      primaryActionText="Go Home"
    />
  );
}
