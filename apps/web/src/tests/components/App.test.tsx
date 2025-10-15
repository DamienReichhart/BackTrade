import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import App from "../../app/App";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("App", () => {
  it("renders without crashing", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    // Smoke: look for root container or any text present by default
    expect(document.body).toBeDefined();
  });
});
