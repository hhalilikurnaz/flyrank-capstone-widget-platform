import { env } from "@/lib/env";
import type { GeoProvider } from "../types";

interface IpApiResponse {
  status: "success" | "fail";
  country?: string;
  city?: string;
  message?: string;
}

// ip-api.com — free, no API key, 45 requests/min. https://ip-api.com/docs
export const ipApiProvider: GeoProvider = {
  name: "ip-api.com",
  async lookup(ip: string) {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city`, {
      signal: AbortSignal.timeout(env.GEO_PROVIDER_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`ip-api.com responded with ${res.status}`);
    }
    const body = (await res.json()) as IpApiResponse;
    if (body.status !== "success") {
      throw new Error(body.message ?? "ip-api.com lookup failed");
    }
    return { country: body.country ?? null, city: body.city ?? null };
  },
};
