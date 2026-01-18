# Data Dictionary

## USER

| Attribute                 | Type     | Size | Constraints              | Description                                             | Domain                    |
| ------------------------- | -------- | ---- | ------------------------ | ------------------------------------------------------- | ------------------------- |
| id                        | Integer  | -    | PK, AUTO INCREMENT       | Unique identifier for the user                          | Positive integer          |
| email                     | String   | -    | UNIQUE, NOT NULL         | Email address of the user, used for authentication      | Valid email format        |
| password_hash             | String   | -    | NOT NULL                 | Hashed password for user authentication                 | Encrypted string          |
| role                      | Enum     | -    | NOT NULL, DEFAULT: USER  | User role defining access level                         | ANONYMOUS, USER, ADMIN    |
| is_banned                 | Boolean  | -    | NOT NULL, DEFAULT: false | Indicates if the user account is banned                 | true, false               |
| stripe_customer_id        | String   | -    | NULLABLE, UNIQUE         | Stripe customer identifier for billing                  | Stripe customer ID format |
| password_reset_code       | String   | -    | NULLABLE                 | Temporary 6-digit code for password reset functionality | Numeric string (6 digits) |
| password_reset_expires_at | DateTime | -    | NULLABLE                 | Expiration timestamp for the password reset code        | ISO 8601 datetime or NULL |
| created_at                | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the user account was created             | ISO 8601 datetime         |
| updated_at                | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the user record was last modified        | ISO 8601 datetime         |

---

## USER_SESSION

| Attribute   | Type     | Size | Constraints              | Description                                         | Domain                    |
| ----------- | -------- | ---- | ------------------------ | --------------------------------------------------- | ------------------------- |
| id          | Integer  | -    | PK, AUTO INCREMENT       | Unique identifier for the session                   | Positive integer          |
| user_id     | Integer  | -    | FK → USER(id), NOT NULL  | Reference to the user who owns this session         | Existing user identifier  |
| ip_address  | String   | -    | NOT NULL                 | IP address from which the session was initiated     | IPv4 or IPv6 format       |
| user_agent  | String   | -    | NOT NULL                 | Browser/client user agent string                    | HTTP user agent string    |
| device_info | String   | -    | NOT NULL                 | Information about the device used for the session   | Device description string |
| issued_at   | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the session token was issued         | ISO 8601 datetime         |
| created_at  | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the session record was created       | ISO 8601 datetime         |
| updated_at  | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the session record was last modified | ISO 8601 datetime         |

> **Index:** user_id
> **On Delete:** CASCADE (user deletion removes all user sessions)

---

## PLAN

| Attribute           | Type     | Size | Constraints              | Description                                                            | Domain                                  |
| ------------------- | -------- | ---- | ------------------------ | ---------------------------------------------------------------------- | --------------------------------------- |
| id                  | Integer  | -    | PK, AUTO INCREMENT       | Unique identifier for the plan                                         | Positive integer                        |
| code                | String   | -    | UNIQUE, NOT NULL         | Internal code identifier for the subscription plan                     | Alphanumeric code                       |
| stripe_product_id   | String   | -    | NOT NULL                 | Stripe product identifier                                              | Stripe product ID format                |
| stripe_price_id     | String   | -    | NOT NULL                 | Stripe price identifier                                                | Stripe price ID format                  |
| currency            | String   | 3    | NOT NULL                 | Currency code for the plan price                                       | ISO 4217 currency code (e.g., USD, EUR) |
| price               | Decimal  | 10,2 | NOT NULL                 | Price of the subscription plan                                         | Positive decimal number                 |
| max_active_sessions | Integer  | -    | NOT NULL, DEFAULT: 1     | Maximum number of active (non-archived) sessions allowed for this plan | Positive integer                        |
| created_at          | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the plan was created                                    | ISO 8601 datetime                       |
| updated_at          | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the plan record was last modified                       | ISO 8601 datetime                       |

---

## SUBSCRIPTION

