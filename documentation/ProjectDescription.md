# BackTrade: Trading Backtesting Platform

**Project Specification Document**  
_Author: REICHHART Damien_  
_Date: September 26, 2025_

---

## Executive Summary

BackTrade is a deterministic multi-session historical trading simulator designed for professional
traders and quantitative analysts. The platform enables users to conduct comprehensive backtesting
sessions with real-time simulation controls, position management, and detailed performance analytics
across multiple trading instruments and timeframes.

---

## 1. Platform Overview

### Core Concept

BackTrade provides a deterministic historical trading environment where users can:

- Launch trading sessions at any historical timestamp
- Execute trades as if operating in real-time during past market conditions
- Control simulation speed, and pause.
- Run multiple concurrent sessions with different instruments and parameters
- Access comprehensive trading analytics and performance metrics

---

## 2. User Roles and Subscription Tiers

| Role          | Active Sessions | Pricing              |
| ------------- | --------------- | -------------------- |
| **Anonymous** | 0               | Free                 |
| **User**      | Up to 3         | Free                 |
| **Trader**    | Up to 10        | Monthly subscription |
| **Expert**    | Up to 30        | Monthly subscription |
| **Admin**     | Unlimited       | Internal             |

---

## 3. Core Functionality

### 3.1 Session Creation

Each user can create a session by specifying the trading instrument (e.g., XAUUSD, EURUSD),
timeframe (1m, 5m, 15m, 1h, 4h, 1d), start and end timestamps, initial account balance, leverage
multiplier, spread configuration (in ticks), slippage settings (in ticks), and commission structure
(per trade).

### 3.2 Session Execution

**Time Controls:** Play/Pause functionality, variable speed settings (0.5x, 1x, 2x, 5x, 10x)

**Trading Interface:** Interactive candlestick charts with real-time position tracking.

### 3.3 Position Management

**Order Types:** Market orders only (Buy/Sell) and position sizing in standard lots with Take Profit
(TP) levels and Stop Loss (SL) levels and Dynamic TP/SL modification

**Position Controls:** Individual position closure, Bulk position management (Close All)

### 3.4 Data Management

**Admin-Controlled Data Loading:** OHLCV data upload via CSV format and instrument/timeframe
activation.

---

## 4. Technical Limitations

- **Order Types**: Market orders only (no pending orders)
- **Execution Model**: Immediate fills only (no partial fills)
- **Data Granularity**: OHLCV-based simulation (no tick-level data)
- **Session Continuity**: Sessions pause when not actively viewed
- **Cost Structure**: Fixed spread, slippage, and commission models
- **Instrument and Timeframe Scope**: Single-instrument/timeframe sessions only
- **Data Management**: Admin-controlled data uploads and CSV format requirement for historical data

---

## 5. Future Development

### Enhanced Order Management

- Complete order stack implementation (market, limit, stop orders)
- Order-to-trade-to-position lifecycle management
- Partial fill modeling and queue simulation

### AI and Analytics Integration

- AI recommendation

### Platform Expansion

- Strategy scripting and automation
- Economic calendar integration
- Market sentiment indicators
