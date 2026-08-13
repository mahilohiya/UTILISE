import pino from "pino";

// Pretty-printed, colorized logs in development; plain JSON in production
// (the shape logging platforms like Vercel/Datadog/CloudWatch expect).
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
      : undefined,
});
