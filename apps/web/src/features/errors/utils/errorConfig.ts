import type { ErrorPageConfig } from "../components/ErrorPage/ErrorPage";

/**
 * Error page configurations for different error types
 */
export const errorConfigs: Record<
  string,
  Omit<ErrorPageConfig, "statusCode">
> = {
  "400": {
    title: "Bad Request",
    description:
      "The request could not be understood or was missing required parameters.",
    details: "Please check your input and try again.",
    primaryActionText: "Go Home",
  },
  "401": {
    title: "Unauthorized",
    description: "You need to be authenticated to access this resource.",
    details: "Please sign in to continue.",
    primaryActionText: "Sign In",
  },
  "403": {
    title: "Access Forbidden",
    description: "You don't have permission to access this resource.",
    details: "Please contact us if you believe this is an error.",
    primaryActionText: "Go Home",
  },
  "404": {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    details: "Please check the URL or return to the homepage.",
    primaryActionText: "Go Home",
  },
  "500": {
    title: "Internal Server Error",
    description: "Something went wrong on our end. We're working to fix it.",
    details: "Please try again later or contact us if the problem persists.",
    primaryActionText: "Go Home",
    secondaryActionText: "Report Issue",
  },
  "503": {
    title: "Service Unavailable",
    description: "The service is temporarily unavailable.",
    details:
      "We're either performing maintenance or experiencing high traffic. Please try again shortly.",
    primaryActionText: "Go Home",
    secondaryActionText: "Refresh Page",
  },
};

/**
 * Get error configuration for a specific status code
 */
export function getErrorConfig(
  statusCode: number,
): Omit<ErrorPageConfig, "statusCode"> {
  return (
    errorConfigs[statusCode.toString()] ?? {
      title: "Error",
      description: "An error occurred.",
      primaryActionText: "Go Home",
    }
  );
}
