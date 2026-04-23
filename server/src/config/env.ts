import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}

// simple helper (safe + predictable)
const toMs = (value: string): number => {
  const num = parseInt(value, 10);

  if (value.endsWith("m")) return num * 60 * 1000;
  if (value.endsWith("h")) return num * 60 * 60 * 1000;
  if (value.endsWith("d")) return num * 24 * 60 * 60 * 1000;

  // fallback: seconds
  return num * 1000;
};

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL: process.env.DATABASE_URL!,

  ACCESS_TOKEN_SECRET: required("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),

  // JWT → string (jsonwebtoken understands "15m", "30d")
  ACCESS_TOKEN_EXPIRES_IN: required("ACCESS_TOKEN_EXPIRES_IN") as string,
  REFRESH_TOKEN_EXPIRES_IN: required("REFRESH_TOKEN_EXPIRES_IN") as string,

  // Cookies → number (milliseconds)
  ACCESS_TOKEN_COOKIE_MAX_AGE: toMs(required("ACCESS_TOKEN_EXPIRES_IN")),
  REFRESH_TOKEN_COOKIE_MAX_AGE: toMs(required("REFRESH_TOKEN_EXPIRES_IN")),
} as const;

