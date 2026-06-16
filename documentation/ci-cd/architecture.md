# CI/CD Architecture

## System Architecture

The BackTrade CI/CD system consists of multiple components working together to ensure reliable, secure, and automated deployments.

## High-Level Architecture

```mermaid
graph TB
    subgraph "GitHub"
        A[Repository] --> B[GitHub Actions]
        B --> C[CI Workflow]
        B --> D[CD Workflow]
    end

    subgraph "GitHub Hosted Runners"
        C --> E[Ubuntu Runner]
        E --> F[Setup Job]
        E --> G[Lint Job]
        E --> H[Typecheck Job]
        E --> I[Test Job]
        E --> J[Coverage Job]
        E --> K[Semgrep Job]
        E --> L[Build Job]
    end

    subgraph "Self-Hosted Infrastructure"
        D --> M[Self-Hosted Runner]
        M --> N[Deploy Action]
    end

    subgraph "Production Server"
        N --> O[SSH Connection]
        O --> P[backtradecd User]
        P --> Q[Sudo Scripts]
        Q --> R[Docker Compose]
        R --> S[Application Containers]
    end

    subgraph "Secrets Management"
        B --> T[GitHub Secrets]
        T --> U[Environment Scoped]
    end
```
