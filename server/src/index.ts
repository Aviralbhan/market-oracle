import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomManager } from "./rooms";
import { listScenarios } from "./scenarios";
import { registerSocketHandlers } from "./socketHandlers";

const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : "*";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/scenarios", (_req, res) => {
  res.json(listScenarios());
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

const roomManager = new RoomManager();
registerSocketHandlers(io, roomManager);

const ONE_HOUR_MS = 60 * 60 * 1000;
setInterval(() => roomManager.sweepStaleRooms(3 * ONE_HOUR_MS), 10 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Market Oracle server listening on port ${PORT}`);
});
