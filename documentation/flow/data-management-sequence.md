```mermaid
sequenceDiagram
    actor Client
    participant Controller as API Controller
    participant Service as Business Service
    participant CacheRepo as Cache Repository<br/>(Redis)
    participant DataRepo as Data Repository<br/>(@backtrade/data)
    participant Prisma as Prisma Client
    participant PostgreSQL as PostgreSQL<br/>(TimescaleDB)
    participant ClickHouse as ClickHouse<br/>(Time-series DB)
    participant Queue as RabbitMQ Queue

    rect rgb(200, 220, 255)
    note over Client,PostgreSQL: READ OPERATION - Cache Hit Path
    Client->>Controller: GET /api/v1/resource/:id
    Controller->>Service: getResourceById(id, user)
    Service->>CacheRepo: getCachedResource(id)
    CacheRepo-->>Service: cached resource
    Service-->>Controller: resource
    Controller-->>Client: HTTP 200 + resource
    end

    rect rgb(220, 255, 200)
    note over Client,PostgreSQL: READ OPERATION - Cache Miss Path
    Client->>Controller: GET /api/v1/resource/:id
    Controller->>Service: getResourceById(id, user)
    Service->>CacheRepo: getCachedResource(id)
    CacheRepo-->>Service: null (cache miss)
    Service->>DataRepo: getResourceById(id)
    DataRepo->>Prisma: prisma.resource.findUnique({where: {id}})
    Prisma->>PostgreSQL: SELECT * FROM resource WHERE id = ?
    PostgreSQL-->>Prisma: resource data
    Prisma-->>DataRepo: resource entity
    DataRepo-->>Service: resource entity
    alt resource found
        Service->>CacheRepo: cacheResource(id, resource)
        CacheRepo-->>Service: OK
        Service-->>Controller: resource
        Controller-->>Client: HTTP 200 + resource
    else resource not found
        Service-->>Controller: throw NotFoundError
        Controller-->>Client: HTTP 404 + error
    end
    end

    rect rgb(255, 220, 200)
    note over Client,PostgreSQL: WRITE OPERATION - Create
    Client->>Controller: POST /api/v1/resource
    Controller->>Service: createResource(data, user)
    Service->>Service: validateBusinessRules(data)
    Service->>DataRepo: createResource(data)
    DataRepo->>Prisma: prisma.resource.create({data})
    Prisma->>PostgreSQL: INSERT INTO resource ...
    PostgreSQL-->>Prisma: created resource
    Prisma-->>DataRepo: resource entity
    DataRepo-->>Service: resource entity
    Service->>CacheRepo: cacheResource(id, resource)
    CacheRepo-->>Service: OK
    Service-->>Controller: resource
    Controller-->>Client: HTTP 201 + resource
    end

    rect rgb(255, 200, 220)
    note over Client,PostgreSQL: WRITE OPERATION - Update
    Client->>Controller: PUT /api/v1/resource/:id
    Controller->>Service: updateResource(id, data, user)
    Service->>Service: ensureUserAccess(id, user)
    Service->>DataRepo: getResourceById(id)
    DataRepo->>Prisma: prisma.resource.findUnique({where: {id}})
    Prisma->>PostgreSQL: SELECT * FROM resource WHERE id = ?
    PostgreSQL-->>Prisma: existing resource
    Prisma-->>DataRepo: resource entity
    DataRepo-->>Service: resource entity
    Service->>Service: validateBusinessRules(data, existing)
    Service->>DataRepo: updateResource(id, data)
    DataRepo->>Prisma: prisma.resource.update({where: {id}, data})
    Prisma->>PostgreSQL: UPDATE resource SET ... WHERE id = ?
    PostgreSQL-->>Prisma: updated resource
    Prisma-->>DataRepo: resource entity
    DataRepo-->>Service: resource entity
    Service->>CacheRepo: invalidateCachedResource(id)
    CacheRepo-->>Service: OK
    Service->>CacheRepo: cacheResource(id, updatedResource)
    CacheRepo-->>Service: OK
    Service-->>Controller: updated resource
    Controller-->>Client: HTTP 200 + resource
    end

    rect rgb(220, 200, 255)
    note over Client,ClickHouse: TIME-SERIES DATA - Read Candles
    Client->>Controller: GET /api/v1/candles?instrument=...&timeframe=...
    Controller->>Service: getCandles(params)
    Service->>DataRepo: getCandles(instrumentId, timeframe, start, end)
    DataRepo->>ClickHouse: SELECT * FROM candles<br/>WHERE instrument_id = ?<br/>AND timeframe = ?<br/>AND ts BETWEEN ? AND ?<br/>ORDER BY ts
    ClickHouse-->>DataRepo: candle records
    DataRepo-->>Service: candle[] entities
    Service-->>Controller: candles
    Controller-->>Client: HTTP 200 + candles[]
    end

    rect rgb(255, 255, 200)
    note over Client,ClickHouse: ASYNC DATA PROCESSING - Bulk Insert
    Client->>Controller: POST /api/v1/datasets/:id/file
    Controller->>Service: uploadDatasetFile(id, file)
    Service->>Service: validateDataset(id)
    Service->>DataRepo: updateDataset(id, {file_name, uploaded_at})
    DataRepo->>Prisma: prisma.dataset.update(...)
    Prisma->>PostgreSQL: UPDATE dataset SET ...
    PostgreSQL-->>Prisma: updated dataset
    Service->>CacheRepo: invalidateCachedDataset(id)
    Service->>Queue: publishMessage(DatasetFileSplit, {datasetId, fileName})
    Queue-->>Service: messageId
    Service-->>Controller: success
    Controller-->>Client: HTTP 204 No Content

    Note over Queue,ClickHouse: Asynchronous Processing
    Queue->>Queue: Worker consumes message
    Queue->>Queue: Worker processes file
    Queue->>ClickHouse: Bulk INSERT INTO candles ...
    ClickHouse-->>Queue: OK
    Queue->>DataRepo: updateDataset(id, {records_count, start_time, end_time})
    end
```

    rect rgb(200, 255, 255)
    note over Client,PostgreSQL: DELETE OPERATION
    Client->>Controller: DELETE /api/v1/resource/:id
    Controller->>Service: deleteResource(id, user)
    Service->>Service: ensureUserAccess(id, user)
    Service->>DataRepo: deleteResource(id)
    DataRepo->>Prisma: prisma.resource.delete({where: {id}})
    Prisma->>PostgreSQL: DELETE FROM resource WHERE id = ?
    PostgreSQL-->>Prisma: deleted resource
    Prisma-->>DataRepo: resource entity
    DataRepo-->>Service: resource entity
    Service->>CacheRepo: invalidateCachedResource(id)
    CacheRepo-->>Service: OK
    Service-->>Controller: deleted resource
    Controller-->>Client: HTTP 200 + resource
    end
