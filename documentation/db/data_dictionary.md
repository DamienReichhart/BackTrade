# Data Dictionary

## USER

| Attribute           | Type     | Size | Constraints              | Description                                        | Domain                    |
| ------------------- | -------- | ---- | ------------------------ | -------------------------------------------------- | ------------------------- |
| email               | String   | -    | UNIQUE, NOT NULL         | Email address of the user, used for authentication | Valid email format        |
| password_hash       | String   | -    | NOT NULL                 | Hashed password for user authentication            | Encrypted string          |
| role                | Enum     | -    | NOT NULL, DEFAULT: USER  | User role defining access level                    | ANONYMOUS, USER, ADMIN    |
| is_banned           | Boolean  | -    | NOT NULL, DEFAULT: false | Indicates if the user account is banned            | true, false               |
| stripe_customer_id  | String   | -    | NULLABLE, UNIQUE         | Stripe customer identifier for billing             | Stripe customer ID format |
| password_reset_code | String   | -    | NULLABLE                 | Temporary code for password reset functionality    | Alphanumeric string       |
| created_at          | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the user account was created        | ISO 8601 datetime         |
| updated_at          | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the user record was last modified   | ISO 8601 datetime         |

---

## USER_SESSION

| Attribute   | Type     | Size | Constraints              | Description                                         | Domain                    |
| ----------- | -------- | ---- | ------------------------ | --------------------------------------------------- | ------------------------- |
| ip_address  | String   | -    | NOT NULL                 | IP address from which the session was initiated     | IPv4 or IPv6 format       |
| user_agent  | String   | -    | NOT NULL                 | Browser/client user agent string                    | HTTP user agent string    |
| device_info | String   | -    | NOT NULL                 | Information about the device used for the session   | Device description string |
| issued_at   | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the session token was issued         | ISO 8601 datetime         |
| created_at  | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the session record was created       | ISO 8601 datetime         |
| updated_at  | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the session record was last modified | ISO 8601 datetime         |

---

## PLAN

| Attribute         | Type     | Size | Constraints              | Description                                        | Domain                                  |
| ----------------- | -------- | ---- | ------------------------ | -------------------------------------------------- | --------------------------------------- |
| code              | String   | -    | UNIQUE, NOT NULL         | Internal code identifier for the subscription plan | Alphanumeric code                       |
| stripe_product_id | String   | -    | NOT NULL                 | Stripe product identifier                          | Stripe product ID format                |
| stripe_price_id   | String   | -    | NOT NULL                 | Stripe price identifier                            | Stripe price ID format                  |
| currency          | String   | 3    | NOT NULL                 | Currency code for the plan price                   | ISO 4217 currency code (e.g., USD, EUR) |
| price             | Decimal  | 10,2 | NOT NULL                 | Price of the subscription plan                     | Positive decimal number                 |
| created_at        | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the plan was created                | ISO 8601 datetime                       |
| updated_at        | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the plan record was last modified   | ISO 8601 datetime                       |

---

## SUBSCRIPTION

| Attribute              | Type     | Size | Constraints              | Description                                              | Domain                                    |
| ---------------------- | -------- | ---- | ------------------------ | -------------------------------------------------------- | ----------------------------------------- |
| stripe_subscription_id | String   | -    | UNIQUE, NOT NULL         | Stripe subscription identifier                           | Stripe subscription ID format             |
| status                 | Enum     | -    | NOT NULL                 | Current status of the subscription                       | active, canceled, trialing, active_unpaid |
| current_period_start   | DateTime | -    | NOT NULL                 | Start date of the current billing period                 | ISO 8601 datetime                         |
| current_period_end     | DateTime | -    | NOT NULL                 | End date of the current billing period                   | ISO 8601 datetime                         |
| cancel_at_period_end   | Boolean  | -    | NOT NULL, DEFAULT: false | Indicates if subscription will be canceled at period end | true, false                               |
| canceled_at            | DateTime | -    | NULLABLE                 | Timestamp when the subscription was canceled             | ISO 8601 datetime or NULL                 |
| trial_end              | DateTime | -    | NULLABLE                 | End date of the trial period, if applicable              | ISO 8601 datetime or NULL                 |
| created_at             | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the subscription was created              | ISO 8601 datetime                         |
| updated_at             | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the subscription record was last modified | ISO 8601 datetime                         |

---

## STRIPE_EVENT

| Attribute       | Type     | Size | Constraints              | Description                                       | Domain                    |
| --------------- | -------- | ---- | ------------------------ | ------------------------------------------------- | ------------------------- |
| stripe_event_id | String   | -    | UNIQUE, NOT NULL         | Stripe event identifier                           | Stripe event ID format    |
| type            | String   | -    | NOT NULL                 | Type of the Stripe webhook event                  | Stripe event type string  |
| payload         | JSON     | -    | NOT NULL                 | Complete JSON payload of the Stripe event         | Valid JSON object         |
| received_at     | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the event was received             | ISO 8601 datetime         |
| processed_at    | DateTime | -    | NULLABLE                 | Timestamp when the event was processed            | ISO 8601 datetime or NULL |
| created_at      | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the event record was created       | ISO 8601 datetime         |
| updated_at      | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the event record was last modified | ISO 8601 datetime         |

