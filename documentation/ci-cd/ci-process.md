# Continuous Integration (CI) Process

## Overview

The CI workflow ensures code quality, type safety, test coverage, and security before code is merged or deployed. It runs automatically on every push and pull request to protected branches.

## Workflow Configuration

**File**: `.github/workflows/ci.yml`

**Triggers**:
- Push to branches: `main`, `dev`, `feature/*`
- Pull requests targeting: `main`, `dev`

**Runner**: GitHub-hosted `ubuntu-latest`

## Workflow Structure

```mermaid
graph LR
    A[Push/PR] --> B[Setup Job]
    B --> C[Lint Job]
    B --> D[Typecheck Job]
    B --> E[Test Job]
    B --> F[Coverage Job]
    B --> G[Semgrep Job]
    C --> H[Build Job]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I{Success?}
    I -->|Yes| J[CI Passed]
    I -->|No| K[CI Failed]
```

## Job Details

### 1. Setup Job

**Purpose**: Prepare the CI environment and install dependencies

**Steps**:
1. Checkout repository code
2. Setup Node.js (via `setup-node@v4`)
3. Install pnpm globally
4. Install project dependencies with `--frozen-lockfile`

**Outputs**:
- `node`: Node.js version
- `pnpm`: pnpm version

**Reusable Action**: `.github/actions/setup`

### 2. Lint Job

**Purpose**: Enforce code quality standards via ESLint

**Dependencies**: `setup` job

**Steps**:
1. Checkout code
2. Setup environment (Node.js, pnpm, dependencies)
3. Generate Prisma Client (requires `DATABASE_URL` secret)
4. Run ESLint across the monorepo

**Reusable Actions**:
- `.github/actions/setup`
- `.github/actions/prisma-generate`
- `.github/actions/lint`

**Failure Impact**: Blocks merge and deployment

### 3. Typecheck Job

**Purpose**: Validate TypeScript type correctness

**Dependencies**: `setup` job

**Steps**:
1. Checkout code
2. Setup environment
3. Generate Prisma Client
4. Run TypeScript compiler in type-check mode

**Reusable Actions**:
- `.github/actions/setup`
- `.github/actions/prisma-generate`
- `.github/actions/typecheck`

**Failure Impact**: Blocks merge and deployment

### 4. Test Job

**Purpose**: Execute unit and integration tests

**Dependencies**: `setup` job

**Steps**:
1. Checkout code
2. Setup environment
3. Generate Prisma Client
4. Run test suite via pnpm

**Reusable Actions**:
- `.github/actions/setup`
- `.github/actions/prisma-generate`
- `.github/actions/test`

**Test Framework**: Vitest (configured per workspace)

**Failure Impact**: Blocks merge and deployment

### 5. Coverage Job

**Purpose**: Generate and report test coverage metrics

**Dependencies**: `setup` job

**Steps**:
1. Checkout code
2. Setup environment
3. Generate Prisma Client
4. Run tests with coverage collection
5. Upload coverage artifacts:
   - `api-coverage`: Coverage from `apps/api/coverage`
   - `web-coverage`: Coverage from `apps/web/coverage`

**Reusable Actions**:
- `.github/actions/setup`
- `.github/actions/prisma-generate`
- `.github/actions/test-coverage`

**Artifacts**: Coverage reports are preserved for 90 days

**Failure Impact**: Does not block merge (runs with `if: always()`)

### 6. Semgrep Job

**Purpose**: Security vulnerability scanning

**Dependencies**: `setup` job

**Permissions**:
- `security-events: write`: Report security findings
- `actions: read`: Access workflow context
- `contents: read`: Read repository code

**Steps**:
1. Checkout code
2. Run Semgrep security scan
3. Report findings to GitHub Security tab

**Reusable Actions**:
- `.github/actions/semgrep`

**Required Secret**: `SEMGREP_APP_TOKEN`

**Failure Impact**: Blocks merge and deployment

### 7. Build Job

**Purpose**: Verify production build succeeds

**Dependencies**: All previous jobs (`lint`, `typecheck`, `test`, `coverage`, `semgrep`)

**Steps**:
1. Checkout code
2. Setup environment
3. Generate Prisma Client
4. Build all packages and applications

**Reusable Actions**:
- `.github/actions/setup`
- `.github/actions/prisma-generate`
- `.github/actions/build`

**Build Command**: `pnpm build` (executes Turbo build pipeline)

**Failure Impact**: Blocks merge and deployment

## Job Execution Flow

```mermaid
sequenceDiagram
    participant GH as GitHub
    participant Setup as Setup Job
    participant Lint as Lint Job
    participant Typecheck as Typecheck Job
    participant Test as Test Job
    participant Coverage as Coverage Job
    participant Semgrep as Semgrep Job
    participant Build as Build Job

    GH->>Setup: Trigger on Push/PR
    Setup->>Setup: Checkout Code
    Setup->>Setup: Setup Node.js
    Setup->>Setup: Install pnpm
    Setup->>Setup: Install Dependencies
    
    par Parallel Execution
        Setup->>Lint: Start
        Setup->>Typecheck: Start
        Setup->>Test: Start
        Setup->>Coverage: Start
        Setup->>Semgrep: Start
    end
    
    Lint->>Lint: Generate Prisma
    Lint->>Lint: Run ESLint
    Typecheck->>Typecheck: Generate Prisma
    Typecheck->>Typecheck: Run TypeScript
    Test->>Test: Generate Prisma
    Test->>Test: Run Tests
    Coverage->>Coverage: Generate Prisma
    Coverage->>Coverage: Run Coverage
    Coverage->>GH: Upload Artifacts
    Semgrep->>Semgrep: Run Security Scan
    Semgrep->>GH: Report Findings
    
    Lint->>Build: Success
    Typecheck->>Build: Success
    Test->>Build: Success
    Coverage->>Build: Success
    Semgrep->>Build: Success
    
    Build->>Build: Checkout Code
    Build->>Build: Setup Environment
    Build->>Build: Generate Prisma
    Build->>Build: Build All Packages
    Build->>GH: CI Complete
```
