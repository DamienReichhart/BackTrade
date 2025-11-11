import { ErrorPage } from "../ErrorPage";

/**
 * 500 Internal Server Error page component
 *
 * Displayed when the server encounters an unexpected error
 */
export function InternalServerError() {
  return (
    <ErrorPage
      statusCode={500}
      title="Internal Server Error"
      description="Something went wrong on our end. We're working to fix it."
      details="Please try again later or contact us if the problem persists."
      primaryActionText="Go Home"
      secondaryActionText="Report Issue"
      secondaryAction={() => {
        // TODO: Implement issue reporting functionality
      }}
    />
  );
}
