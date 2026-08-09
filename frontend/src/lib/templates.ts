import { Calendar, Gift, Mail, MessageSquare, Timer, Users } from "lucide-react";
import type { WidgetDraft } from "./types";

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof Mail;
  draft: WidgetDraft;
}

const baseDisplayOptions = {
  position: "bottom-right" as const,
  delaySeconds: 0,
  theme: "light" as const,
  primaryColor: "#4f46e5",
};

export const blankTemplate: WidgetTemplate = {
  id: "blank",
  name: "Start from blank",
  description: "A single email field, no styling opinions.",
  icon: Mail,
  draft: {
    type: "SIGNUP",
    title: "",
    description: "",
    buttonText: "Submit",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
    displayOptions: baseDisplayOptions,
  },
};

export const widgetTemplates: WidgetTemplate[] = [
  {
    id: "newsletter",
    name: "Newsletter signup",
    description: "Grow an email list with a simple opt-in.",
    icon: Mail,
    draft: {
      type: "SIGNUP",
      title: "Join our newsletter",
      description: "Get product updates and tips, once a week — no spam.",
      buttonText: "Subscribe",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      displayOptions: { ...baseDisplayOptions, position: "bottom-right" },
    },
  },
  {
    id: "discount",
    name: "Discount offer",
    description: "A CTA popup offering a first-purchase discount.",
    icon: Gift,
    draft: {
      type: "CTA",
      title: "Get 10% off your first order",
      description: "Sign up and we'll email you a code right away.",
      buttonText: "Claim my discount",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      displayOptions: { ...baseDisplayOptions, position: "bottom-right", primaryColor: "#e34948" },
    },
  },
  {
    id: "waitlist",
    name: "Early access waitlist",
    description: "Collect signups for a product that isn't live yet.",
    icon: Users,
    draft: {
      type: "SIGNUP",
      title: "Get early access",
      description: "We're launching soon — join the waitlist to be first in line.",
      buttonText: "Join waitlist",
      fields: [
        { name: "email", label: "Email", type: "email", required: true },
        { name: "name", label: "Name", type: "text", required: false },
      ],
      displayOptions: { ...baseDisplayOptions, position: "center", primaryColor: "#1baf7a" },
    },
  },
  {
    id: "contact",
    name: "Contact / feedback",
    description: "A short form for questions or feedback.",
    icon: MessageSquare,
    draft: {
      type: "SIGNUP",
      title: "Talk to us",
      description: "Questions, bugs, feedback — we read everything.",
      buttonText: "Send message",
      fields: [
        { name: "email", label: "Email", type: "email", required: true },
        { name: "message", label: "Message", type: "textarea", required: true },
      ],
      displayOptions: { ...baseDisplayOptions, position: "inline" },
    },
  },
  {
    id: "exit-intent",
    name: "Exit-intent popover",
    description: "A last-chance offer shown after a short delay.",
    icon: Timer,
    draft: {
      type: "POPOVER",
      title: "Before you go...",
      description: "Here's 15% off if you complete your order today.",
      buttonText: "Get my code",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      displayOptions: { ...baseDisplayOptions, position: "center", delaySeconds: 8, primaryColor: "#eda100" },
    },
  },
  {
    id: "rsvp",
    name: "Event RSVP",
    description: "Collect RSVPs for a webinar or in-person event.",
    icon: Calendar,
    draft: {
      type: "SIGNUP",
      title: "Save your seat",
      description: "Limited spots — reserve yours now.",
      buttonText: "RSVP",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
      ],
      displayOptions: { ...baseDisplayOptions, position: "bottom-left", primaryColor: "#4a3aa7" },
    },
  },
];
