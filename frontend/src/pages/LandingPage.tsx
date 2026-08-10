import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

// Deliberately does NOT auto-redirect an authenticated visitor away —
// forcing a navigation away from a page someone chose to view (e.g. typed
// "/" to see the marketing site again) is a surprising pattern. Instead
// every CTA on this page (Navbar, Hero, final CTA) is auth-aware and points
// straight at /dashboard when logged in.
export function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <FeatureShowcase />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