| Attribute              | Type     | Size | Constraints              | Description                                              | Domain                        |
| ---------------------- | -------- | ---- | ------------------------ | -------------------------------------------------------- | ----------------------------- |
| id                     | Integer  | -    | PK, AUTO INCREMENT       | Unique identifier for the subscription                   | Positive integer              |
| user_id                | Integer  | -    | FK → USER(id), NOT NULL  | Reference to the user who owns this subscription         | Existing user identifier      |
| plan_id                | Integer  | -    | FK → PLAN(id), NOT NULL  | Reference to the subscribed plan                         | Existing plan identifier      |
| stripe_subscription_id | String   | -    | UNIQUE, NOT NULL         | Stripe subscription identifier                           | Stripe subscription ID format |
| status                 | Enum     | -    | NOT NULL                 | Current status of the subscription                       | active, canceled              |
| current_period_start   | DateTime | -    | NOT NULL                 | Start date of the current billing period                 | ISO 8601 datetime             |
| current_period_end     | DateTime | -    | NOT NULL                 | End date of the current billing period                   | ISO 8601 datetime             |
| cancel_at_period_end   | Boolean  | -    | NOT NULL, DEFAULT: false | Indicates if subscription will be canceled at period end | true, false                   |
| created_at             | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the subscription was created              | ISO 8601 datetime             |
| updated_at             | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the subscription record was last modified | ISO 8601 datetime             |

> **Indexes:** user_id, plan_id
> **On Delete (user_id):** CASCADE (user deletion removes all subscriptions)

---

## STRIPE_EVENT

| Attribute       | Type     | Size | Constraints              | Description                                       | Domain                    |
| --------------- | -------- | ---- | ------------------------ | ------------------------------------------------- | ------------------------- |
| id              | Integer  | -    | PK, AUTO INCREMENT       | Unique identifier for the event record            | Positive integer          |
| stripe_event_id | String   | -    | UNIQUE, NOT NULL         | Stripe event identifier                           | Stripe event ID format    |
| type            | String   | -    | NOT NULL                 | Type of the Stripe webhook event                  | Stripe event type string  |
| payload         | JSON     | -    | NOT NULL                 | Complete JSON payload of the Stripe event         | Valid JSON object         |
| received_at     | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the event was received             | ISO 8601 datetime         |
| processed_at    | DateTime | -    | NULLABLE                 | Timestamp when the event was processed            | ISO 8601 datetime or NULL |
| created_at      | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the event record was created       | ISO 8601 datetime         |
| updated_at      | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the event record was last modified | ISO 8601 datetime         |

---

## INSTRUMENT

| Attribute     | Type     | Size | Constraints               | Description                                            | Domain                         |
| ------------- | -------- | ---- | ------------------------- | ------------------------------------------------------ | ------------------------------ |
| id            | Integer  | -    | PK, AUTO INCREMENT        | Unique identifier for the instrument                   | Positive integer               |
| symbol        | String   | -    | UNIQUE, NOT NULL          | Trading symbol identifier (e.g., EURUSD, GBPUSD)       | Standard trading symbol format |
| display_name  | String   | -    | NOT NULL                  | Human-readable name for the instrument                 | Display string                 |
| pip_size      | Decimal  | 10,8 | NOT NULL                  | Size of one pip for the instrument                     | Positive decimal number        |
| contract_size | Integer  | -    | NOT NULL, DEFAULT: 100000 | Standard contract size for the instrument              | Positive integer               |
| created_at    | DateTime | -    | NOT NULL, DEFAULT: now()  | Timestamp when the instrument was created              | ISO 8601 datetime              |
| updated_at    | DateTime | -    | NOT NULL, AUTO UPDATE     | Timestamp when the instrument record was last modified | ISO 8601 datetime              |

---

## DATASET

