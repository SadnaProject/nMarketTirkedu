import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";
import { createTRPCContext } from "../communication/trpc";
import { appRouter } from "../communication/root";

const dev = process.env.NODE_ENV !== "production";

const wss = new ws.Server({
  port: 3001,
});
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createTRPCContext,
});

if (dev) {
  wss.on("connection", (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once("close", () => {
      console.log(`➖➖ Connection (${wss.clients.size})`);
    });
  });
}

console.log("✅ WebSocket Server listening on ws://localhost:3001");

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
