type LogFields = Record<string, unknown>;

function line(level: string, message: string, fields?: LogFields) {
  const payload = { level, message, time: new Date().toISOString(), ...fields };
  const out = level === "error" ? console.error : console.log;
  out(JSON.stringify(payload));
}

export const logger = {
  info: (message: string, fields?: LogFields) => line("info", message, fields),
  warn: (message: string, fields?: LogFields) => line("warn", message, fields),
  error: (message: string, fields?: LogFields) => line("error", message, fields),
};