| Attribute     | Type     | Size | Constraints                   | Description                                         | Domain                                    |
| ------------- | -------- | ---- | ----------------------------- | --------------------------------------------------- | ----------------------------------------- |
| id            | Integer  | -    | PK, AUTO INCREMENT            | Unique identifier for the dataset                   | Positive integer                          |
| instrument_id | Integer  | -    | FK → INSTRUMENT(id), NOT NULL | Reference to the instrument this dataset belongs to | Existing instrument identifier            |
| timeframe     | Enum     | -    | NOT NULL                      | Timeframe for the market data                       | M1, M5, M10, M15, M30, H1, H2, H4, D1, W1 |
| uploaded_at   | DateTime | -    | NULLABLE                      | Timestamp when the dataset was uploaded             | ISO 8601 datetime or NULL                 |
| records_count | Integer  | -    | NULLABLE                      | Number of records in the dataset                    | Positive integer or NULL                  |
| file_name     | String   | -    | NULLABLE                      | Original filename of the uploaded dataset           | File name string or NULL                  |
| start_time    | DateTime | -    | NULLABLE                      | Start timestamp of the data range                   | ISO 8601 datetime or NULL                 |
| end_time      | DateTime | -    | NULLABLE                      | End timestamp of the data range                     | ISO 8601 datetime or NULL                 |
| created_at    | DateTime | -    | NOT NULL, DEFAULT: now()      | Timestamp when the dataset was created              | ISO 8601 datetime                         |
| updated_at    | DateTime | -    | NOT NULL, AUTO UPDATE         | Timestamp when the dataset record was last modified | ISO 8601 datetime                         |

> **Index:** instrument_id

---

## CANDLE (ClickHouse)

> **Note:** This table is stored in ClickHouse for optimized time-series performance.
> **Engine:** ReplacingMergeTree(updated_at)
> **Partition:** By month (toYYYYMM(ts))

| Attribute     | Type      | Size | Constraints              | Description                                        | Domain                                    |
| ------------- | --------- | ---- | ------------------------ | -------------------------------------------------- | ----------------------------------------- |
| instrument_id | UInt32    | -    | NOT NULL                 | Instrument associated with the candle              | Existing instrument identifier            |
| timeframe     | String    | -    | NOT NULL                 | Timeframe of the candle                            | M1, M5, M10, M15, M30, H1, H2, H4, D1, W1 |
| ts            | DateTime  | -    | NOT NULL                 | Timestamp of the candle (start of the period)      | ISO 8601 datetime                         |
| open          | Decimal64 | 8    | NOT NULL                 | Opening price of the candle                        | Positive decimal number                   |
| high          | Decimal64 | 8    | NOT NULL                 | Highest price during the candle period             | Positive decimal number, >= open, >= low  |
| low           | Decimal64 | 8    | NOT NULL                 | Lowest price during the candle period              | Positive decimal number, <= open, <= high |
| close         | Decimal64 | 8    | NOT NULL                 | Closing price of the candle                        | Positive decimal number                   |
| volume        | Float64   | -    | NOT NULL                 | Trading volume for the candle period               | Non-negative number                       |
| created_at    | DateTime  | -    | NOT NULL, DEFAULT: now() | Timestamp when the candle record was created       | ISO 8601 datetime                         |
| updated_at    | DateTime  | -    | NOT NULL, DEFAULT: now() | Timestamp when the candle record was last modified | ISO 8601 datetime                         |

> **Primary Key:** (instrument_id, timeframe, ts)
> **Indexes:**
>
> - idx_instrument_timeframe: (instrument_id, timeframe) TYPE minmax
> - idx_ts: (ts) TYPE minmax

---

## SESSION

