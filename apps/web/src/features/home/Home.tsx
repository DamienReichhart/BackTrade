import { useEffect } from "react";
import { useHealth } from "../../api/requests/health";

export default function Home() {
  const { result, error, loading, request } = useHealth();

  useEffect(() => {
    request();
  }, []);

  return (
    <main>
      <h1>BackTrade</h1>

      <div>
        <h2>API Health Check</h2>

        {loading ? "Checking..." : "Health: " + result?.status}

        {error && (
          <div>
            <strong>Error:</strong> {error?.message}
          </div>
        )}

        {result && (
          <div>
            <strong>Status:</strong> {result.status}
            <br />
            <strong>Time:</strong> {new Date(result.time).toLocaleString()}
          </div>
        )}
      </div>
    </main>
  );
}
