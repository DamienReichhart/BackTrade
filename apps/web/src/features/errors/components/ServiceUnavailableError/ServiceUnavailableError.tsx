import { ErrorPage } from "../ErrorPage";

/**
 * 503 Service Unavailable error page component
 *
 * Displayed when the service is temporarily unavailable (maintenance, overload, etc.)
 */
export function ServiceUnavailableError() {
  return (
    <ErrorPage
      statusCode={503}
      title="Service Unavailable"
      description="The service is temporarily unavailable."
      details="We're either performing maintenance or experiencing high traffic. Please try again shortly."
      primaryActionText="Go Home"
      secondaryActionText="Refresh Page"
      secondaryAction={() => {
        window.location.reload();
      }}
    />
  );
}