| Attribute           | Type     | Size | Constraints                   | Description                                         | Domain                                                                                                          |
| ------------------- | -------- | ---- | ----------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| id                  | Integer  | -    | PK, AUTO INCREMENT            | Unique identifier for the trading session           | Positive integer                                                                                                |
| user_id             | Integer  | -    | FK → USER(id), NOT NULL       | Reference to the user who owns this session         | Existing user identifier                                                                                        |
| instrument_id       | Integer  | -    | FK → INSTRUMENT(id), NOT NULL | Reference to the instrument being traded            | Existing instrument identifier                                                                                  |
| name                | String   | -    | NULLABLE                      | User-defined name for the trading session           | Alphanumeric string or NULL                                                                                     |
| session_status      | Enum     | -    | NOT NULL, DEFAULT: PAUSED     | Current status of the trading session               | RUNNING, PAUSED, ARCHIVED                                                                                       |
| speed               | Enum     | -    | NOT NULL, DEFAULT: SPEED_1X   | Playback speed multiplier for the session           | SPEED_0_5X (0.5x), SPEED_1X (1x), SPEED_2X (2x), SPEED_3X (3x), SPEED_5X (5x), SPEED_10X (10x), SPEED_15X (15x) |
| start_time          | DateTime | -    | NOT NULL                      | Start timestamp of the trading session              | ISO 8601 datetime                                                                                               |
| current_time        | DateTime | -    | NOT NULL                      | Current timestamp in the session playback           | ISO 8601 datetime, >= start_time                                                                                |
| end_time            | DateTime | -    | NULLABLE                      | End timestamp of the trading session                | ISO 8601 datetime or NULL, >= start_time                                                                        |
| initial_balance     | Decimal  | 18,8 | NOT NULL                      | Initial account balance for the session             | Positive decimal number                                                                                         |
| current_balance     | Decimal  | 18,8 | NOT NULL                      | Current account balance for the session             | Non-negative decimal number                                                                                     |
| leverage            | Integer  | -    | NOT NULL, DEFAULT: 1          | Leverage multiplier for trading positions           | Positive integer (typically 1, 50, 100, 200, 500, 1000)                                                         |
| spread_pts          | Decimal  | 10,4 | NOT NULL, DEFAULT: 0          | Spread cost in points                               | Non-negative decimal number                                                                                     |
| slippage_pts        | Decimal  | 10,4 | NOT NULL, DEFAULT: 0          | Slippage cost in points                             | Non-negative decimal number                                                                                     |
| commission_per_fill | Decimal  | 10,4 | NOT NULL, DEFAULT: 0          | Commission cost per trade fill                      | Non-negative decimal number                                                                                     |
| created_at          | DateTime | -    | NOT NULL, DEFAULT: now()      | Timestamp when the session was created              | ISO 8601 datetime                                                                                               |
| updated_at          | DateTime | -    | NOT NULL, AUTO UPDATE         | Timestamp when the session record was last modified | ISO 8601 datetime                                                                                               |

> **Indexes:** user_id, instrument_id
> **On Delete (user_id):** CASCADE (user deletion removes all sessions)

---

## POSITION

