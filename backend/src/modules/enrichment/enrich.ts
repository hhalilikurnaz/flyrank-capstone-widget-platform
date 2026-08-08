import { logger } from "@/lib/logger";
import { ipApiProvider } from "./providers/ipApi";
import { ipapiCoProvider } from "./providers/ipapiCo";
import type { GeoProvider, GeoResult } from "./types";

const defaultChain: GeoProvider[] = [ipApiProvider, ipapiCoProvider];

const NULL_GEO: GeoResult = { country: null, city: null };

/**
 * Tries each provider in order; the first successful lookup wins. If every
 * provider fails or times out, resolves to { country: null, city: null } —
 * enrichment degrades, it never throws, so it can never fail a submission.
 */
export async function enrichIp(ip: string, providers: GeoProvider[] = defaultChain): Promise<GeoResult> {
  for (const provider of providers) {
    try {
      return await provider.lookup(ip);
    } catch (err) {
      logger.warn("Geo provider failed, trying next in chain", {
        provider: provider.name,
        ip,
        error: (err as Error)?.message,
      });
    }
  }

  logger.warn("All geo providers failed; storing submission without geo data", { ip });
  return NULL_GEO;
}
