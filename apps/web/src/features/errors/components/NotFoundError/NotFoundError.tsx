import { ErrorPage } from "../ErrorPage";
import { getErrorConfig } from "../../utils/errorConfig";

/**
 * 404 Not Found error page component
 *
 * Displayed when a user navigates to a page that doesn't exist
 */
export function NotFoundError() {
  const config = getErrorConfig(404);

  return (
    <ErrorPage
      statusCode={404}
      title={config.title}
      description={config.description}
      details={config.details}
      primaryActionText={config.primaryActionText}
    />
  );
}
