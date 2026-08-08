import { createApp } from "@/app";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Backend listening on http://localhost:${env.PORT}`, { env: env.NODE_ENV });
});
