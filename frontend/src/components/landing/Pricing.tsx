import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

// Demo pricing only — no real billing/payment is wired up. Plan names match
// what a future Billing page will use, so the two feel like one product.
const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For side projects and testing the waters.",
    features: ["1 active widget", "500 submissions / mo", "Community support", "All templates"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "For teams running real lead-gen campaigns.",
    features: ["Unlimited widgets", "50,000 submissions / mo", "Priority support", "Custom branding", "Webhook integrations"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with compliance & scale needs.",
    features: ["Unlimited everything", "SSO & team roles", "Dedicated support", "Custom SLA"],
    cta: "Contact sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Simple pricing, no surprises
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`flex flex-col rounded-2xl border p-7 ${
                plan.highlighted ? "border-indigo-500 bg-indigo-950 text-white shadow-xl" : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-indigo-500 px-2.5 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <p className={`text-sm font-medium ${plan.highlighted ? "text-indigo-200" : "text-slate-500"}`}>{plan.name}</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-indigo-200" : "text-slate-500"}`}>{plan.period}</span>
              </p>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-indigo-200" : "text-slate-500"}`}>{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-indigo-300" : "text-indigo-500"}`} />
                    <span className={plan.highlighted ? "text-indigo-100" : "text-slate-600"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`mt-7 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted ? "bg-white text-indigo-950 hover:bg-indigo-50" : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
