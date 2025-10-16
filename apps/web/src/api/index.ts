/**
 * API configuration and base URL
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

/**
 * API client for making HTTP requests
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch method with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  public get = async <T>(endpoint: string) => {
    return this.fetch<T>(endpoint, { method: "GET" });
  };

  public post = async <T>(endpoint: string, body: any) => {
    return this.fetch<T>(endpoint, { method: "POST", body });
  };

  public put = async <T>(endpoint: string, body: any) => {
    return this.fetch<T>(endpoint, { method: "PUT", body });
  };

  public delete = async <T>(endpoint: string) => {
    return this.fetch<T>(endpoint, { method: "DELETE" });
  };
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };
