import { env } from "@/lib/env";
import type { GeoProvider } from "../types";

interface IpapiCoResponse {
  country_name?: string;
  city?: string;
  error?: boolean;
  reason?: string;
}

// ipapi.co — free tier, ~1,000 lookups/day, no API key. https://ipapi.co/api/
export const ipapiCoProvider: GeoProvider = {
  name: "ipapi.co",
  async lookup(ip: string) {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(env.GEO_PROVIDER_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`ipapi.co responded with ${res.status}`);
    }
    const body = (await res.json()) as IpapiCoResponse;
    if (body.error) {
      throw new Error(body.reason ?? "ipapi.co lookup failed");
    }
    return { country: body.country_name ?? null, city: body.city ?? null };
  },
};
