// Bump on any breaking change to the embed script's public behavior. The
// version is baked into the served filename (widget.<version>.js), which is
// the cache-busting mechanism: old cached clients keep working, new
// installs get the new file, and Cache-Control can be `immutable`.
export const WIDGET_SDK_VERSION = "v1";
