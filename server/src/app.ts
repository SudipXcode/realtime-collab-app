// import express from "express";
// import rateLimit from "express-rate-limit";
// import slowDown from "express-slow-down";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import compression from "compression";
// import { notFound } from "./core/middlewares/notFound.middleware";
// import { globalErrorHandler } from "./core/middlewares/globalError.middleware";
// import routes from "./routes";
// const app = express();

// // 1️⃣ Trust proxy
// app.set("trust proxy", 1);
// // 2️⃣ Security
// app.use(
//   helmet({
//     contentSecurityPolicy:
//       process.env.NODE_ENV === "production" ? undefined : false,
//   }),
// );

// // 3️⃣ Logging
// app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// // 4️⃣ Compression
// app.use(compression());

// // 5️⃣ CORS
// // app.use(
// //   cors({
// //     origin: (origin, callback) => {
// //       if (!origin && process.env.NODE_ENV !== "production") {
// //         return callback(null, true);
// //       }

// //       if (origin && allowedOrigins.includes(origin)) {
// //         return callback(null, true);
// //       }

// //       return callback(null, false);
// //     },
// //     credentials: true,
// //   }),
// // );
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

//       // allow mobile apps / postman
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(null, false); // ❌ DO NOT THROW ERROR
//     },
//     credentials: true,
//   })
// );
// // 6️⃣ Timeout (MOVE HERE ✅)
// app.use((req, res, next) => {
//   res.setTimeout(10000, () => {
//     res.status(408).json({ message: "Request timeout" });
//   });
//   next();
// });

// // 7️⃣ Body parsing
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// // 8️⃣ Cookies
// app.use(cookieParser());

// // 9️⃣ Health route BEFORE limiter ✅
// app.get("/health", (_, res) => {
//   res.status(200).json({
//     status: "ok",
//     uptime: process.uptime(),
//   });
// });

// const speedLimiter = slowDown({
//   windowMs: 15 * 60 * 1000, // 15 min
//   delayAfter: 5, // allow first 5 requests
//   delayMs: () => 500, // +500ms each extra request
//   maxDelayMs: 5000,
// });
// // 🔟 Rate limiting ONLY for API ✅
// // const limiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 5,
// //   standardHeaders: true,
// //   legacyHeaders: false,
// // });

// app.use("/api", speedLimiter);
// app.use("/api", routes);
// app.use(notFound);
// app.use(globalErrorHandler);
// export default app;
import express from "express";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { notFound } from "./core/middlewares/notFound.middleware";
import { globalErrorHandler } from "./core/middlewares/globalError.middleware";
import routes from "./routes";

const app = express();

// 1️⃣ Trust proxy (required on Railway)
app.set("trust proxy", 1);

// 2️⃣ Security headers
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);

// 3️⃣ Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// 4️⃣ Compression
app.use(compression());

// 5️⃣ CORS
// ✅ The browser now calls your Next.js domain (/api/...) which proxies to this backend.
// So the "origin" the backend sees is your Next.js frontend URL (server-to-server from
// Next.js rewrites has no origin, or the browser's origin when using client-side fetch).
// Allow your frontend origin and no-origin (server-to-server) requests.
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);

      // No origin = server-to-server (Next.js rewrite / middleware proxy) ✅
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Reject everything else
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// 6️⃣ Request timeout
app.use((req, res, next) => {
  res.setTimeout(10000, () => {
    res.status(408).json({ message: "Request timeout" });
  });
  next();
});

// 7️⃣ Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 8️⃣ Cookie parsing
app.use(cookieParser());

// 9️⃣ Health check (before rate limiter)
app.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

// 🔟 Rate limiting / slow-down for API routes
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: () => 500,
  maxDelayMs: 5000,
});

app.use("/api", speedLimiter);
app.use("/api", routes);

// Error handling
app.use(notFound);
app.use(globalErrorHandler);

export default app;