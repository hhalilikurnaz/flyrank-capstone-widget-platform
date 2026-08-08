type LogFields = Record<string, unknown>;

function line(level: string, message: string, fields?: LogFields) {
  // Spread fields first so a field named e.g. "message" or "level" (common
  // when logging an error's own .message) can never clobber these three.
  const payload = { ...fields, level, message, time: new Date().toISOString() };
  const out = level === "error" ? console.error : console.log;
  out(JSON.stringify(payload));
}

export const logger = {
  info: (message: string, fields?: LogFields) => line("info", message, fields),
  warn: (message: string, fields?: LogFields) => line("warn", message, fields),
  error: (message: string, fields?: LogFields) => line("error", message, fields),
};
