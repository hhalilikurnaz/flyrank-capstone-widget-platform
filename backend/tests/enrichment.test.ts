import { describe, expect, it } from "vitest";
import { enrichIp } from "@/modules/enrichment/enrich";
import { alwaysDownProvider, alwaysUpProvider, makeToggleableProvider } from "@/modules/enrichment/providers/mock";

describe("geo enrichment fallback chain", () => {
  it("falls back to the second provider when the first is down", async () => {
    const result = await enrichIp("1.2.3.4", [alwaysDownProvider, alwaysUpProvider]);
    expect(result).toEqual({ country: "Turkiye", city: "Istanbul" });
  });

  it("degrades to null geo when every provider fails — never throws", async () => {
    const result = await enrichIp("1.2.3.4", [alwaysDownProvider, alwaysDownProvider]);
    expect(result).toEqual({ country: null, city: null });
  });

  it("recovers once a toggled provider comes back up", async () => {
    const { provider, setUp } = makeToggleableProvider("toggle");

    setUp(false);
    const down = await enrichIp("1.2.3.4", [provider]);
    expect(down).toEqual({ country: null, city: null });

    setUp(true);
    const up = await enrichIp("1.2.3.4", [provider]);
    expect(up).toEqual({ country: "Turkiye", city: "Istanbul" });
  });
});
