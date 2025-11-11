import { ErrorPage } from "../ErrorPage";
import { getErrorConfig } from "../../utils/errorConfig";

/**
 * 403 Forbidden error page component
 *
 * Displayed when the user doesn't have permission to access a resource
 */
export function ForbiddenError() {
  const config = getErrorConfig(403);

  return (
    <ErrorPage
      statusCode={403}
      title={config.title}
      description={config.description}
      details={config.details}
      primaryActionText={config.primaryActionText}
    />
  );
}
