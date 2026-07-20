# Market Oracle

A real-time multiplayer investment simulation game. Players join a room, race the clock through a historic market scenario (2008 crash, dot-com bubble, COVID crash), and compete to grow a $100,000 starting portfolio the most before the round ends.

Live demo: _add your deployed URL here after deploying_

## Problem / What It Does

Most portfolio "trading game" demos are single-player and trust the client for game state. Market Oracle is built server-authoritative and multiplayer instead:

- A room's price ticks, timers, and trades are all decided on the server — clients only render what the server sends and request trades, they never compute prices or balances themselves.
- Players join a room by 6-character code or by scanning a QR code generated client-side from the room's join URL.
- If a player's connection drops mid-round (tab closed, phone locked, wifi hiccup), rejoining within a 2-minute grace window restores their exact portfolio, trade history chart, and the live countdown — resynced from the server's clock, not resumed from a stale local timer. This is the core technical problem the project is built around: **timer-drift-safe reconnection** in a real-time multiplayer session.

## Tech Stack

- **Server**: Node.js, TypeScript, Express, Socket.io — in-memory authoritative game engine, no database (rooms are ephemeral game sessions)
- **Client**: React, TypeScript, Vite, React Router, Recharts, `qrcode.react`, `socket.io-client`
- **Data**: Scenario price series are generated programmatically (`server/scripts/generateScenarios.ts`) from publicly documented drawdown/recovery magnitudes for each historical period — not scraped or licensed market data, so the dataset is original.

## Screenshots

_Add screenshots or a short GIF here: Lobby with QR code, live Game screen with chart + trade panel, and the Results leaderboard._

## Project Structure

```text
market-oracle/
├── server/
│   ├── src/
│   │   ├── index.ts          Express + Socket.io bootstrap
│   │   ├── rooms.ts          RoomManager: room codes, players, disconnect grace period
│   │   ├── gameEngine.ts     Authoritative tick loop, trade validation, snapshots
│   │   ├── socketHandlers.ts Socket event wiring (create/join/rejoin/trade/start)
│   │   └── scenarios/        Generated scenario JSON + loader
│   └── scripts/generateScenarios.ts
├── client/
│   └── src/
│       ├── pages/            Home, Lobby, Game, Results
│       ├── components/       Timer, PriceChart, TradePanel, Leaderboard, QRCodeBlock, ...
│       └── hooks/useRoom.tsx Socket connection, rejoin-on-connect, room state context
└── render.yaml
```

## Run Locally

Requires Node.js 20+.

Server:

```bash
cd server
npm install
npm run gen:scenarios   # only needed if src/scenarios/*.json is missing
npm run dev
```

Client (in a second terminal):

```bash
cd client
npm install
npm run dev
```

- Server: `http://localhost:4000` (health check at `/health`, scenario list at `/api/scenarios`)
- Client: `http://localhost:5180` (set intentionally away from Vite's default 5173 to avoid clashing with other local projects)

Open the client URL in two browser tabs/devices to play as two players — host creates a room, the second player joins with the room code or by scanning the lobby's QR code.

## Deploying

**Server → Render**: connect this repo, Render will pick up `render.yaml` (`rootDir: server`). Set the `CLIENT_ORIGIN` env var to your deployed client URL (comma-separate multiple origins if needed) once you know it.

**Client → Vercel**: import the repo, set the project root to `client/`, and set env var `VITE_SERVER_URL` to your deployed Render backend URL. Redeploy the server afterward with `CLIENT_ORIGIN` pointing at the final Vercel URL so CORS allows it.

## Game Mechanics

- Each room picks one of three scenarios at creation; the server ticks through ~24-28 rounds (a few seconds each) advancing the scenario's price series.
- Trades are market orders (buy/sell at the current tick's price), validated server-side against real-time cash/holdings — the client UI only disables obviously-invalid trades as a convenience, the server is the actual source of truth.
- Final ranking is by total portfolio value (cash + holdings at the last tick's prices) when the scenario ends.
