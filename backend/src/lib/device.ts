export type Device = "DESKTOP" | "TABLET" | "MOBILE";

// Deliberately simple — a full UA parser is a dependency and a maintenance
// burden neither this feature nor its accuracy requirements justify. Order
// matters: check tablet before the broader mobile pattern (iPad UAs contain
// neither "Mobile" historically, but Android tablets can).
export function detectDevice(userAgent: string | undefined | null): Device {
  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return "DESKTOP";
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return "TABLET";
  if (/mobile|iphone|ipod|android|blackberry|windows phone/.test(ua)) return "MOBILE";
  return "DESKTOP";
}
