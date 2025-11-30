import { ErrorPage } from "../ErrorPage";
import { getErrorConfig } from "../../utils/errorConfig";

/**
 * 400 Bad Request error page component
 *
 * Displayed when the request is malformed or invalid
 */
export function BadRequestError() {
  const config = getErrorConfig(400);

  return (
    <ErrorPage
      statusCode={400}
      title={config.title}
      description={config.description}
      details={config.details}
      primaryActionText={config.primaryActionText}
    />
  );
}
