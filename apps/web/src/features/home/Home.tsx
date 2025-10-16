import { useState, useEffect } from "react";
import { Health } from "@backtrade/types";
import { getHealth } from "../../api/health";

export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const healthData = await getHealth();
      setHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <main>
      <h1>BackTrade</h1>
      
      <div>
        <h2>API Health Check</h2>

          {loading ? 'Checking...' : 'Health: ' + health?.status}
        
        {error && (
          <div>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {health && (
          <div>
            <strong>Status:</strong> {health.status}<br />
            <strong>Time:</strong> {new Date(health.time).toLocaleString()}
          </div>
        )}
      </div>
    </main>
  );
}
