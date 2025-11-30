import { ErrorPage } from "../ErrorPage";
import { useErrorPage } from "../../hooks";
import { getErrorConfig } from "../../utils/errorConfig";

/**
 * 503 Service Unavailable error page component
 *
 * Displayed when the service is temporarily unavailable (maintenance, overload, etc.)
 */
export function ServiceUnavailableError() {
  const config = getErrorConfig(503);
  const { handleRefresh } = useErrorPage({
    statusCode: 503,
    ...config,
  });

  return (
    <ErrorPage
      statusCode={503}
      title={config.title}
      description={config.description}
      details={config.details}
      primaryActionText={config.primaryActionText}
      secondaryActionText={config.secondaryActionText}
      secondaryAction={handleRefresh}
    />
  );
}
