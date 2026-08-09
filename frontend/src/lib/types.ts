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

export interface DashboardStats {
  totalSubmissions: number;
  submissionsLast24h: number;
  totalWidgets: number;
  submissionsPerWidget: { widgetId: string; title: string; count: number }[];
  timeSeries: { date: string; count: number }[];
}

export interface GeoBreakdownEntry {
  country: string;
  count: number;
}