| Attribute       | Type     | Size | Constraints                | Description                                                               | Domain                                   |
| --------------- | -------- | ---- | -------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| id              | Integer  | -    | PK, AUTO INCREMENT         | Unique identifier for the position                                        | Positive integer                         |
| session_id      | Integer  | -    | FK → SESSION(id), NOT NULL | Reference to the session this position belongs to                         | Existing session identifier              |
| position_status | Enum     | -    | NOT NULL, DEFAULT: OPEN    | Current status of the trading position                                    | OPEN, CLOSED, LIQUIDATED                 |
| side            | Enum     | -    | NOT NULL                   | Direction of the position                                                 | BUY, SELL                                |
| quantity_lots   | Decimal  | 18,8 | NOT NULL                   | Size of the position in lots                                              | Positive decimal number                  |
| tp_price        | Decimal  | 18,8 | NULLABLE                   | Take profit price level                                                   | Positive decimal number or NULL          |
| sl_price        | Decimal  | 18,8 | NULLABLE                   | Stop loss price level                                                     | Positive decimal number or NULL          |
| entry_price     | Decimal  | 18,8 | NOT NULL                   | Price at which the position was opened                                    | Positive decimal number                  |
| exit_price      | Decimal  | 18,8 | NULLABLE                   | Price at which the position was closed                                    | Positive decimal number or NULL          |
| opened_at       | DateTime | -    | NOT NULL                   | Timestamp when the position was opened                                    | ISO 8601 datetime                        |
| closed_at       | DateTime | -    | NULLABLE                   | Timestamp when the position was closed                                    | ISO 8601 datetime or NULL, >= opened_at  |
| realized_pnl    | Decimal  | 18,8 | NULLABLE                   | Realized profit or loss for closed positions                              | Decimal number (can be negative) or NULL |
| unrealized_pnl  | Decimal  | 18,8 | NULLABLE                   | Unrealized profit or loss for open positions (updated on bar advancement) | Decimal number (can be negative) or NULL |
| commission_cost | Decimal  | 18,8 | NULLABLE                   | Total commission cost for the position                                    | Non-negative decimal number or NULL      |
| slippage_cost   | Decimal  | 18,8 | NULLABLE                   | Total slippage cost for the position                                      | Non-negative decimal number or NULL      |
| spread_cost     | Decimal  | 18,8 | NULLABLE                   | Total spread cost for the position                                        | Non-negative decimal number or NULL      |
| created_at      | DateTime | -    | NOT NULL, DEFAULT: now()   | Timestamp when the position was created                                   | ISO 8601 datetime                        |
| updated_at      | DateTime | -    | NOT NULL, AUTO UPDATE      | Timestamp when the position record was last modified                      | ISO 8601 datetime                        |

> **Index:** session_id
> **On Delete (session_id):** CASCADE (session deletion removes all positions)

---

## TRANSACTION

| Attribute        | Type     | Size | Constraints                | Description                                             | Domain                                                             |
| ---------------- | -------- | ---- | -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| id               | Integer  | -    | PK, AUTO INCREMENT         | Unique identifier for the transaction                   | Positive integer                                                   |
| session_id       | Integer  | -    | FK → SESSION(id), NULLABLE | Reference to the session this transaction belongs to    | Existing session identifier or NULL                                |
| transaction_type | Enum     | -    | NOT NULL                   | Type of the transaction                                 | DEPOSIT, WITHDRAWAL, COMMISSION, PNL, SLIPPAGE, SPREAD, ADJUSTMENT |
| amount           | Decimal  | 18,8 | NOT NULL                   | Transaction amount (can be positive or negative)        | Decimal number (can be negative)                                   |
| balance_after    | Decimal  | 18,8 | NOT NULL                   | Account balance after this transaction                  | Non-negative decimal number                                        |
| created_at       | DateTime | -    | NOT NULL, DEFAULT: now()   | Timestamp when the transaction was created              | ISO 8601 datetime                                                  |
| updated_at       | DateTime | -    | NOT NULL, AUTO UPDATE      | Timestamp when the transaction record was last modified | ISO 8601 datetime                                                  |

> **Index:** session_id
> **On Delete (session_id):** SET NULL (session deletion sets session_id to NULL)

---

## QUEUE_JOB

| Attribute       | Type     | Size | Constraints                | Description                                     | Domain                                                                             |
| --------------- | -------- | ---- | -------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| id              | Integer  | -    | PK, AUTO INCREMENT         | Unique identifier for the queue job             | Positive integer                                                                   |
| type            | String   | -    | NOT NULL                   | Type/name of the job to be processed            | Job type identifier string                                                         |
| status          | Enum     | -    | NOT NULL, DEFAULT: PENDING | Current status of the job                       | PENDING, PROCESSING, COMPLETED, FAILED, RETRYING, QUEUE_FAILED, PERMANENTLY_FAILED |
| payload         | JSON     | -    | NOT NULL                   | Full payload data for the job                   | Valid JSON object                                                                  |
| error           | String   | -    | NULLABLE                   | Error message if the job failed                 | Error description string or NULL                                                   |
| retry_count     | Integer  | -    | NOT NULL, DEFAULT: 0       | Number of retry attempts made                   | Non-negative integer                                                               |
| next_attempt_at | DateTime | -    | NULLABLE                   | Timestamp for the next retry attempt            | ISO 8601 datetime or NULL                                                          |
| created_at      | DateTime | -    | NOT NULL, DEFAULT: now()   | Timestamp when the job was created              | ISO 8601 datetime                                                                  |
| updated_at      | DateTime | -    | NOT NULL, AUTO UPDATE      | Timestamp when the job record was last modified | ISO 8601 datetime                                                                  |
| processed_at    | DateTime | -    | NULLABLE                   | Timestamp when the job was processed            | ISO 8601 datetime or NULL                                                          |

