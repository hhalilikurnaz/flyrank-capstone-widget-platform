import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@widget-platform.local";
const DEMO_PASSWORD = "demo12345";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const tenant = await prisma.tenant.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { name: "Acme Bakery", email: DEMO_EMAIL, passwordHash },
  });

  const newsletter = await prisma.widget.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: tenant.id,
      type: "SIGNUP",
      title: "Get 10% off your first order",
      description: "Join our list for exclusive deals",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      buttonText: "Sign me up",
      displayOptions: { position: "bottom-right", theme: "light" },
    },
  });

  const cta = await prisma.widget.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      tenantId: tenant.id,
      type: "CTA",
      title: "Free delivery this week",
      fields: [{ name: "email", label: "Email", type: "email", required: true }],
      buttonText: "Claim offer",
      displayOptions: { position: "bottom-left", theme: "light" },
    },
  });

  const existing = await prisma.submission.count({ where: { tenantId: tenant.id } });
  if (existing === 0) {
    const sampleGeo = [
      { ip: "8.8.8.8", country: "United States", city: "Ashburn" },
      { ip: "1.1.1.1", country: "Australia", city: "South Brisbane" },
      { ip: "9.9.9.9", country: "United States", city: "Berkeley" },
    ];
    const widgets = [newsletter, cta];
    const now = Date.now();
    const rows = Array.from({ length: 18 }).map((_, i) => {
      const widget = widgets[i % widgets.length]!;
      const geo = sampleGeo[i % sampleGeo.length]!;
      const daysAgo = Math.floor(i / 2);
      return {
        widgetId: widget.id,
        tenantId: tenant.id,
        data: { email: `visitor${i}@example.com` },
        ip: geo.ip,
        country: geo.country,
        city: geo.city,
        createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
      };
    });
    await prisma.submission.createMany({ data: rows });
  }

  console.log("Seeded demo data:");
  console.log(`  Tenant login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Widgets: "${newsletter.title}" (${newsletter.id}), "${cta.title}" (${cta.id})`);
  console.log(`  Submissions: ${existing === 0 ? 18 : existing} (already seeded: ${existing > 0})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
