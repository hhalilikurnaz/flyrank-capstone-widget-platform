import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";

export function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
    </div>
  );
}
