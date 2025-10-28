import { ErrorPage } from "../ErrorPage";

/**
 * 404 Not Found error page component
 *
 * Displayed when a user navigates to a page that doesn't exist
 */
export function NotFoundError() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      details="Please check the URL or return to the homepage."
      primaryActionText="Go Home"
    />
  );
}
