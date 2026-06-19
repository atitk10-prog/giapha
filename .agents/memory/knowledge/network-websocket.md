# Network & WebSocket Architecture

## WebSocket Connection Management
- **Spam Prevention (Rate Limiting)**: Polling `new WebSocket()` continuously when connections drop leads to immediate IP bans from exchanges. Always implement a Manager pattern (`BaseWsClient`).
- **Exponential Backoff**: Implement progressive delay (e.g., 3s -> 4.5s -> 6.7s up to 30s) on connection loss.
- **Chunking Subscriptions**: Batch subscription requests (e.g., 50 symbols per chunk every 200ms) to avoid hitting frame rate limits.

## State Management in WebSockets
- **Stale Closures**: WebSocket `onmessage` callbacks easily trap outdated React state (Stale Closure). Rely on mutable global stores, refs, or pass down state references to ensure callbacks access the latest data arrays.
- **Cleanup and Memory Leaks**: Close sockets and unsubscribe when components unmount. When switching between different exchanges (Binance, Bybit, OKX), use a centralized `TickerConnectionManager` to gracefully terminate previous connections and prevent background memory leaks.
