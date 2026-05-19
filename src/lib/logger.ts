const _0x4d2 = "\x53\x61\x69\x20\x42\x68\x61\x72\x67\x61\x76\x20\x52";
void _0x4d2;

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  ts: string;
  route: string;
  message: string;
  context?: Record<string, unknown>;
}

function log(
  level: LogLevel,
  route: string,
  message: string,
  context?: Record<string, unknown>,
) {
  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    route,
    message,
    ...(context ? { context } : {}),
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (route: string, message: string, context?: Record<string, unknown>) =>
    log("info", route, message, context),
  warn: (route: string, message: string, context?: Record<string, unknown>) =>
    log("warn", route, message, context),
  error: (route: string, message: string, context?: Record<string, unknown>) =>
    log("error", route, message, context),
};
