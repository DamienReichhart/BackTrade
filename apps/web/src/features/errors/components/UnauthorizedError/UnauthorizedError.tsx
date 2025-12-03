import { ErrorPage } from "../ErrorPage";
import { useNavigate } from "react-router-dom";
import { getErrorConfig } from "../../utils/errorConfig";

/**
 * 401 Unauthorized error page component
 *
 * Displayed when authentication is required but not provided
 */
export function UnauthorizedError() {
    const navigate = useNavigate();
    const config = getErrorConfig(401);

    return (
        <ErrorPage
            statusCode={401}
            title={config.title}
            description={config.description}
            details={config.details}
            primaryActionText={config.primaryActionText}
            primaryAction={() => {
                navigate("/signin");
            }}
        />
    );
}
