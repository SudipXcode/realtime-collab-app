import "dotenv/config"; // 🔥 MUST BE FIRST

import app from "./app";
import { ENV } from "./config/env";
import { connectPostgres } from "./config/db/postgres";
import { setupShutdown } from "./shutdown";


process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

async function start() {
  try {
    await connectPostgres();
    console.log("✅ Postgres connected");

    const server = app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
    });

    server.on("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });

    setupShutdown(server);
  } catch (err) {
    console.error("❌ Startup failed", err);
    process.exit(1);
  }
}

start();
