# Market Oracle

A real-time multiplayer portfolio allocation game. Players join a room, live through a historic market scenario one turning point at a time, and at each one choose how to split their money between Equity and Debt — then see who comes out ahead.

Live demo: [market-oracle-sigma.vercel.app](https://market-oracle-sigma.vercel.app)

> Note: the backend runs on Render's free tier and spins down after 15 minutes of inactivity — the first request after a period of idle time can take ~50s to wake it back up.

## Problem / What It Does

Most portfolio simulation demos are single-player and trust the client for game state. Market Oracle is built server-authoritative and multiplayer instead:

- A room's snapshots, timers, and allocation returns are all decided on the server — clients only render what the server sends and request allocation changes, they never compute returns or balances themselves.
- Players join a room by 6-character code or by scanning a QR code generated client-side from the room's join URL.
- At each snapshot in the scenario (a real historical turning point, e.g. "Sep 2008 — Lehman Brothers Falls"), players have a timed window to set their Equity/Debt split before the next period's return is applied to their portfolio.
- If a player's connection drops mid-round (tab closed, phone locked, wifi hiccup), rejoining within a 2-minute grace window restores their exact portfolio value, allocation, index chart history, and the live countdown — resynced from the server's clock, not resumed from a stale local timer. This is the core technical problem the project is built around: **timer-drift-safe reconnection** in a real-time multiplayer session.

## Tech Stack

- **Server**: Node.js, TypeScript, Express, Socket.io — in-memory authoritative game engine, no database (rooms are ephemeral game sessions)
- **Client**: React, TypeScript, Vite, React Router, Recharts, `qrcode.react`, `socket.io-client`
- **Data**: Each scenario's snapshots (`server/src/scenarios/data.ts`) are hand-authored around real historical events, with illustrative equity/debt returns shaped after publicly documented drawdown/recovery magnitudes for each period — not scraped or licensed market data, so the dataset is original.

## Screenshots

_Add screenshots or a short GIF here: Lobby with QR code, a live Game screen showing the narrative card + allocation slider + index chart, and the Results leaderboard._

## Project Structure

```text
market-oracle/
├── server/
│   └── src/
│       ├── index.ts          Express + Socket.io bootstrap
│       ├── rooms.ts          RoomManager: room codes, players, disconnect grace period
│       ├── gameEngine.ts     Authoritative snapshot loop, allocation returns, snapshots
│       ├── socketHandlers.ts Socket event wiring (create/join/rejoin/set-allocation/start)
│       └── scenarios/        Hand-authored scenario data + loader
├── client/
│   └── src/
│       ├── pages/            Home, Lobby, Game, Results
│       ├── components/       Timer, NarrativeCard, AllocationSlider, IndexChart, Leaderboard, QRCodeBlock, ...
│       └── hooks/useRoom.tsx Socket connection, rejoin-on-connect, room state context
└── render.yaml
```

## Run Locally

Requires Node.js 20+.

Server:

```bash
cd server
npm install
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

Deployed as: [market-oracle-sigma.vercel.app](https://market-oracle-sigma.vercel.app) (client) → `https://market-oracle-pof8.onrender.com` (server).

**Server → Render**: use Render's plain **New Web Service** flow (not **Blueprint** — Blueprints can prompt for a card even for a free-tier service). Root Directory `server`, Language `Node`, Build Command `npm install && npm run build`, Start Command `npm start`, Instance Type `Free`. Set the `CLIENT_ORIGIN` env var to your deployed client URL (comma-separate multiple origins if needed).

**Client → Vercel**: `vercel link` the `client/` directory, set env var `VITE_SERVER_URL` to your deployed Render backend URL (`vercel env add VITE_SERVER_URL production`), then `vercel --prod`. Redeploy the server afterward with `CLIENT_ORIGIN` pointing at the final Vercel URL so CORS allows it.

## Game Mechanics

- Each room picks one of three scenarios at creation; each scenario is ~7 real-event snapshots (e.g. "Lehman Brothers Falls", "Vaccine Rally").
- At every snapshot except the last, players get a timed window (20s) to set their Equity/Debt split via a slider — 100% equity is the most volatile, 100% debt is the steadiest, or anywhere in between.
- When the window closes, the server applies that period's equity/debt returns to each player's portfolio based on the split they had set, server-side and independent of what the client claims.
- Final ranking is by total portfolio value when the last snapshot resolves.
