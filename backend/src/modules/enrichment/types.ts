export interface GeoResult {
  country: string | null;
  city: string | null;
}

export interface GeoProvider {
  name: string;
  lookup(ip: string): Promise<GeoResult>;
}
