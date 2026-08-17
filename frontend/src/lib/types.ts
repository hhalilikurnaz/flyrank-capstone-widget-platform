export type WidgetType = "SIGNUP" | "CTA" | "POPOVER";

export interface WidgetField {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea";
  required: boolean;
}

export interface DisplayOptions {
  position?: "bottom-right" | "bottom-left" | "center" | "inline";
  delaySeconds?: number;
  theme?: "light" | "dark";
  primaryColor?: string;
  fontFamily?: "system" | "serif" | "rounded" | "mono";
  borderRadius?: number;
  shadow?: "none" | "soft" | "medium" | "strong";
  animation?: "none" | "fade" | "slide-up" | "bounce";
}

export interface WidgetDraft {
  type: WidgetType;
  title: string;
  description: string;
  buttonText: string;
  fields: WidgetField[];
  displayOptions: Required<DisplayOptions>;
}

export interface Widget {
  id: string;
  tenantId: string;
  type: WidgetType;
  title: string;
  description: string | null;
  fields: WidgetField[];
  buttonText: string;
  displayOptions: DisplayOptions;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  widgetId: string;
  widgetTitle: string;
  data: Record<string, string>;
  country: string | null;
  city: string | null;
  createdAt: string;
}

export interface WidgetPerformance {
  widgetId: string;
  title: string;
  submissions: number;
  impressions: number;
  conversionRate: number;
}

export interface DashboardStats {
  totalSubmissions: number;
  submissionsLast24h: number;
  totalWidgets: number;
  totalImpressions: number;
  conversionRate: number;
  submissionsPerWidget: WidgetPerformance[];
  timeSeries: { date: string; count: number }[];
}

export interface GeoBreakdownEntry {
  country: string;
  count: number;
}

export type DeviceType = "DESKTOP" | "TABLET" | "MOBILE";

export interface DeviceBreakdownEntry {
  device: DeviceType;
  count: number;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
  keyPreview: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  status: number | null;
  error: string | null;
  attempts: number;
  createdAt: string;
}