> **Indexes:** status, type, created_at, (status, next_attempt_at)

---

## Enumeration Domains

### Role

- **ANONYMOUS**: Anonymous user with limited access
- **USER**: Standard authenticated user
- **ADMIN**: Administrator with full access

### SessionStatus

- **RUNNING**: Session is currently active and running
- **PAUSED**: Session is paused
- **ARCHIVED**: Session is archived and no longer active

### Timeframe

- **M1**: 1 minute
- **M5**: 5 minutes
- **M10**: 10 minutes
- **M15**: 15 minutes
- **M30**: 30 minutes
- **H1**: 1 hour
- **H2**: 2 hours
- **H4**: 4 hours
- **D1**: 1 day
- **W1**: 1 week

### Speed

- **SPEED_0_5X**: 0.5x speed (half speed)
- **SPEED_1X**: 1x speed (normal speed)
- **SPEED_2X**: 2x speed
- **SPEED_3X**: 3x speed
- **SPEED_5X**: 5x speed
- **SPEED_10X**: 10x speed
- **SPEED_15X**: 15x speed

### PositionStatus

- **OPEN**: Position is currently open
- **CLOSED**: Position has been closed normally
- **LIQUIDATED**: Position was liquidated (forced closure)

### Side

- **BUY**: Long position (buying)
- **SELL**: Short position (selling)

### TransactionType

- **DEPOSIT**: Money deposited into account
- **WITHDRAWAL**: Money withdrawn from account
- **COMMISSION**: Commission fee charged
- **PNL**: Profit and loss from trading
- **SLIPPAGE**: Slippage cost
- **SPREAD**: Spread cost
- **ADJUSTMENT**: Manual adjustment to balance

### SubscriptionStatus

- **active**: Subscription is active and paid
- **canceled**: Subscription has been canceled

### JobStatus

- **PENDING**: Job is waiting to be processed
- **PROCESSING**: Job is currently being processed
- **COMPLETED**: Job has been successfully completed
- **FAILED**: Job failed during processing
- **RETRYING**: Job is scheduled for retry
- **QUEUE_FAILED**: Job failed to be queued
- **PERMANENTLY_FAILED**: Job has permanently failed after all retry attempts

---

## Notes on Data Types

- **Integer**: Whole number (32-bit signed integer, auto-incremented for primary keys)
- **UInt32**: Unsigned 32-bit integer (ClickHouse specific)
- **String**: Variable-length character string
- **Decimal (precision, scale)**: Fixed-precision decimal number
    - First number: total number of digits
    - Second number: number of digits after decimal point
- **Decimal64 (scale)**: 64-bit fixed-precision decimal (ClickHouse specific)
- **Float64**: 64-bit floating-point number (ClickHouse specific)
- **Boolean**: Logical value (true/false)
- **DateTime**: Date and time value (ISO 8601 format)
- **Enum**: Enumerated type with predefined values
- **JSON**: JavaScript Object Notation data structure

---

## Database Notes

### PostgreSQL Tables

All tables except CANDLE are stored in PostgreSQL using Prisma ORM.

### ClickHouse Tables

The CANDLE table is stored in ClickHouse for optimized time-series query performance. This table uses:

- **ReplacingMergeTree** engine for efficient upsert operations (deduplication based on primary key, keeping the latest `updated_at`)
- **Monthly partitioning** for efficient data management and pruning
- **MinMax indexes** for faster range queries on common access patterns
