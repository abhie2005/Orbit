import { JoinForm } from "@/components/onboarding/join-form";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Join a class — Orbit" };

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="orbit-stars relative flex flex-1 items-center justify-center px-5 py-16">
        <JoinForm />
      </main>
    </>
  );
}
