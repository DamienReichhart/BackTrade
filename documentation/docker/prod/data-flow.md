```mermaid
sequenceDiagram
    participant User as Internet User
    participant CF as Cloudflare Tunnel
    participant Proxy as Nginx Proxy
    participant Frontend as Frontend (Nginx)
    participant API as Backend API
    participant Redis as Redis Cache
    participant Postgres as PostgreSQL
    participant ClickHouse as ClickHouse
    participant MinIO as MinIO Storage
    participant RabbitMQ as RabbitMQ Queue
    participant Worker as Worker Service
    participant Scheduler as Scheduler Service

    Note over User,Scheduler: User Request Flow
    User->>CF: HTTPS Request
    CF->>Proxy: Tunneled Request
    Proxy->>Frontend: Static Assets (/)
    Proxy->>API: API Requests (/api/*)

    Note over API,Redis: API Processing with Cache
    API->>Redis: Check Cache (Sessions, Data)
    alt Cache Hit
        Redis-->>API: Cached Data
    else Cache Miss
        API->>Postgres: Query Database
        Postgres-->>API: Result Data
        API->>Redis: Store in Cache
    end

    Note over API,ClickHouse: Analytics Data Flow
    API->>ClickHouse: Query Historical Candles
    ClickHouse-->>API: Time-Series Data
    API-->>Proxy: JSON Response
    Proxy-->>CF: Response
    CF-->>User: Response

    Note over API,MinIO: Dataset Upload Flow
    User->>API: Upload Dataset File
    API->>MinIO: Store File Object
    MinIO-->>API: File Stored
    API->>RabbitMQ: Publish Processing Job
    RabbitMQ-->>Worker: Job Message
    Worker->>MinIO: Read Dataset File
    MinIO-->>Worker: File Content
    Worker->>Postgres: Store Dataset Metadata
    Worker->>ClickHouse: Import Candlestick Data
    Worker->>RabbitMQ: Acknowledge Job

    Note over Scheduler,RabbitMQ: Scheduled Tasks Flow
    Scheduler->>Postgres: Query Failed Jobs
    Postgres-->>Scheduler: Failed Job List
    Scheduler->>RabbitMQ: Retry Failed Jobs
    RabbitMQ-->>Worker: Retry Job Message
    Worker->>Postgres: Update Job Status
    Worker->>RabbitMQ: Acknowledge

    Note over API,Postgres: Transaction Flow
    API->>Postgres: Begin Transaction
    API->>Postgres: Multiple Operations
    API->>Postgres: Commit Transaction
    Postgres-->>API: Success
    API->>Redis: Invalidate Related Cache
```
