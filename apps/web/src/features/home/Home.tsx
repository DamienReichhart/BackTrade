import { useQuery } from "@tanstack/react-query";
import { Health, HealthSchema } from "@backtrade/types";

export default function Home() {
  const { data } = useQuery<Health>({
    queryKey: ["health"],
    queryFn: async (): Promise<Health> => {
      const baseUrl = import.meta.env.VITE_API_URL ?? "";
      const response = await fetch(`${baseUrl}/health`);
      const json = await response.json();
      return HealthSchema.parse(json);
    },
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>BackTrade</h1>
      <pre>{JSON.stringify(data ?? {}, null, 2)}</pre>
    </main>
  );
}