---

## INSTRUMENT

| Attribute    | Type     | Size | Constraints              | Description                                            | Domain                         |
| ------------ | -------- | ---- | ------------------------ | ------------------------------------------------------ | ------------------------------ |
| symbol       | String   | -    | UNIQUE, NOT NULL         | Trading symbol identifier (e.g., EURUSD, GBPUSD)       | Standard trading symbol format |
| display_name | String   | -    | NOT NULL                 | Human-readable name for the instrument                 | Display string                 |
| pip_size     | Decimal  | 10,8 | NOT NULL                 | Size of one pip for the instrument                     | Positive decimal number        |
| created_at   | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the instrument was created              | ISO 8601 datetime              |
| updated_at   | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the instrument record was last modified | ISO 8601 datetime              |

---

## DATASET

| Attribute     | Type     | Size | Constraints              | Description                                         | Domain                                    |
| ------------- | -------- | ---- | ------------------------ | --------------------------------------------------- | ----------------------------------------- |
| timeframe     | Enum     | -    | NOT NULL                 | Timeframe for the market data                       | M1, M5, M10, M15, M30, H1, H2, H4, D1, W1 |
| uploaded_at   | DateTime | -    | NULLABLE                 | Timestamp when the dataset was uploaded             | ISO 8601 datetime or NULL                 |
| records_count | Integer  | -    | NULLABLE                 | Number of records in the dataset                    | Positive integer or NULL                  |
| file_name     | String   | -    | NULLABLE                 | Original filename of the uploaded dataset           | File name string or NULL                  |
| start_time    | DateTime | -    | NULLABLE                 | Start timestamp of the data range                   | ISO 8601 datetime or NULL                 |
| end_time      | DateTime | -    | NULLABLE                 | End timestamp of the data range                     | ISO 8601 datetime or NULL                 |
| created_at    | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the dataset was created              | ISO 8601 datetime                         |
| updated_at    | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the dataset record was last modified | ISO 8601 datetime                         |

---

## CANDLE

| Attribute  | Type     | Size | Constraints              | Description                                        | Domain                                    |
| ---------- | -------- | ---- | ------------------------ | -------------------------------------------------- | ----------------------------------------- |
| timeframe  | Enum     | -    | NOT NULL                 | Timeframe of the candle                            | M1, M5, M10, M15, M30, H1, H2, H4, D1, W1 |
| ts         | DateTime | -    | NOT NULL                 | Timestamp of the candle (start of the period)      | ISO 8601 datetime                         |
| open       | Decimal  | 18,8 | NOT NULL                 | Opening price of the candle                        | Positive decimal number                   |
| high       | Decimal  | 18,8 | NOT NULL                 | Highest price during the candle period             | Positive decimal number, >= open, >= low  |
| low        | Decimal  | 18,8 | NOT NULL                 | Lowest price during the candle period              | Positive decimal number, <= open, <= high |
| close      | Decimal  | 18,8 | NOT NULL                 | Closing price of the candle                        | Positive decimal number                   |
| volume     | Decimal  | 18,8 | NOT NULL                 | Trading volume for the candle period               | Positive decimal number                   |
| created_at | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the candle record was created       | ISO 8601 datetime                         |
| updated_at | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the candle record was last modified | ISO 8601 datetime                         |

---

## SESSION

| Attribute           | Type     | Size | Constraints                 | Description                                         | Domain                                                                                                          |
| ------------------- | -------- | ---- | --------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| name                | String   | -    | NULLABLE                    | User-defined name for the trading session           | Alphanumeric string or NULL                                                                                     |
| session_status      | Enum     | -    | NOT NULL, DEFAULT: PAUSED   | Current status of the trading session               | RUNNING, PAUSED, ARCHIVED                                                                                       |
| speed               | Enum     | -    | NOT NULL, DEFAULT: SPEED_1X | Playback speed multiplier for the session           | SPEED_0_5X (0.5x), SPEED_1X (1x), SPEED_2X (2x), SPEED_3X (3x), SPEED_5X (5x), SPEED_10X (10x), SPEED_15X (15x) |
| start_time          | DateTime | -    | NOT NULL                    | Start timestamp of the trading session              | ISO 8601 datetime                                                                                               |
| current_time        | DateTime | -    | NOT NULL                    | Current timestamp in the session playback           | ISO 8601 datetime, >= start_time                                                                                |
| end_time            | DateTime | -    | NULLABLE                    | End timestamp of the trading session                | ISO 8601 datetime or NULL, >= start_time                                                                        |
| initial_balance     | Decimal  | 18,8 | NOT NULL                    | Initial account balance for the session             | Positive decimal number                                                                                         |
| leverage            | Integer  | -    | NOT NULL, DEFAULT: 1        | Leverage multiplier for trading positions           | Positive integer (typically 1, 50, 100, 200, 500, 1000)                                                         |
| spread_pts          | Decimal  | 10,4 | NOT NULL, DEFAULT: 0        | Spread cost in points                               | Non-negative decimal number                                                                                     |
| slippage_pts        | Decimal  | 10,4 | NOT NULL, DEFAULT: 0        | Slippage cost in points                             | Non-negative decimal number                                                                                     |
| commission_per_fill | Decimal  | 10,4 | NOT NULL, DEFAULT: 0        | Commission cost per trade fill                      | Non-negative decimal number                                                                                     |
| created_at          | DateTime | -    | NOT NULL, DEFAULT: now()    | Timestamp when the session was created              | ISO 8601 datetime                                                                                               |
| updated_at          | DateTime | -    | NOT NULL, AUTO UPDATE       | Timestamp when the session record was last modified | ISO 8601 datetime                                                                                               |

