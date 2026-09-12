import { PassportReveal } from "@/components/passport/passport-reveal";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Your passport — Orbit" };

export default function PassportPage() {
  return (
    <>
      <SiteHeader />
      <main className="orbit-stars relative flex-1 px-5 py-10 sm:py-14">
        <PassportReveal />
      </main>
    </>
  );
}
