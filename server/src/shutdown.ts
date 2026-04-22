import { disconnectPostgres } from "./config/db/postgres";

import { Server } from "http";

export function setupShutdown(server: Server) {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`🛑 ${signal} received`);

    const forceExit = setTimeout(() => {
      console.error("❌ Force exit");
      process.exit(1);
    }, 10_000);

    server.close(async () => {
      try {
        await disconnectPostgres();
      } catch (err) {
        console.error("DB disconnect failed:", err);
      }

      console.log("✅ Clean shutdown");
      clearTimeout(forceExit);
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
