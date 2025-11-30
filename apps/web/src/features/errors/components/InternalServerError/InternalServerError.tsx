import { ErrorPage } from "../ErrorPage";
import { getErrorConfig } from "../../utils/errorConfig";

/**
 * 500 Internal Server Error page component
 *
 * Displayed when the server encounters an unexpected error
 */
export function InternalServerError() {
  const config = getErrorConfig(500);

  const handleReportIssue = () => {
    // TODO: Implement issue reporting functionality
    // Report issue functionality will be implemented here
  };

  return (
    <ErrorPage
      statusCode={500}
      title={config.title}
      description={config.description}
      details={config.details}
      primaryActionText={config.primaryActionText}
      secondaryActionText={config.secondaryActionText}
      secondaryAction={handleReportIssue}
    />
  );
}
