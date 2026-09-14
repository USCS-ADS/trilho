import { CtaSection } from "./cta-section";
import { DifferentiatorsSection } from "./differentiators-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StatsSection } from "./stats-section";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-trilho-bg">
      <SiteHeader />
      <HeroSection />
      <StatsSection />
      <DifferentiatorsSection />
      <HowItWorksSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
