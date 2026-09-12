import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Build your passport — Orbit" };

export default function OnboardingPage() {
  return (
    <>
      <SiteHeader />
      <main className="orbit-stars relative flex flex-1 items-start justify-center px-5 py-10 sm:py-14">
        <OnboardingFlow />
      </main>
    </>
  );
}
