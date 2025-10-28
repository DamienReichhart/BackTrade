import { ErrorPage } from "../ErrorPage";

/**
 * 401 Unauthorized error page component
 *
 * Displayed when authentication is required but not provided
 */
export function UnauthorizedError() {
  return (
    <ErrorPage
      statusCode={401}
      title="Unauthorized"
      description="You need to be authenticated to access this resource."
      details="Please sign in to continue."
      primaryActionText="Sign In"
      primaryAction={() => {
        window.location.href = "/signin";
      }}
    />
  );
}
