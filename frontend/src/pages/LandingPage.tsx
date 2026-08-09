import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Testimonials } from "@/components/landing/Testimonials";

export function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <FeatureShowcase />
      <Testimonials />
    </div>
  );
}
