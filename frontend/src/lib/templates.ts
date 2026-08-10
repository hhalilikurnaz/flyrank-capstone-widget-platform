import { Calendar, Crown, Gift, Handshake, Mail, MessageSquare, Timer, Users } from "lucide-react";
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
  fontFamily: "system" as const,
  borderRadius: 12,
  shadow: "medium" as const,
  animation: "fade" as const,
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
    description: "Grow an email list with a simple signup.",
    icon: Mail,
    draft: {
      type: "SIGNUP",
      title: "Join our newsletter",
      description: "Get product updates and tips once a week. No spam.",
      buttonText: "Subscribe",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      displayOptions: { ...baseDisplayOptions, position: "bottom-right" },
    },
  },
  {
    id: "discount",
    name: "Discount offer",
    description: "A CTA popup offering a discount on the first purchase.",
    icon: Gift,
    draft: {
      type: "CTA",
      title: "Get 10% off your first order",
      description: "Sign up and we'll email you a code right away.",
      buttonText: "Claim my discount",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      displayOptions: { ...baseDisplayOptions, position: "bottom-right", primaryColor: "#e34948", animation: "bounce", borderRadius: 16 },
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
      description: "We're launching soon. Join the waitlist to be first in line.",
      buttonText: "Join waitlist",
      fields: [
        { name: "email", label: "Email", type: "email", required: true },
        { name: "name", label: "Name", type: "text", required: false },
      ],
      displayOptions: { ...baseDisplayOptions, position: "center", primaryColor: "#1baf7a", fontFamily: "rounded", borderRadius: 20 },
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
      description: "Questions, bugs, feedback: we read everything.",
      buttonText: "Send message",
      fields: [
        { name: "email", label: "Email", type: "email", required: true },
        { name: "message", label: "Message", type: "textarea", required: true },
      ],
      displayOptions: { ...baseDisplayOptions, position: "inline", borderRadius: 8, shadow: "none" },
    },
  },
  {
    id: "exit-intent",
    name: "Exit intent popover",
    description: "A final chance offer shown after a short delay.",
    icon: Timer,
    draft: {
      type: "POPOVER",
      title: "Before you go...",
      description: "Here's 15% off if you complete your order today.",
      buttonText: "Get my code",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      displayOptions: { ...baseDisplayOptions, position: "center", delaySeconds: 8, primaryColor: "#eda100", shadow: "strong", animation: "slide-up" },
    },
  },
  {
    id: "rsvp",
    name: "Event RSVP",
    description: "Collect RSVPs for a webinar or an in person event.",
    icon: Calendar,
    draft: {
      type: "SIGNUP",
      title: "Save your seat",
      description: "Limited spots. Reserve yours now.",
      buttonText: "RSVP",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
      ],
      displayOptions: { ...baseDisplayOptions, position: "bottom-left", primaryColor: "#4a3aa7", fontFamily: "serif" },
    },
  },
  {
    id: "referral",
    name: "Referral rewards",
    description: "Turn happy customers into your best acquisition channel.",
    icon: Handshake,
    draft: {
      type: "CTA",
      title: "Give 10 dollars, get 10 dollars",
      description: "Invite a friend. When they order, you both get rewarded.",
      buttonText: "Send my invite link",
      fields: [{ name: "email", label: "Friend's email", type: "email", required: true }],
      displayOptions: {
        ...baseDisplayOptions,
        position: "bottom-right",
        primaryColor: "#e34ca0",
        fontFamily: "rounded",
        borderRadius: 22,
        shadow: "strong",
        animation: "bounce",
      },
    },
  },
  {
    id: "vip-access",
    name: "VIP early access",
    description: "A dark, elevated invite for your best customers.",
    icon: Crown,
    draft: {
      type: "POPOVER",
      title: "You are invited",
      description: "Exclusive early access, reserved for our most loyal customers.",
      buttonText: "Claim my invite",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
      ],
      displayOptions: {
        ...baseDisplayOptions,
        position: "center",
        theme: "dark",
        primaryColor: "#eda100",
        fontFamily: "serif",
        borderRadius: 14,
        shadow: "strong",
        animation: "slide-up",
      },
    },
  },
];
