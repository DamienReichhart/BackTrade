import { ErrorPage } from "../ErrorPage";

/**
 * 400 Bad Request error page component
 *
 * Displayed when the request is malformed or invalid
 */
export function BadRequestError() {
  return (
    <ErrorPage
      statusCode={400}
      title="Bad Request"
      description="The request could not be understood or was missing required parameters."
      details="Please check your input and try again."
      primaryActionText="Go Home"
    />
  );
}
