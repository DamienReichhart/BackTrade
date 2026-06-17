```mermaid
graph TB
    subgraph "Dataset Processing Pipeline"
        direction TB

        Upload[File Upload<br/>POST /datasets/:id/file]
        Validation[Validation<br/>Check Dataset Status<br/>Validate File Format]
        Storage[Storage<br/>Upload to RustFS<br/>datasets/{id}/raw/{filename}]
        QueueSplit[Queue Split Job<br/>Publish DatasetFileSplit]

        Split[File Splitting<br/>Worker Process<br/>Split into 10K line parts]
        PartStorage[Part Storage<br/>Upload parts to RustFS<br/>datasets/{id}/parts/part_N.csv]
        QueueProcess[Queue Process Jobs<br/>Publish DatasetPartProcess<br/>For each part]

        Process[Part Processing<br/>Worker Process<br/>Parse CSV, Validate Data]
        ClickHouseInsert[ClickHouse Insert<br/>Bulk Insert Candles<br/>Optimized for Performance]
        MetadataUpdate[Metadata Update<br/>Update Dataset Records<br/>start_time, end_time, records_count]

        Completion[Processing Complete<br/>Dataset Ready for Use]
    end

    Upload --> Validation
    Validation --> Storage
    Storage --> QueueSplit
    QueueSplit --> Split
    Split --> PartStorage
    PartStorage --> QueueProcess
    QueueProcess --> Process
    Process --> ClickHouseInsert
    ClickHouseInsert --> MetadataUpdate
    MetadataUpdate --> Completion

    subgraph "Storage Structure"
        RustFSRoot[RustFS Root<br/>datasets bucket]
        RawFiles[Raw Files<br/>datasets/{datasetId}/raw/]
        PartFiles[Part Files<br/>datasets/{datasetId}/parts/]
    end

    Storage --> RawFiles
    PartStorage --> PartFiles
    RawFiles --> RustFSRoot
    PartFiles --> RustFSRoot

    style Upload fill:#4a90e2
    style Split fill:#ffa500
    style Process fill:#ff6b6b
    style ClickHouseInsert fill:#339933
    style Completion fill:#c8e6c9
```