---

## POSITION

| Attribute       | Type     | Size | Constraints              | Description                                          | Domain                                   |
| --------------- | -------- | ---- | ------------------------ | ---------------------------------------------------- | ---------------------------------------- |
| position_status | Enum     | -    | NOT NULL, DEFAULT: OPEN  | Current status of the trading position               | OPEN, CLOSED, LIQUIDATED                 |
| side            | Enum     | -    | NOT NULL                 | Direction of the position                            | BUY, SELL                                |
| quantity_lots   | Decimal  | 18,8 | NOT NULL                 | Size of the position in lots                         | Positive decimal number                  |
| tp_price        | Decimal  | 18,8 | NULLABLE                 | Take profit price level                              | Positive decimal number or NULL          |
| sl_price        | Decimal  | 18,8 | NULLABLE                 | Stop loss price level                                | Positive decimal number or NULL          |
| entry_price     | Decimal  | 18,8 | NOT NULL                 | Price at which the position was opened               | Positive decimal number                  |
| exit_price      | Decimal  | 18,8 | NULLABLE                 | Price at which the position was closed               | Positive decimal number or NULL          |
| opened_at       | DateTime | -    | NOT NULL                 | Timestamp when the position was opened               | ISO 8601 datetime                        |
| closed_at       | DateTime | -    | NULLABLE                 | Timestamp when the position was closed               | ISO 8601 datetime or NULL, >= opened_at  |
| realized_pnl    | Decimal  | 18,8 | NULLABLE                 | Realized profit or loss for the position             | Decimal number (can be negative) or NULL |
| commission_cost | Decimal  | 18,8 | NULLABLE                 | Total commission cost for the position               | Non-negative decimal number or NULL      |
| slippage_cost   | Decimal  | 18,8 | NULLABLE                 | Total slippage cost for the position                 | Non-negative decimal number or NULL      |
| spread_cost     | Decimal  | 18,8 | NULLABLE                 | Total spread cost for the position                   | Non-negative decimal number or NULL      |
| created_at      | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the position was created              | ISO 8601 datetime                        |
| updated_at      | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the position record was last modified | ISO 8601 datetime                        |

---

## TRANSACTION

| Attribute        | Type     | Size | Constraints              | Description                                             | Domain                                                             |
| ---------------- | -------- | ---- | ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------ |
| transaction_type | Enum     | -    | NOT NULL                 | Type of the transaction                                 | DEPOSIT, WITHDRAWAL, COMMISSION, PNL, SLIPPAGE, SPREAD, ADJUSTMENT |
| amount           | Decimal  | 18,8 | NOT NULL                 | Transaction amount (can be positive or negative)        | Decimal number (can be negative)                                   |
| balance_after    | Decimal  | 18,8 | NOT NULL                 | Account balance after this transaction                  | Non-negative decimal number                                        |
| created_at       | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the transaction was created              | ISO 8601 datetime                                                  |
| updated_at       | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the transaction record was last modified | ISO 8601 datetime                                                  |

---

## SESSION_ANALYTICS

| Attribute  | Type     | Size | Constraints              | Description                                           | Domain            |
| ---------- | -------- | ---- | ------------------------ | ----------------------------------------------------- | ----------------- |
| file_name  | String   | -    | NOT NULL                 | Filename of the analytics report                      | File name string  |
| created_at | DateTime | -    | NOT NULL, DEFAULT: now() | Timestamp when the analytics record was created       | ISO 8601 datetime |
| updated_at | DateTime | -    | NOT NULL, AUTO UPDATE    | Timestamp when the analytics record was last modified | ISO 8601 datetime |

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
- **trialing**: Subscription is in trial period
- **active_unpaid**: Subscription is active but payment is pending

---

## Notes on Data Types

- **String**: Variable-length character string
- **Integer**: Whole number (32-bit signed integer)
- **Decimal (precision, scale)**: Fixed-precision decimal number
    - First number: total number of digits
    - Second number: number of digits after decimal point
- **Boolean**: Logical value (true/false)
- **DateTime**: Date and time value (ISO 8601 format)
- **Enum**: Enumerated type with predefined values
- **JSON**: JavaScript Object Notation data structure
