export const en = {
  nav: {
    features: "Features",
    templates: "Templates",
    faq: "FAQ",
    signIn: "Sign in",
    startFree: "Start free",
    goToDashboard: "Go to dashboard",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    badge: "Lead capture, fully embeddable",
    titleStart: "Turn any website into a",
    titleHighlight: "lead capture machine",
    subtitle:
      "Design a widget, copy one line of code, and start collecting signups. Validated, spam filtered, and dashboarded automatically. No engineering team required.",
    ctaGuest: "Start building free",
    ctaAuthed: "Go to dashboard",
    browseTemplates: "Browse templates",
    noCard: "No credit card required. Free forever plan.",
  },
  features: {
    eyebrow: "Everything you need",
    title: "A complete lead capture toolkit",
    items: {
      builder: {
        eyebrow: "Widget builder",
        title: "Customize every pixel, see it live",
        description:
          "Font, radius, shadow, brand color, entrance animation, and position: every change updates a real, pixel accurate preview instantly, on desktop, tablet, and mobile.",
      },
      templates: {
        eyebrow: "Template marketplace",
        title: "Start from a proven layout",
        description:
          "Newsletter signups, discount CTAs, exit intent popovers, event RSVPs: every template card is a live render, not a screenshot, so what you pick is exactly what you get.",
      },
      analytics: {
        eyebrow: "Analytics",
        title: "Know what's actually converting",
        description:
          "Submissions over time, per widget performance, and device breakdown from real traffic, all in a dashboard that updates the moment a visitor submits.",
      },
      reliability: {
        eyebrow: "Built for the open internet",
        title: "Hardened against the traffic you don't control",
        description:
          "Your embed runs on sites you don't own. Every submission is validated, rate limited, checked for spam, and enriched, with graceful degradation at every step.",
      },
    },
    reliabilityList: {
      cors: "CORS and preflight handled correctly",
      rateLimit: "Rate limiting per IP and per widget",
      honeypot: "Honeypot spam protection",
      geo: "IP to geo fallback chain that never fails",
    },
  },
  howItWorks: {
    eyebrow: "From zero to live",
    title: "Three steps, no engineering required",
    steps: {
      design: {
        title: "Design your widget",
        description: "Pick a template or start blank. Set the copy, the fields, the color, and the font. The preview updates live.",
      },
      copy: {
        title: "Copy one line of code",
        description: "Every widget gets a single script tag. No build step, no package to install, no iframe to configure.",
      },
      live: {
        title: "It's live on your site",
        description: "Paste the snippet anywhere in your HTML. The widget renders with the exact styling you configured, nothing more to do.",
      },
    },
    copySnippet: "Copy snippet",
    copied: "Copied",
  },
  testimonials: {
    title: "Loved by teams shipping fast",
    quotes: {
      rivera: {
        quote:
          "We had a working signup widget on our marketing site in under ten minutes. The embed script just worked, no build step, no iframe headaches.",
        name: "A. Rivera",
        role: "Founder, indie SaaS",
      },
      novak: {
        quote:
          "The rate limiting and honeypot caught a bot flood on day one that would've buried our old form in junk leads.",
        name: "J. Novak",
        role: "Growth engineer",
      },
      osei: {
        quote:
          "Being able to see exactly how the widget looks, font, radius, shadow, before publishing saved us from three rounds of design tweaks.",
        name: "P. Osei",
        role: "Product designer",
      },
    },
  },
  faq: {
    title: "Frequently asked questions",
    items: {
      anySite: {
        q: "Does this work on any website?",
        a: "Yes. The embed is a single script tag with zero dependencies. It works on any HTML page regardless of what it's built with, since your visitors' browser is a completely different origin than our API.",
      },
      spam: {
        q: "What happens if someone spams the form?",
        a: "Every submission passes through rate limiting (per IP and per widget) and a honeypot check before it ever touches the database. Bots get a convincing looking success response but nothing gets stored.",
      },
      geoDown: {
        q: "What if the geolocation provider goes down?",
        a: "We try a primary provider, then a fallback, and if both fail the submission is still stored, just without location data. A dependency going down never loses a lead.",
      },
      customize: {
        q: "Can I customize how the widget looks?",
        a: "Font, corner radius, shadow, brand color, entrance animation, and position, all from the builder, with a live preview that matches exactly what ships.",
      },
      free: {
        q: "Is there a free plan?",
        a: "Yes. Starter is free forever for one active widget and 500 submissions a month.",
      },
    },
  },
  cta: {
    titleAuthed: "Jump back into your dashboard",
    titleGuest: "Ship your first widget in the next five minutes",
    subtitleAuthed: "Your widgets and analytics are right where you left them.",
    subtitleGuest: "Free forever plan. No credit card required.",
    ctaAuthed: "Go to dashboard",
    ctaGuest: "Start building free",
  },
  footer: {
    tagline: "Embeddable widgets and lead capture, built for the open internet.",
    product: "Product",
    account: "Account",
    createAccount: "Create account",
    copyright: (year: number) => `© ${year} Widget Platform. Built as a FlyRank Backend Track capstone project.`,
  },
  auth: {
    brand: "Widget Platform",
    login: {
      subtitle: "Sign in to manage your widgets",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      submitting: "Signing in...",
      noAccount: "No account yet?",
      createOne: "Create one",
    },
    register: {
      subtitle: "Create your account",
      name: "Name",
      email: "Email",
      password: "Password",
      passwordHint: "At least 8 characters.",
      submit: "Create account",
      submitting: "Creating account...",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
    },
  },
};

export type Dictionary = typeof en;
