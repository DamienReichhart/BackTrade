import { ErrorPage } from "../ErrorPage";
import { useNavigate } from "react-router-dom";

/**
 * 401 Unauthorized error page component
 *
 * Displayed when authentication is required but not provided
 */
export function UnauthorizedError() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      statusCode={401}
      title="Unauthorized"
      description="You need to be authenticated to access this resource."
      details="Please sign in to continue."
      primaryActionText="Sign In"
      primaryAction={() => {
        navigate("/signin");
      }}
    />
  );
}
